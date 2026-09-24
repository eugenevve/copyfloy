import { ThemeButton } from "@app/theme/ThemeButton";
import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { ArrowLineIcon, GearIcon, HomeIcon, InfoIcon } from "@app/ui/Icons";
import { Line } from "@app/ui/Line";
import { classNames } from "@app/utils/classNames";
import { AppPath } from "@app/utils/router";
import { FC, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import styles from "./Sidebar.module.css";
import { ISidebar } from "./Sidebar.types";

export const Sidebar: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [isSidebarOpen, setSidebarOpen] = useState(() => window.api.settings.sidebar.get());

  const handleSidebar = () => {
    const newState = !isSidebarOpen;
    setSidebarOpen(newState);
    void window.api.settings.sidebar.set(newState);
  };

  const getKind = (path: string) => {
    return pathname === path ? ButtonKind.PRIMARY : ButtonKind.SECONDARY;
  };

  const items: ISidebar[] = [
    {
      path: AppPath.MAIN,
      label: "Home",
      icon: <HomeIcon />,
    },
    {
      path: AppPath.SETTINGS,
      label: "Settings",
      icon: <GearIcon />,
    },
    {
      path: AppPath.ABOUT,
      label: "About",
      icon: <InfoIcon />,
    },
  ];

  return (
    <div className={classNames(styles.container, isSidebarOpen ? styles.open : "")}>
      <Button kind={ButtonKind.SECONDARY} icon={!isSidebarOpen} className={styles.button} onClick={handleSidebar}>
        <ArrowLineIcon className={isSidebarOpen && styles.icon} />
        {isSidebarOpen && "Hide"}
      </Button>
      <Line />
      <div className={styles.list}>
        <div className={styles.menu}>
          {items.map(({ path, label, icon }) => (
            <Button
              key={path}
              kind={getKind(path)}
              icon={!isSidebarOpen}
              position="left"
              className={styles.button}
              onClick={() => void navigate(path)}
            >
              {icon}
              {isSidebarOpen && label}
            </Button>
          ))}
        </div>
        <ThemeButton label={isSidebarOpen} />
      </div>
    </div>
  );
};
