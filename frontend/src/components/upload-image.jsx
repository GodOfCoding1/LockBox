import { Box, Button, CircularProgress, Stack, FormControlLabel, Checkbox, Typography, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfoSnackBar from "./info-sncakbar";
import { api } from "../utils/axios";

const SingleFileUploader = ({ fileType = "image" }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
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

  const selectFile = useCallback((selectedFile) => {
    setFile(selectedFile);
    // Set initial file name to the original file name without extension
    setFileName(selectedFile.name.replace(/\.[^/.]+$/, ""));
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      selectFile(e.target.files[0]);
    }
  };

  const selectClipboardImage = useCallback(
    (blob) => {
      const mimeSubtype = blob.type.split("/")[1] || "png";
      const extension = mimeSubtype === "jpeg" ? "jpg" : mimeSubtype;
      const clipboardFile = new File(
        [blob],
        `clipboard-${Date.now()}.${extension}`,
        {
          type: blob.type || "image/png",
          lastModified: Date.now(),
        }
      );
      selectFile(clipboardFile);
    },
    [selectFile]
  );

  useEffect(() => {
    if (fileType !== "image") return undefined;

    const handlePaste = (event) => {
      const imageItem = Array.from(event.clipboardData?.items || []).find(
        (item) => item.kind === "file" && item.type.startsWith("image/")
      );
      const imageBlob = imageItem?.getAsFile();

      if (imageBlob) {
        event.preventDefault();
        selectClipboardImage(imageBlob);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [fileType, selectClipboardImage]);

  useEffect(() => {
    if (fileType !== "image" || !file) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, fileType]);

  const handleClipboardRead = async () => {
    if (!navigator.clipboard?.read) {
      setSuccess(false);
      setMessage("Clipboard image access is not supported by this browser. Use Ctrl+V or Cmd+V instead.");
      setOpen(true);
      return;
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.find((type) =>
          type.startsWith("image/")
        );
        if (imageType) {
          selectClipboardImage(await clipboardItem.getType(imageType));
          return;
        }
      }

      setSuccess(false);
      setMessage("No image was found on the clipboard.");
      setOpen(true);
    } catch (error) {
      setSuccess(false);
      setMessage("Could not read the clipboard. Allow clipboard access or use Ctrl+V or Cmd+V.");
      setOpen(true);
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
      setFileName("");
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
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button variant="contained" component="label" fullWidth>
            Choose {fileType === "audio" ? "Audio" : fileType === "image" ? "Image" : "File"} File
            <input
              id="file"
              type="file"
              accept={getAcceptAttribute()}
              onChange={handleFileChange}
              hidden
            />
          </Button>
          {fileType === "image" && (
            <Button variant="outlined" onClick={handleClipboardRead} fullWidth>
              Paste image
            </Button>
          )}
        </Stack>
        {fileType === "image" && (
          <Typography variant="body2" color="text.secondary">
            Paste a copied screenshot with Ctrl+V or Cmd+V.
          </Typography>
        )}
        {file && (
          <section>
            {previewUrl && (
              <Box
                component="img"
                src={previewUrl}
                alt="Selected upload preview"
                sx={{
                  display: "block",
                  width: "100%",
                  maxHeight: 280,
                  mb: 2,
                  borderRadius: 1,
                  objectFit: "contain",
                  bgcolor: "action.hover",
                }}
              />
            )}
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
