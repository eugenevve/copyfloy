import { FC } from "react";

import styles from "./ReportBlockItem.module.css";
import { IReportBlockItem } from "./ReportBlockItem.types";

export const ReportBlockItem: FC<IReportBlockItem> = ({ label, value }) => {
  return (
    <div className={styles.container}>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
};
