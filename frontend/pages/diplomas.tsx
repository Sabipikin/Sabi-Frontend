import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { API_BASE_URL } from '@/services/api';

const DiplomasPage = () => {
  const [diplomas, setDiplomas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchDiplomas();
  }, [search, page]);

  const fetchDiplomas = async () => {
    try {
      setLoading(true);
      const url = new URL(`${API_BASE_URL}/api/diplomas`, window.location.origin);
      url.searchParams.append('skip', String(page * 10));
      url.searchParams.append('limit', '10');
      if (search) {
        url.searchParams.append('search', search);
      }

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Diploma Programs</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search diplomas..."
            value={search}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {diplomas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No diplomas found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diplomas.map((diploma) => (
              <Link key={diploma.id} href={`/diplomas/${diploma.id}`}>
                <div className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {diploma.image_url && (
                    <img
                      src={diploma.image_url}
                      alt={diploma.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{diploma.title}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{diploma.short_description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{diploma.level}</span>
                      <span>{diploma.duration_years} year{diploma.duration_years > 1 ? 's' : ''}</span>
                    </div>
                    <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-600">Page {page + 1}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={diplomas.length < 10}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiplomasPage;
