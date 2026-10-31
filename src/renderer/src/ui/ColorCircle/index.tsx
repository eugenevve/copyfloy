import { classNames } from "@app/utils/classNames";
import { FC } from "react";

import styles from "./ColorCircle.module.css";
import { IColorCircle } from "./ColorCircle.types";
import { Tooltip } from "../Tooltip";

export const ColorCircle: FC<IColorCircle> = ({ color, label, selected = false, onClick }) => {
  return (
    <Tooltip content={label}>
      <div
        className={classNames(styles.container, selected ? styles.selected : "")}
        style={{ background: color }}
        onClick={onClick}
      />
    </Tooltip>
  );
};
