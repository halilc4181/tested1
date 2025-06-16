// QR Menu Admin Panel JavaScript
// Enhanced with License System and Sidebar Toggle

let currentSection = 'dashboard';
let sidebarCollapsed = false;

// License verification status
let licenseVerified = false;

// Initialize admin panel
function initializeAdmin() {
    licenseVerified = true;
    loadDashboard();
    loadNotifications();
    setInterval(loadNotifications, 30000); // Check notifications every 30 seconds
    
    // Set active navigation item
    updateActiveNavigation('dashboard');
}

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    sidebarCollapsed = !sidebarCollapsed;
    
    if (sidebarCollapsed) {
        sidebar.classList.remove('sidebar-expanded');
        sidebar.classList.add('sidebar-collapsed');
        mainContent.classList.remove('content-normal');
        mainContent.classList.add('content-expanded');
    } else {
        sidebar.classList.remove('sidebar-collapsed');
        sidebar.classList.add('sidebar-expanded');
        mainContent.classList.remove('content-expanded');
        mainContent.classList.add('content-normal');
    }
}

// Navigation functions
function showSection(section) {
    if (!licenseVerified) {
        alert('Lisans doğrulaması gerekli!');
        return;
    }
    
    currentSection = section;
    updateActiveNavigation(section);
    
    const titles = {
        'dashboard': { title: 'Dashboard', desc: 'Sistem genel bakış ve istatistikler' },
        'products': { title: 'Ürün Yönetimi', desc: 'Ürünleri ekle, düzenle ve yönet' },
        'categories': { title: 'Kategori Yönetimi', desc: 'Kategorileri düzenle ve sırala' },
        'tables': { title: 'Masa Yönetimi', desc: 'Masa bilgilerini yönet' },
        'qr-codes': { title: 'QR Kod Yönetimi', desc: 'QR kodları oluştur ve yönet' },
        'restaurant': { title: 'İşletme Ayarları', desc: 'İşletme bilgilerini düzenle' },
        'design': { title: 'Tasarım Ayarları', desc: 'Site görünümünü özelleştir' },
        'notifications': { title: 'Bildirimler', desc: 'Garson çağrıları ve bildirimler' },
        'feedback': { title: 'Geri Bildirimler', desc: 'Müşteri geri bildirimlerini görüntüle' }
    };
    
    document.getElementById('pageTitle').textContent = titles[section].title;
    document.getElementById('pageDescription').textContent = titles[section].desc;
    
    // Load section content
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'tables':
            loadTables();
            break;
        case 'qr-codes':
            loadQRCodes();
            break;
        case 'restaurant':
            loadRestaurant();
            break;
        case 'design':
            loadDesign();
            break;
        case 'notifications':
            loadNotifications();
            break;
        case 'feedback':
            loadFeedback();
            break;
    }
}

function updateActiveNavigation(section) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('bg-yellow-100', 'text-yellow-700');
        item.classList.add('text-gray-700');
    });
    
    // Add active class to current section
    const activeItem = document.querySelector(`[data-section="${section}"]`);
    if (activeItem) {
        activeItem.classList.add('bg-yellow-100', 'text-yellow-700');
        activeItem.classList.remove('text-gray-700');
    }
}

// Dashboard functions
async function loadDashboard() {
    try {
        const [products, categories, notifications, feedback] = await Promise.all([
            fetch('../api/products.php').then(r => r.json()),
            fetch('../api/categories.php').then(r => r.json()),
            fetch('../api/notifications.php').then(r => r.json()),
            fetch('../api/feedback.php').then(r => r.json())
        ]);

        const totalProducts = products.length;
        const activeProducts = products.filter(p => p.isActive).length;
        const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalLikes = products.reduce((sum, p) => sum + (p.likes || 0), 0);
        const totalCategories = categories.filter(c => c.isActive).length;
        const pendingNotifications = notifications.length;
        const totalFeedback = feedback.length;

        const popularProducts = products
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        document.getElementById('contentArea').innerHTML = `
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Toplam Ürün</p>
                            <p class="text-3xl font-bold text-gray-900">${totalProducts}</p>
                            <p class="text-sm text-green-600">${activeProducts} aktif</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="package" class="h-6 w-6 text-blue-600"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
                            <p class="text-3xl font-bold text-gray-900">${totalViews.toLocaleString()}</p>
                            <p class="text-sm text-blue-600">Bu ay</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="eye" class="h-6 w-6 text-green-600"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Toplam Beğeni</p>
                            <p class="text-3xl font-bold text-gray-900">${totalLikes.toLocaleString()}</p>
                            <p class="text-sm text-purple-600">Müşteri memnuniyeti</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="heart" class="h-6 w-6 text-purple-600"></i>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Bekleyen Bildirim</p>
                            <p class="text-3xl font-bold text-gray-900">${pendingNotifications}</p>
                            <p class="text-sm text-orange-600">Garson çağrıları</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="bell" class="h-6 w-6 text-orange-600"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Popular Products -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                <div class="p-6 border-b border-gray-100">
                    <h3 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <i data-lucide="trending-up" class="h-5 w-5"></i>
                        <span>Popüler Ürünler</span>
                    </h3>
                </div>
                <div class="p-6">
                    <div class="space-y-4">
                        ${popularProducts.map((product, index) => {
                            const category = categories.find(c => c.id === product.category);
                            const likeRatio = product.likes + product.dislikes > 0 
                                ? (product.likes / (product.likes + product.dislikes)) * 100 
                                : 0;
                            
                            return `
                                <div class="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center font-bold text-white">
                                        ${index + 1}
                                    </div>
                                    <img src="${product.image}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover">
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-medium text-gray-900 truncate">${product.name}</h4>
                                        <p class="text-sm text-gray-500">${category ? category.name : 'Kategori yok'} • ₺${product.price}</p>
                                    </div>
                                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                                        <div class="flex items-center space-x-1">
                                            <i data-lucide="eye" class="h-4 w-4"></i>
                                            <span>${product.views || 0}</span>
                                        </div>
                                        <div class="flex items-center space-x-1">
                                            <i data-lucide="star" class="h-4 w-4 text-yellow-500 fill-current"></i>
                                            <span>${likeRatio.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">Hızlı İşlemler</h3>
                        <i data-lucide="zap" class="h-6 w-6"></i>
                    </div>
                    <div class="space-y-3">
                        <button onclick="showSection('products')" class="w-full text-left p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors">
                            + Yeni Ürün Ekle
                        </button>
                        <button onclick="showSection('qr-codes')" class="w-full text-left p-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors">
                            + QR Kod Oluştur
                        </button>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">Son Geri Bildirimler</h3>
                        <i data-lucide="message-square" class="h-6 w-6"></i>
                    </div>
                    <div class="space-y-2">
                        <p class="text-sm opacity-90">${totalFeedback} toplam geri bildirim</p>
                        <button onclick="showSection('feedback')" class="text-sm underline hover:no-underline">
                            Tümünü Görüntüle →
                        </button>
                    </div>
                </div>

                <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">Sistem Durumu</h3>
                        <i data-lucide="shield-check" class="h-6 w-6"></i>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 bg-green-300 rounded-full"></div>
                            <span class="text-sm">Lisans Aktif</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="w-2 h-2 bg-green-300 rounded-full"></div>
                            <span class="text-sm">Sistem Çalışıyor</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Dashboard yüklenirken hata oluştu');
    }
}

// Products functions
async function loadProducts() {
    try {
        const [products, categories] = await Promise.all([
            fetch('../api/products.php').then(r => r.json()),
            fetch('../api/categories.php').then(r => r.json())
        ]);

        document.getElementById('contentArea').innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Ürün Listesi</h2>
                <button onclick="showProductForm()" class="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                    <i data-lucide="plus" class="h-4 w-4"></i>
                    <span>Yeni Ürün</span>
                </button>
            </div>

            <!-- Product Form (Hidden by default) -->
            <div id="productForm" class="bg-white rounded-lg shadow-md p-6 mb-6 hidden">
                <h3 id="productFormTitle" class="text-lg font-semibold text-gray-900 mb-4">Yeni Ürün Ekle</h3>
                <form id="productFormElement" onsubmit="saveProduct(event)">
                    <input type="hidden" id="productId" value="">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı (TR)</label>
                            <input type="text" id="productName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ürün Adı (EN)</label>
                            <input type="text" id="productNameEn" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama (TR)</label>
                            <textarea id="productDescription" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Açıklama (EN)</label>
                            <textarea id="productDescriptionEn" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required></textarea>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                            <input type="number" id="productPrice" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <select id="productCategory" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                                ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
                            <input type="url" id="productImage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                    </div>

                    <!-- Variations Section -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-3">
                            <label class="block text-sm font-medium text-gray-700">Ürün Çeşitleri</label>
                            <button type="button" onclick="addVariation()" class="text-sm text-yellow-600 hover:text-yellow-700 flex items-center space-x-1">
                                <i data-lucide="plus" class="h-4 w-4"></i>
                                <span>Çeşit Ekle</span>
                            </button>
                        </div>
                        <div id="variationsContainer" class="space-y-2">
                            <!-- Variations will be added here -->
                        </div>
                    </div>

                    <div class="flex items-center space-x-4 mb-6">
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" id="productActive" class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" checked>
                            <span class="text-sm text-gray-700">Aktif</span>
                        </label>
                    </div>
                    <div class="flex space-x-3">
                        <button type="submit" class="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                            <i data-lucide="save" class="h-4 w-4"></i>
                            <span>Kaydet</span>
                        </button>
                        <button type="button" onclick="hideProductForm()" class="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <i data-lucide="x" class="h-4 w-4"></i>
                            <span>İptal</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Products Table -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İstatistikler</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${products.map(product => {
                                const category = categories.find(c => c.id === product.category);
                                return `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="flex items-center">
                                                <img src="${product.image}" alt="${product.name}" class="h-10 w-10 rounded-lg object-cover">
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900">${product.name}</div>
                                                    <div class="text-sm text-gray-500">${product.variations ? product.variations.length : 0} çeşit</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${category ? category.name : 'Kategori yok'}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₺${product.price}</td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div class="space-y-1">
                                                <div>${product.views || 0} görüntülenme</div>
                                                <div>${product.likes || 0} beğeni</div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }">
                                                ${product.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div class="flex space-x-2">
                                                <button onclick="toggleProductStatus('${product.id}', ${!product.isActive})" class="text-${product.isActive ? 'red' : 'green'}-600 hover:text-${product.isActive ? 'red' : 'green'}-900">
                                                    <i data-lucide="${product.isActive ? 'eye-off' : 'eye'}" class="h-4 w-4"></i>
                                                </button>
                                                <button onclick="editProduct('${product.id}')" class="text-yellow-600 hover:text-yellow-900">
                                                    <i data-lucide="edit" class="h-4 w-4"></i>
                                                </button>
                                                <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900">
                                                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        lucide.createIcons();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Ürünler yüklenirken hata oluştu');
    }
}

// Product variation functions
let variationCounter = 0;

function addVariation() {
    const container = document.getElementById('variationsContainer');
    const variationId = 'variation_' + (++variationCounter);
    
    const variationHtml = `
        <div class="variation-item border border-gray-200 rounded-lg p-3" data-variation-id="${variationId}">
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                <div>
                    <input type="text" placeholder="Çeşit Adı (TR)" class="variation-name-tr w-full px-2 py-1 border border-gray-300 rounded text-sm" required>
                </div>
                <div>
                    <input type="text" placeholder="Çeşit Adı (EN)" class="variation-name-en w-full px-2 py-1 border border-gray-300 rounded text-sm" required>
                </div>
                <div>
                    <input type="number" placeholder="Fiyat Farkı" step="0.01" class="variation-price w-full px-2 py-1 border border-gray-300 rounded text-sm">
                </div>
                <div class="flex items-center">
                    <label class="flex items-center space-x-2">
                        <input type="checkbox" class="variation-available rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" checked>
                        <span class="text-sm text-gray-700">Mevcut</span>
                    </label>
                </div>
                <div>
                    <button type="button" onclick="removeVariation('${variationId}')" class="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                        <span>Kaldır</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', variationHtml);
    lucide.createIcons();
}

function removeVariation(variationId) {
    const variationElement = document.querySelector(`[data-variation-id="${variationId}"]`);
    if (variationElement) {
        variationElement.remove();
    }
}

function collectVariations() {
    const variations = [];
    const variationElements = document.querySelectorAll('.variation-item');
    
    variationElements.forEach((element, index) => {
        const nameTr = element.querySelector('.variation-name-tr').value.trim();
        const nameEn = element.querySelector('.variation-name-en').value.trim();
        const price = parseFloat(element.querySelector('.variation-price').value) || 0;
        const available = element.querySelector('.variation-available').checked;
        
        if (nameTr && nameEn) {
            variations.push({
                id: 'var_' + Date.now() + '_' + index,
                name: nameTr,
                nameEn: nameEn,
                priceModifier: price,
                isAvailable: available
            });
        }
    });
    
    return variations;
}

function loadVariations(variations) {
    const container = document.getElementById('variationsContainer');
    container.innerHTML = '';
    
    if (variations && variations.length > 0) {
        variations.forEach(variation => {
            const variationId = 'variation_' + (++variationCounter);
            
            const variationHtml = `
                <div class="variation-item border border-gray-200 rounded-lg p-3" data-variation-id="${variationId}">
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                        <div>
                            <input type="text" placeholder="Çeşit Adı (TR)" value="${variation.name}" class="variation-name-tr w-full px-2 py-1 border border-gray-300 rounded text-sm" required>
                        </div>
                        <div>
                            <input type="text" placeholder="Çeşit Adı (EN)" value="${variation.nameEn}" class="variation-name-en w-full px-2 py-1 border border-gray-300 rounded text-sm" required>
                        </div>
                        <div>
                            <input type="number" placeholder="Fiyat Farkı" step="0.01" value="${variation.priceModifier}" class="variation-price w-full px-2 py-1 border border-gray-300 rounded text-sm">
                        </div>
                        <div class="flex items-center">
                            <label class="flex items-center space-x-2">
                                <input type="checkbox" class="variation-available rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" ${variation.isAvailable ? 'checked' : ''}>
                                <span class="text-sm text-gray-700">Mevcut</span>
                            </label>
                        </div>
                        <div>
                            <button type="button" onclick="removeVariation('${variationId}')" class="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1">
                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                                <span>Kaldır</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', variationHtml);
        });
        
        lucide.createIcons();
    }
}

// Product form functions
function showProductForm() {
    document.getElementById('productForm').classList.remove('hidden');
    document.getElementById('productFormTitle').textContent = 'Yeni Ürün Ekle';
    document.getElementById('productFormElement').reset();
    document.getElementById('productId').value = '';
    document.getElementById('variationsContainer').innerHTML = '';
    variationCounter = 0;
}

function hideProductForm() {
    document.getElementById('productForm').classList.add('hidden');
}

async function editProduct(productId) {
    try {
        const products = await fetch('../api/products.php').then(r => r.json());
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showError('Ürün bulunamadı');
            return;
        }
        
        // Show form
        document.getElementById('productForm').classList.remove('hidden');
        document.getElementById('productFormTitle').textContent = 'Ürün Düzenle';
        
        // Fill form
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productNameEn').value = product.nameEn;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productDescriptionEn').value = product.descriptionEn;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productActive').checked = product.isActive;
        
        // Load variations
        loadVariations(product.variations || []);
        
    } catch (error) {
        console.error('Error editing product:', error);
        showError('Ürün düzenlenirken hata oluştu');
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const isEdit = !!productId;
    
    const productData = {
        action: isEdit ? 'update' : 'add',
        name: document.getElementById('productName').value,
        nameEn: document.getElementById('productNameEn').value,
        description: document.getElementById('productDescription').value,
        descriptionEn: document.getElementById('productDescriptionEn').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        isActive: document.getElementById('productActive').checked,
        variations: collectVariations()
    };
    
    if (isEdit) {
        productData.id = productId;
    }
    
    try {
        const response = await fetch('../api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(isEdit ? 'Ürün güncellendi' : 'Ürün eklendi');
            hideProductForm();
            loadProducts();
        } else {
            showError('Ürün kaydedilirken hata oluştu');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showError('Ürün kaydedilirken hata oluştu');
    }
}

async function toggleProductStatus(productId, newStatus) {
    try {
        const response = await fetch('../api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update',
                id: productId,
                isActive: newStatus
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Ürün durumu güncellendi');
            loadProducts();
        } else {
            showError('Ürün durumu güncellenirken hata oluştu');
        }
    } catch (error) {
        console.error('Error toggling product status:', error);
        showError('Ürün durumu güncellenirken hata oluştu');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch('../api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                id: productId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Ürün silindi');
            loadProducts();
        } else {
            showError('Ürün silinirken hata oluştu');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showError('Ürün silinirken hata oluştu');
    }
}

// Categories functions
async function loadCategories() {
    try {
        const categories = await fetch('../api/categories.php').then(r => r.json());

        document.getElementById('contentArea').innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Kategori Listesi</h2>
                <button onclick="showCategoryForm()" class="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                    <i data-lucide="plus" class="h-4 w-4"></i>
                    <span>Yeni Kategori</span>
                </button>
            </div>

            <!-- Category Form (Hidden by default) -->
            <div id="categoryForm" class="bg-white rounded-lg shadow-md p-6 mb-6 hidden">
                <h3 id="categoryFormTitle" class="text-lg font-semibold text-gray-900 mb-4">Yeni Kategori Ekle</h3>
                <form id="categoryFormElement" onsubmit="saveCategory(event)">
                    <input type="hidden" id="categoryId" value="">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Adı (TR)</label>
                            <input type="text" id="categoryName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori Adı (EN)</label>
                            <input type="text" id="categoryNameEn" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">İkon</label>
                            <input type="text" id="categoryIcon" placeholder="coffee, utensils, cake..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
                            <input type="number" id="categoryOrder" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Görsel URL</label>
                            <input type="url" id="categoryImage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 mb-6">
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" id="categoryActive" class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" checked>
                            <span class="text-sm text-gray-700">Aktif</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" id="categoryShowOnHome" class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" checked>
                            <span class="text-sm text-gray-700">Anasayfada Göster</span>
                        </label>
                    </div>
                    <div class="flex space-x-3">
                        <button type="submit" class="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                            <i data-lucide="save" class="h-4 w-4"></i>
                            <span>Kaydet</span>
                        </button>
                        <button type="button" onclick="hideCategoryForm()" class="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <i data-lucide="x" class="h-4 w-4"></i>
                            <span>İptal</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Categories Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${categories.map(category => `
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                ${category.image ? 
                                    `<img src="${category.image}" alt="${category.name}" class="w-12 h-12 rounded-lg object-cover">` :
                                    `<div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <i data-lucide="${category.icon}" class="h-6 w-6 text-yellow-600"></i>
                                    </div>`
                                }
                                <div>
                                    <h3 class="font-medium text-gray-900">${category.name}</h3>
                                    <p class="text-sm text-gray-500">${category.nameEn}</p>
                                </div>
                            </div>
                            <span class="text-sm text-gray-500">Sıra: ${category.order}</span>
                        </div>
                        
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex space-x-2">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }">
                                    ${category.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                                ${category.showOnHome ? 
                                    '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Anasayfa</span>' : 
                                    ''
                                }
                            </div>
                        </div>

                        <div class="flex space-x-2">
                            <button onclick="toggleCategoryStatus('${category.id}', ${!category.isActive})" class="flex-1 text-${category.isActive ? 'red' : 'green'}-600 hover:text-${category.isActive ? 'red' : 'green'}-700 text-sm py-1">
                                ${category.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                            </button>
                            <button onclick="editCategory('${category.id}')" class="text-yellow-600 hover:text-yellow-700 p-1">
                                <i data-lucide="edit" class="h-4 w-4"></i>
                            </button>
                            <button onclick="deleteCategory('${category.id}')" class="text-red-600 hover:text-red-700 p-1">
                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        lucide.createIcons();
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('Kategoriler yüklenirken hata oluştu');
    }
}

// Category form functions
function showCategoryForm() {
    document.getElementById('categoryForm').classList.remove('hidden');
    document.getElementById('categoryFormTitle').textContent = 'Yeni Kategori Ekle';
    document.getElementById('categoryFormElement').reset();
    document.getElementById('categoryId').value = '';
}

function hideCategoryForm() {
    document.getElementById('categoryForm').classList.add('hidden');
}

async function editCategory(categoryId) {
    try {
        const categories = await fetch('../api/categories.php').then(r => r.json());
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) {
            showError('Kategori bulunamadı');
            return;
        }
        
        // Show form
        document.getElementById('categoryForm').classList.remove('hidden');
        document.getElementById('categoryFormTitle').textContent = 'Kategori Düzenle';
        
        // Fill form
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryNameEn').value = category.nameEn;
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('categoryOrder').value = category.order;
        document.getElementById('categoryImage').value = category.image || '';
        document.getElementById('categoryActive').checked = category.isActive;
        document.getElementById('categoryShowOnHome').checked = category.showOnHome;
        
    } catch (error) {
        console.error('Error editing category:', error);
        showError('Kategori düzenlenirken hata oluştu');
    }
}

async function saveCategory(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const isEdit = !!categoryId;
    
    const categoryData = {
        action: isEdit ? 'update' : 'add',
        name: document.getElementById('categoryName').value,
        nameEn: document.getElementById('categoryNameEn').value,
        icon: document.getElementById('categoryIcon').value,
        order: parseInt(document.getElementById('categoryOrder').value),
        image: document.getElementById('categoryImage').value,
        isActive: document.getElementById('categoryActive').checked,
        showOnHome: document.getElementById('categoryShowOnHome').checked
    };
    
    if (isEdit) {
        categoryData.id = categoryId;
    }
    
    try {
        const response = await fetch('../api/categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(isEdit ? 'Kategori güncellendi' : 'Kategori eklendi');
            hideCategoryForm();
            loadCategories();
        } else {
            showError('Kategori kaydedilirken hata oluştu');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        showError('Kategori kaydedilirken hata oluştu');
    }
}

async function toggleCategoryStatus(categoryId, newStatus) {
    try {
        const response = await fetch('../api/categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update',
                id: categoryId,
                isActive: newStatus
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Kategori durumu güncellendi');
            loadCategories();
        } else {
            showError('Kategori durumu güncellenirken hata oluştu');
        }
    } catch (error) {
        console.error('Error toggling category status:', error);
        showError('Kategori durumu güncellenirken hata oluştu');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki tüm ürünler de silinecek.')) {
        return;
    }
    
    try {
        const response = await fetch('../api/categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                id: categoryId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Kategori silindi');
            loadCategories();
        } else {
            showError('Kategori silinirken hata oluştu');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showError('Kategori silinirken hata oluştu');
    }
}

// Tables functions
async function loadTables() {
    try {
        const tables = await fetch('../api/tables.php').then(r => r.json());

        document.getElementById('contentArea').innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Masa Listesi</h2>
                <button onclick="showTableForm()" class="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                    <i data-lucide="plus" class="h-4 w-4"></i>
                    <span>Yeni Masa</span>
                </button>
            </div>

            <!-- Table Form (Hidden by default) -->
            <div id="tableForm" class="bg-white rounded-lg shadow-md p-6 mb-6 hidden">
                <h3 id="tableFormTitle" class="text-lg font-semibold text-gray-900 mb-4">Yeni Masa Ekle</h3>
                <form id="tableFormElement" onsubmit="saveTable(event)">
                    <input type="hidden" id="tableId" value="">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Masa Adı (TR)</label>
                            <input type="text" id="tableName" placeholder="Masa 1" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Masa Adı (EN)</label>
                            <input type="text" id="tableNameEn" placeholder="Table 1" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4 mb-6">
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" id="tableActive" class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" checked>
                            <span class="text-sm text-gray-700">Aktif</span>
                        </label>
                    </div>
                    <div class="flex space-x-3">
                        <button type="submit" class="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                            <i data-lucide="save" class="h-4 w-4"></i>
                            <span>Kaydet</span>
                        </button>
                        <button type="button" onclick="hideTableForm()" class="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <i data-lucide="x" class="h-4 w-4"></i>
                            <span>İptal</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- Tables Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${tables.map(table => `
                    <div class="bg-white rounded-lg shadow-md p-4">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center space-x-2">
                                <i data-lucide="table" class="h-5 w-5 text-gray-400"></i>
                                <h3 class="font-medium text-gray-900">${table.name}</h3>
                            </div>
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                table.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }">
                                ${table.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                        </div>
                        
                        <div class="text-sm text-gray-500 mb-3">${table.nameEn}</div>

                        <div class="flex space-x-2">
                            <button onclick="toggleTableStatus('${table.id}', ${!table.isActive})" class="flex-1 text-${table.isActive ? 'red' : 'green'}-600 hover:text-${table.isActive ? 'red' : 'green'}-700 text-sm py-1">
                                ${table.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                            </button>
                            <button onclick="editTable('${table.id}')" class="text-yellow-600 hover:text-yellow-700 p-1">
                                <i data-lucide="edit" class="h-4 w-4"></i>
                            </button>
                            <button onclick="deleteTable('${table.id}')" class="text-red-600 hover:text-red-700 p-1">
                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>

            ${tables.length === 0 ? `
                <div class="text-center py-12">
                    <i data-lucide="table" class="h-12 w-12 text-gray-400 mx-auto mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Henüz masa eklenmemiş</h3>
                    <p class="text-gray-600 mb-4">Garson çağırma sistemi için masalar ekleyin.</p>
                    <button onclick="showTableForm()" class="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                        <i data-lucide="plus" class="h-5 w-5"></i>
                        <span>İlk Masayı Ekle</span>
                    </button>
                </div>
            ` : ''}
        `;

        lucide.createIcons();
    } catch (error) {
        console.error('Error loading tables:', error);
        showError('Masalar yüklenirken hata oluştu');
    }
}

// Table form functions
function showTableForm() {
    document.getElementById('tableForm').classList.remove('hidden');
    document.getElementById('tableFormTitle').textContent = 'Yeni Masa Ekle';
    document.getElementById('tableFormElement').reset();
    document.getElementById('tableId').value = '';
}

function hideTableForm() {
    document.getElementById('tableForm').classList.add('hidden');
}

async function editTable(tableId) {
    try {
        const tables = await fetch('../api/tables.php').then(r => r.json());
        const table = tables.find(t => t.id === tableId);
        
        if (!table) {
            showError('Masa bulunamadı');
            return;
        }
        
        // Show form
        document.getElementById('tableForm').classList.remove('hidden');
        document.getElementById('tableFormTitle').textContent = 'Masa Düzenle';
        
        // Fill form
        document.getElementById('tableId').value = table.id;
        document.getElementById('tableName').value = table.name;
        document.getElementById('tableNameEn').value = table.nameEn;
        document.getElementById('tableActive').checked = table.isActive;
        
    } catch (error) {
        console.error('Error editing table:', error);
        showError('Masa düzenlenirken hata oluştu');
    }
}

async function saveTable(event) {
    event.preventDefault();
    
    const tableId = document.getElementById('tableId').value;
    const isEdit = !!tableId;
    
    const tableData = {
        action: isEdit ? 'update' : 'add',
        name: document.getElementById('tableName').value,
        nameEn: document.getElementById('tableNameEn').value,
        isActive: document.getElementById('tableActive').checked
    };
    
    if (isEdit) {
        tableData.id = tableId;
    }
    
    try {
        const response = await fetch('../api/tables.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tableData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(isEdit ? 'Masa güncellendi' : 'Masa eklendi');
            hideTableForm();
            loadTables();
        } else {
            showError('Masa kaydedilirken hata oluştu');
        }
    } catch (error) {
        console.error('Error saving table:', error);
        showError('Masa kaydedilirken hata oluştu');
    }
}

async function toggleTableStatus(tableId, newStatus) {
    try {
        const response = await fetch('../api/tables.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update',
                id: tableId,
                isActive: newStatus
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Masa durumu güncellendi');
            loadTables();
        } else {
            showError('Masa durumu güncellenirken hata oluştu');
        }
    } catch (error) {
        console.error('Error toggling table status:', error);
        showError('Masa durumu güncellenirken hata oluştu');
    }
}

async function deleteTable(tableId) {
    if (!confirm('Bu masayı silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch('../api/tables.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                id: tableId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Masa silindi');
            loadTables();
        } else {
            showError('Masa silinirken hata oluştu');
        }
    } catch (error) {
        console.error('Error deleting table:', error);
        showError('Masa silinirken hata oluştu');
    }
}

// QR Codes functions
async function loadQRCodes() {
    try {
        const [qrCodes, tables] = await Promise.all([
            fetch('../api/qr-codes.php').then(r => r.json()),
            fetch('../api/tables.php').then(r => r.json())
        ]);

        document.getElementById('contentArea').innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">QR Kod Listesi</h2>
                <button onclick="showQRForm()" class="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                    <i data-lucide="plus" class="h-4 w-4"></i>
                    <span>Yeni QR Kod</span>
                </button>
            </div>

            <!-- QR Form (Hidden by default) -->
            <div id="qrForm" class="bg-white rounded-lg shadow-md p-6 mb-6 hidden">
                <h3 id="qrFormTitle" class="text-lg font-semibold text-gray-900 mb-4">Yeni QR Kod Oluştur</h3>
                <form id="qrFormElement" onsubmit="saveQRCode(event)">
                    <input type="hidden" id="qrId" value="">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">QR Kod Adı</label>
                            <input type="text" id="qrName" placeholder="Masa 1 QR Kodu" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Masa</label>
                            <select id="qrTable" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                                <option value="">Masa Seçin</option>
                                ${tables.filter(t => t.isActive).map(table => 
                                    `<option value="${table.id}">${table.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="flex space-x-3">
                        <button type="submit" class="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                            <i data-lucide="save" class="h-4 w-4"></i>
                            <span>Oluştur</span>
                        </button>
                        <button type="button" onclick="hideQRForm()" class="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <i data-lucide="x" class="h-4 w-4"></i>
                            <span>İptal</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- QR Codes Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${qrCodes.map(qr => {
                    const table = tables.find(t => t.id === qr.tableId);
                    return `
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="text-center mb-4">
                                <h3 class="font-medium text-gray-900 mb-2">${qr.name}</h3>
                                <p class="text-sm text-gray-500 mb-4">${table ? table.name : 'Masa bulunamadı'}</p>
                                
                                <!-- QR Code Container -->
                                <div class="flex justify-center mb-4">
                                    <div class="bg-white p-4 rounded-lg border-2 border-gray-200" style="width: 200px; height: 200px;">
                                        <canvas id="qr-${qr.id}" width="168" height="168" class="w-full h-full"></canvas>
                                    </div>
                                </div>
                                
                                <p class="text-xs text-gray-400 mb-4">
                                    Oluşturulma: ${new Date(qr.createdAt).toLocaleDateString('tr-TR')}
                                </p>
                            </div>

                            <!-- Action Buttons -->
                            <div class="grid grid-cols-3 gap-2">
                                <button onclick="downloadQR('${qr.id}')" class="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                                    <i data-lucide="download" class="h-4 w-4"></i>
                                    <span>İndir</span>
                                </button>
                                <button onclick="printQR('${qr.id}')" class="flex items-center justify-center space-x-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm">
                                    <i data-lucide="printer" class="h-4 w-4"></i>
                                    <span>Yazdır</span>
                                </button>
                                <button onclick="deleteQR('${qr.id}')" class="flex items-center justify-center space-x-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm">
                                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                                    <span>Sil</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            ${qrCodes.length === 0 ? `
                <div class="text-center py-12">
                    <i data-lucide="qr-code" class="h-12 w-12 text-gray-400 mx-auto mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Henüz QR kod oluşturulmamış</h3>
                    <p class="text-gray-600 mb-4">Masalar için QR kodları oluşturun.</p>
                    <button onclick="showQRForm()" class="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
                        <i data-lucide="plus" class="h-5 w-5"></i>
                        <span>İlk QR Kodu Oluştur</span>
                    </button>
                </div>
            ` : ''}
        `;

        lucide.createIcons();
        
        // Generate QR codes
        qrCodes.forEach(qr => {
            generateQRCode(qr.id, qr.content);
        });

    } catch (error) {
        console.error('Error loading QR codes:', error);
        showError('QR kodlar yüklenirken hata oluştu');
    }
}

// QR form functions
function showQRForm() {
    document.getElementById('qrForm').classList.remove('hidden');
    document.getElementById('qrFormTitle').textContent = 'Yeni QR Kod Oluştur';
    document.getElementById('qrFormElement').reset();
    document.getElementById('qrId').value = '';
}

function hideQRForm() {
    document.getElementById('qrForm').classList.add('hidden');
}

async function saveQRCode(event) {
    event.preventDefault();
    
    const qrId = document.getElementById('qrId').value;
    const isEdit = !!qrId;
    
    const tableId = document.getElementById('qrTable').value;
    const baseUrl = window.location.origin + window.location.pathname.replace('/admin/', '/');
    const qrContent = `${baseUrl}?table=${tableId}`;
    
    const qrData = {
        action: isEdit ? 'update' : 'add',
        name: document.getElementById('qrName').value,
        tableId: tableId,
        content: qrContent
    };
    
    if (isEdit) {
        qrData.id = qrId;
    }
    
    try {
        const response = await fetch('../api/qr-codes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(qrData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess(isEdit ? 'QR kod güncellendi' : 'QR kod oluşturuldu');
            hideQRForm();
            loadQRCodes();
        } else {
            showError('QR kod kaydedilirken hata oluştu');
        }
    } catch (error) {
        console.error('Error saving QR code:', error);
        showError('QR kod kaydedilirken hata oluştu');
    }
}

function generateQRCode(qrId, content) {
    // Simple QR code generation using a library or service
    // For demo purposes, we'll create a placeholder
    const canvas = document.getElementById(`qr-${qrId}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 168, 168);
    
    // Create a simple pattern (in real implementation, use QR.js or similar)
    ctx.fillStyle = 'black';
    
    // Draw QR-like pattern
    const size = 168;
    const moduleSize = size / 21; // 21x21 modules for QR code
    
    // Draw finder patterns (corners)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, size - 7 * moduleSize, 0, moduleSize);
    drawFinderPattern(ctx, 0, size - 7 * moduleSize, moduleSize);
    
    // Draw some data modules (simplified)
    for (let i = 0; i < 21; i++) {
        for (let j = 0; j < 21; j++) {
            if (shouldDrawModule(i, j, content)) {
                ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
            }
        }
    }
}

function drawFinderPattern(ctx, x, y, moduleSize) {
    // Draw 7x7 finder pattern
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    ctx.fillStyle = 'white';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    ctx.fillStyle = 'black';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
}

function shouldDrawModule(i, j, content) {
    // Simple hash-based pattern generation
    const hash = content.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    return (hash + i * 31 + j * 17) % 3 === 0;
}

function downloadQR(qrId) {
    const canvas = document.getElementById(`qr-${qrId}`);
    if (!canvas) return;
    
    // Create download link
    const link = document.createElement('a');
    link.download = `qr-code-${qrId}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function printQR(qrId) {
    const canvas = document.getElementById(`qr-${qrId}`);
    if (!canvas) return;
    
    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>QR Kod Yazdır</title>
                <style>
                    body { margin: 0; padding: 20px; text-align: center; }
                    img { max-width: 300px; height: auto; }
                </style>
            </head>
            <body>
                <h2>QR Kod</h2>
                <img src="${canvas.toDataURL()}" alt="QR Code">
                <script>window.print(); window.close();</script>
            </body>
        </html>
    `);
}

async function deleteQR(qrId) {
    if (!confirm('Bu QR kodu silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch('../api/qr-codes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                id: qrId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('QR kod silindi');
            loadQRCodes();
        } else {
            showError('QR kod silinirken hata oluştu');
        }
    } catch (error) {
        console.error('Error deleting QR code:', error);
        showError('QR kod silinirken hata oluştu');
    }
}

// Restaurant functions
async function loadRestaurant() {
    try {
        const restaurant = await fetch('../api/restaurant.php').then(r => r.json());

        document.getElementById('contentArea').innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">İşletme Bilgileri</h3>
                <form id="restaurantForm" onsubmit="saveRestaurant(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">İşletme Adı (TR)</label>
                            <input type="text" id="restaurantName" value="${restaurant.name}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">İşletme Adı (EN)</label>
                            <input type="text" id="restaurantNameEn" value="${restaurant.nameEn}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input type="url" id="restaurantLogo" value="${restaurant.logo}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        <div class="mt-2">
                            <img src="${restaurant.logo}" alt="Logo Preview" class="h-16 w-16 rounded-full object-cover">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                            <input type="tel" id="restaurantPhone" value="${restaurant.phone}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">WiFi Şifresi</label>
                            <input type="text" id="restaurantWifi" value="${restaurant.wifiPassword}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Adres (TR)</label>
                            <textarea id="restaurantAddress" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>${restaurant.address}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Adres (EN)</label>
                            <textarea id="restaurantAddressEn" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" required>${restaurant.addressEn}</textarea>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Footer Açıklama (TR)</label>
                            <textarea id="restaurantFooterDescTr" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">${restaurant.footerDescTr || ''}</textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Footer Açıklama (EN)</label>
                            <textarea id="restaurantFooterDescEn" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">${restaurant.footerDescEn || ''}</textarea>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Copyright Metni</label>
                            <input type="text" id="restaurantCopyrightText" value="${restaurant.copyrightText || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Powered By Metni</label>
                            <input type="text" id="restaurantPoweredByText" value="${restaurant.poweredByText || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        </div>
                    </div>

                    <div class="mb-6">
                        <h4 class="text-md font-medium text-gray-900 mb-4">Sosyal Medya</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                                <input type="text" id="restaurantInstagram" value="${restaurant.socialMedia.instagram || ''}" placeholder="@username" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                                <input type="text" id="restaurantFacebook" value="${restaurant.socialMedia.facebook || ''}" placeholder="PageName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                                <input type="text" id="restaurantTwitter" value="${restaurant.socialMedia.twitter || ''}" placeholder="@username" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                            </div>
                        </div>
                    </div>

                    <div class="flex space-x-3">
                        <button type="submit" class="flex items-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                            <i data-lucide="save" class="h-4 w-4"></i>
                            <span>Kaydet</span>
                        </button>
                    </div>
                </form>
            </div>
        `;

        lucide.createIcons();
    } catch (error) {
        console.error('Error loading restaurant:', error);
        showError('İşletme bilgileri yüklenirken hata oluştu');
    }
}

async function saveRestaurant(event) {
    event.preventDefault();
    
    const restaurantData = {
        action: 'update',
        name: document.getElementById('restaurantName').value,
        nameEn: document.getElementById('restaurantNameEn').value,
        logo: document.getElementById('restaurantLogo').value,
        phone: document.getElementById('restaurantPhone').value,
        address: document.getElementById('restaurantAddress').value,
        addressEn: document.getElementById('restaurantAddressEn').value,
        wifiPassword: document.getElementById('restaurantWifi').value,
        footerDescTr: document.getElementById('restaurantFooterDescTr').value,
        footerDescEn: document.getElementById('restaurantFooterDescEn').value,
        copyrightText: document.getElementById('restaurantCopyrightText').value,
        poweredByText: document.getElementById('restaurantPoweredByText').value,
        socialMedia: {
            instagram: document.getElementById('restaurantInstagram').value,
            facebook: document.getElementById('restaurantFacebook').value,
            twitter: document.getElementById('restaurantTwitter').value
        }
    };
    
    try {
        const response = await fetch('../api/restaurant.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(restaurantData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('İşletme bilgileri güncellendi');
        } else {
            showError('İşletme bilgileri güncellenirken hata oluştu');
        }
    } catch (error) {
        console.error('Error saving restaurant:', error);
        showError('İşletme bilgileri kaydedilirken hata oluştu');
    }
}

// Design functions
async function loadDesign() {
    try {
        const settings = await fetch('../api/design-settings.php').then(r => r.json());

        document.getElementById('contentArea').innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-6">Tasarım Ayarları</h3>
                <form id="designForm" onsubmit="saveDesign(event)">
                    <div class="space-y-6">
                        <!-- Category Grid Style -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-3">Kategori Grid Stili</label>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer ${settings.categoryGridStyle === 'modern' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}">
                                    <input type="radio" name="categoryGridStyle" value="modern" ${settings.categoryGridStyle === 'modern' ? 'checked' : ''} class="sr-only">
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900">Modern Görünüm</div>
                                        <div class="text-sm text-gray-500">Gradient arka plan, gölgeler ve animasyonlar</div>
                                    </div>
                                </label>
                                <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer ${settings.categoryGridStyle === 'classic' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}">
                                    <input type="radio" name="categoryGridStyle" value="classic" ${settings.categoryGridStyle === 'classic' ? 'checked' : ''} class="sr-only">
                                    <div class="flex-1">
                                        <div class="font-medium text-gray-900">Klasik Görünüm</div>
                                        <div class="text-sm text-gray-500">Basit ve temiz tasarım</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Category Grid Visibility -->
                        <div>
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" id="showCategoryGrid" ${settings.showCategoryGrid ? 'checked' : ''} class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500">
                                <div>
                                    <div class="font-medium text-gray-900">Kategori Grid'ini Göster</div>
                                    <div class="text-sm text-gray-500">Anasayfada kategori grid'ini göster/gizle</div>
                                </div>
                            </label>
                        </div>

                        <!-- Category Filter Settings -->
                        <div>
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" id="centerCategoryFilter" ${settings.centerCategoryFilter ? 'checked' : ''} class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500">
                                <div>
                                    <div class="font-medium text-gray-900">Kategori Filtrelerini Ortala</div>
                                    <div class="text-sm text-gray-500">Kategori filtrelerini sayfada ortala</div>
                                </div>
                            </label>
                        </div>

                        <div>
                            <label class="flex items-center space-x-3">
                                <input type="checkbox" id="scrollableCategoryFilter" ${settings.scrollableCategoryFilter ? 'checked' : ''} class="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500">
                                <div>
                                    <div class="font-medium text-gray-900">Kategori Filtrelerini Kaydırılabilir Yap</div>
                                    <div class="text-sm text-gray-500">Fazla kategori olduğunda yatay kaydırma ekle</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <button type="submit" class="flex items-center space-x-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors">
                            <i data-lucide="save" class="h-4 w-4"></i>
                            <span>Ayarları Kaydet</span>
                        </button>
                    </div>
                </form>
            </div>
        `;

        lucide.createIcons();
    } catch (error) {
        console.error('Error loading design settings:', error);
        showError('Tasarım ayarları yüklenirken hata oluştu');
    }
}

async function saveDesign(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    const designData = {
        action: 'update',
        categoryGridStyle: formData.get('categoryGridStyle'),
        showCategoryGrid: document.getElementById('showCategoryGrid').checked,
        centerCategoryFilter: document.getElementById('centerCategoryFilter').checked,
        scrollableCategoryFilter: document.getElementById('scrollableCategoryFilter').checked
    };
    
    try {
        const response = await fetch('../api/design-settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(designData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Tasarım ayarları güncellendi');
        } else {
            showError('Tasarım ayarları güncellenirken hata oluştu');
        }
    } catch (error) {
        console.error('Error saving design settings:', error);
        showError('Tasarım ayarları kaydedilirken hata oluştu');
    }
}

// Notifications functions
async function loadNotifications() {
    try {
        const notifications = await fetch('../api/notifications.php').then(r => r.json());
        
        // Update notification badge
        const badge = document.getElementById('notificationBadge');
        if (notifications.length > 0) {
            badge.textContent = notifications.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        if (currentSection === 'notifications') {
            document.getElementById('contentArea').innerHTML = `
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-semibold text-gray-900">Bildirimler</h2>
                    ${notifications.length > 0 ? `
                        <button onclick="clearAllNotifications()" class="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                            <i data-lucide="trash-2" class="h-4 w-4"></i>
                            <span>Tümünü Temizle</span>
                        </button>
                    ` : ''}
                </div>

                ${notifications.length === 0 ? `
                    <div class="text-center py-12">
                        <i data-lucide="bell-off" class="h-12 w-12 text-gray-400 mx-auto mb-4"></i>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Bildirim yok</h3>
                        <p class="text-gray-600">Henüz garson çağrısı bulunmuyor.</p>
                    </div>
                ` : `
                    <div class="space-y-4">
                        ${notifications.map(notification => `
                            <div class="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                            <i data-lucide="bell" class="h-5 w-5 text-orange-600"></i>
                                        </div>
                                        <div>
                                            <h4 class="font-medium text-gray-900">Garson Çağrısı</h4>
                                            <p class="text-sm text-gray-600">${notification.tableName} - ${new Date(notification.timestamp).toLocaleString('tr-TR')}</p>
                                        </div>
                                    </div>
                                    <button onclick="deleteNotification('${notification.id}')" class="text-red-600 hover:text-red-700 p-1">
                                        <i data-lucide="x" class="h-4 w-4"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            `;

            lucide.createIcons();
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
        if (currentSection === 'notifications') {
            showError('Bildirimler yüklenirken hata oluştu');
        }
    }
}

async function deleteNotification(notificationId) {
    try {
        const response = await fetch('../api/notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                id: notificationId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadNotifications();
        } else {
            showError('Bildirim silinirken hata oluştu');
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        showError('Bildirim silinirken hata oluştu');
    }
}

async function clearAllNotifications() {
    if (!confirm('Tüm bildirimleri silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch('../api/notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'clear'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Tüm bildirimler temizlendi');
            loadNotifications();
        } else {
            showError('Bildirimler temizlenirken hata oluştu');
        }
    } catch (error) {
        console.error('Error clearing notifications:', error);
        showError('Bildirimler temizlenirken hata oluştu');
    }
}

// Feedback functions
async function loadFeedback() {
    try {
        const feedback = await fetch('../api/feedback.php').then(r => r.json());

        document.getElementById('contentArea').innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Geri Bildirimler</h2>
                ${feedback.length > 0 ? `
                    <button onclick="clearAllFeedback()" class="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                        <span>Tümünü Temizle</span>
                    </button>
                ` : ''}
            </div>

            ${feedback.length === 0 ? `
                <div class="text-center py-12">
                    <i data-lucide="message-square-off" class="h-12 w-12 text-gray-400 mx-auto mb-4"></i>
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Geri bildirim yok</h3>
                    <p class="text-gray-600">Henüz müşteri geri bildirimi bulunmuyor.</p>
                </div>
            ` : `
                <div class="space-y-4">
                    ${feedback.map(item => `
                        <div class="bg-white rounded-lg shadow-md p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i data-lucide="user" class="h-5 w-5 text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-medium text-gray-900">${item.name}</h4>
                                        <p class="text-sm text-gray-500">${new Date(item.timestamp).toLocaleString('tr-TR')}</p>
                                        ${item.email ? `<p class="text-sm text-gray-500">${item.email}</p>` : ''}
                                    </div>
                                </div>
                                <button onclick="deleteFeedback('${item.id}')" class="text-red-600 hover:text-red-700 p-1">
                                    <i data-lucide="x" class="h-4 w-4"></i>
                                </button>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-4">
                                <p class="text-gray-700">${item.message}</p>
                            </div>
                            ${item.userAgent || item.screen ? `
                                <div class="mt-4 pt-4 border-t border-gray-200">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                                        ${item.screen ? `<div>Ekran: ${item.screen}</div>` : ''}
                                        ${item.viewport ? `<div>Görünüm: ${item.viewport}</div>` : ''}
                                        ${item.language ? `<div>Dil: ${item.language}</div>` : ''}
                                        ${item.userAgent ? `<div class="col-span-full">Tarayıcı: ${item.userAgent}</div>` : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `}
        `;

        lucide.createIcons();
    } catch (error) {
        console.error('Error loading feedback:', error);
        showError('Geri bildirimler yüklenirken hata oluştu');
    }
}

async function deleteFeedback(feedbackId) {
    try {
        const response = await fetch('../api/feedback.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'delete',
                id: feedbackId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            loadFeedback();
        } else {
            showError('Geri bildirim silinirken hata oluştu');
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
        showError('Geri bildirim silinirken hata oluştu');
    }
}

async function clearAllFeedback() {
    if (!confirm('Tüm geri bildirimleri silmek istediğinizden emin misiniz?')) {
        return;
    }
    
    try {
        const response = await fetch('../api/feedback.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'clear'
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showSuccess('Tüm geri bildirimler temizlendi');
            loadFeedback();
        } else {
            showError('Geri bildirimler temizlenirken hata oluştu');
        }
    } catch (error) {
        console.error('Error clearing feedback:', error);
        showError('Geri bildirimler temizlenirken hata oluştu');
    }
}

// Utility functions
function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// License protection functions
function logout() {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
        localStorage.removeItem('qr_menu_license');
        location.reload();
    }
}