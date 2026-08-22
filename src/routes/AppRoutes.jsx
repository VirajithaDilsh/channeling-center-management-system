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
    <Route path="/register-role" element={<ProtectedRoute requiredPermission={["admin_read", "admin_allow_all"]}><RegisterRole /></ProtectedRoute>} />
    <Route path="/edit-admin/:id" element={<ProtectedRoute requiredPermission={["admin_read", "admin_allow_all"]}><EditAdmin /></ProtectedRoute>} />

    {/* Dashboard Routes */}
    <Route path="/dashboard" element={<DashboardLayout />}>
      <Route index element={<DashboardHome />} />

      {/* Admin */}
      <Route path="admin" element={<ProtectedRoute requiredPermission={["admin_read", "admin_allow_all"]}><Admin /></ProtectedRoute>} />
      <Route path="roles" element={<ProtectedRoute requiredPermission={["admin_read", "admin_allow_all"]}><RoleManagement /></ProtectedRoute>} />

      {/* Doctors */}
      <Route path="doctors" element={<ProtectedRoute requiredPermission={["doctors_read", "doctors_allow_all"]}><Doctors /></ProtectedRoute>} />
      <Route path="doctor-management" element={<ProtectedRoute requiredPermission={["doctors_read", "doctors_allow_all"]}><DoctorManagement /></ProtectedRoute>} />
      <Route path="doctor-management/add-doctors" element={<ProtectedRoute requiredPermission={["doctors_read", "doctors_allow_all"]}><AddDoctors /></ProtectedRoute>} />
      <Route path="doctor/:id" element={<ProtectedRoute requiredPermission={["doctors_read", "doctors_allow_all"]}><DoctorView /></ProtectedRoute>} />
      <Route path="doctor/edit/:id" element={<ProtectedRoute requiredPermission={["doctors_read", "doctors_allow_all"]}><DoctorEdit /></ProtectedRoute>} />

      {/* Doctor Portal */}
      <Route path="doctor-home" element={<ProtectedRoute requiredPermission="doctor_portal"><DoctorHome /></ProtectedRoute>} />
      <Route path="doctor/consultation/:appointmentId" element={<ProtectedRoute requiredPermission="doctor_portal"><Consultation /></ProtectedRoute>} />

      {/* Patients */}
      <Route path="patients" element={<ProtectedRoute requiredPermission={["patients_read", "patients_allow_all"]}><Patients /></ProtectedRoute>} />
      <Route path="register-patient" element={<ProtectedRoute requiredPermission={["patients_read", "patients_allow_all"]}><RegisterPatient /></ProtectedRoute>} />
      <Route path="patients/view/:id" element={<ProtectedRoute requiredPermission={["patients_read", "patients_allow_all"]}><ViewPatient /></ProtectedRoute>} />
      <Route path="patients/edit/:id" element={<ProtectedRoute requiredPermission={["patients_read", "patients_allow_all"]}><EditPatient /></ProtectedRoute>} />

      {/* Inventory */}
      <Route path="inventory" element={<ProtectedRoute requiredPermission={["inventory_read", "inventory_allow_all"]}><Inventory /></ProtectedRoute>} />
      <Route path="inventory/add-medicine" element={<ProtectedRoute requiredPermission={["inventory_read", "inventory_allow_all"]}><AddMedicines /></ProtectedRoute>} />
      <Route path="inventory/edit-medicine/:id" element={<ProtectedRoute requiredPermission={["inventory_read", "inventory_allow_all"]}><AddMedicines /></ProtectedRoute>} />

      {/* Billing */}
      <Route path="billing" element={<ProtectedRoute requiredPermission={["billing_read", "billing_allow_all"]}><Billing /></ProtectedRoute>} />
      <Route path="billing/:id" element={<ProtectedRoute requiredPermission={["billing_read", "billing_allow_all"]}><CreateInvoice /></ProtectedRoute>} />

      {/* Pharmacy */}
      <Route path="pharmacy" element={<ProtectedRoute requiredPermission={["pharmacy_read", "pharmacy_allow_all"]}><DispenseQueue /></ProtectedRoute>} />

      {/* Others */}
      <Route path="reports" element={<ProtectedRoute requiredPermission={["reports_read", "reports_allow_all"]}><Reports /></ProtectedRoute>} />
      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="appoiments" element={<ProtectedRoute requiredPermission={["appointments_read", "appointments_allow_all"]}><Appoiments /></ProtectedRoute>} />
    </Route>

    {/* Redirect unknown routes */}
    <Route path="*" element={<Navigate to="/" replace />} />

  </Routes>
</BrowserRouter>
    );
};

export default AppRoutes;