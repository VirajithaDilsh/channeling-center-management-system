import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const DoctorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/doctors/${id}`)
      .then((res) => {
        setDoctor(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctor:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading doctor details...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Doctor not found.
      </div>
    );
  }

  const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

  return (
    <div className="bg-white shadow-2xl rounded-2xl  p-16 ">

      <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Doctor Details
      </h1>

      {/* Profile Picture */}
      <div className="flex justify-center mb-4">
          <div className="w-28 h-28 rounded-full shadow-lg">
             <div className="bg-blue-100 text-blue-500 font-semibold  flex items-center w-28 h-28 justify-center rounded-full">
                      {getInitials(doctor.name)}
                </div>
          </div>
        {/* <img
          src="https://randomuser.me/api/portraits/women/44.jpg"
          alt="Doctor Profile"
          className="w-28 h-28 rounded-full shadow-lg"
        /> */}
      </div>

      {/* Name & Qualifications */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
        <p className="text-gray-600">{doctor.qualifications}</p>
      </div>

      {/* Specialization */}
      <div className="text-center mb-6">
        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          {doctor.specialization}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6 px-6 py-4 bg-gray-50 rounded-lg">

        <div className="flex gap-2">
          <span className="font-medium text-gray-600">Doctor ID:</span>
          <span className="text-gray-800 font-semibold">{doctor._id}</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium text-gray-600">Phone:</span>
          <span className="text-gray-800 font-semibold">{doctor.phone}</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium text-gray-600">Email:</span>
          <span className="text-gray-800 font-semibold">{doctor.email}</span>
        </div>

        <div className="flex gap-2">
          <span className="font-medium text-gray-600">Consultation Fee:</span>
          <span className="text-gray-800 font-semibold">${doctor.fee}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600 gap-2">Experience:</span>
          <span className="text-gray-800 font-semibold">{doctor.experience} years</span>
        </div>

        <div className="flex gap-2 items-center">
          <span className="font-medium text-gray-600">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              doctor.status === "Active"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {doctor.status}
          </span>
        </div>

      </div>

      {/* Back Button */}
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/dashboard/doctor-management")}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Back to List
        </button>
      </div>

    </div>
  );
};

export default DoctorView;