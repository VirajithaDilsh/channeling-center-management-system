import React, { useState } from 'react';
import { 
  User, Phone, Stethoscope, Activity, DollarSign, 
  Search, Plus, Pill, Receipt, ArrowLeft
} from 'lucide-react';

// Mock database for medicine search (Replace with your actual API/data)
const MEDICINE_DB = [
  { id: 1, name: 'Amoxicillin 500mg', price: 12.50 },
  { id: 2, name: 'Paracetamol 650mg', price: 5.00 },
  { id: 3, name: 'Lisinopril 10mg', price: 18.75 },
  { id: 4, name: 'Metformin 500mg', price: 8.20 },
];

export default function CreateInvoice() {
  // --- STATE MANAGEMENT ---
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    phone: '',
    doctor: '',
    disease: '',
    doctorFee: ''
  });

  const [currentMed, setCurrentMed] = useState({ name: '', price: 0, quantity: 1 });
  const [billItems, setBillItems] = useState([]);
  const [discount, setDiscount] = useState(0);

  // --- HANDLERS ---
  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicineSelect = (e) => {
    const selected = MEDICINE_DB.find(m => m.name === e.target.value);
    if (selected) {
      setCurrentMed({ name: selected.name, price: selected.price, quantity: 1 });
    } else {
      setCurrentMed({ name: '', price: 0, quantity: 1 });
    }
  };

  const addMedicineToBill = () => {
    if (currentMed.name && currentMed.quantity > 0) {
      setBillItems([...billItems, { ...currentMed, total: currentMed.price * currentMed.quantity }]);
      // Reset current medicine input
      setCurrentMed({ name: '', price: 0, quantity: 1 });
    }
  };

  const removeMedicine = (index) => {
    const newItems = billItems.filter((_, i) => i !== index);
    setBillItems(newItems);
  };

  // --- CALCULATIONS ---
  const doctorFeeNum = parseFloat(patientDetails.doctorFee) || 0;
  const medicineTotal = billItems.reduce((sum, item) => sum + item.total, 0);
  const subTotal = doctorFeeNum + medicineTotal;
  const grandTotal = subTotal - (parseFloat(discount) || 0);

  return (
    <div className="flex-1 p-8 bg-[#f8fafc] min-h-screen">
      
      {/* Page Header */}
      <div className="mb-6">
        <button className="flex items-center text-slate-500 hover:text-slate-700 text-sm font-medium mb-2">
          <ArrowLeft size={16} className="mr-1" /> Back to Billing
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Create New Bill</h1>
        <p className="text-slate-500 text-sm mt-1">Generate a bill for patient consultation and pharmacy items</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Input Forms */}
        <div className="flex-1 space-y-6">
          
          {/* Card 1: Patient & Doctor Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-blue-50 text-[#008bc9] rounded-lg">
                <User size={20} />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Patient Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">PATIENT NAME *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" name="name" value={patientDetails.name} onChange={handlePatientChange} placeholder="e.g. John Doe" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">PHONE NUMBER</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" name="phone" value={patientDetails.phone} onChange={handlePatientChange} placeholder="e.g. +1 234 567 890" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">ASSIGNED DOCTOR *</label>
                <div className="relative">
                  <Stethoscope size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" name="doctor" value={patientDetails.doctor} onChange={handlePatientChange} placeholder="e.g. Dr. Sarah Smith" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">DISEASE / DIAGNOSIS</label>
                <div className="relative">
                  <Activity size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="text" name="disease" value={patientDetails.disease} onChange={handlePatientChange} placeholder="e.g. Viral Fever" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">DOCTOR FEE ($)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="number" name="doctorFee" value={patientDetails.doctorFee} onChange={handlePatientChange} placeholder="e.g. 50.00" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Add Bill Items (Medicines) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Pill size={20} />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Add Medicines</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">SEARCH MEDICINE</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <select 
                    value={currentMed.name} 
                    onChange={handleMedicineSelect}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm appearance-none bg-white"
                  >
                    <option value="">Select a medicine...</option>
                    {MEDICINE_DB.map(med => (
                      <option key={med.id} value={med.name}>{med.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">UNIT PRICE</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input type="number" readOnly value={currentMed.price} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">QUANTITY</label>
                <input 
                  type="number" 
                  min="1" 
                  value={currentMed.quantity} 
                  onChange={(e) => setCurrentMed({...currentMed, quantity: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm" 
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                onClick={addMedicineToBill}
                disabled={!currentMed.name}
                className="flex items-center gap-2 bg-[#008bc9] hover:bg-[#0073a8] disabled:bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Add to Bill
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bill Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-50 text-[#008bc9] rounded-lg">
                <Receipt size={20} />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Bill Summary</h2>
            </div>

            {/* Patient & Doctor Snapshot */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Patient:</span>
                <span className="font-medium text-slate-800">{patientDetails.name || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-800">{patientDetails.phone || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Doctor:</span>
                <span className="font-medium text-slate-800">{patientDetails.doctor || '—'}</span>
              </div>
            </div>

            <hr className="border-slate-100 mb-4" />

            {/* Itemized List */}
            <div className="min-h-[150px] mb-6">
              <div className="text-xs font-semibold text-slate-400 uppercase mb-3 flex justify-between">
                <span>Items</span>
                <span>Amount</span>
              </div>
              
              {/* Doctor Fee Line Item */}
              {doctorFeeNum > 0 && (
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-700">Consultation Fee</span>
                  <span className="font-medium text-slate-800">${doctorFeeNum.toFixed(2)}</span>
                </div>
              )}

              {/* Medicine Line Items */}
              {billItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm mb-3 group">
                  <div className="flex flex-col">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-xs text-slate-400">{item.quantity} x ${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">${item.total.toFixed(2)}</span>
                    <button onClick={() => removeMedicine(index)} className="text-red-400 opacity-0 group-hover:opacity-100 text-xs">✕</button>
                  </div>
                </div>
              ))}

              {doctorFeeNum === 0 && billItems.length === 0 && (
                <div className="text-center text-slate-400 text-sm mt-8">
                  No items added yet.
                </div>
              )}
            </div>

            <hr className="border-slate-100 mb-4" />

            {/* Totals */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-medium text-slate-800">${subTotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-sm items-center">
                <span className="text-slate-500">Discount ($):</span>
                <input 
                  type="number" 
                  value={discount} 
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-20 px-2 py-1 text-right border border-slate-200 rounded focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg mb-6 border border-slate-100">
              <span className="font-semibold text-slate-700">Grand Total</span>
              <span className="text-xl font-bold text-[#008bc9]">${grandTotal.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-[#008bc9] text-white rounded-lg text-sm font-medium hover:bg-[#0073a8] transition-colors">
                Generate Bill
              </button>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  );
}