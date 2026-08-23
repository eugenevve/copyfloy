import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  className?: string;
  children: ReactNode;
  icon?: boolean;
}

export enum ButtonKind {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}
