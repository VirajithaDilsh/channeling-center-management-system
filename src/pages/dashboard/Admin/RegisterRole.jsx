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
  Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BackButton from "../../../components/BackButton";
import { createAdmin } from "../../../api/AdminApi";
import { getRoles } from "../../../api/RoleApi";
import { SPECIALIZATIONS } from "../../../constants/specializations";
import { QUALIFICATIONS } from "../../../constants/qualifications";

const DOCTOR_FIELDS_DEFAULT = {
  specialization: "",
  qualifications: "",
  fee: "",
  status: "Available",
};

const RegisterRole = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    contact: "",
    password: "",
    ...DOCTOR_FIELDS_DEFAULT,
  });

  const isDoctorRole = formData.role.toLowerCase() === "doctor";

  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRoles()
      .then(setRoleOptions)
      .catch((err) => console.error("Failed to load roles", err));
  }, []);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const wasDoctorRole = isDoctorRole;
    const nextFormData = { ...formData, [name]: value };

    // Clear doctor-specific fields when switching away from the Doctor role,
    // so stale data can't leak into a non-doctor submission.
    if (name === "role" && wasDoctorRole && value.toLowerCase() !== "doctor") {
      Object.assign(nextFormData, DOCTOR_FIELDS_DEFAULT);
    }

    setFormData(nextFormData);
  };

  const handleQualificationsChange = (newValue) => {
    setFormData({ ...formData, qualifications: newValue.join(", ") });
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

    if (isDoctorRole && (!formData.specialization || !formData.fee)) {
        setSnackbar({
            open: true,
            message: "Please fill in Specialization and Fee for the Doctor role.",
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
      ...(isDoctorRole && {
        phone: formData.contact,
        specialization: formData.specialization,
        qualifications: formData.qualifications,
        fee: formData.fee,
        status: formData.status,
      }),
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
        ...DOCTOR_FIELDS_DEFAULT,
      });

      setTimeout(() => {
        navigate("/dashboard/admin");
      }, 1000);

    } catch (err) {
      console.error(err);

      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to register user.",
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
          <BackButton to="/dashboard/admin" />

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

          {/* ROLE DROPDOWN — populated from Roles & Permissions */}
          <TextField
            select
            label="Role"
            name="role"
            fullWidth
            required
            value={formData.role}
            onChange={handleChange}
          >
            {roleOptions.map((role) => (
              <MenuItem key={role._id} value={role.name}>
                {role.name}
              </MenuItem>
            ))}
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

          {/* Doctor-specific fields — same fields as the Add Doctor page,
              shown only when Role = Doctor */}
          {isDoctorRole && (
            <>
              <TextField
                select
                label="Specialization"
                name="specialization"
                fullWidth
                required
                value={formData.specialization}
                onChange={handleChange}
              >
                {SPECIALIZATIONS.map((spec) => (
                  <MenuItem key={spec} value={spec}>
                    {spec}
                  </MenuItem>
                ))}
              </TextField>

              <Autocomplete
                multiple
                freeSolo
                options={QUALIFICATIONS}
                value={
                  formData.qualifications
                    ? formData.qualifications.split(",").map((q) => q.trim()).filter(Boolean)
                    : []
                }
                onChange={(e, newValue) => handleQualificationsChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Qualifications" fullWidth />
                )}
              />

              <TextField
                label="Fee"
                name="fee"
                type="number"
                fullWidth
                required
                value={formData.fee}
                onChange={handleChange}
              />

              <TextField
                select
                label="Status"
                name="status"
                fullWidth
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Busy">Busy</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
              </TextField>
            </>
          )}
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
            onClick={() => navigate("/dashboard/admin")}
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