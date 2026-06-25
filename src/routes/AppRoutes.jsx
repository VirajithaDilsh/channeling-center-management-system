import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import DashboardHome from "../pages/dashboard/DashBoardHome.jsx";

import Doctors from "../pages/dashboard/Doctors/DoctorView.jsx";
import Patients from "../pages/dashboard/Patients/Patients.jsx";
import Inventory from "../pages/dashboard/Inventory/Inventory.jsx";
import AddMedicines from "../pages/dashboard/Inventory/AddMedicine.jsx";

import Billing from "../pages/dashboard/Billing/Billing.jsx";
import CreateInvoice from "../pages/dashboard/Billing/CreateInvoice.jsx";

import Reports from "../pages/dashboard/Reports/Reports.jsx";
import Settings from "../pages/dashboard/Settings/Settings.jsx";

import Login from "../pages/Login.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";

import RegisterPatient from "../pages/dashboard/Patients/RegisterPatient.jsx";
import ViewPatient from "../pages/dashboard/Patients/ViewPatient.jsx";
import EditPatient from "../pages/dashboard/Patients/EditPatient.jsx";

import Admin from "../pages/dashboard/Admin/Admin.jsx";
import RegisterRole from "../pages/dashboard/Admin/RegisterRole.jsx";
import EditAdmin from "../pages/dashboard/Admin/EditAdmin.jsx";

import AddDoctors from "../pages/dashboard/Doctors/AddDoctor.jsx";
import DoctorManagement from "../pages/dashboard/Doctors/DoctorManagement.jsx";
import DoctorView from "../pages/dashboard/Doctors/DoctorView.jsx";
import DoctorEdit from "../pages/dashboard/Doctors/DoctorEdit.jsx";

import Payments from "../pages/dashboard/Payments/Payments.jsx";
import Appoiments from "../pages/dashboard/Appoiments/Appoiments.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Routes */}
        <Route path="/register-role" element={<RegisterRole />} />
        <Route path="/edit-admin/:id" element={<EditAdmin />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />

          {/* Admin */}
          <Route path="admin" element={<Admin />} />

          {/* Doctors */}
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctor-management" element={<DoctorManagement />} />
          <Route
            path="doctor-management/add-doctors"
            element={<AddDoctors />}
          />
          <Route path="doctor/:id" element={<DoctorView />} />
          <Route path="doctor/edit/:id" element={<DoctorEdit />} />

          {/* Patients */}
          <Route path="patients" element={<Patients />} />
          <Route path="register-patient" element={<RegisterPatient />} />
          <Route path="patients/view/:id" element={<ViewPatient />} />
          <Route path="patients/edit/:id" element={<EditPatient />} />

          {/* Inventory */}
          <Route path="inventory" element={<Inventory />} />
          <Route
            path="inventory/add-medicine"
            element={<AddMedicines />}
          />

          {/* Billing */}
          <Route path="billing" element={<Billing />} />
          <Route path="create-invoice" element={<CreateInvoice />} />

          {/* Payments */}
          <Route path="payments" element={<Payments />} />

          {/* Reports */}
          <Route path="reports" element={<Reports />} />

          {/* Settings */}
          <Route path="settings" element={<Settings />} />

          {/* Appointments */}
          <Route path="appoiments" element={<Appoiments />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;