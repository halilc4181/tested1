import React, { useState, useEffect } from 'react';
import { X, FileText, User, Calendar } from 'lucide-react';
import { Contract } from '../../pages/Contracts';
import { Patient } from '../../types';
import { useData } from '../../contexts/DataContext';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Omit<Contract, 'id'>) => void;
  contract?: Contract | null;
  patients: Patient[];
}

const contractTemplates = {
  service: {
    title: 'Diyetisyen Hizmet Sözleşmesi',
    content: `DİYETİSYEN HİZMET SÖZLEŞMESİ

TARAFLAR:
Hizmet Sağlayıcı: {{dietitianName}}
Lisans No: {{dietitianLicense}}
Adres: {{dietitianAddress}}
Telefon: {{dietitianPhone}}
E-posta: {{dietitianEmail}}

Hasta: {{patientName}}
Telefon: {{patientPhone}}
E-posta: {{patientEmail}}
Adres: {{patientAddress}}

SÖZLEŞME KONUSU:
Bu sözleşme, diyetisyen tarafından hastaya verilecek beslenme danışmanlığı hizmetlerini kapsar.

HİZMET KAPSAMI:
1. Beslenme durumu değerlendirmesi
2. Kişiselleştirilmiş diyet planı hazırlanması
3. Düzenli takip ve kontroller
4. Beslenme eğitimi ve danışmanlığı

HASTA SORUMLULUKLARI:
1. Verilen diyet planına uyum sağlamak
2. Kontrol randevularına düzenli katılım
3. Sağlık durumundaki değişiklikleri bildirmek
4. Doğru ve eksiksiz bilgi vermek

DİYETİSYEN SORUMLULUKLARI:
1. Profesyonel hizmet sunmak
2. Hasta gizliliğini korumak
3. Güncel bilimsel verilere dayalı öneriler sunmak
4. Hasta güvenliğini öncelemek

ÖDEME KOŞULLARI:
Hizmet bedeli: _____ TL
Ödeme şekli: _____

GİZLİLİK:
Hasta bilgileri gizli tutulacak ve üçüncü kişilerle paylaşılmayacaktır.

SÖZLEŞME SÜRESİ:
Bu sözleşme {{contractDate}} tarihinde başlar ve {{duration}} süreyle geçerlidir.

Tarih: {{contractDate}}

Diyetisyen: {{dietitianName}}          Hasta: {{patientName}}
İmza: _______________                   İmza: _______________`
  },
  consent: {
    title: 'Bilgilendirilmiş Onam Formu',
    content: `BİLGİLENDİRİLMİŞ ONAM FORMU

Hasta Adı: {{patientName}}
Tarih: {{contractDate}}

BESLENME DANIŞMANLIĞI HAKKINDA BİLGİLENDİRME:

1. AMAÇ:
Beslenme durumunuzun değerlendirilmesi ve kişiselleştirilmiş diyet planı oluşturulması amaçlanmaktadır.

2. SÜREÇ:
- Detaylı anamnez alınacaktır
- Antropometrik ölçümler yapılacaktır
- Beslenme alışkanlıkları değerlendirilecektir
- Kişiselleştirilmiş diyet planı hazırlanacaktır

3. BEKLENEN FAYDALAR:
- Sağlıklı kilo kontrolü
- Beslenme alışkanlıklarının iyileştirilmesi
- Sağlık durumunun desteklenmesi

4. OLASI RİSKLER:
- Başlangıçta adaptasyon zorluğu
- Geçici sindirim değişiklikleri

5. HASTA SORUMLULUKLARI:
- Doğru bilgi vermek
- Önerilere uyum sağlamak
- Düzenli kontrollere katılmak

6. GİZLİLİK:
Tüm bilgileriniz gizli tutulacaktır.

ONAM:
Yukarıdaki bilgileri okudum, anladım ve gönüllü olarak beslenme danışmanlığı hizmetini almayı kabul ediyorum.

Hasta: {{patientName}}
İmza: _______________
Tarih: {{contractDate}}

Diyetisyen: {{dietitianName}}
İmza: _______________
Tarih: {{contractDate}}`
  },
  privacy: {
    title: 'Kişisel Verilerin Korunması Sözleşmesi',
    content: `KİŞİSEL VERİLERİN KORUNMASI SÖZLEŞMESİ

Veri Sorumlusu: {{dietitianName}}
Hasta: {{patientName}}
Tarih: {{contractDate}}

1. VERİ TOPLAMA AMACI:
Kişisel verileriniz sadece size en iyi beslenme danışmanlığı hizmetini sunmak amacıyla toplanmaktadır.

2. TOPLANAN VERİLER:
- Kimlik bilgileri
- İletişim bilgileri
- Sağlık bilgileri
- Beslenme alışkanlıkları

3. VERİ KULLANIMI:
- Diyet planı hazırlanması
- Takip ve değerlendirme
- İletişim kurulması

4. VERİ GÜVENLİĞİ:
Verileriniz güvenli ortamda saklanır ve yetkisiz erişime karşı korunur.

5. VERİ PAYLAŞIMI:
Verileriniz yasal zorunluluk olmadıkça üçüncü kişilerle paylaşılmaz.

6. HAKLARINIZ:
- Verilerinize erişim hakkı
- Düzeltme hakkı
- Silme hakkı
- İtiraz hakkı

ONAY:
Kişisel verilerimin yukarıda belirtilen amaçlarla işlenmesini kabul ediyorum.

Hasta: {{patientName}}
İmza: _______________
Tarih: {{contractDate}}`
  },
  payment: {
    title: 'Ödeme Sözleşmesi',
    content: `ÖDEME SÖZLEŞMESİ

Hizmet Sağlayıcı: {{dietitianName}}
Hasta: {{patientName}}
Tarih: {{contractDate}}

HİZMET BEDELİ:
- İlk görüşme: _____ TL
- Kontrol seansı: _____ TL
- Diyet planı revizyon: _____ TL

ÖDEME KOŞULLARI:
1. Ödemeler seans öncesi yapılır
2. Kabul edilen ödeme yöntemleri: Nakit, Kredi Kartı, Havale
3. İptal durumunda 24 saat önceden bildirim gereklidir

İPTAL KOŞULLARI:
- 24 saat önceden iptal: Ücret alınmaz
- 24 saatten az sürede iptal: %50 ücret alınır
- Gelmeme durumu: Tam ücret alınır

İADE KOŞULLARI:
Hizmet alındıktan sonra iade yapılmaz.

ANLAŞMAZLIK ÇÖZÜMÜ:
Anlaşmazlıklar önce dostane yollarla çözülmeye çalışılır.

Hasta: {{patientName}}
İmza: _______________
Tarih: {{contractDate}}

Diyetisyen: {{dietitianName}}
İmza: _______________
Tarih: {{contractDate}}`
  }
};

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contract,
  patients
}) => {
  const { settings } = useData();
  const [formData, setFormData] = useState({
    patientId: '',
    type: 'service' as Contract['type'],
    title: '',
    content: '',
    status: 'draft' as Contract['status'],
    templateUsed: ''
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        patientId: contract.patientId,
        type: contract.type,
        title: contract.title,
        content: contract.content,
        status: contract.status,
        templateUsed: contract.templateUsed || ''
      });
    } else {
      setFormData({
        patientId: '',
        type: 'service',
        title: '',
        content: '',
        status: 'draft',
        templateUsed: ''
      });
    }
  }, [contract]);

  const handleTemplateSelect = (templateKey: string) => {
    const template = contractTemplates[templateKey as keyof typeof contractTemplates];
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: template.title,
        content: template.content,
        templateUsed: templateKey
      }));
    }
  };

  const replaceVariables = (content: string, patient: Patient | undefined) => {
    if (!patient) return content;

    return content
      .replace(/{{dietitianName}}/g, settings.name)
      .replace(/{{dietitianLicense}}/g, settings.license)
      .replace(/{{dietitianAddress}}/g, settings.address)
      .replace(/{{dietitianPhone}}/g, settings.phone)
      .replace(/{{dietitianEmail}}/g, settings.email)
      .replace(/{{patientName}}/g, `${patient.name} ${patient.surname}`)
      .replace(/{{patientPhone}}/g, patient.phone)
      .replace(/{{patientEmail}}/g, patient.email)
      .replace(/{{patientAddress}}/g, patient.address)
      .replace(/{{contractDate}}/g, new Date().toLocaleDateString('tr-TR'))
      .replace(/{{duration}}/g, '6 ay');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
      alert('Lütfen bir hasta seçiniz');
      return;
    }

    const processedContent = replaceVariables(formData.content, selectedPatient);

    const contractData = {
      patientId: formData.patientId,
      patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
      type: formData.type,
      title: formData.title,
      content: processedContent,
      createdDate: contract?.createdDate || new Date().toISOString().split('T')[0],
      status: formData.status,
      templateUsed: formData.templateUsed,
      ...(formData.status === 'signed' && !contract?.signedDate && {
        signedDate: new Date().toISOString().split('T')[0]
      })
    };

    onSave(contractData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {contract ? 'Sözleşme Düzenle' : 'Yeni Sözleşme'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta *
                </label>
                <select
                  required
                  value={formData.patientId}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Hasta seçiniz</option>
                  {patients.filter(p => p.status === 'active').map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} {patient.surname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sözleşme Türü *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Contract['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="service">Hizmet Sözleşmesi</option>
                  <option value="consent">Onam Formu</option>
                  <option value="privacy">Gizlilik Sözleşmesi</option>
                  <option value="payment">Ödeme Sözleşmesi</option>
                  <option value="custom">Özel Sözleşme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Başlık *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Sözleşme başlığı"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durum
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Contract['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="draft">Taslak</option>
                  <option value="sent">Gönderildi</option>
                  <option value="signed">İmzalandı</option>
                  <option value="expired">Süresi Doldu</option>
                </select>
              </div>
            </div>

            {!contract && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şablon Seç (Opsiyonel)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(contractTemplates).map(([key, template]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleTemplateSelect(key)}
                      className="p-3 text-left border border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-emerald-600 mr-2" />
                        <span className="text-sm font-medium">{template.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sözleşme İçeriği *
              </label>
              <textarea
                required
                rows={20}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm"
                placeholder="Sözleşme içeriğini buraya yazın..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Değişkenler: {'{'}{'{'} dietitianName {'}'}{'}'},  {'{'}{'{'} patientName {'}'}{'}'},  {'{'}{'{'} contractDate {'}'}{'}'}  vb. otomatik doldurulacaktır.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              >
                {contract ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};