'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/services/api';
import PurchaseOptions from '@/components/PurchaseOptions';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

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

interface Filter {
  category: string;
  difficulty: string;
  search: string;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter>({ category: 'all', difficulty: 'all', search: '' });
  const [enrolling, setEnrolling] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState<number | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();
  const { token: authToken, userToken } = useAuth();

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/courses/?skip=0&limit=100`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading courses');
      } finally {
        setLoading(false);
      }
    };

    const fetchEnrolled = async () => {
      if (!authToken) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses/enrolled`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (response.ok) {
          const data = await response.json();
          const ids = new Set<number>(data.map((e: any) => Number(e.course.id)));
          setEnrolledCourseIds(ids);
        }
      } catch (err) {
        console.error('Failed to fetch enrolled courses:', err);
      }
    };

    fetchCourses();
    fetchEnrolled();
  }, [authToken]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || course.category === filters.category;
    const matchesDifficulty = filters.difficulty === 'all' || course.difficulty === filters.difficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleEnroll = async (courseId: number) => {
    if (!authToken && !userToken) {
      // Add to cart and redirect to signup
      const course = courses.find(c => c.id === courseId);
      if (course) {
        try {
          await addToCart({
            item_type: 'course',
            course_id: courseId,
            price: course.fee || 0,
            discount: course.is_on_promo && course.promo_amount ? course.fee - course.promo_amount : 0,
            quantity: 1,
          });
          router.push(`/signup?next=/checkout`);
        } catch (error) {
          alert('Failed to add course to cart');
        }
      }
      return;
    }

    // Find the course to check if it has a fee
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // If course has a fee, show payment checkout
    if (course.fee && course.fee > 0) {
      setShowPayment(courseId);
      return;
    }

    // Free course - enroll directly
    setEnrolling(courseId);

    try {
      const response = await fetch(`${API_BASE_URL}/api/enrollments/${courseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken || userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: null }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Failed to enroll');
      }

      const newEnrolled = new Set(enrolledCourseIds);
      newEnrolled.add(courseId);
      setEnrolledCourseIds(newEnrolled);

      setTimeout(() => router.push(`/learning?courseId=${courseId}`), 500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  const handleViewCourse = (courseId: number) => {
    if (enrolledCourseIds.has(courseId)) {
      router.push(`/learning?courseId=${courseId}`);
    } else {
      router.push(`/course/${courseId}`);
    }
  };

  const categories = ['all', ...new Set(courses.map(c => c.category))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

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
            Explore Our <span className="text-primary glow-text">Courses</span>
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-3xl mx-auto">
            Discover individual courses designed to build specific skills. Each course is crafted for practical, real-world application.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-xl">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-12 bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-3">Search Courses</label>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-primary/30 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-3">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-primary/30 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-foreground text-sm font-medium mb-3">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-primary/30 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary font-display">{filteredCourses.length}</div>
                <div className="text-text-muted text-sm">courses found</div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-surface/50 rounded-2xl border border-primary/20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-foreground mb-2 font-display">No courses found</h3>
            <p className="text-text-muted">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              const isEnrolling = enrolling === course.id;
              const price = course.fee || 0;
              const discount = course.is_on_promo && course.promo_amount ? course.fee - course.promo_amount : 0;
              const finalPrice = discount > 0 ? discount : price;

              return (
                <div
                  key={course.id}
                  className="bg-surface/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 glow group"
                >
                  {/* Course Header */}
                  <div className="h-40 bg-gradient-to-r from-primary via-secondary to-accent flex items-center justify-center relative">
                    <div className="text-center text-background">
                      <div className="text-2xl mb-2">{course.category}</div>
                      <div className="text-sm opacity-90">Level: {course.difficulty}</div>
                    </div>
                    {isEnrolled && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ✓ Enrolled
                      </div>
                    )}
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-foreground mb-3 font-display group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-text-muted text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs text-text-muted mb-6">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{course.duration_hours}h</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📅</span>
                          <span>{new Date(course.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-col">
                        {discount > 0 ? (
                          <>
                            <span className="text-2xl font-bold text-primary">
                              ${(finalPrice / 100).toFixed(2)}
                            </span>
                            <span className="text-sm text-text-muted line-through">
                              ${(price / 100).toFixed(2)}
                            </span>
                          </>
                        ) : price > 0 ? (
                          <span className="text-2xl font-bold text-primary">
                            ${(price / 100).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-lg font-bold text-green-500">
                            Free
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/course/${course.id}`}
                        className="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                      >
                        View Details →
                      </Link>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() =>
                        isEnrolled ? handleViewCourse(course.id) : handleEnroll(course.id)
                      }
                      disabled={isEnrolling}
                      className={`w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                        isEnrolled
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                          : 'bg-primary hover:bg-primary-dark text-background glow'
                      } ${isEnrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isEnrolling ? '⏳ Enrolling...' : isEnrolled ? '→ Continue Learning' : price > 0 ? 'Add to Cart' : 'Enroll Free'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Purchase Options Modal */}
      {showPayment && courses.find(c => c.id === showPayment) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-8 border border-primary/20 relative">
            <button
              onClick={() => setShowPayment(null)}
              className="absolute top-4 right-4 text-foreground hover:text-primary text-xl"
            >
              ✕
            </button>
            <PurchaseOptions
              itemType="course"
              itemId={showPayment}
              itemName={courses.find(c => c.id === showPayment)?.title || 'Course'}
              itemPrice={courses.find(c => c.id === showPayment)?.fee || 0}
              onClose={() => setShowPayment(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
