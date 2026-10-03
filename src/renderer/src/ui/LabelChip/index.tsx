import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./LabelChip.module.css";
import { ILabelChip } from "./LabelChip.types";

export const LabelChip: FC<ILabelChip> = ({ name, color, selected, onClick }) => {
  return (
    <div
      className={classNames(styles.container, selected ? styles.selected : "")}
      style={{ backgroundColor: color, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      {name}
    </div>
  );
};
