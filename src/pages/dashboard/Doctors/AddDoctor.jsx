import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField } from "@mui/material";
import AddButton from "../../../components/AddButton";
import BackButton from "../../../components/BackButton";
import { createDoctor } from "../../../api/DoctorApi";
import { SPECIALIZATIONS } from "../../../constants/specializations";
import { QUALIFICATIONS } from "../../../constants/qualifications";




const AddDoctor = () => {

  const navigate = useNavigate();

  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    qualifications: "",
    fee: "",
    phone: "",
    email: "",
    password: "",
    status: "Available"
  });


  const handleChange = (e) => {
    setDoctor({...doctor,[e.target.name]: e.target.value});
  };

  const handleSubmit = async () => {

    if (!doctor.name || !doctor.specialization || !doctor.fee || !doctor.email || !doctor.password) {
      alert("Please fill in Name, Specialization, Fee, Email and Password ❌");
      return;
    }

    try {

      await createDoctor(doctor);

      alert("Doctor added successfully ✅");

      navigate("/dashboard/doctor-management");

    } catch (error) {

      alert(error.response?.data?.message || "Error adding doctor ❌");

      console.error(error);

    }
  };


  return (
    <div className="space-y-6">

      {/* Page Title */}
      <div className="flex items-center gap-3">
        <BackButton to="/dashboard/doctor-management" />
        <h1 className="text-2xl font-semibold">
          Add New Doctor
        </h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-lg font-semibold mb-6">
          Doctor Details
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

          {/* Doctor Name */}
          <div>
            <label className="text-sm text-gray-600">
              Doctor Name
            </label>

            <input
              type="text"
              name="name"
              placeholder="Dr. Jane Doe"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="text-sm text-gray-600">
              Specialization
            </label>

            <select
              name="specialization"
              value={doctor.specialization}
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            >
              <option value="" disabled>
                Select specialization
              </option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Qualifications */}
          <div>
            <label className="text-sm text-gray-600">
              Qualifications
            </label>

            <Autocomplete
              multiple
              freeSolo
              options={QUALIFICATIONS}
              value={
                doctor.qualifications
                  ? doctor.qualifications.split(",").map((q) => q.trim()).filter(Boolean)
                  : []
              }
              onChange={(e, newValue) =>
                handleChange({ target: { name: "qualifications", value: newValue.join(", ") } })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select or type qualifications"
                  className="mt-1"
                  size="small"
                />
              )}
            />
          </div>

          {/* Fee */}
          <div>
            <label className="text-sm text-gray-600">
              Fee
            </label>

            <input
              type="number"
              name="fee"
              placeholder="150.00"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="text-sm text-gray-600">
              Contact Phone
            </label>

            <input
              type="text"
              name="phone"
              placeholder="555-123-4567"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="jane.doe@clinicconnect.com"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />
          </div>

          {/* Password (creates the doctor's login account) */}
          <div>
            <label className="text-sm text-gray-600">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Login password"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm text-gray-600">
              Status
            </label>

            <select
              name="status"
              value={doctor.status}
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex gap-3">

            <AddButton
                label="Save Doctor"
                onClick={handleSubmit}
            />

            <AddButton
                label="Cancel"
                color="inherit"
                onClick={() => navigate("/dashboard/doctor-management")}
            />

            

            </div>

        </form>

      </div>

    </div>
  );
};

export default AddDoctor;