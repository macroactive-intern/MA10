'use client';

import { useState, useEffect } from 'react';
import { calculateCalories } from '@/lib/macro-calculations';
import type {
  MealEntry,
  DailyTotals,
  MealsIndexResponse,
  MealCreatedResponse,
  MealDeletedResponse,
} from '@/lib/types';

function parsePositiveNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  if (!isFinite(num) || isNaN(num) || num <= 0) return null;
  return num;
}

export default function MacroLogPage() {
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  });
  const [proteinInput, setProteinInput] = useState('');
  const [carbsInput, setCarbsInput] = useState('');
  const [fatInput, setFatInput] = useState('');
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingMealId, setDeletingMealId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/meals')
      .then((res) => res.json())
      .then((data: MealsIndexResponse) => {
        setEntries(data.entries);
        setDailyTotals(data.daily_totals);
      })
      .catch(() => {
        setErrorMessage('Could not load meals. Please refresh and try again.');
      })
      .finally(() => setIsLoadingInitialData(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const protein = parsePositiveNumber(proteinInput);
    const carbs = parsePositiveNumber(carbsInput);
    const fat = parsePositiveNumber(fatInput);

    if (protein === null || carbs === null || fat === null) {
      setErrorMessage('Please enter positive numbers for protein, carbs, and fat.');
      return;
    }

    const previousEntries = entries;
    const previousTotals = dailyTotals;

    setIsLogging(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protein_g: protein, carbs_g: carbs, fat_g: fat }),
      });

      if (!res.ok) throw new Error('POST failed');

      const data: MealCreatedResponse = await res.json();
      const { daily_totals, ...meal } = data;

      setEntries((prev) => [...prev, meal]);
      setDailyTotals(daily_totals);
      setProteinInput('');
      setCarbsInput('');
      setFatInput('');
    } catch {
      setEntries(previousEntries);
      setDailyTotals(previousTotals);
      setErrorMessage('Could not log meal. Please try again.');
    } finally {
      setIsLogging(false);
    }
  }

  async function handleDeleteMeal(id: number) {
    setDeletingMealId(id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/meals/${id}`, { method: 'DELETE' });

      if (!res.ok) throw new Error('DELETE failed');

      const data: MealDeletedResponse = await res.json();
      setEntries((prev) => prev.filter((m) => m.id !== id));
      setDailyTotals(data.daily_totals);
    } catch {
      setErrorMessage('Could not delete meal. Please try again.');
    } finally {
      setDeletingMealId(null);
    }
  }

  const calories = calculateCalories(dailyTotals);

  if (isLoadingInitialData) {
    return (
      <main className="min-h-screen p-8">
        <p>Loading meals…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-xl space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Macro Logger</h1>

        {errorMessage && (
          <p role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700">Log a Meal</h2>

          <div className="space-y-1">
            <label htmlFor="proteinInput" className="block text-sm font-medium text-gray-700">
              Protein (g)
            </label>
            <input
              id="proteinInput"
              type="text"
              inputMode="decimal"
              value={proteinInput}
              onChange={(e) => setProteinInput(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 30"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="carbsInput" className="block text-sm font-medium text-gray-700">
              Carbs (g)
            </label>
            <input
              id="carbsInput"
              type="text"
              inputMode="decimal"
              value={carbsInput}
              onChange={(e) => setCarbsInput(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 45"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="fatInput" className="block text-sm font-medium text-gray-700">
              Fat (g)
            </label>
            <input
              id="fatInput"
              type="text"
              inputMode="decimal"
              value={fatInput}
              onChange={(e) => setFatInput(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 12"
            />
          </div>

          <button
            type="submit"
            disabled={isLogging}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLogging ? 'Logging…' : 'Log Meal'}
          </button>
        </form>

        {/* Daily Totals */}
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">Daily Totals</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <span>Protein</span>
            <span className="font-medium text-gray-900">{dailyTotals.protein_g}g</span>
            <span>Carbs</span>
            <span className="font-medium text-gray-900">{dailyTotals.carbs_g}g</span>
            <span>Fat</span>
            <span className="font-medium text-gray-900">{dailyTotals.fat_g}g</span>
            <span>Estimated Calories</span>
            <span className="font-medium text-gray-900">{calories} kcal</span>
          </div>
        </section>

        {/* Meal History */}
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-semibold text-gray-700">Meal History</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-gray-500">No meals logged yet.</p>
          ) : (
            <ul className="space-y-3">
              {entries.map((meal) => (
                <li key={meal.id} className="flex items-center justify-between rounded border border-gray-100 p-3">
                  <span className="text-sm text-gray-700">
                    Protein: {meal.protein_g}g &nbsp;|&nbsp; Carbs: {meal.carbs_g}g &nbsp;|&nbsp; Fat: {meal.fat_g}g
                  </span>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    disabled={deletingMealId === meal.id}
                    className="ml-4 rounded px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingMealId === meal.id ? 'Deleting…' : 'Delete'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
