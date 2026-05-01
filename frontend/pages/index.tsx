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

  const renderEnhancedItemCard = (item: any, type: 'course' | 'program' | 'diploma') => {
    const price = item.fee || 0;
    const discount = item.is_on_promo && item.promo_amount ? item.fee - item.promo_amount : 0;
    const finalPrice = discount > 0 ? discount : price;
    const savings = discount > 0 ? ((discount / price) * 100).toFixed(0) : 0;

    // Mock social proof data (in real app, this would come from API)
    const enrolledCount = Math.floor(Math.random() * 500) + 50;
    const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
    const reviewCount = Math.floor(Math.random() * 50) + 5;

    return (
      <div key={item.id} className="group bg-surface/90 backdrop-blur-sm rounded-2xl overflow-hidden border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 hover:shadow-2xl glow">
        {/* Header with badges */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">
                {type === 'course' ? '📚' : type === 'program' ? '🎯' : '🏆'}
              </div>
              <p className="text-xs font-medium text-foreground/80">{item.category}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {item.is_on_promo && (
              <span className="bg-secondary text-background px-2 py-1 rounded-full text-xs font-bold border border-secondary/50">
                🔥 {savings}% OFF
              </span>
            )}
            <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-semibold border border-primary/30">
              {item.difficulty}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border border-primary/20">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-xs">⭐</span>
              <span className="text-xs font-semibold text-foreground">{rating}</span>
              <span className="text-xs text-text-muted">({reviewCount})</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors font-display">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-text-muted text-sm mb-4 line-clamp-2">{item.description}</p>

          {/* Social Proof */}
          <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              👥 {enrolledCount} enrolled
            </span>
            <span className="flex items-center gap-1">
              ⏱️ {item.duration_hours}h
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              {discount > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ${(finalPrice / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-text-muted line-through">
                      ${(price / 100).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs text-secondary font-semibold">
                    Save ${(discount / 100).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-primary">
                  ${(price / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* Urgency indicator */}
            <div className="text-right">
              <span className="text-xs text-accent font-semibold bg-accent/10 px-2 py-1 rounded-full border border-accent/20">
                ⚡ Limited time
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Link
              href={`/${type}s/${item.id}`}
              className="flex-1 text-center bg-surface-light hover:bg-surface border border-primary/30 text-primary py-2 px-4 rounded-lg font-medium text-sm transition-all hover:border-primary/60"
            >
              View Details
            </Link>
            <button
              onClick={() => handleAddToCart(item, type)}
              className="flex-1 bg-primary hover:bg-primary-dark text-background py-2 px-4 rounded-lg font-semibold text-sm transition-all hover:scale-105 glow"
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

      {/* Enhanced Hero Section - Career Growth Focus */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight font-display">
            Build <span className="text-primary glow-text">In-Demand Skills</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
            Advance your tech career with expert-led courses, comprehensive programs, and industry-recognized diplomas. Learn at your own pace and earn credentials that matter.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <div className="bg-surface/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-primary/20">
              <span className="text-primary font-semibold">📚 100+ Courses</span>
            </div>
            <div className="bg-surface/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-secondary/20">
              <span className="text-secondary font-semibold">🎯 Career Programs</span>
            </div>
            <div className="bg-surface/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-accent/20">
              <span className="text-accent font-semibold">🏆 Professional Diplomas</span>
            </div>
          </div>
        </div>

        {/* Quick Explore CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24">
          <Link href="#learning" className="bg-primary text-background px-10 py-5 rounded-xl hover:bg-primary-dark font-semibold text-lg glow transition-all hover:scale-105 hover:shadow-2xl">
            Explore Your Options
          </Link>
          <Link href="/signup" className="border-2 border-primary/50 text-primary px-10 py-5 rounded-xl hover:bg-primary/10 hover:border-primary font-semibold text-lg transition-all hover:scale-105">
            Create Free Account
          </Link>
        </div>

        {/* Learning Pathways Section - Enhanced */}
        <div id="learning" className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-foreground mb-6 font-display glow-text">
              Choose Your Learning Path
            </h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              From individual courses to comprehensive diplomas, find the right learning path for your career goals. Learn, practice, and earn credentials.
            </p>
          </div>

          {/* Top Courses Carousel - Learning Style */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center font-display">⭐ Popular Courses</h3>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 p-8 border border-primary/20">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {courses.slice(0, 3).map((course, index) => {
                  const price = course.fee || 0;
                  const discount = course.is_on_promo && course.promo_amount ? course.fee - course.promo_amount : 0;
                  const finalPrice = discount > 0 ? discount : price;
                  const enrolledCount = Math.floor(Math.random() * 200) + 50;

                  return (
                    <div key={course.id} className="flex-shrink-0 w-80 bg-surface/90 backdrop-blur-sm rounded-2xl p-6 border border-primary/30 hover:border-primary/60 transition-all hover:scale-105 glow group">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/30">
                          ⭐ Top Rated
                        </span>
                        <span className="text-xs text-text-muted">#{index + 1}</span>
                      </div>
                      <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h4>
                      <p className="text-text-muted text-sm mb-4 line-clamp-2">{course.description}</p>

                      {/* Social Proof */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1">
                          👥 {enrolledCount} enrolled
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ {course.duration_hours}h
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          {discount > 0 ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-primary">
                                  ${(finalPrice / 100).toFixed(2)}
                                </span>
                                <span className="text-sm text-text-muted line-through">
                                  ${(price / 100).toFixed(2)}
                                </span>
                              </div>
                              <span className="text-xs text-secondary font-semibold">
                                Save ${(discount / 100).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-bold text-primary">
                              ${(price / 100).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(course, 'course')}
                        className="w-full bg-primary text-background px-4 py-2 rounded-lg hover:bg-primary-dark font-semibold text-sm transition-all hover:scale-105 glow"
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Tabs with Enhanced Design */}
          <div className="mb-12">
            <div className="flex justify-center">
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-2 border border-primary/20 shadow-2xl">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-8 py-4 rounded-xl font-semibold text-sm transition-all relative ${
                    activeTab === 'courses'
                      ? 'bg-primary text-background shadow-lg glow'
                      : 'text-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  📚 Courses ({courses.length})
                  {activeTab === 'courses' && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('programs')}
                  className={`px-8 py-4 rounded-xl font-semibold text-sm transition-all relative ${
                    activeTab === 'programs'
                      ? 'bg-secondary text-background shadow-lg glow'
                      : 'text-foreground hover:text-secondary hover:bg-secondary/10'
                  }`}
                >
                  🎯 Programs ({programs.length})
                  {activeTab === 'programs' && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-secondary rounded-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('diplomas')}
                  className={`px-8 py-4 rounded-xl font-semibold text-sm transition-all relative ${
                    activeTab === 'diplomas'
                      ? 'bg-accent text-background shadow-lg glow'
                      : 'text-foreground hover:text-accent hover:bg-accent/10'
                  }`}
                >
                  🏆 Diplomas ({diplomas.length})
                  {activeTab === 'diplomas' && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-accent rounded-full"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Product Grid */}
          {catalogLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin animation-delay-300"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin animation-delay-600"></div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeTab === 'courses' && courses.slice(0, 9).map(course => renderEnhancedItemCard(course, 'course'))}
              {activeTab === 'programs' && programs.slice(0, 9).map(program => renderEnhancedItemCard(program, 'program'))}
              {activeTab === 'diplomas' && diplomas.slice(0, 9).map(diploma => renderEnhancedItemCard(diploma, 'diploma'))}
            </div>
          )}

          {/* Learning Options Section */}
          <div className="mb-24 py-16 border-t border-b border-primary/20">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-foreground mb-6 font-display">Choose Your Learning Path</h3>
              <p className="text-lg text-text-muted max-w-3xl mx-auto mb-12">
                Whether you're looking to master a single skill, complete a comprehensive program, or earn a professional diploma, we have flexible options to fit your goals and budget.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Single Courses */}
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow text-center">
                <div className="text-5xl mb-4">📚</div>
                <h4 className="text-2xl font-bold text-foreground mb-3 font-display">Single Courses</h4>
                <p className="text-text-muted mb-4 text-sm leading-relaxed">
                  Learn specific skills in focused, self-paced courses. Perfect for upskilling in targeted areas.
                </p>
                <div className="text-primary font-semibold text-lg mb-4">One-time purchase</div>
                <Link
                  href="/courses"
                  className="inline-block bg-primary/20 text-primary hover:bg-primary hover:text-background px-6 py-2 rounded-lg font-semibold text-sm transition-all"
                >
                  Browse Courses →
                </Link>
              </div>

              {/* Career Programs */}
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 glow text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h4 className="text-2xl font-bold text-foreground mb-3 font-display">Career Programs</h4>
                <p className="text-text-muted mb-4 text-sm leading-relaxed">
                  Complete structured learning paths combining multiple courses. Build comprehensive skills for career transitions.
                </p>
                <div className="text-secondary font-semibold text-lg mb-4">Comprehensive package</div>
                <Link
                  href="/programs"
                  className="inline-block bg-secondary/20 text-secondary hover:bg-secondary hover:text-background px-6 py-2 rounded-lg font-semibold text-sm transition-all"
                >
                  View Programs →
                </Link>
              </div>

              {/* Professional Diplomas */}
              <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 glow text-center">
                <div className="text-5xl mb-4">🏆</div>
                <h4 className="text-2xl font-bold text-foreground mb-3 font-display">Diplomas</h4>
                <p className="text-text-muted mb-4 text-sm leading-relaxed">
                  Earn industry-recognized credentials. Showcase your expertise with verified diplomas employers trust.
                </p>
                <div className="text-accent font-semibold text-lg mb-4">Professional credential</div>
                <Link
                  href="/diplomas"
                  className="inline-block bg-accent/20 text-accent hover:bg-accent hover:text-background px-6 py-2 rounded-lg font-semibold text-sm transition-all"
                >
                  Explore Diplomas →
                </Link>
              </div>

              {/* Monthly Subscription */}
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-primary/40 hover:border-primary/60 transition-all hover:scale-105 glow text-center ring-2 ring-primary/20">
                <div className="text-5xl mb-4">⭐</div>
                <h4 className="text-2xl font-bold text-foreground mb-1 font-display">Monthly Plan</h4>
                <p className="text-primary font-semibold text-sm mb-3">Coming Soon</p>
                <p className="text-text-muted mb-6 text-sm leading-relaxed">
                  Unlimited access to all courses, programs, and new content monthly. Perfect for continuous learners and career changers.
                </p>
                <div className="text-primary font-semibold text-lg mb-4">Flexible subscription</div>
                <button
                  disabled
                  className="inline-block bg-primary/30 text-primary/70 px-6 py-2 rounded-lg font-semibold text-sm cursor-not-allowed opacity-60"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced View All Section - Learning Focus */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-surface/50 via-surface/30 to-surface/50 rounded-3xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Ready to Start Learning?</h3>
              <p className="text-text-muted mb-8">Explore our complete catalog of courses, programs, and diplomas tailored to your career goals</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/courses"
                  className="group bg-primary/10 border-2 border-primary/50 text-primary px-8 py-4 rounded-xl hover:bg-primary hover:text-background font-semibold transition-all hover:scale-105 glow hover:shadow-2xl"
                >
                  <span className="flex items-center gap-2">
                    📚 Explore Courses
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <Link
                  href="/programs"
                  className="group bg-secondary/10 border-2 border-secondary/50 text-secondary px-8 py-4 rounded-xl hover:bg-secondary hover:text-background font-semibold transition-all hover:scale-105 glow hover:shadow-2xl"
                >
                  <span className="flex items-center gap-2">
                    🎯 View Career Programs
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <Link
                  href="/diplomas"
                  className="group bg-accent/10 border-2 border-accent/50 text-accent px-8 py-4 rounded-xl hover:bg-accent hover:text-background font-semibold transition-all hover:scale-105 glow hover:shadow-2xl"
                >
                  <span className="flex items-center gap-2">
                    🏆 Get Certified
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Platform Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">🎓</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Expert-Led Courses</h3>
            <p className="text-text-muted leading-relaxed">
              Learn from industry professionals with real-world experience. Gain practical skills through hands-on projects and real-world applications.
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-secondary/20 hover:border-secondary/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">📈</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Career Advancement</h3>
            <p className="text-text-muted leading-relaxed">
              Earn recognized credentials that boost your resume. Advance your career with skills that employers demand in today's job market.
            </p>
          </div>

          <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 text-left border border-accent/20 hover:border-accent/40 transition-all hover:scale-105 glow">
            <div className="text-5xl mb-6">🔄</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 font-display">Learn at Your Pace</h3>
            <p className="text-text-muted leading-relaxed">
              Flexible learning with lifetime access to course materials. Balance learning with your work and personal life on your own schedule.
            </p>
          </div>
        </div>

        {/* Marketplace Stats */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-surface/50 rounded-xl p-8 border border-primary/20">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-display">100+</div>
            <p className="text-text-muted">Premium Courses</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-8 border border-secondary/20">
            <div className="text-4xl md:text-5xl font-bold text-secondary mb-2 font-display">50K+</div>
            <p className="text-text-muted">Students Enrolled</p>
          </div>
          <div className="bg-surface/50 rounded-xl p-8 border border-accent/20">
            <div className="text-4xl md:text-5xl font-bold text-accent mb-2 font-display">4.8⭐</div>
            <p className="text-text-muted">Average Rating</p>
          </div>
        </div>
      </main>

      {/* Footer CTA - Learning Journey Focus */}
      <div className="text-center py-24 border-t border-primary/20 bg-surface/30">
        <h2 className="text-4xl font-bold text-foreground mb-6 font-display">Take Your Next Career Step</h2>
        <p className="text-text-muted mb-10 text-lg">Start learning today with courses, programs, and diplomas designed for your career success</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="#learning" className="bg-primary text-background px-10 py-5 rounded-xl hover:bg-primary-dark font-semibold text-lg glow transition-all hover:scale-105 hover:shadow-2xl">
            Start Learning Today
          </Link>
          <Link href="/signup" className="border-2 border-primary/50 text-primary px-10 py-5 rounded-xl hover:bg-primary/10 hover:border-primary font-semibold text-lg transition-all hover:scale-105">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
}
