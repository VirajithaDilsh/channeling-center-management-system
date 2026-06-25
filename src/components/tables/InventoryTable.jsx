import React from "react";
import { useMedicines } from "../../context/MedicineContext.jsx";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InventoryTable = () => {
  const { medicines } = useMedicines();
   const navigate = useNavigate();
  const { deleteMedicine } = useMedicines();

  if (!medicines || medicines.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
        No medicines available in inventory.
      </div>
    );
  }
 
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?",
    );

    if (!confirmDelete) return;

    try {
      await deleteMedicine(id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full text-sm text-left">
        {/* Table Head */}
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-600">Medicine</th>
            <th className="px-4 py-3 font-medium text-gray-600">
              Manufacturer
            </th>
            <th className="px-4 py-3 font-medium text-gray-600">Category</th>
            <th className="px-4 py-3 font-medium text-gray-600">Batch</th>
            <th className="px-4 py-3 font-medium text-gray-600">Expiry</th>
            <th className="px-4 py-3 font-medium text-gray-600 text-right">
              Stock
            </th>
            <th className="px-4 py-3 font-medium text-gray-600 text-right">
              Unit Price
            </th>
            <th className="px-4 py-3 font-medium text-gray-600 text-right">
              Total Value
            </th>
            <th className="px-4 py-3 font-medium text-gray-600 text-center">
              Status
            </th>
            <th className="px-4 py-3 font-medium text-gray-600 text-center">
              Actions
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y">
          {medicines.map((med) => {
            const totalValue =
              parseFloat(med.stockQuantity || 0) *
              parseFloat(med.unitPrice || 0);

            const lowStock =
              med.reorderLevel &&
              parseInt(med.stockQuantity) <= parseInt(med.reorderLevel);

            return (
              <tr key={med._id} className="hover:bg-gray-50 transition">
                {/* Medicine Name */}
                <td className="px-4 py-3 font-medium text-gray-900">
                  {med.name}
                </td>

                {/* Manufacturer */}
                <td className="px-4 py-3 text-gray-600">{med.manufacturer}</td>

                {/* Category */}
                <td className="px-4 py-3 text-gray-600">
                  {med.category || "—"}
                </td>

                {/* Batch */}
                <td className="px-4 py-3 text-gray-600">{med.batchNumber}</td>

                {/* Expiry */}
                <td className="px-4 py-3 text-gray-600">{med.expiryDate}</td>

                {/* Stock */}
                <td className="px-4 py-3 text-right font-medium">
                  {med.stockQuantity} {med.unitType}
                </td>

                {/* Unit Price */}
                <td className="px-4 py-3 text-right">
                  ${parseFloat(med.unitPrice || 0).toFixed(2)}
                </td>

                {/* Total Value */}
                <td className="px-4 py-3 text-right font-semibold text-sky-600">
                  ${totalValue.toFixed(2)}
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  {lowStock ? (
                    <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                      In Stock
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => navigate(`/dashboard/inventory/edit-medicine/${med._id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4 inline" />
                  </button>

                  <button
                    onClick={() => handleDelete(med._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
