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
import { Tooltip } from "@app/ui/Tooltip";
import { classNames } from "@app/utils/classNames";
import { getDateTimeFormat, subscribeDateTimeFormat } from "@app/utils/dateTimeFormatState";
import { getScheduleText } from "@app/utils/shedule";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ITaskItem, TaskType } from "@shared/types/tasks";
import { useSyncExternalStore } from "react";
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
  const dateTimeFormat = useSyncExternalStore(subscribeDateTimeFormat, getDateTimeFormat);
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
      ? [
          "Access token is missing or could not be decrypted. Edit this task and re-enter the token for the private repository.",
        ]
      : []),
  ];
  const unavailableReason = unavailableReasons.join(" ");
  const scheduleText = getScheduleText(task.schedule, dateTimeFormat.timeFormat);

  const items = [
    isRunning
      ? { Icon: StopIcon, onClick: onStop, tooltip: "Stop" }
      : {
          Icon: PlayIcon,
          onClick: onRun,
          disabled: Boolean(unavailableReason),
          title: unavailableReason,
          tooltip: "Run",
        },
    { Icon: ClockIcon, onClick: onSchedule, tooltip: "Schedule" },
    { Icon: PenIcon, onClick: onEdit, tooltip: "Edit" },
    { Icon: TrashIcon, onClick: onDelete, tooltip: "Delete" },
  ];

  return (
    <div ref={setNodeRef} className={classNames(styles.container, dimmed ? styles.dimmed : "")} style={sortableStyle}>
      {reorder && <DragButton {...attributes} {...listeners} />}
      <div className={styles.content}>
        <div className={styles.horizontalContainer}>
          <div className={styles.section}>
            <Tooltip content={task.type}>
              <TypeIcon className={styles.icon} />
            </Tooltip>
            <Tooltip content={task.name}>
              <div className={styles.taskName}>{task.name}</div>
            </Tooltip>
            <Button
              kind={ButtonKind.SECONDARY}
              icon
              className={styles.pinButton}
              onClick={onPin}
              tooltip={task.isPinned ? "Unpin" : "Pin"}
            >
              <PinIcon className={task.isPinned ? "" : styles.iconPin} />
            </Button>
          </div>
          <div className={styles.section}>
            <div className={styles.progress}>{isRunning ? `${progress}%` : "\u00A0"}</div>
            {items.map(({ Icon, tooltip, ...props }) => (
              <Button key={props.onClick.toString()} kind={ButtonKind.PRIMARY} icon tooltip={tooltip} {...props}>
                <Icon />
              </Button>
            ))}
          </div>
        </div>
        <div className={styles.horizontalContainer}>
          <div className={styles.section} style={{ paddingBottom: "var(--spacing-s)" }}>
            <ArrowTurnIcon className={styles.pathIcon} />
            <div className={styles.pathDetails}>
              <Tooltip content={task.source}>
                <div className={styles.path}>{task.source}</div>
              </Tooltip>
              <Tooltip content={task.target}>
                <div className={styles.path}>{task.target}</div>
              </Tooltip>
            </div>
          </div>
          {scheduleText && <div className={styles.schedule}>{scheduleText}</div>}
        </div>
        {unavailableReason && <div className={styles.warning}>{unavailableReason}</div>}
        {labels.length > 0 && (
          <div className={styles.labels}>
            {labels.toReversed().map((label) => (
              <LabelChip key={label.id} name={label.name} color={label.color} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
