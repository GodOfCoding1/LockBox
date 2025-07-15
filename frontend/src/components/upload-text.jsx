import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { postFile } from "../utils/axios";

const TextUploader = ({ onUpload }) => {
  const [text, setText] = useState("");

  const handleUpload = async () => {
    const file = new File([text], "text.txt", {
      type: "text/plain",
    });
    const res = await postFile(file);
    if (res.success) onUpload();
  };

  return (
    <Stack minWidth={"100%"} spacing={2}>
      <TextField
        placeholder="Text goes here.."
        multiline
        rows={2}
        onChange={(e) => setText(e.target.value)}
        value={text}
        maxRows={4}
      />
      {text && (
        <Button variant="contained" onClick={handleUpload}>
          Upload Text
        </Button>
      )}
    </Stack>
  );
};

export default TextUploader;
