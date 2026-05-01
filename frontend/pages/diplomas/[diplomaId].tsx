import { ChangeEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/services/api';
import PurchaseOptions from '@/components/PurchaseOptions';

const DiplomaDetailsPage: React.FC = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Conditional Navigation based on auth status */}
      {token ? (
        <nav className="flex justify-between items-center px-6 py-6 max-w-7xl mx-auto relative">
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="text-3xl font-bold text-foreground font-display glow-text">Sabipath</Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-foreground hover:text-primary font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/my-courses" className="text-foreground hover:text-primary font-medium transition-colors">
                My Courses
              </Link>
              <Link href="/portfolio" className="text-foreground hover:text-primary font-medium transition-colors">
                Portfolio
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-foreground">Welcome back!</span>
            <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }} className="text-foreground hover:text-primary font-medium transition-colors">
              Sign out
            </button>
          </div>
        </nav>
      ) : (
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
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Diploma Header */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-primary/20 glow">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-6">
            <div className="flex-1 mb-6 lg:mb-0">
              {token ? (
                <Link href="/dashboard" className="text-primary hover:text-primary-dark font-medium mb-6 inline-flex items-center transition-colors">
                  <span className="mr-2">←</span> Back to Dashboard
                </Link>
              ) : (
                <Link href="/diplomas" className="text-primary hover:text-primary-dark font-medium mb-6 inline-flex items-center transition-colors">
                  <span className="mr-2">←</span> Back to Diplomas
                </Link>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-display">{diploma.title}</h1>
              <p className="text-text-muted mb-6 leading-relaxed">{diploma.description}</p>
              
              <div className="grid grid-cols-4 gap-4 mb-6 text-text-muted">
                <div>
                  <p className="text-sm text-text-muted/70">Level</p>
                  <p className="font-semibold text-foreground">{diploma.level}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted/70">Duration</p>
                  <p className="font-semibold text-foreground">{diploma.duration_years} year{diploma.duration_years > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted/70">Programs</p>
                  <p className="font-semibold text-foreground">{programs.length}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted/70">Price</p>
                  <p className="font-semibold text-primary">{diploma.fee ? `$${(diploma.fee / 100).toFixed(2)}` : 'Free'}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Section */}
            <div className="border-t border-primary/20 pt-6">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <Link href="/login">
                  <button className="bg-primary text-background px-6 py-3 rounded-xl hover:bg-primary-dark font-semibold glow transition-all hover:scale-105 mr-4">
                    Sign in to Enroll
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-surface text-foreground px-6 py-3 rounded-xl border border-primary/20 hover:bg-primary/10 font-semibold transition-all hover:scale-105">
                    Create Account
                  </button>
                </Link>
              </div>
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
                    className="bg-primary text-background px-6 py-3 rounded-xl hover:bg-primary-dark font-semibold glow transition-all hover:scale-105"
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
        </div>
        {/* Programs List */}
        <div className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 glow">
          <h2 className="text-2xl font-bold text-foreground mb-6">Programs in this Diploma</h2>
          
          {programs.length === 0 ? (
            <p className="text-text-muted">No programs available</p>
          ) : (
            <div className="space-y-4">
              {programs.map((program) => (
                <Link key={program.id} href={`/programs/${program.id}`}>
                  <div className="cursor-pointer bg-surface/50 border border-primary/10 rounded-xl p-6 hover:bg-surface/70 hover:border-primary/20 transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{program.title}</h3>
                        <p className="text-sm text-text-muted mb-3">{program.short_description}</p>
                        <div className="flex gap-4 text-sm text-text-muted/70">
                          <span>{program.difficulty}</span>
                          <span>{program.courses ? program.courses.length : 0} courses</span>
                        </div>
                      </div>
                      <button className="text-primary hover:text-primary-dark font-semibold transition-colors">
                        View →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Purchase Options Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full p-6 border border-gray-700 relative">
              <button
                onClick={() => setShowPayment(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>
              <PurchaseOptions
                itemType="diploma"
                itemId={Number(diplomaId)}
                itemName={diploma?.title || 'Diploma'}
                itemPrice={diploma?.fee || 0}
                onClose={() => {
                  setShowPayment(false);
                  // Diploma enrollment will be completed via webhook
                  setTimeout(() => {
                    fetchEnrollment();
                  }, 2000);
                }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DiplomaDetailsPage;
