---
title: "Oracle Fast Formula: The TER Input Contract — Marker Rows, Parallel Arrays, and Why Every Read Needs an .exists() Guard"
pubDate: 2026-05-22
description: "OTL doesn't hand your formula a timecard object. It hands you six parallel arrays with shared row indexes, wrapped in marker rows the worker never sees. Part 2 dissects the data shape, every input variable, and the naming conventions that keep production TER code maintainable."
tags: ["Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

*Part 2 of 4 · The TER Series*

**In Part 1 we saw what TER does and where it fits in OTL's submission flow. Now the data the framework hands your formula — the input array contract, the six input variables, and the naming conventions that keep production code readable.**

---

## The Input Array Contract

Here's the single most important thing to internalise before writing any code: **the timecard the worker sees is not the timecard your formula receives**. OTL inserts extra rows between the worker's entries to mark structural boundaries — where each day starts, where it ends, where the whole period closes out.

Miss this distinction and your loop counter, your day-buffer logic, and your `.exists()` guards will all be subtly wrong. Get it right and the rest of the formula falls into place naturally.

### The View the Worker Sees

When Sarah opens her timecard, she's looking at a spreadsheet-like grid. She types entries one row at a time:

| # | Date | Time Type | Start | Stop | Hours |
|---|---|---|---|---|---|
| 1 | 14-Apr-2026 (Tue) | Regular Hours | 09:00 | 12:00 | 3.0 |
| 2 | 14-Apr-2026 (Tue) | Meal Break | 12:00 | 13:00 | 1.0 |
| 3 | 14-Apr-2026 (Tue) | Regular Hours | 13:00 | 18:00 | 5.0 |
| 4 | 15-Apr-2026 (Wed) | Regular Hours | 09:00 | 18:00 | 8.0 |

Four entries across two days. Clean, simple, no surprises.

### What OTL Does Between Submission and Your Formula

The moment Sarah hits Submit, OTL's pre-processor wakes up. It can't just hand the formula four rows — the formula needs to know where day boundaries fall, where the period ends, and where to pause for day-level processing like overlap detection. So OTL inserts **marker rows** at the structural breakpoints.

![Worker's four-row timecard on the left, the formula's eight-index view on the right with HEADER, END_DAY and END_PERIOD markers injected](/images/posts/oracle-fast-formula-time-entry-rule-part-1-2026-05-22/fig-01-marker-injection.png)

Three things to take from this:

- **HEADER always sits at index [1].** Your loop counter starts at 1, but you'll never read real worker data there. The first real entry begins at [2].
- **END_DAY appears wherever a calendar day ends.** A seven-day period gets seven END_DAY markers — even for days with zero worker entries.
- **END_PERIOD always sits at the very last index.** When the loop sees END_PERIOD, you're done.

### How the Formula Reads It — Three Questions Per Row

For every index from [1] to [N], the formula asks the same three questions in order:

**Is this a marker row?** Read `RECORD_POSITIONS[idx]`. HEADER means skip everything. END_DAY means run day-level checks — overlap detection, day buffer reset. END_PERIOD means the loop ends. Empty means a real worker entry, so proceed.

**What kind of time type?** Read `PayrollTimeType[idx]`. Regular Hours go through the continuous-work tracker and the day buffer. Meal Break runs through the schedule-window check. Other types typically pass through with no validation.

**What are the exact punch times?** Read `StartTime[idx]` and `StopTime[idx]` for stretch tracking, overlap math, qty-only detection, and time-window checks.

---

## The Contract: What Goes In, What Comes Out

A TER formula is like a checkpoint at an airport. The framework hands it a stack of paperwork, the formula inspects every page, and hands back a list of which pages have problems. The framework defines exactly what shape the paperwork arrives in and exactly what shape the response must take. Neither side can deviate.

| Direction | Variable | Type | What it represents |
|---|---|---|---|
| IN | `HWM_CTXARY_RECORD_POSITIONS` | Text array | Which rows are markers vs real entries |
| IN | `HWM_CTXARY_HWM_MEASURE_DAY` | Number array | Day-aggregated total (declared but unused here) |
| IN | `measure` | Number array | Hours value for each row |
| IN | `PayrollTimeType` | Text array | What kind of time |
| IN | `StartTime` | Date array | Punch-in timestamp |
| IN | `StopTime` | Date array | Punch-out timestamp |
| **OUT** | `OUT_MSG` | Text array (sparse) | Error message per flagged row, empty for clean rows |

Six inputs in. One output out. The framework enforces these names exactly — misspell one, omit one, return anything else, and the formula won't compile.

### Property 1 — The Inputs Are Parallel Arrays, Not Records

Most languages would express a timecard row as a single object with named fields. Fast Formula has no such records. Instead the framework gives you six separate arrays, all sharing the same row index.

![Six parallel arrays with a shared index space, showing row 3 reassembled by reading the same index across all six](/images/posts/oracle-fast-formula-time-entry-rule-part-1-2026-05-22/fig-02-parallel-arrays.png)

To work with a single row, you read the same index across all six arrays. There is no `CurrentEntry.Measure` — only `measure[nidx]`. Each row is reassembled at the moment of reading.

### Property 2 — Not Every Row Populates Every Column

Marker rows only fill `RECORD_POSITIONS`. The other arrays have no slot at those indexes.

![Marker rows populate only RECORD_POSITIONS while every other array is missing at that index](/images/posts/oracle-fast-formula-time-entry-rule-part-1-2026-05-22/fig-03-exists-guard.png)

This is why every read in the formula is wrapped in a guard:

```plsql
IF (StartTime.exists(nidx)) THEN ( aiStartTime = StartTime[nidx] )
```

> **Production trap** — `StartTime[1]` doesn't exist as a value; HEADER rows have no punch time. Read it without protection and Fast Formula throws at runtime and crashes the whole submission. Skip this guard and the formula passes UAT cleanly — test data rarely covers the edge case — then blocks every submission on day one in production. This is the single most common reason a TER formula goes live and immediately breaks.

### Property 3 — The Output Is Sparse, Not Dense

`OUT_MSG` doesn't have one entry per timecard row. It only has entries for the rows the formula chose to flag.

![OUT_MSG sparse array with entries only at the three flagged row indexes](/images/posts/oracle-fast-formula-time-entry-rule-part-1-2026-05-22/fig-07-out-msg-sparse.png)

The framework reads `OUT_MSG` when the formula returns and renders red error markers next to whatever row indexes appear. Quiet rows stay quiet.

---

## Decoding the Input Names

Oracle's naming is structural, not arbitrary. Every prefix carries meaning.

![Breakdown of HWM_CTXARY_RECORD_POSITIONS into its three name segments, contrasted with the short-name inputs](/images/posts/oracle-fast-formula-time-entry-rule-part-1-2026-05-22/fig-04-name-anatomy.png)

Once you see this split, the naming makes sense. The `HWM_CTXARY_` prefix is Oracle saying *this input is structural metadata the framework needs to manage the iteration*. The short names — `measure`, `PayrollTimeType`, `StartTime`, `StopTime` — say *this is the worker's actual time data, under the names OTL has used since it was first designed*.

> **Expert insight** — You'll see the `HWM_` convention across other OTL formula types too. Once you internalise that `HWM_` means framework-supplied and `HWM_CTXARY_` means framework-supplied per-row metadata, you can read any OTL formula and immediately know which variables come from the framework and which the author created.

---

## The Six Inputs in Detail

### `HWM_CTXARY_RECORD_POSITIONS` — "What kind of row is this?"

| Value | Meaning |
|---|---|
| *(empty)* | Real worker entry — check the data columns |
| `HEADER` | System marker at the top of the timecard |
| `END_DAY` | End of each day — trigger day-level work |
| `END_PERIOD` | End of the whole timecard period |

```plsql
IF (HWM_CTXARY_RECORD_POSITIONS.exists(nidx)) THEN
  aiRecPos = HWM_CTXARY_RECORD_POSITIONS[nidx]

IF (aiRecPos = 'END_DAY' OR aiRecPos = 'END_PERIOD') THEN
  /* run pairwise overlap, reset day buffer */
```

This is the first thing the formula reads every iteration — it decides everything else.

### `HWM_CTXARY_HWM_MEASURE_DAY` — declared but never read

This would hold day-level totals if the formula needed them. The framework hands it over because the TER formula type's contract requires it, but this particular formula never reads it. You must still declare it in `INPUTS ARE`, otherwise the framework throws a binding error and the formula won't start. The validations work entirely off per-row punches and per-row `measure`.

### `measure` — "How many hours on this row?"

Used mainly for qty-only detection.

![Real punches versus a qty-only placeholder, both producing measure = 8.0](/images/posts/oracle-fast-formula-time-entry-rule-part-1-2026-05-22/fig-05-qty-only.png)

If a worker types just "8 hours" without entering punch times, OTL fills `StartTime` as `00:00` and `StopTime` as `23:59`. The `measure` tells you the real intended hours without computing it from placeholder punches. When the punches are genuine, `measure` simply equals `StopTime − StartTime` in hours and the formula uses the punches directly anyway.

### `PayrollTimeType` — the routing key

![Time-type values fanning out to their validation paths, with three leave types skipped entirely](/images/posts/oracle-fast-formula-time-entry-rule-part-1-2026-05-22/fig-06-timetype-routing.png)

The most important routing decision in the formula:

```plsql
IF (PayrollTimeType.exists(nidx)) THEN
  aiTimeType = PayrollTimeType[nidx]

IF (aiTimeType = p_reg_type) THEN
  /* → stretch tracker + day buffer */

IF (aiTimeType = p_break_type) THEN
  /* → schedule window + reset stretch */
```

### `StartTime` and `StopTime` — the interval pair

| Used in | What for |
|---|---|
| Stretch tracker | `StartTime` compared to previous `stretchEnd` → EXTEND or RESTART; `StopTime` becomes the new `stretchEnd` |
| Pairwise overlap test | Together they define each row's interval |
| Schedule window check | Compared to `p_sched_start` / `p_sched_end` for Meal Break entries |
| Qty-only detection | Start near `00:00` and stop near `23:59` → placeholder, not a real punch |
| Continuous-hours math | Feed the `contHrs` calculation via Julian Day arithmetic |

```plsql
/* EXTEND vs RESTART */
IF (aiStartTime = stretchEnd) THEN
  stretchEnd = aiStopTime      /* EXTEND */
ELSE
  stretchStart = aiStartTime   /* RESTART */

/* pairwise overlap test */
IF (dayStarts[i] < dayStops[j]
    AND dayStarts[j] < dayStops[i]) THEN
```

The strict less-than test catches genuine collisions while allowing back-to-back handovers — a row ending at 12:00 and the next starting at 12:00 is not an overlap.

---

## The Formula's Architecture

The formula has eight blocks in **two clean halves**. The first five run *once* as scaffolding. The last three run *repeatedly* inside the WHILE loop where the actual validation happens.

![Eight blocks in two halves: five setup blocks running once, three loop blocks running per row, returning OUT_MSG](/images/posts/oracle-fast-formula-time-entry-rule-part-1-2026-05-22/fig-08-eight-blocks.png)

| Block | Half | What it does |
|---|---|---|
| 1 | Setup | `DEFAULT FOR` on every input — prevents runtime crashes on sparse arrays |
| 2 | Setup | Capture `ffs_id` and `rule_id`, declare `NullDate`/`NullText` sentinels, log entry |
| 3 | Setup | One outer `CHANGE_CONTEXTS` binds `HR_ASSIGNMENT_ID` for every lookup inside |
| 4 | Setup | Read schedule bounds and thresholds via `get_rvalue_number` — one formula serves every LE |
| 5 | Setup | Initialise day buffer, stretch tracker, `OUT_MSG` |
| 6 | Loop | Read line, classify, route by time type |
| 7 | Loop | Pairwise overlap test on the day buffer — fires only at END_DAY |
| 8 | Loop | Continuous-hours state machine: EXTEND / RESTART / RESET |

Every line in the formula source belongs to exactly one of these eight blocks.

> **Why the single context wrap matters** — Block 3 binds the assignment once for the whole body rather than re-binding on every iteration. On a timecard with dozens of rows, that difference is the gap between a formula that returns instantly and one that makes the worker wait.

---

## Variable Naming Conventions

Fast Formula doesn't enforce naming rules — you can call any variable anything — but this formula follows a deliberate convention. Each prefix signals where a value comes from, what its lifetime is, and what code is allowed to write to it.

| Prefix | Means | Examples | Lifetime | Who writes to it |
|---|---|---|---|---|
| `HWM_*` | Framework-supplied context | `HWM_FFS_ID`, `HWM_RULE_ID` | Whole formula | Framework (read-only) |
| `HWM_CTXARY_*` | Framework input *array* | `HWM_CTXARY_RECORD_POSITIONS` | Whole formula | Framework (read-only) |
| `p_*` | Parameter from rule config | `p_sched_start`, `p_max_cont_err` | Whole formula | Set once in Block 4 |
| `ai*` | Per-row snapshot of input data | `aiTimeType`, `aiStartTime` | One iteration | Reset at top of each iteration |
| `l_*` | Local working variable or flag | `l_qty_only`, `l_meal_taken` | Per-row or per-day | Set inside the loop body |
| `day*` / `stretch*` | Named-lifetime state | `dayStarts`, `stretchEnd` | Per-day / per-stretch | Reset at boundaries |
| `OUT_MSG` | The formula's return value | `OUT_MSG` | Whole formula | Written only when flagging |

Three reasons this matters beyond style.

**Self-documenting role.** Fast Formula has no type signatures, no scope modifiers, no access controls. Every variable looks the same to the compiler. The naming convention is the only signal a reader has about whether they're looking at framework data, config, per-row input, working state, or output.

**Code-review heuristics.** Certain patterns become immediately suspicious. `p_*` assigned outside Block 4 means a parameter is being mutated mid-loop — almost certainly a bug. `HWM_*` assigned anywhere means someone tried to write to a framework value. `ai*` read without first being reset means stale data leaking between rows. The conventions turn review into pattern-matching: you spot bugs by shape before reading the logic.

**Onboarding cost.** A developer joining the team reads the convention table in two minutes and then reads the formula's variables fluently. Without conventions, every new variable is a small puzzle.

> **A note on consistency** — Oracle's documentation doesn't mandate any specific style, and different teams use different conventions. The patterns here are common in OTL implementations but you'll see variations. What matters is consistency within a project. Pick a convention, document it, apply it uniformly. The specific letters matter less than the discipline.

---

## Debugging Tip

When debugging a TER formula in production, the first thing to check is the `HWM_CTXARY_RECORD_POSITIONS` array length. If `.count` is 0, the formula received nothing to validate — the bug is upstream in the OTL configuration, not in your formula logic. If `.count` is non-zero but no validations fire, your loop counter or your `.exists()` guards are wrong.

```plsql
rLog = add_rlog(ffs_id, rule_id,
                '>>> Start bulk wMaAry=' || TO_CHAR(wMaAry))
```

Log `.count` at the top of every formula. It saves hours of guessing.

---

## Next in the Series

**Part 3 — The Algorithm: Setup, Routing, and Overlap Detection**

The data shape is settled. Now the algorithm. Part 3 walks through the formula's setup phase — crash prevention, identity capture, per-LE configuration — the per-line routing that decides which checks apply to each row, and the day-boundary pairwise overlap test.

---

*Abhishek Mohanty · Oracle ACE Associate | AIOUG Member | Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Time & Labor, Core HR, Redwood, HDL, OTBI.*

*The TER Series · Part 2 / 4*
