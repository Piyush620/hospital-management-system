import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { TableCard } from "../components/TableCard";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/constants";
import { auditApi } from "../services/api";
import { formatDate, getErrorMessage } from "../lib/utils";

export function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const columns = useMemo(
    () => [
      { key: "createdAt", label: "Timestamp", render: (row) => formatDate(row.createdAt) },
      { key: "user", label: "User", render: (row) => row.user?.name || row.user?.email || "—" },
      { key: "action", label: "Action" },
      { key: "module", label: "Module" },
      { key: "targetId", label: "Target ID", render: (row) => row.targetId || "—" }
    ],
    []
  );

  const filteredLogs = logs.filter((log) =>
    [log.user?.name, log.user?.email, log.action, log.module, log.targetId]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      if (user.role !== ROLES.SUPER_ADMIN) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await auditApi.list({ page, limit: 10 });
        if (!cancelled) {
          setLogs(response.items);
          setMeta({ total: response.total, limit: response.limit });
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

    loadLogs();

    return () => {
      cancelled = true;
    };
  }, [page, user.role]);

  if (user.role !== ROLES.SUPER_ADMIN) {
    return (
      <EmptyState
        title="Audit logs are restricted"
        description="Only super admins can access the global audit trail exposed by the backend."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 11"
        title="Audit logs"
        description="Review the paginated audit trail and preserve backend visibility into operational changes."
      />

      {error ? <div className="inline-banner error">{error}</div> : null}

      <TableCard
        title="Audit trail"
        description={loading ? "Refreshing..." : `Page ${page} • ${meta.total} logs total`}
        actions={
          <div className="filter-row">
            <button type="button" className="btn btn-secondary" onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((current) => (current * meta.limit < meta.total ? current + 1 : current))}
            >
              Next
            </button>
          </div>
        }
      >
        <ListToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search audit logs by user, action, module, or target id"
        />
        <DataTable columns={columns} rows={filteredLogs} emptyText="No audit logs found." />
      </TableCard>
    </>
  );
}
