import { FC } from "react";

import styles from "./NoData.module.css";
import { INoData } from "./NoData.types";
import { XmarkIcon } from "../Icons";

export const NoData: FC<INoData> = ({ icon, title }) => {
  return (
    <div className={styles.container}>
      {icon ? (
        <div className={styles.icon}>{icon}</div>
      ) : (
        <div className={styles.icon}>
          <XmarkIcon />
        </div>
      )}
      <div className={styles.title}>{title || "No data available!"}</div>
    </div>
  );
};
