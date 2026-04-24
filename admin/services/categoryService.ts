'use client';

const API_BASE_URL = 'http://localhost:8000';

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
  order?: number;
}

export class CategoryService {
  static async getCategories(token: string): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  static async createCategory(token: string, data: CreateCategoryData): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create category');
    }

    return response.json();
  }

  static async updateCategory(token: string, categoryId: number, data: UpdateCategoryData): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update category');
    }

    return response.json();
  }

  static async deleteCategory(token: string, categoryId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/admin/categories/delete/${categoryId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete category');
    }
  }
}