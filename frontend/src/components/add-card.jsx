import * as React from "react";
import Button from "@mui/material/Button";
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
  Typography,
} from "@mui/material";
import SingleFileUploader from "./upload-image";
import TextUploader from "./upload-text";

export default function AddDialog({ open, onOpen, onClose }) {
  const [type, setType] = React.useState("");

  const handleClose = () => {
    onClose();
    setType("");
  };

  return (
    <React.Fragment>
      <Button
        type="button"
        variant="outlined"
        onClick={onOpen}
        startIcon={<AddIcon />}
        sx={{ mt: { sm: 1 } }}
      >
        Add file
      </Button>
      <Dialog fullWidth onClose={handleClose} open={open}>
        <DialogTitle sx={{ pr: 6 }}>Add a file</DialogTitle>
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose what you want to store. Images, audio, and video can be encrypted
            before upload.
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="select-type">Data type</InputLabel>
            <Select
              labelId="select-type"
              id="dataType"
              value={type}
              label="Data type"
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value={"image"}>Image</MenuItem>
              <MenuItem value={"audio"}>Audio</MenuItem>
              <MenuItem value={"text"}>Text</MenuItem>
              <MenuItem value={"video"}>Video</MenuItem>
            </Select>
            <FormHelperText>Select the type of data you want to store.</FormHelperText>
          </FormControl>
          {type === "image" ? (
            <SingleFileUploader fileType="image" />
          ) : type === "audio" ? (
            <SingleFileUploader fileType="audio" />
          ) : type === "text" ? (
            <TextUploader />
          ) : type === "video" ? (
            <SingleFileUploader fileType="video" />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
