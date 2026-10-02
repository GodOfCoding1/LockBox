import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import { api } from "../utils/axios";
import InfoSnackBar from "../components/info-sncakbar";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/auth-shell";

export default function SignIn() {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!data.get("username") || !data.get("password")) {
      setOpen(true);
      setSuccess(false);
      setMessage("Enter a username and password.");
      return;
    }
    try {
      const res = await api.post("/user/login", Object.fromEntries(data));
      window.localStorage.setItem("token", res.data.token);
      setMessage("Logged in. Redirecting…");
      setOpen(true);
      setSuccess(true);
      navigate("/", { replace: true });
    } catch (error) {
      console.log(error.message);
      if (!error.response) return;
      setMessage(error.message + error.response.data.message);
      setOpen(true);
      setSuccess(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Open your vault with your account password."
    >
      <InfoSnackBar
        open={open}
        setOpen={setOpen}
        message={message}
        type={success ? "success" : "error"}
      />
      <Box component="form" onSubmit={handleSubmit} noValidate>
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
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Sign in
        </Button>
        <Link href="/register" variant="body2">
          Don&apos;t have an account? Create one
        </Link>
      </Box>
    </AuthShell>
  );
}
