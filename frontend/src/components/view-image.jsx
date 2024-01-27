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
import { Stack } from "@mui/material";

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
          Image {currentIdindex + shift + 1} of {imageIds.length}
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
            <img
              style={{ width: "100%", height: "100%" }}
              src={`data:image;base64,${
                cardData[imageIds[currentIdindex + shift]].buffer
              }`}
              alt={imageIds[currentIdindex + shift]}
            />
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
