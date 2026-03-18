import { useState } from 'react';
import { crmApi } from '../../services/crmApiClient';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await crmApi.sendMagicLink(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <Link to="/" className="text-stone-400 hover:text-stone-600 flex items-center gap-1 text-sm mb-6">
          <ArrowLeft size={16} /> Back to site
        </Link>

        <h1 className="text-2xl font-serif font-bold text-navy-900 mb-2">Sign in to your dashboard</h1>
        <p className="text-stone-500 mb-6">We'll send you a magic link to sign in.</p>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <p className="text-stone-700 text-lg mb-2">Check your email</p>
            <p className="text-stone-500">We sent a sign-in link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-stone-600 mb-1">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-600 hover:bg-gold-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
