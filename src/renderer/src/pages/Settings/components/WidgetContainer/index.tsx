import { FC } from "react";

import styles from "./WidgetContainer.module.css";
import { IWidgetContainer } from "./WidgetContainer.types";

export const WidgetContainer: FC<IWidgetContainer> = ({ title, children, hint }) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      {children}
      <div className={styles.hint}>{hint}</div>
    </div>
  );
};
