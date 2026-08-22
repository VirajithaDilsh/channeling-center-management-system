import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Pagination, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import AddButton from "../../../components/AddButton";
import TableActionButtons from "../../../components/TableActionButton";
import { getAppointments, deleteAppointment } from "../../../api/AppointmentApi";
import { getDoctors } from "../../../api/DoctorApi";
import AddAppointment from "./AddAppointment";
import {
  STATUS_COLORS,
  isUpcomingAppointment,
  compareByMoment,
} from "../../../utils/appointments";

const ROWS_PER_PAGE = 8;

const renderDoctorCell = (doctor) => {
  if (!doctor) return "-";

  return (
    <div>
      <span>{doctor.name}</span>

      {doctor.specialization && (
        <p className="text-xs text-gray-500">{doctor.specialization}</p>
      )}

      {doctor.removed && (
        <p className="text-xs text-amber-600">No longer registered</p>
      )}
    </div>
  );
};

const AppointmentsTable = ({
  title,
  subtitle,
  icon,
  rows,
  page,
  onPageChange,
  emptyText,
  resolveDoctor,
  onDelete,
}) => {
  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));

  // Clamp rather than track with an effect: deleting the last row of the final
  // page would otherwise leave the table stranded on a page that no longer exists.
  const safePage = Math.min(page, pageCount);
  const visibleRows = rows.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        {icon}

        <div>
          <h2 className="text-lg font-semibold">
            {title}
            <span className="ml-2 text-sm font-normal text-gray-500">({rows.length})</span>
          </h2>
          <p className="text-gray-500 text-xs">{subtitle}</p>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date &amp; Time</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" className="text-gray-500">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell>
                    {a.date ? new Date(a.date).toLocaleDateString() : "-"}{a.time ? ` • ${a.time}` : ""}
                  </TableCell>
                  <TableCell>{a.patientName || "-"}</TableCell>
                  <TableCell>{renderDoctorCell(resolveDoctor(a))}</TableCell>
                  <TableCell>{a.reason || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[a.status] || "bg-gray-100 text-gray-600"}`}>
                      {a.status || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <TableActionButtons onDelete={() => onDelete(a._id)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pageCount > 1 && (
        <div className="flex justify-end mt-3">
          <Pagination
            count={pageCount}
            page={safePage}
            onChange={(e, value) => onPageChange(value)}
            color="primary"
          />
        </div>
      )}
    </section>
  );
};

export default function Appoiments() {
  const [appointments, setAppointments] = useState([]);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoaded, setDoctorsLoaded] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
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

  const fetchDoctors = async () => {
    try {
      setDoctors(await getDoctors());
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to load doctors — doctor names may be out of date", "warning");
    } finally {
      setDoctorsLoaded(true);
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
      showSnackbar(err.response?.data?.message || "Failed to cancel appointment", "error");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAppointmentId(null);
    }
  };

  const doctorsById = new Map(doctors.map((d) => [d._id, d]));

  // An appointment carries a `doctorName` snapshot taken at booking time: it is
  // blank on records booked before that field was sent, and goes stale when a
  // doctor is renamed. The live doctor is resolved from `doctorId` instead, with
  // the snapshot kept only as a fallback for doctors that no longer exist.
  const resolveDoctor = (appointment) => {
    const doctor = doctorsById.get(appointment.doctorId);
    if (doctor) {
      return { name: doctor.name, specialization: doctor.specialization, removed: false };
    }

    if (!appointment.doctorName) return null;

    // Until the doctor list has loaded there is nothing to compare against, so
    // don't claim the doctor was removed just because the map is still empty.
    return { name: appointment.doctorName, specialization: null, removed: doctorsLoaded };
  };

  // Cancelled and Completed bookings belong in the history table regardless of
  // their date, so the top table only ever holds actionable rows.
  const now = Date.now();
  const isUpcoming = (appointment) => isUpcomingAppointment(appointment, now);

  // Soonest first for upcoming, most recent first for history.
  const upcomingAppointments = appointments
    .filter(isUpcoming)
    .sort((a, b) => compareByMoment(a, b, 1));

  const pastAppointments = appointments
    .filter((a) => !isUpcoming(a))
    .sort((a, b) => compareByMoment(a, b, -1));

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

      {/* Upcoming */}
      <AppointmentsTable
        title="Upcoming Appointments"
        subtitle="Scheduled bookings that are still to come, soonest first"
        icon={<EventAvailableIcon className="text-blue-500" />}
        rows={upcomingAppointments}
        page={upcomingPage}
        onPageChange={setUpcomingPage}
        emptyText="No upcoming appointments"
        resolveDoctor={resolveDoctor}
        onDelete={handleDeleteClick}
      />

      {/* Past & closed */}
      <AppointmentsTable
        title="Past & Closed Appointments"
        subtitle="Completed, cancelled, and elapsed bookings, most recent first"
        icon={<HistoryIcon className="text-gray-500" />}
        rows={pastAppointments}
        page={pastPage}
        onPageChange={setPastPage}
        emptyText="No past appointments"
        resolveDoctor={resolveDoctor}
        onDelete={handleDeleteClick}
      />

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
