import { InputHTMLAttributes } from "react";

import { TooltipPlacement } from "../Tooltip/Tooltip.types";

export interface ICheckbox extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
}
