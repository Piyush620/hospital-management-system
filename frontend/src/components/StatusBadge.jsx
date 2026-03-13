import { titleCase } from "../lib/utils";

export function StatusBadge({ value }) {
  const normalized = String(value || "unknown").toLowerCase();
  return <span className={`status-badge status-${normalized}`}>{titleCase(value)}</span>;
}
