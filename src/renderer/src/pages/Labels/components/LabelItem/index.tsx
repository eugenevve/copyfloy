import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { DrugButton } from "@app/ui/DrugButton";
import { PenIcon, TrashIcon } from "@app/ui/Icons";
import { LabelChip } from "@app/ui/LabelChip";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, FC } from "react";

import styles from "./LabelItem.module.css";
import { ILabelItem } from "./LabelItem.types";

export const LabelItem: FC<ILabelItem> = ({ label, onEdit, onDelete, reorder }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: label.id,
    disabled: !reorder,
  });
  const sortableStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : "",
  };

  const items = [
    { Icon: PenIcon, onClick: onEdit },
    { Icon: TrashIcon, onClick: onDelete },
  ];

  return (
    <div ref={setNodeRef} className={styles.container} style={sortableStyle}>
      <div className={styles.section}>
        {reorder && <DrugButton {...attributes} {...listeners} />}
        <LabelChip name={label.name} color={label.color} />
      </div>
      <div className={styles.section}>
        {items.map(({ Icon, ...props }) => (
          <Button key={String(props.onClick)} kind={ButtonKind.PRIMARY} icon {...props}>
            <Icon />
          </Button>
        ))}
      </div>
    </div>
  );
};
