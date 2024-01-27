import {
  Alert,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
} from "@mui/material";
import { useState } from "react";

const SingleFileUploader = () => {
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setIsloading(true);
    const url = "http://localhost:8000/api/image/";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setIsloading(false);
      setSuccess(data.success);
      setOpen(true);
    } catch (error) {
      alert("some error occured");
      console.log(error);
    }
  };
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  return (
    <>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Image Uploaded
        </Alert>
      </Snackbar>
      <Stack spacing={2}>
        <Button variant="contained" component="label">
          Choose File
          <input id="file" type="file" onChange={handleFileChange} hidden />
        </Button>
        {file && (
          <section>
            File details:
            <ul>
              <li>Name: {file.name}</li>
              <li>Type: {file.type}</li>
              <li>Size: {file.size} bytes</li>
            </ul>
          </section>
        )}

        {file && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress /> : "Upload file"}
          </Button>
        )}
      </Stack>
    </>
  );
};

export default SingleFileUploader;
