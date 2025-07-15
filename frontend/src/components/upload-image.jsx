import { Button, CircularProgress, Stack } from "@mui/material";
import { useState } from "react";
import InfoSnackBar from "./info-sncakbar";
import { postFile } from "../utils/axios";

const SingleFileUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setIsloading(true);
    const res = await postFile(file);
    if (res.success) onUpload();
    setIsloading(false);
    setSuccess(res.success);
    setOpen(true);
    setMessage(res.success ? "File Uplaoded!" : res.error);
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
