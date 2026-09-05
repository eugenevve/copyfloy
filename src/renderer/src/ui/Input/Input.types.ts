import { InputHTMLAttributes, ReactNode } from "react";

export type IInput = InputHTMLAttributes<HTMLInputElement> & (InputWithIcon | InputWithoutIcon);

type InputWithIcon = {
  icon: ReactNode;
  onClick: () => void;
};

type InputWithoutIcon = {
  icon?: never;
  onClick?: never;
};
