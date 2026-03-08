import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  InputAdornment,
  Link
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

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">

      {/* Glass Card */}
      <div className="w-[420px] p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)] text-center">

        {/* Lock Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <LockIcon className="text-white text-3xl" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <Typography variant="h5" className="text-white font-bold">
            MediChannel Pro
          </Typography>

          <Typography className="text-gray-200 text-sm">
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
                  <PersonIcon sx={{ color: "white" }} />
                </InputAdornment>
              )
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(59,130,246,0.15)",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                color: "white"
              },
              "& .MuiOutlinedInput-input": {
                color: "white"
              },
              "& fieldset": {
                border: "1px solid rgba(255,255,255,0.2)"
              },
              "& input::placeholder": {
                color: "rgba(255,255,255,0.7)"
              }
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
                  <LockIcon sx={{ color: "white" }} />
                </InputAdornment>
              )
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(59,130,246,0.15)",
                backdropFilter: "blur(8px)",
                borderRadius: "12px",
                color: "white"
              },
              "& .MuiOutlinedInput-input": {
                color: "white"
              },
              "& fieldset": {
                border: "1px solid rgba(255,255,255,0.2)"
              },
              "& input::placeholder": {
                color: "rgba(255,255,255,0.7)"
              }
            }}
          />
        </div>

        {/* Reset Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleReset}
          className="!bg-white !text-blue-700 !font-semibold !rounded-xl !py-2 hover:!bg-gray-200"
        >
          Reset Password
        </Button>

        {/* Back to Login */}
        <div className="mt-4">
          <Link
            component="button"
            className="!text-white text-sm"
            onClick={() => navigate("/")}
          >
            Back to Login
          </Link>
        </div>

        {/* Message */}
        {message && (
          <Typography className="mt-3 text-white">
            {message}
          </Typography>
        )}

      </div>

    </div>
  );
};

export default ForgotPassword;