import { Bell } from "lucide-react";

function NotificationBell() {
    return (
        <div className="relative w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-full transition">
            <Bell className="text-gray-600" size={24} />

            {/* Optional: notification badge */}
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
        </div>
    );
}

export default NotificationBell;