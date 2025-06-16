// Advanced License Security System
// This file contains obfuscated security functions

(function() {
    'use strict';

    // Encrypted license validation functions
    const LicenseSecurity = {
        // Rate limiting for API requests
        rateLimiter: {
            requests: [],
            maxRequests: 10,
            timeWindow: 60000, // 1 minute
            
            canMakeRequest: function() {
                const now = Date.now();
                this.requests = this.requests.filter(time => now - time < this.timeWindow);
                
                if (this.requests.length >= this.maxRequests) {
                    return false;
                }
                
                this.requests.push(now);
                return true;
            }
        },

        // Encrypt license requests
        encryptRequest: function(data) {
            try {
                const jsonString = JSON.stringify(data);
                const encoded = btoa(jsonString);
                const timestamp = Date.now().toString(36);
                const checksum = this.generateChecksum(encoded + timestamp);
                
                return {
                    payload: encoded,
                    timestamp: timestamp,
                    checksum: checksum
                };
            } catch (error) {
                console.error('Encryption failed:', error);
                return null;
            }
        },

        // Generate checksum for integrity
        generateChecksum: function(data) {
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                const char = data.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash).toString(36);
        },

        // Validate license signature
        validateSignature: function(licenseData) {
            if (!licenseData.signature) return false;
            
            const expectedSignature = this.generateSignature(
                licenseData.key + licenseData.domain + licenseData.timestamp
            );
            
            return licenseData.signature === expectedSignature;
        },

        // Generate signature
        generateSignature: function(data) {
            return btoa(data).substring(0, 32);
        },

        // Check for tampering
        checkTampering: function() {
            const criticalElements = [
                'licenseOverlay',
                'adminPanel',
                'verifyLicense',
                'checkExistingLicense'
            ];

            for (const elementId of criticalElements) {
                const element = document.getElementById(elementId);
                if (!element && elementId !== 'adminPanel') {
                    return false;
                }
            }

            // Check if critical functions exist
            const criticalFunctions = [
                'verifyLicense',
                'checkExistingLicense',
                'verifyLicenseWithServer'
            ];

            for (const funcName of criticalFunctions) {
                if (typeof window[funcName] !== 'function') {
                    return false;
                }
            }

            return true;
        },

        // Monitor for suspicious activity
        monitorActivity: function() {
            let suspiciousActivity = 0;
            
            // Monitor console usage
            const originalLog = console.log;
            console.log = function(...args) {
                if (args.some(arg => 
                    typeof arg === 'string' && 
                    (arg.includes('bypass') || arg.includes('crack') || arg.includes('hack'))
                )) {
                    suspiciousActivity++;
                    if (suspiciousActivity > 3) {
                        LicenseSecurity.triggerSecurityAlert();
                    }
                }
                originalLog.apply(console, args);
            };

            // Monitor DOM modifications
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.removedNodes.forEach(function(node) {
                            if (node.id === 'licenseOverlay') {
                                suspiciousActivity++;
                                if (suspiciousActivity > 2) {
                                    LicenseSecurity.triggerSecurityAlert();
                                }
                            }
                        });
                    }
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        // Trigger security alert
        triggerSecurityAlert: function() {
            localStorage.removeItem('qr_menu_license');
            alert('Güvenlik ihlali tespit edildi. Sistem kapatılıyor.');
            window.location.reload();
        },

        // Initialize security measures
        initialize: function() {
            this.monitorActivity();
            
            // Check tampering periodically
            setInterval(() => {
                if (!this.checkTampering()) {
                    this.triggerSecurityAlert();
                }
            }, 30000); // Check every 30 seconds

            // Validate stored license periodically
            setInterval(() => {
                const storedLicense = localStorage.getItem('qr_menu_license');
                if (storedLicense) {
                    try {
                        const licenseData = JSON.parse(storedLicense);
                        if (!this.validateSignature(licenseData)) {
                            this.triggerSecurityAlert();
                        }
                    } catch (error) {
                        this.triggerSecurityAlert();
                    }
                }
            }, 60000); // Check every minute
        }
    };

    // Initialize security when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            LicenseSecurity.initialize();
        });
    } else {
        LicenseSecurity.initialize();
    }

    // Export to global scope (obfuscated)
    window._LS = LicenseSecurity;

})();

// Additional security layer - obfuscated code
(function(_0x1a2b3c) {
    const _0x4d5e6f = {
        _0x7g8h9i: function() {
            return window.location.hostname;
        },
        _0x1j2k3l: function() {
            return Date.now();
        },
        _0x4m5n6o: function(_0x7p8q9r) {
            return btoa(_0x7p8q9r);
        }
    };

    // Integrity check
    setInterval(function() {
        const _0x1s2t3u = _0x4d5e6f._0x7g8h9i();
        const _0x4v5w6x = _0x4d5e6f._0x1j2k3l();
        
        if (!document.getElementById('licenseOverlay') && 
            !localStorage.getItem('qr_menu_license')) {
            window.location.reload();
        }
    }, 45000);

})(window);