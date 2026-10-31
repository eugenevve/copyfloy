import type { FC } from "react";

import styles from "./PageWrapper.module.css";
import { IPageWrapper } from "./PageWrapper.types";
import { Sidebar } from "./Sidebar";

export const PageWrapper: FC<IPageWrapper> = ({ header, children }) => {
  const viewStyle = {
    maskImage: "linear-gradient(to bottom, transparent, var(--background-primary) var(--spacing-m))",
  };

  return (
    <div className={styles.container}>
      <Sidebar />
      <div className={styles.content}>
        {header && <div className={styles.header}>{header}</div>}
        <div className={styles.view} style={header ? viewStyle : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
};
