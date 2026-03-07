import { NavLink } from "react-router-dom";
import { House, Users, DollarSign, Package, Stethoscope, FileText, Settings, X ,LogOut} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

    const links = [
        { name: "Dashboard", to: "/dashboard", icon: <House size={20} /> },
        { name: "Doctors", to: "/dashboard/doctor-management", icon: <Stethoscope size={20} /> }, 
        { name: "Patients", to: "/dashboard/patients", icon: <Users size={20} /> },
        { name: "Inventory", to: "/dashboard/inventory", icon: <Package size={20} /> },
        { name: "Payments", to: "/dashboard/payments", icon: <DollarSign size={20} /> },
        { name: "Reports", to: "/dashboard/reports", icon: <FileText size={20} /> },
        { name: "Settings", to: "/dashboard/settings", icon: <Settings size={20} /> },
    ];

    return (
        <>
            {/* Overlay with blur effect (Mobile Only) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 md:hidden bg-black bg-opacity-30 backdrop-blur-sm"
         
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div
                className={`fixed md:static top-0 right-0 h-full w-64 bg-[#F9FAFB] sm:bg-[#F9FAFB66] shadow text-black p-5 z-50 transform transition-transform duration-300 
                ${sidebarOpen ? "translate-x-0" : "translate-x-full"} 
                md:translate-x-0`}
            >
                {/* Close Button (Mobile Only) */}
                <div className="flex justify-end md:hidden mb-4">
                    <X size={22} onClick={() => setSidebarOpen(false)} className="cursor-pointer" />
                </div>
                <div className="flex flex-col h-full justify-between">
                    <nav className="flex flex-col gap-3">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.to === "/dashboard"}
                                onClick={() => setSidebarOpen(false)} // close on click (mobile)
                                className={({ isActive }) =>
                                    `flex items-center gap-3 p-2 rounded hover:bg-blue-100 transition ${
                                        isActive ? "bg-blue-200 font-semibold text-blue-700" : ""
                                    }`
                                }
                            >
                                {link.icon}
                                <span>{link.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                    <div className="pt-2 ">
                        <button
                            className="flex items-center gap-3 p-2 w-full rounded hover:bg-red-100 text-red-600 transition"
                            onClick={() => console.log("Logout clicked")}
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>

            </div>

        </>
    );
};

export default Sidebar;