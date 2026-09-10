import { useModal } from "@app/hooks/useModal";
import { Button } from "@app/ui/Button";
import { FC, useEffect, useState } from "react";

import styles from "./UpdateChecker.module.css";
import { UpdateStatus } from "./UpdateChecker.types";

export const UpdateChecker: FC = () => {
  const { showAlert } = useModal();
  const [status, setStatus] = useState<UpdateStatus>(UpdateStatus.IDLE);
  const [progress, setProgress] = useState(0);

  const { appVersion, isPackaged } = window.api.env;

  useEffect(() => {
    const unsubscribe = [
      window.api.updater.onAvailable(() => {
        setStatus(UpdateStatus.AVAILABLE);
      }),

      window.api.updater.onNotAvailable(() => {
        setStatus(UpdateStatus.IDLE);
        showAlert("Successfully", "You have the latest version installed!");
      }),

      window.api.updater.onProgress((percent) => {
        setStatus(UpdateStatus.DOWNLOADING);
        setProgress(Math.round(percent));
      }),

      window.api.updater.onDownloaded(() => {
        setStatus(UpdateStatus.READY);
      }),

      window.api.updater.onError((message) => {
        setStatus(UpdateStatus.IDLE);
        showAlert("Error", `An error occurred during the update: ${message}`);
      }),
    ];

    return () => unsubscribe.forEach((unsubscribe) => unsubscribe());
  }, [showAlert]);

  const handleAction = (): void => {
    if (!isPackaged) {
      showAlert("Not available", "The local version of the application cannot be updated!");
      return;
    }

    switch (status) {
      case UpdateStatus.IDLE:
        setStatus(UpdateStatus.CHECKING);
        void window.api.updater.check();
        break;

      case UpdateStatus.AVAILABLE:
        setProgress(0);
        void window.api.updater.download();
        break;

      case UpdateStatus.READY:
        void window.api.updater.install();
        break;
    }
  };

  const isLoading = status === UpdateStatus.CHECKING || status === UpdateStatus.DOWNLOADING;

  const buttonText = {
    [UpdateStatus.IDLE]: "Check for updates",
    [UpdateStatus.CHECKING]: "Examination...",
    [UpdateStatus.AVAILABLE]: "Download the update",
    [UpdateStatus.DOWNLOADING]: `Loading ${progress}%...`,
    [UpdateStatus.READY]: "Restart and update",
  }[status];

  const hint =
    status === UpdateStatus.DOWNLOADING
      ? "Please do not close the program"
      : status === UpdateStatus.READY
        ? "The update is ready to install"
        : `Application version: ${appVersion}`;

  return (
    <div className={styles.container}>
      <div className={styles.title}>Update</div>
      <Button onClick={handleAction} disabled={isLoading}>
        {buttonText}
      </Button>
      <div className={styles.hint}>{hint}</div>
    </div>
  );
};
