import React, { useState } from "react";
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
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { createPatient } from "../../../api/patientApi";

const doctors = [
  "Dr. John Smith",
  "Dr. Emily Watson",
  "Dr. Michael Brown",
  "Dr. Sarah Johnson",
  "Dr. David Lee"
];

const RegisterPatient = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: "",
    contact: "",
    age: "",
    gender: "",
    address: "",
    doctor: "",
    disease: "",
    date: "",
    bloodGroup: "",
    medicalHistory: "",
    description: `BP:\nCholesterol:\nSugar Level:\nAllergies:\nHeart Rate:\nTemperature:\nWeight:\nHeight:\nNotes:`
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleSubmit = async () => {
    setLoading(true);

    const patientData = {
      patientId: `P-${Date.now()}`,
      name: formData.patientName,
      age: formData.age,
      gender: formData.gender,
      phone: formData.contact,
      address: formData.address,
      blood: formData.bloodGroup,
      doctor: formData.doctor,
      disease: formData.disease,
      visit: formData.date,
      history: formData.medicalHistory,
      description: formData.description
    };

    try {
      await createPatient(patientData);

      // show a professional success notification
      setSnackbar({ open: true, message: "Patient successfully registered.", severity: "success" });

      // reset form immediately (optional) and navigate to patient management page
      setFormData({
        patientName: "",
        contact: "",
        age: "",
        gender: "",
        address: "",
        doctor: "",
        disease: "",
        date: "",
        bloodGroup: "",
        medicalHistory: "",
        description: `BP:\nCholesterol:\nSugar Level:\nAllergies:\nHeart Rate:\nTemperature:\nWeight:\nHeight:\nNotes:`
      });

      // Navigate after a short delay so the user can briefly read the notification.
      // If you'd prefer to navigate immediately, change the timeout to 0 or call navigate() directly.
      setTimeout(() => navigate("/dashboard/patients"), 1100);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to register patient. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDoctorChange = (event, value) => {
    setFormData({
      ...formData,
      doctor: value || ""
    });
  };

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="mb-6">
        <Typography variant="h5" className="font-semibold">
          Register Patient
        </Typography>
        <p className="text-gray-500">Add a new patient with medical details</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <PersonIcon className="text-blue-500" />
              <Typography variant="h6">Patient Details</Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextField label="Patient Name" name="patientName" fullWidth value={formData.patientName} onChange={handleChange} sx={{ borderRadius: 3 }} />

              <TextField label="Contact" name="contact" fullWidth value={formData.contact} onChange={handleChange} />

              <TextField label="Age" name="age" fullWidth value={formData.age} onChange={handleChange} />

              <TextField select label="Gender" name="gender" fullWidth value={formData.gender} onChange={handleChange}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>

              <TextField label="Address" name="address" multiline rows={2} fullWidth className="col-span-2" value={formData.address} onChange={handleChange} />
            </div>
          </Paper>

          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <MedicalInformationIcon className="text-green-500" />
              <Typography variant="h6">Medical Details</Typography>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Autocomplete options={doctors} value={formData.doctor} onChange={handleDoctorChange} renderInput={(params) => <TextField {...params} label="Select Doctor" />} />

              <TextField label="Disease" name="disease" fullWidth value={formData.disease} onChange={handleChange} />

              <TextField type="date" label="Date" name="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleChange} />

              <TextField select label="Blood Group" name="bloodGroup" fullWidth value={formData.bloodGroup} onChange={handleChange}>
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
              </TextField>

              <TextField label="Medical History" name="medicalHistory" multiline rows={2} className="col-span-2" value={formData.medicalHistory} onChange={handleChange} />

              <TextField label="Description / Medical Test Results" name="description" multiline rows={10} className="col-span-2" fullWidth value={formData.description} onChange={handleChange} placeholder={`BP:\nCholesterol:\nSugar Level:\nAllergies:\nHeart Rate:\nTemperature:\nWeight:\nHeight:\nNotes:`} />
            </div>
          </Paper>
        </div>

        <div className="col-span-4">
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <SummarizeIcon className="text-blue-500" />
              <Typography variant="h6">Summary</Typography>
            </div>

            <div className="flex justify-center mb-4">
              <Avatar sx={{ width: 70, height: 70, bgcolor: "#3b82f6", fontSize: 28 }}>{formData.patientName ? formData.patientName.charAt(0) : "P"}</Avatar>
            </div>

            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between"><span>Name</span><span>{formData.patientName || "-"}</span></div>
              <div className="flex justify-between"><span>Contact</span><span>{formData.contact || "-"}</span></div>
              <div className="flex justify-between"><span>Doctor</span><span>{formData.doctor || "-"}</span></div>
              <div className="flex justify-between"><span>Disease</span><span>{formData.disease || "-"}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{formData.date || "-"}</span></div>
              <div className="flex justify-between"><span>Blood Group</span><span>{formData.bloodGroup || "-"}</span></div>
            </div>

            <div className="mt-6 space-y-8">
              <Button
                variant="contained"
                fullWidth
                sx={{ borderRadius: "14px", textTransform: "none" }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : "Register Patient"}
              </Button>

                          <Button
              variant="outlined"
              fullWidth
              sx={{
                borderRadius: "14px",
                textTransform: "none",
                mt: 2
              }}
            >
              Cancel
            </Button>
            </div>
          </Paper>
        </div>
      </div>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RegisterPatient;
