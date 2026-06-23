import { NextResponse } from 'next/server';
import { getMeals, removeMeal } from '@/lib/meals-store';
import { calculateDailyTotals } from '@/lib/macro-calculations';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return NextResponse.json({ error: 'Invalid meal ID.' }, { status: 400 });
  }

  const removed = removeMeal(numericId);

  if (!removed) {
    return NextResponse.json({ error: 'Meal not found.' }, { status: 404 });
  }

  return NextResponse.json({ daily_totals: calculateDailyTotals(getMeals()) });
}
