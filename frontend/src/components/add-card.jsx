import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { Divider, Typography } from "@mui/material";
import SingleFileUploader from "./upload-image";
import TextUploader from "./upload-text";

export default function AddDialog({ open, onOpen, onClose }) {
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
      <Dialog fullWidth onClose={onClose} open={open}>
        <DialogTitle sx={{ pr: 6 }}>Add a file</DialogTitle>
        <IconButton
          aria-label="Close"
          onClick={onClose}
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
          <Typography variant="body2" color="text.secondary">
            Images, audio, and video are detected from the file and can be
            encrypted before upload.
          </Typography>
          <SingleFileUploader />
          <Divider sx={{ my: 3 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Or store text
          </Typography>
          <TextUploader />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
