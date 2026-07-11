import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#1FB1F9" },
    success: { main: "#2e7d32" },
    error: { main: "#d32f2f" },
    warning: { main: "#ed6c02" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
