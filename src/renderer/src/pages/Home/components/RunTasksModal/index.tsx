import { Button } from "@app/ui/Button";
import { Modal } from "@app/ui/Modal";
import { FC } from "react";

import styles from "./RunTasksModal.module.css";
import { IRunTasksModal } from "./RunTasksModal.types";

export const RunTasksModal: FC<IRunTasksModal> = ({ allTasks, matchingTasks, onClose, onRun }) => {
  return (
    <Modal title="Run tasks" onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.title}>Choose which tasks to run:</div>
        <div className={styles.section}>
          <Button onClick={() => onRun(allTasks)}>Run all tasks ({allTasks.length})</Button>
          <Button onClick={() => onRun(matchingTasks)} disabled={matchingTasks.length === 0}>
            Run tasks matching current filters ({matchingTasks.length})
          </Button>
        </div>
      </div>
    </Modal>
  );
};
