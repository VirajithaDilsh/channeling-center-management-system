import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination, Button, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddButton from "../../../components/AddButton";
import SearchBar from "../../../components/SearchBar";
import TableActionButtons from "../../../components/TableActionButton";
import { getDoctors, deleteDoctor } from "../../../api/DoctorApi";

const ROWS_PER_PAGE = 8;

const STATUS_STYLES = {
  Available: "bg-green-100 text-green-600",
  Busy: "bg-yellow-100 text-yellow-600",
  "On Leave": "bg-red-100 text-red-600",
};

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  const [availability, setAvailability] = useState("Availability");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const navigate = useNavigate();

  const fetchDoctors = () => {
    getDoctors()
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Error fetching doctors:", err));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedDoctorId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoctor(selectedDoctorId);
      fetchDoctors();
      showSnackbar("Doctor deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete doctor", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDoctorId(null);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, specialty, availability]);

  const filteredDoctors = doctors.filter((doc) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      doc.name?.toLowerCase().includes(query) ||
      doc._id?.toLowerCase().includes(query);
    const matchesSpecialty =
      specialty === "All Specialties" || doc.specialization === specialty;
    const matchesAvailability =
      availability === "Availability" || doc.status === availability;
    return matchesSearch && matchesSpecialty && matchesAvailability;
  });

  const specialtyOptions = Array.from(
    new Set(doctors.map((doc) => doc.specialization).filter(Boolean))
  ).sort();

  const pageCount = Math.max(1, Math.ceil(filteredDoctors.length / ROWS_PER_PAGE));
  const visibleDoctors = filteredDoctors.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-sm">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">Doctor Management</h1>
          <p className="text-sm text-gray-500">
            Manage hospital staff and specialists
          </p>
        </div>

        <AddButton label="Add New Doctor" onClick={() => navigate("add-doctors")} />
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <SearchBar
            placeholder="Search doctors by name or ID..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="outline-blue-600 5rem; px-3 py-2 text-sm flex-0.2 mb-2"
        >
          <option>All Specialties</option>
          {specialtyOptions.map((spec) => (
            <option key={spec}>{spec}</option>
          ))}
        </select>

        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="outline-blue-600 5rem; px-3 py-2 text-sm flex-0.2 mb-2"
        >
          <option>Availability</option>
          <option>Available</option>
          <option>Busy</option>
          <option>On Leave</option>
        </select>
      </div>

      {/* Doctors Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doctor Info</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Fee</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleDoctors.map((doc) => (
              <TableRow key={doc._id} hover>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-gray-500 text-xs">{doc.specialization || "-"}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-sm">
                    <span>{doc.phone || "-"}</span>
                    <span className="text-gray-500 text-xs">{doc.email || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>{doc.experience || "-"}</TableCell>
                <TableCell>{doc.fee != null ? doc.fee : "-"}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      STATUS_STYLES[doc.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {doc.status || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <TableActionButtons
                    onView={() => navigate(`/dashboard/doctor/${doc._id}`)}
                    onEdit={() => navigate(`/dashboard/doctor/edit/${doc._id}`)}
                    onDelete={() => handleDeleteClick(doc._id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">Showing {filteredDoctors.length} doctors</p>
        {pageCount > 1 && (
          <Pagination count={pageCount} page={page} onChange={(e, value) => setPage(value)} color="primary" />
        )}
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
            Are you sure you want to delete this doctor?
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
};

export default DoctorManagement;
