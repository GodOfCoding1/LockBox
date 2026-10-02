import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import { api } from "../utils/axios";
import InfoSnackBar from "../components/info-sncakbar";
import { useNavigate } from "react-router-dom";
import AuthShell from "../components/auth-shell";

export default function Register() {
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
      setMessage("Enter a username, account password, and master password.");
      return;
    }
    try {
      await api.post("/user/register", Object.fromEntries(data));
      setMessage("Account created. Sign in to continue.");
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
    <AuthShell
      title="Create account"
      subtitle="Your account password signs you in. Your master password unlocks files."
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
          fullWidth
          name="email"
          label="Email"
          type="email"
          id="email"
          autoComplete="email"
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Account password"
          type="password"
          id="password"
          autoComplete="new-password"
          helperText="Used only to sign in."
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="master_password"
          label="Master password"
          type="password"
          id="master_password"
          autoComplete="new-password"
          helperText="Encrypts the key used to unlock your files. This cannot be recovered from your account password."
        />
        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          Create account
        </Button>
        <Link href="/login" variant="body2">
          Already have an account? Sign in
        </Link>
      </Box>
    </AuthShell>
  );
}
