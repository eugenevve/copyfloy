import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { FileIcon, FolderIcon } from "@app/ui/Icons";
import { Modal } from "@app/ui/Modal";
import { TaskType } from "@shared/types/tasks";
import { FC } from "react";

import styles from "./ExceptionChoiceModal.module.css";
import { IExceptionChoiceModal } from "./ExceptionChoiceModal.types";

export const ExceptionChoiceModal: FC<IExceptionChoiceModal> = ({ onClose, onSelect }) => {
  const items = [
    {
      type: TaskType.FOLDER,
      icon: <FolderIcon />,
      label: "Folder",
    },
    {
      type: TaskType.FILE,
      icon: <FileIcon />,
      label: "File",
    },
  ];

  return (
    <Modal title="What should be added to the exceptions?" onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.description}>Select the type of object to exclude from the copying process.</div>
        <div className={styles.buttons}>
          {items.map(({ type, icon, label }) => (
            <Button key={type} kind={ButtonKind.SECONDARY} className={styles.button} onClick={() => onSelect(type)}>
              {icon}
              {label}
            </Button>
          ))}
        </div>
        <Button kind={ButtonKind.SECONDARY} onClick={onClose} className={styles.cancelButton}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
