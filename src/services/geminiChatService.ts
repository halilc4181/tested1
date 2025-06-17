export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

class GeminiChatService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  constructor() {
    // Gemini 2.0 Flash Experimental - Ücretsiz sürüm
    this.apiKey = 'AIzaSyCWyqsAvf_ziYNsKpMT5dttiCW8sajdaL4';
  }

  private createSystemPrompt(): string {
    return `Sen uzman bir diyetisyen asistanısın. Türkçe konuşuyorsun ve diyetisyenlere profesyonel destek sağlıyorsun.

GÖREVLERIN:
1. Beslenme ve diyet konularında bilimsel bilgi sağlamak
2. Hasta durumları hakkında öneriler vermek
3. Diyet planı oluşturma konusunda yardım etmek
4. Besin değerleri ve kalori hesaplamaları yapmak
5. Tıbbi beslenme tedavisi konularında rehberlik etmek

KURALLAR:
- Her zaman bilimsel ve güncel bilgiler ver
- Türk mutfağı ve yerel besinleri dikkate al
- Hasta güvenliğini öncelemek
- Tıbbi tanı koymak yerine diyetisyene yönlendirme önerileri ver
- Pratik ve uygulanabilir öneriler sun
- Kısa ve net yanıtlar ver

YAPAMADIĞIN ŞEYLER:
- Tıbbi tanı koymak
- İlaç önerisi vermek
- Acil tıbbi durumlar için tedavi önerisi
- Kişisel sağlık bilgilerini saklamak

Her yanıtında profesyonel, yardımsever ve bilgilendirici ol.`;
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      // Conversation context oluştur
      const context = conversationHistory.slice(-10).map(msg => 
        `${msg.role === 'user' ? 'Diyetisyen' : 'Asistan'}: ${msg.content}`
      ).join('\n');

      const fullPrompt = `${this.createSystemPrompt()}

${context ? `Önceki konuşma:\n${context}\n` : ''}

Diyetisyen: ${message}

Asistan:`;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Geçersiz API yanıtı');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini Chat Service Error:', error);
      throw new Error('AI asistanı şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
    }
  }

  // Chat session yönetimi
  saveChatSession(session: ChatSession): void {
    const sessions = this.getChatSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    
    // Son 50 session'ı sakla
    const limitedSessions = sessions.slice(-50);
    localStorage.setItem('gemini_chat_sessions', JSON.stringify(limitedSessions));
  }

  getChatSessions(): ChatSession[] {
    const saved = localStorage.getItem('gemini_chat_sessions');
    return saved ? JSON.parse(saved) : [];
  }

  deleteChatSession(sessionId: string): void {
    const sessions = this.getChatSessions().filter(s => s.id !== sessionId);
    localStorage.setItem('gemini_chat_sessions', JSON.stringify(sessions));
  }

  createNewSession(): ChatSession {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: 'Yeni Sohbet',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export const geminiChatService = new GeminiChatService();