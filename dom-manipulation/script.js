// === Dynamic Quote Generator with Category Filtering, LocalStorage, and SessionStorage ===

const LOCAL_STORAGE_KEY = "quotes_v1";
const LAST_FILTER_KEY = "lastSelectedCategory";
const SESSION_LAST_VIEWED = "lastViewedQuote";
let selectedCategory = "all";

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
  // save last viewed to session storage
  sessionStorage.setItem(SESSION_LAST_VIEWED, JSON.stringify({ text, category }));
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

  // ✅ Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem(LAST_FILTER_KEY);
  if (lastFilter && (categories.includes(lastFilter) || lastFilter === "all")) {
    dropdown.value = lastFilter;
    filterQuotes(); // auto-apply filter on load
  }
}

/* === Filter Quotes by Category === */
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  // ✅ Save selected category to localStorage
  localStorage.setItem(LAST_FILTER_KEY, selectedCategory);

  if (selectedCategory === "all") {
    showRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
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

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const text = document.getElementById("quoteText").value.trim();
    const category = document.getElementById("quoteCategory").value.trim();
    if (!text || !category) {
      alert("Please fill in both fields.");
      return;
    }

    const newQuote = { text, category };

    try {
      // Post to mock API
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuote)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // If server post successful, update local storage
      quotes.push(newQuote);
      saveQuotes();
      populateCategories(); // ✅ refresh categories if new one added
      form.reset();
      showRandomQuote();
      notifyUser("Quote added successfully!");
    } catch (error) {
      console.error('Error posting quote:', error);
      notifyUser("Failed to add quote to server. Please try again.");
    }
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

/* === INIT === */
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  createAddQuoteForm();
  createImportExportUI();

  document.getElementById("newQuote").addEventListener("click", filterQuotes);

  // ✅ Restore last viewed quote
  const last = sessionStorage.getItem(SESSION_LAST_VIEWED);
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


const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock endpoint

// Simulate fetching from "server"
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();

    // Convert fake posts to your quote format
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    handleServerSync(serverQuotes);
  } catch (err) {
    console.error("Server fetch failed:", err);
  }
}


function handleServerSync(serverQuotes) {
  const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

  // Basic merge (server takes precedence)
  const mergedQuotes = [...serverQuotes];

  localQuotes.forEach(local => {
    const exists = serverQuotes.some(sq => sq.text === local.text);
    if (!exists) mergedQuotes.push(local);
  });

  // Save merged result locally
  localStorage.setItem("quotes", JSON.stringify(mergedQuotes));
  quotes = mergedQuotes;

  populateCategories();
  filterQuotes();

  notifyUser("Quotes synced with server.");
}


function notifyUser(message) {
  const note = document.getElementById("notification");
  note.textContent = message;
  setTimeout(() => (note.textContent = ""), 3000);
}
