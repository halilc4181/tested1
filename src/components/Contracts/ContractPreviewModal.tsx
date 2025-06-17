import React from 'react';
import { X, Download, Printer, Send } from 'lucide-react';
import { Contract } from '../../pages/Contracts';
import jsPDF from 'jspdf';

interface ContractPreviewModalProps {
  contract: Contract;
  onClose: () => void;
}

export const ContractPreviewModal: React.FC<ContractPreviewModalProps> = ({ contract, onClose }) => {
  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    
    // Set font
    pdf.setFont('helvetica');
    
    // Title
    pdf.setFontSize(16);
    pdf.text(contract.title, 20, 30);
    
    // Content
    pdf.setFontSize(10);
    const splitContent = pdf.splitTextToSize(contract.content, 170);
    pdf.text(splitContent, 20, 50);
    
    // Download
    pdf.save(`${contract.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${contract.title}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                line-height: 1.6;
                color: #333;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #333; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              .title { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 10px; 
              }
              .content { 
                white-space: pre-line; 
                font-size: 12px;
              }
              .footer {
                margin-top: 50px;
                border-top: 1px solid #ccc;
                padding-top: 20px;
                text-align: center;
                font-size: 10px;
                color: #666;
              }
              @media print {
                body { margin: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${contract.title}</div>
              <div>Hasta: ${contract.patientName}</div>
              <div>Tarih: ${new Date(contract.createdDate).toLocaleDateString('tr-TR')}</div>
            </div>
            <div class="content">${contract.content}</div>
            <div class="footer">
              Bu belge DiyetTakip sistemi tarafından oluşturulmuştur.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(contract.title);
    const body = encodeURIComponent(`
Merhaba,

${contract.title} ekte yer almaktadır.

İyi günler,
${contract.patientName}

---
${contract.content}
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{contract.title}</h2>
              <p className="text-sm text-gray-600">
                {contract.patientName} • {new Date(contract.createdDate).toLocaleDateString('tr-TR')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSendEmail}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                title="E-posta Gönder"
              >
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                title="Yazdır"
              >
                <Printer className="h-4 w-4 mr-2" />
                Yazdır
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                title="PDF İndir"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
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
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 text-center">{contract.title}</h3>
                <div className="mt-2 text-center text-sm text-gray-600">
                  <p>Hasta: {contract.patientName}</p>
                  <p>Tarih: {new Date(contract.createdDate).toLocaleDateString('tr-TR')}</p>
                  {contract.signedDate && (
                    <p>İmzalanma Tarihi: {new Date(contract.signedDate).toLocaleDateString('tr-TR')}</p>
                  )}
                </div>
              </div>
              
              <div className="whitespace-pre-line text-sm text-gray-800 leading-relaxed">
                {contract.content}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                Bu belge DiyetTakip sistemi tarafından oluşturulmuştur.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};