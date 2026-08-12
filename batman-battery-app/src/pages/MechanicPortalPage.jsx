import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRequestsList } from '@/hooks/useRequestsList';
import { TECHNICIANS_DATA, getTechnicianInfo, STATUS_CONFIG } from '@/utils/statusConfig';
import { updateRequestStatus, updateTechnicianLocation } from '@/services/requestService';
import { Zap, Wrench, MapPin, Phone, User, Navigation, CheckCircle2, ChevronRight, AlertCircle, Building2, Radio } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function MechanicPortalPage() {
  const { requests, loading } = useRequestsList();
  const [selectedTech, setSelectedTech] = useState(
    localStorage.getItem('batman_selected_mechanic') || 'Rico M.'
  );

  const handleSelectTech = (techName) => {
    setSelectedTech(techName);
    localStorage.setItem('batman_selected_mechanic', techName);
  };

  const techInfo = getTechnicianInfo(selectedTech);

  // Filter requests assigned to this mechanic
  const myAssignedJobs = requests.filter(
    (r) => r.assignedTechnician?.toLowerCase().trim() === selectedTech.toLowerCase().trim()
  );

  const activeJobs = myAssignedJobs.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
  const completedJobs = myAssignedJobs.filter((r) => r.status === 'completed');

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Top Bar */}
      <header className="px-5 pt-6 pb-4 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-signal flex items-center justify-center shadow-[0_0_16px_4px_rgba(245,166,35,0.3)]">
            <Wrench className="h-5 w-5 text-ink" />
          </div>
          <div>
            <h1 className="font-bold font-display text-mist text-base leading-tight">
              Mechanic Dispatch <span className="text-signal">Portal</span>
            </h1>
            <p className="text-fog text-xs">Batman Battery 24/7 Cebu</p>
          </div>
        </div>

        <Link to="/" className="text-xs font-display text-fog hover:text-mist transition-colors">
          Customer Form →
        </Link>
      </header>

      {/* Mechanic Switcher */}
      <div className="bg-surface/80 border-b border-white/8 px-5 py-4">
        <label className="block text-xs font-display uppercase tracking-wider text-fog mb-2">
          Select Active Mechanic Profile:
        </label>
        <select
          value={selectedTech}
          onChange={(e) => handleSelectTech(e.target.value)}
          className="w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-mist font-display font-semibold text-sm outline-none focus:border-signal"
        >
          {TECHNICIANS_DATA.map((t) => (
            <option key={t.name} value={t.name}>
              🧑‍🔧 {t.name} — {t.stationName} ({t.town})
            </option>
          ))}
        </select>

        {techInfo && (
          <div className="mt-3 flex items-center justify-between text-xs text-fog bg-ink/50 rounded-lg p-2.5">
            <span className="flex items-center gap-1.5 text-go font-medium font-display">
              <Building2 className="h-3.5 w-3.5" />
              {techInfo.stationName}
            </span>
            <span className="font-mono text-mist">{techInfo.phone}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full flex flex-col gap-6">
        {/* Active Jobs Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-mist text-lg flex items-center gap-2">
            <Radio className="h-5 w-5 text-signal animate-pulse" />
            Active Auto-Assigned Jobs
          </h2>
          <span className="bg-signal/20 text-signal border border-signal/30 text-xs font-bold font-display px-3 py-1 rounded-full">
            {activeJobs.length} Assigned
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="bg-surface/40 border border-white/8 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
            <CheckCircle2 className="h-12 w-12 text-go/50" />
            <h3 className="font-display font-semibold text-mist text-base">No pending jobs for {selectedTech}</h3>
            <p className="text-fog text-xs max-w-xs">
              When a customer stranded nearby submits a request, the system will automatically assign it to this station!
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

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 mt-1">
        <button
          onClick={() => navigate(`/tech/${job.id}`)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-signal text-ink font-bold font-display text-sm hover:bg-signal/90 transition-all shadow-[0_0_16px_4px_rgba(245,166,35,0.25)]"
        >
          <Navigation className="h-4 w-4 fill-ink" />
          Open Live GPS Navigation & Trip Map
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
              className="col-span-2 py-2.5 rounded-xl bg-go text-ink font-bold font-display text-xs hover:bg-go/90 transition-colors"
            >
              Mark Job Completed (Done)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
