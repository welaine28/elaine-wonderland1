import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

function makeTimeSeriesChartOption(data: any) {
  const option = {
    title: {
      text: `Speedup over time – ${data.question_id}`,
    },

    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number) => `${v.toFixed(3)}x`,
    },

    legend: {
      top: 40,
    },

    xAxis: {
      type: "time",
      axisLabel: {
        formatter: "{yyyy}-{MM}-{dd}",
      },
    },

    yAxis: {
      type: "value",
      name: "Speedup (x)",
      axisLabel: {
        formatter: "{value}x",
      },
    },
    series: data.series.map((s: any) => ({
      name: s.ai_agent_name,
      type: "line",
      showSymbol: true,
      data: s.points.map((p: any) => [
        new Date(p.timestamp).getTime(), // timestamp → ms
        p.speedup,
      ]),
    })),

    dataZoom: [
      { type: "inside", xAxisIndex: 0 },
      { type: "slider", xAxisIndex: 0 },
    ],
  };
  return option;
}

export default function TimeSeriesChart({ data }: { data: any }) {
  console.log("TimeSeriesChart",data);
  const option = useMemo(() => makeTimeSeriesChartOption(data), [data]);
  return (
    <ReactECharts
      option={option}
      style={{ height: 400, width: "100%" }}
      notMerge
      lazyUpdate
    />
  );
}
