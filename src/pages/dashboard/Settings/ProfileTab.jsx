import React, { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { getMyAccount, updateMyAccount } from "../../../api/AdminApi";
import { getMyDoctorProfile, updateMyDoctorProfile } from "../../../api/DoctorApi";

function StaffProfile({ showSnackbar }) {
  const [account, setAccount] = useState(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyAccount();
        setAccount(data);
        setName(data.name || "");
        setContact(data.contact || "");
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load your profile", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateMyAccount({ name, contact });
      setAccount(updated);
      showSnackbar("Profile updated successfully");
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading profile...</p>;
  if (!account) return null;

  return (
    <div className="max-w-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Full Name</label>
          <input className="w-full border rounded-lg p-2 mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Contact</label>
          <input className="w-full border rounded-lg p-2 mt-1" value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input className="w-full border rounded-lg p-2 mt-1 bg-gray-100" value={account.email} disabled />
        </div>
        <div>
          <label className="text-sm text-gray-600">Role</label>
          <input className="w-full border rounded-lg p-2 mt-1 bg-gray-100 capitalize" value={account.role} disabled />
        </div>
      </div>
      <Button variant="contained" onClick={handleSave} disabled={saving}>
        {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
      </Button>
    </div>
  );
}

function DoctorProfile({ showSnackbar }) {
  const [doctor, setDoctor] = useState(null);
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyDoctorProfile();
        setDoctor(data);
        setPhone(data.phone || "");
        setExperience(data.experience || "");
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load your doctor profile", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateMyDoctorProfile({ phone, experience });
      setDoctor(updated);
      showSnackbar("Profile updated successfully");
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading profile...</p>;
  if (!doctor) return null;

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-gray-500 text-sm">
        Specialization, fee, and status are managed by the clinic admin. You can update your phone number and experience below.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <input className="w-full border rounded-lg p-2 mt-1 bg-gray-100" value={doctor.name} disabled />
        </div>
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input className="w-full border rounded-lg p-2 mt-1 bg-gray-100" value={doctor.email || ""} disabled />
        </div>
        <div>
          <label className="text-sm text-gray-600">Specialization</label>
          <input className="w-full border rounded-lg p-2 mt-1 bg-gray-100" value={doctor.specialization} disabled />
        </div>
        <div>
          <label className="text-sm text-gray-600">Consultation Fee</label>
          <input className="w-full border rounded-lg p-2 mt-1 bg-gray-100" value={doctor.fee} disabled />
        </div>
        <div>
          <label className="text-sm text-gray-600">Phone</label>
          <input className="w-full border rounded-lg p-2 mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Experience</label>
          <input className="w-full border rounded-lg p-2 mt-1" value={experience} onChange={(e) => setExperience(e.target.value)} />
        </div>
      </div>
      <Button variant="contained" onClick={handleSave} disabled={saving}>
        {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
      </Button>
    </div>
  );
}

export default function ProfileTab({ role, showSnackbar }) {
  return role === "doctor" ? <DoctorProfile showSnackbar={showSnackbar} /> : <StaffProfile showSnackbar={showSnackbar} />;
}
