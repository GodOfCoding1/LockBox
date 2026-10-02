import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import ArrowLeft from "@mui/icons-material/ArrowLeft";
import ArrowRight from "@mui/icons-material/ArrowRight";
import CloseIcon from "@mui/icons-material/Close";
import { Box, Stack, Typography } from "@mui/material";

export default function ViewImage({
  imageIds,
  cardData,
  currentIdindex,
  isOpen,
  setOpen,
}) {
  const [shift, setShift] = React.useState(0);

  const handleClose = () => {
    setShift(0);
    setOpen(false);
  };

  const back = () => {
    setShift((prev) => (currentIdindex - prev - 1 >= 0 ? prev - 1 : prev));
  };
  const next = () => {
    setShift((prev) =>
      currentIdindex + prev + 1 >= imageIds.length ? prev : prev + 1
    );
  };

  const index = currentIdindex + shift;
  const currentId = imageIds[index];
  const currentFile = cardData[currentId];
  const title =
    currentFile?.fileName || `File ${index + 1} of ${imageIds.length}`;

  return (
    <Dialog fullWidth maxWidth="md" onClose={handleClose} open={isOpen}>
      <DialogTitle sx={{ pr: 6 }}>{title}</DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "text.secondary",
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        {currentFile && (
          <FileStage file={currentFile} label={currentId} />
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 2 }}>
        <Button onClick={back} disabled={index <= 0} startIcon={<ArrowLeft />}>
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary">
          {index + 1} of {imageIds.length}
        </Typography>
        <Button
          onClick={next}
          disabled={index >= imageIds.length - 1}
          endIcon={<ArrowRight />}
        >
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function FileStage({ file, label }) {
  const mimeType = file.mimeType || "image/jpeg";
  const fileType = file.type || "image";

  return (
    <Box
      sx={{
        bgcolor: "#0c0e12",
        borderRadius: 2,
        p: 2,
        minHeight: 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {fileType === "audio" ? (
        <audio
          controls
          autoPlay
          style={{ width: "100%", maxWidth: 600 }}
          src={`data:${mimeType};base64,${file.buffer}`}
        >
          Your browser does not support the audio element.
        </audio>
      ) : fileType === "image" ? (
        <Box
          component="img"
          sx={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
          src={`data:${mimeType};base64,${file.buffer}`}
          alt={file.fileName || label}
        />
      ) : (
        <Stack spacing={1.5} alignItems="center" sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="h6">{fileType || "File"} preview</Typography>
          <Typography variant="body2" color="text.secondary">
            {mimeType}
          </Typography>
          <Button
            variant="contained"
            href={`data:${mimeType};base64,${file.buffer}`}
            download={`${file.fileName || "file"}.${file.fileExtension || "bin"}`}
          >
            Download file
          </Button>
        </Stack>
      )}
    </Box>
  );
}
