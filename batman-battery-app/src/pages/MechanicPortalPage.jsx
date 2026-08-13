import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequestsList } from '@/hooks/useRequestsList';
import { TECHNICIANS_DATA, getTechnicianInfo, STATUS_CONFIG } from '@/utils/statusConfig';
import { updateRequestStatus, updateTechnicianLocation } from '@/services/requestService';
import { useAuth } from '@/context/AuthContext';
import { findNearestTechnician } from '@/utils/geoUtils';
import { requestNotificationPermission, triggerMechanicPushNotification } from '@/services/notificationService';
import { Zap, Wrench, MapPin, Phone, User, Navigation, CheckCircle2, ChevronRight, AlertCircle, Building2, Radio, Bell, BellOff, LogOut } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function MechanicPortalPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { requests, loading } = useRequestsList();

  // Primary mechanic name from logged-in session user object
  const loggedInMechanicName = user?.displayName
    ? user.displayName.split('(')[0].trim()
    : (user?.name || localStorage.getItem('batman_selected_mechanic') || 'Boyet R.');

  const [selectedTech, setSelectedTech] = useState(loggedInMechanicName);

  useEffect(() => {
    if (loggedInMechanicName) {
      setSelectedTech(loggedInMechanicName);
    }
  }, [loggedInMechanicName]);

  const [isOnline, setIsOnline] = useState(
    localStorage.getItem(`batman_tech_status_${selectedTech}`) !== 'offline'
  );
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const prevJobsCountRef = useRef(0);

  const handleLogout = async () => {
    await logout();
    navigate('/mechanic/login', { replace: true });
  };

  const toggleOnlineStatus = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    localStorage.setItem(`batman_tech_status_${selectedTech}`, nextState ? 'online' : 'offline');
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      triggerMechanicPushNotification('🚨 Batman Battery Alerts Active', {
        body: `Push notifications enabled for ${selectedTech}! You will receive sound and pop-up alerts for nearby emergency requests.`,
      });
    }
  };

  const handleSelectTech = (techName) => {
    setSelectedTech(techName);
    localStorage.setItem('batman_selected_mechanic', techName);
    prevJobsCountRef.current = 0;
  };

  const techInfo = getTechnicianInfo(selectedTech);

  // Filter requests assigned to this mechanic
  const myAssignedJobs = requests.filter(
    (r) => r.assignedTechnician?.toLowerCase().trim() === selectedTech.toLowerCase().trim()
  );

  const activeJobs = myAssignedJobs.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
  const completedJobs = myAssignedJobs.filter((r) => r.status === 'completed');

  // Trigger Push Notification when a NEW job is auto-assigned to this mechanic
  useEffect(() => {
    if (loading) return;

    if (activeJobs.length > prevJobsCountRef.current && prevJobsCountRef.current !== 0) {
      const newestJob = activeJobs[0];
      const customer = newestJob?.customerName || 'Customer';
      const vehicle = `${newestJob?.vehicle?.make ?? ''} ${newestJob?.vehicle?.model ?? ''}`;
      const location = newestJob?.addressText ? `at ${newestJob.addressText}` : 'stranded nearby';

      triggerMechanicPushNotification(`⚡ NEW JOB AUTO-ASSIGNED: ${customer}`, {
        body: `${vehicle} ${location}. Tap to open map navigation!`,
      });
    }

    prevJobsCountRef.current = activeJobs.length;
  }, [activeJobs.length, loading]);

  const [stationMenuOpen, setStationMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Top Bar Header with Notifications Action */}
      <header className="px-4 py-3.5 border-b border-white/8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-signal flex items-center justify-center shadow-[0_0_16px_4px_rgba(245,166,35,0.3)] flex-shrink-0">
            <Wrench className="h-4.5 w-4.5 text-ink" />
          </div>
          <div>
            <h1 className="font-bold font-display text-mist text-sm md:text-base leading-tight">
              Mechanic Dispatch <span className="text-signal">Portal</span>
            </h1>
            <p className="text-fog text-[11px]">Batman Battery 24/7 Cebu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!notifGranted ? (
            <button
              onClick={handleEnableNotifications}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-alert/15 border border-alert/30 text-alert font-display font-semibold text-xs hover:bg-alert/25 transition-colors"
            >
              <BellOff className="h-3.5 w-3.5" />
              <span>Enable Alerts</span>
            </button>
          ) : (
            <span className="flex items-center gap-1 text-go font-display font-semibold text-xs bg-go/10 border border-go/20 px-2.5 py-1 rounded-xl">
              <Bell className="h-3.5 w-3.5" />
              <span>Alerts Active</span>
            </span>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-fog hover:text-mist hover:bg-white/10 font-display font-semibold text-xs transition-colors"
            title="Log out of Mechanic Portal"
          >
            <LogOut className="h-3.5 w-3.5 text-alert" />
            <span className="hidden xs:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 sm:px-4 py-4 max-w-2xl mx-auto w-full flex flex-col gap-4">
        {/* Rider Status & Dispatch Radar Header */}
        <div className={`bg-surface border rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 transition-all ${isOnline ? 'border-signal/30' : 'border-white/10 opacity-75'}`}>
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div className={`h-11 w-11 rounded-full border flex items-center justify-center transition-colors ${isOnline ? 'bg-go/15 border-go/40' : 'bg-fog/10 border-white/10'}`}>
                <Radio className={`h-5 w-5 ${isOnline ? 'text-go animate-pulse' : 'text-fog'}`} />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink ${isOnline ? 'bg-go' : 'bg-fog'}`} />
            </div>
            <div className="min-w-0 flex-1 relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold font-display text-mist text-base truncate">{selectedTech}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-md ${isOnline ? 'bg-go/20 text-go border-go/30' : 'bg-fog/20 text-fog border-fog/30'}`}>
                  {isOnline ? 'Online & Ready' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="h-3.5 w-3.5 text-signal flex-shrink-0" />
                <button
                  type="button"
                  onClick={() => setStationMenuOpen(!stationMenuOpen)}
                  className="bg-ink/80 border border-white/10 hover:border-signal/50 rounded-lg text-xs font-display font-semibold text-signal px-2.5 py-1 flex items-center justify-between gap-1.5 outline-none focus:border-signal transition-colors text-left max-w-[210px] sm:max-w-xs"
                >
                  <span className="truncate">📍 {techInfo?.stationName || selectedTech}</span>
                  <ChevronRight className={`h-3 w-3 text-signal flex-shrink-0 transition-transform ${stationMenuOpen ? 'rotate-90' : ''}`} />
                </button>

                {/* Custom Compact Station Dropdown Menu */}
                {stationMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 max-w-[85vw] bg-surface border border-white/15 rounded-xl shadow-2xl z-50 p-1.5 flex flex-col gap-1 max-h-60 overflow-y-auto animate-fade-in">
                    <p className="text-[10px] font-display uppercase tracking-wider text-fog px-2.5 py-1 font-semibold border-b border-white/5">
                      Select Active Base Hub
                    </p>
                    {TECHNICIANS_DATA.map((t) => (
                      <button
                        key={t.name}
                        type="button"
                        onClick={() => {
                          handleSelectTech(t.name);
                          setStationMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-display flex items-start gap-2 transition-colors ${
                          selectedTech === t.name
                            ? 'bg-signal/20 text-signal font-bold border border-signal/30'
                            : 'text-mist hover:bg-white/5'
                        }`}
                      >
                        <MapPin className="h-3.5 w-3.5 text-signal flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="leading-tight font-bold">{t.stationName}</p>
                          <p className="text-[10px] text-fog font-mono mt-0.5">{t.town}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={toggleOnlineStatus}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-display font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                isOnline
                  ? 'bg-go/20 border border-go/40 text-go hover:bg-go/30'
                  : 'bg-alert/20 border border-alert/40 text-alert hover:bg-alert/30'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-go animate-ping' : 'bg-alert'}`} />
              {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
            </button>
          </div>
        </div>

        {/* Active Jobs Header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="font-display font-bold text-mist text-base flex items-center gap-2">
            <Zap className="h-5 w-5 text-signal" />
            Auto-Dispatched Jobs ({activeJobs.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="bg-surface/40 border border-white/8 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-full bg-signal/10 border border-signal/25 flex items-center justify-center mb-1">
              <Radio className="h-8 w-8 text-signal animate-pulse" />
            </div>
            <h3 className="font-display font-bold text-mist text-lg">Radar Scanning for Nearby Calls…</h3>
            <p className="text-fog text-xs max-w-sm leading-relaxed">
              When a stranded driver submits a request near <strong className="text-signal">{techInfo?.town || 'your location'}</strong>, the system will automatically match and dispatch the order directly to your phone screen with sound and push alerts!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeJobs.map((job) => (
              <MechanicJobCard key={job.id} job={job} techInfo={techInfo} />
            ))}
          </div>
        )}

        {/* History / Completed Section */}
        {completedJobs.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display font-semibold text-fog text-sm uppercase tracking-wider mb-3">
              Completed Jobs Today ({completedJobs.length})
            </h3>
            <div className="flex flex-col gap-3">
              {completedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-surface/30 border border-white/5 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-display font-bold text-mist text-sm">{job.customerName}</p>
                    <p className="text-fog text-xs">{job.vehicle?.make} {job.vehicle?.model} • {job.issueType}</p>
                  </div>
                  <span className="text-xs font-semibold text-go bg-go/10 border border-go/20 px-2.5 py-1 rounded-full">
                    Done
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function MechanicJobCard({ job, techInfo }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending;
  const [updating, setUpdating] = useState(false);
  const [showInlineMap, setShowInlineMap] = useState(false);

  const handleAdvanceStatus = async (nextStatus) => {
    setUpdating(true);
    try {
      await updateRequestStatus(job.id, nextStatus);
    } catch (e) {
      console.error('Failed to update status:', e);
    } finally {
      setUpdating(false);
    }
  };

  const customerLoc = job?.location;
  const stationLoc = techInfo?.coords
    ? [techInfo.coords.lat, techInfo.coords.lng]
    : [BATMAN_SHOP_LOCATION.lat, BATMAN_SHOP_LOCATION.lng];

  return (
    <div className="bg-surface border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`inline-block text-[11px] font-bold font-display px-2.5 py-0.5 rounded-full border mb-2 ${cfg.bgClass}`}>
            {cfg.label}
          </span>
          <h3 className="font-display font-bold text-mist text-lg leading-snug">
            {job.customerName}
          </h3>
          <p className="text-fog text-xs">
            {job.vehicle?.make} {job.vehicle?.model} {job.vehicle?.plate ? `(${job.vehicle.plate})` : ''}
          </p>
        </div>

        {job.customerPhone && (
          <a
            href={`tel:${job.customerPhone}`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-go/15 border border-go/30 text-go font-display font-bold text-xs hover:bg-go/20 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </a>
        )}
      </div>

      {/* Details */}
      <div className="bg-ink/50 rounded-xl p-3 flex flex-col gap-2 border border-white/5 text-xs">
        <div className="flex items-center gap-2 text-mist">
          <Zap className="h-4 w-4 text-signal flex-shrink-0" />
          <span className="font-semibold capitalize">Issue: {job.issueType}</span>
        </div>
        {job.addressText && (
          <div className="flex items-start gap-2 text-fog">
            <MapPin className="h-4 w-4 text-alert flex-shrink-0 mt-0.5" />
            <span>{job.addressText}</span>
          </div>
        )}
        {job.notes && (
          <p className="text-fog/80 italic pl-6">"{job.notes}"</p>
        )}
      </div>

      {/* Full Screen Live GPS Navigation Map Modal */}
      {showInlineMap && (
        <div className="fixed inset-0 z-[9999] bg-ink flex flex-col p-0 md:p-6 animate-fade-in">
          <div className="bg-surface border-0 md:border border-white/10 rounded-none md:rounded-2xl w-full h-full flex flex-col overflow-hidden shadow-2xl relative">
            <div className="px-4 py-3 border-b border-white/10 bg-surface flex items-center justify-between z-10 flex-shrink-0">
              <div className="flex items-center gap-2 truncate pr-2">
                <Navigation className="h-4 w-4 text-signal fill-signal flex-shrink-0" />
                <h3 className="font-display font-bold text-mist text-xs md:text-sm truncate">
                  Live Navigation — <span className="text-signal">{job.customerName}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowInlineMap(false)}
                className="px-3 py-1 rounded-xl bg-alert/20 border border-alert/40 text-alert hover:bg-alert/30 font-display font-bold text-xs transition-colors flex-shrink-0"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 w-full h-full relative overflow-hidden">
              <iframe
                src={`/tech/${job.id}`}
                title={`Live Navigation Map - ${job.customerName}`}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-1">
        <button
          onClick={() => setShowInlineMap(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-signal text-ink font-bold font-display text-sm hover:bg-signal/90 transition-all shadow-[0_0_16px_4px_rgba(245,166,35,0.25)]"
        >
          <Navigation className="h-4 w-4 fill-ink" />
          🗺️ Open Full Screen Live GPS Map Modal
        </button>

        <div className="grid grid-cols-2 gap-2">
          {job.status === 'assigned' && (
            <button
              onClick={() => handleAdvanceStatus('en_route')}
              disabled={updating}
              className="col-span-2 py-2.5 rounded-xl bg-go/20 border border-go/40 text-go font-bold font-display text-xs hover:bg-go/30 transition-colors"
            >
              Start Trip (On the Way)
            </button>
          )}

          {job.status === 'en_route' && (
            <button
              onClick={() => handleAdvanceStatus('arrived')}
              disabled={updating}
              className="col-span-2 py-2.5 rounded-xl bg-go/20 border border-go/40 text-go font-bold font-display text-xs hover:bg-go/30 transition-colors"
            >
              Mark as Arrived
            </button>
          )}

          {job.status === 'arrived' && (
            <button
              onClick={() => handleAdvanceStatus('completed')}
              disabled={updating}
              className="col-span-2 py-2.5 rounded-xl bg-go text-ink font-bold font-display text-xs hover:bg-go/90 transition-colors cursor-pointer"
            >
              Mark Job Completed (Done)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
