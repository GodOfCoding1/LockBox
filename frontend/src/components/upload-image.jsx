import {
  Box,
  Button,
  CircularProgress,
  Stack,
  FormControlLabel,
  Checkbox,
  Typography,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfoSnackBar from "./info-sncakbar";
import { api } from "../utils/axios";

const FILE_ACCEPT =
  "image/*,.jpeg,.jpg,.png,.gif,.webp,audio/*,.mp3,.wav,.ogg,.aac,video/*,.mp4,.webm";

const IMAGE_EXTENSIONS = new Set(["jpeg", "jpg", "png", "gif", "webp"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "aac"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm"]);

const extensionOf = (name) => {
  const parts = (name || "").split(".");
  if (parts.length < 2) return "";
  return parts.pop().toLowerCase();
};

const detectFileKind = (file) => {
  const mime = file?.type || "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";

  const extension = extensionOf(file?.name);
  if (IMAGE_EXTENSIONS.has(extension)) return "image";
  if (AUDIO_EXTENSIONS.has(extension)) return "audio";
  if (VIDEO_EXTENSIONS.has(extension)) return "video";
  return "file";
};

const kindLabel = (kind) => {
  switch (kind) {
    case "image":
      return "Image";
    case "audio":
      return "Audio";
    case "video":
      return "Video";
    default:
      return "File";
  }
};

const SingleFileUploader = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [message, setMessage] = useState("");
  const [encrypt, setEncrypt] = useState(true);

  const fileKind = file ? detectFileKind(file) : "file";

  const selectFile = useCallback((selectedFile) => {
    setFile(selectedFile);
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
  }, [selectClipboardImage]);

  useEffect(() => {
    if (!file || detectFileKind(file) !== "image") {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleClipboardRead = async () => {
    if (!navigator.clipboard?.read) {
      setSuccess(false);
      setMessage(
        "Clipboard image access is not supported by this browser. Use Ctrl+V or Cmd+V instead."
      );
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
      setMessage(
        "Could not read the clipboard. Allow clipboard access or use Ctrl+V or Cmd+V."
      );
      setOpen(true);
    }
  };

  const handleUpload = async () => {
    setIsloading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName || file.name.replace(/\.[^/.]+$/, ""));
    formData.append("encrypt", encrypt);
    const uploadedLabel = kindLabel(detectFileKind(file));
    try {
      const res = await api.post("/file/", formData);
      setIsloading(false);
      setSuccess(res.data.success);
      setOpen(true);
      setMessage(`${uploadedLabel} uploaded.`);
      setFile(null);
      setFileName("");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setIsloading(false);
      console.log(error);
      setSuccess(false);
      setMessage(
        error.response
          ? error.message + error.response.data.message
          : "Upload failed. Try again."
      );
      setOpen(true);
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
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            bgcolor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            Choose an image, audio, or video file to store
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Or paste a copied screenshot with Ctrl+V or Cmd+V.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="center"
          >
            <Button variant="contained" component="label">
              Choose file
              <input
                id="file"
                type="file"
                accept={FILE_ACCEPT}
                onChange={handleFileChange}
                hidden
              />
            </Button>
            <Button variant="outlined" onClick={handleClipboardRead}>
              Paste image
            </Button>
          </Stack>
        </Box>
        {file && (
          <Box>
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
                  borderRadius: 2,
                  objectFit: "contain",
                  bgcolor: "#0c0e12",
                }}
              />
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {file.name} · {file.type || kindLabel(fileKind).toLowerCase()} ·{" "}
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            <TextField
              fullWidth
              label="File name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>
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
                  Encrypt file
                  {!encrypt && " (faster upload for large files)"}
                </Typography>
              }
            />
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={isLoading}
              startIcon={
                isLoading ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              {isLoading ? "Uploading" : "Upload file"}
            </Button>
          </>
        )}
      </Stack>
    </>
  );
};

export default SingleFileUploader;
