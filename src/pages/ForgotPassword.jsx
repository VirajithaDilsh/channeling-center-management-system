import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  InputAdornment,
  Link,
  Paper
} from "@mui/material";

import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/reset-password", {
        email,
        newPassword,
      });

      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <Paper elevation={0} className="w-[420px] p-8 rounded-3xl shadow-sm text-center">

        {/* Lock Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <LockIcon className="text-blue-600 text-3xl" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <Typography variant="h5" className="font-bold">
            MediChannel Pro
          </Typography>

          <Typography className="text-gray-500 text-sm">
            Reset Your Password
          </Typography>
        </div>

        {/* Email Field */}
        <div className="mb-5">
          <TextField
            fullWidth
            placeholder="Email Address"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </div>

        {/* New Password */}
        <div className="mb-6">
          <TextField
            fullWidth
            type="password"
            placeholder="New Password"
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </div>

        {/* Reset Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleReset}
          sx={{ borderRadius: "12px", py: 1.2 }}
        >
          Reset Password
        </Button>

        {/* Back to Login */}
        <div className="mt-4">
          <Link
            component="button"
            className="text-sm"
            onClick={() => navigate("/")}
          >
            Back to Login
          </Link>
        </div>

        {/* Message */}
        {message && (
          <Typography className="mt-3 text-gray-700">
            {message}
          </Typography>
        )}

      </Paper>

    </div>
  );
};

export default ForgotPassword;