import { NoData } from "@app/ui/NoData";
import type { FC } from "react";

import { TaskItem } from "../TaskItem";
import styles from "./TaskList.module.css";
import { ITaskList } from "./TaskList.types";

export const TaskList: FC<ITaskList> = ({ items, onRun, onSchedule, onEdit, onDelete }) => {
  if (items.length === 0) {
    return <NoData title="No tasks" />;
  }

  return (
    <div className={styles.container}>
      {items.toReversed().map((item) => (
        <TaskItem
          key={item.id}
          task={item}
          onRun={() => onRun(item)}
          onSchedule={() => onSchedule(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </div>
  );
};
