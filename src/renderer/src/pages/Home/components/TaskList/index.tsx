import { CloneIcon } from "@app/ui/Icons";
import { NoData } from "@app/ui/NoData";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import type { FC } from "react";

import { TaskItem } from "../TaskItem";
import styles from "./TaskList.module.css";
import { ITaskList } from "./TaskList.types";

export const TaskList: FC<ITaskList> = ({
  items,
  labels,
  reorder,
  onRun,
  onSchedule,
  onEdit,
  onDelete,
  onPin,
  onReorder,
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  if (items.length === 0) {
    return <NoData title="No tasks" icon={<CloneIcon />} />;
  }

  const displayItems = items
    .toReversed()
    .sort((first, second) => Number(Boolean(second.isPinned)) - Number(Boolean(first.isPinned)));
  const displayIds = displayItems.map(({ id }) => id);
  const pinnedIds = displayItems.filter((task) => task.isPinned).map(({ id }) => id);
  const regularIds = displayIds.filter((id) => !pinnedIds.includes(id));

  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    if (!over || active.id === over.id) {
      return;
    }

    // Movement only within one's own group (pinned / regular)
    const activeId = Number(active.id);
    const overId = Number(over.id);
    if (pinnedIds.includes(activeId) !== pinnedIds.includes(overId)) {
      return;
    }

    onReorder(arrayMove(displayIds, displayIds.indexOf(activeId), displayIds.indexOf(overId)));
  };

  return (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        {[pinnedIds, regularIds].map((ids, index) => (
          <SortableContext key={index} items={ids}>
            {displayItems
              .filter((task) => ids.includes(task.id))
              .map((item) => (
                <TaskItem
                  key={item.id}
                  task={item}
                  labels={labels.filter((label) => item.labelsIds?.includes(label.id))}
                  reorder={reorder}
                  onRun={() => onRun(item)}
                  onSchedule={() => onSchedule(item)}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item)}
                  onPin={() => onPin(item)}
                />
              ))}
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
};
