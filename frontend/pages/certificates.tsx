'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, apiService } from '@/services/api';

interface Certificate {
  id: number;
  user_id: number;
  item_type: string;
  item_name?: string;
  certificate_number: string;
  completed_at: string;
  issued_at: string;
  status: string;
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

export default function CertificatesPage() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [loading, token, router]);

  useEffect(() => {
    if (token) {
      fetchCertificates();
    }
  }, [token]);

  const fetchCertificates = async () => {
    try {
      setLoadingCertificates(true);
      const response = await fetch(`${API_BASE_URL}/api/certificates/user/my-certificates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load certificates.');
      }

      const data = await response.json();
      setCertificates(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load certificates.');
    } finally {
      setLoadingCertificates(false);
    }
  };

  const downloadCertificate = async (certificateId: number, format: string = 'pdf') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/user/certificate/${certificateId}/download?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      link.download = `certificate_${certificateId}.${format === 'jpeg' ? 'jpg' : format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download certificate.');
    }
  };

  const addToPortfolio = async (certificate: Certificate) => {
    try {
      const portfolioData = {
        name: `${getCertificateTypeLabel(certificate.item_type).replace(/📚|🎯|🎓/g, '').trim()} in ${certificate.item_name || 'Achievement'}`,
        issuer: 'Sabikin',
        issue_date: certificate.issued_at.split('T')[0], // Format as YYYY-MM-DD
        credential_id: certificate.certificate_number,
        credential_url: `${window.location.origin}/certificates/${certificate.id}`
      };

      await apiService.addCertificate(portfolioData, token || undefined);
      alert('Certificate added to portfolio successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add certificate to portfolio.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">My Certificates</h1>
          <p className="text-gray-300 mt-2">View and download your issued course, program, and diploma certificates.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-red-100">
            {error}
          </div>
        )}

        {loadingCertificates ? (
          <div className="flex items-center justify-center py-16">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-4 border-cyan-400 border-t-transparent"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-3xl border border-primary/20 bg-slate-900/80 p-12 text-center">
            <p className="text-xl font-semibold">No certificates issued yet.</p>
            <p className="text-gray-400 mt-3">Complete a course, program, or diploma and your certificate will appear here.</p>
            <Link href="/learning" className="inline-flex mt-8 items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Start learning
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/90 shadow-xl shadow-black/20">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-700 p-6 text-white">
                  <div className="text-sm uppercase tracking-[0.3em] text-cyan-100">{getCertificateTypeLabel(certificate.item_type)}</div>
                  <div className="mt-3 text-2xl font-semibold">{certificate.item_name || 'Achievement'}</div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Certificate number</div>
                    <div className="mt-2 font-mono text-sm text-white">{certificate.certificate_number}</div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-900/80 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Completed</div>
                      <div className="mt-2 text-sm text-white">{formatDate(certificate.completed_at)}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-900/80 p-4">
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Issued</div>
                      <div className="mt-2 text-sm text-white">{formatDate(certificate.issued_at)}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => downloadCertificate(certificate.id, 'pdf')}
                      className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => downloadCertificate(certificate.id, 'jpeg')}
                      className="inline-flex items-center justify-center rounded-full bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-400"
                    >
                      JPEG
                    </button>
                    <button
                      onClick={() => downloadCertificate(certificate.id, 'png')}
                      className="inline-flex items-center justify-center rounded-full bg-green-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-400"
                    >
                      PNG
                    </button>
                    <button
                      onClick={() => addToPortfolio(certificate)}
                      className="inline-flex items-center justify-center rounded-full bg-purple-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-400"
                    >
                      Add to Portfolio
                    </button>
                    <Link
                      href={`/certificates/${certificate.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                    >
                      Details
                    </Link>
                  </div>
                  <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm text-slate-400">
                    Status: <span className={certificate.status === 'issued' ? 'text-emerald-300' : 'text-amber-300'}>{certificate.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
