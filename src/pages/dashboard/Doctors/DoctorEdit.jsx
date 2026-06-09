import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddButton from "../../../components/AddButton";
import axios from "axios";

const DoctorEdit = () => {

  const { id } = useParams();
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

  // get doctor data
  useEffect(() => {
    axios.get(`http://localhost:5000/api/doctors/${id}`)
      .then((res) => {
        setDoctor(res.data);
      })
      .catch((err) => {
        console.error("Error fetching doctor:", err);
      });
  }, [id]);

  {/* Validations */}
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
  

  // handle change
  // ✅ Handle status checkbox separately
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  if (name === "status") {
    setDoctor({ ...doctor, status: checked ? "Active" : "Inactive" });
  } else {
    setDoctor({ ...doctor, [name]: type === "checkbox" ? checked : value });
  }
};

  // update doctor
  const handleSubmit = async (e) => {
          e.preventDefault();

          const errors = validate();
            if (Object.keys(errors).length > 0) {
              setErrors(errors); // add: const [errors, setErrors] = useState({});
              return;
            }

    try {

      await axios.put(`http://localhost:5000/api/doctors/${id}`, doctor);

      alert("Doctor updated successfully ✅");

      navigate("/dashboard/doctor-management");

    } catch (error) {
              console.error("Full error:", error.response?.data); // ✅ see exact backend message
              alert("Error updating doctor ❌");
            }

  };

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-semibold">
        Edit Doctor
      </h1>

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
              value={doctor.name}
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
              value={doctor.qualifications}
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
              value={doctor.fee}
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
              value={doctor.phone}
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
              value={doctor.email}
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />
            {/* Error Message */}
            {errors.email && <p className = "text-red-500 text-xs mt-1">{errors.email}</p>}
            
          </div>

          {/* Experience */}
          <div>
            <label className="text-sm text-gray-600">
              Experience (Years)
            </label>
            
            <input
              type="number"
              name="experience"
              value={doctor.experience}
              className="w-full border rounded-lg p-2 mt-1"
              onChange={handleChange}
            />

            {/* Error Message */}
            {errors.experience && <p className = "text-red-500 text-xs mt-1">{errors.experience}</p>}
            
          </div>

          {/* Active */}
          <div className="flex items-center justify-between rounded-lg border p-3">
              <label className="text-sm text-gray-600">Active</label>
              <input
                type="checkbox"
                name="status"
                checked={doctor.status === "Active"}
                onChange={handleChange}
              />
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex gap-3">

            <AddButton
              label="Update Doctor"
              onClick={handleSubmit}
              bgColor="#1FB1F9"
            />

            <AddButton
              label="Cancel"
              onClick={() => navigate("/dashboard/doctor-management")}
              bgColor="#1FB1F9"
            />

          </div>

        </form>

      </div>

    </div>
  );
};

export default DoctorEdit;