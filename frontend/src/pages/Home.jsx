import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import { CircularProgress, IconButton, Skeleton, TextField } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LockIcon from "@mui/icons-material/Lock";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useCallback, useEffect, useRef, useState } from "react";
import { Buffer } from "buffer";
import AddDialog from "../components/add-card";
import ViewImage from "../components/view-image";
import { api } from "../utils/axios";
import InfoSnackBar from "../components/info-sncakbar";
import { useNavigate } from "react-router-dom";

function Home() {
  const [password, setPassword] = useState("");
  const [imageIds, setImageIds] = useState([]);
  const [cardData, setCardData] = useState({});
  const [isViewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [loadingIds, setLoadingIds] = useState(true);
  const [unlockState, setUnlockState] = useState("idle");
  const [addOpen, setAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  const showMessage = (nextMessage, nextType) => {
    setMessage(nextMessage);
    setType(nextType);
    setOpen(true);
  };

  const openImage = (id) => {
    setCurrentIndex(imageIds.indexOf(id));
    setViewerOpen(true);
  };

  const fetchIDs = useCallback(async () => {
    setLoadingIds(true);
    try {
      const res = await api.get("/file/id");
      if (!res.data.success) {
        setMessage("Could not load your files.");
        setType("error");
        setOpen(true);
        return;
      }
      setImageIds(res.data.data.ids);
    } catch (error) {
      console.log(error);
      setMessage(error.message + ":" + error?.response?.data?.message);
      setType("error");
      setOpen(true);
    } finally {
      setLoadingIds(false);
    }
  }, []);

  const onDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`file/${pendingDelete}`);
      setImageIds((prev) => prev.filter((i) => i !== pendingDelete));
      setCardData((prev) => {
        const next = { ...prev };
        delete next[pendingDelete];
        return next;
      });
      setPendingDelete(null);
    } catch (error) {
      console.log(error);
      showMessage(
        error.message + ": " + error?.response?.data?.message,
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchIDs();
    return () => {
      const client = socketRef.current;
      socketRef.current = null;
      client?.close();
    };
  }, [fetchIDs]);

  const connectSocket = () => {
    if (!window.localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }
    if (!password) {
      showMessage("Enter your master password to unlock files.", "error");
      return;
    }

    socketRef.current?.close();
    setUnlockState("unlocking");

    const wsProtocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    let wsUrl;

    if (process.env.NODE_ENV === "development") {
      wsUrl = `${wsProtocol}${window.location.hostname}:8000/websocket`;
    } else {
      wsUrl = `${wsProtocol}${window.location.host}/websocket`;
    }

    const client = new window.WebSocket(
      `${wsUrl}?token=${window.localStorage.getItem("token")}`
    );
    socketRef.current = client;

    client.onopen = () => {
      client.send(JSON.stringify({ event: "DECODE_IMAGES", password }));
    };

    client.onmessage = (event) => {
      if (socketRef.current !== client) return;
      const data = JSON.parse(event.data);
      if (data.event === "DECODE_STARTED") {
        setUnlockState("unlocked");
        showMessage(data.data.message, "info");
      }
      if (data.event === "DECODE_IMAGES") {
        const mimeType = data.data.mimeType || "image/jpeg";
        const fileExtension = data.data.fileExtension || "jpeg";
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
            fileName: data.data.fileName,
          },
        }));
      }
      if (data.event === "ERROR") {
        setUnlockState("idle");
        showMessage(data.message, "error");
      }
    };
    client.onerror = function (ev) {
      if (socketRef.current !== client) return;
      setUnlockState("idle");
      showMessage("Could not connect to unlock your files.", "error");
      console.log("Connection Error", ev);
    };
  };

  const renderFileBody = (id) => {
    const file = cardData[id];
    if (!file && unlockState === "idle") {
      return (
        <Box
          sx={{
            height: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            color: "text.secondary",
            bgcolor: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <LockOutlinedIcon />
          <Typography variant="body2">Locked</Typography>
        </Box>
      );
    }
    if (!file) {
      return <Skeleton variant="rectangular" height={180} />;
    }

    if (file.type === "audio") {
      return (
        <Box sx={{ p: 2.5, textAlign: "center" }}>
          <audio
            controls
            style={{ width: "100%" }}
            src={`data:${file.mimeType};base64,${file.buffer}`}
          >
            Your browser does not support the audio element.
          </audio>
        </Box>
      );
    }

    if (file.type === "image") {
      return (
        <Box
          component="img"
          src={`data:${file.mimeType || "image/jpeg"};base64,${file.buffer}`}
          alt={file.fileName || id}
          sx={{
            display: "block",
            width: "100%",
            height: 180,
            objectFit: "cover",
            bgcolor: "#0c0e12",
          }}
        />
      );
    }

    return (
      <Box sx={{ p: 2.5, textAlign: "center" }}>
        <Typography variant="body2" sx={{ mb: 1.5 }}>
          {file.type || "File"} file
        </Typography>
        <Button
          size="small"
          variant="outlined"
          href={`data:${file.mimeType};base64,${file.buffer}`}
          download={`${file.fileName || "file"}.${file.fileExtension || "bin"}`}
        >
          Download
        </Button>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar position="static">
        <Toolbar>
          <LockIcon sx={{ mr: 1.5, color: "primary.main" }} />
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            LockBox
          </Typography>
          <IconButton
            color="inherit"
            aria-label="Log out"
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
      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Unlock files
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Files stay encrypted until you enter the master password you chose
            when you created your account.
          </Typography>
          <Stack
            component="form"
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ sm: "flex-start" }}
            onSubmit={(event) => {
              event.preventDefault();
              connectSocket();
            }}
          >
            <TextField
              id="password"
              label="Master password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Decrypts the files in this vault."
              sx={{ minWidth: { sm: 280 } }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={unlockState === "unlocking"}
              startIcon={
                unlockState === "unlocking" ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
              sx={{ mt: { sm: 1 }, minWidth: 120 }}
            >
              {unlockState === "unlocking" ? "Unlocking" : "Unlock"}
            </Button>
            <AddDialog
              open={addOpen}
              onOpen={() => setAddOpen(true)}
              onClose={() => setAddOpen(false)}
            />
          </Stack>
        </Paper>

        <ViewImage
          imageIds={imageIds}
          cardData={cardData}
          currentIdindex={currentIndex}
          isOpen={isViewerOpen}
          setOpen={setViewerOpen}
        />

        {loadingIds ? (
          <Grid container spacing={3}>
            {[0, 1, 2].map((item) => (
              <Grid item key={item} xs={12} sm={6} md={4}>
                <Skeleton variant="rounded" height={248} />
              </Grid>
            ))}
          </Grid>
        ) : imageIds.length === 0 ? (
          <Paper
            sx={{
              py: 8,
              px: 3,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "transparent",
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 36, color: "primary.main", mb: 1.5 }} />
            <Typography variant="h6" gutterBottom>
              Your vault is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Add a file and it will show up here, still encrypted.
            </Typography>
            <Button variant="contained" onClick={() => setAddOpen(true)}>
              Add file
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {imageIds.map((id) => (
              <Grid item key={id} xs={12} sm={6} md={4}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {cardData[id]?.fileName && (
                    <CardHeader
                      title={cardData[id].fileName}
                      titleTypographyProps={{ variant: "subtitle1", noWrap: true }}
                    />
                  )}
                  {renderFileBody(id)}
                  <CardActions sx={{ mt: "auto" }}>
                    <Button
                      size="small"
                      onClick={() => openImage(id)}
                      disabled={!cardData[id]}
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => setPendingDelete(id)}
                      size="small"
                      color="warning"
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Box component="footer" sx={{ px: 3, py: 3 }}>
        <Typography variant="body2" align="center" color="text.secondary">
          Files stay encrypted until you enter your master password.
        </Typography>
      </Box>

      <Dialog
        open={Boolean(pendingDelete)}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete this file?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This removes the encrypted file from your vault. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDelete(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={onDelete}
            color="warning"
            variant="contained"
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {deleting ? "Deleting" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;
