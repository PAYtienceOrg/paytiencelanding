import type { ComponentType } from "react";
import { MotionPreview } from "@/components/motion/MotionPreview";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Simulator } from "@/components/simulator/Simulator";

// 名字 -> 预览组件。后面的卡把自己的组件加进来。
export const registry: Record<string, ComponentType> = {
  motion: MotionPreview,
  "how-it-works": HowItWorks,
  simulator: Simulator,
};
