import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { Modal } from "@app/ui/Modal";
import { FC } from "react";

import styles from "./ImportModal.module.css";
import { IImportModal, ModeImport } from "./ImportModal.types";

export const ImportModal: FC<IImportModal> = ({ onClose }) => {
  const { showAlert } = useModal();

  const handleImport = async (mode: ModeImport): Promise<void> => {
    try {
      const importedTasks = await window.api.tasks.import();
      if (!importedTasks) {
        return;
      }

      const tasks = mode === ModeImport.ADD ? [...(await window.api.tasks.get()), ...importedTasks] : importedTasks;

      await window.api.tasks.saveBulk(tasks);
      onClose();
    } catch {
      showAlert("Import error", "The selected file is invalid or has an incorrect format!");
    }
  };

  return (
    <Modal title="Import tasks" onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.title}>How do you want to process the imported tasks?</div>
        <div className={styles.section}>
          <Button onClick={() => void handleImport(ModeImport.ADD)}>Add to current ones</Button>
          <Button onClick={() => void handleImport(ModeImport.REPLACE)}>Replace current ones</Button>
        </div>
      </div>
    </Modal>
  );
};
