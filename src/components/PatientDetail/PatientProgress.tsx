import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../contexts/DataContext';

interface PatientProgressProps {
  patientId: string;
}

export const PatientProgress: React.FC<PatientProgressProps> = ({ patientId }) => {
  const { getPatientById } = useData();
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

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kilo İlerleme Grafiği</h3>
      
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
  );
};