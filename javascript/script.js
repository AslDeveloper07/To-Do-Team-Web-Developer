const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const addBtn = document.getElementById("add-btn");

const STORAGE_KEY = "todo-data";

function saveData() {
  localStorage.setItem(STORAGE_KEY, listContainer.innerHTML);
}

function showTask() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    listContainer.innerHTML = data;
  } else {
    listContainer.innerHTML = "";
  }
}

function addTask() {
  const text = inputBox.value.trim();
  if (!text) {
    alert("You must write something!");
    return;
  }

  const li = document.createElement("li");
  li.textContent = text;

  const span = document.createElement("span");
  span.className = "close";
  span.setAttribute("aria-label", "Delete");
  span.textContent = "×";
  li.appendChild(span);

  listContainer.appendChild(li);
  saveData();

  inputBox.value = "";
  inputBox.focus();
}

addBtn.addEventListener("click", addTask);

inputBox.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

listContainer.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    saveData();
  } else if (e.target.classList.contains("close")) {
    e.target.parentElement.remove();
    saveData();
  }
});

showTask();