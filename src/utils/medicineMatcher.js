// Matches a spoken medicine name against the clinic's medicine catalog.
// Speech engines often mangle drug names ("para setamol"), so this uses
// spelling, token and rough phonetic similarity. It is deliberately
// conservative: below the thresholds it returns no medicine at all and lets
// the doctor choose, rather than silently picking a wrong drug.

const STOP_WORDS = new Set([
  "tablet", "tablets", "tab", "tabs", "capsule", "capsules", "cap", "caps", "syrup", "injection",
  "inj", "cream", "ointment", "drops", "suspension", "the", "of", "and", "ip", "bp", "usp",
]);

const STRENGTH_RE = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu)\b/g;

export const MATCH_THRESHOLD = 0.85; // auto-select at or above this
export const SUGGEST_THRESHOLD = 0.6; // offer as alternatives at or above this
const MIN_GAP = 0.05; // winner must beat the runner-up by this much

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= b.length; j += 1) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

const ratio = (a, b) => {
  if (!a || !b) return 0;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
};

/** Strips strengths and form words, leaving the drug name. */
export function cleanName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(STRENGTH_RE, " ")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w))
    .join(" ");
}

export function extractStrengths(name) {
  const out = [];
  const lower = String(name || "").toLowerCase();
  let m;
  STRENGTH_RE.lastIndex = 0;
  while ((m = STRENGTH_RE.exec(lower)) !== null) out.push({ value: Number(m[1]), unit: m[2] });
  return out;
}

// Rough sound-alike key: "paracetamol"/"para setamol"/"paracetamole" end up close.
export function soundKey(s) {
  const t = String(s || "")
    .replace(/\s+/g, "")
    .replace(/ph/g, "f")
    .replace(/ck/g, "k")
    .replace(/c(?=[eiy])/g, "s")
    .replace(/c/g, "k")
    .replace(/z/g, "s")
    .replace(/(.)\1+/g, "$1");
  return t.charAt(0) + t.slice(1).replace(/[aeiouy]/g, "");
}

function similarity(query, candidate) {
  if (!query || !candidate) return 0;
  if (query === candidate) return 1;

  const qStripped = query.replace(/\s+/g, "");
  const cStripped = candidate.replace(/\s+/g, "");
  let best = ratio(qStripped, cStripped);

  // Prefix: "amox" vs "amoxicillin" (only for reasonably long fragments).
  if (qStripped.length >= 4 && cStripped.startsWith(qStripped)) best = Math.max(best, 0.9);
  if (cStripped.length >= 4 && qStripped.startsWith(cStripped)) best = Math.max(best, 0.9);

  // Sound-alike, discounted slightly so true spelling matches win ties.
  best = Math.max(best, ratio(soundKey(query), soundKey(candidate)) * 0.95);

  // Multi-word: every query word should resemble some candidate word.
  const qWords = query.split(" ");
  const cWords = candidate.split(" ");
  if (qWords.length > 1 || cWords.length > 1) {
    const avg = qWords.reduce((sum, qw) => sum + Math.max(...cWords.map((cw) => ratio(qw, cw))), 0) / qWords.length;
    best = Math.max(best, avg * 0.97);
  }
  return best;
}

function scoreMedicine(medicine, query, strength) {
  const names = [medicine.name, medicine.genericName].filter(Boolean).map(cleanName).filter(Boolean);
  let score = names.reduce((best, n) => Math.max(best, similarity(query, n)), 0);

  if (strength) {
    const have = extractStrengths(medicine.name);
    if (have.length) {
      const same = have.some((h) => h.value === strength.value && (h.unit === strength.unit
        || (h.unit === "g" && strength.unit === "mg" && h.value * 1000 === strength.value)));
      score = same ? Math.min(1, score + 0.05) : score - 0.1;
    }
  }
  return score;
}

/**
 * @param {string} spokenName   medicine words from the parser
 * @param {{value:number,unit:string}|null} strength  optional strength hint
 * @param {Array} catalog       medicines from GET /api/medicines
 * @returns {{status:'matched'|'ambiguous'|'unmatched', medicine:object|null, score:number, alternatives:object[]}}
 */
export function matchMedicine(spokenName, strength, catalog) {
  const query = cleanName(spokenName);
  if (!query || !Array.isArray(catalog) || catalog.length === 0) {
    return { status: "unmatched", medicine: null, score: 0, alternatives: [] };
  }

  const ranked = catalog
    .map((medicine) => ({ medicine, score: scoreMedicine(medicine, query, strength) }))
    .filter((r) => r.score >= SUGGEST_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return { status: "unmatched", medicine: null, score: 0, alternatives: [] };

  const [top, second] = ranked;
  const alternatives = ranked.slice(0, 4).map((r) => r.medicine);

  if (top.score >= MATCH_THRESHOLD && (!second || top.score - second.score >= MIN_GAP)) {
    return { status: "matched", medicine: top.medicine, score: top.score, alternatives };
  }
  return { status: "ambiguous", medicine: null, score: top.score, alternatives };
}
