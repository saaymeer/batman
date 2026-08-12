import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Batman Battery App error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message ?? 'Unknown error';
      const isFirebase =
        msg.includes('Firebase') ||
        msg.includes('API key') ||
        msg.includes('projectId') ||
        msg.includes('firestore') ||
        msg.includes('auth');

      return (
        <div className="min-h-screen bg-[#12151C] flex flex-col items-center justify-center px-5 text-center">
          <div className="max-w-md w-full">
            <div className="h-14 w-14 rounded-2xl bg-[#E85D4A]/15 border border-[#E85D4A]/30 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="h-7 w-7 text-[#E85D4A]" />
            </div>

            <h1 className="text-2xl font-bold text-[#E8EAED] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {isFirebase ? 'Firebase not configured' : 'Something went wrong'}
            </h1>

            {isFirebase ? (
              <div className="text-left bg-[#1E232C] rounded-xl border border-white/10 p-5 mt-4 text-sm text-[#9AA1AC] space-y-3">
                <p className="text-[#E8EAED] font-semibold">To get the app running:</p>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Create a Firebase project at <a href="https://console.firebase.google.com" target="_blank" className="text-[#F5A623] underline">console.firebase.google.com</a></li>
                  <li>Enable Firestore + Email/Password Auth</li>
                  <li>Copy <code className="bg-white/10 px-1 rounded">.env.example</code> → <code className="bg-white/10 px-1 rounded">.env</code></li>
                  <li>Paste your Firebase config values into <code className="bg-white/10 px-1 rounded">.env</code></li>
                  <li>Restart the dev server</li>
                </ol>
                <p className="text-xs mt-3 text-[#9AA1AC]/70">See README.md for full instructions.</p>
              </div>
            ) : (
              <p className="text-[#9AA1AC] text-sm mt-2">{msg}</p>
            )}

            <button
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E232C] border border-white/10 text-[#E8EAED] hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
