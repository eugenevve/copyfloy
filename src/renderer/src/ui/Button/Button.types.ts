import { Property } from "csstype";
import type { ButtonHTMLAttributes } from "react";

import type { TooltipPlacement } from "../Tooltip/Tooltip.types";

export interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  icon?: boolean;
  position?: Property.JustifyContent;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
}

export enum ButtonKind {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}
