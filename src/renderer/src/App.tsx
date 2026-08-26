import { FC } from "react";
import { HashRouter, Route, Routes } from "react-router";

import { GlobalWrapper } from "./components/GlobalWrapper";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { AppPath } from "./utils/router";

export const App: FC = () => {
  return (
    <GlobalWrapper>
      <HashRouter>
        <Routes>
          <Route path={AppPath.MAIN} element={<Home />} />
          <Route path={AppPath.SETTINGS} element={<Settings />} />
        </Routes>
      </HashRouter>
    </GlobalWrapper>
  );
};
