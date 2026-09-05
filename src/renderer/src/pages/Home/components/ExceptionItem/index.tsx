import { Button } from "@app/ui/Button";
import { TrashIcon } from "@app/ui/Icons";
import { FC } from "react";

import styles from "./ExceptionItem.module.css";
import { IExceptionItem } from "./ExceptionItem.types";

export const ExceptionItem: FC<IExceptionItem> = ({ title, onRemove }) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      <Button onClick={onRemove} icon>
        <TrashIcon />
      </Button>
    </div>
  );
};
