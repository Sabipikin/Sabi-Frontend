'use client';

const API_BASE_URL = 'http://localhost:8000';

export interface Program {
  id: number;
  title: string;
  description?: string;
  short_description?: string;
  diploma_id?: number;
  duration_months: number;
  difficulty: string;
  prerequisites?: string;
  color: string;
  icon?: string;
  image_url?: string;
  status: string;
  order: number;
  is_featured: boolean;
  fee: number;
  promo_amount: number;
  is_on_promo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateProgramData {
  title: string;
  description?: string;
  short_description?: string;
  diploma_id?: number;
  duration_months?: number;
  difficulty?: string;
  prerequisites?: string;
  color?: string;
  icon?: string;
  image_url?: string;
  status?: string;
  order?: number;
  is_featured?: boolean;
  fee?: number;
  promo_amount?: number;
  is_on_promo?: boolean;
}

export interface UpdateProgramData {
  title?: string;
  description?: string;
  short_description?: string;
  diploma_id?: number;
  duration_months?: number;
  difficulty?: string;
  prerequisites?: string;
  color?: string;
  icon?: string;
  image_url?: string;
  status?: string;
  order?: number;
  is_featured?: boolean;
  fee?: number;
  promo_amount?: number;
  is_on_promo?: boolean;
}

export interface ProgramWithCourses extends Program {
  courses?: any[];
}

export class ProgramService {
  static async getPrograms(token: string, diplomaId?: number): Promise<Program[]> {
    const url = new URL(`${API_BASE_URL}/api/admin/programs/`);
    if (diplomaId) {
      url.searchParams.set('diploma_id', diplomaId.toString());
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch programs');
    }

    return response.json();
  }

  static async createProgram(token: string, data: CreateProgramData): Promise<Program> {
    const response = await fetch(`${API_BASE_URL}/api/admin/programs/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create program');
    }

    return response.json();
  }

  static async updateProgram(token: string, id: number, data: UpdateProgramData): Promise<Program> {
    const response = await fetch(`${API_BASE_URL}/api/admin/programs/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update program');
    }

    return response.json();
  }

  static async deleteProgram(token: string, id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/programs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete program');
    }
  }

  static async getProgramCourses(token: string, id: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/programs/${id}/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch program courses');
    }

    return response.json();
  }
}