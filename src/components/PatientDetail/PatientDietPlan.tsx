import React, { useState } from 'react';
import { Clock, CheckCircle, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { DietPlanDetailModal } from '../DietPlans/DietPlanDetailModal';
import { AddDietPlanModal } from '../DietPlans/AddDietPlanModal';

interface PatientDietPlanProps {
  patientId: string;
}

export const PatientDietPlan: React.FC<PatientDietPlanProps> = ({ patientId }) => {
  const { getDietPlansByPatientId, deleteDietPlan, getPatientById } = useData();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const patient = getPatientById(patientId);
  const dietPlans = getDietPlansByPatientId(patientId);
  const activePlan = dietPlans.find(plan => plan.status === 'active');

  const handleCreateNewPlan = () => {
    navigate('/diet-plans', { state: { selectedPatientId: patientId } });
  };

  const handleViewPlan = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Bu diyet planını silmek istediğinizden emin misiniz?')) {
      deleteDietPlan(planId);
    }
  };

  if (!patient) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Diyet Planı</h3>
        <p className="text-gray-500">Hasta bulunamadı</p>
      </div>
    );
  }

  if (dietPlans.length === 0) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Diyet Planı</h3>
          <button
            onClick={handleCreateNewPlan}
            className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Yeni Diyet Planı Oluştur
          </button>
        </div>
        
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Henüz diyet planı yok</h4>
          <p className="text-sm text-gray-500 mb-4">
            {patient.name} {patient.surname} için henüz bir diyet planı oluşturulmamış.
          </p>
          <button
            onClick={handleCreateNewPlan}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            İlk Diyet Planını Oluştur
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Diyet Planları</h3>
          <button
            onClick={handleCreateNewPlan}
            className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Yeni Plan Oluştur
          </button>
        </div>

        <div className="space-y-4">
          {dietPlans.map((plan) => (
            <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{plan.title}</h4>
                  <p className="text-sm text-gray-600">
                    Oluşturulma: {new Date(plan.createdDate).toLocaleDateString('tr-TR')} • 
                    Süre: {plan.duration} • 
                    {plan.totalCalories} kcal/gün
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    plan.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : plan.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status === 'active' ? 'Aktif' : 
                     plan.status === 'completed' ? 'Tamamlandı' : 'Duraklatıldı'}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {plan.type}
                  </span>
                </div>
              </div>

              {plan.status === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {plan.meals.slice(0, 3).map((meal: any) => (
                    <div key={meal.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-900">{meal.name}</h5>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {meal.time}
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {meal.calories} kcal
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {meal.foods.slice(0, 2).map((food: string, index: number) => (
                          <li key={index} className="flex items-start text-xs text-gray-600">
                            <CheckCircle className="h-3 w-3 text-emerald-500 mr-1 mt-0.5 flex-shrink-0" />
                            {food}
                          </li>
                        ))}
                        {meal.foods.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{meal.foods.length - 2} daha...
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                  {plan.meals.length > 3 && (
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        +{plan.meals.length - 3} öğün daha
                      </span>
                    </div>
                  )}
                </div>
              )}

              {plan.notes && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <h5 className="text-sm font-medium text-amber-800 mb-1">Notlar:</h5>
                  <p className="text-sm text-amber-700">{plan.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleViewPlan(plan)}
                  className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                  title="Detayları Görüntüle"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detaylar
                </button>
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="inline-flex items-center px-3 py-1 text-sm text-amber-600 hover:text-amber-700"
                  title="Düzenle"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
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

      {/* Plan Detail Modal */}
      {selectedPlan && (
        <DietPlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onEdit={handleEditPlan}
        />
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <AddDietPlanModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPlan(null);
          }}
          editingPlan={editingPlan}
        />
      )}
    </>
  );
};