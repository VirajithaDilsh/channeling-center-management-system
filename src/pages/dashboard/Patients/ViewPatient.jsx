import React, { useEffect, useState } from "react";
import {
  TextField,
  Paper,
  Typography,
  Avatar,
  Autocomplete,
  Button
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { getPatientById } from "../../../api/PatientApi";

const ViewPatient = () => {
  const { id } = useParams(); // get patient id from route
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    fetchPatient();
  }, []);

  const fetchPatient = async () => {
    try {
      const data = await getPatientById(id);
      setPatient(data);
    } catch (err) {
      console.error(err);
      alert("Patient not found");
    }
  };

  if (!patient) return <p>Loading patient details...</p>;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Page Title */}
      <div className="mb-6">
        <Typography variant="h5" className="font-semibold">
          View Patient
        </Typography>
        <p className="text-gray-500">Patient details (read-only)</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT SIDE */}
        <div className="col-span-8 space-y-6">

          {/* Patient Details Card */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <PersonIcon className="text-blue-500" />
              <Typography variant="h6">Patient Details</Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField label="Patient Name" value={patient.name} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Contact" value={patient.phone} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Age" value={patient.age} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Gender" value={patient.gender} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Address" value={patient.address || ""} multiline rows={2} fullWidth InputProps={{ readOnly: true }} className="col-span-2" />
            </div>
          </Paper>

          {/* Medical Details Card */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MedicalInformationIcon className="text-green-500" />
              <Typography variant="h6">Medical Details</Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField label="Doctor" value={patient.doctor} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Disease" value={patient.disease || ""} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Date" value={patient.visit} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Blood Group" value={patient.blood} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Medical History" value={patient.history || ""} multiline rows={2} fullWidth InputProps={{ readOnly: true }} className="col-span-2" />
              <TextField
                label="Description / Medical Test Results"
                value={patient.description || ""}
                multiline
                rows={10}
                fullWidth
                InputProps={{ readOnly: true }}
                className="col-span-2"
              />
            </div>
          </Paper>
        </div>

        {/* SUMMARY PANEL */}
        <div className="col-span-4">
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <SummarizeIcon className="text-blue-500" />
              <Typography variant="h6">Summary</Typography>
            </div>

            <div className="flex justify-center mb-4">
              <Avatar sx={{ width: 70, height: 70, bgcolor: "#3b82f6", fontSize: 28 }}>
                {patient.name.charAt(0)}
              </Avatar>
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between"><span>Name</span><span>{patient.name}</span></div>
              <div className="flex justify-between"><span>Contact</span><span>{patient.phone}</span></div>
              <div className="flex justify-between"><span>Doctor</span><span>{patient.doctor}</span></div>
              <div className="flex justify-between"><span>Disease</span><span>{patient.disease || "-"}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{patient.visit}</span></div>
              <div className="flex justify-between"><span>Blood Group</span><span>{patient.blood}</span></div>
            </div>

            <div className="mt-6">
              <Button variant="contained" fullWidth sx={{ borderRadius: "14px" }} onClick={() => navigate(-1)}>
                Back
              </Button>
            </div>
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;