import { Patient, Appointment, DietPlan } from '../types';

const DATA_FILE_PREFIX = 'dietitian_data_';

export class DataStorage {
  private static getFileName(type: string): string {
    return `${DATA_FILE_PREFIX}${type}.json`;
  }

  static saveToFile<T>(type: string, data: T[]): void {
    const fileName = this.getFileName(type);
    const jsonData = JSON.stringify(data, null, 2);
    
    // Create and download JSON file
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static loadFromFile<T>(type: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        reader.readAsText(file);
      };

      input.click();
    });
  }

  static exportAllData(patients: Patient[], appointments: Appointment[], dietPlans: DietPlan[]): void {
    const allData = {
      patients,
      appointments,
      dietPlans,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const jsonData = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diyettakip_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static importAllData(): Promise<{patients: Patient[], appointments: Appointment[], dietPlans: DietPlan[]}> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.patients && data.appointments && data.dietPlans) {
              resolve({
                patients: data.patients,
                appointments: data.appointments,
                dietPlans: data.dietPlans
              });
            } else {
              reject(new Error('Invalid backup file format'));
            }
          } catch (error) {
            reject(new Error('Invalid JSON file'));
          }
        };
        reader.readAsText(file);
      };

      input.click();
    });
  }
}