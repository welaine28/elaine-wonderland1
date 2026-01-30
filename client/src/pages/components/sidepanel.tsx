import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type MetadataDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  metadata?: unknown;
};

export function MetadataDrawer({
  open,
  onClose,
  title,
  metadata,
}: MetadataDrawerProps) {
  const json = metadata ? JSON.stringify(metadata, null, 2) : "";

  const copy = async () => {
    if (!json) return;
    await navigator.clipboard.writeText(json);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 520,
          maxWidth: "90vw",
        },
      }}
    >
      <Box
        sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6">{title ?? "Metadata"}</Typography>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Copy JSON">
              <IconButton size="small" onClick={copy}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Content */}
        <Box
          sx={{
            mt: 2,
            flex: 1,
            overflow: "auto",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1.5,
            bgcolor: "background.paper",
          }}
        >
          <Typography
            component="pre"
            variant="body2"
            sx={{
              m: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              lineHeight: 1.4,
            }}
          >
            {json || "—"}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
