import React, { useEffect, useState } from "react";
import { Autocomplete, TextField, Chip, CircularProgress } from "@mui/material";
import { searchIcd10 } from "../api/Icd10Api";

const label = (o) => `${o.code} – ${o.description}`;

// Multi-select ICD-10 diagnosis picker. Searches the server as the doctor
// types (debounced); `value` is an array of { code, description }.
export default function Icd10Select({ value = [], onChange, disabled = false, label: fieldLabel = "Diagnosis (ICD-10)" }) {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = input.trim();
    if (q.length < 2) {
      setOptions([]);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchIcd10(q);
        if (!cancelled) setOptions(results || []);
      } catch (err) {
        console.error("ICD-10 search failed:", err);
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input]);

  return (
    <Autocomplete
      multiple
      disabled={disabled}
      value={value}
      options={options}
      loading={loading}
      // Filtering happens on the server; keep already-selected codes out of the list.
      filterOptions={(opts) => opts.filter((o) => !value.some((v) => v.code === o.code))}
      isOptionEqualToValue={(o, v) => o.code === v.code}
      getOptionLabel={label}
      inputValue={input}
      onInputChange={(_, next, reason) => { if (reason !== "reset") setInput(next); }}
      onChange={(_, next) => onChange(next)}
      noOptionsText={input.trim().length < 2 ? "Type a code or diagnosis (min 2 characters)" : "No matching codes"}
      renderTags={(tags, getTagProps) =>
        tags.map((tag, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return <Chip key={key} size="small" label={label(tag)} {...tagProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={fieldLabel}
          placeholder={value.length ? "" : "Search ICD-10 code or diagnosis"}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
