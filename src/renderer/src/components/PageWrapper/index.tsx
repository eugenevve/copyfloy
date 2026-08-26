import type { FC } from "react";

import styles from "./PageWrapper.module.css";
import { IPageWrapper } from "./PageWrapper.types";
import { Sidebar } from "./Sidebar";

export const PageWrapper: FC<IPageWrapper> = ({ children }) => {
  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
};
