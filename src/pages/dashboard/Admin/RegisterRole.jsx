import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { createAdmin } from "../../../api/AdminApi";

const RegisterRole = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    contact: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    // Optional: Add basic frontend validation here before sending to API
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
        setSnackbar({
            open: true,
            message: "Please fill in all required fields.",
            severity: "warning",
        });
        return;
    }

    setLoading(true);

    const adminData = {
      adminId: `A-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role, // This will now send the exact string expected by your system
      contact: formData.contact,
      password: formData.password,
    };

    try {
      await createAdmin(adminData);

      setSnackbar({
        open: true,
        message: "User registered successfully.",
        severity: "success",
      });

      setFormData({
        name: "",
        email: "",
        role: "",
        contact: "",
        password: "",
      });

      setTimeout(() => {
        navigate("/admin");
      }, 1000);

    } catch (err) {
      console.error(err);

      setSnackbar({
        open: true,
        message: "Failed to register user.",
        severity: "error",
      });

    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <Paper
        elevation={0}
        className="p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-2xl"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {/* Back Button */}
          <Button
            onClick={() => navigate("/admin")}
            sx={{
              minWidth: "40px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#e0f2fe",
            }}
          >
            <ArrowBackIcon className="text-blue-600" />
          </Button>

          {/* Icon */}
          <div className="bg-blue-100 p-3 rounded-2xl">
            <AdminPanelSettingsIcon className="text-blue-600" />
          </div>

          {/* Title */}
          <div>
            <Typography variant="h5" className="font-semibold">
              Register User Role
            </Typography>

            <p className="text-gray-500 text-sm">
              Add a new user and assign a system role
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            required
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            label="Email Address"
            name="email"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleChange}
          />

          {/* UPDATED ROLE DROPDOWN */}
          <TextField
            select
            label="Role"
            name="role"
            fullWidth
            required
            value={formData.role}
            onChange={handleChange}
          >
            {/* Values now perfectly match the Login.jsx switch cases */}
            <MenuItem value="admin">
              Admin (Roles Management)
            </MenuItem>

            <MenuItem value="reception">
              Receptionist (Doctors & Appointments)
            </MenuItem>

            <MenuItem value="billing">
              Billing (Pharmacy Management)
            </MenuItem>

            <MenuItem value="patient_manager">
              Patient Manager (Patient Management)
            </MenuItem>
          </TextField>

          <TextField
            label="Contact Number"
            name="contact"
            fullWidth
            value={formData.contact}
            onChange={handleChange}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              py: 1.4,
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Register Role"
            )}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              py: 1.4,
            }}
            onClick={() => navigate("/dashboard/admin-management")}
          >
            Cancel
          </Button>
        </div>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RegisterRole;