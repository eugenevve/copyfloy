import { CloneIcon } from "@app/ui/Icons";
import { NoData } from "@app/ui/NoData";
import type { FC } from "react";

import { TaskItem } from "../TaskItem";
import styles from "./TaskList.module.css";
import { ITaskList } from "./TaskList.types";

export const TaskList: FC<ITaskList> = ({ items, labels, onRun, onSchedule, onEdit, onDelete }) => {
  if (items.length === 0) {
    return <NoData title="No tasks" icon={<CloneIcon />} />;
  }

  return (
    <div className={styles.container}>
      {items.toReversed().map((item) => (
        <TaskItem
          key={item.id}
          task={item}
          labels={labels.filter((label) => item.labelsIds?.includes(label.id))}
          onRun={() => onRun(item)}
          onSchedule={() => onSchedule(item)}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ))}
    </div>
  );
};
