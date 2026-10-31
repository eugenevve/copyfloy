import { ITask } from "@shared/types/tasks";
import { FC, useEffect, useState } from "react";

import { ModalAlert } from "../ModalProvider/ModalAlert";

// Shows tasks skipped while the app was closed, one by one
export const MissedTasksPrompt: FC = () => {
  const [queue, setQueue] = useState<ITask[]>([]);

  useEffect(() => {
    void window.api.tasks.getMissed().then(setQueue);
  }, []);

  const [task] = queue;

  if (!task) {
    return null;
  }

  const next = (): void => setQueue((prev) => prev.slice(1));

  return (
    <ModalAlert
      key={task.id}
      title="Task skipped"
      description={`Task "${task.name}" was not executed on schedule because the application was not running. Run it now?`}
      confirmTitle="Run now"
      cancelTitle="Skip"
      onClose={() => {
        void window.api.tasks.dismissMissed(task.id);
        next();
      }}
      onConfirm={() => {
        void window.api.tasks.dismissMissed(task.id);
        void window.api.tasks.run(task);
        next();
      }}
    />
  );
};
