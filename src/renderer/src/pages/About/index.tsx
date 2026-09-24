import { PageWrapper } from "@app/components/PageWrapper";
import { Button } from "@app/ui/Button";
import { FC } from "react";

import styles from "./About.module.css";

export const About: FC = () => {
  const appVersion = window.api.app.appVersion;
  const handleOpen = (): void => {
    window.open("https://github.com/eugenevve/copyfloy", "_blank");
  };

  return (
    <PageWrapper>
      <div className={styles.container}>
        <div className={styles.title}>About the Program</div>
        <div>
          Copyfloy helps automatically copy files and folders without constant manual oversight. The application is
          convenient for backups, transferring data between drives, and running recurring tasks on a schedule.
        </div>
        <div className={styles.section}>
          <div className={styles.title}>What it is suitable for</div>
          <div>- Copy important documents and folders to a backup directory</div>
          <div>- Transfer data between local drives and external storage devices</div>
          <div>- Run tasks automatically on a schedule, without user intervention</div>
          <div>- Exclude unnecessary files and folders from the copying process</div>
        </div>
        <div>Application version: {appVersion}</div>
        <Button onClick={handleOpen}>GitHub Open Source</Button>
      </div>
    </PageWrapper>
  );
};
