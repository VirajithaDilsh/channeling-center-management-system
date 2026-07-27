import React, { useEffect, useState } from "react";
import {
  TextField,
  Paper,
  Typography,
  Avatar,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import { useParams } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import SummarizeIcon from "@mui/icons-material/Summarize";
import BackButton from "../../../components/BackButton";
import { getPatientById } from "../../../api/PatientApi";
import { getChannelingHistory } from "../../../api/ChannelingApi";

const ViewPatient = () => {
  const { id } = useParams(); // get patient id from route
  const [patient, setPatient] = useState(null);
  const [channelingHistory, setChannelingHistory] = useState([]);

  useEffect(() => {
    fetchPatient();
    fetchChannelingHistory();
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

  const fetchChannelingHistory = async () => {
    try {
      const history = await getChannelingHistory(id);
      setChannelingHistory(history);
    } catch (err) {
      console.error(err);
    }
  };

  if (!patient) return <p>Loading patient details...</p>;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-6">
        <BackButton to="/dashboard/patients" />
        <div>
          <Typography variant="h5" className="font-semibold">
            View Patient
          </Typography>
          <p className="text-gray-500">Patient details (read-only)</p>
        </div>
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
              <TextField label="Blood Group" value={patient.blood} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Address" value={patient.address || ""} multiline rows={2} fullWidth InputProps={{ readOnly: true }} className="col-span-2" />
            </div>
          </Paper>

          {/* Channeling History Card */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MedicalInformationIcon className="text-red-500" />
              <Typography variant="h6">Channeling History</Typography>
            </div>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Disease</TableCell>
                    <TableCell>BP</TableCell>
                    <TableCell>Heart Rate</TableCell>
                    <TableCell>Temp</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Height</TableCell>
                    <TableCell>Cholesterol</TableCell>
                    <TableCell>Sugar</TableCell>
                    <TableCell>Allergies</TableCell>
                    <TableCell>Medical History</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {channelingHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={13} className="text-gray-500">No visits recorded yet.</TableCell>
                    </TableRow>
                  )}
                  {channelingHistory.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell>{new Date(v.recordedAt).toLocaleString()}</TableCell>
                      <TableCell>{v.doctor || "-"}</TableCell>
                      <TableCell>{v.disease || "-"}</TableCell>
                      <TableCell>{v.bloodPressureSystolic || v.bloodPressureDiastolic ? `${v.bloodPressureSystolic || "-"}/${v.bloodPressureDiastolic || "-"}` : "-"}</TableCell>
                      <TableCell>{v.heartRate || "-"}</TableCell>
                      <TableCell>{v.temperature || "-"}</TableCell>
                      <TableCell>{v.weight || "-"}</TableCell>
                      <TableCell>{v.height || "-"}</TableCell>
                      <TableCell>{v.cholesterol || "-"}</TableCell>
                      <TableCell>{v.sugarLevel || "-"}</TableCell>
                      <TableCell>{v.allergies || "-"}</TableCell>
                      <TableCell>{v.medicalHistory || "-"}</TableCell>
                      <TableCell>{v.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
              <div className="flex justify-between"><span>Blood Group</span><span>{patient.blood}</span></div>
            </div>

          </Paper>
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;