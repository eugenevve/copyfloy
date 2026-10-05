import { InfoApp } from "@app/pages/Home/components/InfoApp";
import { Button } from "@app/ui/Button";
import { Input } from "@app/ui/Input";
import { Select } from "@app/ui/Select";
import { FC } from "react";

import styles from "./HeaderTools.module.css";
import { IHeaderTools } from "./HeaderTools.types";

export const HeaderTools: FC<IHeaderTools> = ({ title, count, addText, onAdd, search, onSearchChange, filter }) => {
  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <InfoApp name={title} count={count} />
        <Button onClick={onAdd}>{addText}</Button>
      </div>
      <div className={styles.section}>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name..."
          className={styles.input}
        />
        {filter && (
          <Select options={filter.options} value={filter.value} onChange={filter.onChange} className={styles.select} />
        )}
      </div>
    </div>
  );
};
