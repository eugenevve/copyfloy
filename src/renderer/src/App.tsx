import { FC } from "react";
import { HashRouter, Route, Routes } from "react-router";

import { GlobalWrapper } from "./components/GlobalWrapper";
import { ModalProvider } from "./components/ModalProvider";
import { useZoomShortcuts } from "./hooks/useZoomShortcuts";
import { About } from "./pages/About";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { AppPath } from "./utils/router";

export const App: FC = () => {
  useZoomShortcuts();

  return (
    <GlobalWrapper>
      <ModalProvider>
        <HashRouter>
          <Routes>
            <Route path={AppPath.MAIN} element={<Home />} />
            <Route path={AppPath.SETTINGS} element={<Settings />} />
            <Route path={AppPath.ABOUT} element={<About />} />
          </Routes>
        </HashRouter>
      </ModalProvider>
    </GlobalWrapper>
  );
};
