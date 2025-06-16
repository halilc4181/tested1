import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Clock, User, Edit, Trash2, Download, Eye } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AddDietPlanModal } from '../components/DietPlans/AddDietPlanModal';
import { DietPlanDetailModal } from '../components/DietPlans/DietPlanDetailModal';
import { useLocation } from 'react-router-dom';

export const DietPlans: React.FC = () => {
  const { dietPlans, patients, deleteDietPlan } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [preSelectedPatientId, setPreSelectedPatientId] = useState<string>('');
  
  const location = useLocation();

  useEffect(() => {
    // Check if we came from patient detail page with a selected patient
    if (location.state?.selectedPatientId) {
      setPreSelectedPatientId(location.state.selectedPatientId);
      setIsAddModalOpen(true);
    }
  }, [location.state]);

  const filteredPlans = dietPlans.filter(plan => {
    const matchesSearch = 
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || plan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (planId: string) => {
    if (confirm('Bu diyet planını silmek istediğinizden emin misiniz?')) {
      deleteDietPlan(planId);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setPreSelectedPatientId('');
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diyet Planları</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hasta diyet planlarınızı oluşturun ve yönetin ({dietPlans.length} plan)
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Diyet Planı
        </button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Diyet planı ara (başlık, hasta, tür)..."
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
                <option value="all">Tüm Planlar</option>
                <option value="active">Aktif</option>
                <option value="completed">Tamamlanan</option>
                <option value="paused">Duraklatılan</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPlans.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterStatus !== 'all' ? 'Plan bulunamadı' : 'Henüz diyet planı yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Arama kriterlerinize uygun plan bulunmamaktadır.'
                  : 'İlk diyet planınızı oluşturmak için "Yeni Diyet Planı" butonuna tıklayın.'
                }
              </p>
            </div>
          ) : (
            filteredPlans.map((plan) => (
              <div key={plan.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {plan.title}
                        </h3>
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
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {plan.patientName}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {plan.duration}
                        </div>
                        <span>
                          Oluşturulma: {new Date(plan.createdDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">Günlük Kalori</p>
                      <p className="text-lg font-bold text-emerald-600">{plan.totalCalories}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedPlan(plan)}
                        className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(plan)}
                        className="inline-flex items-center px-3 py-1 text-sm text-amber-600 hover:text-amber-700"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
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

      <AddDietPlanModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        preSelectedPatientId={preSelectedPatientId}
        editingPlan={editingPlan}
      />

      {selectedPlan && (
        <DietPlanDetailModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};