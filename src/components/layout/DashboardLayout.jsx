import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex flex-col  h-screen overflow-hidden">

            {/* Navbar */}
            <Navbar setSidebarOpen={setSidebarOpen} />


            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Content + Footer */}
                <div className="flex flex-col flex-1 overflow-hidden">

                    {/* Main Content */}
                    <main className="flex-1 bg-[#F0F9FF] p-4 md:p-6 overflow-auto">
                        <Outlet />
                    </main>

                </div>

            </div>
            <Footer />
        </div>
    );
};

export default DashboardLayout;