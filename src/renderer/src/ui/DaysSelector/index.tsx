import { Checkbox } from "@app/ui/Checkbox";
import { FC } from "react";

import styles from "./DaysSelector.module.css";
import { IDaysSelector } from "./DaysSelector.types";

const DAYS = [
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
  { id: 7, label: "Sun" },
];

export const DaysSelector: FC<IDaysSelector> = ({ selectedDays, onChange }) => {
  const toggleDay = (id: number) => {
    const next = selectedDays.includes(id) ? selectedDays.filter((d) => d !== id) : [...selectedDays, id];
    onChange(next);
  };

  return (
    <div className={styles.container}>
      <div className={styles.label}>Days of week</div>
      <div className={styles.list}>
        {DAYS.map((day) => (
          <Checkbox
            key={day.id}
            label={day.label}
            checked={selectedDays.includes(day.id)}
            onChange={() => toggleDay(day.id)}
          />
        ))}
      </div>
    </div>
  );
};
