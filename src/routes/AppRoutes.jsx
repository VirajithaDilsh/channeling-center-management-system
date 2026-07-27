import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import DashboardHome from "../pages/dashboard/DashBoardHome.jsx";
import Doctors from "../pages/dashboard/Doctors/DoctorView.jsx";
import Patients from "../pages/dashboard/Patients/Patients.jsx";
import Inventory from "../pages/dashboard/Inventory/Inventory.jsx";
import AddMedicines from "../pages/dashboard/Inventory/AddMedicine.jsx";
import Billing from "../pages/dashboard/Billing/Billing.jsx";
import Reports from "../pages/dashboard/Reports/Reports.jsx";
import Settings from "../pages/dashboard/Settings/Settings.jsx";
import Login from "../pages/Login.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import RegisterPatient from "../pages/dashboard/Patients/RegisterPatient.jsx";
import ViewPatient from "../pages/dashboard/Patients/ViewPatient.jsx";
import EditPatient from "../pages/dashboard/Patients/EditPatient.jsx";
import CreateInvoice from "../pages/dashboard/Billing/CreateInvoice.jsx";

import Admin from '../pages/dashboard/Admin/Admin.jsx'
import RegisterRole from '../pages/dashboard/Admin/RegisterRole.jsx';
import EditAdmin from '../pages/dashboard/Admin/EditAdmin.jsx'
import RoleManagement from '../pages/dashboard/Admin/RoleManagement.jsx'


import AddDoctors from "../pages/dashboard/Doctors/AddDoctor.jsx";
import DoctorManagement from "../pages/dashboard/Doctors/DoctorManagement.jsx";
import Payments from "../pages/dashboard/Payments/Payments.jsx";
import Appoiments from "../pages/dashboard/Appoiments/Appoiments.jsx";
import DoctorView from "../pages/dashboard/Doctors/DoctorView.jsx";
import DoctorEdit from "../pages/dashboard/Doctors/DoctorEdit.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import DoctorHome from "../pages/dashboard/DoctorPortal/DoctorHome.jsx";
import Consultation from "../pages/dashboard/DoctorPortal/Consultation.jsx";
import DispenseQueue from "../pages/dashboard/Pharmacy/DispenseQueue.jsx";

{/*import Login from "../pages/auth/Login.jsx";*/}

const AppRoutes = () => {
    return (
<BrowserRouter>
  <Routes>

    {/* Public Routes */}
    <Route path="/" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/register-role" element={<RegisterRole />} />
    <Route path="/edit-admin/:id" element={<EditAdmin />} />

    {/* Dashboard Routes */}
    <Route path="/dashboard" element={<DashboardLayout />}>
      <Route index element={<DashboardHome />} />

      {/* Admin */}
      <Route path="admin" element={<Admin />} />
      <Route path="roles" element={<RoleManagement />} />

      {/* Doctors */}
      <Route path="doctors" element={<Doctors />} />
      <Route path="doctor-management" element={<DoctorManagement />} />
      <Route path="doctor-management/add-doctors" element={<AddDoctors />} />
      <Route path="doctor/:id" element={<DoctorView />} />
      <Route path="doctor/edit/:id" element={<DoctorEdit />} />

      {/* Doctor Portal */}
      <Route path="doctor-home" element={<ProtectedRoute requiredPermission="doctor_portal"><DoctorHome /></ProtectedRoute>} />
      <Route path="doctor/consultation/:appointmentId" element={<ProtectedRoute requiredPermission="doctor_portal"><Consultation /></ProtectedRoute>} />

      {/* Patients */}
      <Route path="patients" element={<ProtectedRoute requiredPermission="manage_patients"><Patients /></ProtectedRoute>} />
      <Route path="register-patient" element={<ProtectedRoute requiredPermission="manage_patients"><RegisterPatient /></ProtectedRoute>} />
      <Route path="patients/view/:id" element={<ProtectedRoute requiredPermission="manage_patients"><ViewPatient /></ProtectedRoute>} />
      <Route path="patients/edit/:id" element={<ProtectedRoute requiredPermission="manage_patients"><EditPatient /></ProtectedRoute>} />

      {/* Inventory */}
      <Route path="inventory" element={<Inventory />} />
      <Route path="inventory/add-medicine" element={<AddMedicines />} />
      <Route path="inventory/edit-medicine/:id" element={<AddMedicines />} />

      {/* Billing */}
      <Route path="billing" element={<Billing />} />
      <Route path="billing/:id" element={<CreateInvoice />} />

      {/* Pharmacy */}
      <Route path="pharmacy" element={<ProtectedRoute requiredPermission="manage_pharmacy"><DispenseQueue /></ProtectedRoute>} />

      {/* Others */}
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
      <Route path="appoiments" element={<Appoiments />} />
    </Route>

    {/* Redirect unknown routes */}
    <Route path="*" element={<Navigate to="/" replace />} />

  </Routes>
</BrowserRouter>
    );
};

export default AppRoutes;