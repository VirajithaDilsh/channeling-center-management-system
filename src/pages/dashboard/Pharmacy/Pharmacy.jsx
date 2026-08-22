import React, { useState } from "react";
import { Tab, Tabs, Typography } from "@mui/material";
import PillIcon from "@mui/icons-material/Medication";
import DispenseQueue from "./DispenseQueue";
import ExternalPrescription from "./ExternalPrescription";

// Two deliberately separate workflows:
//   Dispensing Queue  — our own doctors' typed prescriptions, with the
//                       QUEUED/PARTIAL item lifecycle the pharmacy works through.
//   External Rx       — a paper prescription from an outside doctor, which has
//                       no system Prescription document to queue.
export default function Pharmacy() {
  const [tab, setTab] = useState(0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 flex items-center gap-3">
        <PillIcon className="text-emerald-600" />
        <div>
          <Typography variant="h5" className="font-semibold">Pharmacy</Typography>
          <p className="text-gray-500 text-sm">Dispense prescriptions and record over-the-counter sales</p>
        </div>
      </div>

      <Tabs value={tab} onChange={(e, value) => setTab(value)} className="mb-6">
        <Tab label="Dispensing Queue" />
        <Tab label="External Rx" />
      </Tabs>

      {tab === 0 && <DispenseQueue embedded />}
      {tab === 1 && <ExternalPrescription />}
    </div>
  );
}
