// Трекер особистих витрат — Expense Tracker
// Реалізація збереження даних, валідації та динамічного інтерфейсу

document.addEventListener('DOMContentLoaded', () => {
    // Константа для ключа LocalStorage
    const STORAGE_KEY = 'expense_tracker_items';

    // Елементи DOM
    const form = document.getElementById('expenseForm');
    const titleInput = document.getElementById('expenseTitle');
    const amountInput = document.getElementById('expenseAmount');
    const categorySelect = document.getElementById('expenseCategory');

    const totalAmountEl = document.getElementById('totalAmount');
    const totalCountInfoEl = document.getElementById('totalCountInfo');
    const expenseListEl = document.getElementById('expenseList');
    const emptyStateEl = document.getElementById('emptyState');
    const filterCategorySelect = document.getElementById('filterCategory');

    // Стан застосунку: масив витрат
    let expenses = loadExpensesFromStorage();

    // Категорії та їх конфігурація (стилі й іконки)
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
     * @returns {Array} Масив збережених витрат
     */
    function loadExpensesFromStorage() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Помилка читання з LocalStorage:', error);
            return [];
        }
    }

    /**
     * Збереження масиву витрат у LocalStorage
     */
    function saveExpensesToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
        } catch (error) {
            console.error('Помилка запису в LocalStorage:', error);
        }
    }

    /**
     * Форматування суми у формат гривні
     * @param {number} amount 
     * @returns {string} Відформатована сума
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('uk-UA', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' ₴';
    }

    /**
     * Форматування дати створення
     * @param {string} isoDate 
     * @returns {string} Читабельна дата і час
     */
    function formatDate(isoDate) {
        if (!isoDate) return '';
        const d = new Date(isoDate);
        return d.toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Автоматичне обчислення загальної суми витрат
     */
    function updateTotalAmount() {
        const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
        totalAmountEl.textContent = formatCurrency(total);
        totalCountInfoEl.textContent = `Всього записів: ${expenses.length}`;
    }

    /**
     * Рендеринг списку витрат
     */
    function renderExpenses() {
        const filter = filterCategorySelect ? filterCategorySelect.value : 'all';
        const filteredExpenses = filter === 'all' 
            ? expenses 
            : expenses.filter(item => item.category === filter);

        expenseListEl.innerHTML = '';

        if (filteredExpenses.length === 0) {
            emptyStateEl.classList.remove('d-none');
            // Якщо був фільтр, підказуємо це в тексті
            const emptyText = emptyStateEl.querySelector('p');
            if (expenses.length > 0 && filter !== 'all') {
                emptyText.textContent = `У категорії "${filter}" витрат не знайдено.`;
            } else {
                emptyText.textContent = 'Заповніть форму зліва, щоб додати свій перший запис.';
            }
        } else {
            emptyStateEl.classList.add('d-none');

            filteredExpenses.forEach(expense => {
                const config = categoryConfig[expense.category] || categoryConfig['Інше'];
                
                const card = document.createElement('div');
                card.className = 'expense-item expense-item-enter d-flex justify-content-between align-items-center gap-3';
                card.style.setProperty('--category-color', config.color);
                card.setAttribute('data-id', expense.id);

                card.innerHTML = `
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
                                ${escapeHtml(expense.title)}
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

                expenseListEl.appendChild(card);
            });
        }

        updateTotalAmount();
    }

    /**
     * Екранування HTML для безпеки (запобігання XSS)
     * @param {string} str 
     * @returns {string} Безпечний рядок
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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

    /**
     * Очищення стану валідації форми
     */
    function resetValidation() {
        [titleInput, amountInput, categorySelect].forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
    }

    // Зняття помилки валідації при вводі користувачем
    titleInput.addEventListener('input', () => {
        if (titleInput.value.trim() !== '') {
            titleInput.classList.remove('is-invalid');
        }
    });

    amountInput.addEventListener('input', () => {
        const val = parseFloat(amountInput.value);
        if (!isNaN(val) && val > 0) {
            amountInput.classList.remove('is-invalid');
        }
    });

    categorySelect.addEventListener('change', () => {
        if (categorySelect.value !== '') {
            categorySelect.classList.remove('is-invalid');
        }
    });

    /**
     * Обробка додавання нової витрати
     */
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;

        // Валідація:
        // 1. Назва не може бути порожньою
        const isTitleValid = validateField(
            titleInput, 
            title.length > 0, 
            'Назва витрати не може бути порожньою.'
        );

        // 2. Сума повинна бути більшою за нуль
        const isAmountValid = validateField(
            amountInput, 
            !isNaN(amount) && amount > 0, 
            'Сума повинна бути числом, більшим за 0.'
        );

        // 3. Категорія обов'язкова для вибору
        const isCategoryValid = validateField(
            categorySelect, 
            category !== '', 
            'Будь ласка, оберіть категорію.'
        );

        if (!isTitleValid || !isAmountValid || !isCategoryValid) {
            return;
        }

        // Створення нового об'єкта витрати
        const newExpense = {
            id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            title: title,
            amount: Number(amount.toFixed(2)),
            category: category,
            createdAt: new Date().toISOString()
        };

        // Додаємо на початок списку (найновіші зверху)
        expenses.unshift(newExpense);

        // Зберігаємо у LocalStorage
        saveExpensesToStorage();

        // Оновлюємо інтерфейс
        renderExpenses();

        // Очищаємо форму
        form.reset();
        resetValidation();
        titleInput.focus();
    });

    /**
     * Видалення витрати за ID (делегування подій)
     */
    expenseListEl.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (!deleteBtn) return;

        const expenseId = deleteBtn.getAttribute('data-id');
        const itemCard = deleteBtn.closest('.expense-item');

        if (itemCard) {
            // Плавна анімація видалення
            itemCard.classList.add('expense-item-exit');

            setTimeout(() => {
                // Видаляємо з масиву
                expenses = expenses.filter(item => item.id !== expenseId);

                // Оновлюємо сховище
                saveExpensesToStorage();

                // Оновлюємо UI
                renderExpenses();
            }, 250);
        }
    });

    /**
     * Фільтрація витрат
     */
    if (filterCategorySelect) {
        filterCategorySelect.addEventListener('change', () => {
            renderExpenses();
        });
    }

    // Початковий рендеринг при завантаженні сторінки
    renderExpenses();
});

