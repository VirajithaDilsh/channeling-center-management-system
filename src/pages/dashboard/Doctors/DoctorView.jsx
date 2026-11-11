import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDoctorById, updateDoctor } from "../../../api/DoctorApi";
import BackButton from "../../../components/BackButton";

const DoctorView = () => {

  const { id } = useParams(); // Get doctor ID from URL

  const [doctor, setDoctor] = useState(null); // state for single doctor
  const [loading, setLoading] = useState(true);
  const [statusDraft, setStatusDraft] = useState("Available");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    getDoctorById(id) // Fetch doctor by ID
      .then((data) => {
        setDoctor(data);
        setStatusDraft(data.status || "Available");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching doctor:", err);
        setLoading(false);
      });
  }, [id]);

  const handleStatusUpdate = async () => {
    setSavingStatus(true);
    try {
      const res = await updateDoctor(id, {
        ...doctor,
        status: statusDraft,
      });
      setDoctor(res);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status ❌");
    } finally {
      setSavingStatus(false);
    }
  };

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

        <div className="flex items-center gap-3 mb-6">
          <BackButton to="/dashboard/doctor-management" />
          <h1 className="text-2xl font-bold text-gray-800">
            Doctor Details
          </h1>
        </div>
        
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
            {doctor.specialization}
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
          <div className="flex justify-start">
            <span className="font-medium text-gray-600">Fee:</span>
            <span className="text-gray-800 font-semibold">{doctor.fee}</span>
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

          {/* Change Status */}
          <div className="flex justify-start items-center gap-2">
            <span className="font-medium text-gray-600">Update Status:</span>
            <select
              value={statusDraft}
              onChange={(e) => setStatusDraft(e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm"
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={savingStatus || statusDraft === doctor.status}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded-lg disabled:opacity-50"
            >
              {savingStatus ? "Saving..." : "Save"}
            </button>
          </div>

           {/* Experience */}
        <div className="space-y-2 mb-4">
             <div className="flex justify-start">
            <span className="font-medium text-gray-600">Experience:</span>
            <span className="text-gray-800 font-semibold">{doctor.experience}</span>
          </div>

        </div>

        </div>

      </div>

  );
};

export default DoctorView;