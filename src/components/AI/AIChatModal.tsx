import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader, MessageSquare, Trash2, Plus, Minimize2, Maximize2 } from 'lucide-react';
import { geminiChatService, ChatMessage, ChatSession } from '../../services/geminiChatService';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const loadSessions = () => {
    const savedSessions = geminiChatService.getChatSessions();
    setSessions(savedSessions);
    
    if (savedSessions.length > 0) {
      setCurrentSession(savedSessions[savedSessions.length - 1]);
    } else {
      createNewSession();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = () => {
    const newSession = geminiChatService.createNewSession();
    setCurrentSession(newSession);
    setSessions(prev => [...prev, newSession]);
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSession(session);
  };

  const deleteSession = (sessionId: string) => {
    if (confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
      geminiChatService.deleteChatSession(sessionId);
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      if (currentSession?.id === sessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSession(updatedSessions[updatedSessions.length - 1]);
        } else {
          createNewSession();
        }
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentSession || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      updatedAt: new Date().toISOString(),
      title: currentSession.messages.length === 0 ? message.slice(0, 30) + '...' : currentSession.title
    };

    setCurrentSession(updatedSession);
    setMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await geminiChatService.sendMessage(message, currentSession.messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage],
        updatedAt: new Date().toISOString()
      };

      setCurrentSession(finalSession);
      geminiChatService.saveChatSession(finalSession);
      
      // Update sessions list
      setSessions(prev => prev.map(s => s.id === finalSession.id ? finalSession : s));
      
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
        timestamp: new Date().toISOString()
      };

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage],
        updatedAt: new Date().toISOString()
      };

      setCurrentSession(errorSession);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className={`relative bg-white shadow-2xl rounded-2xl border border-gray-200 transition-all duration-300 ${
          isMinimized ? 'w-96 h-16' : 'w-full max-w-5xl h-[85vh]'
        } flex overflow-hidden`}>
          
          {/* Sidebar */}
          {!isMinimized && showSidebar && (
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gradient-to-b from-purple-50 to-white">
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-2">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Vudolix AI</h3>
                  </div>
                  <button
                    onClick={createNewSession}
                    className="p-2 text-purple-600 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
                    title="Yeni Sohbet"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-600 bg-purple-50 px-3 py-2 rounded-lg">
                  <Bot className="h-3 w-3 inline mr-1" />
                  Gemini 2.0 Flash - Diyetisyen Asistanı
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer mb-2 transition-all ${
                      currentSession?.id === session.id 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 shadow-sm' 
                        : 'hover:bg-white hover:shadow-sm'
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {session.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(session.updatedAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <div className="flex items-center">
                {!showSidebar && !isMinimized && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="mr-3 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                )}
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Vudolix AI Asistan</h2>
                    {!isMinimized && (
                      <p className="text-sm text-purple-100">Beslenme konularında size yardımcı olmak için buradayım</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title={isMinimized ? "Büyüt" : "Küçült"}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                {!isMinimized && showSidebar && (
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    title="Kenar Çubuğunu Gizle"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                  {!currentSession?.messages.length ? (
                    <div className="text-center py-12">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Bot className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">Vudolix AI Asistanına Hoş Geldiniz!</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">Beslenme, diyet planları ve hasta yönetimi konularında size yardımcı olabilirim.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {[
                          'Diyabetik hasta için diyet önerisi',
                          'Kilo verme planı nasıl hazırlanır?',
                          'Protein ihtiyacı nasıl hesaplanır?',
                          'Hipertansiyon diyeti önerileri'
                        ].map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setMessage(suggestion)}
                            className="p-4 text-left text-sm bg-white hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-200 transition-all shadow-sm hover:shadow-md"
                          >
                            <div className="flex items-center">
                              <div className="h-2 w-2 bg-purple-500 rounded-full mr-3"></div>
                              {suggestion}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {currentSession.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex max-w-3xl ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 ${msg.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md ${
                                msg.role === 'user' 
                                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
                              }`}>
                                {msg.role === 'user' ? (
                                  <User className="h-5 w-5 text-white" />
                                ) : (
                                  <Bot className="h-5 w-5 text-white" />
                                )}
                              </div>
                            </div>
                            <div className={`rounded-2xl px-6 py-4 shadow-sm ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-900'
                            }`}>
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                              <div className={`text-xs mt-2 ${
                                msg.role === 'user' ? 'text-emerald-100' : 'text-gray-500'
                              }`}>
                                {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="flex max-w-3xl">
                            <div className="flex-shrink-0 mr-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-sm">
                              <div className="flex items-center space-x-3">
                                <Loader className="h-4 w-4 animate-spin text-purple-600" />
                                <span className="text-sm text-gray-600">Düşünüyor...</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 p-6 bg-white">
                  <div className="flex items-end space-x-4">
                    <div className="flex-1">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Beslenme konularında soru sorun..."
                        rows={1}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none shadow-sm"
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim() || isLoading}
                      className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    AI asistanı genel bilgi sağlar. Tıbbi kararlar için her zaman profesyonel değerlendirme yapın.
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