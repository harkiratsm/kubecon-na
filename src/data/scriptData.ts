export interface DeepDiveSection {
  heading: string;
  body: string;
}

export interface SlideScript {
  id: number;
  duration: string;
  openingLine: string;
  talkingPoints: string[];
  transition: string;
  deepDive: DeepDiveSection[];
}

export const SCRIPT_DATA: SlideScript[] = [
  // ─────────────────────────────────────────────
  // SLIDE 1 — Title
  // ─────────────────────────────────────────────
  {
    id: 1,
    duration: "~45 seconds",
    openingLine:
      "Good afternoon, everyone. I'm really glad to be here at KubeCon Japan to talk about a Kubernetes-native approach to running agentic AI workloads at scale.",
    talkingPoints: [
      "OpenKruise Agents — a CNCF sub-project under OpenKruise",
      "30-minute session: problem → warm pools → checkpoints → revision-gated upgrades",
      "Walk away with patterns you can apply this week, not just slides",
    ],
    transition: "Let me start by making sure we're aligned on what an agentic workload actually is.",
    deepDive: [
      {
        heading: "What is KubeCon?",
        body: "KubeCon + CloudNativeCon is the biggest conference in the cloud-native world, run by the Cloud Native Computing Foundation (CNCF). It draws thousands of engineers who work on or with Kubernetes — the software that runs most of the world's container workloads. You are presenting at the Tokyo edition, July 2026.",
      },
      {
        heading: "What is Kubernetes?",
        body: "Kubernetes (K8s) is an open-source system for automating deployment, scaling, and management of containerised applications. Think of it as the operating system for your data centre. You tell it 'I want 10 copies of this web server' and it figures out which physical machines to run them on, restarts them if they crash, and spreads load across them. Every application inside Kubernetes runs in a 'Pod' — a tiny wrapper around one or more containers.",
      },
      {
        heading: "What is CNCF and OpenKruise?",
        body: "CNCF (Cloud Native Computing Foundation) is the organisation that stewards Kubernetes and dozens of other open-source projects (Prometheus, Helm, Envoy, etc.). OpenKruise is a CNCF project that extends Kubernetes with more advanced workload management — things like rolling updates with fine-grained control, sidecar injection, and now, agentic sandbox management. OpenKruise Agents is a sub-project specifically for AI agent workloads.",
      },
      {
        heading: "What is this talk about?",
        body: "The talk introduces three Kubernetes-native patterns for running AI agent sessions: (1) pre-warming sandboxes so they start instantly, (2) checkpointing their state so failures don't lose work, and (3) upgrading the runtime safely without disrupting active sessions. These are production-proven patterns from real AI companies.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 2 — What is an Agentic Workload?
  // ─────────────────────────────────────────────
  {
    id: 2,
    duration: "~1 minute",
    openingLine:
      "When I say 'agentic workload', I mean software with an autonomous loop — it calls tools, observes results, and iterates.",
    talkingPoints: [
      "Tool-use sandboxes: AI agent runs code, browses web, modifies files — each tool call needs isolation",
      "Cloud dev workspaces: persistent, network-accessible environments like Jupyter or VS Code in the cloud",
      "RL training jobs: loops with human feedback or open-world exploration that checkpoint each episode",
      "Big data training: extreme startup speed requirements, can't restart from zero on every retry",
      "Common thread: sessions are short-lived, stateful, and created at very high frequency",
    ],
    transition: "Once you understand that workload shape, three very specific requirements emerge — all hard with vanilla Kubernetes.",
    deepDive: [
      {
        heading: "What is an 'agentic' AI workload?",
        body: "A traditional AI model takes input and returns output — one shot. An 'agent' is different: it has a loop. It looks at a goal, decides what tool to call (run some Python code, search the web, read a file), gets the result, and then decides the next step. It keeps looping until it finishes. GPT-4 with function calling, Claude with tool use, GitHub Copilot running your test suite — these are all agents.",
      },
      {
        heading: "Why does each agent need its own sandbox?",
        body: "Each agent session might install Python packages, write files, run arbitrary code, even start sub-processes. If two agents share the same environment, they'll interfere with each other. A 'sandbox' is a completely isolated execution environment — think of it like a fresh virtual machine that exists just for this one agent session. When the session ends, it can be thrown away.",
      },
      {
        heading: "What are the four workload types in the slides?",
        body: "1) Tool-use sandboxes — an AI assistant running code on your behalf needs an isolated Python environment. 2) Cloud dev workspaces — persistent remote development environments, like Gitpod or GitHub Codespaces. 3) RL training — reinforcement learning where an agent repeatedly tries things in a simulated world; each episode is a session. 4) Big data training — jobs that need to start up extremely fast and can't afford to redo expensive computation if a machine fails.",
      },
      {
        heading: "Why is this different from a normal web app?",
        body: "A web server handles thousands of short, stateless requests — it doesn't care which server handles each one. Agent sessions are different: they have state (what has been done so far), they run for minutes, they need their own isolated environment, and many of them start at the same time (burst traffic). That combination breaks most assumptions baked into standard Kubernetes deployment patterns.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 3 — Three Hard Requirements
  // ─────────────────────────────────────────────
  {
    id: 3,
    duration: "~1.5 minutes",
    openingLine:
      "Let me be concrete about what makes this hard. There are exactly three things production agentic infrastructure must get right.",
    talkingPoints: [
      "01 Fast Startup: users expect under a second. Scheduling, image pull, boot — all must be off the critical path.",
      "02 Reliable State: retry semantics matter. Re-run from checkpoint, not from the beginning.",
      "03 Safe Evolution: you can't rolling-update a Deployment when some Pods have active user sessions.",
      "All three are connected — fixing one naively often breaks the others.",
    ],
    transition: "Let me show you exactly what happens when you try standard Kubernetes primitives.",
    deepDive: [
      {
        heading: "Requirement 1: Fast Startup — what does 'sub-second' mean?",
        body: "When a user hits 'Run' in an AI coding tool, they expect their sandbox to appear instantly — like opening a new browser tab. If it takes 10 seconds, they'll stare at a spinner and get frustrated. At scale, if you're spinning up 1,000 agent sessions per minute, even a 5-second startup means thousands of users waiting. The goal is to have the sandbox ready before the user even notices they asked for it.",
      },
      {
        heading: "Requirement 2: Reliable State — what is 'state' and why does it matter?",
        body: "State means 'what has happened so far'. If an agent has been running for 10 minutes and has installed packages, written files, and computed intermediate results — that's its state. If the machine it's running on fails (hardware failure, cloud preemption, out of memory kill), all that state is gone. Without checkpointing, the agent has to start over from zero. That's expensive and annoying. The requirement is: when things fail, you resume from where you left off, not from scratch.",
      },
      {
        heading: "Requirement 3: Safe Evolution — what does 'runtime evolution' mean?",
        body: "Your sandbox image might have a bug, or you want to upgrade from Python 3.11 to 3.12, or you need to patch a security vulnerability. In a normal web app, you'd do a rolling update — kill old servers, start new ones. But if a user has an active session on that server, they get kicked out mid-task. For agent sessions, you need the ability to say: 'upgrade idle sandboxes now, and upgrade active ones only when they're done, with a safe state backup'.",
      },
      {
        heading: "Why are these three connected?",
        body: "If you solve fast startup by pre-warming sandboxes but then do a naive rolling update, you'll kill the warm pool. If you solve state with checkpoints but your checkpoint process takes 10 seconds, your 'fast startup' promise breaks. If you solve safe evolution by never updating running sessions, your fleet gets out of date. You need all three in a coordinated system.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 4 — Why Naive K8s Fails
  // ─────────────────────────────────────────────
  {
    id: 4,
    duration: "~2 minutes",
    openingLine:
      "If you run agentic workloads on standard Kubernetes — Deployments, RollingUpdate — you hit three concrete failure modes.",
    talkingPoints: [
      "Cold start: schedule Pod → pull image → init container runtime → boot sandbox. 10 seconds minimum, often minutes.",
      "Retry = state loss: Pods are ephemeral by design. Node dies → Pod gone → in-memory state gone.",
      "Rolling update kills sessions: kubectl set image kills running Pods mid-session.",
      "These are NOT bugs — correct behavior for stateless web apps. But we're not building a web app.",
    ],
    transition: "So we built OpenKruise Agents to solve all three. Let me show you the system at a high level first.",
    deepDive: [
      {
        heading: "What is a Kubernetes Deployment and why does it fail here?",
        body: "A Deployment is Kubernetes' most common way to run apps. You say 'run 3 replicas of nginx' and it creates 3 Pods (containers). If one dies, it creates a replacement. If you want to update the image, it does a rolling update: kill one old Pod, start one new Pod, repeat. This is perfect for stateless web apps — but for agent sessions, 'kill the Pod' means 'destroy the user's work in progress'.",
      },
      {
        heading: "What is a 'cold start' and why is it slow?",
        body: "When Kubernetes needs a new Pod, it goes through several steps: 1) The scheduler picks a machine to run it on (100ms-500ms). 2) The machine downloads the container image from a registry — if it's not cached, this can take 30 seconds for a large image. 3) The container runtime initialises the container (seconds). 4) The sandbox software inside boots up (seconds to minutes). All of this must happen AFTER the user's request arrives. For a web server, this is fine because you keep it running. For per-request agent sessions, every request pays this cost.",
      },
      {
        heading: "What does 'ephemeral' mean and why are Pods like that?",
        body: "Ephemeral means 'temporary, not designed to last'. Kubernetes Pods are designed to be thrown away and recreated. A cloud machine can be preempted (the cloud provider takes it back), run out of memory (killing processes), or fail its hardware. When that happens, Kubernetes creates a new Pod somewhere else. For a stateless web server, this is fine — the new Pod knows nothing and doesn't need to. For an agent that's been running for 20 minutes, losing the Pod means losing all that work.",
      },
      {
        heading: "What is a rolling update and why does it kill sessions?",
        body: "When you change the container image in a Deployment, Kubernetes does a rolling update: it starts new Pods with the new image, waits for them to be ready, then terminates old Pods. 'Terminates' means it sends a SIGTERM signal and waits a few seconds, then kills the process. If a user's agent session is running on that Pod, their session ends abruptly. There's no concept of 'wait until this session is done before killing'. Standard Kubernetes doesn't know or care about sessions.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 5 — OpenKruise Agents System Map
  // ─────────────────────────────────────────────
  {
    id: 5,
    duration: "~2 minutes",
    openingLine:
      "OpenKruise Agents is a CNCF sub-project of OpenKruise. Five components form the complete system.",
    talkingPoints: [
      "sandbox-controller: reconcile loops for all CRDs. Runs admission webhooks.",
      "sandbox-manager: stateless API server. E2B-compatible REST + MCP. Schedules, creates, recycles sandboxes.",
      "sandbox-gateway: Envoy + Golang filter. Routes traffic to the right sandbox Pod. Scales independently.",
      "agent-runtime: sidecar injected into each sandbox Pod. E2B command/file ops, dynamic CSI mounts. Port 49983.",
      "Sandbox Pod: the actual isolated environment. Managed via the Sandbox CRD lifecycle.",
      "Requires Kubernetes ≥ 1.28. Vendor-neutral.",
    ],
    transition: "Now something interesting: two completely different API surfaces write to the same backend.",
    deepDive: [
      {
        heading: "What is a Kubernetes controller?",
        body: "A controller is a process that watches the state of your Kubernetes cluster and tries to make reality match your desired state. Example: you say 'I want 3 replicas', the controller sees only 2 running, so it creates 1 more. OpenKruise Agents' sandbox-controller does the same thing but for sandbox-specific resources: it watches SandboxSet, SandboxClaim, etc. and takes action to fulfil them.",
      },
      {
        heading: "What is a CRD (Custom Resource Definition)?",
        body: "Kubernetes comes with built-in resource types: Pod, Deployment, Service, etc. A CRD lets you define your own resource types. OpenKruise Agents defines types like SandboxSet, SandboxClaim, Checkpoint — you can create, read, update, and delete these using the same kubectl tool and APIs as built-in types. It's the standard way to extend Kubernetes with domain-specific concepts.",
      },
      {
        heading: "What is sandbox-manager and what is E2B?",
        body: "E2B (e2b.dev) is an open-source sandbox SDK that provides Python and JavaScript libraries for creating and managing code execution environments. It became popular for AI coding tools. sandbox-manager speaks the E2B API protocol — so any existing code that uses E2B can connect to your Kubernetes cluster instead of e2b.dev's cloud. It's a drop-in backend replacement.",
      },
      {
        heading: "What is Envoy and why is there a gateway?",
        body: "Envoy is a high-performance network proxy widely used in cloud-native systems (it's the proxy behind Istio, AWS App Mesh, etc.). The sandbox-gateway is built on Envoy to route incoming network connections (WebSocket for terminals, HTTP for file ops) to the correct sandbox Pod. Because it's separate from sandbox-manager, it can be scaled independently — you can have many more gateways than managers if traffic is the bottleneck.",
      },
      {
        heading: "What is a sidecar container?",
        body: "In Kubernetes, a Pod can run multiple containers side-by-side. A 'sidecar' is a helper container that runs alongside the main application container and provides extra features. agent-runtime is a sidecar injected into every sandbox Pod — it adds E2B-compatible APIs (run code, read/write files) and the ability to dynamically attach storage volumes. It listens on port 49983 and is how sandbox-manager talks to the sandbox's innards.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 6 — Dual API Surface
  // ─────────────────────────────────────────────
  {
    id: 6,
    duration: "~1.5 minutes",
    openingLine:
      "One of the design decisions I'm proud of: two distinct API surfaces targeting two different audiences.",
    talkingPoints: [
      "Kubernetes CRDs: for platform teams and GitOps. Six CRDs. Full RBAC — infra team's API.",
      "E2B SDK: for app developers. Python/JS. Sandbox.create(template='demo') — no K8s knowledge needed.",
      "Critical: snapshotId from E2B createSnapshot() == Checkpoint.metadata.name on the cluster. Same object.",
      "MCP (Model Context Protocol) also available for LLM tool-use integration.",
    ],
    transition: "Let's get into the first pattern — warm pools. This is what gives sub-second delivery.",
    deepDive: [
      {
        heading: "Why have two API surfaces?",
        body: "Platform engineers and AI application developers have completely different mental models. A platform engineer thinks in terms of YAML, namespaces, RBAC, label selectors. An AI engineer thinks in terms of 'give me a sandbox, run this code, read this file'. Forcing AI engineers to learn Kubernetes YAML to create a sandbox is a bad developer experience. Forcing platform engineers to use a Python SDK to manage cluster resources is also wrong. So OpenKruise Agents provides both.",
      },
      {
        heading: "What is RBAC?",
        body: "RBAC stands for Role-Based Access Control. In Kubernetes, it controls who can create, read, update, or delete which resources. For example, you can say 'the data-science team can create SandboxClaims but not SandboxSets'. This is how enterprises control access to cluster resources. Because OpenKruise Agents uses CRDs, all the standard RBAC machinery works with sandboxes automatically.",
      },
      {
        heading: "What is GitOps and why does it matter?",
        body: "GitOps is the practice of keeping all your infrastructure configuration in a Git repository, and having a tool (like ArgoCD or Flux) automatically apply those configs to your cluster when you commit. Since OpenKruise Agents' resources are just Kubernetes CRDs, you can manage a SandboxSet in Git just like a Deployment — commit a change, ArgoCD picks it up, applies it to the cluster. This makes infra changes auditable and reversible.",
      },
      {
        heading: "What is MCP (Model Context Protocol)?",
        body: "MCP is a protocol developed by Anthropic (makers of Claude) that standardises how AI language models call tools. It's becoming the standard way for LLMs to interact with external systems. OpenKruise Agents exposes an MCP endpoint, so you can give an LLM direct access to create sandboxes, run code, and read files — without writing any glue code. It's the AI-native API layer.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 7 — Why Warm Pools?
  // ─────────────────────────────────────────────
  {
    id: 7,
    duration: "~1.5 minutes",
    openingLine: "The cold start problem has a simple conceptual solution: stop starting cold.",
    talkingPoints: [
      "A warm pool is pre-created sandboxes in 'available' state, fully initialized, waiting to be claimed.",
      "Cold path: 6 steps, 10 seconds minimum. Warm path: 3 steps — request, claim, done. Sub-second.",
      "Pool auto-replenishes after every claim — new sandbox created in background, caller doesn't wait.",
      "Like a connection pool in a database driver, but for full VMs.",
      "Burst: 10 simultaneous requests → hand out 10 from pool → start 10 replacements in background.",
    ],
    transition: "The object that manages the pool is called SandboxSet. Let me show you exactly what it looks like.",
    deepDive: [
      {
        heading: "What is a 'warm pool' as a concept?",
        body: "A warm pool is a set of things pre-created and sitting idle, ready to be handed out the moment someone asks. The most famous example is a database connection pool: instead of opening a new database connection every time a web request needs to query the DB (slow — involves TCP handshake, authentication, etc.), you keep a pool of already-open connections. When a request arrives, you hand over one of those connections instantly. When the request is done, you return the connection to the pool. OpenKruise Agents does this but with full sandboxes (Kubernetes Pods) instead of database connections.",
      },
      {
        heading: "What does 'available' state mean for a sandbox?",
        body: "A sandbox in 'available' state means: the Pod is running, the container is fully booted, the agent-runtime sidecar is ready on port 49983, and the sandbox is not assigned to any user yet. It's fully initialised and waiting. The moment a claim arrives, this sandbox is handed over to the user in milliseconds — no scheduling, no image pulling, no booting.",
      },
      {
        heading: "What happens in a cold start? Why does each step take so long?",
        body: "Step 1 (schedule): Kubernetes must find a machine with enough CPU/memory — can be 100ms-500ms. Step 2 (image pull): the container image (Python environment, your sandbox software, etc.) must be downloaded from a container registry. A large image can be 2-5 GB; even on a fast network this takes 30-60 seconds if not already cached on that machine. Step 3 (container runtime init): runc/containerd initialises the container namespaces and cgroups — another second or two. Step 4 (sandbox boot): your sandbox software needs to start its processes. If it's a full development environment, that could be 5-10 seconds. Step 5-6: agent-runtime init and final readiness check.",
      },
      {
        heading: "How does auto-replenishment work?",
        body: "The moment a sandbox is claimed, the SandboxSet controller immediately notices that it has one fewer available sandbox than its target (replicas field). So it immediately starts creating a replacement. This replacement goes through the full cold-start process — but in the background, while the user is happily using their just-claimed sandbox. By the time the next claim request arrives, there's a fresh sandbox ready. The replenishment runs in parallel with work, not on the critical path.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 8 — SandboxSet
  // ─────────────────────────────────────────────
  {
    id: 8,
    duration: "~2 minutes",
    openingLine: "SandboxSet is to sandboxes what ReplicaSet is to Pods — it maintains the warm pool.",
    talkingPoints: [
      "replicas: target buffer of available sandboxes (does NOT include claimed sandboxes).",
      "persistentContents: [ip] — sandbox IP preserved during hibernate/wake. memory/filesystem are Checkpoint fields.",
      "status.availableReplicas: how many are ready right now. Watch this in your SRE dashboards.",
      "status.updateRevision: hash of current desired template. Used for revision-gated upgrades.",
      "Short name 'sbs'. kubectl get sbs gives you the table view.",
    ],
    transition: "Let me visualise the four-stage replenishment loop.",
    deepDive: [
      {
        heading: "What is a ReplicaSet in Kubernetes?",
        body: "A ReplicaSet is a Kubernetes resource that says 'always keep N Pods running'. If one dies, create a replacement. If there are too many, delete some. SandboxSet works the same way but with extra intelligence: it tracks the pool inventory separately from claimed sandboxes, it optimises scaling for burst scenarios, and it manages the lifecycle of warm sandboxes differently from active ones.",
      },
      {
        heading: "What is 'replicas' and why does it exclude claimed sandboxes?",
        body: "'replicas' in SandboxSet means 'how many warm, available sandboxes I want to maintain'. If you set replicas=10, there will always be 10 sandboxes ready and waiting. When a claim takes one away, the count drops to 9 and the controller creates a new one to get back to 10. The claimed sandbox is now 'owned' by the user — it's not counted in the pool anymore. This is important: setting replicas=10 doesn't mean 'total 10 sandboxes'. It means '10 in the buffer waiting to be claimed'.",
      },
      {
        heading: "What is 'persistentContents: ip' and what is a sandbox IP?",
        body: "Every Pod in Kubernetes gets an IP address — a number like 10.0.1.42 that other services use to talk to it. When a sandbox is hibernated (paused to save resources), its Pod might be stopped. When it wakes up, normally it would get a new IP address. If your system has hardcoded routes or cached that IP address, things break. 'persistentContents: [ip]' tells the system to preserve the same IP address when hibernating and resuming. This is specifically for the Pause/Resume feature — not for Checkpoints.",
      },
      {
        heading: "What is 'updateRevision' and why is it a hash?",
        body: "When you change the SandboxSet's template (e.g., change the container image), the system computes a short hash (like 'a1b2c3d4') that uniquely represents that version of the template. Every sandbox in the pool gets tagged with the revision it was created from. This lets you answer the question 'which of my sandboxes are on the new image and which are still on the old one?' — critical for the upgrade patterns covered later.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 9 — Claim & Replenish
  // ─────────────────────────────────────────────
  {
    id: 9,
    duration: "~1.5 minutes",
    openingLine: "This four-stage diagram is the core operational loop — understand it intuitively.",
    talkingPoints: [
      "Stage 1: Pool at rest. 3 available sandboxes. replicas=3, availableReplicas=3.",
      "Stage 2: Agent claims. Sandbox-1 leaves pool. Controller detects shortage, triggers scale-up.",
      "Stage 3: Sandbox-4 being created. replicas=3, availableReplicas=2 (third one still creating).",
      "Stage 4: Sandbox-4 ready. Back to steady state with 3 available.",
      "Key: replicas counts only unclaimed inventory — it is your buffer target, not total capacity.",
    ],
    transition: "The mechanism for claiming is the SandboxClaim CRD.",
    deepDive: [
      {
        heading: "Why does 'replicas' go down when a claim happens?",
        body: "This confuses people at first. When Sandbox-1 is claimed, it leaves the pool and becomes the user's sandbox. The pool now has 2 sandboxes. SandboxSet's 'replicas' field says 'I want 3 in the pool'. Since there are only 2, it creates a third. The replicas field always refers to how many POOL (unclaimed) sandboxes exist — not claimed ones. Think of it like a water tank: you set the fill level to 3 litres. Someone takes 1 litre out. The tank automatically refills to 3. The litre that was taken out is not counted in the 3.",
      },
      {
        heading: "What triggers the scale-up? Is it automatic?",
        body: "Yes, completely automatic. The sandbox-controller is watching the SandboxSet object. When a sandbox is claimed, the controller detects that availableReplicas < replicas and immediately starts creating a new sandbox. This uses the same standard Kubernetes reconcile loop pattern — a continuous background process that makes sure reality matches the desired state.",
      },
      {
        heading: "How long does Stage 3 (creating) take?",
        body: "Stage 3 is the full cold-start time — potentially 10 seconds to a few minutes depending on image size and cluster speed. But this is fine! The user who claimed Sandbox-1 is already up and running. Stage 3 happens in the background. The pool only temporarily drops to 2 available sandboxes. If another claim comes in during Stage 3, Sandbox-2 is handed out and Sandbox-4 is still being created. The pool is resilient to burst — it just temporarily dips.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 10 — SandboxClaim
  // ─────────────────────────────────────────────
  {
    id: 10,
    duration: "~2 minutes",
    openingLine: "SandboxClaim is the request object. You create it, the controller fulfils it.",
    talkingPoints: [
      "Simplest: 4 lines of YAML — kind, name, templateName. kubectl get sbc shows phase=Completed when ready.",
      "Pool available → sub-second. Pool empty → waits for replenishment by default.",
      "Batch: replicas: 10, gradual delivery. claimTimeout = max time for entire task (not per-sandbox). ttlAfterCompleted deletes claim CR only — NOT the sandboxes.",
      "Post-claim: in-place image upgrade (breaks sub-second), CPU-only resize (memory not supported), CSI mounts, label injection.",
    ],
    transition: "At high throughput, you have to think about reconcile storms.",
    deepDive: [
      {
        heading: "What is a 'declarative' API and why does SandboxClaim use it?",
        body: "Declarative means you describe the desired outcome, not the steps to get there. Instead of writing code that says 'call API X, then call API Y, then wait for status Z', you create a SandboxClaim object that says 'I want a sandbox from the demo pool'. Kubernetes takes it from there. This is powerful because it integrates with GitOps, it's easy to retry (just re-apply the same YAML), and the system can recover if something crashes mid-process.",
      },
      {
        heading: "What does 'best-effort gradual delivery' mean for batch claims?",
        body: "If you ask for 10 sandboxes at once (replicas: 10), the system doesn't wait until all 10 are ready and then hand them all over. Instead, as each one becomes available, it's immediately given to you. This is 'gradual'. 'Best-effort' means the system tries its hardest but doesn't guarantee it'll fulfil all 10 — if the cluster doesn't have enough resources or the pool doesn't replenish fast enough before claimTimeout, you might get fewer. You can monitor progress using the label agents.kruise.io/claim-name=<name> on the sandbox objects.",
      },
      {
        heading: "What is 'in-place image upgrade' and why does it break sub-second delivery?",
        body: "Normally, a warm pool sandbox is created from a base image (e.g., Python 3.11 environment). When you claim it, you might want a different image (e.g., Python 3.12). Instead of creating a brand new Pod, in-place upgrade swaps the container image in the existing running Pod. This is faster than creating a new Pod, but it still requires pulling the new image (if not cached) and restarting the container. So the sub-second promise is broken — it becomes more like 'seconds to minutes depending on image size'.",
      },
      {
        heading: "Why is only CPU resize supported, not memory?",
        body: "Kubernetes has a feature called 'in-place Pod vertical scaling' that lets you resize CPU and memory without restarting the Pod. However, memory resize has fundamental OS constraints — you can't easily take memory away from a running process (it would need to be evicted). The current Kubernetes implementation (stable in 1.33+) and OpenKruise Agents support CPU resize only. Memory resize is listed as 'future work' in the Kubernetes ecosystem.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 11 — Avoiding Reconcile Storms
  // ─────────────────────────────────────────────
  {
    id: 11,
    duration: "~1.5 minutes",
    openingLine: "Let me talk about something that bites you at scale: thundering herd on the claim path.",
    talkingPoints: [
      "100 simultaneous claims, 10 in pool → 90 scale-up events → API server overload.",
      "Mitigation 1: gradual delivery — batch claims deliver one-by-one, not all at once.",
      "Mitigation 2: pool-first — claim served from already-running sandbox when stock exists.",
      "Mitigation 3: SandboxSet controller is tuned for high-frequency scaling.",
      "Escape hatch: createOnNoStock: true on SandboxClaim — skip pool wait, create from template directly.",
    ],
    transition: "Warm pools solve startup. Now the second problem: what happens when things fail. Enter Checkpoints.",
    deepDive: [
      {
        heading: "What is a 'thundering herd' or 'reconcile storm'?",
        body: "Imagine 100 agents all start at exactly the same time (e.g., a job processing pipeline kicks off). Each claims a sandbox. 90 of those claims find an empty pool and trigger scale-up. The Kubernetes API server receives 90 Pod creation requests simultaneously, and the controller processes 90 reconcile events. This burst can overwhelm the API server, cause slowdowns across the entire cluster, and lead to a flood of simultaneous image pulls on worker nodes. It's called a 'thundering herd' because it's like 100 animals all stampeding the same gate.",
      },
      {
        heading: "How does 'pool-first' mitigate storms?",
        body: "The pool absorbs the burst. If 10 requests arrive simultaneously and there are 10 warm sandboxes, all 10 requests are fulfilled immediately with no API server load (other than the claim transaction itself). Only the replenishment (creating 10 new ones) hits the API server — and that happens gradually over time, not all at once. The pool acts as a shock absorber.",
      },
      {
        heading: "What is createOnNoStock and when should I use it?",
        body: "'createOnNoStock: true' is an opt-in flag on SandboxClaim. By default, if the pool is empty, the claim waits for a new sandbox to be created and become available. With createOnNoStock: true, the system immediately creates a fresh sandbox from the template without waiting. This is faster in the 'pool is empty' scenario — but it means full cold-start time (10s to minutes) instead of waiting for a pre-warmed one. Use this when you absolutely can't wait (time-critical workload) or when you intentionally chose not to pre-warm.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 12 — Pause vs Checkpoint
  // ─────────────────────────────────────────────
  {
    id: 12,
    duration: "~1.5 minutes",
    openingLine:
      "Before the Checkpoint CRD, I need to clarify one thing that confuses people: Pause vs Checkpoint.",
    talkingPoints: [
      "Pause/Resume: like hibernating a laptop. Same sandbox ID, 1:1. Use when session goes idle.",
      "Checkpoint: like cloning from a VM snapshot. Source keeps running. 1:many — one checkpoint → many clones.",
      "After pause/resume: same ID. After checkpoint clone: source unchanged, each clone gets new sandbox ID.",
      "E2B calls these 'snapshots' — snapshotId == Checkpoint.metadata.name.",
      "Pause/Resume is still evolving — memory preservation is platform-dependent.",
    ],
    transition: "Now let me show you the actual Checkpoint CRD fields.",
    deepDive: [
      {
        heading: "What does 'pause a sandbox' mean technically?",
        body: "Pausing a sandbox stops all the processes running in it, serialises their state (CPU registers, memory contents, open files) to disk, and frees the CPU and RAM. The Pod goes from 'Running' to 'Paused'. When you resume, the system restores all that state and the processes continue exactly where they left off — like waking a laptop from sleep. This is very different from stopping a container (which loses all in-memory state).",
      },
      {
        heading: "What does 'checkpoint a sandbox' mean technically?",
        body: "A checkpoint creates a snapshot of the sandbox's current state (memory + filesystem layer on top of the base image) and saves it as a new reusable template. Crucially, the original sandbox keeps running — it's not paused permanently. The snapshot captures everything that has happened since the sandbox was created: which packages were installed, which files were written, what's currently in RAM. This snapshot can then be used to create multiple independent copies of that exact state.",
      },
      {
        heading: "Why is 1:many important for agent workloads?",
        body: "Imagine an agent that does expensive setup: it downloads a large dataset, preprocesses it, trains a small model — 30 minutes of work. Now you want to run 10 experiments with slightly different parameters. Without checkpoints, each experiment starts from scratch (30 minutes × 10 = 5 hours). With a checkpoint taken after the 30-minute setup, you can spawn 10 sandboxes from that checkpoint (each gets the dataset already processed) and run them in parallel. Total time: 30 minutes + experiment time. This is the killer feature.",
      },
      {
        heading: "Why is memory preservation platform-dependent for Pause?",
        body: "Fully capturing and restoring RAM state is technically complex. It requires OS-level support (Linux CRIU — Checkpoint/Restore In Userspace), and cloud providers implement it differently. On Alibaba Cloud ACS, full memory preservation is supported. On other platforms, only the filesystem layer may be preserved. This is why the docs say 'platform-dependent' — OpenKruise Agents provides the API, but what it can actually capture depends on the underlying cluster infrastructure.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 13 — Checkpoint CRD
  // ─────────────────────────────────────────────
  {
    id: 13,
    duration: "~1.5 minutes",
    openingLine: "The Checkpoint CRD has five fields in spec and three in status.",
    talkingPoints: [
      "spec.podName (required): the Pod/Sandbox to capture.",
      "spec.sandboxName: optional, when podName alone isn't enough.",
      "spec.keepRunning: true (default) — source keeps running, briefly paused during write.",
      "spec.persistentContents: [memory, filesystem] — both by default.",
      "spec.ttlAfterFinished: 30h — auto-GC. Always set this in production.",
      "status.phase: Pending → Creating → Succeeded / Failed. Only Succeeded can be cloned.",
      "status.completionTime set on Succeeded or Failed. Short name: cp.",
    ],
    transition: "Let me show you what creating a checkpoint looks like from both sides.",
    deepDive: [
      {
        heading: "What is spec.podName and why is it required?",
        body: "In Kubernetes, the Pod is the actual running instance. spec.podName tells the checkpoint system exactly which running Pod to capture. You can find the Pod name by running 'kubectl get pods' in your namespace — it'll look something like 'code-interpreter-28rvn'. The name is unique within a namespace at any given time.",
      },
      {
        heading: "What does keepRunning: true actually do?",
        body: "With keepRunning: true, the sequence is: 1) Briefly pause the sandbox (all processes frozen). 2) Capture memory + filesystem to the checkpoint driver. 3) Resume the sandbox (processes continue from exactly where they were). The sandbox is paused for only as long as it takes to write the snapshot — milliseconds to seconds depending on driver and data size. The user might notice a brief pause in output. With keepRunning: false, the sandbox terminates after the checkpoint — use this for 'snapshot and stop' workflows.",
      },
      {
        heading: "What is persistentContents and what's the difference between memory and filesystem?",
        body: "MEMORY: the RAM contents — what's in variables, what processes are running and where they are in execution, the call stack, buffers. This is what makes 'resume exactly where you left off' possible. FILESYSTEM: the writable layer on top of the base container image — all files created, all packages installed, all configs written. Even without memory capture, filesystem capture means installed packages and written files survive. Memory requires more platform support (CRIU) and is larger to store.",
      },
      {
        heading: "What is ttlAfterFinished and why is checkpoint sprawl a problem?",
        body: "TTL stands for Time-To-Live. ttlAfterFinished: 30h means 'auto-delete this Checkpoint 30 hours after it reaches Succeeded'. Without TTL, every checkpoint you ever create stays around forever. A busy platform might create thousands of checkpoints per day — each one storing gigabytes of data. This fills up storage, creates a management nightmare, and incurs cloud storage costs. Always set a TTL that matches your retention needs (e.g., 24h for daily backups, 7d for important milestones).",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 14 — Creating Checkpoints
  // ─────────────────────────────────────────────
  {
    id: 14,
    duration: "~2 minutes",
    openingLine: "Creating checkpoints has two paths: CRD for platform teams, E2B SDK for application code.",
    talkingPoints: [
      "CRD: kubectl apply, watch kubectl get cp until STATUS=Succeeded.",
      "E2B Python: sbx.create_snapshot() → snapshot_id == Checkpoint name on cluster.",
      "E2B TypeScript: await sbx.createSnapshot() — same behaviour.",
      "Caveat: brief pause during snapshot — WebSocket/PTY connections drop, clients must reconnect. Duration is driver/cluster-dependent.",
    ],
    transition: "Architectural decision point: template vs checkpoint as your starting point?",
    deepDive: [
      {
        heading: "Who should use the CRD path vs the E2B SDK path?",
        body: "CRD path (kubectl/YAML): for platform/infra teams who manage the cluster. Use it for scheduled checkpoint policies ('checkpoint every running sandbox every 4 hours'), post-training checkpoints triggered by CI/CD, or GitOps-managed backup schedules. E2B SDK path: for AI application developers who want to checkpoint from within their code. Their app knows best when a meaningful milestone has been reached — 'I just finished pre-processing, checkpoint now before the expensive training step'.",
      },
      {
        heading: "What does snapshotId == Checkpoint.metadata.name mean in practice?",
        body: "When you call create_snapshot() in Python and print snapshot.snapshot_id, you get a string like 'checkpoint-session-01'. If you then run 'kubectl get cp' in your cluster, you'll see a Checkpoint object with that exact name. They are the same object — the E2B SDK is a thin wrapper over the same Kubernetes resource. This means you can use kubectl to inspect the status of a snapshot created by the Python SDK, and you can use the Python SDK to consume a Checkpoint created by kubectl. One source of truth.",
      },
      {
        heading: "What exactly are WebSocket and PTY connections, and why do they drop?",
        body: "WebSocket is a protocol for real-time bidirectional communication — used for streaming terminal output, live file changes, command execution results. PTY (pseudo-terminal) is what makes your terminal feel like a real terminal — it handles all the escape codes for cursor movement, colour, etc. When the sandbox is briefly paused for snapshot, these connections see a gap in data — they often timeout and close. Your application code needs to handle reconnection gracefully. This is standard practice in real-time systems.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 15 — Template vs Checkpoint
  // ─────────────────────────────────────────────
  {
    id: 15,
    duration: "~1.5 minutes",
    openingLine: "When do you use a template vs a checkpoint? Let me give you a crisp mental model.",
    talkingPoints: [
      "SandboxSet template: identical clean base every time. Reproducible, declarative, version-controlled. Use for warm pools.",
      "Checkpoint: captures live runtime reality — installed packages, computed state. Use for fork, rollback, retry.",
      "Checkpoint as templateName = clone path (NOT warm-pool seeding). Both route through SandboxClaim.",
      "Deleting a Checkpoint removes the CR AND its paired SandboxTemplate — running clones unaffected.",
      "SandboxTemplate CR is immutable. Editing SandboxSet.spec.template creates new SandboxTemplate revisions.",
    ],
    transition: "Let me show you the exact mechanics of the clone path.",
    deepDive: [
      {
        heading: "What is SandboxTemplate and why is it immutable?",
        body: "SandboxTemplate is a lower-level CRD that SandboxSet creates internally every time you change spec.template. It's an immutable record of 'at this revision, the template looked like this'. SandboxSet may have multiple SandboxTemplate objects if its template has changed over time (e.g., one for v1, one for v2). You can't edit a SandboxTemplate — it's a historical record. You edit the SandboxSet and it creates a new SandboxTemplate. This immutability is important for auditability and safe rollbacks.",
      },
      {
        heading: "Concrete analogy: when to use which?",
        body: "TEMPLATE (SandboxSet): like a cookie cutter. Every cookie is identical. Perfect for 'give me a fresh Python 3.12 environment with numpy pre-installed'. Always reproducible. CHECKPOINT: like a photograph of a specific moment. If Agent A installed TensorFlow, trained for 2 hours, and reached epoch 50 — you can checkpoint that exact state and fork Agent B and Agent C from it. They both start at epoch 50 with the trained model already in memory. You can't reproduce this with a template — you'd have to re-run the 2-hour training.",
      },
      {
        heading: "Why does deleting a Checkpoint also delete a SandboxTemplate?",
        body: "When a Checkpoint is created, OpenKruise Agents also creates a linked SandboxTemplate that describes how to clone from this checkpoint. This is what allows SandboxClaim to use the checkpoint name as a templateName — it looks up this linked SandboxTemplate. When you delete the Checkpoint, both the Checkpoint CR and its linked SandboxTemplate are removed (they're useless without each other). Any sandboxes already cloned from it are independent — they have their own Pod, their own storage. Deleting the template doesn't delete the already-running clones.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 16 — Clone Path
  // ─────────────────────────────────────────────
  {
    id: 16,
    duration: "~1.5 minutes",
    openingLine:
      "The clone path — how you go from a checkpoint to a running sandbox — is identical from the caller's perspective.",
    talkingPoints: [
      "SandboxClaim with templateName: checkpoint-session-01 → controller routes to clone path.",
      "E2B SDK: Sandbox.create(template=snapshot.snapshot_id) — one line.",
      "Clone: new sandbox ID, new Pod, new IP — but identical memory + filesystem from checkpoint moment.",
      "One checkpoint → unlimited independent clones. Deleting checkpoint doesn't affect running clones.",
      "Key fault-tolerance pattern: checkpoint before risky operations → clone to recover if needed.",
    ],
    transition: "When the clone path fires, four things happen in sequence — the rehydration steps.",
    deepDive: [
      {
        heading: "What is 'rehydration'?",
        body: "Rehydration is the process of creating a new sandbox from a checkpoint's stored state. The analogy is rehydrating a freeze-dried meal — you take something that was stored in a compact/inactive form and bring it back to a fully functional state. The checkpoint is the 'freeze-dried' state; rehydration creates a running, fully operational sandbox from it.",
      },
      {
        heading: "Why does the clone get a new sandbox ID?",
        body: "Because it's a genuinely new, independent sandbox. It gets its own Pod, its own Kubernetes name, its own IP address, its own unique identifier in your platform. Multiple clones from the same checkpoint all need to be independently addressable — you can't have 10 sandboxes all with the same ID. The original checkpoint is like a blueprint; each clone is a separate building constructed from that blueprint.",
      },
      {
        heading: "What does 'identical memory + filesystem state' mean in practice?",
        body: "Every variable that was in memory, every file that was written, every package that was installed, every process that was running — all of it is reproduced in the clone. If your Python script had a variable `results = [1, 2, 3, 4, 5]` in memory when the checkpoint was taken, the cloned sandbox starts with that variable already populated. If you had installed 'pip install pandas' and were mid-way through a Jupyter notebook, the clone starts with pandas installed and the notebook in the state it was when checkpointed.",
      },
      {
        heading: "How does the 'fault-tolerant checkpoint' pattern work?",
        body: "Before each high-risk step (calling an external API that might fail, training a model that might crash, running untested code), your agent takes a checkpoint. If the step fails (exception, crash, timeout), you don't retry from the beginning — you clone from the checkpoint and try again from there. This is the same principle as database transactions: do some work, checkpoint, try the next thing, if it fails roll back to the checkpoint. The agent never has to redo expensive computation.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 17 — Rehydration Steps
  // ─────────────────────────────────────────────
  {
    id: 17,
    duration: "~2 minutes",
    openingLine: "If you're building on this system or debugging it, understand the four rehydration phases.",
    talkingPoints: [
      "Step 01: sandbox-manager calls checkpoint driver. New Sandbox CR + Pod created from restored state.",
      "Step 02: controller polls until Sandbox phase = Running. agent-runtime initialises on port 49983.",
      "Step 03: optional env var re-injection. Memory fidelity is platform/driver-dependent.",
      "Step 04: CSI driver attaches per-session PVCs if runtimes: [{name: csi}] configured.",
      "Port 49983 MUST be open on all Sandbox Pods — most agent-runtime debugging traces back to this.",
    ],
    transition: "Let me make this concrete with a real failure and recovery scenario.",
    deepDive: [
      {
        heading: "What is a 'checkpoint driver'?",
        body: "The checkpoint driver is the backend technology that actually stores and restores the sandbox state. OpenKruise Agents defines the API (the Checkpoint CRD) but the actual implementation is pluggable. On Alibaba Cloud ACS, the driver uses a custom implementation that can capture full memory state including GPU memory. Other drivers might only capture the filesystem. The driver is configured during cluster setup. As a user, you interact with the same CRD regardless — the driver is an infrastructure concern.",
      },
      {
        heading: "What does 'controller polls' mean in Step 02?",
        body: "After the Pod is created, it doesn't immediately become useful — it needs to boot, run its init processes, and become ready. The controller watches the Pod's status in Kubernetes and waits until: (a) the Pod's phase becomes 'Running', (b) all readiness probes pass (these are health checks you configure to verify the app is actually ready), and (c) the agent-runtime sidecar signals it's ready on port 49983. Only then does the SandboxClaim report 'Completed'.",
      },
      {
        heading: "What is a CSI driver and dynamic PVC mount?",
        body: "CSI (Container Storage Interface) is the standard plugin interface for attaching storage to Kubernetes Pods. A PVC (PersistentVolumeClaim) is a request for storage — like saying 'I need 10GB of disk'. Dynamic PVC mount means: at the moment a sandbox is claimed, the CSI driver creates and attaches a fresh PVC specifically for this session. This is how you give each user their own persistent workspace. When the sandbox is deleted, the PVC persists and can be reattached to the user's next session.",
      },
      {
        heading: "Why does port 49983 cause so much debugging pain?",
        body: "Port 49983 is the port agent-runtime listens on inside the Pod. sandbox-manager (which runs outside the Pod, in the cluster control plane) communicates with agent-runtime over this port. In many corporate or production clusters, there are network policies, security groups, firewalls, or iptables rules that block traffic between Pods and control-plane services on non-standard ports. If port 49983 is blocked, sandbox-manager can't talk to agent-runtime, and commands like 'run this code' or 'write this file' silently fail. Always verify this port is open when setting up a new cluster.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 18 — Failure Story
  // ─────────────────────────────────────────────
  {
    id: 18,
    duration: "~2 minutes",
    openingLine: "Let me walk you through a concrete timeline.",
    talkingPoints: [
      "T+0: Claimed from warm pool sub-second. Agent installs packages, writes 50MB intermediate data.",
      "T+5 min: create_snapshot(). Captures memory + filesystem. ttlAfterFinished: 24h. Agent keeps running.",
      "T+12 min: Node failure. Pod evicted. Without checkpoint: all work lost, restart from zero.",
      "T+12.5 min: SandboxClaim with templateName: checkpoint-session-01. Clone path fires. New Pod, same state.",
      "T+13 min: Restored sandbox has all packages and data. Agent continues from checkpoint. No duplicated work.",
      "Recovery speed depends on driver/cluster — but far faster than a full restart.",
    ],
    transition: "We've covered startup and reliability. Third piece: safe runtime evolution.",
    deepDive: [
      {
        heading: "What is a 'node failure' in Kubernetes?",
        body: "A 'node' is a physical or virtual machine in your Kubernetes cluster. Node failure means that machine becomes unavailable — maybe the hard drive failed, maybe the cloud provider preempted it (took it back because someone else bid more), maybe it ran out of memory and crashed, maybe the network partitioned. Kubernetes detects this when it stops receiving heartbeats from the node. After a configurable timeout (usually 5 minutes), Kubernetes marks all Pods on that node as 'Unknown' and eventually 'Evicted', and tries to reschedule them elsewhere.",
      },
      {
        heading: "Why is '50MB of intermediate data' significant?",
        body: "50MB represents the kind of work an agent does: a downloaded dataset, a parsed document, an in-progress analysis, a trained model checkpoint. This is not trivially cheap to recreate. If the agent was 12 minutes into a task when the node failed, the actual cost of the work lost could be compute time, API calls made, money spent on cloud resources. The checkpoint at T+5 means only the 7 minutes between the checkpoint and the failure need to be redone — not the full 12.",
      },
      {
        heading: "Why does 'T+12.5' recovery happen so quickly after 'T+12' failure?",
        body: "The clone from a Checkpoint doesn't need to pull the base image again (it's cached), doesn't need to reinstall packages (they're in the snapshot's filesystem layer), and doesn't need to redo computation (it's in the snapshot's memory). It primarily needs to: create a new Pod, mount the restored filesystem, restore memory state (platform-dependent), and start agent-runtime. On a healthy cluster with a good checkpoint driver, this can be seconds. The 0.5 minute is intentionally illustrative — actual time varies.",
      },
      {
        heading: "What does 'no duplicated side effects' mean?",
        body: "Side effects are actions that affect external systems: writing to a database, sending an email, calling a payment API, posting a message to Slack. If you restart an agent from scratch (no checkpoint), it might do all those things again — duplicating records, sending the email twice, charging the user twice. If you resume from a checkpoint taken after the side effects occurred, you skip them. The agent knows 'I already did the database write because I can see the result in my memory'. Checkpoints help with idempotency — the property that doing something twice has the same effect as doing it once.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 19 — Two Upgrade Surfaces
  // ─────────────────────────────────────────────
  {
    id: 19,
    duration: "~2 minutes",
    openingLine: "Runtime upgrades are where many teams get stuck. Two surfaces, two strategies.",
    talkingPoints: [
      "Surface 1 — Idle pool: edit SandboxSet spec.template, kubectl apply. Idle sandboxes replaced in batches. Active sessions untouched.",
      "Replaced pool sandboxes lose their Pod + IP. Active (claimed) sessions are NEVER touched.",
      "Surface 2 — Active sessions: SandboxUpdateOps. Recreate upgrade — Pod deleted/recreated. Brief outage per sandbox.",
      "Only one active SandboxUpdateOps per namespace at a time. Requires agent-runtime + CSI. v0.3.0+.",
      "Use PreUpgrade + PostUpgrade hooks with CSI to backup/restore filesystem across Pod recreation.",
    ],
    transition: "To gate operations on completion, you need revision tracking.",
    deepDive: [
      {
        heading: "What is the difference between the two upgrade surfaces?",
        body: "Surface 1 (idle pool): sandboxes in the warm pool haven't been claimed by any user yet. They're sitting empty, waiting. Upgrading them has zero user impact — no one is using them. The system can freely delete them and create new ones with the updated image. Surface 2 (active sessions): these sandboxes have active users working in them. You CANNOT just kill them. You need to coordinate: back up any user work, terminate gracefully, start the new version, restore work. This is much more complex and always involves some downtime.",
      },
      {
        heading: "What is SandboxUpdateOps and how is it different from a Deployment rolling update?",
        body: "A Kubernetes Deployment rolling update replaces Pods with zero awareness of sessions — it just kills them. SandboxUpdateOps is session-aware: you specify a label selector to target specific sandboxes, a patch to apply (the new image), lifecycle hooks to run before/after the Pod replacement, and a maxUnavailable limit so you don't disrupt too many at once. It's also self-throttling — only one can be active per namespace at a time to prevent conflicting upgrade operations.",
      },
      {
        heading: "What are PreUpgrade and PostUpgrade lifecycle hooks?",
        body: "A lifecycle hook is a script that runs at a specific point in a process. PreUpgrade runs BEFORE the old Pod is killed — use it to back up files to external storage (tar czf /mnt/backup.tar.gz). PostUpgrade runs AFTER the new Pod is up and running — use it to restore files from that backup. This lets you preserve the user's workspace even though the Pod itself is deleted and recreated. Memory and IP are still lost (new Pod = new IP), but the filesystem contents survive.",
      },
      {
        heading: "What is CSI and why is it needed for lifecycle hooks?",
        body: "CSI (Container Storage Interface) allows you to mount external persistent volumes into Pods. For lifecycle hooks to work, both the old Pod (PreUpgrade) and the new Pod (PostUpgrade) need access to the same storage — otherwise you can't write the backup in one and read it in the other. The CSI runtime (configured via runtimes: [{name: csi}] in SandboxSet) mounts an external volume into the sandbox Pod, providing this shared storage between the pre- and post-upgrade steps.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 20 — Revision Gating
  // ─────────────────────────────────────────────
  {
    id: 20,
    duration: "~1.5 minutes",
    openingLine: "Revision gating: don't route to new versions until you know the pool is fully updated.",
    talkingPoints: [
      "kubectl get sbs my-pool -o wide → UPDATEDAVAILABLEREPLICAS. When == replicas, pool is fully on new revision.",
      "UPDATEREVISION: hash of current desired template. Per-sandbox status.updateRevision tells exactly which version.",
      "CI/CD gate: poll UPDATEDAVAILABLEREPLICAS == replicas before routing production traffic.",
      "Active session lifecycle: PreUpgrade (backup) → UpgradePod (delete/create) → PostUpgrade (restore).",
      "Build this gating into your deployment runbook.",
    ],
    transition: "Let me zoom out to the four reusable patterns.",
    deepDive: [
      {
        heading: "What is 'revision gating' and why does it matter?",
        body: "Revision gating is the practice of not sending user traffic to new-version sandboxes until you're confident the pool is fully updated and healthy. Imagine you deploy a new sandbox image with a bug in it. If you route users to sandboxes immediately after the rolling update starts, some users get the old image and some get the broken new one. By waiting until UPDATEDAVAILABLEREPLICAS == replicas before flipping traffic, you ensure all sandboxes in the pool are on the new, validated version.",
      },
      {
        heading: "What is a hash and why is UPDATEREVISION a hash?",
        body: "A hash is a short fixed-length string computed from a larger input, such that any change to the input produces a completely different hash. UPDATEREVISION is computed from the full SandboxSet spec.template — if you change anything (image, env var, resource limits), the hash changes. This makes it trivial to compare: if a sandbox's status.updateRevision matches the SandboxSet's UPDATEREVISION, it's on the latest version. If they differ, it's outdated. No need to compare entire YAML specs — just compare 8-character hashes.",
      },
      {
        heading: "How do you integrate revision gating into CI/CD?",
        body: "After you run 'kubectl apply -f sandboxset.yaml' to deploy the new image, add a polling step to your CI/CD pipeline: run 'kubectl get sbs my-pool -o jsonpath={.status.updatedAvailableReplicas}' in a loop until it equals your desired replicas count. Only then proceed with the next pipeline step (e.g., run smoke tests, flip the load balancer, announce the deployment). Tools like ArgoCD have built-in health checks that can express this condition.",
      },
      {
        heading: "What happens during UpgradePod in the SandboxUpdateOps lifecycle?",
        body: "UpgradePod is the middle phase where the actual Pod replacement happens: 1) The old Pod is deleted (SIGTERM → wait grace period → SIGKILL). 2) A new Pod is created with the new image and the updated spec. 3) The new Pod goes through the normal startup sequence: schedule, image pull (if not cached), container init, readiness checks. During this phase, the sandbox is unavailable — the user's session is interrupted. The Sandbox CR shows phase 'Upgrading' with condition reason 'UpgradePod'.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 21 — Reusable Patterns
  // ─────────────────────────────────────────────
  {
    id: 21,
    duration: "~2 minutes",
    openingLine: "Four patterns — not specific to OpenKruise — general Kubernetes-native blueprints.",
    talkingPoints: [
      "Pattern 01 — Warm Pool Manager: buffer above burst, availableReplicas as SLI, scale down off-hours.",
      "Pattern 02 — High-Throughput Claim Controller: gradual delivery, claimTimeout, pool-first, createOnNoStock escape hatch.",
      "Pattern 03 — Checkpoint Lifecycle: checkpoint at milestones, set TTL always, snapshotId == Checkpoint.name, clones independent.",
      "Pattern 04 — Revision Gating: hash desired state, per-replica tracking, gate claims on UPDATEDAVAILABLEREPLICAS, hooks for filesystem.",
    ],
    transition: "Let me leave you with the three things to remember.",
    deepDive: [
      {
        heading: "Why are these patterns 'reusable beyond OpenKruise'?",
        body: "These four patterns solve problems that exist in any system that manages many short-lived stateful sessions: game servers, Jupyter notebooks, code sandboxes, ML experiment runners, interactive terminals. The specific CRDs (SandboxSet, SandboxClaim, etc.) are OpenKruise Agents, but the patterns — pre-warm a pool, claim gradually, checkpoint at milestones, gate upgrades on revision completion — can be implemented in any orchestration system. If you build your own sandbox management system, these are the design decisions you'll face.",
      },
      {
        heading: "What is an SLI and why is availableReplicas a good one?",
        body: "SLI stands for Service Level Indicator — a metric that measures how well your service is performing. For a warm pool, the most important SLI is 'how many sandboxes are available to be claimed right now'. If this drops to zero, the next claim request will either fail or face a cold-start delay. A good SLI for a pool service: availableReplicas >= 3 (alert if it drops below your safety buffer). Track it in Prometheus, alert in PagerDuty, graph it in Grafana. It's more meaningful than CPU usage or memory consumption.",
      },
      {
        heading: "Pattern 03 deep dive: why 'checkpoint at milestones not just exit'?",
        body: "If you only checkpoint when the agent finishes, then a failure mid-task means complete restart. But if you checkpoint after each meaningful sub-task (data downloaded, preprocessed, first training epoch done), failures become minor setbacks — you resume from the last milestone. Think of saving a video game: you don't save only when you finish the game. You save after each level, after each boss fight. Same principle. The cost is: each checkpoint takes some time and storage. The benefit: failures only cause you to redo work since the last checkpoint.",
      },
      {
        heading: "Pattern 04 deep dive: what does 'canary analysis' mean with per-sandbox revision tracking?",
        body: "Canary analysis is the practice of deploying a new version to a small percentage of traffic first, watching for errors, then rolling out to everyone if it looks good. With per-sandbox revision tracking (status.updateRevision), you can tell exactly which sandboxes are on the new version and which are on the old. You can compare error rates, latency, user feedback between old-revision and new-revision sandboxes. This is proper canary analysis — not just 'some pods are new, some are old' but 'I know exactly which pods are which and can compare their metrics'.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // SLIDE 22 — Takeaways
  // ─────────────────────────────────────────────
  {
    id: 22,
    duration: "~1.5 minutes + Q&A",
    openingLine: "Three things to remember when you leave this room.",
    talkingPoints: [
      "Cut cold starts with warm pools — pre-created ready replicas, auto-replenish, sub-second when pool has stock.",
      "Preserve agent work with checkpoints — memory + filesystem at any milestone, unlimited independent clones, fast recovery.",
      "Evolve runtime without chaos — pool update only touches idle sandboxes, SandboxUpdateOps + hooks for active sessions.",
      "GitHub: github.com/openkruise/agents | Docs: openkruise.io/kruiseagents | Slack: #openkruise",
    ],
    transition: "Thank you — happy to take questions!",
    deepDive: [
      {
        heading: "Summary: the three-problem, three-solution mapping",
        body: "PROBLEM: Cold starts are slow → SOLUTION: SandboxSet warm pool (pre-created sandboxes, sub-second delivery, auto-replenish). PROBLEM: Failures lose agent work → SOLUTION: Checkpoint CRD (capture memory + filesystem, 1:many clone, TTL-based GC). PROBLEM: Upgrades break active sessions → SOLUTION: Two-surface upgrade strategy (idle pool via rolling update, active sessions via SandboxUpdateOps with lifecycle hooks + revision gating).",
      },
      {
        heading: "What can I actually do with this starting tomorrow?",
        body: "1) If you're running AI agent workloads on K8s without warm pools, install OpenKruise Agents and create a SandboxSet — your P99 latency will drop dramatically. 2) If you've had 'node failure means lost work' incidents, add create_snapshot() calls at key points in your agent code. 3) If you've been afraid to update sandbox images because it disrupts users, look at SandboxUpdateOps with PreUpgrade/PostUpgrade hooks to do it safely. Start with one of these three — don't try to implement all at once.",
      },
      {
        heading: "What should I know about OpenKruise before recommending it to my team?",
        body: "OpenKruise is a CNCF project with active development (check github.com/openkruise/agents for recent commits). OpenKruise Agents requires Kubernetes 1.28+. The memory checkpoint feature requires specific platform support (currently Alibaba Cloud ACS has the best support — other platforms may only support filesystem). The project is evolving — some features (like pause/resume semantics) are still maturing. For production use, test on your specific cloud provider and validate the checkpoint fidelity before relying on it for critical workloads.",
      },
      {
        heading: "Where to go for help and contribution?",
        body: "GitHub: github.com/openkruise/agents — file issues, read the code, submit PRs. Documentation: openkruise.io/kruiseagents — the same docs used to verify the content of these slides. Community: #openkruise channel on the Kubernetes Slack workspace (kubernetes.slack.com). Bi-weekly community meetings (English track in progress, Chinese track every Thursday 19:30 GMT+8). Contributing guide in CONTRIBUTING.md in the repo.",
      },
    ],
  },
];
