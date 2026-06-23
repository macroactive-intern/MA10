import type { DailyTotals, MealEntry } from '@/lib/types';

export function calculateDailyTotals(entries: MealEntry[]): DailyTotals {
  return entries.reduce(
    (totals, meal) => ({
      protein_g: totals.protein_g + meal.protein_g,
      carbs_g: totals.carbs_g + meal.carbs_g,
      fat_g: totals.fat_g + meal.fat_g,
    }),
    { protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

// protein * 4 + carbs * 4 + fat * 9
// e.g. 165p + 220c + 70f = 660 + 880 + 630 = 2170
export function calculateCalories(totals: DailyTotals): number {
  return totals.protein_g * 4 + totals.carbs_g * 4 + totals.fat_g * 9;
}
