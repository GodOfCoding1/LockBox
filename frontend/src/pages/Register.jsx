import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { api } from "../utils/axios";
import InfoSnackBar from "../components/info-sncakbar";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (
      !data.get("username") ||
      !data.get("password") ||
      !data.get("master_password")
    ) {
      setOpen(true);
      setSuccess(false);
      setMessage("missing username or password or master password");
      return;
    }
    try {
      await api.post("/user/register", Object.fromEntries(data));
      setMessage("Account registered!");
      setOpen(true);
      setSuccess(true);
      navigate("/login", { replace: true });
    } catch (error) {
      console.log(error);
      if (!error.response) return;
      setMessage(error.response.data.message);
      setOpen(true);
      setSuccess(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <InfoSnackBar
        open={open}
        setOpen={setOpen}
        message={message}
        type={success ? "success" : "error"}
      />
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
          />
          <TextField
            margin="normal"
            fullWidth
            name="email"
            label="Email"
            type="email"
            id="email"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="master_password"
            label="Master Password"
            type="master_password"
            id="master_password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
          <Grid container>
            <Grid item>
              <Link href="/login" variant="body2">
                Already have account?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}
