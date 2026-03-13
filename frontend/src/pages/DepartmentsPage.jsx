import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { FormActions } from "../components/FormActions";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { TableCard } from "../components/TableCard";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/constants";
import { departmentsApi } from "../services/api";
import { formatDate, getErrorMessage } from "../lib/utils";

const initialForm = {
  name: "",
  description: ""
};

export function DepartmentsPage() {
  const { user, activeHospitalId } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const canMutate = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role);
  const canDelete = user.role === ROLES.SUPER_ADMIN;

  if (![ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role)) {
    return (
      <EmptyState
        title="Department management is restricted"
        description="Only super admins and hospital admins can access department maintenance."
      />
    );
  }

  const columns = useMemo(
    () => [
      { key: "name", label: "Department" },
      { key: "description", label: "Description", render: (row) => row.description || "—" },
      { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
    ],
    []
  );

  const filteredDepartments = departments.filter((department) =>
    [department.name, department.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDepartments() {
      if (!activeHospitalId) {
        setDepartments([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await departmentsApi.list({ hospitalId: activeHospitalId });
        if (!cancelled) {
          setDepartments(response.items);
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

    loadDepartments();

    return () => {
      cancelled = true;
    };
  }, [activeHospitalId]);

  const refresh = async () => {
    const response = await departmentsApi.list({ hospitalId: activeHospitalId });
    setDepartments(response.items);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await departmentsApi.update(editingId, { ...form, hospitalId: activeHospitalId });
        setMessage("Department updated successfully.");
      } else {
        await departmentsApi.create({ ...form, hospitalId: activeHospitalId });
        setMessage("Department created successfully.");
      }

      resetForm();
      await refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    setMessage("");

    try {
      await departmentsApi.remove(id);
      setMessage("Department deleted successfully.");
      await refresh();
      if (editingId === id) {
        resetForm();
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  if (!activeHospitalId) {
    return (
      <EmptyState
        title="Choose an active hospital"
        description="Departments are scoped to a hospital, so select one from the workspace switcher first."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 03"
        title="Departments"
        description="Manage hospital departments before assigning doctors and appointments."
      />

      <div className="two-column-grid">
        <TableCard title="Department form" description="Department creation follows the active hospital selection.">
          <form className="entity-form" onSubmit={handleSubmit}>
            <Field label="Name" name="name" value={form.name} onChange={handleChange} required />
            <Field
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
            />

            {error ? <div className="inline-banner error">{error}</div> : null}
            {message ? <div className="inline-banner success">{message}</div> : null}

            {canMutate ? (
              <FormActions isEditing={Boolean(editingId)} onCancel={resetForm} submitting={submitting} />
            ) : (
              <p className="hint">Your role can view departments but cannot create or update them.</p>
            )}
          </form>
        </TableCard>

        <TableCard title="Department list" description={loading ? "Refreshing..." : `${departments.length} departments loaded.`}>
          <ListToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search departments by name or description"
          />
          <DataTable
            columns={columns}
            rows={filteredDepartments}
            emptyText="No departments found for the active hospital."
            renderActions={(row) => (
              <>
                {canMutate ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingId(row._id);
                      setForm({
                        name: row.name || "",
                        description: row.description || ""
                      });
                    }}
                  >
                    Edit
                  </button>
                ) : null}
                {canDelete ? (
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(row._id)}>
                    Delete
                  </button>
                ) : null}
              </>
            )}
          />
        </TableCard>
      </div>
    </>
  );
}
