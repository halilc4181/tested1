import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Dumbbell } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AddExerciseProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPatientId?: string;
  editingProgram?: any;
}

export const AddExerciseProgramModal: React.FC<AddExerciseProgramModalProps> = ({ 
  isOpen, 
  onClose, 
  preSelectedPatientId = '',
  editingProgram
}) => {
  const { patients, addExerciseProgram, updateExerciseProgram } = useData();
  const [formData, setFormData] = useState({
    patientId: preSelectedPatientId,
    title: '',
    type: '',
    goal: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    frequency: 3,
    duration: '',
    notes: '',
  });

  const [workouts, setWorkouts] = useState([
    {
      name: 'Pazartesi - Üst Vücut',
      day: 'Pazartesi',
      duration: 45,
      exercises: [
        {
          name: 'Şınav',
          type: 'strength' as 'cardio' | 'strength' | 'flexibility' | 'balance',
          sets: 3,
          reps: 10,
          restTime: 60,
          instructions: 'Düzgün form ile yapın',
          targetMuscles: ['Göğüs', 'Triceps']
        }
      ]
    }
  ]);

  useEffect(() => {
    if (editingProgram) {
      setFormData({
        patientId: editingProgram.patientId,
        title: editingProgram.title,
        type: editingProgram.type,
        goal: editingProgram.goal,
        difficulty: editingProgram.difficulty,
        frequency: editingProgram.frequency,
        duration: editingProgram.duration,
        notes: editingProgram.notes,
      });
      setWorkouts(editingProgram.workouts.map((workout: any) => ({
        name: workout.name,
        day: workout.day,
        duration: workout.duration,
        exercises: workout.exercises.map((exercise: any) => ({
          name: exercise.name,
          type: exercise.type,
          sets: exercise.sets || 0,
          reps: exercise.reps || 0,
          duration: exercise.duration || 0,
          weight: exercise.weight || 0,
          restTime: exercise.restTime || 0,
          instructions: exercise.instructions,
          targetMuscles: [...exercise.targetMuscles]
        }))
      })));
    } else if (preSelectedPatientId) {
      setFormData(prev => ({ ...prev, patientId: preSelectedPatientId }));
    }
  }, [preSelectedPatientId, editingProgram]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
      alert('Lütfen bir hasta seçiniz');
      return;
    }

    const validWorkouts = workouts.filter(workout => 
      workout.name && workout.day && workout.duration && 
      workout.exercises.some(ex => ex.name.trim())
    ).map(workout => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: workout.name,
      day: workout.day,
      duration: workout.duration,
      exercises: workout.exercises.filter(ex => ex.name.trim()).map(exercise => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: exercise.name,
        type: exercise.type,
        sets: exercise.sets,
        reps: exercise.reps,
        duration: exercise.duration,
        weight: exercise.weight,
        restTime: exercise.restTime,
        instructions: exercise.instructions,
        targetMuscles: exercise.targetMuscles.filter(muscle => muscle.trim())
      }))
    }));

    const programData = {
      patientId: formData.patientId,
      patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
      title: formData.title,
      createdDate: editingProgram ? editingProgram.createdDate : new Date().toISOString().split('T')[0],
      duration: formData.duration,
      status: editingProgram ? editingProgram.status : 'active' as const,
      type: formData.type,
      goal: formData.goal,
      difficulty: formData.difficulty,
      frequency: formData.frequency,
      workouts: validWorkouts,
      notes: formData.notes,
      aiGenerated: false,
    };

    if (editingProgram) {
      updateExerciseProgram(editingProgram.id, programData);
    } else {
      addExerciseProgram(programData);
    }

    // Reset form
    setFormData({
      patientId: '',
      title: '',
      type: '',
      goal: '',
      difficulty: 'beginner',
      frequency: 3,
      duration: '',
      notes: '',
    });
    setWorkouts([{
      name: 'Pazartesi - Üst Vücut',
      day: 'Pazartesi',
      duration: 45,
      exercises: [{
        name: 'Şınav',
        type: 'strength',
        sets: 3,
        reps: 10,
        restTime: 60,
        instructions: 'Düzgün form ile yapın',
        targetMuscles: ['Göğüs', 'Triceps']
      }]
    }]);

    onClose();
  };

  const addWorkout = () => {
    setWorkouts([...workouts, {
      name: '',
      day: '',
      duration: 45,
      exercises: [{
        name: '',
        type: 'strength',
        sets: 3,
        reps: 10,
        restTime: 60,
        instructions: '',
        targetMuscles: ['']
      }]
    }]);
  };

  const removeWorkout = (index: number) => {
    setWorkouts(workouts.filter((_, i) => i !== index));
  };

  const updateWorkout = (index: number, field: string, value: any) => {
    const updatedWorkouts = [...workouts];
    (updatedWorkouts[index] as any)[field] = value;
    setWorkouts(updatedWorkouts);
  };

  const addExercise = (workoutIndex: number) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[workoutIndex].exercises.push({
      name: '',
      type: 'strength',
      sets: 3,
      reps: 10,
      restTime: 60,
      instructions: '',
      targetMuscles: ['']
    });
    setWorkouts(updatedWorkouts);
  };

  const removeExercise = (workoutIndex: number, exerciseIndex: number) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[workoutIndex].exercises = updatedWorkouts[workoutIndex].exercises.filter((_, i) => i !== exerciseIndex);
    setWorkouts(updatedWorkouts);
  };

  const updateExercise = (workoutIndex: number, exerciseIndex: number, field: string, value: any) => {
    const updatedWorkouts = [...workouts];
    (updatedWorkouts[workoutIndex].exercises[exerciseIndex] as any)[field] = value;
    setWorkouts(updatedWorkouts);
  };

  const updateTargetMuscles = (workoutIndex: number, exerciseIndex: number, muscles: string) => {
    const updatedWorkouts = [...workouts];
    updatedWorkouts[workoutIndex].exercises[exerciseIndex].targetMuscles = muscles.split(',').map(m => m.trim()).filter(m => m);
    setWorkouts(updatedWorkouts);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingProgram ? 'Spor Programını Düzenle' : 'Yeni Spor Programı'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta *
                </label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  disabled={!!preSelectedPatientId || !!editingProgram}
                >
                  <option value="">Hasta seçiniz</option>
                  {patients.filter(p => p.status === 'active').map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} {patient.surname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Örn: Kilo Verme Spor Programı - Mart 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Türü *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Kilo Verme">Kilo Verme</option>
                  <option value="Kas Kazanımı">Kas Kazanımı</option>
                  <option value="Dayanıklılık">Dayanıklılık</option>
                  <option value="Güç Artırma">Güç Artırma</option>
                  <option value="Esneklik">Esneklik</option>
                  <option value="Rehabilitasyon">Rehabilitasyon</option>
                  <option value="Genel Fitness">Genel Fitness</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zorluk Seviyesi *
                </label>
                <select
                  required
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="beginner">Başlangıç</option>
                  <option value="intermediate">Orta</option>
                  <option value="advanced">İleri</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Haftalık Sıklık *
                </label>
                <select
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value={1}>Haftada 1 gün</option>
                  <option value={2}>Haftada 2 gün</option>
                  <option value={3}>Haftada 3 gün</option>
                  <option value={4}>Haftada 4 gün</option>
                  <option value={5}>Haftada 5 gün</option>
                  <option value={6}>Haftada 6 gün</option>
                  <option value={7}>Her gün</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Süresi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Örn: 4 hafta, 2 ay"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Hedefi *
              </label>
              <textarea
                required
                rows={2}
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Bu programın hedefi ve beklenen sonuçlar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genel Notlar
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Program ile ilgili özel notlar ve uyarılar"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Antrenmanlar</h3>
                <button
                  type="button"
                  onClick={addWorkout}
                  className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Antrenman Ekle
                </button>
              </div>

              <div className="space-y-6">
                {workouts.map((workout, workoutIndex) => (
                  <div key={workoutIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Dumbbell className="h-4 w-4 mr-2" />
                        Antrenman {workoutIndex + 1}
                      </h4>
                      {workouts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWorkout(workoutIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Antrenman Adı
                        </label>
                        <input
                          type="text"
                          value={workout.name}
                          onChange={(e) => updateWorkout(workoutIndex, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Örn: Pazartesi - Üst Vücut"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gün
                        </label>
                        <select
                          value={workout.day}
                          onChange={(e) => updateWorkout(workoutIndex, 'day', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Gün seçin</option>
                          <option value="Pazartesi">Pazartesi</option>
                          <option value="Salı">Salı</option>
                          <option value="Çarşamba">Çarşamba</option>
                          <option value="Perşembe">Perşembe</option>
                          <option value="Cuma">Cuma</option>
                          <option value="Cumartesi">Cumartesi</option>
                          <option value="Pazar">Pazar</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Süre (dakika)
                        </label>
                        <input
                          type="number"
                          min="15"
                          max="180"
                          value={workout.duration}
                          onChange={(e) => updateWorkout(workoutIndex, 'duration', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Egzersizler
                        </label>
                        <button
                          type="button"
                          onClick={() => addExercise(workoutIndex)}
                          className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          + Egzersiz Ekle
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {workout.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-700">Egzersiz {exerciseIndex + 1}</span>
                              {workout.exercises.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeExercise(workoutIndex, exerciseIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Egzersiz Adı
                                </label>
                                <input
                                  type="text"
                                  value={exercise.name}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, 'name', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  placeholder="Örn: Şınav"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Tür
                                </label>
                                <select
                                  value={exercise.type}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, 'type', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="strength">Güç</option>
                                  <option value="cardio">Kardiyovasküler</option>
                                  <option value="flexibility">Esneklik</option>
                                  <option value="balance">Denge</option>
                                </select>
                              </div>

                              {exercise.type === 'strength' && (
                                <>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Set
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="10"
                                      value={exercise.sets}
                                      onChange={(e) => updateExercise(workoutIndex, exerciseIndex, 'sets', parseInt(e.target.value))}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Tekrar
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      max="50"
                                      value={exercise.reps}
                                      onChange={(e) => updateExercise(workoutIndex, exerciseIndex, 'reps', parseInt(e.target.value))}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                  </div>
                                </>
                              )}

                              {exercise.type === 'cardio' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Süre (dakika)
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={exercise.duration}
                                    onChange={(e) => updateExercise(workoutIndex, exerciseIndex, 'duration', parseInt(e.target.value))}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                              )}

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Dinlenme (saniye)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="300"
                                  value={exercise.restTime}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, 'restTime', parseInt(e.target.value))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Talimatlar
                                </label>
                                <textarea
                                  rows={2}
                                  value={exercise.instructions}
                                  onChange={(e) => updateExercise(workoutIndex, exerciseIndex, 'instructions', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  placeholder="Egzersiz nasıl yapılacak?"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Hedef Kaslar (virgülle ayırın)
                                </label>
                                <input
                                  type="text"
                                  value={exercise.targetMuscles.join(', ')}
                                  onChange={(e) => updateTargetMuscles(workoutIndex, exerciseIndex, e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  placeholder="Örn: Göğüs, Triceps, Omuz"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                {editingProgram ? 'Güncelle' : 'Spor Programı Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};