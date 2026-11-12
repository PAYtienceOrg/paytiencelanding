import type { ComponentType } from "react";
import { MotionPreview } from "@/components/motion/MotionPreview";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Simulator } from "@/components/simulator/Simulator";

// Name -> preview component. Add new components here to preview them.
export const registry: Record<string, ComponentType> = {
  motion: MotionPreview,
  "how-it-works": HowItWorks,
  simulator: Simulator,
};
