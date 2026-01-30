// client/src/pages/About.tsx
import { useEffect, useState } from "react";
import { fetchBenchmark } from "../api/api";
import { SeriesExpandableTable } from "./components/list";
import { Box } from "@mui/material";
import { GroupedBarChart } from "./components/groupBarChart";
import TimeSeriesChart from "./components/timeseriesChart";

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

  return (
    <div style={{ textAlign: "left", width: "1000px" }}>
      <TimeSeriesChart data={data} />
      <GroupedBarChart data={data} />
      <br />
      <Box sx={{ p: 2 }}>
        <SeriesExpandableTable
          series={data.series}
          title="AI Benchmark Details"
        />
      </Box>
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
