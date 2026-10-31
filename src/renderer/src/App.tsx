import { FC, useEffect } from "react";
import { HashRouter, Route, Routes } from "react-router";

import { GlobalWrapper } from "./components/GlobalWrapper";
import { ModalProvider } from "./components/ModalProvider";
import { useZoomShortcuts } from "./hooks/useZoomShortcuts";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { Labels } from "./pages/Labels";
import { Report } from "./pages/Report";
import { Settings } from "./pages/Settings";
import { initDateTimeFormat } from "./utils/dateTimeFormatState";
import { AppPath } from "./utils/router";

export const App: FC = () => {
  useZoomShortcuts();

  useEffect(() => {
    void initDateTimeFormat();
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
            <Route path={AppPath.ABOUT} element={<About />} />
          </Routes>
        </HashRouter>
      </ModalProvider>
    </GlobalWrapper>
  );
};
