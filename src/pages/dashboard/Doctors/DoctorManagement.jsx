import React, { useState, useEffect } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddButton from "../../../components/AddButton";
import SearchBar from "../../../components/SearchBar";
import TableActionButtons from "../../../components/TableActionButton";
import { getDoctors } from "../../../api/DoctorApi";

const ROWS_PER_PAGE = 8;

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    getDoctors()
      .then((data) => setDoctors(data))
      .catch((err) => console.error("Error fetching doctors:", err));
  }, []);

  const pageCount = Math.max(1, Math.ceil(doctors.length / ROWS_PER_PAGE));
  const visibleDoctors = doctors.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

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
          <SearchBar placeholder="Search doctors by name or ID..." />
        </div>

        <select className="outline-blue-600 5rem; px-3 py-2 text-sm flex-0.2 mb-2">
          <option>All Specialties</option>
          <option>Cardiology</option>
          <option>Neurology</option>
          <option>Pediatrics</option>
        </select>

        <select className="outline-blue-600 5rem; px-3 py-2 text-sm flex-0.2 mb-2">
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
                  <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                    {doc.status || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <TableActionButtons
                    onView={() => navigate(`/dashboard/doctor/${doc._id}`)}
                    onEdit={() => navigate(`/dashboard/doctor/edit/${doc._id}`)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">Showing {doctors.length} doctors</p>
        {pageCount > 1 && (
          <Pagination count={pageCount} page={page} onChange={(e, value) => setPage(value)} color="primary" />
        )}
      </div>
    </div>
  );
};

export default DoctorManagement;
