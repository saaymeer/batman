import { useState } from 'react';
import { Mail, Lock, User, Building2, Phone, CheckCircle2, ShieldAlert } from 'lucide-react';
import Button from '@/components/common/Button';
import { TECHNICIANS_DATA } from '@/utils/statusConfig';

export default function CreateMechanicModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [station, setStation] = useState(TECHNICIANS_DATA[0].stationName);
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg(`Mechanic account successfully created for ${name} (${station})!`);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setSuccessMsg('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <h3 className="font-display font-bold text-mist text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-signal" />
            Create Mechanic Account
          </h3>
          <button
            onClick={onClose}
            className="text-fog hover:text-mist text-sm font-display"
          >
            ✕
          </button>
        </div>

        {successMsg ? (
          <div className="py-6 text-center flex flex-col items-center gap-2 bg-go/10 border border-go/25 rounded-xl p-4">
            <CheckCircle2 className="h-10 w-10 text-go" />
            <p className="text-go font-display font-bold text-sm">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Mechanic Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Juan Santos"
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mechanic@batmanbattery.ph"
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Assign Station Base / Hub
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog pointer-events-none" />
                <select
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal appearance-none"
                >
                  {TECHNICIANS_DATA.map((t) => (
                    <option key={t.stationName} value={t.stationName}>
                      {t.stationName} ({t.town})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XX XXX XXXX"
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="mt-2 w-full">
              Create Mechanic Account
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
