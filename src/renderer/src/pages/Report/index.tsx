import { PageWrapper } from "@app/components/PageWrapper";
import { ReportIcon } from "@app/ui/Icons";
import { NoData } from "@app/ui/NoData";
import { IReport } from "@shared/types/report";
import { FC, useEffect, useState } from "react";

import { ReportBlockItem } from "./components/ReportBlockItem";
import { ReportTable } from "./components/ReportTable";
import styles from "./Report.module.css";

export const Report: FC = () => {
  const [report, setReport] = useState<IReport | null>(null);

  useEffect(() => {
    void window.api.report.get().then(setReport);
  }, []);

  if (!report || report.records?.length === 0) {
    return <NoData title="No stats" icon={<ReportIcon />} />;
  }

  const stats = [
    { label: "Tasks", value: report.totalTasks },
    { label: "Successful operations", value: report.successCount },
    { label: "Failed operations", value: report.errorCount },
  ];

  return (
    <PageWrapper>
      <div className={styles.container}>
        <div className={styles.stats}>
          {stats.map(({ label, value }) => (
            <ReportBlockItem key={label} label={label} value={value} />
          ))}
        </div>
        <ReportTable records={report.records} />
      </div>
    </PageWrapper>
  );
};
