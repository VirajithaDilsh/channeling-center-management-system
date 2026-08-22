import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Alert
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import TodayIcon from "@mui/icons-material/Today";
import { useNavigate } from "react-router-dom";
import { getAppointments } from "../../../api/AppointmentApi";
import {
  STATUS_COLORS,
  isToday,
  isUpcomingAppointment,
  compareByMoment,
} from "../../../utils/appointments";

const StatusChip = ({ status }) => (
  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
    {status || "-"}
  </span>
);

export default function DoctorHome() {
  const navigate = useNavigate();
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const doctorId = localStorage.getItem("doctorId");
  const doctorName = localStorage.getItem("doctorName");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();

      // Keep every appointment belonging to this doctor and split it below, so
      // today's queue and the forward-looking list come from one fetch.
      const mine = data.filter((a) =>
        doctorId ? a.doctorId === doctorId : a.doctorName === doctorName
      );

      setMyAppointments(mine);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Failed to fetch appointments");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const todaysAppointments = myAppointments
    .filter((a) => isToday(a.date) && a.status !== "Cancelled")
    .sort((a, b) => compareByMoment(a, b, 1));

  // Deliberately excludes today — those already appear in the queue above, and
  // showing them twice would make the day's workload look doubled.
  const upcomingAppointments = myAppointments
    .filter((a) => isUpcomingAppointment(a) && !isToday(a.date))
    .sort((a, b) => compareByMoment(a, b, 1));

  const total = todaysAppointments.length;
  const completed = todaysAppointments.filter((a) => a.status === "Completed").length;
  const remaining = total - completed;

  if (!doctorId && !doctorName) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Paper elevation={0} className="p-6 rounded-2xl shadow-sm">
          <p className="text-gray-600">
            No doctor profile is linked to this account yet. Ask an admin to make sure
            your login email matches the email on your Doctor record.
          </p>
        </Paper>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Welcome{doctorName ? `, Dr. ${doctorName}` : ""}
        </h1>
        <p className="text-gray-500 text-sm">Your appointments for today and what's coming up</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-500">Today's Total</h2>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-500">Completed</h2>
          <p className="text-2xl font-bold text-green-600">{completed}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-500">Remaining</h2>
          <p className="text-2xl font-bold text-blue-600">{remaining}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-500">Upcoming</h2>
          <p className="text-2xl font-bold text-indigo-600">{upcomingAppointments.length}</p>
        </div>
      </div>

      {/* TODAY'S QUEUE */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <TodayIcon className="text-blue-500" />

          <div>
            <h2 className="text-lg font-semibold">
              Today
              <span className="ml-2 text-sm font-normal text-gray-500">({total})</span>
            </h2>
            <p className="text-gray-500 text-xs">Your consultation queue for today</p>
          </div>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && todaysAppointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-gray-500 text-center">
                    No appointments for today.
                  </TableCell>
                </TableRow>
              )}
              {todaysAppointments.map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell>{a.time || "-"}</TableCell>
                  <TableCell>{a.patientName || "-"}</TableCell>
                  <TableCell>{a.reason || "-"}</TableCell>
                  <TableCell><StatusChip status={a.status} /></TableCell>
                  <TableCell>
                    <button
                      className="text-blue-600 hover:underline text-sm font-medium"
                      onClick={() => navigate(`/dashboard/doctor/consultation/${a._id}`)}
                    >
                      {a.status === "Completed" ? "View" : "Start Consultation"}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      {/* UPCOMING */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <EventAvailableIcon className="text-indigo-500" />

          <div>
            <h2 className="text-lg font-semibold">
              Upcoming Appointments
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({upcomingAppointments.length})
              </span>
            </h2>
            <p className="text-gray-500 text-xs">
              Your scheduled bookings after today, soonest first
            </p>
          </div>
        </div>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && upcomingAppointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-gray-500 text-center">
                    No upcoming appointments.
                  </TableCell>
                </TableRow>
              )}
              {upcomingAppointments.map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell>
                    {a.date
                      ? new Date(a.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>{a.time || "-"}</TableCell>
                  <TableCell>{a.patientName || "-"}</TableCell>
                  <TableCell>{a.reason || "-"}</TableCell>
                  <TableCell><StatusChip status={a.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" variant="filled">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
