import { useEscapeKey } from "@app/hooks/useEscapeKey";
import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { FC } from "react";

import styles from "./ModalAlert.module.css";
import { IModalAlert } from "./ModalAlert.types";

export const ModalAlert: FC<IModalAlert> = ({
  isOpen,
  title,
  description,
  onClose,
  onConfirm,
  confirmTitle = "Ok",
  cancelTitle = "Cancel",
}) => {
  useEscapeKey(onClose);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.title}>{title}</div>
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
      </div>
    </div>
  );
};
