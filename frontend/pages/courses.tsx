'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/services/api';
import PurchaseOptions from '@/components/PurchaseOptions';
import { useCart } from '@/context/CartContext';

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

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const userToken = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null;

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
    <main className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Explore Courses</h1>
          <p className="text-gray-400">Discover and enroll in courses to level up your skills</p>
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
              <label className="block text-gray-400 text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
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
              <label className="block text-gray-400 text-sm font-medium mb-2">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-gray-400">
                <span className="text-cyan-400 font-bold text-lg">{filteredCourses.length}</span>
                <span> courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 mt-4">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-lg">No courses found</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              const isEnrolling = enrolling === course.id;

              return (
                <div
                  key={course.id}
                  className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
                >
                  {/* Course Header */}
                  <div className="h-32 bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white text-sm font-medium">{course.category}</p>
                      <p className="text-cyan-100 text-xs mt-1">Level: {course.difficulty}</p>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>

                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>

                    {/* Meta Info */}
                    <div className="flex gap-4 text-xs text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{course.duration_hours} hours</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(course.created_at).toLocaleDateString()}</span>
                      </div>
                      {course.fee > 0 && (
                        <div className="flex items-center gap-1">
                          <span>💷</span>
                          <span>
                            {course.is_on_promo && course.promo_amount ? (
                              <>
                                <span className="line-through">{(course.fee / 100).toFixed(2)}</span> £{(course.promo_amount / 100).toFixed(2)}
                              </>
                            ) : (
                              `£${(course.fee / 100).toFixed(2)}`
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    {isEnrolled && (
                      <div className="inline-block px-3 py-1 bg-green-900/30 border border-green-600 text-green-300 rounded-full text-xs font-medium mb-4">
                        ✓ Enrolled
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() =>
                        isEnrolled ? handleViewCourse(course.id) : handleEnroll(course.id)
                      }
                      disabled={isEnrolling}
                      className={`w-full py-2 rounded-lg font-medium transition-all ${
                        isEnrolled
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      } ${isEnrolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isEnrolling ? '⏳ Enrolling...' : isEnrolled ? '→ Continue Learning' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Purchase Options Modal */}
      {showPayment && courses.find(c => c.id === showPayment) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-6 border border-gray-700 relative">
            <button
              onClick={() => setShowPayment(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
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
    </main>
  );
}
