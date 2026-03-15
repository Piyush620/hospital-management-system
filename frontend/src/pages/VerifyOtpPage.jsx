import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { clearPendingSignup, getPendingSignup } from "../lib/storage";
import { authApi } from "../services/api";
import { getErrorMessage } from "../lib/utils";
import { validateOtp } from "../lib/validation";

export function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const signup = location.state?.signup || getPendingSignup();
  const [form, setForm] = useState({
    email: signup?.email || "",
    otp: ""
  });
  const [error, setError] = useState(signup ? "" : "Signup details were not found. Please start again from the signup page.");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  // For email OTP, resend OTP via backend
  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    try {
      setSending(true);
      await authApi.resendOtp({ email: form.email });
      setMessage(`OTP sent to ${form.email}. Enter the code to finish signup.`);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSending(false);
    }
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
      await authApi.verifyOtp({ email: form.email, otp: form.otp });
      clearPendingSignup();
      setMessage("Account verified successfully. You can now log in.");
      navigate("/login", {
        replace: true,
        state: {
          message: "Account created successfully. You can now log in."
        }
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await handleSendOtp();
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Verify OTP</h2>
      <p>You will receive an OTP on your email. After verification, your account will be created.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Email" name="email" value={form.email} onChange={handleChange} required disabled />
        <Field label="OTP" name="otp" value={form.otp} onChange={handleChange} required />

        {error ? <div className="inline-banner error">{error}</div> : null}
        {message ? <div className="inline-banner success">{message}</div> : null}

        <button type="button" className="btn" onClick={handleSendOtp} disabled={sending || !signup}>
          {sending ? "Sending..." : "Resend OTP"}
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting || !signup}>
          {submitting ? "Verifying..." : "Verify and create account"}
        </button>
      </form>

      <div className="link-row">
        <button type="button" className="link-button" onClick={handleResend} disabled={resending || !signup}>
          {resending ? "Resending..." : "Resend OTP"}
        </button>
        <Link to="/signup">Back to signup</Link>
      </div>
    </div>
  );
}
