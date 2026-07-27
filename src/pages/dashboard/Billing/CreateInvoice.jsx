import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Stethoscope, Receipt, DollarSign } from 'lucide-react';
import BackButton from '../../../components/BackButton';
import { getVisitSession, addPayment } from '../../../api/VisitSessionApi';

const lineItemLabel = {
  DOCTOR_FEE: 'Consultation Fee',
  CENTER_FEE: 'Channeling Center Fee',
  MEDICATION: 'Medication',
  ADJUSTMENT: 'Adjustment',
};

export default function CreateInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [error, setError] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const data = await getVisitSession(id);
      setSession(data);
    } catch (err) {
      console.error(err);
      setError('Could not load this visit session.');
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (error) {
    return (
      <div className="p-8">
        <BackButton to="/dashboard/billing" />
        <p className="text-red-600 mt-4">{error}</p>
      </div>
    );
  }

  if (!session) {
    return <div className="p-8">Loading invoice...</div>;
  }

  const total = session.lineItems.reduce((sum, li) => sum + li.amount, 0);
  const paid = session.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, Math.round((total - paid) * 100) / 100);
  const canPay = session.status === 'READY_FOR_PAYMENT' && balance > 0;

  const handlePay = async () => {
    const amount = parseFloat(paymentAmount);
    if (!(amount > 0)) return;
    setSubmitting(true);
    try {
      const updated = await addPayment(id, { amount, method: paymentMethod });
      setSession(updated);
      setPaymentAmount('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-[#f8fafc] min-h-screen">
      <div className="mb-6 flex items-center gap-3">
        <BackButton to="/dashboard/billing" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Visit Invoice</h1>
          <p className="text-slate-500 text-sm mt-1">
            Status: <span className="font-medium">{session.status.replaceAll('_', ' ')}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-blue-50 text-[#008bc9] rounded-lg"><User size={20} /></div>
              <h2 className="text-lg font-semibold text-slate-800">Patient & Doctor</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500">Patient:</span> <span className="font-medium">{session.patientName}</span></div>
              <div className="flex items-center gap-1"><Stethoscope size={14} className="text-slate-400" /><span className="font-medium">{session.doctorName}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Receipt size={20} /></div>
              <h2 className="text-lg font-semibold text-slate-800">Bill Line Items</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 text-xs uppercase">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {session.lineItems.map((li) => (
                  <tr key={li._id} className="border-t border-slate-100">
                    <td className="py-2">{li.description || lineItemLabel[li.type]}</td>
                    <td className="py-2 text-right">{li.qty}</td>
                    <td className="py-2 text-right">Rs. {li.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">Rs. {li.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {session.payments.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Payment History</h2>
              <table className="w-full text-sm">
                <tbody>
                  {session.payments.map((p) => (
                    <tr key={p._id} className="border-t border-slate-100">
                      <td className="py-2">{new Date(p.receivedAt).toLocaleString()}</td>
                      <td className="py-2 capitalize">{p.method}</td>
                      <td className="py-2 text-right font-medium">Rs. {p.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-50 text-[#008bc9] rounded-lg"><DollarSign size={20} /></div>
              <h2 className="text-lg font-semibold text-slate-800">Payment Summary</h2>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Total:</span><span className="font-medium">Rs. {total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid:</span><span className="font-medium">Rs. {paid.toFixed(2)}</span></div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg mb-6 border border-slate-100">
              <span className="font-semibold text-slate-700">Balance Due</span>
              <span className="text-xl font-bold text-[#008bc9]">Rs. {balance.toFixed(2)}</span>
            </div>

            {canPay ? (
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder={`Up to Rs. ${balance.toFixed(2)}`}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                />
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                </select>
                <button
                  onClick={handlePay}
                  disabled={submitting || !paymentAmount}
                  className="w-full px-4 py-2 bg-[#008bc9] text-white rounded-lg text-sm font-medium hover:bg-[#0073a8] disabled:bg-slate-300 transition-colors"
                >
                  {submitting ? 'Processing...' : 'Record Payment'}
                </button>
                <p className="text-xs text-slate-400">Partial payments are supported — record as many as needed until the balance reaches zero.</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center">
                {session.status === 'CLOSED' ? 'Fully paid.' : `No payment can be collected while status is ${session.status.replaceAll('_', ' ')}.`}
              </p>
            )}

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
