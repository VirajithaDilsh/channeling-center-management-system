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