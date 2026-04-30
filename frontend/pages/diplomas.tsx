'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { API_BASE_URL } from '@/services/api';
import Navbar from '@/components/Navbar';

interface Diploma {
  id: number;
  title: string;
  description?: string;
  short_description?: string;
  duration_years: number;
  level: string;
  field: string;
  color: string;
  icon?: string;
  image_url?: string;
  status: string;
  is_featured: boolean;
  fee: number;
  promo_amount: number;
  is_on_promo: boolean;
  created_at: string;
  updated_at?: string;
  programs_count?: number;
}

const DiplomasPage = () => {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchDiplomas();
  }, [search, levelFilter, statusFilter, page]);

  const fetchDiplomas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: String(page * 10),
        limit: '10',
      });
      if (search) params.append('search', search);
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const url = new URL(`${API_BASE_URL}/api/diplomas`, window.location.origin);
      url.search = params.toString();

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error('Failed to fetch diplomas');
      }

      const data = await response.json();
      setDiplomas(data);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('Error fetching diplomas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleLevelFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setLevelFilter(e.target.value);
    setPage(0);
  };

  const handleStatusFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(0);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'certificate': return 'bg-blue-900/30 text-blue-300 border-blue-600';
      case 'diploma': return 'bg-purple-900/30 text-purple-300 border-purple-600';
      case 'degree': return 'bg-green-900/30 text-green-300 border-green-600';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-900/30 text-green-300 border-green-600';
      case 'draft': return 'bg-yellow-900/30 text-yellow-300 border-yellow-600';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-600';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Diploma Programs</h1>
          <p className="text-gray-400">Advanced qualifications combining multiple educational programs</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Search Diplomas</label>
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={handleSearch}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Level</label>
              <select
                value={levelFilter}
                onChange={handleLevelFilter}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Levels</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
                <option value="degree">Degree</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-gray-400">
                <span className="text-cyan-400 font-bold text-lg">{diplomas.length}</span>
                <span> diplomas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Diplomas Table */}
        {diplomas.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-lg">No diplomas found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Diploma
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Field
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Programs
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Fee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {diplomas.map((diploma) => (
                    <tr key={diploma.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded mr-3 flex-shrink-0"
                            style={{ backgroundColor: diploma.color }}
                          ></div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-white truncate">{diploma.title}</div>
                            {diploma.short_description && (
                              <div className="text-sm text-gray-400 truncate">{diploma.short_description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {diploma.field}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {diploma.duration_years} year{diploma.duration_years > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getLevelColor(diploma.level)}`}>
                          {diploma.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {diploma.programs_count || 0} programs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(diploma.status)}`}>
                          {diploma.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${diploma.fee}
                        {diploma.is_on_promo && (
                          <span className="ml-2 text-cyan-400">
                            (${diploma.promo_amount} off)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/diplomas/${diploma.id}`}
                          className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-400">Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={diplomas.length < 10}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
};

export default DiplomasPage;
