import React from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Link
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";



const Login = () => {
  return (
     <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(/login-bg.webp)` }}
    >
      <Paper elevation={3} className="w-[380px] p-6 text-center">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="bg-blue-500 text-white p-2 rounded-full mb-2">
            <LockIcon />
          </div>

          <Typography variant="h6" className="text-blue-600 font-semibold">
            LAHIRU MEDICAL CENTER
          </Typography>

        
        </div>

        {/* Email */}
        <div className="mb-4">
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            size="small"
            placeholder="your@example.com"
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            size="small"
            placeholder="Enter your password"
          />
        </div>

        {/* Remember + forgot */}
        <div className="flex justify-between items-center mb-4">
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="Remember me"
          />

          <Link href="#" underline="hover" className="text-sm">
            Forgot password?
          </Link>
        </div>

        {/* Login button */}
        <Button
          variant="contained"
          fullWidth
          className="!bg-blue-500 hover:!bg-blue-600"
        >
          Login
        </Button>

        

      </Paper>
    </div>
  );
};

export default Login;