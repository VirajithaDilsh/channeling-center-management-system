import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Pagination, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import AddButton from "../../../components/AddButton";
import TableActionButtons from "../../../components/TableActionButton";
import { getAppointments, deleteAppointment } from "../../../api/AppointmentApi";
import AddAppointment from "./AddAppointment";

const ROWS_PER_PAGE = 8;

const statusColors = {
  Scheduled: "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-600",
};

export default function Appoiments() {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch appointments", "error");
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedAppointmentId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAppointment(selectedAppointmentId);
      fetchAppointments();
      showSnackbar("Appointment cancelled successfully", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to cancel appointment", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAppointmentId(null);
    }
  };

  const pageCount = Math.max(1, Math.ceil(appointments.length / ROWS_PER_PAGE));
  const visibleAppointments = appointments.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Appointment Management</h1>
          <p className="text-gray-500 text-sm">
            View and schedule patient appointments
          </p>
        </div>
        <AddButton label="+ New Appointment" onClick={() => setAddDialogOpen(true)} />
      </div>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date & Time</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleAppointments.map((a) => (
              <TableRow key={a._id} hover>
                <TableCell>
                  {a.date ? new Date(a.date).toLocaleDateString() : "-"}{a.time ? ` • ${a.time}` : ""}
                </TableCell>
                <TableCell>{a.patientName || "-"}</TableCell>
                <TableCell>{a.doctorName || "-"}</TableCell>
                <TableCell>{a.reason || "-"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[a.status] || "bg-gray-100 text-gray-600"}`}>
                    {a.status || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <TableActionButtons onDelete={() => handleDeleteClick(a._id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">Showing {appointments.length} appointments</p>
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

      {/* Cancel Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Keep It</Button>
          <Button color="error" onClick={handleDeleteConfirm}>Cancel Appointment</Button>
        </DialogActions>
      </Dialog>

      {/* New Appointment Dialog */}
      <AddAppointment
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCreated={() => {
          setAddDialogOpen(false);
          fetchAppointments();
          showSnackbar("Appointment created successfully.", "success");
        }}
        onError={(message) => showSnackbar(message, "error")}
      />
    </div>
  );
}
