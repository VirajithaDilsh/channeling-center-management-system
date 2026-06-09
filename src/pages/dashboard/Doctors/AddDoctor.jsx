import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddButton from "../../../components/AddButton";
import axios from "axios";
import { experimental_sx } from "@mui/material";





const AddDoctor = () => {

  const navigate = useNavigate();

  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    qualifications: "",
    fee: "",
    phone: "",
    email: "",
    experience: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};

    if (!doctor.name.trim()) errors.name = "Name is required";
    if (!doctor.specialization.trim()) errors.specialization = "Specialization is required";
    if (!doctor.qualifications.trim()) errors.qualifications = "Qualifications is required";
    if (!doctor.fee || doctor.fee <= 0) errors.fee = "Fee must be a positive number";
    if (!/^\d{10}$/.test(doctor.phone)) errors.phone = "Enter a valid 10-digit phone";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctor.email)) errors.email = "Enter a valid email";

  return errors;
};


 const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setDoctor({
    ...doctor,
    [name]: type === "checkbox" ? checked : value
  });
};

  //  connect API here
 const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
      if (Object.keys(errors).length > 0) {
        setErrors(errors); // add: const [errors, setErrors] = useState({});
        return;
      }

    try {

      await axios.post("http://localhost:5000/api/doctors", doctor);

      alert("Doctor added successfully ✅");

      navigate("/dashboard/doctor-management");

    } catch (error) {

      alert("Error adding doctor ❌");

      console.error(error);

    }
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
              placeholder="Jane Doe"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />


              {/* Error Message */}
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}

          </div>

          {/* Specialization */}
          <div>
            <label className="text-sm text-gray-600">
              Specialization
            </label>

            <select
              placeholder = "select specialaization"
              name="specialization"
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            >
              <option value="">Select Specialization</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>

              {/* Error Message */}
            {errors.specialization && <p className = "text-red-500 text-xs mt-1">{errors.specialization}</p>}
            
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


            {/* Error Message */}
            {errors.qualifications && <p className = "text-red-500 text-xs mt-1">{errors.qualifications}</p>}
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

            {/* Error Message */}
            {errors.fee && <p className = "text-red-500 text-xs mt-1">{errors.fee}</p>}
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
            {/* Error Message */}
            {errors.phone && <p className = "text-red-500 text-xs mt-1">{errors.phone}</p>}
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
            {/* Error Message */}
            {errors.email && <p className = "text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label>
              Experience (Years)
            </label>

            <input
              type ="experience"
              name = "experience"
              placeholder = "3"
              className = "w-full border rounded-lg p-2 mt-1"
              onChange = {handleChange}
            />
          </div>



          {/*Active Switch */}

          <div>

            <labale>
              Active 
            </labale>

          <input
              className="ml-2"
              type="checkbox"
              name="status"
              checked={doctor.status === "Active"}
              onChange={(e) => setDoctor({
                ...doctor,
                status: e.target.checked ? "Active" : "Inactive"
              })}
            />
            </div>

          {/* Buttons */}
          <div className="col-span-2 flex gap-3">

            <AddButton
                label="Save Doctor"
                onClick={handleSubmit}
                bgColor="#1FB1F9"
            />

            <AddButton
                label="cancel"
                onClick={() => navigate("/dashboard/doctor-management")}
                bgColor="#1FB1F9"
            />

            

            </div>

        </form>

      </div>

    </div>
  );
};

export default AddDoctor;