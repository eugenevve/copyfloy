import type { ButtonHTMLAttributes } from "react";

export interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  icon?: boolean;
}

export enum ButtonKind {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}
