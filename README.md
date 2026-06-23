# MacroLoggingUI

A macro logging UI for MacroActive clients. Users can log daily meals by entering protein, carbs, and fat in grams, view daily macro totals and an estimated calorie count, and delete meals from their history.

## Features

- Log a meal by entering protein, carbs, and fat (g)
- View daily totals for protein, carbs, and fat from the server response
- See an estimated calorie total (protein × 4 + carbs × 4 + fat × 9)
- Delete meals from the history
- Input validation — rejects empty, non-numeric, zero, and negative values
- POST failure rollback — reverts entries and totals if the request fails
- No real database — meals are stored in a module-level in-memory array via Next.js route handlers

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Vitest + Testing Library + jsdom

## Project Structure

```
src/
  app/
    page.tsx                  # Main client component
    page.test.tsx             # Component tests
    api/
      meals/
        route.ts              # GET /api/meals, POST /api/meals
        [id]/
          route.ts            # DELETE /api/meals/[id]
  lib/
    types.ts                  # Shared TypeScript types
    macro-calculations.ts     # calculateDailyTotals, calculateCalories
    meals-store.ts            # In-memory meal store
  test-setup.ts               # jest-dom setup for Vitest
  vitest.d.ts                 # Vitest globals type reference
docs/
  UNDERSTANDING.md
  APPROACH.md
  ESTIMATE.md
  BEFORE-AFTER.md
vitest.config.ts
```

## API

### GET /api/meals
Returns the current day's meal entries and daily totals.
```json
{
  "entries": [{ "id": 1, "protein_g": 30, "carbs_g": 45, "fat_g": 12 }],
  "daily_totals": { "protein_g": 30, "carbs_g": 45, "fat_g": 12 }
}
```

### POST /api/meals
Creates a new meal entry. All fields must be finite positive numbers.
```json
// Request
{ "protein_g": 50, "carbs_g": 80, "fat_g": 20 }

// Response 201
{ "id": 2, "protein_g": 50, "carbs_g": 80, "fat_g": 20, "daily_totals": { ... } }

// Response 422 (validation failure)
{ "error": "Protein, carbs, and fat must be positive numbers." }
```

### DELETE /api/meals/:id
Removes a meal by ID and returns updated daily totals.
```json
// Response 200
{ "daily_totals": { "protein_g": 30, "carbs_g": 45, "fat_g": 12 } }

// Response 404
{ "error": "Meal not found." }
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tests

```bash
npm test          # single run
npm run test:watch  # watch mode
```

All 5 tests pass:
1. Form renders — protein, carbs, fat inputs and Log Meal button present
2. Happy path — submits meal, shows Logging… during POST, updates history and totals, clears form
3. Non-numeric input — shows error, no POST sent, no NaN in totals
4. POST failure rollback — error shown, entries and totals revert to pre-submit state
5. Delete meal — DELETE called with correct ID, meal removed from history, totals updated from server
