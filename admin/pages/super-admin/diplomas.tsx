'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { DiplomaService, Diploma, CreateDiplomaData, UpdateDiplomaData, DiplomaStructure } from '@/services/diplomaService';

export default function Diplomas() {
  const { token } = useAdminAuth();
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [editingDiploma, setEditingDiploma] = useState<Diploma | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [structureData, setStructureData] = useState<DiplomaStructure | null>(null);
  const [formData, setFormData] = useState<CreateDiplomaData>({
    title: '',
    description: '',
    short_description: '',
    duration_years: 1,
    level: 'certificate',
    field: '',
    color: '#8B5CF6',
    icon: '',
    image_url: '',
    status: 'draft',
    is_featured: false,
    fee: 0,
    promo_amount: 0,
    is_on_promo: false,
  });

  useEffect(() => {
    if (!token) return;
    fetchDiplomas();
  }, [token]);

  const fetchDiplomas = async () => {
    try {
      setLoading(true);
      const data = await DiplomaService.getDiplomas(token!);
      setDiplomas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diplomas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiploma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await DiplomaService.createDiploma(token, formData);
      setShowCreateModal(false);
      resetForm();
      await fetchDiplomas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create diploma');
    }
  };

  const handleEditDiploma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingDiploma) return;

    try {
      await DiplomaService.updateDiploma(token, editingDiploma.id, formData);
      setShowEditModal(false);
      setEditingDiploma(null);
      resetForm();
      await fetchDiplomas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update diploma');
    }
  };

  const handleDeleteDiploma = async (id: number) => {
    if (!token) return;

    try {
      await DiplomaService.deleteDiploma(token, id);
      setDeletingId(null);
      await fetchDiplomas();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diploma');
    }
  };

  const handleViewStructure = async (id: number) => {
    if (!token) return;

    try {
      const data = await DiplomaService.getDiplomaStructure(token, id);
      setStructureData(data);
      setShowStructureModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch diploma structure');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      short_description: '',
      duration_years: 1,
      level: 'certificate',
      field: '',
      color: '#8B5CF6',
      icon: '',
      image_url: '',
      status: 'draft',
      is_featured: false,
      fee: 0,
      promo_amount: 0,
      is_on_promo: false,
    });
  };

  const openEditModal = (diploma: Diploma) => {
    setEditingDiploma(diploma);
    setFormData({
      title: diploma.title,
      description: diploma.description || '',
      short_description: diploma.short_description || '',
      duration_years: diploma.duration_years,
      level: diploma.level,
      field: diploma.field || '',
      color: diploma.color,
      icon: diploma.icon || '',
      image_url: diploma.image_url || '',
      status: diploma.status,
      is_featured: diploma.is_featured,
      fee: diploma.fee,
      promo_amount: diploma.promo_amount,
      is_on_promo: diploma.is_on_promo,
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text">Diplomas Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Create Diploma
          </button>
        </div>

        {error && (
          <div className="bg-error-light border border-error text-error px-4 py-3 rounded-lg mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right ml-4 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-surface rounded-lg shadow-sm border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {diplomas.map((diploma) => (
                  <tr key={diploma.id} className="hover:bg-surface-light">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded mr-3"
                          style={{ backgroundColor: diploma.color }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-text">{diploma.title}</div>
                          {diploma.short_description && (
                            <div className="text-sm text-text-muted">{diploma.short_description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {diploma.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {diploma.duration_years} year{diploma.duration_years > 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {diploma.field || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        diploma.status === 'published' ? 'bg-green-100 text-green-800' :
                        diploma.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {diploma.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewStructure(diploma.id)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        View Structure
                      </button>
                      <button
                        onClick={() => openEditModal(diploma)}
                        className="text-primary hover:text-primary-dark mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(diploma.id)}
                        className="text-error hover:text-error-dark"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-text">Create Diploma</h2>
              <form onSubmit={handleCreateDiploma}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Short Description</label>
                    <input
                      type="text"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="certificate">Certificate</option>
                      <option value="diploma">Diploma</option>
                      <option value="degree">Degree</option>
                      <option value="masters">Masters</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Field</label>
                    <input
                      type="text"
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Computer Science, Business"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      value={formData.duration_years}
                      onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-text-muted hover:text-text border border-border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-text">Edit Diploma</h2>
              <form onSubmit={handleEditDiploma}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Short Description</label>
                    <input
                      type="text"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Level</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="certificate">Certificate</option>
                      <option value="diploma">Diploma</option>
                      <option value="degree">Degree</option>
                      <option value="masters">Masters</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Field</label>
                    <input
                      type="text"
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Computer Science, Business"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Duration (Years)</label>
                    <input
                      type="number"
                      value={formData.duration_years}
                      onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingDiploma(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-text-muted hover:text-text border border-border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Structure Modal */}
        {showStructureModal && structureData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-text">Diploma Structure: {structureData.title}</h2>
              <div className="space-y-6">
                {structureData.programs.map((program) => (
                  <div key={program.id} className="border border-border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-text mb-2">{program.title}</h3>
                    {program.description && (
                      <p className="text-text-muted mb-3">{program.description}</p>
                    )}
                    <div className="ml-4">
                      <h4 className="font-medium text-text mb-2">Courses:</h4>
                      {program.courses.length > 0 ? (
                        <ul className="space-y-1">
                          {program.courses.map((course: any) => (
                            <li key={course.id} className="text-sm text-text-muted">
                              • {course.title}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-text-muted italic">No courses assigned yet</p>
                      )}
                    </div>
                  </div>
                ))}
                {structureData.programs.length === 0 && (
                  <p className="text-text-muted italic">No programs in this diploma yet</p>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowStructureModal(false);
                    setStructureData(null);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-text">Delete Diploma</h2>
              <p className="text-text-muted mb-6">
                Are you sure you want to delete this diploma? This action cannot be undone and will also remove all associated programs.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-4 py-2 text-text-muted hover:text-text border border-border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDiploma(deletingId)}
                  className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error-dark"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}