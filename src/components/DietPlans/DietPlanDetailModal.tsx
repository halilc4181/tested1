import React from 'react';
import { X, Clock, CheckCircle, Download, Edit, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

interface DietPlanDetailModalProps {
  plan: any;
  onClose: () => void;
  onEdit?: (plan: any) => void;
}

export const DietPlanDetailModal: React.FC<DietPlanDetailModalProps> = ({ plan, onClose, onEdit }) => {
  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    
    // Set font
    pdf.setFont('helvetica');
    
    // Title
    pdf.setFontSize(20);
    pdf.text(plan.title, 20, 30);
    
    // Patient info
    pdf.setFontSize(12);
    pdf.text(`Hasta: ${plan.patientName}`, 20, 50);
    pdf.text(`Oluşturulma: ${new Date(plan.createdDate).toLocaleDateString('tr-TR')}`, 20, 60);
    pdf.text(`Süre: ${plan.duration}`, 20, 70);
    pdf.text(`Günlük Kalori: ${plan.totalCalories} kcal`, 20, 80);
    pdf.text(`Tür: ${plan.type}`, 20, 90);
    
    // Meals
    let yPosition = 110;
    pdf.setFontSize(14);
    pdf.text('Öğünler:', 20, yPosition);
    yPosition += 15;
    
    plan.meals.forEach((meal: any, index: number) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }
      
      pdf.setFontSize(12);
      pdf.text(`${meal.name} (${meal.time}) - ${meal.calories} kcal`, 20, yPosition);
      yPosition += 10;
      
      meal.foods.forEach((food: string) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.setFontSize(10);
        pdf.text(`• ${food}`, 25, yPosition);
        yPosition += 8;
      });
      yPosition += 5;
    });
    
    // Notes
    if (plan.notes) {
      if (yPosition > 230) {
        pdf.addPage();
        yPosition = 30;
      }
      pdf.setFontSize(12);
      pdf.text('Notlar:', 20, yPosition);
      yPosition += 10;
      pdf.setFontSize(10);
      const splitNotes = pdf.splitTextToSize(plan.notes, 170);
      pdf.text(splitNotes, 20, yPosition);
    }
    
    pdf.save(`${plan.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${plan.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; }
              .meal { margin-bottom: 20px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
              .meal-header { background-color: #f3f4f6; padding: 10px; margin: -15px -15px 10px -15px; border-radius: 8px 8px 0 0; }
              .food-list { list-style-type: none; padding: 0; }
              .food-item { padding: 5px 0; border-bottom: 1px solid #f3f4f6; }
              .notes { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${plan.title}</h1>
              <p><strong>Hasta:</strong> ${plan.patientName}</p>
              <p><strong>Oluşturulma:</strong> ${new Date(plan.createdDate).toLocaleDateString('tr-TR')}</p>
              <p><strong>Süre:</strong> ${plan.duration} | <strong>Günlük Kalori:</strong> ${plan.totalCalories} kcal | <strong>Tür:</strong> ${plan.type}</p>
            </div>
            
            <h2>Öğünler</h2>
            ${plan.meals.map((meal: any) => `
              <div class="meal">
                <div class="meal-header">
                  <h3>${meal.name} - ${meal.time} (${meal.calories} kcal)</h3>
                </div>
                <ul class="food-list">
                  ${meal.foods.map((food: string) => `<li class="food-item">• ${food}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
            
            ${plan.notes ? `
              <div class="notes">
                <h3>Önemli Notlar:</h3>
                <p>${plan.notes}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{plan.title}</h2>
              <p className="text-sm text-gray-600">
                {plan.patientName} • Oluşturulma: {new Date(plan.createdDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(plan)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm font-medium text-emerald-800">Toplam Kalori</p>
                <p className="text-2xl font-bold text-emerald-900">{plan.totalCalories}</p>
                <p className="text-sm text-emerald-600">kcal/gün</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Süre</p>
                <p className="text-2xl font-bold text-blue-900">{plan.duration}</p>
                <p className="text-sm text-blue-600">Plan süresi</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <p className="text-sm font-medium text-amber-800">Durum</p>
                <p className="text-2xl font-bold text-amber-900">
                  {plan.status === 'active' ? 'Aktif' : 
                   plan.status === 'completed' ? 'Tamamlandı' : 'Duraklatıldı'}
                </p>
                <p className="text-sm text-amber-600">{plan.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {plan.meals.map((meal: any) => (
                <div key={meal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{meal.name}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {meal.time}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {meal.calories} kcal
                    </span>
                  </div>

                  <ul className="space-y-1">
                    {meal.foods.map((food: string, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <CheckCircle className="h-3 w-3 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                        {food}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {plan.notes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Önemli Notlar:</h4>
                <p className="text-sm text-amber-700">{plan.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};