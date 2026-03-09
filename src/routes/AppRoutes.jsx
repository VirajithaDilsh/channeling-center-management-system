import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import DashboardHome from "../pages/dashboard/DashBoardHome.jsx";
import Doctors from "../pages/dashboard/Doctors.jsx";
import Patients from "../pages/dashboard/Patients.jsx";
import Appointments from "../pages/dashboard/Appointments.jsx";
import Billing from "../pages/dashboard/Billing.jsx";
import Reports from "../pages/dashboard/Reports.jsx";
import Settings from "../pages/dashboard/Settings.jsx";
import Login from "../pages/Login.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import CreateInvoice from "../pages/dashboard/CreateInvoice.jsx";
import RegisterPatient from "../pages/dashboard/RegisterPatient.jsx";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
              
                 <Route path="/" element={<Login />} />
                 <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="doctors" element={<Doctors />} />
                    <Route path="patients" element={<Patients />} />
                    <Route path="appointments" element={<Appointments />} />
                     <Route path="create-invoice" element={<CreateInvoice />} />
                     <Route path="register-patient" element={<RegisterPatient/>} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;