const buttonAdd = document.getElementById("add-entry");
const buttonClearAll = document.getElementById("clear-all");
const tbody = document.getElementById("results-table-body");

const modal = document.getElementById("delete-modal");
const confirmBtn = document.getElementById("confirm-delete");
const cancelBtn = document.getElementById("cancel-delete");

let rowToDelete = null;

window.addEventListener("DOMContentLoaded", () => {
  const saved = loadFromLocalStorage();
  saved.forEach(entry => renderRow(entry));
});

function saveToLocalStorage(data) {
  localStorage.setItem("pressureData", JSON.stringify(data));
}

function loadFromLocalStorage() {
  return JSON.parse(localStorage.getItem("pressureData")) || [];
}

// відміна видалення
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  rowToDelete = null;
});

// підтвердження виделення рядка
confirmBtn.addEventListener("click", () => {
  if (rowToDelete) {
    const rowId = rowToDelete.dataset.id;
    const currentData = loadFromLocalStorage();
    const updatedData = currentData.filter(entry => String(entry.id) !== rowId);
    saveToLocalStorage(updatedData);
    rowToDelete.remove();
    rowToDelete = null;
  }

  modal.classList.add("hidden");
});

// добавляємо новий запис
buttonAdd.addEventListener("click", (e) => {
  e.preventDefault();

  const systolicInput = document.getElementById("systolic").value.trim();
  const diastolicInput = document.getElementById("diastolic").value.trim();
  const pulseInput = document.getElementById("pulse").value.trim();

  if (!systolicInput || !diastolicInput) {
    alert("Введіть верхній та нижній тиск");
    return;
  }

  const now = new Date();
  const date = now.toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const entry = {
    id: Date.now(), // унікальний id
    date,
    systolic: systolicInput,
    diastolic: diastolicInput,
    pulse: pulseInput
  };

  renderRow(entry);

  const currentData = loadFromLocalStorage();
  currentData.push(entry);
  saveToLocalStorage(currentData);

  document.getElementById("pressure-form").reset();
});

// відображення рядка в таблиці
function renderRow({ id, date, systolic, diastolic, pulse }) {
  const newRow = document.createElement("tr");
  newRow.className = "bg-gray-50 hover:bg-gray-100 transition py-3";
  newRow.dataset.id = String(id); // прив'язуємо ID до рядка

  newRow.innerHTML = `
    <td class="px-3 py-2 border border-gray-300">${date}</td>
    <td class="px-3 py-2 border border-gray-300 text-blue-700">
      <span class="systolic-value">${systolic}</span> / 
      <span class="diastolic-value">${diastolic}</span>
    </td>
    <td class="px-3 py-2 border border-gray-300 text-blue-700 text-center">${pulse}</td>
    <td class="px-3 py-2 border border-gray-300 text-center space-x-2">
      <button class="delete-btn inline-block">
        <img src="./icons/delete.png" alt="Видалити" />
      </button>
    </td>
  `;

  const systolicSpan = newRow.querySelector(".systolic-value");
  const diastolicSpan = newRow.querySelector(".diastolic-value");

  if (Math.abs(parseInt(systolic) - 120) > 5)
    systolicSpan.classList.add("text-white", "bg-rose-600", "py-1", "px-2", "font-semibold", "rounded");

  if (Math.abs(parseInt(diastolic) - 80) > 5)
    diastolicSpan.classList.add("text-white", "bg-rose-600", "py-1", "px-2", "font-semibold", "rounded");

  const deleteBtn = newRow.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    rowToDelete = newRow;
    modal.classList.remove("hidden");
  });

  tbody.appendChild(newRow);
}

//  видалення всіх записів
buttonClearAll.addEventListener("click", () => {
  if (tbody.children.length === 0) {
    alert("Таблиця порожня");
    return;
  }

  const confirmed = confirm("Ви впевнені, що хочете видалити всі записи?");
  if (confirmed) {
    tbody.innerHTML = "";
    localStorage.removeItem("pressureData");
  }
});

// реєстрація Service Worker для PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/PulseNoteApp/serviceWorker.js")
      .then(() => console.log("Service Worker зареєстрований"))
      .catch((err) => console.error("Помилка реєстрації:", err));
  });
}
