import { useTheme } from "@app/theme/useTheme";
import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { MoonIcon, SunIcon, SystemIcon } from "@app/ui/Icons";
import type { FC } from "react";

import styles from "./ThemeButton.module.css";
import { ThemeKind } from "../Theme.types";
import { IThemeButton } from "./ThemeButton.types";

const icon = {
  light: <SunIcon />,
  dark: <MoonIcon />,
  system: <SystemIcon />,
};

const labels = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export const ThemeButton: FC<IThemeButton> = ({ label }) => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    switch (theme) {
      case ThemeKind.SYSTEM:
        setTheme(ThemeKind.DARK);
        break;
      case ThemeKind.DARK:
        setTheme(ThemeKind.LIGHT);
        break;
      case ThemeKind.LIGHT:
        setTheme(ThemeKind.SYSTEM);
        break;
    }
  };

  return (
    <Button kind={ButtonKind.SECONDARY} onClick={handleToggle} icon={!label} className={styles.button}>
      {label && labels[theme]}
      {icon[theme]}
    </Button>
  );
};
