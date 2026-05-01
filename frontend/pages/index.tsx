'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { API_BASE_URL } from '@/services/api';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  status: string;
  created_at: string;
  fee: number;
  promo_amount?: number;
  is_on_promo?: boolean;
}

interface Program {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  status: string;
  created_at: string;
  fee: number;
  promo_amount?: number;
  is_on_promo?: boolean;
}

interface Diploma {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  status: string;
  created_at: string;
  fee: number;
  promo_amount?: number;
  is_on_promo?: boolean;
}

export default function Home() {
  const { token, loading, userToken } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'programs' | 'diplomas'>('courses');

  useEffect(() => {
    if (!loading && token) {
      router.push('/dashboard');
    }
  }, [token, loading, router]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        const [coursesRes, programsRes, diplomasRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/courses/?skip=0&limit=12`),
          fetch(`${API_BASE_URL}/api/programs/?skip=0&limit=12`),
          fetch(`${API_BASE_URL}/api/diplomas/?skip=0&limit=12`),
        ]);

        const [coursesData, programsData, diplomasData] = await Promise.all([
          coursesRes.ok ? coursesRes.json() : [],
          programsRes.ok ? programsRes.json() : [],
          diplomasRes.ok ? diplomasRes.json() : [],
        ]);

        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setPrograms(Array.isArray(programsData) ? programsData : []);
        setDiplomas(Array.isArray(diplomasData) ? diplomasData : []);
      } catch (err) {
        console.error('Failed to load catalog items:', err);
      } finally {
        setCatalogLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleAddToCart = async (item: any, type: 'course' | 'program' | 'diploma') => {
    try {
      await addToCart({
        item_type: type,
        [`${type}_id`]: item.id,
        price: item.fee || 0,
        discount: item.is_on_promo && item.promo_amount ? item.fee - item.promo_amount : 0,
        quantity: 1,
      });

      if (!token && !userToken) {
        router.push(`/signup?next=/checkout`);
      } else {
        router.push('/checkout');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const renderItemCard = (item: any, type: 'course' | 'program' | 'diploma') => {
    const price = item.fee || 0;
    const discount = item.is_on_promo && item.promo_amount ? item.fee - item.promo_amount : 0;
    const finalPrice = discount > 0 ? discount : price;

    return (
      <div key={item.id} className="bg-surface/80 backdrop-blur-sm rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow group">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
              {item.category}
            </span>
            <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
              {item.difficulty}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2 font-display group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          <p className="text-text-muted text-sm line-clamp-2 mb-3">
            {item.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>⏱️ {item.duration_hours}h</span>
            <span>📚 {type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {discount > 0 ? (
              <>
                <span className="text-lg font-bold text-primary">
                  ${(finalPrice / 100).toFixed(2)}
                </span>
                <span className="text-sm text-text-muted line-through">
                  ${(price / 100).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                ${(price / 100).toFixed(2)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Link
              href={`/${type}s/${item.id}`}
              className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
            >
              View Details
            </Link>
            <button
              onClick={() => handleAddToCart(item, type)}
              className="bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-dark font-medium text-sm transition-all hover:scale-105"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-text-muted ml-4">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto relative">
        <div className="flex items-center gap-10">
          <div className="text-3xl font-bold text-foreground font-display glow-text">Sabipath</div>
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight font-display">
            Land Your Tech Career<br />
            <span className="text-primary glow-text">Faster</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
            Learn real skills. Build a real portfolio. Get hired. No fluff, no gatekeeping—just a region-aware career operating system built for you.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24">
          <Link href="/signup" className="bg-primary text-background px-10 py-5 rounded-xl hover:bg-primary-dark font-semibold text-lg glow transition-all hover:scale-105 hover:shadow-2xl">
            Start for free
          </Link>
          <Link href="/#marketplace" className="border-2 border-primary/50 text-primary px-10 py-5 rounded-xl hover:bg-primary/10 hover:border-primary font-semibold text-lg transition-all hover:scale-105">
            Browse Courses
          </Link>
        </div>

        {/* Marketplace Section */}
        <div id="marketplace" className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-display">Explore Our Marketplace</h2>
            <p className="text-text-muted text-lg">Choose from courses, programs, or complete diploma paths</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-surface/50 rounded-xl p-1 border border-primary/20">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'courses'
                    ? 'bg-primary text-background shadow-lg'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Courses ({courses.length})
              </button>
              <button
                onClick={() => setActiveTab('programs')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'programs'
                    ? 'bg-primary text-background shadow-lg'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Programs ({programs.length})
              </button>
              <button
                onClick={() => setActiveTab('diplomas')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'diplomas'
                    ? 'bg-primary text-background shadow-lg'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Diplomas ({diplomas.length})
              </button>
            </div>
          </div>

          {/* Content Grid */}
          {catalogLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'courses' && courses.map(course => renderItemCard(course, 'course'))}
              {activeTab === 'programs' && programs.map(program => renderItemCard(program, 'program'))}
              {activeTab === 'diplomas' && diplomas.map(diploma => renderItemCard(diploma, 'diploma'))}
            </div>
          )}

          {/* View All Links */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/courses"
                className="bg-primary/10 border border-primary/30 text-primary px-8 py-4 rounded-xl hover:bg-primary/20 hover:border-primary font-semibold transition-all hover:scale-105"
              >
                View All Courses →
              </Link>
              <Link
                href="/programs"
                className="bg-secondary/10 border border-secondary/30 text-secondary px-8 py-4 rounded-xl hover:bg-secondary/20 hover:border-secondary font-semibold transition-all hover:scale-105"
              >
                View All Programs →
              </Link>
              <Link
                href="/diplomas"
                className="bg-accent/10 border border-accent/30 text-accent px-8 py-4 rounded-xl hover:bg-accent/20 hover:border-accent font-semibold transition-all hover:scale-105"
              >
                View All Diplomas →
              </Link>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">🚀</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Accelerated Learning</h3>
            <p className="text-text-muted leading-relaxed">
              Structured programs designed with employers in mind. Get from zero to job-ready in weeks, not years.
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Portfolio Builder</h3>
            <p className="text-text-muted leading-relaxed">
              Create portfolio projects that employers actually care about. No generic apps—real, impactful work.
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">⚡</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">AI-Powered Career</h3>
            <p className="text-text-muted leading-relaxed">
              Smart career guidance, interview prep, and job matching. Your competitive advantage in tech.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-surface/50 rounded-xl p-8 border border-primary/20">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-display">2-3 weeks</div>
            <p className="text-text-muted">From signup to job-ready</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-8 border border-secondary/20">
            <div className="text-4xl md:text-5xl font-bold text-secondary mb-2 font-display">UK, IE, EU</div>
            <p className="text-text-muted">Region-aware, not generic</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-8 border border-accent/20">
            <div className="text-4xl md:text-5xl font-bold text-accent mb-2 font-display">100% Free</div>
            <p className="text-text-muted">No gatekeeping</p>
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <div className="text-center py-24 border-t border-primary/20 bg-surface/30">
        <h2 className="text-4xl font-bold text-foreground mb-6 font-display">Ready to start?</h2>
        <p className="text-text-muted mb-10 text-lg">Join hundreds learning real tech skills</p>
        <Link href="/signup" className="bg-primary text-background px-10 py-5 rounded-xl hover:bg-primary-dark font-semibold text-lg glow transition-all hover:scale-105 hover:shadow-2xl inline-block">
          Get started free
        </Link>
      </div>
    </div>
  );
}
