import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { DragButton } from "@app/ui/DragButton";
import {
  ArrowTurnIcon,
  BranchIcon,
  ClockIcon,
  FileIcon,
  FolderIcon,
  PenIcon,
  PinIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
} from "@app/ui/Icons";
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
  [TaskType.REPOSITORY]: BranchIcon,
};

export const TaskItem: FC<ITaskItem> = ({
  task,
  labels,
  reorder,
  dimmed,
  progress,
  gitAvailable,
  onRun,
  onStop,
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
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : "auto",
  };

  const TypeIcon = TYPE_ICONS[task.type];
  const isRunning = progress !== undefined;
  const unavailableReasons = [
    ...(task.type === TaskType.REPOSITORY && gitAvailable === false
      ? ["To access the Repository functionality, install Git and ensure it is available in your PATH."]
      : []),
    ...(task.type === TaskType.REPOSITORY && task.isPrivate && !task.accessToken
      ? ["Access token is missing or could not be decrypted. Edit this task and re-enter the token for the private repository."]
      : []),
  ];
  const unavailableReason = unavailableReasons.join(" ");

  const items = [
    isRunning
      ? { Icon: StopIcon, onClick: onStop }
      : { Icon: PlayIcon, onClick: onRun, disabled: Boolean(unavailableReason), title: unavailableReason },
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
            <div className={styles.pathContainer}>
              <ArrowTurnIcon className={styles.pathIcon} />
              <div className={styles.pathDetails}>
                <div className={styles.path}>{task.source}</div>
                <div className={styles.path}>{task.target}</div>
              </div>
            </div>
            {unavailableReason && <div className={styles.warning}>{unavailableReason}</div>}
          </div>
          {labels.length > 0 && (
            <div className={styles.labels}>
              {labels.toReversed().map((label) => (
                <LabelChip key={label.id} name={label.name} color={label.color} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.section}>
        <div className={styles.progress}>{isRunning ? `${progress}%` : "\u00A0"}</div>
        {items.map(({ Icon, ...props }) => (
          <Button key={props.onClick.toString()} kind={ButtonKind.PRIMARY} icon {...props}>
            <Icon />
          </Button>
        ))}
      </div>
    </div>
  );
};
