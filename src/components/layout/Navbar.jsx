import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Hospital, Menu, Search } from "lucide-react";
import SearchBar from "../SearchBar.jsx";
import NotificationBell from "../NotificationBell.jsx";

const Navbar = ({ setSidebarOpen }) => {
    const [showSearch, setShowSearch] = useState(false);

    return (
        <div className="relative bg-white shadow">

            {/* Top Bar */}
            <div className="h-16 flex items-center justify-between px-4 md:px-6">

                {/* Left Side */}
                <div className="flex items-center gap-3">
                    <div className="bg-[#1FB1F9FF] p-2 rounded-xl flex items-center justify-center">
                        <Hospital className="text-white text-sm" />
                    </div>

                    <span className="text-lg text-[#1FB1F9FF] font-semibold hidden sm:block">
                        ClinicConnect
                    </span>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 md:gap-6">

                    {/* Desktop Search */}
                    <div className="hidden md:block w-64">
                        <SearchBar
                            placeholder="Search ..."
                            onChange={(e) => console.log(e.target.value)}
                        />
                    </div>

                    {/* Mobile Search Icon */}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="md:hidden cursor-pointer"
                    >
                        <Search size={22} className="text-gray-600" />
                    </button>

                    <NotificationBell />

                    {/* User Icon */}
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-200 transition">
                        <FaUserCircle size={22} className="text-blue-600" />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden cursor-pointer"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Search Dropdown */}
            {showSearch && (
                <div className="md:hidden px-4 pb-4">
                    <SearchBar
                        placeholder="Search ..."
                        onChange={(e) => console.log(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
};

export default Navbar;