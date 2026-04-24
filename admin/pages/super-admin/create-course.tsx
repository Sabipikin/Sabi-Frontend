'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminLayout } from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import { CategoryService, Category } from '@/services/categoryService';
import { QuestionService, Question, CreateQuestionData } from '@/services/questionService';

interface Course {
  id: number;
  title: string;
  description: string;
  category_id: number;
  difficulty: string;
  duration_hours: number;
}

interface AssessmentContent {
  id: number;
  title: string;
  content_type: string;
}

export default function CreateCourse() {
  const { token } = useAdminAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Course form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState('beginner');
  const [durationHours, setDurationHours] = useState(10);

  // Categories and assessment state
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStep, setCurrentStep] = useState<'course' | 'assessment'>('course');
  const [createdCourse, setCreatedCourse] = useState<Course | null>(null);
  const [assessmentContents, setAssessmentContents] = useState<AssessmentContent[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Question form state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionForm, setQuestionForm] = useState<CreateQuestionData>({
    content_id: 0,
    question_type: 'objective',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    sample_answer: '',
    order: 0,
    points: 1,
  });

  useEffect(() => {
    if (!token) return;
    loadCategories();
  }, [token]);

  const loadCategories = async () => {
    try {
      const cats = await CategoryService.getCategories(token!);
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadAssessmentContents = async () => {
    if (!createdCourse) return;

    try {
      // This would need to be implemented in the backend to get assessment contents for a course
      // For now, we'll assume assessment contents are created separately
      setAssessmentContents([]);
    } catch (err) {
      console.error('Failed to load assessment contents:', err);
    }
  };

  const loadQuestions = async (contentId: number) => {
    if (!token) return;

    try {
      const q = await QuestionService.getQuestionsForContent(token, contentId);
      setQuestions(q);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedContentId) return;

    try {
      const questionData: CreateQuestionData = {
        ...questionForm,
        content_id: selectedContentId,
        order: questions.length,
      };

      await QuestionService.createQuestion(token, questionData);
      setShowQuestionModal(false);
      setQuestionForm({
        content_id: 0,
        question_type: 'objective',
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        sample_answer: '',
        order: 0,
        points: 1,
      });

      if (selectedContentId) {
        await loadQuestions(selectedContentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await QuestionService.deleteQuestion(token, questionId);
      if (selectedContentId) {
        await loadQuestions(selectedContentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  const addOption = () => {
    setQuestionForm({
      ...questionForm,
      options: [...(questionForm.options || []), ''],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(questionForm.options || [])];
    newOptions[index] = value;
    setQuestionForm({
      ...questionForm,
      options: newOptions,
    });
  };

  const removeOption = (index: number) => {
    const newOptions = (questionForm.options || []).filter((_, i) => i !== index);
    setQuestionForm({
      ...questionForm,
      options: newOptions,
    });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !categoryId) {
      setError('Title and category are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/courses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          category_id: categoryId,
          difficulty,
          duration_hours: durationHours,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to create course');
      }

      const newCourse = await response.json();
      setCreatedCourse(newCourse);
      setCurrentStep('assessment');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center space-x-4 mb-6">
          <div className={`flex items-center ${currentStep === 'course' ? 'text-primary' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'course' ? 'border-primary bg-primary' : 'border-text-muted'}`}>
              1
            </div>
            <span className="ml-2">Course Details</span>
          </div>
          <div className={`flex-1 h-px ${currentStep === 'assessment' ? 'bg-primary' : 'bg-text-muted'}`}></div>
          <div className={`flex items-center ${currentStep === 'assessment' ? 'text-primary' : 'text-text-muted'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'assessment' ? 'border-primary bg-primary' : 'border-text-muted'}`}>
              2
            </div>
            <span className="ml-2">Assessment</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white">
          {currentStep === 'course' ? 'Create New Course' : `Assessment for "${createdCourse?.title}"`}
        </h1>

        {/* Status Indicators */}
        <div className={`p-3 rounded text-sm ${token ? 'bg-green-900/30 border border-green-600 text-green-300' : 'bg-red-900/30 border border-red-600 text-red-300'}`}>
          {token ? '✓ Authenticated' : '✗ Not authenticated - Please login'}
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {currentStep === 'course' ? (
          /* Course Creation Form */
          <form onSubmit={handleCreateCourse} className="space-y-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Course Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Python Fundamentals"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will students learn..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                <select
                  value={categoryId || ''}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Duration (hrs)</label>
                <input type="number" value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} min="1" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token || !title.trim() || !categoryId}
              className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading || !token || !title.trim() || !categoryId ? 'bg-gray-600 opacity-50' : 'bg-cyan-600 hover:bg-cyan-700'}`}
            >
              {loading ? 'Creating Course...' : 'Create Course & Continue to Assessment'}
            </button>
          </form>
        ) : (
          /* Assessment Creation */
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Assessment Questions</h2>
                <button
                  onClick={() => setShowQuestionModal(true)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">❓</div>
                  <p className="text-gray-400 mb-4">No questions added yet</p>
                  <button
                    onClick={() => setShowQuestionModal(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">Q{index + 1}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            question.question_type === 'objective' ? 'bg-blue-900/50 text-blue-300' :
                            question.question_type === 'theory' ? 'bg-green-900/50 text-green-300' :
                            'bg-purple-900/50 text-purple-300'
                          }`}>
                            {question.question_type}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>

                      <p className="text-white mb-2">{question.question_text}</p>

                      {question.question_type === 'objective' && question.options && (
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`text-gray-300 text-sm ${
                              option === question.correct_answer ? 'text-green-400 font-bold' : ''
                            }`}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {option === question.correct_answer && ' ✓'}
                            </div>
                          ))}
                        </div>
                      )}

                      {(question.question_type === 'theory' || question.question_type === 'essay') && question.sample_answer && (
                        <div className="text-gray-400 text-sm">
                          <strong>Sample Answer:</strong> {question.sample_answer}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Points: {question.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep('course')}
                className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Course Details
              </button>
              <button
                onClick={() => router.push('/super-admin/courses')}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg transition-colors"
              >
                Finish & View Courses
              </button>
            </div>
          </div>
        )}

        {/* Question Creation Modal */}
        {showQuestionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Add Assessment Question</h2>
              <form onSubmit={handleCreateQuestion}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Question Type</label>
                    <select
                      value={questionForm.question_type}
                      onChange={(e) => setQuestionForm({
                        ...questionForm,
                        question_type: e.target.value as 'objective' | 'theory' | 'essay'
                      })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                    >
                      <option value="objective">Multiple Choice (Objective)</option>
                      <option value="theory">Theory</option>
                      <option value="essay">Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Question Text *</label>
                    <textarea
                      value={questionForm.question_text}
                      onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                      rows={3}
                      required
                    />
                  </div>

                  {questionForm.question_type === 'objective' && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Options</label>
                      <div className="space-y-2">
                        {(questionForm.options || []).map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                            />
                            <input
                              type="radio"
                              name="correct_answer"
                              checked={questionForm.correct_answer === option}
                              onChange={() => setQuestionForm({ ...questionForm, correct_answer: option })}
                              className="w-4 h-4 text-cyan-600"
                            />
                            {(questionForm.options || []).length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(index)}
                                className="text-red-400 hover:text-red-300 px-2"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addOption}
                          className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {(questionForm.question_type === 'theory' || questionForm.question_type === 'essay') && (
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Sample Answer</label>
                      <textarea
                        value={questionForm.sample_answer}
                        onChange={(e) => setQuestionForm({ ...questionForm, sample_answer: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                        rows={4}
                        placeholder="Provide a sample answer for reference"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Points</label>
                    <input
                      type="number"
                      value={questionForm.points}
                      onChange={(e) => setQuestionForm({ ...questionForm, points: Number(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowQuestionModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Question
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
