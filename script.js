// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Инициализация приложения
tg.expand();
tg.MainButton.hide();
tg.BackButton.hide();

// Данные пользователя
let userData = {
    id: null,
    username: null,
    firstName: null,
    balance: 1000, // Начальный баланс
    purchases: []
};

// Текущий активный раздел
let currentSection = 'telegram';

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeUserData();
    updateBalanceDisplay();
    showSection('telegram');
    setupEventListeners();
    
    // Логирование для отладки
    console.log('Mini App инициализирован');
    console.log('Платформа:', tg.platform);
    console.log('Версия:', tg.version);
});

// Инициализация данных пользователя из Telegram
function initializeUserData() {
    const initData = tg.initDataUnsafe;
    
    if (initData.user) {
        userData.id = initData.user.id;
        userData.username = initData.user.username || 'Пользователь';
        userData.firstName = initData.user.first_name || '';
        
        // Обновляем интерфейс
        document.getElementById('userAvatar').textContent = 
            userData.firstName ? userData.firstName[0] : '👤';
        
        // Можно загрузить дополнительные данные с сервера
        // loadUserData(userData.id);
    } else {
        // Для тестирования вне Telegram
        userData.username = 'Тестовый пользователь';
        userData.firstName = 'Тест';
        userData.balance = 1500;
    }
}

// Обновление отображения баланса
function updateBalanceDisplay() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = `${userData.balance} звёзд`;
    }
}

// Переключение разделов
function showSection(sectionId) {
    // Скрываем все разделы
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Убираем активный класс у кнопок навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранный раздел
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Активируем соответствующую кнопку навигации
    const activeNavBtn = document.querySelector(`.nav-btn[onclick*="${sectionId}"]`);
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }
    
    currentSection = sectionId;
    
    // Загружаем товары для раздела если нужно
    if (sectionId === 'all') {
        loadAllProducts();
    }
}

// Показ профиля (заглушка)
function showProfile() {
    alert(`👤 Профиль пользователя\n\n` +
          `Имя: ${userData.firstName}\n` +
          `Username: @${userData.username}\n` +
          `Баланс: ${userData.balance} звёзд\n` +
          `Куплено товаров: ${userData.purchases.length}`);
}

// Покупка товара
function buyProduct(productName, price) {
    if (userData.balance < price) {
        alert('❌ Недостаточно звёзд на балансе!');
        return;
    }
    
    // Обновляем попап
    document.getElementById('popupProductName').textContent = productName;
    document.getElementById('popupProductPrice').textContent = `${price} звёзд`;
    document.getElementById('popupBalance').textContent = `${userData.balance} звёзд`;
    document.getElementById('popupMessage').textContent = 
        `Вы уверены, что хотите купить "${productName}"?`;
    
    // Сохраняем данные о покупке
    window.currentPurchase = { productName, price };
    
    // Показываем попап
    document.getElementById('buyPopup').classList.add('active');
}

// Подтверждение покупки
function confirmPurchase() {
    const { productName, price } = window.currentPurchase;
    
    if (userData.balance >= price) {
        // Списание средств
        userData.balance -= price;
        
        // Добавление в историю покупок
        userData.purchases.push({
            product: productName,
            price: price,
            date: new Date().toLocaleString()
        });
        
        // Обновление интерфейса
        updateBalanceDisplay();
        
        // Закрытие попапа
        closePopup();
        
        // Показ успешного сообщения
        showSuccessMessage(productName, price);
        
        // Отправка данных в бот (если нужно)
        sendPurchaseToBot(productName, price);
    } else {
        alert('❌ Недостаточно средств!');
    }
}

// Показ сообщения об успешной покупке
function showSuccessMessage(productName, price) {
    // Создаем временное уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; 
                    padding: 15px 25px; border-radius: 10px; z-index: 3000; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
            <i class="fas fa-check-circle"></i>
            <strong>Покупка успешна!</strong><br>
            ${productName} за ${price} звёзд
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Отправка данных о покупке в бота
function sendPurchaseToBot(productName, price) {
    // Здесь можно отправить данные в бот через Telegram Web App
    const data = {
        action: 'purchase',
        product: productName,
        price: price,
        userId: userData.id,
        timestamp: new Date().getTime()
    };
    
    // Отправляем данные в Telegram бот
    tg.sendData(JSON.stringify(data));
    
    console.log('Данные о покупке отправлены:', data);
}

// Закрытие попапа
function closePopup() {
    document.getElementById('buyPopup').classList.remove('active');
    window.currentPurchase = null;
}

// Загрузка всех товаров (для раздела "Все")
function loadAllProducts() {
    // Здесь можно загружать товары с сервера
    // Пока используем заглушку
    const allProductsGrid = document.querySelector('#all-section .products-grid');
    
    if (allProductsGrid) {
        allProductsGrid.innerHTML = `
            <div class="product-card">
                <div class="product-badge telegram">Telegram</div>
                <div class="product-image telegram-img">
                    <i class="fab fa-telegram"></i>
                </div>
                <h3>Telegram Premium</h3>
                <p class="product-desc">Полный доступ ко всем функциям</p>
                <div class="product-price">
                    <i class="fas fa-star"></i>
                    <span>299 звёзд</span>
                </div>
                <button class="buy-btn" onclick="buyProduct('Telegram Premium', 299)">
                    <i class="fas fa-shopping-cart"></i> Купить
                </button>
            </div>
            
            <div class="product-card">
                <div class="product-badge steam">Steam</div>
                <div class="product-image steam-img">
                    <i class="fab fa-steam"></i>
                </div>
                <h3>CS:GO Prime Status</h3>
                <p class="product-desc">Prime статус для CS:GO</p>
                <div class="product-price">
                    <i class="fas fa-star"></i>
                    <span>599 звёзд</span>
                </div>
                <button class="buy-btn" onclick="buyProduct('CS:GO Prime', 599)">
                    <i class="fas fa-shopping-cart"></i> Купить
                </button>
            </div>
            
            <div class="product-card">
                <div class="product-badge games">Игры</div>
                <div class="product-image games-img">
                    <i class="fab fa-xbox"></i>
                </div>
                <h3>Xbox Game Pass</h3>
                <p class="product-desc">Подписка на игры</p>
                <div class="product-price">
                    <i class="fas fa-star"></i>
                    <span>399 звёзд</span>
                </div>
                <button class="buy-btn" onclick="buyProduct('Xbox Game Pass', 399)">
                    <i class="fas fa-shopping-cart"></i> Купить
                </button>
            </div>
        `;
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Фильтры товаров
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            // Здесь можно добавить фильтрацию товаров
        });
    });
    
    // Поиск товаров
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            // Здесь можно добавить поиск товаров
            console.log('Поиск:', searchTerm);
        });
    }
    
    // Обработка нажатия кнопки "Назад" в Telegram
    tg.onEvent('backButtonClicked', function() {
        if (document.getElementById('buyPopup').classList.contains('active')) {
            closePopup();
        } else {
            tg.close();
        }
    });
}

// Функции для взаимодействия с ботом
function sendDataToBot(data) {
    tg.sendData(JSON.stringify(data));
}

// Обработка входящих данных от бота
tg.onEvent('viewportChanged', function() {
    console.log('Viewport изменился');
});

tg.onEvent('themeChanged', function() {
    console.log('Тема изменилась:', tg.themeParams);
});