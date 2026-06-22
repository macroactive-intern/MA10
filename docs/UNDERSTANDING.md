What is the task asking me to build?

This task is asking me to build a small Next.js macro logging UI for MacroActive clients.

A client should be able to:

        - View the current day’s logged meals.
        - Add a new meal by entering protein, carbs, and fat in grams.
        - See daily macro totals for protein, carbs, and fat.
        - See an estimated daily calorie total.
        - Delete a meal from the day’s history.

There is no real backend for this task. I need to mock the API using Next.js route handlers and store the meal entries in a module-level array.

The main page should fetch from the mock API on load, submit new meals to the mock API, and delete meals through the mock API.

The important rule is that the displayed macro totals should come from the server response, not from totals calculated independently on the client.

---------------------------------------------------------------------------------------------------------------------------------------------

What inputs does it take?

The UI takes three number inputs:
                                - Protein (g)
                                - Carbs (g)
                                - Fat (g)

The form should not submit if an input is empty, non-numeric, zero, negative, or otherwise invalid.

The form will also need a submit button:

Log Meal

While the POST request is in progress, the button should be disabled and show:

Logging…

---------------------------------------------------------------------------------------------------------------------------------------------

What does the mock API return?

GET /api/meals

Returns the current day’s entries and daily totals.

Example:

{
  "entries": [
    { "id": 1, "protein_g": 30, "carbs_g": 45, "fat_g": 12 }
  ],
  "daily_totals": {
    "protein_g": 30,
    "carbs_g": 45,
    "fat_g": 12
  }
}

----------------------------------------------------------

POST /api/meals

Accepts:

{
  "protein_g": 50,
  "carbs_g": 80,
  "fat_g": 20
}

Returns the new entry plus updated daily totals.

Example:

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

After a successful POST, the UI should:

                    - Add the returned meal entry to the history list
                    - Replace the displayed daily totals with the server-returned daily_totals
                    - Clear the form
                    - Remove any previous error message
                    - Return the button to the normal Log Meal state

----------------------------------------------------------

DELETE /api/meals/[id]

Deletes the meal with that ID from the module-level in-memory store.

Returns updated daily totals.

Example:

{
  "daily_totals": {
    "protein_g": 30,
    "carbs_g": 45,
    "fat_g": 12
  }
}

---------------------------------------------------------------------------------------------------------------------------------------------

Calorie calculation

The correct macro calorie estimate is:

Total calories = protein_g × 4 + carbs_g × 4 + fat_g × 9

Protein provides about 4 calories per gram.

Carbohydrates provide about 4 calories per gram.

Fat provides about 9 calories per gram.

The formula is:

const calories = protein_g * 4 + carbs_g * 4 + fat_g * 9;

example:

165g protein, 220g carbs, 70g fat

Calculation:

165 × 4 = 660
220 × 4 = 880
70 × 9 = 630

660 + 880 + 630 = 2170

So the UI should show:

2170 calories

---------------------------------------------------------------------------------------------------------------------------------------------

How is the daily calorie total computed?

The macro totals displayed to the user should come from the server response.

The calorie total can be computed client-side, but only from the server-returned daily totals.

The flow should be:

        - Server returns daily_totals
        - Client stores daily_totals in state
        - Client calculates calories from that daily_totals object
        - Client displays the result

The client should not independently calculate the daily macro totals from the entries list as the source of truth.

- Protein / carbs / fat totals come directly from daily_totals returned by the API.
- Calories are derived from those returned totals using the correct 4 / 4 / 9 formula.

---------------------------------------------------------------------------------------------------------------------------------------------

Rollback strategy

If the POST fails, show an error message and revert the displayed totals to pre-submission values

Before sending the POST request, store:

            - const previousTotals = dailyTotals;
            - const previousEntries = entries;

If the POST succeeds:

            - update entries using the returned meal entry
            - update dailyTotals using response.daily_totals
            - clear the form

If the POST fails or returns a non-OK response:

            - restore dailyTotals back to previousTotals
            - restore entries back to previousEntries
            - show an error message
            - keep or restore the form values so the user can correct/resubmit
            - set isLogging back to false

The catch block should not leave the UI in a partially updated state.

---------------------------------------------------------------------------------------------------------------------------------------------

Daily macro totals should come from the server, but calories are not returned by the API

The daily totals must reflect the server response, not independent client arithmetic.

macro totals come from the server
calories are calculated client-side from those server-provided macro totals

---------------------------------------------------------------------------------------------------------------------------------------------

POST returns the new entry, but not a full entries list

POST returns:

{
  "id": 2,
  "protein_g": 50,
  "carbs_g": 80,
  "fat_g": 20,
  "daily_totals": {}
}

It does not return:

{
  "entries": []
}

---------------------------------------------------------------------------------------------------------------------------------------------

DELETE returns totals, but not the updated entries list

DELETE returns only:

{
  "daily_totals": {}
}

So after DELETE, the client should remove the deleted item from local entries state by ID, then update totals from the server response.

---------------------------------------------------------------------------------------------------------------------------------------------

“Positive numbers” does not say whether decimals are allowed

Because food macros can reasonably be decimal values, I will allow decimals as long as they are finite numbers greater than zero.

Examples that should be valid:
                            - 12
                            - 12.5
                            - 0.5

Examples that should be invalid:
                            - empty input
                            - abc
                            - 0
                            - -1
                            - NaN
                            - Infinity

---------------------------------------------------------------------------------------------------------------------------------------------

Number inputs may block non-numeric typing in the browser, but tests still need to cover it

Even though <input type="number"> may prevent some non-numeric input in a real browser, the component should still validate before submit.

I will keep form values as strings in component state, then parse and validate them on submit.

---------------------------------------------------------------------------------------------------------------------------------------------

The mock API uses module-level memory, so persistence is temporary

The route handlers should use a module-level array.

That means data will reset when the dev server restarts.

That is acceptable because the brief says no database is required.

---------------------------------------------------------------------------------------------------------------------------------------------

“Current day” is under-specified

The API is described as returning the current day’s entries, but there is no date field and no date parameter.

I will treat the module-level array as “today’s entries” for this mock task.

---------------------------------------------------------------------------------------------------------------------------------------------

POST failure can be simulated in tests

The task requires a test covering POST failure and rollback.
Because this is a mocked API in the app, component tests can mock fetch directly and force the POST response to fail.

The test should confirm:
                        - An error message appears
                        - The button returns from Logging… to Log Meal
                        - Totals remain or revert to their previous values
                        - No invalid new meal appears in the history list
