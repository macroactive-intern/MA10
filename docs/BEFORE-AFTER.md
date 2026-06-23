--------------------------------------------------------------------------

  Before

--------------------------------------------------------------------------

 RUN  v4.1.9 C:/Users/mccor/Desktop/Projects/MacroActive/MA10/MacroLoggingUI


⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/app/page.test.tsx [ src/app/page.test.tsx ]
Error: Failed to resolve import "@/lib/macro-calculations" from "src/app/page.tsx". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/mccor/Desktop/Projects/MacroActive/MA10/MacroLoggingUI/src/app/page.tsx:4:34
  1  |  "use client";
  2  |  import { useState, useEffect } from "react";
  3  |  import { calculateCalories } from "@/lib/macro-calculations";
     |                                     ^
  4  |  var _jsxFileName = "C:/Users/mccor/Desktop/Projects/MacroActive/MA10/MacroLoggingUI/src/app/page.tsx";
  5  |  import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
 ❯ TransformPluginContext._formatLog node_modules/vite/dist/node/chunks/node.js:30602:39
 ❯ TransformPluginContext.error node_modules/vite/dist/node/chunks/node.js:30599:14
 ❯ normalizeUrl node_modules/vite/dist/node/chunks/node.js:27842:18
 ❯ node_modules/vite/dist/node/chunks/node.js:27905:30
 ❯ TransformPluginContext.transform node_modules/vite/dist/node/chunks/node.js:27873:4
 ❯ EnvironmentPluginContainer.transform node_modules/vite/dist/node/chunks/node.js:30387:14
 ❯ loadAndTransform node_modules/vite/dist/node/chunks/node.js:24646:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  no tests
   Start at  12:52:46
   Duration  964ms (transform 30ms, setup 68ms, import 0ms, tests 0ms, environment 580ms)

--------------------------------------------------------------------------

  After

--------------------------------------------------------------------------

 ✓ src/app/page.test.tsx > MacroLogPage > renders the three macro inputs and the Log Meal button 98ms
 ✓ src/app/page.test.tsx > MacroLogPage > happy path: shows Logging… during POST, adds meal to history, updates totals, clears form 338ms
 ✓ src/app/page.test.tsx > MacroLogPage > non-numeric input: shows error, sends no POST, displays no NaN 234ms
 ✓ src/app/page.test.tsx > MacroLogPage > POST failure: shows error, rolls back entries and totals, button returns to Log Meal 336ms
 ✓ src/app/page.test.tsx > MacroLogPage > delete meal: calls DELETE with correct ID, removes meal from history, updates totals from server 90ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  12:55:32
   Duration  2.03s (transform 51ms, setup 68ms, import 162ms, tests 1.10s, environment 576ms)