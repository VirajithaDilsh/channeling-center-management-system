import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../../../components/AddButton";

const AddDoctor = () => {

  const navigate = useNavigate();

  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    qualifications: "",
    fee: "",
    phone: "",
    email: "",
    active: true
  });

  const handleSave = () => {
    const doctor = {
      name: "Dr. John",
      specialization: "Cardiology",
      fee: "150",
      status: "Active"
    };

    addDoctor(doctor);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setDoctor({
      ...doctor,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Doctor Data:", doctor);

    // later connect API here
  };

  return (
    <div className="space-y-6">

      {/* Page Title */}
      <h1 className="text-2xl font-semibold">
        Add New Doctor
      </h1>

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

            <input
              type="text"
              name="specialization"
              placeholder="Pediatrics"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />
          </div>

          {/* Qualifications */}
          <div>
            <label className="text-sm text-gray-600">
              Qualifications
            </label>

            <input
              type="text"
              name="qualifications"
              placeholder="MD, FAAP"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
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

          {/* Active Checkbox */}
          <div className="col-span-2 flex items-center gap-2">

            <input
              type="checkbox"
              name="active"
              checked={doctor.active}
              onChange={handleChange}
            />

            <label className="text-sm text-gray-700">
              Active
            </label>

          </div>

          {/* Buttons */}
          <div className="col-span-2 flex gap-3">

            <AddButton
                label="Save Doctor"
                onClick={() => navigate("/dashboard/doctor-management/add-doctors")}
                bgColor="#1FB1F9"
            />

            <button className="border px-4 py-2 rounded">
                Cancel
            </button>

            </div>

        </form>

      </div>

    </div>
  );
};

export default AddDoctor;