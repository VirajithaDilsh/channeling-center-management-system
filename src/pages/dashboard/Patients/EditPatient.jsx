import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  Avatar,
  Autocomplete,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";

import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import SummarizeIcon from "@mui/icons-material/Summarize";
import BackButton from "../../../components/BackButton";

import { updatePatient, getPatientById } from "../../../api/PatientApi";
import { getChannelingHistory, addChannelingRecord } from "../../../api/ChannelingApi";

const doctors = [
  "Dr. John Smith",
  "Dr. Emily Watson",
  "Dr. Michael Brown",
  "Dr. Sarah Johnson",
  "Dr. David Lee"
];

const EditPatient = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [formData, setFormData] = useState({
    patientName: "",
    contact: "",
    age: "",
    gender: "",
    address: "",
    bloodGroup: ""
  });

  const emptyVisit = {
    doctor: "",
    disease: "",
    date: "",
    medicalHistory: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
    cholesterol: "",
    sugarLevel: "",
    allergies: "",
    notes: ""
  };

  const [visitData, setVisitData] = useState(emptyVisit);
  const [channelingHistory, setChannelingHistory] = useState([]);
  const [savingVisit, setSavingVisit] = useState(false);

  const loadChannelingHistory = async () => {
    try {
      const history = await getChannelingHistory(id);
      setChannelingHistory(history);
    } catch (error) {
      console.error("Fetch channeling history error:", error);
    }
  };

  // Load patient data
  useEffect(() => {
   const fetchPatient = async () => {
  try {

    const res = await getPatientById(id);

    const data = res?.data || res;

    if (!data) return;

    setFormData({
      patientName: data.name || "",
      contact: data.phone || "",
      age: data.age || "",
      gender: data.gender || "",
      address: data.address || "",
      bloodGroup: data.blood || ""
    });

  } catch (error) {
    console.error("Fetch patient error:", error);
  }

    };

    fetchPatient();
    loadChannelingHistory();
  }, [id]);

  const handleVisitChange = (e) => {
    setVisitData({
      ...visitData,
      [e.target.name]: e.target.value
    });
  };

  const handleVisitDoctorChange = (event, value) => {
    setVisitData({
      ...visitData,
      doctor: value || ""
    });
  };

  const handleAddVisit = async () => {
    setSavingVisit(true);
    try {
      const { date, ...rest } = visitData;
      await addChannelingRecord(id, { ...rest, recordedAt: date || undefined });
      setVisitData(emptyVisit);
      await loadChannelingHistory();
      setSnackbar({ open: true, message: "Visit recorded successfully.", severity: "success" });
    } catch (error) {
      console.error("Add visit error:", error);
      setSnackbar({ open: true, message: "Failed to record visit.", severity: "error" });
    } finally {
      setSavingVisit(false);
    }
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleUpdate = async () => {

    setLoading(true);

    const patientData = {
      name: formData.patientName,
      age: formData.age,
      gender: formData.gender,
      phone: formData.contact,
      address: formData.address,
      blood: formData.bloodGroup
    };

    try {

      await updatePatient(id, patientData);

      setSnackbar({
        open: true,
        message: "Patient updated successfully.",
        severity: "success"
      });

      setTimeout(() => {
        navigate("/dashboard/patients");
      }, 1200);

    } catch (error) {

      console.error(error);

      setSnackbar({
        open: true,
        message: "Failed to update patient.",
        severity: "error"
      });

    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {

    setSnackbar((s) => ({
      ...s,
      open: false
    }));

  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">

      {/* Page Title */}

      <div className="flex items-center gap-3 mb-6">

        <BackButton to="/dashboard/patients" />

        <div>
          <Typography variant="h5" className="font-semibold">
            Edit Patient
          </Typography>

          <p className="text-gray-500">
            Update patient medical details
          </p>
        </div>

      </div>

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT SIDE */}

        <div className="col-span-8 space-y-6">

          {/* Patient Details */}

          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">

            <div className="flex items-center gap-2 mb-4">
              <PersonIcon className="text-blue-500" />
              <Typography variant="h6">Patient Details</Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <TextField
                label="Patient Name"
                name="patientName"
                fullWidth
                value={formData.patientName}
                onChange={handleChange}
              />

              <TextField
                label="Contact"
                name="contact"
                fullWidth
                value={formData.contact}
                onChange={handleChange}
              />

              <TextField
                label="Age"
                name="age"
                fullWidth
                value={formData.age}
                onChange={handleChange}
              />

              <TextField
                select
                label="Gender"
                name="gender"
                fullWidth
                value={formData.gender}
                onChange={handleChange}
              >

                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>

              </TextField>

              <TextField
                select
                label="Blood Group"
                name="bloodGroup"
                fullWidth
                value={formData.bloodGroup}
                onChange={handleChange}
              >

                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>

              </TextField>

              <TextField
                label="Address"
                name="address"
                multiline
                rows={2}
                fullWidth
                className="col-span-2"
                value={formData.address}
                onChange={handleChange}
              />

            </div>

          </Paper>

          {/* Record New Channeling Visit */}

          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">

            <div className="flex items-center gap-2 mb-4">
              <MedicalInformationIcon className="text-red-500" />
              <Typography variant="h6">Record New Channeling Visit</Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Autocomplete options={doctors} value={visitData.doctor} onChange={handleVisitDoctorChange} renderInput={(params) => <TextField {...params} label="Select Doctor" />} />
              <TextField label="Disease" name="disease" fullWidth value={visitData.disease} onChange={handleVisitChange} />
              <TextField type="date" label="Date" name="date" fullWidth InputLabelProps={{ shrink: true }} value={visitData.date} onChange={handleVisitChange} />
              <TextField label="Medical History" name="medicalHistory" multiline rows={2} className="col-span-2" value={visitData.medicalHistory} onChange={handleVisitChange} />
              <TextField label="Blood Pressure - Systolic" name="bloodPressureSystolic" type="number" fullWidth value={visitData.bloodPressureSystolic} onChange={handleVisitChange} />
              <TextField label="Blood Pressure - Diastolic" name="bloodPressureDiastolic" type="number" fullWidth value={visitData.bloodPressureDiastolic} onChange={handleVisitChange} />
              <TextField label="Heart Rate (bpm)" name="heartRate" type="number" fullWidth value={visitData.heartRate} onChange={handleVisitChange} />
              <TextField label="Temperature (°C)" name="temperature" type="number" fullWidth value={visitData.temperature} onChange={handleVisitChange} />
              <TextField label="Weight (kg)" name="weight" type="number" fullWidth value={visitData.weight} onChange={handleVisitChange} />
              <TextField label="Height (cm)" name="height" type="number" fullWidth value={visitData.height} onChange={handleVisitChange} />
              <TextField label="Cholesterol" name="cholesterol" type="number" fullWidth value={visitData.cholesterol} onChange={handleVisitChange} />
              <TextField label="Sugar Level" name="sugarLevel" type="number" fullWidth value={visitData.sugarLevel} onChange={handleVisitChange} />
              <TextField label="Allergies" name="allergies" fullWidth className="col-span-2" value={visitData.allergies} onChange={handleVisitChange} />
              <TextField label="Notes" name="notes" multiline rows={3} fullWidth className="col-span-2" value={visitData.notes} onChange={handleVisitChange} />
            </div>

            <div className="mt-4">
              <Button variant="contained" sx={{ borderRadius: "14px", textTransform: "none" }} onClick={handleAddVisit} disabled={savingVisit}>
                {savingVisit ? <CircularProgress size={20} /> : "Add Visit"}
              </Button>
            </div>

          </Paper>

          {/* Channeling History */}

          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">

            <div className="flex items-center gap-2 mb-4">
              <MedicalInformationIcon className="text-green-500" />
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

        {/* SUMMARY */}

        <div className="col-span-4">

          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm sticky top-20">

            <div className="flex items-center gap-2 mb-4">
              <SummarizeIcon className="text-blue-500" />
              <Typography variant="h6">Summary</Typography>
            </div>

            <div className="flex justify-center mb-4">

              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  bgcolor: "#3b82f6",
                  fontSize: 28
                }}
              >
                {formData.patientName
                  ? formData.patientName.charAt(0)
                  : "P"}
              </Avatar>

            </div>

            <div className="space-y-3 text-gray-700">

              <div className="flex justify-between">
                <span>Name</span>
                <span>{formData.patientName || "-"}</span>
              </div>

              <div className="flex justify-between">
                <span>Contact</span>
                <span>{formData.contact || "-"}</span>
              </div>

              <div className="flex justify-between">
                <span>Blood Group</span>
                <span>{formData.bloodGroup || "-"}</span>
              </div>

            </div>

            {/* Buttons */}

            <div className="mt-6 space-y-8">

              <Button
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: "14px",
                  textTransform: "none"
                }}
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : "Save"}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: "14px",
                  textTransform: "none"
                }}
                onClick={() => navigate("/dashboard/patients")}
              >
                Cancel
              </Button>

            </div>

          </Paper>

        </div>

      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >

        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </div>
  );
};

export default EditPatient;