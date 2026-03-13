import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { ROLES } from "../lib/constants";
import { authApi } from "../services/api";
import { getErrorMessage } from "../lib/utils";
import { validateSignup } from "../lib/validation";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: ROLES.STAFF
};

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateSignup(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await authApi.signup(form);
      setMessage("Account created. Use the OTP sent to your phone to verify.");
      navigate("/verify-otp", { state: { email: form.email, phone: form.phone } });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <p>Start with signup, then verify the SMS OTP before logging in with your email.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Full Name" name="name" value={form.name} onChange={handleChange} required />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} required />
        <Field
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+919876543210"
          required
        />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Field
          label="Role"
          name="role"
          value={form.role}
          onChange={handleChange}
          options={Object.values(ROLES)}
        />

        {error ? <div className="inline-banner error">{error}</div> : null}
        {message ? <div className="inline-banner success">{message}</div> : null}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <div className="link-row">
        <span>Already verified?</span>
        <Link to="/login">Return to login</Link>
      </div>
    </div>
  );
}
