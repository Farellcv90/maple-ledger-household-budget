// Maple Ledger seed data — fictional figures for the Maple household
// (Maya and Daniel Maple, and their daughter Lily, age 8).
// Every figure on the site is computed from these rows, so the dashboard,
// the budgets, the bills and the reports always agree with each other.

export const HOUSEHOLD = {
  name: "The Maple Household",
  members: "Maya and Daniel Maple, and Lily, age 8",
  currency: "USD",
};

export const CATEGORIES = [
  "Housing",
  "Groceries",
  "Transport",
  "Utilities",
  "Dining Out",
  "Entertainment",
  "Health",
  "Kids",
  "Savings",
];

// Monthly spending budgets per category. Savings is a monthly savings
// target rather than spending, and is shown separately on the Budgets page.
export const BUDGETS = {
  "2026-10": {
    Housing: 1850, Groceries: 720, Transport: 380, Utilities: 310,
    "Dining Out": 260, Entertainment: 180, Health: 220, Kids: 300,
  },
  "2026-11": {
    Housing: 1850, Groceries: 720, Transport: 380, Utilities: 310,
    "Dining Out": 260, Entertainment: 180, Health: 220, Kids: 300,
  },
};

export const SAVINGS_TARGET = { "2026-10": 900, "2026-11": 900 };

// type is "income" or "expense". A savings transfer is an expense in the
// Savings category, so it counts toward the savings target, not spending.
export const TRANSACTIONS = [
  // ---- October 2026 ----
  { id: "oct-01", date: "2026-10-01", description: "Rent — Maple Street apartment", category: "Housing", amount: 1650.00, type: "expense" },
  { id: "oct-02", date: "2026-10-01", description: "Renters insurance", category: "Housing", amount: 42.00, type: "expense" },
  { id: "oct-03", date: "2026-10-03", description: "Salary — Maya, Riverdale Clinic", category: "Income", amount: 3850.00, type: "income" },
  { id: "oct-04", date: "2026-10-03", description: "Transfer to emergency fund", category: "Savings", amount: 500.00, type: "expense" },
  { id: "oct-05", date: "2026-10-04", description: "GreenMart weekly shop", category: "Groceries", amount: 142.10, type: "expense" },
  { id: "oct-06", date: "2026-10-05", description: "Electric bill — City Power", category: "Utilities", amount: 121.60, type: "expense" },
  { id: "oct-07", date: "2026-10-06", description: "Gas — Route 9 station", category: "Transport", amount: 46.80, type: "expense" },
  { id: "oct-08", date: "2026-10-08", description: "Metro passes — Maya and Daniel", category: "Transport", amount: 96.00, type: "expense" },
  { id: "oct-09", date: "2026-10-09", description: "Water bill", category: "Utilities", amount: 52.30, type: "expense" },
  { id: "oct-10", date: "2026-10-10", description: "GreenMart weekly shop", category: "Groceries", amount: 128.75, type: "expense" },
  { id: "oct-11", date: "2026-10-11", description: "Pizza night — Tony's", category: "Dining Out", amount: 41.20, type: "expense" },
  { id: "oct-12", date: "2026-10-12", description: "Internet — NorthNet", category: "Utilities", amount: 79.99, type: "expense" },
  { id: "oct-13", date: "2026-10-13", description: "Streaming — ScreenBox", category: "Entertainment", amount: 15.99, type: "expense" },
  { id: "oct-14", date: "2026-10-15", description: "School lunch — Lily, October", category: "Kids", amount: 62.00, type: "expense" },
  { id: "oct-15", date: "2026-10-17", description: "Salary — Daniel, Harbor Logistics", category: "Income", amount: 2900.00, type: "income" },
  { id: "oct-16", date: "2026-10-17", description: "Transfer to holiday fund", category: "Savings", amount: 200.00, type: "expense" },
  { id: "oct-17", date: "2026-10-18", description: "Corner Market top-up", category: "Groceries", amount: 61.20, type: "expense" },
  { id: "oct-18", date: "2026-10-19", description: "Pharmacy — cold medicine", category: "Health", amount: 31.20, type: "expense" },
  { id: "oct-19", date: "2026-10-20", description: "Family lunch — Riverside Cafe", category: "Dining Out", amount: 58.90, type: "expense" },
  { id: "oct-20", date: "2026-10-21", description: "Freelance — Daniel, weekend delivery", category: "Income", amount: 280.00, type: "income" },
  { id: "oct-21", date: "2026-10-21", description: "Transfer to new fridge fund", category: "Savings", amount: 100.00, type: "expense" },
  { id: "oct-22", date: "2026-10-22", description: "Gym — Daniel, monthly", category: "Health", amount: 45.00, type: "expense" },
  { id: "oct-23", date: "2026-10-23", description: "Art class supplies — Lily", category: "Kids", amount: 41.50, type: "expense" },
  { id: "oct-24", date: "2026-10-24", description: "GreenMart weekly shop", category: "Groceries", amount: 155.40, type: "expense" },
  { id: "oct-25", date: "2026-10-25", description: "Gas — Route 9 station", category: "Transport", amount: 43.10, type: "expense" },
  { id: "oct-26", date: "2026-10-26", description: "Takeout — noodle bar", category: "Dining Out", amount: 29.40, type: "expense" },
  { id: "oct-27", date: "2026-10-27", description: "Board game — Family Game Night", category: "Entertainment", amount: 24.00, type: "expense" },
  { id: "oct-28", date: "2026-10-28", description: "Phone plan — Maya and Daniel", category: "Utilities", amount: 89.00, type: "expense" },
  { id: "oct-29", date: "2026-10-30", description: "Kids' winter jackets — Lily", category: "Kids", amount: 78.00, type: "expense" },

  // ---- November 2026 ----
  { id: "nov-01", date: "2026-11-01", description: "Rent — Maple Street apartment", category: "Housing", amount: 1650.00, type: "expense" },
  { id: "nov-02", date: "2026-11-01", description: "Renters insurance", category: "Housing", amount: 42.00, type: "expense" },
  { id: "nov-03", date: "2026-11-02", description: "GreenMart weekly shop", category: "Groceries", amount: 148.20, type: "expense" },
  { id: "nov-04", date: "2026-11-03", description: "Salary — Maya, Riverdale Clinic", category: "Income", amount: 3850.00, type: "income" },
  { id: "nov-05", date: "2026-11-03", description: "Transfer to emergency fund", category: "Savings", amount: 500.00, type: "expense" },
  { id: "nov-06", date: "2026-11-03", description: "Gas — Route 9 station", category: "Transport", amount: 48.50, type: "expense" },
  { id: "nov-07", date: "2026-11-04", description: "Pizza night — Tony's", category: "Dining Out", amount: 38.60, type: "expense" },
  { id: "nov-08", date: "2026-11-05", description: "Electric bill — City Power", category: "Utilities", amount: 128.40, type: "expense" },
  { id: "nov-09", date: "2026-11-05", description: "School lunch — Lily, November", category: "Kids", amount: 62.00, type: "expense" },
  { id: "nov-10", date: "2026-11-06", description: "Movie night — cinema, family of three", category: "Entertainment", amount: 32.00, type: "expense" },
  { id: "nov-11", date: "2026-11-07", description: "GreenMart weekly shop", category: "Groceries", amount: 132.45, type: "expense" },
  { id: "nov-12", date: "2026-11-07", description: "Pharmacy — vitamins and plasters", category: "Health", amount: 28.40, type: "expense" },
  { id: "nov-13", date: "2026-11-08", description: "Metro passes — Maya and Daniel", category: "Transport", amount: 96.00, type: "expense" },
  { id: "nov-14", date: "2026-11-09", description: "Water bill", category: "Utilities", amount: 54.10, type: "expense" },
  { id: "nov-15", date: "2026-11-10", description: "Lunch — Corner Cafe, Maya", category: "Dining Out", amount: 24.75, type: "expense" },
  { id: "nov-16", date: "2026-11-11", description: "Corner Market top-up", category: "Groceries", amount: 58.90, type: "expense" },
  { id: "nov-17", date: "2026-11-11", description: "Art supplies — Lily", category: "Kids", amount: 34.60, type: "expense" },
  { id: "nov-18", date: "2026-11-12", description: "Internet — NorthNet", category: "Utilities", amount: 79.99, type: "expense" },
  { id: "nov-19", date: "2026-11-12", description: "Plumber — leaky kitchen faucet", category: "Housing", amount: 86.00, type: "expense" },
  { id: "nov-20", date: "2026-11-13", description: "Streaming — ScreenBox", category: "Entertainment", amount: 15.99, type: "expense" },
  { id: "nov-21", date: "2026-11-14", description: "Gas — Route 9 station", category: "Transport", amount: 44.20, type: "expense" },
  { id: "nov-22", date: "2026-11-14", description: "Dentist check-up — Daniel, copay", category: "Health", amount: 75.00, type: "expense" },
  { id: "nov-23", date: "2026-11-15", description: "GreenMart weekly shop", category: "Groceries", amount: 164.30, type: "expense" },
  { id: "nov-24", date: "2026-11-16", description: "Sushi dinner — Harbor Sushi", category: "Dining Out", amount: 62.40, type: "expense" },
  { id: "nov-25", date: "2026-11-17", description: "Salary — Daniel, Harbor Logistics", category: "Income", amount: 2900.00, type: "income" },
  { id: "nov-26", date: "2026-11-17", description: "Transfer to holiday fund", category: "Savings", amount: 250.00, type: "expense" },
  { id: "nov-27", date: "2026-11-17", description: "Kids' shoes — Lily", category: "Kids", amount: 58.00, type: "expense" },
  { id: "nov-28", date: "2026-11-18", description: "Phone plan — Maya and Daniel", category: "Utilities", amount: 89.00, type: "expense" },
  { id: "nov-29", date: "2026-11-19", description: "Farmers market — vegetables and eggs", category: "Groceries", amount: 46.75, type: "expense" },
  { id: "nov-30", date: "2026-11-20", description: "Freelance — Daniel, weekend delivery", category: "Income", amount: 320.00, type: "income" },
  { id: "nov-31", date: "2026-11-20", description: "Transfer to new fridge fund", category: "Savings", amount: 150.00, type: "expense" },
  { id: "nov-32", date: "2026-11-20", description: "Board game — Lanterns of Autumn", category: "Entertainment", amount: 28.50, type: "expense" },
  { id: "nov-33", date: "2026-11-21", description: "Car service — oil change and check", category: "Transport", amount: 118.00, type: "expense" },
  { id: "nov-34", date: "2026-11-21", description: "Gym — Daniel, monthly", category: "Health", amount: 45.00, type: "expense" },
  { id: "nov-35", date: "2026-11-22", description: "Corner Market top-up", category: "Groceries", amount: 71.60, type: "expense" },
  { id: "nov-36", date: "2026-11-22", description: "After-school club — Lily, November", category: "Kids", amount: 85.00, type: "expense" },
  { id: "nov-37", date: "2026-11-23", description: "Family dinner — Riverside Diner", category: "Dining Out", amount: 47.90, type: "expense" },
  { id: "nov-38", date: "2026-11-24", description: "Museum visit — family tickets", category: "Entertainment", amount: 36.00, type: "expense" },
  { id: "nov-39", date: "2026-11-25", description: "Gas — Route 9 station", category: "Transport", amount: 41.75, type: "expense" },
  { id: "nov-40", date: "2026-11-26", description: "GreenMart weekly shop", category: "Groceries", amount: 89.40, type: "expense" },
  { id: "nov-41", date: "2026-11-26", description: "Pharmacy — vitamins", category: "Health", amount: 19.85, type: "expense" },
  { id: "nov-42", date: "2026-11-27", description: "Takeout — Thai Garden", category: "Dining Out", amount: 33.25, type: "expense" },
  { id: "nov-43", date: "2026-11-28", description: "Storybooks — Lily, three books", category: "Kids", amount: 26.40, type: "expense" },
];

// Savings goals. "saved" is the balance held toward each goal today.
export const GOALS = [
  { id: "goal-emergency", name: "Emergency fund", detail: "Six months of essentials, kept in a separate savings account.", target: 6000, saved: 4250 },
  { id: "goal-holiday", name: "Family holiday", detail: "A week by the coast next summer — train, cottage and meals.", target: 2400, saved: 1680 },
  { id: "goal-fridge", name: "New fridge", detail: "Replace the rattling ten-year-old fridge before it gives up.", target: 900, saved: 540 },
];

// Recurring bills. "paid" is the November status; toggling it updates the
// dashboard's upcoming list and the totals on this page.
export const BILLS = [
  { id: "bill-rent", name: "Rent — Maple Street apartment", due: "2026-11-01", amount: 1650.00, repeat: "Monthly", paid: true },
  { id: "bill-electric", name: "Electric — City Power", due: "2026-11-05", amount: 128.40, repeat: "Monthly", paid: true },
  { id: "bill-water", name: "Water", due: "2026-11-09", amount: 54.10, repeat: "Monthly", paid: true },
  { id: "bill-internet", name: "Internet — NorthNet", due: "2026-11-12", amount: 79.99, repeat: "Monthly", paid: true },
  { id: "bill-streaming", name: "Streaming — ScreenBox", due: "2026-11-13", amount: 15.99, repeat: "Monthly", paid: true },
  { id: "bill-phone", name: "Phone plan — Maya and Daniel", due: "2026-11-18", amount: 89.00, repeat: "Monthly", paid: true },
  { id: "bill-gym", name: "Gym — Daniel", due: "2026-11-21", amount: 45.00, repeat: "Monthly", paid: true },
  { id: "bill-card", name: "Credit card — Maple Card", due: "2026-11-25", amount: 312.40, repeat: "Monthly", paid: false },
  { id: "bill-insurance", name: "Car insurance", due: "2026-11-28", amount: 112.00, repeat: "Monthly", paid: false },
  { id: "bill-music", name: "Music lessons — Lily", due: "2026-12-02", amount: 60.00, repeat: "Monthly", paid: false },
];
