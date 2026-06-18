/* Helper per le date */

export const today = new Date();
export const fmtDate = (d) => d.toISOString().slice(0, 10);
export const addDays = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmtDate(d); };
