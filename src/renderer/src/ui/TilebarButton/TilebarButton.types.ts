import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ITilebarButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  kind?: TilebarButtonKind;
}

export enum TilebarButtonKind {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}
