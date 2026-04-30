import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/services/api';
import PaymentCheckout from '@/components/PaymentCheckout';

const DiplomaDetailsPage = () => {
  const router = useRouter();
  const { diplomaId } = router.query;
  const { token } = useAuth();
  const isAuthenticated = Boolean(token);
  
  const [diploma, setDiploma] = useState<any | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (diplomaId) {
      fetchDiploma();
      if (isAuthenticated) {
        fetchEnrollment();
      }
    }
  }, [diplomaId, isAuthenticated]);

  const fetchDiploma = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/diplomas/${diplomaId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch diploma');
      }

      const data = await response.json();
      setDiploma(data);

      // Fetch programs in the diploma
      if (data.programs && data.programs.length > 0) {
        setPrograms(data.programs);
      }

      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('Error fetching diploma:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollment = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/diploma-enrollments/${diplomaId}/my-enrollment`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEnrollment(data);
        
        // Fetch progress
        const progressResponse = await fetch(
          `${API_BASE_URL}/api/diploma-enrollments/${diplomaId}/diploma-progress`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress(progressData);
        }
      }
    } catch (err) {
      console.error('Error fetching enrollment:', err);
    }
  };

  const handleEnroll = async () => {
    // If diploma has a fee, show payment checkout
    if (diploma?.fee && diploma.fee > 0) {
      setShowPayment(true);
      return;
    }

    // Free diploma - enroll directly
    try {
      setEnrolling(true);
      const response = await fetch(
        `${API_BASE_URL}/api/diploma-enrollments/${diplomaId}/enroll`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ payment_id: null })
        }
      );

      if (!response.ok) {
        throw new Error('Enrollment failed');
      }

      const data = await response.json();
      alert(data.message);
      await fetchEnrollment();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Error: ' + message);
      console.error('Error enrolling:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/diploma-enrollments/${diplomaId}/start-learning`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start learning');
      }

      router.push(`/learning?type=diploma&id=${diplomaId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Error: ' + message);
      console.error('Error starting learning:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!diploma) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Diploma not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {diploma.image_url && (
            <img
              src={diploma.image_url}
              alt={diploma.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{diploma.title}</h1>
          
          <div className="grid grid-cols-3 gap-4 mb-6 text-gray-600">
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-semibold">{diploma.level}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold">{diploma.duration_years} year{diploma.duration_years > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Programs</p>
              <p className="font-semibold">{programs.length}</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{diploma.description}</p>

          {/* Enrollment Section */}
          <div className="border-t pt-6">
            {!isAuthenticated ? (
              <Link href="/login">
                <button className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700">
                  Sign in to Enroll
                </button>
              </Link>
            ) : enrollment ? (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-700">
                    Enrolled since {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
                {progress && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Overall Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${progress.progress_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{progress.progress_percentage}% complete</p>
                  </div>
                )}
                {enrollment.status === 'enrolled' && (
                  <button
                    onClick={handleStartLearning}
                    className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700"
                  >
                    Start Learning
                  </button>
                )}
                {enrollment.status === 'active' && (
                  <button
                    onClick={handleStartLearning}
                    className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700"
                  >
                    Continue Learning
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>

        {/* Programs List */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Programs in this Diploma</h2>
          
          {programs.length === 0 ? (
            <p className="text-gray-500">No programs available</p>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <Link key={program.id} href={`/programs/${program.id}`}>
                  <div className="cursor-pointer border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{program.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{program.short_description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{program.difficulty}</span>
                          <span>{program.courses ? program.courses.length : 0} courses</span>
                        </div>
                      </div>
                      <button className="text-purple-600 hover:text-purple-700 font-semibold">
                        View →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 border border-gray-200 relative">
              <button
                onClick={() => setShowPayment(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              <PaymentCheckout
                itemType="diploma"
                itemId={Number(diplomaId)}
                itemName={diploma?.title || 'Diploma'}
                amount={diploma?.fee || 0}
                currency="gbp"
                onSuccess={() => {
                  setShowPayment(false);
                  // Diploma enrollment will be completed via webhook
                  setTimeout(() => {
                    fetchEnrollment();
                  }, 2000);
                }}
                onError={(error) => {
                  alert(`Payment error: ${error}`);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiplomaDetailsPage;
