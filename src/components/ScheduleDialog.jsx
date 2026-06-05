import React, { useState, useEffect } from "react";
import axios from "axios";

const DoctorScheduleDialog = ({ doctor, onClose }) => {

  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    maxPatients: "",
  });

  // Fetch existing schedules
  useEffect(() => {
    axios.get(`http://localhost:5000/api/schedules/${doctor._id}`)
      .then((res) => setSchedules(res.data))
      .catch((err) => console.error("Error fetching schedules:", err));
  }, [doctor._id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/schedules", {
        ...form,
        doctorId: doctor._id,
      });
      setSchedules([...schedules, res.data]);
      setForm({ date: "", startTime: "", endTime: "", maxPatients: "" });
      alert("Schedule added successfully ✅");
    } catch (error) {
      console.error(error);
      alert("Error adding schedule ❌");
    }
  };

  return (

    // Backdrop
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">

      {/* Dialog Box */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Schedule — {doctor.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Add Schedule Form */}
        <div className="grid grid-cols-2 gap-4 mb-6">

          <div>
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Max Patients</label>
            <input
              type="number"
              name="maxPatients"
              value={form.maxPatients}
              onChange={handleChange}
              placeholder="e.g. 20"
              className="w-full border rounded-lg p-2 mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">End Time</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 text-sm"
            />
          </div>

        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold mb-6"
        >
          + Add Schedule
        </button>

        {/* Existing Schedules */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Existing Schedules
          </h3>

          {schedules.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No schedules found.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {schedules.map((s, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 border rounded-lg px-4 py-2 text-sm"
                >
                  <span className="text-gray-700 font-medium">{s.date}</span>
                  <span className="text-gray-500">{s.startTime} - {s.endTime}</span>
                  <span className="text-blue-600 font-semibold">
                    {s.maxPatients} patients
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorScheduleDialog;