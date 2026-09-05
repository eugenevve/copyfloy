import { useEscapeKey } from "@app/hooks/useEscapeKey";
import { FC } from "react";

import styles from "./Modal.module.css";
import { IModal } from "./Modal.types";
import { Button } from "../Button";
import { ButtonKind } from "../Button/Button.types";
import { XmarkIcon } from "../Icons";

export const Modal: FC<IModal> = ({ title, width, onClose, children }) => {
  useEscapeKey(onClose);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} style={{ width: width }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <Button kind={ButtonKind.SECONDARY} onClick={onClose} icon>
            <XmarkIcon />
          </Button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};
