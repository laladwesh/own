// Real usage numbers for OA Check, as of the date below. Update these three numbers and the date and
// everything that shows them (the case study's "By the numbers" section, the case-study cards, the
// summary and neofetch) follows. The percentages and the flagged count are worked out here, not typed.
export const oaCheckStats = {
  asOf: "2026-10-31",
  total: 31589,
  passed: 27412,
  failed: 31589 - 27412, // the balance: 4,177
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const fmtNum = (n) => n.toLocaleString("en-US");
export const pct = (n, total = oaCheckStats.total) => Math.round((n / total) * 1000) / 10; // one decimal
export const passPct = () => pct(oaCheckStats.passed);
export const failPct = () => pct(oaCheckStats.failed);

const parts = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m: m - 1, d };
};
export const asOfShort = () => {
  const { y, m, d } = parts(oaCheckStats.asOf);
  return `${d} ${MONTHS[m]} ${y}`; // 31 Oct 2026
};
export const asOfLong = () => {
  const { y, m, d } = parts(oaCheckStats.asOf);
  return `${d} ${FULL[m]} ${y}`; // 31 October 2026
};

// Out of every 100 checks, how many laptops were clean on the first try (a whole number, from the real counts).
export const cleanOfHundred = () => Math.round((oaCheckStats.passed / oaCheckStats.total) * 100);
