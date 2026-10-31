import { PageWrapper } from "@app/components/PageWrapper";
import { useModal } from "@app/hooks/useModal";
import stylesGlobal from "@app/styles/page.module.css";
import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { ReportIcon, TrashIcon } from "@app/ui/Icons";
import { Loader } from "@app/ui/Loader";
import { NoData } from "@app/ui/NoData";
import { classNames } from "@app/utils/classNames";
import { IReport } from "@shared/types/report";
import { FC, useEffect, useState } from "react";

import { ReportBlockItem } from "./components/ReportBlockItem";
import { ReportChart } from "./components/ReportChart";
import { ReportTable } from "./components/ReportTable";
import styles from "./Report.module.css";

export const Report: FC = () => {
  const [report, setReport] = useState<IReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showConfirm } = useModal();

  useEffect(() => {
    void window.api.report
      .get()
      .then(setReport)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <PageWrapper>
        <Loader label="Loading report..." />
      </PageWrapper>
    );
  }

  if (!report) {
    return (
      <PageWrapper>
        <NoData title="No stats" icon={<ReportIcon />} />
      </PageWrapper>
    );
  }

  const stats = [
    { label: "Tasks", value: report.totalTasks },
    { label: "Successful operations", value: report.successCount },
    { label: "Failed operations", value: report.errorCount },
  ];

  const handleClear = () => {
    showConfirm("Clear history?", "All report records will be permanently deleted.", async () => {
      await window.api.report.clear();
      setReport({ ...report, successCount: 0, errorCount: 0, records: [] });
    });
  };

  const header = (
    <div className={styles.header}>
      <div className={styles.stats}>
        {stats.map(({ label, value }) => (
          <ReportBlockItem key={label} label={label} value={value} />
        ))}
      </div>
      <Button kind={ButtonKind.SECONDARY} onClick={handleClear}>
        <TrashIcon />
        Clear history
      </Button>
    </div>
  );

  return (
    <PageWrapper header={header}>
      <div className={classNames(stylesGlobal.container, styles.container)}>
        {report.records?.length === 0 ? (
          <NoData title="No stats" icon={<ReportIcon />} />
        ) : (
          <>
            <ReportChart records={report.records} />
            <ReportTable records={report.records} />
          </>
        )}
      </div>
    </PageWrapper>
  );
};
