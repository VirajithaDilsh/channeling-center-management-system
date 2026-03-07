// import React from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Link
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";



const Login = () => {

   const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
    const navigate = useNavigate();

 const handleLogin = async () => {
  console.log("Login clicked");
  try {
    const res = await axios.post("http://localhost:5000/api/login", {
      email,
      password,
    });
    console.log(res.data);
    setError(""); // clear error
    // alert("Login successful!");
    navigate("/dashboard")
  } catch (err) {
    console.error(err.response?.data || err.message);
    setError(err.response?.data?.message || "Login failed");
  }
};

  return (
     <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(/login-bg.webp)` }}
    >
      <Paper elevation={3} className="w-[380px] p-6 text-center">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="bg-blue-500 text-white p-2 rounded-full mb-2">
            <LockIcon />
          </div>

          <Typography variant="h6" className="text-blue-600 font-semibold">
            LAHIRU MEDICAL CENTER
          </Typography>

        
        </div>

        {/* Email */}
        <div className="mb-4">
          <TextField
            fullWidth
            label="Email Address"
            variant="outlined"
            size="small"
            placeholder="your@example.com"
            value={email} // bind state
           onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            size="small"
            placeholder="Enter your password"
             value={password} // bind state
             onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Remember + forgot */}
        <div className="flex justify-between items-center mb-4">
          <FormControlLabel
            control={<Checkbox size="small" />}
            label="Remember me"
          />

          <Link
            component="button"
            underline="hover"
            className="text-sm"
            onClick={() => navigate("/forgot-password")} // ✅ navigate to forgot page
          >
            Forgot password?
          </Link>
        </div>

        {/* Login button */}
       <Button variant="contained" onClick={handleLogin} fullWidth>
  Login
  {error && <Typography color="error">{error}</Typography>}
</Button>

        

      </Paper>
    </div>
  );
};

export default Login;