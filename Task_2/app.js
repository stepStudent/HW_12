// Завдання 2: Форма реєстрації з перевіркою даних
// Реалізація клієнтської валідації на чистому JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Елементи форми
    const form = document.getElementById('registrationForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const termsCheck = document.getElementById('termsCheck');

    // Елементи фідбеку
    const usernameFeedback = document.getElementById('usernameFeedback');
    const emailFeedback = document.getElementById('emailFeedback');
    const passwordFeedback = document.getElementById('passwordFeedback');
    const confirmPasswordFeedback = document.getElementById('confirmPasswordFeedback');
    const termsFeedback = document.getElementById('termsFeedback');

    // Блок успішного завершення
    const successMessage = document.getElementById('successMessage');
    const successWelcomeText = document.getElementById('successWelcomeText');
    const btnRegisterAgain = document.getElementById('btnRegisterAgain');

    // Кнопки показу / приховування пароля
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    /**
     * Регулярний вираз для валідації email
     * Перевіряє наявність локальної частини, символу @, домену та доменної зони
     */
    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    /**
     * Функція встановлення статусу валідності поля
     * @param {HTMLElement} input Елемент введення
     * @param {HTMLElement} feedbackEl Елемент тексту помилки
     * @param {boolean} isValid Чи пройшло поле перевірку
     * @param {string} errorMessage Текст помилки (якщо не пройшло)
     */
    function setFieldStatus(input, feedbackEl, isValid, errorMessage = '') {
        if (isValid) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            if (feedbackEl) feedbackEl.textContent = '';
        } else {
            input.classList.remove('is-valid');
            input.classList.add('is-invalid');
            if (feedbackEl && errorMessage) {
                feedbackEl.textContent = errorMessage;
            }
        }
        return isValid;
    }

    /**
     * Валідація поля "Ім'я користувача"
     * Вимога: мінімум 3 символи
     */
    function validateUsername() {
        const val = usernameInput.value.trim();
        if (val.length === 0) {
            return setFieldStatus(usernameInput, usernameFeedback, false, "Ім'я користувача не може бути порожнім.");
        }
        if (val.length < 3) {
            return setFieldStatus(usernameInput, usernameFeedback, false, "Ім'я повинно містити мінімум 3 символи.");
        }
        return setFieldStatus(usernameInput, usernameFeedback, true);
    }

    /**
     * Валідація поля "Email"
     * Вимога: коректний формат
     */
    function validateEmail() {
        const val = emailInput.value.trim();
        if (val.length === 0) {
            return setFieldStatus(emailInput, emailFeedback, false, "Email не може бути порожнім.");
        }
        if (!EMAIL_REGEX.test(val)) {
            return setFieldStatus(emailInput, emailFeedback, false, "Email повинен мати коректний формат (наприклад: user@example.com).");
        }
        return setFieldStatus(emailInput, emailFeedback, true);
    }

    /**
     * Валідація поля "Пароль"
     * Вимога: мінімум 8 символів
     */
    function validatePassword() {
        const val = passwordInput.value;
        if (val.length === 0) {
            return setFieldStatus(passwordInput, passwordFeedback, false, "Введіть пароль.");
        }
        if (val.length < 8) {
            return setFieldStatus(passwordInput, passwordFeedback, false, "Пароль повинен містити мінімум 8 символів.");
        }
        const isValid = setFieldStatus(passwordInput, passwordFeedback, true);

        // Якщо вже вводився повтор пароля, перевіряємо його повторно
        if (confirmPasswordInput.value.length > 0) {
            validateConfirmPassword();
        }

        return isValid;
    }

    /**
     * Валідація поля "Підтвердження пароля"
     * Вимога: паролі повинні збігатися
     */
    function validateConfirmPassword() {
        const pass = passwordInput.value;
        const confirmPass = confirmPasswordInput.value;

        if (confirmPass.length === 0) {
            return setFieldStatus(confirmPasswordInput, confirmPasswordFeedback, false, "Будь ласка, підтвердіть пароль.");
        }
        if (confirmPass !== pass) {
            return setFieldStatus(confirmPasswordInput, confirmPasswordFeedback, false, "Паролі повинні збігатися.");
        }
        return setFieldStatus(confirmPasswordInput, confirmPasswordFeedback, true);
    }

    /**
     * Валідація чекбоксу "Погоджуюсь з умовами"
     * Вимога: чекбокс має бути обов'язково відмічений
     */
    function validateTerms() {
        const isChecked = termsCheck.checked;
        if (!isChecked) {
            return setFieldStatus(termsCheck, termsFeedback, false, "Без погодження з умовами форму не можна відправити.");
        }
        return setFieldStatus(termsCheck, termsFeedback, true);
    }

    // Жива перевірка при взаємодії користувача з полями
    usernameInput.addEventListener('input', () => {
        if (usernameInput.classList.contains('is-invalid') || usernameInput.value.trim().length >= 3) {
            validateUsername();
        }
    });
    usernameInput.addEventListener('blur', validateUsername);

    emailInput.addEventListener('input', () => {
        if (emailInput.classList.contains('is-invalid')) {
            validateEmail();
        }
    });
    emailInput.addEventListener('blur', validateEmail);

    passwordInput.addEventListener('input', () => {
        if (passwordInput.classList.contains('is-invalid') || passwordInput.value.length >= 8) {
            validatePassword();
        }
    });
    passwordInput.addEventListener('blur', validatePassword);

    confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordInput.classList.contains('is-invalid') || confirmPasswordInput.value.length > 0) {
            validateConfirmPassword();
        }
    });
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);

    termsCheck.addEventListener('change', validateTerms);

    /**
     * Логіка показу / приховування пароля
     */
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            const icon = button.querySelector('i');

            if (!targetInput) return;

            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.classList.remove('bi-eye');
                icon.classList.add('bi-eye-slash');
            } else {
                targetInput.type = 'password';
                icon.classList.remove('bi-eye-slash');
                icon.classList.add('bi-eye');
            }
        });
    });

    /**
     * Обробка надсилання форми (Submit)
     */
    form.addEventListener('submit', (e) => {
        // Запобігаємо перезавантаженню сторінки
        e.preventDefault();

        // Запуск усіх перевірок
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const isTermsValid = validateTerms();

        // Якщо хоча б одне поле невалідне — зупиняємо
        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsValid) {
            // Сфокусуємось на першому невалідному полі
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
            return;
        }

        // Всі перевірки пройдено успішно!
        const registeredUsername = usernameInput.value.trim();

        // Відображаємо повідомлення «Реєстрація успішна!»
        if (successWelcomeText) {
            successWelcomeText.textContent = `Вітаємо, ${registeredUsername}! Обліковий запис успішно створено.`;
        }

        // Ховаємо форму, показуємо блок успіху
        form.classList.add('d-none');
        successMessage.classList.remove('d-none');

        // Очищаємо чутливі поля форми (паролі не зберігаємо)
        form.reset();
        [usernameInput, emailInput, passwordInput, confirmPasswordInput, termsCheck].forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
    });

    /**
     * Повернення до форми після успішної реєстрації (для повторного тестування)
     */
    if (btnRegisterAgain) {
        btnRegisterAgain.addEventListener('click', () => {
            successMessage.classList.add('d-none');
            form.classList.remove('d-none');
            usernameInput.focus();
        });
    }
});

