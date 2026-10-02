import { createTheme } from "@mui/material/styles";

const border = "rgba(255, 255, 255, 0.08)";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#c4a574",
      contrastText: "#0c0e12",
    },
    secondary: {
      main: "#9aa3b5",
    },
    background: {
      default: "#0c0e12",
      paper: "#161922",
    },
    error: {
      main: "#e07a6a",
    },
    success: {
      main: "#7dba8a",
    },
    info: {
      main: "#8aa4c8",
    },
    warning: {
      main: "#d4a054",
    },
    text: {
      primary: "#e8e6e3",
      secondary: "#9a968e",
    },
    divider: border,
  },
  typography: {
    fontFamily: '"Outfit", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#0c0e12",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "transparent",
      },
      styleOverrides: {
        root: {
          backgroundColor: "#12151b",
          backgroundImage: "none",
          borderBottom: `1px solid ${border}`,
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#161922",
          backgroundImage: "none",
          border: `1px solid ${border}`,
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: "none",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#222733",
          backgroundImage: "none",
          border: `1px solid ${border}`,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(0, 0, 0, 0.72)",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.02)",
        },
      },
    },
  },
});

export default theme;
