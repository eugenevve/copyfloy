import { usePagination } from "@app/hooks/usePagination";
import { ShowMoreButton } from "@app/ui/ShowMoreButton";
import { formatDateTime } from "@app/utils/dateTime";
import { getDateTimeFormat, subscribeDateTimeFormat } from "@app/utils/dateTimeFormatState";
import { formatDuration, formatSize } from "@app/utils/reports";
import { ReportStatus } from "@shared/types/report";
import { FC, useSyncExternalStore } from "react";

import styles from "./ReportTable.module.css";
import { IReportTableProps } from "./ReportTable.types";

export const ReportTable: FC<IReportTableProps> = ({ records }) => {
  const { visibleItems, hasMore, showMore } = usePagination(records);
  const dateTimeFormat = useSyncExternalStore(subscribeDateTimeFormat, getDateTimeFormat);

  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Task</th>
            <th>Started</th>
            <th>Copied files</th>
            <th>Skipped files</th>
            <th>Duration</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((record, index) => (
            <tr key={record.id} className={record.status === ReportStatus.ERROR ? styles.error : undefined}>
              <td>{index + 1}</td>
              <td title={record.error}>{record.taskName}</td>
              <td>{formatDateTime(new Date(record.startedAt), dateTimeFormat)}</td>
              <td>{record.filesCopied ?? "-"}</td>
              <td>{record.filesSkipped}</td>
              <td>{formatDuration(record.durationMs)}</td>
              <td>{formatSize(record.totalBytes)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && <ShowMoreButton onClick={showMore} />}
    </>
  );
};
