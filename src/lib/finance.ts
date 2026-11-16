export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Outros",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<Category, { emoji: string; color: string }> = {
  Alimentação: { emoji: "🍽️", color: "var(--chart-1)" },
  Transporte: { emoji: "🚌", color: "var(--chart-2)" },
  Moradia: { emoji: "🏠", color: "var(--chart-3)" },
  Saúde: { emoji: "💊", color: "var(--chart-4)" },
  Educação: { emoji: "📚", color: "var(--chart-5)" },
  Lazer: { emoji: "🎉", color: "var(--chart-6)" },
  Compras: { emoji: "🛍️", color: "var(--chart-7)" },
  Outros: { emoji: "📦", color: "var(--chart-8)" },
};

export type Tx = {
  id: string;
  amount: number;
  category: string;
  description: string;
  occurred_on: string; // YYYY-MM-DD
};

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
};

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatBRL = (n: number) => brl.format(n);

export function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function prevMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number) as [number, number, number];
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function totalsByCategory(txs: Tx[]) {
  const map = new Map<string, number>();
  for (const t of txs) map.set(t.category, (map.get(t.category) ?? 0) + Number(t.amount));
  return [...map.entries()]
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total);
}

export function sum(txs: Tx[]) {
  return round2(txs.reduce((s, t) => s + Number(t.amount), 0));
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** Last N months (oldest first) with totals. */
export function monthlyEvolution(txs: Tx[], currentKey: string, n = 6) {
  const keys: string[] = [currentKey];
  while (keys.length < n) keys.unshift(prevMonthKey(keys[0]!));
  return keys.map((k) => {
    const [y, m] = k.split("-").map(Number) as [number, number, number];
    const label = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
    return { key: k, label, total: sum(txs.filter((t) => monthKey(t.occurred_on) === k)) };
  });
}

/** Simple, non-judgmental alerts comparing this month to last month per category. */
export function categoryAlerts(txs: Tx[], currentKey: string) {
  const cur = totalsByCategory(txs.filter((t) => monthKey(t.occurred_on) === currentKey));
  const prev = new Map(
    totalsByCategory(txs.filter((t) => monthKey(t.occurred_on) === prevMonthKey(currentKey))).map((c) => [
      c.category,
      c.total,
    ]),
  );
  const alerts: { category: string; changePct: number }[] = [];
  for (const c of cur) {
    const p = prev.get(c.category);
    if (p && p > 0) {
      const pct = Math.round(((c.total - p) / p) * 100);
      if (Math.abs(pct) >= 20) alerts.push({ category: c.category, changePct: pct });
    }
  }
  return alerts;
}

/** Months between today and deadline (min 1), and how much to save per month. */
export function goalForecast(goal: Pick<Goal, "target_amount" | "current_amount" | "deadline">, today: string) {
  const remaining = Math.max(0, round2(Number(goal.target_amount) - Number(goal.current_amount)));
  const progress = Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100));
  if (!goal.deadline) return { remaining, progress, monthsLeft: null, perMonth: null };
  const [ty, tm] = today.split("-").map(Number) as [number, number, number];
  const [dy, dm] = goal.deadline.split("-").map(Number) as [number, number, number];
  const monthsLeft = Math.max(1, (dy - ty) * 12 + (dm - tm));
  return { remaining, progress, monthsLeft, perMonth: round2(remaining / monthsLeft) };
}
