import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { EmptyState } from "../components/EmptyState";
import { Field } from "../components/Field";
import { FormActions } from "../components/FormActions";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { TableCard } from "../components/TableCard";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../lib/constants";
import { validateAdmission } from "../lib/validation";
import { admissionsApi, appointmentsApi, bedsApi, doctorsApi, patientsApi } from "../services/api";
import { formatDate, getErrorMessage } from "../lib/utils";

const initialForm = {
  patientId: "",
  doctorId: "",
  bedId: "",
  reason: ""
};

export function AdmissionsPage() {
  const { user, activeHospitalId } = useAuth();
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canMutate = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR].includes(user.role);
  const linkedAppointment = appointments
    .filter((appointment) => (appointment.patientId?._id || appointment.patientId) === form.patientId)
    .sort((left, right) => new Date(right.appointmentDate).getTime() - new Date(left.appointmentDate).getTime())[0];
  const linkedDoctorId = linkedAppointment?.doctorId?._id || linkedAppointment?.doctorId || "";
  const linkedDoctor = doctors.find((doctor) => doctor._id === linkedDoctorId);
  const admittedCount = admissions.filter((admission) => admission.status === "ADMITTED").length;
  const dischargedCount = admissions.filter((admission) => admission.status === "DISCHARGED").length;
  const availableBedCount = beds.filter((bed) => bed.status === "AVAILABLE").length;
  const occupiedBedCount = beds.filter((bed) => bed.status === "OCCUPIED").length;

  const columns = useMemo(
    () => [
      { key: "patientId", label: "Patient", render: (row) => row.patientId?.name || "-" },
      { key: "doctorId", label: "Doctor", render: (row) => row.doctorId?.name || "-" },
      { key: "bedId", label: "Bed", render: (row) => row.bedId?.bedNumber || "-" },
      { key: "admissionDate", label: "Admitted", render: (row) => formatDate(row.admissionDate) },
      { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> }
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!activeHospitalId) {
        setAdmissions([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [admissionsResponse, patientsResponse, doctorsResponse, bedsResponse, appointmentsResponse] = await Promise.all([
          admissionsApi.list({ hospitalId: activeHospitalId }),
          patientsApi.list({ hospitalId: activeHospitalId, page: 1, limit: 100 }),
          doctorsApi.list({ hospitalId: activeHospitalId, page: 1, limit: 100 }),
          bedsApi.list({ hospitalId: activeHospitalId }),
          appointmentsApi.list({ hospitalId: activeHospitalId, page: 1, limit: 200 })
        ]);

        if (!cancelled) {
          setAdmissions(admissionsResponse.items);
          setPatients(patientsResponse.items);
          setDoctors(doctorsResponse.items);
          setBeds(bedsResponse.items);
          setAppointments(appointmentsResponse.items);
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
  }, [activeHospitalId]);

  const refresh = async () => {
    const [admissionResponse, bedResponse] = await Promise.all([
      admissionsApi.list({ hospitalId: activeHospitalId }),
      bedsApi.list({ hospitalId: activeHospitalId })
    ]);
    setAdmissions(admissionResponse.items);
    setBeds(bedResponse.items);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      if (name === "patientId") {
        const patientAppointment = appointments
          .filter((appointment) => (appointment.patientId?._id || appointment.patientId) === value)
          .sort(
            (left, right) => new Date(right.appointmentDate).getTime() - new Date(left.appointmentDate).getTime()
          )[0];

        return {
          ...current,
          patientId: value,
          doctorId: patientAppointment?.doctorId?._id || patientAppointment?.doctorId || ""
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

    const validationError = validateAdmission(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!form.doctorId) {
      setError("No doctor could be inferred for this patient. Create an appointment first.");
      return;
    }

    setSubmitting(true);

    const payload = {
      ...form,
      hospitalId: activeHospitalId
    };

    try {
      if (editingId) {
        await admissionsApi.update(editingId, payload);
        setMessage("Admission updated successfully.");
      } else {
        await admissionsApi.create(payload);
        setMessage("Admission created successfully.");
      }

      resetForm();
      await refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDischarge = async (id) => {
    setError("");
    setMessage("");

    try {
      await admissionsApi.discharge(id);
      setMessage("Patient discharged successfully. The linked bed is now available again.");
      await refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  if (!activeHospitalId) {
    return (
      <EmptyState
        title="Choose an active hospital"
        description="Admissions are created from hospital-scoped patients, doctors, and beds."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 08"
        title="Admissions"
        description="Assign admitted patients to beds, manage discharge state, and keep occupancy flowing through the backend rules."
      />

      <div className="stats-grid">
        <StatCard label="Active Admissions" value={admittedCount} hint="Patients currently admitted." />
        <StatCard label="Discharged" value={dischargedCount} hint="Patients already discharged." />
        <StatCard label="Available Beds" value={availableBedCount} hint="Beds ready for new admissions." />
        <StatCard label="Occupied Beds" value={occupiedBedCount} hint="Beds currently assigned." />
      </div>

      <div className="two-column-grid">
        <TableCard title="Admission form" description="Only available beds should be used for new admissions.">
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
              value={linkedDoctor?.name || ""}
              onChange={() => {}}
              disabled
              placeholder="Doctor will be inferred from the patient's latest appointment"
            />
            {form.patientId ? (
              linkedDoctor ? (
                <p className="hint">
                  Doctor is auto-filled from the patient&apos;s latest appointment: {linkedDoctor.name}
                </p>
              ) : (
                <div className="inline-banner error">
                  This patient has no linked appointment doctor yet. Create an appointment first.
                </div>
              )
            ) : null}
            <div className="inline-banner success">
              Discharging a patient will automatically mark the linked bed as available again.
            </div>
            <Field
              label="Bed"
              name="bedId"
              value={form.bedId}
              onChange={handleChange}
              options={beds.map((item) => ({ label: `${item.bedNumber} (${item.status})`, value: item._id }))}
              required
            />
            <Field label="Reason" name="reason" value={form.reason} onChange={handleChange} multiline />

            {error ? <div className="inline-banner error">{error}</div> : null}
            {message ? <div className="inline-banner success">{message}</div> : null}

            {canMutate ? (
              <FormActions isEditing={Boolean(editingId)} onCancel={resetForm} submitting={submitting} />
            ) : (
              <p className="hint">Your role can view admissions but cannot maintain them.</p>
            )}
          </form>
        </TableCard>

        <TableCard
          title="Admission list"
          description={loading ? "Refreshing..." : `${admissions.length} admissions loaded`}
        >
          <DataTable
            columns={columns}
            rows={admissions}
            emptyText="No admissions found for the active hospital."
            renderActions={(row) => (
              <>
                {canMutate ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingId(row._id);
                      setForm({
                        patientId: row.patientId?._id || "",
                        doctorId: row.doctorId?._id || "",
                        bedId: row.bedId?._id || "",
                        reason: row.reason || ""
                      });
                    }}
                  >
                    Edit
                  </button>
                ) : null}
                {canMutate && row.status === "ADMITTED" ? (
                  <button type="button" className="btn btn-danger" onClick={() => handleDischarge(row._id)}>
                    Discharge / Free Bed
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
