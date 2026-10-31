import { PageWrapper } from "@app/components/PageWrapper";
import stylesGlobal from "@app/styles/page.module.css"
import { FC } from "react";

import { AutoStart } from "./components/AutoStart";
import { MinimizeTray } from "./components/MinimizeTray";
import { RunAdmin } from "./components/RunAdmin";
import { TaskTransfer } from "./components/TaskTransfer";
import { UpdateChecker } from "./components/UpdateChecker";
import { ZoomController } from "./components/ZoomController";

export const Settings: FC = () => {
  return (
    <PageWrapper>
      <div className={stylesGlobal.container}>
        <AutoStart />
        <RunAdmin />
        <ZoomController />
        <MinimizeTray />
        <TaskTransfer />
        <UpdateChecker />
      </div>
    </PageWrapper>
  );
};
