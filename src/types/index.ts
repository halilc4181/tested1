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

export interface ExerciseProgram {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  createdDate: string;
  duration: string;
  status: 'active' | 'completed' | 'paused';
  type: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: number; // days per week
  workouts: Workout[];
  notes: string;
  aiGenerated?: boolean;
}

export interface Workout {
  id: string;
  name: string;
  day: string;
  duration: number; // minutes
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'balance';
  sets?: number;
  reps?: number;
  duration?: number; // minutes for cardio
  weight?: number; // kg
  restTime?: number; // seconds
  instructions: string;
  targetMuscles: string[];
}

export interface DietitianSettings {
  id: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  address: string;
  license: string;
  specialization: string;
  experience: string;
  education: string;
  defaultAppointmentDuration: number;
  workingHours: {
    start: string;
    end: string;
  };
  bio: string;
  photo?: string;
  // Email settings
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  emailFromName?: string;
  emailFromAddress?: string;
  // Reminder settings
  enableAppointmentReminders?: boolean;
  reminderDaysBefore?: number;
  reminderTime?: string;
  autoSendReminders?: boolean;
}

export interface BackupSettings {
  id: string;
  autoBackupEnabled: boolean;
  backupFrequency: number; // days
  maxBackups: number;
  lastBackupDate: string;
  backupLocation: 'local' | 'cloud';
  includeImages: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  notificationEnabled: boolean;
}

export interface EmailReminder {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  reminderDate: string;
  status: 'pending' | 'sent' | 'failed';
  sentDate?: string;
  errorMessage?: string;
  emailType: 'appointment_reminder' | 'manual_email';
  subject: string;
  content: string;
}

export interface PatientNote {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  content: string;
  type: 'general' | 'medical' | 'diet' | 'exercise' | 'appointment';
  isPrivate: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  type: 'income' | 'expense';
  category: 'appointment' | 'consultation' | 'diet_plan' | 'exercise_program' | 'other';
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  status: 'paid' | 'pending' | 'overdue';
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}