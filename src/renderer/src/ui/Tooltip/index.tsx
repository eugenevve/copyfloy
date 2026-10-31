import { classNames } from "@app/utils/classNames";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./Tooltip.module.css";
import { TooltipPlacement } from "./Tooltip.types";
import type { ITooltip } from "./Tooltip.types";

const OFFSET = 3;
const DELAY = 1000;

export const Tooltip: FC<ITooltip> = ({ content, placement = TooltipPlacement.TOP, children }) => {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const hide = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setPosition(null);
  }, []);

  const show = useCallback(() => {
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const coords = {
        top: { x: centerX, y: rect.top - OFFSET },
        bottom: { x: centerX, y: rect.bottom + OFFSET },
        left: { x: rect.left - OFFSET, y: centerY },
        right: { x: rect.right + OFFSET, y: centerY },
      };
      setPosition(coords[placement]);
    }, DELAY);
  }, [placement]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  if (!content) return children;

  return (
    <span
      ref={wrapperRef}
      className={styles.container}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onMouseDown={hide}
    >
      {children}
      {position &&
        createPortal(
          <div
            role="tooltip"
            className={classNames(styles.content, styles[placement])}
            style={{ left: position.x, top: position.y }}
          >
            {content}
          </div>,
          document.body
        )}
    </span>
  );
};
