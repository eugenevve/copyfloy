import { Checkbox } from "@app/ui/Checkbox";
import { DAYS_LIST } from "@app/utils/daysList";
import { FC } from "react";

import styles from "./DaysSelector.module.css";
import { IDaysSelector } from "./DaysSelector.types";

export const DaysSelector: FC<IDaysSelector> = ({ selectedDays, onChange }) => {
  const toggleDay = (id: number) => {
    const next = selectedDays.includes(id) ? selectedDays.filter((d) => d !== id) : [...selectedDays, id];
    onChange(next);
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>Days of week</div>
      <div className={styles.list}>
        {DAYS_LIST.map((day) => (
          <Checkbox
            key={day.id}
            label={day.label}
            checked={selectedDays.includes(day.id)}
            onChange={() => toggleDay(day.id)}
            tooltip={day.fullLabel}
          />
        ))}
      </div>
    </div>
  );
};
