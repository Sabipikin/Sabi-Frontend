'use client';

const API_BASE_URL = 'http://localhost:8000';

export interface Diploma {
  id: number;
  title: string;
  description?: string;
  short_description?: string;
  duration_years: number;
  level: string;
  field?: string;
  color: string;
  icon?: string;
  image_url?: string;
  status: string;
  is_featured: boolean;
  fee: number;
  promo_amount: number;
  is_on_promo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateDiplomaData {
  title: string;
  description?: string;
  short_description?: string;
  duration_years?: number;
  level?: string;
  field?: string;
  color?: string;
  icon?: string;
  image_url?: string;
  status?: string;
  is_featured?: boolean;
  fee?: number;
  promo_amount?: number;
  is_on_promo?: boolean;
}

export interface UpdateDiplomaData {
  title?: string;
  description?: string;
  short_description?: string;
  duration_years?: number;
  level?: string;
  field?: string;
  color?: string;
  icon?: string;
  image_url?: string;
  status?: string;
  is_featured?: boolean;
  fee?: number;
  promo_amount?: number;
  is_on_promo?: boolean;
}

export interface DiplomaStructure {
  id: number;
  title: string;
  description?: string;
  programs: Array<{
    id: number;
    title: string;
    description?: string;
    courses: any[];
  }>;
}

export class DiplomaService {
  static async getDiplomas(token: string): Promise<Diploma[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/diplomas/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch diplomas');
    }

    return response.json();
  }

  static async createDiploma(token: string, data: CreateDiplomaData): Promise<Diploma> {
    const response = await fetch(`${API_BASE_URL}/api/admin/diplomas/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create diploma');
    }

    return response.json();
  }

  static async updateDiploma(token: string, id: number, data: UpdateDiplomaData): Promise<Diploma> {
    const response = await fetch(`${API_BASE_URL}/api/admin/diplomas/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update diploma');
    }

    return response.json();
  }

  static async deleteDiploma(token: string, id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/diplomas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete diploma');
    }
  }

  static async getDiplomaStructure(token: string, id: number): Promise<DiplomaStructure> {
    const response = await fetch(`${API_BASE_URL}/api/admin/diplomas/${id}/structure`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch diploma structure');
    }

    return response.json();
  }
}