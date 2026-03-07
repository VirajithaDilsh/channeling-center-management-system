import React,{useState} from 'react';
import { useNavigate } from 'react-router-dom'
import {ArrowLeft,Pill,FileText,Layers,Building2,Hash,Package,DollarSign,AlertCircle ,Thermometer,Calendar,Loader2} from 'lucide-react';

const AddMedicine = () => {
    const navigate = useNavigate();

    const [category, setCategory] = useState({});
    const [unitType, setUnitType] = useState({});
    const [storageCondition, setStorageCondition] = useState({});
    const [form, setForm] = useState({
        prescriptionRequired: false
    });
    const categories=[
        "Antibiotics",
        "Painkillers",
        "Antacids",
        "Antihypertensives",
        "Antidiabetics",
        "Bronchodilators",
        "Antihistamines",
        "Vitamins",
        "Dermatology",
        "Cardiovascular",
        "Respiratory",
        "Other"
    ];
    const unitTypes=[
        "Tablets",
        "Capsules",
        "Bottles",
        "Inhalers",
        "Tubes",
        "Vials",
        "Syringes",
        "Sachets",
    ];
    const storageConditions=[
        "Room Temperature (15-25°C)",
        "Refrigerated (2-8°C)",
        "Cool & Dry Place",
        "Protect from Light",
        "Frozen (-20°C)",
    ];

    const handleChange = (e) => {
        setCategory(e.target.value);
        setUnitType(e.target.value);
        setStorageCondition(e.target.value);
        console.log(e.target.value);
    };
    const updateField = (field, value) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    }; {/*Tempory*/}
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
                    <div className="lg:col-span-2 space-y-6">
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
                                                value={category}
                                                onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/50  border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none transition-shadow"
                                            >
                                                <option value="">Select category</option>
                                                {categories.map((cat, index) => (
                                                    <option key={index} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}

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
                        {/* Stock and price */}
                        <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-md m-6">
                            <h3 className="font-semibold text-slate-800  mb-5 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                                Stock &amp; Pricing
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Initial Stock Quantity{' '}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                /*value={form.stock}*/
                                                /*onChange={(e) => updateField('stock', e.target.value)}*/
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/50  border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                                placeholder="e.g. 500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Unit Type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Package className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <select
                                                required
                                                value={unitType}
                                                onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/50  border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none transition-shadow"
                                            >
                                                {unitTypes.map((cat, index) => (
                                                    <option key={index} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Unit Price ($) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                /* value={form.price}*/
                                                /* onChange={(e) => updateField('price', e.target.value)}*/
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/50  border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                                placeholder="e.g. 12.50"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Reorder Level
                                        </label>
                                        <div className="relative">
                                            <AlertCircle className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                /*value={form.reorderLevel}
                                                onChange={(e) =>
                                                    updateField('reorderLevel', e.target.value)
                                                }*/
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/50 border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                                placeholder="e.g. 50 (alert when below)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-md m-6">
                            {/* Additional Info */}
                            <h3 className="font-semibold text-slate-800  mb-5 flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                                Additional Information
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Batch Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <input
                                                required
                                                type="text"
                                                /* value={form.batchNumber}
                                                 onChange={(e) =>
                                                     updateField('batchNumber', e.target.value)
                                                 }*/
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/50 border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                                placeholder="e.g. BATCH-2026-0315"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Expiry Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <input
                                                required
                                                type="date"
                                                /* value={form.expiryDate}
                                                 onChange={(e) =>
                                                     updateField('expiryDate', e.target.value)
                                                 } */
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/50 border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Storage Condition
                                        </label>
                                        <div className="relative">
                                            <Thermometer className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                            <select
                                                value={storageCondition}
                                                 onChange={handleChange}
                                                className="w-full pl-9 pr-4 py-2.5 bg-white/50  border border-slate-200  rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none transition-shadow"
                                            >
                                                {storageConditions.map((cat, index) => (
                                                    <option key={index} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1.5">
                                            Prescription Required
                                        </label>

                                        <div
                                            className="flex items-center h-[42px] cursor-pointer"
                                            onClick={() =>
                                                updateField(
                                                    "prescriptionRequired",
                                                    !form.prescriptionRequired
                                                )
                                            }
                                        >
                                            {/* Toggle Background */}
                                            <div
                                                className={`relative w-11 h-6 rounded-full transition-colors duration-200
                                                 ${form.prescriptionRequired ? "bg-sky-600" : "bg-slate-300"}`}
                                            >
                                                {/* Toggle Circle */}
                                                <div
                                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                                                     ${form.prescriptionRequired ? "translate-x-5" : "translate-x-0"}`}
                                                />
                                            </div>

                                            <span className="ml-3 text-sm text-slate-700">
                                                {form.prescriptionRequired ? "Yes" : "No"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-white shadow rounded-xl space-y-6 p-6 mt-6 self-start">

                        <h3 className="font-semibold text-slate-800  mb-5">
                            Summary
                        </h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-sky-100 d mb-4">
                                <Pill className="w-8 h-8 text-sky-600 " />
                            </div>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100 ">
                                    <span className="text-slate-500">Name</span>
                                    <span className="font-medium text-slate-900  text-right max-w-[140px] truncate">
                      { '—'}{/*form.name ||*/}
                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 ">
                                    <span className="text-slate-500">Manufacturer</span>
                                    <span className="font-medium text-slate-900  text-right max-w-[140px] truncate">
                      { '—'}{/*form.manufacturer ||*/}
                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 ">
                                    <span className="text-slate-500">Category</span>
                                    <span className="font-medium text-slate-900 ">
                      {'—'}{/*form.category || */}
                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 ">
                                    <span className="text-slate-500">Stock</span>
                                    <span className="font-medium text-slate-900 ">
                      { '—'}{/*form.stock ? `${form.stock} ${form.unit}` :*/}
                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 ">
                                    <span className="text-slate-500">Unit Price</span>
                                    <span className="font-medium text-slate-900 ">
                      {'—'}{/*form.price
                          ? `$${parseFloat(form.price).toFixed(2)}`
                          : */}
                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 ">
                                    <span className="text-slate-500">Batch</span>
                                    <span className="font-medium text-slate-900  text-right max-w-[140px] truncate">
                      { '—'}{/*form.batchNumber ||*/}
                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100 ">
                                    <span className="text-slate-500">Expiry</span>
                                    <span className="font-medium text-slate-900 ">
                      { '—'}{/*form.expiryDate ||*/}
                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Prescription</span>
                                    <span
                                        className={`font-medium  'text-amber-600 ' : 'text-slate-900 '}`}/*${form.prescriptionRequired ?*/
                                    >
                      {/*form.prescriptionRequired ? 'Required' : 'Not Required'*/}
                    </span>
                                </div>
                            </div>

                            {/* {form.stock && form.price && (
                                <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                                    <div className="flex justify-between text-sm">*/}
                      <span className="text-sky-700 ">
                        Total Value
                      </span>
                            {/*<span className="font-bold text-sky-900 dark:text-sky-100">
                            $
                                            {(
                                                parseFloat(form.stock) * parseFloat(form.price)
                                            ).toFixed(2)}
                            </span>
                                    </div>
                                </div>
                            )}*/}
                        </div>

                        <button
                            type="submit"
                            /*disabled={isSubmitting}*/
                            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {/* {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Adding Medicine...
                                </>
                            ) : (
                                <>
                                    <Pill className="w-4 h-4 mr-2" />
                                    Add Medicine
                                </>
                            )}*/}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/inventory')}
                            className="w-full mt-3 py-2.5 border border-slate-200 text-slate-700  font-medium rounded-xl hover:bg-slate-50  transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddMedicine;