import { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import useDashboardData from "../../hooks/useDashboardData";
import { getPublicSettings } from "../../api/SettingsApi";
import KpiStrip from "./widgets/KpiStrip";
import ScheduleCard from "./widgets/ScheduleCard";
import { AwaitingPaymentCard, StuckVisitsCard } from "./widgets/BillingCards";
import { PharmacyQueueCard, LowStockCard, DoctorsOnDutyCard } from "./widgets/OperationsCards";
import { AppointmentsTrendChart, CollectionsTrendChart } from "./widgets/TrendCharts";

// No p-6 / bg / min-h-screen here: DashboardLayout's <main> already applies
// `p-4 md:p-6` and the page background. Adding them again double-pads, which is
// what DoctorHome and Billing currently do.
export default function DashboardHome() {
  const { viewer, sources, lastLoadedAt, refreshing, refresh, refreshSource } = useDashboardData();
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");

  useEffect(() => {
    getPublicSettings()
      .then((data) => data.currencySymbol && setCurrencySymbol(data.currencySymbol))
      .catch((err) => console.error("Failed to load currency settings:", err));
  }, []);

  const money = (value) => `${currencySymbol} ${Number(value || 0).toFixed(2)}`;

  // A card renders only when its data is reachable. `skipped` means the viewer's
  // permissions cannot satisfy that route, so the request was never made and the
  // card is absent rather than empty — no greyed-out placeholders, no "you don't
  // have permission" copy where a widget would have been.
  const available = (key) => sources[key].status !== "skipped";

  // Money is gated on billing permissions specifically. The visit-session source
  // is also reachable with pharmacy permissions, which patient_manager holds —
  // and clinic revenue does not belong on the patient desk.
  const canSeeMoney = available("visitSessions") && viewer.can(["billing_read", "billing_allow_all"]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <Typography variant="h5" className="font-semibold">Dashboard</Typography>
          <p className="text-gray-500 text-sm">
            {viewer.role ? `Signed in as ${viewer.role}` : "Overview"}
            {lastLoadedAt && ` · as of ${lastLoadedAt.toLocaleTimeString()}`}
          </p>
        </div>

        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={refresh}
          disabled={refreshing}
          sx={{ textTransform: "none" }}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <KpiStrip sources={sources} money={canSeeMoney ? money : null} />

      {/* Things needing action, before anything retrospective. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {available("appointments") && (
          <ScheduleCard
            source={sources.appointments}
            onRetry={() => refreshSource("appointments")}
            isDoctor={viewer.isDoctor}
          />
        )}

        {canSeeMoney && (
          <AwaitingPaymentCard
            source={sources.visitSessions}
            onRetry={() => refreshSource("visitSessions")}
            money={money}
          />
        )}

        {canSeeMoney && (
          <StuckVisitsCard
            source={sources.visitSessions}
            onRetry={() => refreshSource("visitSessions")}
            money={money}
          />
        )}

        {available("pharmacyQueue") && (
          <PharmacyQueueCard
            source={sources.pharmacyQueue}
            onRetry={() => refreshSource("pharmacyQueue")}
          />
        )}

        {available("medicines") && (
          <LowStockCard source={sources.medicines} onRetry={() => refreshSource("medicines")} />
        )}

        {available("doctors") && (
          <DoctorsOnDutyCard
            source={sources.doctors}
            appointmentsSource={sources.appointments}
            onRetry={() => refreshSource("doctors")}
          />
        )}
      </div>

      {/* Trends last: useful context, never the thing you act on first. */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {available("appointments") && (
          <AppointmentsTrendChart
            source={sources.appointments}
            onRetry={() => refreshSource("appointments")}
          />
        )}

        {canSeeMoney && (
          <CollectionsTrendChart
            source={sources.visitSessions}
            onRetry={() => refreshSource("visitSessions")}
            money={money}
            currencySymbol={currencySymbol}
          />
        )}
      </div>
    </div>
  );
}
