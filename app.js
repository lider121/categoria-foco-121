import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "PEGA_AQUI_TU_AUTH_DOMAIN",
  projectId: "PEGA_AQUI_TU_PROJECT_ID",
  storageBucket: "PEGA_AQUI_TU_STORAGE_BUCKET",
  messagingSenderId: "PEGA_AQUI_TU_MESSAGING_SENDER_ID",
  appId: "PEGA_AQUI_TU_APP_ID"
};

const STORE_ID = "121";
const COLLECTION_NAME = "categoria_foco_121";

const categories = [
  { code: "82", name: "Check-Out" },
  { code: "08", name: "Mascota" },
  { code: "92", name: "Bebidas-Café" },
  { code: "14", name: "Artículos y Hogar" },
  { code: "10", name: "Automotriz" },
  { code: "20", name: "Cocina y Bano" },
  { code: "09", name: "Deportes" },
  { code: "15", name: "Electrodomésticos" },
  { code: "53", name: "Descartables y Cumpleaños" },
  { code: "22", name: "Ropa de Cama" },
  { code: "87", name: "Teléfono" }
];

const elements = {
  averageDelta: document.querySelector("#averageDelta"),
  categoriesGrid: document.querySelector("#categoriesGrid"),
  connectionStatus: document.querySelector("#connectionStatus"),
  copyButton: document.querySelector("#copyButton"),
  criticalList: document.querySelector("#criticalList"),
  customNameInput: document.querySelector("#customNameInput"),
  customNameWrap: document.querySelector("#customNameWrap"),
  dateInput: document.querySelector("#dateInput"),
  form: document.querySelector("#evaluationForm"),
  formAverage: document.querySelector("#formAverage"),
  formMessage: document.querySelector("#formMessage"),
  headerAverage: document.querySelector("#headerAverage"),
  historyList: document.querySelector("#historyList"),
  nameSelect: document.querySelector("#nameSelect"),
  observationsInput: document.querySelector("#observationsInput"),
  openWhatsappLink: document.querySelector("#openWhatsappLink"),
  refreshButton: document.querySelector("#refreshButton"),
  whatsappButton: document.querySelector("#whatsappButton"),
  whatsappDialog: document.querySelector("#whatsappDialog"),
  whatsappText: document.querySelector("#whatsappText")
};

let db = null;
let previousRecord = null;
let currentRecord = null;

init();

function init() {
  renderCategoryInputs();
  elements.dateInput.value = getToday();
  bindEvents();
  connectFirebase();
  updateComputedState();
}

function bindEvents() {
  elements.form.addEventListener("input", updateComputedState);
  elements.form.addEventListener("submit", saveRecord);
  elements.nameSelect.addEventListener("change", handleNameChange);
  elements.dateInput.addEventListener("change", handleDateChange);
  elements.refreshButton.addEventListener("click", loadHistory);
  elements.whatsappButton.addEventListener("click", showWhatsappMessage);
  elements.copyButton.addEventListener("click", copyWhatsappMessage);
}

function renderCategoryInputs() {
  elements.categoriesGrid.innerHTML = categories
    .map((category) => {
      const id = `cat-${category.code}`;
      return `
        <label class="category-card" for="${id}">
          <span class="category-name">
            <span class="category-code">${category.code}</span>
            ${category.name}
          </span>
          <input id="${id}" name="${category.code}" type="number" min="0" max="100" step="1" inputmode="numeric" required />
        </label>
      `;
    })
    .join("");
}

function connectFirebase() {
  if (firebaseConfig.projectId.includes("PEGA_AQUI")) {
    setStatus("Firebase pendiente", "pending");
    setMessage("Pega la configuracion de Firebase en app.js para guardar en Firestore.");
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    setStatus("Firebase conectado", "ready");
    handleDateChange();
    loadHistory();
  } catch (error) {
    console.error(error);
    setStatus("Error Firebase", "error");
    setMessage("No se pudo conectar con Firebase. Revisa la configuracion.");
  }
}

async function handleDateChange() {
  currentRecord = null;
  previousRecord = null;
  updateComputedState();

  if (!db || !elements.dateInput.value) return;

  await loadRecordForDate(elements.dateInput.value);
  await loadPreviousRecord(elements.dateInput.value);
  updateComputedState();
}

function handleNameChange() {
  const isOther = elements.nameSelect.value === "__other";
  elements.customNameWrap.classList.toggle("hidden", !isOther);
  elements.customNameInput.required = isOther;
}

async function loadRecordForDate(date) {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, buildDocId(date)));
    if (!snapshot.exists()) {
      clearFormValues(false);
      setMessage("");
      return;
    }

    currentRecord = snapshot.data();
    fillForm(currentRecord);
    setMessage("Ya existe un registro para esta fecha. Al guardar se actualizara el mismo registro.");
  } catch (error) {
    console.error(error);
    setMessage("No se pudo cargar el registro de la fecha.");
  }
}

async function loadPreviousRecord(date) {
  if (!db) return;

  try {
    const previousQuery = query(
      collection(db, COLLECTION_NAME),
      where("date", "<", date),
      orderBy("date", "desc"),
      limit(1)
    );
    const snapshot = await getDocs(previousQuery);
    previousRecord = snapshot.empty ? null : snapshot.docs[0].data();
  } catch (error) {
    console.error(error);
    previousRecord = null;
  }
}

async function loadHistory() {
  if (!db) return;

  try {
    const historyQuery = query(collection(db, COLLECTION_NAME), orderBy("date", "desc"), limit(20));
    const snapshot = await getDocs(historyQuery);
    const records = snapshot.docs.map((item) => item.data());

    elements.historyList.innerHTML = records.length
      ? records.map(renderHistoryItem).join("")
      : `<p class="form-message">Sin registros todavia.</p>`;

    elements.historyList.querySelectorAll("button[data-date]").forEach((button) => {
      button.addEventListener("click", () => {
        elements.dateInput.value = button.dataset.date;
        handleDateChange();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  } catch (error) {
    console.error(error);
    elements.historyList.innerHTML = `<p class="form-message">No se pudo cargar el historial.</p>`;
  }
}

async function saveRecord(event) {
  event.preventDefault();

  if (!db) {
    setMessage("Configura Firebase antes de guardar.");
    return;
  }

  const record = buildRecord();
  if (!record) return;

  try {
    await setDoc(doc(db, COLLECTION_NAME, buildDocId(record.date)), {
      ...record,
      updatedAt: serverTimestamp(),
      createdAt: currentRecord?.createdAt || serverTimestamp()
    });

    currentRecord = record;
    setMessage("Registro guardado correctamente.");
    await loadPreviousRecord(record.date);
    await loadHistory();
    updateComputedState();
  } catch (error) {
    console.error(error);
    setMessage("No se pudo guardar en Firestore. Revisa reglas y conexion.");
  }
}

function buildRecord() {
  const evaluator = getEvaluatorName();
  const values = readCategoryValues();

  if (!evaluator) {
    setMessage("Selecciona un nombre.");
    return null;
  }

  if (values.some((item) => Number.isNaN(item.value))) {
    setMessage("Completa las 11 categorias.");
    return null;
  }

  if (values.some((item) => item.value < 0 || item.value > 100)) {
    setMessage("Los porcentajes deben estar entre 0 y 100.");
    return null;
  }

  return {
    date: elements.dateInput.value,
    storeId: STORE_ID,
    evaluator,
    categories: values,
    average: calculateAverage(values),
    observations: elements.observationsInput.value.trim()
  };
}

function readCategoryValues() {
  return categories.map((category) => {
    const input = document.querySelector(`#cat-${category.code}`);
    return {
      ...category,
      value: input.value === "" ? Number.NaN : Number(input.value)
    };
  });
}

function calculateAverage(values) {
  if (!values.length || values.some((item) => Number.isNaN(item.value))) return 0;
  const total = values.reduce((sum, item) => sum + item.value, 0);
  return roundOne(total / values.length);
}

function updateComputedState() {
  const values = readCategoryValues();
  const average = calculateAverage(values);
  const hasCompleteValues = values.every((item) => !Number.isNaN(item.value));

  elements.formAverage.textContent = hasCompleteValues ? formatPercent(average) : "0%";
  elements.headerAverage.textContent = hasCompleteValues ? formatPercent(average) : "0%";
  elements.averageDelta.textContent = previousRecord ? formatDelta(average - previousRecord.average) : "Sin dato";
  renderCriticalList(values);
}

function renderCriticalList(values) {
  const validValues = values.filter((item) => !Number.isNaN(item.value));
  const critical = validValues.sort((a, b) => a.value - b.value).slice(0, 3);

  elements.criticalList.innerHTML = critical.length
    ? critical.map((item) => `<li>${item.code} ${item.name}: ${formatPercent(item.value)}</li>`).join("")
    : "<li>Sin datos</li>";
}

function fillForm(record) {
  elements.dateInput.value = record.date;
  setEvaluatorName(record.evaluator);
  elements.observationsInput.value = record.observations || "";

  categories.forEach((category) => {
    const found = record.categories?.find((item) => item.code === category.code);
    document.querySelector(`#cat-${category.code}`).value = found?.value ?? "";
  });
}

function clearFormValues(keepDate = true) {
  const date = elements.dateInput.value;
  elements.form.reset();
  if (keepDate) elements.dateInput.value = date;
  categories.forEach((category) => {
    document.querySelector(`#cat-${category.code}`).value = "";
  });
  handleNameChange();
}

function renderHistoryItem(record) {
  const date = escapeHtml(formatDate(record.date));
  const evaluator = escapeHtml(record.evaluator || "Sin nombre");
  return `
    <article class="history-item">
      <button type="button" data-date="${escapeHtml(record.date)}">
        <span>${date}<br />${evaluator}</span>
        <strong>${formatPercent(record.average)}</strong>
      </button>
    </article>
  `;
}

function showWhatsappMessage() {
  const record = buildRecord();
  if (!record) return;

  const message = buildWhatsappMessage(record);
  elements.whatsappText.value = message;
  elements.openWhatsappLink.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
  elements.whatsappDialog.showModal();
}

function buildWhatsappMessage(record) {
  const lines = [
    `CATEGORÍA FOCO 121 - ${formatDate(record.date)}`,
    `Responsable: ${record.evaluator}`,
    ""
  ];

  record.categories.forEach((category) => {
    const previousCategory = previousRecord?.categories?.find((item) => item.code === category.code);
    const difference = previousCategory ? category.value - previousCategory.value : null;
    lines.push(`${category.code} - ${category.name}: ${formatPercent(category.value)}`);
    lines.push(`↳ Vs ayer: ${formatDelta(difference)}`);
  });

  lines.push("");
  lines.push(`Promedio general: ${formatPercent(record.average)}`);
  lines.push(`Vs ayer del promedio: ${previousRecord ? formatDelta(record.average - previousRecord.average) : "Sin dato"}`);
  lines.push("");
  lines.push("Top 3 categorias criticas:");
  record.categories
    .slice()
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .forEach((category, index) => {
      lines.push(`${index + 1}. ${category.code} - ${category.name}: ${formatPercent(category.value)}`);
    });
  lines.push("");
  lines.push(`Observaciones: ${record.observations || "Sin observaciones"}`);

  return lines.join("\n");
}

async function copyWhatsappMessage() {
  await navigator.clipboard.writeText(elements.whatsappText.value);
  elements.copyButton.textContent = "Copiado";
  setTimeout(() => {
    elements.copyButton.textContent = "Copiar";
  }, 1400);
}

function getEvaluatorName() {
  if (elements.nameSelect.value === "__other") return elements.customNameInput.value.trim();
  return elements.nameSelect.value;
}

function setEvaluatorName(name) {
  const option = Array.from(elements.nameSelect.options).find((item) => item.value === name || item.textContent === name);
  if (option) {
    elements.nameSelect.value = option.value;
    elements.customNameInput.value = "";
  } else {
    elements.nameSelect.value = "__other";
    elements.customNameInput.value = name || "";
  }
  handleNameChange();
}

function buildDocId(date) {
  return `${STORE_ID}_${date}`;
}

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}

function formatPercent(value) {
  return `${roundOne(value)}%`;
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function formatDelta(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "Sin dato";
  const rounded = roundOne(value);
  if (rounded > 0) return `⬆️ +${rounded}%`;
  if (rounded < 0) return `⬇️ ${rounded}%`;
  return "➖ 0%";
}

function setStatus(text, type) {
  elements.connectionStatus.textContent = text;
  elements.connectionStatus.className = `status-badge ${type}`;
}

function setMessage(text) {
  elements.formMessage.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
