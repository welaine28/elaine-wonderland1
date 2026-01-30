// client/src/pages/About.tsx
import { useEffect, useMemo, useState } from "react";
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

    series: data.series.map((s) => ({
      name: s.ai_agent_name,
      type: "line",
      showSymbol: true,
      data: s.points.map((p) => [
        new Date(p.timestamp).getTime(), // timestamp → ms
        p.speedup,
      ]),
    })),

    dataZoom: [
      { type: "inside", xAxisIndex: 0 },
      { type: "slider", xAxisIndex: 0 },
    ],
  };
  return (
    <div style={{ textAlign: "left", width: "1000px" }}>
      <ReactECharts
        option={option}
        style={{ height: 400, width: "100%" }}
        notMerge
        lazyUpdate
      />
      <GroupedBarChart data={data} />
      <br />
      <DebugJson data={data} />
    </div>
  );
}

function DebugJson({ data }: { data: unknown }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow((v) => !v)} style={{ marginBottom: 8 }}>
        {show ? "Hide raw JSON" : "Show raw JSON"}
      </button>

      {show && (
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function buildLatestDataset(data: any) {
  const latest = (points: any[]) =>
    [...points]
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
      .at(-1);

  // collect value by [model][agent_type]
  const valueMap: Record<string, Record<string, number>> = {};
  const agentTypes = new Set<string>();
  const models = new Set<string>();

  for (const s of data.series) {
    const agentType = s.agent_type as string;
    const model = (s.ai_agent_name as string).replace(` ${agentType}`, "");
    const p = latest(s.points);
    if (!p) continue;

    agentTypes.add(agentType);
    models.add(model);

    valueMap[model] ??= {};
    valueMap[model][agentType] = p.speedup;
  }

  const agentTypeList = Array.from(agentTypes); // e.g. ["KernelAgent", "SecretAgent"]
  const modelList = Array.from(models); // e.g. ["claude4.5", "gpt5"]

  return [
    ["agent_type", ...agentTypeList],
    ...modelList.map((m) => [
      m,
      ...agentTypeList.map((t) => valueMap[m]?.[t] ?? null),
    ]),
  ];
}

function makeGroupedBarOption(data: any) {
  const datasetSource = buildLatestDataset(data);
  const models = datasetSource[0].slice(1);

  return {
    title: {
      text: `Latest speedup – ${data.question_id}`,
    },

    legend: {
      top: 40,
    },

    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v: number) => `${v.toFixed(3)}x`,
    },

    dataset: {
      source: datasetSource,
    },

    xAxis: {
      type: "category",
    },

    yAxis: {
      type: "value",
      name: "Speedup (x)",
    },

    series: models.map(() => ({
      type: "bar",
      seriesLayoutBy: "row",
    })),
  };
}

export function GroupedBarChart({ data }: { data: any }) {
  const option = useMemo(() => makeGroupedBarOption(data), [data]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 360, width: "100%" }}
      notMerge
      lazyUpdate
    />
  );
}
