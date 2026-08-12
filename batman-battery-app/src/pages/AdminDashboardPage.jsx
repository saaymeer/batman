import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useRequestsList } from '@/hooks/useRequestsList';
import { startOfToday, formatDuration, durationMinutes } from '@/utils/formatTime';
import { isDemoMode, demoResetData } from '@/utils/demo';
import { subscribeToLogs, clearLogs } from '@/utils/logger';
import DispatchMap from '@/components/admin/DispatchMap';
import RequestList from '@/components/admin/RequestList';
import RequestDetailPanel from '@/components/admin/RequestDetailPanel';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  LogOut, Zap, Map, List, Clock, CheckCircle2, BarChart3, History, FlaskConical, RotateCcw, Activity, Terminal, X, Trash2
} from 'lucide-react';

const TABS = [
  { key: 'active', label: 'Active', icon: List },
  { key: 'history', label: 'History', icon: History },
];

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { requests, loading } = useRequestsList();
  const demo = isDemoMode();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [mobileView, setMobileView] = useState('map'); // 'map' | 'list'
  const [tab, setTab] = useState('active');

  const [logsOpen, setLogsOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    return subscribeToLogs((updatedLogs) => setLogs(updatedLogs));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  // Split active vs history
  const activeRequests = useMemo(
    () => requests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled'),
    [requests]
  );
  const historyRequests = useMemo(
    () => requests.filter((r) => r.status === 'completed' || r.status === 'cancelled'),
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

  // Sync selected request with live updates
  const liveSelected = selectedRequest
    ? requests.find((r) => r.id === selectedRequest.id) ?? selectedRequest
    : null;

  const handleSelectRequest = (req) => {
    setSelectedRequest(req);
    setMobileView('list');
  };

  return (
    <div className="h-dvh bg-ink flex flex-col overflow-hidden">
      {/* Top nav */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface border-b border-white/8 flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-signal flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_3px_rgba(245,166,35,0.3)]">
            <Zap className="h-4 w-4 text-ink fill-ink" />
          </div>
          <div className="hidden sm:block">
            <p className="text-mist font-bold font-display text-sm leading-tight">
              Batman Battery <span className="text-signal">24/7</span>
            </p>
            <p className="text-fog text-[10px]">Dispatch Dashboard</p>
          </div>
        </div>

        {/* Demo badge */}
        {demo && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-signal/10 border border-signal/25 text-signal text-[11px] font-semibold font-display">
            <FlaskConical className="h-3 w-3" />
            Demo
            <button
              onClick={() => { demoResetData(); setSelectedRequest(null); }}
              className="ml-1 text-fog hover:text-signal transition-colors"
              title="Reset demo data"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Stats row (desktop) */}
        <div className="hidden md:flex items-center gap-6 text-xs text-fog font-display">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-signal" />
            <span className="text-mist font-semibold">{todayRequests.length}</span> today
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-go" />
            avg {avgCompletion !== null ? formatDuration(avgCompletion) : '—'}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-go" />
            <span className="text-mist font-semibold">{activeRequests.length}</span> active
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Telemetry drawer trigger button */}
          <button
            onClick={() => setLogsOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-white/10 text-fog hover:text-signal hover:border-signal/30 text-xs font-display transition-all"
            title="Open System Telemetry Logs"
          >
            <Activity className="h-3.5 w-3.5 text-signal" />
            <span className="hidden sm:inline font-mono">Telemetry</span>
            <span className="px-1.5 py-0.2 rounded bg-signal/20 text-signal font-mono text-[10px]">
              {logs.length}
            </span>
          </button>

          {/* Mobile map/list toggle */}
          <div className="flex sm:hidden gap-1 bg-ink rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setMobileView('map')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-display transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal ${
                mobileView === 'map' ? 'bg-signal text-ink' : 'text-fog hover:text-mist'
              }`}
            >
              <Map className="h-3.5 w-3.5" /> Map
            </button>
            <button
              onClick={() => setMobileView('list')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-display transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal ${
                mobileView === 'list' ? 'bg-signal text-ink' : 'text-fog hover:text-mist'
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-fog hover:text-mist hover:bg-white/5 text-xs font-display transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── DESKTOP: map + sidebar ─────────────────────── */}
        <div className="hidden sm:flex flex-1 overflow-hidden">
          {/* Map area */}
          <div className="flex-1 relative">
            <DispatchMap
              requests={activeRequests}
              onSelectRequest={handleSelectRequest}
              selectedId={liveSelected?.id}
            />
          </div>

          {/* Sidebar */}
          <aside className="w-80 xl:w-96 flex flex-col border-l border-white/8 overflow-hidden bg-surface">
            {/* Tab bar */}
            <div className="flex border-b border-white/8 flex-shrink-0">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => { setTab(key); setSelectedRequest(null); }}
                  className={[
                    'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-display font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-inset',
                    tab === key
                      ? 'text-signal border-b-2 border-signal bg-signal/5'
                      : 'text-fog hover:text-mist border-b-2 border-transparent',
                  ].join(' ')}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {key === 'active' && activeRequests.length > 0 && (
                    <span className="bg-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                      {activeRequests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Detail panel or list */}
            {liveSelected && !['completed', 'cancelled'].includes(liveSelected.status) ? (
              <div className="flex-1 overflow-hidden">
                <RequestDetailPanel
                  request={liveSelected}
                  onClose={() => setSelectedRequest(null)}
                />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <RequestList
                  requests={tab === 'active' ? activeRequests : historyRequests}
                  loading={loading}
                  selectedId={liveSelected?.id}
                  onSelect={handleSelectRequest}
                />
              </div>
            )}
          </aside>
        </div>

        {/* ── MOBILE VIEW ───────────────────────── */}
        <div className="flex sm:hidden flex-1 flex-col overflow-hidden">
          {mobileView === 'map' ? (
            <div className="flex-1 relative">
              <DispatchMap
                requests={activeRequests}
                onSelectRequest={handleSelectRequest}
                selectedId={liveSelected?.id}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-surface">
              <div className="flex border-b border-white/8 flex-shrink-0">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => { setTab(key); setSelectedRequest(null); }}
                    className={[
                      'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-display font-medium transition-all',
                      tab === key
                        ? 'text-signal border-b-2 border-signal bg-signal/5'
                        : 'text-fog border-b-2 border-transparent',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {key === 'active' && activeRequests.length > 0 && (
                      <span className="bg-alert text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {activeRequests.length}
                      </span>
                    )}
                  </button>
                ))}
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
                    requests={tab === 'active' ? activeRequests : historyRequests}
                    loading={loading}
                    selectedId={liveSelected?.id}
                    onSelect={handleSelectRequest}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SYSTEM TELEMETRY LOGS DRAWER ──────────────── */}
        {logsOpen && (
          <aside className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-surface/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-50 flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-ink/50">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-signal" />
                <h3 className="font-mono text-sm font-bold text-mist">System Telemetry</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => clearLogs()}
                  className="p-1 rounded text-fog hover:text-alert hover:bg-white/5 transition-colors"
                  title="Clear telemetry logs"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLogsOpen(false)}
                  className="p-1 rounded text-fog hover:text-mist hover:bg-white/5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] flex flex-col gap-2">
              {logs.length === 0 ? (
                <p className="text-fog text-center py-8">No telemetry logs recorded yet.</p>
              ) : (
                logs.slice().reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-2.5 rounded border text-left flex flex-col gap-1 ${
                      entry.level === 'error'
                        ? 'bg-alert/10 border-alert/30 text-alert'
                        : entry.level === 'warn'
                        ? 'bg-signal/10 border-signal/30 text-signal'
                        : entry.level === 'success'
                        ? 'bg-go/10 border-go/30 text-go'
                        : 'bg-white/5 border-white/10 text-mist'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] opacity-75">
                      <span>[{entry.traceId}]</span>
                      <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="font-semibold leading-tight">{entry.message}</p>
                    {entry.meta && Object.keys(entry.meta).length > 0 && (
                      <pre className="text-[10px] opacity-75 overflow-x-auto bg-black/30 p-1 rounded">
                        {JSON.stringify(entry.meta, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
