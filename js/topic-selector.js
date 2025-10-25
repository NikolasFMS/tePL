// Объект для управления темами тестирования
class TopicManager {
    constructor() {
        this.topics = [];
        this.selectedTopic = null;
        this.init();
    }

    // Инициализация приложения
    async init() {
        await this.loadTopicsFromJSON();
        this.setupEventListeners();
        this.renderTopics();
    }

    // Загрузка тем из JSON файла
    async loadTopicsFromJSON() {
        try {
            const response = await fetch('js/topics-data.json');
            const data = await response.json();
            // Преобразуем данные из JSON в нужный формат
            this.topics = data.topics.map(topic => ({
                id: topic.id,
                name: topic.title,
                description: topic.description,
                questionCount: topic.questions.length,
                difficulty: this.calculateTopicDifficulty(topic.questions),
                dateAdded: new Date(), // Временное значение, можно будет добавить в JSON при необходимости
                testUrl: 'test.html',
                questions: topic.questions // Сохраняем вопросы для дальнейшего использования
            }));
        } catch (error) {
            console.error('Ошибка загрузки тем из JSON:', error);
            // Если не удалось загрузить JSON, используем резервные темы
            this.topics = [
                {
                    id: 'prehistoric_art',
                    name: 'Первобытное искусство',
                    description: 'Тест по теме первобытного искусства, включая наскальные рисунки, пещерную живопись и древние артефакты.',
                    questionCount: 35,
                    difficulty: 'Средняя',
                    dateAdded: new Date('2023-01-15'),
                    testUrl: 'test.html',
                    questions: [] // В реальном сценарии вопросы будут загружены из JSON
                },
                {
                    id: 'megaliths',
                    name: 'Мегалиты',
                    description: 'Тест о мегалитах, их назначении, строении и историческом значении.',
                    questionCount: 56,
                    difficulty: 'Средняя',
                    dateAdded: new Date('2023-02-20'),
                    testUrl: 'test.html',
                    questions: []
                }
            ];
        }
    }

    // Вычисление общей сложности темы на основе вопросов
    calculateTopicDifficulty(questions) {
        if (!questions || questions.length === 0) return 'Нет данных';
        
        const difficultyCounts = { basic: 0, intermediate: 0, advanced: 0 };
        
        questions.forEach(question => {
            if (question.difficulty && difficultyCounts.hasOwnProperty(question.difficulty)) {
                difficultyCounts[question.difficulty]++;
            }
        });
        
        // Определяем преобладающий уровень сложности
        let maxCount = 0;
        let mainDifficulty = 'Средняя';
        
        for (const [difficulty, count] of Object.entries(difficultyCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mainDifficulty = this.difficultyToRussian(difficulty);
            }
        }
        
        return mainDifficulty;
    }

    // Преобразование уровня сложности на английском в русский
    difficultyToRussian(difficulty) {
        const mapping = {
            'basic': 'Базовая',
            'intermediate': 'Средняя',
            'advanced': 'Высокая'
        };
        return mapping[difficulty] || difficulty;
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Поиск тем
        const searchBox = document.querySelector('.search-box');
        if (searchBox) {
            searchBox.addEventListener('input', (e) => this.filterTopics(e.target.value));
        }

        // Сортировка тем
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => this.sortTopics(e.target.value));
        }

        // Кнопка начала теста
        const startTestBtn = document.getElementById('start-test');
        if (startTestBtn) {
            startTestBtn.addEventListener('click', () => this.startTest());
        }
    }

    // Фильтрация тем по названию
    filterTopics(searchTerm) {
        const filteredTopics = this.topics.filter(topic => 
            topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderTopics(filteredTopics);
    }

    // Сортировка тем
    sortTopics(criteria) {
        let sortedTopics = [...this.topics];
        
        switch(criteria) {
            case 'name':
                sortedTopics.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'difficulty':
                sortedTopics.sort((a, b) => a.difficulty.localeCompare(b.difficulty));
                break;
            case 'questionCount':
                sortedTopics.sort((a, b) => b.questionCount - a.questionCount);
                break;
            default:
                sortedTopics = this.topics;
        }
        
        this.renderTopics(sortedTopics);
    }

    // Отображение тем
    renderTopics(topics = null) {
        const topicGrid = document.getElementById('topic-grid');
        if (!topicGrid) return;

        const topicsToRender = topics || this.topics;
        
        topicGrid.innerHTML = '';
        
        topicsToRender.forEach(topic => {
            const topicCard = this.createTopicCard(topic);
            topicGrid.appendChild(topicCard);
        });
    }

    // Создание карточки темы
    createTopicCard(topic) {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.dataset.topicId = topic.id;
        
        card.innerHTML = `
            <h3>${topic.name}</h3>
            <p>${topic.description}</p>
            <div class="topic-info">
                <span>Вопросов: ${topic.questionCount}</span>
                <span>Сложность: ${topic.difficulty}</span>
            </div>
        `;
        
        // Добавляем обработчик клика на всю карточку
        card.addEventListener('click', (e) => {

                this.selectTopic(topic.id);
            
        });
        
        // Если тема выбрана, добавляем класс
        if (this.selectedTopic && this.selectedTopic.id === topic.id) {
            card.classList.add('selected-topic');
        }
        
        return card;
    }

    // Выбор темы
    selectTopic(topicId) {
        this.selectedTopic = this.topics.find(topic => topic.id === topicId);
        
        // Обновляем отображение карточек
        this.renderTopics();
        
        // Показываем информацию о выбранной теме
        this.showSelectedTopicInfo();
    }

    // Показ информации о выбранной теме
    showSelectedTopicInfo() {
        if (!this.selectedTopic) return;
        
        const infoDiv = document.getElementById('selected-topic-info');
        const topicNameSpan = document.getElementById('selected-topic-name');
        const questionCountSpan = document.getElementById('question-count');
        const difficultyLevelSpan = document.getElementById('difficulty-level');
        
        if (infoDiv && topicNameSpan && questionCountSpan && difficultyLevelSpan) {
            topicNameSpan.textContent = this.selectedTopic.name;
            questionCountSpan.textContent = this.selectedTopic.questionCount;
            difficultyLevelSpan.textContent = this.selectedTopic.difficulty;
            
            infoDiv.classList.add('show');
        }
    }

    // Начать тест
    startTest() {
        if (!this.selectedTopic) {
            alert('Пожалуйста, выберите тему для начала теста.');
            return;
        }
        
        // Перенаправление на страницу теста с параметром темы
        // Добавляем информацию о вопросах в localStorage для использования на странице теста
        localStorage.setItem('currentTopicQuestions', JSON.stringify(this.selectedTopic.questions));
        localStorage.setItem('currentTopicTitle', this.selectedTopic.name);
        
        window.location.href = `${this.selectedTopic.testUrl}?topic=${this.selectedTopic.id}`;
    }

    // Добавление новой темы (для масштабируемости)
    addTopic(topicData) {
        const newTopic = {
            id: topicData.id || this.generateId(),
            name: topicData.name,
            description: topicData.description || '',
            questionCount: topicData.questions ? topicData.questions.length : 0,
            difficulty: topicData.questions ? this.calculateTopicDifficulty(topicData.questions) : 'Средняя',
            dateAdded: new Date(),
            testUrl: topicData.testUrl || 'test.html',
            questions: topicData.questions || []
        };
        
        this.topics.push(newTopic);
        this.renderTopics();
    }

    // Удаление темы
    removeTopic(topicId) {
        this.topics = this.topics.filter(topic => topic.id !== topicId);
        if (this.selectedTopic && this.selectedTopic.id === topicId) {
            this.selectedTopic = null;
            this.hideSelectedTopicInfo();
        }
        this.renderTopics();
    }

    // Генерация ID для новой темы
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Скрытие информации о выбранной теме
    hideSelectedTopicInfo() {
        const infoDiv = document.getElementById('selected-topic-info');
        if (infoDiv) {
            infoDiv.classList.remove('show');
        }
    }
    
    // Метод для обновления информации о теме (для масштабируемости)
    updateTopic(topicId, updatedData) {
        const topicIndex = this.topics.findIndex(topic => topic.id === topicId);
        if (topicIndex !== -1) {
            this.topics[topicIndex] = { ...this.topics[topicIndex], ...updatedData };
            // Если обновляемая тема была выбрана, обновляем информацию
            if (this.selectedTopic && this.selectedTopic.id === topicId) {
                this.selectedTopic = this.topics[topicIndex];
                this.showSelectedTopicInfo();
            }
            this.renderTopics();
        }
    }
    
    // Метод для получения темы по ID
    getTopicById(topicId) {
        return this.topics.find(topic => topic.id === topicId);
    }
    
    // Метод для получения всех тем
    getAllTopics() {
        return this.topics;
    }
    
    // Метод для получения количества тем
    getTopicsCount() {
        return this.topics.length;
    }
    
    // Метод для получения тем по критерию (для расширения функционала)
    getTopicsBy(filterFunction) {
        return this.topics.filter(filterFunction);
    }
}

// Инициализация менеджера тем при загрузке страницы
let topicManager;
document.addEventListener('DOMContentLoaded', () => {
    topicManager = new TopicManager();
});