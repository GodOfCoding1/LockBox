import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";

const TextUploader = () => {
  const [text, setText] = useState("");

  const handleUpload = async () => {
    // We will fill this out later
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
