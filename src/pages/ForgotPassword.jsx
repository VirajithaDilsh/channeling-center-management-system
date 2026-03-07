import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/reset-password", {
        email,
        newPassword,
      });
      setMessage(res.data.message);
      // Redirect to login after reset
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center">
      <Paper elevation={3} className="w-[380px] p-6 text-center">

        <div className="flex flex-col items-center mb-4">
                  
        
                  <Typography variant="h5" className="text-blue-600 font-semibold">
                    LAHIRU MEDICAL CENTER
                  </Typography>
        
                
                </div>
        <Typography variant="h6" className="text-blue-600 font-semibold mb-4">
          Reset Password
        </Typography>

        <div className="mb-6">
             <TextField
          fullWidth
          label="Email Address"
          variant="outlined"
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4"
        />


        </div>

        <div className="mb-6">
             <TextField
          fullWidth
          label="New Password"
          type="password"
          variant="outlined"
          size="small"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-4"
        />

        </div>
       
       

        <Button variant="contained" onClick={handleReset} fullWidth>
          Reset Password
        </Button>

        {message && <Typography color="primary" className="mt-2">{message}</Typography>}
      </Paper>
    </div>
  );
};

export default ForgotPassword;