import { Link } from 'react-router-dom';
import { usePatientCases } from '../../hooks/usePatientCases';
import { usePatientAuth } from '../../contexts/PatientAuthContext';
import { MessageCircle, FileText, Clock } from 'lucide-react';

export default function DashboardHome() {
  const { patient } = usePatientAuth();
  const { data, isLoading } = usePatientCases();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-stone-400">Loading your cases...</div>;
  }

  const cases = data?.cases ?? [];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-navy-900 mb-6">
        Welcome back{patient?.name ? `, ${patient.name}` : ''}
      </h1>

      {cases.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FileText className="mx-auto text-stone-300 mb-4" size={48} />
          <p className="text-stone-500 text-lg">No cases yet</p>
          <p className="text-stone-400 mt-2">Start by clicking the chat bubble to find hospitals</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {cases.map((c: any) => (
            <Link key={c.id} to={`/dashboard/cases/${c.id}`}
              className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono text-stone-400">{c.caseNumber}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.assignmentStatus === 'ASSIGNED' ? 'bg-green-100 text-green-700' :
                    'bg-gold-100 text-gold-700'
                  }`}>
                    {c.assignmentStatus === 'ASSIGNED' ? 'In Progress' : 'Awaiting Quotes'}
                  </span>
                </div>
                <p className="text-stone-700">{c.primaryDiagnosis || 'General Consultation'}</p>
                <p className="text-stone-400 text-sm mt-1">
                  Created {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {c.unreadCount > 0 && (
                  <span className="flex items-center gap-1 text-gold-600">
                    <MessageCircle size={16} />
                    <span className="text-sm font-medium">{c.unreadCount}</span>
                  </span>
                )}
                <Clock size={16} className="text-stone-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
