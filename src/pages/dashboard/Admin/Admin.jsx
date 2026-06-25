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
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getAdmins, deleteAdmin } from "../../../api/AdminApi";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [page, setPage] = useState(1);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ FIXED: normalize properly
  const fetchAdmins = async () => {
    try {
      const data = await getAdmins();

      const normalized = data.map((a) => ({
        ...a,
        id: a._id, // IMPORTANT: single source of truth
      }));

      setAdmins(normalized);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch admins", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedAdminId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAdmin(selectedAdminId);

      fetchAdmins();

      showSnackbar("Admin deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete admin", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAdminId(null);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="relative flex items-center justify-between mb-6">

        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <h1 className="text-2xl font-semibold">Admin Management</h1>
          <p className="text-gray-500 text-sm">
            View and manage admin users
          </p>
        </div>

        <div className="flex gap-3 ml-auto">
          <Button
            variant="contained"
            onClick={() => navigate("/register-role")}
          >
            + Add New Role
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, email, or role..."
        />
      </div>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>

          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id} hover>

                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>

                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {admin.role}
                  </span>
                </TableCell>

                {/* FIXED: correct field */}
                <TableCell>{admin.contact}</TableCell>

                <TableCell>

                  {/* VIEW */}
                  <IconButton
                    color="primary"
                    onClick={() =>
                      navigate(`/dashboard/admin/view/${admin.id}`)
                    }
                  >
                    <VisibilityIcon />
                  </IconButton>

                  {/* EDIT */}
                  <IconButton
                    color="success"
                    onClick={() =>
                      navigate(`/edit-admin/${admin.id}`)
                    }
                  >
                    <EditIcon />
                  </IconButton>

                  {/* DELETE */}
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteClick(admin.id)}
                  >
                    <DeleteIcon />
                  </IconButton>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">
          Showing {admins.length} admins
        </p>

        <Pagination
          count={5}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </div>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* DELETE DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this admin?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>

          <Button color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}