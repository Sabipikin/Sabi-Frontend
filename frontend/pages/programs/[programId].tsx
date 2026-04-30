import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/services/api';
import PaymentCheckout from '@/components/PaymentCheckout';

const ProgramDetailsPage = () => {
  const router = useRouter();
  const { programId } = router.query;
  const { token } = useAuth();
  const isAuthenticated = Boolean(token);
  
  const [program, setProgram] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollment, setEnrollment] = useState<any | null>(null);
  const [progress, setProgress] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (programId) {
      fetchProgram();
      if (isAuthenticated) {
        fetchEnrollment();
      }
    }
  }, [programId, isAuthenticated]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/programs/${programId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch program');
      }

      const data = await response.json();
      setProgram(data);

      // Fetch courses in the program
      const coursesResponse = await fetch(`${API_BASE_URL}/api/programs/${programId}/courses`);
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData);
      }

      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      console.error('Error fetching program:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollment = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/program-enrollments/${programId}/my-enrollment`,
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
          `${API_BASE_URL}/api/program-enrollments/${programId}/program-progress`,
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
    // If program has a fee, show payment checkout
    if (program?.fee && program.fee > 0) {
      setShowPayment(true);
      return;
    }

    // Free program - enroll directly
    try {
      setEnrolling(true);
      const response = await fetch(
        `${API_BASE_URL}/api/program-enrollments/${programId}/enroll`,
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
        `${API_BASE_URL}/api/program-enrollments/${programId}/start-learning`,
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

      router.push(`/learning?type=program&id=${programId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert('Error: ' + message);
      console.error('Error starting learning:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error || 'Program not found'}
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
          {program.image_url && (
            <img
              src={program.image_url}
              alt={program.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{program.title}</h1>
          
          <div className="grid grid-cols-4 gap-4 mb-6 text-gray-600">
            <div>
              <p className="text-sm text-gray-500">Difficulty</p>
              <p className="font-semibold">{program.difficulty}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-semibold">{program.duration_months} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Courses</p>
              <p className="font-semibold">{courses.length}</p>
            </div>
            {program.fee > 0 && (
              <div>
                <p className="text-sm text-gray-500">Cost</p>
                <p className="font-semibold">${(program.fee / 100).toFixed(2)}</p>
              </div>
            )}
          </div>

          <p className="text-gray-600 mb-6">{program.description}</p>

          {program.prerequisites && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 font-semibold">Prerequisites</p>
              <p className="text-blue-800">{program.prerequisites}</p>
            </div>
          )}

          {/* Enrollment Section */}
          <div className="border-t pt-6">
            {!isAuthenticated ? (
              <Link href="/login">
                <button className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700">
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
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${progress.progress_percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{progress.progress_percentage}% complete</p>
                  </div>
                )}
                {enrollment.status === 'enrolled' && (
                  <button
                    onClick={handleStartLearning}
                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
                  >
                    Start Learning
                  </button>
                )}
                {enrollment.status === 'active' && (
                  <button
                    onClick={handleStartLearning}
                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
                  >
                    Continue Learning
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Courses in this Program</h2>
          
          {courses.length === 0 ? (
            <p className="text-gray-500">No courses available</p>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Link key={course.id} href={`/course/${course.id}`}>
                  <div className="cursor-pointer border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>{course.difficulty}</span>
                          <span>{course.duration_hours} hours</span>
                          {course.fee > 0 && <span>${(course.fee / 100).toFixed(2)}</span>}
                        </div>
                      </div>
                      <button className="text-green-600 hover:text-green-700 font-semibold">
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
                itemType="program"
                itemId={Number(programId)}
                itemName={program?.title || 'Program'}
                amount={program?.fee || 0}
                currency="gbp"
                onSuccess={() => {
                  setShowPayment(false);
                  // Program enrollment will be completed via webhook
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

export default ProgramDetailsPage;
