import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { isDemoMode, MECHANIC_DEMO_EMAIL, MECHANIC_DEMO_PASSWORD } from '@/utils/demo';
import { Wrench, Mail, Lock, LogIn, FlaskConical } from 'lucide-react';
import Button from '@/components/common/Button';

export default function MechanicLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/mechanic', { replace: true });
    } catch (err) {
      setError(err.message ?? 'Invalid mechanic email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-sm animate-fade-in my-auto">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-signal flex items-center justify-center shadow-[0_0_24px_8px_rgba(245,166,35,0.35)]">
            <Wrench className="h-8 w-8 text-ink fill-ink" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold font-display text-mist tracking-tight">
              Mechanic <span className="text-signal">Portal</span>
            </h1>
            <p className="text-fog text-sm mt-1">Batman Battery Rider Dispatch</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl border border-white/8 p-6 flex flex-col gap-5">
          <h2 className="font-display font-semibold text-mist text-lg">Mechanic Login</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mechanic-email" className="text-sm font-medium text-fog font-display">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog pointer-events-none" />
                <input
                  id="mechanic-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mechanic@batmanbattery.ph"
                  required
                  className="w-full rounded-xl bg-ink border border-white/10 hover:border-white/20 focus:border-signal focus:ring-1 focus:ring-signal/50 pl-10 pr-4 py-3 text-mist placeholder:text-fog/50 outline-none font-body text-base transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="mechanic-password" className="text-sm font-medium text-fog font-display">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fog pointer-events-none" />
                <input
                  id="mechanic-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl bg-ink border border-white/10 hover:border-white/20 focus:border-signal focus:ring-1 focus:ring-signal/50 pl-10 pr-4 py-3 text-mist placeholder:text-fog/50 outline-none font-body text-base transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-alert text-center animate-fade-in bg-alert/10 border border-alert/20 rounded-xl px-4 py-3 whitespace-pre-line">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
              id="mechanic-login-btn"
            >
              <LogIn className="h-5 w-5" />
              Sign in as Mechanic
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
