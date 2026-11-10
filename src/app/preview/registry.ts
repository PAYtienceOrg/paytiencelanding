import type { ComponentType } from "react";

// 名字 -> 预览组件。后面的卡把自己的组件加进来。
export const registry: Record<string, ComponentType> = {};
