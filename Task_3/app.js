// Завдання 3: Expense Tracker Pro — Статистика, Пошук та Фільтрація
// Реалізація розширеного функціоналу на чистому JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Ключ у LocalStorage
    const STORAGE_KEY = 'expense_tracker_pro_data';

    // Елементи форми
    const form = document.getElementById('expenseForm');
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const categorySelect = document.getElementById('expenseCategory');

    // Елементи пошуку та фільтрації
    const searchInput = document.getElementById('searchInput');
    const btnClearSearch = document.getElementById('btnClearSearch');
    const categoryFilterButtons = document.querySelectorAll('.btn-category-filter');

    // Лічильники фільтрів
    const filterCountAll = document.getElementById('filterCountAll');
    const filterCountFood = document.getElementById('filterCountFood');
    const filterCountTransport = document.getElementById('filterCountTransport');
    const filterCountShopping = document.getElementById('filterCountShopping');
    const filterCountOther = document.getElementById('filterCountOther');

    // Елементи статистики
    const totalAmountEl = document.getElementById('totalAmount');
    const totalCountEl = document.getElementById('totalCount');

    const statFoodAmountEl = document.getElementById('statFoodAmount');
    const statFoodCountEl = document.getElementById('statFoodCount');
    const statFoodPercentEl = document.getElementById('statFoodPercent');

    const statTransportAmountEl = document.getElementById('statTransportAmount');
    const statTransportCountEl = document.getElementById('statTransportCount');
    const statTransportPercentEl = document.getElementById('statTransportPercent');

    const statShoppingAmountEl = document.getElementById('statShoppingAmount');
    const statShoppingCountEl = document.getElementById('statShoppingCount');
    const statShoppingPercentEl = document.getElementById('statShoppingPercent');

    const statOtherAmountEl = document.getElementById('statOtherAmount');
    const statOtherCountEl = document.getElementById('statOtherCount');
    const statOtherPercentEl = document.getElementById('statOtherPercent');

    // Елементи списку витрат
    const expenseListEl = document.getElementById('expenseList');
    const emptyStateEl = document.getElementById('emptyState');
    const emptyStateTitle = document.getElementById('emptyStateTitle');
    const emptyStateSubtitle = document.getElementById('emptyStateSubtitle');
    const filteredCountText = document.getElementById('filteredCountText');
    const filteredSumText = document.getElementById('filteredSumText');

    // Елементи очищення всіх витрат
    const btnOpenClearModal = document.getElementById('btnOpenClearModal');
    const btnConfirmClear = document.getElementById('btnConfirmClear');
    const clearModalElement = document.getElementById('clearConfirmModal');
    const clearModal = new bootstrap.Modal(clearModalElement);

    // Стан застосунку
    let expenses = loadExpenses();
    let currentCategory = 'all';
    let searchQuery = '';

    // Конфігурація категорій
    const categoryConfig = {
        'Їжа': {
            badgeClass: 'category-badge-food',
            icon: 'bi-cup-hot',
            color: '#f97316'
        },
        'Транспорт, пальне': {
            badgeClass: 'category-badge-transport',
            icon: 'bi-fuel-pump',
            color: '#0284c7'
        },
        'Покупки': {
            badgeClass: 'category-badge-shopping',
            icon: 'bi-bag-check',
            color: '#10b981'
        },
        'Інше': {
            badgeClass: 'category-badge-other',
            icon: 'bi-tag',
            color: '#8b5cf6'
        }
    };

    /**
     * Завантаження витрат із LocalStorage
     * @returns {Array} Масив збережених об'єктів витрат
     */
    function loadExpenses() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Помилка завантаження з LocalStorage:', error);
            return [];
        }
    }

    /**
     * Збереження витрат у LocalStorage
     */
    function saveExpenses() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        } catch (error) {
            console.error('Помилка запису в LocalStorage:', error);
        }
    }

    /**
     * Форматування суми
     * @param {number} amount 
     * @returns {string} 0.00 ₴
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('uk-UA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' ₴';
    }

    /**
     * Форматування дати
     * @param {string} isoString 
     * @returns {string} Читабельна дата і час
     */
    function formatDate(isoString) {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Екранування HTML-символів (захист від XSS)
     * @param {string} str 
     * @returns {string}
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Підсвітка збігів пошукового запиту в назві витрати
     * @param {string} title 
     * @param {string} query 
     * @returns {string} HTML рядок з тегами <mark>
     */
    function highlightQuery(title, query) {
        if (!query) return escapeHtml(title);

        const safeTitle = escapeHtml(title);
        const safeQuery = escapeHtml(query);
        const regex = new RegExp(`(${safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return safeTitle.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    /**
     * Оновлення блоку статистики та бейджів лічильників
     */
    function updateStatistics() {
        const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
        totalAmountEl.textContent = formatCurrency(total);
        totalCountEl.textContent = `${expenses.length} витрат`;

        // Підрахунок окремо для кожної категорії
        const stats = {
            'Їжа': { sum: 0, count: 0 },
            'Транспорт, пальне': { sum: 0, count: 0 },
            'Покупки': { sum: 0, count: 0 },
            'Інше': { sum: 0, count: 0 }
        };

        expenses.forEach(item => {
            if (stats[item.category]) {
                stats[item.category].sum += Number(item.amount);
                stats[item.category].count += 1;
            }
        });

        const calcPercent = (sum) => {
            if (total === 0 || sum === 0) return '0%';
            return Math.round((sum / total) * 100) + '%';
        };

        // Їжа
        statFoodAmountEl.textContent = formatCurrency(stats['Їжа'].sum);
        statFoodCountEl.textContent = `${stats['Їжа'].count} записів`;
        statFoodPercentEl.textContent = calcPercent(stats['Їжа'].sum);

        // Транспорт, пальне
        statTransportAmountEl.textContent = formatCurrency(stats['Транспорт, пальне'].sum);
        statTransportCountEl.textContent = `${stats['Транспорт, пальне'].count} записів`;
        statTransportPercentEl.textContent = calcPercent(stats['Транспорт, пальне'].sum);

        // Покупки
        statShoppingAmountEl.textContent = formatCurrency(stats['Покупки'].sum);
        statShoppingCountEl.textContent = `${stats['Покупки'].count} записів`;
        statShoppingPercentEl.textContent = calcPercent(stats['Покупки'].sum);

        // Інше
        statOtherAmountEl.textContent = formatCurrency(stats['Інше'].sum);
        statOtherCountEl.textContent = `${stats['Інше'].count} записів`;
        statOtherPercentEl.textContent = calcPercent(stats['Інше'].sum);

        // Оновлення лічильників на кнопках фільтрів
        filterCountAll.textContent = expenses.length;
        filterCountFood.textContent = stats['Їжа'].count;
        filterCountTransport.textContent = stats['Транспорт, пальне'].count;
        filterCountShopping.textContent = stats['Покупки'].count;
        filterCountOther.textContent = stats['Інше'].count;
    }

    /**
     * Рендеринг списку витрат з урахуванням активного фільтра та пошукового запиту
     */
    function renderList() {
        // Фільтрація за категорією
        let result = expenses;
        if (currentCategory !== 'all') {
            result = result.filter(item => item.category === currentCategory);
        }

        // Пошук за назвою в реальному часі
        const query = searchQuery.trim().toLowerCase();
        if (query) {
            result = result.filter(item => item.title.toLowerCase().includes(query));
        }

        // Очищення списку
        expenseListEl.innerHTML = '';

        // Перевірка на порожній стан
        if (result.length === 0) {
            emptyStateEl.classList.remove('d-none');

            if (expenses.length === 0) {
                emptyStateTitle.textContent = 'Витрат ще немає';
                emptyStateSubtitle.textContent = 'Додайте нову витрату через форму зліва.';
            } else if (query && currentCategory !== 'all') {
                emptyStateTitle.textContent = 'Нічого не знайдено';
                emptyStateSubtitle.textContent = `За запитом "${searchQuery}" у категорії "${currentCategory}" нічого не знайдено.`;
            } else if (query) {
                emptyStateTitle.textContent = 'Нічого не знайдено';
                emptyStateSubtitle.textContent = `За запитом "${searchQuery}" витрат не знайдено.`;
            } else {
                emptyStateTitle.textContent = 'Категорія порожня';
                emptyStateSubtitle.textContent = `У категорії "${currentCategory}" ще немає витрат.`;
            }
        } else {
            emptyStateEl.classList.add('d-none');

            result.forEach(expense => {
                const config = categoryConfig[expense.category] || categoryConfig['Інше'];

                const item = document.createElement('div');
                item.className = 'expense-item expense-item-enter d-flex justify-content-between align-items-center gap-3';
                item.style.setProperty('--category-color', config.color);
                item.setAttribute('data-id', expense.id);

                const highlightedTitle = highlightQuery(expense.title, searchQuery.trim());

                item.innerHTML = `
                    <div class="d-flex align-items-center gap-3 overflow-hidden">
                        <div class="flex-grow-1 min-w-0">
                            <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                <span class="category-badge ${config.badgeClass}">
                                    <i class="bi ${config.icon}"></i>
                                    ${expense.category}
                                </span>
                                <span class="text-muted small" style="font-size: 0.75rem;">
                                    ${formatDate(expense.createdAt)}
                                </span>
                            </div>
                            <h6 class="mb-0 fw-semibold text-dark text-truncate" title="${escapeHtml(expense.title)}">
                                ${highlightedTitle}
                            </h6>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3 ms-auto flex-shrink-0">
                        <span class="expense-amount text-primary">
                            -${formatCurrency(expense.amount)}
                        </span>
                        <button type="button" class="btn-delete" title="Видалити витрату" data-id="${expense.id}" aria-label="Видалити">
                            <i class="bi bi-trash3 fs-5 pointer-events-none"></i>
                        </button>
                    </div>
                `;

                expenseListEl.appendChild(item);
            });
        }

        // Оновлення підсумку вибірки у футері
        const filteredSum = result.reduce((sum, item) => sum + Number(item.amount), 0);
        filteredCountText.textContent = `Показано: ${result.length} із ${expenses.length} записів`;
        filteredSumText.textContent = `Сума вибірки: ${formatCurrency(filteredSum)}`;

        // Оновлюємо статистику
        updateStatistics();
    }

    /**
     * Валідація окремого поля
     */
    function validateField(input, isValid, feedbackMessage = '') {
        const feedbackEl = input.parentElement.querySelector('.invalid-feedback');
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            if (feedbackEl && feedbackMessage) {
                feedbackEl.textContent = feedbackMessage;
            }
        }
        return isValid;
    }

    function resetValidation() {
        [titleInput, amountInput, categorySelect].forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
    }

    // Зняття помилок при вводі
    titleInput.addEventListener('input', () => {
        if (titleInput.value.trim() !== '') titleInput.classList.remove('is-invalid');
    });
    amountInput.addEventListener('input', () => {
        const val = parseFloat(amountInput.value);
        if (!isNaN(val) && val > 0) amountInput.classList.remove('is-invalid');
    });
    categorySelect.addEventListener('change', () => {
        if (categorySelect.value !== '') categorySelect.classList.remove('is-invalid');
    });

    /**
     * Додавання витрати (Submit)
     */
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;

        const isTitleValid = validateField(titleInput, title.length > 0, 'Назва не може бути порожньою.');
        const isAmountValid = validateField(amountInput, !isNaN(amount) && amount > 0, 'Сума повинна бути більшою за 0.');
        const isCategoryValid = validateField(categorySelect, category !== '', 'Будь ласка, оберіть категорію.');

        if (!isTitleValid || !isAmountValid || !isCategoryValid) {
            return;
        }

        const newExpense = {
            id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            title: title,
            amount: Number(amount.toFixed(2)),
            category: category,
            createdAt: new Date().toISOString()
        };

        // Додаємо на початок
        expenses.unshift(newExpense);
        saveExpenses();

        // Очищаємо форму
        form.reset();
        resetValidation();
        titleInput.focus();

        renderList();
    });

    /**
     * Видалення окремої витрати
     */
    expenseListEl.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (!deleteBtn) return;

        const expenseId = deleteBtn.getAttribute('data-id');
        const itemCard = deleteBtn.closest('.expense-item');

        if (itemCard) {
            itemCard.classList.add('expense-item-exit');
            setTimeout(() => {
                expenses = expenses.filter(item => item.id !== expenseId);
                saveExpenses();
                renderList();
            }, 200);
        }
    });

    /**
     * Пошук у реальному часі
     */
    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value;
        if (searchQuery.trim().length > 0) {
            btnClearSearch.classList.remove('d-none');
        } else {
            btnClearSearch.classList.add('d-none');
        }
        renderList();
    });

    // Очищення поля пошуку
    btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        btnClearSearch.classList.add('d-none');
        searchInput.focus();
        renderList();
    });

    /**
     * Фільтрація за категорією через кнопки
     */
    categoryFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            currentCategory = button.getAttribute('data-category');
            renderList();
        });
    });

    /**
     * Очистити всі витрати з підтвердженням
     */
    btnOpenClearModal.addEventListener('click', () => {
        if (expenses.length === 0) {
            alert('Список витрат уже порожній.');
            return;
        }
        clearModal.show();
    });

    btnConfirmClear.addEventListener('click', () => {
        // Очищаємо всі витрати
        expenses = [];
        saveExpenses();

        // Скидаємо пошук
        searchInput.value = '';
        searchQuery = '';
        btnClearSearch.classList.add('d-none');

        // Закриваємо модальне вікно
        clearModal.hide();

        // Оновлюємо інтерфейс
        renderList();
    });

    // Початковий рендеринг
    renderList();
});

