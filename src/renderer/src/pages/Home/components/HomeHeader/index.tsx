import { Button } from "@app/ui/Button";
import { Input } from "@app/ui/Input";
import { Select } from "@app/ui/Select";
import { TYPE_OPTIONS_FILTER } from "@app/utils/options";
import type { FC } from "react";

import { InfoApp } from "../InfoApp";
import styles from "./HomeHeader.module.css";
import type { IHomeHeader } from "./HomeHeader.types";

export const HomeHeader: FC<IHomeHeader> = ({
  count,
  onAddTask,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <InfoApp count={count} />
        <Button onClick={onAddTask}>Add task</Button>
      </div>
      <div className={styles.section}>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name..."
          className={styles.input}
        />
        <Select
          options={TYPE_OPTIONS_FILTER}
          value={typeFilter}
          onChange={(value) => onTypeFilterChange(value as typeof typeFilter)}
          className={styles.select}
        />
      </div>
    </div>
  );
};
