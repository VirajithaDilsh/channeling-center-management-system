import React from "react";
import { useParams,useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const DoctorView = () => {

  const { id } = useParams(); // Get doctor ID from URL
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null); // state for single doctor
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/doctors/${id}`) // Fetch doctor by ID
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


  return (

      <div className="bg-light-blue shadow-2xl rounded-2xl h-full p-8">

        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
        Doctor Details
      </h1>
        
        {/* Profile Picture */}
        <div className="flex justify-center mb-4">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="Doctor Profile"
            className="w-28 h-28 rounded-full shadow-lg"
          />
        </div>

        {/* Name & Qualifications */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{doctor.name}</h1>
          <p className="text-gray-600">{doctor.qualifications}</p>
        </div>

        {/* Specialty */}
        <div className="text-center mb-4">
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {doctor.specialty}
          </span>
        </div>

       {/* Contact Info & Status */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-start">
            <span className="font-medium text-gray-600">Doctor ID:</span>
            <span className="text-gray-800 font-semibold">{doctor._id}</span>
          </div>
          <div className="flex justify-start">
            <span className="font-medium text-gray-600">Phone:</span>
            <span className="text-gray-800 font-semibold">{doctor.phone}</span>
          </div>
          <div className="flex justify-start">
            <span className="font-medium text-gray-600">Email:</span>
            <span className="text-gray-800 font-semibold">{doctor.email}</span>
          </div>
          <div className="flex justify-start items-center">
            <span className="font-medium text-gray-600">Status:</span>
            <span
              className={`px-3 py-1 rounded-full font-semibold ${
                doctor.status === "Available"
                  ? "bg-green-100 text-green-600"
                  : doctor.status === "Busy"
                  ? "bg-yellow-100 text-yellow-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {doctor.status}
            </span>
          </div>

           {/* Experience & Availability */}
        <div className="space-y-2 mb-4">
             <div className="flex justify-start">
            <span className="font-medium text-gray-600">Experience:</span>
            <span className="text-gray-800 font-semibold">{doctor.experience}</span>
          </div>
          <div className="flex justify-start">
            <span className="font-medium text-gray-600">Availability:</span>
            <span className="text-gray-800 font-semibold">{doctor.availability}</span>
          </div>

           {/* Bio */}
        <div className="text-gray-700 mb-6">
          <p>twytwuyoyoiw</p>
        </div>

        </div>

        </div>

      </div>

  );
};

export default DoctorView;