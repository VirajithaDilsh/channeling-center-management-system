import React from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../../../components/AddButton";
import SearchBar from "../../../components/SearchBar";
import TableActionButtons from "../../../components/TableActionButton";
import axios from "axios";
import { useState, useEffect } from "react";



const DoctorManagement = () => {

const [doctors, setDoctors] = useState([]);
  
  useEffect(() => {

  axios.get("http://localhost:5000/api/doctors")
       .then((res) =>{
         setDoctors(res.data);
        })
       .catch((err) => {
         console.error("Error fetching doctors:", err);
        });
}, []);


  const navigate = useNavigate();

  const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};


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

        <select className="outline-blue-600 5rem px-3 py-2 text-sm flex-0.2 mb-2">
          <option>Availability</option>
          <option>Available</option>
          <option>Busy</option>
          <option>On Leave</option>
        </select>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-50 py-6">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-white rounded-xl shadow-sm p-6 border-gray-200"
          >
            {/* Top */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className="bg-blue-100 text-blue-600 font-semibold w-10 h-10 flex items-center justify-center rounded-full">
                      {getInitials(doctor.name)}
                </div>

                <div>
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {doctor.specialization}
                  </span>
                </div>
              </div>

              {/* fixed — uses doc.active boolean */}
              <span className={`text-xs px-2 py-1 rounded ${
                doctor.active 
                  ? "bg-green-100 text-green-600" 
                  : "bg-red-100 text-red-600"
              }`}>
                {doctor.active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Contact */}
            <div className="text-sm text-gray-500 space-y-1 mb-3">
              <p>{doctor.phone}</p>
              <p>{doctor.email}</p>
            </div>

            <hr className="my-3" />

            {/* Stats */}
            <div className="flex justify-between text-center text-sm mb-4">
              <div>
                <p className="font-semibold">{doctor.patients}</p>
                <p className="text-gray-400 text-xs">PATIENTS</p>
              </div>

              <div>
                <p className="font-semibold">{doctor.rating}</p>
                <p className="text-gray-400 text-xs">RATING</p>
              </div>

              <div>
                <p className="font-semibold">{doctor.experience}</p>
                <p className="text-gray-400 text-xs">EXPERIENCE</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
             <TableActionButtons
                    onView={() => navigate(`/dashboard/doctor/${doctor._id}`)}
                    onEdit={() => navigate(`/dashboard/doctor/edit/${doctor._id}`)}
            />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 gap-2">
        <button className="px-3 py-1 border rounded hover:bg-gray-100">Prev</button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded">1</button>
        <button className="px-3 py-1 border rounded">2</button>
        <button className="px-3 py-1 border rounded">3</button>
        <button className="px-3 py-1 border rounded">Next</button>
      </div>
    </div>
  );
};

export default DoctorManagement;