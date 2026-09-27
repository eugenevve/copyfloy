import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { FC } from "react";

import styles from "./TaskTransfer.module.css";
import { WidgetContainer } from "../WidgetContainer";

export const TaskTransfer: FC = () => {
  const { showAlert } = useModal();

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
        </div>
      </WidgetContainer>
    </>
  );
};
