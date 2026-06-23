export type MealEntry = {
  id: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type DailyTotals = {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type MealsIndexResponse = {
  entries: MealEntry[];
  daily_totals: DailyTotals;
};

export type MealCreatedResponse = MealEntry & {
  daily_totals: DailyTotals;
};

export type MealDeletedResponse = {
  daily_totals: DailyTotals;
};
