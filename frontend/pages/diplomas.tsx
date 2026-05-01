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
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 font-display">
            🏆 Diploma <span className="text-accent glow-text">Marketplace</span>
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
            Advanced qualifications combining multiple programs. Earn recognized credentials that employers value and advance your career.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <div className="bg-surface/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-accent/20">
              <span className="text-accent font-semibold">🏆 {diplomas.length}+ Professional Diplomas</span>
            </div>
            <div className="bg-surface/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-primary/20">
              <span className="text-primary font-semibold">📜 Recognized Credentials</span>
            </div>
            <div className="bg-surface/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-secondary/20">
              <span className="text-secondary font-semibold">🚀 Career Advancement</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Enhanced Filters */}
        <div className="mb-12 bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-accent/20 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-foreground text-sm font-semibold">🔍 Search Diplomas</label>
              <input
                type="text"
                placeholder="Find your career qualification"
                value={search}
                onChange={handleSearch}
                className="w-full px-4 py-3 bg-background border border-accent/30 text-foreground rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder-text-muted"
              />
            </div>

            {/* Level Filter */}
            <div className="space-y-2">
              <label className="block text-foreground text-sm font-semibold">📜 Qualification Level</label>
              <select
                value={levelFilter}
                onChange={handleLevelFilter}
                className="w-full px-4 py-3 bg-background border border-accent/30 text-foreground rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              >
                <option value="all" className="bg-surface text-foreground">All Levels</option>
                <option value="certificate" className="bg-surface text-foreground">Certificate</option>
                <option value="diploma" className="bg-surface text-foreground">Diploma</option>
                <option value="degree" className="bg-surface text-foreground">Degree</option>
              </select>
            </div>

            {/* Results Summary */}
            <div className="flex items-end">
              <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl p-4 border border-accent/20 w-full">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-1 font-display">{diplomas.length}</div>
                  <div className="text-sm text-text-muted">Diplomas Found</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Diplomas Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin animation-delay-300"></div>
            </div>
          </div>
        ) : diplomas.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-2xl border border-accent/20">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-2xl font-bold text-foreground mb-2 font-display">No diplomas found</h3>
            <p className="text-text-muted text-lg mb-6">Try adjusting your search criteria</p>
            <button
              onClick={() => {
                setSearch('');
                setLevelFilter('all');
                setPage(0);
              }}
              className="bg-accent text-background px-6 py-3 rounded-xl hover:bg-accent-dark font-semibold transition-all hover:scale-105 glow"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {diplomas.map((diploma) => {
              const price = diploma.fee || 0;
              const discount = diploma.is_on_promo ? diploma.fee - diploma.promo_amount : 0;
              const finalPrice = discount > 0 ? discount : price;

              // Mock social proof (in real app, this would come from API)
              const enrolledCount = Math.floor(Math.random() * 150) + 25;
              const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
              const reviewCount = Math.floor(Math.random() * 15) + 3;

              return (
                <div
                  key={diploma.id}
                  className="group bg-surface/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 hover:shadow-2xl glow"
                >
                  {/* Diploma Header */}
                  <div className="relative h-40 bg-gradient-to-r from-accent/20 via-primary/20 to-secondary/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎓</div>
                      <p className="text-sm font-medium text-foreground/80">{diploma.title.split(' ')[0]}</p>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {diploma.is_featured && (
                        <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold border border-yellow-400">
                          ⭐ Featured
                        </span>
                      )}
                      {diploma.is_on_promo && diploma.promo_amount && (
                        <span className="bg-primary text-background px-2 py-1 rounded-full text-xs font-bold border border-primary/50">
                          🔥 SALE
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getLevelColor(diploma.level)}`}>
                        {diploma.level}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border border-accent/20">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">⭐</span>
                        <span className="text-xs font-semibold text-foreground">{rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Diploma Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors font-display">
                      {diploma.title}
                    </h3>

                    {/* Description */}
                    <p className="text-text-muted text-sm mb-4 line-clamp-2">
                      {diploma.short_description || diploma.description}
                    </p>

                    {/* Social Proof & Meta */}
                    <div className="flex items-center justify-between mb-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        👥 {enrolledCount} graduates
                      </span>
                      <span className="flex items-center gap-1">
                        📚 {diploma.programs_count || 0} programs
                      </span>
                    </div>

                    {/* Duration Badge */}
                    <div className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-medium mb-4">
                      ⏱️ {diploma.duration_years} year{diploma.duration_years > 1 ? 's' : ''}
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        {price > 0 ? (
                          discount > 0 ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-accent">
                                  £{(finalPrice / 100).toFixed(2)}
                                </span>
                                <span className="text-sm text-text-muted line-through">
                                  £{(price / 100).toFixed(2)}
                                </span>
                              </div>
                              <span className="text-xs text-primary font-semibold">
                                Save £{((price - finalPrice) / 100).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-accent">
                              £{(price / 100).toFixed(2)}
                            </span>
                          )
                        ) : (
                          <span className="text-2xl font-bold text-primary">Free</span>
                        )}
                      </div>

                      {/* Urgency indicator */}
                      <div className="text-right">
                        <span className="text-xs text-primary font-semibold bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                          🎓 Career Boost
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/diplomas/${diploma.id}`}
                        className="flex-1 bg-surface-light hover:bg-surface border border-accent/30 text-accent py-2 px-4 rounded-lg font-medium text-sm transition-all hover:border-accent/60 text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(diploma)}
                        className="flex-1 bg-accent hover:bg-accent-dark text-background py-2 px-4 rounded-lg font-semibold text-sm transition-all hover:scale-105 glow"
                      >
                        {price > 0 ? 'Add to Cart' : 'Enroll Free'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Enhanced Pagination */}
        {diplomas.length >= 12 && (
          <div className="mt-16 flex justify-center items-center gap-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-6 py-3 border border-accent/30 text-accent rounded-xl hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 glow"
            >
              ← Previous
            </button>
            <div className="bg-surface/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-accent/20">
              <span className="text-foreground font-semibold">Page {page + 1}</span>
            </div>
            <button
              onClick={() => setPage(page + 1)}
              disabled={diplomas.length < 12}
              className="px-6 py-3 border border-accent/30 text-accent rounded-xl hover:bg-accent/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 glow"
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
