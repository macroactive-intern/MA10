import type { MealEntry } from '@/lib/types';

let meals: MealEntry[] = [];
let nextId = 1;

export function getMeals(): MealEntry[] {
  return meals;
}

export function addMeal(protein_g: number, carbs_g: number, fat_g: number): MealEntry {
  const meal: MealEntry = { id: nextId++, protein_g, carbs_g, fat_g };
  meals.push(meal);
  return meal;
}

export function removeMeal(id: number): boolean {
  const index = meals.findIndex((m) => m.id === id);
  if (index === -1) return false;
  meals.splice(index, 1);
  return true;
}
