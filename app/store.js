// Maple Ledger store — the single place for state, persistence and sums.
// Every number the views show is computed here from the seed data plus the
// household's own edits, which are kept in localStorage under one key.

import { TRANSACTIONS, BUDGETS, SAVINGS_TARGET, GOALS, BILLS, CATEGORIES } from "./data.js";

const STORAGE_KEY = "maple-ledger-v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function defaultState() {
  return {
    transactions: clone(TRANSACTIONS),
    budgets: clone(BUDGETS),
    goals: clone(GOALS),
    bills: clone(BILLS),
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions)) return defaultState();
    return parsed;
  } catch {
    return defaultState();
  }
}

export const state = loadState();

export function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the site still works for this visit.
  }
}

export function resetState() {
  const fresh = defaultState();
  state.transactions = fresh.transactions;
  state.budgets = fresh.budgets;
  state.goals = fresh.goals;
  state.bills = fresh.bills;
  saveState();
}

// ---------- formatting ----------

export function money(amount) {
  const value = Number(amount) || 0;
  return "$" + value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(amount) {
  const value = Number(amount) || 0;
  return "$" + Math.round(value).toLocaleString("en-US");
}

export function pct(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function monthKey(date) {
  return String(date).slice(0, 7);
}

export function monthLabel(key) {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(5, 7)) - 1;
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function prettyDate(date) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7)) - 1;
  const day = Number(date.slice(8, 10));
  return new Date(Date.UTC(year, month, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- month arithmetic ----------

export function monthsAvailable() {
  const keys = [...new Set(state.transactions.map((t) => monthKey(t.date)))];
  return keys.sort();
}

export function transactionsForMonth(key) {
  return state.transactions
    .filter((t) => monthKey(t.date) === key)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function incomeForMonth(key) {
  return state.transactions
    .filter((t) => monthKey(t.date) === key && t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

// Spending leaves savings transfers out: that money is moved, not spent.
export function spendingForMonth(key) {
  return state.transactions
    .filter((t) => monthKey(t.date) === key && t.type === "expense" && t.category !== "Savings")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function savingsForMonth(key) {
  return state.transactions
    .filter((t) => monthKey(t.date) === key && t.type === "expense" && t.category === "Savings")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function remainingForMonth(key) {
  return incomeForMonth(key) - spendingForMonth(key) - savingsForMonth(key);
}

export function spentByCategory(key) {
  const totals = {};
  for (const category of CATEGORIES) totals[category] = 0;
  for (const t of state.transactions) {
    if (monthKey(t.date) === key && t.type === "expense") {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    }
  }
  return totals;
}

export function budgetForMonth(key) {
  return state.budgets[key] || {};
}

export function savingsTargetForMonth(key) {
  return SAVINGS_TARGET[key] || 0;
}

export function totalBudgeted(key) {
  return Object.values(budgetForMonth(key)).reduce((sum, v) => sum + v, 0);
}

// ---------- edits ----------

export function addTransaction(entry) {
  const id = "user-" + Date.now().toString(36) + "-" + Math.floor(Math.random() * 10000);
  state.transactions.push({
    id,
    date: entry.date,
    description: entry.description,
    category: entry.category,
    amount: entry.amount,
    type: entry.type,
  });
  saveState();
  return id;
}

export function setBudget(month, category, amount) {
  if (!state.budgets[month]) state.budgets[month] = {};
  state.budgets[month][category] = amount;
  saveState();
}

export function addGoalFunds(goalId, amount) {
  const goal = state.goals.find((g) => g.id === goalId);
  if (!goal) return false;
  goal.saved = Math.min(goal.target, Math.round((goal.saved + amount) * 100) / 100);
  saveState();
  return true;
}

export function toggleBillPaid(billId) {
  const bill = state.bills.find((b) => b.id === billId);
  if (!bill) return false;
  bill.paid = !bill.paid;
  saveState();
  return true;
}

export function unpaidBills() {
  return [...state.bills].filter((b) => !b.paid).sort((a, b) => (a.due < b.due ? -1 : 1));
}

export function paidBillsTotal() {
  return state.bills.filter((b) => b.paid).reduce((sum, b) => sum + b.amount, 0);
}

export function unpaidBillsTotal() {
  return state.bills.filter((b) => !b.paid).reduce((sum, b) => sum + b.amount, 0);
}

export function largestExpense(key) {
  const rows = state.transactions.filter(
    (t) => monthKey(t.date) === key && t.type === "expense" && t.category !== "Savings",
  );
  if (!rows.length) return null;
  return rows.reduce((big, t) => (t.amount > big.amount ? t : big), rows[0]);
}

export function topCategory(key) {
  const spent = spentByCategory(key);
  let best = null;
  for (const category of CATEGORIES) {
    if (category === "Savings") continue;
    if (!best || spent[category] > spent[best]) best = category;
  }
  return best;
}

export function overBudgetCategories(key) {
  const spent = spentByCategory(key);
  const budgets = budgetForMonth(key);
  return CATEGORIES.filter((c) => c !== "Savings" && budgets[c] != null && spent[c] > budgets[c])
    .map((c) => ({ category: c, spent: spent[c], budget: budgets[c], over: spent[c] - budgets[c] }));
}
