import React, { useState } from 'react';
import { X, Sparkles, User, Target, Activity, Clock, AlertCircle, Loader, Dumbbell } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { exerciseAIService, ExerciseGoal, PatientExerciseInfo } from '../../services/exerciseAIService';

interface AIExerciseProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPatientId?: string;
}

export const AIExerciseProgramModal: React.FC<AIExerciseProgramModalProps> = ({ 
  isOpen, 
  onClose, 
  preSelectedPatientId = '' 
}) => {
  const { patients, addExerciseProgram } = useData();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatientId);
  const [patientInfo, setPatientInfo] = useState<PatientExerciseInfo>({
    age: 0,
    gender: 'Kadın',
    height: 0,
    currentWeight: 0,
    targetWeight: 0,
    activityLevel: 'moderate',
    medicalHistory: '',
    diseases: '',
    injuries: '',
    fitnessLevel: 'beginner'
  });
  
  const [exerciseGoal, setExerciseGoal] = useState<ExerciseGoal>({
    type: 'weight_loss',
    difficulty: 'beginner',
    frequency: 3,
    duration: '4 hafta',
    restrictions: [],
    preferences: [],
    equipment: []
  });

  const [customRestrictions, setCustomRestrictions] = useState('');
  const [customPreferences, setCustomPreferences] = useState('');
  const [customEquipment, setCustomEquipment] = useState('');

  React.useEffect(() => {
    if (preSelectedPatientId) {
      const patient = patients.find(p => p.id === preSelectedPatientId);
      if (patient) {
        setPatientInfo({
          age: patient.age,
          gender: patient.gender,
          height: patient.height,
          currentWeight: patient.currentWeight,
          targetWeight: patient.targetWeight,
          activityLevel: 'moderate',
          medicalHistory: patient.medicalHistory,
          diseases: patient.diseases,
          injuries: '',
          fitnessLevel: 'beginner'
        });
      }
    }
  }, [preSelectedPatientId, patients]);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setPatientInfo({
        age: patient.age,
        gender: patient.gender,
        height: patient.height,
        currentWeight: patient.currentWeight,
        targetWeight: patient.targetWeight,
        activityLevel: 'moderate',
        medicalHistory: patient.medicalHistory,
        diseases: patient.diseases,
        injuries: '',
        fitnessLevel: 'beginner'
      });
    }
  };

  const handleGenerateProgram = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Prepare restrictions, preferences, and equipment
      const restrictions = [
        ...exerciseGoal.restrictions || [],
        ...customRestrictions.split(',').map(r => r.trim()).filter(r => r)
      ];
      
      const preferences = [
        ...exerciseGoal.preferences || [],
        ...customPreferences.split(',').map(p => p.trim()).filter(p => p)
      ];

      const equipment = [
        ...exerciseGoal.equipment || [],
        ...customEquipment.split(',').map(e => e.trim()).filter(e => e)
      ];

      const finalGoal = {
        ...exerciseGoal,
        restrictions,
        preferences,
        equipment
      };

      const generatedProgram = await exerciseAIService.generateExerciseProgram(patientInfo, finalGoal);
      
      // Add the program to the patient
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      if (selectedPatient) {
        const programData = {
          patientId: selectedPatientId,
          patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
          title: generatedProgram.title,
          createdDate: new Date().toISOString().split('T')[0],
          duration: generatedProgram.duration,
          status: 'active' as const,
          type: generatedProgram.type,
          goal: generatedProgram.goal,
          difficulty: generatedProgram.difficulty,
          frequency: generatedProgram.frequency,
          workouts: generatedProgram.workouts,
          notes: generatedProgram.notes,
          aiGenerated: true,
        };

        addExerciseProgram(programData);
        onClose();
        alert('AI tarafından oluşturulan spor programı başarıyla eklendi!');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedPatientId(preSelectedPatientId);
    setError('');
    setCustomRestrictions('');
    setCustomPreferences('');
    setCustomEquipment('');
    setExerciseGoal({
      type: 'weight_loss',
      difficulty: 'beginner',
      frequency: 3,
      duration: '4 hafta',
      restrictions: [],
      preferences: [],
      equipment: []
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const goalTypes = [
    { value: 'weight_loss', label: 'Kilo Verme', description: 'Kardiyovasküler odaklı program' },
    { value: 'muscle_gain', label: 'Kas Kazanımı', description: 'Güç antrenmanı odaklı program' },
    { value: 'endurance', label: 'Dayanıklılık', description: 'Kondisyon artırma programı' },
    { value: 'strength', label: 'Güç Artırma', description: 'Maksimal güç geliştirme' },
    { value: 'flexibility', label: 'Esneklik', description: 'Mobilite ve esneklik programı' },
    { value: 'rehabilitation', label: 'Rehabilitasyon', description: 'İyileşme odaklı program' },
    { value: 'general_fitness', label: 'Genel Fitness', description: 'Kapsamlı fitness programı' }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Hareketsiz', description: 'Masa başı iş, az hareket' },
    { value: 'light', label: 'Az Aktif', description: 'Hafif aktivite, haftada 1-3 gün' },
    { value: 'moderate', label: 'Orta Aktif', description: 'Orta aktivite, haftada 3-5 gün' },
    { value: 'active', label: 'Aktif', description: 'Yoğun aktivite, haftada 6-7 gün' },
    { value: 'very_active', label: 'Çok Aktif', description: 'Çok yoğun aktivite, günde 2 kez' }
  ];

  const fitnessLevels = [
    { value: 'beginner', label: 'Başlangıç', description: 'Spor geçmişi yok veya çok az' },
    { value: 'intermediate', label: 'Orta', description: '6 ay - 2 yıl spor deneyimi' },
    { value: 'advanced', label: 'İleri', description: '2+ yıl düzenli spor deneyimi' }
  ];

  const commonRestrictions = [
    'Diz problemi', 'Bel problemi', 'Omuz yaralanması', 'Kalp hastalığı', 
    'Yüksek tansiyon', 'Diyabet', 'Astım', 'Eklem problemleri'
  ];

  const commonPreferences = [
    'Ev egzersizleri', 'Spor salonu', 'Açık hava', 'Grup antrenmanları', 
    'Kısa süreli', 'Yoğun antrenman', 'Düşük etkili', 'Eğlenceli'
  ];

  const commonEquipment = [
    'Dambıl', 'Barbell', 'Direnç bandı', 'Yoga matı', 'Koşu bandı', 
    'Bisiklet', 'Kettlebell', 'TRX', 'Hiçbiri (vücut ağırlığı)'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Spor Programı Oluşturucu</h2>
                <p className="text-sm text-gray-600">Gemini AI ile kişiselleştirilmiş spor programı</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="rounded-md p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <div className="ml-2 text-sm font-medium text-gray-900">
                    {step === 1 && 'Hasta Bilgileri'}
                    {step === 2 && 'Hedef Belirleme'}
                    {step === 3 && 'Program Oluşturma'}
                  </div>
                  {step < 3 && (
                    <div className={`ml-4 w-16 h-0.5 ${
                      currentStep > step ? 'bg-emerald-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Patient Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-medium text-gray-900">Hasta Seçimi ve Fitness Bilgileri</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasta Seçin *
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handlePatientSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={!!preSelectedPatientId}
                  >
                    <option value="">Hasta seçiniz</option>
                    {patients.filter(p => p.status === 'active').map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} {patient.surname} ({patient.age} yaş, {patient.currentWeight}kg)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPatientId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aktivite Seviyesi *
                      </label>
                      <select
                        value={patientInfo.activityLevel}
                        onChange={(e) => setPatientInfo(prev => ({ 
                          ...prev, 
                          activityLevel: e.target.value as any 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {activityLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label} - {level.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fitness Seviyesi *
                      </label>
                      <select
                        value={patientInfo.fitnessLevel}
                        onChange={(e) => setPatientInfo(prev => ({ 
                          ...prev, 
                          fitnessLevel: e.target.value as any 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {fitnessLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label} - {level.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {selectedPatientId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yaralanma Geçmişi
                    </label>
                    <textarea
                      rows={2}
                      value={patientInfo.injuries}
                      onChange={(e) => setPatientInfo(prev => ({ 
                        ...prev, 
                        injuries: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Geçmiş yaralanmalar, ameliyatlar veya fiziksel kısıtlamalar"
                    />
                  </div>
                )}

                {selectedPatientId && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Hasta Özeti</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Yaş:</span>
                        <span className="ml-1 font-medium">{patientInfo.age}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cinsiyet:</span>
                        <span className="ml-1 font-medium">{patientInfo.gender}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Boy:</span>
                        <span className="ml-1 font-medium">{patientInfo.height} cm</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Kilo:</span>
                        <span className="ml-1 font-medium">{patientInfo.currentWeight} kg</span>
                      </div>
                    </div>
                    {(patientInfo.diseases || patientInfo.injuries) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {patientInfo.diseases && (
                          <p className="text-sm text-red-700">
                            <strong>Hastalıklar:</strong> {patientInfo.diseases}
                          </p>
                        )}
                        {patientInfo.injuries && (
                          <p className="text-sm text-amber-700">
                            <strong>Yaralanmalar:</strong> {patientInfo.injuries}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Goal Setting */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-medium text-gray-900">Spor Hedefi ve Tercihleri</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Spor Hedefi *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {goalTypes.map(goal => (
                      <div
                        key={goal.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          exerciseGoal.type === goal.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setExerciseGoal(prev => ({ ...prev, type: goal.value as any }))}
                      >
                        <h4 className="font-medium text-gray-900">{goal.label}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zorluk Seviyesi *
                    </label>
                    <select
                      value={exerciseGoal.difficulty}
                      onChange={(e) => setExerciseGoal(prev => ({ ...prev, difficulty: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      value={exerciseGoal.frequency}
                      onChange={(e) => setExerciseGoal(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    <select
                      value={exerciseGoal.duration}
                      onChange={(e) => setExerciseGoal(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="2 hafta">2 hafta</option>
                      <option value="4 hafta">4 hafta</option>
                      <option value="6 hafta">6 hafta</option>
                      <option value="8 hafta">8 hafta</option>
                      <option value="12 hafta">12 hafta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sağlık Kısıtlamaları
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {commonRestrictions.map(restriction => (
                      <label key={restriction} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exerciseGoal.restrictions?.includes(restriction) || false}
                          onChange={(e) => {
                            const restrictions = exerciseGoal.restrictions || [];
                            if (e.target.checked) {
                              setExerciseGoal(prev => ({ 
                                ...prev, 
                                restrictions: [...restrictions, restriction] 
                              }));
                            } else {
                              setExerciseGoal(prev => ({ 
                                ...prev, 
                                restrictions: restrictions.filter(r => r !== restriction) 
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{restriction}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customRestrictions}
                    onChange={(e) => setCustomRestrictions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Diğer kısıtlamalar (virgülle ayırın)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Antrenman Tercihleri
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {commonPreferences.map(preference => (
                      <label key={preference} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exerciseGoal.preferences?.includes(preference) || false}
                          onChange={(e) => {
                            const preferences = exerciseGoal.preferences || [];
                            if (e.target.checked) {
                              setExerciseGoal(prev => ({ 
                                ...prev, 
                                preferences: [...preferences, preference] 
                              }));
                            } else {
                              setExerciseGoal(prev => ({ 
                                ...prev, 
                                preferences: preferences.filter(p => p !== preference) 
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{preference}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customPreferences}
                    onChange={(e) => setCustomPreferences(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Diğer tercihler (virgülle ayırın)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mevcut Ekipmanlar
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {commonEquipment.map(equipment => (
                      <label key={equipment} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={exerciseGoal.equipment?.includes(equipment) || false}
                          onChange={(e) => {
                            const equipmentList = exerciseGoal.equipment || [];
                            if (e.target.checked) {
                              setExerciseGoal(prev => ({ 
                                ...prev, 
                                equipment: [...equipmentList, equipment] 
                              }));
                            } else {
                              setExerciseGoal(prev => ({ 
                                ...prev, 
                                equipment: equipmentList.filter(eq => eq !== equipment) 
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{equipment}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Diğer ekipmanlar (virgülle ayırın)"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Generate Program */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-medium text-gray-900">Program Oluşturma</h3>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Program Özeti</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Hasta:</span>
                      <span className="ml-2 font-medium">
                        {patients.find(p => p.id === selectedPatientId)?.name} {patients.find(p => p.id === selectedPatientId)?.surname}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hedef:</span>
                      <span className="ml-2 font-medium">
                        {goalTypes.find(g => g.value === exerciseGoal.type)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Zorluk:</span>
                      <span className="ml-2 font-medium">
                        {fitnessLevels.find(f => f.value === exerciseGoal.difficulty)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Sıklık:</span>
                      <span className="ml-2 font-medium">Haftada {exerciseGoal.frequency} gün</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Süre:</span>
                      <span className="ml-2 font-medium">{exerciseGoal.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fitness Seviyesi:</span>
                      <span className="ml-2 font-medium">
                        {fitnessLevels.find(f => f.value === patientInfo.fitnessLevel)?.label}
                      </span>
                    </div>
                  </div>
                  
                  {(exerciseGoal.restrictions?.length || customRestrictions) && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <span className="text-gray-600">Kısıtlamalar:</span>
                      <span className="ml-2 text-sm">
                        {[...(exerciseGoal.restrictions || []), ...customRestrictions.split(',').filter(r => r.trim())].join(', ')}
                      </span>
                    </div>
                  )}

                  {(exerciseGoal.equipment?.length || customEquipment) && (
                    <div className="mt-2">
                      <span className="text-gray-600">Ekipmanlar:</span>
                      <span className="ml-2 text-sm">
                        {[...(exerciseGoal.equipment || []), ...customEquipment.split(',').filter(e => e.trim())].join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={handleGenerateProgram}
                    disabled={isGenerating}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        AI Spor Programı Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Dumbbell className="h-5 w-5 mr-2" />
                        AI ile Spor Programı Oluştur
                      </>
                    )}
                  </button>
                  
                  {isGenerating && (
                    <p className="mt-2 text-sm text-gray-600">
                      Bu işlem 10-30 saniye sürebilir. Lütfen bekleyin...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Önceki
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                
                {currentStep < 3 && (
                  <button
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !selectedPatientId) ||
                      (currentStep === 2 && !exerciseGoal.type)
                    }
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};