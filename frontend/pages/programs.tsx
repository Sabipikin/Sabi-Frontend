'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Program {
  id: number;
  title: string;
  description?: string;
  short_description?: string;
  diploma_id?: number;
  duration_months: number;
  difficulty: string;
  prerequisites?: string;
  color: string;
  icon?: string;
  image_url?: string;
  status: string;
  order: number;
  is_featured: boolean;
  fee: number;
  promo_amount: number;
  is_on_promo: boolean;
  created_at: string;
  updated_at?: string;
  courses_count?: number;
}

const ProgramsPage = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [page, setPage] = useState(0);
  const { addToCart } = useCart();
  const router = useRouter();
  const { token, userToken } = useAuth();

  const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;

  useEffect(() => {
    fetchPrograms();
  }, [search, difficultyFilter, page]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        skip: String(page * 12),
        limit: '12',
      });
      if (search) params.append('search', search);
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter);

      const url = buildApiUrl(`/api/programs?${params.toString()}`);
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

  const handleDifficultyFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    setDifficultyFilter(e.target.value);
    setPage(0);
  };

  const handleAddToCart = async (program: Program) => {
    try {
      await addToCart({
        item_type: 'program',
        program_id: program.id,
        price: program.fee || 0,
        discount: program.is_on_promo ? program.fee - program.promo_amount : 0,
        quantity: 1,
      });

      if (!token && !userToken) {
        router.push(`/signup?next=/checkout`);
      } else {
        router.push('/checkout');
      }
    } catch (error) {
      console.error('Failed to add program to cart:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/50';
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
            <Link href="/diplomas" className="text-foreground hover:text-primary font-medium transition-colors">
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
            Structured <span className="text-secondary glow-text">Programs</span>
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
            Comprehensive learning paths that combine multiple courses into cohesive skill-building journeys. Perfect for career advancement.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-12 bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-secondary/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-3">Search Programs</label>
              <input
                type="text"
                placeholder="Search by title..."
                value={search}
                onChange={handleSearch}
                className="w-full px-4 py-3 bg-background border border-secondary/30 text-foreground rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-3">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={handleDifficultyFilter}
                className="w-full px-4 py-3 bg-background border border-secondary/30 text-foreground rounded-xl focus:ring-2 focus:ring-secondary focus:border-secondary transition-all"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary font-display">{programs.length}</div>
                <div className="text-text-muted text-sm">programs found</div>
              </div>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse">
              <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-2xl border border-secondary/20">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-foreground mb-2 font-display">No programs found</h3>
            <p className="text-text-muted">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => {
              const price = program.fee || 0;
              const discount = program.is_on_promo ? program.fee - program.promo_amount : 0;
              const finalPrice = discount > 0 ? discount : price;

              return (
                <div
                  key={program.id}
                  className="bg-surface/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 glow group"
                >
                  {/* Program Header */}
                  <div
                    className="h-40 flex items-center justify-center relative"
                    style={{ backgroundColor: program.color }}
                  >
                    <div className="text-center text-background">
                      <div className="text-2xl mb-2">{program.title}</div>
                      <div className="text-sm opacity-90">{program.duration_months} months</div>
                    </div>
                    {program.is_featured && (
                      <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                        ⭐ Featured
                      </div>
                    )}
                  </div>

                  {/* Program Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-3 font-display group-hover:text-secondary transition-colors line-clamp-2">
                      {program.title}
                    </h3>

                    {/* Description */}
                    <p className="text-text-muted text-sm mb-4 line-clamp-3">
                      {program.short_description || program.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span>📚</span>
                          <span>{program.courses_count || 0} courses</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full border text-xs ${getDifficultyColor(program.difficulty)}`}>
                          {program.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-col">
                        {discount > 0 ? (
                          <>
                            <span className="text-2xl font-bold text-secondary">
                              ${(finalPrice / 100).toFixed(2)}
                            </span>
                            <span className="text-sm text-text-muted line-through">
                              ${(price / 100).toFixed(2)}
                            </span>
                          </>
                        ) : price > 0 ? (
                          <span className="text-2xl font-bold text-secondary">
                            ${(price / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-green-500">
                            Free
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/programs/${program.id}`}
                        className="text-secondary hover:text-secondary-dark font-medium text-sm transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAddToCart(program)}
                      className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 bg-secondary hover:bg-secondary-dark text-background glow"
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
        {programs.length >= 12 && (
          <div className="mt-16 flex justify-center items-center gap-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-6 py-3 border border-secondary/30 text-secondary rounded-xl hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              ← Previous
            </button>
            <span className="text-foreground font-medium">Page {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={programs.length < 12}
              className="px-6 py-3 border border-secondary/30 text-secondary rounded-xl hover:bg-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProgramsPage;
