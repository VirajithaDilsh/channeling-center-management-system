import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import DashboardHome from "../pages/dashboard/DashBoardHome.jsx";
import Doctors from "../pages/dashboard/Doctors/AddDoctor.jsx";
import DoctorManagement from "../pages/dashboard/Doctors/DoctorManagement.jsx";
import Patients from "../pages/dashboard/Patients/Patients.jsx";
import Inventory from "../pages/dashboard/Inventory/Inventory.jsx";
import AddMedicines from "../pages/dashboard/Inventory/AddMedicine.jsx";
import Payments from "../pages/dashboard/Payments/Payments.jsx";
import Reports from "../pages/dashboard/Reports/Reports.jsx";
import Settings from "../pages/dashboard/Settings/Settings.jsx";
import DoctorView from "../pages/dashboard/Doctors/DoctorView.jsx";
import DoctorEdit from "../pages/dashboard/Doctors/DoctorEdit.jsx";

{/*import Login from "../pages/auth/Login.jsx";*/}

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                 {/* Redirect root URL to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                
                {/* <Route path="/login" element={<Login />} />*/}

                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="doctor-management/add-doctors" element={<Doctors />} />
                    <Route path="doctor-management" element={<DoctorManagement />} />
                    <Route path="doctor/:id" element={<DoctorView />} />
                    <Route path="doctor/edit/:id" element={<DoctorEdit />} />
                    <Route path="patients" element={<Patients />} />
                    <Route path="inventory" element={<Inventory />}/>
                    <Route path="inventory/add-medicine" element={<AddMedicines />}/>
                    <Route path="payments" element={<Payments />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;