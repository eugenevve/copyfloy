import { FC } from "react";

import styles from "./Loader.module.css";
import { ILoader } from "./Loader.types";

export const Loader: FC<ILoader> = ({ label }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <div className={styles.label}>{label || "Loading"}</div>
    </div>
  );
};
