import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { ROLES } from "../lib/constants";
import { setPendingSignup } from "../lib/storage";
import { validateSignup } from "../lib/validation";
import { authApi } from "../services/api";

const initialForm = {
  name: "",
  email: "",
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

    try {
      setSubmitting(true);
      await authApi.signup(form);
      setPendingSignup(form);
      setMessage("Check your email for the OTP to verify your account.");
      navigate("/verify-otp", { state: { signup: form } });
    } catch (submitError) {
      setError(submitError?.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      <p>Enter your details. You will receive an OTP on your email to verify your account.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Full Name" name="name" value={form.name} onChange={handleChange} required />
        <Field label="Email" name="email" value={form.email} onChange={handleChange} required />
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
        <span>Already have an account?</span>
        <Link to="/login">Return to login</Link>
      </div>
    </div>
  );
}
