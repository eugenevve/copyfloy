import { ModalContext } from "@app/components/ModalProvider/ModalContext";
import { useContext } from "react";

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
