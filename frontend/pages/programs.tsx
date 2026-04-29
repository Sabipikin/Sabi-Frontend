import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://sabi-backend-vqud.onrender.com');

const ProgramsPage = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;

  useEffect(() => {
    fetchPrograms();
  }, [search, page]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const url = buildApiUrl(
        `/api/programs?skip=${page * 10}&limit=10${search ? `&search=${encodeURIComponent(search)}` : ''}`
      );
      const response = await fetch(url);
      
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Failed to fetch programs: ${response.status} ${body}`);
      }

      const data = await response.json();
      setPrograms(data);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('Error fetching programs:', err);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Educational Programs</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {programs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No programs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`}>
                <div className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {program.image_url && (
                    <img
                      src={program.image_url}
                      alt={program.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{program.short_description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{program.difficulty}</span>
                      <span>{program.duration_months} months</span>
                    </div>
                    <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
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
            disabled={programs.length < 10}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramsPage;
