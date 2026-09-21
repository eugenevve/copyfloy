import { FolderIcon } from "@app/ui/Icons";
import { NoData } from "@app/ui/NoData";
import { FC } from "react";

import { ExceptionItem } from "../ExceptionItem";
import styles from "./ExceptionsList.module.css";
import { IExceptionsList } from "./ExceptionsList.types";

export const ExceptionsList: FC<IExceptionsList> = ({ items, sourcePath, onRemove }) => {
  if (items.length === 0) {
    return <NoData title="Select the source folder" icon={<FolderIcon />} />;
  }

  return (
    <div className={styles.container}>
      {items.map((path) => (
        <ExceptionItem key={path} title={path.replace(sourcePath, "... ")} onRemove={() => onRemove(path)} />
      ))}
    </div>
  );
};
