import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Snackbar, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getAppointments } from "../../../api/AppointmentApi";

const statusColors = {
  Scheduled: "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-600",
};

const isToday = (dateValue) => {
  if (!dateValue) return false;
  return new Date(dateValue).toDateString() === new Date().toDateString();
};

export default function DoctorHome() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
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
      const mine = data.filter((a) => {
        const belongsToMe = doctorId
          ? a.doctorId === doctorId
          : a.doctorName === doctorName;
        return belongsToMe && isToday(a.date) && a.status !== "Cancelled";
      });
      setAppointments(mine);
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Failed to fetch appointments");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === "Completed").length;
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
        <p className="text-gray-500 text-sm">Your appointments for today</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
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
            {!loading && appointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-gray-500 text-center">
                  No appointments for today.
                </TableCell>
              </TableRow>
            )}
            {appointments.map((a) => (
              <TableRow key={a._id} hover>
                <TableCell>{a.time || "-"}</TableCell>
                <TableCell>{a.patientName || "-"}</TableCell>
                <TableCell>{a.reason || "-"}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[a.status] || "bg-gray-100 text-gray-600"}`}>
                    {a.status || "-"}
                  </span>
                </TableCell>
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
