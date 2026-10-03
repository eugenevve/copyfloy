import { InfoApp } from "@app/pages/Home/components/InfoApp";
import { Button } from "@app/ui/Button";
import { Input } from "@app/ui/Input";
import type { FC } from "react";

import styles from "./LabelsHeader.module.css";
import { ILabelsHeader } from "./LabelsHeader.types";

export const LabelsHeader: FC<ILabelsHeader> = ({ count, onAddLabel, search, onSearchChange }) => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <InfoApp name="Labels" count={count} />
        <Button onClick={onAddLabel}>Add label</Button>
      </div>
      <div className={styles.section}>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name..."
          className={styles.input}
        />
      </div>
    </div>
  );
};
