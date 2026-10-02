import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ textAlign: "center", maxWidth: 420 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(196, 165, 116, 0.12)",
            color: "primary.main",
          }}
        >
          <LockOutlinedIcon />
        </Box>
        <Typography component="h1" variant="h4">
          Page not found
        </Typography>
        <Typography color="text.secondary">
          That address is not part of LockBox.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Back to vault
        </Button>
      </Stack>
    </Box>
  );
}
