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
import { BILLING_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, ROLES } from "../lib/constants";
import { validateBilling, validatePayment } from "../lib/validation";
import { admissionsApi, billingsApi, patientsApi, paymentsApi } from "../services/api";
import { formatCurrency, formatDate, getErrorMessage } from "../lib/utils";

const initialBillingForm = {
  patientId: "",
  admissionId: "",
  amount: "",
  medicalCost: "",
  description: "",
  status: "PENDING"
};

function createTransactionId(method = "PAY") {
  const prefix = String(method || "PAY").slice(0, 3).toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const initialPaymentForm = {
  billingId: "",
  amount: "",
  method: "Cash",
  status: "Completed",
  transactionId: createTransactionId("Cash")
};

export function FinancePage() {
  const { user, activeHospitalId } = useAuth();
  const [billings, setBillings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [billingForm, setBillingForm] = useState(initialBillingForm);
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm);
  const [editing, setEditing] = useState({ billingId: "", paymentId: "" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const canCreateBilling = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.STAFF].includes(user.role);
  const canUpdateBilling = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role);
  const canDeleteBilling = user.role === ROLES.SUPER_ADMIN;
  const canCreatePayment = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.STAFF].includes(user.role);
  const canUpdatePayment = [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN].includes(user.role);
  const canDeletePayment = user.role === ROLES.SUPER_ADMIN;
  const billingTotal = Number(billingForm.amount || 0) + Number(billingForm.medicalCost || 0);
  const paidBillCount = billings.filter((bill) => bill.status === "PAID").length;
  const completedPaymentCount = payments.filter((payment) => payment.status === "Completed").length;
  const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  if (![ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.STAFF].includes(user.role)) {
    return (
      <EmptyState
        title="Finance access is restricted"
        description="Only super admins, hospital admins, and staff can work with billing and payments."
      />
    );
  }

  const billingColumns = useMemo(
    () => [
      { key: "patientId", label: "Patient", render: (row) => row.patientId?.name || "-" },
      { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
      { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
      { key: "description", label: "Description", render: (row) => row.description || "-" },
      { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
    ],
    []
  );

  const paymentColumns = useMemo(
    () => [
      {
        key: "billingId",
        label: "Billing",
        render: (row) => row.billingId?._id?.slice(-6) || row.billingId || "-"
      },
      { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
      { key: "method", label: "Method" },
      { key: "transactionId", label: "Transaction ID", render: (row) => row.transactionId || "-" },
      { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
      { key: "createdAt", label: "Created", render: (row) => formatDate(row.createdAt) }
    ],
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadFinance() {
      if (!activeHospitalId) {
        setBillings([]);
        setPayments([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [billingResponse, paymentResponse, patientResponse, admissionResponse] = await Promise.all([
          billingsApi.list({ hospitalId: activeHospitalId }),
          paymentsApi.list({ hospitalId: activeHospitalId }),
          patientsApi.list({ hospitalId: activeHospitalId, page: 1, limit: 100 }),
          admissionsApi.list({ hospitalId: activeHospitalId })
        ]);

        if (!cancelled) {
          setBillings(billingResponse.items);
          setPayments(paymentResponse.items);
          setPatients(patientResponse.items);
          setAdmissions(admissionResponse.items);
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

    loadFinance();

    return () => {
      cancelled = true;
    };
  }, [activeHospitalId]);

  const refresh = async () => {
    const [billingResponse, paymentResponse] = await Promise.all([
      billingsApi.list({ hospitalId: activeHospitalId }),
      paymentsApi.list({ hospitalId: activeHospitalId })
    ]);
    setBillings(billingResponse.items);
    setPayments(paymentResponse.items);
  };

  const handleBillingSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateBilling(billingForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    const descriptionParts = [billingForm.description];

    if (Number(billingForm.medicalCost || 0) > 0) {
      descriptionParts.push(`Medical cost: ${formatCurrency(billingForm.medicalCost)}`);
    }

    const payload = {
      ...billingForm,
      hospitalId: activeHospitalId,
      amount: billingTotal,
      description: descriptionParts.filter(Boolean).join(" | ")
    };

    try {
      if (editing.billingId) {
        await billingsApi.update(editing.billingId, payload);
        setMessage("Billing updated successfully.");
      } else {
        await billingsApi.create(payload);
        setMessage("Billing created successfully.");
      }

      setBillingForm(initialBillingForm);
      setEditing((current) => ({ ...current, billingId: "" }));
      await refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validatePayment(paymentForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const payload = {
      ...paymentForm,
      hospitalId: activeHospitalId,
      amount: Number(paymentForm.amount)
    };

    try {
      if (editing.paymentId) {
        await paymentsApi.update(editing.paymentId, payload);
        setMessage("Payment updated successfully.");
      } else {
        await paymentsApi.create(payload);
        setMessage("Payment recorded successfully.");
      }

      setPaymentForm(initialPaymentForm);
      setEditing((current) => ({ ...current, paymentId: "" }));
      await refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    setError("");
    setMessage("");

    try {
      if (type === "billing") {
        await billingsApi.remove(id);
      }
      if (type === "payment") {
        await paymentsApi.remove(id);
      }
      setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully.`);
      await refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    }
  };

  if (!activeHospitalId) {
    return (
      <EmptyState
        title="Choose an active hospital"
        description="Billing and payment operations are hospital-scoped."
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Workflow 09-10"
        title="Billing and payments"
        description="Move from admission-linked billing to payment completion without changing the backend contract."
      />

      <div className="stats-grid">
        <StatCard label="Billing Records" value={billings.length} hint="Hospital-wide finance entries." />
        <StatCard label="Paid Bills" value={paidBillCount} hint="Bills marked paid so far." />
        <StatCard label="Completed Payments" value={completedPaymentCount} hint="Successful payment records." />
        <StatCard label="Revenue" value={formatCurrency(totalRevenue)} hint="Sum of completed payment amounts." />
      </div>

      {error ? <div className="inline-banner error">{error}</div> : null}
      {message ? <div className="inline-banner success">{message}</div> : null}

      <div className="three-column-grid">
        <TableCard title="Billing form" description={loading ? "Refreshing..." : `${billings.length} billing records`}>
          <form className="entity-form" onSubmit={handleBillingSubmit}>
            <Field
              label="Patient"
              name="patientId"
              value={billingForm.patientId}
              onChange={(event) => setBillingForm((current) => ({ ...current, patientId: event.target.value }))}
              options={patients.map((item) => ({ label: item.name, value: item._id }))}
              required
            />
            <Field
              label="Admission"
              name="admissionId"
              value={billingForm.admissionId}
              onChange={(event) => setBillingForm((current) => ({ ...current, admissionId: event.target.value }))}
              options={admissions.map((item) => ({
                label: `${item.patientId?.name || "Patient"} - ${item.status}`,
                value: item._id
              }))}
              required
            />
            <Field
              label="Base Amount"
              name="amount"
              type="number"
              min="0"
              value={billingForm.amount}
              onChange={(event) => setBillingForm((current) => ({ ...current, amount: event.target.value }))}
              required
            />
            <Field
              label="Medical Cost"
              name="medicalCost"
              type="number"
              min="0"
              value={billingForm.medicalCost}
              onChange={(event) => setBillingForm((current) => ({ ...current, medicalCost: event.target.value }))}
            />
            <Field
              label="Status"
              name="status"
              value={billingForm.status}
              onChange={(event) => setBillingForm((current) => ({ ...current, status: event.target.value }))}
              options={BILLING_STATUSES}
            />
            <Field
              label="Description"
              name="description"
              value={billingForm.description}
              onChange={(event) => setBillingForm((current) => ({ ...current, description: event.target.value }))}
              multiline
            />
            <div className="inline-banner success">Computed bill total: {formatCurrency(billingTotal)}</div>
            {editing.billingId ? (
              canUpdateBilling ? (
                <FormActions
                  isEditing
                  onCancel={() => {
                    setBillingForm(initialBillingForm);
                    setEditing((current) => ({ ...current, billingId: "" }));
                  }}
                  submitting={submitting}
                />
              ) : null
            ) : canCreateBilling ? (
              <FormActions isEditing={false} onCancel={() => setBillingForm(initialBillingForm)} submitting={submitting} />
            ) : null}
          </form>
        </TableCard>

        <TableCard title="Payment form" description={`${payments.length} payments recorded`}>
          <form className="entity-form" onSubmit={handlePaymentSubmit}>
            <Field
              label="Billing"
              name="billingId"
              value={paymentForm.billingId}
              onChange={(event) =>
                setPaymentForm((current) => {
                  const selectedBill = billings.find((item) => item._id === event.target.value);

                  return {
                    ...current,
                    billingId: event.target.value,
                    amount: selectedBill?.amount ? String(selectedBill.amount) : current.amount,
                    transactionId: editing.paymentId ? current.transactionId : createTransactionId(current.method)
                  };
                })
              }
              options={billings.map((item) => ({
                label: `${item.patientId?.name || "Billing"} - ${formatCurrency(item.amount)}`,
                value: item._id
              }))}
              required
            />
            <Field
              label="Amount"
              name="amount"
              type="number"
              min="0"
              value={paymentForm.amount}
              onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))}
              required
            />
            <Field
              label="Method"
              name="method"
              value={paymentForm.method}
              onChange={(event) =>
                setPaymentForm((current) => ({
                  ...current,
                  method: event.target.value,
                  transactionId: editing.paymentId ? current.transactionId : createTransactionId(event.target.value)
                }))
              }
              options={PAYMENT_METHODS}
            />
            <Field
              label="Status"
              name="status"
              value={paymentForm.status}
              onChange={(event) => setPaymentForm((current) => ({ ...current, status: event.target.value }))}
              options={PAYMENT_STATUSES}
            />
            <Field
              label="Transaction ID"
              name="transactionId"
              value={paymentForm.transactionId}
              onChange={() => {}}
              disabled
            />
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setPaymentForm((current) => ({
                    ...current,
                    transactionId: createTransactionId(current.method)
                  }))
                }
              >
                Regenerate ID
              </button>
            </div>
            {editing.paymentId ? (
              canUpdatePayment ? (
                <FormActions
                  isEditing
                  onCancel={() => {
                    setPaymentForm(initialPaymentForm);
                    setEditing((current) => ({ ...current, paymentId: "" }));
                  }}
                  submitting={submitting}
                />
              ) : null
            ) : canCreatePayment ? (
              <FormActions isEditing={false} onCancel={() => setPaymentForm(initialPaymentForm)} submitting={submitting} />
            ) : null}
          </form>
        </TableCard>

        <TableCard title="Finance records" description="Current billing and payment entries for the active hospital.">
          <h3>Billings</h3>
          <DataTable
            columns={billingColumns}
            rows={billings}
            emptyText="No billing records found."
            renderActions={(row) => (
              <>
                {canUpdateBilling ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing((current) => ({ ...current, billingId: row._id }));
                      setBillingForm({
                        patientId: row.patientId?._id || "",
                        admissionId: row.admissionId?._id || "",
                        amount: row.amount || "",
                        medicalCost: "",
                        description: row.description || "",
                        status: row.status || "PENDING"
                      });
                    }}
                  >
                    Edit
                  </button>
                ) : null}
                {canDeleteBilling ? (
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete("billing", row._id)}>
                    Delete
                  </button>
                ) : null}
              </>
            )}
          />

          <h3>Payments</h3>
          <DataTable
            columns={paymentColumns}
            rows={payments}
            emptyText="No payment records found."
            renderActions={(row) => (
              <>
                {canUpdatePayment ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing((current) => ({ ...current, paymentId: row._id }));
                      setPaymentForm({
                        billingId: row.billingId?._id || row.billingId || "",
                        amount: row.amount || "",
                        method: row.method || "Cash",
                        status: row.status || "Completed",
                        transactionId: row.transactionId || createTransactionId(row.method || "Cash")
                      });
                    }}
                  >
                    Edit
                  </button>
                ) : null}
                {canDeletePayment ? (
                  <button type="button" className="btn btn-danger" onClick={() => handleDelete("payment", row._id)}>
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
