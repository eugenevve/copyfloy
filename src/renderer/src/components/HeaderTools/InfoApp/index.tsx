import { FC } from "react";

import { IInfoApp } from "./InfoApp.types";

export const InfoApp: FC<IInfoApp> = ({ name, count }) => {
  return <div>{name}: {count}</div>;
};
