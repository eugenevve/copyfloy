import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { FC, useState } from "react";

import styles from "./TaskTransfer.module.css";
import { ImportModal } from "../ImportModal";
import { WidgetContainer } from "../WidgetContainer";

export const TaskTransfer: FC = () => {
  const { showAlert } = useModal();
  const [isOpenImport, setOpenImport] = useState(false);

  const handleExport = async () => {
    try {
      await window.api.tasks.export();
    } catch {
      showAlert("Error", "Failed to export tasks!");
    }
  };

  return (
    <>
      <WidgetContainer title="Save or restore tasks">
        <div className={styles.container}>
          <Button onClick={() => void handleExport()}>Export</Button>
          <Button onClick={() => setOpenImport(true)}>Import</Button>
        </div>
      </WidgetContainer>
      {isOpenImport && <ImportModal onClose={() => setOpenImport(false)} />}
    </>
  );
};
