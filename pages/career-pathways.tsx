import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { API_BASE_URL } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Head from 'next/head';

interface CareerRole {
  id: number;
  title: string;
  description: string;
  category: string;
  salary_range: string;
  difficulty: string;
  popularity_score: number;
  is_trending: boolean;
  is_featured: boolean;
}

interface CareerPathway {
  id: number;
  career_role_id: number;
  title: string;
  description: string;
  duration_months: number;
  difficulty: string;
  completion_percentage: number;
  students_count: number;
  popularity_score: number;
}

export default function CareerPathways() {
  const router = useRouter();
  const { userToken } = useAuth();
  const [careerRoles, setCareerRoles] = useState<CareerRole[]>([]);
  const [pathways, setPathways] = useState<CareerPathway[]>([]);
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'trending' | 'featured'>('all');

  useEffect(() => {
    fetchCareerData();
  }, []);

  const fetchCareerData = async () => {
    try {
      setLoading(true);
      const [rolesRes, pathwaysRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/recommendations/career-roles?limit=20`),
        fetch(`${API_BASE_URL}/api/recommendations/career-pathways?limit=20`)
      ]);

      if (!rolesRes.ok || !pathwaysRes.ok) throw new Error('Failed to fetch data');

      const rolesData = await rolesRes.json();
      const pathwaysData = await pathwaysRes.json();

      setCareerRoles(rolesData);
      setPathways(pathwaysData);
      if (rolesData.length > 0) setSelectedRole(rolesData[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load career data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = careerRoles.filter(role => {
    if (filter === 'trending') return role.is_trending;
    if (filter === 'featured') return role.is_featured;
    return true;
  });

  const selectedPathways = pathways.filter(
    p => !selectedRole || p.career_role_id === selectedRole.id
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const enrollInPathway = async (pathwayId: number) => {
    if (!userToken) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/recommendations/user/career-pathway/${pathwayId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        alert('Successfully enrolled in career pathway! Start learning the recommended courses.');
        router.push('/learning');
      } else {
        alert('Failed to enroll in pathway');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Error enrolling in pathway');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
        <Head>
          <title>Career Pathways - Sabipath</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading career pathways...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-8 px-4">
      <Head>
        <title>Career Pathways - Sabipath</title>
        <meta name="description" content="Explore career pathways and choose your learning journey" />
      </Head>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Career Pathways</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose a career path aligned with your goals and start learning with our structured curriculum
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-800">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          {['all', 'trending', 'featured'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Career Roles Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                <h2 className="text-xl font-bold">Career Roles</h2>
              </div>
              <div className="divide-y">
                {filteredRoles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full text-left p-4 transition-all border-l-4 ${
                      selectedRole?.id === role.id
                        ? 'bg-indigo-50 border-indigo-600'
                        : 'bg-white border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{role.title}</h3>
                      {role.is_trending && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          🔥 Trending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{role.category}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(role.difficulty)}`}>
                        {role.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">⭐ {role.popularity_score}/100</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Career Details and Pathways */}
          <div className="lg:col-span-2 space-y-8">
            {/* Selected Role Details */}
            {selectedRole && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">{selectedRole.title}</h2>
                  <p className="text-indigo-100 mb-4">{selectedRole.category}</p>
                  <p className="text-lg mb-6 leading-relaxed">{selectedRole.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-indigo-100 text-sm">Salary Range</p>
                      <p className="text-xl font-bold">{selectedRole.salary_range}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-indigo-100 text-sm">Difficulty</p>
                      <p className="text-xl font-bold capitalize">{selectedRole.difficulty}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-indigo-100 text-sm">Market Demand</p>
                      <p className="text-xl font-bold">{selectedRole.popularity_score}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pathways Grid */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Learning Pathways {selectedRole && `for ${selectedRole.title}`}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {selectedPathways.length > 0 ? (
                  selectedPathways.map(pathway => (
                    <div
                      key={pathway.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 border border-gray-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{pathway.title}</h4>
                          <p className="text-gray-600 text-sm mb-3">{pathway.description}</p>
                          
                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center text-gray-600">
                              <span className="mr-1">⏱️</span>
                              <span>{pathway.duration_months} months</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="mr-1">👥</span>
                              <span>{pathway.students_count} students</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="mr-1">📊</span>
                              <span>{pathway.completion_percentage}% complete</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full"
                              style={{ width: `${pathway.completion_percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-indigo-600">
                              {pathway.popularity_score}%
                            </p>
                            <p className="text-xs text-gray-500">Popular</p>
                          </div>
                          <button
                            onClick={() => enrollInPathway(pathway.id)}
                            className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                          >
                            {userToken ? 'Enroll Now' : 'Sign In to Enroll'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No pathways available for this role yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-lg p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
            Choose a career path aligned with your goals and unlock your potential with our comprehensive curriculum
          </p>
          {!userToken && (
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition-all inline-block"
            >
              Sign Up Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
