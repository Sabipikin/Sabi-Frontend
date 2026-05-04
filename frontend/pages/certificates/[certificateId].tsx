'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/services/api';

interface CertificateDetail {
  id: number;
  user_id: number;
  item_type: string;
  item_name: string;
  certificate_number: string;
  verification_code: string;
  completed_at: string;
  issued_at: string;
  status: string;
  change_request?: string | null;
}

const getCertificateTypeLabel = (type: string) => {
  switch (type) {
    case 'course':
      return '📚 Course Certificate';
    case 'program':
      return '🎯 Program Certificate';
    case 'diploma':
      return '🎓 Diploma Certificate';
    default:
      return 'Certificate';
  }
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

export default function CertificateDetailPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [certificate, setCertificate] = useState<CertificateDetail | null>(null);
  const [loadingCertificate, setLoadingCertificate] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [requestPayload, setRequestPayload] = useState({
    change_type: 'name_correction',
    reason: '',
    details: '',
  });

  const certificateId = router.query.certificateId as string | undefined;

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
      return;
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (token && certificateId) {
      fetchCertificate(certificateId);
    }
  }, [token, certificateId]);

  const fetchCertificate = async (id: string) => {
    try {
      setLoadingCertificate(true);
      const response = await fetch(`${API_BASE_URL}/api/certificates/user/certificate/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to load certificate details.');
      }

      const data = await response.json();
      setCertificate(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load certificate details.');
    } finally {
      setLoadingCertificate(false);
    }
  };

  const downloadCertificate = async () => {
    if (!certificate) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/user/certificate/${certificate.id}/download?format=pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${certificate.certificate_number}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download certificate.');
    }
  };

  const handleChangeRequestSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!certificate) return;

    try {
      setRequestStatus(null);
      const response = await fetch(`${API_BASE_URL}/api/certificates/user/certificate/${certificate.id}/request-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Request failed');
      }

      setRequestStatus('Your request was submitted successfully.');
      fetchCertificate(certificateId!);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit request.');
    }
  };

  const renderChangeRequest = () => {
    if (!certificate?.change_request) return null;

    try {
      const parsed = typeof certificate.change_request === 'string' ? JSON.parse(certificate.change_request) : certificate.change_request;
      return (
        <div className="rounded-3xl border border-slate-700/60 bg-slate-900/80 p-4 text-sm text-slate-300">
          <div className="mb-2 font-semibold text-white">Change request</div>
          <p><span className="font-semibold">Type:</span> {parsed.change_type}</p>
          <p><span className="font-semibold">Reason:</span> {parsed.reason}</p>
          <p><span className="font-semibold">Details:</span> {parsed.details}</p>
          <p><span className="font-semibold">Status:</span> {parsed.status}</p>
        </div>
      );
    } catch {
      return null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-400">Certificate details</p>
            <h1 className="mt-2 text-4xl font-bold">My Certificate</h1>
            <p className="text-slate-400 mt-2">Download or request a change for this certificate.</p>
          </div>
          <Link href="/certificates" className="inline-flex items-center rounded-full border border-slate-700/80 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
            ← Back to certificates
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        )}

        {loadingCertificate ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-cyan-400 border-t-transparent"></div>
          </div>
        ) : certificate ? (
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <section className="space-y-6 rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8">
              <div className="rounded-3xl border border-slate-700/80 bg-slate-950/90 p-6">
                <div className="text-sm uppercase tracking-[0.28em] text-cyan-400">{getCertificateTypeLabel(certificate.item_type)}</div>
                <h2 className="mt-3 text-3xl font-semibold text-white">{certificate.item_name}</h2>
                <p className="mt-3 text-slate-400">Certificate number: <span className="font-mono text-slate-100">{certificate.certificate_number}</span></p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 p-6">
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="mt-2 text-lg text-white">{formatDate(certificate.completed_at)}</p>
                </div>
                <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 p-6">
                  <p className="text-sm text-slate-400">Issued</p>
                  <p className="mt-2 text-lg text-white">{formatDate(certificate.issued_at)}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 p-6">
                <p className="text-sm text-slate-400">Verification Code</p>
                <p className="mt-2 font-mono text-lg text-white">{certificate.verification_code}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={downloadCertificate}
                  className="inline-flex h-14 flex-1 items-center justify-center rounded-full bg-cyan-500 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Download PDF
                </button>
                <button
                  disabled
                  className="inline-flex h-14 flex-1 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 px-6 text-sm font-semibold text-slate-500"
                >
                  PNG coming soon
                </button>
              </div>

              {renderChangeRequest()}
            </section>

            <aside className="space-y-6 rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8">
              <div>
                <h3 className="text-xl font-semibold text-white">Request a change</h3>
                <p className="mt-2 text-sm text-slate-400">Request a name correction or physical copy for this certificate.</p>
              </div>

              {requestStatus && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                  {requestStatus}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleChangeRequestSubmit}>
                <label className="block text-sm font-medium text-slate-300">
                  Request type
                  <select
                    value={requestPayload.change_type}
                    onChange={(event) => setRequestPayload({ ...requestPayload, change_type: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                  >
                    <option value="name_correction">Name correction</option>
                    <option value="physical_copy">Physical copy</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  Reason
                  <input
                    type="text"
                    value={requestPayload.reason}
                    onChange={(event) => setRequestPayload({ ...requestPayload, reason: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    placeholder="Why do you need this change?"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-300">
                  Details
                  <textarea
                    value={requestPayload.details}
                    onChange={(event) => setRequestPayload({ ...requestPayload, details: event.target.value })}
                    className="mt-2 h-32 w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500"
                    placeholder="Explain the correction or delivery request"
                  />
                </label>

                <button
                  type="submit"
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-background transition hover:bg-primary-dark"
                >
                  Submit request
                </button>
              </form>
            </aside>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-700/60 bg-slate-900/80 p-12 text-center text-slate-300">
            Certificate was not found or may not belong to your account.
          </div>
        )}
      </div>
    </main>
  );
}
