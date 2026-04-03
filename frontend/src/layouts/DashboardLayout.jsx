import { Outlet } from "react-router-dom";
import AppFooter from "../components/AppFooter.jsx";
import V0DashboardNav from "../components/V0DashboardNav.jsx";

const DashboardLayout = () => (
  <div className="min-h-screen bg-parallel-grid text-slate-900">
    <div className="report-ambient pointer-events-none fixed inset-0">
      <div className="report-ambient-orb report-ambient-orb-left" />
      <div className="report-ambient-orb report-ambient-orb-right" />
      <div className="report-stars" />
    </div>

    <V0DashboardNav />

    <main className="relative pt-28">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </main>
    <AppFooter />
  </div>
);

export default DashboardLayout;
