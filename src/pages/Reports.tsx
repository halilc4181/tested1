import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, Users, DollarSign, Target, Clock, Download, Filter, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import jsPDF from 'jspdf';

export const Reports: React.FC = () => {
  const { patients, appointments, dietPlans } = useData();
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const analytics = useMemo(() => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - parseInt(dateRange) * 24 * 60 * 60 * 1000);

    // Hasta analitikleri
    const activePatients = patients.filter(p => p.status === 'active').length;
    const totalPatients = patients.length;
    const newPatients = patients.filter(p => 
      new Date(p.registrationDate) >= daysAgo
    ).length;

    // Randevu analitikleri
    const recentAppointments = appointments.filter(apt => 
      new Date(apt.date) >= daysAgo
    );
    const completedAppointments = recentAppointments.filter(apt => apt.status === 'completed').length;
    const cancelledAppointments = recentAppointments.filter(apt => apt.status === 'cancelled').length;
    const successRate = recentAppointments.length > 0 ? 
      Math.round((completedAppointments / recentAppointments.length) * 100) : 0;

    // Kilo kaybı analitikleri
    const patientsWithProgress = patients.filter(p => p.weightHistory.length > 1);
    const totalWeightLoss = patientsWithProgress.reduce((total, patient) => {
      const startWeight = patient.weightHistory[0]?.weight || patient.currentWeight;
      return total + (startWeight - patient.currentWeight);
    }, 0);

    const avgWeightLoss = patientsWithProgress.length > 0 ? 
      totalWeightLoss / patientsWithProgress.length : 0;

    // Hedefine ulaşan hastalar
    const patientsReachedGoal = patients.filter(p => 
      p.currentWeight <= p.targetWeight
    ).length;
    const goalSuccessRate = totalPatients > 0 ? 
      Math.round((patientsReachedGoal / totalPatients) * 100) : 0;

    // Günlük randevu dağılımı
    const dailyAppointments = Array.from({ length: parseInt(dateRange) }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayAppointments = appointments.filter(apt => 
        apt.date === date.toISOString().split('T')[0]
      );
      return {
        date: date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
        appointments: dayAppointments.length,
        completed: dayAppointments.filter(apt => apt.status === 'completed').length,
        cancelled: dayAppointments.filter(apt => apt.status === 'cancelled').length,
      };
    }).reverse();

    // Randevu türü dağılımı
    const appointmentTypes = recentAppointments.reduce((acc, apt) => {
      acc[apt.type] = (acc[apt.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const appointmentTypeData = Object.entries(appointmentTypes).map(([type, count]) => ({
      name: type,
      value: count,
      percentage: Math.round((count / recentAppointments.length) * 100)
    }));

    // Aylık hasta kayıt trendi
    const monthlyRegistrations = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthPatients = patients.filter(p => {
        const regDate = new Date(p.registrationDate);
        return regDate >= monthStart && regDate <= monthEnd;
      }).length;

      return {
        month: date.toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
        patients: monthPatients
      };
    }).reverse();

    // BMI dağılımı
    const bmiDistribution = patients.reduce((acc, patient) => {
      if (patient.bmi < 18.5) acc.underweight++;
      else if (patient.bmi < 25) acc.normal++;
      else if (patient.bmi < 30) acc.overweight++;
      else acc.obese++;
      return acc;
    }, { underweight: 0, normal: 0, overweight: 0, obese: 0 });

    const bmiData = [
      { name: 'Zayıf', value: bmiDistribution.underweight, color: '#3b82f6' },
      { name: 'Normal', value: bmiDistribution.normal, color: '#10b981' },
      { name: 'Fazla Kilolu', value: bmiDistribution.overweight, color: '#f59e0b' },
      { name: 'Obez', value: bmiDistribution.obese, color: '#ef4444' }
    ];

    return {
      overview: {
        activePatients,
        totalPatients,
        newPatients,
        completedAppointments,
        successRate,
        avgWeightLoss,
        goalSuccessRate
      },
      charts: {
        dailyAppointments,
        appointmentTypeData,
        monthlyRegistrations,
        bmiData
      }
    };
  }, [patients, appointments, dateRange]);

  const generatePDFReport = () => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Diyetisyen Analitik Raporu', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 20, 45);
    pdf.text(`Analiz Dönemi: Son ${dateRange} gün`, 20, 55);
    
    // Overview Stats
    pdf.setFontSize(16);
    pdf.text('Genel Bakış', 20, 75);
    
    pdf.setFontSize(12);
    let yPos = 90;
    pdf.text(`Aktif Hasta Sayısı: ${analytics.overview.activePatients}`, 20, yPos);
    pdf.text(`Toplam Hasta: ${analytics.overview.totalPatients}`, 20, yPos + 10);
    pdf.text(`Yeni Hastalar: ${analytics.overview.newPatients}`, 20, yPos + 20);
    pdf.text(`Tamamlanan Randevular: ${analytics.overview.completedAppointments}`, 20, yPos + 30);
    pdf.text(`Başarı Oranı: %${analytics.overview.successRate}`, 20, yPos + 40);
    pdf.text(`Ortalama Kilo Kaybı: ${analytics.overview.avgWeightLoss.toFixed(1)} kg`, 20, yPos + 50);
    pdf.text(`Hedefe Ulaşma Oranı: %${analytics.overview.goalSuccessRate}`, 20, yPos + 60);
    
    pdf.save(`diyetisyen_raporu_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {subtitle && (
                <div className="ml-2 text-sm text-gray-600">{subtitle}</div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik ve Raporlar</h1>
          <p className="mt-2 text-sm text-gray-600">
            Detaylı performans analizi ve hasta istatistikleri
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="7">Son 7 gün</option>
            <option value="30">Son 30 gün</option>
            <option value="90">Son 3 ay</option>
            <option value="180">Son 6 ay</option>
            <option value="365">Son 1 yıl</option>
          </select>
          <button
            onClick={generatePDFReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Aktif Hastalar"
          value={analytics.overview.activePatients}
          subtitle={`/ ${analytics.overview.totalPatients} toplam`}
          icon={Users}
          color="bg-emerald-500"
        />
        <StatCard
          title="Başarı Oranı"
          value={`%${analytics.overview.successRate}`}
          subtitle="randevu tamamlama"
          icon={Target}
          color="bg-blue-500"
        />
        <StatCard
          title="Ortalama Kilo Kaybı"
          value={`${analytics.overview.avgWeightLoss.toFixed(1)} kg`}
          subtitle="hasta başına"
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Hedefe Ulaşma"
          value={`%${analytics.overview.goalSuccessRate}`}
          subtitle="hasta başarı oranı"
          icon={Target}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Appointments Chart */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Günlük Randevu Trendi</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.charts.dailyAppointments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="appointments" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="completed" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Types Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Randevu Türü Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.charts.appointmentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.charts.appointmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Registrations */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Hasta Kayıtları</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.charts.monthlyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BMI Distribution */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Dağılımı</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.charts.bmiData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.charts.bmiData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Patients */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">En Başarılı Hastalar</h3>
          <div className="space-y-3">
            {patients
              .filter(p => p.weightHistory.length > 1)
              .map(patient => {
                const startWeight = patient.weightHistory[0]?.weight || patient.currentWeight;
                const weightLoss = startWeight - patient.currentWeight;
                const progressPercentage = Math.round(((startWeight - patient.currentWeight) / (startWeight - patient.targetWeight)) * 100);
                return { ...patient, weightLoss, progressPercentage };
              })
              .sort((a, b) => b.weightLoss - a.weightLoss)
              .slice(0, 5)
              .map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{patient.name} {patient.surname}</p>
                    <p className="text-sm text-gray-600">%{patient.progressPercentage} ilerleme</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">-{patient.weightLoss.toFixed(1)} kg</p>
                    <p className="text-sm text-gray-500">{patient.currentWeight} kg</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
          <div className="space-y-3">
            {appointments
              .filter(apt => new Date(apt.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600">{appointment.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString('tr-TR')}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : appointment.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status === 'completed' ? 'Tamamlandı' : 
                       appointment.status === 'confirmed' ? 'Onaylandı' : 'Bekliyor'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};