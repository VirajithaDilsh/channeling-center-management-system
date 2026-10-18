import { useEffect, useRef, useState } from "react";
import { Button, Chip, CircularProgress, TextField } from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import WidgetCard from "../widgets/WidgetCard";
import { askAssistant, getAssistantStatus } from "../../../api/assistantApi";

const SUGGESTIONS = [
  "What is our total revenue this month?",
  "How much revenue did we generate last month?",
  "Which doctor generated the highest revenue?",
  "What is our total center commission?",
  "How many appointments were successfully paid?",
  "What was our highest-revenue month?",
  "Predict next month's revenue",
  "Why did revenue change compared with the previous month?",
];

const errorText = (err) => {
  const s = err.response?.status;
  if (s === 429) return "You're asking too quickly. Please wait a moment and try again.";
  if (s === 403) return "You don't have permission to use the assistant.";
  if (s === 400) return err.response?.data?.message || "That question couldn't be read.";
  if (err.code === "ECONNABORTED") return "The assistant took too long to respond. Please try again.";
  return "The assistant is unavailable right now. The charts and figures on this page still work.";
};

const KIND = {
  fact: { label: "Actual figures", cls: "bg-blue-50 text-blue-800" },
  prediction: { label: "Estimate", cls: "bg-amber-50 text-amber-800" },
  unsupported: null,
};

export default function AssistantChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [context, setContext] = useState(null);
  const [llm, setLlm] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    getAssistantStatus().then(setLlm).catch(() => setLlm(null));
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "nearest" }); }, [messages, busy]);

  const send = async (text) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const r = await askAssistant(q, context);
      if (r.tool) setContext({ tool: r.tool, params: r.params });
      setMessages((m) => [...m, { role: "assistant", text: r.answer, kind: r.kind, usedLlm: r.usedLlm }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: errorText(err), kind: "error" }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <WidgetCard
      title="AI Financial Assistant"
      subtitle={llm?.llmAvailable ? "Answers use your real figures; wording by a local AI model" : "Answers use your real figures (simple mode: AI model offline)"}
      icon={<SmartToyIcon className="text-blue-500" />}
    >
      <div className="flex flex-col gap-3">
        <div className="max-h-96 min-h-40 overflow-y-auto space-y-3 pr-1" aria-live="polite">
          {messages.length === 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Ask about revenue, commission, doctors or forecasts. Try:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => <Chip key={s} label={s} size="small" variant="outlined" onClick={() => send(s)} />)}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.role === "user" ? "bg-[#2a78d6] text-white" : m.kind === "error" ? "bg-red-50 text-red-800" : "bg-gray-100 text-gray-900"}`}>
                {m.role === "assistant" && KIND[m.kind] && (
                  <span className={`inline-block text-xs rounded px-1.5 py-0.5 mb-1 ${KIND[m.kind].cls}`}>{KIND[m.kind].label}</span>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.usedLlm && <p className="text-[11px] text-gray-500 mt-1">Reworded by AI from the figures above; amounts are verified against the data.</p>}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CircularProgress size={16} /> Looking at your figures…
            </div>
          )}
          <div ref={endRef} />
        </div>
        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.slice(0, 4).map((s) => <Chip key={s} label={s} size="small" variant="outlined" disabled={busy} onClick={() => send(s)} />)}
          </div>
        )}
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <TextField fullWidth size="small" placeholder="Ask a financial question…" value={input} onChange={(e) => setInput(e.target.value)} slotProps={{ htmlInput: { maxLength: 500, "aria-label": "Financial question" } }} />
          <Button type="submit" variant="contained" disabled={busy || !input.trim()} sx={{ textTransform: "none" }}>Ask</Button>
        </form>
        <p className="text-xs text-gray-500">Read-only: the assistant can't change any records. Figures count fully paid visits only; refunds aren't tracked.</p>
      </div>
    </WidgetCard>
  );
}
