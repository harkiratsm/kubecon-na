# Speaker Script — Checkpoint-Backed Warm Pools for Agentic AI Workloads on Kubernetes
**KubeCon + CloudNativeCon Japan 2026 · 29 Jul · 5F/501 · 30 minutes**

---

> **How to use this file:**
> Each section maps exactly to one slide in the deck.
> - **Duration** — target time on that slide
> - **Opening line** — the first sentence you say when the slide appears
> - **Talking points** — write these out but don't read verbatim; know them well enough to speak naturally
> - **Transition** — the last sentence that bridges you to the next slide
> - Navigate slides with ← → arrow keys or the on-screen buttons

---

## Slide 1 — Title

**Duration:** ~45 seconds

**Opening line:**
"Good afternoon, everyone. I'm really glad to be here at KubeCon Japan to talk about something we've been building and using in production — a Kubernetes-native approach to running agentic AI workloads at scale."

**Talking points:**
- Session title: "Checkpoint-Backed Warm Pools for Agentic AI Workloads on Kubernetes"
- This is part of the OpenKruise Agents project — a CNCF sub-project under OpenKruise
- Today is a 30-minute session — I'll spend the first few minutes on the problem, then we'll dive into three concrete patterns: warm pools, checkpoints, and revision-gated upgrades
- By the end you should walk away with code you can actually apply, not just slides

**Transition:**
"Let me start by making sure we're on the same page about what we mean by an agentic workload, because not everyone uses that term the same way."

---

## Slide 2 — What is an Agentic Workload?

**Duration:** ~1 minute

**Opening line:**
"When I say 'agentic workload', I mean software that has an autonomous loop — it calls tools, observes results, and iterates."

**Talking points:**
- Four categories we designed OpenKruise Agents to serve:
  1. **Tool-use sandboxes** — an AI agent spinning up an environment to run code, browse the web, or modify files. Each tool call might need a fresh isolated environment.
  2. **Cloud dev workspaces** — persistent, network-accessible environments like Jupyter notebooks or VS Code servers in the cloud.
  3. **Reinforcement learning jobs** — training loops with human feedback or open-world exploration that need to checkpoint their state at each episode.
  4. **Big data training** — jobs that need extremely fast startup and can't afford to restart from scratch on every retry.
- The common thread across all four: sessions are **short-lived, stateful, and created at high frequency**
- This is structurally different from a typical web app — you might spin up thousands of these per hour

**Transition:**
"Once you understand that workload shape, three very specific infrastructure requirements emerge — and they're all hard to satisfy with vanilla Kubernetes."

---

## Slide 3 — Three Hard Requirements

**Duration:** ~1.5 minutes

**Opening line:**
"Let me be concrete about what makes this hard. There are exactly three things that production agentic infrastructure needs to get right."

**Talking points:**
- **01 — Fast startup:** Users of AI coding tools or research notebooks expect their environment to be ready in under a second. Every additional second of cold start is user-visible latency. At scale, this means scheduling, image pulling, and booting all need to be pre-done, not on the critical path.
- **02 — Reliable state:** This one is subtle. It's not just about not losing data — it's about retry semantics. If an agent is midway through an experiment and the node fails, you want to re-run *from the checkpoint*, not from the beginning. Idempotent restarts are expensive when they redo hours of computation.
- **03 — Safe evolution:** You can't deploy a new version of your sandbox runtime by just rolling your Deployment. Some of those Pods have active user sessions. You need to be able to say "upgrade idle sandboxes now, and active sessions when they're free."
- All three of these are connected — fixing one often makes the others worse with naive approaches

**Transition:**
"Let me show you exactly what happens when you try to solve these with standard Kubernetes primitives."

---

## Slide 4 — Why Naive Kubernetes Fails

**Duration:** ~2 minutes

**Opening line:**
"If you try to run agentic workloads on standard Kubernetes — Deployments, RollingUpdate, nothing fancy — you hit three concrete failure modes."

**Talking points:**
- **Cold start:** The full path from 'user clicks Run' to 'sandbox ready' is: schedule Pod → pull image → init container runtime → boot sandbox process → agent-runtime ready. That's 10 seconds on a fast cluster, minutes on a slow one. For interactive AI tools, that's a broken product.
- **Retry = state loss:** Kubernetes Pods are ephemeral by design. If your node dies, your Pod is gone. All that in-memory state — installed packages, partial computation results, open file handles — is gone. The agent has to restart completely.
- **Rolling update kills sessions:** If you do `kubectl set image deployment/my-sandbox new-image:v2`, Kubernetes will kill running Pods to roll them out. If a user had an active session on one of those Pods, they're evicted. There's no way to say "replace this Pod but only after the session ends."
- None of these are bugs — they're correct behavior for stateless web apps. But we're not running a web app.

**Transition:**
"So we built OpenKruise Agents to solve all three. Let me show you the system first at a high level, then we'll go deep on each pattern."

---

## Slide 5 — OpenKruise Agents — System Map

**Duration:** ~2 minutes

**Opening line:**
"OpenKruise Agents is a CNCF sub-project of OpenKruise. The system has five components — let me walk through each one quickly."

**Talking points:**
- **sandbox-controller:** This is your standard Kubernetes controller — runs reconcile loops, manages the CRD lifecycle for SandboxSet, SandboxClaim, SandboxTemplate, and Sandbox. Runs admission webhooks too. Think of it as the brain.
- **sandbox-manager:** A stateless API server. It speaks two protocols: E2B-compatible REST (more on that in a moment) and MCP. It's the thing that actually orchestrates sandbox creation, claims from the pool, and deletions.
- **sandbox-gateway:** An Envoy filter plus a Golang plugin. It's the data plane — routes incoming traffic (WebSocket, HTTP) to the right sandbox Pod. It scales independently from the manager.
- **agent-runtime:** This is a sidecar injected into every sandbox Pod. It gives you E2B-compatible command execution, file operations, code running, and crucially — dynamic CSI mount support for per-session storage.
- **Sandbox Pod:** The actual isolated environment. Just a Kubernetes Pod, managed by the Sandbox CRD lifecycle.
- Requires Kubernetes 1.28 or newer.
- This is vendor-neutral — it doesn't require any specific cloud provider.

**Transition:**
"Now let me show you something interesting about how you consume this system — there are two completely different API surfaces that both write to the same backend."

---

## Slide 6 — Dual API Surface

**Duration:** ~1.5 minutes

**Opening line:**
"One of the design decisions I'm proud of in this project is that we gave it two distinct API surfaces targeting two completely different audiences."

**Talking points:**
- **Kubernetes CRDs** — for platform teams and GitOps workflows. Six CRDs: `checkpoints`, `sandboxclaims`, `sandboxes`, `sandboxsets`, `sandboxtemplates`, `sandboxupdateops`. You use `kubectl`, Helm, ArgoCD, whatever your team uses for infrastructure. You get full RBAC. You get dry-run support. This is the infra team's API.
- **E2B SDK** — for application developers. E2B is an open-source sandbox SDK that originally targeted its own cloud. We built a backend that speaks the same E2B protocol. So an app developer writes `Sandbox.create(template="demo")` in Python or JavaScript — they don't need to know anything about Kubernetes. This is the AI engineer's API.
- **The critical point:** `snapshotId` returned by the E2B `createSnapshot()` call is exactly the `metadata.name` of the `Checkpoint` CR on the cluster. They are the same object. There's no impedance mismatch.
- MCP (Model Context Protocol) is also available for LLM tool-use integration.

**Transition:**
"Okay, let's get into the first big pattern — warm pools. This is what gives us sub-second sandbox delivery."

---

## Slide 7 — Why Warm Pools?

**Duration:** ~1.5 minutes

**Opening line:**
"The cold start problem has a simple conceptual solution: stop starting cold."

**Talking points:**
- A warm pool is just a collection of pre-created sandbox replicas that are sitting in `available` state, fully initialized, waiting to be claimed.
- When a request comes in, instead of scheduling a new Pod, you hand over a ready one. That's the entire idea.
- The cold start path on the left — six steps, 10 seconds minimum — is replaced by a three-step path on the right: request arrives, claim from ready pool, done. Sub-second.
- The pool auto-replenishes after every claim — the controller immediately starts creating a replacement sandbox in the background. The caller doesn't wait for this.
- Think of it like a connection pool in a database driver, but for full VMs.
- The warm pool absorbs burst traffic too — if 10 requests hit simultaneously, you hand out 10 sandboxes from the pool and then start creating 10 new ones as replacements.

**Transition:**
"The object that manages the warm pool is called a SandboxSet. Let me show you exactly what it looks like."

---

## Slide 8 — SandboxSet — The Pool Controller

**Duration:** ~2 minutes

**Opening line:**
"SandboxSet is to sandboxes what ReplicaSet is to Pods — it's the workload that maintains the pool."

**Talking points:**
- The YAML is minimal. You give it a `replicas` count and a `template` — that's the Pod spec for each warm sandbox.
- `persistentContents: [ip]` means the sandbox's IP address will be preserved if it hibernates and wakes. More on that when we talk about pause/resume.
- `replicas: 10` means "always keep 10 available sandboxes ready." This number does NOT include claimed sandboxes — it's purely the buffer.
- Key fields to know:
  - `status.availableReplicas` — how many are ready to claim right now. Watch this in your SRE dashboards.
  - `status.updateRevision` — a hash of the current desired template. Used for revision-gated upgrades, which I'll cover at the end.
  - `updateStrategy.maxUnavailable` — controls how many pool sandboxes can be unavailable during a rolling update.
- Short name is `sbs`. `kubectl get sbs` gives you the table view.
- I recommend sizing the pool to be slightly larger than your estimated request burst. If you see `AVAILABLE` dropping to zero regularly, increase `replicas`.

**Transition:**
"Let me visualize exactly what happens when a claim comes in — the four-stage replenishment loop."

---

## Slide 9 — Claim & Replenish Loop

**Duration:** ~1.5 minutes

**Opening line:**
"This four-stage diagram is the core operational loop of the warm pool — I want you to understand it intuitively."

**Talking points:**
- **Stage 1:** Pool is at rest. 3 available sandboxes. `replicas=3, availableReplicas=3`. Steady state.
- **Stage 2:** An agent claims a sandbox. Sandbox-1 leaves the pool and is handed to the agent. The controller immediately detects that `availableReplicas` is now below `replicas`, and triggers a scale-up. `replicas` drops to 2 because that's how many are in the pool now.
- **Stage 3:** A new sandbox (Sandbox-4) is being created. The pool shows `replicas=3, availableReplicas=2` — the system knows it's working on the third one.
- **Stage 4:** Sandbox-4 becomes `available`. We're back to steady state. The claimed Sandbox-1 is off running the agent's work somewhere else.
- The key insight: `replicas` in SandboxSet only counts the unclaimed inventory. When you claim, the number goes down. When a new one is ready, it goes back up. Claimed sandboxes are not counted.
- This means your `replicas` setting is your inventory buffer target, not your total capacity.

**Transition:**
"The mechanism by which you actually claim a sandbox is the SandboxClaim CRD. Let me show you that."

---

## Slide 10 — SandboxClaim — Declarative Claiming

**Duration:** ~2 minutes

**Opening line:**
"SandboxClaim is the request object. You create it, the controller fulfills it."

**Talking points:**
- The simplest SandboxClaim is four lines of YAML: API version, kind, name, and `templateName` — the name of the SandboxSet you want to claim from.
- The controller picks an available sandbox from that pool in the same namespace and marks it as claimed. If no available ones exist, it waits for replenishment.
- `kubectl get sbc` shows you the phase — when it hits `Completed`, your sandbox is ready. Use the label `agents.kruise.io/claim-name=<sbc-name>` to find the actual Sandbox object.
- **Batch claiming:** Set `replicas: 10` and the system will deliver 10 sandboxes. This is best-effort gradual delivery — sandboxes come in as they become available, not all at once. `claimTimeout` is the maximum time for the entire claim task (not per-sandbox). `ttlAfterCompleted` auto-deletes the SandboxClaim CR after the task is done — the claimed sandboxes themselves are NOT deleted.
- **Post-claim processing:** After a pool sandbox is claimed, the controller can apply per-session customizations before handing it to you:
  - In-place image upgrade (claimed a v1 sandbox, want v2) — note: this breaks sub-second delivery; image pull happens post-claim
  - CPU resize only (memory resize is not supported — will be silently ignored)
  - Dynamic PVC mount via CSI (`runtimes: [{name: csi}]` must be configured)
  - Labels and annotations injection

**Transition:**
"Now, when you're doing batch claiming at high throughput, you have to think carefully about reconcile storms. Here's how we handle that."

---

## Slide 11 — Avoiding Reconcile Storms

**Duration:** ~1.5 minutes

**Opening line:**
"Let me talk about something that bites you at scale: thundering herd on the claim path."

**Talking points:**
- If 100 agents try to claim sandboxes simultaneously, and there are only 10 in the pool, you get a burst of 90 scale-up requests hitting the controller at once. Without mitigation, this can flood your API server.
- **Best-effort gradual delivery** is the first mitigation. Batch claims don't block waiting for all N sandboxes — they deliver one-by-one as sandboxes become available. The caller streams them in via the label selector, not a single blocking call.
- **Pool-first path** means that the claim is fulfilled from an already-running available sandbox when the pool has stock — no new Pod scheduling needed.
- **SandboxSet's optimized scale-up** is specifically tuned for high-frequency scaling. The controller is not a standard ReplicaSet controller — it uses optimizations for this exact use case.
- **Template-direct opt-in:** If the pool is empty, the default is to wait for replenishment. If you want immediate creation without waiting, set `createOnNoStock: true` on the SandboxClaim. Downside: no sub-second delivery, and no in-place upgrade on claim — a brand new Pod is scheduled from scratch.

**Transition:**
"Warm pools solve startup. Now let's talk about the second big problem: what happens when things fail. That's where the Checkpoint API comes in."

---

## Slide 12 — Pause vs Checkpoint

**Duration:** ~1.5 minutes

**Opening line:**
"Before I show you the Checkpoint CRD, I need to clarify something that confuses people: the difference between Pause and Checkpoint. They use the same underlying machinery, but they're for completely different situations."

**Talking points:**
- **Pause/Resume** is like hibernating a laptop. You pause one specific sandbox, and when you resume it, it's the same sandbox — same ID, same state, everything. It's a 1:1 operation. Use it when a session goes idle and you want to stop paying for compute without losing state.
- **Checkpoint (Snapshot)** is like taking a VM snapshot and then cloning from it. The source sandbox keeps running (by default). The checkpoint can be used to create many new sandboxes, each with an identical copy of the state at the moment of the snapshot. 1:many.
- Key difference: sandbox ID. After a pause/resume, the sandbox ID is unchanged. After a checkpoint clone, the source is unchanged but each clone gets a brand-new sandbox ID.
- The E2B SDK calls these "snapshots" — `createSnapshot()`, `listSnapshots()`. In the Kubernetes CRD world, the object is called a `Checkpoint`. They're the same thing — `snapshotId == Checkpoint.metadata.name`.
- Use Pause when: you want to suspend a specific session and resume it later.
- Use Checkpoint when: you want to capture a moment of work and create many parallel sessions from it, or when you want a recoverable state for fault tolerance.

**Transition:**
"Now let me show you the actual CRD fields so you know exactly what you're working with."

---

## Slide 13 — Checkpoint CRD

**Duration:** ~1.5 minutes

**Opening line:**
"The Checkpoint CRD is small — five fields in spec, three in status. Let me go through the ones that actually matter in practice."

**Talking points:**
- `spec.podName` — the name of the Pod (sandbox) you want to capture. This is required.
- `spec.keepRunning: true` — this is the default, and it's important. With it set to true, the source sandbox continues running after the checkpoint is written. It's paused briefly during the actual capture, then resumes. Set it to `false` if you want to checkpoint-then-terminate the Pod.
- `spec.persistentContents: [memory, filesystem]` — what to actually capture. Both is the default. Memory means the RAM contents of the container. Filesystem means the container's writable layer — everything that changed from the base image. You can choose just one if you know you only need it.
- `spec.ttlAfterFinished: 30h` — this is auto-GC. After 30 hours from when the checkpoint succeeded, the Checkpoint CR and its backing storage are deleted. If you don't set this, the checkpoint lives forever until manually deleted. Always set this in production to avoid checkpoint sprawl.
- `spec.sandboxName` — optional; use when `podName` alone isn't enough to locate the source Sandbox.
- `status.phase` — `Pending → Creating → Succeeded → (Failed / Terminating)`. Only `Succeeded` checkpoints can be used to spawn new sandboxes. Always check for `Failed` in monitoring.
- `status.completionTime` — set when phase reaches `Succeeded` or `Failed`.
- Short name is `cp`. `kubectl get cp` gives you the status table.

**Transition:**
"Let me show you what creating a checkpoint actually looks like — both from the platform side and from application code."

---

## Slide 14 — Creating Checkpoints — Two Interfaces

**Duration:** ~2 minutes

**Opening line:**
"Just like claiming sandboxes, creating checkpoints has two paths: CRD for platform teams, E2B SDK for application code."

**Talking points:**
- **CRD path** (left column): You write the YAML manifest, `kubectl apply` it, and watch `kubectl get cp` until the STATUS shows `Succeeded`. From there you can use the checkpoint name as a template for new sandboxes. This is perfect for scheduled checkpoint policies or GitOps-managed backup schedules.
- **E2B Python SDK** (middle): `sbx.create_snapshot()` — one line. It returns a snapshot object whose `snapshot_id` is the Checkpoint name on the cluster. You can immediately use that ID to create new sandboxes.
- **E2B TypeScript SDK** (right): `await sbx.createSnapshot()` — same behavior, same ID.
- There's one caveat you must communicate to your users: **during the snapshot, the sandbox is briefly paused**. This means any active WebSocket connections, PTY sessions, or running command streams will be dropped. Clients need to be able to reconnect gracefully after the snapshot completes. This is usually fine for batch workloads but you need to handle it in interactive tools.
- The duration of the pause depends on the checkpoint driver, captured state size, and cluster performance — no guaranteed timing. Test with your specific driver before quoting a number to users.

**Transition:**
"Now, an important decision point for your architecture: when do you use a SandboxSet template vs a Checkpoint as your starting point?"

---

## Slide 15 — Template vs Checkpoint

**Duration:** ~1.5 minutes

**Opening line:**
"This is a question I get asked a lot, so let me give you a crisp mental model."

**Talking points:**
- **Use SandboxSet template when:** Every sandbox should start from an identical, clean, pre-provisioned base. You want reproducibility — the same definition always produces the same sandbox. This is for your warm pool: pre-pull images, pre-install base packages, define resource limits. Declarative, version-controlled in Git.
- **Use Checkpoint when:** You need to capture whatever actually ran. An agent installed specific packages, wrote intermediate data, or computed something expensive. You want to fork from that live state, not replay the computation. Checkpoints are immutable snapshots — they capture runtime reality, not intent.
- Both can be used as `templateName` in a SandboxClaim — the controller detects which one it is and routes to the appropriate path. Important: a Checkpoint as `templateName` goes through the **clone path**, not warm-pool claiming.
- You can combine them: start with a SandboxSet for your base warm pool, then checkpoint a sandbox mid-work to create a more specific starting point for a sub-task.
- Note on deletion: deleting a Checkpoint removes the Checkpoint CR **and its paired SandboxTemplate**, but does NOT affect sandboxes already cloned from it. Clones are independent once created.

**Transition:**
"Let me now show you the exact mechanics of creating a sandbox from a checkpoint — what we call the clone path."

---

## Slide 16 — Rehydration — Clone Path

**Duration:** ~1.5 minutes

**Opening line:**
"The clone path is how you go from a checkpoint to a running sandbox. It's intentionally identical to the warm pool path from the caller's perspective."

**Talking points:**
- From the SandboxClaim perspective, you just provide `templateName: checkpoint-session-01` where you'd normally put the SandboxSet name. The controller checks: does a Checkpoint with this name exist? Yes — take the clone path. No — take the warm pool path. Same YAML, different behavior.
- From the E2B SDK: `Sandbox.create(template=snapshot.snapshot_id)`. One line. You pass the snapshot ID you got from `createSnapshot()` and the system handles everything.
- The clone is a full fork: new sandbox ID, new Pod, new IP — but identical memory and filesystem state to the checkpoint moment.
- You can clone the same checkpoint unlimited times. All clones are independent after creation. Deleting the original checkpoint doesn't affect running clones.
- This is the key pattern for **fault-tolerant agents**: take a checkpoint before risky operations. If something goes wrong, clone from the checkpoint instead of restarting from scratch.

**Transition:**
"When the clone path is triggered, there are four things the sandbox-manager does internally. These are the rehydration steps."

---

## Slide 17 — Rehydration — 4-Step Flow

**Duration:** ~2 minutes

**Opening line:**
"If you're building on top of this system or debugging it, you need to understand the four phases of the rehydration sequence."

**Talking points:**
- **Step 01 — Clone from checkpoint:** The sandbox-manager calls the backing checkpoint driver to restore the captured memory and filesystem. A new Sandbox CR and Pod are created. The Pod starts with the restored state.
- **Step 02 — Wait for readiness:** The controller polls until the Sandbox phase is `Running` and standard Kubernetes readiness checks pass. The agent-runtime sidecar initializes on port 49983 — this is how the sandbox-manager communicates with it for command execution and file operations.
- **Step 03 — Re-initialize runtime:** Optional post-clone re-injection of environment variables. The extent and fidelity of memory preservation depends on the checkpoint driver configured in your cluster — full memory semantics are platform-dependent.
- **Step 04 — Dynamic mounts:** If you've configured `runtimes: [{name: csi}]` in your SandboxSet, the CSI driver can attach per-session Persistent Volumes at this point. This is how you give each session its own user workspace storage that survives across sessions.
- Firewall note: port 49983 must be open on all Sandbox Pods. If you use network policies, security groups, or iptables rules in your cluster, you need to explicitly allow this port. I've seen people spend hours debugging agent-runtime failures that turn out to be this.

**Transition:**
"Let me make this concrete with a real failure and recovery scenario."

---

## Slide 18 — Failure & Recovery — Concrete Scenario

**Duration:** ~2 minutes

**Opening line:**
"Let me walk you through a concrete timeline that shows why this matters."

**Talking points:**
- T+0: Agent session starts. Claimed from warm pool in sub-second. Agent installs packages, writes 50 megabytes of intermediate analysis data.
- T+5 minutes: Agent calls `create_snapshot()`. Checkpoint captures both memory and filesystem. `ttlAfterFinished: 24h` means it'll be cleaned up automatically tomorrow. The agent keeps running — `keepRunning: true`.
- T+12 minutes: Node failure. Kubernetes marks the node as NotReady. The Pod is evicted. Without the checkpoint: everything is lost — all installed packages, all intermediate data. The agent would have to restart from minute zero.
- T+12.5 minutes: SandboxClaim with `templateName: checkpoint-session-01` fires. sandbox-manager clones from the snapshot. New Pod, same state.
- T+13 minutes: The restored sandbox has all installed packages and intermediate data intact. The agent continues from exactly where the checkpoint was taken. No duplicated side effects because we're resuming, not replaying.
- The business impact: a 12-minute computation is not lost. Instead of a full restart (12+ minutes), you have a very short recovery window — the clone path is fast, though exact timing depends on your checkpoint driver and cluster performance.
- This is why you want to checkpoint at meaningful milestones in your agent's work — not just once at the end, but at each significant intermediate result.

**Transition:**
"Alright, we've covered startup and reliability. The third piece is safe runtime evolution — how do you upgrade your sandbox images without breaking users?"

---

## Slide 19 — Two Upgrade Surfaces

**Duration:** ~2 minutes

**Opening line:**
"Runtime upgrades are where many teams get stuck. There are two distinct things you might want to upgrade, and they need completely different strategies."

**Talking points:**
- **Surface 1 — Idle pool sandboxes:** You want to upgrade the image in your warm pool. Change `spec.template.spec.containers[0].image` in your SandboxSet YAML and `kubectl apply` it. The controller detects the template change, computes a new `updateRevision` hash, and rolls out the update by **replacing** old-revision idle sandboxes in batches, respecting `maxUnavailable`. The replaced sandboxes get new Pods and new IPs — but active (claimed) sessions are completely untouched.
- **Surface 2 — Active claimed sandboxes:** The `SandboxUpdateOps` resource targets running sessions by label selector, applies a strategic merge patch, and controls rollout with `maxUnavailable`. The upgrade mechanism is **Recreate** — Pod is deleted and recreated. Brief outage per sandbox. Memory and IP are lost. Important constraint: **only one active SandboxUpdateOps per namespace at a time**. Requires `agent-runtime` + CSI runtimes for lifecycle hooks. Available since v0.3.0.
- For active session upgrades, use PreUpgrade and PostUpgrade lifecycle hooks with CSI storage to back up and restore filesystem state across the Pod recreation — this is how you preserve user work.

**Transition:**
"To know exactly how the upgrade is progressing and to gate operations on completion, you need revision tracking."

---

## Slide 20 — Revision Gating & Completion Tracking

**Duration:** ~1.5 minutes

**Opening line:**
"Revision gating is the practice of not making new things available until you know they're on the right version. Here's how to do it."

**Talking points:**
- `kubectl get sbs my-pool -o wide` gives you the table. The field to watch is `UPDATEDAVAILABLEREPLICAS`. When that equals your desired `replicas`, every sandbox in the pool is on the new revision and ready to claim.
- `UPDATEREVISION` is a hash of the current desired template. Any sandbox whose individual `status.updateRevision` doesn't match is on the old version. You can inspect this per-sandbox with `kubectl get sandbox -o custom-columns`.
- In your CI/CD pipeline: after applying a new SandboxSet template, poll until `UPDATEDAVAILABLEREPLICAS == replicas` before routing production traffic to the updated pool.
- **Lifecycle hooks for active session upgrades:** The three-phase flow is `PreUpgrade → UpgradePod → PostUpgrade`. In PreUpgrade, run a script that backs up the workspace to a CSI-mounted external volume (`tar czf /mnt/backup.tar.gz`). After the new Pod is running, PostUpgrade restores it. The sandbox's filesystem data survives even though memory and IP are lost.
- This lets you safely upgrade active sessions — filesystem state is preserved via backup/restore, even though the Pod itself is recreated.

**Transition:**
"Let me now zoom out and give you the four reusable patterns from this session — these work beyond OpenKruise too."

---

## Slide 21 — Four Reusable Control-Loop Patterns

**Duration:** ~2 minutes

**Opening line:**
"These are the four patterns I want you to take away. They're not specific to OpenKruise — they're general Kubernetes-native patterns for stateful, short-lived workloads."

**Talking points:**
- **Pattern 01 — Warm Pool Manager:** Keep a buffer of pre-initialized replicas above your burst level. Track `availableReplicas` as your primary SLI. The pool controller should handle burst by temporarily dipping into the buffer and auto-replenishing. Scale the pool down during off-hours to save cost.
- **Pattern 02 — High-Throughput Claim Controller:** Never use all-or-nothing batch semantics. Deliver items gradually as they become available. Use timeouts to bound worst-case wait. Pool-first for the common case; `createOnNoStock: true` for direct-create when you can't wait. These two design choices together prevent reconcile storms.
- **Pattern 03 — Checkpoint Lifecycle:** Checkpoint at task milestones, not just at the end. Set TTL on all checkpoints — no TTL means unbounded storage growth. Use the same checkpoint ID in both your platform API and your SDK API. Clones are independent — no need to keep the original checkpoint alive once you've forked.
- **Pattern 04 — Revision Gating:** Always hash your desired state and track it per-replica. Use that hash to know which replicas are on which version. Gate new-version claims behind `UPDATEDAVAILABLEREPLICAS` checks. Combine checkpoint + lifecycle hooks to upgrade active sessions without data loss.
- These four patterns together give you: fast startup, durable state, zero-surprise upgrades.

**Transition:**
"Let me leave you with the key takeaways and where to find this stuff."

---

## Slide 22 — Takeaways + Links

**Duration:** ~1.5 minutes

**Opening line:**
"Three things to remember when you leave this room."

**Talking points:**
- **Cut cold starts with warm pools:** SandboxSet pre-creates replicas. Claims return in sub-second when the pool is healthy. The pool auto-replenishes after every claim with no manual intervention. This is the single highest-leverage improvement you can make for interactive agentic workloads.
- **Preserve agent work with checkpoints:** The Checkpoint CRD captures memory + filesystem at any point in a session's life. One checkpoint can be cloned into unlimited independent sandboxes. Node failures and preemptions become fast recoveries instead of full restarts (speed depends on driver/cluster). Set TTL to avoid checkpoint sprawl.
- **Evolve runtime without chaos:** Pool rolling updates only touch idle sandboxes — never active sessions. SandboxUpdateOps upgrades running sessions with controlled batches and lifecycle hooks. updateRevision hash tells you exactly who is on what version.
- Where to find OpenKruise Agents:
  - GitHub: `github.com/openkruise/agents` — star it if you found this useful
  - Docs: `openkruise.io/kruiseagents`
  - Kubernetes Slack: `#openkruise` channel
  - CNCF project page under OpenKruise

**Closing line:**
"We have a few minutes for questions — I'm happy to go deeper on any of the patterns or the implementation details. Thank you!"

---

## Timing Reference

| Slides | Section | Target Time |
|--------|---------|-------------|
| 1 | Opening | 0:45 |
| 2–4 | Problem space | 4:30 |
| 5–6 | Architecture | 3:30 |
| 7–9 | Warm pools | 5:00 |
| 10–11 | SandboxClaim | 3:30 |
| 12–15 | Checkpoints | 6:00 |
| 16–18 | Rehydration | 5:30 |
| 19–20 | Upgrades | 3:30 |
| 21–22 | Takeaways | 3:30 |
| **Total** | | **~36 min raw** |

> Keep each slide tight. The timing above allows ~5 min buffer for natural pauses, audience reaction, and Q&A within the 30-minute slot. If you're running long, slides 11 and 15 can be abbreviated — they're supporting context, not the core patterns.

---

## Quick-reference cheat sheet (memorize these)

| Concept | One sentence |
|---------|-------------|
| SandboxSet | ReplicaSet for sandboxes; keeps a warm pool of ready replicas |
| SandboxClaim | Declarative request to claim a sandbox from the pool |
| Checkpoint | CRD that captures live sandbox state (memory + filesystem) for forking |
| Clone path | SandboxClaim with a Checkpoint name as templateName |
| updateRevision | Hash on SandboxSet that tracks which sandboxes are on which template version |
| SandboxUpdateOps | Batch upgrade resource for active claimed sandboxes with lifecycle hooks |
| agent-runtime | Sidecar in every sandbox Pod; port 49983; required for advanced features |
| E2B SDK | Open-source sandbox SDK; snapshotId == Checkpoint.metadata.name |
