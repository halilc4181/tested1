// Global variables
let currentLanguage = localStorage.getItem('language') || 'tr';
let selectedCategory = '';
let selectedTable = '';
let userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
let allProducts = [];
let allCategories = [];

// Design settings - Load from server settings for global application
let designSettings = {
    categoryGridStyle: 'modern',
    showCategoryGrid: true,
    centerCategoryFilter: true,
    scrollableCategoryFilter: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    loadDesignSettings();
    loadData();
    setupEventListeners();
    updateLanguage();
});

// Load design settings from server (global settings)
async function loadDesignSettings() {
    try {
        const serverSettings = await fetch('api/design-settings.php').then(r => r.json());
        designSettings = { ...designSettings, ...serverSettings };
        applyDesignSettings();
    } catch (error) {
        console.error('Error loading design settings:', error);
        // Use default settings if server settings fail
        applyDesignSettings();
    }
}

function applyDesignSettings() {
    // Apply category grid visibility
    const categoryGrid = document.getElementById('categoryGrid');
    if (categoryGrid) {
        categoryGrid.style.display = designSettings.showCategoryGrid ? 'block' : 'none';
    }
    
    // Apply category filter centering and scrolling
    const categoryFilterSection = document.getElementById('categoryFilterSection');
    if (categoryFilterSection) {
        const container = categoryFilterSection.querySelector('.max-w-7xl > div');
        if (container) {
            if (designSettings.centerCategoryFilter) {
                container.classList.add('justify-center');
                container.classList.remove('justify-start');
            } else {
                container.classList.remove('justify-center');
                container.classList.add('justify-start');
            }
            
            const filterContainer = container.querySelector('#categoryFilter');
            if (filterContainer) {
                if (designSettings.scrollableCategoryFilter) {
                    filterContainer.classList.add('overflow-x-auto', 'scrollbar-hide');
                    filterContainer.style.maxWidth = '100%';
                } else {
                    filterContainer.classList.remove('overflow-x-auto', 'scrollbar-hide');
                    filterContainer.style.maxWidth = 'none';
                }
            }
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle
    document.getElementById('toggleSidebar').addEventListener('click', openSidebar);
    document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', showSearchResults);
        searchInput.addEventListener('blur', hideSearchResultsDelayed);
    }
    
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', handleMobileSearch);
        mobileSearchInput.addEventListener('focus', showMobileSearchResults);
        mobileSearchInput.addEventListener('blur', hideMobileSearchResultsDelayed);
    }
    
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', toggleMobileSearch);
    }
    
    // Close modals when clicking overlay
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
            closeAllModals();
        }
    });
    
    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        const searchContainer = document.getElementById('searchInput')?.parentElement;
        const mobileSearchContainer = document.getElementById('mobileSearchInput')?.parentElement;
        
        if (searchContainer && !searchContainer.contains(e.target)) {
            hideSearchResults();
        }
        
        if (mobileSearchContainer && !mobileSearchContainer.contains(e.target)) {
            hideMobileSearchResults();
        }
    });
}

// Search functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');
    
    if (query.length < 2) {
        hideSearchResults();
        return;
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.isActive && (
            product.name.toLowerCase().includes(query) ||
            product.nameEn.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.descriptionEn.toLowerCase().includes(query)
        )
    );
    
    displaySearchResults(filteredProducts, resultsContainer);
    showSearchResults();
}

function handleMobileSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('mobileSearchResults');
    
    if (query.length < 2) {
        hideMobileSearchResults();
        return;
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.isActive && (
            product.name.toLowerCase().includes(query) ||
            product.nameEn.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.descriptionEn.toLowerCase().includes(query)
        )
    );
    
    displaySearchResults(filteredProducts, resultsContainer);
    showMobileSearchResults();
}

function displaySearchResults(products, container) {
    if (products.length === 0) {
        container.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <i data-lucide="search-x" class="h-8 w-8 mx-auto mb-2 text-gray-400"></i>
                <p>Ürün bulunamadı</p>
            </div>
        `;
    } else {
        container.innerHTML = products.slice(0, 5).map(product => {
            const category = allCategories.find(c => c.id === product.category);
            return `
                <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" onclick="selectSearchResult('${product.id}')">
                    <div class="flex items-center space-x-3">
                        <img src="${product.image}" alt="${currentLanguage === 'tr' ? product.name : product.nameEn}" class="w-12 h-12 rounded-lg object-cover">
                        <div class="flex-1 min-w-0">
                            <h4 class="font-medium text-gray-900 truncate">
                                ${currentLanguage === 'tr' ? product.name : product.nameEn}
                            </h4>
                            <p class="text-sm text-gray-500 truncate">
                                ${category ? (currentLanguage === 'tr' ? category.name : category.nameEn) : ''}
                            </p>
                            <p class="text-sm font-semibold text-yellow-600">₺${product.price}</p>
                        </div>
                        <div class="flex items-center space-x-1 text-xs text-gray-500">
                            <i data-lucide="eye" class="h-3 w-3"></i>
                            <span>${product.views}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        if (products.length > 5) {
            container.innerHTML += `
                <div class="p-3 text-center text-sm text-gray-500 bg-gray-50">
                    +${products.length - 5} daha fazla sonuç
                </div>
            `;
        }
    }
    
    lucide.createIcons();
}

function selectSearchResult(productId) {
    hideSearchResults();
    hideMobileSearchResults();
    clearSearchInputs();
    openProductModal(productId);
}

function clearSearchInputs() {
    const searchInput = document.getElementById('searchInput');
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    
    if (searchInput) searchInput.value = '';
    if (mobileSearchInput) mobileSearchInput.value = '';
}

function showSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) container.classList.remove('hidden');
}

function hideSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) container.classList.add('hidden');
}

function hideSearchResultsDelayed() {
    setTimeout(hideSearchResults, 150);
}

function showMobileSearchResults() {
    const container = document.getElementById('mobileSearchResults');
    if (container) container.classList.remove('hidden');
}

function hideMobileSearchResults() {
    const container = document.getElementById('mobileSearchResults');
    if (container) container.classList.add('hidden');
}

function hideMobileSearchResultsDelayed() {
    setTimeout(hideMobileSearchResults, 150);
}

function toggleMobileSearch() {
    const mobileSearchBar = document.getElementById('mobileSearchBar');
    const isHidden = mobileSearchBar.classList.contains('hidden');
    
    if (isHidden) {
        mobileSearchBar.classList.remove('hidden');
        document.getElementById('mobileSearchInput').focus();
    } else {
        mobileSearchBar.classList.add('hidden');
        hideMobileSearchResults();
        clearSearchInputs();
    }
}

// Data loading functions
async function loadData() {
    try {
        const [restaurant, categories, products, tables] = await Promise.all([
            fetch('api/restaurant.php').then(r => r.json()),
            fetch('api/categories.php').then(r => r.json()),
            fetch('api/products.php').then(r => r.json()),
            fetch('api/tables.php').then(r => r.json())
        ]);
        
        allCategories = categories;
        allProducts = products;
        
        updateRestaurantInfo(restaurant);
        loadCategories(categories);
        loadProducts(products);
        loadTables(tables);
        loadCategoryGrid(categories);
        updateFooterInfo(restaurant);
    } catch (error) {
        console.error('Error loading data:', error);
        showToast('Veri yüklenirken hata oluştu', 'error');
    }
}

// Update restaurant information
function updateRestaurantInfo(restaurant) {
    const elements = {
        'restaurantLogo': restaurant.logo,
        'sidebarLogo': restaurant.logo,
        'restaurantName': currentLanguage === 'tr' ? restaurant.name : restaurant.nameEn,
        'sidebarName': currentLanguage === 'tr' ? restaurant.name : restaurant.nameEn,
        'restaurantPhone': restaurant.phone,
        'restaurantAddress': currentLanguage === 'tr' ? restaurant.address : restaurant.addressEn,
        'wifiPassword': restaurant.wifiPassword,
        'wifiModalPassword': restaurant.wifiPassword
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'IMG') {
                element.src = value;
                element.alt = restaurant.name;
            } else {
                element.textContent = value;
            }
        }
    });
    
    // Update social media
    const socialMediaContainer = document.getElementById('socialMedia');
    socialMediaContainer.innerHTML = '';
    
    if (restaurant.socialMedia.instagram) {
        socialMediaContainer.innerHTML += `
            <div class="flex items-center space-x-3">
                <i data-lucide="instagram" class="h-5 w-5 text-pink-500"></i>
                <span class="text-sm text-gray-700">${restaurant.socialMedia.instagram}</span>
            </div>
        `;
    }
    
    if (restaurant.socialMedia.facebook) {
        socialMediaContainer.innerHTML += `
            <div class="flex items-center space-x-3">
                <i data-lucide="facebook" class="h-5 w-5 text-blue-500"></i>
                <span class="text-sm text-gray-700">${restaurant.socialMedia.facebook}</span>
            </div>
        `;
    }
    
    if (restaurant.socialMedia.twitter) {
        socialMediaContainer.innerHTML += `
            <div class="flex items-center space-x-3">
                <i data-lucide="twitter" class="h-5 w-5 text-blue-400"></i>
                <span class="text-sm text-gray-700">${restaurant.socialMedia.twitter}</span>
            </div>
        `;
    }
    
    lucide.createIcons();
}

// Update footer information
function updateFooterInfo(restaurant) {
    const footerElements = {
        'footerLogo': restaurant.logo,
        'footerRestaurantName': currentLanguage === 'tr' ? restaurant.name : restaurant.nameEn,
        'footerPhone': restaurant.phone,
        'footerAddress': currentLanguage === 'tr' ? restaurant.address : restaurant.addressEn,
        'footerWifi': restaurant.wifiPassword,
        'footerCopyright': currentLanguage === 'tr' ? restaurant.name : restaurant.nameEn
    };
    
    Object.entries(footerElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'IMG') {
                element.src = value;
                element.alt = restaurant.name;
            } else {
                element.textContent = value;
            }
        }
    });
    
    // Update footer description
    const footerDescription = document.getElementById('footerDescription');
    if (footerDescription) {
        const description = currentLanguage === 'tr' ? 
            (restaurant.footerDescTr || 'Modern teknoloji ile geleneksel lezzetleri buluşturan dijital menü deneyimi. QR kod ile kolayca sipariş verin, lezzetli anların tadını çıkarın.') :
            (restaurant.footerDescEn || 'Digital menu experience that brings together modern technology with traditional flavors. Order easily with QR code and enjoy delicious moments.');
        footerDescription.textContent = description;
    }
    
    // Update footer social media
    const footerSocialMedia = document.getElementById('footerSocialMedia');
    footerSocialMedia.innerHTML = '';
    
    if (restaurant.socialMedia.instagram) {
        footerSocialMedia.innerHTML += `
            <a href="https://instagram.com/${restaurant.socialMedia.instagram.replace('@', '')}" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                <i data-lucide="instagram" class="h-5 w-5"></i>
            </a>
        `;
    }
    
    if (restaurant.socialMedia.facebook) {
        footerSocialMedia.innerHTML += `
            <a href="https://facebook.com/${restaurant.socialMedia.facebook}" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                <i data-lucide="facebook" class="h-5 w-5"></i>
            </a>
        `;
    }
    
    if (restaurant.socialMedia.twitter) {
        footerSocialMedia.innerHTML += `
            <a href="https://twitter.com/${restaurant.socialMedia.twitter.replace('@', '')}" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                <i data-lucide="twitter" class="h-5 w-5"></i>
            </a>
        `;
    }
    
    lucide.createIcons();
}

// Load category grid for homepage
function loadCategoryGrid(categories) {
    const container = document.getElementById('categoryContainer');
    const homeCategories = categories.filter(cat => cat.isActive && cat.showOnHome);
    
    if (designSettings.categoryGridStyle === 'modern') {
        container.innerHTML = homeCategories.map(category => `
            <div class="category-card-modern group bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" onclick="selectCategory('${category.id}')">
                <div class="text-center">
                    ${category.image ? 
                        `<div class="relative mb-4">
                            <img src="${category.image}" alt="${category.name}" class="w-20 h-20 mx-auto rounded-full object-cover ring-4 ring-yellow-100 group-hover:ring-yellow-200 transition-all">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full"></div>
                        </div>` :
                        `<div class="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mb-4 group-hover:from-yellow-500 group-hover:to-yellow-600 transition-all">
                            <i data-lucide="${category.icon}" class="h-10 w-10 text-white"></i>
                        </div>`
                    }
                    <h3 class="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">${currentLanguage === 'tr' ? category.name : category.nameEn}</h3>
                    <div class="w-8 h-0.5 bg-yellow-400 mx-auto mt-2 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = homeCategories.map(category => `
            <div class="category-card bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all" onclick="selectCategory('${category.id}')">
                <div class="text-center">
                    ${category.image ? 
                        `<img src="${category.image}" alt="${category.name}" class="w-16 h-16 mx-auto rounded-lg object-cover mb-3">` :
                        `<div class="w-16 h-16 mx-auto bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                            <i data-lucide="${category.icon}" class="h-8 w-8 text-yellow-600"></i>
                        </div>`
                    }
                    <h3 class="font-medium text-gray-900">${currentLanguage === 'tr' ? category.name : category.nameEn}</h3>
                </div>
            </div>
        `).join('');
    }
    
    lucide.createIcons();
}

// Load categories for filter
function loadCategories(categories) {
    const container = document.getElementById('categoryFilter');
    const activeCategories = categories.filter(cat => cat.isActive).sort((a, b) => a.order - b.order);
    
    let html = `
        <button onclick="selectCategory('')" class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === '' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }">
            ${currentLanguage === 'tr' ? 'Tümü' : 'All'}
        </button>
    `;
    
    html += activeCategories.map(category => `
        <button onclick="selectCategory('${category.id}')" class="flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === category.id ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }">
            <i data-lucide="${category.icon}" class="h-4 w-4"></i>
            <span>${currentLanguage === 'tr' ? category.name : category.nameEn}</span>
        </button>
    `).join('');
    
    container.innerHTML = html;
    lucide.createIcons();
}

// Load products
function loadProducts(products) {
    const container = document.getElementById('productGrid');
    const noProductsDiv = document.getElementById('noProducts');
    
    let filteredProducts = products.filter(product => product.isActive);
    if (selectedCategory) {
        filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }
    
    // Update section title and count
    document.getElementById('sectionTitle').textContent = selectedCategory ? 
        (currentLanguage === 'tr' ? 'Kategori Ürünleri' : 'Category Products') :
        (currentLanguage === 'tr' ? 'Tüm Ürünler' : 'All Products');
    
    document.getElementById('productCount').textContent = 
        `${filteredProducts.length} ${currentLanguage === 'tr' ? 'ürün bulundu' : 'products found'}`;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '';
        noProductsDiv.classList.remove('hidden');
        return;
    }
    
    noProductsDiv.classList.add('hidden');
    
    container.innerHTML = filteredProducts.map(product => {
        const likeRatio = product.likes + product.dislikes > 0 ? 
            (product.likes / (product.likes + product.dislikes)) * 100 : 0;
        const hasVoted = !!userVotes[product.id];
        const userVote = userVotes[product.id];
        
        return `
            <div class="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105" onclick="openProductModal('${product.id}')">
                <div class="relative">
                    <img src="${product.image}" alt="${currentLanguage === 'tr' ? product.name : product.nameEn}" class="w-full h-48 object-cover">
                    <div class="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
                        <i data-lucide="eye" class="h-3 w-3"></i>
                        <span>${product.views}</span>
                    </div>
                    <div class="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs flex items-center space-x-1">
                        <i data-lucide="star" class="h-3 w-3 fill-current"></i>
                        <span>${likeRatio.toFixed(0)}%</span>
                    </div>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">
                        ${currentLanguage === 'tr' ? product.name : product.nameEn}
                    </h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">
                        ${currentLanguage === 'tr' ? product.description : product.descriptionEn}
                    </p>
                    <div class="flex items-center justify-between">
                        <div class="text-2xl font-bold text-yellow-600">
                            ₺${product.price}
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="likeProduct(event, '${product.id}')" ${hasVoted ? 'disabled' : ''} class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                                hasVoted ? 
                                    (userVote === 'like' ? 'bg-green-100 text-green-600 border border-green-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed') :
                                    'bg-green-50 hover:bg-green-100 text-green-600'
                            }">
                                <i data-lucide="thumbs-up" class="h-4 w-4"></i>
                                <span class="text-xs">${product.likes}</span>
                            </button>
                            <button onclick="dislikeProduct(event, '${product.id}')" ${hasVoted ? 'disabled' : ''} class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                                hasVoted ? 
                                    (userVote === 'dislike' ? 'bg-red-100 text-red-600 border border-red-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed') :
                                    'bg-red-50 hover:bg-red-100 text-red-600'
                            }">
                                <i data-lucide="thumbs-down" class="h-4 w-4"></i>
                                <span class="text-xs">${product.dislikes}</span>
                            </button>
                        </div>
                    </div>
                    ${product.variations && product.variations.length > 0 ? `
                        <div class="mt-3 pt-3 border-t border-gray-100">
                            <p class="text-xs text-gray-500">
                                ${currentLanguage === 'tr' ? `${product.variations.length} çeşit mevcut` : `${product.variations.length} variants available`}
                            </p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

// Load tables
function loadTables(tables) {
    const container = document.getElementById('tableGrid');
    const activeTables = tables.filter(table => table.isActive);
    
    container.innerHTML = activeTables.map(table => `
        <button onclick="selectTable('${table.id}')" class="p-2 text-sm rounded-md border transition-colors ${
            selectedTable === table.id ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-300 hover:border-gray-400'
        }">
            ${currentLanguage === 'tr' ? table.name : table.nameEn}
        </button>
    `).join('');
}

// Category selection
function selectCategory(categoryId) {
    selectedCategory = categoryId;
    loadData(); // Reload to update filters and products
}

// Product interactions
async function openProductModal(productId) {
    try {
        // Increment view count
        await fetch('api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'incrementViews', id: productId })
        });
        
        // Get product data
        const products = await fetch('api/products.php').then(r => r.json());
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        const likeRatio = product.likes + product.dislikes > 0 ? 
            (product.likes / (product.likes + product.dislikes)) * 100 : 0;
        const hasVoted = !!userVotes[product.id];
        const userVote = userVotes[product.id];
        
        const modal = document.getElementById('productModal');
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="relative">
                    <img src="${product.image}" alt="${currentLanguage === 'tr' ? product.name : product.nameEn}" class="w-full h-64 object-cover rounded-t-lg">
                    <button onclick="closeProductModal()" class="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors">
                        <i data-lucide="x" class="h-5 w-5"></i>
                    </button>
                    <div class="absolute bottom-4 left-4 flex space-x-3">
                        <div class="bg-black bg-opacity-70 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1">
                            <i data-lucide="eye" class="h-4 w-4"></i>
                            <span>${product.views}</span>
                        </div>
                        <div class="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1">
                            <i data-lucide="star" class="h-4 w-4 fill-current"></i>
                            <span>${likeRatio.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 mb-2">
                                ${currentLanguage === 'tr' ? product.name : product.nameEn}
                            </h2>
                            <p class="text-gray-600">
                                ${currentLanguage === 'tr' ? product.description : product.descriptionEn}
                            </p>
                        </div>
                        <div class="text-3xl font-bold text-yellow-600">
                            ₺${product.price}
                        </div>
                    </div>
                    
                    <div class="flex items-center space-x-4 mb-6">
                        <button onclick="likeProduct(event, '${product.id}')" ${hasVoted ? 'disabled' : ''} class="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                            hasVoted ? 
                                (userVote === 'like' ? 'bg-green-100 text-green-600 border-2 border-green-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed') :
                                'bg-green-50 hover:bg-green-100 text-green-600'
                        }">
                            <i data-lucide="thumbs-up" class="h-5 w-5"></i>
                            <span>${product.likes}</span>
                            <span class="text-sm">${currentLanguage === 'tr' ? 'Beğeni' : 'Likes'}</span>
                        </button>
                        <button onclick="dislikeProduct(event, '${product.id}')" ${hasVoted ? 'disabled' : ''} class="flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                            hasVoted ? 
                                (userVote === 'dislike' ? 'bg-red-100 text-red-600 border-2 border-red-300' : 'bg-gray-100 text-gray-400 cursor-not-allowed') :
                                'bg-red-50 hover:bg-red-100 text-red-600'
                        }">
                            <i data-lucide="thumbs-down" class="h-5 w-5"></i>
                            <span>${product.dislikes}</span>
                            <span class="text-sm">${currentLanguage === 'tr' ? 'Beğenmeme' : 'Dislikes'}</span>
                        </button>
                    </div>
                    
                    ${hasVoted ? `
                        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p class="text-sm text-blue-700">
                                ${currentLanguage === 'tr' ? 
                                    `Bu ürün için ${userVote === 'like' ? 'beğeni' : 'beğenmeme'} oyunuzu kullandınız.` :
                                    `You have already ${userVote === 'like' ? 'liked' : 'disliked'} this product.`
                                }
                            </p>
                        </div>
                    ` : ''}
                    
                    ${product.variations && product.variations.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">
                                ${currentLanguage === 'tr' ? 'Mevcut Seçenekler' : 'Available Options'}
                            </h3>
                            <div class="space-y-2">
                                ${product.variations.map(variation => `
                                    <div class="w-full text-left p-3 rounded-md border ${
                                        variation.isAvailable ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-gray-100 text-gray-400'
                                    }">
                                        <div class="flex items-center justify-between">
                                            <span class="font-medium">
                                                ${currentLanguage === 'tr' ? variation.name : variation.nameEn}
                                            </span>
                                            <span class="text-sm">
                                                ${variation.priceModifier > 0 ? '+' : ''}${variation.priceModifier !== 0 ? `₺${variation.priceModifier}` : ''}
                                                ${!variation.isAvailable ? `<span class="ml-2 text-red-500">(${currentLanguage === 'tr' ? 'Mevcut değil' : 'Not available'})</span>` : ''}
                                            </span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        lucide.createIcons();
        
    } catch (error) {
        console.error('Error opening product modal:', error);
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
}

async function likeProduct(event, productId) {
    event.stopPropagation();
    
    if (userVotes[productId]) return;
    
    try {
        await fetch('api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'like', id: productId })
        });
        
        userVotes[productId] = 'like';
        localStorage.setItem('userVotes', JSON.stringify(userVotes));
        
        loadData(); // Reload to update UI
    } catch (error) {
        console.error('Error liking product:', error);
    }
}

async function dislikeProduct(event, productId) {
    event.stopPropagation();
    
    if (userVotes[productId]) return;
    
    try {
        await fetch('api/products.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'dislike', id: productId })
        });
        
        userVotes[productId] = 'dislike';
        localStorage.setItem('userVotes', JSON.stringify(userVotes));
        
        loadData(); // Reload to update UI
    } catch (error) {
        console.error('Error disliking product:', error);
    }
}

// Sidebar functions
function openSidebar() {
    document.getElementById('sidebar').classList.remove('-translate-x-full');
    document.getElementById('overlay').classList.remove('hidden');
}

function closeSidebar() {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('overlay').classList.add('hidden');
}

// Table selection for waiter call
function showTableSelection() {
    document.getElementById('showTableSelectionBtn').classList.add('hidden');
    document.getElementById('tableSelection').classList.remove('hidden');
}

function cancelTableSelection() {
    document.getElementById('showTableSelectionBtn').classList.remove('hidden');
    document.getElementById('tableSelection').classList.add('hidden');
    selectedTable = '';
    updateTableSelection();
}

function selectTable(tableId) {
    selectedTable = tableId;
    updateTableSelection();
}

function updateTableSelection() {
    const buttons = document.querySelectorAll('#tableGrid button');
    buttons.forEach(btn => {
        if (btn.onclick.toString().includes(selectedTable)) {
            btn.classList.add('border-yellow-500', 'bg-yellow-50', 'text-yellow-700');
            btn.classList.remove('border-gray-300');
        } else {
            btn.classList.remove('border-yellow-500', 'bg-yellow-50', 'text-yellow-700');
            btn.classList.add('border-gray-300');
        }
    });
    
    document.getElementById('callWaiterBtn').disabled = !selectedTable;
}

async function callWaiter() {
    if (!selectedTable) return;
    
    try {
        const tables = await fetch('api/tables.php').then(r => r.json());
        const table = tables.find(t => t.id === selectedTable);
        const tableName = table ? (currentLanguage === 'tr' ? table.name : table.nameEn) : '';
        
        // Send notification to admin
        await fetch('api/notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'add',
                tableId: selectedTable,
                tableName: tableName,
                timestamp: new Date().toISOString()
            })
        });
        
        showToast(
            currentLanguage === 'tr' ? 
                `${tableName} için garson çağrılıyor...` : 
                `Calling waiter for ${tableName}...`,
            'success'
        );
        
        cancelTableSelection();
        
    } catch (error) {
        console.error('Error calling waiter:', error);
        showToast('Garson çağrılırken hata oluştu', 'error');
    }
}

// Language toggle
function toggleLanguage() {
    currentLanguage = currentLanguage === 'tr' ? 'en' : 'tr';
    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    loadData();
}

function updateLanguage() {
    document.getElementById('languageToggle').textContent = currentLanguage === 'tr' ? 'English' : 'Türkçe';
}

// Feedback functions
function openFeedbackModal() {
    document.getElementById('feedbackModal').classList.remove('hidden');
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').classList.add('hidden');
    document.getElementById('feedbackForm').reset();
}

async function submitFeedback(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('feedbackName').value,
        email: document.getElementById('feedbackEmail').value,
        message: document.getElementById('feedbackMessage').value,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
    };
    
    try {
        await fetch('api/feedback.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', ...formData })
        });
        
        showToast('Geri bildiriminiz gönderildi. Teşekkürler!', 'success');
        closeFeedbackModal();
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showToast('Geri bildirim gönderilirken hata oluştu', 'error');
    }
}

// Bottom navigation functions
function goHome() {
    selectedCategory = '';
    loadData();
}

function openWhatsApp() {
    // You can customize this with your restaurant's WhatsApp number
    window.open('https://wa.me/905551234567', '_blank');
}

function showWifiInfo() {
    document.getElementById('wifiModal').classList.remove('hidden');
}

function closeWifiModal() {
    document.getElementById('wifiModal').classList.add('hidden');
}

function showMobileMenu() {
    document.getElementById('mobileMenuModal').classList.remove('hidden');
    loadMobileMenuCategories();
}

function closeMobileMenu() {
    document.getElementById('mobileMenuModal').classList.add('hidden');
}

async function loadMobileMenuCategories() {
    try {
        const categories = await fetch('api/categories.php').then(r => r.json());
        const activeCategories = categories.filter(cat => cat.isActive).sort((a, b) => a.order - b.order);
        
        const container = document.getElementById('mobileMenuCategories');
        container.innerHTML = activeCategories.map(category => `
            <button onclick="selectCategoryFromMobile('${category.id}')" class="w-full text-left p-3 rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-3">
                <i data-lucide="${category.icon}" class="h-5 w-5 text-gray-400"></i>
                <span>${currentLanguage === 'tr' ? category.name : category.nameEn}</span>
            </button>
        `).join('');
        
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading mobile menu categories:', error);
    }
}

function selectCategoryFromMobile(categoryId) {
    selectCategory(categoryId);
    closeMobileMenu();
}

// Utility functions
function closeAllModals() {
    const modals = ['productModal', 'feedbackModal', 'mobileMenuModal', 'wifiModal'];
    modals.forEach(modalId => {
        document.getElementById(modalId).classList.add('hidden');
    });
    closeSidebar();
    hideSearchResults();
    hideMobileSearchResults();
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}