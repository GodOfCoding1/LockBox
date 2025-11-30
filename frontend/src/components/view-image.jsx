import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import ArrowLeft from "@mui/icons-material/ArrowLeft";
import ArrowRight from "@mui/icons-material/ArrowRight";
import CloseIcon from "@mui/icons-material/Close";
import { Stack, Typography } from "@mui/material";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

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

  return (
    <React.Fragment>
      <BootstrapDialog fullWidth onClose={handleClose} open={isOpen}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          File {currentIdindex + shift + 1} of {imageIds.length}
        </DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {cardData[imageIds[currentIdindex + shift]] && (
            (() => {
              const currentFile = cardData[imageIds[currentIdindex + shift]];
              const mimeType = currentFile.mimeType || "image/jpeg";
              const fileType = currentFile.type || "image";
              
              if (fileType === "audio") {
                return (
                  <div style={{ padding: "20px", textAlign: "center" }}>
                    <audio
                      controls
                      autoPlay
                      style={{ width: "100%", maxWidth: "600px" }}
                      src={`data:${mimeType};base64,${currentFile.buffer}`}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                );
              } else if (fileType === "image") {
                return (
                  <img
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    src={`data:${mimeType};base64,${currentFile.buffer}`}
                    alt={imageIds[currentIdindex + shift]}
                  />
                );
              } else {
                return (
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <Typography variant="h6" gutterBottom>
                      {fileType || "File"} Preview
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      MIME Type: {mimeType}
                    </Typography>
                    <Button
                      variant="contained"
                      href={`data:${mimeType};base64,${currentFile.buffer}`}
                      download={`file.${currentFile.fileExtension || "bin"}`}
                      sx={{ mt: 2 }}
                    >
                      Download File
                    </Button>
                  </div>
                );
              }
            })()
          )}
        </DialogContent>
        <DialogActions>
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Button onClick={back}>
              <ArrowLeft />
            </Button>
            <Button onClick={next}>
              <ArrowRight />
            </Button>
          </Stack>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
