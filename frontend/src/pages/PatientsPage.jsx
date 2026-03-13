import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { FormActions } from "../components/FormActions";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { TableCard } from "../components/TableCard";
import { useAuth } from "../context/AuthContext";
import { BLOOD_GROUPS, GENDERS, ROLES } from "../lib/constants";
import { patientsApi } from "../services/api";
import { formatDate, getErrorMessage } from "../lib/utils";

const initialForm = {
  name: "",
  phone: "",
  age: "",
  gender: "",
  address: "",
  bloodGroup: ""
};

export function PatientsPage() {
  const { user, activeHospitalId } = useAuth();
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 10 });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const canMutate = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.STAFF].includes(user.role);
  const canDelete = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role);

  const columns = useMemo(
    () => [
      { key: "name", label: "Patient" },
      { key: "phone", label: "Phone" },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "bloodGroup", label: "Blood Group", render: (row) => row.bloodGroup || "—" },
      { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
    ],
    []
  );

  const filteredPatients = patients.filter((patient) =>
    [patient.name, patient.phone, patient.gender, patient.bloodGroup, patient.address]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      if (!activeHospitalId) {
        setPatients([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await patientsApi.list({ hospitalId: activeHospitalId, page, limit: 10 });
        if (!cancelled) {
          setPatients(response.items);
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

    loadPatients();

    return () => {
      cancelled = true;
    };
  }, [activeHospitalId, page]);

  const refresh = async () => {
    const response = await patientsApi.list({ hospitalId: activeHospitalId, page, limit: 10 });
    setPatients(response.items);
    setMeta({ total: response.total, limit: response.limit });
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

    const payload = {
      ...form,
      hospitalId: activeHospitalId,
      age: Number(form.age)
    };

    try {
      if (editingId) {
        await patientsApi.update(editingId, payload);
        setMessage("Patient updated successfully.");
      } else {
        await patientsApi.create(payload);
        setMessage("Patient created successfully.");
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
      await patientsApi.remove(id);
      setMessage("Patient deleted successfully.");
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
        description="Patients are created and queried within a hospital context."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 05"
        title="Patients"
        description="Capture patient intake details, keep records maintainable, and preserve the backend workflow contract."
      />

      <div className="two-column-grid">
        <TableCard title="Patient form" description="All patient operations are scoped to the active hospital.">
          <form className="entity-form" onSubmit={handleSubmit}>
            <Field label="Name" name="name" value={form.name} onChange={handleChange} required />
            <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <Field label="Age" name="age" type="number" min="0" value={form.age} onChange={handleChange} required />
            <Field label="Gender" name="gender" value={form.gender} onChange={handleChange} options={GENDERS} required />
            <Field label="Address" name="address" value={form.address} onChange={handleChange} multiline />
            <Field
              label="Blood Group"
              name="bloodGroup"
              value={form.bloodGroup}
              onChange={handleChange}
              options={BLOOD_GROUPS}
            />

            {error ? <div className="inline-banner error">{error}</div> : null}
            {message ? <div className="inline-banner success">{message}</div> : null}

            {canMutate ? (
              <FormActions isEditing={Boolean(editingId)} onCancel={resetForm} submitting={submitting} />
            ) : (
              <p className="hint">Your role can view patient records but cannot modify them.</p>
            )}
          </form>
        </TableCard>

        <TableCard
          title="Patient list"
          description={loading ? "Refreshing..." : `Page ${page} • ${meta.total} patients total`}
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
            searchPlaceholder="Search patients by name, phone, gender, blood group, or address"
          />
          <DataTable
            columns={columns}
            rows={filteredPatients}
            emptyText="No patients found for the active hospital."
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
                        phone: row.phone || "",
                        age: row.age || "",
                        gender: row.gender || "",
                        address: row.address || "",
                        bloodGroup: row.bloodGroup || ""
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
