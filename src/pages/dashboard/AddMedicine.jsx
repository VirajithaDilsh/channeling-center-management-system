import React from 'react';
import { useNavigate } from 'react-router-dom'
import {ArrowLeft,Pill,FileText,Layers,Building2 } from 'lucide-react';

const AddMedicine = () => {
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault(); // stop page refresh
        console.log("Form submitted");
    };
    return (
        <div>
            <button
                onClick={() => navigate('/dashboard/inventory')}
                className="inline-flex items-center text-sm text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 mb-2 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Inventory
            </button>
            <h2 className="text-xl sm:text-2xl font-semibold text-start">
                Add New Medicine
            </h2>

            <p className="text-sm sm:text-base text-start mt-1 text-gray-600">
                Register a new medicine to the pharmacy inventory
            </p>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form - Left 2 columns */}
                    <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-md m-6">
                        {/* Medicine Details */}
                        <h3 className="font-semibold text-slate-800  mb-5 flex items-center">
                            <Pill className="w-5 h-5 mr-2 text-sky-600" />
                            Medicine Details
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Medicine Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Pill className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                        <input
                                            required
                                            type="text"
                                            /* value={form.name}*/

                                           /* onChange={(e) => updateField('name', e.target.value)}*/
                                            className="w-full pl-9 pr-4 py-2.5 bg-white/50  border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                            placeholder="e.g. Amoxicillin 500mg"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Generic Name
                                    </label>
                                    <div className="relative">
                                        <FileText className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                        <input
                                            type="text"
                                            /*value={form.genericName}*/
                                           /* onChange={(e) =>
                                                updateField('genericName', e.target.value)
                                            }*/
                                            className="w-full pl-9 pr-4 py-2.5 bg-white/50  border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                            placeholder="e.g. Amoxicillin"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Manufacturer <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                        <input
                                            required
                                            type="text"
                                            /*value={form.manufacturer}*/

                                            /*onChange={(e) =>
                                                updateField('manufacturer', e.target.value)
                                            } */
                                            className="w-full pl-9 pr-4 py-2.5 bg-white/50 border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                            placeholder="e.g. PharmaCorp Inc."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Layers className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                        <select
                                            required
                                            /*value={form.category}
                                            onChange={(e) =>
                                                updateField('category', e.target.value)
                                            }*/
                                            className="w-full pl-9 pr-4 py-2.5 bg-white/50  border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none transition-shadow"
                                        >
                                            <option value="">Select category</option>

                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    /*value={form.description}
                                    onChange={(e) => updateField('description', e.target.value)}*/
                                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none transition-shadow"
                                    placeholder="Brief description of the medicine, usage instructions, or notes..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddMedicine;