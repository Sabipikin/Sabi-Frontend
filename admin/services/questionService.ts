'use client';

const API_BASE_URL = 'http://localhost:8000';

export interface Question {
  id: number;
  content_id: number;
  question_type: 'objective' | 'theory' | 'essay';
  question_text: string;
  options?: string[];
  correct_answer?: string;
  sample_answer?: string;
  order: number;
  points: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateQuestionData {
  content_id: number;
  question_type: 'objective' | 'theory' | 'essay';
  question_text: string;
  options?: string[];
  correct_answer?: string;
  sample_answer?: string;
  order?: number;
  points?: number;
}

export interface UpdateQuestionData {
  question_type?: 'objective' | 'theory' | 'essay';
  question_text?: string;
  options?: string[];
  correct_answer?: string;
  sample_answer?: string;
  order?: number;
  points?: number;
}

export class QuestionService {
  static async getQuestionsForContent(token: string, contentId: number): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/questions/content/${contentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }

    return response.json();
  }

  static async createQuestion(token: string, data: CreateQuestionData): Promise<Question> {
    const response = await fetch(`${API_BASE_URL}/api/admin/questions/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create question');
    }

    return response.json();
  }

  static async updateQuestion(token: string, questionId: number, data: UpdateQuestionData): Promise<Question> {
    const response = await fetch(`${API_BASE_URL}/api/admin/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update question');
    }

    return response.json();
  }

  static async deleteQuestion(token: string, questionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete question');
    }
  }
}