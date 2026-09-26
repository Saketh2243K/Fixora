import { useState, type FormEvent } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../store';

const ADMIN_PASSCODE = '0987';

export function AdminGate() {
  const { setIsAdmin, setView } = useApp();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setIsAdmin(true);
      setError(false);
    } else {
      setError(true);
      setPasscode('');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50 bg-grid px-4">
      <div className="card w-full max-w-sm p-8 animate-scale-in">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-xl font-bold text-navy-900">Admin Access</h1>
          <p className="text-sm text-navy-500 mt-1">
            Enter the 4-digit passcode to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            autoFocus
            value={passcode}
            onChange={(e) => {
              setError(false);
              setPasscode(e.target.value.replace(/\D/g, '').slice(0, 4));
            }}
            className="input-field text-center text-2xl tracking-[0.5em] font-mono"
            placeholder="••••"
          />

          {error && (
            <p className="text-sm text-red-600 text-center">
              Incorrect passcode. Try again.
            </p>
          )}

          <button
            type="submit"
            disabled={passcode.length !== 4}
            className="btn-primary w-full"
          >
            <ShieldCheck className="w-4 h-4" />
            Unlock Admin Dashboard
          </button>

          <button
            type="button"
            onClick={() => setView('landing')}
            className="btn-ghost w-full"
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}
