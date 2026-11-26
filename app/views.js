// Maple Ledger views — one render function per page, plus the wiring that
// makes every control on the page do what it says.

import {
  state, money, moneyShort, pct, monthLabel, prettyDate, escapeHtml,
  monthsAvailable, transactionsForMonth, incomeForMonth, spendingForMonth,
  savingsForMonth, remainingForMonth, spentByCategory, budgetForMonth,
  savingsTargetForMonth, totalBudgeted, addTransaction, setBudget,
  addGoalFunds, toggleBillPaid, unpaidBills, paidBillsTotal, unpaidBillsTotal,
  largestExpense, topCategory, overBudgetCategories,
} from "./store.js";
import { CATEGORIES } from "./data.js";
import { incomeSpendingChart, categoryBarChart } from "./charts.js";

const LATEST_MONTH = "2026-11";

// Local UI state for the Transactions page (search, filter, month).
const txUi = { month: LATEST_MONTH, search: "", category: "All" };
let txNote = "";

function statCard(kind, label, value, note) {
  return `<div class="card stat ${kind}"><div class="label">${label}</div>` +
    `<div class="value">${value}</div><p class="note">${note}</p></div>`;
}

function progressBar(percentValue, tone) {
  const capped = Math.max(0, Math.min(100, percentValue));
  const cls = tone ? `bar-fill ${tone}` : "bar-fill";
  return `<div class="bar-track"><div class="${cls}" style="width:${capped}%"></div></div>`;
}

function categoryBar(category, spent, budget) {
  const used = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const tone = spent > budget ? "red" : used >= 90 ? "amber" : "";
  const note = spent > budget
    ? `<span class="over">${money(spent - budget)} over budget</span>`
    : `${money(budget - spent)} left of ${money(budget)}`;
  return `<div class="bar-row"><div class="bar-label"><strong>${category}</strong>` +
    `<span class="muted">${money(spent)} &middot; ${used}%</span></div>` +
    `${progressBar(used, tone)}<p class="progress-note">${note}</p></div>`;
}

// Share-of-spending bar: length relative to the biggest category, labelled
// with the share of all spending — a different view from the budget bars.
function spendingShareBar(category, spent, totalSpent, maxSpent) {
  const share = totalSpent > 0 ? Math.round((spent / totalSpent) * 1000) / 10 : 0;
  const width = maxSpent > 0 ? Math.round((spent / maxSpent) * 100) : 0;
  return `<div class="bar-row"><div class="bar-label"><strong>${category}</strong>` +
    `<span class="muted">${money(spent)} &middot; ${share}% of spending</span></div>` +
    `<div class="bar-track"><div class="bar-fill teal" style="width:${width}%"></div></div></div>`;
}

function txRow(t) {
  const sign = t.type === "income" ? "+" : "−";
  const cls = t.type === "income" ? "amount in" : "amount out";
  return `<tr><td>${prettyDate(t.date)}</td><td>${escapeHtml(t.description)}</td>` +
    `<td><span class="tag">${t.category}</span></td>` +
    `<td class="${cls}">${sign}${money(t.amount)}</td></tr>`;
}

function goalCard(goal) {
  const used = pct(goal.saved, goal.target);
  const left = Math.max(0, goal.target - goal.saved);
  const done = goal.saved >= goal.target;
  return `<div class="card"><div class="card-head"><h3>${escapeHtml(goal.name)}</h3>` +
    `<strong>${money(goal.saved)} of ${money(goal.target)}</strong></div>` +
    `<p>${escapeHtml(goal.detail)}</p>${progressBar(used, "teal")}` +
    `<p class="progress-note">${used}% saved &middot; ${done ? "Goal reached — well done." : money(left) + " to go"}</p>` +
    `<div class="controls" style="margin: 12px 0 0">` +
    `<input type="number" min="1" step="1" value="50" class="goal-amount" data-goal-amount="${goal.id}" aria-label="Amount to add to ${escapeHtml(goal.name)}">` +
    `<button data-goal-add="${goal.id}">Add funds</button>` +
    `<button class="secondary small" data-goal-quick="${goal.id}" data-amount="25">+$25</button>` +
    `<button class="secondary small" data-goal-quick="${goal.id}" data-amount="100">+$100</button>` +
    `</div><p class="form-note" data-goal-note="${goal.id}"></p></div>`;
}

// ---------- Dashboard ----------

export function renderDashboard() {
  const month = LATEST_MONTH;
  const income = incomeForMonth(month);
  const spending = spendingForMonth(month);
  const saved = savingsForMonth(month);
  const remaining = remainingForMonth(month);
  const spent = spentByCategory(month);
  const budgets = budgetForMonth(month);
  const upcoming = unpaidBills().slice(0, 3);
  const recent = transactionsForMonth(month).slice(0, 6);
  const savingRate = income ? Math.round((saved / income) * 1000) / 10 : 0;

  const spendRows = CATEGORIES.filter((c) => c !== "Savings")
    .map((c) => ({ category: c, spent: spent[c] || 0 }))
    .sort((a, b) => b.spent - a.spent);
  const maxSpent = spendRows.length ? spendRows[0].spent : 0;
  const spendShareRows = spendRows.map((r) => spendingShareBar(r.category, r.spent, spending, maxSpent)).join("");

  const budgetRows = CATEGORIES.filter((c) => c !== "Savings")
    .map((c) => categoryBar(c, spent[c] || 0, budgets[c] || 0))
    .join("");

  const upcomingRows = upcoming.length
    ? upcoming.map((b) => `<li><span><strong>${escapeHtml(b.name)}</strong><br><span class="sub">Due ${prettyDate(b.due)}</span></span><strong>${money(b.amount)}</strong></li>`).join("")
    : `<li><span>Nothing due — every bill is paid.</span></li>`;

  const recentRows = recent.map(txRow).join("");

  const goalRows = state.goals.map((g) => {
    const used = pct(g.saved, g.target);
    return `<div class="bar-row"><div class="bar-label"><strong>${escapeHtml(g.name)}</strong>` +
      `<span class="muted">${money(g.saved)} of ${money(g.target)} &middot; ${used}%</span></div>` +
      `${progressBar(used, "teal")}</div>`;
  }).join("");

  return `
  <div class="page-head">
    <h1>November at a glance</h1>
    <p>Maya and Daniel Maple, with Lily, age 8. Income, spending, saving and the bills still to pay — all for ${monthLabel(month)}.</p>
  </div>
  <div class="grid stats">
    ${statCard("income", "Income", money(income), "Salaries plus freelance work")}
    ${statCard("spending", "Spending", money(spending), "Everything except savings transfers")}
    ${statCard("saved", "Saved", money(saved), savingRate + "% of income moved to goals")}
    ${statCard("good", "Left over", money(remaining), "Income minus spending and saving")}
  </div>
  <div class="grid grid-2" style="margin-top:18px">
    <section class="card">
      <div class="card-head"><h2>Where November&rsquo;s money went</h2><a href="#/reports">Full report</a></div>
      <p>Largest first, as a share of the ${money(spending)} spent this month.</p>
      ${spendShareRows}
    </section>
    <section class="card">
      <div class="card-head"><h2>Budget check</h2><a href="#/budgets">Edit budgets</a></div>
      <p>Budgeted ${money(totalBudgeted(month))} across eight categories. Spent ${money(spending)}.</p>
      ${budgetRows}
    </section>
  </div>
  <div class="grid grid-3" style="margin-top:18px">
    <section class="card">
      <div class="card-head"><h2>Upcoming bills</h2><a href="#/bills">All bills</a></div>
      <ul class="clean-list">${upcomingRows}</ul>
      <p class="progress-note">${money(unpaidBillsTotal())} still to pay this month.</p>
    </section>
    <section class="card">
      <div class="card-head"><h2>Recent transactions</h2><a href="#/transactions">All transactions</a></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="amount">Amount</th></tr></thead>
        <tbody>${recentRows}</tbody>
      </table></div>
    </section>
    <section class="card">
      <div class="card-head"><h2>Savings goals</h2><a href="#/goals">Add funds</a></div>
      ${goalRows}
      <p class="progress-note">Total saved toward goals: ${money(state.goals.reduce((s, g) => s + g.saved, 0))}.</p>
    </section>
  </div>`;
}

// ---------- Transactions ----------

function filteredTransactions() {
  const rows = transactionsForMonth(txUi.month);
  const query = txUi.search.trim().toLowerCase();
  return rows.filter((t) => {
    if (txUi.category !== "All" && t.category !== txUi.category && !(txUi.category === "Income" && t.type === "income")) return false;
    if (query && !t.description.toLowerCase().includes(query) && !t.category.toLowerCase().includes(query)) return false;
    return true;
  });
}

export function renderTransactions() {
  const months = monthsAvailable();
  const rows = filteredTransactions();
  const income = rows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const spending = rows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const options = ["All", ...CATEGORIES, "Income"]
    .map((c) => `<option value="${c}"${txUi.category === c ? " selected" : ""}>${c}</option>`).join("");
  const monthButtons = months.map((m) =>
    `<button data-tx-month="${m}" class="${txUi.month === m ? "active" : ""}">${monthLabel(m)}</button>`).join("");

  const body = rows.length
    ? rows.map(txRow).join("")
    : `<tr><td colspan="4" class="empty-note">No transactions match this search. Try clearing the search or choosing another category.</td></tr>`;

  return `
  <div class="page-head">
    <h1>Transactions</h1>
    <p>Every dollar in and out, for ${monthLabel(txUi.month)}. Search, filter by category, switch months, or add a new transaction below — totals update at once.</p>
  </div>
  <div class="controls">
    <div class="segmented" role="group" aria-label="Month">${monthButtons}</div>
    <input type="search" id="tx-search" placeholder="Search transactions, e.g. GreenMart" value="${escapeHtml(txUi.search)}" aria-label="Search transactions">
    <select id="tx-category" aria-label="Filter by category">${options}</select>
  </div>
  <div class="card">
    <div class="card-head"><h2>${rows.length} transactions &middot; ${monthLabel(txUi.month)}</h2>
    <span>Income <strong>${money(income)}</strong> &middot; Out <strong>${money(spending)}</strong></span></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="amount">Amount</th></tr></thead>
      <tbody>${body}</tbody>
      <tfoot><tr><td colspan="3">Net for the filtered rows</td><td class="amount">${money(income - spending)}</td></tr></tfoot>
    </table></div>
  </div>
  <section class="card" style="margin-top:18px">
    <h2>Add a transaction</h2>
    <form id="tx-form">
      <div class="form-grid">
        <label><span>Date</span><input type="date" name="date" value="2026-11-28" required></label>
        <label><span>Description</span><input type="text" name="description" placeholder="e.g. GreenMart weekly shop" maxlength="80" required></label>
        <label><span>Type</span><select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></label>
        <label><span>Category</span><select name="category">${CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select></label>
        <label><span>Amount (USD)</span><input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      </div>
      <button type="submit">Add transaction</button>
      <span class="form-note form-ok" id="tx-form-note">${txNote ? escapeHtml(txNote) : "New transactions are saved in this browser and count toward the totals above."}</span>
    </form>
  </section>`;
}

export function bindTransactions(root) {
  const search = root.querySelector("#tx-search");
  if (search) {
    search.addEventListener("input", () => { txUi.search = search.value; refreshTransactionsOnly(root); });
  }
  const select = root.querySelector("#tx-category");
  if (select) {
    select.addEventListener("change", () => { txUi.category = select.value; refreshTransactionsOnly(root); });
  }
  root.querySelectorAll("[data-tx-month]").forEach((btn) => {
    btn.addEventListener("click", () => { txUi.month = btn.dataset.txMonth; refreshTransactionsOnly(root); });
  });
  const form = root.querySelector("#tx-form");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const amount = Number(data.get("amount"));
      const description = String(data.get("description") || "").trim();
      const note = root.querySelector("#tx-form-note");
      if (!description || !(amount > 0)) {
        note.textContent = "Please add a description and an amount above zero.";
        note.classList.add("over");
        return;
      }
      addTransaction({
        date: String(data.get("date") || "2026-11-28"),
        description,
        category: String(data.get("category") || "Groceries"),
        amount: Math.round(amount * 100) / 100,
        type: String(data.get("type") || "expense") === "income" ? "income" : "expense",
      });
      txUi.month = String(data.get("date") || "2026-11-28").slice(0, 7);
      txNote = "Added — " + description + " (" + money(amount) + "). Totals updated.";
      form.reset();
      const dateInput = form.querySelector('input[name="date"]');
      if (dateInput) dateInput.value = "2026-11-28";
      refreshTransactionsOnly(root);
    });
  }
}

function refreshTransactionsOnly(root) {
  // Re-render the page in place, keeping the search box focused where it was.
  const activeId = document.activeElement && document.activeElement.id;
  const cursor = document.activeElement && document.activeElement.selectionStart;
  root.innerHTML = renderTransactions();
  bindTransactions(root);
  if (activeId === "tx-search") {
    const box = root.querySelector("#tx-search");
    if (box) {
      box.focus();
      try { box.setSelectionRange(cursor, cursor); } catch { /* keep focus only */ }
    }
  }
}

// ---------- Budgets ----------

export function renderBudgets() {
  const month = LATEST_MONTH;
  const spent = spentByCategory(month);
  const budgets = budgetForMonth(month);
  const saved = savingsForMonth(month);
  const target = savingsTargetForMonth(month);

  const rows = CATEGORIES.filter((c) => c !== "Savings").map((c) => {
    const used = budgets[c] > 0 ? pct(spent[c] || 0, budgets[c]) : 0;
    const tone = (spent[c] || 0) > budgets[c] ? "red" : used >= 90 ? "amber" : "";
    const note = (spent[c] || 0) > budgets[c]
      ? `<span class="over">${money(spent[c] - budgets[c])} over</span>`
      : `<span class="under">${money(budgets[c] - (spent[c] || 0))} left</span>`;
    return `<div class="bar-row"><div class="bar-label"><strong>${c}</strong>` +
      `<span class="muted">${money(spent[c] || 0)} of <label>$<input type="number" class="budget-input" min="0" step="10" value="${budgets[c]}" data-budget-category="${c}" aria-label="${c} monthly budget"></label> &middot; ${used}%</span></div>` +
      `${progressBar(used, tone)}<p class="progress-note">${note} &middot; change the amount and the bar updates.</p></div>`;
  }).join("");

  const totalSpent = spendingForMonth(month);
  const totalBudget = totalBudgeted(month);

  return `
  <div class="page-head">
    <h1>Budgets for ${monthLabel(month)}</h1>
    <p>Set a monthly limit for each category. The bars track what the household has actually spent, so an over-budget category is obvious at a glance.</p>
  </div>
  <div class="grid stats" style="margin-bottom:18px">
    ${statCard("spending", "Total budgeted", money(totalBudget), "Across eight spending categories")}
    ${statCard("", "Total spent", money(totalSpent), pct(totalSpent, totalBudget) + "% of the total budget used")}
    ${statCard("saved", "Savings target", money(target), money(saved) + " moved so far this month")}
    ${statCard("good", "Budget left", money(Math.max(0, totalBudget - totalSpent)), "Across all categories combined")}
  </div>
  <section class="card">
    <div class="card-head"><h2>Monthly budgets</h2><span class="form-note">Amounts are in USD. Edits save in this browser.</span></div>
    ${rows}
    <p class="form-note" id="budget-note"></p>
  </section>
  <section class="card" style="margin-top:18px">
    <h2>Savings plan</h2>
    <p>The household aims to move ${money(target)} to its savings goals each month — ${money(500)} to the emergency fund, ${money(250)} to the holiday fund and ${money(150)} to the new fridge fund. So far in November it has moved ${money(saved)}.</p>
    ${progressBar(pct(saved, target), "teal")}
    <p class="progress-note">${pct(saved, target)}% of the monthly savings target reached. Savings transfers are listed under Transactions in the Savings category.</p>
  </section>`;
}

export function bindBudgets(root) {
  root.querySelectorAll("[data-budget-category]").forEach((input) => {
    input.addEventListener("change", () => {
      const amount = Math.max(0, Math.round(Number(input.value) || 0));
      input.value = String(amount);
      setBudget(LATEST_MONTH, input.dataset.budgetCategory, amount);
      const fresh = renderBudgets();
      root.innerHTML = fresh;
      bindBudgets(root);
      const noteAfter = root.querySelector("#budget-note");
      if (noteAfter) noteAfter.textContent = input.dataset.budgetCategory + " budget set to " + money(amount) + ".";
      const back = root.querySelector(`[data-budget-category="${input.dataset.budgetCategory}"]`);
      if (back) back.focus();
    });
  });
}

// ---------- Goals ----------

export function renderGoals() {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `
  <div class="page-head">
    <h1>Savings goals</h1>
    <p>Three things the Maple household is saving for. Add funds to any goal — the progress bar and the total move straight away, and the new balance is kept in this browser.</p>
  </div>
  <div class="grid stats" style="margin-bottom:18px">
    ${statCard("saved", "Saved toward goals", money(totalSaved), pct(totalSaved, totalTarget) + "% of all three targets combined")}
    ${statCard("", "Combined target", money(totalTarget), "Emergency fund, holiday and fridge")}
    ${statCard("good", "Still to save", money(totalTarget - totalSaved), "Across the three goals")}
  </div>
  <div class="grid grid-3">
    ${state.goals.map(goalCard).join("")}
  </div>
  <section class="card" style="margin-top:18px">
    <h2>How the goals are funded</h2>
    <p>Each month the household moves ${money(500)} to the emergency fund, ${money(250)} to the holiday fund and ${money(150)} to the new fridge fund, straight after payday. Extra money — freelance work, birthday gifts, a cheaper grocery week — goes to whichever goal is furthest behind.</p>
    <p>The emergency fund is the priority: it should reach ${money(6000)} before the holiday fund gets anything extra.</p>
  </section>`;
}

export function bindGoals(root) {
  root.querySelectorAll("[data-goal-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = root.querySelector(`[data-goal-amount="${btn.dataset.goalAdd}"]`);
      const amount = Math.round((Number(input && input.value) || 0) * 100) / 100;
      const note = root.querySelector(`[data-goal-note="${btn.dataset.goalAdd}"]`);
      if (!(amount > 0)) {
        if (note) note.textContent = "Enter an amount above zero first.";
        return;
      }
      addGoalFunds(btn.dataset.goalAdd, amount);
      const fresh = renderGoals();
      root.innerHTML = fresh;
      bindGoals(root);
      const noteAfter = root.querySelector(`[data-goal-note="${btn.dataset.goalAdd}"]`);
      if (noteAfter) noteAfter.textContent = money(amount) + " added. Nice progress.";
    });
  });
  root.querySelectorAll("[data-goal-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      addGoalFunds(btn.dataset.goalQuick, Number(btn.dataset.amount));
      const fresh = renderGoals();
      root.innerHTML = fresh;
      bindGoals(root);
      const noteAfter = root.querySelector(`[data-goal-note="${btn.dataset.goalQuick}"]`);
      if (noteAfter) noteAfter.textContent = money(Number(btn.dataset.amount)) + " added. Nice progress.";
    });
  });
}

// ---------- Bills ----------

export function renderBills() {
  const sorted = [...state.bills].sort((a, b) => (a.due < b.due ? -1 : 1));
  const nextDue = unpaidBills()[0];
  const rows = sorted.map((b) => {
    const status = b.paid
      ? `<span class="tag paid">Paid</span>`
      : `<span class="tag due">Due</span>`;
    return `<tr><td><strong>${escapeHtml(b.name)}</strong></td><td class="bill-due">${prettyDate(b.due)}</td>` +
      `<td>${escapeHtml(b.repeat)}</td><td class="amount">${money(b.amount)}</td><td>${status}</td>` +
      `<td><button class="small ${b.paid ? "secondary" : ""}" data-bill-toggle="${b.id}">${b.paid ? "Mark unpaid" : "Mark paid"}</button></td></tr>`;
  }).join("");

  return `
  <div class="page-head">
    <h1>Bills</h1>
    <p>Every recurring bill, its due date and its status. Mark a bill paid when the money leaves the account — the dashboard&rsquo;s upcoming list updates with it.</p>
  </div>
  <div class="grid stats" style="margin-bottom:18px">
    ${statCard("good", "Paid so far", money(paidBillsTotal()), state.bills.filter((b) => b.paid).length + " of " + state.bills.length + " bills paid")}
    ${statCard("spending", "Still to pay", money(unpaidBillsTotal()), state.bills.filter((b) => !b.paid).length + " bills outstanding")}
    ${statCard("", "Next bill due", nextDue ? money(nextDue.amount) : "—", nextDue ? escapeHtml(nextDue.name) + " on " + prettyDate(nextDue.due) : "Nothing outstanding")}
  </div>
  <section class="card">
    <div class="card-head"><h2>All recurring bills</h2><span class="form-note">Tap a button to change a bill&rsquo;s status.</span></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Bill</th><th>Due</th><th>Repeats</th><th class="amount">Amount</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="3">Total of all bills listed</td><td class="amount">${money(state.bills.reduce((s, b) => s + b.amount, 0))}</td><td colspan="2"></td></tr></tfoot>
    </table></div>
    <p class="form-note" id="bill-note"></p>
  </section>
  <section class="card" style="margin-top:18px">
    <h2>How the household stays ahead of bills</h2>
    <p>Rent, utilities and the phone plan are paid by standing order in the first week of the month. The credit card is paid in full on the 25th, and the car insurance on the 28th. Anything left over after the bills goes to the savings goals on the Goals page.</p>
  </section>`;
}

export function bindBills(root) {
  root.querySelectorAll("[data-bill-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleBillPaid(btn.dataset.billToggle);
      const fresh = renderBills();
      root.innerHTML = fresh;
      bindBills(root);
      const note = root.querySelector("#bill-note");
      if (note) note.textContent = "Bill status updated.";
    });
  });
}

// ---------- Reports ----------

export function renderReports() {
  const months = monthsAvailable();
  const chartData = months.map((m) => ({
    label: monthLabel(m).replace(" 2026", ""),
    income: incomeForMonth(m),
    spending: spendingForMonth(m),
  }));
  const month = LATEST_MONTH;
  const spent = spentByCategory(month);
  const catRows = CATEGORIES.filter((c) => c !== "Savings")
    .map((c) => ({ label: c, amount: spent[c] || 0 }))
    .sort((a, b) => b.amount - a.amount);
  const income = incomeForMonth(month);
  const spending = spendingForMonth(month);
  const saved = savingsForMonth(month);
  const biggest = largestExpense(month);
  const top = topCategory(month);
  const over = overBudgetCategories(month);
  const prevMonth = months[months.length - 2];
  const prevSpending = prevMonth ? spendingForMonth(prevMonth) : 0;
  const spendChange = prevSpending ? Math.round(((spending - prevSpending) / prevSpending) * 1000) / 10 : 0;
  const savingRate = income ? Math.round((saved / income) * 1000) / 10 : 0;
  const topShare = spending ? Math.round(((spent[top] || 0) / spending) * 1000) / 10 : 0;
  const grocerySpent = spent["Groceries"] || 0;
  const groceryBudget = budgetForMonth(month)["Groceries"] || 0;

  const insights = [
    `${top} is the largest spending category in ${monthLabel(month)} at ${money(spent[top] || 0)}, which is ${topShare}% of all spending.`,
    over.length
      ? `Utilities ran ${money(over[0].over)} over its ${money(over[0].budget)} budget — the only category over budget in ${monthLabel(month)}. The other seven categories stayed inside their limits.`
      : `Every category stayed inside its budget in ${monthLabel(month)}.`,
    `The household saved ${money(saved)} in ${monthLabel(month)}, a savings rate of ${savingRate}% of income.`,
    biggest
      ? `The largest single expense was ${biggest.description.toLowerCase()} at ${money(biggest.amount)} on ${prettyDate(biggest.date)}.`
      : `No expenses were recorded in ${monthLabel(month)}.`,
    spendChange >= 0
      ? `Spending rose ${spendChange}% against ${prevMonth ? monthLabel(prevMonth) : "the previous month"} (${money(prevSpending)} to ${money(spending)}), mostly because of the ${money(118)} car service and the ${money(86)} plumber visit.`
      : `Spending fell ${Math.abs(spendChange)}% against ${prevMonth ? monthLabel(prevMonth) : "the previous month"} (${money(prevSpending)} to ${money(spending)}).`,
    `Groceries came to ${money(grocerySpent)} of a ${money(groceryBudget)} budget — ${money(Math.max(0, groceryBudget - grocerySpent))} under, with four weekly shops and two market top-ups.`,
  ];

  const compareRows = months.map((m) => {
    const inc = incomeForMonth(m);
    const sp = spendingForMonth(m);
    const sv = savingsForMonth(m);
    return `<tr><td>${monthLabel(m)}</td><td class="amount">${money(inc)}</td><td class="amount">${money(sp)}</td><td class="amount">${money(sv)}</td><td class="amount">${money(inc - sp - sv)}</td></tr>`;
  }).join("");

  return `
  <div class="page-head">
    <h1>Reports</h1>
    <p>How November compares with October, where the money actually went, and what the household should do about it.</p>
  </div>
  <section class="card">
    <div class="card-head"><h2>Income vs spending</h2><span class="form-note">USD per month</span></div>
    ${incomeSpendingChart(chartData)}
    <div class="chart-legend"><span><span class="swatch" style="background:#1d5c38"></span>Income</span><span><span class="swatch" style="background:#b45309"></span>Spending (excluding savings)</span></div>
    <p class="progress-note">Income held steady at about ${moneyShort(income)} while spending rose from ${moneyShort(prevSpending)} in October to ${moneyShort(spending)} in November.</p>
  </section>
  <div class="grid grid-2" style="margin-top:18px">
    <section class="card">
      <div class="card-head"><h2>Spending by category — ${monthLabel(month)}</h2></div>
      ${categoryBarChart(catRows)}
    </section>
    <section class="card">
      <h2>What the numbers say</h2>
      <ul class="clean-list insights">
        ${insights.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}
      </ul>
    </section>
  </div>
  <section class="card" style="margin-top:18px">
    <div class="card-head"><h2>Month by month</h2></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Month</th><th class="amount">Income</th><th class="amount">Spending</th><th class="amount">Saved</th><th class="amount">Left over</th></tr></thead>
      <tbody>${compareRows}</tbody>
    </table></div>
    <p class="progress-note">Left over is income minus spending and savings transfers. November&rsquo;s ${money(remainingForMonth(month))} goes to the emergency fund first.</p>
  </section>`;
}

// ---------- 404 ----------

export function renderNotFound() {
  return `
  <div class="page-head">
    <h1>Page not found</h1>
    <p>That page is not part of Maple Ledger. Try one of the sections below.</p>
  </div>
  <div class="controls">
    <a class="btn" href="#/">Back to the dashboard</a>
    <a class="btn secondary" href="#/transactions">Transactions</a>
    <a class="btn secondary" href="#/reports">Reports</a>
  </div>`;
}
