import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Link,
  InputAdornment,
  Paper
} from "@mui/material";

import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../api/DoctorApi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      // 1. Extract token, role and permissions from backend response
      // Ensure your Node.js backend sends { token, role, permissions } on successful login
      const { token, role, permissions } = res.data;

      // 2. Save to local storage for route protection
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userPermissions", JSON.stringify(permissions || []));

      // 2b. For doctors, resolve which Doctor record this login belongs to
      // (backend doesn't return a doctorId today, so match by email against
      // the doctors list and cache it for the doctor portal to filter on)
      if (role === "doctor") {
        try {
          const doctors = await getDoctors();
          const match = doctors.find(
            (d) => d.email?.toLowerCase() === email.toLowerCase()
          );
          if (match) {
            localStorage.setItem("doctorId", match._id);
            localStorage.setItem("doctorName", match.name);
          } else {
            localStorage.removeItem("doctorId");
            localStorage.removeItem("doctorName");
          }
        } catch (err) {
          console.error("Could not resolve doctor profile:", err);
        }
      }

      setError("");

      // 3. Navigate based on Role
      switch (role) {
        case "admin":
          navigate("/dashboard/admin");
          break;
        case "billing":
          navigate("/dashboard/billing");
          break;
        case "doctor":
          navigate("/dashboard/doctor-home");
          break;
        case "patient_manager":
          navigate("/dashboard/patients");
          break;
        default:
          navigate("/dashboard"); // Fallback for unknown roles
      }

    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
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
        <div className="mb-4">
          <Typography variant="h4" className="font-bold">
            MediChannel Pro
          </Typography>
          <Typography className="text-gray-500 mb-6 text-sm">
            Hospital Channeling Management System
          </Typography>
        </div>

        {/* Email Field */}
        <div className="mb-5">
          <TextField
            fullWidth
            placeholder="Email or Username"
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

        {/* Password Field */}
        <div className="mb-5">
          <TextField
            fullWidth
            type="password"
            placeholder="Password"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              )
            }}
          />
        </div>

        {/* Remember + Forgot */}
        <div className="flex justify-between items-center mb-6">
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<span className="text-sm text-gray-700">Remember me</span>}
          />

          <Link
            component="button"
            className="text-sm"
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
          sx={{ borderRadius: "12px", py: 1.2 }}
        >
          Sign In
        </Button>

        {error && (
          <Typography color="error" className="mt-3 bg-red-50 p-2 rounded">
            {error}
          </Typography>
        )}

      </Paper>
    </div>
  );
};

export default Login;