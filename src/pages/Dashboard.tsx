import React from 'react';
import { Users, Calendar, TrendingUp, FileText } from 'lucide-react';
import { StatCard } from '../components/Dashboard/StatCard';
import { RecentPatients } from '../components/Dashboard/RecentPatients';
import { WeeklyProgress } from '../components/Dashboard/WeeklyProgress';
import { UpcomingAppointments } from '../components/Dashboard/UpcomingAppointments';
import { useData } from '../contexts/DataContext';

export const Dashboard: React.FC = () => {
  const { patients, appointments, dietPlans } = useData();

  const activePatients = patients.filter(p => p.status === 'active').length;
  const thisWeekAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.date);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    return appointmentDate >= weekStart && appointmentDate <= weekEnd;
  }).length;

  const completedAppointments = appointments.filter(apt => apt.status === 'completed').length;
  const totalAppointments = appointments.length;
  const successRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0;

  const activeDietPlans = dietPlans.filter(dp => dp.status === 'active').length;

  const stats = [
    {
      name: 'Toplam Hasta',
      value: activePatients.toString(),
      icon: Users,
      change: '+12%',
      changeType: 'increase' as const,
      color: 'emerald' as const,
    },
    {
      name: 'Bu Hafta Randevu',
      value: thisWeekAppointments.toString(),
      icon: Calendar,
      change: '+4%',
      changeType: 'increase' as const,
      color: 'blue' as const,
    },
    {
      name: 'Başarı Oranı',
      value: `${successRate}%`,
      icon: TrendingUp,
      change: '+8%',
      changeType: 'increase' as const,
      color: 'amber' as const,
    },
    {
      name: 'Aktif Diyet Planı',
      value: activeDietPlans.toString(),
      icon: FileText,
      change: '+15%',
      changeType: 'increase' as const,
      color: 'purple' as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Hasta takip sisteminizin genel görünümü
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.name} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyProgress />
        <UpcomingAppointments />
      </div>

      <RecentPatients />
    </div>
  );
};