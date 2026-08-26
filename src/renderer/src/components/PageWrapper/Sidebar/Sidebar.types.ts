import { AppPath } from "@app/utils/router";
import { ReactNode } from "react";

export interface ISidebar {
  path: AppPath;
  label: string;
  icon: ReactNode;
}
