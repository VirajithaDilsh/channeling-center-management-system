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

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getPublicSettings } from "../api/SettingsApi";
import axiosClient from '../api/axiosClient';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [centerName, setCenterName] = useState("MediChannel Pro");

  const navigate = useNavigate();

  useEffect(() => {
    getPublicSettings()
      .then((data) => data.centerName && setCenterName(data.centerName))
      .catch((err) => console.error("Failed to load center name:", err));
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axiosClient.post("/api/login", {
        email,
        password,
      });

      // 1. Extract token, role, permissions and (for doctors) the linked doctor
      // profile from backend response
      const { token, role, permissions, doctorId, doctorName } = res.data;

      // 2. Save to local storage for route protection
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userPermissions", JSON.stringify(permissions || []));

      // 2b. doctorId/doctorName come straight from the Admin.doctorId FK the
      // backend resolves at login — not derived here by scanning doctors for a
      // matching email, which broke whenever a Doctor's email and its linked
      // account's email drifted apart.
      if (role === "doctor") {
        if (doctorId) {
          localStorage.setItem("doctorId", doctorId);
          localStorage.setItem("doctorName", doctorName || "");
        } else {
          localStorage.removeItem("doctorId");
          localStorage.removeItem("doctorName");
        }
      }

      setError("");

      // 3. Everyone lands on the dashboard, which adapts to their permissions.
      // Doctors go straight to their consultation queue instead, since that
      // queue is the job.
      //
      // Keyed on the role, not on doctor_portal: the admin role carries every
      // permission including doctor_portal, so testing the permission would
      // send admins to the doctor portal. A custom doctor-ish role lands on the
      // dashboard, which adapts to it anyway.
      navigate(role === "doctor" ? "/dashboard/doctor-home" : "/dashboard");

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
            {centerName}
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