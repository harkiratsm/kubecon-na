import type { ComponentType } from "react";
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
  component: ComponentType;
}

export const SLIDES: SlideEntry[] = [
  {
    id: 1,
    title: "Checkpoint-Backed Warm Pools for Agentic AI Workloads on Kubernetes",
    section: "Intro",
    component: Slide01Title,
  },
  {
    id: 2,
    title: "What is an Agentic Workload?",
    section: "Context",
    component: Slide02AgentWorkload,
  },
  {
    id: 3,
    title: "Three Hard Requirements",
    section: "Problem Space",
    component: Slide03Requirements,
  },
  {
    id: 4,
    title: "Why Naive Kubernetes Fails Here",
    section: "Problem",
    component: Slide04NaiveK8sFails,
  },
  {
    id: 5,
    title: "OpenKruise Agents — System Map",
    section: "Architecture",
    component: Slide05SystemMap,
  },
  {
    id: 6,
    title: "Dual API Surface",
    section: "Architecture",
    component: Slide06DualAPI,
  },
  {
    id: 7,
    title: "Why Warm Pools?",
    section: "Warm Pool",
    component: Slide07WarmPools,
  },
  {
    id: 8,
    title: "SandboxSet — The Pool Controller",
    section: "Warm Pool",
    component: Slide08SandboxSet,
  },
  {
    id: 9,
    title: "Claim & Replenish Loop",
    section: "Warm Pool",
    component: Slide09ClaimReplenish,
  },
  {
    id: 10,
    title: "SandboxClaim — Declarative Claiming",
    section: "SandboxClaim",
    component: Slide10SandboxClaim,
  },
  {
    id: 11,
    title: "Avoiding Reconcile Storms",
    section: "SandboxClaim",
    component: Slide11ReconcileStorms,
  },
  {
    id: 12,
    title: "Pause vs Checkpoint",
    section: "Checkpoint",
    component: Slide12PauseVsCheckpoint,
  },
  {
    id: 13,
    title: "Checkpoint CRD",
    section: "Checkpoint",
    component: Slide13CheckpointCRD,
  },
  {
    id: 14,
    title: "Creating Checkpoints — Two Interfaces",
    section: "Checkpoint",
    component: Slide14CreatingCheckpoints,
  },
  {
    id: 15,
    title: "Template vs Checkpoint",
    section: "Checkpoint",
    component: Slide15TemplateVsCheckpoint,
  },
  {
    id: 16,
    title: "Rehydration — Clone Path",
    section: "Rehydration",
    component: Slide16ClonePath,
  },
  {
    id: 17,
    title: "Rehydration — 4-Step Flow",
    section: "Rehydration",
    component: Slide17RehydrationSteps,
  },
  {
    id: 18,
    title: "Failure & Recovery — Concrete Scenario",
    section: "Rehydration",
    component: Slide18FailureStory,
  },
  {
    id: 19,
    title: "Two Upgrade Surfaces",
    section: "Upgrades",
    component: Slide19UpgradeSurfaces,
  },
  {
    id: 20,
    title: "Revision Gating & Completion Tracking",
    section: "Upgrades",
    component: Slide20RevisionGating,
  },
  {
    id: 21,
    title: "Four Reusable Control-Loop Patterns",
    section: "Takeaways",
    component: Slide21Patterns,
  },
  {
    id: 22,
    title: "Key Takeaways",
    section: "Takeaways",
    component: Slide22Takeaways,
  },
];
