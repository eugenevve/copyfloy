import { classNames } from "@app/utils/classNames";
import { getFixedDropdownPosition } from "@app/utils/dropdownPosition";
import { FC, useEffect, useId, useRef, useState } from "react";

import styles from "./Select.module.css";
import { ISelect, SelectKind } from "./Select.types";
import { Button } from "../Button";
import { ButtonKind } from "../Button/Button.types";
import { CheckIcon, ChevronIcon } from "../Icons";

export const Select: FC<ISelect> = ({
  kind = SelectKind.PRIMARY,
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
}) => {
  const fieldId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  }>();
  const selectedOption = options.find((option) => option.value === value);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className={classNames(styles.container, className || "", isOpen ? styles.isOpen : "")}>
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
      )}
      <Button
        id={fieldId}
        kind={ButtonKind.SECONDARY}
        className={classNames(
          styles.select,
          isOpen ? styles.active : "",
          kind === SelectKind.PRIMARY ? "" : styles.secondary
        )}
        onClick={(event) => {
          if (!isOpen) {
            setDropdownPosition(
              getFixedDropdownPosition(
                event.currentTarget.getBoundingClientRect(),
                window.innerWidth,
                window.innerHeight
              )
            );
          }
          setIsOpen((prev) => !prev);
        }}
        disabled={disabled}
      >
        {selectedOption?.label ?? placeholder}
        <ChevronIcon className={classNames(styles.icon, isOpen ? styles.rotated : "")} />
      </Button>
      {isOpen && (
        <div className={styles.dropdown} style={dropdownPosition}>
          <div
            className={styles.options}
            style={{
              maxHeight: dropdownPosition ? `calc(${dropdownPosition.maxHeight}px - var(--spacing-s))` : undefined,
            }}
          >
            {options.map((option) => (
              <Button
                key={option.value}
                kind={ButtonKind.SECONDARY}
                className={styles.option}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
                {option.value === value && <CheckIcon className={styles.checkIcon} />}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
