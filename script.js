// Step 1: Manage an array of quote objects
const quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" },
  { text: "Simplicity is the ultimate sophistication.", category: "Design" },
];

// Step 2: Function to show a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const { text, category } = quotes[randomIndex];

  quoteDisplay.innerHTML = `
    <p>"${text}"</p>
    <p><strong>Category:</strong> ${category}</p>
  `;
}

// Step 3: Function to create and handle the Add Quote Form
function createAddQuoteForm() {
  // Create form elements dynamically
  const form = document.createElement("form");
  form.id = "addQuoteForm";

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter quote text";
  quoteInput.required = true;

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter category";
  categoryInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Add Quote";
  submitBtn.type = "submit";

  // Append inputs to form
  form.append(quoteInput, categoryInput, submitBtn);
  document.body.appendChild(form);

  // Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const newQuote = {
      text: quoteInput.value.trim(),
      category: categoryInput.value.trim()
    };

    // Validation
    if (newQuote.text && newQuote.category) {
      quotes.push(newQuote);
      alert("Quote added successfully!");
      form.reset();
    } else {
      alert("Please fill in both fields.");
    }
  });
}

// Step 4: Set up event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Step 5: Initialize the app
window.addEventListener("DOMContentLoaded", () => {
  showRandomQuote();      // show one at start
  createAddQuoteForm();   // generate the add form
});
