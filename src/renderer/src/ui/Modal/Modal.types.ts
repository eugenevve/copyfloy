import { ReactNode } from "react";

export interface IModal {
  title: string;
  onClose: () => void;
  width?: string | number;
  children: ReactNode;
  showCloseButton?: boolean;
}
