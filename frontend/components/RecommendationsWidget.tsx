import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/services/api';

interface Recommendation {
  recommended_type: string;
  item_id: number;
  title: string;
  description: string | null;
  reason: string;
  score: number;
  skills_learned: string[];
  duration: number | null;
}

interface RecommendationsWidgetProps {
  userToken: string;
}

export default function RecommendationsWidget({ userToken }: RecommendationsWidgetProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    if (!userToken) return;
    fetchRecommendations();
  }, [userToken]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/recommendations/for-user?limit=3`,
        {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComingSoon = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000); // Hide after 3 seconds
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow-md p-6 border border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>✨</span> Recommended For You
        </h3>
        <Link href="/trending" className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {recommendations.map(rec => (
          <div
            key={rec.item_id}
            className="bg-white rounded-lg p-4 border border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 line-clamp-1">{rec.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{rec.reason}</p>
              </div>
              <div className="ml-2 text-right">
                <div className="text-sm font-bold text-indigo-600">{rec.score}%</div>
                <div className="text-xs text-gray-500">match</div>
              </div>
            </div>

            {rec.skills_learned.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {rec.skills_learned.slice(0, 2).map((skill, idx) => (
                  <span key={idx} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
                {rec.skills_learned.length > 2 && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    +{rec.skills_learned.length - 2} more
                  </span>
                )}
              </div>
            )}

            <Link href={`/course/${rec.item_id}`}>
              <button className="w-full px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold rounded hover:shadow-md transition-all">
                View Course
              </button>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-indigo-200 flex gap-2">
        <Link href="/career-pathways" className="flex-1">
          <button className="w-full px-3 py-2 border border-indigo-300 text-indigo-600 rounded font-semibold hover:bg-indigo-50 transition-all text-sm">
            Career Paths
          </button>
        </Link>
        <Link href="/trending" className="flex-1">
          <button className="w-full px-3 py-2 border border-indigo-300 text-indigo-600 rounded font-semibold hover:bg-indigo-50 transition-all text-sm">
            Trending
          </button>
        </Link>
      </div>

      {/* Recommended Learning Path Section */}
      <div className="mt-6 pt-4 border-t border-indigo-200">
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>🎯</span> Recommended Learning Path
        </h4>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 mb-4">
          <p className="text-sm text-gray-700 mb-3">
            Based on your region (UK) and career goals, we recommend starting with our Data Analyst learning path. This comprehensive program will give you the skills needed for high-demand roles.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleComingSoon}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-all text-sm"
            >
              Start Data Analyst Path
            </button>
            <button
              onClick={handleComingSoon}
              className="flex-1 px-3 py-2 border border-blue-300 text-blue-600 rounded font-semibold hover:bg-blue-50 transition-all text-sm"
            >
              Customize My Path
            </button>
          </div>
        </div>

        {/* Coming Soon Message */}
        {showComingSoon && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-yellow-800 font-semibold">Coming Soon! 🚀</p>
            <p className="text-yellow-700 text-sm">This feature is currently under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}
