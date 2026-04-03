import { Outlet } from "react-router-dom";
import AppFooter from "../components/AppFooter.jsx";
import V0DashboardNav from "../components/V0DashboardNav.jsx";

const DashboardLayout = () => (
  <div className="min-h-screen bg-parallel-grid text-slate-900">
    <div className="report-ambient pointer-events-none fixed inset-0">
      <div className="report-ambient-orb report-ambient-orb-left" />
      <div className="report-ambient-orb report-ambient-orb-right" />
    </div>

    <V0DashboardNav />

    <main className="relative px-4 pt-24 md:px-8 md:pt-8" data-ambient-scene="Workspace Overview" data-ambient-intensity="0.24" data-ambient-rate="1.01">
      <div className="mx-auto max-w-[1380px] py-6 md:py-8">
        <Outlet />
      </div>
    </main>
    <div className="px-4 pb-6 md:px-8">
      <AppFooter />
    </div>
  </div>
);

export default DashboardLayout;
