// Security Dashboard for Admin Panel
// Provides detailed security monitoring and violation alerts

class SecurityDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.createSecurityPanel();
        this.updateSecurityStatus();
        this.startRealTimeMonitoring();
    }

    createSecurityPanel() {
        const securityPanel = document.createElement('div');
        securityPanel.id = 'securityDashboard';
        securityPanel.className = 'fixed top-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 hidden';
        
        securityPanel.innerHTML = `
            <div class="p-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                        <i data-lucide="shield-check" class="h-5 w-5 mr-2 text-green-600"></i>
                        Güvenlik Durumu
                    </h3>
                    <button onclick="this.parentElement.parentElement.parentElement.classList.add('hidden')" 
                            class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="h-5 w-5"></i>
                    </button>
                </div>
            </div>
            
            <div class="p-4 space-y-4">
                <!-- License Status -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div class="flex items-center">
                        <i data-lucide="check-circle" class="h-5 w-5 text-green-600 mr-2"></i>
                        <div>
                            <p class="text-sm font-medium text-green-800">Lisans Durumu</p>
                            <p class="text-xs text-green-600" id="licenseStatus">Aktif ve Geçerli</p>
                        </div>
                    </div>
                </div>

                <!-- Security Metrics -->
                <div class="grid grid-cols-2 gap-2">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <p class="text-lg font-bold text-blue-800" id="securityScore">98</p>
                        <p class="text-xs text-blue-600">Güvenlik Skoru</p>
                    </div>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <p class="text-lg font-bold text-yellow-800" id="violationCount">0</p>
                        <p class="text-xs text-yellow-600">İhlal Sayısı</p>
                    </div>
                </div>

                <!-- Recent Events -->
                <div>
                    <h4 class="text-sm font-medium text-gray-900 mb-2">Son Güvenlik Olayları</h4>
                    <div id="recentEvents" class="space-y-2 max-h-32 overflow-y-auto">
                        <!-- Events will be populated here -->
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex space-x-2">
                    <button onclick="SecurityDashboard.showDetailedLogs()" 
                            class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 px-3 rounded-lg transition-colors">
                        Detaylı Loglar
                    </button>
                    <button onclick="SecurityDashboard.exportLogs()" 
                            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-2 px-3 rounded-lg transition-colors">
                        Logları Dışa Aktar
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(securityPanel);
        
        // Add toggle button to admin panel
        this.addSecurityToggleButton();
    }

    addSecurityToggleButton() {
        const adminPanel = document.getElementById('adminPanel');
        if (!adminPanel) return;

        const securityButton = document.createElement('button');
        securityButton.className = 'fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg z-40';
        securityButton.innerHTML = '<i data-lucide="shield-alert" class="h-6 w-6"></i>';
        securityButton.title = 'Güvenlik Durumu';
        securityButton.onclick = () => this.toggleSecurityPanel();

        adminPanel.appendChild(securityButton);
    }

    toggleSecurityPanel() {
        const panel = document.getElementById('securityDashboard');
        if (panel) {
            panel.classList.toggle('hidden');
            if (!panel.classList.contains('hidden')) {
                this.updateSecurityStatus();
            }
        }
    }

    updateSecurityStatus() {
        const licenseManager = window.SecureLicenseManager;
        if (!licenseManager) return;

        // Update license status
        const licenseStatus = document.getElementById('licenseStatus');
        const licenseInfo = licenseManager.getLicenseInfo();
        
        if (licenseInfo && licenseManager.isLicenseValid()) {
            licenseStatus.textContent = `Aktif - ${licenseInfo.domain}`;
            licenseStatus.className = 'text-xs text-green-600';
        } else {
            licenseStatus.textContent = 'Geçersiz veya Bulunamadı';
            licenseStatus.className = 'text-xs text-red-600';
        }

        // Update security score
        const securityScore = this.calculateSecurityScore();
        document.getElementById('securityScore').textContent = securityScore;

        // Update violation count
        const violations = licenseManager.securityState.violations;
        document.getElementById('violationCount').textContent = violations;

        // Update recent events
        this.updateRecentEvents();
    }

    calculateSecurityScore() {
        const licenseManager = window.SecureLicenseManager;
        let score = 100;

        // Deduct points for violations
        score -= licenseManager.securityState.violations * 10;

        // Deduct points if license is invalid
        if (!licenseManager.isLicenseValid()) {
            score -= 30;
        }

        // Deduct points for old verification
        const timeSinceVerification = Date.now() - licenseManager.securityState.lastVerification;
        if (timeSinceVerification > 60 * 60 * 1000) { // 1 hour
            score -= 20;
        }

        return Math.max(0, score);
    }

    updateRecentEvents() {
        const licenseManager = window.SecureLicenseManager;
        const logs = licenseManager.getSecurityLogs();
        const recentLogs = logs.slice(-5).reverse(); // Last 5 events

        const eventsContainer = document.getElementById('recentEvents');
        if (!eventsContainer) return;

        eventsContainer.innerHTML = '';

        if (recentLogs.length === 0) {
            eventsContainer.innerHTML = '<p class="text-xs text-gray-500">Henüz güvenlik olayı yok</p>';
            return;
        }

        recentLogs.forEach(log => {
            const eventElement = document.createElement('div');
            eventElement.className = 'bg-gray-50 border border-gray-200 rounded p-2';
            
            const eventType = this.getEventTypeInfo(log.event);
            const timeAgo = this.getTimeAgo(new Date(log.timestamp));
            
            eventElement.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <i data-lucide="${eventType.icon}" class="h-3 w-3 ${eventType.color} mr-1"></i>
                        <span class="text-xs font-medium text-gray-800">${eventType.label}</span>
                    </div>
                    <span class="text-xs text-gray-500">${timeAgo}</span>
                </div>
                <p class="text-xs text-gray-600 mt-1">${log.details}</p>
            `;

            eventsContainer.appendChild(eventElement);
        });
    }

    getEventTypeInfo(eventType) {
        const eventTypes = {
            'LICENSE_STORED': { label: 'Lisans Kaydedildi', icon: 'save', color: 'text-green-600' },
            'LICENSE_INVALID': { label: 'Geçersiz Lisans', icon: 'x-circle', color: 'text-red-600' },
            'SECURITY_VIOLATION': { label: 'Güvenlik İhlali', icon: 'alert-triangle', color: 'text-red-600' },
            'DOM_TAMPERING': { label: 'DOM Değişikliği', icon: 'alert-circle', color: 'text-orange-600' },
            'DEVTOOLS_DETECTED': { label: 'Geliştirici Araçları', icon: 'code', color: 'text-yellow-600' },
            'RATE_LIMIT_EXCEEDED': { label: 'Hız Limiti Aşıldı', icon: 'clock', color: 'text-orange-600' },
            'PERIODIC_VERIFICATION_FAILED': { label: 'Periyodik Doğrulama Hatası', icon: 'wifi-off', color: 'text-red-600' }
        };

        return eventTypes[eventType] || { label: eventType, icon: 'info', color: 'text-gray-600' };
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} sa önce`;
        return `${diffDays} gün önce`;
    }

    startRealTimeMonitoring() {
        // Update security status every 30 seconds
        setInterval(() => {
            if (!document.getElementById('securityDashboard').classList.contains('hidden')) {
                this.updateSecurityStatus();
            }
        }, 30000);

        // Listen for security events
        document.addEventListener('securityEvent', (event) => {
            this.handleSecurityEvent(event.detail);
        });
    }

    handleSecurityEvent(eventData) {
        // Show notification for critical events
        if (eventData.severity === 'critical') {
            this.showSecurityAlert(eventData);
        }

        // Update dashboard if visible
        if (!document.getElementById('securityDashboard').classList.contains('hidden')) {
            this.updateSecurityStatus();
        }
    }

    showSecurityAlert(eventData) {
        const alert = document.createElement('div');
        alert.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        alert.innerHTML = `
            <div class="flex items-center">
                <i data-lucide="alert-triangle" class="h-5 w-5 mr-2"></i>
                <div>
                    <p class="font-medium">Güvenlik Uyarısı</p>
                    <p class="text-sm">${eventData.message}</p>
                </div>
            </div>
        `;

        document.body.appendChild(alert);

        // Remove alert after 5 seconds
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    static showDetailedLogs() {
        const licenseManager = window.SecureLicenseManager;
        const logs = licenseManager.getSecurityLogs();

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">Detaylı Güvenlik Logları</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                        <i data-lucide="x" class="h-6 w-6"></i>
                    </button>
                </div>
                <div class="p-4 overflow-y-auto max-h-96">
                    <div class="space-y-2">
                        ${logs.map(log => `
                            <div class="bg-gray-50 border border-gray-200 rounded p-3">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-medium text-gray-800">${log.event}</span>
                                    <span class="text-xs text-gray-500">${new Date(log.timestamp).toLocaleString('tr-TR')}</span>
                                </div>
                                <p class="text-sm text-gray-600">${log.details}</p>
                                <div class="mt-2 text-xs text-gray-500">
                                    <p>Domain: ${log.domain}</p>
                                    <p>Browser: ${log.browserFingerprint}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    static exportLogs() {
        const licenseManager = window.SecureLicenseManager;
        const logs = licenseManager.getSecurityLogs();

        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }
}

// Initialize security dashboard when admin panel is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('adminPanel')) {
        window.SecurityDashboard = new SecurityDashboard();
    }
});