/**
 * TaskFlow — Modern Vanilla JavaScript Application Controller
 * Handles REST API interaction, State Management, UI Rendering, Modals, and Theming.
 */

// Determine API Base URL dynamically
const getApiBase = () => {
  // If hosted directly on the Node backend or proxy
  if (window.location.protocol.startsWith('http')) {
    return '/api/todos';
  }
  // Fallback for file:// or external frontend runner
  return 'http://localhost:5001/api/todos';
};

const API_BASE = getApiBase();

// Application State
const state = {
  view: 'all',            // 'all' | 'today' | 'upcoming' | 'completed'
  category: 'all',        // 'all' | 'Work' | 'Study' | etc.
  priority: 'all',        // 'all' | 'low' | 'medium' | 'high'
  search: '',
  sortBy: 'createdAt',
  order: 'desc',
  tasks: [],
  stats: null,
  isLoading: false,
  editingTaskId: null,
  pendingDeleteId: null,
  theme: localStorage.getItem('taskflow_theme') || 'dark',
};

// DOM Elements Cache
const elements = {
  // Theme & Layout
  body: document.body,
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  sidebar: document.getElementById('sidebar'),
  sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),
  
  // Hero & Greeting
  heroGreeting: document.getElementById('heroGreeting'),
  heroSubDate: document.getElementById('heroSubDate'),
  heroAddTaskBtn: document.getElementById('heroAddTaskBtn'),
  quickNewTaskBtn: document.getElementById('quickNewTaskBtn'),
  mobileFabBtn: document.getElementById('mobileFabBtn'),
  
  // Search & Navigation
  searchInput: document.getElementById('searchInput'),
  viewNavList: document.getElementById('viewNavList'),
  categoryNavList: document.getElementById('categoryNavList'),
  
  // View Title & Controls
  currentViewTitle: document.getElementById('currentViewTitle'),
  viewCountBadge: document.getElementById('viewCountBadge'),
  priorityFilterSelect: document.getElementById('priorityFilterSelect'),
  sortBySelect: document.getElementById('sortBySelect'),
  clearCompletedBtn: document.getElementById('clearCompletedBtn'),
  
  // Statistics Elements
  statTotalVal: document.getElementById('statTotalVal'),
  statCompletedVal: document.getElementById('statCompletedVal'),
  statPendingVal: document.getElementById('statPendingVal'),
  statHighPriorityVal: document.getElementById('statHighPriorityVal'),
  statCompletionRate: document.getElementById('statCompletionRate'),
  statProgressBar: document.getElementById('statProgressBar'),
  statOverdueBadge: document.getElementById('statOverdueBadge'),
  
  // Sidebar Count Badges
  countAll: document.getElementById('countAll'),
  countToday: document.getElementById('countToday'),
  countUpcoming: document.getElementById('countUpcoming'),
  countCompleted: document.getElementById('countCompleted'),
  
  // Task Container & States
  taskList: document.getElementById('taskList'),
  tasksLoading: document.getElementById('tasksLoading'),
  tasksEmpty: document.getElementById('tasksEmpty'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptySubtitle: document.getElementById('emptySubtitle'),
  emptyAddTaskBtn: document.getElementById('emptyAddTaskBtn'),
  tasksError: document.getElementById('tasksError'),
  errorMessageText: document.getElementById('errorMessageText'),
  retryFetchBtn: document.getElementById('retryFetchBtn'),
  
  // Task Modal Elements
  taskModalBackdrop: document.getElementById('taskModalBackdrop'),
  modalTitle: document.getElementById('modalTitle'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  modalCancelBtn: document.getElementById('modalCancelBtn'),
  taskForm: document.getElementById('taskForm'),
  taskIdInput: document.getElementById('taskIdInput'),
  taskTitleInput: document.getElementById('taskTitleInput'),
  titleCharCount: document.getElementById('titleCharCount'),
  titleError: document.getElementById('titleError'),
  taskDescInput: document.getElementById('taskDescInput'),
  descCharCount: document.getElementById('descCharCount'),
  taskCategorySelect: document.getElementById('taskCategorySelect'),
  taskDueDateInput: document.getElementById('taskDueDateInput'),
  modalSaveBtn: document.getElementById('modalSaveBtn'),
  saveBtnSpinner: document.getElementById('saveBtnSpinner'),
  saveBtnText: document.getElementById('saveBtnText'),
  
  // Delete Modal Elements
  deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
  deleteTaskTitle: document.getElementById('deleteTaskTitle'),
  cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  
  // DB Indicator & Toasts
  dbStatusCard: document.getElementById('dbStatusCard'),
  dbStatusSub: document.getElementById('dbStatusSub'),
  toastContainer: document.getElementById('toastContainer'),
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initGreeting();
  setupEventListeners();
  loadData();
  checkBackendHealth();
});

/* ==========================================================================
   THEME CONTROLLER
   ========================================================================== */

function initTheme() {
  if (state.theme === 'light') {
    elements.body.classList.remove('theme-dark');
    elements.body.classList.add('theme-light');
  } else {
    elements.body.classList.remove('theme-light');
    elements.body.classList.add('theme-dark');
  }
}

function toggleTheme() {
  if (elements.body.classList.contains('theme-dark')) {
    elements.body.classList.remove('theme-dark');
    elements.body.classList.add('theme-light');
    state.theme = 'light';
  } else {
    elements.body.classList.remove('theme-light');
    elements.body.classList.add('theme-dark');
    state.theme = 'dark';
  }
  localStorage.setItem('taskflow_theme', state.theme);
}

/* ==========================================================================
   GREETING & DATE CONTROLLER
   ========================================================================== */

function initGreeting() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good morning, Prasham 👋';

  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon, Prasham ☀️';
  } else if (hour >= 17) {
    greeting = 'Good evening, Prasham 🌙';
  }

  elements.heroGreeting.textContent = greeting;

  // Format nice date: Monday, Sep 28, 2026
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  elements.heroSubDate.textContent = `Today is ${now.toLocaleDateString('en-US', options)}`;
}

/* ==========================================================================
   BACKEND HEALTH CHECK
   ========================================================================== */

async function checkBackendHealth() {
  try {
    const healthUrl = API_BASE.replace('/api/todos', '/api/health');
    const res = await fetch(healthUrl);
    if (res.ok) {
      elements.dbStatusCard.querySelector('.status-indicator-dot').className = 'status-indicator-dot online';
      elements.dbStatusSub.textContent = 'Node.js + MongoDB Connected';
    } else {
      throw new Error('Health check returned non-200');
    }
  } catch (err) {
    elements.dbStatusCard.querySelector('.status-indicator-dot').className = 'status-indicator-dot';
    elements.dbStatusSub.textContent = 'Server connecting...';
  }
}

/* ==========================================================================
   DATA FETCHING & API SERVICES
   ========================================================================== */

async function loadData() {
  setLoadingState(true);
  try {
    await Promise.all([fetchTasks(), fetchStats()]);
    elements.tasksError.classList.add('hidden');
  } catch (err) {
    console.error('Error loading data:', err);
    showErrorState(err.message || 'Failed to communicate with TaskFlow API');
  } finally {
    setLoadingState(false);
  }
}

async function fetchTasks() {
  const params = new URLSearchParams();

  if (state.view !== 'all') {
    params.append('status', state.view);
  }
  if (state.category !== 'all') {
    params.append('category', state.category);
  }
  if (state.priority !== 'all') {
    params.append('priority', state.priority);
  }
  if (state.search.trim()) {
    params.append('search', state.search.trim());
  }

  params.append('sortBy', state.sortBy);
  params.append('order', state.order);

  const url = `${API_BASE}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  state.tasks = result.data || [];
  renderTasks();
}

async function fetchStats() {
  try {
    const url = `${API_BASE}/stats`;
    const response = await fetch(url);
    if (!response.ok) return;

    const result = await response.json();
    state.stats = result.data;
    renderStats();
  } catch (err) {
    console.warn('Could not fetch stats:', err);
  }
}

/* ==========================================================================
   RENDERING LOGIC
   ========================================================================== */

function renderTasks() {
  elements.taskList.innerHTML = '';

  const count = state.tasks.length;
  elements.viewCountBadge.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;

  if (count === 0) {
    elements.tasksEmpty.classList.remove('hidden');
    if (state.search.trim()) {
      elements.emptyTitle.textContent = 'No matching tasks';
      elements.emptySubtitle.textContent = `No tasks matched your search query "${state.search}".`;
    } else if (state.view === 'completed') {
      elements.emptyTitle.textContent = 'No completed tasks yet';
      elements.emptySubtitle.textContent = 'Finish your pending goals to see them marked here.';
    } else {
      elements.emptyTitle.textContent = "You're all caught up!";
      elements.emptySubtitle.textContent = 'No tasks found in this view. Enjoy your day or add a new goal.';
    }
    return;
  }

  elements.tasksEmpty.classList.add('hidden');

  state.tasks.forEach((task) => {
    const taskItem = createTaskElement(task);
    elements.taskList.appendChild(taskItem);
  });
}

function createTaskElement(task) {
  const div = document.createElement('div');
  div.className = `task-item ${task.completed ? 'completed' : ''}`;
  div.setAttribute('data-id', task.id);
  div.setAttribute('role', 'listitem');

  // Priority formatting
  const priorityClass = `badge-priority-${task.priority}`;
  const priorityLabel = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  // Due Date formatting
  let dueDateBadge = '';
  if (task.dueDate) {
    const dateObj = new Date(task.dueDate);
    const dateInfo = formatDueDate(dateObj);
    dueDateBadge = `
      <span class="badge badge-date ${dateInfo.isOverdue && !task.completed ? 'overdue' : ''} ${dateInfo.isToday ? 'due-today' : ''}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${dateInfo.text}
      </span>
    `;
  }

  div.innerHTML = `
    <label class="custom-checkbox" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
      <input type="checkbox" ${task.completed ? 'checked' : ''} data-action="toggle" data-id="${task.id}">
      <span class="checkbox-mark">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
    </label>

    <div class="task-content">
      <h3 class="task-title">${escapeHTML(task.title)}</h3>
      ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
      <div class="task-badges">
        <span class="badge ${priorityClass}">
          ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} ${priorityLabel}
        </span>
        <span class="badge badge-category">
          📁 ${escapeHTML(task.category || 'General')}
        </span>
        ${dueDateBadge}
      </div>
    </div>

    <div class="task-actions">
      <button class="task-action-btn edit-btn" data-action="edit" data-id="${task.id}" title="Edit task">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      </button>
      <button class="task-action-btn delete-btn" data-action="delete" data-id="${task.id}" title="Delete task">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  `;

  return div;
}

function renderStats() {
  if (!state.stats) return;

  const { total, completed, pending, overdue, highPriority, completionRate, categories } = state.stats;

  // Stat Cards
  elements.statTotalVal.textContent = total;
  elements.statCompletedVal.textContent = completed;
  elements.statPendingVal.textContent = pending;
  elements.statHighPriorityVal.textContent = highPriority;
  elements.statCompletionRate.textContent = `${completionRate}%`;
  elements.statProgressBar.style.width = `${completionRate}%`;

  if (overdue > 0) {
    elements.statOverdueBadge.textContent = `${overdue} Overdue`;
    elements.statOverdueBadge.className = 'stat-badge stat-badge-danger';
  } else {
    elements.statOverdueBadge.textContent = 'None Overdue';
    elements.statOverdueBadge.className = 'stat-badge stat-badge-neutral';
  }

  // Sidebar count badges
  elements.countAll.textContent = total;
  elements.countCompleted.textContent = completed;

  // Calculate today & upcoming from current date
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const todayCount = state.tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d >= startOfToday && d <= endOfToday;
  }).length;

  const upcomingCount = state.tasks.filter((t) => {
    if (!t.dueDate || t.completed) return false;
    const d = new Date(t.dueDate);
    return d > endOfToday;
  }).length;

  elements.countToday.textContent = todayCount;
  elements.countUpcoming.textContent = upcomingCount;

  // Update Category Counts in Sidebar
  if (categories) {
    const catKeys = ['Work', 'Study', 'Personal', 'Fitness', 'Finance'];
    catKeys.forEach((key) => {
      const el = document.getElementById(`catCount${key}`);
      if (el) {
        el.textContent = categories[key] || 0;
      }
    });
  }
}

/* ==========================================================================
   DATE UTILS
   ========================================================================== */

function formatDueDate(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { text: 'Today', isToday: true, isOverdue: false };
  } else if (diffDays === 1) {
    return { text: 'Tomorrow', isToday: false, isOverdue: false };
  } else if (diffDays === -1) {
    return { text: 'Yesterday (Overdue)', isToday: false, isOverdue: true };
  } else if (diffDays < -1) {
    return { text: `${Math.abs(diffDays)}d overdue`, isToday: false, isOverdue: true };
  } else if (diffDays <= 7) {
    return { text: `In ${diffDays} days`, isToday: false, isOverdue: false };
  } else {
    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { text: formatted, isToday: false, isOverdue: false };
  }
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ==========================================================================
   EVENT LISTENERS & CONTROLLERS
   ========================================================================== */

function setupEventListeners() {
  // Theme toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // Mobile menu open / close
  elements.mobileMenuBtn.addEventListener('click', openSidebar);
  elements.sidebarCloseBtn.addEventListener('click', closeSidebar);
  elements.sidebarOverlay.addEventListener('click', closeSidebar);

  // Quick Add buttons
  elements.quickNewTaskBtn.addEventListener('click', () => openTaskModal());
  elements.heroAddTaskBtn.addEventListener('click', () => openTaskModal());
  elements.mobileFabBtn.addEventListener('click', () => openTaskModal());
  elements.emptyAddTaskBtn.addEventListener('click', () => openTaskModal());

  // Search Input (debounced)
  let searchTimeout;
  elements.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value;
      fetchTasks();
    }, 250);
  });

  // View Navigation (All, Today, Upcoming, Completed)
  elements.viewNavList.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (!link) return;

    elements.viewNavList.querySelectorAll('.nav-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');

    state.view = link.getAttribute('data-view');
    updateViewHeading();
    fetchTasks();
    closeSidebar();
  });

  // Category Navigation
  elements.categoryNavList.addEventListener('click', (e) => {
    const link = e.target.closest('.category-link');
    if (!link) return;

    elements.categoryNavList.querySelectorAll('.category-link').forEach((l) => l.classList.remove('active'));
    link.classList.add('active');

    state.category = link.getAttribute('data-category');
    updateViewHeading();
    fetchTasks();
    closeSidebar();
  });

  // Priority Filter
  elements.priorityFilterSelect.addEventListener('change', (e) => {
    state.priority = e.target.value;
    fetchTasks();
  });

  // Sort By
  elements.sortBySelect.addEventListener('change', (e) => {
    const [sortBy, order] = e.target.value.split('_');
    state.sortBy = sortBy;
    state.order = order;
    fetchTasks();
  });

  // Clear Completed
  elements.clearCompletedBtn.addEventListener('click', handleClearCompleted);

  // Retry Fetch
  elements.retryFetchBtn.addEventListener('click', () => loadData());

  // Task List Delegation (Toggle complete, Edit, Delete)
  elements.taskList.addEventListener('click', handleTaskListActions);

  // Task Form & Character Counters
  elements.taskTitleInput.addEventListener('input', (e) => {
    elements.titleCharCount.textContent = `${e.target.value.length}/120`;
    if (e.target.value.trim().length >= 3) {
      elements.titleError.textContent = '';
    }
  });

  elements.taskDescInput.addEventListener('input', (e) => {
    elements.descCharCount.textContent = `${e.target.value.length}/1000`;
  });

  elements.taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Modal Closers
  elements.modalCloseBtn.addEventListener('click', closeTaskModal);
  elements.modalCancelBtn.addEventListener('click', closeTaskModal);
  elements.taskModalBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.taskModalBackdrop) closeTaskModal();
  });

  // Delete Modal Closers
  elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
  elements.deleteModalBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.deleteModalBackdrop) closeDeleteModal();
  });

  // Keyboard Shortcuts (N/C -> new task, / -> search, Esc -> close modal)
  document.addEventListener('keydown', (e) => {
    // If inside an input/textarea, only handle Escape
    const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    if (e.key === 'Escape') {
      closeTaskModal();
      closeDeleteModal();
      closeSidebar();
    } else if (!isInputActive) {
      if (e.key === 'n' || e.key === 'N' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        openTaskModal();
      } else if (e.key === '/') {
        e.preventDefault();
        elements.searchInput.focus();
      }
    }
  });
}

function updateViewHeading() {
  const viewTitles = {
    all: 'All Tasks',
    today: "Today's Tasks",
    upcoming: 'Upcoming Tasks',
    completed: 'Completed Tasks',
  };

  let title = viewTitles[state.view] || 'Tasks';
  if (state.category !== 'all') {
    title += ` · ${state.category}`;
  }
  elements.currentViewTitle.textContent = title;
}

function openSidebar() {
  elements.sidebar.classList.add('open');
  elements.sidebarOverlay.classList.add('active');
}

function closeSidebar() {
  elements.sidebar.classList.remove('open');
  elements.sidebarOverlay.classList.remove('active');
}

/* ==========================================================================
   TASK ACTIONS HANDLER (LIST DELEGATION)
   ========================================================================== */

async function handleTaskListActions(e) {
  const toggleCheckbox = e.target.closest('[data-action="toggle"]');
  const editBtn = e.target.closest('[data-action="edit"]');
  const deleteBtn = e.target.closest('[data-action="delete"]');

  if (toggleCheckbox) {
    const id = toggleCheckbox.getAttribute('data-id');
    const completed = toggleCheckbox.checked;
    await toggleTaskCompletion(id, completed);
  } else if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    openTaskModal(id);
  } else if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    openDeleteModal(id);
  }
}

async function toggleTaskCompletion(id, completed) {
  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });

    if (!res.ok) throw new Error('Failed to update task');

    const result = await res.json();
    showToast(completed ? 'Task completed! Great work 🎉' : 'Task marked as pending', 'success');

    // Update local state item
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      task.completed = completed;
    }

    // Refresh views & stats
    fetchStats();
    if (state.view !== 'all') {
      fetchTasks();
    } else {
      const card = elements.taskList.querySelector(`[data-id="${id}"]`);
      if (card) {
        if (completed) card.classList.add('completed');
        else card.classList.remove('completed');
      }
    }
  } catch (err) {
    showToast(err.message || 'Error updating task', 'error');
    fetchTasks();
  }
}

/* ==========================================================================
   MODAL CONTROLLER (CREATE & EDIT)
   ========================================================================== */

function openTaskModal(taskId = null) {
  state.editingTaskId = taskId;
  elements.titleError.textContent = '';

  if (taskId) {
    // Edit Mode
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    elements.modalTitle.textContent = 'Edit Task';
    elements.saveBtnText.textContent = 'Update Task';
    elements.taskIdInput.value = task.id;
    elements.taskTitleInput.value = task.title;
    elements.taskDescInput.value = task.description || '';
    elements.taskCategorySelect.value = task.category || 'General';

    // Set Priority Radio
    const priorityRadio = document.querySelector(`input[name="priority"][value="${task.priority}"]`);
    if (priorityRadio) priorityRadio.checked = true;

    // Set Due Date (format YYYY-MM-DD for date input)
    if (task.dueDate) {
      elements.taskDueDateInput.value = task.dueDate.split('T')[0];
    } else {
      elements.taskDueDateInput.value = '';
    }
  } else {
    // Create Mode
    elements.modalTitle.textContent = 'Create New Task';
    elements.saveBtnText.textContent = 'Save Task';
    elements.taskForm.reset();
    elements.taskIdInput.value = '';
    document.getElementById('priorityMedium').checked = true;

    // Default category to active filter category if specific
    if (state.category !== 'all') {
      elements.taskCategorySelect.value = state.category;
    } else {
      elements.taskCategorySelect.value = 'General';
    }
  }

  // Update char counters
  elements.titleCharCount.textContent = `${elements.taskTitleInput.value.length}/120`;
  elements.descCharCount.textContent = `${elements.taskDescInput.value.length}/1000`;

  elements.taskModalBackdrop.classList.add('open');
  elements.taskModalBackdrop.setAttribute('aria-hidden', 'false');
  setTimeout(() => elements.taskTitleInput.focus(), 100);
}

function closeTaskModal() {
  elements.taskModalBackdrop.classList.remove('open');
  elements.taskModalBackdrop.setAttribute('aria-hidden', 'true');
  state.editingTaskId = null;
}

async function handleTaskFormSubmit(e) {
  e.preventDefault();

  const title = elements.taskTitleInput.value.trim();
  const description = elements.taskDescInput.value.trim();
  const category = elements.taskCategorySelect.value;
  const dueDate = elements.taskDueDateInput.value || null;
  const priority = document.querySelector('input[name="priority"]:checked')?.value || 'medium';

  // Front-end validation
  if (!title) {
    elements.titleError.textContent = 'Please enter a task title.';
    elements.taskTitleInput.focus();
    return;
  }
  if (title.length < 3) {
    elements.titleError.textContent = 'Title must be at least 3 characters long.';
    elements.taskTitleInput.focus();
    return;
  }

  // Show loading state
  elements.saveBtnSpinner.classList.remove('hidden');
  elements.modalSaveBtn.disabled = true;

  try {
    const isEdit = Boolean(state.editingTaskId);
    const url = isEdit ? `${API_BASE}/${state.editingTaskId}` : API_BASE;
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = {
      title,
      description,
      priority,
      category,
      dueDate,
    };

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Operation failed');
    }

    closeTaskModal();
    showToast(isEdit ? 'Task updated successfully' : 'Task created successfully', 'success');

    // Refresh tasks & stats
    await Promise.all([fetchTasks(), fetchStats()]);
  } catch (err) {
    elements.titleError.textContent = err.message || 'Failed to save task';
  } finally {
    elements.saveBtnSpinner.classList.add('hidden');
    elements.modalSaveBtn.disabled = false;
  }
}

/* ==========================================================================
   DELETE MODAL CONTROLLER
   ========================================================================== */

function openDeleteModal(id) {
  state.pendingDeleteId = id;
  const task = state.tasks.find((t) => t.id === id);
  elements.deleteTaskTitle.textContent = task ? `"${task.title}"` : 'this task';
  elements.deleteModalBackdrop.classList.add('open');
  elements.deleteModalBackdrop.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  elements.deleteModalBackdrop.classList.remove('open');
  elements.deleteModalBackdrop.setAttribute('aria-hidden', 'true');
  state.pendingDeleteId = null;
}

async function handleConfirmDelete() {
  if (!state.pendingDeleteId) return;

  const id = state.pendingDeleteId;
  closeDeleteModal();

  try {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete task');

    showToast('Task deleted successfully', 'info');
    await Promise.all([fetchTasks(), fetchStats()]);
  } catch (err) {
    showToast(err.message || 'Error deleting task', 'error');
  }
}

/* ==========================================================================
   CLEAR COMPLETED ACTION
   ========================================================================== */

async function handleClearCompleted() {
  const completedTasks = state.tasks.filter((t) => t.completed);
  if (completedTasks.length === 0) {
    showToast('No completed tasks to clear', 'info');
    return;
  }

  if (!confirm(`Are you sure you want to clear all ${completedTasks.length} completed task(s)?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/actions/clear-completed`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to clear completed tasks');

    const result = await res.json();
    showToast(result.message || 'Completed tasks cleared', 'success');
    await Promise.all([fetchTasks(), fetchStats()]);
  } catch (err) {
    showToast(err.message || 'Error clearing tasks', 'error');
  }
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <div class="toast-content">
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
    <div class="toast-progress"></div>
  `;

  elements.toastContainer.appendChild(toast);

  // Auto-remove after 3.5s
  setTimeout(() => {
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

/* ==========================================================================
   UI STATE HELPERS
   ========================================================================== */

function setLoadingState(isLoading) {
  state.isLoading = isLoading;
  if (isLoading) {
    elements.tasksLoading.classList.remove('hidden');
    elements.taskList.classList.add('hidden');
    elements.tasksEmpty.classList.add('hidden');
    elements.tasksError.classList.add('hidden');
  } else {
    elements.tasksLoading.classList.add('hidden');
    elements.taskList.classList.remove('hidden');
  }
}

function showErrorState(message) {
  elements.tasksError.classList.remove('hidden');
  elements.taskList.classList.add('hidden');
  elements.tasksEmpty.classList.add('hidden');
  elements.errorMessageText.textContent = message;
}
