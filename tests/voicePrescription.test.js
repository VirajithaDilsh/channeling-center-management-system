import test from "node:test";
import assert from "node:assert/strict";
import { parsePrescriptionSpeech, estimateQty, normalizeTranscript } from "../src/utils/prescriptionSpeechParser.js";
import { matchMedicine } from "../src/utils/medicineMatcher.js";

const catalog = [
  { _id: "1", name: "Paracetamol 500mg", genericName: "Paracetamol", unitType: "Tablet", stockQuantity: 100 },
  { _id: "2", name: "Amoxicillin 250mg", genericName: "Amoxicillin", unitType: "Capsule", stockQuantity: 50 },
  { _id: "3", name: "Amoxicillin 500mg", genericName: "Amoxicillin", unitType: "Capsule", stockQuantity: 50 },
  { _id: "4", name: "Cetirizine 10mg", genericName: "Cetirizine", unitType: "Tablet", stockQuantity: 0 },
  { _id: "5", name: "Omeprazole 20mg", genericName: "Omeprazole", unitType: "Capsule", stockQuantity: 10 },
];

test("normalizes number words and units", () => {
  assert.equal(normalizeTranscript("Twenty five milligrams for seven days"), "25 mg for 7 days");
  assert.equal(normalizeTranscript("one and a half tablets"), "1.5 tablets");
});

test("parses a two-medicine dictation with keyword split", () => {
  const rows = parsePrescriptionSpeech(
    "Paracetamol 500 milligrams twice daily for five days after meals. Next amoxicillin 250 mg three times a day for seven days",
  );
  assert.equal(rows.length, 2);
  assert.deepEqual(
    [rows[0].medicineText, rows[0].dosage, rows[0].frequency, rows[0].duration, rows[0].instructions],
    ["paracetamol", "500 mg", "Twice daily", "5 days", "After meals"],
  );
  assert.deepEqual(
    [rows[1].medicineText, rows[1].dosage, rows[1].frequency, rows[1].duration],
    ["amoxicillin", "250 mg", "3 times daily", "7 days"],
  );
});

test("splits on a new medicine after a completed duration without a keyword", () => {
  const rows = parsePrescriptionSpeech("paracetamol twice daily for 3 days cetirizine at night for 5 days");
  assert.equal(rows.length, 2);
  assert.equal(rows[1].medicineText, "cetirizine");
  assert.equal(rows[1].frequency, "At night");
});

test("handles abbreviations, 'a week' and unit doses", () => {
  const [r] = parsePrescriptionSpeech("omeprazole 1 capsule OD for a week before meals");
  assert.equal(r.frequency, "Once daily");
  assert.equal(r.duration, "1 week");
  assert.equal(r.dosage, "1 capsule");
  assert.equal(r.instructions, "Before meals");
});

test("'once a day' is a frequency, not a duration", () => {
  const [r] = parsePrescriptionSpeech("cetirizine once a day for 5 days");
  assert.equal(r.frequency, "Once daily");
  assert.equal(r.duration, "5 days");
});

test("missing details stay blank", () => {
  const [r] = parsePrescriptionSpeech("paracetamol");
  assert.equal(r.dosage, "");
  assert.equal(r.frequency, "");
  assert.equal(r.duration, "");
});

test("empty input yields no rows", () => {
  assert.deepEqual(parsePrescriptionSpeech("   "), []);
  assert.deepEqual(parsePrescriptionSpeech(""), []);
});

test("estimateQty only when unambiguous", () => {
  const [a] = parsePrescriptionSpeech("paracetamol 2 tablets 3 times daily for 5 days");
  assert.deepEqual(estimateQty(a, catalog[0]), { qty: 30, basis: "calculated" });

  const [b] = parsePrescriptionSpeech("paracetamol 500 mg twice daily for 5 days");
  assert.deepEqual(estimateQty(b, catalog[0]), { qty: 10, basis: "assumed" });

  const [c] = parsePrescriptionSpeech("paracetamol twice daily");
  assert.deepEqual(estimateQty(c, catalog[0]), { qty: null, basis: null });

  const [d] = parsePrescriptionSpeech("paracetamol 1 tablet as needed for 5 days");
  assert.deepEqual(estimateQty(d, catalog[0]), { qty: null, basis: null });
});

test("matches exact, misspelled and generic names", () => {
  assert.equal(matchMedicine("paracetamol", null, catalog).medicine._id, "1");
  assert.equal(matchMedicine("para setamol", null, catalog).medicine._id, "1");
  assert.equal(matchMedicine("omeprazol", null, catalog).medicine._id, "5");
  assert.equal(matchMedicine("cetirizin", null, catalog).status, "matched");
});

test("strength disambiguates variants; no strength is ambiguous", () => {
  assert.equal(matchMedicine("amoxicillin", { value: 250, unit: "mg" }, catalog).medicine._id, "2");
  assert.equal(matchMedicine("amoxicillin", { value: 500, unit: "mg" }, catalog).medicine._id, "3");
  const none = matchMedicine("amoxicillin", null, catalog);
  assert.equal(none.status, "ambiguous");
  assert.equal(none.medicine, null);
  assert.ok(none.alternatives.length >= 2);
});

test("unknown medicine is unmatched, never guessed", () => {
  const r = matchMedicine("zorblatinex", null, catalog);
  assert.equal(r.status, "unmatched");
  assert.equal(r.medicine, null);
  assert.equal(matchMedicine("", null, catalog).status, "unmatched");
  assert.equal(matchMedicine("paracetamol", null, []).status, "unmatched");
});
