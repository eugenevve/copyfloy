import { LabelsIcon } from "@app/ui/Icons";
import { NoData } from "@app/ui/NoData";
import { FC } from "react";

import styles from "./LabelsList.module.css";
import { LabelItem } from "../LabelItem";
import { ILabelsList } from "./LabelsList.types";

export const LabelsList: FC<ILabelsList> = ({ items, onEdit, onDelete }) => {
  if (items.length === 0) {
    return <NoData title="No labels" icon={<LabelsIcon />} />;
  }

  return (
    <div className={styles.container}>
      {items.toReversed().map((item) => (
        <LabelItem key={item.id} label={item} onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />
      ))}
    </div>
  );
};
