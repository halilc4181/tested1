import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient, Appointment, DietPlan, WeightRecord } from '../types';

interface DataContextType {
  patients: Patient[];
  appointments: Appointment[];
  dietPlans: DietPlan[];
  addPatient: (patient: Omit<Patient, 'id' | 'bmi' | 'registrationDate' | 'weightHistory'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addDietPlan: (dietPlan: Omit<DietPlan, 'id'>) => void;
  updateDietPlan: (id: string, dietPlan: Partial<DietPlan>) => void;
  deleteDietPlan: (id: string) => void;
  addWeightRecord: (patientId: string, weight: number, date: string, notes?: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  getAppointmentsByPatientId: (patientId: string) => Appointment[];
  getDietPlansByPatientId: (patientId: string) => DietPlan[];
  saveAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);

  // Load data from JSON files and localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from localStorage first
        const savedPatients = localStorage.getItem('patients');
        const savedAppointments = localStorage.getItem('appointments');
        const savedDietPlans = localStorage.getItem('dietPlans');

        if (savedPatients && savedAppointments && savedDietPlans) {
          setPatients(JSON.parse(savedPatients));
          setAppointments(JSON.parse(savedAppointments));
          setDietPlans(JSON.parse(savedDietPlans));
        } else {
          // Load from JSON files if localStorage is empty
          const [patientsRes, appointmentsRes, dietPlansRes] = await Promise.all([
            fetch('/data/patients.json'),
            fetch('/data/appointments.json'),
            fetch('/data/dietPlans.json')
          ]);

          const patientsData = await patientsRes.json();
          const appointmentsData = await appointmentsRes.json();
          const dietPlansData = await dietPlansRes.json();

          setPatients(patientsData);
          setAppointments(appointmentsData);
          setDietPlans(dietPlansData);

          // Save to localStorage
          localStorage.setItem('patients', JSON.stringify(patientsData));
          localStorage.setItem('appointments', JSON.stringify(appointmentsData));
          localStorage.setItem('dietPlans', JSON.stringify(dietPlansData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to empty arrays if loading fails
        setPatients([]);
        setAppointments([]);
        setDietPlans([]);
      }
    };

    loadData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (patients.length > 0) {
      localStorage.setItem('patients', JSON.stringify(patients));
    }
  }, [patients]);

  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem('appointments', JSON.stringify(appointments));
    }
  }, [appointments]);

  useEffect(() => {
    if (dietPlans.length > 0) {
      localStorage.setItem('dietPlans', JSON.stringify(dietPlans));
    }
  }, [dietPlans]);

  const saveAllData = () => {
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('dietPlans', JSON.stringify(dietPlans));
  };

  const addPatient = (patientData: Omit<Patient, 'id' | 'bmi' | 'registrationDate' | 'weightHistory'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: generateId(),
      bmi: calculateBMI(patientData.currentWeight, patientData.height),
      registrationDate: new Date().toISOString().split('T')[0],
      weightHistory: [
        {
          id: generateId(),
          patientId: '',
          weight: patientData.currentWeight,
          date: new Date().toISOString().split('T')[0],
          notes: 'İlk kayıt',
        },
      ],
    };
    newPatient.weightHistory[0].patientId = newPatient.id;
    setPatients(prev => [...prev, newPatient]);
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    setPatients(prev => prev.map(patient => {
      if (patient.id === id) {
        const updated = { ...patient, ...patientData };
        if (patientData.currentWeight && patientData.height) {
          updated.bmi = calculateBMI(patientData.currentWeight, patientData.height);
        }
        return updated;
      }
      return patient;
    }));
  };

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(patient => patient.id !== id));
    setAppointments(prev => prev.filter(appointment => appointment.patientId !== id));
    setDietPlans(prev => prev.filter(dietPlan => dietPlan.patientId !== id));
  };

  const addAppointment = (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: generateId(),
    };
    setAppointments(prev => [...prev, newAppointment]);
  };

  const updateAppointment = (id: string, appointmentData: Partial<Appointment>) => {
    setAppointments(prev => prev.map(appointment => 
      appointment.id === id ? { ...appointment, ...appointmentData } : appointment
    ));
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  const addDietPlan = (dietPlanData: Omit<DietPlan, 'id'>) => {
    const newDietPlan: DietPlan = {
      ...dietPlanData,
      id: generateId(),
    };
    setDietPlans(prev => [...prev, newDietPlan]);
  };

  const updateDietPlan = (id: string, dietPlanData: Partial<DietPlan>) => {
    setDietPlans(prev => prev.map(dietPlan => 
      dietPlan.id === id ? { ...dietPlan, ...dietPlanData } : dietPlan
    ));
  };

  const deleteDietPlan = (id: string) => {
    setDietPlans(prev => prev.filter(dietPlan => dietPlan.id !== id));
  };

  const addWeightRecord = (patientId: string, weight: number, date: string, notes?: string) => {
    const weightRecord: WeightRecord = {
      id: generateId(),
      patientId,
      weight,
      date,
      notes,
    };

    setPatients(prev => prev.map(patient => {
      if (patient.id === patientId) {
        const updatedHistory = [...patient.weightHistory, weightRecord];
        return {
          ...patient,
          currentWeight: weight,
          bmi: calculateBMI(weight, patient.height),
          lastVisit: date,
          weightHistory: updatedHistory,
        };
      }
      return patient;
    }));
  };

  const getPatientById = (id: string): Patient | undefined => {
    return patients.find(patient => patient.id === id);
  };

  const getAppointmentsByPatientId = (patientId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.patientId === patientId);
  };

  const getDietPlansByPatientId = (patientId: string): DietPlan[] => {
    return dietPlans.filter(dietPlan => dietPlan.patientId === patientId);
  };

  return (
    <DataContext.Provider value={{
      patients,
      appointments,
      dietPlans,
      addPatient,
      updatePatient,
      deletePatient,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addDietPlan,
      updateDietPlan,
      deleteDietPlan,
      addWeightRecord,
      getPatientById,
      getAppointmentsByPatientId,
      getDietPlansByPatientId,
      saveAllData,
    }}>
      {children}
    </DataContext.Provider>
  );
};