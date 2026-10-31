import { TooltipPlacement } from "@app/ui/Tooltip/Tooltip.types";
import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ITilebarButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  kind?: TilebarButtonKind;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
}

export enum TilebarButtonKind {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}
