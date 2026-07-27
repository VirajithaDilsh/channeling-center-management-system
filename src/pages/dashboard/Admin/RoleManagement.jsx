import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import BackButton from "../../../components/BackButton";
import TableActionButtons from "../../../components/TableActionButton";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissionCatalog,
} from "../../../api/RoleApi";

export default function RoleManagement() {
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [permissionCatalog, setPermissionCatalog] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [formOpen, setFormOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesData, catalog] = await Promise.all([getRoles(), getPermissionCatalog()]);
      setRoles(rolesData);
      setPermissionCatalog(catalog);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch roles", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const groupedPermissions = permissionCatalog.reduce((groups, perm) => {
    if (!groups[perm.module]) groups[perm.module] = [];
    groups[perm.module].push(perm);
    return groups;
  }, {});

  const openCreateForm = () => {
    setEditingRoleId(null);
    setRoleName("");
    setSelectedPermissions([]);
    setFormOpen(true);
  };

  const openEditForm = (role) => {
    setEditingRoleId(role._id);
    setRoleName(role.name);
    setSelectedPermissions(role.permissions || []);
    setFormOpen(true);
  };

  const togglePermission = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      showSnackbar("Role name is required", "warning");
      return;
    }

    try {
      if (editingRoleId) {
        await updateRole(editingRoleId, { name: roleName.trim(), permissions: selectedPermissions });
        showSnackbar("Role updated successfully");
      } else {
        await createRole({ name: roleName.trim(), permissions: selectedPermissions });
        showSnackbar("Role created successfully");
      }
      setFormOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save role", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedRoleId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteRole(selectedRoleId);
      showSnackbar("Role deleted successfully");
      fetchData();
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete role", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRoleId(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton to="/dashboard/admin" />
          <div>
            <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
            <p className="text-gray-500 text-sm">Create roles and choose exactly what each one can access</p>
          </div>
        </div>

        <Button variant="contained" onClick={openCreateForm}>
          + Add Role
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Role Name</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {roles.map((role) => (
              <TableRow key={role._id} hover>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {role.name}
                  </span>
                </TableCell>

                <TableCell>
                  {role.permissions && role.permissions.length > 0
                    ? `${role.permissions.length} permission${role.permissions.length > 1 ? "s" : ""}`
                    : "No permissions"}
                </TableCell>

                <TableCell>
                  <TableActionButtons
                    onEdit={() => openEditForm(role)}
                    onDelete={() => handleDeleteClick(role._id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE/EDIT DIALOG */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingRoleId ? "Edit Role" : "Add New Role"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            sx={{ mb: 2 }}
          />

          {Object.entries(groupedPermissions).map(([module, perms]) => (
            <div key={module} className="mb-3">
              <Typography variant="subtitle2" className="text-gray-600 mb-1">
                {module}
              </Typography>
              <FormGroup>
                {perms.map((perm) => (
                  <FormControlLabel
                    key={perm.key}
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                      />
                    }
                    label={perm.label}
                  />
                ))}
              </FormGroup>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this role? Users currently assigned this role will lose its permissions.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
}
