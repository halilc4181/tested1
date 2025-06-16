import React from 'react';
import { Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  confirmed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusText = {
  confirmed: 'Onaylandı',
  pending: 'Bekliyor',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi',
};

export const UpcomingAppointments: React.FC = () => {
  const { appointments } = useData();
  const navigate = useNavigate();

  const upcomingAppointments = appointments
    .filter(apt => {
      const appointmentDate = new Date(apt.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today && apt.status !== 'cancelled';
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 4);

  const handleAppointmentClick = (appointmentId: string) => {
    navigate(`/appointments?selected=${appointmentId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Yarın';
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Yaklaşan Randevular
      </h3>
      <div className="space-y-4">
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Yaklaşan randevu bulunmuyor</p>
          </div>
        ) : (
          upcomingAppointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => handleAppointmentClick(appointment.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {appointment.patientName}
                  </p>
                  <p className="text-xs text-gray-500">{appointment.type}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-900 mb-1">
                  <Clock className="h-4 w-4 mr-1" />
                  {appointment.time}
                </div>
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {formatDate(appointment.date)}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[appointment.status]}`}>
                  {statusText[appointment.status]}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};