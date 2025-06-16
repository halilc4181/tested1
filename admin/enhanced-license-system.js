// Enhanced License Security System with Remote Verification
// This system provides comprehensive security and persistent licensing

class SecureLicenseManager {
    constructor() {
        this.config = {
            remoteServer: 'https://vudolix.com/lisans-sistemi/verify.php',
            localStorageKey: 'qr_menu_secure_license',
            encryptionKey: 'QRM_2024_SECURE',
            maxRetries: 3,
            verificationInterval: 30 * 60 * 1000, // 30 minutes
            securityCheckInterval: 60 * 1000, // 1 minute
            rateLimitWindow: 60 * 1000, // 1 minute
            maxRequestsPerWindow: 10
        };
        
        this.securityState = {
            violations: 0,
            lastVerification: 0,
            requestCount: 0,
            windowStart: Date.now(),
            isBlocked: false
        };
        
        this.init();
    }

    init() {
        this.setupSecurityMonitoring();
        this.startPeriodicVerification();
        this.bindEvents();
    }

    // Enhanced encryption for license data
    encrypt(data) {
        try {
            const jsonString = JSON.stringify(data);
            const timestamp = Date.now().toString();
            const combined = jsonString + '|' + timestamp + '|' + this.config.encryptionKey;
            const encoded = btoa(combined);
            const checksum = this.generateChecksum(encoded);
            
            return {
                data: encoded,
                checksum: checksum,
                timestamp: timestamp
            };
        } catch (error) {
            this.logSecurityEvent('ENCRYPTION_ERROR', error.message);
            return null;
        }
    }

    decrypt(encryptedData) {
        try {
            if (!encryptedData || !encryptedData.data || !encryptedData.checksum) {
                throw new Error('Invalid encrypted data structure');
            }

            // Verify checksum
            if (this.generateChecksum(encryptedData.data) !== encryptedData.checksum) {
                throw new Error('Data integrity check failed');
            }

            const decoded = atob(encryptedData.data);
            const parts = decoded.split('|');
            
            if (parts.length !== 3 || parts[2] !== this.config.encryptionKey) {
                throw new Error('Invalid encryption key or format');
            }

            const data = JSON.parse(parts[0]);
            const timestamp = parseInt(parts[1]);
            
            // Check if data is not too old (24 hours)
            if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                throw new Error('License data expired');
            }

            return data;
        } catch (error) {
            this.logSecurityEvent('DECRYPTION_ERROR', error.message);
            return null;
        }
    }

    generateChecksum(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Rate limiting for API requests
    checkRateLimit() {
        const now = Date.now();
        
        // Reset window if needed
        if (now - this.securityState.windowStart > this.config.rateLimitWindow) {
            this.securityState.requestCount = 0;
            this.securityState.windowStart = now;
        }

        if (this.securityState.requestCount >= this.config.maxRequestsPerWindow) {
            this.logSecurityEvent('RATE_LIMIT_EXCEEDED', `${this.securityState.requestCount} requests in window`);
            return false;
        }

        this.securityState.requestCount++;
        return true;
    }

    // Enhanced remote license verification
    async verifyLicenseRemote(licenseKey, domain = window.location.hostname) {
        if (!this.checkRateLimit()) {
            throw new Error('Rate limit exceeded. Please wait before trying again.');
        }

        const requestData = {
            license_key: licenseKey,
            domain: domain,
            url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: Date.now(),
            browser_fingerprint: this.generateBrowserFingerprint(),
            security_token: this.generateSecurityToken(licenseKey, domain)
        };

        try {
            const response = await fetch(this.config.remoteServer, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-License-Request': 'true',
                    'X-Security-Version': '2.0',
                    'X-Request-ID': this.generateRequestId()
                },
                body: JSON.stringify(requestData),
                timeout: 15000
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.valid) {
                this.logSecurityEvent('LICENSE_INVALID', result.reason || 'Unknown reason');
                throw new Error(result.reason || 'License validation failed');
            }

            return result;
        } catch (error) {
            this.logSecurityEvent('REMOTE_VERIFICATION_ERROR', error.message);
            throw error;
        }
    }

    // Persistent license storage with encryption
    storeLicense(licenseData) {
        try {
            const enhancedData = {
                ...licenseData,
                domain: window.location.hostname,
                storedAt: Date.now(),
                browserFingerprint: this.generateBrowserFingerprint(),
                securityHash: this.generateSecurityHash(licenseData)
            };

            const encrypted = this.encrypt(enhancedData);
            if (!encrypted) {
                throw new Error('Failed to encrypt license data');
            }

            localStorage.setItem(this.config.localStorageKey, JSON.stringify(encrypted));
            
            // Also store in sessionStorage as backup
            sessionStorage.setItem(this.config.localStorageKey + '_session', JSON.stringify(encrypted));
            
            this.logSecurityEvent('LICENSE_STORED', 'License successfully stored');
            return true;
        } catch (error) {
            this.logSecurityEvent('STORAGE_ERROR', error.message);
            return false;
        }
    }

    // Retrieve and validate stored license
    getStoredLicense() {
        try {
            let encryptedData = localStorage.getItem(this.config.localStorageKey);
            
            // Fallback to sessionStorage if localStorage is empty
            if (!encryptedData) {
                encryptedData = sessionStorage.getItem(this.config.localStorageKey + '_session');
            }

            if (!encryptedData) {
                return null;
            }

            const parsed = JSON.parse(encryptedData);
            const decrypted = this.decrypt(parsed);
            
            if (!decrypted) {
                this.clearStoredLicense();
                return null;
            }

            // Validate security hash
            if (!this.validateSecurityHash(decrypted)) {
                this.logSecurityEvent('SECURITY_HASH_INVALID', 'Stored license security hash mismatch');
                this.clearStoredLicense();
                return null;
            }

            // Check if license is for current domain
            if (decrypted.domain !== window.location.hostname) {
                this.logSecurityEvent('DOMAIN_MISMATCH', `Stored: ${decrypted.domain}, Current: ${window.location.hostname}`);
                this.clearStoredLicense();
                return null;
            }

            return decrypted;
        } catch (error) {
            this.logSecurityEvent('RETRIEVAL_ERROR', error.message);
            this.clearStoredLicense();
            return null;
        }
    }

    clearStoredLicense() {
        localStorage.removeItem(this.config.localStorageKey);
        sessionStorage.removeItem(this.config.localStorageKey + '_session');
        this.logSecurityEvent('LICENSE_CLEARED', 'License data cleared from storage');
    }

    // Generate browser fingerprint for additional security
    generateBrowserFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown'
        ].join('|');

        return btoa(fingerprint).substring(0, 32);
    }

    generateSecurityToken(licenseKey, domain) {
        const data = licenseKey + domain + navigator.userAgent + Date.now();
        return btoa(data).substring(0, 24);
    }

    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
    }

    generateSecurityHash(licenseData) {
        const hashData = licenseData.license_key + licenseData.domain + this.config.encryptionKey;
        return btoa(hashData).substring(0, 16);
    }

    validateSecurityHash(licenseData) {
        const expectedHash = this.generateSecurityHash(licenseData);
        return licenseData.securityHash === expectedHash;
    }

    // Security monitoring and violation detection
    setupSecurityMonitoring() {
        // Monitor DOM modifications
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach((node) => {
                        if (node.id === 'licenseOverlay' || node.id === 'adminPanel') {
                            this.handleSecurityViolation('DOM_TAMPERING', 'Critical element removed');
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['id', 'class', 'style']
        });

        // Monitor console usage
        this.monitorConsole();

        // Monitor developer tools
        this.monitorDevTools();

        // Periodic security checks
        setInterval(() => {
            this.performSecurityCheck();
        }, this.config.securityCheckInterval);
    }

    monitorConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const self = this;
        
        console.log = function(...args) {
            self.checkConsoleUsage(args);
            originalLog.apply(console, args);
        };

        console.error = function(...args) {
            self.checkConsoleUsage(args);
            originalError.apply(console, args);
        };

        console.warn = function(...args) {
            self.checkConsoleUsage(args);
            originalWarn.apply(console, args);
        };
    }

    checkConsoleUsage(args) {
        const suspiciousKeywords = ['bypass', 'crack', 'hack', 'license', 'override', 'disable'];
        const message = args.join(' ').toLowerCase();
        
        for (const keyword of suspiciousKeywords) {
            if (message.includes(keyword)) {
                this.handleSecurityViolation('SUSPICIOUS_CONSOLE_USAGE', `Keyword: ${keyword}`);
                break;
            }
        }
    }

    monitorDevTools() {
        let devtools = { open: false };
        const threshold = 160;

        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.handleSecurityViolation('DEVTOOLS_DETECTED', 'Developer tools opened');
                }
            } else {
                devtools.open = false;
            }
        }, 1000);
    }

    performSecurityCheck() {
        // Check if critical elements exist
        const criticalElements = ['licenseOverlay'];
        for (const elementId of criticalElements) {
            if (!document.getElementById(elementId) && !this.getStoredLicense()) {
                this.handleSecurityViolation('CRITICAL_ELEMENT_MISSING', elementId);
            }
        }

        // Check localStorage integrity
        const stored = this.getStoredLicense();
        if (stored && !this.validateSecurityHash(stored)) {
            this.handleSecurityViolation('STORAGE_TAMPERING', 'Security hash validation failed');
        }
    }

    handleSecurityViolation(type, details) {
        this.securityState.violations++;
        this.logSecurityEvent(type, details);

        // Progressive response based on violation count
        if (this.securityState.violations >= 3) {
            this.triggerSecurityLockdown();
        } else if (this.securityState.violations >= 2) {
            this.showSecurityWarning();
        }
    }

    triggerSecurityLockdown() {
        this.clearStoredLicense();
        this.securityState.isBlocked = true;
        
        this.logSecurityEvent('SECURITY_LOCKDOWN', 'System locked due to multiple violations');
        
        alert('Güvenlik ihlali tespit edildi. Sistem güvenlik nedeniyle kapatılıyor.');
        window.location.reload();
    }

    showSecurityWarning() {
        console.warn('Güvenlik uyarısı: Şüpheli aktivite tespit edildi.');
    }

    // Periodic license verification
    startPeriodicVerification() {
        setInterval(async () => {
            const stored = this.getStoredLicense();
            if (stored && stored.license_key) {
                try {
                    await this.verifyLicenseRemote(stored.license_key);
                    this.securityState.lastVerification = Date.now();
                } catch (error) {
                    this.logSecurityEvent('PERIODIC_VERIFICATION_FAILED', error.message);
                    
                    // If verification fails multiple times, clear license
                    if (Date.now() - this.securityState.lastVerification > 2 * this.config.verificationInterval) {
                        this.clearStoredLicense();
                        alert('Lisans doğrulaması başarısız. Lütfen tekrar giriş yapın.');
                        window.location.reload();
                    }
                }
            }
        }, this.config.verificationInterval);
    }

    // Enhanced logging with detailed information
    logSecurityEvent(event, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            domain: window.location.hostname,
            url: window.location.href,
            userAgent: navigator.userAgent,
            browserFingerprint: this.generateBrowserFingerprint(),
            violationCount: this.securityState.violations
        };

        // Store in localStorage for admin review
        const logs = JSON.parse(localStorage.getItem('qr_menu_security_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('qr_menu_security_logs', JSON.stringify(logs));

        // Also send to remote server if possible
        this.sendSecurityLogToServer(logEntry);
    }

    async sendSecurityLogToServer(logEntry) {
        try {
            await fetch(this.config.remoteServer.replace('verify.php', 'security-log.php'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Security-Log': 'true'
                },
                body: JSON.stringify(logEntry)
            });
        } catch (error) {
            // Silently fail - don't want to break the app
        }
    }

    // Public API methods
    async verifyLicense(licenseKey) {
        try {
            if (this.securityState.isBlocked) {
                throw new Error('Sistem güvenlik nedeniyle bloke edildi.');
            }

            const result = await this.verifyLicenseRemote(licenseKey);
            
            if (result.valid) {
                const licenseData = {
                    license_key: licenseKey,
                    domain: window.location.hostname,
                    verified: true,
                    expires: result.expires,
                    features: result.features,
                    verification_token: result.verification_token
                };

                this.storeLicense(licenseData);
                this.securityState.lastVerification = Date.now();
                
                return {
                    success: true,
                    data: licenseData
                };
            } else {
                throw new Error(result.reason || 'License verification failed');
            }
        } catch (error) {
            this.logSecurityEvent('LICENSE_VERIFICATION_ERROR', error.message);
            throw error;
        }
    }

    isLicenseValid() {
        const stored = this.getStoredLicense();
        return stored && stored.verified && !this.securityState.isBlocked;
    }

    getLicenseInfo() {
        return this.getStoredLicense();
    }

    getSecurityLogs() {
        return JSON.parse(localStorage.getItem('qr_menu_security_logs') || '[]');
    }

    clearSecurityLogs() {
        localStorage.removeItem('qr_menu_security_logs');
        this.logSecurityEvent('SECURITY_LOGS_CLEARED', 'Security logs manually cleared');
    }

    bindEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.performSecurityCheck();
            }
        });

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            this.logSecurityEvent('PAGE_UNLOAD', 'User leaving page');
        });
    }
}

// Initialize the secure license manager
window.SecureLicenseManager = new SecureLicenseManager();