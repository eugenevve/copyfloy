import { FC } from "react";

import styles from "./LabelChip.module.css";
import { ILabelChip } from "./LabelChip.types";

export const LabelChip: FC<ILabelChip> = ({ name, color }) => {
  return (
    <div className={styles.container} style={{ backgroundColor: color }}>
      {name}
    </div>
  );
};
