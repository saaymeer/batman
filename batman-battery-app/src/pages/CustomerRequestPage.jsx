import { Link } from 'react-router-dom';
import RequestForm from '@/components/customer/RequestForm';
import { Zap, ArrowLeft } from 'lucide-react';

/**
 * CustomerRequestPage
 *
 * Emergency request form. Now accessible at /request (landing page is at /).
 */
export default function CustomerRequestPage() {
  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex flex-col items-center gap-1 relative">
        <Link
          to="/"
          className="absolute left-5 top-6 flex items-center gap-1.5 text-fog hover:text-mist text-sm font-display transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-signal flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_4px_rgba(245,166,35,0.35)]">
            <Zap className="h-6 w-6 text-ink fill-ink" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-mist leading-tight tracking-tight">
              Batman Battery
              <span className="text-signal"> 24/7</span>
            </h1>
            <p className="text-[11px] text-fog leading-none">
              Cebu Mobile Battery Service
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-mist text-2xl font-bold font-display leading-tight tracking-tight">
            Stranded? We'll come to you.
          </p>
          <p className="text-fog text-sm mt-1.5">
            Fill in the details below and hit <span className="text-signal font-semibold">Send request</span>.
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 px-5 pb-8">
        <div className="max-w-lg mx-auto">
          <RequestForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 pt-2">
        <a
          href="tel:+639XXXXXXXXX"
          className="text-xs text-fog hover:text-signal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded"
        >
          Or call us directly: <span className="text-signal">+63 9XX XXX XXXX</span>
        </a>
      </footer>
    </div>
  );
}
