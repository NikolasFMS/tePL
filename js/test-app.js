// Глобальные переменные
let currentQuestion = 0;
let userAnswers = [];
let quizCompleted = false;
let questions = []; // Массив вопросов будет загружен из localStorage
let topicTitle = ''; // Название темы будет получено из localStorage
let originalQuestions = []; // Оригинальные вопросы
let answeredCorrectly = new Set(); // Множество индексов правильно отвеченных вопросов
let answeredIncorrectly = new Set(); // Множество индексов неправильно отвеченных вопросов
let currentIteration = 1; // Номер итерации для отслеживания прогресса

// Функция инициализации теста
function initQuiz() {
    // Получаем вопросы из localStorage
    const storedQuestions = localStorage.getItem('currentTopicQuestions');
    const storedTopicTitle = localStorage.getItem('currentTopicTitle');
    
    if (storedQuestions) {
        questions = JSON.parse(storedQuestions);
        // Преобразуем формат вопросов из JSON-структуры в формат, используемый в тесте
        questions = questions.map(q => ({
            question: q.text,
            options: q.options,
            correct: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            image: q.image // Добавляем поддержку изображений
        }));
        // Сохраняем оригинальные вопросы
        originalQuestions = [...questions];
    } else {
        // Если вопросы не найдены в localStorage, используем резервный вариант
        console.error('Вопросы не найдены в localStorage');
        // Здесь можно загрузить резервный набор вопросов или перенаправить пользователя
        alert('Ошибка: вопросы для теста не найдены. Пожалуйста, вернитесь на страницу выбора тем.');
        window.location.href = 'topic-selector.html';
        return;
    }
    
    if (storedTopicTitle) {
        topicTitle = storedTopicTitle;
    } else {
        topicTitle = 'Тестирование';
    }
    
    // Инициализируем массив ответов пользователя
    userAnswers = new Array(questions.length).fill(null);
    
    // Обновляем заголовок темы
    document.getElementById('topic-title').textContent = topicTitle;
    
    // Обновляем общее количество вопросов
    document.getElementById('total-questions').textContent = questions.length;
    
    // Отображаем тест
    displayQuestion();
}

// Функция для отображения текущего вопроса
function displayQuestion() {
    const container = document.getElementById('quiz-container');
    const question = questions[currentQuestion];

    let html = `
        <div class="question">
            <div class="question-text">${question.question}</div>
    `;

    // Если у вопроса есть изображение, добавляем его
    if (question.image) {
        html += `<img src="${question.image}" alt="question image" class="question-image">`;
    }

    html += `<div class="options">`;

    question.options.forEach((option, index) => {
        const isChecked = userAnswers[currentQuestion] === index;
        const isAnswered = userAnswers[currentQuestion] !== null;
        const isCorrect = isAnswered ? userAnswers[currentQuestion] === question.correct : false;
        const isWrongOption = isAnswered && index !== question.correct && index !== userAnswers[currentQuestion];
        
        let optionClass = 'option';
        if (isAnswered) {
            if (index === userAnswers[currentQuestion]) {
                optionClass += ' selected-answer';
            } else if (index === question.correct) {
                optionClass += ' correct-answer';
            } else {
                optionClass += ' wrong-answer';
            }
        }
        
        html += `
            <div class="${optionClass}">
                <label>
                    <input type="radio" name="question-${currentQuestion}" value="${index}" ${isChecked ? 'checked' : ''} ${isAnswered ? 'disabled' : ''}>
                    ${option}
                </label>
            </div>
        `;
    });
    
    html += `
            </div>
    `;
    
    // Добавляем объяснение, если вопрос уже был отвечен
    if (userAnswers[currentQuestion] !== null) {
        const isCorrect = userAnswers[currentQuestion] === question.correct;
        html += `
            <div class="explanation ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓ Правильно!' : '✗ Неправильно!'}
                <br>
                ${question.explanation}
            </div>
        `;
    }
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
    
    // Добавляем обработчики событий для радиокнопок, если вопрос еще не отвечен
    if (userAnswers[currentQuestion] === null) {
        document.querySelectorAll(`input[name="question-${currentQuestion}"]`).forEach((input, index) => {
            input.addEventListener('change', function() {
                if (!quizCompleted) {
                    userAnswers[currentQuestion] = parseInt(this.value);
                }
            });
        });
    }
    
    // Обновляем состояние кнопок
    updateButtonStates();
}

// Функция для обновления состояния кнопок
function updateButtonStates() {
    document.getElementById('prev-btn').disabled = currentQuestion === 0;

    // Показываем кнопку "Проверить ответ" если вопрос не отвечен, иначе "Следующий"
    const checkBtn = document.getElementById('check-btn');
    const nextBtn = document.getElementById('next-btn');

    if (userAnswers[currentQuestion] === null) {
        checkBtn.style.display = 'inline-block';
        nextBtn.style.display = 'none';
    } else {
        checkBtn.style.display = 'none';
        nextBtn.style.display = 'inline-block';
    }

    // Если это последний вопрос и он отвечен, показываем кнопку "Завершить"
    if (currentQuestion === questions.length - 1 && userAnswers[currentQuestion] !== null) {
        document.getElementById('submit-btn').style.display = 'inline-block';
        nextBtn.style.display = 'none';
    } else {
        document.getElementById('submit-btn').style.display = 'none';
    }
}

// Функция для проверки ответа
function checkAnswer() {
    if (userAnswers[currentQuestion] === null) {
        alert('Пожалуйста, выберите ответ перед проверкой.');
        return;
    }

    displayQuestion(); // Обновляем вопрос с объяснением
    updateButtonStates(); // Обновляем состояние кнопок
}

// Функция для перехода к следующему вопросу
function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
        updateQuestionNumberDisplay();
    }
}

// Функция для перехода к предыдущему вопросу
function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
        updateQuestionNumberDisplay();
    }
}

// Функция обновления отображения номера текущего вопроса
function updateQuestionNumberDisplay() {
    const currentQuestionElement = document.getElementById('current-question');
    if (currentQuestionElement) {
        currentQuestionElement.textContent = currentQuestion + 1;
    }
}

// Функция для завершения теста
function submitQuiz() {
    quizCompleted = true;

    // Подсчет правильных ответов
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
        if (userAnswers[i] === questions[i].correct) {
            correctCount++;
        }
    }

    // Обновляем множества правильно и неправильно отвеченных вопросов
    for (let i = 0; i < questions.length; i++) {
        const originalIndex = originalQuestions.findIndex(q => q.question === questions[i].question && q.correct === questions[i].correct);
        if (originalIndex !== -1) {
            if (userAnswers[i] === questions[i].correct) {
                answeredCorrectly.add(originalIndex);
            } else {
                answeredIncorrectly.add(originalIndex);
            }
        }
    }

    // Проверяем, есть ли неправильные ответы
    const hasIncorrectAnswers = answeredIncorrectly.size > 0;

    if (hasIncorrectAnswers) {
        // Показываем кнопку "Исправить ошибки"
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.textContent = 'Исправить ошибки';
        submitBtn.onclick = fixMistakes;
        submitBtn.style.display = 'inline-block';
        
        // Показываем промежуточный результат
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <h3>Результаты ${currentIteration} итерации</h3>
            <p>Вы ответили правильно на ${correctCount} из ${questions.length} вопросов.</p>
            <p>Осталось неправильно отвеченных вопросов: ${answeredIncorrectly.size}</p>
            <p class="result incorrect">Вам нужно исправить ошибки в следующих вопросах.</p>
        `;
        resultDiv.style.display = 'block';
        scrollToBottom();
    } else {
        // Все ответы верны, завершаем тест
        const percentage = Math.round((correctCount / questions.length) * 100);

        // Отображение результата
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `
            <h3>Результаты теста по теме "${topicTitle}"</h3>
            <p>Вы ответили правильно на ${correctCount} из ${questions.length} вопросов.</p>
            <p>Процент правильных ответов: ${percentage}%</p>
            ${percentage >= 70 ?
                `<p class="result correct">Поздравляем! Вы хорошо разбираетесь в теме "${topicTitle}".</p>` :
                `<p class="result incorrect">Вам стоит повторить материал по теме "${topicTitle}".</p>`
            }
        `;

        resultDiv.style.display = 'block';

        const prevBtn = document.getElementById('prev-btn');
        prevBtn.style.display = 'block';
        scrollToBottom();
    }
}

// Функция для исправления ошибок
function fixMistakes() {
    // Формируем новый список вопросов, исключая те, что уже были отвечены правильно
    questions = originalQuestions.filter((q, index) => !answeredCorrectly.has(index));
    
    // Обновляем массив ответов пользователя
    userAnswers = new Array(questions.length).fill(null);
    
    // Сбрасываем текущий вопрос
    currentQuestion = 0;
    
    // Обновляем отображение
    document.getElementById('total-questions').textContent = questions.length;
    document.getElementById('current-question').textContent = currentQuestion + 1;
    
    // Скрываем результаты и показываем следующий вопрос
    document.getElementById('result').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'none';
    
    // Обновляем итерацию
    currentIteration++;
    
    // Отображаем тест
    displayQuestion();
}

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight, // Прокрутка до полной высоты документа
        behavior: 'smooth'               // Делает прокрутку плавной
    });
}

// Инициализация теста
document.getElementById('total-questions').textContent = '?'; // Будет обновлено после загрузки вопросов
document.addEventListener('DOMContentLoaded', initQuiz);

// Добавляем обработчики событий для кнопок
document.getElementById('check-btn').addEventListener('click', checkAnswer);
document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.getElementById('prev-btn').addEventListener('click', prevQuestion);
document.getElementById('submit-btn').addEventListener('click', submitQuiz);