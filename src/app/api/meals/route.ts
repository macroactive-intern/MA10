import { NextResponse } from 'next/server';
import { getMeals, addMeal } from '@/lib/meals-store';
import { calculateDailyTotals } from '@/lib/macro-calculations';

export function GET() {
  const entries = getMeals();
  return NextResponse.json({
    entries,
    daily_totals: calculateDailyTotals(entries),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { protein_g, carbs_g, fat_g } = body;

  if (!isValidMacro(protein_g) || !isValidMacro(carbs_g) || !isValidMacro(fat_g)) {
    return NextResponse.json(
      { error: 'Protein, carbs, and fat must be positive numbers.' },
      { status: 422 }
    );
  }

  const meal = addMeal(protein_g, carbs_g, fat_g);
  const daily_totals = calculateDailyTotals(getMeals());

  return NextResponse.json({ ...meal, daily_totals }, { status: 201 });
}

function isValidMacro(value: unknown): value is number {
  return typeof value === 'number' && isFinite(value) && value > 0;
}
