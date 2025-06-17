export interface ExerciseGoal {
  type: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength' | 'flexibility' | 'rehabilitation' | 'general_fitness';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: number; // days per week
  duration: string; // program duration
  preferences?: string[];
  restrictions?: string[];
  equipment?: string[];
}

export interface PatientExerciseInfo {
  age: number;
  gender: 'Kadın' | 'Erkek';
  height: number;
  currentWeight: number;
  targetWeight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  medicalHistory?: string;
  diseases?: string;
  injuries?: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
}

class ExerciseAIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor() {
    this.apiKey = 'AIzaSyCWyqsAvf_ziYNsKpMT5dttiCW8sajdaL4';
  }

  private createPrompt(patient: PatientExerciseInfo, goal: ExerciseGoal): string {
    const goalDescriptions = {
      weight_loss: 'kilo verme',
      muscle_gain: 'kas kazanımı',
      endurance: 'dayanıklılık artırma',
      strength: 'güç artırma',
      flexibility: 'esneklik geliştirme',
      rehabilitation: 'rehabilitasyon',
      general_fitness: 'genel fitness'
    };

    const difficultyDescriptions = {
      beginner: 'başlangıç',
      intermediate: 'orta',
      advanced: 'ileri'
    };

    return `
${goalDescriptions[goal.type]} hedefli, ${difficultyDescriptions[goal.difficulty]} seviyesinde spor programı oluştur.

HASTA BİLGİLERİ:
- Yaş: ${patient.age}
- Cinsiyet: ${patient.gender}
- Boy: ${patient.height} cm
- Mevcut Kilo: ${patient.currentWeight} kg
- Hedef Kilo: ${patient.targetWeight} kg
- Aktivite Seviyesi: ${patient.activityLevel}
- Fitness Seviyesi: ${patient.fitnessLevel}
${patient.medicalHistory ? `- Tıbbi Geçmiş: ${patient.medicalHistory}` : ''}
${patient.diseases ? `- Hastalıklar: ${patient.diseases}` : ''}
${patient.injuries ? `- Yaralanmalar: ${patient.injuries}` : ''}

PROGRAM HEDEFİ:
- Spor Türü: ${goalDescriptions[goal.type]}
- Zorluk Seviyesi: ${difficultyDescriptions[goal.difficulty]}
- Haftalık Sıklık: ${goal.frequency} gün
- Program Süresi: ${goal.duration}
${goal.restrictions?.length ? `- Kısıtlamalar: ${goal.restrictions.join(', ')}` : ''}
${goal.preferences?.length ? `- Tercihler: ${goal.preferences.join(', ')}` : ''}
${goal.equipment?.length ? `- Mevcut Ekipmanlar: ${goal.equipment.join(', ')}` : ''}

LÜTFEN AŞAĞIDAKİ JSON FORMATINDA YANIT VER:

{
  "title": "Spor programı başlığı",
  "type": "${goalDescriptions[goal.type]}",
  "goal": "Program hedefi açıklaması",
  "difficulty": "${goal.difficulty}",
  "frequency": ${goal.frequency},
  "duration": "${goal.duration}",
  "notes": "Genel notlar ve öneriler",
  "workouts": [
    {
      "name": "Pazartesi - Üst Vücut",
      "day": "Pazartesi",
      "duration": 45,
      "exercises": [
        {
          "name": "Şınav",
          "type": "strength",
          "sets": 3,
          "reps": 10,
          "restTime": 60,
          "instructions": "Düzgün form ile yapın",
          "targetMuscles": ["Göğüs", "Triceps", "Omuz"]
        },
        {
          "name": "Koşu",
          "type": "cardio",
          "duration": 20,
          "instructions": "Orta tempoda koşu",
          "targetMuscles": ["Bacaklar", "Kalp"]
        }
      ]
    }
  ]
}

ÖNEMLI KURALLAR:
1. Sadece JSON formatında yanıt ver, başka açıklama ekleme
2. Türkçe egzersiz isimleri kullan
3. Hasta durumuna uygun egzersizler seç
4. Yaralanma riski düşük egzersizler öner
5. Hastalık durumuna uygun modifikasyonlar yap
6. Zorluk seviyesine uygun set/tekrar sayıları ver
7. Her egzersiz için açık talimatlar ver
8. Hedef kas gruplarını belirt
9. Dinlenme sürelerini dahil et
10. Güvenlik uyarıları ekle
`;
  }

  async generateExerciseProgram(patient: PatientExerciseInfo, goal: ExerciseGoal): Promise<any> {
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
            maxOutputTokens: 3000,
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
      const exerciseProgram = JSON.parse(cleanedText);
      
      // Add unique IDs to workouts and exercises
      exerciseProgram.workouts = exerciseProgram.workouts.map((workout: any, workoutIndex: number) => ({
        ...workout,
        id: `workout_${Date.now()}_${workoutIndex}`,
        exercises: workout.exercises.map((exercise: any, exerciseIndex: number) => ({
          ...exercise,
          id: `exercise_${Date.now()}_${workoutIndex}_${exerciseIndex}`
        }))
      }));

      // Mark as AI generated
      exerciseProgram.aiGenerated = true;

      return exerciseProgram;
    } catch (error) {
      console.error('Exercise AI Service Error:', error);
      throw new Error('Spor programı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }
}

export const exerciseAIService = new ExerciseAIService();