import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import DashboardHome from "../pages/dashboard/DashBoardHome.jsx";
import Doctors from "../pages/dashboard/Doctors.jsx";
import Patients from "../pages/dashboard/Patients.jsx";
import Appointments from "../pages/dashboard/Appointments.jsx";
import Payments from "../pages/dashboard/Payments.jsx";
import Reports from "../pages/dashboard/Reports.jsx";
import Settings from "../pages/dashboard/Settings.jsx";
{/*import Login from "../pages/auth/Login.jsx";*/}

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route path="/login" element={<Login />} />*/}

                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="doctors" element={<Doctors />} />
                    <Route path="patients" element={<Patients />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="payments" element={<Payments />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;