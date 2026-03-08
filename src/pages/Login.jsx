import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Link,
  InputAdornment
} from "@mui/material";

import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    console.log("Login clicked");

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      console.log(res.data);
      setError("");
      navigate("/dashboard");

    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">

      {/* Glass Login Card */}
      <div className="w-[420px] p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.3)] text-center">

        {/* Lock Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <LockIcon className="text-white text-3xl" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
       <Typography variant="h4" className="text-white font-bold">
  MediChannel Pro
</Typography>
        <Typography className="text-gray-200 mb-6 text-sm">
          Hospital Channeling Management System
        </Typography>


        </div>
          

        
       
        {/* Email Field */}
        <div className="mb-5">
  <TextField
    fullWidth
    placeholder="admin"
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
        background: "rgba(59,130,246,0.15)", // blue glass
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

        {/* Password Field */}
     <div className="mb-5">
  <TextField
    fullWidth
    type="password"
    placeholder="password"
    size="small"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <LockIcon sx={{ color: "white" }} />
        </InputAdornment>
      )
    }}
    sx={{
      "& .MuiOutlinedInput-root": {
        background: "rgba(59,130,246,0.15)", // blue glass
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

        {/* Remember + Forgot */}
        <div className="flex justify-between items-center text-white mb-6">
          <FormControlLabel
            control={<Checkbox size="small" sx={{ color: "white" }} />}
            label={<span className="text-sm text-white">Remember me</span>}
          />

          <Link
            component="button"
            className="text-sm !text-white"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Link>
        </div>

        {/* Login Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          className="!bg-white !text-blue-700 !font-semibold !rounded-xl !py-2 hover:!bg-gray-200"
        >
          Sign In
        </Button>

        {error && (
          <Typography color="error" className="mt-3">
            {error}
          </Typography>
        )}

      </div>

    </div>
  );
};

export default Login;