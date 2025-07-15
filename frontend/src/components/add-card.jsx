import * as React from "react";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import SingleFileUploader from "./upload-image";
import TextUploader from "./upload-text";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function AddDialog() {
  const [open, setOpen] = React.useState(false);

  const [type, setType] = React.useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button sx={{ marginY: 1 }} variant="outlined" onClick={handleClickOpen}>
        <AddIcon />
      </Button>
      <BootstrapDialog fullWidth onClose={handleClose} open={open}>
        <DialogTitle sx={{ m: 0, p: 2 }}>Encrypt Data</DialogTitle>
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
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="select-type">Data Type</InputLabel>
              <Select
                labelId="select-type"
                id="dataType"
                value={type}
                label="Data Type"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value={"image"}>Image</MenuItem>
                <MenuItem value={"text"}>Text</MenuItem>
              </Select>
            </FormControl>
            {type === "image" ? (
              <SingleFileUploader />
            ) : type === "text" ? (
              <TextUploader />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
