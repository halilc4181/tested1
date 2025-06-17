import React from 'react';
import { X, Clock, Dumbbell, Edit, Download, Printer, Target, Activity, Users, Sparkles } from 'lucide-react';
import jsPDF from 'jspdf';

interface ExerciseProgramDetailModalProps {
  program: any;
  onClose: () => void;
  onEdit?: (program: any) => void;
}

export const ExerciseProgramDetailModal: React.FC<ExerciseProgramDetailModalProps> = ({ 
  program, 
  onClose, 
  onEdit 
}) => {
  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    
    // Set font
    pdf.setFont('helvetica');
    
    // Title
    pdf.setFontSize(20);
    pdf.text(program.title, 20, 30);
    
    // Patient info
    pdf.setFontSize(12);
    pdf.text(`Hasta: ${program.patientName}`, 20, 50);
    pdf.text(`Oluşturulma: ${new Date(program.createdDate).toLocaleDateString('tr-TR')}`, 20, 60);
    pdf.text(`Süre: ${program.duration}`, 20, 70);
    pdf.text(`Sıklık: Haftada ${program.frequency} gün`, 20, 80);
    pdf.text(`Zorluk: ${program.difficulty}`, 20, 90);
    pdf.text(`Tür: ${program.type}`, 20, 100);
    
    // Goal
    pdf.setFontSize(14);
    pdf.text('Hedef:', 20, 120);
    pdf.setFontSize(10);
    const splitGoal = pdf.splitTextToSize(program.goal, 170);
    pdf.text(splitGoal, 20, 130);
    
    // Workouts
    let yPosition = 150;
    pdf.setFontSize(14);
    pdf.text('Antrenmanlar:', 20, yPosition);
    yPosition += 15;
    
    program.workouts.forEach((workout: any, index: number) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${workout.name} (${workout.day}) - ${workout.duration} dakika`, 20, yPosition);
      yPosition += 10;
      
      workout.exercises.forEach((exercise: any) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.setFontSize(10);
        let exerciseText = `• ${exercise.name}`;
        if (exercise.sets && exercise.reps) {
          exerciseText += ` - ${exercise.sets} set x ${exercise.reps} tekrar`;
        }
        if (exercise.duration) {
          exerciseText += ` - ${exercise.duration} dakika`;
        }
        pdf.text(exerciseText, 25, yPosition);
        yPosition += 8;
        
        if (exercise.instructions) {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 30;
          }
          const splitInstructions = pdf.splitTextToSize(`  ${exercise.instructions}`, 165);
          pdf.text(splitInstructions, 25, yPosition);
          yPosition += splitInstructions.length * 4;
        }
      });
      yPosition += 5;
    });
    
    // Notes
    if (program.notes) {
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.setFontSize(12);
      pdf.text('Notlar:', 20, yPosition);
      yPosition += 10;
      pdf.setFontSize(10);
      const splitNotes = pdf.splitTextToSize(program.notes, 170);
      pdf.text(splitNotes, 20, yPosition);
    }
    
    pdf.save(`${program.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${program.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
              .header { border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; }
              .workout { margin-bottom: 25px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
              .workout-header { background-color: #f3f4f6; padding: 10px; margin: -15px -15px 15px -15px; border-radius: 8px 8px 0 0; }
              .exercise { margin-bottom: 15px; padding: 10px; background-color: #f9fafb; border-radius: 6px; }
              .exercise-name { font-weight: bold; color: #374151; }
              .exercise-details { color: #6b7280; font-size: 0.9em; margin: 5px 0; }
              .exercise-instructions { color: #4b5563; font-style: italic; }
              .notes { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; }
              .ai-badge { background-color: #8b5cf6; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${program.title} ${program.aiGenerated ? '<span class="ai-badge">AI</span>' : ''}</h1>
              <p><strong>Hasta:</strong> ${program.patientName}</p>
              <p><strong>Oluşturulma:</strong> ${new Date(program.createdDate).toLocaleDateString('tr-TR')}</p>
              <p><strong>Süre:</strong> ${program.duration} | <strong>Sıklık:</strong> Haftada ${program.frequency} gün | <strong>Zorluk:</strong> ${program.difficulty}</p>
              <p><strong>Hedef:</strong> ${program.goal}</p>
            </div>
            
            <h2>Antrenmanlar</h2>
            ${program.workouts.map((workout: any) => `
              <div class="workout">
                <div class="workout-header">
                  <h3>${workout.name} - ${workout.day} (${workout.duration} dakika)</h3>
                </div>
                ${workout.exercises.map((exercise: any) => `
                  <div class="exercise">
                    <div class="exercise-name">${exercise.name}</div>
                    <div class="exercise-details">
                      ${exercise.sets && exercise.reps ? `${exercise.sets} set x ${exercise.reps} tekrar` : ''}
                      ${exercise.duration ? `${exercise.duration} dakika` : ''}
                      ${exercise.restTime ? ` | Dinlenme: ${exercise.restTime} saniye` : ''}
                      ${exercise.targetMuscles?.length ? ` | Hedef: ${exercise.targetMuscles.join(', ')}` : ''}
                    </div>
                    ${exercise.instructions ? `<div class="exercise-instructions">${exercise.instructions}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            `).join('')}
            
            ${program.notes ? `
              <div class="notes">
                <h3>Önemli Notlar:</h3>
                <p>${program.notes}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Başlangıç';
      case 'intermediate':
        return 'Orta';
      case 'advanced':
        return 'İleri';
      default:
        return difficulty;
    }
  };

  const getExerciseTypeColor = (type: string) => {
    switch (type) {
      case 'cardio':
        return 'bg-red-100 text-red-800';
      case 'strength':
        return 'bg-blue-100 text-blue-800';
      case 'flexibility':
        return 'bg-green-100 text-green-800';
      case 'balance':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExerciseTypeText = (type: string) => {
    switch (type) {
      case 'cardio':
        return 'Kardiyovasküler';
      case 'strength':
        return 'Güç';
      case 'flexibility':
        return 'Esneklik';
      case 'balance':
        return 'Denge';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{program.title}</h2>
                {program.aiGenerated && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {program.patientName} • Oluşturulma: {new Date(program.createdDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(program)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </button>
              )}
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Yazdır
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF İndir
              </button>
              <button
                onClick={onClose}
                className="rounded-md p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-emerald-800">Program Türü</p>
                <p className="text-lg font-bold text-emerald-900">{program.type}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-blue-800">Zorluk Seviyesi</p>
                <p className="text-lg font-bold text-blue-900">{getDifficultyText(program.difficulty)}</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-amber-800">Haftalık Sıklık</p>
                <p className="text-lg font-bold text-amber-900">{program.frequency} gün</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Dumbbell className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-purple-800">Antrenman Sayısı</p>
                <p className="text-lg font-bold text-purple-900">{program.workouts.length}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Hedefi</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{program.goal}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Antrenmanlar</h3>
              <div className="space-y-6">
                {program.workouts.map((workout: any) => (
                  <div key={workout.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{workout.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {workout.day}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {workout.duration} dakika
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {workout.exercises.map((exercise: any) => (
                        <div key={exercise.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getExerciseTypeColor(exercise.type)}`}>
                              {getExerciseTypeText(exercise.type)}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm text-gray-600">
                            {exercise.sets && exercise.reps && (
                              <div className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {exercise.sets} set x {exercise.reps} tekrar
                              </div>
                            )}
                            {exercise.duration && (
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {exercise.duration} dakika
                              </div>
                            )}
                            {exercise.restTime && (
                              <div className="flex items-center">
                                <Activity className="h-3 w-3 mr-1" />
                                Dinlenme: {exercise.restTime} saniye
                              </div>
                            )}
                          </div>

                          {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-700 mb-1">Hedef Kaslar:</p>
                              <div className="flex flex-wrap gap-1">
                                {exercise.targetMuscles.map((muscle: string, index: number) => (
                                  <span key={index} className="inline-flex px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                                    {muscle}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {exercise.instructions && (
                            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                              <strong>Talimat:</strong> {exercise.instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {program.notes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Önemli Notlar:</h4>
                <p className="text-sm text-amber-700">{program.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};