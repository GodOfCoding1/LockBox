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
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Skeleton, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import AddDialog from "./components/add-card";
import ViewImage from "./components/view-image";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();
function App() {
  const [password, setPassword] = useState("");
  const [imageIds, setImageIds] = useState([]);
  const [cardData, setCardData] = useState({});
  const [isViewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(false);
  const [wb, setWebSocket] = useState();

  const openImage = (id) => {
    setCurrentIndex(imageIds.indexOf(id));
    setViewerOpen(true);
  };

  const fetchIDs = async () => {
    try {
      const res = await (
        await fetch("http://localhost:8000/api/images/id")
      ).json();
      if (!res.success) {
        return alert("some error occured");
      }
      setImageIds(res.data.ids);
    } catch (error) {
      console.log(error);
    }
  };

  const onDelete = async (id) => {
    try {
      if (!window.confirm("are you sure?")) return;
      await fetch(`http://localhost:8000/api/image/${id}`, {
        method: "delete",
      });
      setImageIds((prev) => prev.filter((i) => i !== id));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchIDs();
  }, []);

  const connectSocket = () => {
    const client = new window.WebSocket("ws://localhost:8000/websocket");
    setWebSocket(client);
    client.onopen = () => {
      client.send(JSON.stringify({ event: "DECODE_IMAGES", password }));
    };

    client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.event === "DECODE_IMAGES")
        setCardData((prev) => ({
          ...prev,
          [data.data.id]: {
            buffer: Buffer.from(data.data.buffer).toString("base64"),
            type: "image",
          },
        }));
    };
    client.onerror = function (ev) {
      alert("some error occured");
      console.log("Connection Error", ev);
    };
  };

  useEffect(() => console.log(cardData), [cardData]);
  return (
    <div className="App">
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <AppBar position="relative">
          <Toolbar>
            <CameraIcon sx={{ mr: 2 }} />
            <Typography variant="h6" color="inherit" noWrap>
              Album layout
            </Typography>
          </Toolbar>
        </AppBar>
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
      </ThemeProvider>
    </div>
  );
}

export default App;
