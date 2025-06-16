import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Calendar, Edit, TrendingUp, Save, X, ArrowLeft } from 'lucide-react';
import { PatientProgress } from '../components/PatientDetail/PatientProgress';
import { PatientDietPlan } from '../components/PatientDetail/PatientDietPlan';
import { PatientAppointments } from '../components/PatientDetail/PatientAppointments';
import { useData } from '../contexts/DataContext';

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPatientById, updatePatient } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const patient = id ? getPatientById(id) : undefined;

  if (!patient) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Hasta bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            Aradığınız hasta kaydı mevcut değil.
          </p>
          <button
            onClick={() => navigate('/patients')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Hastalara Dön
          </button>
        </div>
      </div>
    );
  }

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600 bg-blue-50';
    if (bmi < 25) return 'text-emerald-600 bg-emerald-50';
    if (bmi < 30) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getBMILabel = (bmi: number) => {
    if (bmi < 18.5) return 'Zayıf';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Fazla Kilolu';
    return 'Obez';
  };

  const startWeight = patient.weightHistory[0]?.weight || patient.currentWeight;
  const progressPercentage = Math.round(((startWeight - patient.currentWeight) / (startWeight - patient.targetWeight)) * 100);

  const handleEdit = () => {
    setEditData({
      name: patient.name,
      surname: patient.surname,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      height: patient.height,
      currentWeight: patient.currentWeight,
      targetWeight: patient.targetWeight,
      medicalHistory: patient.medicalHistory,
      allergies: patient.allergies,
      medications: patient.medications,
      diseases: patient.diseases,
      doctorNotes: patient.doctorNotes,
      goals: patient.goals,
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updatePatient(patient.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/patients')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Hastalara Dön
        </button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
                      placeholder="Ad"
                    />
                    <input
                      type="text"
                      name="surname"
                      value={editData.surname}
                      onChange={handleInputChange}
                      className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1"
                      placeholder="Soyad"
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        name="age"
                        value={editData.age}
                        onChange={handleInputChange}
                        className="w-16 border border-gray-300 rounded px-1 py-0.5"
                        min="1"
                        max="120"
                      />
                      <span>yaş</span>
                    </div>
                    <select
                      name="gender"
                      value={editData.gender}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded px-2 py-0.5"
                    >
                      <option value="Kadın">Kadın</option>
                      <option value="Erkek">Erkek</option>
                    </select>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <input
                        type="tel"
                        name="phone"
                        value={editData.phone}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-2 py-0.5"
                      />
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-2 py-0.5"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900">{patient.name} {patient.surname}</h1>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span>{patient.age} yaş, {patient.gender}</span>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {patient.phone}
                    </div>
                    {patient.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {patient.email}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  İptal
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Düzenle
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">Mevcut Kilo</h3>
            {isEditing ? (
              <div className="mt-2">
                <input
                  type="number"
                  name="currentWeight"
                  value={editData.currentWeight}
                  onChange={handleInputChange}
                  className="text-3xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-full text-center"
                  step="0.1"
                  min="20"
                  max="300"
                />
                <p className="text-sm text-gray-500">kg</p>
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold text-gray-900">{patient.currentWeight}</p>
                <p className="text-sm text-gray-500">kg</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">Hedef Kilo</h3>
            {isEditing ? (
              <div className="mt-2">
                <input
                  type="number"
                  name="targetWeight"
                  value={editData.targetWeight}
                  onChange={handleInputChange}
                  className="text-3xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-full text-center"
                  step="0.1"
                  min="20"
                  max="300"
                />
                <p className="text-sm text-gray-500">kg</p>
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold text-gray-900">{patient.targetWeight}</p>
                <p className="text-sm text-gray-500">kg</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">Boy</h3>
            {isEditing ? (
              <div className="mt-2">
                <input
                  type="number"
                  name="height"
                  value={editData.height}
                  onChange={handleInputChange}
                  className="text-3xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 w-full text-center"
                  min="50"
                  max="250"
                />
                <p className="text-sm text-gray-500">cm</p>
              </div>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold text-gray-900">{patient.height}</p>
                <p className="text-sm text-gray-500">cm</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500">VKİ & İlerleme</h3>
            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBMIColor(patient.bmi)}`}>
              {patient.bmi} ({getBMILabel(patient.bmi)})
            </div>
            <div className="mt-2 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-500 mr-1" />
              <span className="text-lg font-bold text-emerald-600">%{Math.abs(progressPercentage)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientProgress patientId={patient.id} />
        </div>
        <div>
          <PatientAppointments patientId={patient.id} />
        </div>
      </div>

      <PatientDietPlan patientId={patient.id} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tıbbi Bilgiler</h3>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Tıbbi Geçmiş</h4>
                  <textarea
                    name="medicalHistory"
                    value={editData.medicalHistory}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Alerjiler</h4>
                  <textarea
                    name="allergies"
                    value={editData.allergies}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">İlaçlar</h4>
                  <textarea
                    name="medications"
                    value={editData.medications}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Hastalıklar</h4>
                  <textarea
                    name="diseases"
                    value={editData.diseases}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Tıbbi Geçmiş</h4>
                  <p className="mt-1 text-sm text-gray-600">{patient.medicalHistory || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Alerjiler</h4>
                  <p className="mt-1 text-sm text-gray-600">{patient.allergies || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">İlaçlar</h4>
                  <p className="mt-1 text-sm text-gray-600">{patient.medications || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Hastalıklar</h4>
                  <p className="mt-1 text-sm text-gray-600">{patient.diseases || 'Belirtilmemiş'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notlar ve Bilgiler</h3>
          <div className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Adres</h4>
                  <textarea
                    name="address"
                    value={editData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Doktor Notları</h4>
                  <textarea
                    name="doctorNotes"
                    value={editData.doctorNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Hedefler</h4>
                  <textarea
                    name="goals"
                    value={editData.goals}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Adres</h4>
                  <p className="mt-1 text-sm text-gray-600">{patient.address || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Doktor Notları</h4>
                  <p className="mt-1 text-sm text-gray-600">{patient.doctorNotes || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Hedefler</h4>
                  <p className="mt-1 text-sm text-gray-600">{patient.goals || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Kayıt Tarihi</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {new Date(patient.registrationDate).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};