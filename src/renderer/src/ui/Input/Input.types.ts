import { InputHTMLAttributes, ReactNode } from "react";

export type IInput = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
} & (
    | {
        icon: ReactNode;
        onClick: () => void;
      }
    | {
        icon?: never;
        onClick?: never;
      }
  );
