import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

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
