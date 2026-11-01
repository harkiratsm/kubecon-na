import type { ComponentType } from "react";
import type { SlideVariant } from "@/components/brand/KubeConFrame";
import { Slide01Title } from "@/slides/Slide01Title";
import { Slide02AgentWorkload } from "@/slides/Slide02AgentWorkload";
import { Slide03Requirements } from "@/slides/Slide03Requirements";
import { Slide04NaiveK8sFails } from "@/slides/Slide04NaiveK8sFails";
import { Slide05SystemMap } from "@/slides/Slide05SystemMap";
import { Slide06DualAPI } from "@/slides/Slide06DualAPI";
import { Slide07WarmPools } from "@/slides/Slide07WarmPools";
import { Slide08SandboxSet } from "@/slides/Slide08SandboxSet";
import { Slide09ClaimReplenish } from "@/slides/Slide09ClaimReplenish";
import { Slide10SandboxClaim } from "@/slides/Slide10SandboxClaim";
import { Slide11ReconcileStorms } from "@/slides/Slide11ReconcileStorms";
import { Slide12PauseVsCheckpoint } from "@/slides/Slide12PauseVsCheckpoint";
import { Slide13CheckpointCRD } from "@/slides/Slide13CheckpointCRD";
import { Slide14CreatingCheckpoints } from "@/slides/Slide14CreatingCheckpoints";
import { Slide15TemplateVsCheckpoint } from "@/slides/Slide15TemplateVsCheckpoint";
import { Slide16ClonePath } from "@/slides/Slide16ClonePath";
import { Slide17RehydrationSteps } from "@/slides/Slide17RehydrationSteps";
import { Slide18FailureStory } from "@/slides/Slide18FailureStory";
import { Slide19UpgradeSurfaces } from "@/slides/Slide19UpgradeSurfaces";
import { Slide20RevisionGating } from "@/slides/Slide20RevisionGating";
import { Slide21Patterns } from "@/slides/Slide21Patterns";
import { Slide22Takeaways } from "@/slides/Slide22Takeaways";

export interface SlideEntry {
  id: number;
  title: string;
  section: string;
  variant: SlideVariant;
  component: ComponentType;
}

export const SLIDES: SlideEntry[] = [
  {
    id: 1,
    title: "Running MCP Servers at Scale",
    section: "Intro",
    variant: "title",
    component: Slide01Title,
  },
  {
    id: 2,
    title: "What we mean by an MCP server",
    section: "Context",
    variant: "content",
    component: Slide02AgentWorkload,
  },
  {
    id: 3,
    title: "Three production questions",
    section: "Problem",
    variant: "content",
    component: Slide03Requirements,
  },
  {
    id: 4,
    title: "Why a Deployment is the wrong shape",
    section: "Problem",
    variant: "content",
    component: Slide04NaiveK8sFails,
  },
  {
    id: 5,
    title: "Where the MCP server actually runs",
    section: "Architecture",
    variant: "content",
    component: Slide05SystemMap,
  },
  {
    id: 6,
    title: "CRDs for the platform, a claim for the session",
    section: "Architecture",
    variant: "content",
    component: Slide06DualAPI,
  },
  {
    id: 7,
    title: "Boot before the user arrives",
    section: "Warm Pool",
    variant: "content",
    component: Slide07WarmPools,
  },
  {
    id: 8,
    title: "SandboxSet pre-warms the server",
    section: "Warm Pool",
    variant: "content",
    component: Slide08SandboxSet,
  },
  {
    id: 9,
    title: "Claim one, warm the next",
    section: "Warm Pool",
    variant: "content",
    component: Slide09ClaimReplenish,
  },
  {
    id: 10,
    title: "SandboxClaim binds the session",
    section: "SandboxClaim",
    variant: "content",
    component: Slide10SandboxClaim,
  },
  {
    id: 11,
    title: "Namespaces, seccomp, and tool allowlists",
    section: "Isolation",
    variant: "content",
    component: Slide11ReconcileStorms,
  },
  {
    id: 12,
    title: "Pause versus checkpoint",
    section: "Checkpoint",
    variant: "content",
    component: Slide12PauseVsCheckpoint,
  },
  {
    id: 13,
    title: "Checkpoint is the tool state",
    section: "Checkpoint",
    variant: "content",
    component: Slide13CheckpointCRD,
  },
  {
    id: 14,
    title: "Per-user volumes at claim time",
    section: "Data",
    variant: "content",
    component: Slide14CreatingCheckpoints,
  },
  {
    id: 15,
    title: "Fresh image versus saved session",
    section: "Checkpoint",
    variant: "content",
    component: Slide15TemplateVsCheckpoint,
  },
  {
    id: 16,
    title: "Claim the checkpoint, not a blank server",
    section: "Rehydration",
    variant: "content",
    component: Slide16ClonePath,
  },
  {
    id: 17,
    title: "Restore onto a new Pod",
    section: "Rehydration",
    variant: "content",
    component: Slide17RehydrationSteps,
  },
  {
    id: 18,
    title: "Alice’s session survives the node",
    section: "Rehydration",
    variant: "content",
    component: Slide18FailureStory,
  },
  {
    id: 19,
    title: "Upgrade the server, keep the session",
    section: "Upgrades",
    variant: "content",
    component: Slide19UpgradeSurfaces,
  },
  {
    id: 20,
    title: "Serve the new image only when the pool is ready",
    section: "Upgrades",
    variant: "content",
    component: Slide20RevisionGating,
  },
  {
    id: 21,
    title: "Four patterns to reuse",
    section: "Takeaways",
    variant: "content",
    component: Slide21Patterns,
  },
  {
    id: 22,
    title: "Takeaways and where to go next",
    section: "Takeaways",
    variant: "content",
    component: Slide22Takeaways,
  },
];
