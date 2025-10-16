
const DEFAULT_QUOTES = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
];

const LS_KEY = "dqg_quotes_v1";          // localStorage key for persistent quotes
const SESSION_LAST_VIEWED = "dqg_last";  // sessionStorage key for last viewed quote index

// In-memory quotes array (will be loaded from localStorage if present)
// This variable is already declared earlier, so it should be removed.

// -----------------------------
// Utility: Save / Load to localStorage
// -----------------------------
function saveQuotes() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
    alert("Unable to save quotes — localStorage error.");
  }
}

function loadQuotes() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    quotes = [...DEFAULT_QUOTES];
    saveQuotes(); 
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(q => q && typeof q.text === "string")) {
      quotes = parsed;
    } else {
      console.warn("Invalid data in localStorage, resetting to defaults.");
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
    }
  } catch (err) {
    console.error("Error parsing saved quotes JSON:", err);
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
  }
}

// -----------------------------
// Show a random quote and store last viewed in sessionStorage
// -----------------------------
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (!quotes.length) {
    quoteDisplay.innerHTML = "<p>No quotes available.</p>";
    return;
  }

  // Prefer to show the last viewed if session says so (makes "back to last" possible)
  const lastIndexRaw = sessionStorage.getItem(SESSION_LAST_VIEWED);
  let randomIndex;
  if (lastIndexRaw !== null && Math.random() < 0.15) {
    // 15% chance to show the session-stored last viewed to demonstrate sessionStorage use
    const li = parseInt(lastIndexRaw, 10);
    if (!Number.isNaN(li) && li >= 0 && li < quotes.length) randomIndex = li;
  }
  if (randomIndex === undefined) randomIndex = Math.floor(Math.random() * quotes.length);

  const { text, category } = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <blockquote style="font-style: italic; margin: 0 0 8px 0;">"${escapeHtml(text)}"</blockquote>
    <div><strong>Category:</strong> ${escapeHtml(category || "Uncategorized")}</div>
    <div style="margin-top:6px; font-size: 0.9em; color: #666;">
      <small>Quote #${randomIndex + 1} of ${quotes.length}</small>
    </div>
  `;

  // store last viewed index in sessionStorage (temporary for this browser tab)
  try {
    sessionStorage.setItem(SESSION_LAST_VIEWED, String(randomIndex));
  } catch (err) {
    console.warn("sessionStorage not available:", err);
  }
}

// small helper to prevent accidental HTML injection when inserting user content
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// -----------------------------
// Create dynamic Add-Quote form
// -----------------------------
function createAddQuoteForm() {
  // If the form already exists, do nothing
  if (document.getElementById("addQuoteForm")) return;

  const form = document.createElement("form");
  form.id = "addQuoteForm";
  form.style.marginTop = "12px";
  form.style.display = "grid";
  form.style.gridTemplateColumns = "1fr 1fr auto";
  form.style.gap = "8px";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter quote text";
  quoteInput.required = true;
  quoteInput.id = "quoteTextInput";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Category (e.g., Motivational)";
  categoryInput.required = true;
  categoryInput.id = "quoteCategoryInput";

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Quote";

  form.append(quoteInput, categoryInput, submitBtn);
  // Insert the form after the "Show New Quote" button or at the end of body
  const newQuoteBtn = document.getElementById("newQuote");
  if (newQuoteBtn && newQuoteBtn.parentNode) {
    newQuoteBtn.parentNode.insertBefore(form, newQuoteBtn.nextSibling);
  } else {
    document.body.appendChild(form);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newText = quoteInput.value.trim();
    const newCategory = categoryInput.value.trim() || "Uncategorized";

    // Basic validation
    if (!newText) {
      alert("Please enter the quote text.");
      return;
    }

    const newQuote = { text: newText, category: newCategory };
    quotes.push(newQuote);
    saveQuotes();

    // UX: show the newly added quote immediately
    const newIndex = quotes.length - 1;
    try {
      sessionStorage.setItem(SESSION_LAST_VIEWED, String(newIndex));
    } catch (err) { /* ignore */ }

    showQuoteAtIndex(newIndex);
    form.reset();
    // small success feedback
    flashMessage("Quote added and saved.", 2000);
  });
}

// helper to show quote at specific index
function showQuoteAtIndex(index) {
  if (!Number.isInteger(index) || index < 0 || index >= quotes.length) {
    showRandomQuote();
    return;
  }
  const quoteDisplay = document.getElementById("quoteDisplay");
  const { text, category } = quotes[index];
  quoteDisplay.innerHTML = `
    <blockquote style="font-style: italic; margin: 0 0 8px 0;">"${escapeHtml(text)}"</blockquote>
    <div><strong>Category:</strong> ${escapeHtml(category || "Uncategorized")}</div>
    <div style="margin-top:6px; font-size: 0.9em; color: #666;">
      <small>Quote #${index + 1} of ${quotes.length}</small>
    </div>
  `;
  try { sessionStorage.setItem(SESSION_LAST_VIEWED, String(index)); } catch (e) {}
}

// small temporary flash message in top-right corner
function flashMessage(msg, ms = 1500) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.position = "fixed";
  el.style.right = "20px";
  el.style.top = "20px";
  el.style.padding = "8px 12px";
  el.style.background = "#222";
  el.style.color = "#fff";
  el.style.borderRadius = "6px";
  el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  el.style.zIndex = 10000;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

// -----------------------------
// Export quotes to JSON (download)
// -----------------------------
function exportQuotesToJson() {
  try {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `quotes_export_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    flashMessage("Export started", 1200);
  } catch (err) {
    console.error("Export error:", err);
    alert("Failed to export quotes.");
  }
}

// -----------------------------
// Import JSON file handler
// -----------------------------
function importFromJsonFile(event) {
  const input = event.target;
  if (!input.files || !input.files[0]) {
    alert("No file selected.");
    return;
  }

  const file = input.files[0];

  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!Array.isArray(parsed)) {
        throw new Error("Imported JSON must be an array of quote objects.");
      }

      // Validate objects and normalize: convert items that have text property
      const cleaned = parsed
        .map(item => {
          if (!item || typeof item.text !== "string") return null;
          return { text: item.text.trim(), category: (item.category && typeof item.category === "string") ? item.category.trim() : "Uncategorized" };
        })
        .filter(Boolean); // remove nulls

      if (!cleaned.length) {
        alert("No valid quote objects found in file.");
        return;
      }

      // Option: avoid duplicates — simple heuristic: text must not already exist
      let addedCount = 0;
      const existingTexts = new Set(quotes.map(q => q.text));
      cleaned.forEach(q => {
        if (!existingTexts.has(q.text)) {
          quotes.push(q);
          existingTexts.add(q.text);
          addedCount++;
        }
      });

      saveQuotes();
      flashMessage(`${addedCount} quotes imported.`, 2200);
      // reset the input so same file can be re-imported if needed
      input.value = "";
    } catch (err) {
      console.error("Import error:", err);
      alert("Invalid JSON file: " + (err && err.message ? err.message : "unknown error"));
      input.value = "";
    }
  };

  reader.onerror = function (err) {
    console.error("FileReader error:", err);
    alert("Failed to read file.");
  };

  reader.readAsText(file);
}

// -----------------------------
// Clear saved quotes (localStorage) — destructive
// -----------------------------
function clearSavedQuotes() {
  if (!confirm("Clear all saved quotes and reset to defaults? This cannot be undone.")) return;
  try {
    localStorage.removeItem(LS_KEY);
    loadQuotes();
    showRandomQuote();
    flashMessage("Saved quotes cleared.", 1500);
  } catch (err) {
    console.error("Error clearing storage:", err);
    alert("Failed to clear storage.");
  }
}

// -----------------------------
// Initialize event listeners & load data
// -----------------------------
function initializeApp() {
  // load any saved quotes
  loadQuotes();

   // create add form (if not present)
  createAddQuoteForm();

  // button to show new random quote
  const newQuoteBtn = document.getElementById("newQuote");
  if (newQuoteBtn) newQuoteBtn.addEventListener("click", showRandomQuote);

  // export button
  const exportBtn = document.getElementById("exportQuotes");
  if (exportBtn) exportBtn.addEventListener("click", exportQuotesToJson);

  // import file input
  const importInput = document.getElementById("importFile");
  if (importInput) importInput.addEventListener("change", importFromJsonFile);

  // clear storage button
  const clearBtn = document.getElementById("clearStorage");
  if (clearBtn) clearBtn.addEventListener("click", clearSavedQuotes);

  // show something on start
  // If sessionStorage has a last viewed index, try to show it; else random.
  const lastIndexRaw = sessionStorage.getItem(SESSION_LAST_VIEWED);
  if (lastIndexRaw !== null) {
    const idx = parseInt(lastIndexRaw, 10);
    if (!Number.isNaN(idx) && idx >= 0 && idx < quotes.length) {
      showQuoteAtIndex(idx);
      return;
    }
  }
  showRandomQuote();
}

// Auto-run when DOM ready
window.addEventListener("DOMContentLoaded", initializeApp);


// === Dynamic Quote Generator v3 ===
// Features: LocalStorage, SessionStorage, Import/Export JSON, Category Filtering
// Author: Daniel Kofi Yamoah ✊

const LOCAL_STORAGE_KEY = "quotes_v1";
const LAST_FILTER_KEY = "lastSelectedCategory";

const defaultQuotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
];

let quotes = [];

/* === Load & Save Quotes === */
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [...defaultQuotes];
    }
  } else {
    quotes = [...defaultQuotes];
    saveQuotes();
  }
}

/* === Escape HTML (for safety) === */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* === Random Quote Display === */
function showRandomQuote(filteredList = quotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (!filteredList.length) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredList.length);
  const { text, category } = filteredList[randomIndex];
  quoteDisplay.innerHTML = `
    <blockquote style="font-style:italic;">"${escapeHtml(text)}"</blockquote>
    <p><strong>Category:</strong> ${escapeHtml(category)}</p>
  `;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify({ text, category }));
}

/* === Category Dropdown: Populate === */
function populateCategories() {
  let categories = [...new Set(quotes.map(q => q.category))];
  const dropdown = document.getElementById("categoryFilter");
  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    dropdown.appendChild(opt);
  });

  // Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem(LAST_FILTER_KEY);
  if (lastFilter && categories.includes(lastFilter) || lastFilter === "all") {
    dropdown.value = lastFilter;
    filterQuotes(); // auto-apply filter on load
  }
}

/* === Filter Quotes by Category === */
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem(LAST_FILTER_KEY, selected);
  if (selected === "all") {
    showRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selected);
    showRandomQuote(filtered);
  }
}

/* === Add New Quote Form === */
function createAddQuoteForm() {
  const form = document.createElement("form");
  form.id = "addQuoteForm";
  form.innerHTML = `
    <input id="quoteText" type="text" placeholder="Enter quote text" required />
    <input id="quoteCategory" type="text" placeholder="Enter category" required />
    <button type="submit">Add Quote</button>
  `;
  document.body.appendChild(form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = document.getElementById("quoteText").value.trim();
    const category = document.getElementById("quoteCategory").value.trim();
    if (!text || !category) {
      alert("Please fill in both fields.");
      return;
    }

    quotes.push({ text, category });
    saveQuotes();
    populateCategories(); // refresh categories if new one added
    form.reset();
    showRandomQuote();
  });
}

/* === Import / Export === */
function createImportExportUI() {
  const container = document.createElement("div");
  container.style.marginTop = "1rem";
  container.innerHTML = `
    <button id="exportBtn">Export Quotes (JSON)</button>
    <label for="importFile" style="cursor:pointer; border:1px solid; padding:0.3rem;">Import Quotes</label>
    <input type="file" id="importFile" accept=".json" style="display:none;" />
  `;
  document.body.appendChild(container);

  document.getElementById("exportBtn").addEventListener("click", exportQuotes);
  document.getElementById("importFile").addEventListener("change", importQuotes);
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importQuotes(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

/* === Create Category Dropdown === */
function createCategoryFilter() {
  const select = document.createElement("select");
  select.id = "categoryFilter";
  select.addEventListener("change", filterQuotes);
  document.body.insertBefore(select, document.getElementById("quoteDisplay"));
  populateCategories();
}

/* === INIT === */
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createCategoryFilter();
  createAddQuoteForm();
  createImportExportUI();

  document.getElementById("newQuote").addEventListener("click", filterQuotes);

  // Load last viewed or show random
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const { text, category } = JSON.parse(last);
    document.getElementById("quoteDisplay").innerHTML = `
      <blockquote style="font-style:italic;">"${escapeHtml(text)}"</blockquote>
      <p><strong>Category:</strong> ${escapeHtml(category)}</p>
    `;
  } else {
    showRandomQuote();
  }
});