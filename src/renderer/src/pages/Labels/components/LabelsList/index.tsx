import { LabelsIcon } from "@app/ui/Icons";
import { NoData } from "@app/ui/NoData";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FC, useState } from "react";

import styles from "./LabelsList.module.css";
import { LabelItem } from "../LabelItem";
import { ILabelsList } from "./LabelsList.types";

export const LabelsList: FC<ILabelsList> = ({ items, reorder, onEdit, onDelete, onReorder }) => {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (items.length === 0) {
    return <NoData title="No labels" icon={<LabelsIcon />} />;
  }

  const displayItems = items.toReversed();
  const displayIds = displayItems.map(({ id }) => id);
  const handleDragEnd = ({ active, over }: DragEndEvent): void => {
    setActiveId(null);
    if (over && active.id !== over.id) {
      onReorder(arrayMove(displayIds, displayIds.indexOf(Number(active.id)), displayIds.indexOf(Number(over.id))));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragStart={({ active }) => setActiveId(Number(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={displayIds} strategy={verticalListSortingStrategy}>
        <div className={styles.container}>
          {displayItems.map((item) => (
            <LabelItem
              key={item.id}
              label={item}
              reorder={reorder}
              dimmed={activeId !== null && activeId !== item.id}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
