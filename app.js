'use strict';

// Початковий набір даних
const INITIAL_ITEMS = [
  {
    id: 1,
    category: 'Архітектура',
    title: 'Проєктування токенів дизайн-системи',
    description: 'Створення трирівневої структури змінних: Primitive, Semantic та Component.'
  },
  {
    id: 2,
    category: 'UX / UI',
    title: 'Моделювання станів екрана',
    description: 'Реалізація станів Loading, Content, Empty та Error для динамічного інтерфейсу.'
  },
  {
    id: 3,
    category: 'Accessibility',
    title: 'Перевірка семантики та доступності',
    description: 'Аудит клавіатурної навігації, станів :focus-visible та привʼязки атрибутів label.'
  },
  {
    id: 4,
    category: 'Тестування',
    title: 'Верифікація Light та Dark режимів',
    description: 'Перевірка контрастності елементів при перевизначенні семантичних токенів.'
  }
];

let items = [...INITIAL_ITEMS];
let loadingTimerId = null;

// DOM-елементи
const stateBlocks = document.querySelectorAll('[data-state]');
const stateButtons = document.querySelectorAll('[data-target-state]');
const cardsContainer = document.getElementById('cardsContainer');
const searchInput = document.getElementById('searchInput');
const refreshBtn = document.getElementById('refreshBtn');
const retryBtn = document.getElementById('retryBtn');
const resetDataBtn = document.getElementById('resetDataBtn');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const viewTabButtons = document.querySelectorAll('[data-view-tab]');
const viewAppSection = document.getElementById('view-app');
const viewUiKitSection = document.getElementById('view-uikit');

/**
 * Перемикання взаємовиключних станів екрана виключно через CSS-клас .is-hidden
 * @param {'loading' | 'content' | 'empty' | 'error'} stateName
 */
function renderState(stateName) {
  stateBlocks.forEach((block) => {
    const isTarget = block.dataset.state === stateName;
    block.classList.toggle('is-hidden', !isTarget);
  });

  stateButtons.forEach((btn) => {
    const isActive = btn.dataset.targetState === stateName;
    btn.classList.toggle('is-active', isActive);
  });
}

/**
 * Рендеринг карток у контейнері content
 * @param {Array} list
 */
function renderCards(list) {
  cardsContainer.innerHTML = '';

  list.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'card';

    article.innerHTML = `
      <div>
        <span class="card-badge">${item.category}</span>
        <h2 class="card-title">${item.title}</h2>
        <p class="card-desc">${item.description}</p>
      </div>
      <div class="card-footer">
        <span class="toolbar-label">ID: #${item.id}</span>
        <button type="button" class="btn btn-danger" data-delete-id="${item.id}">Видалити</button>
      </div>
    `;

    cardsContainer.appendChild(article);
  });
}

/**
 * Оновлення списку з урахуванням пошуку та автоматичним переходом у стан empty
 */
function updateContentView() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    renderState('empty');
  } else {
    renderCards(filtered);
    renderState('content');
  }
}

/**
 * Імітація асинхронного завантаження даних (1.6 сек)
 */
function simulateAsyncLoad() {
  if (loadingTimerId) {
    window.clearTimeout(loadingTimerId);
  }

  renderState('loading');

  loadingTimerId = window.setTimeout(() => {
    loadingTimerId = null;
    updateContentView();
  }, 1600);
}

// Обробники кнопок State Switcher
stateButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (loadingTimerId) {
      window.clearTimeout(loadingTimerId);
      loadingTimerId = null;
    }

    const targetState = btn.dataset.targetState;
    if (targetState === 'content') {
      if (items.length === 0) {
        items = [...INITIAL_ITEMS];
      }
      searchInput.value = '';
      updateContentView();
    } else {
      renderState(targetState);
    }
  });
});

// Видалення картки (делегування подій)
cardsContainer.addEventListener('click', (event) => {
  const deleteBtn = event.target.closest('[data-delete-id]');
  if (!deleteBtn) return;

  const idToDelete = Number(deleteBtn.dataset.deleteId);
  items = items.filter((item) => item.id !== idToDelete);
  updateContentView();
});

// Фільтрація у реальному часі
searchInput.addEventListener('input', () => {
  updateContentView();
});

// Кнопки «Оновити», «Повторити спробу» та «Відновити початковий список»
refreshBtn.addEventListener('click', simulateAsyncLoad);
retryBtn.addEventListener('click', simulateAsyncLoad);

resetDataBtn.addEventListener('click', () => {
  items = [...INITIAL_ITEMS];
  searchInput.value = '';
  updateContentView();
});

// Перемикання вкладок (Робочий екран / UI-Kit)
viewTabButtons.forEach((tabBtn) => {
  tabBtn.addEventListener('click', () => {
    const targetTab = tabBtn.dataset.viewTab;

    viewTabButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn === tabBtn);
    });

    viewAppSection.classList.toggle('is-hidden', targetTab !== 'app');
    viewUiKitSection.classList.toggle('is-hidden', targetTab !== 'uikit');
  });
});

// Перемикач теми (Light / Dark) через атрибут data-theme
themeToggleBtn.addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';

  root.setAttribute('data-theme', nextTheme);
  themeToggleBtn.textContent = nextTheme === 'dark' ? 'Світла тема' : 'Темна тема';
});

// Початкова ініціалізація
updateContentView();
