import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader"; // Added missing CardHeader import
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { IconButton, Skeleton, TextField } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import AddDialog from "../components/add-card";
import ViewImage from "../components/view-image";
import { api } from "../utils/axios";
import InfoSnackBar from "../components/info-sncakbar";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";

function Home() {
  const [password, setPassword] = useState("");
  const [imageIds, setImageIds] = useState([]);
  const [cardData, setCardData] = useState({});
  const [isViewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState(false);
  const navigate = useNavigate();

  const openImage = (id) => {
    setCurrentIndex(imageIds.indexOf(id));
    setViewerOpen(true);
  };

  const fetchIDs = async () => {
    try {
      // Use generic /file/ endpoint that supports all file types
      const res = await api.get("/file/id");
      if (!res.data.success) {
        return alert("some error occured");
      }
      console.log("file ids", res.data.data.ids);
      setImageIds(res.data.data.ids);
    } catch (error) {
      console.log(error);
      setMessage(error.message + ":" + error?.response?.data?.message);
      setType("error");
      setOpen(true);
    }
  };

  const onDelete = async (id) => {
    try {
      if (!window.confirm("are you sure?")) return;
      // Use generic /file/ endpoint that supports all file types
      await api.delete(`file/${id}`);
      setImageIds((prev) => prev.filter((i) => i !== id));
    } catch (error) {
      console.log(error);
      setMessage(error.message + ": " + error?.response?.data?.message);
      setType("error");
      setOpen(true);
    }
  };

  useEffect(() => {
    fetchIDs();
  }, []);

  const connectSocket = () => {
    if (!window.localStorage.getItem("token")) window.location.href = "/login";
    
    const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    let wsUrl;
    
    if (process.env.NODE_ENV === 'development') {
      // In development, connect to port 8000
      wsUrl = `${wsProtocol}${window.location.hostname}:8000/websocket`;
    } else {
      // In production, use the same host and port as the current page
      wsUrl = `${wsProtocol}${window.location.host}/websocket`;
    }
    
    const client = new window.WebSocket(
      `${wsUrl}?token=${window.localStorage.getItem("token")}`
    );
    client.onopen = () => {
      client.send(JSON.stringify({ event: "DECODE_IMAGES", password }));
    };

    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.event === "DECODE_STARTED") {
        setMessage(data.data.message);
        setType("info");
        setOpen(true);
      }
      if (data.event === "DECODE_IMAGES") {
        const mimeType = data.data.mimeType || "image/jpeg";
        const fileExtension = data.data.fileExtension || "jpeg";
        // Determine file type from mimeType
        let fileType = "image";
        if (mimeType.startsWith("audio/")) {
          fileType = "audio";
        } else if (mimeType.startsWith("video/")) {
          fileType = "video";
        } else if (mimeType.startsWith("image/")) {
          fileType = "image";
        }
        
        setCardData((prev) => ({
          ...prev,
          [data.data.id]: {
            buffer: Buffer.from(data.data.buffer).toString("base64"),
            type: fileType,
            mimeType: mimeType,
            fileExtension: fileExtension,
            fileName: data.data.fileName, // Add file name from server
          },
        }));
      }
      if (data.event === "ERROR") {
        setMessage(data.message);
        setType("error");
        setOpen(true);
      }
    };
    client.onerror = function (ev) {
      alert("some error occured");
      console.log("Connection Error", ev);
    };
  };

  return (
    <div className="home">
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit">
            <LockIcon sx={{ mr: 2 }} />
          </IconButton>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            LockBox
          </Typography>

          <IconButton
            color="inherit"
            onClick={() => {
              window.localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <InfoSnackBar
        message={message}
        type={type}
        open={open}
        setOpen={setOpen}
      />
      <main>
        {/* Hero unit */}

        <Stack
          spacing={3}
          sx={{
            bgcolor: "background.paper",
            py: 5,
            px: 5,
          }}
          direction={"row"}
        >
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            sx={{ marginY: 1 }}
            variant="contained"
            onClick={connectSocket}
          >
            Connect
          </Button>
          <AddDialog />
        </Stack>

        <Container maxWidth="md">
          <ViewImage
            imageIds={imageIds}
            cardData={cardData}
            currentIdindex={currentIndex}
            isOpen={isViewerOpen}
            setOpen={setViewerOpen}
          />
          {/* End hero unit */}
          <Grid container spacing={4}>
            {imageIds.length !== 0 ? (
              imageIds.map((id, i) => (
                <Grid item key={i} xs={12} sm={6} md={4}>
                  <Card
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {cardData[id] ? (
                      <>
                        <CardHeader
                          title={cardData[id].fileName || `File ${i + 1}`}
                        />
                        {cardData[id].type === "audio" ? (
                          <div style={{ padding: "20px", textAlign: "center" }}>
                            <audio
                              controls
                              style={{ width: "100%" }}
                              src={`data:${cardData[id].mimeType};base64,${cardData[id].buffer}`}
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : cardData[id].type === "image" ? (
                          <img
                            src={`data:${cardData[id].mimeType || "image/jpeg"};base64,${cardData[id].buffer}`}
                            alt={cardData[id].fileName || id}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        ) : (
                          <div style={{ padding: "20px", textAlign: "center" }}>
                            <Typography variant="body2">
                              {cardData[id].type || "File"} file
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              href={`data:${cardData[id].mimeType};base64,${cardData[id].buffer}`}
                              download={`${cardData[id].fileName || 'file'}.${cardData[id].fileExtension || "bin"}`}
                            >
                              Download
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <Skeleton variant="rectangular" height={200} />
                    )}
                    <CardActions>
                      <Button size="small" onClick={() => openImage(id)}>
                        View
                      </Button>
                      <Button
                        onClick={() => onDelete(id)}
                        size="small"
                        color="warning"
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              <Typography variant="subtitle1" padding={5}>
                Start Uploading Data and it will show up here
              </Typography>
            )}
          </Grid>
        </Container>
      </main>
      {/* Footer */}
      <Box sx={{ bgcolor: "background.paper", p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          About
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Your files are encrypted and can only be unlocked using your password.
          You never have to worry about a data leak.
        </Typography>
      </Box>
      {/* End footer */}
    </div>
  );
}

export default Home;
