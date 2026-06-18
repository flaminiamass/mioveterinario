/* Helper per le date */

export const today = new Date();
export function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const fmtDate = (d) => formatLocalDate(d);
export const addDays = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return fmtDate(d);
};

const DAY_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

export function parseDateOnly(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function diffDaysFromToday(dateStr, baseDate = new Date()) {
  const target = parseDateOnly(dateStr);
  const base = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  return Math.round((target - base) / 86400000);
}

export function formatRelativeDateLabel(dateStr) {
  const d = parseDateOnly(dateStr);
  const diff = diffDaysFromToday(dateStr);
  if (diff === 0) return "Oggi";
  if (diff === 1) return "Domani";
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}
