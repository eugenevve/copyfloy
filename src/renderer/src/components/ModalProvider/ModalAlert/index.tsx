import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { Modal } from "@app/ui/Modal";
import { FC } from "react";

import styles from "./ModalAlert.module.css";
import { IModalAlert } from "./ModalAlert.types";

export const ModalAlert: FC<IModalAlert> = ({
  title,
  description,
  onClose,
  onConfirm,
  confirmTitle = "Ok",
  cancelTitle = "Cancel",
}) => {
  return (
    <Modal title={title} onClose={onClose} showCloseButton={false}>
      <div className={styles.description}>{description}</div>
      <div className={styles.buttons}>
        {onConfirm ? (
          <>
            <Button kind={ButtonKind.SECONDARY} onClick={onClose}>
              {cancelTitle}
            </Button>
            <Button
              onClick={() => {
                void onConfirm();
              }}
            >
              {confirmTitle}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>{confirmTitle}</Button>
        )}
      </div>
    </Modal>
  );
};
