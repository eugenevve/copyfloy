export interface IModalAlert {
  isOpen: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;
  confirmTitle?: string;
  cancelTitle?: string;
}
