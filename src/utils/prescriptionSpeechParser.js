// Turns a dictated (or typed) English transcript into prescription rows.
//
// Expected dictation order per medicine:
//   "<medicine> <strength/dose> <frequency> <duration> <instructions>"
// e.g. "Paracetamol 500 milligrams twice daily for five days after meals.
//       Next amoxicillin 250 mg three times a day for seven days."
//
// Pure functions only (no React, no DOM) so they can be unit-tested with
// `node --test`. Anything the parser can't read confidently is left blank —
// it never guesses a dosage, frequency or duration.

const ONES = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };

const NUM_WORD = `(?:${[...Object.keys(ONES), ...Object.keys(TENS)].join("|")})`;

const FILLER_WORDS = new Set([
  "take", "give", "prescribe", "prescription", "add", "please", "and", "the", "a", "an", "of", "to",
  "for", "per", "each", "every", "medicine", "medication", "drug", "tablet", "tablets", "tab", "tabs",
  "capsule", "capsules", "cap", "caps", "with", "then", "also", "is", "are", "it", "this", "that",
  "patient", "should", "will", "need", "needs", "one", "dose", "doses", "orally", "oral", "i", "want",
]);

// Words that start a new medicine entry.
const BOUNDARY_RE = /^(?:and\s+then|and\s+next|next\s+medicine|next|then|also|another(?:\s+one)?|second(?:\s+medicine)?|third(?:\s+medicine)?|fourth(?:\s+medicine)?|after\s+that)\b/;

const UNIT_FORM = "tablets?|tabs?|capsules?|caps?|pills?|puffs?|drops?|teaspoons?|tsp|tablespoons?|tbsp|sachets?|ampoules?|vials?|ml";
const COUNTABLE_UNIT_RE = /^(?:tablet|tab|capsule|cap|pill|sachet|ampoule|vial)/;

const num = "(\\d+(?:\\.\\d+)?)";

// Ordered: first match at a given position wins.
const PATTERNS = [
  {
    type: "boundary",
    re: BOUNDARY_RE,
    read: () => ({}),
  },
  {
    type: "duration",
    re: new RegExp(`^(?:for\\s+)?(?:the\\s+next\\s+)?(?:${num}|a)\\s*(day|week|month)s?\\b`),
    // "a day/week" is only a duration when it follows "for" (otherwise "once a day").
    guard: (m) => m[1] !== undefined || /^for\s/.test(m[0]),
    read: (m) => {
      const n = m[1] !== undefined ? Number(m[1]) : 1;
      const unit = m[2];
      const days = n * (unit === "day" ? 1 : unit === "week" ? 7 : 30);
      return { duration: `${n} ${unit}${n === 1 ? "" : "s"}`, days };
    },
  },
  {
    type: "frequency",
    re: new RegExp(`^every\\s+${num}\\s*hours?\\b`),
    read: (m) => ({ frequency: `Every ${m[1]} hours`, perDay: Number(m[1]) > 0 ? 24 / Number(m[1]) : null }),
  },
  {
    type: "frequency",
    re: new RegExp(`^${num}\\s*(?:times|x)\\s*(?:a|per|each|every)?\\s*(?:day|daily)?\\b`),
    read: (m) => ({ frequency: `${m[1]} times daily`, perDay: Number(m[1]) }),
  },
  {
    type: "frequency",
    re: /^(?:four\s+times|qid|qds|q\.i\.d)(?:\s*(?:a|per|every)\s*day|\s*daily)?\b/,
    read: () => ({ frequency: "4 times daily", perDay: 4 }),
  },
  {
    type: "frequency",
    re: /^(?:thrice|tds|tid|t\.d\.s|t\.i\.d)(?:\s*(?:a|per|every)\s*day|\s*daily)?\b/,
    read: () => ({ frequency: "3 times daily", perDay: 3 }),
  },
  {
    type: "frequency",
    re: /^(?:twice|bd|bid|b\.d|b\.i\.d)(?:\s*(?:a|per|every)\s*day|\s*daily)?\b/,
    read: () => ({ frequency: "Twice daily", perDay: 2 }),
  },
  {
    type: "frequency",
    re: /^(?:in\s+the\s+)?morning\s+and\s+(?:at\s+)?(?:night|evening)\b/,
    read: () => ({ frequency: "Morning and night", perDay: 2 }),
  },
  {
    type: "frequency",
    re: /^(?:once(?:\s*(?:a|per|every)\s*day|\s*daily)?|od|o\.d|daily|every\s*day|each\s*day|everyday)\b/,
    read: () => ({ frequency: "Once daily", perDay: 1 }),
  },
  {
    type: "frequency",
    re: /^(?:at\s+night|nocte|at\s+bed\s*time|before\s+bed(?:time)?)\b/,
    read: () => ({ frequency: "At night", perDay: 1 }),
  },
  {
    type: "frequency",
    re: /^in\s+the\s+morning\b/,
    read: () => ({ frequency: "In the morning", perDay: 1 }),
  },
  {
    type: "frequency",
    re: /^(?:sos|prn|as\s+needed|when\s+needed|if\s+needed)\b/,
    read: () => ({ frequency: "As needed", perDay: null }),
  },
  {
    type: "instruction",
    re: /^(?:after|following)\s+(?:meals?|food|eating|breakfast|lunch|dinner)\b/,
    read: () => ({ instruction: "After meals" }),
  },
  {
    type: "instruction",
    re: /^before\s+(?:meals?|food|eating|breakfast|lunch|dinner)\b/,
    read: () => ({ instruction: "Before meals" }),
  },
  {
    type: "instruction",
    re: /^with\s+(?:food|meals?)\b/,
    read: () => ({ instruction: "With food" }),
  },
  {
    type: "instruction",
    re: /^with\s+(?:a\s+glass\s+of\s+)?(water|milk)\b/,
    read: (m) => ({ instruction: `With ${m[1]}` }),
  },
  {
    type: "instruction",
    re: /^on\s+an?\s+empty\s+stomach\b/,
    read: () => ({ instruction: "On an empty stomach" }),
  },
  {
    // Strength: "500 mg", "250 mcg", "1 g", "10000 iu"
    type: "strength",
    re: new RegExp(`^${num}\\s*(mg|mcg|g|iu|units?)\\b`),
    read: (m) => ({ strength: { value: Number(m[1]), unit: m[2].replace(/^units?$/, "units") } }),
  },
  {
    // Unit dose: "1 tablet", "2 capsules", "5 ml", "0.5 tablet"
    type: "dose",
    re: new RegExp(`^${num}\\s*(${UNIT_FORM})\\b`),
    read: (m) => {
      const n = Number(m[1]);
      const unitWord = m[2].toLowerCase();
      const unit = unitWord.replace(/s$/, "");
      const display = n === 1 || unit === "ml" || unit === "tsp" || unit === "tbsp" ? unit : `${unit}s`;
      return { dose: `${n} ${display}`, unitsPerDose: n, doseUnit: unit };
    },
  },
];

/** Lower-cases, converts number words to digits and unifies unit spellings. */
export function normalizeTranscript(text) {
  let t = ` ${String(text || "").toLowerCase()} `;

  t = t
    .replace(/[,]/g, " ")
    .replace(/[.;!?\n\r]+(?=\s)/g, " | ")
    .replace(/\bmilligrams?\b|\bmgs\b/g, "mg")
    .replace(/\bmicrograms?\b|\bmcgs\b/g, "mcg")
    .replace(/\bmilli?litres?\b|\bmls\b/g, "ml")
    .replace(/\bgrams?\b/g, "g")
    .replace(/\bhalf\s+(?:a|an)\s+/g, "0.5 ")
    .replace(/\bhalf\b/g, "0.5");

  // "twenty five" -> 25, "thirty" -> 30
  t = t.replace(new RegExp(`\\b(${Object.keys(TENS).join("|")})(?:[\\s-]+(${Object.keys(ONES).slice(1, 10).join("|")}))?\\b`, "g"),
    (_, tens, ones) => String(TENS[tens] + (ones ? ONES[ones] : 0)));
  t = t.replace(new RegExp(`\\b(${Object.keys(ONES).join("|")})\\b`, "g"), (_, w) => String(ONES[w]));

  // "1 and a half" -> "1.5"
  t = t.replace(/\b(\d+)\s+and\s+(?:a\s+)?0\.5\b/g, (_, n) => String(Number(n) + 0.5));
  // Speech engines write "500mg" or "500 m g" in places.
  t = t.replace(/(\d)(mg|mcg|ml|g|iu)\b/g, "$1 $2");

  return t.replace(/\s+/g, " ").trim();
}

const emptySegment = () => ({
  words: [],
  strength: null,
  dose: "",
  unitsPerDose: null,
  doseUnit: "",
  frequency: "",
  perDay: null,
  duration: "",
  days: null,
  instructions: [],
});

const hasContent = (s) => s.words.length > 0 || s.strength || s.dose || s.frequency || s.duration || s.instructions.length;

/**
 * Parses a transcript into medicine entries.
 * Returns [{ medicineText, strength, dosage, frequency, duration, instructions,
 *            unitsPerDose, doseUnit, perDay, days, spoken }]
 */
export function parsePrescriptionSpeech(text) {
  const normalized = normalizeTranscript(text);
  if (!normalized) return [];

  const segments = [];
  let current = emptySegment();
  let spokenStart = 0;
  const spokenOf = [];

  const flush = (endPos) => {
    if (hasContent(current)) {
      segments.push(current);
      spokenOf.push(normalized.slice(spokenStart, endPos).replace(/\|/g, " ").replace(/\s+/g, " ").trim());
    }
    current = emptySegment();
  };

  let pos = 0;
  while (pos < normalized.length) {
    if (normalized[pos] === " ") { pos += 1; continue; }
    const rest = normalized.slice(pos);

    if (rest[0] === "|") {
      flush(pos);
      pos += 1;
      spokenStart = pos;
      continue;
    }

    let matched = null;
    for (const p of PATTERNS) {
      const m = rest.match(p.re);
      if (m && (!p.guard || p.guard(m))) { matched = { p, m }; break; }
    }

    if (matched) {
      const { p, m } = matched;
      const info = p.read(m);
      if (p.type === "boundary") {
        flush(pos);
        pos += m[0].length;
        spokenStart = pos;
        continue;
      }
      // A second duration/frequency/dose means a new medicine has started
      // (the speaker skipped the "next" keyword).
      if ((p.type === "duration" && current.duration)
        || (p.type === "frequency" && current.frequency && current.duration)) {
        flush(pos);
        spokenStart = pos;
      }
      if (p.type === "duration") { current.duration = info.duration; current.days = info.days; }
      else if (p.type === "frequency") { current.frequency = info.frequency; current.perDay = info.perDay; }
      else if (p.type === "instruction") { if (!current.instructions.includes(info.instruction)) current.instructions.push(info.instruction); }
      else if (p.type === "strength") { current.strength = info.strength; }
      else if (p.type === "dose") { current.dose = info.dose; current.unitsPerDose = info.unitsPerDose; current.doseUnit = info.doseUnit; }
      pos += m[0].length;
      continue;
    }

    // Plain word.
    const word = rest.match(/^[^\s|]+/)[0];
    const clean = word.replace(/[^a-z0-9.\-']/g, "");
    if (clean && !FILLER_WORDS.has(clean)) {
      // A free word after a finished entry (it has a duration) starts the next medicine.
      if (current.duration) {
        flush(pos);
        spokenStart = pos;
      }
      current.words.push(clean);
    }
    pos += word.length;
  }
  flush(normalized.length);

  return segments.map((s, i) => ({
    medicineText: s.words.join(" "),
    strength: s.strength,
    dosage: s.dose || (s.strength ? `${s.strength.value} ${s.strength.unit}` : ""),
    frequency: s.frequency,
    duration: s.duration,
    instructions: s.instructions.join(", "),
    unitsPerDose: s.unitsPerDose,
    doseUnit: s.doseUnit,
    perDay: s.perDay,
    days: s.days,
    spoken: spokenOf[i],
  }));
}

/**
 * Suggests a dispensing quantity. Only returns a number when the maths is
 * unambiguous (units per dose × doses per day × days). When the doctor gave a
 * strength but no unit count ("500 mg twice daily for 5 days") and the catalog
 * medicine is counted in tablets/capsules, one unit per dose is assumed and
 * flagged so the UI can tell the doctor to confirm it.
 * Returns { qty, basis: "calculated" | "assumed" | null }.
 */
export function estimateQty(parsed, medicine) {
  const { perDay, days } = parsed;
  if (!perDay || !days) return { qty: null, basis: null };

  if (parsed.unitsPerDose && COUNTABLE_UNIT_RE.test(parsed.doseUnit || "")) {
    return { qty: Math.max(1, Math.ceil(parsed.unitsPerDose * perDay * days)), basis: "calculated" };
  }

  const countable = /tab|cap|pill|sachet|ampoule|vial/i.test(medicine?.unitType || "");
  if (!parsed.unitsPerDose && parsed.strength && countable) {
    return { qty: Math.max(1, Math.ceil(perDay * days)), basis: "assumed" };
  }
  return { qty: null, basis: null };
}
