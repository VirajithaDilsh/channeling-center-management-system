import React, { useEffect, useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField,
  Autocomplete, IconButton, CircularProgress, Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TableActionButtons from "../../../components/TableActionButton";
import SearchBar from "../../../components/SearchBar";
import { ISSUE_LABELS } from "../../../components/prescription/templateIssues";
import { getMedicines } from "../../../api/MedicineApi";
import {
  getPrescriptionTemplates, createPrescriptionTemplate,
  updatePrescriptionTemplate, deletePrescriptionTemplate,
} from "../../../api/PrescriptionTemplateApi";

const emptyItem = { medicineId: "", medicineName: "", dosage: "", frequency: "", duration: "", instructions: "", qtyPrescribed: 1, issue: null };

export default function PrescriptionTemplatesTab({ showSnackbar }) {
  const [templates, setTemplates] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTemplates = async () => {
    try {
      setTemplates(await getPrescriptionTemplates());
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to load prescription templates", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
    getMedicines().then((m) => setMedicineOptions(m || [])).catch(() => {});
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? templates.filter((t) => t.name.toLowerCase().includes(q)) : templates;
  }, [templates, search]);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setItems([{ ...emptyItem }]);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (t) => {
    setEditingId(t._id);
    setName(t.name);
    setItems(t.items.map((i) => ({ ...emptyItem, ...i, medicineId: i.issue === "DELETED" ? "" : i.medicineId })));
    setFormError("");
    setFormOpen(true);
  };

  const updateItem = (idx, patch) => setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  const handleSave = async () => {
    if (!name.trim()) return setFormError("Template name is required");
    if (items.length === 0) return setFormError("Add at least one medicine");
    if (items.some((i) => !i.medicineId)) {
      return setFormError("Every row needs a medicine — replace or remove unavailable ones");
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        items: items.map((i) => ({
          medicineId: i.medicineId, dosage: i.dosage, frequency: i.frequency,
          duration: i.duration, instructions: i.instructions, qtyPrescribed: Number(i.qtyPrescribed) || 1,
        })),
      };
      if (editingId) await updatePrescriptionTemplate(editingId, payload);
      else await createPrescriptionTemplate(payload);
      showSnackbar(editingId ? "Template updated" : "Template created");
      setFormOpen(false);
      fetchTemplates();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePrescriptionTemplate(deleteTarget._id);
      showSnackbar("Template deleted. Prescriptions already issued are unaffected.");
      setDeleteTarget(null);
      fetchTemplates();
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Failed to delete template", "error");
    }
  };

  if (loading) return <div className="flex justify-center py-8"><CircularProgress /></div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Prescription Templates</h2>
          <p className="text-sm text-gray-500">Reusable prescriptions, visible only to you. Applying one copies it into a consultation — nothing is linked back.</p>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>New Template</Button>
      </div>

      <div className="mb-4"><SearchBar placeholder="Search templates by name" onChange={(e) => setSearch(e.target.value)} /></div>

      <TableContainer component={Paper} elevation={0} className="border">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Medicines</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visible.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-gray-500">
                {templates.length === 0 ? "No templates yet." : "No templates match your search."}
              </TableCell></TableRow>
            )}
            {visible.map((t) => (
              <TableRow key={t._id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>
                  {t.items.map((i) => i.medicineName).join(", ")}
                  {t.items.some((i) => i.issue) && (
                    <Chip size="small" color="warning" variant="outlined" className="!ml-2" label="Needs attention" />
                  )}
                </TableCell>
                <TableCell>{t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "-"}</TableCell>
                <TableCell><TableActionButtons onEdit={() => openEdit(t)} onDelete={() => setDeleteTarget(t)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={formOpen} onClose={saving ? undefined : () => setFormOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{editingId ? "Edit Template" : "New Template"}</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth size="small" label="Template name" value={name} className="!mb-4"
            onChange={(e) => { setName(e.target.value); setFormError(""); }} inputProps={{ maxLength: 80 }} />

          <div className="space-y-3">
            {items.map((it, i) => {
              const selected = medicineOptions.find((o) => o._id === it.medicineId) || null;
              return (
                <div key={i}>
                  {it.issue && (
                    <p className="text-xs text-amber-700 mb-1">
                      {it.medicineName}: {ISSUE_LABELS[it.issue]}
                      {it.issue === "DELETED" ? " — choose a replacement or remove this row" : ""}
                    </p>
                  )}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <Autocomplete className="col-span-3" size="small" options={medicineOptions} value={selected}
                      getOptionLabel={(o) => o.name || ""}
                      onChange={(e, v) => updateItem(i, { medicineId: v?._id || "", medicineName: v?.name || "", issue: null })}
                      renderInput={(params) => <TextField {...params} label="Medicine" error={!it.medicineId} />} />
                    <TextField className="col-span-1" size="small" type="number" label="Qty" value={it.qtyPrescribed}
                      inputProps={{ min: 1 }} onChange={(e) => updateItem(i, { qtyPrescribed: e.target.value })} />
                    <TextField className="col-span-2" size="small" label="Dosage" value={it.dosage} onChange={(e) => updateItem(i, { dosage: e.target.value })} />
                    <TextField className="col-span-2" size="small" label="Frequency" value={it.frequency} onChange={(e) => updateItem(i, { frequency: e.target.value })} />
                    <TextField className="col-span-2" size="small" label="Duration" value={it.duration} onChange={(e) => updateItem(i, { duration: e.target.value })} />
                    <TextField className="col-span-1" size="small" label="Instructions" value={it.instructions} onChange={(e) => updateItem(i, { instructions: e.target.value })} />
                    <IconButton className="col-span-1" size="small" color="error" disabled={items.length === 1}
                      onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>

          <Button size="small" startIcon={<AddIcon />} className="!mt-3" onClick={() => setItems((p) => [...p, { ...emptyItem }])}>Add Medicine</Button>
          {formError && <p className="text-sm text-red-600 mt-3">{formError}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete template?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            "{deleteTarget?.name}" will be removed from your library. Prescriptions already created from it are not affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
