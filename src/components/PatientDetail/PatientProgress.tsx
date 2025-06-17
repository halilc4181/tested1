import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface PatientProgressProps {
  patientId: string;
}

export const PatientProgress: React.FC<PatientProgressProps> = ({ patientId }) => {
  const { getPatientById, resetPatientWeightHistory } = useData();
  const [showResetModal, setShowResetModal] = useState(false);
  const patient = getPatientById(patientId);

  if (!patient) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kilo İlerleme Grafiği</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">Hasta bulunamadı</p>
        </div>
      </div>
    );
  }

  const chartData = patient.weightHistory.map(record => ({
    date: new Date(record.date).toLocaleDateString('tr-TR', { 
      month: 'short', 
      day: 'numeric' 
    }),
    weight: record.weight,
    target: patient.targetWeight,
    fullDate: record.date,
    notes: record.notes
  })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

  const handleResetProgress = () => {
    resetPatientWeightHistory(patientId);
    setShowResetModal(false);
  };

  return (
    <>
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Kilo İlerleme Grafiği</h3>
          {chartData.length > 1 && (
            <button
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Kilo geçmişini sıfırla"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Sıfırla
            </button>
          )}
        </div>
        
        {chartData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Henüz kilo kaydı bulunmuyor</p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  labelFormatter={(label) => `Tarih: ${label}`}
                  formatter={(value: any, name: string, props: any) => [
                    `${value} kg`, 
                    name === 'weight' ? 'Mevcut Kilo' : 'Hedef Kilo',
                    props.payload?.notes && `Not: ${props.payload.notes}`
                  ].filter(Boolean)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#10b981', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-sm font-medium text-emerald-800">Başlangıç Kilosu</p>
            <p className="text-lg font-bold text-emerald-900">
              {chartData[0]?.weight || patient.currentWeight} kg
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Mevcut Kilo</p>
            <p className="text-lg font-bold text-blue-900">{patient.currentWeight} kg</p>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-lg">
            <p className="text-sm font-medium text-amber-800">Hedef Kilo</p>
            <p className="text-lg font-bold text-amber-900">{patient.targetWeight} kg</p>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowResetModal(false)} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Kilo Geçmişini Sıfırla
                    </h3>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    Bu işlem <strong>{patient.name} {patient.surname}</strong> hastasının tüm kilo geçmişini silecek ve 
                    sadece mevcut kilosunu başlangıç kaydı olarak tutacaktır.
                  </p>
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    Bu işlem geri alınamaz!
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={handleResetProgress}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};