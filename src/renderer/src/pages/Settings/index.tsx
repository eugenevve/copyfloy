import { PageWrapper } from "@app/components/PageWrapper";
import { FC } from "react";

import { AutoStart } from "./components/AutoStart";
import { RunAdmin } from "./components/RunAdmin";
import { UpdateChecker } from "./components/UpdateChecker";
import { ZoomController } from "./components/ZoomController";
import styles from "./Settings.module.css";

export const Settings: FC = () => {
  return (
    <PageWrapper>
      <div className={styles.container}>
        <AutoStart />
        <RunAdmin />
        <ZoomController />
        <UpdateChecker />
      </div>
    </PageWrapper>
  );
};
