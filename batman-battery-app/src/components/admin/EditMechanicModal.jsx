import { useState, useEffect } from 'react';
import { Mail, Lock, User, Building2, Phone, CheckCircle2 } from 'lucide-react';
import Button from '@/components/common/Button';
import { TECHNICIANS_DATA } from '@/utils/statusConfig';

export default function EditMechanicModal({ isOpen, onClose, mechanic, onSave }) {
  const [name, setName] = useState('');
  const [station, setStation] = useState('');
  const [town, setTown] = useState('');
  const [phone, setPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (mechanic) {
      setName(mechanic.name || '');
      setStation(mechanic.stationName || '');
      setTown(mechanic.town || '');
      setPhone(mechanic.phone || '');
    }
  }, [mechanic]);

  if (!isOpen || !mechanic) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...mechanic,
      name,
      stationName: station,
      town,
      phone,
    });
    setSuccessMsg(`Updated details for ${name}!`);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-fade-in">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col gap-4 relative z-[10000]">
        <div className="flex items-center justify-between border-b border-white/8 pb-3">
          <h3 className="font-display font-bold text-mist text-lg flex items-center gap-2">
            ✏️ Edit Mechanic Details
          </h3>
          <button onClick={onClose} className="text-fog hover:text-mist text-sm font-display">
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
                Mechanic Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Station Hub Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="text"
                  required
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                City / Town Area
              </label>
              <input
                type="text"
                required
                value={town}
                onChange={(e) => setTown(e.target.value)}
                className="w-full bg-ink border border-white/10 rounded-xl px-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
              />
            </div>

            <div>
              <label className="text-xs font-display uppercase tracking-wider text-fog mb-1 block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-ink border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-mist text-sm outline-none focus:border-signal"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="mt-2 w-full">
              Save Changes
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
