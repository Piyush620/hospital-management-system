import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { FormActions } from "../components/FormActions";
import { ListToolbar } from "../components/ListToolbar";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { TableCard } from "../components/TableCard";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/constants";
import { departmentsApi, doctorsApi } from "../services/api";
import { formatCurrency, formatDate, getErrorMessage } from "../lib/utils";

const initialForm = {
  name: "",
  specialization: "",
  experience: "",
  consultationFee: "",
  departmentId: "",
  availability: "Available"
};

export function DoctorsPage() {
  const { user, activeHospitalId } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, limit: 10 });
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
        title="Doctor management is restricted"
        description="Only super admins and hospital admins can access doctor maintenance screens."
      />
    );
  }

  const columns = useMemo(
    () => [
      { key: "name", label: "Doctor" },
      { key: "specialization", label: "Specialization" },
      { key: "experience", label: "Experience", render: (row) => `${row.experience} yrs` },
      { key: "consultationFee", label: "Fee", render: (row) => formatCurrency(row.consultationFee) },
      {
        key: "departmentId",
        label: "Department",
        render: (row) => departments.find((department) => department._id === row.departmentId)?.name || row.departmentId || "—"
      },
      { key: "availability", label: "Availability", render: (row) => <StatusBadge value={row.availability} /> },
      { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
    ],
    [departments]
  );

  const filteredDoctors = doctors.filter((doctor) => {
    const departmentName = departments.find((department) => department._id === doctor.departmentId)?.name;

    return [doctor.name, doctor.specialization, doctor.availability, departmentName]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search.toLowerCase()));
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDependencies() {
      if (!activeHospitalId) {
        setDoctors([]);
        setDepartments([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [doctorsResponse, departmentsResponse] = await Promise.all([
          doctorsApi.list({ hospitalId: activeHospitalId, page, limit: 10 }),
          departmentsApi.list({ hospitalId: activeHospitalId })
        ]);

        if (!cancelled) {
          setDoctors(doctorsResponse.items);
          setMeta({ total: doctorsResponse.total, limit: doctorsResponse.limit });
          setDepartments(departmentsResponse.items);
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

    loadDependencies();

    return () => {
      cancelled = true;
    };
  }, [activeHospitalId, page]);

  const refresh = async () => {
    const response = await doctorsApi.list({ hospitalId: activeHospitalId, page, limit: 10 });
    setDoctors(response.items);
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
      experience: Number(form.experience),
      consultationFee: Number(form.consultationFee)
    };

    try {
      if (editingId) {
        await doctorsApi.update(editingId, payload);
        setMessage("Doctor updated successfully.");
      } else {
        await doctorsApi.create(payload);
        setMessage("Doctor created successfully.");
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
      await doctorsApi.remove(id);
      setMessage("Doctor deleted successfully.");
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
        description="Doctors depend on hospital and department context, so select a hospital first."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 04"
        title="Doctors"
        description="Create clinicians against departments, maintain fees, and keep availability visible for scheduling."
      />

      <div className="two-column-grid">
        <TableCard title="Doctor form" description="Departments are sourced from the active hospital.">
          <form className="entity-form" onSubmit={handleSubmit}>
            <Field label="Name" name="name" value={form.name} onChange={handleChange} required />
            <Field
              label="Specialization"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              required
            />
            <Field label="Experience" name="experience" type="number" min="0" value={form.experience} onChange={handleChange} required />
            <Field
              label="Consultation Fee"
              name="consultationFee"
              type="number"
              min="0"
              value={form.consultationFee}
              onChange={handleChange}
              required
            />
            <Field
              label="Department"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              options={departments.map((department) => ({ label: department.name, value: department._id }))}
              required
            />
            <Field
              label="Availability"
              name="availability"
              value={form.availability}
              onChange={handleChange}
              options={["Available", "Unavailable"]}
            />

            {error ? <div className="inline-banner error">{error}</div> : null}
            {message ? <div className="inline-banner success">{message}</div> : null}

            {canMutate ? (
              <FormActions isEditing={Boolean(editingId)} onCancel={resetForm} submitting={submitting} />
            ) : (
              <p className="hint">Your role can view doctors but cannot maintain them.</p>
            )}
          </form>
        </TableCard>

        <TableCard
          title="Doctor list"
          description={loading ? "Refreshing..." : `Page ${page} • ${meta.total} doctors total`}
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
            searchPlaceholder="Search doctors by name, specialization, department, or availability"
          />
          <DataTable
            columns={columns}
            rows={filteredDoctors}
            emptyText="No doctors found for the active hospital."
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
                        specialization: row.specialization || "",
                        experience: row.experience || "",
                        consultationFee: row.consultationFee || "",
                        departmentId: row.departmentId || "",
                        availability: row.availability || "Available"
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
