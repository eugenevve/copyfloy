import { ReactNode } from "react";

export interface IModal {
  title: string;
  onClose: () => void;
  width?: number;
  children: ReactNode;
}
