import { FC, useEffect } from "react";
import { HashRouter, Route, Routes, useNavigate } from "react-router";

import { GlobalWrapper } from "./components/GlobalWrapper";
import { MissedTasksPrompt } from "./components/MissedTasksPrompt";
import { ModalProvider } from "./components/ModalProvider";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useZoomShortcuts } from "./hooks/useZoomShortcuts";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { Labels } from "./pages/Labels";
import { Report } from "./pages/Report";
import { Settings } from "./pages/Settings";
import { Shortcuts } from "./pages/Shortcuts";
import { initDateTimeFormat } from "./utils/dateTimeFormatState";
import { AppPath } from "./utils/router";

const AppNavigationShortcuts: FC = () => {
  const navigate = useNavigate();

  useKeyboardShortcuts([
    { key: "mod+1", ignoreInputs: true, action: () => void navigate(AppPath.MAIN) },
    { key: "mod+2", ignoreInputs: true, action: () => void navigate(AppPath.LABELS) },
    { key: "mod+3", ignoreInputs: true, action: () => void navigate(AppPath.SETTINGS) },
    { key: "mod+4", ignoreInputs: true, action: () => void navigate(AppPath.REPORT) },
    { key: "mod+5", ignoreInputs: true, action: () => void navigate(AppPath.SHORTCUTS) },
    { key: "mod+6", ignoreInputs: true, action: () => void navigate(AppPath.ABOUT) },
  ]);

  return null;
};

export const App: FC = () => {
  useZoomShortcuts();

  useEffect(() => {
    initDateTimeFormat();
  }, []);

  return (
    <GlobalWrapper>
      <ModalProvider>
        <HashRouter>
          <Routes>
            <Route path={AppPath.MAIN} element={<Home />} />
            <Route path={AppPath.LABELS} element={<Labels />} />
            <Route path={AppPath.SETTINGS} element={<Settings />} />
            <Route path={AppPath.REPORT} element={<Report />} />
            <Route path={AppPath.SHORTCUTS} element={<Shortcuts />} />
            <Route path={AppPath.ABOUT} element={<About />} />
          </Routes>
          <AppNavigationShortcuts />
        </HashRouter>
        <MissedTasksPrompt />
      </ModalProvider>
    </GlobalWrapper>
  );
};
