// Trip.com Mini App JavaScript
class TripComApp {
    constructor() {
        this.currentLanguage = 'ru';
        this.currentTab = 'flights';
        this.citiesData = [];
        this.translations = {};
        this.popularRoutes = [];
        this.activeDropdown = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.initTelegramWebApp();
        this.setupEventListeners();
        this.initLanguage();
        this.initDates();
        this.renderPopularRoutes();
    }

    loadData() {
        // Embedded data from the provided JSON
        this.citiesData = [
            {"name": "Москва", "code": "MOW", "country": "Россия", "airports": ["SVO", "DME", "VKO"]},
            {"name": "Санкт-Петербург", "code": "LED", "country": "Россия", "airports": ["LED"]},
            {"name": "Сочи", "code": "AER", "country": "Россия", "airports": ["AER"]},
            {"name": "Казань", "code": "KZN", "country": "Россия", "airports": ["KZN"]},
            {"name": "Екатеринбург", "code": "SVX", "country": "Россия", "airports": ["SVX"]},
            {"name": "Beijing", "code": "BJS", "country": "China", "airports": ["PEK", "PKX"]},
            {"name": "Shanghai", "code": "SHA", "country": "China", "airports": ["PVG", "SHA"]},
            {"name": "Guangzhou", "code": "CAN", "country": "China", "airports": ["CAN"]},
            {"name": "Shenzhen", "code": "SZX", "country": "China", "airports": ["SZX"]},
            {"name": "Hong Kong", "code": "HKG", "country": "Hong Kong", "airports": ["HKG"]},
            {"name": "Bangkok", "code": "BKK", "country": "Thailand", "airports": ["BKK", "DMK"]},
            {"name": "Phuket", "code": "HKT", "country": "Thailand", "airports": ["HKT"]},
            {"name": "Dubai", "code": "DXB", "country": "UAE", "airports": ["DXB", "DWC"]},
            {"name": "Istanbul", "code": "IST", "country": "Turkey", "airports": ["IST", "SAW"]},
            {"name": "Singapore", "code": "SIN", "country": "Singapore", "airports": ["SIN"]},
            {"name": "London", "code": "LON", "country": "UK", "airports": ["LHR", "LGW", "STN"]},
            {"name": "Paris", "code": "PAR", "country": "France", "airports": ["CDG", "ORY"]},
            {"name": "New York", "code": "NYC", "country": "USA", "airports": ["JFK", "LGA", "EWR"]},
            {"name": "Tokyo", "code": "TYO", "country": "Japan", "airports": ["NRT", "HND"]},
            {"name": "Seoul", "code": "SEL", "country": "South Korea", "airports": ["ICN", "GMP"]}
        ];

        this.popularRoutes = [
            {"from": "MOW", "to": "BKK", "price_from": 25000, "duration": "9h 30m"},
            {"from": "MOW", "to": "DXB", "price_from": 18000, "duration": "5h 15m"},
            {"from": "MOW", "to": "IST", "price_from": 15000, "duration": "3h 45m"},
            {"from": "MOW", "to": "BJS", "price_from": 28000, "duration": "7h 20m"},
            {"from": "LED", "to": "BKK", "price_from": 27000, "duration": "10h 45m"},
            {"from": "LED", "to": "PAR", "price_from": 20000, "duration": "3h 30m"},
            {"from": "MOW", "to": "TYO", "price_from": 35000, "duration": "9h 15m"},
            {"from": "MOW", "to": "NYC", "price_from": 40000, "duration": "10h 30m"}
        ];

        this.translations = {
            "ru": {
                "app_title": "Trip.com - Поиск авиабилетов, отелей и туров",
                "flights": "Авиабилеты",
                "hotels": "Отели", 
                "trains": "Поезда",
                "cars": "Аренда авто",
                "tours": "Экскурсии",
                "transfers": "Трансферы",
                "from": "Откуда",
                "to": "Куда",
                "departure": "Отправление",
                "return": "Возвращение",
                "passengers": "Пассажиры",
                "search": "Найти",
                "popular_routes": "Популярные направления",
                "price_from": "от",
                "adults": "Взрослые",
                "children": "Дети",
                "infants": "Младенцы",
                "rooms": "Номера",
                "checkin": "Заезд",
                "checkout": "Выезд",
                "fill_required": "Пожалуйста, заполните все обязательные поля",
                "searching": "Поиск...",
                "redirect_success": "Переход на Trip.com для завершения бронирования"
            },
            "zh": {
                "app_title": "Trip.com - 搜索机票，酒店和旅游",
                "flights": "机票",
                "hotels": "酒店",
                "trains": "火车票",
                "cars": "租车",
                "tours": "旅游",
                "transfers": "接送",
                "from": "出发地",
                "to": "目的地",
                "departure": "出发",
                "return": "返回",
                "passengers": "乘客",
                "search": "搜索",
                "popular_routes": "热门路线",
                "price_from": "起",
                "adults": "成人",
                "children": "儿童",
                "infants": "婴儿",
                "rooms": "房间",
                "checkin": "入住",
                "checkout": "退房",
                "fill_required": "请填写所有必填字段",
                "searching": "搜索中...",
                "redirect_success": "跳转到Trip.com完成预订"
            },
            "ar": {
                "app_title": "Trip.com - البحث عن تذاكر الطيران والفنادق والجولات",
                "flights": "تذاكر الطيران",
                "hotels": "الفنادق",
                "trains": "القطارات",
                "cars": "تأجير السيارات",
                "tours": "الجولات",
                "transfers": "النقل",
                "from": "من",
                "to": "إلى",
                "departure": "المغادرة",
                "return": "العودة",
                "passengers": "المسافرين",
                "search": "بحث",
                "popular_routes": "الطرق الشعبية",
                "price_from": "من",
                "adults": "البالغين",
                "children": "الأطفال",
                "infants": "الرضع",
                "rooms": "الغرف",
                "checkin": "تسجيل الوصول",
                "checkout": "تسجيل المغادرة",
                "fill_required": "يرجى ملء جميع الحقول المطلوبة",
                "searching": "البحث...",
                "redirect_success": "الانتقال إلى Trip.com لإكمال الحجز"
            },
            "en": {
                "app_title": "Trip.com - Search flights, hotels and tours",
                "flights": "Flights",
                "hotels": "Hotels",
                "trains": "Trains", 
                "cars": "Car Rental",
                "tours": "Tours",
                "transfers": "Transfers",
                "from": "From",
                "to": "To",
                "departure": "Departure",
                "return": "Return",
                "passengers": "Passengers",
                "search": "Search",
                "popular_routes": "Popular Routes",
                "price_from": "from",
                "adults": "Adults",
                "children": "Children",
                "infants": "Infants",
                "rooms": "Rooms",
                "checkin": "Check-in",
                "checkout": "Check-out",
                "fill_required": "Please fill all required fields",
                "searching": "Searching...",
                "redirect_success": "Redirecting to Trip.com to complete booking"
            }
        };
    }

    initTelegramWebApp() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            
            // Set theme
            const isDark = tg.colorScheme === 'dark';
            document.documentElement.setAttribute('data-color-scheme', isDark ? 'dark' : 'light');
            
            // Handle back button
            tg.BackButton.onClick(() => {
                tg.close();
            });
        }
    }

    setupEventListeners() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initEventListeners();
            });
        } else {
            this.initEventListeners();
        }
    }

    initEventListeners() {
        // Language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = btn.getAttribute('data-tab');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // City autocomplete inputs
        this.initAutocomplete();

        // Global click handler to close dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.form-group')) {
                this.closeAllDropdowns();
            }
        });

        // Make search functions globally available
        this.makeSearchFunctionsGlobal();
    }

    makeSearchFunctionsGlobal() {
        window.searchFlights = () => this.searchFlights();
        window.searchHotels = () => this.searchHotels();
        window.searchTrains = () => this.searchTrains();
        window.searchCars = () => this.searchCars();
        window.searchTours = () => this.searchTours();
        window.searchTransfers = () => this.searchTransfers();
    }

    initAutocomplete() {
        const inputs = document.querySelectorAll('.city-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleAutocomplete(e.target);
            });
            
            input.addEventListener('focus', (e) => {
                this.handleAutocomplete(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                // Small delay to allow clicking on dropdown items
                setTimeout(() => {
                    this.hideAutocomplete(e.target);
                }, 150);
            });

            input.addEventListener('keydown', (e) => {
                this.handleKeyNavigation(e, input);
            });
        });
    }

    handleKeyNavigation(e, input) {
        const dropdownId = input.id + 'Dropdown';
        const dropdown = document.getElementById(dropdownId);
        
        if (!dropdown || !dropdown.classList.contains('show')) return;

        const items = dropdown.querySelectorAll('.autocomplete-item');
        let activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
                this.setActiveItem(items, activeIndex);
                break;
            case 'ArrowUp':
                e.preventDefault();
                activeIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
                this.setActiveItem(items, activeIndex);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && items[activeIndex]) {
                    items[activeIndex].click();
                }
                break;
            case 'Escape':
                this.hideAutocomplete(input);
                break;
        }
    }

    setActiveItem(items, activeIndex) {
        items.forEach(item => item.classList.remove('active'));
        if (items[activeIndex]) {
            items[activeIndex].classList.add('active');
        }
    }

    handleAutocomplete(input) {
        const query = input.value.toLowerCase().trim();
        const dropdownId = input.id + 'Dropdown';
        const dropdown = document.getElementById(dropdownId);
        
        if (!dropdown) return;

        this.closeAllDropdowns();
        this.activeDropdown = dropdown;

        let filteredCities = [];
        
        if (query.length === 0) {
            // Show popular cities when no query
            filteredCities = this.citiesData.slice(0, 8);
        } else {
            // Filter cities based on query
            filteredCities = this.citiesData.filter(city => 
                city.name.toLowerCase().includes(query) || 
                city.code.toLowerCase().includes(query) ||
                city.country.toLowerCase().includes(query)
            ).slice(0, 10);
        }

        if (filteredCities.length === 0 && query.length > 0) {
            dropdown.innerHTML = '<div class="autocomplete-item">Город не найден</div>';
        } else {
            dropdown.innerHTML = filteredCities.map(city => `
                <div class="autocomplete-item" data-city-name="${city.name}" data-city-code="${city.code}">
                    <div class="autocomplete-item-name">${city.name}</div>
                    <div class="autocomplete-item-info">${city.country} (${city.code})</div>
                </div>
            `).join('');

            // Add click handlers to dropdown items
            dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
                if (item.dataset.cityName) {
                    item.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.selectCity(input.id, item.dataset.cityName, item.dataset.cityCode);
                    });
                }
            });
        }

        dropdown.classList.add('show');
    }

    selectCity(inputId, cityName, cityCode) {
        const input = document.getElementById(inputId);
        if (input) {
            input.value = cityName;
            input.dataset.code = cityCode;
            this.hideAutocomplete(input);
        }
    }

    hideAutocomplete(input) {
        const dropdownId = input.id + 'Dropdown';
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.autocomplete-dropdown').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
        this.activeDropdown = null;
    }

    initLanguage() {
        // Load saved language or default to Russian
        const savedLang = this.getSavedLanguage() || 'ru';
        this.currentLanguage = savedLang;
        
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = savedLang;
        }
        
        this.updateLanguage();
    }

    getSavedLanguage() {
        try {
            return localStorage.getItem('tripcom_language');
        } catch (e) {
            return 'ru';
        }
    }

    saveLanguage(lang) {
        try {
            localStorage.setItem('tripcom_language', lang);
        } catch (e) {
            // Ignore localStorage errors in restricted environments
        }
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        this.saveLanguage(lang);
        this.updateLanguage();
        this.renderPopularRoutes();
    }

    updateLanguage() {
        const translations = this.translations[this.currentLanguage];
        if (!translations) return;
        
        // Update document title
        document.title = translations.app_title;
        
        // Update document language and direction
        document.documentElement.lang = this.currentLanguage;
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        
        // Update all translatable elements
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.dataset.key;
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    }

    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(tabName);
        
        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');
            this.currentTab = tabName;
        }
    }

    initDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const formatDate = (date) => date.toISOString().split('T')[0];

        // Set minimum date to today for all date inputs
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.min = formatDate(today);
        });

        // Set default dates
        const defaultDates = [
            { id: 'flightDepart', date: tomorrow },
            { id: 'flightReturn', date: nextWeek },
            { id: 'hotelCheckin', date: tomorrow },
            { id: 'hotelCheckout', date: nextWeek },
            { id: 'trainDate', date: tomorrow },
            { id: 'carPickupDate', date: tomorrow },
            { id: 'carDropoffDate', date: nextWeek },
            { id: 'tourDate', date: tomorrow },
            { id: 'transferDate', date: tomorrow }
        ];

        defaultDates.forEach(({ id, date }) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = formatDate(date);
            }
        });
    }

    renderPopularRoutes() {
        const container = document.getElementById('popularRoutes');
        if (!container) return;

        const translations = this.translations[this.currentLanguage];
        
        container.innerHTML = this.popularRoutes.map(route => {
            const fromCity = this.citiesData.find(city => city.code === route.from);
            const toCity = this.citiesData.find(city => city.code === route.to);
            
            return `
                <div class="route-card" data-from="${route.from}" data-to="${route.to}">
                    <div class="route-header">
                        <div class="route-cities">
                            ${fromCity?.name || route.from}
                            <span class="route-arrow">→</span>
                            ${toCity?.name || route.to}
                        </div>
                    </div>
                    <div class="route-info">
                        <div class="route-price">
                            ${translations.price_from} ₽${route.price_from.toLocaleString()}
                        </div>
                        <div class="route-duration">${route.duration}</div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers to route cards
        container.querySelectorAll('.route-card').forEach(card => {
            card.addEventListener('click', () => {
                const fromCode = card.dataset.from;
                const toCode = card.dataset.to;
                this.selectPopularRoute(fromCode, toCode);
            });
        });
    }

    selectPopularRoute(fromCode, toCode) {
        const fromCity = this.citiesData.find(city => city.code === fromCode);
        const toCity = this.citiesData.find(city => city.code === toCode);
        
        // Switch to flights tab
        this.switchTab('flights');
        
        // Fill the form
        const fromInput = document.getElementById('flightFrom');
        const toInput = document.getElementById('flightTo');
        
        if (fromInput && toInput) {
            fromInput.value = fromCity?.name || fromCode;
            fromInput.dataset.code = fromCode;
            toInput.value = toCity?.name || toCode;
            toInput.dataset.code = toCode;
        }

        // Scroll to form
        setTimeout(() => {
            const form = document.querySelector('.search-form');
            if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    }

    validateForm(requiredFields) {
        const translations = this.translations[this.currentLanguage];
        const missing = [];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                missing.push(field);
            }
        });
        
        if (missing.length > 0) {
            missing[0].focus();
            this.showToast(translations.fill_required, 'error');
            return false;
        }
        
        return true;
    }

    getLocaleCode() {
        const localeMap = {
            'ru': 'ru-RU',
            'zh': 'zh-CN',
            'ar': 'ar-AE',
            'en': 'en-US'
        };
        return localeMap[this.currentLanguage] || 'ru-RU';
    }

    searchFlights() {
        const requiredFields = ['flightFrom', 'flightTo', 'flightDepart'];
        if (!this.validateForm(requiredFields)) return;

        const fromInput = document.getElementById('flightFrom');
        const toInput = document.getElementById('flightTo');
        const fromCode = fromInput.dataset.code || fromInput.value;
        const toCode = toInput.dataset.code || toInput.value;
        
        const params = new URLSearchParams({
            locale: this.getLocaleCode(),
            from: fromCode,
            to: toCode,
            depart: document.getElementById('flightDepart').value,
            passengers: `${document.getElementById('flightAdults').value},${document.getElementById('flightChildren').value},${document.getElementById('flightInfants').value}`,
            cabin: 'economy'
        });

        const returnDate = document.getElementById('flightReturn').value;
        if (returnDate) {
            params.set('return', returnDate);
        }

        const url = `https://www.trip.com/flights/?${params.toString()}`;
        this.openTripComUrl(url);
    }

    searchHotels() {
        const requiredFields = ['hotelCity', 'hotelCheckin', 'hotelCheckout'];
        if (!this.validateForm(requiredFields)) return;

        const cityInput = document.getElementById('hotelCity');
        const cityCode = cityInput.dataset.code || cityInput.value.toLowerCase();
        
        const params = new URLSearchParams({
            locale: this.getLocaleCode(),
            city: cityCode,
            checkin: document.getElementById('hotelCheckin').value,
            checkout: document.getElementById('hotelCheckout').value,
            rooms: document.getElementById('hotelRooms').value,
            guests: `${document.getElementById('hotelAdults').value},${document.getElementById('hotelChildren').value}`
        });

        const url = `https://www.trip.com/hotels/?${params.toString()}`;
        this.openTripComUrl(url);
    }

    searchTrains() {
        const requiredFields = ['trainFrom', 'trainTo', 'trainDate'];
        if (!this.validateForm(requiredFields)) return;

        const fromInput = document.getElementById('trainFrom');
        const toInput = document.getElementById('trainTo');
        const fromCode = fromInput.dataset.code || fromInput.value.toLowerCase();
        const toCode = toInput.dataset.code || toInput.value.toLowerCase();
        
        const params = new URLSearchParams({
            locale: this.getLocaleCode(),
            from: fromCode,
            to: toCode,
            date: document.getElementById('trainDate').value,
            passengers: document.getElementById('trainPassengers').value
        });

        const url = `https://www.trip.com/trains/?${params.toString()}`;
        this.openTripComUrl(url);
    }

    searchCars() {
        const requiredFields = ['carPickup', 'carPickupDate', 'carDropoffDate'];
        if (!this.validateForm(requiredFields)) return;

        const pickupInput = document.getElementById('carPickup');
        const dropoffInput = document.getElementById('carDropoff');
        const pickupLocation = pickupInput.dataset.code || pickupInput.value.toLowerCase();
        const dropoffLocation = dropoffInput.value ? (dropoffInput.dataset.code || dropoffInput.value.toLowerCase()) : pickupLocation;
        
        const params = new URLSearchParams({
            locale: this.getLocaleCode(),
            pickup_location: pickupLocation,
            dropoff_location: dropoffLocation,
            pickup_date: document.getElementById('carPickupDate').value,
            pickup_time: document.getElementById('carPickupTime').value,
            dropoff_date: document.getElementById('carDropoffDate').value,
            dropoff_time: document.getElementById('carDropoffTime').value
        });

        const url = `https://www.trip.com/cars/?${params.toString()}`;
        this.openTripComUrl(url);
    }

    searchTours() {
        const requiredFields = ['tourCity', 'tourDate'];
        if (!this.validateForm(requiredFields)) return;

        const cityInput = document.getElementById('tourCity');
        const cityCode = cityInput.dataset.code || cityInput.value.toLowerCase();
        
        const params = new URLSearchParams({
            locale: this.getLocaleCode(),
            city: cityCode,
            date: document.getElementById('tourDate').value,
            passengers: document.getElementById('tourPassengers').value
        });

        const url = `https://www.trip.com/things-to-do/?${params.toString()}`;
        this.openTripComUrl(url);
    }

    searchTransfers() {
        const requiredFields = ['transferFrom', 'transferTo', 'transferDate'];
        if (!this.validateForm(requiredFields)) return;

        const fromInput = document.getElementById('transferFrom');
        const toInput = document.getElementById('transferTo');
        const fromLocation = fromInput.dataset.code || fromInput.value.toLowerCase();
        const toLocation = toInput.dataset.code || toInput.value.toLowerCase();
        
        const params = new URLSearchParams({
            locale: this.getLocaleCode(),
            from: fromLocation,
            to: toLocation,
            date: document.getElementById('transferDate').value,
            time: document.getElementById('transferTime').value,
            passengers: document.getElementById('transferPassengers').value
        });

        const url = `https://www.trip.com/airport-transfer/?${params.toString()}`;
        this.openTripComUrl(url);
    }

    openTripComUrl(url) {
        const translations = this.translations[this.currentLanguage];
        
        this.showLoading();
        this.showToast(translations.searching, 'info');
        
        setTimeout(() => {
            this.hideLoading();
            
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.openLink(url);
            } else {
                window.open(url, '_blank');
            }
            
            this.showToast(translations.redirect_success, 'success');
        }, 1500);
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.remove('hidden');
            
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }
    }
}

// Initialize the app when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new TripComApp();
        window.app = app;
    });
} else {
    app = new TripComApp();
    window.app = app;
}