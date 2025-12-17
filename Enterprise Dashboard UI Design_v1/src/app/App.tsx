import { Activity } from "lucide-react";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { DashboardView } from "./components/DashboardView";
import { TicketsView } from "./components/TicketsView";

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isTicketsPage = location.pathname === "/tickets";

  // Enable dark mode
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header - Only show on dashboard */}
      {!isTicketsPage && (
        <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-4">
                {/* Bank of America Logo Placeholder - Replace with actual logo */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center border border-red-500/30 shadow-lg shadow-red-500/20">
                    <span className="text-white text-lg">B<span className="text-xs align-super">of</span>A</span>
                  </div>
                  <div className="border-l border-slate-700 pl-3 h-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                        <Activity className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h1 className="text-lg tracking-tight">Incident & Ticket Intelligence Platform</h1>
                        <p className="text-xs text-slate-400">Executive Dashboard</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <span className="text-sm text-slate-300">Last updated: Just now</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </header>
      )}

      {children}

      {/* Footer - Only show on dashboard */}
      {!isTicketsPage && (
        <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl mt-16">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <div>© 2025 Bank of America - Incident & Ticket Intelligence Platform</div>
              <div className="flex items-center gap-6">
                <span>Powered by AI/ML Analytics</span>
                <span>Enterprise Edition</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/tickets" element={<TicketsView />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}