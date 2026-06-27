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
const DELETED_LOGS_COLLECTION = "deletedLogs";
const ROLES_COLLECTION = "roles";
const HISTORY_LIMIT = 200;
const DEFAULT_ROLE = "user";
const SIDEBAR_STORAGE_KEY = "categoriaFocoSidebarCollapsed";

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
  appView: document.querySelector("#appView"),
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
  dashboardTotalRecords: document.querySelector("#dashboardTotalRecords"),
  greenCount: document.querySelector("#greenCount"),
  customNameInput: document.querySelector("#customNameInput"),
  customNameWrap: document.querySelector("#customNameWrap"),
  dateInput: document.querySelector("#dateInput"),
  editStatus: document.querySelector("#editStatus"),
  emailInput: document.querySelector("#emailInput"),
  exportButton: document.querySelector("#exportButton"),
  exportJsonButton: document.querySelector("#exportJsonButton"),
  exportRange: document.querySelector("#exportRange"),
  filterCategory: document.querySelector("#filterCategory"),
  filterCreator: document.querySelector("#filterCreator"),
  filterDateFrom: document.querySelector("#filterDateFrom"),
  filterDateTo: document.querySelector("#filterDateTo"),
  form: document.querySelector("#evaluationForm"),
  formPanel: document.querySelector(".form-panel"),
  formAverage: document.querySelector("#formAverage"),
  formMessage: document.querySelector("#formMessage"),
  headerAverage: document.querySelector("#headerAverage"),
  historyList: document.querySelector("#historyList"),
  historySearchInput: document.querySelector("#historySearchInput"),
  loginButton: document.querySelector("#loginButton"),
  loginForm: document.querySelector("#loginForm"),
  loginMessage: document.querySelector("#loginMessage"),
  loginView: document.querySelector("#loginView"),
  logoutButton: document.querySelector("#logoutButton"),
  nameSelect: document.querySelector("#nameSelect"),
  observationsInput: document.querySelector("#observationsInput"),
  openWhatsappLink: document.querySelector("#openWhatsappLink"),
  passwordInput: document.querySelector("#passwordInput"),
  categoryAverageChart: document.querySelector("#categoryAverageChart"),
  categoryStatsList: document.querySelector("#categoryStatsList"),
  creatorStatsList: document.querySelector("#creatorStatsList"),
  dateTrendChart: document.querySelector("#dateTrendChart"),
  refreshButton: document.querySelector("#refreshButton"),
  refreshReportsButton: document.querySelector("#refreshReportsButton"),
  reportBestDetail: document.querySelector("#reportBestDetail"),
  reportBestPercent: document.querySelector("#reportBestPercent"),
  reportDateFrom: document.querySelector("#reportDateFrom"),
  reportDateTo: document.querySelector("#reportDateTo"),
  reportLatestDate: document.querySelector("#reportLatestDate"),
  reportLatestHint: document.querySelector("#reportLatestHint"),
  reportOverallAverage: document.querySelector("#reportOverallAverage"),
  reportRangeLabel: document.querySelector("#reportRangeLabel"),
  reportsNav: document.querySelector(".reports-nav"),
  reportsMessage: document.querySelector("#reportsMessage"),
  reportsPanel: document.querySelector("#reportsPanel"),
  reportTotalRecords: document.querySelector("#reportTotalRecords"),
  reportUserInitials: document.querySelector("#reportUserInitials"),
  reportUserName: document.querySelector("#reportUserName"),
  reportUserRole: document.querySelector("#reportUserRole"),
  reportWorstDetail: document.querySelector("#reportWorstDetail"),
  reportWorstPercent: document.querySelector("#reportWorstPercent"),
  roleNotice: document.querySelector("#roleNotice"),
  clearFiltersButton: document.querySelector("#clearFiltersButton"),
  resultsCount: document.querySelector("#resultsCount"),
  saveButton: document.querySelector("#saveButton"),
  sessionRole: document.querySelector("#sessionRole"),
  sessionUser: document.querySelector("#sessionUser"),
  shiftSelect: document.querySelector("#shiftSelect"),
  sidebarOverlay: document.querySelector("#sidebarOverlay"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  monthStatsList: document.querySelector("#monthStatsList"),
  whatsappButton: document.querySelector("#whatsappButton"),
  whatsappDialog: document.querySelector("#whatsappDialog"),
  whatsappText: document.querySelector("#whatsappText"),
  redCount: document.querySelector("#redCount"),
  yellowCount: document.querySelector("#yellowCount")
};

let db = null;
let auth = null;
let authApi = null;
let currentUser = null;
let currentUserProfile = null;
let currentUserRole = DEFAULT_ROLE;
let previousRecord = null;
let currentRecord = null;
let editingRecordDate = null;
let firestoreApi = null;
let historyRecords = [];
let visibleHistoryRecords = [];

init();

function init() {
  renderCategoryInputs();
  renderCategoryFilterOptions();
  elements.dateInput.value = getToday();
  bindEvents();
  initSidebarState();
  setAuthUi(false);
  connectFirebase();
  updateComputedState();
}

function bindEvents() {
  elements.form.addEventListener("input", updateComputedState);
  elements.form.addEventListener("submit", saveRecord);
  elements.loginForm.addEventListener("submit", signIn);
  elements.logoutButton.addEventListener("click", signOut);
  elements.nameSelect.addEventListener("change", handleNameChange);
  elements.dateInput.addEventListener("change", handleDateChange);
  elements.cancelEditButton.addEventListener("click", cancelEditing);
  elements.exportButton.addEventListener("click", exportRecords);
  elements.exportJsonButton.addEventListener("click", exportJsonRecords);
  elements.filterCategory.addEventListener("change", applyHistoryFilters);
  elements.filterCreator.addEventListener("change", applyHistoryFilters);
  elements.filterDateFrom.addEventListener("change", loadHistory);
  elements.filterDateTo.addEventListener("change", loadHistory);
  elements.historySearchInput.addEventListener("input", applyHistoryFilters);
  elements.clearFiltersButton.addEventListener("click", clearHistoryFilters);
  elements.refreshButton.addEventListener("click", refreshSummary);
  elements.refreshReportsButton.addEventListener("click", loadReports);
  elements.reportDateFrom.addEventListener("change", loadReports);
  elements.reportDateTo.addEventListener("change", loadReports);
  elements.reportsNav.addEventListener("click", handleReportNavAction);
  elements.sidebarOverlay.addEventListener("click", closeSidebar);
  elements.sidebarToggle.addEventListener("click", toggleSidebar);
  elements.whatsappButton.addEventListener("click", showWhatsappMessage);
  elements.copyButton.addEventListener("click", copyWhatsappMessage);
}

function initSidebarState() {
  const storedState = localStorage.getItem(SIDEBAR_STORAGE_KEY);
  const isCollapsed = storedState === null
    ? window.matchMedia("(max-width: 980px)").matches
    : storedState === "true";
  setSidebarCollapsed(isCollapsed);
}

function toggleSidebar() {
  setSidebarCollapsed(!elements.appView.classList.contains("sidebar-collapsed"));
}

function closeSidebar() {
  setSidebarCollapsed(true);
}

function setSidebarCollapsed(isCollapsed) {
  elements.appView.classList.toggle("sidebar-collapsed", isCollapsed);
  elements.appView.classList.toggle("sidebar-open", !isCollapsed);
  elements.sidebarToggle.setAttribute("aria-expanded", String(!isCollapsed));
  localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
}

function handleReportNavAction(event) {
  const button = event.target.closest("[data-report-action]");
  if (!button) return;

  const action = button.dataset.reportAction;
  const scrollOptions = { behavior: "smooth", block: "start" };

  if (action === "dashboard") {
    document.querySelector(".dashboard-panel")?.scrollIntoView(scrollOptions);
  } else if (action === "new") {
    elements.formPanel.scrollIntoView(scrollOptions);
  } else if (action === "history") {
    elements.historyList.scrollIntoView(scrollOptions);
  } else if (action === "reports") {
    elements.reportsPanel.scrollIntoView(scrollOptions);
  } else if (action === "whatsapp") {
    showWhatsappMessage();
  } else if (action === "csv") {
    exportRecords();
  } else if (action === "json") {
    exportJsonRecords();
  } else if (action === "logout") {
    signOut();
  } else {
    setReportsMessage("Funcion preparada para una version futura.", "info");
  }

  if (window.matchMedia("(max-width: 980px)").matches) {
    closeSidebar();
  }
}

function renderCategoryFilterOptions() {
  elements.filterCategory.innerHTML = [
    `<option value="">Todas</option>`,
    ...categories.map((category) => `<option value="${category.code}">${category.code} - ${category.name}</option>`)
  ].join("");
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
    currentUser = { email: "prueba@local", displayName: "Prueba local" };
    currentUserProfile = { name: "Prueba local", email: "prueba@local", role: "admin" };
    currentUserRole = "admin";
    setStatus("Firebase prueba", "ready");
    setAuthUi(true);
    await handleDateChange();
    await loadHistory();
    await loadDashboard();
    await loadReports();
    return;
  }

  try {
    const firebaseApp = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    const firebaseAuth = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js");
    const firebaseFirestore = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js");
    firestoreApi = firebaseFirestore;
    authApi = firebaseAuth;
    const app = firebaseApp.initializeApp(firebaseConfig);
    auth = firebaseAuth.getAuth(app);
    db = firebaseFirestore.getFirestore(app);
    setStatus("Firebase conectado", "ready");
    firebaseAuth.onAuthStateChanged(auth, handleAuthStateChanged);
  } catch (error) {
    console.error(error);
    setStatus("Error Firebase", "error");
    setMessage("No se pudo conectar con Firebase. Revisa la configuración.", "error");
    setLoginMessage("No se pudo conectar con Firebase. Revisa la configuración.", "error");
  }
}

async function signIn(event) {
  event.preventDefault();

  if (!auth || !authApi) {
    setLoginMessage("Firebase Auth todavia no esta disponible.", "error");
    return;
  }

  const email = elements.emailInput.value.trim();
  const password = elements.passwordInput.value;

  if (!email || !password) {
    setLoginMessage("Ingresa correo y contrasena.", "warning");
    return;
  }

  elements.loginButton.disabled = true;
  setLoginMessage("Iniciando sesion...", "info");

  try {
    await authApi.signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.warn(error);
    setLoginMessage(`No se pudo iniciar sesion: ${getAuthErrorMessage(error)}`, "error");
  } finally {
    elements.loginButton.disabled = false;
  }
}

async function signOut() {
  if (!auth || !authApi) return;

  try {
    await authApi.signOut(auth);
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo cerrar sesion: ${getAuthErrorMessage(error)}`, "error");
  }
}

async function handleAuthStateChanged(user) {
  if (!user) {
    resetAuthenticatedState();
    setAuthUi(false);
    setLoginMessage("");
    return;
  }

  currentUser = user;
  setLoginMessage("Cargando permisos...", "info");

  try {
    currentUserProfile = await loadAuthenticatedUserProfile(user);
    currentUserRole = currentUserProfile.role;
    setAuthUi(true);
    setLoginMessage("");
    await handleDateChange();
    await loadHistory();
    await loadDashboard();
    await loadReports();
    updateRoleUi();
    updateComputedState();
  } catch (error) {
    console.error(error);
    resetAuthenticatedState();
    setAuthUi(false);
    setLoginMessage(`No se pudo cargar el rol desde Firestore: ${getFirestoreErrorMessage(error)}`, "error");
  }
}

async function loadAuthenticatedUserProfile(user) {
  const uidRole = await getRoleDocument(user.uid);
  if (uidRole) return buildUserProfile(user, uidRole);

  const email = user.email?.toLowerCase() || "";
  if (email) {
    const emailRole = await getOptionalRoleDocument(email);
    if (emailRole) return buildUserProfile(user, emailRole);

    const queryRole = await getOptionalRoleByEmail(email);
    if (queryRole) return buildUserProfile(user, queryRole);
  }

  return buildUserProfile(user, { role: DEFAULT_ROLE, missingRole: true });
}

async function getRoleDocument(documentId) {
  const snapshot = await firestoreApi.getDoc(firestoreApi.doc(db, ROLES_COLLECTION, documentId));
  return snapshot.exists() ? snapshot.data() : null;
}

async function getOptionalRoleDocument(documentId) {
  try {
    return await getRoleDocument(documentId);
  } catch (error) {
    if (error?.code === "permission-denied") return null;
    throw error;
  }
}

async function getRoleByEmail(email) {
  const roleQuery = firestoreApi.query(
    firestoreApi.collection(db, ROLES_COLLECTION),
    firestoreApi.where("email", "==", email),
    firestoreApi.limit(1)
  );
  const snapshot = await firestoreApi.getDocs(roleQuery);
  return snapshot.empty ? null : snapshot.docs[0].data();
}

async function getOptionalRoleByEmail(email) {
  try {
    return await getRoleByEmail(email);
  } catch (error) {
    if (error?.code === "permission-denied") return null;
    throw error;
  }
}

function buildUserProfile(user, roleData) {
  const role = normalizeRole(roleData.role || roleData.rol || roleData.perfil);

  return {
    email: user.email || roleData.email || "",
    missingRole: Boolean(roleData.missingRole),
    name: roleData.name || roleData.nombre || user.displayName || user.email || "Usuario autenticado",
    role
  };
}

function normalizeRole(role) {
  const value = normalizeSearchText(role);
  if (["admin", "administrador"].includes(value)) return "admin";
  if (value === "supervisor") return "supervisor";
  return DEFAULT_ROLE;
}

function resetAuthenticatedState() {
  currentUser = null;
  currentUserProfile = null;
  currentUserRole = DEFAULT_ROLE;
  previousRecord = null;
  currentRecord = null;
  historyRecords = [];
  visibleHistoryRecords = [];
  setEditMode(null);
  clearFormValues(true);
  renderDashboard(null, null);
  renderReports([]);
  elements.reportsPanel.classList.add("hidden");
  elements.historyList.innerHTML = `<p class="form-message">Inicia sesion para ver el historial.</p>`;
  updateResultsCount(0);
}

function setAuthUi(isAuthenticated) {
  document.body.classList.remove("auth-loading");
  document.body.classList.toggle("authenticated", isAuthenticated);
  document.body.classList.toggle("unauthenticated", !isAuthenticated);
  elements.appView.classList.toggle("hidden", !isAuthenticated);
  elements.loginView.classList.toggle("hidden", isAuthenticated);

  if (isAuthenticated) {
    const fallbackName = currentUser?.displayName || currentUser?.email || "Usuario autenticado";
    elements.sessionUser.textContent = currentUserProfile?.name || fallbackName;
    elements.sessionRole.textContent = currentUserProfile?.missingRole
      ? `${getRoleLabel()} (rol por defecto)`
      : getRoleLabel();
    updateReportsUserCard();
    return;
  }

  elements.sessionUser.textContent = "Sin sesion";
  elements.sessionRole.textContent = "Rol pendiente";
  updateReportsUserCard();
}

function updateReportsUserCard() {
  const name = currentUserProfile?.name || currentUser?.displayName || currentUser?.email || "Usuario";
  const role = currentUser ? getRoleLabel() : "Rol";

  elements.reportUserName.textContent = name;
  elements.reportUserRole.textContent = role;
  elements.reportUserInitials.textContent = getInitials(name);
}

function getInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "--";
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function isAuthenticated() {
  return Boolean(currentUser);
}

function requireAuthentication(message = "Debes iniciar sesion para usar esta funcion.") {
  if (isAuthenticated()) return true;
  setMessage(message, "warning");
  return false;
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

function handleRoleChange() {
  if (!canEditRecords() && editingRecordDate) {
    cancelEditing();
  }
  updateRoleUi();
}

function getCurrentRole() {
  return currentUserRole || DEFAULT_ROLE;
}

function getRoleLabel() {
  const labels = {
    user: "Usuario",
    supervisor: "Supervisor",
    admin: "Administrador"
  };
  return labels[getCurrentRole()] || getCurrentRole();
}

function getActorName() {
  const name = currentUserProfile?.name || currentUser?.displayName || currentUser?.email || getEvaluatorName() || "Sin nombre";
  return `${name} (${getRoleLabel()})`;
}

function canEditRecords() {
  return ["supervisor", "admin"].includes(getCurrentRole());
}

function canDeleteRecords() {
  return getCurrentRole() === "admin";
}

function canViewReports() {
  return ["supervisor", "admin"].includes(getCurrentRole());
}

function updateRoleUi() {
  const canEdit = canEditRecords();
  elements.reportsPanel.classList.toggle("hidden", !canViewReports());
  elements.roleNotice.classList.toggle("hidden", canEdit);
  elements.historyList.querySelectorAll("[data-edit-date]").forEach((button) => {
    button.disabled = !canEdit;
    button.title = canEdit ? "Abrir registro para editar" : "Solo supervisor o administrador puede editar registros";
  });
  elements.historyList.querySelectorAll("[data-delete-date]").forEach((button) => {
    button.classList.toggle("hidden", !canDeleteRecords());
  });
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
    setMessage("Ya existe un registro para esta fecha. Puedes abrirlo desde el historial si necesitas revisarlo.", "warning");
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo comprobar el registro de la fecha: ${getFirestoreErrorMessage(error)}`, "error");
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
    const historyQuery = buildHistoryQuery();
    const snapshot = await firestoreApi.getDocs(historyQuery);
    historyRecords = snapshot.docs.map((item) => normalizeRecord(item.data()));
    if (elements.dashboardTotalRecords) elements.dashboardTotalRecords.textContent = String(historyRecords.length);
    updateCreatorFilterOptions(historyRecords);
    applyHistoryFilters();
  } catch (error) {
    console.error(error);
    elements.historyList.innerHTML = `<p class="form-message">No se pudo cargar el historial: ${escapeHtml(getFirestoreErrorMessage(error))}</p>`;
    updateResultsCount(0);
  }
}

function buildHistoryQuery() {
  const constraints = [];
  const dateFrom = elements.filterDateFrom.value;
  const dateTo = elements.filterDateTo.value;

  if (dateFrom) constraints.push(firestoreApi.where("fecha", ">=", dateFrom));
  if (dateTo) constraints.push(firestoreApi.where("fecha", "<=", dateTo));

  constraints.push(firestoreApi.orderBy("fecha", "desc"));
  constraints.push(firestoreApi.limit(HISTORY_LIMIT));

  return firestoreApi.query(firestoreApi.collection(db, COLLECTION_NAME), ...constraints);
}

function applyHistoryFilters() {
  visibleHistoryRecords = historyRecords.filter(matchesHistoryFilters);
  renderHistory(visibleHistoryRecords);
}

function renderHistory(records) {
  elements.historyList.innerHTML = records.length
    ? records.map(renderHistoryItem).join("")
    : `<p class="form-message">Sin registros para los filtros seleccionados.</p>`;

  elements.historyList.querySelectorAll("button[data-edit-date]").forEach((button) => {
    button.addEventListener("click", () => {
      startEditingRecord(button.dataset.editDate);
    });
  });
  elements.historyList.querySelectorAll("button[data-delete-date]").forEach((button) => {
    button.addEventListener("click", () => {
      deleteRecord(button.dataset.deleteDate);
    });
  });
  updateResultsCount(records.length);
  updateRoleUi();
}

async function refreshSummary() {
  await loadHistory();
  await loadDashboard();
  await loadReports();
}

async function startEditingRecord(fecha) {
  if (!db) return;
  if (!requireAuthentication()) return;
  if (!canEditRecords()) {
    setMessage("Solo supervisor o administrador puede editar registros.", "warning");
    return;
  }

  try {
    const record = await getRecordByDate(fecha);
    if (!record) {
      setMessage("No se encontró el registro seleccionado.", "error");
      return;
    }

    currentRecord = record;
    fillForm(record);
    await loadPreviousRecord(record.fecha);
    setEditMode(record.fecha);
    updateComputedState();
    setMessage("Modo edición activo. Al guardar se actualizará este mismo documento.", "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo abrir el registro para edición: ${getFirestoreErrorMessage(error)}`, "error");
  }
}

async function deleteRecord(fecha) {
  if (!db) return;
  if (!requireAuthentication()) return;
  if (!canDeleteRecords()) {
    setMessage("Solo administrador puede eliminar registros.", "warning");
    return;
  }

  const confirmed = window.confirm("¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.");
  if (!confirmed) return;

  try {
    const recordRef = firestoreApi.doc(db, COLLECTION_NAME, buildDocId(fecha));
    const snapshot = await firestoreApi.getDoc(recordRef);

    if (!snapshot.exists()) {
      setMessage("No se encontró el registro para eliminar.", "error");
      await refreshSummary();
      return;
    }

    try {
      await saveDeletedLog(fecha, snapshot.data());
    } catch (backupError) {
      console.error(backupError);
      setMessage(getDeletedLogPermissionMessage(backupError), "error");
      return;
    }

    await firestoreApi.deleteDoc(recordRef);

    if (editingRecordDate === fecha) {
      setEditMode(null);
      clearFormValues(true);
    }

    if (elements.dateInput.value === fecha) {
      clearFormValues(true);
      currentRecord = null;
      previousRecord = null;
      updateComputedState();
    }

    setMessage("Registro eliminado correctamente. Se actualizó el historial y el dashboard.", "success");
    await refreshSummary();
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo eliminar el registro: ${getFirestoreErrorMessage(error)}`, "error");
  }
}

function getDeletedLogPermissionMessage(error) {
  if (error?.code === "permission-denied") {
    return "No se eliminó el registro: falta permiso de escritura en Firestore para la colección deletedLogs. Agrega la regla indicada en README y vuelve a intentar.";
  }

  return `No se eliminó el registro porque no se pudo crear el respaldo en deletedLogs: ${getFirestoreErrorMessage(error)}`;
}

async function saveDeletedLog(documentId, deletedData) {
  const logId = `${documentId}_${Date.now()}`;
  const logRef = firestoreApi.doc(db, DELETED_LOGS_COLLECTION, logId);

  await firestoreApi.setDoc(logRef, {
    documentId,
    deletedData,
    deletedBy: getActorName(),
    deletedRole: getCurrentRole(),
    deletedAt: firestoreApi.serverTimestamp()
  });
}

function cancelEditing() {
  setEditMode(null);
  setMessage("Edición cancelada. El formulario vuelve al modo de nuevo registro.", "info");
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
    if (elements.dashboardTotalRecords) elements.dashboardTotalRecords.textContent = "0";
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

async function loadReports() {
  if (!db || !isAuthenticated()) return;

  if (!canViewReports()) {
    elements.reportsPanel.classList.add("hidden");
    renderReports([]);
    return;
  }

  elements.reportsPanel.classList.remove("hidden");
  setReportsMessage("Cargando reportes...", "info");

  try {
    const records = await getRecordsForReports();
    renderReports(records);
    setReportsMessage(records.length ? "" : "No hay registros para el rango seleccionado.", "warning");
  } catch (error) {
    console.error(error);
    renderReports([]);
    setReportsMessage(`No se pudieron cargar los reportes: ${getFirestoreErrorMessage(error)}`, "error");
  }
}

async function getRecordsForReports() {
  const constraints = [];
  const dateFrom = elements.reportDateFrom.value;
  const dateTo = elements.reportDateTo.value;

  if (dateFrom) constraints.push(firestoreApi.where("fecha", ">=", dateFrom));
  if (dateTo) constraints.push(firestoreApi.where("fecha", "<=", dateTo));

  constraints.push(firestoreApi.orderBy("fecha", "asc"));

  const reportsQuery = firestoreApi.query(firestoreApi.collection(db, COLLECTION_NAME), ...constraints);
  const snapshot = await firestoreApi.getDocs(reportsQuery);
  return snapshot.docs.map((item) => normalizeRecord(item.data()));
}

function renderReports(records) {
  const summary = buildReportSummary(records);

  elements.reportTotalRecords.textContent = String(summary.totalRecords);
  if (elements.dashboardTotalRecords) elements.dashboardTotalRecords.textContent = String(summary.totalRecords);
  elements.reportOverallAverage.textContent = formatPercent(summary.average);
  elements.reportBestPercent.textContent = summary.best ? formatPercent(summary.best.valor) : "0%";
  elements.reportBestDetail.textContent = summary.best ? `${summary.best.nombre} (${formatDate(summary.best.fecha)})` : "Sin datos";
  elements.reportWorstPercent.textContent = summary.worst ? formatPercent(summary.worst.valor) : "0%";
  elements.reportWorstDetail.textContent = summary.worst ? `${summary.worst.nombre} (${formatDate(summary.worst.fecha)})` : "Sin datos";
  elements.reportLatestDate.textContent = summary.latestDate ? formatDate(summary.latestDate) : "Sin datos";
  elements.reportLatestHint.textContent = summary.latestDate ? getDaysAgoLabel(summary.latestDate) : "Registro mas reciente";
  elements.reportRangeLabel.textContent = getReportRangeLabel();

  renderDateTrendChart(summary.byDate);
  renderCategoryAverageChart(summary.byCategory);
  renderStatsList(elements.categoryStatsList, summary.byCategory, renderCategoryStatItem, "Sin categorias");
  renderStatsList(elements.creatorStatsList, summary.byCreator, renderGroupedStatItem, "Sin usuarios");
  renderStatsList(elements.monthStatsList, summary.byMonth, renderGroupedStatItem, "Sin meses");
}

function buildReportSummary(records) {
  const categoryBuckets = new Map(categories.map((category) => [category.code, createReportBucket(`${category.code} - ${category.name}`)]));
  const creatorBuckets = new Map();
  const monthBuckets = new Map();
  const dateBuckets = new Map();
  const values = [];
  let latestDate = "";

  records.forEach((record) => {
    latestDate = latestDate && latestDate > record.fecha ? latestDate : record.fecha;
    addBucketValue(getOrCreateBucket(creatorBuckets, getRecordCreator(record)), record.promedio);
    addBucketValue(getOrCreateBucket(monthBuckets, record.fecha.slice(0, 7)), record.promedio);
    addBucketValue(getOrCreateBucket(dateBuckets, record.fecha), record.promedio);

    record.categorias.forEach((category) => {
      const bucket = categoryBuckets.get(category.codigo) || getOrCreateBucket(categoryBuckets, `${category.codigo} - ${category.nombre}`);
      addBucketValue(bucket, category.valor);
      if (Number.isNaN(category.valor)) return;
      values.push({
        fecha: record.fecha,
        nombre: `${category.codigo} - ${category.nombre}`,
        valor: category.valor
      });
    });
  });

  const categoryStats = Array.from(categoryBuckets.values()).map(finalizeReportBucket);
  const creatorStats = Array.from(creatorBuckets.values()).map(finalizeReportBucket).sort((a, b) => b.average - a.average);
  const monthStats = Array.from(monthBuckets.values()).map(finalizeReportBucket).sort((a, b) => b.label.localeCompare(a.label));
  const dateStats = Array.from(dateBuckets.values()).map(finalizeReportBucket).sort((a, b) => a.label.localeCompare(b.label));

  return {
    average: records.length ? roundOne(records.reduce((sum, record) => sum + record.promedio, 0) / records.length) : 0,
    best: values.length ? values.slice().sort((a, b) => b.valor - a.valor)[0] : null,
    byCategory: categoryStats,
    byCreator: creatorStats,
    byDate: dateStats,
    byMonth: monthStats,
    latestDate,
    totalRecords: records.length,
    worst: values.length ? values.slice().sort((a, b) => a.valor - b.valor)[0] : null
  };
}

function createReportBucket(label) {
  return {
    count: 0,
    label,
    max: null,
    min: null,
    total: 0
  };
}

function getOrCreateBucket(map, label) {
  if (!map.has(label)) map.set(label, createReportBucket(label));
  return map.get(label);
}

function addBucketValue(bucket, value) {
  if (Number.isNaN(value)) return;
  bucket.count += 1;
  bucket.total += value;
  bucket.max = bucket.max === null ? value : Math.max(bucket.max, value);
  bucket.min = bucket.min === null ? value : Math.min(bucket.min, value);
}

function finalizeReportBucket(bucket) {
  return {
    average: bucket.count ? roundOne(bucket.total / bucket.count) : 0,
    count: bucket.count,
    label: bucket.label,
    max: bucket.max ?? 0,
    min: bucket.min ?? 0
  };
}

function renderDateTrendChart(points) {
  if (!points.length) {
    elements.dateTrendChart.innerHTML = `<p class="empty-chart">Sin datos</p>`;
    return;
  }

  const width = 760;
  const height = 300;
  const left = 46;
  const right = 48;
  const top = 28;
  const bottom = 48;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxCount = Math.max(...points.map((point) => point.count), 1);
  const slot = chartWidth / points.length;
  const barWidth = Math.min(34, slot * 0.52);
  const pointPositions = points.map((point, index) => {
    const x = left + slot * index + slot / 2;
    const percentY = top + chartHeight - (point.average / 100) * chartHeight;
    const countHeight = (point.count / maxCount) * chartHeight;
    const barX = x - barWidth / 2;
    const barY = top + chartHeight - countHeight;

    return { ...point, barX, barY, barWidth, countHeight, percentY, x };
  });
  const linePath = buildSmoothPath(pointPositions);
  const leftTicks = [100, 75, 50, 25, 0]
    .map((tick) => {
      const y = top + chartHeight - (tick / 100) * chartHeight;
      return `
        <line class="chart-grid-line" x1="${left}" y1="${roundOne(y)}" x2="${width - right}" y2="${roundOne(y)}" />
        <text class="axis-label left-axis" x="${left - 10}" y="${roundOne(y + 4)}" text-anchor="end">${tick}%</text>
      `;
    })
    .join("");
  const countTicks = [maxCount, Math.ceil(maxCount / 2), 0]
    .filter((tick, index, array) => array.indexOf(tick) === index)
    .map((tick) => {
      const y = top + chartHeight - (tick / maxCount) * chartHeight;
      return `<text class="axis-label right-axis" x="${width - right + 10}" y="${roundOne(y + 4)}">${tick}</text>`;
    })
    .join("");
  const labels = pointPositions
    .filter((_, index) => index === 0 || index === pointPositions.length - 1)
    .map((point, index) => `<text class="axis-label date-axis" x="${roundOne(point.x)}" y="${height - 14}" text-anchor="${index === 0 ? "start" : "end"}">${escapeHtml(formatDate(point.label))}</text>`)
    .join("");

  elements.dateTrendChart.innerHTML = `
    <div class="chart-legend" aria-hidden="true">
      <span><i class="legend-line"></i>Promedio diario (%)</span>
      <span><i class="legend-bar"></i>Cantidad de registros</span>
    </div>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolucion de promedio diario y cantidad de registros por fecha">
      <defs>
        <linearGradient id="reportBarGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#a9d2ff" />
          <stop offset="100%" stop-color="#3f8df5" />
        </linearGradient>
      </defs>
      ${leftTicks}
      <line class="axis-line" x1="${left}" y1="${top}" x2="${left}" y2="${top + chartHeight}" />
      <line class="axis-line" x1="${width - right}" y1="${top}" x2="${width - right}" y2="${top + chartHeight}" />
      <line class="axis-line" x1="${left}" y1="${top + chartHeight}" x2="${width - right}" y2="${top + chartHeight}" />
      ${countTicks}
      ${pointPositions.map(renderTrendBar).join("")}
      <path class="trend-line" d="${linePath}" />
      ${pointPositions.map(renderTrendPoint).join("")}
      ${labels}
    </svg>
  `;
}

function buildSmoothPath(points) {
  if (points.length === 1) return `M ${roundOne(points[0].x)} ${roundOne(points[0].percentY)}`;

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${roundOne(point.x)} ${roundOne(point.percentY)}`;

    const previous = points[index - 1];
    const controlDistance = (point.x - previous.x) * 0.45;
    const c1x = previous.x + controlDistance;
    const c2x = point.x - controlDistance;
    return `${path} C ${roundOne(c1x)} ${roundOne(previous.percentY)}, ${roundOne(c2x)} ${roundOne(point.percentY)}, ${roundOne(point.x)} ${roundOne(point.percentY)}`;
  }, "");
}

function renderTrendBar(point) {
  return `
    <rect class="count-bar" x="${roundOne(point.barX)}" y="${roundOne(point.barY)}" width="${roundOne(point.barWidth)}" height="${roundOne(point.countHeight)}" rx="4">
      <title>${escapeHtml(formatDate(point.label))} | Promedio: ${formatPercent(point.average)} | Registros: ${point.count}</title>
    </rect>
  `;
}

function renderTrendPoint(point) {
  return `
    <circle class="trend-point" cx="${roundOne(point.x)}" cy="${roundOne(point.percentY)}" r="5">
      <title>${escapeHtml(formatDate(point.label))} | Promedio: ${formatPercent(point.average)} | Registros: ${point.count}</title>
    </circle>
  `;
}

function renderCategoryAverageChart(stats) {
  const visibleStats = stats
    .filter((item) => item.count > 0)
    .sort((a, b) => b.average - a.average);

  elements.categoryAverageChart.innerHTML = visibleStats.length
    ? visibleStats.map(renderCategoryBar).join("")
    : `<p class="empty-chart">Sin datos</p>`;
}

function renderCategoryBar(item) {
  const height = Math.max(4, Math.min(100, item.average));
  const status = getPerformanceStatus(item.average);

  return `
    <div class="bar-column" title="${escapeHtml(item.label)} | Promedio: ${formatPercent(item.average)} | Registros: ${item.count}">
      <strong class="bar-value stat-value performance-${status}">${formatPercent(item.average)}</strong>
      <div class="vertical-track"><div class="vertical-fill performance-${status}" style="height: ${height}%"></div></div>
      <span class="bar-label">${escapeHtml(item.label)}</span>
    </div>
  `;
}

function renderStatsList(container, stats, renderItem, emptyText) {
  const visibleStats = stats.filter((item) => item.count > 0);
  container.innerHTML = visibleStats.length
    ? visibleStats.map(renderItem).join("")
    : `<p class="empty-chart">${emptyText}</p>`;
}

function renderCategoryStatItem(item) {
  return `
    <div class="stats-row">
      <span>${escapeHtml(item.label)}</span>
      <strong class="stat-value performance-${getPerformanceStatus(item.average)}">${formatPercent(item.average)}</strong>
      <small>${item.count} dato(s) | min ${formatPercent(item.min)} | max ${formatPercent(item.max)}</small>
    </div>
  `;
}

function renderGroupedStatItem(item) {
  return `
    <div class="stats-row">
      <span>${escapeHtml(item.label)}</span>
      <strong class="stat-value performance-${getPerformanceStatus(item.average)}">${formatPercent(item.average)}</strong>
      <small>${item.count} registro(s)</small>
    </div>
  `;
}

function getPerformanceStatus(value) {
  if (value >= 70) return "green";
  if (value >= 50) return "yellow";
  return "red";
}

function getReportRangeLabel() {
  const from = elements.reportDateFrom.value;
  const to = elements.reportDateTo.value;
  if (from && to) return `${formatDate(from)} a ${formatDate(to)}`;
  if (from) return `Desde ${formatDate(from)}`;
  if (to) return `Hasta ${formatDate(to)}`;
  return "Todos los registros";
}

function getDaysAgoLabel(fecha) {
  const today = new Date(`${getToday()}T00:00:00`);
  const target = new Date(`${fecha}T00:00:00`);
  const days = Math.max(0, Math.round((today - target) / 86400000));
  return days === 1 ? "Hace 1 dia" : `Hace ${days} dias`;
}

function setReportsMessage(text, type = "info") {
  setElementMessage(elements.reportsMessage, text, type);
}

async function exportRecords() {
  if (!db) {
    setMessage("Configura Firebase antes de exportar.", "error");
    return;
  }
  if (!requireAuthentication()) return;

  try {
    const range = elements.exportRange.value;
    const records = await getRecordsForExport(range);

    if (!records.length) {
      setMessage("No hay registros para exportar en el rango seleccionado.", "warning");
      return;
    }

    const csv = buildCsv(records);
    const filename = `categoria-foco-121-${range}-${getToday()}.csv`;
    downloadCsv(csv, filename);
    setMessage(`CSV generado correctamente: ${records.length} registro(s).`, "success");
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo exportar CSV: ${getFirestoreErrorMessage(error)}`, "error");
  }
}

async function exportJsonRecords() {
  if (!db) {
    setMessage("Configura Firebase antes de exportar.", "error");
    return;
  }
  if (!requireAuthentication()) return;

  try {
    const range = elements.exportRange.value;
    const records = await getRecordsForExport(range);

    if (!records.length) {
      setMessage("No hay registros para exportar en el rango seleccionado.", "warning");
      return;
    }

    const json = JSON.stringify(records, null, 2);
    const filename = `categoria-foco-121-${range}-${getToday()}.json`;
    downloadJson(json, filename);
    setMessage(`JSON generado correctamente: ${records.length} registro(s).`, "success");
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo exportar JSON: ${getFirestoreErrorMessage(error)}`, "error");
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

function downloadJson(json, filename) {
  const blob = new Blob([json], { type: "application/json;charset=utf-8" });
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
    setMessage("Configura Firebase antes de guardar.", "error");
    return;
  }
  if (!requireAuthentication()) return;

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
      setMessage("El registro ya existe para esta fecha. No se creó un segundo registro.", "warning");
      return;
    }

    await firestoreApi.setDoc(recordRef, {
      ...record,
      fechaHoraRegistro: firestoreApi.serverTimestamp(),
      createdAt: firestoreApi.serverTimestamp(),
      createdBy: getActorName(),
      updatedAt: firestoreApi.serverTimestamp(),
      updatedBy: getActorName()
    });

    currentRecord = record;
    setMessage("Registro guardado correctamente. El historial y el dashboard ya están actualizados.", "success");
    await loadPreviousRecord(record.fecha);
    await loadHistory();
    await loadDashboard();
    updateComputedState();
  } catch (error) {
    console.error(error);
    setMessage(`Error al guardar en Firestore: ${getFirestoreErrorMessage(error)}`, "error");
  }
}

async function updateExistingRecord(record) {
  const recordRef = firestoreApi.doc(db, COLLECTION_NAME, buildDocId(editingRecordDate));
  const existingRecord = await firestoreApi.getDoc(recordRef);

  if (!existingRecord.exists()) {
    setMessage("No se encontró el registro original para actualizar.", "error");
    return;
  }

  const currentData = existingRecord.data();
  const preservedCreationFields = {};

  if (Object.prototype.hasOwnProperty.call(currentData, "fechaHoraRegistro")) {
    preservedCreationFields.fechaHoraRegistro = currentData.fechaHoraRegistro;
  }

  if (Object.prototype.hasOwnProperty.call(currentData, "createdAt")) {
    preservedCreationFields.createdAt = currentData.createdAt;
  }

  if (Object.prototype.hasOwnProperty.call(currentData, "createdBy")) {
    preservedCreationFields.createdBy = currentData.createdBy;
  }

  const updatedRecord = {
    ...record,
    ...preservedCreationFields,
    fecha: editingRecordDate,
    fechaHoraActualizacion: firestoreApi.serverTimestamp(),
    updatedAt: firestoreApi.serverTimestamp(),
    updatedBy: getActorName()
  };

  // Futuro control de permisos: aquí se validará si el usuario es admin/supervisor antes de actualizar.
  await firestoreApi.setDoc(recordRef, updatedRecord);

  currentRecord = normalizeRecord(updatedRecord);
  setMessage("Registro actualizado correctamente. Se mantuvo el mismo documento.", "success");
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
    setMessage("Selecciona una fecha.", "warning");
    return null;
  }

  if (!nombre) {
    setMessage("Selecciona un nombre.", "warning");
    return null;
  }

  if (!turno) {
    setMessage("Selecciona un turno.", "warning");
    return null;
  }

  if (values.some((item) => Number.isNaN(item.valor))) {
    setMessage("Todas las categorías deben tener un valor numérico.", "warning");
    return null;
  }

  if (values.some((item) => item.valor < 0 || item.valor > 100)) {
    setMessage("Los porcentajes deben estar entre 0 y 100.", "warning");
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
  if (elements.headerAverage) elements.headerAverage.textContent = hasCompleteValues ? formatPercent(average) : "0%";
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

function updateCreatorFilterOptions(records) {
  const selectedCreator = elements.filterCreator.value;
  const creators = Array.from(new Set(records.map(getRecordCreator).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  elements.filterCreator.innerHTML = [
    `<option value="">Todos</option>`,
    ...creators.map((creator) => `<option value="${escapeHtml(creator)}">${escapeHtml(creator)}</option>`)
  ].join("");

  if (creators.includes(selectedCreator)) {
    elements.filterCreator.value = selectedCreator;
  }
}

function matchesHistoryFilters(record) {
  const filters = getHistoryFilters();

  if (filters.dateFrom && record.fecha < filters.dateFrom) return false;
  if (filters.dateTo && record.fecha > filters.dateTo) return false;
  if (filters.creator && getRecordCreator(record) !== filters.creator) return false;
  if (filters.category && !getCategoryValue(record, filters.category)) return false;
  if (filters.search && !getSearchableRecordText(record).includes(filters.search)) return false;

  return true;
}

function getHistoryFilters() {
  return {
    search: normalizeSearchText(elements.historySearchInput.value),
    dateFrom: elements.filterDateFrom.value,
    dateTo: elements.filterDateTo.value,
    creator: elements.filterCreator.value,
    category: elements.filterCategory.value
  };
}

function getRecordCreator(record) {
  return record.createdBy || record.nombre || "Sin usuario";
}

function getCategoryValue(record, code) {
  return record.categorias.find((category) => category.codigo === code);
}

function getSelectedHistoryCategory(record) {
  const selectedCode = elements.filterCategory.value;
  return selectedCode ? getCategoryValue(record, selectedCode) : null;
}

function getSearchableRecordText(record) {
  const categoryText = record.categorias
    .map((category) => `${category.codigo} ${category.nombre} ${category.valor}`)
    .join(" ");

  return normalizeSearchText([
    record.fecha,
    formatDate(record.fecha),
    record.nombre,
    getRecordCreator(record),
    record.turno,
    record.promedio,
    record.observaciones,
    categoryText
  ].join(" "));
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function updateResultsCount(count) {
  const label = count === 1 ? "resultado" : "resultados";
  elements.resultsCount.textContent = `${count} ${label}`;
}

async function clearHistoryFilters() {
  elements.historySearchInput.value = "";
  elements.filterDateFrom.value = "";
  elements.filterDateTo.value = "";
  elements.filterCreator.value = "";
  elements.filterCategory.value = "";
  await loadHistory();
}

function renderHistoryItem(record) {
  const date = escapeHtml(formatDate(record.fecha));
  const nombre = escapeHtml(record.nombre || "Sin nombre");
  const turno = escapeHtml(record.turno || "Sin turno");
  const selectedCategory = getSelectedHistoryCategory(record);
  const categoryLine = selectedCategory
    ? `<small>${escapeHtml(selectedCategory.codigo)} - ${escapeHtml(selectedCategory.nombre)}: ${formatPercent(selectedCategory.valor)}</small>`
    : "";
  const disabled = canEditRecords() ? "" : " disabled";
  const deleteHidden = canDeleteRecords() ? "" : " hidden";
  return `
    <article class="history-item">
      <div class="history-row">
        <div>
          <span>${date}<br />${nombre} · ${turno}</span>
          ${categoryLine}
          <strong>${formatPercent(record.promedio)}</strong>
        </div>
        <div class="history-actions">
          <button class="history-edit-button" type="button" data-edit-date="${escapeHtml(record.fecha)}"${disabled}>Ver / Editar</button>
          <button class="history-delete-button${deleteHidden}" type="button" data-delete-date="${escapeHtml(record.fecha)}">Eliminar</button>
        </div>
      </div>
    </article>
  `;
}

async function showWhatsappMessage() {
  if (!db) {
    setMessage("Configura Firebase antes de generar WhatsApp.", "error");
    return;
  }
  if (!requireAuthentication()) return;

  const fecha = elements.dateInput.value;
  if (!fecha) {
    setMessage("Selecciona una fecha para generar WhatsApp.", "warning");
    return;
  }

  try {
    const record = await getRecordByDate(fecha);
    if (!record) {
      setMessage("No existe un registro guardado para la fecha seleccionada.", "warning");
      return;
    }

    const previous = await getRecordByDate(getPreviousDate(fecha));
    const message = buildWhatsappMessage(record, previous);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

    elements.whatsappText.value = message;
    elements.openWhatsappLink.href = whatsappUrl;
    const copied = await copyTextToClipboard(message);
    setMessage(copied ? "Mensaje WhatsApp generado y copiado al portapapeles." : "Mensaje WhatsApp generado. Usa Copiar mensaje si WhatsApp no pega el texto.", "success");
    elements.whatsappDialog.showModal();
  } catch (error) {
    console.error(error);
    setMessage(`No se pudo generar WhatsApp: ${getFirestoreErrorMessage(error)}`, "error");
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

function setMessage(text, type = "info") {
  setElementMessage(elements.formMessage, text, type);
}

function setLoginMessage(text, type = "info") {
  setElementMessage(elements.loginMessage, text, type);
}

function setElementMessage(element, text, type = "info") {
  if (!element) return;
  element.textContent = text;
  element.classList.remove("success", "error", "warning", "info");
  if (text) {
    element.classList.add(type);
  }
}

function getAuthErrorMessage(error) {
  const messages = {
    "auth/invalid-credential": "correo o contrasena incorrectos.",
    "auth/configuration-not-found": "Firebase Authentication no esta habilitado para este proyecto.",
    "auth/invalid-email": "el correo no tiene un formato valido.",
    "auth/missing-password": "ingresa la contrasena.",
    "auth/network-request-failed": "no se pudo conectar con Firebase Authentication.",
    "auth/too-many-requests": "hay demasiados intentos. Espera unos minutos y vuelve a intentar.",
    "auth/user-disabled": "este usuario esta deshabilitado.",
    "auth/user-not-found": "no existe un usuario con ese correo.",
    "auth/wrong-password": "la contrasena no es correcta."
  };

  return messages[error?.code] || "revisa las credenciales y vuelve a intentar.";
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
