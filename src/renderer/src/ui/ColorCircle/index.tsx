import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./ColorCircle.module.css";
import { IColorCircle } from "./ColorCircle.types";

export const ColorCircle: FC<IColorCircle> = ({ color, selected = false, onClick }) => {
  return (
    <div
      className={classNames(styles.container, selected ? styles.selected : "")}
      style={{ background: color }}
      onClick={onClick}
    />
  );
};
