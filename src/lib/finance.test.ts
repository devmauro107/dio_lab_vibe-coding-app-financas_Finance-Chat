import { describe, expect, it } from "vitest";
import { categoryAlerts, goalForecast, monthlyEvolution, totalsByCategory } from "./finance";

const tx = (amount: number, category: string, occurred_on: string) => ({ id: Math.random() + "", amount, category, description: "", occurred_on });

describe("finance", () => {
  it("sums by category, largest first", () => {
    expect(totalsByCategory([tx(30, "Alimentação", "2026-11-01"), tx(15, "Alimentação", "2026-11-02"), tx(120, "Moradia", "2026-11-03")])).toEqual([
      { category: "Moradia", total: 120 },
      { category: "Alimentação", total: 45 },
    ]);
  });
  it("goal forecast: R$3000 by December from mid-November needs 1 month", () => {
    const f = goalForecast({ target_amount: 3000, current_amount: 0, deadline: "2026-12-20" }, "2026-11-15");
    expect(f).toEqual({ remaining: 3000, progress: 0, monthsLeft: 1, perMonth: 3000 });
  });
  it("alerts when a category rises 25%", () => {
    const a = categoryAlerts([tx(100, "Alimentação", "2026-10-05"), tx(125, "Alimentação", "2026-11-05")], "2026-11");
    expect(a).toEqual([{ category: "Alimentação", changePct: 25 }]);
  });
  it("evolution crosses the year", () => {
    expect(monthlyEvolution([], "2026-02", 3).map((m) => m.key)).toEqual(["2025-12", "2026-01", "2026-02"]);
  });
});
