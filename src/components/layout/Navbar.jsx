import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Hospital, Menu } from "lucide-react";
import {
    Menu as MuiMenu,
    MenuItem,
    Divider,
    ListItemIcon,
    IconButton,
    Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { getPublicSettings } from "../../api/SettingsApi";
import { getMyAccount } from "../../api/AdminApi";
import { clearSession } from "../../utils/session";

const Navbar = ({ setSidebarOpen }) => {
    const navigate = useNavigate();
    const [centerName, setCenterName] = useState("ClinicConnect");
    const [account, setAccount] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        getPublicSettings()
            .then((data) => data.centerName && setCenterName(data.centerName))
            .catch((err) => console.error("Failed to load center name:", err));

        // Who is signed in was never shown anywhere in the app, which matters
        // here because what you can see depends entirely on your role.
        getMyAccount()
            .then(setAccount)
            .catch((err) => console.error("Failed to load own account:", err));
    }, []);

    // Falls back to the role cached at login if the account request failed.
    const displayName = account?.name || "Signed in";
    const displayRole = account?.role || localStorage.getItem("userRole") || "";

    const handleLogout = () => {
        setAnchorEl(null);
        clearSession();
        navigate("/");
    };

    const go = (path) => {
        setAnchorEl(null);
        navigate(path);
    };

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
                        {centerName}
                    </span>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4 md:gap-6">

                    {/* Signed-in user */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block text-right leading-tight">
                            <p className="text-sm font-medium text-gray-800">{displayName}</p>
                            {displayRole && (
                                <p className="text-xs text-gray-500">{displayRole}</p>
                            )}
                        </div>

                        <Tooltip title="Account">
                            <IconButton
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                aria-label="Account menu"
                                sx={{
                                    width: 40,
                                    height: 40,
                                    backgroundColor: "#dbeafe",
                                    "&:hover": { backgroundColor: "#bfdbfe" },
                                }}
                            >
                                <FaUserCircle size={22} className="text-blue-600" />
                            </IconButton>
                        </Tooltip>
                    </div>

                    <MuiMenu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >
                        <div className="px-4 py-2">
                            <p className="text-sm font-medium text-gray-800">{displayName}</p>
                            {account?.email && (
                                <p className="text-xs text-gray-500">{account.email}</p>
                            )}
                            {displayRole && (
                                <p className="text-xs text-gray-500">{displayRole}</p>
                            )}
                        </div>

                        <Divider />

                        <MenuItem onClick={() => go("/dashboard/settings")}>
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            My Profile &amp; Settings
                        </MenuItem>

                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </MuiMenu>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden cursor-pointer"
                        aria-label="Open navigation"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
