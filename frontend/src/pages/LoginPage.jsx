import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Field } from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../lib/utils";
import { validateLogin } from "../lib/validation";

const initialForm = {
  email: "",
  password: ""
};

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const successMessage = location.state?.message || "";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validateLogin(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Welcome back</h2>
      <p>Log in with your verified account to continue into the hospital workflow.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field label="Email" name="email" value={form.email} onChange={handleChange} required />
        <Field
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error ? <div className="inline-banner error">{error}</div> : null}
        {successMessage ? <div className="inline-banner success">{successMessage}</div> : null}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="link-row">
        <span>Need an account?</span>
        <Link to="/signup">Create one</Link>
      </div>
    </div>
  );
}
