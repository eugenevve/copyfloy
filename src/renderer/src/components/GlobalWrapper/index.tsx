import { FC } from "react";

import { Tilebar } from "./components/Tilebar";
import styles from "./GlobalWrapper.module.css";
import { IGlobalWrapper } from "./GlobalWrapper.types";

export const GlobalWrapper: FC<IGlobalWrapper> = ({ children }) => {
  return (
    <div className={styles.container}>
      <Tilebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
};
