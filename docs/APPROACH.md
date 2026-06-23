Goal

I am building a small Next.js macro logging UI for MacroActive clients.

The user should be able to:

View the current day’s logged meals.
Add a meal by entering protein, carbs, and fat in grams.
See daily totals for protein, carbs, and fat.
See an estimated calorie total.
Delete a meal from the current day’s history.

There is no real backend for this task. I will mock the API using Next.js route handlers and store meal entries in a module-level array.

The key rule is that displayed macro totals must come from the server response. The client should not calculate daily protein, carbs, or fat totals from the entries list as the source of truth.

Tech stack

This will use:

Next.js App Router
TypeScript
Tailwind CSS
Next.js route handlers for the mock API
Vitest for tests
Testing Library for component tests
@testing-library/user-event for user interaction tests
jsdom as the test environment
Project structure

I expect the main files to be:

app/
  page.tsx
  api/
    meals/
      route.ts
      [id]/
        route.ts

lib/
  macro-calculations.ts
  meals-store.ts
  types.ts

app/
  page.test.tsx

vitest.config.ts

I may keep the helper files in a slightly different folder if the app structure becomes cleaner, but the main idea is:

app/page.tsx handles the UI.
app/api/meals/route.ts handles GET and POST.
app/api/meals/[id]/route.ts handles DELETE.
lib/types.ts stores shared TypeScript types.
lib/macro-calculations.ts stores reusable calculation helpers.
lib/meals-store.ts stores the module-level in-memory meal array and helper functions.
Data model

There is no database, so this is not a table-based task.

The mock data will be stored in memory using a module-level array.

Meal entry type
export type MealEntry = {
  id: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};
Daily totals type
export type DailyTotals = {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};
API GET response type
export type MealsIndexResponse = {
  entries: MealEntry[];
  daily_totals: DailyTotals;
};
API POST response type
export type MealCreatedResponse = MealEntry & {
  daily_totals: DailyTotals;
};
API DELETE response type
export type MealDeletedResponse = {
  daily_totals: DailyTotals;
};
Module-level store design

The API will use a simple in-memory store.

Example:

let meals: MealEntry[] = [];
let nextId = 1;

This is acceptable because the brief says no database is required.

The store will reset if the dev server restarts. That is fine for this task because persistence is not part of the requirements.

I will treat the current module-level array as “today’s entries”.

I will not implement dates, users, authentication, or real persistence.

Server-side helper functions

I will create helper functions for the API/store.

calculateDailyTotals(entries)

This will calculate totals from the current module-level meal entries.

function calculateDailyTotals(entries: MealEntry[]): DailyTotals

It will return:

{
  protein_g: totalProtein,
  carbs_g: totalCarbs,
  fat_g: totalFat,
}

This calculation belongs on the API/server side because the brief says the daily totals displayed by the UI should come from the server response.

Client-side calorie calculation

The API does not return calories.

The UI will calculate calories client-side, but only from the server-returned daily_totals.

Correct formula:

const calories = protein_g * 4 + carbs_g * 4 + fat_g * 9;

Protein = 4 calories per gram.

Carbs = 4 calories per gram.

Fat = 9 calories per gram.

The old background formula was wrong because it used:

fat_g × 4

The correct formula uses:

fat_g × 9

Acceptance example:

165g protein, 220g carbs, 70g fat

165 × 4 = 660
220 × 4 = 880
70 × 9 = 630

Total = 2170

So the UI should show 2170 calories, not 1820.

API endpoints
GET /api/meals

Purpose:

Fetch the current day’s meal entries and daily totals.

Response shape:

{
  "entries": [
    {
      "id": 1,
      "protein_g": 30,
      "carbs_g": 45,
      "fat_g": 12
    }
  ],
  "daily_totals": {
    "protein_g": 30,
    "carbs_g": 45,
    "fat_g": 12
  }
}

Implementation approach:

Read the module-level meals array.
Calculate totals with calculateDailyTotals(meals).
Return both entries and daily_totals.
POST /api/meals

Purpose:

Create a new meal entry.

Request body:

{
  "protein_g": 50,
  "carbs_g": 80,
  "fat_g": 20
}

Validation rules:

protein_g must be a number.
carbs_g must be a number.
fat_g must be a number.
All values must be greater than zero.
All values must be finite numbers.
NaN, Infinity, empty values, zero, and negative values are invalid.

If validation fails, return a validation response such as:

{
  "error": "Protein, carbs, and fat must be positive numbers."
}

with status 422.

If validation passes:

Create a new meal with the next ID.
Add it to the module-level array.
Recalculate totals.
Return the new meal plus daily_totals.

Response shape:

{
  "id": 2,
  "protein_g": 50,
  "carbs_g": 80,
  "fat_g": 20,
  "daily_totals": {
    "protein_g": 80,
    "carbs_g": 125,
    "fat_g": 32
  }
}

Important decision:

POST does not return the full entries list, so the client will append the returned meal entry to local entries state. However, the displayed totals will still come from response.daily_totals.

DELETE /api/meals/[id]

Purpose:

Delete a meal entry by ID.

Implementation approach:

Read the id route parameter.
Convert it to a number.
Find the matching meal in the module-level array.
If it exists, remove it.
Recalculate totals.
Return the updated daily_totals.

Response shape:

{
  "daily_totals": {
    "protein_g": 30,
    "carbs_g": 45,
    "fat_g": 12
  }
}

Missing ID decision:

If the meal ID does not exist, I will return 404.

Example:

{
  "error": "Meal not found."
}

This is clearer than silently succeeding because the user tried to delete something that is not in the store.

Important decision:

DELETE does not return the full entries list, so the client will remove the deleted meal from local entries state by ID. However, the displayed totals will still come from the server response.

Page/component structure

The main page will be a client component.

'use client';

The page will handle:

Initial loading
Meal form state
Validation errors
Fetching current meals
Submitting new meals
Deleting meals
Displaying totals
Displaying calories
Displaying meal history

Possible sub-components:

MacroLogPage
MealForm
DailyTotalsCard
MealHistoryList
MealHistoryItem

I may keep these in one file if the page is small, but I will still structure the code logically.

Component state design

The main page needs this state:

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
Why input values are strings

I will keep form inputs as strings because the user may temporarily type invalid or incomplete values.

This makes validation safer.

Examples:

""
"abc"
"0"
"-1"
"12.5"

The code will parse and validate these strings only when the user submits the form.

This helps prevent NaN from ever appearing in the totals display.

Initial page load

When the page loads:

useEffect runs.
The page calls GET /api/meals.
The response returns entries and daily_totals.
The page stores entries in local state.
The page stores daily_totals in local state.
The calorie display is calculated from dailyTotals.
The loading state ends.

If the initial fetch fails:

Show an error message.
Keep entries as an empty list.
Keep totals as zero.
Do not show NaN.
Form validation approach

Before submitting, I will validate all three inputs.

Validation helper:

function parsePositiveNumber(value: string): number | null

The helper will:

trim the value
reject empty strings
convert the value with Number(value)
reject NaN
reject Infinity
reject numbers less than or equal to zero
return the parsed number if valid

Invalid examples:

empty input
abc
0
-1
NaN
Infinity

Valid examples:

12
12.5
0.5

I am allowing decimals because the brief says positive numbers, not positive integers. Food macros can reasonably be decimal values.

If validation fails:

show an error message
do not call fetch
do not update entries
do not update totals
Submit behaviour
Happy path

When the user submits a valid meal:

handleSubmit runs.
The input strings are parsed and validated.
A rollback snapshot is stored:
const previousEntries = entries;
const previousTotals = dailyTotals;
isLogging is set to true.
Previous errors are cleared.
The page sends a POST request to /api/meals.
The server validates the request.
The server creates the meal entry.
The server returns the created meal and updated daily_totals.
The client appends the returned meal to entries.
The client replaces dailyTotals with response.daily_totals.
The form inputs are cleared.
isLogging is set back to false.

The button should show:

Logging…

while the request is in progress.

After success, it should return to:

Log Meal
POST failure and rollback approach

The brief specifically requires rollback if POST fails.

Before the POST request, I store:

const previousEntries = entries;
const previousTotals = dailyTotals;

If the POST fails because the response is not OK, or because the request throws an error, the catch block will:

setEntries(previousEntries);
setDailyTotals(previousTotals);
setErrorMessage('Could not log meal. Please try again.');
setIsLogging(false);

The form values will stay in place so the user can retry or edit them.

This means the UI will not be left in a partial state.

The failed meal should not appear in the history list.

The totals should stay at, or return to, the pre-submit values.

Delete behaviour
Happy path

When the user clicks Delete:

handleDeleteMeal(id) runs.
deletingMealId is set to that meal ID.
The page calls DELETE /api/meals/{id}.
If the response succeeds, the page removes that meal from local entries.
The page updates dailyTotals from response.daily_totals.
deletingMealId is cleared.

Important rule:

The client removes the item from the history list locally, but the displayed totals still come from the server response.

Delete failure path

If delete fails:

Show an error message.
Keep the meal in the history list.
Keep previous totals unchanged.
Clear deletingMealId.

The user should not see an incorrect meal history or incorrect totals after a failed delete.

Loading states
Initial loading

While the first GET /api/meals is in progress, I may show a simple loading message such as:

Loading meals…

or show the page with zero totals until data arrives.

I will avoid showing NaN or empty broken UI.

Submit loading

While POST is in progress:

Disable the submit button.
Change the button text to Logging….
Delete loading

While DELETE is in progress:

Disable the Delete button for that meal.
Optionally show Deleting… on that button.

This prevents duplicate delete requests.

Error messages

The UI should show useful error messages for:

Invalid form input
Failed initial load
Failed POST
Failed DELETE

Example messages:

Please enter positive numbers for protein, carbs, and fat.
Could not load meals. Please refresh and try again.
Could not log meal. Please try again.
Could not delete meal. Please try again.

Error messages should clear after a successful action.

Testing approach

I will write tests before finishing the implementation.

The tests will use:

Vitest
Testing Library
user-event
jsdom
mocked global.fetch
Required tests
1. Form renders

This test will confirm:

Protein input exists.
Carbs input exists.
Fat input exists.
Log Meal button exists.
2. Happy path form submission

This test will:

Mock initial GET /api/meals.
Mock successful POST /api/meals.
Enter valid protein, carbs, and fat.
Click Log Meal.
Confirm the button enters the Logging… state.
Confirm the new meal appears in the history list.
Confirm daily totals update from the server response.
Confirm the form clears after successful submission.
3. Non-numeric input

This test will:

Enter or simulate a non-numeric value.
Submit the form.
Confirm no POST request is sent.
Confirm an error message appears.
Confirm the totals do not show NaN.

This matters because browser number inputs may block some non-numeric values, but the component should still validate safely.

4. POST failure rollback

This test will:

Mock initial entries and totals.
Submit a valid meal.
Mock the POST response as a 500.
Confirm an error message appears.
Confirm totals remain or revert to their previous values.
Confirm the failed meal is not added to the history list.
Confirm the button returns to Log Meal.
5. Delete meal

This test will:

Mock initial meals.
Mock successful DELETE response.
Click the Delete button.
Confirm fetch was called with DELETE /api/meals/{id}.
Confirm the meal is removed from the history list.
Confirm totals update from the server-returned daily_totals.
Edge cases
Empty inputs

If any field is empty, the form should not submit.

The UI should show a validation error and keep totals unchanged.

Non-numeric input

If a value cannot be parsed into a valid number, the form should not submit.

The UI should not show NaN.

Zero or negative values

Macros must be positive numbers.

Values like 0, -1, or -12.5 are invalid.

Decimal values

I will allow decimals because the brief says positive numbers, not positive integers.

Examples:

12.5
0.5
POST fails

If the POST fails, the UI restores previous entries and totals from the rollback snapshot.

The user sees an error message.

The form values stay available so the user can retry.

DELETE fails

If DELETE fails, the meal remains in the history list and totals stay unchanged.

The user sees an error message.

Missing delete ID

If a meal ID does not exist, the API returns 404.

The client treats this as a failed delete.

API returns bad data

If the API response does not include the expected daily_totals, the client should treat it as a failed request rather than displaying broken totals.

Initial GET fails

If the first fetch fails, the UI shows an error and keeps safe default state:

entries = []
dailyTotals = {
  protein_g: 0,
  carbs_g: 0,
  fat_g: 0,
}
Multiple rapid submissions

The submit button is disabled while isLogging is true, which helps prevent duplicate meals from being submitted accidentally.

Multiple rapid deletes

The delete button for the active meal is disabled while deletion is in progress.

This helps prevent duplicate DELETE requests.

Decisions from unclear parts of the brief
1. Calories are calculated on the client from server totals

The API examples do not return calories.

So I will calculate calories in the UI from the server-returned daily_totals.

The client will not calculate protein, carbs, or fat totals from the entries as the source of truth.

2. Decimals are allowed

The brief says positive numbers, not integers.

I will allow decimal macros because real food logging can include decimal gram values.

3. The in-memory array represents the current day

The API says current day entries, but there is no date input or date field.

I will treat the module-level array as the current day’s entries.

No timezone handling or daily reset will be implemented.

4. POST appends locally, totals come from server

POST returns the new entry plus daily_totals, but not the full entries list.

So the client will append the returned meal to local history state.

The displayed totals will still come from the server response.

5. DELETE removes locally, totals come from server

DELETE returns only daily_totals.

So the client will remove the deleted meal from local history state.

The displayed totals will still come from the server response.

6. Missing DELETE IDs return 404

I will return 404 for a missing meal ID because that is clearer than pretending the delete succeeded.