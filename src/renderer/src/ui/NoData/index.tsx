import { FC } from "react";

import styles from "./NoData.module.css";
import { INoData } from "./NoData.types";

export const NoData: FC<INoData> = ({ title }) => {
  return <div className={styles.container}>{title || "No data available"}</div>;
};
