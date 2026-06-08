import React from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../../../components/AddButton";
import SearchBar from "../../../components/SearchBar";
import TableActionButtons from "../../../components/TableActionButton";
import DoctorScheduleDialog from "../../../components/ScheduleDialog";
import axios from "axios";
import { useState, useEffect } from "react";



const DoctorManagement = () => {

const [doctors, setDoctors] = useState([]);
const [selectedDoctor, setSelectedDoctor] = useState(null); 
  
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

const handleDelete = async (id) => {
      const confirmed = window.confirm("Are you sureyou want to delete this doctor?");
      if(!confirmed) return;

      try {
        await axios.delete(`http://localhost:5000/api/doctors/${id}`);
        setDoctors(doctors.filter((doctor)=>  doctor._id !== id));
        alert("Doctor delete successfuly");
      } catch (error) {
        console.error(error);
        alert("Error deleting doctor:");
      }
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
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-3 gap-4 border-t border-b border-gray-50 py-8">
        {doctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-white rounded-xl shadow-sm p-2 border-gray-200"
          >
            {/* Top */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-3">
                <div className="bg-blue-100 text-blue-600 font-semibold w-10 h-10 flex items-center justify-center rounded-full">
                      {getInitials(doctor.name)}
                </div>

                <div>
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <span className="text-xs text-black bg-gray-100 px-2 py-1 rounded">
                    {doctor.specialization}
                  </span>
                </div>
              </div>

              {/* fixed — uses doc.status */}
              <span className={`text-xs px-2 py-1 rounded ${
                doctor.status === "Active"
                  ? "bg-green-100 text-green-600" 
                  : "bg-red-100 text-red-600"
              }`}>
                {doctor.status}
              </span>
            </div>

            {/* Contact */}
            <div className="text-sm text-gray-500 space-y-1 mb-3">
              <p>{doctor.phone}</p>
              <p>{doctor.email}</p>
            </div>

            <hr className="my-3" />


            {/* Buttons */}
            <div className="flex gap-3">
             <TableActionButtons
                    onView={() => navigate(`/dashboard/doctor/${doctor._id}`)}
                    onEdit={() => navigate(`/dashboard/doctor/edit/${doctor._id}`)}
                    onDelete={() =>handleDelete(doctor._id)}
                    onSchedule={() =>{
                      console.log("Passing to dialog:", doctor)
                      setSelectedDoctor(doctor)}}
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

      {/* 👇 Dialog renders here when a doctor is selected */}
      {selectedDoctor && (
        <DoctorScheduleDialog
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)} 
        />
      )}


    </div>
  );
};

export default DoctorManagement;