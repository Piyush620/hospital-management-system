import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ROLE_LABELS, ROLES } from "../lib/constants";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.STAFF]
  },
  { to: "/hospitals", label: "Hospitals", roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
  { to: "/departments", label: "Departments", roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
  { to: "/doctors", label: "Doctors", roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
  { to: "/patients", label: "Patients", roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.STAFF] },
  {
    to: "/appointments",
    label: "Appointments",
    roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR, ROLES.STAFF]
  },
  { to: "/infrastructure", label: "Wards / Rooms / Beds", roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN] },
  { to: "/admissions", label: "Admissions", roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR] },
  {
    to: "/finance",
    label: "Billing / Payments",
    roles: [ROLES.SUPER_ADMIN, ROLES.HOSPITAL_ADMIN, ROLES.STAFF]
  },
  { to: "/audit-logs", label: "Audit Logs", roles: [ROLES.SUPER_ADMIN] }
];

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, hospitals, activeHospitalId, setActiveHospitalId, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const activeLabel = navItems.find((item) => location.pathname.startsWith(item.to))?.label || "Workspace";
  const needsHospitalContext = user.role !== ROLES.SUPER_ADMIN;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">PulseOps</span>
          <h2>Hospital Command Center</h2>
          <p>Production-minded frontend for the existing backend workflow.</p>
          <div className="brand-art" aria-hidden="true">
            <span className="brand-orb brand-orb-one" />
            <span className="brand-orb brand-orb-two" />
            <span className="brand-line brand-line-one" />
            <span className="brand-line brand-line-two" />
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div>
            <span className="eyebrow">Current View</span>
            <strong>{activeLabel}</strong>
          </div>

          <div className="topbar-actions">
            <button type="button" className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? "Light mode" : "Dark mode"}
            </button>
            <label className="hospital-picker">
              <span>Hospital</span>
              <select
                value={activeHospitalId}
                onChange={(event) => setActiveHospitalId(event.target.value)}
                disabled={hospitals.length === 0}
              >
                <option value="">Select hospital</option>
                {hospitals.map((hospital) => (
                  <option key={hospital._id} value={hospital._id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="user-chip">
              <div>
                <strong>{user.name}</strong>
                <span>{ROLE_LABELS[user.role] || user.role}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="content-area">
          {needsHospitalContext && hospitals.length > 0 && !activeHospitalId ? (
            <div className="inline-banner error">
              Select an active hospital from the top bar to use hospital-scoped workflows.
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
