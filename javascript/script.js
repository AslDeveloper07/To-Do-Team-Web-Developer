let todoForm, todoInput, todoList, filterButtons, clearCompletedBtn;

let todos = [];
let currentFilter = "all"; // 'all', 'active', 'completed'

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  createUI();

  getDOMElements();

  loadTodos();

  renderTodos();

  setupEventListeners();
}

function createUI() {
  const body = document.body;

  const container = document.createElement("div");
  container.className = "todo-container";
  container.innerHTML = `
        <div class="todo-wrapper">
            <h1 class="todo-title">
                <i class="ri-checkbox-circle-line"></i>
                To-Do App
            </h1>

            <form class="todo-form" id="todoForm">
                <div class="input-group">
                    <input
                        type="text"
                        id="todoInput"
                        class="todo-input"
                        placeholder="Yangi vazifa qo'shing..."
                        autocomplete="off"
                    />
                    <button type="submit" class="add-btn">
                        <i class="ri-add-line"></i>
                        Qo'shish
                    </button>
                </div>
            </form>

            <div class="filter-buttons" id="filterButtons">
                <button class="filter-btn active" data-filter="all">
                    <i class="ri-list-check"></i>
                    Barchasi
                </button>
                <button class="filter-btn" data-filter="active">
                    <i class="ri-time-line"></i>
                    Faol
                </button>
                <button class="filter-btn" data-filter="completed">
                    <i class="ri-checkbox-circle-line"></i>
                    Bajarilgan
                </button>
            </div>

            <div class="todo-stats">
                <span id="todoCount">0 ta vazifa</span>
                <button class="clear-completed-btn" id="clearCompletedBtn">
                    <i class="ri-delete-bin-line"></i>
                    Bajarilganlarni o'chirish
                </button>
            </div>

            <ul class="todo-list" id="todoList">
                <!-- Todos will be rendered here -->
            </ul>
        </div>
    `;

  body.appendChild(container);

  if (!document.querySelector("#todoStyles")) {
    const style = document.createElement("style");
    style.id = "todoStyles";
    style.textContent = `

        `;
    document.head.appendChild(style);
  }
}

function getDOMElements() {
  todoForm = document.getElementById("todoForm");
  todoInput = document.getElementById("todoInput");
  todoList = document.getElementById("todoList");
  filterButtons = document.getElementById("filterButtons");
  clearCompletedBtn = document.getElementById("clearCompletedBtn");
}

function setupEventListeners() {
  todoForm.addEventListener("submit", handleAddTodo);

  filterButtons.addEventListener("click", handleFilterClick);

  clearCompletedBtn.addEventListener("click", handleClearCompleted);

  todoList.addEventListener("click", handleTodoAction);
  todoList.addEventListener("change", handleTodoCheckbox);
}

function handleAddTodo(e) {
  e.preventDefault();

  const text = todoInput.value.trim();

  if (!text) {
    showNotification("Iltimos, vazifa matnini kiriting!", "error");
    return;
  }

  const newTodo = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  todos.push(newTodo);

  saveTodos();

  todoInput.value = "";

  renderTodos();

  showNotification("Vazifa muvaffaqiyatli qo'shildi!", "success");
}

function handleFilterClick(e) {
  const filterBtn = e.target.closest(".filter-btn");
  if (!filterBtn) return;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  filterBtn.classList.add("active");

  // Update current filter
  currentFilter = filterBtn.dataset.filter;

  renderTodos();
}

function handleTodoAction(e) {
  const todoItem = e.target.closest(".todo-item");
  if (!todoItem) return;

  const todoId = todoItem.dataset.id;
  const action = e.target.closest(".todo-btn")?.dataset.action;

  if (action === "edit") {
    handleEditTodo(todoId);
  } else if (action === "delete") {
    handleDeleteTodo(todoId);
  } else if (action === "save") {
    handleSaveTodo(todoId);
  } else if (action === "cancel") {
    handleCancelEdit(todoId);
  }
}

function handleTodoCheckbox(e) {
  if (e.target.type !== "checkbox") return;

  const todoId = e.target.closest(".todo-item").dataset.id;
  const todo = todos.find((t) => t.id === todoId);

  if (todo) {
    todo.completed = e.target.checked;
    todo.updatedAt = new Date().toISOString();
    saveTodos();
    renderTodos();

    const message = todo.completed
      ? "Vazifa bajarildi deb belgilandi!"
      : "Vazifa faol holatga qaytarildi!";
    showNotification(message, "success");
  }
}

function handleEditTodo(todoId) {
  const todoItem = document.querySelector(`[data-id="${todoId}"]`);
  const todo = todos.find((t) => t.id === todoId);

  if (!todo || !todoItem) return;

  const todoText = todoItem.querySelector(".todo-text");
  const currentText = todoText.textContent;

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "todo-edit-input";
  editInput.value = currentText;

  todoText.style.display = "none";
  todoText.parentNode.insertBefore(editInput, todoText);
  editInput.focus();
  editInput.select();

  // Update action buttons
  const actions = todoItem.querySelector(".todo-actions");
  actions.innerHTML = `
        <button class="todo-btn save-btn" data-action="save">
            <i class="ri-save-line"></i>
            Saqlash
        </button>
        <button class="todo-btn cancel-btn" data-action="cancel">
            <i class="ri-close-line"></i>
            Bekor qilish
        </button>
    `;

  editInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSaveTodo(todoId);
    } else if (e.key === "Escape") {
      handleCancelEdit(todoId);
    }
  });
}

function handleSaveTodo(todoId) {
  const todoItem = document.querySelector(`[data-id="${todoId}"]`);
  const editInput = todoItem.querySelector(".todo-edit-input");
  const todoText = todoItem.querySelector(".todo-text");

  if (!editInput) return;

  const newText = editInput.value.trim();

  if (!newText) {
    showNotification("Vazifa matni bo'sh bo'lmasligi kerak!", "error");
    return;
  }

  const todo = todos.find((t) => t.id === todoId);
  if (todo) {
    todo.text = newText;
    todo.updatedAt = new Date().toISOString();
    saveTodos();

    todoText.textContent = newText;
    todoText.style.display = "block";
    editInput.remove();

    restoreActionButtons(todoItem);

    renderTodos();
    showNotification("Vazifa muvaffaqiyatli yangilandi!", "success");
  }
}

function handleCancelEdit(todoId) {
  const todoItem = document.querySelector(`[data-id="${todoId}"]`);
  const editInput = todoItem.querySelector(".todo-edit-input");
  const todoText = todoItem.querySelector(".todo-text");

  if (editInput) {
    editInput.remove();
    todoText.style.display = "block";
    restoreActionButtons(todoItem);
  }
}

function restoreActionButtons(todoItem) {
  const actions = todoItem.querySelector(".todo-actions");
  actions.innerHTML = `
        <button class="todo-btn edit-btn" data-action="edit">
            <i class="ri-edit-line"></i>
            Tahrirlash
        </button>
        <button class="todo-btn delete-btn" data-action="delete">
            <i class="ri-delete-bin-line"></i>
            O'chirish
        </button>
    `;
}

function handleDeleteTodo(todoId) {
  if (!confirm("Bu vazifani o'chirishni xohlaysizmi?")) {
    return;
  }

  todos = todos.filter((t) => t.id !== todoId);

  saveTodos();

  renderTodos();

  showNotification("Vazifa muvaffaqiyatli o'chirildi!", "success");
}

function handleClearCompleted() {
  const completedCount = todos.filter((t) => t.completed).length;

  if (completedCount === 0) {
    showNotification("Bajarilgan vazifalar mavjud emas!", "info");
    return;
  }

  if (
    !confirm(
      `${completedCount} ta bajarilgan vazifani o'chirishni xohlaysizmi?`
    )
  ) {
    return;
  }

  todos = todos.filter((t) => !t.completed);

  saveTodos();

  renderTodos();

  showNotification(
    `${completedCount} ta vazifa muvaffaqiyatli o'chirildi!`,
    "success"
  );
}

function renderTodos() {
  let filteredTodos = todos;

  if (currentFilter === "active") {
    filteredTodos = todos.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTodos = todos.filter((t) => t.completed);
  }

  todoList.innerHTML = "";

  if (filteredTodos.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";

    let message = "";
    let icon = "";

    if (currentFilter === "all") {
      message = "Hozircha vazifalar yo'q";
      icon = "ri-inbox-line";
    } else if (currentFilter === "active") {
      message = "Faol vazifalar yo'q";
      icon = "ri-time-line";
    } else {
      message = "Bajarilgan vazifalar yo'q";
      icon = "ri-checkbox-circle-line";
    }

    emptyState.innerHTML = `
            <i class="${icon}"></i>
            <p>${message}</p>
        `;
    todoList.appendChild(emptyState);
  } else {
    filteredTodos.forEach((todo) => {
      const todoItem = createTodoElement(todo);
      todoList.appendChild(todoItem);
    });
  }

  updateStats();
}

function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item ${todo.completed ? "completed" : ""}`;
  li.dataset.id = todo.id;

  li.innerHTML = `
        <input
            type="checkbox"
            class="todo-checkbox"
            ${todo.completed ? "checked" : ""}
        />
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <div class="todo-actions">
            <button class="todo-btn edit-btn" data-action="edit">
                <i class="ri-edit-line"></i>
                Tahrirlash
            </button>
            <button class="todo-btn delete-btn" data-action="delete">
                <i class="ri-delete-bin-line"></i>
                O'chirish
            </button>
        </div>
    `;

  return li;
}

function updateStats() {
  const totalCount = todos.length;
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const statsText = document.getElementById("todoCount");
  statsText.textContent = `Jami: ${totalCount} | Faol: ${activeCount} | Bajarilgan: ${completedCount}`;
}

function saveTodos() {
  try {
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch (error) {
    console.error("Error saving todos to localStorage:", error);
    showNotification("Ma'lumotlarni saqlashda xatolik yuz berdi!", "error");
  }
}

function loadTodos() {
  try {
    const storedTodos = localStorage.getItem("todos");
    if (storedTodos) {
      todos = JSON.parse(storedTodos);
      todos = todos.filter(
        (todo) =>
          todo && todo.id && todo.text && typeof todo.completed === "boolean"
      );
    }
  } catch (error) {
    console.error("Error loading todos from localStorage:", error);
    todos = [];
    showNotification("Ma'lumotlarni yuklashda xatolik yuz berdi!", "error");
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showNotification(message, type = "info") {
  const existing = document.querySelector(".notification");
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  if (!document.querySelector("#notificationStyles")) {
    const style = document.createElement("style");
    style.id = "notificationStyles";
    style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 10px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                animation: slideInRight 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }

            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            .notification-success {
                background: #00e226ff;
            }

            .notification-error {
                background: #fa0000ff;
            }

            .notification-info {
                background: #cad3ffff;
            }
        `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideInRight 0.3s ease reverse";
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
