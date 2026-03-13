import { useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { FormActions } from "../components/FormActions";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { TableCard } from "../components/TableCard";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/constants";
import { hospitalsApi } from "../services/api";
import { formatDate, getErrorMessage } from "../lib/utils";

const initialForm = {
  name: "",
  address: "",
  phone: ""
};

export function HospitalsPage() {
  const { user, hospitals, refreshHospitals } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const canCreate = user.role === ROLES.SUPER_ADMIN;
  const canUpdate = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role);
  const canDelete = user.role === ROLES.SUPER_ADMIN;

  if (![ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role)) {
    return (
      <EmptyState
        title="Hospital management is restricted"
        description="Only super admins and hospital admins can access hospital maintenance screens."
      />
    );
  }

  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "address", label: "Address", render: (row) => row.address || "—" },
      { key: "phone", label: "Phone", render: (row) => row.phone || "—" },
      { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
    ],
    []
  );

  const filteredHospitals = hospitals.filter((hospital) =>
    [hospital.name, hospital.address, hospital.phone]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

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
        await hospitalsApi.update(editingId, form);
        setMessage("Hospital updated successfully.");
      } else {
        await hospitalsApi.create(form);
        setMessage("Hospital created successfully.");
      }

      resetForm();
      await refreshHospitals();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (hospital) => {
    setEditingId(hospital._id);
    setForm({
      name: hospital.name || "",
      address: hospital.address || "",
      phone: hospital.phone || ""
    });
  };

  const handleDelete = async (id) => {
    setError("");
    setMessage("");

    try {
      await hospitalsApi.remove(id);
      setMessage("Hospital deleted successfully.");
      await refreshHospitals();
      if (editingId === id) {
        resetForm();
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  if (hospitals.length === 0 && !canCreate) {
    return (
      <EmptyState
        title="No hospitals available"
        description="A super admin needs to create the initial hospital before role-based workflows can continue."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 02"
        title="Hospitals"
        description="Create and maintain hospitals, then use the workspace selector to scope the rest of the operational flow."
      />

      <div className="two-column-grid">
        <TableCard
          title="Hospital form"
          description="Super admins can create hospitals; hospital admins can still maintain hospital details."
        >
          <form className="entity-form" onSubmit={handleSubmit}>
            <Field label="Name" name="name" value={form.name} onChange={handleChange} required />
            <Field label="Address" name="address" value={form.address} onChange={handleChange} multiline />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />

            {error ? <div className="inline-banner error">{error}</div> : null}
            {message ? <div className="inline-banner success">{message}</div> : null}

            {editingId ? (
              canUpdate ? <FormActions isEditing onCancel={resetForm} submitting={submitting} /> : null
            ) : canCreate ? (
              <FormActions isEditing={false} onCancel={resetForm} submitting={submitting} />
            ) : (
              <p className="hint">Your role can view the hospital list but cannot create new hospitals.</p>
            )}
          </form>
        </TableCard>

        <TableCard title="Hospitals" description="Shared workspace source for the active hospital selector.">
          <ListToolbar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search hospitals by name, phone, or address"
          />
          <DataTable
            columns={columns}
            rows={filteredHospitals}
            emptyText="No hospitals created yet."
            renderActions={(row) => (
              <>
                {canUpdate ? (
                  <button type="button" className="btn btn-secondary" onClick={() => handleEdit(row)}>
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
