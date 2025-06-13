// Global variables
let currentTab = 'stats';
let isEditing = false;
let editingId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    checkAdminAuth();
    
    // Check for new notifications periodically
    setInterval(checkNotifications, 5000);
});

// Authentication
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('adminLogin').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

function showDashboard() {
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    loadDashboardData();
}

function adminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminLoggedIn', 'true');
        showDashboard();
    } else {
        document.getElementById('loginError').textContent = 'Geçersiz kullanıcı adı veya şifre';
        document.getElementById('loginError').classList.remove('hidden');
    }
}

function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    showLogin();
}

// Tab management
function showTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-yellow-500', 'text-yellow-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    event.target.closest('.tab-btn').classList.add('border-yellow-500', 'text-yellow-600');
    event.target.closest('.tab-btn').classList.remove('border-transparent', 'text-gray-500');
    
    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    document.getElementById(tabName + 'Tab').classList.remove('hidden');
    
    // Load tab-specific data
    loadTabData(tabName);
}

// Load dashboard data
async function loadDashboardData() {
    loadTabData(currentTab);
}

async function loadTabData(tabName) {
    switch(tabName) {
        case 'stats':
            await loadStats();
            break;
        case 'products':
            await loadProductsTab();
            break;
        case 'categories':
            await loadCategoriesTab();
            break;
        case 'tables':
            await loadTablesTab();
            break;
        case 'qr':
            await loadQRTab();
            break;
        case 'restaurant':
            await loadRestaurantTab();
            break;
        case 'feedback':
            await loadFeedbackTab();
            break;
        case 'notifications':
            await loadNotificationsTab();
            break;
    }
}

// Stats tab
async function loadStats() {
    try {
        const products = await fetch('../api/products.php').then(r => r.json());
        
        const totalProducts = products.length;
        const totalViews = products.reduce((sum, product) => sum + product.views, 0);
        const totalLikes = products.reduce((sum, product) => sum + product.likes, 0);
        const totalDislikes = products.reduce((sum, product) => sum + product.dislikes, 0);
        const averageRating = totalLikes + totalDislikes > 0 ? (totalLikes / (totalLikes + totalDislikes)) * 100 : 0;
        
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalViews').textContent = totalViews;
        document.getElementById('totalLikes').textContent = totalLikes;
        document.getElementById('averageRating').textContent = averageRating.toFixed(1) + '%';
        
        // Popular products
        const popularProducts = products
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);
        
        const container = document.getElementById('popularProducts');
        container.innerHTML = popularProducts.map((product, index) => {
            const likeRatio = product.likes + product.dislikes > 0 ? 
                (product.likes / (product.likes + product.dislikes)) * 100 : 0;
            
            return `
                <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                        ${index + 1}
                    </div>
                    <img src="${product.image}" alt="${product.name}" class="w-12 h-12 rounded-lg object-cover">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900">${product.name}</h4>
                        <p class="text-sm text-gray-500">₺${product.price}</p>
                    </div>
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                        <div class="flex items-center space-x-1">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                            <span>${product.views}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                            <i data-lucide="star" class="h-4 w-4 text-yellow-500 fill-current"></i>
                            <span>${likeRatio.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Products tab
async function loadProductsTab() {
    try {
        const [products, categories] = await Promise.all([
            fetch('../api/products.php').then(r => r.json()),
            fetch('../api/categories.php').then(r => r.json())
        ]);
        
        // Load categories in select
        const categorySelect = document.getElementById('productCategory');
        categorySelect.innerHTML = categories.map(cat => 
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
        
        // Load products table
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = products.map(product => {
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
                        ${category ? category.name : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺${product.price}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div class="space-y-1">
                            <div>${product.views} görüntülenme</div>
                            <div>${product.likes} beğeni</div>
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
                            <button onclick="toggleProductStatus('${product.id}')" class="p-1 rounded ${
                                product.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }">
                                <i data-lucide="${product.isActive ? 'eye-off' : 'eye'}" class="h-4 w-4"></i>
                            </button>
                            <button onclick="editProduct('${product.id}')" class="text-yellow-600 hover:text-yellow-900 p-1 rounded">
                                <i data-lucide="edit" class="h-4 w-4"></i>
                            </button>
                            <button onclick="deleteProduct('${product.id}')" class="text-red-600 hover:text-red-900 p-1 rounded">
                                <i data-lucide="trash-2" class="h-4 w-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Product management functions
function showProductForm() {
    document.getElementById('productForm').classList.remove('hidden');
    document.getElementById('productFormTitle').textContent = 'Yeni Ürün Ekle';
    document.getElementById('productFormElement').reset();
    document.getElementById('productId').value = '';
    isEditing = false;
}

function hideProductForm() {
    document.getElementById('productForm').classList.add('hidden');
    isEditing = false;
    editingId = null;
}

async function editProduct(productId) {
    try {
        const products = await fetch('../api/products.php').then(r => r.json());
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productNameEn').value = product.nameEn;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productDescriptionEn').value = product.descriptionEn;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image;
        document.getElementById('productActive').checked = product.isActive;
        
        document.getElementById('productFormTitle').textContent = 'Ürünü Düzenle';
        document.getElementById('productForm').classList.remove('hidden');
        isEditing = true;
        editingId = productId;
        
    } catch (error) {
        console.error('Error editing product:', error);
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const formData = {
        id: document.getElementById('productId').value,
        name: document.getElementById('productName').value,
        nameEn: document.getElementById('productNameEn').value,
        description: document.getElementById('productDescription').value,
        descriptionEn: document.getElementById('productDescriptionEn').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        isActive: document.getElementById('productActive').checked
    };
    
    try {
        const action = isEditing ? 'update' : 'add';
        await fetch('../api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...formData })
        });
        
        hideProductForm();
        loadProductsTab();
        showToast('Ürün başarıyla kaydedildi', 'success');
        
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Ürün kaydedilirken hata oluştu', 'error');
    }
}

async function toggleProductStatus(productId) {
    try {
        const products = await fetch('../api/products.php').then(r => r.json());
        const product = products.find(p => p.id === productId);
        
        await fetch('../api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'update', 
                id: productId, 
                isActive: !product.isActive 
            })
        });
        
        loadProductsTab();
        
    } catch (error) {
        console.error('Error toggling product status:', error);
    }
}

async function deleteProduct(productId) {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return;
    
    try {
        await fetch('../api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: productId })
        });
        
        loadProductsTab();
        showToast('Ürün başarıyla silindi', 'success');
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Ürün silinirken hata oluştu', 'error');
    }
}

// Categories tab
async function loadCategoriesTab() {
    try {
        const categories = await fetch('../api/categories.php').then(r => r.json());
        
        const container = document.getElementById('categoriesGrid');
        container.innerHTML = categories.map(category => `
            <div class="bg-white rounded-lg shadow-md p-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <i data-lucide="${category.icon}" class="h-5 w-5 text-gray-400"></i>
                        <h3 class="font-medium text-gray-900">${category.name}</h3>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">
                        ${category.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                </div>
                
                <div class="text-sm text-gray-500 mb-3">
                    <div>EN: ${category.nameEn}</div>
                    <div>Sıra: ${category.order}</div>
                    ${category.showOnHome ? '<div class="text-green-600">Anasayfada gösteriliyor</div>' : ''}
                </div>

                ${category.image ? `
                    <img src="${category.image}" alt="${category.name}" class="w-full h-24 object-cover rounded-md mb-3">
                ` : ''}

                <div class="flex space-x-2">
                    <button onclick="toggleCategoryStatus('${category.id}')" class="p-1 rounded ${
                        category.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }" title="${category.isActive ? 'Pasif yap' : 'Aktif yap'}">
                        <i data-lucide="${category.isActive ? 'eye-off' : 'eye'}" class="h-4 w-4"></i>
                    </button>
                    <button onclick="editCategory('${category.id}')" class="text-yellow-600 hover:text-yellow-900 p-1 rounded" title="Düzenle">
                        <i data-lucide="edit" class="h-4 w-4"></i>
                    </button>
                    <button onclick="deleteCategory('${category.id}')" class="text-red-600 hover:text-red-900 p-1 rounded" title="Sil">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Category management functions
function showCategoryForm() {
    document.getElementById('categoryForm').classList.remove('hidden');
    document.getElementById('categoryFormTitle').textContent = 'Yeni Kategori Ekle';
    document.getElementById('categoryFormElement').reset();
    document.getElementById('categoryId').value = '';
    isEditing = false;
}

function hideCategoryForm() {
    document.getElementById('categoryForm').classList.add('hidden');
    isEditing = false;
    editingId = null;
}

async function editCategory(categoryId) {
    try {
        const categories = await fetch('../api/categories.php').then(r => r.json());
        const category = categories.find(c => c.id === categoryId);
        
        if (!category) return;
        
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryNameEn').value = category.nameEn;
        document.getElementById('categoryIcon').value = category.icon;
        document.getElementById('categoryOrder').value = category.order;
        document.getElementById('categoryImage').value = category.image || '';
        document.getElementById('categoryActive').checked = category.isActive;
        document.getElementById('categoryShowOnHome').checked = category.showOnHome || false;
        
        document.getElementById('categoryFormTitle').textContent = 'Kategoriyi Düzenle';
        document.getElementById('categoryForm').classList.remove('hidden');
        isEditing = true;
        editingId = categoryId;
        
    } catch (error) {
        console.error('Error editing category:', error);
    }
}

async function saveCategory(event) {
    event.preventDefault();
    
    const formData = {
        id: document.getElementById('categoryId').value,
        name: document.getElementById('categoryName').value,
        nameEn: document.getElementById('categoryNameEn').value,
        icon: document.getElementById('categoryIcon').value,
        order: parseInt(document.getElementById('categoryOrder').value),
        image: document.getElementById('categoryImage').value,
        isActive: document.getElementById('categoryActive').checked,
        showOnHome: document.getElementById('categoryShowOnHome').checked
    };
    
    try {
        const action = isEditing ? 'update' : 'add';
        await fetch('../api/categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...formData })
        });
        
        hideCategoryForm();
        loadCategoriesTab();
        showToast('Kategori başarıyla kaydedildi', 'success');
        
    } catch (error) {
        console.error('Error saving category:', error);
        showToast('Kategori kaydedilirken hata oluştu', 'error');
    }
}

async function toggleCategoryStatus(categoryId) {
    try {
        const categories = await fetch('../api/categories.php').then(r => r.json());
        const category = categories.find(c => c.id === categoryId);
        
        await fetch('../api/categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'update', 
                id: categoryId, 
                isActive: !category.isActive 
            })
        });
        
        loadCategoriesTab();
        
    } catch (error) {
        console.error('Error toggling category status:', error);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki tüm ürünler de silinecek.')) return;
    
    try {
        await fetch('../api/categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: categoryId })
        });
        
        loadCategoriesTab();
        showToast('Kategori başarıyla silindi', 'success');
        
    } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Kategori silinirken hata oluştu', 'error');
    }
}

// Tables tab
async function loadTablesTab() {
    try {
        const tables = await fetch('../api/tables.php').then(r => r.json());
        
        const container = document.getElementById('tablesGrid');
        container.innerHTML = tables.map(table => `
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
                
                <div class="text-sm text-gray-500 mb-3">
                    ${table.nameEn}
                </div>

                <div class="flex space-x-2">
                    <button onclick="toggleTableStatus('${table.id}')" class="p-1 rounded ${
                        table.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }" title="${table.isActive ? 'Pasif yap' : 'Aktif yap'}">
                        <i data-lucide="${table.isActive ? 'eye-off' : 'eye'}" class="h-4 w-4"></i>
                    </button>
                    <button onclick="editTable('${table.id}')" class="text-yellow-600 hover:text-yellow-900 p-1 rounded" title="Düzenle">
                        <i data-lucide="edit" class="h-4 w-4"></i>
                    </button>
                    <button onclick="deleteTable('${table.id}')" class="text-red-600 hover:text-red-900 p-1 rounded" title="Sil">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading tables:', error);
    }
}

// Table management functions
function showTableForm() {
    document.getElementById('tableForm').classList.remove('hidden');
    document.getElementById('tableFormTitle').textContent = 'Yeni Masa Ekle';
    document.getElementById('tableFormElement').reset();
    document.getElementById('tableId').value = '';
    isEditing = false;
}

function hideTableForm() {
    document.getElementById('tableForm').classList.add('hidden');
    isEditing = false;
    editingId = null;
}

async function editTable(tableId) {
    try {
        const tables = await fetch('../api/tables.php').then(r => r.json());
        const table = tables.find(t => t.id === tableId);
        
        if (!table) return;
        
        document.getElementById('tableId').value = table.id;
        document.getElementById('tableName').value = table.name;
        document.getElementById('tableNameEn').value = table.nameEn;
        document.getElementById('tableActive').checked = table.isActive;
        
        document.getElementById('tableFormTitle').textContent = 'Masayı Düzenle';
        document.getElementById('tableForm').classList.remove('hidden');
        isEditing = true;
        editingId = tableId;
        
    } catch (error) {
        console.error('Error editing table:', error);
    }
}

async function saveTable(event) {
    event.preventDefault();
    
    const formData = {
        id: document.getElementById('tableId').value,
        name: document.getElementById('tableName').value,
        nameEn: document.getElementById('tableNameEn').value,
        isActive: document.getElementById('tableActive').checked
    };
    
    try {
        const action = isEditing ? 'update' : 'add';
        await fetch('../api/tables.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...formData })
        });
        
        hideTableForm();
        loadTablesTab();
        showToast('Masa başarıyla kaydedildi', 'success');
        
    } catch (error) {
        console.error('Error saving table:', error);
        showToast('Masa kaydedilirken hata oluştu', 'error');
    }
}

async function toggleTableStatus(tableId) {
    try {
        const tables = await fetch('../api/tables.php').then(r => r.json());
        const table = tables.find(t => t.id === tableId);
        
        await fetch('../api/tables.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'update', 
                id: tableId, 
                isActive: !table.isActive 
            })
        });
        
        loadTablesTab();
        
    } catch (error) {
        console.error('Error toggling table status:', error);
    }
}

async function deleteTable(tableId) {
    if (!confirm('Bu masayı silmek istediğinizden emin misiniz?')) return;
    
    try {
        await fetch('../api/tables.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: tableId })
        });
        
        loadTablesTab();
        showToast('Masa başarıyla silindi', 'success');
        
    } catch (error) {
        console.error('Error deleting table:', error);
        showToast('Masa silinirken hata oluştu', 'error');
    }
}

// QR Codes tab
async function loadQRTab() {
    try {
        const [qrCodes, tables] = await Promise.all([
            fetch('../api/qr-codes.php').then(r => r.json()),
            fetch('../api/tables.php').then(r => r.json())
        ]);
        
        // Load tables in select
        const tableSelect = document.getElementByI('qrTable');
        tableSelect.innerHTML = tables.filter(t => t.isActive).map(table => 
            `<option value="${table.id}">${table.name}</option>`
        ).join('');
        
        // Load QR codes grid
        const container = document.getElementById('qrCodesGrid');
        container.innerHTML = qrCodes.map(qr => {
            const table = tables.find(t => t.id === qr.tableId);
            return `
                <div class="bg-white rounded-lg shadow-md p-4">
                    <div class="text-center mb-4">
                        <div class="qr-code-container mx-auto mb-3" style="width: 150px;">
                            <canvas id="qr-${qr.id}"></canvas>
                        </div>
                        <h3 class="font-medium text-gray-900">${qr.name}</h3>
                        <p class="text-sm text-gray-500">${table ? table.name : 'Masa bulunamadı'}</p>
                    </div>
                    
                    <div class="text-xs text-gray-500 mb-3 break-all">
                        ${qr.content}
                    </div>

                    <div class="flex space-x-2">
                        <button onclick="downloadQR('${qr.id}')" class="flex-1 text-blue-600 hover:text-blue-900 p-1 rounded text-sm" title="İndir">
                            <i data-lucide="download" class="h-4 w-4 mx-auto"></i>
                        </button>
                        <button onclick="printQR('${qr.id}')" class="flex-1 text-green-600 hover:text-green-900 p-1 rounded text-sm" title="Yazdır">
                            <i data-lucide="printer" class="h-4 w-4 mx-auto"></i>
                        </button>
                        <button onclick="deleteQR('${qr.id}')" class="flex-1 text-red-600 hover:text-red-900 p-1 rounded text-sm" title="Sil">
                            <i data-lucide="trash-2" class="h-4 w-4 mx-auto"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Generate QR codes
        qrCodes.forEach(qr => {
            QRCode.toCanvas(document.getElementById(`qr-${qr.id}`), qr.content, {
                width: 150,
                margin: 2
            });
        });
        
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading QR codes:', error);
    }
}

// QR Code management functions
function showQRForm() {
    document.getElementById('qrForm').classList.remove('hidden');
    document.getElementById('qrFormTitle').textContent = 'Yeni QR Kod Oluştur';
    document.getElementById('qrFormElement').reset();
    document.getElementById('qrId').value = '';
    isEditing = false;
}

function hideQRForm() {
    document.getElementById('qrForm').classList.add('hidden');
    isEditing = false;
    editingId = null;
}

async function saveQRCode(event) {
    event.preventDefault();
    
    const formData = {
        id: document.getElementById('qrId').value,
        name: document.getElementById('qrName').value,
        tableId: document.getElementById('qrTable').value,
        content: document.getElementById('qrContent').value
    };
    
    try {
        const action = isEditing ? 'update' : 'add';
        await fetch('../api/qr-codes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...formData })
        });
        
        hideQRForm();
        loadQRTab();
        showToast('QR kod başarıyla oluşturuldu', 'success');
        
    } catch (error) {
        console.error('Error saving QR code:', error);
        showToast('QR kod oluşturulurken hata oluştu', 'error');
    }
}

function downloadQR(qrId) {
    const canvas = document.getElementById(`qr-${qrId}`);
    const link = document.createElement('a');
    link.download = `qr-code-${qrId}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function printQR(qrId) {
    const canvas = document.getElementById(`qr-${qrId}`);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head><title>QR Kod Yazdır</title></head>
            <body style="text-align: center; padding: 20px;">
                <img src="${canvas.toDataURL()}" style="max-width: 300px;">
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

async function deleteQR(qrId) {
    if (!confirm('Bu QR kodu silmek istediğinizden emin misiniz?')) return;
    
    try {
        await fetch('../api/qr-codes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: qrId })
        });
        
        loadQRTab();
        showToast('QR kod başarıyla silindi', 'success');
        
    } catch (error) {
        console.error('Error deleting QR code:', error);
        showToast('QR kod silinirken hata oluştu', 'error');
    }
}

// Restaurant tab
async function loadRestaurantTab() {
    try {
        const restaurant = await fetch('../api/restaurant.php').then(r => r.json());
        
        document.getElementById('restaurantName').value = restaurant.name;
        document.getElementById('restaurantNameEn').value = restaurant.nameEn;
        document.getElementById('restaurantLogo').value = restaurant.logo;
        document.getElementById('restaurantPhone').value = restaurant.phone;
        document.getElementById('restaurantAddress').value = restaurant.address;
        document.getElementById('restaurantAddressEn').value = restaurant.addressEn;
        document.getElementById('restaurantWifi').value = restaurant.wifiPassword;
        document.getElementById('restaurantInstagram').value = restaurant.socialMedia.instagram || '';
        document.getElementById('restaurantFacebook').value = restaurant.socialMedia.facebook || '';
        document.getElementById('restaurantTwitter').value = restaurant.socialMedia.twitter || '';
        
        document.getElementById('logoPreview').src = restaurant.logo;
        
    } catch (error) {
        console.error('Error loading restaurant data:', error);
    }
}

function toggleRestaurantEdit() {
    const inputs = document.querySelectorAll('#restaurantForm input, #restaurantForm textarea');
    const isDisabled = inputs[0].disabled;
    
    inputs.forEach(input => {
        input.disabled = !isDisabled;
    });
    
    document.getElementById('editRestaurantBtn').textContent = isDisabled ? 'İptal' : 'Düzenle';
    document.getElementById('restaurantFormButtons').classList.toggle('hidden', !isDisabled);
}

function cancelRestaurantEdit() {
    toggleRestaurantEdit();
    loadRestaurantTab(); // Reload original data
}

async function saveRestaurant(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('restaurantName').value,
        nameEn: document.getElementById('restaurantNameEn').value,
        logo: document.getElementById('restaurantLogo').value,
        phone: document.getElementById('restaurantPhone').value,
        address: document.getElementById('restaurantAddress').value,
        addressEn: document.getElementById('restaurantAddressEn').value,
        wifiPassword: document.getElementById('restaurantWifi').value,
        socialMedia: {
            instagram: document.getElementById('restaurantInstagram').value,
            facebook: document.getElementById('restaurantFacebook').value,
            twitter: document.getElementById('restaurantTwitter').value
        }
    };
    
    try {
        await fetch('../api/restaurant.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', ...formData })
        });
        
        toggleRestaurantEdit();
        showToast('İşletme bilgileri başarıyla güncellendi', 'success');
        
    } catch (error) {
        console.error('Error saving restaurant data:', error);
        showToast('İşletme bilgileri güncellenirken hata oluştu', 'error');
    }
}

// Feedback tab
async function loadFeedbackTab() {
    try {
        const feedback = await fetch('../api/feedback.php').then(r => r.json());
        
        const container = document.getElementById('feedbackList');
        const noFeedback = document.getElementById('noFeedback');
        
        if (feedback.length === 0) {
            container.innerHTML = '';
            noFeedback.classList.remove('hidden');
            return;
        }
        
        noFeedback.classList.add('hidden');
        
        container.innerHTML = feedback.map(item => `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="font-medium text-gray-900">${item.name}</h3>
                        ${item.email ? `<p class="text-sm text-gray-500">${item.email}</p>` : ''}
                        <p class="text-xs text-gray-400">${new Date(item.timestamp).toLocaleString('tr-TR')}</p>
                    </div>
                    <button onclick="deleteFeedback('${item.id}')" class="text-red-600 hover:text-red-900">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
                
                <p class="text-gray-700 mb-4">${item.message}</p>
                
                <div class="text-xs text-gray-500 space-y-1">
                    <div>Tarayıcı: ${item.userAgent}</div>
                    <div>Dil: ${item.language}</div>
                    <div>Ekran: ${item.screen}</div>
                    <div>Görünüm: ${item.viewport}</div>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

async function deleteFeedback(feedbackId) {
    if (!confirm('Bu geri bildirimi silmek istediğinizden emin misiniz?')) return;
    
    try {
        await fetch('../api/feedback.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: feedbackId })
        });
        
        loadFeedbackTab();
        showToast('Geri bildirim silindi', 'success');
        
    } catch (error) {
        console.error('Error deleting feedback:', error);
        showToast('Geri bildirim silinirken hata oluştu', 'error');
    }
}

async function clearAllFeedback() {
    if (!confirm('Tüm geri bildirimleri silmek istediğinizden emin misiniz?')) return;
    
    try {
        await fetch('../api/feedback.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear' })
        });
        
        loadFeedbackTab();
        showToast('Tüm geri bildirimler silindi', 'success');
        
    } catch (error) {
        console.error('Error clearing feedback:', error);
        showToast('Geri bildirimler silinirken hata oluştu', 'error');
    }
}

// Notifications tab
async function loadNotificationsTab() {
    try {
        const notifications = await fetch('../api/notifications.php').then(r => r.json());
        
        const container = document.getElementById('notificationsList');
        const noNotifications = document.getElementById('noNotifications');
        
        if (notifications.length === 0) {
            container.innerHTML = '';
            noNotifications.classList.remove('hidden');
            return;
        }
        
        noNotifications.classList.add('hidden');
        
        container.innerHTML = notifications.map(notification => `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="bg-yellow-100 p-2 rounded-full">
                            <i data-lucide="bell" class="h-5 w-5 text-yellow-600"></i>
                        </div>
                        <div>
                            <h3 class="font-medium text-gray-900">Garson Çağrısı</h3>
                            <p class="text-sm text-gray-500">${notification.tableName}</p>
                            <p class="text-xs text-gray-400">${new Date(notification.timestamp).toLocaleString('tr-TR')}</p>
                        </div>
                    </div>
                    <button onclick="deleteNotification('${notification.id}')" class="text-red-600 hover:text-red-900">
                        <i data-lucide="trash-2" class="h-4 w-4"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

async function deleteNotification(notificationId) {
    try {
        await fetch('../api/notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: notificationId })
        });
        
        loadNotificationsTab();
        updateNotificationBadge();
        
    } catch (error) {
        console.error('Error deleting notification:', error);
    }
}

async function clearAllNotifications() {
    if (!confirm('Tüm bildirimleri silmek istediğinizden emin misiniz?')) return;
    
    try {
        await fetch('../api/notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'clear' })
        });
        
        loadNotificationsTab();
        updateNotificationBadge();
        showToast('Tüm bildirimler silindi', 'success');
        
    } catch (error) {
        console.error('Error clearing notifications:', error);
        showToast('Bildirimler silinirken hata oluştu', 'error');
    }
}

// Check for new notifications
async function checkNotifications() {
    try {
        const notifications = await fetch('../api/notifications.php').then(r => r.json());
        const lastCheck = localStorage.getItem('lastNotificationCheck');
        const currentTime = new Date().getTime();
        
        if (lastCheck) {
            const newNotifications = notifications.filter(n => 
                new Date(n.timestamp).getTime() > parseInt(lastCheck)
            );
            
            if (newNotifications.length > 0) {
                // Play notification sound
                const audio = document.getElementById('notificationSound');
                audio.play().catch(e => console.log('Could not play notification sound'));
                
                // Show toast for new notifications
                newNotifications.forEach(notification => {
                    showToast(`Yeni garson çağrısı: ${notification.tableName}`, 'warning');
                });
            }
        }
        
        localStorage.setItem('lastNotificationCheck', currentTime.toString());
        updateNotificationBadge();
        
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

async function updateNotificationBadge() {
    try {
        const notifications = await fetch('../api/notifications.php').then(r => r.json());
        const badge = document.getElementById('notificationBadge');
        
        if (notifications.length > 0) {
            badge.textContent = notifications.length;
            badge.classList.remove('hidden');
            badge.classList.add('notification-badge');
        } else {
            badge.classList.add('hidden');
            badge.classList.remove('notification-badge');
        }
        
    } catch (error) {
        console.error('Error updating notification badge:', error);
    }
}

// Utility functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}