import { Button, CircularProgress, Stack, FormControlLabel, Checkbox, Typography, TextField } from "@mui/material";
import { useState } from "react";
import InfoSnackBar from "./info-sncakbar";
import { api } from "../utils/axios";

const SingleFileUploader = ({ fileType = "image" }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [message, setMessage] = useState("");
  const [encrypt, setEncrypt] = useState(true);

  // Determine accepted file types based on fileType prop
  const getAcceptAttribute = () => {
    switch (fileType) {
      case "audio":
        return "audio/*,.mp3,.wav,.ogg,.aac";
      case "image":
        return "image/*,.jpeg,.jpg,.png,.gif,.webp";
      case "video":
        return "video/*,.mp4,.webm";
      default:
        return "*/*"; // Accept all files
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Set initial file name to the original file name without extension
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setFileName(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    setIsloading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName || file.name.replace(/\.[^/.]+$/, ''));
    formData.append("encrypt", encrypt);
    try {
      // Use generic /file/ endpoint that supports all file types
      const res = await api.post("/file/", formData);
      setIsloading(false);
      setSuccess(res.data.success);
      setOpen(true);
      const fileTypeLabel = fileType === "audio" ? "Audio" : fileType === "image" ? "Image" : "File";
      setMessage(`${fileTypeLabel} Uploaded!`);
      // Reset file input after successful upload
      setFile(null);
      // Reload the page after a short delay to show the new file
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      alert("some error occured");
      console.log(error);
      if (!error.response) return;
      setMessage(error.message + error.response.data.message);
      setOpen(true);
      setSuccess(false);
    }
  };
  return (
    <>
      <InfoSnackBar
        message={message}
        type={success ? "success" : "error"}
        open={open}
        setOpen={setOpen}
      />
      <Stack spacing={2}>
        <Button variant="contained" component="label">
          Choose {fileType === "audio" ? "Audio" : fileType === "image" ? "Image" : "File"} File
          <input 
            id="file" 
            type="file" 
            accept={getAcceptAttribute()}
            onChange={handleFileChange} 
            hidden 
          />
        </Button>
        {file && (
          <section>
            <Typography variant="body2" sx={{ mb: 1 }}>
              File details:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Name: {file.name}</li>
              <li>Type: {file.type}</li>
              <li>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</li>
            </ul>
            <TextField
              fullWidth
              margin="normal"
              label="File Name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              variant="outlined"
              size="small"
            />
          </section>
        )}

        {file && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={encrypt}
                  onChange={(e) => setEncrypt(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">
                  Encrypt file {!encrypt && "(faster upload for large files)"}
                </Typography>
              }
            />
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress /> : "Upload file"}
            </Button>
          </>
        )}
      </Stack>
    </>
  );
};

export default SingleFileUploader;
