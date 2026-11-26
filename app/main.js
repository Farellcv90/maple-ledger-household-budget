// Maple Ledger entry point — hash router and page wiring.
// Reads the hash, renders the matching page into #app, marks the active
// nav link, and hands each page its own control wiring.

import {
  renderDashboard,
  renderTransactions, bindTransactions,
  renderBudgets, bindBudgets,
  renderGoals, bindGoals,
  renderBills, bindBills,
  renderReports,
  renderNotFound,
} from "./views.js";

const app = document.getElementById("app");
const navLinks = [...document.querySelectorAll(".site-nav a")];

const ROUTES = {
  "": { render: renderDashboard },
  "transactions": { render: renderTransactions, bind: bindTransactions },
  "budgets": { render: renderBudgets, bind: bindBudgets },
  "goals": { render: renderGoals, bind: bindGoals },
  "bills": { render: renderBills, bind: bindBills },
  "reports": { render: renderReports },
};

function currentRoute() {
  const hash = window.location.hash || "#/";
  const path = hash.replace(/^#\/?/, "").replace(/\/$/, "");
  return ROUTES[path] ? path : null;
}

function render() {
  const route = currentRoute();
  const page = route === null ? { render: renderNotFound } : ROUTES[route];
  app.innerHTML = page.render();
  if (page.bind) page.bind(app);
  for (const link of navLinks) {
    link.classList.toggle("active", link.dataset.route === (route || "__none__"));
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
render();
