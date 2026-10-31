import type { ReactNode } from "react";

export interface ITooltip {
  content?: string;
  placement?: TooltipPlacement;
  children: ReactNode;
}

export enum TooltipPlacement {
  TOP = "top",
  BOTTOM = "bottom",
  LEFT = "left",
  RIGHT = "right",
}
