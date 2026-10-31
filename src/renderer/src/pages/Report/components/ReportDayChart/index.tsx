import { WidgetContainer } from "@app/pages/Settings/components/WidgetContainer";
import { Select } from "@app/ui/Select";
import { formatDate } from "@app/utils/dateTime";
import { getDateTimeFormat, subscribeDateTimeFormat } from "@app/utils/dateTimeFormatState";
import { RECHART_STYLE } from "@app/utils/rechartsStyle";
import { TimeFormat } from "@shared/types/settings";
import { FC, useMemo, useState, useSyncExternalStore } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { IReportDayChart } from "./ReportDayChart.types";
import { getAvailableDays, getReportDayChartData } from "./reportDayChartData";

export const ReportDayChart: FC<IReportDayChart> = ({ records }) => {
  const dateTimeFormat = useSyncExternalStore(subscribeDateTimeFormat, getDateTimeFormat);
  const days = useMemo(() => getAvailableDays(records), [records]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const currentDay = selectedDay !== null && days.includes(selectedDay) ? selectedDay : days[0];
  const isTwelveHour = dateTimeFormat.timeFormat === TimeFormat.TWELVE_HOUR;
  const data = useMemo(
    () => (currentDay === undefined ? [] : getReportDayChartData(records, currentDay, isTwelveHour)),
    [records, currentDay, isTwelveHour]
  );

  const options = days.map((day) => ({
    value: String(day),
    label: formatDate(new Date(day), dateTimeFormat.dateFormat),
  }));

  return (
    <WidgetContainer title="Report by Hours">
      <Select
        value={currentDay === undefined ? "" : String(currentDay)}
        onChange={(value) => setSelectedDay(Number(value))}
        options={options}
        placeholder="No days"
      />
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 15, right: 18, bottom: 0, left: 0 }}>
          <Tooltip
            itemSorter={(item) => (item.dataKey === "success" ? 0 : 1)}
            formatter={(value, name) => [value, name === "success" ? "Successful" : "Failed"]}
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
