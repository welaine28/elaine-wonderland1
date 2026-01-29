// client/src/pages/About.tsx
import { useEffect, useState } from "react";
import { fetchBenchmark } from "../api/api";
import ReactECharts from "echarts-for-react";

export default function DemoBenchmark() {
    const [data, setData] = useState<any>({});

    useEffect(() => {
        fetchBenchmark().then((data) => {
            setData(data);
        });
        }, []);

    if (!data || !data.question_id) {
        return <div>Loading...</div>;
    }
  const option = {
    title: {
      text: data.question_id,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
    },
    legend: {
      top: 32,
    },
    grid: {
      left: 48,
      right: 24,
      top: 80,
      bottom: 48,
      containLabel: true,
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      scale: true,
      name:
        data.series.length === 1
          ? `${data.series[0].metric_name} (${data.series[0].metric_unit ?? ""})`
          : undefined,
    },
    series: data.series.map((s) => ({
      name: `${s.ai_agent_name} · ${s.metric_name}${
        s.metric_unit ? ` (${s.metric_unit})` : ""
      }`,
      type: "line",
      showSymbol: false,
      smooth: false,
      emphasis: { focus: "series" },
      data: s.points.map((p) => [
        p.timestamp,                 // ISO string → time axis
        Number(p.metric_value),      // convert string → number
      ]),
    })),
  };

  return (
    <div>
        <div>{JSON.stringify(data)}</div>;
         <ReactECharts
            option={option}
            style={{ height: 400, width: "100%" }}
            notMerge
            lazyUpdate
            />
    </div>

  );
};
