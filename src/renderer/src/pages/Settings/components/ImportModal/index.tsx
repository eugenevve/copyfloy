import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { Modal } from "@app/ui/Modal";
import { ImportMode } from "@shared/types/transfer";
import { FC } from "react";

import styles from "./ImportModal.module.css";
import { IImportModal } from "./ImportModal.types";

export const ImportModal: FC<IImportModal> = ({ onClose }) => {
  const { showAlert } = useModal();

  const handleImport = async (mode: ImportMode): Promise<void> => {
    try {
      const transfer = await window.api.tasks.import();
      if (!transfer) {
        return;
      }

      await window.api.tasks.saveBulk(transfer, mode);
      onClose();
    } catch {
      showAlert("Import error", "The selected file is invalid or has an incorrect format!");
    }
  };

  return (
    <Modal title="Import tasks and labels" onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.title}>How do you want to process the imported tasks?</div>
        <div className={styles.section}>
          <Button onClick={() => void handleImport(ImportMode.ADD)}>Add to current ones</Button>
          <Button onClick={() => void handleImport(ImportMode.REPLACE)}>Replace current ones</Button>
        </div>
      </div>
    </Modal>
  );
};
