// Maple Ledger charts — small SVG charts drawn by hand, no library.
// Each function returns an SVG string the views drop into the page.

import { moneyShort } from "./store.js";

export const CHART_COLORS = ["#1d5c38", "#b45309", "#14655a", "#7a5c1e", "#a83226", "#4a6b8a", "#6b4a7a", "#8a6d1f"];

function barColor(index, palette) {
  return palette[index % palette.length];
}

// Grouped bars: one group per month, one bar for income, one for spending.
export function incomeSpendingChart(months) {
  const width = 640;
  const height = 300;
  const padLeft = 64;
  const padBottom = 34;
  const padTop = 26;
  const plotW = width - padLeft - 16;
  const plotH = height - padTop - padBottom;
  const max = Math.max(...months.flatMap((m) => [m.income, m.spending]), 1);
  const niceMax = Math.ceil(max / 1000) * 1000;
  const groupW = plotW / months.length;
  const barW = Math.min(52, (groupW - 28) / 2);

  let grid = "";
  for (let i = 0; i <= 4; i++) {
    const value = (niceMax / 4) * i;
    const y = padTop + plotH - (plotH * value) / niceMax;
    grid += `<line x1="${padLeft}" y1="${y}" x2="${width - 16}" y2="${y}" stroke="#e3dcc9" stroke-width="1"/>` +
      `<text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#5b6656">${moneyShort(value)}</text>`;
  }

  let bars = "";
  months.forEach((m, gi) => {
    const center = padLeft + groupW * gi + groupW / 2;
    const incomeH = (plotH * m.income) / niceMax;
    const spendH = (plotH * m.spending) / niceMax;
    const incomeX = center - barW - 3;
    const spendX = center + 3;
    bars += `<rect x="${incomeX}" y="${padTop + plotH - incomeH}" width="${barW}" height="${incomeH}" rx="3" fill="#1d5c38"><title>Income ${m.label}: ${m.income}</title></rect>` +
      `<rect x="${spendX}" y="${padTop + plotH - spendH}" width="${barW}" height="${spendH}" rx="3" fill="#b45309"><title>Spending ${m.label}: ${m.spending}</title></rect>` +
      `<text x="${incomeX + barW / 2}" y="${padTop + plotH - incomeH - 6}" text-anchor="middle" font-size="11" font-weight="bold" fill="#1d5c38">${moneyShort(m.income)}</text>` +
      `<text x="${spendX + barW / 2}" y="${padTop + plotH - spendH - 6}" text-anchor="middle" font-size="11" font-weight="bold" fill="#b45309">${moneyShort(m.spending)}</text>` +
      `<text x="${center}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#22301f">${m.label}</text>`;
  });

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Income versus spending by month">${grid}${bars}</svg>`;
}

// Horizontal bars: one row per category, length by amount spent.
export function categoryBarChart(rows) {
  const width = 640;
  const rowH = 34;
  const height = rows.length * rowH + 14;
  const labelW = 110;
  const valueW = 78;
  const plotW = width - labelW - valueW;
  const max = Math.max(...rows.map((r) => r.amount), 1);

  let out = "";
  rows.forEach((row, i) => {
    const y = 8 + i * rowH;
    const w = Math.max(2, (plotW * row.amount) / max);
    out += `<text x="0" y="${y + 15}" font-size="12" fill="#22301f">${row.label}</text>` +
      `<rect x="${labelW}" y="${y + 4}" width="${w}" height="16" rx="3" fill="${barColor(i, CHART_COLORS)}"/>` +
      `<text x="${labelW + w + 8}" y="${y + 17}" font-size="12" font-weight="bold" fill="#22301f">${moneyShort(row.amount)}</text>`;
  });

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Spending by category">${out}</svg>`;
}
