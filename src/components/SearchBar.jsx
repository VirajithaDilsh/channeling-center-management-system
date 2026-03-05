import { Search } from "lucide-react";

function SearchBar({ placeholder = "Search...", onChange }) {
    return (
        <div className="relative w-full max-w-md">
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
            />
            <input
                type="text"
                placeholder={placeholder}
                onChange={onChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

export default SearchBar;