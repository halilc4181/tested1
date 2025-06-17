import React, { useState } from 'react';
import { Dumbbell, Plus, Edit, Trash2, Eye, Sparkles, Clock, Target } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { ExerciseProgramDetailModal } from '../ExercisePrograms/ExerciseProgramDetailModal';
import { AddExerciseProgramModal } from '../ExercisePrograms/AddExerciseProgramModal';
import { AIExerciseProgramModal } from '../ExercisePrograms/AIExerciseProgramModal';

interface PatientExerciseProgramProps {
  patientId: string;
}

export const PatientExerciseProgram: React.FC<PatientExerciseProgramProps> = ({ patientId }) => {
  const { getExerciseProgramsByPatientId, deleteExerciseProgram, getPatientById } = useData();
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const patient = getPatientById(patientId);
  const exercisePrograms = getExerciseProgramsByPatientId(patientId);
  const activeProgram = exercisePrograms.find(program => program.status === 'active');

  const handleCreateNewProgram = () => {
    navigate('/exercise-programs', { state: { selectedPatientId: patientId } });
  };

  const handleCreateAIProgram = () => {
    setIsAIModalOpen(true);
  };

  const handleViewProgram = (program: any) => {
    setSelectedProgram(program);
  };

  const handleEditProgram = (program: any) => {
    setEditingProgram(program);
    setIsEditModalOpen(true);
  };

  const handleDeleteProgram = (programId: string) => {
    if (confirm('Bu spor programını silmek istediğinizden emin misiniz?')) {
      deleteExerciseProgram(programId);
    }
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

  if (!patient) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spor Programı</h3>
        <p className="text-gray-500">Hasta bulunamadı</p>
      </div>
    );
  }

  if (exercisePrograms.length === 0) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Spor Programı</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateAIProgram}
              className="inline-flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI ile Oluştur
            </button>
            <button
              onClick={handleCreateNewProgram}
              className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Manuel Oluştur
            </button>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Dumbbell className="h-6 w-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Henüz spor programı yok</h4>
          <p className="text-sm text-gray-500 mb-4">
            {patient.name} {patient.surname} için henüz bir spor programı oluşturulmamış.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={handleCreateAIProgram}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI ile Hızlı Oluştur
            </button>
            <button
              onClick={handleCreateNewProgram}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manuel Oluştur
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Spor Programları</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleCreateAIProgram}
              className="inline-flex items-center px-3 py-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI ile Oluştur
            </button>
            <button
              onClick={handleCreateNewProgram}
              className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Manuel Oluştur
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {exercisePrograms.map((program) => (
            <div key={program.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{program.title}</h4>
                    {program.aiGenerated && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Oluşturulma: {new Date(program.createdDate).toLocaleDateString('tr-TR')} • 
                    Süre: {program.duration} • 
                    Haftada {program.frequency} gün
                  </p>
                </div>
                <div className="flex items-center space-x-2">
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
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-700 line-clamp-2">{program.goal}</p>
              </div>

              {program.status === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {program.workouts.slice(0, 3).map((workout: any) => (
                    <div key={workout.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-900">{workout.name}</h5>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {workout.duration} dk
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {workout.day}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {workout.exercises.length} egzersiz
                      </div>
                    </div>
                  ))}
                  {program.workouts.length > 3 && (
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        +{program.workouts.length - 3} antrenman daha
                      </span>
                    </div>
                  )}
                </div>
              )}

              {program.notes && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h5 className="text-sm font-medium text-amber-800 mb-1">Notlar:</h5>
                  <p className="text-sm text-amber-700">{program.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleViewProgram(program)}
                  className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                  title="Detayları Görüntüle"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detaylar
                </button>
                <button
                  onClick={() => handleEditProgram(program)}
                  className="inline-flex items-center px-3 py-1 text-sm text-amber-600 hover:text-amber-700"
                  title="Düzenle"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDeleteProgram(program.id)}
                  className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <ExerciseProgramDetailModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
          onEdit={handleEditProgram}
        />
      )}

      {/* Edit Program Modal */}
      {editingProgram && (
        <AddExerciseProgramModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingProgram(null);
          }}
          editingProgram={editingProgram}
        />
      )}

      {/* AI Exercise Program Modal */}
      <AIExerciseProgramModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        preSelectedPatientId={patientId}
      />
    </>
  );
};