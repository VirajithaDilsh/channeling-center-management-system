import React from "react";
import SearchBar from "../../../components/SearchBar.jsx";
import AddButton from "../../../components/AddButton.jsx";
import { useNavigate } from "react-router-dom";

const DoctorsManagement = () => {

    const navigate = useNavigate();

    return (
        <div className="space-y-6">

            {/* Title Section */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-start">
                    Doctors Management
                </h1>

                <p className="text-sm sm:text-lg text-gray-600 mt-1">
                    Manage and view all doctor profiles in your clinic.
                </p>
            </div>


            {/* Search + Add Button */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

                {/* Search */}
                <div className="w-full md:w-1/2">
                    <SearchBar
                        placeholder="Search doctors..."
                        onChange={(e) => console.log(e.target.value)}
                    />
                </div>

                {/* Add Doctor Button */}
                <div className="flex justify-end">
                    <AddButton
                        label="Add Doctor"
                        bgColor="#1FB1F9"
                        onClick={() => navigate("/dashboard/doctor-management/add-doctors")}
                    />
                </div>


            </div>


            {/* Doctors Table */}
            <div className="bg-white rounded-xl shadow border">

                <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg">Doctor Records</h2>
                    <p className="text-sm text-gray-500">
                        Manage and view all doctor profiles in your clinic.
                    </p>
                </div>


                <div className="overflow-x-auto">

                    <table className="w-full text-sm text-left">

                        <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="px-4 py-3">Doctor Name</th>
                                <th className="px-4 py-3">Specialization</th>
                                <th className="px-4 py-3">Fee</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>


                        <tbody>

                            <tr className="border-b">
                                <td className="px-4 py-3">Dr. Anya Sharma</td>
                                <td className="px-4 py-3">Pediatrics</td>
                                <td className="px-4 py-3">$150</td>
                                <td className="px-4 py-3 text-green-600">Active</td>

                                <td className="px-4 py-3 text-center">
                                    View | Edit | Delete
                                </td>
                            </tr>


                            <tr className="border-b">
                                <td className="px-4 py-3">Dr. Ben Carter</td>
                                <td className="px-4 py-3">Cardiology</td>
                                <td className="px-4 py-3">$200</td>
                                <td className="px-4 py-3 text-yellow-600">On Leave</td>

                                <td className="px-4 py-3 text-center">
                                    View | Edit | Delete
                                </td>
                            </tr>


                            <tr>
                                <td className="px-4 py-3">Dr. Clara Davis</td>
                                <td className="px-4 py-3">Dermatology</td>
                                <td className="px-4 py-3">$120</td>
                                <td className="px-4 py-3 text-green-600">Active</td>

                                <td className="px-4 py-3 text-center">
                                    View | Edit | Delete
                                </td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default DoctorsManagement;