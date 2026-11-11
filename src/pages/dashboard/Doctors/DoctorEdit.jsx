import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Autocomplete, TextField } from "@mui/material";
import AddButton from "../../../components/AddButton";
import BackButton from "../../../components/BackButton";
import { getDoctorById, updateDoctor } from "../../../api/DoctorApi";
import { SPECIALIZATIONS } from "../../../constants/specializations";
import { QUALIFICATIONS } from "../../../constants/qualifications";

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
    status: "Active"
  });

  // get doctor data
  useEffect(() => {
    getDoctorById(id)
      .then((data) => {
        setDoctor(data);
      })
      .catch((err) => {
        console.error("Error fetching doctor:", err);
      });
  }, [id]);

  // handle change
  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    setDoctor({
      ...doctor,
      [name]: type === "checkbox" ? checked : value
    });

  };

  // update doctor
  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await updateDoctor(id, doctor);

      alert("Doctor updated successfully ✅");

      navigate("/dashboard/doctor-management");

    } catch (error) {

      console.error(error);

      alert("Error updating doctor ❌");

    }

  };

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3">
        <BackButton to="/dashboard/doctor-management" />
        <h1 className="text-2xl font-semibold">
          Edit Doctor
        </h1>
      </div>

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
              {doctor.specialization &&
                !SPECIALIZATIONS.includes(doctor.specialization) && (
                  <option value={doctor.specialization}>
                    {doctor.specialization}
                  </option>
                )}
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
              value={doctor.fee}
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
              value={doctor.phone}
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
              value={doctor.email}
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
              label="Update Doctor"
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

export default DoctorEdit;