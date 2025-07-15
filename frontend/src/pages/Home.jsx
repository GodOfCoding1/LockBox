import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { IconButton, Skeleton } from "@mui/material";
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
      const res = await api.get("/image/id");
      if (!res.data.success) {
        return alert("some error occured");
      }
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
      await api.delete(`image/${id}`);
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
    const password = prompt("Enter your password");
    if (!password) return;
    if (!window.localStorage.getItem("token")) window.location.href = "/login";
    const client = new window.WebSocket(
      (window.location.protocol === "https:" ? "wss://" : "ws://") +
        window.location.hostname +
        (window.location.port !== 80 && window.location.port !== 443
          ? ":" + window.location.port
          : "") +
        "/websocket?token=" +
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
    <>
      <AppBar>
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

        <Container sx={{ py: 4 }}>
          <Stack spacing={3} direction={"row"}>
            <Button variant="contained" onClick={connectSocket}>
              Unlock
            </Button>
            <AddDialog />
          </Stack>
        </Container>

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
    </>
  );
}

export default Home;
