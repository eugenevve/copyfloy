import { PageWrapper } from "@app/components/PageWrapper";
import { FC } from "react";

import { UpdateChecker } from "./components/UpdateChecker";
import styles from "./Settings.module.css";

export const Settings: FC = () => {
  return (
    <PageWrapper>
      <div className={styles.container}>
        <UpdateChecker />
      </div>
    </PageWrapper>
  );
};
