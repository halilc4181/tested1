# Sunucuya Deployment Talimatları

## 1. Dosya Yapısı

Sunucunuzda şu dosya yapısını oluşturun:

```
vudolix.com/test5/
├── index.html (ve diğer build dosyaları)
├── assets/ (CSS, JS dosyaları)
└── api/
    ├── .htaccess
    ├── config.php
    ├── auth.php
    ├── patients.php
    ├── appointments.php
    ├── diet-plans.php
    ├── exercise-programs.php
    ├── email-reminders.php
    ├── weight-records.php
    ├── settings.php
    ├── backup-settings.php
    ├── backup.php
    └── data/
        ├── .htaccess
        ├── patients.json
        ├── appointments.json
        ├── dietPlans.json
        ├── exercisePrograms.json
        ├── emailReminders.json
        ├── settings.json
        └── backupSettings.json
```

## 2. Adım Adım Kurulum

### Adım 1: Frontend Build
```bash
npm run build
```

### Adım 2: Build dosyalarını sunucuya yükle
`dist/` klasöründeki tüm dosyaları `vudolix.com/test5/` dizinine yükleyin.

### Adım 3: API dosyalarını yükle
Mevcut `api/` klasörünü `vudolix.com/test5/api/` olarak yükleyin.

### Adım 4: Dosya izinlerini ayarla
```bash
chmod 755 api/
chmod 755 api/data/
chmod 666 api/data/*.json
```

## 3. Test Etme

1. `https://vudolix.com/test5/` adresine gidin
2. Giriş bilgileri: `diyetisyen@email.com` / `123456`
3. Hasta ekleyin, ayarları değiştirin
4. Veriler `api/data/` klasöründeki JSON dosyalarına kaydedilecek

## 4. Sorun Giderme

### PHP Hataları
- PHP error log'larını kontrol edin
- `api/data/` klasörünün yazma izni olduğundan emin olun

### CORS Hataları
- `.htaccess` dosyalarının yüklendiğinden emin olun
- Apache'de `mod_headers` modülünün aktif olduğunu kontrol edin

### JSON Dosya Hataları
- JSON dosyalarının geçerli format olduğundan emin olun
- Dosya izinlerini kontrol edin (666)

## 5. Güvenlik Notları

- Üretim ortamında güçlü şifre kullanın
- `api/data/` klasörüne doğrudan erişimi engelleyin
- HTTPS kullanın
- Düzenli yedekleme yapın