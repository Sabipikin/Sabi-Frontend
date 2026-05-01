'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/services/api';

interface Certificate {
  id: number;
  user_id: number;
  item_type: string;
  certificate_number: string;
  completed_at: string;
  issued_at: string;
  status: string;
}

export default function CertificatesPage() {
  const { userToken } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToken) {
      fetchCertificates();
    }
  }, [userToken]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/certificates/user/my-certificates`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch certificates');
      }

      const data = await response.json();
      setCertificates(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading certificates');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId: number, format: string = 'pdf') => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/certificates/user/certificate/${certificateId}/download?format=${format}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${certificateId}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error downloading certificate');
    }
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'course':
        return '📚 Course Certificate';
      case 'program':
        return '🎯 Program Certification';
      case 'diploma':
        return '🎓 Diploma';
      default:
        return 'Certificate';
    }
  };

  if (!userToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your certificates</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-gray-600 mt-2">Download your certificates of achievement</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}

        {/* Certificates Grid */}
        {!loading && certificates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No certificates yet</p>
            <p className="text-gray-400 mb-6">Complete a course, program, or diploma to earn a certificate</p>
            <Link href="/learning">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                Start Learning
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="text-4xl mb-2">{getCertificateTypeLabel(cert.item_type).split(' ')[0]}</div>
                  <h3 className="text-lg font-semibold">{getCertificateTypeLabel(cert.item_type)}</h3>
                </div>

                {/* Certificate Details */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Certificate Number</p>
                    <p className="font-mono text-sm text-gray-900 break-all">{cert.certificate_number}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-gray-900">{new Date(cert.completed_at).toLocaleDateString()}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-1">Issued</p>
                    <p className="text-gray-900">{new Date(cert.issued_at).toLocaleDateString()}</p>
                  </div>

                  {/* Download Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadCertificate(cert.id, 'pdf')}
                      className="flex-1 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors active:scale-95 text-sm"
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={() => downloadCertificate(cert.id, 'png')}
                      disabled
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-400 rounded-lg font-medium cursor-not-allowed text-sm"
                    >
                      🖼️ PNG (Soon)
                    </button>
                  </div>

                  {/* View Details Link */}
                  <Link href={`/certificates/${cert.id}`}>
                    <button className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors active:scale-95">
                      View Details
                    </button>
                  </Link>
                </div>

                {/* Status Badge */}
                <div className="px-6 pb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    cert.status === 'issued' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cert.status === 'issued' ? '✓ Issued' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
