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
import { APPOINTMENT_STATUSES, ROLES } from "../lib/constants";
import { validateAppointment } from "../lib/validation";
import { appointmentsApi, departmentsApi, doctorsApi, patientsApi } from "../services/api";
import { formatDate, formatDateInput, getErrorMessage } from "../lib/utils";

const initialForm = {
  patientId: "",
  doctorId: "",
  departmentId: "",
  appointmentDate: "",
  notes: "",
  status: "SCHEDULED"
};

export function AppointmentsPage() {
  const { user, activeHospitalId } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
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

  const canCreate = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.STAFF].includes(user.role);
  const canUpdate = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR].includes(user.role);
  const canDelete = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role);
  const selectedDoctor = doctors.find((doctor) => doctor._id === form.doctorId);
  const availableDoctors = form.departmentId
    ? doctors.filter((doctor) => doctor.departmentId === form.departmentId)
    : doctors;

  const columns = useMemo(
    () => [
      {
        key: "patientId",
        label: "Patient",
        render: (row) => row.patientId?.name || patients.find((item) => item._id === row.patientId)?.name || "-"
      },
      {
        key: "doctorId",
        label: "Doctor",
        render: (row) => row.doctorId?.name || doctors.find((item) => item._id === row.doctorId)?.name || "-"
      },
      {
        key: "departmentId",
        label: "Department",
        render: (row) =>
          row.departmentId?.name ||
          departments.find((item) => item._id === row.departmentId)?.name ||
          "-"
      },
      { key: "appointmentDate", label: "Date", render: (row) => formatDate(row.appointmentDate) },
      { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> }
    ],
    [departments, doctors, patients]
  );

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName =
      appointment.patientId?.name || patients.find((item) => item._id === appointment.patientId)?.name;
    const doctorName =
      appointment.doctorId?.name || doctors.find((item) => item._id === appointment.doctorId)?.name;
    const departmentName =
      appointment.departmentId?.name ||
      departments.find((item) => item._id === appointment.departmentId)?.name;

    return [patientName, doctorName, departmentName, appointment.status, appointment.notes]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(search.toLowerCase()));
  });

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!activeHospitalId) {
        setAppointments([]);
        setDoctors([]);
        setPatients([]);
        setDepartments([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [appointmentsResponse, doctorsResponse, patientsResponse, departmentsResponse] = await Promise.all([
          appointmentsApi.list({ hospitalId: activeHospitalId, page, limit: 10 }),
          doctorsApi.list({ hospitalId: activeHospitalId, page: 1, limit: 100 }),
          patientsApi.list({ hospitalId: activeHospitalId, page: 1, limit: 100 }),
          departmentsApi.list({ hospitalId: activeHospitalId })
        ]);

        if (!cancelled) {
          setAppointments(appointmentsResponse.items);
          setMeta({ total: appointmentsResponse.total, limit: appointmentsResponse.limit });
          setDoctors(doctorsResponse.items);
          setPatients(patientsResponse.items);
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

    loadData();

    return () => {
      cancelled = true;
    };
  }, [activeHospitalId, page]);

  const refresh = async () => {
    const response = await appointmentsApi.list({ hospitalId: activeHospitalId, page, limit: 10 });
    setAppointments(response.items);
    setMeta({ total: response.total, limit: response.limit });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => {
      if (name === "departmentId") {
        const shouldClearDoctor =
          current.doctorId && doctors.find((doctor) => doctor._id === current.doctorId)?.departmentId !== value;

        return {
          ...current,
          departmentId: value,
          doctorId: shouldClearDoctor ? "" : current.doctorId
        };
      }

      if (name === "doctorId") {
        const doctor = doctors.find((item) => item._id === value);

        return {
          ...current,
          doctorId: value,
          departmentId: doctor?.departmentId || current.departmentId
        };
      }

      return { ...current, [name]: value };
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateAppointment(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (selectedDoctor && form.departmentId && selectedDoctor.departmentId !== form.departmentId) {
      setError("Selected doctor does not belong to the chosen department.");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      hospitalId: activeHospitalId,
      appointmentDate: new Date(form.appointmentDate).toISOString(),
      departmentId: form.departmentId || undefined
    };

    try {
      if (editingId) {
        await appointmentsApi.update(editingId, payload);
        setMessage("Appointment updated successfully.");
      } else {
        await appointmentsApi.create(payload);
        setMessage("Appointment scheduled successfully.");
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
      await appointmentsApi.remove(id);
      setMessage("Appointment deleted successfully.");
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
        description="Appointments require hospital, patient, and doctor context."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 06"
        title="Appointments"
        description="Schedule, track, and update patient appointments while staying inside the backend contract."
      />

      <div className="two-column-grid">
        <TableCard
          title="Appointment form"
          description="Patient, doctor, and department lookups are scoped to the active hospital."
        >
          <form className="entity-form" onSubmit={handleSubmit}>
            <Field
              label="Patient"
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              options={patients.map((item) => ({ label: item.name, value: item._id }))}
              required
            />
            <Field
              label="Doctor"
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              options={availableDoctors.map((item) => ({ label: item.name, value: item._id }))}
              required
            />
            <Field
              label="Department"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              options={departments.map((item) => ({ label: item.name, value: item._id }))}
              disabled={Boolean(form.doctorId)}
            />
            {form.doctorId ? (
              <p className="hint">
                Department is locked to the selected doctor:{" "}
                {departments.find((department) => department._id === form.departmentId)?.name || "-"}
              </p>
            ) : null}
            <Field
              label="Appointment Date"
              name="appointmentDate"
              type="datetime-local"
              value={form.appointmentDate}
              onChange={handleChange}
              required
            />
            <Field
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={APPOINTMENT_STATUSES}
            />
            <Field label="Notes" name="notes" value={form.notes} onChange={handleChange} multiline />

            {error ? <div className="inline-banner error">{error}</div> : null}
            {message ? <div className="inline-banner success">{message}</div> : null}

            {editingId ? (
              canUpdate ? <FormActions isEditing onCancel={resetForm} submitting={submitting} /> : null
            ) : canCreate ? (
              <FormActions isEditing={false} onCancel={resetForm} submitting={submitting} />
            ) : (
              <p className="hint">Your role can view appointments but cannot create them.</p>
            )}
          </form>
        </TableCard>

        <TableCard
          title="Appointment list"
          description={loading ? "Refreshing..." : `Page ${page} • ${meta.total} appointments total`}
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
            searchPlaceholder="Search appointments by patient, doctor, department, status, or notes"
          />
          <DataTable
            columns={columns}
            rows={filteredAppointments}
            emptyText="No appointments found for the active hospital."
            renderActions={(row) => (
              <>
                {canUpdate ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingId(row._id);
                      setForm({
                        patientId: row.patientId?._id || row.patientId || "",
                        doctorId: row.doctorId?._id || row.doctorId || "",
                        departmentId:
                          row.doctorId?.departmentId ||
                          row.departmentId?._id ||
                          row.departmentId ||
                          "",
                        appointmentDate: formatDateInput(row.appointmentDate),
                        notes: row.notes || "",
                        status: row.status || "SCHEDULED"
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
