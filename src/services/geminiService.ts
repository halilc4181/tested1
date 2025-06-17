export interface DietGoal {
  type: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain' | 'diabetic' | 'hypertension' | 'general_health';
  targetCalories?: number;
  duration: string;
  restrictions?: string[];
  preferences?: string[];
}

export interface PatientInfo {
  age: number;
  gender: 'Kadın' | 'Erkek';
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  medicalHistory?: string;
  allergies?: string;
  diseases?: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.apiKey = 'AIzaSyCWyqsAvf_ziYNsKpMT5dttiCW8sajdaL4';
  }

  private calculateBMR(patient: PatientInfo): number {
    // Harris-Benedict Equation
    if (patient.gender === 'Erkek') {
      return 88.362 + (13.397 * patient.currentWeight) + (4.799 * patient.height) - (5.677 * patient.age);
    } else {
      return 447.593 + (9.247 * patient.currentWeight) + (3.098 * patient.height) - (4.330 * patient.age);
    }
  }

  private calculateTDEE(bmr: number, activityLevel: string): number {
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers];
  }

  private calculateTargetCalories(patient: PatientInfo, goal: DietGoal): number {
    if (goal.targetCalories) return goal.targetCalories;

    const bmr = this.calculateBMR(patient);
    const tdee = this.calculateTDEE(bmr, patient.activityLevel);

    switch (goal.type) {
      case 'weight_loss':
        return Math.round(tdee - 500); // 0.5 kg/week loss
      case 'weight_gain':
        return Math.round(tdee + 500); // 0.5 kg/week gain
      case 'muscle_gain':
        return Math.round(tdee + 300);
      case 'maintenance':
      case 'diabetic':
      case 'hypertension':
      case 'general_health':
      default:
        return Math.round(tdee);
    }
  }

  private createPrompt(patient: PatientInfo, goal: DietGoal): string {
    const targetCalories = this.calculateTargetCalories(patient, goal);
    
    const goalDescriptions = {
      weight_loss: 'kilo verme',
      weight_gain: 'kilo alma',
      maintenance: 'kilo koruma',
      muscle_gain: 'kas kazanımı',
      diabetic: 'diyabetik diyet',
      hypertension: 'hipertansiyon diyeti',
      general_health: 'genel sağlık'
    };

    return `
Türk mutfağına uygun, ${goalDescriptions[goal.type]} hedefli günlük diyet planı oluştur.

HASTA BİLGİLERİ:
- Yaş: ${patient.age}
- Cinsiyet: ${patient.gender}
- Boy: ${patient.height} cm
- Mevcut Kilo: ${patient.currentWeight} kg
- Hedef Kilo: ${patient.targetWeight} kg
- Aktivite Seviyesi: ${patient.activityLevel}
${patient.medicalHistory ? `- Tıbbi Geçmiş: ${patient.medicalHistory}` : ''}
${patient.allergies ? `- Alerjiler: ${patient.allergies}` : ''}
${patient.diseases ? `- Hastalıklar: ${patient.diseases}` : ''}

HEDEF:
- Diyet Türü: ${goalDescriptions[goal.type]}
- Günlük Kalori: ${targetCalories} kcal
- Süre: ${goal.duration}
${goal.restrictions?.length ? `- Kısıtlamalar: ${goal.restrictions.join(', ')}` : ''}
${goal.preferences?.length ? `- Tercihler: ${goal.preferences.join(', ')}` : ''}

LÜTFEN AŞAĞIDAKİ JSON FORMATINDA YANIT VER:

{
  "title": "Diyet planı başlığı",
  "totalCalories": ${targetCalories},
  "type": "${goalDescriptions[goal.type]}",
  "duration": "${goal.duration}",
  "notes": "Genel notlar ve öneriler",
  "meals": [
    {
      "name": "Kahvaltı",
      "time": "08:00",
      "calories": 400,
      "foods": [
        "2 dilim tam buğday ekmeği",
        "1 haşlanmış yumurta",
        "1 dilim beyaz peynir"
      ]
    },
    {
      "name": "Ara Öğün",
      "time": "10:30",
      "calories": 150,
      "foods": [
        "1 orta boy elma"
      ]
    },
    {
      "name": "Öğle Yemeği",
      "time": "13:00",
      "calories": 500,
      "foods": [
        "100 gr ızgara tavuk",
        "1 porsiyon bulgur pilavı"
      ]
    },
    {
      "name": "Ara Öğün",
      "time": "16:00",
      "calories": 100,
      "foods": [
        "1 kase yoğurt"
      ]
    },
    {
      "name": "Akşam Yemeği",
      "time": "19:00",
      "calories": 450,
      "foods": [
        "100 gr ızgara balık",
        "1 porsiyon salata"
      ]
    }
  ]
}

ÖNEMLI KURALLAR:
1. Sadece JSON formatında yanıt ver, başka açıklama ekleme
2. Türk mutfağına uygun besinler kullan
3. Porsiyon miktarlarını belirt
4. Toplam kalori hedefine uygun dağılım yap
5. Öğün saatlerini mantıklı aralıklarla ayarla
6. Alerjiler ve kısıtlamaları dikkate al
7. Hastalık durumuna uygun besinler seç
`;
  }

  async generateDietPlan(patient: PatientInfo, goal: DietGoal): Promise<any> {
    try {
      const prompt = this.createPrompt(patient, goal);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Clean the response and parse JSON
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      const dietPlan = JSON.parse(cleanedText);
      
      // Add unique IDs to meals
      dietPlan.meals = dietPlan.meals.map((meal: any, index: number) => ({
        ...meal,
        id: `meal_${Date.now()}_${index}`
      }));

      return dietPlan;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Diyet planı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }
}

export const geminiService = new GeminiService();