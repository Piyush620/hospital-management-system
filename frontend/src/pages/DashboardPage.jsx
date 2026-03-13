import { useEffect, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { TableCard } from "../components/TableCard";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/constants";
import { dashboardApi } from "../services/api";
import { getErrorMessage } from "../lib/utils";

const workflow = [
  "Signup -> OTP verification -> login",
  "Create hospital and choose an active hospital",
  "Add departments, doctors, and patients",
  "Schedule appointments and prepare bed infrastructure",
  "Create admissions, billing, and payments",
  "Review dashboard metrics and audit logs"
];

export function DashboardPage() {
  const { user, activeHospitalId, hospitals } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canReadStats = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      if (!canReadStats) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await dashboardApi.stats();
        if (!cancelled) {
          setStats(response);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [canReadStats]);

  const activeHospital = hospitals.find((hospital) => hospital._id === activeHospitalId);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Operational dashboard"
        description="A clean frontend layer over the existing backend workflow, with readiness checks, role awareness, and reusable patterns."
      />

      <div className="stats-grid">
        <StatCard label="Role" value={user.role.replace("_", " ")} hint="Access follows backend role guards." />
        <StatCard
          label="Active Hospital"
          value={activeHospital?.name || "Not selected"}
          hint="Choose the working hospital from the top bar."
        />
        <StatCard label="Hospitals Loaded" value={hospitals.length} hint="Workspace selector source." />
        <StatCard label="Workflow Stage" value="Frontend" hint="Built directly on the stable API contract." />
      </div>

      <div className="dashboard-grid">
        <TableCard
          title="Workflow checklist"
          description="This mirrors the backend integration order so the UI grows in the same direction as the API."
        >
          <ol className="ordered-list">
            {workflow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </TableCard>

        <TableCard
          title="Workspace notes"
          description="Operational assumptions the frontend uses to stay aligned with the backend."
        >
          <ul className="plain-list">
            <li>`/api/ready` gates app startup.</li>
            <li>Access tokens refresh centrally on `401`.</li>
            <li>`response.data` is treated as the stable payload surface.</li>
            <li>`hospitalId` is selected from the shared workspace context.</li>
          </ul>
        </TableCard>
      </div>

      {canReadStats ? (
        loading ? (
          <Loader label="Loading dashboard metrics..." />
        ) : error ? (
          <div className="inline-banner error">{error}</div>
        ) : stats ? (
          <div className="stats-grid">
            <StatCard label="Patients" value={stats.totalPatients ?? 0} />
            <StatCard label="Doctors" value={stats.totalDoctors ?? 0} />
            <StatCard label="Admissions" value={stats.totalAdmissions ?? 0} />
            <StatCard label="Revenue" value={`INR ${stats.totalRevenue ?? 0}`} />
          </div>
        ) : null
      ) : (
        <EmptyState
          title="Dashboard summary is role-aware"
          description="Your role does not have access to aggregated dashboard stats, but the rest of the permitted workflow remains available."
        />
      )}
    </>
  );
}
