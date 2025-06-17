import { ENV } from '../config/environment';

class ApiService {
  private getApiBaseUrl(): string {
    return ENV.getApiBasePath();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.getApiBaseUrl()}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Patient Notes
  async getPatientNotes(patientId: string) {
    return this.request(`/patient-notes.php?patientId=${patientId}`);
  }

  async createPatientNote(note: any) {
    return this.request('/patient-notes.php', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  }

  async updatePatientNote(id: string, note: any) {
    return this.request(`/patient-notes.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  }

  async deletePatientNote(id: string) {
    return this.request(`/patient-notes.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Accounting Transactions
  async getTransactions() {
    return this.request('/transactions.php');
  }

  async createTransaction(transaction: any) {
    return this.request('/transactions.php', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  async updateTransaction(id: string, transaction: any) {
    return this.request(`/transactions.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Appointments
  async getAppointments() {
    return this.request('/appointments.php');
  }

  async createAppointment(appointment: any) {
    return this.request('/appointments.php', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }

  async updateAppointment(id: string, appointment: any) {
    return this.request(`/appointments.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    });
  }

  async deleteAppointment(id: string) {
    return this.request(`/appointments.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Patients
  async getPatients() {
    return this.request('/patients.php');
  }

  async createPatient(patient: any) {
    return this.request('/patients.php', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async updatePatient(id: string, patient: any) {
    return this.request(`/patients.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  }

  async deletePatient(id: string) {
    return this.request(`/patients.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Diet Plans
  async getDietPlans() {
    return this.request('/diet-plans.php');
  }

  async createDietPlan(dietPlan: any) {
    return this.request('/diet-plans.php', {
      method: 'POST',
      body: JSON.stringify(dietPlan),
    });
  }

  async updateDietPlan(id: string, dietPlan: any) {
    return this.request(`/diet-plans.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(dietPlan),
    });
  }

  async deleteDietPlan(id: string) {
    return this.request(`/diet-plans.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Exercise Programs
  async getExercisePrograms() {
    return this.request('/exercise-programs.php');
  }

  async createExerciseProgram(program: any) {
    return this.request('/exercise-programs.php', {
      method: 'POST',
      body: JSON.stringify(program),
    });
  }

  async updateExerciseProgram(id: string, program: any) {
    return this.request(`/exercise-programs.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(program),
    });
  }

  async deleteExerciseProgram(id: string) {
    return this.request(`/exercise-programs.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Email Reminders
  async getEmailReminders() {
    return this.request('/email-reminders.php');
  }

  async createEmailReminder(reminder: any) {
    return this.request('/email-reminders.php', {
      method: 'POST',
      body: JSON.stringify(reminder),
    });
  }

  async updateEmailReminder(id: string, reminder: any) {
    return this.request(`/email-reminders.php?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(reminder),
    });
  }

  async deleteEmailReminder(id: string) {
    return this.request(`/email-reminders.php?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Weight Records
  async addWeightRecord(weightRecord: any) {
    return this.request('/weight-records.php', {
      method: 'POST',
      body: JSON.stringify(weightRecord),
    });
  }

  async resetWeightHistory(patientId: string) {
    return this.request(`/weight-records.php?patientId=${patientId}`, {
      method: 'PUT',
    });
  }

  // Settings
  async getSettings() {
    return this.request('/settings.php');
  }

  async updateSettings(settings: any) {
    return this.request('/settings.php', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Backup Settings
  async getBackupSettings() {
    return this.request('/backup-settings.php');
  }

  async updateBackupSettings(settings: any) {
    return this.request('/backup-settings.php', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Backup
  async createBackup() {
    const response = await fetch(`${this.getApiBaseUrl()}/backup.php`);
    if (!response.ok) {
      throw new Error('Backup creation failed');
    }
    
    // Trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diyettakip_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async restoreBackup(backupData: any) {
    return this.request('/backup.php', {
      method: 'POST',
      body: JSON.stringify(backupData),
    });
  }
}

export const apiService = new ApiService();