import { InfoApp } from "@app/pages/Home/components/InfoApp";
import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { ChevronIcon } from "@app/ui/Icons";
import { Input } from "@app/ui/Input";
import { LabelChip } from "@app/ui/LabelChip";
import { Select } from "@app/ui/Select";
import { TooltipPlacement } from "@app/ui/Tooltip/Tooltip.types";
import { FC, useRef } from "react";

import styles from "./HeaderTools.module.css";
import { IHeaderTools } from "./HeaderTools.types";

export const HeaderTools: FC<IHeaderTools> = ({
  title,
  count,
  addText,
  onAdd,
  addDisabled,
  search,
  onSearchChange,
  filter,
  labelsFilter,
}) => {
  const labelsRef = useRef<HTMLDivElement>(null);

  const scrollLabels = (direction: -1 | 1) => {
    labelsRef.current?.scrollBy({ left: direction * 200, behavior: "smooth" });
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.section}>
          <InfoApp name={title} count={count} />
          <Button onClick={onAdd} disabled={addDisabled}>{addText}</Button>
        </div>
        <div className={styles.section}>
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search"
            className={styles.input}
          />
          {filter && (
            <Select
              options={filter.options}
              value={filter.value}
              onChange={filter.onChange}
              className={styles.select}
            />
          )}
        </div>
      </div>
      {labelsFilter && labelsFilter.labels.length > 0 && (
        <div className={styles.labelsContainer}>
          <Button
            kind={ButtonKind.SECONDARY}
            icon
            onClick={() => scrollLabels(-1)}
            tooltip="Scroll left"
            tooltipPlacement={TooltipPlacement.RIGHT}
          >
            <ChevronIcon className={styles.arrowLeft} />
          </Button>
          <div ref={labelsRef} className={styles.labels}>
            {labelsFilter.labels.toReversed().map((label) => (
              <LabelChip
                key={label.id}
                name={label.name}
                color={label.color}
                selected={labelsFilter.selectedIds.includes(label.id)}
                onClick={() => labelsFilter.onToggle(label.id)}
              />
            ))}
          </div>
          <Button
            icon
            kind={ButtonKind.SECONDARY}
            onClick={() => scrollLabels(1)}
            tooltip="Scroll right"
            tooltipPlacement={TooltipPlacement.LEFT}
          >
            <ChevronIcon className={styles.arrowRight} />
          </Button>
        </div>
      )}
    </div>
  );
};
