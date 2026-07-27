import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Select, MenuItem, Pagination,
  Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TableActionButtons from "../../../components/TableActionButton";
import { getPatients, deletePatient } from "../../../api/PatientApi";

const ROWS_PER_PAGE = 8;

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch patients", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedPatientId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePatient(selectedPatientId);
      fetchPatients();
      showSnackbar("Patient deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete patient", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPatientId(null);
    }
  };

  const pageCount = Math.max(1, Math.ceil(patients.length / ROWS_PER_PAGE));
  const visiblePatients = patients.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Patient Management</h1>
          <p className="text-gray-500 text-sm">
            View and manage patient records
          </p>
        </div>
        <Button
          variant="contained"
          color="success"
          onClick={() => navigate("/dashboard/register-patient")}
        >
          + Register Patient
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <TextField fullWidth size="small" placeholder="Search by name, ID, or phone..." />
        <Select size="small" defaultValue="">
          <MenuItem value="">Blood Group</MenuItem>
          <MenuItem value="O+">O+</MenuItem>
          <MenuItem value="A+">A+</MenuItem>
          <MenuItem value="B+">B+</MenuItem>
        </Select>
        <Select size="small" defaultValue="">
          <MenuItem value="">Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </Select>
      </div>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Info</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Blood Group</TableCell>
              <TableCell>Last Visit</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visiblePatients.map((p) => (
              <TableRow key={p.patientId} hover>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-gray-500 text-xs">
                      {p.patientId} • {p.age || "-"} yrs • {p.gender || "-"} • {p.address || "-"}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{p.phone || "-"}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                    {p.blood || "-"}
                  </span>
                </TableCell>
                <TableCell>{p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : "-"}</TableCell>
                <TableCell>
                  <TableActionButtons
                    onView={() => navigate(`/dashboard/patients/view/${p.patientId}`)}
                    onEdit={() => navigate(`/dashboard/patients/edit/${p.patientId}`)}
                    onDelete={() => handleDeleteClick(p.patientId)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">Showing {patients.length} patients</p>
        {pageCount > 1 && (
          <Pagination count={pageCount} page={page} onChange={(e, value) => setPage(value)} color="primary" />
        )}
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this patient? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
