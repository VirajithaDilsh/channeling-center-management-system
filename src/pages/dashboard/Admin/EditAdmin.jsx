import React, { useEffect, useState } from "react";

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
import { useNavigate, useParams } from "react-router-dom";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

import {
  getAdminById,
  updateAdmin,
} from "../../../api/AdminApi";

const EditAdmin = () => {
  const navigate = useNavigate();

  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    contact: "",
    password: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    try {
      const data = await getAdminById(id);

      setFormData({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "",
        contact: data.contact || "",
        password: data.password || "",
      });

    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    setLoading(true);

    try {
      await updateAdmin(id, formData);

      setSnackbar({
        open: true,
        message: "Admin updated successfully.",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/admin");
      }, 1000);

    } catch (err) {
      console.error(err);

      setSnackbar({
        open: true,
        message: "Failed to update admin.",
        severity: "error",
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <Paper
        elevation={0}
        className="p-8 rounded-3xl shadow-sm w-full max-w-2xl"
      >
        {/* Header */}
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
    <Typography variant="h5">
      Edit Admin
    </Typography>

    <p className="text-gray-500 text-sm">
      Update admin details
    </p>
  </div>
</div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
          />

          <TextField
            label="Email"
            name="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />

          <TextField
            select
            label="Role"
            name="role"
            fullWidth
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="admin">
              Admin (Roles Management)
            </MenuItem>

           

            <MenuItem value="reception">
             Receptionist (Doctors & Appointments)
            </MenuItem>

            <MenuItem value="patient_manager">
               Patient Manager (Patient Management)
            </MenuItem>

            <MenuItem value="billing">
              Billing (Pharmacy Management)
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
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="contained"
            fullWidth
            onClick={handleUpdate}
            disabled={loading}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              py: 1.4,
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              "Update Admin"
            )}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate("/admin")}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              py: 1.4,
            }}
          >
            Cancel
          </Button>
        </div>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditAdmin;