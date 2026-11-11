import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { Users, Shield } from "lucide-react";

export default function UsersRolesTab() {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-gray-500 text-sm">
        User accounts and role permissions are managed on their own dedicated pages.
      </p>

      <div className="flex items-center justify-between border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
          <div>
            <p className="font-medium">User Accounts</p>
            <p className="text-gray-500 text-sm">Create, edit, and remove admin/staff/doctor accounts</p>
          </div>
        </div>
        <Button variant="outlined" onClick={() => navigate("/dashboard/admin")}>Open</Button>
      </div>

      <div className="flex items-center justify-between border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Shield size={20} /></div>
          <div>
            <p className="font-medium">Roles & Permissions</p>
            <p className="text-gray-500 text-sm">Define what each role can read, write, edit, or fully manage</p>
          </div>
        </div>
        <Button variant="outlined" onClick={() => navigate("/dashboard/roles")}>Open</Button>
      </div>
    </div>
  );
}
