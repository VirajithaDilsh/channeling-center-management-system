import axiosClient from "./axiosClient";

const API_URL = "/api/external-prescriptions";

// A paper prescription brought in from an outside doctor. Separate from
// PrescriptionApi, which is our own doctors' typed prescriptions and their
// pharmacy queue — external scripts never enter that queue.
export const getExternalPrescriptions = async (params = {}) => {
  const res = await axiosClient.get(API_URL, { params });
  return res.data;
};

// Dispenses the whole script in one transaction: stock decrement per line,
// MEDICATION bill lines, and the audit record. Pass visitSessionId to bill onto
// the patient's existing visit, or omit it for a standalone walk-in bill.
export const dispenseExternalPrescription = async (payload) => {
  const res = await axiosClient.post(API_URL, payload);
  return res.data;
};
