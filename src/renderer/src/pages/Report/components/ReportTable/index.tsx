import { formatDuration, formatSize } from "@app/utils/reports";
import { ReportStatus } from "@shared/types/report";
import { FC } from "react";

import styles from "./ReportTable.module.css";
import { IReportTableProps } from "./ReportTable.types";

export const ReportTable: FC<IReportTableProps> = ({ records }) => (
  <table className={styles.table}>
    <thead>
      <tr>
        <th>Task</th>
        <th>Started</th>
        <th>Copied files</th>
        <th>Skipped files</th>
        <th>Duration</th>
        <th>Size</th>
      </tr>
    </thead>
    <tbody>
      {records.map((record) => (
        <tr key={record.id} className={record.status === ReportStatus.ERROR ? styles.error : undefined}>
          <td title={record.error}>{record.taskName}</td>
          <td>{new Date(record.startedAt).toLocaleString()}</td>
          <td>{record.filesCopied ?? "-"}</td>
          <td>{record.filesSkipped}</td>
          <td>{formatDuration(record.durationMs)}</td>
          <td>{formatSize(record.totalBytes)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
