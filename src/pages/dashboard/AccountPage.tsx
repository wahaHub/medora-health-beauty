import { useState } from 'react';
import { crmApi } from '@/services/crmApiClient';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { CheckCircle } from 'lucide-react';
import { useDashboardTranslation } from '@/hooks/useDashboardTranslation';

export default function AccountPage() {
  const { dt } = useDashboardTranslation();
  const { patient } = usePatientAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError(dt('accountPasswordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(dt('accountPasswordMin'));
      return;
    }
    try {
      await crmApi.setPassword(password);
      setSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || dt('accountSetPasswordFailed'));
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-serif font-bold text-navy-900 mb-6">{dt('accountSettings')}</h1>

      <div className="bg-white rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-medium text-stone-800 mb-4">{dt('accountProfile')}</h2>
        <div className="space-y-3 text-sm">
          <div><span className="text-stone-400">{dt('patientId')}</span> <span className="text-stone-700">{patient?.id}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-lg font-medium text-stone-800 mb-4">{dt('accountSetPassword')}</h2>
        <p className="text-stone-500 text-sm mb-4">{dt('accountSetPasswordDescription')}</p>
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm text-stone-600 mb-1">{dt('accountNewPassword')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              minLength={8} required />
          </div>
          <div>
            <label className="block text-sm text-stone-600 mb-1">{dt('accountConfirmPassword')}</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              minLength={8} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm flex items-center gap-1">
              <CheckCircle size={14} /> {dt('accountPasswordSet')}
            </p>
          )}
          <button type="submit"
            className="w-full bg-gold-600 hover:bg-gold-700 text-white py-2.5 rounded-xl font-medium transition-colors">
            {dt('accountSetPassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
