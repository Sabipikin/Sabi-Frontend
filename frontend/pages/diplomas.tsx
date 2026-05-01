'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
  const [page, setPage] = useState(0);
  const { addToCart } = useCart();
  const router = useRouter();
  const { token, userToken } = useAuth();

  useEffect(() => {
    fetchDiplomas();
  }, [search, levelFilter, page]);

  const fetchDiplomas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: String(page * 12),
        limit: '12',
      });
      if (search) params.append('search', search);
      if (levelFilter !== 'all') params.append('level', levelFilter);

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

  const handleAddToCart = async (diploma: Diploma) => {
    try {
      await addToCart({
        item_type: 'diploma',
        diploma_id: diploma.id,
        price: diploma.fee || 0,
        discount: diploma.is_on_promo ? diploma.fee - diploma.promo_amount : 0,
        quantity: 1,
      });

      if (!token && !userToken) {
        router.push(`/signup?next=/checkout`);
      } else {
        router.push('/checkout');
      }
    } catch (error) {
      console.error('Failed to add diploma to cart:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'certificate': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'diploma': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      case 'degree': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto relative">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-3xl font-bold text-foreground font-display glow-text">Sabipath</Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/diplomas" className="text-foreground hover:text-accent font-medium transition-colors">
              Diplomas
            </Link>
            <Link href="/programs" className="text-foreground hover:text-primary font-medium transition-colors">
              Programs
            </Link>
            <Link href="/courses" className="text-foreground hover:text-primary font-medium transition-colors">
              Courses
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-foreground hover:text-primary font-medium transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="bg-primary text-background px-6 py-3 rounded-xl hover:bg-primary-dark font-semibold glow transition-all hover:scale-105">
            Get started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 font-display">
            Complete <span className="text-accent glow-text">Diplomas</span>
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
            Advanced qualifications combining multiple programs into comprehensive career paths. Earn recognized credentials that employers value.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-12 bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-accent/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-3">Search Diplomas</label>
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={handleSearch}
                className="w-full px-4 py-3 bg-background border border-accent/30 text-foreground rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              />
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-3">Level</label>
              <select
                value={levelFilter}
                onChange={handleLevelFilter}
                className="w-full px-4 py-3 bg-background border border-accent/30 text-foreground rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              >
                <option value="all">All Levels</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
                <option value="degree">Degree</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent font-display">{diplomas.length}</div>
                <div className="text-text-muted text-sm">diplomas found</div>
              </div>
            </div>
          </div>
        </div>

        {/* Diplomas Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : diplomas.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-2xl border border-accent/20">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold text-foreground mb-2 font-display">No diplomas found</h3>
            <p className="text-text-muted">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diplomas.map((diploma) => {
              const price = diploma.fee || 0;
              const discount = diploma.is_on_promo ? diploma.fee - diploma.promo_amount : 0;
              const finalPrice = discount > 0 ? discount : price;

              return (
                <div
                  key={diploma.id}
                  className="bg-surface/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 glow group"
                >
                  {/* Diploma Header */}
                  <div
                    className="h-40 flex items-center justify-center relative"
                    style={{ backgroundColor: diploma.color }}
                  >
                    <div className="text-center text-background">
                      <div className="text-2xl mb-2">{diploma.title}</div>
                      <div className="text-sm opacity-90">{diploma.duration_years} year{diploma.duration_years > 1 ? 's' : ''}</div>
                    </div>
                    {diploma.is_featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ Featured
                      </div>
                    )}
                  </div>

                  {/* Diploma Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-3 font-display group-hover:text-accent transition-colors line-clamp-2">
                      {diploma.title}
                    </h3>

                    {/* Description */}
                    <p className="text-text-muted text-sm mb-4 line-clamp-3">
                      {diploma.short_description || diploma.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span>🎯</span>
                          <span>{diploma.field}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full border text-xs ${getLevelColor(diploma.level)}`}>
                          {diploma.level}
                        </span>
                      </div>
                    </div>

                    {/* Programs Count */}
                    <div className="text-sm text-text-muted mb-4">
                      📚 Includes {diploma.programs_count || 0} programs
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-col">
                        {discount > 0 ? (
                          <>
                            <span className="text-2xl font-bold text-accent">
                              ${(finalPrice / 100).toFixed(2)}
                            </span>
                            <span className="text-sm text-text-muted line-through">
                              ${(price / 100).toFixed(2)}
                            </span>
                          </>
                        ) : price > 0 ? (
                          <span className="text-2xl font-bold text-accent">
                            ${(price / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-green-500">
                            Free
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/diplomas/${diploma.id}`}
                        className="text-accent hover:text-accent-dark font-medium text-sm transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAddToCart(diploma)}
                      className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 bg-accent hover:bg-accent-dark text-background glow"
                    >
                      {price > 0 ? 'Add to Cart' : 'Enroll Free'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {diplomas.length >= 12 && (
          <div className="mt-16 flex justify-center items-center gap-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-6 py-3 border border-accent/30 text-accent rounded-xl hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              ← Previous
            </button>
            <span className="text-foreground font-medium">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={diplomas.length < 12}
              className="px-6 py-3 border border-accent/30 text-accent rounded-xl hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiplomasPage;
