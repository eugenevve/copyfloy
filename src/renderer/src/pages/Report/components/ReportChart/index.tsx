import { WidgetContainer } from "@app/pages/Settings/components/WidgetContainer";
import { formatDate } from "@app/utils/dateTime";
import { getDateTimeFormat, subscribeDateTimeFormat } from "@app/utils/dateTimeFormatState";
import { RECHART_STYLE } from "@app/utils/rechartsStyle";
import { FC, useSyncExternalStore } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { IReportChart } from "./ReportChart.types";
import { getReportChartData } from "./reportChartData";

export const ReportChart: FC<IReportChart> = ({ records }) => {
  const dateTimeFormat = useSyncExternalStore(subscribeDateTimeFormat, getDateTimeFormat);
  const data = getReportChartData(records, dateTimeFormat.dateFormat);

  return (
    <WidgetContainer title="Report Chart">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 15, right: 18, bottom: 0, left: 0 }}>
          <Legend
            position="insideTopRight"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: RECHART_STYLE.main.fontSize }}
            itemSorter={(item) => (item.dataKey === "success" ? 0 : 1)}
            formatter={(value) => (value === "success" ? "Successful" : "Failed")}
          />
          <Tooltip
            itemSorter={(item) => (item.dataKey === "success" ? 0 : 1)}
            formatter={(value, name) => [value, name === "success" ? "Successful" : "Failed"]}
            labelFormatter={(label) => {
              const date = data.find((day) => day.label === label)?.date;
              return date ? formatDate(date, dateTimeFormat.dateFormat) : label;
            }}
            itemStyle={{ display: "block", paddingTop: "var(--spacing-xs)", paddingBottom: 0 }}
            contentStyle={{
              border: "none",
              borderRadius: "var(--spacing-l)",
              backgroundColor: "var(--background-secondary)",
              fontSize: RECHART_STYLE.main.fontSize,
            }}
          />
          <CartesianGrid stroke={RECHART_STYLE.main.colorStroke} strokeDasharray="10 10" />
          <YAxis
            width={40}
            domain={[0, "dataMax"]}
            allowDecimals={false}
            tick={{ fill: RECHART_STYLE.main.colorStroke, fontSize: RECHART_STYLE.main.fontSize }}
            tickLine={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fill: RECHART_STYLE.main.colorStroke, fontSize: RECHART_STYLE.main.fontSize }}
            tickLine={false}
            minTickGap={20}
          />
          <Line
            type="bump"
            dataKey="error"
            stroke="var(--red)"
            strokeWidth={RECHART_STYLE.line.strokeWidth}
            dot={RECHART_STYLE.line.dot}
            activeDot={RECHART_STYLE.line.activeDot}
          />
          <Line
            type="bump"
            dataKey="success"
            stroke="var(--green)"
            strokeWidth={RECHART_STYLE.line.strokeWidth}
            dot={RECHART_STYLE.line.dot}
            activeDot={RECHART_STYLE.line.activeDot}
          />
        </LineChart>
      </ResponsiveContainer>
    </WidgetContainer>
  );
};
