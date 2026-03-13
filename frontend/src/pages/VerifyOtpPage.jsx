import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Field } from "../components/Field";
import { authApi } from "../services/api";
import { getErrorMessage } from "../lib/utils";
import { validateEmailOnly, validateOtp } from "../lib/validation";

export function VerifyOtpPage() {
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: ""
  });
  const phone = location.state?.phone || "";
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateOtp(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await authApi.verifyOtp(form);
      setMessage("Phone verified. You can log in now with email and password.");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    const validationError = validateEmailOnly(form.email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setResending(true);

    try {
      await authApi.resendOtp({ email: form.email });
      setMessage("OTP resent to your phone successfully.");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Verify OTP</h2>
      <p>Finish account activation with the OTP sent to your phone before attempting login.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Email" name="email" value={form.email} onChange={handleChange} required />
        {phone ? <div className="inline-banner success">OTP destination: {phone}</div> : null}
        <Field label="OTP" name="otp" value={form.otp} onChange={handleChange} required />

        {error ? <div className="inline-banner error">{error}</div> : null}
        {message ? <div className="inline-banner success">{message}</div> : null}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Verifying..." : "Verify"}
        </button>
      </form>

      <div className="link-row">
        <button type="button" className="link-button" onClick={handleResend} disabled={resending}>
          {resending ? "Resending..." : "Resend OTP"}
        </button>
        <Link to="/login">Back to login</Link>
      </div>
    </div>
  );
}
