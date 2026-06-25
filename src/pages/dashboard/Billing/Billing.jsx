import { useState } from "react";
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
  MenuItem
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Billing() {

  const [viewData, setViewData] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const navigate = useNavigate();

  const rows = [
    { id: 1, invoice: "INV-001", patient: "John Doe", doctor: "Dr. Sarah Jenkins", date: "2026-03-01", amount: "$150", status: "Paid" },
    { id: 2, invoice: "INV-002", patient: "Jane Smith", doctor: "Dr. Emily Rodriguez", date: "2026-03-02", amount: "$85.50", status: "Pending" },
    { id: 3, invoice: "INV-003", patient: "Robert Johnson", doctor: "Dr. James Wilson", date: "2026-02-28", amount: "$320", status: "Overdue" },
    { id: 4, invoice: "INV-004", patient: "Emily Davis", doctor: "Dr. Michael Chen", date: "2026-03-05", amount: "$210", status: "Paid" }
  ];

  const columns = [

    { field: "invoice", headerName: "Invoice #", flex: 1 },

    { field: "patient", headerName: "Patient Name", flex: 1.5 },

    { field: "doctor", headerName: "Doctor", flex: 1.5 },

    { field: "date", headerName: "Date", flex: 1 },

    { field: "amount", headerName: "Amount", flex: 1 },

    { field: "status", headerName: "Status", flex: 1 },

    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 1.2,

      renderCell: (params) => (

        <Box className="flex gap-1">

          {/* View */}
          <Tooltip title="View Invoice">
            <IconButton
              size="small"
              className="hover:bg-blue-100 transition"
              onClick={() => setViewData(params.row)}
            >
              <VisibilityIcon color="primary" />
            </IconButton>
          </Tooltip>

          {/* Edit */}
          <Tooltip title="Edit Invoice">
            <IconButton
              size="small"
              className="hover:bg-yellow-100 transition"
            >
              <EditIcon color="warning" />
            </IconButton>
          </Tooltip>

          {/* Delete */}
          <Tooltip title="Delete Invoice">
            <IconButton
              size="small"
              className="hover:bg-red-100 transition"
              onClick={() => setDeleteRow(params.row)}
            >
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>

        </Box>
      )
    }

  ];

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-semibold">Billing & Payments</h1>
          <p className="text-gray-500 text-sm">
            Manage invoices and transactions
          </p>
        </div>

        <Button
  variant="contained"
  onClick={() => navigate("/create-invoice")}
>
  + Create Invoice
</Button>
      </div>

      {/* Stats Cards */}

      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between">

          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <h2 className="text-2xl font-semibold">$84,520</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
            $
          </div>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between">

          <div>
            <p className="text-gray-500 text-sm">Pending Payments</p>
            <h2 className="text-2xl font-semibold">$12,340</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
            !
          </div>

        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex justify-between">

          <div>
            <p className="text-gray-500 text-sm">Overdue</p>
            <h2 className="text-2xl font-semibold">$3,200</h2>
          </div>

          <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
            !
          </div>

        </div>

      </div>

      {/* Table Section */}

      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* Search + Filters */}

        <div className="flex justify-between mb-4 gap-4">

          <TextField
            size="small"
            fullWidth
            placeholder="Search invoice # or patient..."
          />

          <TextField
            select
            size="small"
            defaultValue="All"
            className="w-40"
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Paid">Paid</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
          </TextField>

          <TextField
            size="small"
            type="date"
            className="w-44"
          />

        </div>

        {/* DataGrid */}

        <div style={{ height: 450, width: "100%" }}>

          <DataGrid
            rows={rows}
            columns={columns}

            initialState={{
              pagination: {
                paginationModel: { pageSize: 5, page: 0 }
              }
            }}

            pageSizeOptions={[5,10,20]}

            sx={{
              border: 0,

              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f3f4f6",
                fontWeight: "bold"
              },

              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f9fafb"
              }
            }}
          />

        </div>

      </div>

      {/* View Modal */}

      <Dialog
        open={Boolean(viewData)}
        onClose={() => setViewData(null)}
        maxWidth="sm"
        fullWidth
      >

        <DialogTitle>Invoice Details</DialogTitle>

        <DialogContent>

          {viewData && (

            <Box className="space-y-2">

              <Typography><b>Invoice:</b> {viewData.invoice}</Typography>

              <Typography><b>Patient:</b> {viewData.patient}</Typography>

              <Typography><b>Doctor:</b> {viewData.doctor}</Typography>

              <Typography><b>Date:</b> {viewData.date}</Typography>

              <Typography><b>Amount:</b> {viewData.amount}</Typography>

              <Typography><b>Status:</b> {viewData.status}</Typography>

            </Box>

          )}

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setViewData(null)}>Close</Button>
        </DialogActions>

      </Dialog>

      {/* Delete Confirmation */}

      <Dialog
        open={Boolean(deleteRow)}
        onClose={() => setDeleteRow(null)}
      >

        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>

          <Typography>
            Are you sure you want to delete this invoice?
          </Typography>

        </DialogContent>

        <DialogActions>

          <Button onClick={() => setDeleteRow(null)}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={() => {
              console.log("Delete:", deleteRow);
              setDeleteRow(null);
            }}
          >
            Delete
          </Button>

        </DialogActions>

      </Dialog>

    </div>

  );
}