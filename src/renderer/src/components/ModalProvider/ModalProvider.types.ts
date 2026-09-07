import { ReactNode } from "react";

export interface IModalProvider {
  children: ReactNode;
}

export interface IModalContext {
  showAlert: (title: string, description: string) => void;
  showConfirm: (title: string, description: string, onConfirm: ConfirmCallback) => void;
}

export interface ModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm?: ConfirmCallback;
}

type ConfirmCallback = () => void | Promise<void>;
