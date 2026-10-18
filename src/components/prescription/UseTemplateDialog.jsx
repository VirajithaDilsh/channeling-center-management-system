import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Chip } from "@mui/material";
import { getPrescriptionTemplates } from "../../api/PrescriptionTemplateApi";

// Lets the doctor pick one of their own templates. Selecting only hands the
// template back via onSelect — copying it into the form (and saving) is the
// caller's job, so nothing is persisted here.
export default function UseTemplateDialog({ open, onClose, onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    setSearch("");
    setError("");
    setLoading(true);
    try {
      setTemplates(await getPrescriptionTemplates());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? templates.filter((t) => t.name.toLowerCase().includes(q)) : templates;
  }, [templates, search]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Use Template</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth size="small" label="Search templates by name" value={search}
          onChange={(e) => setSearch(e.target.value)} className="!mb-3"
        />

        {loading && <div className="flex justify-center py-6"><CircularProgress size={24} /></div>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && templates.length === 0 && (
          <p className="text-sm text-gray-500">You have no templates yet. Use "Save as Template" on a prescription to create one.</p>
        )}
        {!loading && templates.length > 0 && visible.length === 0 && (
          <p className="text-sm text-gray-500">No templates match "{search}".</p>
        )}

        <div className="space-y-2">
          {visible.map((t) => {
            const problems = t.items.filter((i) => i.issue).length;
            return (
              <div key={t._id} className="border rounded-xl p-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-gray-500 truncate">{t.items.map((i) => i.medicineName).join(", ")}</p>
                  {problems > 0 && (
                    <Chip size="small" color="warning" variant="outlined" className="!mt-1"
                      label={`${problems} item${problems === 1 ? "" : "s"} need attention`} />
                  )}
                </div>
                <Button size="small" variant="contained" onClick={() => onSelect(t)}>Use</Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
