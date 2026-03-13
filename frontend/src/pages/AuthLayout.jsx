import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <div className="auth-visual" aria-hidden="true">
          <div className="auth-visual-card auth-visual-primary">
            <span className="visual-plus" />
          </div>
          <div className="auth-visual-card auth-visual-secondary">
            <span className="visual-heart" />
          </div>
          <div className="auth-visual-card auth-visual-tertiary">
            <span className="visual-wave" />
          </div>
        </div>
        <span className="eyebrow">Hospital Management System</span>
        <h1>One frontend for the full operational workflow.</h1>
        <p>
          Signup, verify OTP, then move through hospitals, departments, doctors, patients,
          appointments, admissions, billing, payments, and audit visibility from one clean UI.
        </p>
      </section>
      <section className="auth-panel">
        <Outlet />
      </section>
    </div>
  );
}
