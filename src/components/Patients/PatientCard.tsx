import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Patient } from '../../types';

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const startWeight = patient.weightHistory[0]?.weight || patient.currentWeight;
  const progressPercentage = Math.round(
    ((startWeight - patient.currentWeight) / (startWeight - patient.targetWeight)) * 100
  );
  
  const isProgressing = patient.currentWeight <= patient.targetWeight ? true : progressPercentage > 50;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-emerald-600';
    if (bmi < 30) return 'text-amber-600';
    return 'text-red-600';
  };

  const getBMILabel = (bmi: number) => {
    if (bmi < 18.5) return 'Zayıf';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Fazla Kilolu';
    return 'Obez';
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h3 className="text-sm font-medium text-gray-900">
                {patient.name} {patient.surname}
              </h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full w-fit ${
                patient.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {patient.status === 'active' ? 'Aktif' : 'Pasif'}
              </span>
            </div>
            <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
              <span>{patient.age} yaş, {patient.gender}</span>
              <div className="flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {patient.phone}
              </div>
              {patient.email && (
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">Son Ziyaret</p>
              <div className="flex items-center justify-center text-xs sm:text-sm text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="truncate">{formatDate(patient.lastVisit)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">Kilo Durumu</p>
              <p className="text-xs sm:text-sm text-gray-600">
                {patient.currentWeight} → {patient.targetWeight} kg
              </p>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">VKİ</p>
              <div className="flex items-center justify-center">
                <span className={`text-xs sm:text-sm font-medium ${getBMIColor(patient.bmi)}`}>
                  {patient.bmi}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({getBMILabel(patient.bmi)})
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900">İlerleme</p>
              <div className="flex items-center justify-center">
                {isProgressing ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-xs sm:text-sm font-medium ${
                  isProgressing ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  %{Math.abs(progressPercentage)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Link
              to={`/patients/${patient.id}`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Detaylar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};