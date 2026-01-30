import * as React from "react";
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { MetadataDrawer } from "./sidepanel";

type SeriesPoint = {
  baseline_score: number;
  labels?: string[];
  metadata?: Record<string, unknown>;
  model_score: number;
  speedup: number;
  timestamp: string; // ISO
};

type SeriesRow = {
  agent_type: string;
  ai_agent_name: string;
  metric_name: string;
  metric_unit: string;
  points: SeriesPoint[];
};

type Props = {
  series: SeriesRow[];
  title?: string;
};

function formatIso(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  // readable in local timezone
  return d.toLocaleString();
}

function toJsonPretty(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function safeNumber(n: unknown): number | null {
  if (typeof n === "number" && Number.isFinite(n)) return n;
  return null;
}

function calcSummary(points: SeriesPoint[]) {
  const speedups = points
    .map((p) => p.speedup)
    .filter((v) => Number.isFinite(v));
  const last = points
    .slice()
    .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
    .at(-1);

  const avg =
    speedups.length > 0
      ? speedups.reduce((a, b) => a + b, 0) / speedups.length
      : null;
  const best = speedups.length > 0 ? Math.max(...speedups) : null;

  return {
    count: points.length,
    avgSpeedup: avg,
    bestSpeedup: best,
    lastSpeedup: last?.speedup ?? null,
    lastTs: last?.timestamp ?? null,
  };
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  };

  return (
    <Tooltip title={copied ? "Copied" : (label ?? "Copy")}>
      <IconButton size="small" onClick={onCopy} aria-label="copy">
        <ContentCopyIcon fontSize="inherit" />
      </IconButton>
    </Tooltip>
  );
}
function SeriesPointsTable({
  points,
  seriesLabel,
}: {
  points: SeriesPoint[];
  seriesLabel: string;
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerMeta, setDrawerMeta] = React.useState<unknown>(null);
  const [drawerTitle, setDrawerTitle] = React.useState<string>("");

  const sorted = React.useMemo(() => {
    return points
      .slice()
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [points]);

  return (
    <>
      <Table size="small" aria-label="points">
        <TableHead>
          <TableRow>
            <TableCell width={220}>Timestamp</TableCell>
            <TableCell align="right" width={120}>
              Speedup
            </TableCell>
            <TableCell align="right" width={140}>
              Model score
            </TableCell>
            <TableCell align="right" width={140}>
              Baseline score
            </TableCell>
            <TableCell>Labels</TableCell>
            <TableCell width={180}>Metadata</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {sorted.map((p, idx) => {
            const labels = p.labels ?? [];

            return (
              <TableRow key={`${p.timestamp}-${idx}`} hover>
                <TableCell sx={{ verticalAlign: "top" }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">
                      {formatIso(p.timestamp)}
                    </Typography>
                    <CopyButton text={p.timestamp} label="Copy timestamp" />
                  </Stack>
                </TableCell>

                <TableCell align="right" sx={{ verticalAlign: "top" }}>
                  <Typography variant="body2" fontWeight={600}>
                    {p.speedup.toFixed(3)}x
                  </Typography>
                </TableCell>

                <TableCell align="right" sx={{ verticalAlign: "top" }}>
                  <Typography variant="body2">
                    {safeNumber(p.model_score)?.toLocaleString(undefined, {
                      maximumFractionDigits: 3,
                    }) ?? String(p.model_score)}
                  </Typography>
                </TableCell>

                <TableCell align="right" sx={{ verticalAlign: "top" }}>
                  <Typography variant="body2">
                    {safeNumber(p.baseline_score)?.toLocaleString() ??
                      String(p.baseline_score)}
                  </Typography>
                </TableCell>

                <TableCell sx={{ verticalAlign: "top" }}>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {labels.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    ) : (
                      labels.map((lab) => (
                        <Chip
                          key={lab}
                          size="small"
                          label={lab}
                          variant="outlined"
                        />
                      ))
                    )}
                  </Stack>
                </TableCell>

                <TableCell sx={{ verticalAlign: "top" }}>
                  {p.metadata ? (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setDrawerMeta(p.metadata);
                        setDrawerTitle(
                          `${seriesLabel} · ${new Date(p.timestamp).toLocaleString()}`,
                        );
                        setDrawerOpen(true);
                      }}
                    >
                      View
                    </Button>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <MetadataDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        metadata={drawerMeta}
      />
    </>
  );
}

function SeriesRowExpandable({ row }: { row: SeriesRow }) {
  const [open, setOpen] = React.useState(false);
  const summary = React.useMemo(() => calcSummary(row.points), [row.points]);

  return (
    <>
      <TableRow hover>
        <TableCell width={48}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            useFlexGap
            flexWrap="wrap"
          >
            <Typography variant="subtitle2">{row.ai_agent_name}</Typography>
            <Chip size="small" label={row.agent_type} variant="outlined" />
          </Stack>
        </TableCell>

        <TableCell>{row.metric_name}</TableCell>

        <TableCell width={90}>{row.metric_unit}</TableCell>

        <TableCell align="right" width={90}>
          {summary.count}
        </TableCell>

        <TableCell align="right" width={140}>
          {summary.avgSpeedup == null
            ? "—"
            : `${summary.avgSpeedup.toFixed(3)}x`}
        </TableCell>

        <TableCell align="right" width={140}>
          {summary.bestSpeedup == null
            ? "—"
            : `${summary.bestSpeedup.toFixed(3)}x`}
        </TableCell>

        <TableCell align="right" width={180}>
          {summary.lastSpeedup == null ? (
            "—"
          ) : (
            <Stack spacing={0} alignItems="flex-end">
              <Typography variant="body2" fontWeight={600}>
                {summary.lastSpeedup.toFixed(3)}x
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {summary.lastTs ? formatIso(summary.lastTs) : ""}
              </Typography>
            </Stack>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1.5 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle2">Points</Typography>
                  <Chip size="small" label={`${row.points.length} items`} />
                </Stack>
                <Divider />
                <SeriesPointsTable points={row.points} />
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function SeriesExpandableTable({ series, title }: Props) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">{title ?? "Series"}</Typography>
        <Typography variant="body2" color="text.secondary">
          Each series is a row. Expand to see per-point subrows with labels +
          pretty metadata.
        </Typography>
      </Box>

      <Table aria-label="series table">
        <TableHead>
          <TableRow>
            <TableCell width={48} />
            <TableCell>Agent</TableCell>
            <TableCell>Metric</TableCell>
            <TableCell width={90}>Unit</TableCell>
            <TableCell align="right" width={90}>
              Points
            </TableCell>
            <TableCell align="right" width={140}>
              Avg speedup
            </TableCell>
            <TableCell align="right" width={140}>
              Best speedup
            </TableCell>
            <TableCell align="right" width={180}>
              Latest
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {series.map((row, idx) => (
            <SeriesRowExpandable
              key={`${row.ai_agent_name}-${idx}`}
              row={row}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
