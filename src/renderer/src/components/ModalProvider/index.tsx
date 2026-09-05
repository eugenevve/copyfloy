import { useState, FC } from "react";

import { ModalAlert } from "./ModalAlert";
import { ModalContext } from "./ModalContext";
import { IModalProvider, ModalConfig } from "./ModalProvider.types";

export const ModalProvider: FC<IModalProvider> = ({ children }) => {
  const [config, setConfig] = useState<ModalConfig>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: undefined,
  });

  const close = () => setConfig((prev) => ({ ...prev, isOpen: false }));

  const handleConfirm = async () => {
    if (config.onConfirm) {
      await config.onConfirm();
    }
    close();
  };

  const showAlert = (title: string, description: string) => {
    setConfig({ isOpen: true, title, description, onConfirm: undefined });
  };

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfig({ isOpen: true, title, description, onConfirm });
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <ModalAlert
        isOpen={config.isOpen}
        title={config.title}
        description={config.description}
        onClose={close}
        onConfirm={config.onConfirm ? handleConfirm : undefined}
      />
    </ModalContext.Provider>
  );
};
