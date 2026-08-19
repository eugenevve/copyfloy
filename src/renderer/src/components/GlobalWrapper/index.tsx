import { FC } from "react";

import styles from "./GlobalWrapper.module.css";
import { IGlobalWrapper } from "./GlobalWrapper.types";
import { Tilebar } from "./Tilebar";

export const GlobalWrapper: FC<IGlobalWrapper> = ({ children }) => {
  return (
    <div className={styles.container}>
      <Tilebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
};
