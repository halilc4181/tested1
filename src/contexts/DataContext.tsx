import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, Appointment, DietPlan, WeightRecord, DietitianSettings, BackupSettings, ExerciseProgram, PatientNote, Transaction } from '../types';
import { apiService } from '../services/apiService';

interface DataContextType {
  patients: Patient[];
  appointments: Appointment[];
  dietPlans: DietPlan[];
  exercisePrograms: ExerciseProgram[];
  settings: DietitianSettings;
  backupSettings: BackupSettings;
  loading: boolean;
  error: string | null;
  addPatient: (patient: Omit<Patient, 'id' | 'bmi' | 'registrationDate' | 'weightHistory'>) => Promise<void>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addDietPlan: (dietPlan: Omit<DietPlan, 'id'>) => Promise<void>;
  updateDietPlan: (id: string, dietPlan: Partial<DietPlan>) => Promise<void>;
  deleteDietPlan: (id: string) => Promise<void>;
  addExerciseProgram: (program: Omit<ExerciseProgram, 'id'>) => Promise<void>;
  updateExerciseProgram: (id: string, program: Partial<ExerciseProgram>) => Promise<void>;
  deleteExerciseProgram: (id: string) => Promise<void>;
  addWeightRecord: (patientId: string, weight: number, date: string, notes?: string) => Promise<void>;
  resetPatientWeightHistory: (patientId: string) => Promise<void>;
  updateSettings: (settings: Partial<DietitianSettings>) => Promise<void>;
  updateBackupSettings: (settings: Partial<BackupSettings>) => Promise<void>;
  createBackup: () => Promise<void>;
  restoreBackup: (backupData: any) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
  getAppointmentsByPatientId: (patientId: string) => Appointment[];
  getDietPlansByPatientId: (patientId: string) => DietPlan[];
  getExerciseProgramsByPatientId: (patientId: string) => ExerciseProgram[];
  getPatientNotes: (patientId: string) => Promise<PatientNote[]>;
  addPatientNote: (note: Omit<PatientNote, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  updatePatientNote: (id: string, note: Partial<PatientNote>) => Promise<void>;
  deletePatientNote: (id: string) => Promise<void>;
  getTransactions: () => Promise<Transaction[]>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const defaultSettings: DietitianSettings = {
  id: '1',
  name: 'Dr. Ayşe Kaya',
  title: 'Diyetisyen',
  phone: '0532 123 4567',
  email: 'diyetisyen@email.com',
  address: 'İstanbul, Türkiye',
  license: 'DYT-12345',
  specialization: 'Klinik Beslenme',
  experience: '8 yıl',
  education: 'Hacettepe Üniversitesi Beslenme ve Diyetetik Bölümü',
  defaultAppointmentDuration: 30,
  workingHours: {
    start: '09:00',
    end: '18:00'
  },
  bio: 'Klinik beslenme alanında uzman diyetisyen. Obezite, diyabet ve kardiyovasküler hastalıklar konularında deneyimli.',
  photo: ''
};

const defaultBackupSettings: BackupSettings = {
  id: '1',
  autoBackupEnabled: true,
  backupFrequency: 7,
  maxBackups: 10,
  lastBackupDate: '',
  backupLocation: 'local',
  includeImages: false,
  compressionEnabled: true,
  encryptionEnabled: false,
  notificationEnabled: true,
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [exercisePrograms, setExercisePrograms] = useState<ExerciseProgram[]>([]);
  const [settings, setSettings] = useState<DietitianSettings>(defaultSettings);
  const [backupSettings, setBackupSettings] = useState<BackupSettings>(defaultBackupSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all data from API
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        patientsData,
        appointmentsData,
        dietPlansData,
        exerciseProgramsData,
        settingsData,
        backupSettingsData
      ] = await Promise.all([
        apiService.getPatients(),
        apiService.getAppointments(),
        apiService.getDietPlans(),
        apiService.getExercisePrograms(),
        apiService.getSettings(),
        apiService.getBackupSettings()
      ]);

      setPatients(patientsData);
      setAppointments(appointmentsData);
      setDietPlans(dietPlansData);
      setExercisePrograms(exerciseProgramsData);
      setSettings(settingsData || defaultSettings);
      setBackupSettings(backupSettingsData || defaultBackupSettings);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  // Patient operations
  const addPatient = async (patientData: Omit<Patient, 'id' | 'bmi' | 'registrationDate' | 'weightHistory'>) => {
    try {
      const newPatient = await apiService.createPatient(patientData);
      setPatients(prev => [...prev, newPatient]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add patient');
    }
  };

  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      const updatedPatient = await apiService.updatePatient(id, patientData);
      setPatients(prev => prev.map(patient => 
        patient.id === id ? updatedPatient : patient
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update patient');
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await apiService.deletePatient(id);
      setPatients(prev => prev.filter(patient => patient.id !== id));
      setAppointments(prev => prev.filter(appointment => appointment.patientId !== id));
      setDietPlans(prev => prev.filter(dietPlan => dietPlan.patientId !== id));
      setExercisePrograms(prev => prev.filter(program => program.patientId !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete patient');
    }
  };

  // Appointment operations
  const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    try {
      const newAppointment = await apiService.createAppointment(appointmentData);
      setAppointments(prev => [...prev, newAppointment]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add appointment');
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      const updatedAppointment = await apiService.updateAppointment(id, appointmentData);
      setAppointments(prev => prev.map(appointment => 
        appointment.id === id ? updatedAppointment : appointment
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update appointment');
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await apiService.deleteAppointment(id);
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete appointment');
    }
  };

  // Diet plan operations
  const addDietPlan = async (dietPlanData: Omit<DietPlan, 'id'>) => {
    try {
      const newDietPlan = await apiService.createDietPlan(dietPlanData);
      setDietPlans(prev => [...prev, newDietPlan]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add diet plan');
    }
  };

  const updateDietPlan = async (id: string, dietPlanData: Partial<DietPlan>) => {
    try {
      const updatedDietPlan = await apiService.updateDietPlan(id, dietPlanData);
      setDietPlans(prev => prev.map(dietPlan => 
        dietPlan.id === id ? updatedDietPlan : dietPlan
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update diet plan');
    }
  };

  const deleteDietPlan = async (id: string) => {
    try {
      await apiService.deleteDietPlan(id);
      setDietPlans(prev => prev.filter(dietPlan => dietPlan.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete diet plan');
    }
  };

  // Exercise program operations
  const addExerciseProgram = async (programData: Omit<ExerciseProgram, 'id'>) => {
    try {
      const newProgram = await apiService.createExerciseProgram(programData);
      setExercisePrograms(prev => [...prev, newProgram]);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add exercise program');
    }
  };

  const updateExerciseProgram = async (id: string, programData: Partial<ExerciseProgram>) => {
    try {
      const updatedProgram = await apiService.updateExerciseProgram(id, programData);
      setExercisePrograms(prev => prev.map(program => 
        program.id === id ? updatedProgram : program
      ));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update exercise program');
    }
  };

  const deleteExerciseProgram = async (id: string) => {
    try {
      await apiService.deleteExerciseProgram(id);
      setExercisePrograms(prev => prev.filter(program => program.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete exercise program');
    }
  };

  // Weight record operations
  const addWeightRecord = async (patientId: string, weight: number, date: string, notes?: string) => {
    try {
      await apiService.addWeightRecord({
        patientId,
        weight,
        date,
        notes
      });
      
      // Refresh patient data to get updated weight history
      const updatedPatients = await apiService.getPatients();
      setPatients(updatedPatients);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add weight record');
    }
  };

  const resetPatientWeightHistory = async (patientId: string) => {
    try {
      await apiService.resetWeightHistory(patientId);
      
      // Refresh patient data
      const updatedPatients = await apiService.getPatients();
      setPatients(updatedPatients);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to reset weight history');
    }
  };

  // Settings operations
  const updateSettings = async (newSettings: Partial<DietitianSettings>) => {
    try {
      const updatedSettings = await apiService.updateSettings({ ...settings, ...newSettings });
      setSettings(updatedSettings);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  const updateBackupSettings = async (newSettings: Partial<BackupSettings>) => {
    try {
      const updatedSettings = await apiService.updateBackupSettings({ ...backupSettings, ...newSettings });
      setBackupSettings(updatedSettings);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update backup settings');
    }
  };

  // Backup operations
  const createBackup = async () => {
    try {
      await apiService.createBackup();
      
      // Refresh backup settings to get updated last backup date
      const updatedBackupSettings = await apiService.getBackupSettings();
      setBackupSettings(updatedBackupSettings);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create backup');
    }
  };

  const restoreBackup = async (backupData: any) => {
    try {
      await apiService.restoreBackup(backupData);
      
      // Refresh all data after restore
      await refreshData();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to restore backup');
    }
  };

  // Patient Notes operations
  const getPatientNotes = async (patientId: string): Promise<PatientNote[]> => {
    try {
      return await apiService.getPatientNotes(patientId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get patient notes');
    }
  };

  const addPatientNote = async (noteData: Omit<PatientNote, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      await apiService.createPatientNote(noteData);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add patient note');
    }
  };

  const updatePatientNote = async (id: string, noteData: Partial<PatientNote>) => {
    try {
      await apiService.updatePatientNote(id, noteData);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update patient note');
    }
  };

  const deletePatientNote = async (id: string) => {
    try {
      await apiService.deletePatientNote(id);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete patient note');
    }
  };

  // Accounting operations
  const getTransactions = async (): Promise<Transaction[]> => {
    try {
      return await apiService.getTransactions();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get transactions');
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await apiService.createTransaction(transactionData);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add transaction');
    }
  };

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    try {
      await apiService.updateTransaction(id, transactionData);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update transaction');
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apiService.deleteTransaction(id);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  // Helper functions
  const getPatientById = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  };

  const getAppointmentsByPatientId = (patientId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.patientId === patientId);
  };

  const getDietPlansByPatientId = (patientId: string): DietPlan[] => {
    return dietPlans.filter(dietPlan => dietPlan.patientId === patientId);
  };

  const getExerciseProgramsByPatientId = (patientId: string): ExerciseProgram[] => {
    return exercisePrograms.filter(program => program.patientId === patientId);
  };

  return (
    <DataContext.Provider value={{
      patients,
      appointments,
      dietPlans,
      exercisePrograms,
      settings,
      backupSettings,
      loading,
      error,
      addPatient,
      updatePatient,
      deletePatient,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addDietPlan,
      updateDietPlan,
      deleteDietPlan,
      addExerciseProgram,
      updateExerciseProgram,
      deleteExerciseProgram,
      addWeightRecord,
      resetPatientWeightHistory,
      updateSettings,
      updateBackupSettings,
      createBackup,
      restoreBackup,
      getPatientById,
      getAppointmentsByPatientId,
      getDietPlansByPatientId,
      getExerciseProgramsByPatientId,
      getPatientNotes,
      addPatientNote,
      updatePatientNote,
      deletePatientNote,
      getTransactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
};