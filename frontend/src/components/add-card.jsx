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
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
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
          <FormControl sx={{ m: 1, minWidth: 120 }}>
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
              <MenuItem value={"video"}>Video</MenuItem>
            </Select>
            <FormHelperText>
              Select the type of data you want to encrypt
            </FormHelperText>
          </FormControl>
          {type === "image" ? (
            <SingleFileUploader />
          ) : type === "text" ? (
            <TextUploader />
          ) : (
            ""
          )}
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
