import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Paper, Stack, Typography } from "@mui/material";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(196, 165, 116, 0.12)",
              color: "primary.main",
            }}
          >
            <LockOutlinedIcon />
          </Box>
          <Typography component="h1" variant="h5">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {subtitle}
          </Typography>
        </Stack>
        {children}
      </Paper>
    </Box>
  );
}
