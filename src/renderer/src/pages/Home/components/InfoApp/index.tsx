import { FC, useEffect, useState } from "react";

export const InfoApp: FC = () => {
  const [tasksCount, setTasksCount] = useState(0);

  useEffect(() => {
    void window.api.tasks.get().then((tasks) => {
      setTasksCount(tasks.length);
    });
  }, []);

  return <div>Tasks: {tasksCount}</div>;
};
