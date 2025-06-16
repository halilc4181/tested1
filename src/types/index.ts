export interface User {
  id: string;
  email: string;
  name: string;
  role: 'dietitian';
  photo?: string;
}

export interface Patient {
  id: string;
  name: string;
  surname: string;
  age: number;
  gender: 'Kadın' | 'Erkek';
  phone: string;
  email: string;
  address: string;
  height: number;
  currentWeight: number;
  targetWeight: number;
  bmi: number;
  registrationDate: string;
  lastVisit: string;
  medicalHistory: string;
  allergies: string;
  medications: string;
  diseases: string;
  doctorNotes: string;
  goals: string;
  status: 'active' | 'inactive';
  weightHistory: WeightRecord[];
}

export interface WeightRecord {
  id: string;
  patientId: string;
  weight: number;
  date: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  notes: string;
  duration: number;
}

export interface DietPlan {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  createdDate: string;
  totalCalories: number;
  duration: string;
  status: 'active' | 'completed' | 'paused';
  type: string;
  meals: Meal[];
  notes: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  foods: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}