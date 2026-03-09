import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Button,
  TextField,
  Select,
  MenuItem,
  Pagination,
  IconButton
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const initialPatients = [
  {
    id: "P-001",
    name: "John Doe",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 111-2222",
    email: "john.doe@example.com",
    blood: "O+",
    visit: "2026-02-15",
    history: "Hypertension, Type 2 Diabetes",
    description: "BP: 140/90 | Cholesterol: High",
    doctor: "Dr. John Smith"
  },
  {
    id: "P-002",
    name: "Jane Smith",
    age: 32,
    gender: "Female",
    phone: "+1 (555) 222-3333",
    email: "jane.smith@example.com",
    blood: "A-",
    visit: "2026-03-01",
    history: "Asthma since childhood",
    description: "BP: 120/80 | Cholesterol: Normal",
    doctor: "Dr. Emily Watson"
  },
  {
    id: "P-003",
    name: "Robert Johnson",
    age: 58,
    gender: "Male",
    phone: "+1 (555) 333-4444",
    email: "robert.j@example.com",
    blood: "B+",
    visit: "2026-01-20",
    history: "Post-op recovery from knee replacement",
    description: "BP: 135/85 | Cholesterol: Borderline",
    doctor: "Dr. Michael Brown"
  }
];

export default function PatientManagement() {

  const [patients, setPatients] = useState(initialPatients);
  const [page, setPage] = useState(1);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this patient?");
    if (confirmDelete) {
      setPatients(patients.filter((p) => p.id !== id));
    }
  };

  const handleView = (id) => {
    alert("Viewing patient: " + id);
  };

  const handleEdit = (id) => {
    alert("Editing patient: " + id);
  };

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

        <Button variant="contained" color="success">
          + Register Patient
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex gap-4 mb-6">

        <TextField
          fullWidth
          size="small"
          placeholder="Search by name, ID, or phone..."
        />

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
    <TableCell>Doctor</TableCell> {/* New column */}
    <TableCell>Last Visit</TableCell>
    <TableCell>Medical History</TableCell>
    <TableCell>Description</TableCell>
    <TableCell>Actions</TableCell>
  </TableRow>
</TableHead>

        <TableBody>
  {patients.map((p) => (
    <TableRow key={p.id} hover>

      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>{p.name.charAt(0)}</Avatar>
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-gray-500 text-xs">{p.id} • {p.age} yrs • {p.gender}</div>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div>{p.phone}</div>
        <div className="text-xs text-gray-500">{p.email}</div>
      </TableCell>

      <TableCell>
        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">{p.blood}</span>
      </TableCell>

      <TableCell>{p.doctor}</TableCell> {/* New doctor cell */}

      <TableCell>{p.visit}</TableCell>

      <TableCell className="text-gray-600 text-sm">{p.history}</TableCell>

      <TableCell className="text-gray-600 text-sm">{p.description}</TableCell>

      <TableCell>
        <IconButton color="primary" onClick={() => handleView(p.id)}><VisibilityIcon /></IconButton>
        <IconButton color="success" onClick={() => handleEdit(p.id)}><EditIcon /></IconButton>
        <IconButton color="error" onClick={() => handleDelete(p.id)}><DeleteIcon /></IconButton>
      </TableCell>

    </TableRow>
  ))}
</TableBody>

        </Table>

      </TableContainer>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">

        <p className="text-sm text-gray-500">
          Showing {patients.length} patients
        </p>

        <Pagination
          count={5}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />

      </div>

    </div>
  );
}