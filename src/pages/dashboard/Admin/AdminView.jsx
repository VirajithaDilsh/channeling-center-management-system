import React, { useEffect, useState } from "react";

import {
  TextField,
  Paper,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EditIcon from "@mui/icons-material/Edit";
import BackButton from "../../../components/BackButton";

import { getAdminById } from "../../../api/AdminApi";
import { getRoles, getPermissionCatalog } from "../../../api/RoleApi";

const ACTION_LABELS = {
  read: "Read",
  write: "Write",
  edit: "Edit",
  allow_all: "Allow All",
  access: "Access",
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const AdminView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionCatalog, setPermissionCatalog] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    fetchAdmin();
  }, [id]);

  const fetchAdmin = async () => {
    setLoading(true);

    try {
      const data = await getAdminById(id);
      setAdmin(data);
      fetchRolePermissions(data.role);
    } catch (err) {
      console.error(err);
      setNotFound(true);
      setSnackbar({
        open: true,
        message: "Failed to load user details.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // The admin record stores only the role *name*, so the effective permissions
  // have to be looked up from the role list rather than read off the user.
  const fetchRolePermissions = async (roleName) => {
    if (!roleName) return;

    try {
      const [roles, catalog] = await Promise.all([
        getRoles(),
        getPermissionCatalog(),
      ]);

      const role = roles.find(
        (r) => r.name?.toLowerCase() === roleName.toLowerCase()
      );

      setPermissionCatalog(catalog);
      setRolePermissions(role?.permissions || []);
    } catch (err) {
      console.error("Failed to load role permissions", err);
    }
  };

  // Group the role's granted permissions by module for display.
  const groupedPermissions = permissionCatalog
    .filter((perm) => rolePermissions.includes(perm.key))
    .reduce((groups, perm) => {
      if (!groups[perm.module]) groups[perm.module] = [];
      groups[perm.module].push(perm);
      return groups;
    }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (notFound || !admin) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4 p-6">
        <Typography variant="h6">User not found</Typography>

        <Button variant="contained" onClick={() => navigate("/dashboard/admin")}>
          Back to Admin Management
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/dashboard/admin" />

        <div className="bg-blue-100 p-3 rounded-2xl">
          <AdminPanelSettingsIcon className="text-blue-600" />
        </div>

        <div>
          <Typography variant="h5">User Details</Typography>
          <p className="text-gray-500 text-sm">Account details (read-only)</p>
        </div>

        <div className="ml-auto">
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/edit-admin/${admin._id}`)}
            sx={{ borderRadius: "12px", textTransform: "none" }}
          >
            Edit User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ACCOUNT DETAILS */}
        <Paper
          elevation={0}
          className="p-6 rounded-3xl shadow-sm lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <AdminPanelSettingsIcon className="text-blue-500" />
            <Typography variant="h6">Account Details</Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Full Name"
              value={admin.name || "—"}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Email"
              value={admin.email || "—"}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Role"
              value={admin.role || "—"}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Contact Number"
              value={admin.contact || "—"}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="User ID"
              value={admin.adminId || "—"}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Created At"
              value={formatDate(admin.createdAt)}
              fullWidth
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Last Updated"
              value={formatDate(admin.updatedAt)}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </div>

          {/* Doctor accounts are provisioned with a linked doctor profile. */}
          {admin.doctorId && (
            <div className="mt-6 flex items-center gap-3">
              <Chip label="Linked doctor profile" color="info" size="small" />

              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(`/dashboard/doctor/${admin.doctorId}`)}
                sx={{ borderRadius: "12px", textTransform: "none" }}
              >
                View doctor profile
              </Button>
            </div>
          )}
        </Paper>

        {/* ROLE PERMISSIONS */}
        <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <VerifiedUserIcon className="text-blue-500" />
            <Typography variant="h6">Role Permissions</Typography>
          </div>

          {Object.keys(groupedPermissions).length === 0 ? (
            <p className="text-gray-500 text-sm">
              No permissions granted for this role.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    {module}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {perms.map((perm) => (
                      <Chip
                        key={perm.key}
                        label={ACTION_LABELS[perm.action] || perm.action}
                        size="small"
                        color={perm.action === "allow_all" ? "primary" : "default"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Paper>
      </div>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminView;
