import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import CameraIcon from "@mui/icons-material/PhotoCamera";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Skeleton, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import AddDialog from "../components/add-card";
import ViewImage from "../components/view-image";
import { api } from "../utils/axios";
import InfoSnackBar from "../components/info-sncakbar";

function Home() {
  const [password, setPassword] = useState("");
  const [imageIds, setImageIds] = useState([]);
  const [cardData, setCardData] = useState({});
  const [isViewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState(false);

  const openImage = (id) => {
    setCurrentIndex(imageIds.indexOf(id));
    setViewerOpen(true);
  };

  const fetchIDs = async () => {
    try {
      const res = await api.get("/image/id");
      if (!res.data.success) {
        return alert("some error occured");
      }
      setImageIds(res.data.data.ids);
    } catch (error) {
      console.log(error);
    }
  };

  const onDelete = async (id) => {
    try {
      if (!window.confirm("are you sure?")) return;
      await api.delete(`image/${id}`);
      setImageIds((prev) => prev.filter((i) => i !== id));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchIDs();
  }, []);

  const connectSocket = () => {
    if (!window.localStorage.getItem("token")) window.location.href = "/login";
    const client = new window.WebSocket(
      "ws://localhost:8000/websocket?token=" +
        window.localStorage.getItem("token")
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
      if (data.event === "DECODE_IMAGES")
        setCardData((prev) => ({
          ...prev,
          [data.data.id]: {
            buffer: Buffer.from(data.data.buffer).toString("base64"),
            type: "image",
          },
        }));
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
      <AppBar position="relative">
        <Toolbar>
          <CameraIcon sx={{ mr: 2 }} />
          <Typography variant="h6" color="inherit" noWrap>
            Album layout
          </Typography>
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
                      <img
                        src={`data:image;base64,${cardData[id].buffer}`}
                        alt={id}
                      />
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
          Footer
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Something here to give the footer a purpose!
        </Typography>
      </Box>
      {/* End footer */}
    </div>
  );
}

export default Home;
