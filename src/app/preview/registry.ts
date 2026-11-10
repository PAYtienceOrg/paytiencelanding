import type { ComponentType } from "react";
import { MotionPreview } from "@/components/motion/MotionPreview";
import { PriceChartPreview } from "@/components/PriceChart";

// 名字 -> 预览组件。后面的卡把自己的组件加进来。
export const registry: Record<string, ComponentType> = {
  motion: MotionPreview,
  "price-chart": PriceChartPreview,
};
