import React, { useState, useEffect } from 'react';
import { Plus, Search, Dumbbell, Clock, User, Edit, Trash2, Eye, Sparkles, Target } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AddExerciseProgramModal } from '../components/ExercisePrograms/AddExerciseProgramModal';
import { ExerciseProgramDetailModal } from '../components/ExercisePrograms/ExerciseProgramDetailModal';
import { AIExerciseProgramModal } from '../components/ExercisePrograms/AIExerciseProgramModal';
import { useLocation } from 'react-router-dom';

export const ExercisePrograms: React.FC = () => {
  const { exercisePrograms, patients, deleteExerciseProgram } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [preSelectedPatientId, setPreSelectedPatientId] = useState<string>('');
  
  const location = useLocation();

  useEffect(() => {
    // Check if we came from patient detail page with a selected patient
    if (location.state?.selectedPatientId) {
      setPreSelectedPatientId(location.state.selectedPatientId);
      setIsAddModalOpen(true);
    }
  }, [location.state]);

  const filteredPrograms = exercisePrograms.filter(program => {
    const matchesSearch = 
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.goal.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || program.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (programId: string) => {
    if (confirm('Bu spor programını silmek istediğinizden emin misiniz?')) {
      deleteExerciseProgram(programId);
    }
  };

  const handleEdit = (program: any) => {
    setEditingProgram(program);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setPreSelectedPatientId('');
    setEditingProgram(null);
  };

  const handleCloseAIModal = () => {
    setIsAIModalOpen(false);
    setPreSelectedPatientId('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Başlangıç';
      case 'intermediate':
        return 'Orta';
      case 'advanced':
        return 'İleri';
      default:
        return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spor Programları</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hasta spor programlarınızı oluşturun ve yönetin ({exercisePrograms.length} program)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setIsAIModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI ile Oluştur
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manuel Oluştur
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Spor programı ara (başlık, hasta, tür, hedef)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Tüm Programlar</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlanan</option>
                <option value="paused">Duraklatılan</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPrograms.length === 0 ? (
            <div className="p-12 text-center">
              <Dumbbell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterStatus !== 'all' ? 'Program bulunamadı' : 'Henüz spor programı yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Arama kriterlerinize uygun program bulunmamaktadır.'
                  : 'İlk spor programınızı oluşturmak için yukarıdaki butonları kullanın.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => setIsAIModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI ile Hızlı Oluştur
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Manuel Oluştur
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredPrograms.map((program) => (
              <div key={program.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {program.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            program.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : program.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {program.status === 'active' ? 'Aktif' : 
                             program.status === 'completed' ? 'Tamamlandı' : 'Duraklatıldı'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(program.difficulty)}`}>
                            {getDifficultyText(program.difficulty)}
                          </span>
                          {program.aiGenerated && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {program.patientName}
                        </div>
                        <div className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {program.type}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {program.duration}
                        </div>
                        <span>
                          Haftada {program.frequency} gün
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{program.goal}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">Antrenman Sayısı</p>
                      <p className="text-lg font-bold text-emerald-600">{program.workouts.length}</p>
                    </div>

                    <div className="flex items-center justify-center sm:justify-end gap-2">
                      <button
                        onClick={() => setSelectedProgram(program)}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(program)}
                        className="inline-flex items-center px-3 py-1 text-sm text-amber-600 hover:text-amber-700"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddExerciseProgramModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        preSelectedPatientId={preSelectedPatientId}
        editingProgram={editingProgram}
      />

      <AIExerciseProgramModal
        isOpen={isAIModalOpen}
        onClose={handleCloseAIModal}
        preSelectedPatientId={preSelectedPatientId}
      />

      {selectedProgram && (
        <ExerciseProgramDetailModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};