import axiosClient from "./axiosClient";

const API_URL = "/api/consultations";

// The clinical record for one appointment (diagnosis, symptoms, examination,
// notes, prescription method). Separate from the prescription sent to pharmacy
// and from the visit session that carries the money.
export const getConsultationByAppointment = async (appointmentId) => {
  const res = await axiosClient.get(`${API_URL}/by-appointment/${appointmentId}`);
  return res.data;
};

// Previous completed consultations for a patient, each with the prescriptions
// that were issued. This is doctor-authored history — distinct from the
// patient-desk registration records in ChannelingApi.
export const getConsultationsByPatient = async (patientId) => {
  const res = await axiosClient.get(`${API_URL}/patient/${patientId}`);
  return res.data;
};

// Save the working draft without completing it.
export const saveConsultationDraft = async (appointmentId, consultation) => {
  const res = await axiosClient.patch(`${API_URL}/by-appointment/${appointmentId}`, consultation);
  return res.data;
};

// Complete the consultation. The backend decides the resulting appointment
// status and visit-session transition from the prescription method — the
// client never sets a financial state itself.
export const completeConsultation = async (appointmentId, consultation) => {
  const res = await axiosClient.post(
    `${API_URL}/by-appointment/${appointmentId}/complete`,
    consultation
  );
  return res.data;
};
