import React, { useState } from 'react';
import { X, Sparkles, User, Target, Activity, Clock, AlertCircle, Loader } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { geminiService, DietGoal, PatientInfo } from '../../services/geminiService';

interface AIDietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPatientId?: string;
}

export const AIDietPlanModal: React.FC<AIDietPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  preSelectedPatientId = '' 
}) => {
  const { patients, addDietPlan } = useData();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  
  const [selectedPatientId, setSelectedPatientId] = useState(preSelectedPatientId);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    age: 0,
    gender: 'Kadın',
    height: 0,
    currentWeight: 0,
    targetWeight: 0,
    activityLevel: 'moderate',
    medicalHistory: '',
    allergies: '',
    diseases: ''
  });
  
  const [dietGoal, setDietGoal] = useState<DietGoal>({
    type: 'weight_loss',
    duration: '4 hafta',
    restrictions: [],
    preferences: []
  });

  const [customRestrictions, setCustomRestrictions] = useState('');
  const [customPreferences, setCustomPreferences] = useState('');

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
          allergies: patient.allergies,
          diseases: patient.diseases
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
        allergies: patient.allergies,
        diseases: patient.diseases
      });
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Prepare restrictions and preferences
      const restrictions = [
        ...dietGoal.restrictions || [],
        ...customRestrictions.split(',').map(r => r.trim()).filter(r => r)
      ];
      
      const preferences = [
        ...dietGoal.preferences || [],
        ...customPreferences.split(',').map(p => p.trim()).filter(p => p)
      ];

      const finalGoal = {
        ...dietGoal,
        restrictions,
        preferences
      };

      const generatedPlan = await geminiService.generateDietPlan(patientInfo, finalGoal);
      
      // Add the plan to the patient
      const selectedPatient = patients.find(p => p.id === selectedPatientId);
      if (selectedPatient) {
        const planData = {
          patientId: selectedPatientId,
          patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
          title: generatedPlan.title,
          createdDate: new Date().toISOString().split('T')[0],
          totalCalories: generatedPlan.totalCalories,
          duration: generatedPlan.duration,
          status: 'active' as const,
          type: generatedPlan.type,
          meals: generatedPlan.meals,
          notes: generatedPlan.notes,
        };

        addDietPlan(planData);
        onClose();
        alert('AI tarafından oluşturulan diyet planı başarıyla eklendi!');
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
    setDietGoal({
      type: 'weight_loss',
      duration: '4 hafta',
      restrictions: [],
      preferences: []
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const goalTypes = [
    { value: 'weight_loss', label: 'Kilo Verme', description: 'Sağlıklı kilo kaybı için özel plan' },
    { value: 'weight_gain', label: 'Kilo Alma', description: 'Kontrollü kilo artışı için plan' },
    { value: 'maintenance', label: 'Kilo Koruma', description: 'Mevcut kiloyu koruma planı' },
    { value: 'muscle_gain', label: 'Kas Kazanımı', description: 'Kas kütlesi artırma odaklı plan' },
    { value: 'diabetic', label: 'Diyabetik Diyet', description: 'Kan şekeri kontrolü için özel plan' },
    { value: 'hypertension', label: 'Hipertansiyon Diyeti', description: 'Tansiyon kontrolü için plan' },
    { value: 'general_health', label: 'Genel Sağlık', description: 'Genel sağlık için dengeli beslenme' }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Hareketsiz', description: 'Masa başı iş, az hareket' },
    { value: 'light', label: 'Az Aktif', description: 'Hafif egzersiz, haftada 1-3 gün' },
    { value: 'moderate', label: 'Orta Aktif', description: 'Orta egzersiz, haftada 3-5 gün' },
    { value: 'active', label: 'Aktif', description: 'Yoğun egzersiz, haftada 6-7 gün' },
    { value: 'very_active', label: 'Çok Aktif', description: 'Çok yoğun egzersiz, günde 2 kez' }
  ];

  const commonRestrictions = [
    'Gluten içermez', 'Laktoz içermez', 'Vejeteryan', 'Vegan', 'Düşük sodyum', 
    'Şekersiz', 'Düşük yağlı', 'Yüksek protein', 'Düşük karbonhidrat'
  ];

  const commonPreferences = [
    'Türk mutfağı', 'Akdeniz diyeti', 'Hızlı hazırlanabilir', 'Ekonomik', 
    'Mevsimsel besinler', 'Organik ürünler', 'Az baharatlı', 'Çok çeşitli'
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
                <h2 className="text-xl font-semibold text-gray-900">AI Diyet Planı Oluşturucu</h2>
                <p className="text-sm text-gray-600">Gemini AI ile kişiselleştirilmiş diyet planı</p>
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
                    {step === 1 && 'Hasta Seçimi'}
                    {step === 2 && 'Hedef Belirleme'}
                    {step === 3 && 'Plan Oluşturma'}
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
            {/* Step 1: Patient Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-medium text-gray-900">Hasta Seçimi ve Bilgileri</h3>
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
                    {(patientInfo.allergies || patientInfo.diseases) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {patientInfo.allergies && (
                          <p className="text-sm text-amber-700">
                            <strong>Alerjiler:</strong> {patientInfo.allergies}
                          </p>
                        )}
                        {patientInfo.diseases && (
                          <p className="text-sm text-red-700">
                            <strong>Hastalıklar:</strong> {patientInfo.diseases}
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
                  <h3 className="text-lg font-medium text-gray-900">Diyet Hedefi ve Tercihleri</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Diyet Hedefi *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {goalTypes.map(goal => (
                      <div
                        key={goal.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          dietGoal.type === goal.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setDietGoal(prev => ({ ...prev, type: goal.value as any }))}
                      >
                        <h4 className="font-medium text-gray-900">{goal.label}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Süresi *
                    </label>
                    <select
                      value={dietGoal.duration}
                      onChange={(e) => setDietGoal(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="2 hafta">2 hafta</option>
                      <option value="4 hafta">4 hafta</option>
                      <option value="6 hafta">6 hafta</option>
                      <option value="8 hafta">8 hafta</option>
                      <option value="12 hafta">12 hafta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hedef Kalori (opsiyonel)
                    </label>
                    <input
                      type="number"
                      min="800"
                      max="4000"
                      value={dietGoal.targetCalories || ''}
                      onChange={(e) => setDietGoal(prev => ({ 
                        ...prev, 
                        targetCalories: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Otomatik hesaplanacak"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Beslenme Kısıtlamaları
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {commonRestrictions.map(restriction => (
                      <label key={restriction} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dietGoal.restrictions?.includes(restriction) || false}
                          onChange={(e) => {
                            const restrictions = dietGoal.restrictions || [];
                            if (e.target.checked) {
                              setDietGoal(prev => ({ 
                                ...prev, 
                                restrictions: [...restrictions, restriction] 
                              }));
                            } else {
                              setDietGoal(prev => ({ 
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
                    Beslenme Tercihleri
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {commonPreferences.map(preference => (
                      <label key={preference} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dietGoal.preferences?.includes(preference) || false}
                          onChange={(e) => {
                            const preferences = dietGoal.preferences || [];
                            if (e.target.checked) {
                              setDietGoal(prev => ({ 
                                ...prev, 
                                preferences: [...preferences, preference] 
                              }));
                            } else {
                              setDietGoal(prev => ({ 
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
              </div>
            )}

            {/* Step 3: Generate Plan */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-medium text-gray-900">Plan Oluşturma</h3>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Plan Özeti</h4>
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
                        {goalTypes.find(g => g.value === dietGoal.type)?.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Süre:</span>
                      <span className="ml-2 font-medium">{dietGoal.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Aktivite:</span>
                      <span className="ml-2 font-medium">
                        {activityLevels.find(a => a.value === patientInfo.activityLevel)?.label}
                      </span>
                    </div>
                  </div>
                  
                  {(dietGoal.restrictions?.length || customRestrictions) && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <span className="text-gray-600">Kısıtlamalar:</span>
                      <span className="ml-2 text-sm">
                        {[...(dietGoal.restrictions || []), ...customRestrictions.split(',').filter(r => r.trim())].join(', ')}
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
                    onClick={handleGeneratePlan}
                    disabled={isGenerating}
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader className="h-5 w-5 mr-2 animate-spin" />
                        AI Diyet Planı Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        AI ile Diyet Planı Oluştur
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
                      (currentStep === 2 && !dietGoal.type)
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