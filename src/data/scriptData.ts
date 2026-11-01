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
  {
    id: 1,
    duration: "~40 seconds",
    openingLine:
      "Good afternoon. This is a beginner session on running MCP servers as sandboxes on Kubernetes, using OpenKruise Agents.",
    talkingPoints: [
      "Thirty minutes. Salt Lake Ballroom DE. Harkirat and Hrittik.",
      "We will not teach the MCP protocol. We will show how to run one server per user.",
      "Three moves: warm pool, isolation, checkpoint before you throw the Pod away.",
    ],
    transition: "First, agree on what the MCP server is, because that is the workload.",
    deepDive: [
      {
        heading: "Where you are",
        body: "KubeCon + CloudNativeCon North America 2026. 12 November, 3:30–4:00 pm. Hyatt Regency, Level 2, Salt Lake Ballroom DE. Track is AI Inference + Agentic. Level is Beginner. You have about 28 minutes of talking and a couple of minutes for questions. Harkirat Singh and Hrittik Roy are the speakers.",
      },
      {
        heading: "What the abstract promised",
        body: "The accepted abstract says four concrete things: SandboxSet pre-warms servers, SandboxClaim binds one in under 100ms, checkpoint and restore keep tool state, and we cover isolation, per-user volumes, and a graceful upgrade. Every later slide exists to pay one of those promises. If you drop a slide in rehearsal, do not drop isolation, the warm bind, volumes, or the upgrade handoff.",
      },
      {
        heading: "What OpenKruise Agents is",
        body: "OpenKruise is a CNCF project that extends Kubernetes workload management. OpenKruise Agents is its sub-project for AI agent sandboxes. It gives you a warm pool of Pods, a way to claim one for a user, checkpoints, and network policy. It does not implement the user's tools. The MCP server image is still your container.",
      },
      {
        heading: "How to open",
        body: "Say you will not teach the MCP protocol. Say the session is how to run one server per user on Kubernetes. The three moves are: pool the server, isolate the session, checkpoint before you delete the Pod. That sentence is also the close.",
      },
    ],
  },
  {
    id: 2,
    duration: "~1 minute",
    openingLine:
      "An MCP server is the process that actually runs the tool. The agent decides. The server executes.",
    talkingPoints: [
      "Tools here means filesystem, shell, and network.",
      "A session lasts minutes and accumulates files, packages, and shell state.",
      "That process must not be shared between users.",
    ],
    transition: "Once you accept that shape, production asks three questions.",
    deepDive: [
      {
        heading: "MCP in one picture",
        body: "An LLM application is the MCP client. It decides the next step, then asks a server to run a tool. The server is a normal process that exposes tools such as read a file, run a shell command, or call the network. Model Context Protocol is just the wire format between that client and that process. This talk never opens the wire format.",
      },
      {
        heading: "Why a session is not a web request",
        body: "A web request is short and stateless. An MCP session lasts minutes. The process installs packages, writes files, and remembers shell history. That accumulated state is the thing we later checkpoint. If two users share the process, they share the files, the environment, and the child processes.",
      },
      {
        heading: "What you must not say",
        body: "Do not say sandbox-manager is an MCP server. It speaks an E2B-compatible lifecycle API: create, pause, resume, snapshot, kill. The architecture page still marks MCP integration on the E2B create call as pending. What is real: you claim a sandbox, your MCP server runs inside the Pod, and SecurityProfile can allowlist tools/call on the way out.",
      },
    ],
  },
  {
    id: 3,
    duration: "~1 minute",
    openingLine: "There are three questions, and they are the outline of the rest of the talk.",
    talkingPoints: [
      "Isolate every user. One shell must not see another user’s files.",
      "Scale without a cold start. The target for a warm bind is under 100ms.",
      "Expose filesystem, shell, and network on purpose, and deny the rest.",
    ],
    transition: "A normal Deployment fails all three.",
    deepDive: [
      {
        heading: "Question 1, isolation",
        body: "Each user gets their own server process. A shell in Alice's session must not list Bob's files or see Bob's processes. Sharing one MCP process to 'scale' is the failure mode, not a shortcut. Later we implement this as one Pod per session, plus seccomp and allowlists.",
      },
      {
        heading: "Question 2, cold start",
        body: "Thousands of sessions each want a server now. Creating the Pod after the click means schedule, image pull, and process boot sit on the tool-call path. That is seconds to minutes. The abstract's number, under 100ms, is only the later bind of a server that is already running.",
      },
      {
        heading: "Question 3, safe exposure",
        body: "Filesystem, shell, and network are the product. They are also the attack surface. The talk's answer is not 'turn them off'. It is allow what this session needs and deny the rest: egress hosts via TrafficPolicy, tool names via mcpToolPolicy.",
      },
      {
        heading: "Why all three together",
        body: "Fixing only startup by sharing one process makes isolation worse. Fixing only isolation by creating a Pod per click makes startup worse. The rest of the talk is the coordinated answer: pre-warm, claim, isolate, mount, checkpoint.",
      },
    ],
  },
  {
    id: 4,
    duration: "~90 seconds",
    openingLine: "If you put the MCP server in a Deployment, you get a shared process, a cold Pod, or a rolling update that kills the session.",
    talkingPoints: [
      "Shared process: files, env, and child processes cross users.",
      "Pod per request: schedule, image pull, and process start sit on the tool-call path.",
      "Rolling update replaces Pods that still have a user inside. State goes with them.",
    ],
    transition: "OpenKruise Agents keeps your server and changes how it is scheduled.",
    deepDive: [
      {
        heading: "What a Deployment actually does",
        body: "A Deployment keeps N interchangeable replicas. If one dies, Kubernetes makes another from the same template. A rolling update starts new Pods and terminates old ones. That is correct for a stateless web server. An MCP session is not interchangeable: it holds one user's files and a shell that has already done work.",
      },
      {
        heading: "The three failure modes on this slide",
        body: "One shared server means no isolation. One new Pod per request means every user pays schedule, image pull, and boot. kubectl set image, or any rolling update, sends SIGTERM to Pods that still have a user inside. Kubernetes does not know what a session is, so it cannot wait for the tool call to finish.",
      },
      {
        heading: "What we keep from Kubernetes",
        body: "We still want a Pod. A Pod is the isolation boundary: its own PID, mount, and network namespace. The mistake is creating that Pod after the user has already asked for a tool, and killing it while they are still in it. Say this is not a Kubernetes bug. It is the wrong workload shape for a Deployment.",
      },
    ],
  },
  {
    id: 5,
    duration: "~90 seconds",
    openingLine: "Five pieces. Only one of them is your MCP server.",
    talkingPoints: [
      "sandbox-controller reconciles the CRDs.",
      "sandbox-manager is the lifecycle API. It is not the MCP server.",
      "sandbox-gateway routes ingress in and enforces egress policy.",
      "agent-runtime is the sidecar for commands and files. csi is a separate runtime for PV mounts.",
      "The Sandbox Pod runs your MCP server image. One Pod per session.",
    ],
    transition: "Platform teams and agent apps enter that system through different doors.",
    deepDive: [
      {
        heading: "sandbox-controller",
        body: "A Kubernetes controller watches objects and makes the cluster match them. This one reconciles SandboxSet, SandboxClaim, Checkpoint, SandboxUpdateOps, and the policy CRDs, and it runs the admission webhooks. If someone asks 'who starts the replacement Pod after a claim', the answer is this controller.",
      },
      {
        heading: "sandbox-manager and the gateway",
        body: "sandbox-manager is stateless. Docs call the northbound surface the E2B-compatible API. The access page also labels the control plane as E2B/MCP management APIs (create, kill, pause, resume, connect, list, API keys). The architecture compatibility table still marks MCP integration on create as pending. Do not say the manager runs the user's tools. sandbox-gateway is Envoy with Go filters: ingress to the claimed sandbox, egress for L7 policy and the MCP tool ACL.",
      },
      {
        heading: "agent-runtime, csi, and the Pod",
        body: "agent-runtime is a sidecar injected when runtimes includes agent-runtime. It speaks the E2B envd command and file API on port 49983. On-demand PV mounts are a separate csi runtime that injects the CSI sidecar. Docs say both are needed for claim-time volume mounts. The main container is your MCP server image. One Pod per session is the isolation story. agent-runtime injection itself wants Kubernetes ≥ 1.29 (native sidecars). Agents 0.6.0 overall wants ≥ 1.28.",
      },
      {
        heading: "If someone asks what the slide left off",
        body: "Architecture also lists traffic-proxy (in-pod L4 egress), the CSI sidecar, and a traffic control plane where istiod pushes xDS and an enforcer applies L7 policy, MCP ACL, and token injection. We kept five boxes so a beginner can hold the picture. Mention the extras only if asked.",
      },
    ],
  },
  {
    id: 6,
    duration: "~1 minute",
    openingLine: "Same pool. CRDs if you are the platform. A claim if you are the agent app.",
    talkingPoints: [
      "SandboxSet, SandboxClaim, Checkpoint, SandboxUpdateOps, TrafficPolicy, SecurityProfile.",
      "The app calls the E2B-compatible API. Sandbox.create(template='mcp-tools') binds a warm server.",
      "After that, the app speaks MCP to the process inside the Pod. snapshot id equals the Checkpoint name.",
    ],
    transition: "The reason that create is fast is that the server was already running.",
    deepDive: [
      {
        heading: "What a CRD is, if you need it",
        body: "Kubernetes ships Pod, Deployment, Service. A Custom Resource Definition adds your own type, manipulated with the same kubectl and API. OpenKruise Agents adds SandboxSet, SandboxClaim, Sandbox, Checkpoint, SandboxTemplate, SandboxUpdateOps, TrafficPolicy, and SecurityProfile. Platform teams commit those YAML files. Short names you can say: sbs, sbc, cp.",
      },
      {
        heading: "What E2B is",
        body: "E2B is a sandbox SDK with Python and JavaScript clients. sandbox-manager speaks a compatible lifecycle API, so an app that already calls Sandbox.create can point at this cluster. Sandbox.create(template='mcp-tools') claims a warm sandbox. create_snapshot() writes a Checkpoint. The snapshot id the SDK returns is the Checkpoint object's name. Both doors write the same objects.",
      },
      {
        heading: "The order of calls",
        body: "First the app claims a sandbox through the E2B-compatible API (or a SandboxClaim CR). Then it speaks MCP to the process inside that Pod. The gateway routes the session. OpenKruise does not implement the tools. The access docs say the control plane exposes E2B/MCP management APIs, but the architecture compatibility table still marks MCP integration on create as pending. Safe line: claim with E2B, run your MCP server in the Pod, enforce mcpToolPolicy on egress.",
      },
    ],
  },
  {
    id: 7,
    duration: "~1 minute",
    openingLine: "Cold start is schedule, pull, boot, then the tool. Warm start is a bind.",
    talkingPoints: [
      "SandboxSet creates the Pods before anyone asks.",
      "A session claims one that is already available.",
      "Replenishment happens behind that claim, not in front of the user.",
    ],
    transition: "SandboxSet is the object that holds that inventory.",
    deepDive: [
      {
        heading: "Where the seconds go",
        body: "A cold Pod pays, in order: the scheduler picks a node, the kubelet pulls the image if it is not cached, the runtime starts the container, and the MCP server process boots. A large image can dominate. None of that can sit in front of a tool call if you want interactive sessions at thousands of concurrent users.",
      },
      {
        heading: "What warm means",
        body: "SandboxSet creates the Pods before anyone arrives. They sit in the available state: image pulled, process up, ready to be claimed. The user's request becomes a bind of an existing object, not a create. The controller then starts a replacement in the background so the spare count recovers.",
      },
      {
        heading: "The 100ms line, precisely",
        body: "The abstract says a warm SandboxClaim binds in under 100ms. The docs describe the pool path as sub-second. Say the number only for a claim when availableReplicas is above zero. Image pull, an in-place image change, and a CSI volume publish happen after the bind and cost more. Checkpoint restore is a new Pod and is not 100ms. If someone adds those numbers together, separate them.",
      },
    ],
  },
  {
    id: 8,
    duration: "~90 seconds",
    openingLine: "SandboxSet is a ReplicaSet for sandboxes. replicas is the spare pool, not the number of live users.",
    talkingPoints: [
      "The template is your MCP server image.",
      "Put seccomp RuntimeDefault and allowPrivilegeEscalation: false on that container. The controller will not add them.",
      "status.availableReplicas is the number to alert on.",
      "persistentContents: ip is for pause and resume. Memory and filesystem are a Checkpoint.",
    ],
    transition: "Watch what happens to that count when someone claims.",
    deepDive: [
      {
        heading: "How to read the YAML",
        body: "apiVersion agents.kruise.io/v1alpha1, kind SandboxSet, name mcp-tools. replicas: 10 means ten unclaimed servers. The template's container image is your MCP server. securityContext sets allowPrivilegeEscalation: false and seccompProfile.type: RuntimeDefault. Every warm Pod is born with that profile because it is in the template. The controller will not add it later. If the template omits it, the Pod does not have it.",
      },
      {
        heading: "replicas versus availableReplicas",
        body: "replicas is the spare pool and does not include claimed sandboxes. status.availableReplicas is how many can be handed out right now. That is the number to alert on. Zero means the next user pays a cold start. kubectl get sbs is the short name. A sandbox in creating is not claimable: the Pod exists but the container is not ready.",
      },
      {
        heading: "persistentContents: ip",
        body: "This list is what pause and resume try to keep. The documented value on a pool is ip, so the sandbox IP can survive hibernate and wake. Do not confuse it with Checkpoint. Memory and filesystem snapshots are a Checkpoint object, with their own persistentContents of memory and filesystem.",
      },
    ],
  },
  {
    id: 9,
    duration: "~1 minute",
    openingLine: "A claim removes a server from the pool. The controller starts another one immediately.",
    talkingPoints: [
      "Stage 1: three available.",
      "Stage 2: one is claimed, so the pool count drops and a scale-up starts.",
      "Claimed sandboxes are outside replicas. The buffer returns to three without counting Alice’s session.",
    ],
    transition: "The object that takes the server off the shelf is a SandboxClaim.",
    deepDive: [
      {
        heading: "Walk the four frames",
        body: "Start with replicas 3 and three available. Alice claims one. That sandbox leaves the pool, so the count drops and a scale-up starts. While the new Pod is creating, available is 2. When it becomes available, the spare count is 3 again. Alice's session is not part of that 3. Point at the dashed box that says session.",
      },
      {
        heading: "Why claimed sandboxes are excluded",
        body: "If replicas included live sessions, a busy afternoon would look like a full pool. The controller would scale the spares down, and the next burst would cold-start. The spare count has to stay stable while sessions come and go. That is the whole reason the field does not mean 'total MCP servers in the cluster'.",
      },
      {
        heading: "What you can skip if time is short",
        body: "You do not need to explain the reconcile loop, work queues, or rate limits. The sentence is: a claim consumes inventory, and the controller refills inventory. The next slide names the object that does the consuming.",
      },
    ],
  },
  {
    id: 10,
    duration: "~90 seconds",
    openingLine: "A SandboxClaim names the pool. If something is available, the session gets it.",
    talkingPoints: [
      "templateName: mcp-tools.",
      "Warm and in stock: under 100ms. Empty pool: you wait for the next Pod.",
      "After the bind you can mount a volume, resize CPU or memory (memory up only), and add labels.",
      "Do not swap the image at claim time. That pull gives up the fast path. Bake the image into the pool.",
    ],
    transition: "Binding fast is not the same as being safe. Isolation is the next four controls.",
    deepDive: [
      {
        heading: "The smallest claim",
        body: "kind SandboxClaim, spec.templateName: mcp-tools. That name is the SandboxSet. If a sandbox is available, the controller binds it to this claim. kubectl get sbc watches claims. If the pool is empty, the claim waits for the next Pod. claimTimeout bounds that wait so it cannot hang forever.",
      },
      {
        heading: "What is allowed after the bind",
        body: "dynamicVolumesMount attaches a PV (needs the csi runtime). CPU and memory can be resized in place on the main container; memory can only increase; other resources are rejected; QoS class must not change. In-place resize needs Kubernetes 1.33+ (or 1.27–1.32 with InPlacePodVerticalScaling) and the SandboxInPlaceResourceResize feature gate, which is on by default. Labels land on the Sandbox and the Pod. Annotations land on the Sandbox only. An in-place image change pulls after the claim and gives up the fast path. Put the MCP server image in the SandboxSet, not in the claim.",
      },
      {
        heading: "Batch and garbage collection",
        body: "replicas on the claim asks for several sandboxes. Delivery is best-effort and gradual, not all-or-nothing. ttlAfterCompleted deletes the claim object when it is done. It does not delete the sandboxes. The label agents.kruise.io/claim-name is how you watch which sandboxes a batch claim received.",
      },
    ],
  },
  {
    id: 11,
    duration: "~2 minutes",
    openingLine: "Isolation is four controls, and they are not the same thing.",
    talkingPoints: [
      "One Pod per session: its own PID, mount, and network namespace.",
      "That is a Linux namespace, not a Kubernetes Namespace per user. The pool shares the SandboxSet’s namespace.",
      "seccomp RuntimeDefault is on the template. You set it.",
      "TrafficPolicy allowlists egress. SecurityProfile.mcpToolPolicy allowlists tools/call and defaults to deny.",
    ],
    transition: "The server is isolated. The user’s files still have to get into it.",
    deepDive: [
      {
        heading: "Control 1, the Pod",
        body: "Every Pod gets its own Linux namespaces: PID, mount, network, IPC, and UTS. A shell in Alice's Pod cannot see Bob's processes or Bob's files. This is what the abstract calls per-sandbox namespaces. It is not a Kubernetes Namespace object per user. Every sandbox in one SandboxSet lives in that SandboxSet's Kubernetes namespace.",
      },
      {
        heading: "Control 2, seccomp",
        body: "seccomp is a kernel filter on which system calls a process may make. RuntimeDefault is the container runtime's default profile. We put it, and allowPrivilegeEscalation: false, on the container in the SandboxSet template. The controller does not inject this. If the YAML on the previous slide is missing, the Pod does not have the profile. Say 'you set it on the template', not 'the platform always adds it'.",
      },
      {
        heading: "Control 3, egress",
        body: "TrafficPolicy is a namespaced CRD. It selects sandbox Pods and allowlists which hosts, ports, and protocols they may reach. GlobalTrafficPolicy is the cluster-scoped twin, for rules a tenant must not override, such as blocking the cloud metadata address. A Pod boundary stops process sharing. It does not by itself stop the process from calling the internet.",
      },
      {
        heading: "Control 4, MCP tool names",
        body: "SecurityProfile.mcpToolPolicy matches JSON-RPC tools/call by params.name. defaultAction: deny means an unnamed tool does not run. That is the whitelist. tools/list and initialize pass through, so discovery still works. Rules are first match wins. An empty toolNames list matches every tool for that method. This governs egress tool calls, not the lifecycle API.",
      },
    ],
  },
  {
    id: 12,
    duration: "~1 minute",
    openingLine: "Pause keeps the same server. A checkpoint can start another one.",
    talkingPoints: [
      "Pause is one-to-one. Same sandbox id. Good for an idle user.",
      "Checkpoint briefly pauses, captures, and the source keeps running when keepRunning is true.",
      "One checkpoint clones into many sandboxes. That is how a later session, or a retry, starts.",
    ],
    transition: "The checkpoint is just a CRD.",
    deepDive: [
      {
        heading: "Pause, the laptop-sleep analogy",
        body: "Pause stops that sandbox. Resume wakes the same sandbox id. Use it when the user went idle and should come back to the same server. The relationship is one to one. You cannot hand the paused state to a different user as a fresh server, and you cannot fork it.",
      },
      {
        heading: "Checkpoint, the snapshot analogy",
        body: "A checkpoint briefly pauses the source, captures memory and filesystem, then lets the source keep running when keepRunning is true, which is the default. One Checkpoint can be cloned into many new sandboxes. Each clone gets a new id. The source id does not change. Use it for the next session, a retry after a dead node, or the Pod you create during an upgrade.",
      },
      {
        heading: "How the SDK names it",
        body: "The E2B SDK calls this a snapshot. create_snapshot() returns a snapshot id. That string is the Checkpoint object's name. Sandbox.create(template=that id) clones it. Pause is a different call and restores the same sandbox. If you mix the words on stage, the room will mix the behaviors.",
      },
    ],
  },
  {
    id: 13,
    duration: "~1 minute",
    openingLine: "Checkpoint stores the memory and the filesystem of that MCP server.",
    talkingPoints: [
      "podName is the sandbox Pod.",
      "persistentContents: memory and filesystem. Default is both.",
      "ttlAfterFinished garbage-collects the object. 30h in the example.",
      "kubectl get cp. Succeeded means you can clone it.",
    ],
    transition: "The warm server is still generic until we attach the user’s disk.",
    deepDive: [
      {
        heading: "Fields on the object",
        body: "kind Checkpoint, short name cp. spec.podName is the sandbox Pod to capture. spec.sandboxName is optional when the Pod name is not enough to find it. keepRunning defaults to true. If false, the source Pod goes to Succeeded after the capture. persistentContents accepts memory and filesystem. Empty means both. ttlAfterFinished is a Go duration such as 30h. Unset means the object lives until someone deletes it.",
      },
      {
        heading: "Status you can point at",
        body: "status.phase moves through Pending, Creating, Succeeded, Failed, and Terminating. Succeeded means the snapshot can be cloned. status.checkpointId is the id in the backing driver, filled once the phase succeeds. kubectl get cp is enough on stage. You do not need the driver internals.",
      },
      {
        heading: "Two writers, one object",
        body: "kubectl apply and the SDK's create_snapshot() write the same CR. Deleting a Checkpoint removes the Checkpoint CR and its paired SandboxTemplate. Existing sandboxes already cloned from it are not affected. Give checkpoints a TTL in production or the cluster fills with snapshots nobody will clone.",
      },
    ],
  },
  {
    id: 14,
    duration: "~90 seconds",
    openingLine: "The pool is identical for everyone. The volume is what makes the server Alice’s.",
    talkingPoints: [
      "dynamicVolumesMount on the SandboxClaim. One PV for her home, an optional read-only docs volume.",
      "The SandboxSet must enable the csi runtime. The CSI sidecar does the mount.",
      "This happens after the bind. It is not inside the 100ms.",
      "Resume remounts the same volumes.",
    ],
    transition: "Volumes are the user’s files. A checkpoint is the server’s memory and writable layer. You often want both.",
    deepDive: [
      {
        heading: "Why the volume is not in the pool",
        body: "Warm Pods are generic. If Alice's home directory were baked into the image or the pool template, every claim would see her files, or you could not pre-warm at all. dynamicVolumesMount on the SandboxClaim attaches her PV at claim time, at a path such as /home/alice. A second volume can be read-only shared docs via subPath.",
      },
      {
        heading: "What has to be installed",
        body: "The SandboxSet must list csi in its runtimes. The CSI sidecar does the on-demand mount. Claim docs also expect agent-runtime for the advanced claim path. Without csi, the claim cannot attach the volume. On the E2B path use e2b.agents.kruise.io/csi-volume-config as a JSON array (or the single-mount keys). Fields match the CRD: pvName, mountPath, subPath, readOnly. The separate E2B Volumes API is still Not Supported in the compatibility table — do not confuse the two.",
      },
      {
        heading: "Latency and resume",
        body: "The bind is the fast path. Publishing the volume is after it and adds latency. Mount only what that session needs. A paused sandbox remounts the same volumes when it wakes, so the user's files are still there. A Checkpoint is a different thing: it captures the server's memory and writable layer, not a substitute for the user's home PV. You often want both.",
      },
    ],
  },
  {
    id: 15,
    duration: "~45 seconds",
    openingLine: "Use the template when every server should start clean. Use a checkpoint when this user should continue.",
    talkingPoints: [
      "SandboxSet image: reproducible, warm, no one’s files.",
      "Checkpoint: whatever the tools actually did.",
      "A checkpoint can be the templateName of a later claim. It does not refill the blank warm pool.",
    ],
    transition: "Here is that claim.",
    deepDive: [
      {
        heading: "Two kinds of 'start from here'",
        body: "The SandboxSet template is a declaration: this image, this seccomp profile, no user's files. Every warm server starts the same way, which is why you can pre-create them. A Checkpoint is a recording of one run: packages that got installed, files that got written, and optionally memory. You cannot pre-warm those, because they do not exist until the user does the work.",
      },
      {
        heading: "Revisions",
        body: "A SandboxTemplate revision is immutable. Editing SandboxSet.spec.template does not mutate the old revision. It creates a new one, and the pool rolls toward it. A Checkpoint is also immutable in spirit: it is one moment. Deleting it does not delete clones that were already made. A checkpoint can be the templateName of a later claim. It does not refill the blank warm pool.",
      },
    ],
  },
  {
    id: 16,
    duration: "~1 minute",
    openingLine: "If templateName resolves to a Checkpoint, this is a clone, not a blank server from the pool.",
    talkingPoints: [
      "CRD: templateName: alice-tools-01.",
      "SDK: Sandbox.create(template=snap.snapshot_id).",
      "New sandbox id. Same memory and filesystem.",
    ],
    transition: "Cloning is a sequence, not a single API flag.",
    deepDive: [
      {
        heading: "How the controller chooses the path",
        body: "templateName usually names a SandboxSet, and you get a blank warm server. If a Checkpoint exists with that same name, the controller takes the clone path instead. On the slide that name is alice-tools-01. The SDK form is Sandbox.create(template=snap.snapshot_id). There is no separate 'please clone' flag. The name is the switch.",
      },
      {
        heading: "Identity changes",
        body: "The clone is a new Sandbox and a new Pod with a new id. The old Pod may already be gone, which is the point of the next story. Callers must store the checkpoint name. Do not assume the old sandbox id still routes through the gateway. Memory and filesystem come from the snapshot. The IP does not.",
      },
    ],
  },
  {
    id: 17,
    duration: "~1 minute",
    openingLine: "Restore creates a new Pod and fills it from the snapshot.",
    talkingPoints: [
      "The driver restores memory and filesystem.",
      "The controller waits until the sandbox is Running and agent-runtime is up.",
      "Env and mounts from the new claim are applied on top. A restored process does not magically see env you add later.",
      "How complete the memory restore is depends on the checkpoint driver and the node.",
    ],
    transition: "Put that sequence on a clock.",
    deepDive: [
      {
        heading: "The sequence",
        body: "sandbox-manager accepts the clone. The checkpoint driver restores memory and filesystem into a new Pod. The controller waits until the sandbox phase is Running and agent-runtime is listening on 49983. Then claim-time env and volume mounts are applied. A process that was already running inside the snapshot does not automatically see environment variables you add after the snapshot was taken.",
      },
      {
        heading: "What to concede if asked",
        body: "The CRD records an intent to persist memory and filesystem. Filesystem capture is the part you can describe confidently. Whether memory actually comes back depends on the checkpoint driver and the cluster. Say that before someone asks you which CRI or which snapshotter. Do not invent a driver name on stage.",
      },
    ],
  },
  {
    id: 18,
    duration: "~90 seconds",
    openingLine: "Alice claims a warm server, we snapshot her tools, the node dies, and the next claim is the checkpoint.",
    talkingPoints: [
      "T+0: warm bind, then her home volume.",
      "T+8 min: snapshot, server keeps running.",
      "Node gone: without the checkpoint the package install is gone.",
      "Next claim uses templateName alice-tools-01. New Pod, same tool state.",
    ],
    transition: "The same handoff is how you upgrade the server.",
    deepDive: [
      {
        heading: "Tell it as one person",
        body: "T+0: Alice's SandboxClaim binds a warm server. That part is the under-100ms path. Then her home volume mounts at /home/alice, which is extra. She installs a package and writes files. T+8 min: create_snapshot() writes alice-tools-01 and the server keeps running because keepRunning defaults to true. The node disappears. Without the checkpoint, the package install is gone. The next claim sets templateName to alice-tools-01, so it is a clone. New Pod, new sandbox id, same tool state.",
      },
      {
        heading: "Numbers you must not invent",
        body: "Do not quote a benchmark for the restore. Do not say the whole story is 100ms. The 100ms is only the first bind, before the volume publish. The restore is a new Pod, so it pays start-up again, minus the work she would otherwise redo. If a question adds the two times, separate them.",
      },
      {
        heading: "Why this slide exists",
        body: "The abstract says checkpoint and restore preserve tool state across session boundaries. This is that sentence with a user in it. The next section uses the same motion for an upgrade: snapshot, throw the Pod away, start from the snapshot on the new image.",
      },
    ],
  },
  {
    id: 19,
    duration: "~90 seconds",
    openingLine: "Idle servers and live sessions are different upgrades.",
    talkingPoints: [
      "Patch SandboxSet.spec.template. Only unclaimed servers roll.",
      "A claimed session stays on the old image until you touch it.",
      "SandboxUpdateOps Recreate for an MCP image bump. Checkpoint first, then restore. The IP changes.",
      "Hooks are PreUpgrade, recreate, PostUpgrade. CheckpointRestore mode cannot change the business image.",
    ],
    transition: "You still should not hand a new user the old image while the pool is mid-roll.",
    deepDive: [
      {
        heading: "Idle pool",
        body: "Change the image under SandboxSet.spec.template with a patch (kubectl patch or kubectl edit). Do not full-object Update or kubectl replace on a busy SandboxSet — the controller writes status constantly and you will hit 409 conflicts. Scale replicas through the scale subresource (kubectl scale sbs), not a full update. The controller hashes the template into a new updateRevision, deletes old idle sandboxes in batches, and creates new ones. maxUnavailable defaults to 20 percent. Claimed sandboxes are not touched.",
      },
      {
        heading: "Live session",
        body: "SandboxUpdateOps selects claimed sandboxes. Default mode is Recreate: delete the old Pod, create a new one, lose rootfs/memory/IP unless you restored them. CheckpointRestore mode (v0.6.0+) preserves filesystem across the upgrade but cannot change the business container image — only sidecars or non-image fields. For an MCP server image bump, use Recreate: checkpoint first, recreate, then claim/clone from that Checkpoint. Only one SandboxUpdateOps may actively update a namespace at a time.",
      },
      {
        heading: "Hooks, if you are not using a full checkpoint",
        body: "The lifecycle is PreUpgrade (before the old Pod is deleted), then the Pod is replaced, then PostUpgrade (after the new Pod is ready). PreUpgrade can tar the workspace onto shared storage. PostUpgrade unpacks it. Hooks need agent-runtime. CSI is only required if that backup path uses a volume. Available since v0.3.0. A Checkpoint is the stronger version of the same idea, because it can include memory, not only a tarball.",
      },
    ],
  },
  {
    id: 20,
    duration: "~1 minute",
    openingLine: "updatedAvailableReplicas tells you when the spare pool is actually on the new image.",
    talkingPoints: [
      "kubectl get sbs -o wide. UPDATEREVISION is the template hash.",
      "Do not send new sessions at the pool until updated available matches replicas.",
      "For a live session, PreUpgrade backs the workspace up, the Pod is replaced, PostUpgrade restores it.",
    ],
    transition: "Those four ideas are the ones worth writing down.",
    deepDive: [
      {
        heading: "How to read kubectl get sbs -o wide",
        body: "REPLICAS is the spare target. AVAILABLE is claimable right now, and during a roll that can include old servers. UPDATEDREPLICAS and UPDATEDAVAILABLEREPLICAS count only the new revision. UPDATEREVISION is the template hash. The roll is done for new users when the updated available count matches replicas.",
      },
      {
        heading: "The mistake this slide prevents",
        body: "If you claim as soon as availableReplicas is non-zero, you can hand a new user the MCP image you are trying to retire. Gate new claims on the updated available count, not on the raw available count. Old idle servers are replaced first. Scale-down also prefers old revisions.",
      },
      {
        heading: "Live session, restated",
        body: "PreUpgrade runs while the old Pod still exists, so that is when you snapshot or tar. Then the Pod is replaced. PostUpgrade runs on the new Pod. Say the order out loud if you demo it. Reversing it means the backup runs after the files are already gone.",
      },
    ],
  },
  {
    id: 21,
    duration: "~1 minute",
    openingLine: "Four patterns. You can copy them without adopting the whole project.",
    talkingPoints: [
      "Keep a warm buffer and alert when it hits zero.",
      "Bind, don’t boot. Volumes and image changes are extra latency.",
      "Snapshot before the user leaves and before an upgrade. Give checkpoints a TTL.",
      "Roll idle servers freely. Checkpoint a live session before you recreate it.",
    ],
    transition: "That is the whole session.",
    deepDive: [
      {
        heading: "Pattern 1, warm buffer",
        body: "Keep availableReplicas above the burst you actually see. Alert at zero. replicas does not include live sessions, so the alert is about spares, not about how many users are online. Scale the pool down when the agents go quiet. This is the cost lever.",
      },
      {
        heading: "Pattern 2, bind don’t boot",
        body: "The fast path is claiming a server that is already up. Anything you do after the bind, especially a volume publish or an image pull, is extra latency and should be budgeted separately. One claim per user. Never reuse a live server across users. Set claimTimeout so an empty pool cannot hang the request forever.",
      },
      {
        heading: "Pattern 3, save tool state",
        body: "Snapshot before the user leaves and before an upgrade. Persist memory and filesystem, and be honest that filesystem is the reliable demo. The SDK snapshot id is the Checkpoint name. Set ttlAfterFinished so snapshots do not accumulate.",
      },
      {
        heading: "Pattern 4, hand off upgrades",
        body: "Roll idle servers by editing the SandboxSet template. Leave claimed sessions on the old image until you checkpoint them. Recreate with SandboxUpdateOps only after that checkpoint exists, then restore. New sessions wait until the warm pool's updated available count matches the desired replicas.",
      },
    ],
  },
  {
    id: 22,
    duration: "~40 seconds",
    openingLine: "Pool the server. Isolate the session. Checkpoint before you throw the Pod away.",
    talkingPoints: [
      "GitHub: github.com/openkruise/agents",
      "Docs: openkruise.io/kruiseagents",
      "Slack: #openkruise on the Kubernetes Slack",
      "Questions.",
    ],
    transition: "Thank you.",
    deepDive: [
      {
        heading: "The close, word for word",
        body: "Pool the server. Isolate the session. Checkpoint before you throw the Pod away. Then put the links up and stop. GitHub is github.com/openkruise/agents. Docs are openkruise.io/kruiseagents. Slack is #openkruise on the Kubernetes Slack. Do not add a new idea on this slide.",
      },
      {
        heading: "Questions you should expect",
        body: "Is 100ms the whole session start? No — abstract target for a warm bind; docs say sub-second when the pool has stock. Volumes and restores are extra. Is it a Kubernetes Namespace per user? No, Linux namespaces on the Pod. Does the controller add seccomp? No, you put RuntimeDefault on the SandboxSet template. Is sandbox-manager the MCP tool server? No. Does memory always restore? The CRD asks for it; the driver decides. Can CheckpointRestore change the MCP image? No — use Recreate and restore from a Checkpoint. Can I roll a live session with the pool? No.",
      },
      {
        heading: "Room, if someone asks after",
        body: "12 November 2026, 3:30–4:00 pm, Hyatt Regency, Level 2, Salt Lake Ballroom DE. Repeat your names: Harkirat Singh and Hrittik Roy.",
      },
    ],
  },
];
