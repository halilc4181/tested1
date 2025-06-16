import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AddDietPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedPatientId?: string;
  editingPlan?: any;
}

export const AddDietPlanModal: React.FC<AddDietPlanModalProps> = ({ 
  isOpen, 
  onClose, 
  preSelectedPatientId = '',
  editingPlan
}) => {
  const { patients, addDietPlan, updateDietPlan } = useData();
  const [formData, setFormData] = useState({
    patientId: preSelectedPatientId,
    title: '',
    type: '',
    duration: '',
    totalCalories: '',
    notes: '',
  });

  const [meals, setMeals] = useState([
    {
      name: 'Kahvaltı',
      time: '08:00',
      calories: '450',
      foods: ['2 dilim tam buğday ekmeği', '1 haşlanmış yumurta']
    }
  ]);

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        patientId: editingPlan.patientId,
        title: editingPlan.title,
        type: editingPlan.type,
        duration: editingPlan.duration,
        totalCalories: editingPlan.totalCalories.toString(),
        notes: editingPlan.notes,
      });
      setMeals(editingPlan.meals.map((meal: any) => ({
        name: meal.name,
        time: meal.time,
        calories: meal.calories.toString(),
        foods: [...meal.foods]
      })));
    } else if (preSelectedPatientId) {
      setFormData(prev => ({ ...prev, patientId: preSelectedPatientId }));
    }
  }, [preSelectedPatientId, editingPlan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
      alert('Lütfen bir hasta seçiniz');
      return;
    }

    const validMeals = meals.filter(meal => 
      meal.name && meal.time && meal.calories && 
      meal.foods.some(food => food.trim())
    ).map(meal => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: meal.name,
      time: meal.time,
      calories: parseInt(meal.calories),
      foods: meal.foods.filter(food => food.trim())
    }));

    const planData = {
      patientId: formData.patientId,
      patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
      title: formData.title,
      createdDate: editingPlan ? editingPlan.createdDate : new Date().toISOString().split('T')[0],
      totalCalories: parseInt(formData.totalCalories),
      duration: formData.duration,
      status: editingPlan ? editingPlan.status : 'active' as const,
      type: formData.type,
      meals: validMeals,
      notes: formData.notes,
    };

    if (editingPlan) {
      updateDietPlan(editingPlan.id, planData);
    } else {
      addDietPlan(planData);
    }

    // Reset form
    setFormData({
      patientId: '',
      title: '',
      type: '',
      duration: '',
      totalCalories: '',
      notes: '',
    });
    setMeals([{
      name: 'Kahvaltı',
      time: '08:00',
      calories: '450',
      foods: ['2 dilim tam buğday ekmeği', '1 haşlanmış yumurta']
    }]);

    onClose();
  };

  const addMeal = () => {
    setMeals([...meals, {
      name: '',
      time: '',
      calories: '',
      foods: ['']
    }]);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const updateMeal = (index: number, field: string, value: string) => {
    const updatedMeals = [...meals];
    (updatedMeals[index] as any)[field] = value;
    setMeals(updatedMeals);
  };

  const addFood = (mealIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].foods.push('');
    setMeals(updatedMeals);
  };

  const removeFood = (mealIndex: number, foodIndex: number) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].foods = updatedMeals[mealIndex].foods.filter((_, i) => i !== foodIndex);
    setMeals(updatedMeals);
  };

  const updateFood = (mealIndex: number, foodIndex: number, value: string) => {
    const updatedMeals = [...meals];
    updatedMeals[mealIndex].foods[foodIndex] = value;
    setMeals(updatedMeals);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingPlan ? 'Diyet Planını Düzenle' : 'Yeni Diyet Planı'}
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
                  disabled={!!preSelectedPatientId || !!editingPlan}
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
                  Plan Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Örn: Kilo Verme Diyeti - Şubat 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diyet Türü *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Kilo Verme">Kilo Verme</option>
                  <option value="Kilo Alma">Kilo Alma</option>
                  <option value="Diyabetik">Diyabetik</option>
                  <option value="Hipertansiyon">Hipertansiyon</option>
                  <option value="Spor Diyeti">Spor Diyeti</option>
                  <option value="Genel Sağlık">Genel Sağlık</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Süre *
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toplam Günlük Kalori *
                </label>
                <input
                  type="number"
                  required
                  min="800"
                  max="4000"
                  value={formData.totalCalories}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalCalories: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
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
                placeholder="Diyet planı ile ilgili özel notlar"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Öğünler</h3>
                <button
                  type="button"
                  onClick={addMeal}
                  className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Öğün Ekle
                </button>
              </div>

              <div className="space-y-4">
                {meals.map((meal, mealIndex) => (
                  <div key={mealIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Öğün {mealIndex + 1}</h4>
                      {meals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMeal(mealIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Öğün Adı
                        </label>
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => updateMeal(mealIndex, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Örn: Kahvaltı"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Saat
                        </label>
                        <input
                          type="time"
                          value={meal.time}
                          onChange={(e) => updateMeal(mealIndex, 'time', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kalori
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="2000"
                          value={meal.calories}
                          onChange={(e) => updateMeal(mealIndex, 'calories', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Besinler
                        </label>
                        <button
                          type="button"
                          onClick={() => addFood(mealIndex)}
                          className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          + Besin Ekle
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {meal.foods.map((food, foodIndex) => (
                          <div key={foodIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={food}
                              onChange={(e) => updateFood(mealIndex, foodIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="Örn: 2 dilim tam buğday ekmeği"
                            />
                            {meal.foods.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeFood(mealIndex, foodIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
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
                {editingPlan ? 'Güncelle' : 'Diyet Planı Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};