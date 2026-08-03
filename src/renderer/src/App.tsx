import { FC } from "react";
import { HashRouter, Route, Routes } from "react-router";
import { Home } from "./pages/Home";

export const App: FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </HashRouter>
  );
};
