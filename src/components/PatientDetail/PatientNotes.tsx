import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Lock, Tag, Calendar, User } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface PatientNote {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  content: string;
  type: 'general' | 'medical' | 'diet' | 'exercise' | 'appointment';
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface PatientNotesProps {
  patientId: string;
  patientName: string;
}

export const PatientNotes: React.FC<PatientNotesProps> = ({ patientId, patientName }) => {
  const [notes, setNotes] = useState<PatientNote[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PatientNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as PatientNote['type'],
    isPrivate: false,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadNotes();
  }, [patientId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPatientNotes(patientId);
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const noteData = {
        patientId,
        patientName,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        isPrivate: formData.isPrivate,
        tags: formData.tags,
      };

      if (editingNote) {
        await apiService.updatePatientNote(editingNote.id, noteData);
      } else {
        await apiService.createPatientNote(noteData);
      }

      await loadNotes();
      resetForm();
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Not kaydedilirken bir hata oluştu');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      try {
        await apiService.deletePatientNote(noteId);
        await loadNotes();
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert('Not silinirken bir hata oluştu');
      }
    }
  };

  const handleEdit = (note: PatientNote) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      type: note.type,
      isPrivate: note.isPrivate,
      tags: note.tags,
    });
    setTagInput(note.tags.join(', '));
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'general',
      isPrivate: false,
      tags: [],
    });
    setTagInput('');
    setEditingNote(null);
    setIsAddModalOpen(false);
  };

  const handleTagsChange = (value: string) => {
    setTagInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'bg-red-100 text-red-800';
      case 'diet':
        return 'bg-emerald-100 text-emerald-800';
      case 'exercise':
        return 'bg-blue-100 text-blue-800';
      case 'appointment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'medical':
        return 'Tıbbi';
      case 'diet':
        return 'Diyet';
      case 'exercise':
        return 'Egzersiz';
      case 'appointment':
        return 'Randevu';
      default:
        return 'Genel';
    }
  };

  return (
    <>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Hasta Notları</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Yeni Not
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Notlar yükleniyor...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Henüz not bulunmuyor</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{note.title}</h4>
                      {note.isPrivate && (
                        <Lock className="h-4 w-4 text-amber-500" title="Özel Not" />
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(note.type)}`}>
                        {getTypeText(note.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{note.content}</p>
                    
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {note.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(note.createdAt).toLocaleDateString('tr-TR')} {new Date(note.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      {note.updatedAt !== note.createdAt && (
                        <span className="ml-2">(Düzenlendi: {new Date(note.updatedAt).toLocaleDateString('tr-TR')})</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                      title="Düzenle"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded"
                      title="Sil"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Note Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={resetForm} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingNote ? 'Notu Düzenle' : 'Yeni Not Ekle'}
                </h2>
                <button
                  onClick={resetForm}
                  className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Not başlığı"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PatientNote['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="general">Genel</option>
                      <option value="medical">Tıbbi</option>
                      <option value="diet">Diyet</option>
                      <option value="exercise">Egzersiz</option>
                      <option value="appointment">Randevu</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPrivate}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                        className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Özel not</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İçerik *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Not içeriği..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiketler (virgülle ayırın)
                  </label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="diyet, kontrol, önemli"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Etiketleri virgülle ayırarak yazın
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    {editingNote ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};