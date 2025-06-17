# DiyetTakip - Diyetisyen Hasta Takip Sistemi

Modern ve kullanıcı dostu diyetisyen hasta takip sistemi. React, TypeScript ve PHP ile geliştirilmiştir.

## 🚀 Özellikler

### 👥 Hasta Yönetimi
- Detaylı hasta kayıtları
- Kilo takibi ve BMI hesaplama
- Tıbbi geçmiş ve alerji bilgileri
- Hasta ilerleme grafikleri

### 🍽️ Diyet Planları
- Manuel diyet planı oluşturma
- AI destekli diyet planı oluşturma (Gemini AI)
- Öğün bazında kalori hesaplama
- PDF export ve yazdırma

### 💪 Spor Programları
- Manuel egzersiz programı oluşturma
- AI destekli spor programı oluşturma
- Antrenman takibi
- Zorluk seviyesi belirleme

### 📅 Randevu Sistemi
- Randevu planlama ve takibi
- Durum yönetimi (onaylandı, tamamlandı, iptal)
- Randevu türü kategorileri

### 📧 E-posta Hatırlatıcıları
- Otomatik randevu hatırlatmaları
- Manuel e-posta gönderimi
- SMTP ayarları
- E-posta geçmişi takibi

### 📋 Sözleşme Yönetimi
- Hizmet sözleşmeleri
- Onam formları
- Gizlilik sözleşmeleri
- PDF export ve yazdırma

### 📊 Raporlar ve Analizler
- Hasta istatistikleri
- Randevu analizi
- İlerleme raporları
- PDF export

### ⚙️ Sistem Ayarları
- Profil yönetimi
- SMTP e-posta ayarları
- Otomatik yedekleme
- Veri import/export

## 🛠️ Teknolojiler

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Modern iconlar
- **Recharts** - Grafik ve chart'lar
- **jsPDF** - PDF oluşturma
- **date-fns** - Tarih işlemleri

### Backend
- **PHP 7.4+** - Server-side logic
- **JSON** - Veri depolama
- **RESTful API** - API mimarisi

### AI Entegrasyonu
- **Google Gemini AI** - Diyet ve spor planı oluşturma

## 📦 Kurulum

### Gereksinimler
- PHP 7.4 veya üzeri
- Web server (Apache/Nginx)
- Modern web browser

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone [repository-url]
cd dietitian-patient-system
```

2. **Frontend bağımlılıklarını yükleyin**
```bash
npm install
```

3. **Frontend'i build edin**
```bash
npm run build
```

4. **Web server'ı yapılandırın**
   - `dist` klasörünü web server'ın root dizinine kopyalayın
   - `api` klasörünü web server'ın erişebileceği bir konuma yerleştirin
   - PHP'nin çalıştığından emin olun

5. **Dosya izinlerini ayarlayın**
```bash
chmod 755 api/
chmod 755 api/data/
chmod 666 api/data/*.json
```

### Apache Yapılandırması

`.htaccess` dosyaları otomatik olarak dahil edilmiştir. Apache'de `mod_rewrite` ve `mod_headers` modüllerinin aktif olduğundan emin olun.

### Nginx Yapılandırması

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # Frontend routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routing
    location /api/ {
        try_files $uri $uri/ /api/index.php;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        }
    }

    # Prevent access to data files
    location /api/data/ {
        deny all;
    }

    # CORS headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
}
```

## 🔐 Güvenlik

### Veri Güvenliği
- JSON dosyaları web erişiminden korunmuştur
- `.htaccess` ile dizin erişimi engellenmiştir
- CORS politikaları uygulanmıştır

### Kimlik Doğrulama
- Demo giriş bilgileri:
  - E-posta: `diyetisyen@email.com`
  - Şifre: `123456`

**ÖNEMLİ:** Üretim ortamında güçlü şifre kullanın ve kimlik doğrulama sistemini güçlendirin.

## 📁 Dosya Yapısı

```
/
├── api/                    # PHP Backend
│   ├── config.php         # Temel konfigürasyon
│   ├── auth.php           # Kimlik doğrulama
│   ├── patients.php       # Hasta API'si
│   ├── appointments.php   # Randevu API'si
│   ├── diet-plans.php     # Diyet planı API'si
│   ├── exercise-programs.php # Spor programı API'si
│   ├── email-reminders.php   # E-posta API'si
│   ├── settings.php       # Ayarlar API'si
│   ├── backup.php         # Yedekleme API'si
│   └── data/              # JSON veri dosyaları
│       ├── patients.json
│       ├── appointments.json
│       ├── dietPlans.json
│       ├── exercisePrograms.json
│       ├── emailReminders.json
│       ├── settings.json
│       └── backupSettings.json
├── src/                   # React Frontend
│   ├── components/        # React bileşenleri
│   ├── contexts/          # React context'leri
│   ├── pages/             # Sayfa bileşenleri
│   ├── services/          # API servisleri
│   ├── types/             # TypeScript tipleri
│   └── utils/             # Yardımcı fonksiyonlar
└── dist/                  # Build çıktısı
```

## 🔧 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth.php` - Giriş yapma

### Hastalar
- `GET /api/patients.php` - Tüm hastaları listele
- `POST /api/patients.php` - Yeni hasta ekle
- `PUT /api/patients.php?id={id}` - Hasta güncelle
- `DELETE /api/patients.php?id={id}` - Hasta sil

### Randevular
- `GET /api/appointments.php` - Tüm randevuları listele
- `POST /api/appointments.php` - Yeni randevu ekle
- `PUT /api/appointments.php?id={id}` - Randevu güncelle
- `DELETE /api/appointments.php?id={id}` - Randevu sil

### Diyet Planları
- `GET /api/diet-plans.php` - Tüm diyet planlarını listele
- `POST /api/diet-plans.php` - Yeni diyet planı ekle
- `PUT /api/diet-plans.php?id={id}` - Diyet planı güncelle
- `DELETE /api/diet-plans.php?id={id}` - Diyet planı sil

### Spor Programları
- `GET /api/exercise-programs.php` - Tüm spor programlarını listele
- `POST /api/exercise-programs.php` - Yeni spor programı ekle
- `PUT /api/exercise-programs.php?id={id}` - Spor programı güncelle
- `DELETE /api/exercise-programs.php?id={id}` - Spor programı sil

### Ayarlar
- `GET /api/settings.php` - Ayarları getir
- `PUT /api/settings.php` - Ayarları güncelle

### Yedekleme
- `GET /api/backup.php` - Yedek oluştur ve indir
- `POST /api/backup.php` - Yedek geri yükle

## 🤖 AI Entegrasyonu

### Gemini AI Kurulumu
1. Google AI Studio'dan API anahtarı alın
2. `src/services/geminiService.ts` dosyasında API anahtarını güncelleyin
3. `src/services/exerciseAIService.ts` dosyasında API anahtarını güncelleyin

### AI Özellikleri
- **Diyet Planı Oluşturma**: Hasta bilgilerine göre kişiselleştirilmiş diyet planları
- **Spor Programı Oluşturma**: Fitness seviyesi ve hedeflere göre egzersiz programları
- **Türkçe Destek**: Tüm AI yanıtları Türkçe olarak üretilir

## 📧 E-posta Ayarları

### SMTP Konfigürasyonu
1. Ayarlar > E-posta Ayarları bölümüne gidin
2. SMTP sunucu bilgilerini girin:
   - **Gmail için**: smtp.gmail.com, Port: 587
   - **Outlook için**: smtp-mail.outlook.com, Port: 587
3. Uygulama şifresi oluşturun (Gmail için gerekli)
4. Otomatik hatırlatmaları etkinleştirin

### Desteklenen E-posta Sağlayıcıları
- Gmail (Uygulama şifresi gerekli)
- Outlook/Hotmail
- Yahoo Mail
- Diğer SMTP destekli sağlayıcılar

## 🔄 Yedekleme ve Geri Yükleme

### Otomatik Yedekleme
- Ayarlar > Yedekleme Ayarları'ndan etkinleştirin
- Yedekleme sıklığını belirleyin (1-30 gün)
- Maksimum yedek sayısını ayarlayın

### Manuel Yedekleme
- Ayarlar sayfasından "Manuel Yedekle" butonuna tıklayın
- JSON formatında yedek dosyası indirilir

### Geri Yükleme
- Ayarlar sayfasından "Geri Yükle" butonuna tıklayın
- Yedek JSON dosyasını seçin
- Tüm veriler geri yüklenir

## 🐛 Sorun Giderme

### Yaygın Sorunlar

**1. API çağrıları başarısız oluyor**
- PHP'nin çalıştığından emin olun
- Dosya izinlerini kontrol edin
- Apache/Nginx loglarını inceleyin

**2. E-posta gönderilmiyor**
- SMTP ayarlarını kontrol edin
- Uygulama şifresi kullanın (Gmail için)
- Firewall ayarlarını kontrol edin

**3. Veriler kayboluyor**
- JSON dosyalarının yazma izni olduğundan emin olun
- Disk alanını kontrol edin
- Yedekleme ayarlarını kontrol edin

**4. AI özellikler çalışmıyor**
- Gemini AI API anahtarını kontrol edin
- İnternet bağlantısını kontrol edin
- API limitlerini kontrol edin

### Log Dosyaları
- Apache: `/var/log/apache2/error.log`
- Nginx: `/var/log/nginx/error.log`
- PHP: `/var/log/php_errors.log`

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. GitHub Issues bölümünde sorun bildirin
2. Detaylı hata mesajları ve log dosyalarını paylaşın
3. Sistem bilgilerinizi (PHP versiyonu, web server, vs.) belirtin

---

**DiyetTakip** - Modern diyetisyen hasta takip sistemi 🏥💚