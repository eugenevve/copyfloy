import { Button } from "@app/ui/Button";
import { ButtonKind } from "@app/ui/Button/Button.types";
import { FC, useState } from "react";

import { ReportDayChart } from "../ReportDayChart";
import { ReportWeeksChart } from "../ReportWeeksChart";
import styles from "./ReportChartSwitcher.module.css";
import { ChartView } from "./ReportChartSwitcher.types";
import { IReportChartSwitcher } from "./ReportChartSwitcher.types";

export const ReportChartSwitcher: FC<IReportChartSwitcher> = ({ records }) => {
  const [activeView, setActiveView] = useState<ChartView>(ChartView.WEEKS);

  const getKind = (view: ChartView) => {
    return activeView === view ? ButtonKind.PRIMARY : ButtonKind.SECONDARY;
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <Button kind={getKind(ChartView.WEEKS)} onClick={() => setActiveView(ChartView.WEEKS)}>
          By weeks
        </Button>
        <Button kind={getKind(ChartView.HOURS)} onClick={() => setActiveView(ChartView.HOURS)}>
          By hours
        </Button>
      </div>
      {activeView === ChartView.WEEKS ? <ReportWeeksChart records={records} /> : <ReportDayChart records={records} />}
    </div>
  );
};
