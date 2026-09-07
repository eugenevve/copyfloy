import { FC } from "react";

import { IInfoApp } from "./InfoApp.types";

export const InfoApp: FC<IInfoApp> = ({ count }) => {
  return <div>Tasks: {count}</div>;
};
