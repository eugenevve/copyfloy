import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { DragButton } from "@app/ui/DragButton";
import { ClockIcon, FileIcon, FolderIcon, PenIcon, PinIcon, PlayIcon, TrashIcon } from "@app/ui/Icons";
import { LabelChip } from "@app/ui/LabelChip";
import { classNames } from "@app/utils/classNames";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ITaskItem, TaskType } from "@shared/types/tasks";
import type { CSSProperties, FC } from "react";

import styles from "./TaskItem.module.css";

const TYPE_ICONS = {
  [TaskType.FOLDER]: FolderIcon,
  [TaskType.FILE]: FileIcon,
};

export const TaskItem: FC<ITaskItem> = ({
  task,
  labels,
  reorder,
  dimmed,
  onRun,
  onEdit,
  onSchedule,
  onDelete,
  onPin,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !reorder,
  });
  const sortableStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : "",
  };

  const TypeIcon = TYPE_ICONS[task.type];

  const items = [
    { Icon: PlayIcon, onClick: onRun },
    { Icon: ClockIcon, onClick: onSchedule },
    { Icon: PenIcon, onClick: onEdit },
    { Icon: TrashIcon, onClick: onDelete },
  ];

  return (
    <div ref={setNodeRef} className={classNames(styles.container, dimmed ? styles.dimmed : "")} style={sortableStyle}>
      <div className={styles.section}>
        {reorder && <DragButton {...attributes} {...listeners} />}
        <div className={styles.content}>
          <div className={styles.info}>
            <div className={styles.section}>
              <TypeIcon className={styles.icon} />
              <div>{task.name}</div>
              <Button kind={ButtonKind.SECONDARY} icon className={styles.pinButton} onClick={onPin}>
                <PinIcon className={task.isPinned ? "" : styles.iconPin} />
              </Button>
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
