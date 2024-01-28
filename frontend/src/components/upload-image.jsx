import { Button, CircularProgress, Stack } from "@mui/material";
import { useState } from "react";
import InfoSnackBar from "./info-sncakbar";
import { api } from "../utils/axios";

const SingleFileUploader = () => {
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    try {
      const res = await api.post("/image/", formData);
      setIsloading(false);
      setSuccess(res.data.success);
      setOpen(true);
      setMessage("Image Uplaoded!");
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
