const firebaseConfig = {
  apiKey: "AIzaSyA5AfF8Qi06Vnvshqsc_-sNVZxdnoPYCHU",
  authDomain: "categoria-foco-121.firebaseapp.com",
  projectId: "categoria-foco-121",
  storageBucket: "categoria-foco-121.firebasestorage.app",
  messagingSenderId: "585974456578",
  appId: "1:585974456578:web:ba52c1c4f4867e6878a21b"
};

const STORE_ID = "121";
const COLLECTION_NAME = "registros";

const categories = [
  { code: "82", name: "Check-Out" },
  { code: "08", name: "Mascota" },
  { code: "92", name: "Bebidas-Café" },
  { code: "14", name: "Artículos y Hogar" },
  { code: "10", name: "Automotriz" },
  { code: "20", name: "Cocina y Baño" },
  { code: "09", name: "Deportes" },
  { code: "15", name: "Electrodomésticos" },
  { code: "53", name: "Descartables y Cumpleaños" },
  { code: "22", name: "Ropa de Cama" },
  { code: "87", name: "Teléfono" }
];

const elements = {
  averageDelta: document.querySelector("#averageDelta"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  categoriesGrid: document.querySelector("#categoriesGrid"),
  connectionStatus: document.querySelector("#connectionStatus"),
  copyButton: document.querySelector("#copyButton"),
  criticalList: document.querySelector("#criticalList"),
  dashboardAverage: document.querySelector("#dashboardAverage"),
  dashboardCriticalList: document.querySelector("#dashboardCriticalList"),
  dashboardDate: document.querySelector("#dashboardDate"),
  dashboardDelta: document.querySelector("#dashboardDelta"),
  greenCount: document.querySelector("#greenCount"),
  customNameInput: document.querySelector("#customNameInput"),
  customNameWrap: document.querySelector("#customNameWrap"),
  dateInput: document.querySelector("#dateInput"),
  editStatus: document.querySelector("#editStatus"),
  exportButton: document.querySelector("#exportButton"),
  exportRange: document.querySelector("#exportRange"),
  form: document.querySelector("#evaluationForm"),
  formPanel: document.querySelector(".form-panel"),
  formAverage: document.querySelector("#formAverage"),
  formMessage: document.querySelector("#formMessage"),
  headerAverage: document.querySelector("#headerAverage"),
  historyList: document.querySelector("#historyList"),
  nameSelect: document.querySelector("#nameSelect"),
  observationsInput: document.querySelector("#observationsInput"),
  openWhatsappLink: document.querySelector("#openWhatsappLink"),
  refreshButton: document.querySelector("#refreshButton"),
  saveButton: document.querySelector("#saveButton"),
  shiftSelect: document.querySelector("#shiftSelect"),
  whatsappButton: document.querySelector("#whatsappButton"),
  whatsappDialog: document.querySelector("#whatsappDialog"),
  whatsappText: document.querySelector("#whatsappText"),
  redCount: document.querySelector("#redCount"),
  yellowCount: document.querySelector("#yellowCount")
};

let db = null;
let previousRecord = null;
let currentRecord = null;
let editingRecordDate = null;
let firestoreApi = null;

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
  elements.cancelEditButton.addEventListener("click", cancelEditing);
  elements.exportButton.addEventListener("click", exportRecords);
  elements.refreshButton.addEventListener("click", refreshSummary);
  elements.whatsappButton.addEventListener("click", showWhatsappMessage);
  elements.copyButton.addEventListener("click", copyWhatsappMessage);
}

function renderCategoryInputs() {
  elements.categoriesGrid.innerHTML = categories
    .map((category) => {
      const id = `cat-${category.code}`;
      return `
        <label id="card-${category.code}" class="category-card" for="${id}">
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

async function connectFirebase() {
  if (window.__CATEGORIA_FOCO_FIRESTORE__) {
    firestoreApi = window.__CATEGORIA_FOCO_FIRESTORE__;
    db = firestoreApi.db;
    setStatus("Firebase prueba", "ready");
    await handleDateChange();
    await loadHistory();
    await loadDashboard();
    return;
  }

  try {
    const firebaseApp = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const firebaseFirestore = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    firestoreApi = firebaseFirestore;
    const app = firebaseApp.initializeApp(firebaseConfig);
    db = firebaseFirestore.getFirestore(app);
    setStatus("Firebase conectado", "ready");
    await handleDateChange();
    await loadHistory();
    await loadDashboard();
  } catch (error) {
    console.error(error);
    setStatus("Error Firebase", "error");
    setMessage("No se pudo conectar con Firebase. Revisa la configuración.");
  }
}

async function handleDateChange() {
  if (editingRecordDate && elements.dateInput.value !== editingRecordDate) {
    setEditMode(null);
  }

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

async function loadRecordForDate(fecha) {
  try {
    const record = await getRecordByDate(fecha);
    if (!record) {
      clearFormValues(true);
      setMessage("");
      return;
    }

    currentRecord = record;
    fillForm(record);
    setMessage("Ya existe un registro para esta fecha. No se creará un segundo registro.");
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo comprobar el registro de la fecha: ${getFirestoreErrorMessage(error)}`);
  }
}

async function loadPreviousRecord(fecha) {
  if (!db) return;

  try {
    previousRecord = await getRecordByDate(getPreviousDate(fecha));
  } catch (error) {
    console.error(error);
    previousRecord = null;
  }
}

async function getRecordByDate(fecha) {
  const snapshot = await firestoreApi.getDoc(firestoreApi.doc(db, COLLECTION_NAME, buildDocId(fecha)));
  return snapshot.exists() ? normalizeRecord(snapshot.data()) : null;
}

async function loadHistory() {
  if (!db) return;

  try {
    const historyQuery = firestoreApi.query(
      firestoreApi.collection(db, COLLECTION_NAME),
      firestoreApi.orderBy("fecha", "desc"),
      firestoreApi.limit(20)
    );
    const snapshot = await firestoreApi.getDocs(historyQuery);
    const records = snapshot.docs.map((item) => normalizeRecord(item.data()));

    elements.historyList.innerHTML = records.length
      ? records.map(renderHistoryItem).join("")
      : `<p class="form-message">Sin registros todavía.</p>`;

    elements.historyList.querySelectorAll("button[data-edit-date]").forEach((button) => {
      button.addEventListener("click", () => {
        startEditingRecord(button.dataset.editDate);
      });
    });
  } catch (error) {
    console.error(error);
    elements.historyList.innerHTML = `<p class="form-message">No se pudo cargar el historial: ${escapeHtml(getFirestoreErrorMessage(error))}</p>`;
  }
}

async function refreshSummary() {
  await loadHistory();
  await loadDashboard();
}

async function startEditingRecord(fecha) {
  if (!db) return;

  try {
    const record = await getRecordByDate(fecha);
    if (!record) {
      setMessage("No se encontró el registro seleccionado.");
      return;
    }

    currentRecord = record;
    fillForm(record);
    await loadPreviousRecord(record.fecha);
    setEditMode(record.fecha);
    updateComputedState();
    setMessage("Editando registro existente. Al guardar se actualizará el mismo documento.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo abrir el registro para edición: ${getFirestoreErrorMessage(error)}`);
  }
}

function cancelEditing() {
  setEditMode(null);
  setMessage("Edición cancelada.");
}

function setEditMode(fecha) {
  editingRecordDate = fecha;
  const isEditing = Boolean(fecha);

  elements.dateInput.disabled = isEditing;
  elements.editStatus.classList.toggle("hidden", !isEditing);
  elements.cancelEditButton.classList.toggle("hidden", !isEditing);
  elements.formPanel.classList.toggle("editing", isEditing);
  elements.saveButton.textContent = isEditing ? "Actualizar registro" : "Guardar registro";
  elements.editStatus.textContent = isEditing ? `Editando registro del ${formatDate(fecha)}` : "";
}

async function loadDashboard() {
  if (!db) return;

  try {
    const latestQuery = firestoreApi.query(
      firestoreApi.collection(db, COLLECTION_NAME),
      firestoreApi.orderBy("fecha", "desc"),
      firestoreApi.limit(1)
    );
    const snapshot = await firestoreApi.getDocs(latestQuery);

    if (snapshot.empty) {
      renderDashboard(null, null);
      return;
    }

    const latestRecord = normalizeRecord(snapshot.docs[0].data());
    const previous = await getRecordByDate(getPreviousDate(latestRecord.fecha));
    renderDashboard(latestRecord, previous);
  } catch (error) {
    console.error(error);
    renderDashboard(null, null);
  }
}

function renderDashboard(record, previous) {
  if (!record) {
    elements.dashboardAverage.textContent = "0%";
    elements.dashboardDelta.textContent = "Sin dato";
    elements.dashboardDate.textContent = "Sin registros";
    elements.greenCount.textContent = "0";
    elements.yellowCount.textContent = "0";
    elements.redCount.textContent = "0";
    elements.dashboardCriticalList.innerHTML = "<li>Sin datos</li>";
    return;
  }

  const counts = getStatusCounts(record.categorias);
  const critical = getCriticalCategories(record.categorias);

  elements.dashboardAverage.textContent = formatPercent(record.promedio);
  elements.dashboardDelta.textContent = previous ? formatDelta(record.promedio - previous.promedio) : "Sin dato";
  elements.dashboardDate.textContent = `Último registro: ${formatDate(record.fecha)}`;
  elements.greenCount.textContent = String(counts.green);
  elements.yellowCount.textContent = String(counts.yellow);
  elements.redCount.textContent = String(counts.red);
  elements.dashboardCriticalList.innerHTML = critical
    .map((category) => `<li>${escapeHtml(category.nombre)} (${formatPercent(category.valor)})</li>`)
    .join("");
}

async function exportRecords() {
  if (!db) {
    setMessage("Configura Firebase antes de exportar.");
    return;
  }

  try {
    const range = elements.exportRange.value;
    const records = await getRecordsForExport(range);

    if (!records.length) {
      setMessage("No hay registros para exportar en el rango seleccionado.");
      return;
    }

    const csv = buildCsv(records);
    const filename = `categoria-foco-121-${range}-${getToday()}.csv`;
    downloadCsv(csv, filename);
    setMessage(`CSV generado correctamente: ${records.length} registro(s).`);
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo exportar: ${getFirestoreErrorMessage(error)}`);
  }
}

async function getRecordsForExport(range) {
  const exportQuery = firestoreApi.query(
    firestoreApi.collection(db, COLLECTION_NAME),
    firestoreApi.orderBy("fecha", "desc")
  );
  const snapshot = await firestoreApi.getDocs(exportQuery);
  const records = snapshot.docs.map((item) => normalizeRecord(item.data()));

  return records
    .filter((record) => isRecordInExportRange(record, range))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}

function isRecordInExportRange(record, range) {
  if (range === "all") return true;

  const today = getToday();
  if (range === "last7") {
    return record.fecha >= addDays(today, -6) && record.fecha <= today;
  }

  if (range === "month") {
    return record.fecha.slice(0, 7) === today.slice(0, 7);
  }

  return true;
}

function buildCsv(records) {
  const headers = [
    "Fecha",
    "Registrado por",
    "Turno",
    ...categories.map((category) => `${category.code} - ${category.name}`),
    "Promedio",
    "Observaciones"
  ];

  const rows = records.map((record) => {
    const valuesByCode = new Map(record.categorias.map((category) => [category.codigo, category.valor]));
    return [
      record.fecha,
      record.nombre,
      record.turno,
      ...categories.map((category) => valuesByCode.get(category.code) ?? ""),
      record.promedio,
      record.observaciones
    ];
  });

  return [headers, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

function escapeCsvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(csv, filename) {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
    if (editingRecordDate) {
      await updateExistingRecord(record);
      return;
    }

    const recordRef = firestoreApi.doc(db, COLLECTION_NAME, buildDocId(record.fecha));
    const existingRecord = await firestoreApi.getDoc(recordRef);

    if (existingRecord.exists()) {
      currentRecord = normalizeRecord(existingRecord.data());
      setMessage("El registro ya existe para esta fecha. No se creó un segundo registro.");
      return;
    }

    await firestoreApi.setDoc(recordRef, {
      ...record,
      fechaHoraRegistro: firestoreApi.serverTimestamp()
    });

    currentRecord = record;
    setMessage("Registro guardado correctamente");
    await loadPreviousRecord(record.fecha);
    await loadHistory();
    await loadDashboard();
    updateComputedState();
  } catch (error) {
    console.error(error);
    setMessage(`Error al guardar en Firestore: ${getFirestoreErrorMessage(error)}`);
  }
}

async function updateExistingRecord(record) {
  const recordRef = firestoreApi.doc(db, COLLECTION_NAME, buildDocId(editingRecordDate));
  const existingRecord = await firestoreApi.getDoc(recordRef);

  if (!existingRecord.exists()) {
    setMessage("No se encontró el registro original para actualizar.");
    return;
  }

  const currentData = existingRecord.data();
  const updatedRecord = {
    ...record,
    fecha: editingRecordDate,
    fechaHoraRegistro: currentData.fechaHoraRegistro || firestoreApi.serverTimestamp(),
    fechaHoraActualizacion: firestoreApi.serverTimestamp()
  };

  // Futuro control de permisos: aquí se validará si el usuario es admin/supervisor antes de actualizar.
  await firestoreApi.setDoc(recordRef, updatedRecord);

  currentRecord = normalizeRecord(updatedRecord);
  setMessage("Registro actualizado correctamente.");
  await loadPreviousRecord(editingRecordDate);
  await refreshSummary();
  setEditMode(editingRecordDate);
  updateComputedState();
}

function buildRecord() {
  const nombre = getEvaluatorName();
  const turno = elements.shiftSelect.value;
  const values = readCategoryValues();
  const promedio = calculateAverage(values);
  const observaciones = elements.observationsInput.value.trim();

  if (!elements.dateInput.value) {
    setMessage("Selecciona una fecha.");
    return null;
  }

  if (!nombre) {
    setMessage("Selecciona un nombre.");
    return null;
  }

  if (!turno) {
    setMessage("Selecciona un turno.");
    return null;
  }

  if (values.some((item) => Number.isNaN(item.valor))) {
    setMessage("Todas las categorías deben tener un valor numérico.");
    return null;
  }

  if (values.some((item) => item.valor < 0 || item.valor > 100)) {
    setMessage("Los porcentajes deben estar entre 0 y 100.");
    return null;
  }

  return {
    fecha: elements.dateInput.value,
    nombre,
    turno,
    categorias: values,
    promedio,
    observaciones,
    tienda: STORE_ID
  };
}

function readCategoryValues() {
  return categories.map((category) => {
    const input = document.querySelector(`#cat-${category.code}`);
    const valor = input.value === "" ? Number.NaN : Number(input.value);

    return {
      codigo: category.code,
      code: category.code,
      nombre: category.name,
      name: category.name,
      valor,
      value: valor
    };
  });
}

function calculateAverage(values) {
  if (!values.length || values.some((item) => Number.isNaN(item.valor))) return 0;
  const total = values.reduce((sum, item) => sum + item.valor, 0);
  return roundOne(total / values.length);
}

function updateComputedState() {
  const values = readCategoryValues();
  const average = calculateAverage(values);
  const hasCompleteValues = values.every((item) => !Number.isNaN(item.valor));
  const previousAverage = previousRecord?.promedio;

  elements.formAverage.textContent = hasCompleteValues ? formatPercent(average) : "0%";
  elements.headerAverage.textContent = hasCompleteValues ? formatPercent(average) : "0%";
  elements.averageDelta.textContent = previousAverage !== undefined ? formatDelta(average - previousAverage) : "Sin dato";
  updateCategoryColors(values);
  renderCriticalList(values);
}

function renderCriticalList(values) {
  const validValues = values.filter((item) => !Number.isNaN(item.valor));
  const critical = validValues.sort((a, b) => a.valor - b.valor).slice(0, 3);

  elements.criticalList.innerHTML = critical.length
    ? critical.map((item) => `<li>${item.codigo} ${item.nombre}: ${formatPercent(item.valor)}</li>`).join("")
    : "<li>Sin datos</li>";
}

function updateCategoryColors(values) {
  values.forEach((item) => {
    const card = document.querySelector(`#card-${item.codigo}`);
    if (!card) return;

    card.classList.remove("status-green", "status-yellow", "status-red");
    if (Number.isNaN(item.valor)) return;
    card.classList.add(`status-${getCategoryStatus(item.valor)}`);
  });
}

function getStatusCounts(values) {
  return values.reduce(
    (counts, item) => {
      counts[getCategoryStatus(item.valor)] += 1;
      return counts;
    },
    { green: 0, yellow: 0, red: 0 }
  );
}

function getCriticalCategories(values) {
  return values.slice().sort((a, b) => a.valor - b.valor).slice(0, 3);
}

function getCategoryStatus(value) {
  if (value >= 80) return "green";
  if (value >= 60) return "yellow";
  return "red";
}

function fillForm(record) {
  elements.dateInput.value = record.fecha;
  setEvaluatorName(record.nombre);
  elements.shiftSelect.value = record.turno || "";
  elements.observationsInput.value = record.observaciones || "";

  categories.forEach((category) => {
    const found = record.categorias.find((item) => item.codigo === category.code);
    document.querySelector(`#cat-${category.code}`).value = found?.valor ?? "";
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
  const date = escapeHtml(formatDate(record.fecha));
  const nombre = escapeHtml(record.nombre || "Sin nombre");
  const turno = escapeHtml(record.turno || "Sin turno");
  return `
    <article class="history-item">
      <div class="history-row">
        <div>
          <span>${date}<br />${nombre} · ${turno}</span>
          <strong>${formatPercent(record.promedio)}</strong>
        </div>
        <button class="history-edit-button" type="button" data-edit-date="${escapeHtml(record.fecha)}">Ver / Editar</button>
      </div>
    </article>
  `;
}

async function showWhatsappMessage() {
  if (!db) {
    setMessage("Configura Firebase antes de generar WhatsApp.");
    return;
  }

  const fecha = elements.dateInput.value;
  if (!fecha) {
    setMessage("Selecciona una fecha para generar WhatsApp.");
    return;
  }

  try {
    const record = await getRecordByDate(fecha);
    if (!record) {
      setMessage("No existe un registro guardado para la fecha seleccionada.");
      return;
    }

    const previous = await getRecordByDate(getPreviousDate(fecha));
    const message = buildWhatsappMessage(record, previous);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    elements.whatsappText.value = message;
    elements.openWhatsappLink.href = whatsappUrl;
    const copied = await copyTextToClipboard(message);
    setMessage(copied ? "Mensaje WhatsApp generado correctamente y copiado al portapapeles." : "Mensaje WhatsApp generado correctamente. Usa Copiar mensaje si WhatsApp no pega el texto.");
    elements.whatsappDialog.showModal();
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo generar WhatsApp: ${getFirestoreErrorMessage(error)}`);
  }
}

// Builds the daily WhatsApp summary from the selected record and the exact previous calendar day.
function buildWhatsappMessage(record, previous) {
  const lines = [
    `CATEGORÍA FOCO 121 - ${formatDate(record.fecha)}`,
    `Responsable: ${record.nombre}`,
    `Turno: ${record.turno}`,
    ""
  ];

  record.categorias.forEach((category) => {
    const previousCategory = previous?.categorias.find((item) => item.codigo === category.codigo);
    const difference = previousCategory ? category.valor - previousCategory.valor : null;

    lines.push(`${category.codigo} - ${category.nombre}: ${formatPercent(category.valor)}`);
    lines.push(`↳ Vs ayer: ${formatDelta(difference, "Sin comparación disponible")}`);
    lines.push("");
  });

  lines.push(`📊 Promedio General: ${formatPercent(record.promedio)}`);
  lines.push(`↳ Vs ayer: ${previous ? formatDelta(record.promedio - previous.promedio, "Sin comparación disponible") : "Sin comparación disponible"}`);
  lines.push("");
  lines.push("🎯 CATEGORÍAS CRÍTICAS");
  lines.push("");

  record.categorias
    .slice()
    .sort((a, b) => a.valor - b.valor)
    .slice(0, 3)
    .forEach((category, index) => {
      lines.push(`${index + 1}. ${category.nombre} (${formatPercent(category.valor)})`);
      lines.push("");
    });

  lines.push(`Observaciones: ${record.observaciones || "Sin observaciones"}`);

  return lines.join("\n");
}

async function copyWhatsappMessage() {
  await copyTextToClipboard(elements.whatsappText.value);
  elements.copyButton.textContent = "Mensaje copiado";
  setTimeout(() => {
    elements.copyButton.textContent = "📋 Copiar mensaje";
  }, 1400);
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    console.warn("No se pudo copiar automáticamente el mensaje.", error);
  }
  return copyTextWithFallback(text);
}

function copyTextWithFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch (error) {
    console.warn("No se pudo copiar el mensaje con el método alternativo.", error);
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

function normalizeRecord(record) {
  return {
    ...record,
    categorias: (record.categorias || record.categories || []).map(normalizeCategory),
    nombre: record.nombre || record.evaluator || "",
    observaciones: record.observaciones || record.observations || "",
    promedio: Number(record.promedio ?? record.average ?? 0),
    turno: record.turno || "",
    fecha: record.fecha || record.date || ""
  };
}

function normalizeCategory(category) {
  return {
    codigo: category.codigo || category.code,
    code: category.codigo || category.code,
    nombre: category.nombre || category.name,
    name: category.nombre || category.name,
    valor: Number(category.valor ?? category.value),
    value: Number(category.valor ?? category.value)
  };
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

function buildDocId(fecha) {
  return fecha;
}

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function getPreviousDate(fecha) {
  const [year, month, day] = fecha.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function addDays(fecha, days) {
  const [year, month, day] = fecha.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
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

function formatDelta(value, emptyText = "Sin dato") {
  if (value === null || value === undefined || Number.isNaN(value)) return emptyText;
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

function getFirestoreErrorMessage(error) {
  if (!error?.code) return "revisa tu conexión e inténtalo nuevamente.";

  const messages = {
    "permission-denied": "no tienes permisos para leer o escribir en Firestore. Revisa las reglas de seguridad.",
    unavailable: "Firestore no está disponible en este momento. Revisa la conexión.",
    "not-found": "no se encontró la base de datos o la colección solicitada.",
    unauthenticated: "la operación requiere autenticación."
  };

  return messages[error.code] || `${error.code}. Revisa la configuración de Firebase y las reglas de Firestore.`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
