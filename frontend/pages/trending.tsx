import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { API_BASE_URL } from '@/services/api';
import Head from 'next/head';

interface TrendingCourse {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  category_name: string;
  enrollment_count: number;
  completion_rate: number;
  trending_score: number;
  icon: string | null;
}

interface TrendingSkill {
  id: number;
  name: string;
  category: string | null;
  demand_score: number;
  popularity_score: number;
  courses_count: number;
  related_jobs: number;
}

export default function Trending() {
  const router = useRouter();
  const [courses, setCourses] = useState<TrendingCourse[]>([]);
  const [skills, setSkills] = useState<TrendingSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'courses' | 'skills'>('courses');

  useEffect(() => {
    fetchTrendingData();
  }, []);

  const fetchTrendingData = async () => {
    try {
      setLoading(true);
      const [coursesRes, skillsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/recommendations/trending/courses?limit=20`),
        fetch(`${API_BASE_URL}/api/recommendations/trending/skills?limit=15`)
      ]);

      if (!coursesRes.ok || !skillsRes.ok) throw new Error('Failed to fetch data');

      const coursesData = await coursesRes.json();
      const skillsData = await skillsRes.json();

      setCourses(coursesData);
      setSkills(skillsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trending data');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'intermediate':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'advanced':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const getTrendingColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-orange-500';
    if (score >= 60) return 'from-orange-500 to-yellow-500';
    return 'from-blue-500 to-cyan-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <Head>
          <title>Trending - Sabipath</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trending content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
      <Head>
        <title>Trending Courses & Skills - Sabipath</title>
        <meta name="description" content="Discover trending courses and in-demand skills" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🔥</span>
            <h1 className="text-4xl font-bold text-gray-900">What's Trending</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl">
            Discover the most popular courses and in-demand skills based on student enrollment and market demand
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-800">
            {error}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setView('courses')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'courses'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
            }`}
          >
            📚 Trending Courses
          </button>
          <button
            onClick={() => setView('skills')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              view === 'skills'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
            }`}
          >
            💡 In-Demand Skills
          </button>
        </div>

        {/* Trending Courses View */}
        {view === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course, index) => (
                <div
                  key={course.id}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200"
                >
                  {/* Trending Badge */}
                  {index < 3 && (
                    <div
                      className={`h-1 bg-gradient-to-r ${getTrendingColor(course.trending_score)}`}
                    ></div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors flex-1">
                        {course.title}
                      </h3>
                      {index < 3 && (
                        <span className="ml-2 text-2xl">🏆</span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Category & Difficulty */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                        {course.category_name}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                          course.difficulty
                        ).bg} ${getDifficultyColor(course.difficulty).text}`}
                      >
                        {course.difficulty}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">👥 Students</span>
                        <span className="font-semibold text-gray-900">
                          {course.enrollment_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">✅ Completion Rate</span>
                        <span className="font-semibold text-gray-900">{course.completion_rate}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">🔥 Trending Score</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getTrendingColor(
                                course.trending_score
                              )}`}
                              style={{ width: `${Math.min(course.trending_score, 100)}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-gray-900 w-8">
                            {course.trending_score}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link href={`/course/${course.id}`}>
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                        View Course
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 col-span-full">
                <p className="text-gray-500 text-lg">No trending courses available</p>
              </div>
            )}
          </div>
        )}

        {/* In-Demand Skills View */}
        {view === 'skills' && (
          <div className="space-y-4">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={skill.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 border border-gray-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{index < 3 ? '🌟' : '💼'}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{skill.name}</h3>
                          {skill.category && (
                            <p className="text-sm text-gray-600">{skill.category}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">{skill.demand_score}</p>
                        <p className="text-xs text-gray-600">Job Demand</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{skill.popularity_score}</p>
                        <p className="text-xs text-gray-600">Popularity</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{skill.courses_count}</p>
                        <p className="text-xs text-gray-600">Courses</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="mt-4 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Market Demand</span>
                        <span className="font-semibold text-gray-900">{skill.demand_score}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${skill.demand_score}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Popularity</span>
                        <span className="font-semibold text-gray-900">{skill.popularity_score}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                          style={{ width: `${skill.popularity_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No trending skills available</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Explore Your Career Path</h2>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            Check out our curated career pathways to find structured learning journeys aligned with trending skills
          </p>
          <Link href="/career-pathways">
            <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition-all">
              View Career Pathways
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
