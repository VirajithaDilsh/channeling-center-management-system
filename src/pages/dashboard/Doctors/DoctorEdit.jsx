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
    active: true
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

      await axios.put(`http://localhost:5000/api/doctors/${id}`, doctor);

      alert("Doctor updated successfully ✅");

      navigate("/dashboard/doctor-management");

    } catch (error) {

      console.error(error);

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
          </div>

          {/* Specialization */}
          <div>
            <label className="text-sm text-gray-600">
              Specialization
            </label>

            <input
              type="text"
              name="specialization"
              value={doctor.specialization}
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

          {/* Active */}
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