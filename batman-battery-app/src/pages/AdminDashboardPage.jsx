import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRequestsList } from '@/hooks/useRequestsList';
import { startOfToday, formatDuration, durationMinutes, formatDate } from '@/utils/formatTime';
import { isDemoMode, demoResetData } from '@/utils/demo';
import { subscribeToLogs, clearLogs } from '@/utils/logger';
import DispatchMap from '@/components/admin/DispatchMap';
import RequestList from '@/components/admin/RequestList';
import RequestDetailPanel from '@/components/admin/RequestDetailPanel';
import CreateMechanicModal from '@/components/admin/CreateMechanicModal';
import EditMechanicModal from '@/components/admin/EditMechanicModal';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  LogOut, Zap, Map, List, Clock, CheckCircle2, BarChart3, History, FlaskConical, RotateCcw, Activity, Terminal, X, Trash2, UserPlus, Users, LayoutDashboard, Shield, ChevronRight
} from 'lucide-react';
import { TECHNICIANS_DATA } from '@/utils/statusConfig';

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { requests, loading } = useRequestsList();
  const demo = isDemoMode();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'history' | 'mechanics'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [mechanicList, setMechanicList] = useState(TECHNICIANS_DATA);
  const [editingMechanic, setEditingMechanic] = useState(null);

  const handleCreateMechanic = (newMech) => {
    setMechanicList((prev) => [newMech, ...prev]);
  };

  const handleSaveMechanic = (updatedTech) => {
    setMechanicList((prev) =>
      prev.map((t) => (t.name === updatedTech.name ? updatedTech : t))
    );
    setEditingMechanic(null);
  };

  const handleDeleteMechanic = (techName) => {
    if (confirm(`Are you sure you want to delete mechanic ${techName}?`)) {
      setMechanicList((prev) => prev.filter((t) => t.name !== techName));
    }
  };

  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    return subscribeToLogs((updatedLogs) => setLogs(updatedLogs));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  // Active requests (pending / assigned / en_route / arrived)
  const activeRequests = useMemo(
    () => requests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled'),
    [requests]
  );

  // Succeeded customer transactions history
  const succeededHistory = useMemo(
    () => requests.filter((r) => r.status === 'completed'),
    [requests]
  );

  // Stats
  const todayRequests = useMemo(() => {
    const start = startOfToday();
    return requests.filter((r) => {
      const created = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
      return created >= start;
    });
  }, [requests]);

  const avgCompletion = useMemo(() => {
    const completed = requests.filter(
      (r) => r.status === 'completed' && r.createdAt && r.completedAt
    );
    if (completed.length === 0) return null;
    const total = completed.reduce(
      (sum, r) => sum + (durationMinutes(r.createdAt, r.completedAt) ?? 0),
      0
    );
    return Math.round(total / completed.length);
  }, [requests]);

  const liveSelected = selectedRequest
    ? requests.find((r) => r.id === selectedRequest.id) ?? selectedRequest
    : null;

  return (
    <div className="min-h-screen md:h-dvh bg-ink flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden">
      {/* ── ADMIN SIDEBAR / MOBILE NAV ── */}
      <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-white/8 flex flex-col flex-shrink-0 z-20">
        {/* Brand */}
        <div className="p-4 md:p-5 border-b border-white/8 flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-signal flex items-center justify-center shadow-[0_0_16px_4px_rgba(245,166,35,0.35)]">
              <Zap className="h-5 w-5 text-ink fill-ink" />
            </div>
            <div>
              <h1 className="font-bold font-display text-mist text-base leading-tight">
                Batman Battery <span className="text-signal">24/7</span>
              </h1>
              <p className="text-fog text-xs">Admin Control Center</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-alert text-xs font-display"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-1.5 overflow-y-auto">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedRequest(null); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-display text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-signal text-ink shadow-[0_0_16px_rgba(245,166,35,0.3)]'
                : 'text-fog hover:text-mist hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4" />
              Live Radar & Jobs
            </span>
            {activeRequests.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'dashboard' ? 'bg-ink text-signal' : 'bg-signal/20 text-signal'
              }`}>
                {activeRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('history'); setSelectedRequest(null); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-display text-sm font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-signal text-ink shadow-[0_0_16px_rgba(245,166,35,0.3)]'
                : 'text-fog hover:text-mist hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-3">
              <History className="h-4 w-4" />
              Succeeded History
            </span>
            <span className="text-xs font-mono font-bold text-go bg-go/10 px-2 py-0.5 rounded-full">
              {succeededHistory.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('mechanics'); setSelectedRequest(null); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-display text-sm font-semibold transition-all ${
              activeTab === 'mechanics'
                ? 'bg-signal text-ink shadow-[0_0_16px_rgba(245,166,35,0.3)]'
                : 'text-fog hover:text-mist hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-3">
              <Users className="h-4 w-4" />
              Manage Mechanics
            </span>
          </button>

          <div className="mt-4 pt-4 border-t border-white/8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-go/15 border border-go/30 text-go font-display font-bold text-xs hover:bg-go/20 transition-all shadow-md"
            >
              <UserPlus className="h-4 w-4" />
              Create Mechanic Account
            </button>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/8 bg-ink/40 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-fog">
            <Shield className="h-4 w-4 text-go" />
            <span className="truncate">{user?.email || 'admin@batmanbattery.ph'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-fog hover:text-mist hover:bg-white/10 text-xs font-display transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 text-alert" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Stats Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3.5 bg-surface border-b border-white/8 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs font-display">
            <span className="flex items-center gap-1.5 text-fog">
              <BarChart3 className="h-4 w-4 text-signal" />
              Today: <strong className="text-mist">{todayRequests.length}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-fog">
              <Clock className="h-4 w-4 text-go" />
              Avg: <strong className="text-mist">{avgCompletion !== null ? formatDuration(avgCompletion) : '—'}</strong>
            </span>
            <span className="flex items-center gap-1.5 text-fog">
              <CheckCircle2 className="h-4 w-4 text-go" />
              Succeeded: <strong className="text-go">{succeededHistory.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLogsOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink border border-white/10 text-fog hover:text-signal text-xs font-display transition-all"
            >
              <Activity className="h-3.5 w-3.5 text-signal" />
              <span>Logs ({logs.length})</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden relative">
          {/* TAB 1: DASHBOARD (MAP + LIVE ACTIVE LIST) */}
          {activeTab === 'dashboard' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-[500px]">
              <div className="flex-1 h-[350px] md:h-full relative">
                <DispatchMap
                  requests={activeRequests}
                  onSelectRequest={(r) => setSelectedRequest(r)}
                  selectedId={liveSelected?.id}
                />
              </div>

              <aside className="w-80 xl:w-96 flex flex-col border-l border-white/8 overflow-hidden bg-surface">
                <div className="p-4 border-b border-white/8 flex items-center justify-between">
                  <h2 className="font-display font-bold text-mist text-sm uppercase tracking-wider flex items-center gap-2">
                    <List className="h-4 w-4 text-signal" />
                    Auto-Dispatched Jobs ({activeRequests.length})
                  </h2>
                </div>

                {liveSelected ? (
                  <div className="flex-1 overflow-hidden">
                    <RequestDetailPanel
                      request={liveSelected}
                      onClose={() => setSelectedRequest(null)}
                    />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <RequestList
                      requests={activeRequests}
                      loading={loading}
                      selectedId={liveSelected?.id}
                      onSelect={(r) => setSelectedRequest(r)}
                    />
                  </div>
                )}
              </aside>
            </div>
          )}

          {/* TAB 2: SUCCEEDED CUSTOMER TRANSACTIONS HISTORY */}
          {activeTab === 'history' && (
            <div className="flex-1 p-6 overflow-y-auto bg-ink/40">
              <div className="max-w-4xl mx-auto flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-mist text-xl flex items-center gap-2">
                      <CheckCircle2 className="h-6 w-6 text-go" />
                      Succeeded Customer Transactions History
                    </h2>
                    <p className="text-fog text-xs mt-1">
                      Complete audit trail of all successfully completed battery jumpstarts and replacements
                    </p>
                  </div>
                  <span className="bg-go/15 border border-go/30 text-go font-bold font-display px-4 py-1.5 rounded-full text-xs">
                    {succeededHistory.length} Total Completed
                  </span>
                </div>

                {succeededHistory.length === 0 ? (
                  <div className="bg-surface rounded-2xl p-12 text-center border border-white/8 flex flex-col items-center gap-3">
                    <CheckCircle2 className="h-12 w-12 text-fog/30" />
                    <p className="text-fog text-sm font-display">No completed customer transactions recorded yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {succeededHistory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-surface border border-white/8 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:border-go/30 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-go/15 border border-go/30 flex items-center justify-center text-go">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-bold text-mist text-base">{item.customerName}</h3>
                              <span className="text-xs font-mono text-fog bg-ink/50 px-2 py-0.5 rounded">
                                {item.customerPhone}
                              </span>
                            </div>
                            <p className="text-fog text-xs mt-0.5">
                              {item.vehicle?.make} {item.vehicle?.model} • <strong className="text-mist uppercase">{item.issueType}</strong>
                            </p>
                            {item.addressText && (
                              <p className="text-fog/70 text-xs mt-1">📍 {item.addressText}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-go font-bold font-display text-sm bg-go/10 border border-go/20 px-3 py-1 rounded-full">
                            Technician: {item.assignedTechnician || 'Auto-Assigned'}
                          </span>
                          <span className="text-fog text-xs font-mono mt-1">
                            Completed: {formatDate(item.completedAt ?? item.updatedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE MECHANICS */}
          {activeTab === 'mechanics' && (
            <div className="flex-1 p-6 overflow-y-auto bg-ink/40">
              <div className="max-w-4xl mx-auto flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-mist text-xl flex items-center gap-2">
                      <Users className="h-6 w-6 text-signal" />
                      Manage Active Mechanics
                    </h2>
                    <p className="text-fog text-xs mt-1">Registered station hubs across Metro Cebu and Cebu Province</p>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-go text-ink font-bold font-display text-xs hover:bg-go/90 transition-all shadow-md"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add New Mechanic
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {mechanicList.map((t) => (
                    <div
                      key={t.name}
                      className="bg-surface border border-white/8 rounded-2xl p-5 shadow-lg flex flex-col gap-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-signal/15 border border-signal/30 flex items-center justify-center text-signal font-bold font-display text-base">
                            🧑‍🔧
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-mist text-base">{t.name}</h3>
                            <p className="text-go text-xs font-semibold">{t.stationName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingMechanic(t)}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-fog hover:text-signal hover:bg-white/10 text-xs transition-colors"
                            title="Edit mechanic details"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMechanic(t.name)}
                            className="p-2 rounded-lg bg-alert/10 border border-alert/20 text-alert hover:bg-alert/20 text-xs transition-colors"
                            title="Delete mechanic profile"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      <div className="bg-ink/50 rounded-xl p-3 text-xs text-fog flex flex-col gap-1 border border-white/5 font-mono">
                        <p>Town: <strong className="text-mist">{t.town}</strong></p>
                        <p>Phone: <strong className="text-mist">{t.phone}</strong></p>
                        <p>Location: {t.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TELEMETRY DRAWER */}
          {logsOpen && (
            <aside className="absolute right-0 top-0 bottom-0 w-96 bg-surface/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-ink/50">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-signal" />
                  <h3 className="font-mono text-sm font-bold text-mist">System Telemetry</h3>
                </div>
                <button onClick={() => setLogsOpen(false)} className="text-fog hover:text-mist">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] flex flex-col gap-2">
                {logs.slice().reverse().map((entry) => (
                  <div key={entry.id} className="p-2.5 rounded bg-white/5 border border-white/10 text-mist">
                    <p className="font-semibold">{entry.message}</p>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* CREATE & EDIT MECHANIC MODALS */}
      <CreateMechanicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateMechanic={handleCreateMechanic}
      />
      <EditMechanicModal
        isOpen={!!editingMechanic}
        mechanic={editingMechanic}
        onClose={() => setEditingMechanic(null)}
        onSave={handleSaveMechanic}
      />
    </div>
  );
}
