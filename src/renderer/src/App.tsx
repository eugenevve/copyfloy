import { FC } from "react";
import { HashRouter, Route, Routes } from "react-router";

import { GlobalWrapper } from "./components/GlobalWrapper";
import { Home } from "./pages/Home";

export const App: FC = () => {
  return (
    <GlobalWrapper>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </HashRouter>
    </GlobalWrapper>
  );
};
