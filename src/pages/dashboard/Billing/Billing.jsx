import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  MenuItem,
  Chip,
  Snackbar,
  Alert
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/CancelOutlined";

import { listVisitSessions, cancelVisitSession } from "../../../api/VisitSessionApi";

const statusColors = {
  OPEN: "default",
  PENDING_PHARMACY: "warning",
  READY_FOR_PAYMENT: "info",
  CLOSED: "success",
  CANCELED: "error",
};

const totalOf = (session) => session.lineItems.reduce((sum, li) => sum + li.amount, 0);
const paidOf = (session) => session.payments.reduce((sum, p) => sum + p.amount, 0);

export default function Billing() {
  const [sessions, setSessions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewData, setViewData] = useState(null);
  const [cancelRow, setCancelRow] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const fetchSessions = async () => {
    try {
      const data = await listVisitSessions();
      setSessions(data || []);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to load billing sessions.", "error");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const rows = sessions
    .filter((s) => statusFilter === "All" || s.status === statusFilter)
    .filter((s) => !search || s.patientName?.toLowerCase().includes(search.toLowerCase()))
    .map((s) => ({
      id: s._id,
      patient: s.patientName,
      doctor: s.doctorName,
      date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "-",
      total: totalOf(s),
      balance: Math.max(0, totalOf(s) - paidOf(s)),
      status: s.status,
      raw: s,
    }));

  const revenue = sessions.filter((s) => s.status === "CLOSED").reduce((sum, s) => sum + paidOf(s), 0);
  const pending = sessions.filter((s) => s.status === "READY_FOR_PAYMENT").reduce((sum, s) => sum + (totalOf(s) - paidOf(s)), 0);
  const atPharmacy = sessions.filter((s) => s.status === "PENDING_PHARMACY").length;

  const columns = [
    { field: "patient", headerName: "Patient Name", flex: 1.5 },
    { field: "doctor", headerName: "Doctor", flex: 1.5 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "total", headerName: "Total", flex: 1, valueFormatter: (value) => `Rs. ${Number(value ?? 0).toFixed(2)}` },
    { field: "balance", headerName: "Balance Due", flex: 1, valueFormatter: (value) => `Rs. ${Number(value ?? 0).toFixed(2)}` },
    {
      field: "status",
      headerName: "Status",
      flex: 1.2,
      renderCell: (params) => (
        <Chip size="small" label={params.value.replaceAll("_", " ")} color={statusColors[params.value] || "default"} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 1.2,
      renderCell: (params) => (
        <Box className="flex gap-1">
          <Tooltip title="View / Collect Payment">
            <IconButton
              size="small"
              className="hover:bg-blue-100 transition"
              onClick={() => navigate(`/dashboard/billing/${params.row.id}`)}
            >
              <VisibilityIcon color="primary" />
            </IconButton>
          </Tooltip>

          {["OPEN", "PENDING_PHARMACY", "READY_FOR_PAYMENT"].includes(params.row.status) && (
            <Tooltip title="Cancel Session">
              <IconButton
                size="small"
                className="hover:bg-red-100 transition"
                onClick={() => setCancelRow(params.row)}
              >
                <CancelIcon color="error" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const handleCancel = async () => {
    try {
      await cancelVisitSession(cancelRow.id, "Canceled from billing desk");
      showSnackbar("Session canceled (or cancellation queued pending pharmacy).", "success");
      fetchSessions();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to cancel session.", "error");
    } finally {
      setCancelRow(null);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Billing & Payments</h1>
          <p className="text-gray-500 text-sm">
            Unified patient ledger — bills are generated automatically from bookings and pharmacy dispensing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Revenue Collected</p>
            <h2 className="text-2xl font-semibold">Rs. {revenue.toFixed(2)}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">Rs</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Pending Payments</p>
            <h2 className="text-2xl font-semibold">Rs. {pending.toFixed(2)}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">!</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Awaiting Pharmacy</p>
            <h2 className="text-2xl font-semibold">{atPharmacy}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">Rx</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between mb-4 gap-4">
          <TextField
            size="small"
            fullWidth
            placeholder="Search by patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-56"
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="PENDING_PHARMACY">Pending Pharmacy</MenuItem>
            <MenuItem value="READY_FOR_PAYMENT">Ready for Payment</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
            <MenuItem value="CANCELED">Canceled</MenuItem>
          </TextField>
        </div>

        <div style={{ height: 450, width: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
            pageSizeOptions={[5, 10, 20]}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f3f4f6", fontWeight: "bold" },
              "& .MuiDataGrid-row:hover": { backgroundColor: "#f9fafb" },
            }}
          />
        </div>
      </div>

      {/* Cancel Confirmation */}
      <Dialog open={Boolean(cancelRow)} onClose={() => setCancelRow(null)}>
        <DialogTitle>Cancel Visit Session</DialogTitle>
        <DialogContent>
          <Typography>
            {cancelRow?.status === "PENDING_PHARMACY"
              ? "This session has items still at the pharmacy. Cancellation will be queued and finalized once dispensing resolves."
              : "Are you sure you want to cancel this visit session?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelRow(null)}>Keep It</Button>
          <Button color="error" variant="contained" onClick={handleCancel}>Cancel Session</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
