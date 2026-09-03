import { InputHTMLAttributes, ReactNode } from "react";

export interface IInput extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}
