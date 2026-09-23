import { ReactNode } from "react";

export interface IWidgetContainer {
  title: string;
  children: ReactNode;
  hint?: string;
}
