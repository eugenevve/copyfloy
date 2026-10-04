import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { PenIcon, TrashIcon } from "@app/ui/Icons";
import { LabelChip } from "@app/ui/LabelChip";
import { FC } from "react";

import styles from "./LabelItem.module.css";
import { ILabelItem } from "./LabelItem.types";

export const LabelItem: FC<ILabelItem> = ({ label, onEdit, onDelete }) => {
  const items = [
    { Icon: PenIcon, onClick: onEdit },
    { Icon: TrashIcon, onClick: onDelete },
  ];

  return (
    <div className={styles.container}>
      <LabelChip name={label.name} color={label.color} />
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
