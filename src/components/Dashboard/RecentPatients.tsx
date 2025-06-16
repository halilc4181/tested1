import React from 'react';
import { User, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

export const RecentPatients: React.FC = () => {
  const { patients } = useData();
  const navigate = useNavigate();

  const recentPatients = patients
    .filter(patient => patient.status === 'active')
    .sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime())
    .slice(0, 4)
    .map(patient => {
      const startWeight = patient.weightHistory[0]?.weight || patient.currentWeight;
      const progressPercentage = Math.round(
        ((startWeight - patient.currentWeight) / (startWeight - patient.targetWeight)) * 100
      );
      
      return {
        ...patient,
        progress: patient.currentWeight <= patient.targetWeight ? 'positive' : 
                 progressPercentage > 50 ? 'positive' : 'negative',
        progressPercentage: Math.abs(progressPercentage),
      };
    });

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const formatLastVisit = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 gün önce';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 14) return '1 hafta önce';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    return `${Math.floor(diffDays / 30)} ay önce`;
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Son Görülen Hastalar
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {recentPatients.length === 0 ? (
          <div className="p-12 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Hasta bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Henüz aktif hasta kaydı bulunmamaktadır.
            </p>
          </div>
        ) : (
          recentPatients.map((patient) => (
            <div 
              key={patient.id} 
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handlePatientClick(patient.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {patient.name} {patient.surname}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {patient.age} yaş • Son ziyaret: {formatLastVisit(patient.lastVisit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {patient.currentWeight} kg → {patient.targetWeight} kg
                    </p>
                    <div className="mt-1 flex items-center">
                      {patient.progress === 'positive' ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${
                        patient.progress === 'positive' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        %{patient.progressPercentage} ilerleme
                      </span>
                    </div>
                  </div>
                  <div className="w-16">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          patient.progress === 'positive' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(patient.progressPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};