import { useState } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  Grid
} from "@mui/material";

export default function CreateInvoice() {

  const [formData, setFormData] = useState({
    patient: "",
    doctor: "",
    date: "",
    amount: "",
    status: "Pending"
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Invoice Created:", formData);
  };

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      {/* Page Header */}

      <div className="mb-6">
        <Typography variant="h5" fontWeight="bold">
          Create Invoice
        </Typography>

        <Typography color="text.secondary">
          Add a new billing invoice
        </Typography>
      </div>

      {/* Form */}

      <Paper className="p-6 rounded-xl shadow-sm">

        <form onSubmit={handleSubmit}>

          <Grid container spacing={3}>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Patient Name"
                name="patient"
                value={formData.patient}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Doctor Name"
                name="doctor"
                value={formData.doctor}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                label="Invoice Date"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Overdue">Overdue</MenuItem>
              </TextField>
            </Grid>

          </Grid>

          {/* Buttons */}

          <div className="flex gap-4 mt-6">

            <Button
              type="submit"
              variant="contained"
            >
              Save Invoice
            </Button>

            <Button
              variant="outlined"
            >
              Cancel
            </Button>

          </div>

        </form>

      </Paper>

    </div>
  );
}