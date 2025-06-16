import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../contexts/DataContext';

export const WeeklyProgress: React.FC = () => {
  const { appointments } = useData();

  // Get current week's data
  const getWeekData = () => {
    const today = new Date();
    const currentWeek = [];
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.toDateString() === date.toDateString();
      });
      
      const completed = dayAppointments.filter(apt => apt.status === 'completed').length;
      const total = dayAppointments.length;
      
      currentWeek.push({
        day: dayNames[i],
        appointments: total,
        completed: completed,
      });
    }
    
    return currentWeek;
  };

  const data = getWeekData();

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Haftalık Randevu Durumu
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip 
              labelFormatter={(label) => `${label}`}
              formatter={(value, name) => [
                value, 
                name === 'appointments' ? 'Planlanan' : 'Tamamlanan'
              ]}
            />
            <Bar dataKey="appointments" fill="#10b981" name="appointments" />
            <Bar dataKey="completed" fill="#3b82f6" name="completed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};