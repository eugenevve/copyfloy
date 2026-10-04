import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { ClockIcon, FileIcon, FolderIcon, PenIcon, PlayIcon, TrashIcon } from "@app/ui/Icons";
import { LabelChip } from "@app/ui/LabelChip";
import { ITaskItem, TaskType } from "@shared/types/tasks";
import type { FC } from "react";

import styles from "./TaskItem.module.css";

const TYPE_ICONS = {
  [TaskType.FOLDER]: FolderIcon,
  [TaskType.FILE]: FileIcon,
};

export const TaskItem: FC<ITaskItem> = ({ task, labels, onRun, onEdit, onSchedule, onDelete }) => {
  const TypeIcon = TYPE_ICONS[task.type];

  const items = [
    { Icon: PlayIcon, onClick: onRun },
    { Icon: ClockIcon, onClick: onSchedule },
    { Icon: PenIcon, onClick: onEdit },
    { Icon: TrashIcon, onClick: onDelete },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.info}>
          <div className={styles.section}>
            <TypeIcon className={styles.icon} />
            <div>{task.name}</div>
          </div>
          <div className={styles.source}>{task.source}</div>
        </div>
        {labels.length > 0 && (
          <div className={styles.labels}>
            {labels.map((label) => (
              <LabelChip key={label.id} name={label.name} color={label.color} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.section}>
        {items.map(({ Icon, ...props }) => (
          <Button key={props.onClick.toString()} kind={ButtonKind.PRIMARY} icon {...props}>
            <Icon />
          </Button>
        ))}
      </div>
    </div>
  );
};
