import { Property } from "csstype";
import type { ButtonHTMLAttributes } from "react";

export interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: ButtonKind;
  icon?: boolean;
  position?: Property.JustifyContent;
}

export enum ButtonKind {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}
