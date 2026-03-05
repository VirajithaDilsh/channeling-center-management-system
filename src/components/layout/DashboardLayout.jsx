import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col h-screen overflow-hidden">

            {/* Navbar (Top) */}
            <Navbar setSidebarOpen={setSidebarOpen} />

            {/* Below Navbar Section */}
            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Main Content */}
                <div className="flex-1 bg-gray-100 p-4 md:p-6 overflow-auto">
                    <Outlet />
                </div>

            </div>
        </div>
    );
};

export default DashboardLayout;