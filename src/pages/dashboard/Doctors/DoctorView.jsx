
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  UserRound,
  Phone,
  Mail,
  GraduationCap,
  BriefcaseMedical,
  Wallet,
  Activity,
  CalendarDays,
  Save,
  Stethoscope,
} from "lucide-react";

import { getDoctorById, updateDoctor } from "../../../api/DoctorApi";
import BackButton from "../../../components/BackButton";
import { getViewer } from "../../../utils/permissions";
import { DAY_NAMES, DAY_ORDER, maxLabel } from "../../../utils/availability";

const DoctorView = () => {
  const { id } = useParams();
  const viewer = getViewer();

const canEdit = viewer.can(["doctors_edit", "doctors_allow_all"]);
const canWrite = viewer.can(["doctors_write", "doctors_allow_all"]);

const canManageAvailability = canEdit || canWrite;

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusDraft, setStatusDraft] = useState("Available");
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const data = await getDoctorById(id);
        setDoctor(data);
        setStatusDraft(data.status || "Available");
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  const handleStatusUpdate = async () => {
    setSavingStatus(true);

    try {
      const res = await updateDoctor(id, {
        ...doctor,
        status: statusDraft,
      });

      setDoctor(res);
      alert("Doctor status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update doctor status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const statusStyles = {
    Available: "bg-green-100 text-green-700 border-green-200",
    Busy: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "On Leave": "bg-red-100 text-red-700 border-red-200",
  };

  const InfoCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon size={20} className="text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-500">
          {label}
        </span>
      </div>

      <p className="text-gray-800 font-semibold break-words">
        {value || "-"}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <UserRound size={48} className="text-gray-300 mb-3" />
        <h2 className="text-xl font-semibold text-gray-700">
          Doctor Not Found
        </h2>
        <p className="text-gray-500 mt-1">
          The requested doctor information is unavailable.
        </p>
        <div className="mt-4">
          <BackButton to="/dashboard/doctor-management" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 rounded-xl min-h-full">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/dashboard/doctor-management" />

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Doctor Profile
          </h1>
          <p className="text-sm text-gray-500">
            View and manage doctor information
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5">

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
            <UserRound size={48} className="text-blue-600" />
          </div>

          {/* Doctor Details */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800">
              {doctor.name}
            </h2>

            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-blue-600">
              <Stethoscope size={18} />
              <span className="font-medium">
                {doctor.specialization || "Specialization not specified"}
              </span>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {doctor.qualifications || "Qualifications not provided"}
            </p>

            <div className="mt-4">
              <span
                className={`inline-flex items-center px-4 py-1.5 rounded-full border text-sm font-semibold ${
                  statusStyles[doctor.status] ||
                  "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current mr-2" />
                {doctor.status || "Unknown"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Information Section */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          Doctor Information
        </h3>
        <p className="text-sm text-gray-500">
          Personal and professional details
        </p>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        <InfoCard
          icon={Phone}
          label="Phone Number"
          value={doctor.phone}
        />

        <InfoCard
          icon={Mail}
          label="Email Address"
          value={doctor.email}
        />

        <InfoCard
          icon={GraduationCap}
          label="Qualifications"
          value={doctor.qualifications}
        />

        <InfoCard
          icon={BriefcaseMedical}
          label="Experience"
          value={
            doctor.experience
              ? `${doctor.experience} Years`
              : "-"
          }
        />

        <InfoCard
          icon={Wallet}
          label="Consultation Fee"
          value={
            doctor.fee != null
              ? `Rs. ${Number(doctor.fee).toLocaleString()}`
              : "-"
          }
        />

        <InfoCard
          icon={Activity}
          label="Specialization"
          value={doctor.specialization}
        />

      </div>

      {/* Weekly availability (read-only, visible to everyone who can view the doctor) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <CalendarDays className="text-green-600" size={22} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Weekly Availability</h3>
            <p className="text-sm text-gray-500">Days and times patients can book this doctor</p>
          </div>
        </div>
        {doctor.weeklySchedule?.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {DAY_ORDER.filter((d) => doctor.weeklySchedule.some((w) => w.dayOfWeek === d)).map((d) => (
              <div key={d} className="border border-gray-100 rounded-lg px-4 py-3">
                <div className="font-medium text-gray-800 mb-1">{DAY_NAMES[d]}</div>
                {doctor.weeklySchedule
                  .filter((w) => w.dayOfWeek === d)
                  .map((w) => (
                    <div key={w._id} className="text-sm text-gray-600">
                      {w.startTime}&ndash;{w.endTime} &middot; {maxLabel(w)}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No weekly availability set yet.</p>
        )}
      </div>

      {/* Availability Management */}
     {canManageAvailability && (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 bg-blue-50 rounded-lg">
        <CalendarDays className="text-blue-600" size={22} />
      </div>

      <div>
        <h3 className="font-bold text-gray-800">
          Availability Management
        </h3>
        <p className="text-sm text-gray-500">
          Update the doctor's current availability
        </p>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 sm:items-end">

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Doctor Status
        </label>

        <select
          value={statusDraft}
          onChange={(e) => setStatusDraft(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>

      <button
        onClick={handleStatusUpdate}
        disabled={
          savingStatus ||
          statusDraft === (doctor.status || "Available")
        }
        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        <Save size={18} />
        {savingStatus ? "Saving..." : "Update Status"}
      </button>

    </div>
  </div>
)}

    </div>
  );
};

export default DoctorView;
