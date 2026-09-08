import { classNames } from "@app/utils/classNames";
import { FC, useEffect, useRef, useState } from "react";

import styles from "./Select.module.css";
import { Button } from "../Button";
import { ISelect } from "./Select.types";
import { ButtonKind } from "../Button/Button.types";
import { CheckIcon, ChevronIcon } from "../Icons";

export const Select: FC<ISelect> = ({ label, value, onChange, options, placeholder, disabled, className }) => {
  const [isOpen, setIsOpen] = useState(false);
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
      {label && <div className={styles.label}>{label}</div>}
      <Button
        kind={ButtonKind.SECONDARY}
        className={classNames(styles.select, isOpen ? styles.active : "")}
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
      >
        {selectedOption?.label ?? placeholder}
        <ChevronIcon className={classNames(styles.icon, isOpen ? styles.rotated : "")} />
      </Button>
      {isOpen && (
        <div className={styles.dropdown}>
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
              {option.value === value && <CheckIcon />}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
