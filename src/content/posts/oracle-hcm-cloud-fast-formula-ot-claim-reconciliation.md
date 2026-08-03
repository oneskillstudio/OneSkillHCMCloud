---
title: "Oracle HCM Cloud Fast Formula: OT Claim Reconciliation in a TCR — GET_PLAN_BALANCE Inside a CHANGE_CONTEXTS Block"
pubDate: 2026-07-13
description: "How the TCR reconciles OT hours it just allocated against previously-claimed OT balances stored in the absence plan, why GET_PLAN_BALANCE must run inside a CHANGE_CONTEXTS block, and how the reconciliation delta keeps re-runs of the TCR idempotent."
tags: ["Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

*Part 8 of 11 · TCR Deep Dive Series*

**How the TCR reconciles OT hours it just allocated against previously-claimed OT balances stored in the absence plan, why `GET_PLAN_BALANCE` must run inside a `CHANGE_CONTEXTS` block, and how the reconciliation delta keeps re-runs of the TCR idempotent.**

---

By the time Part 7 finishes, the TCR has computed exactly how many OT hours each classification tier owes. But if the TCR runs at end-of-week, then again at end-of-month, without state tracking it would compute the same hours twice — and payroll would pay twice. Part 8 covers the reconciliation pattern that makes re-runs safe.

The state lives in an **absence plan configured as an OT claim ledger**. Every OT hour the TCR has ever allocated for this person is already sitting in the plan balance. To find out how many *new* hours to record, the TCR reads the current plan balance and subtracts. Simple enough — except that `GET_PLAN_BALANCE` reads under whatever effective-date and LDG context the session happens to be in, and the TCR's session context isn't always what you want.

The worked example: the worker has **5 OT hours** already sitting in the plan balance from a prior run this period. This run's allocation across Part 5 and Part 7 has produced **12 total OT hours**. Reconciliation: net new hours to record = **12 − 5 = 7**. That's what gets pushed to the plan balance.

---

## The Reconciliation Loop — Allocated vs Claimed

![Reconciliation flow: 12 allocated minus 5 claimed equals 7 net delta](/images/posts/oracle-hcm-cloud-fast-formula-ot-claim-reconciliation/fig-01-reconciliation-flow.png)

At the end of every TCR run, the reconciliation loop compares two numbers: how many OT hours this run just allocated, and how many hours are already sitting in the plan balance from prior runs. The delta is what goes into the plan. Idempotency is a straightforward consequence — run the TCR again with no new data, and the delta is zero.

| Source | Value | Comes from |
|---|---|---|
| Allocated this run | 12 | Parts 5 + 7 buckets (Reg=8, OT_150=2, OT_200=2, + night spillover) |
| Claimed (plan balance) | 5 | `GET_PLAN_BALANCE` reads prior state |
| **Net delta pushed** | **7** | `12 − 5 = 7` |

> **Idempotency guarantee** — Run the TCR again with the same input data and the plan balance now shows 12. The next reconciliation returns `12 − 12 = 0`. Payroll never double-counts.

---

## The Absence Plan as OT Claim Ledger

Oracle HCM Cloud doesn't have a first-class "OT claim" data type. Implementations reuse the **absence plan** — configured with a custom absence type whose balance tracks OT hours instead of leave hours. Every accepted absence entry against this plan increments the balance; every reduction (payout, comp-time cash-out) decrements it. The TCR queries the current running balance to find out where the ledger stands right now.

The read is a single line — once you know the plan ID and the person ID:

```text
l_claimed_ot = GET_PLAN_BALANCE(l_plan_id, l_person_id, 'CORE_BALANCE')
```

The plan ID is read from a rule input parameter. The person ID is available in the TCR context. The balance type string tells the function which balance to return — the OT-claim ledger uses `'CORE_BALANCE'` which is the running total. This looks clean. It works in isolation. And it silently returns wrong values if you run it as-is in a TCR.

---

## CHANGE_CONTEXTS — The Required Context Switch

![Context stack diagram: push, read, pop mechanics of CHANGE_CONTEXTS](/images/posts/oracle-hcm-cloud-fast-formula-ot-claim-reconciliation/fig-02-context-stack.png)

`GET_PLAN_BALANCE` uses the currently-active session context to determine which effective-date snapshot of the balance to return, and under which LDG to interpret the plan configuration. The TCR runs in its own context — one appropriate for time-and-labor evaluation. That context is *not* what the plan balance function expects. Without an explicit context switch, the function reads under whatever effective-date is on the session, which for a retro-run TCR might be months in the past — returning a balance from before the period even started.

`CHANGE_CONTEXTS` temporarily overrides context values for the duration of a block. The function inside the block reads under the specified context; when the block ends, the original context is restored:

```plsql
CHANGE_CONTEXTS(
  EFFECTIVE_DATE = l_period_end_date,
  LEGISLATIVE_DATA_GROUP_ID = l_ldg_id
)
(
  l_claimed_ot = GET_PLAN_BALANCE(l_plan_id, l_person_id, 'CORE_BALANCE')
)
```

Two things matter about this pattern. The assignment to `l_claimed_ot` happens *inside* the block — so the variable holds the value that was read under the correct context. And the context is *restored* when the block ends — so downstream logic that depends on the TCR's original context isn't affected.

### Push, Read, Pop — Context Stack Mechanics

| Stage | EFFECTIVE_DATE | LDG_ID | What happens |
|---|---|---|---|
| Before block | *tcr context* | *tcr context* | TCR runs its evaluation loop |
| Inside block | `l_period_end` | `l_ldg_id` | Context **pushed** — `GET_PLAN_BALANCE` reads under correct snapshot |
| After block | *tcr context* | *tcr context* | Context **popped** — `l_claimed_ot` retains value; downstream logic undisturbed |

> **Scoped context** — The context change lasts only for the duration of the block. Variables assigned inside the block are *not* reset when the block ends — but any function called after the block reads under the original context. It's a temporary override, not a permanent switch.

---

## The Silent Wrong-Value Failure Mode

![With versus without CHANGE_CONTEXTS: same read produces two different answers](/images/posts/oracle-hcm-cloud-fast-formula-ot-claim-reconciliation/fig-03-with-vs-without.png)

The bug this pattern prevents is the one that's hardest to catch — because it doesn't throw an error. It just returns a wrong number.

| Approach | Returns | Delta computed | Outcome |
|---|---|---|---|
| ✗ Without `CHANGE_CONTEXTS` | **0** (stale session snapshot) | `12 − 0 = 12` | Prior 5 hours counted twice |
| ✓ With `CHANGE_CONTEXTS` | **5** (correct period-end snapshot) | `12 − 5 = 7` | Only new hours pushed |

The failure is silent because Fast Formula never sees the difference — both variants type-check, execute, and return a number. The 5-hour discrepancy only shows up months later when payroll runs an audit and finds duplicate OT charges. This is the class of bug that `CHANGE_CONTEXTS` exists to prevent.

---

## The Reconciliation Arithmetic

![Ledger trace: three runs showing idempotent deltas](/images/posts/oracle-hcm-cloud-fast-formula-ot-claim-reconciliation/fig-04-ledger-trace.png)

Once the correct claimed balance is in `l_claimed_ot`, the delta is arithmetic. But the arithmetic has to handle two edge cases: over-allocated (delta > 0, push the delta) and under-allocated (delta < 0, unusual but possible after adjustments):

```plsql
l_total_allocated_ot = Out_Measure_OT_150_Hours + Out_Measure_OT_200_Hours
                     + Out_Measure_OT_150_Night_Hours + Out_Measure_OT_200_Night_Hours

l_net_new_ot = l_total_allocated_ot - l_claimed_ot

IF (l_net_new_ot > 0) THEN
(
  Out_Measure_OT_Reconciled_Hours = l_net_new_ot
)
ELSE
(
  Out_Measure_OT_Reconciled_Hours = 0
  /* Under-allocation flagged for review */
)
```

### Ledger Trace — Three Runs, Idempotent Deltas

| Run | Allocated (this run) | Claimed (balance) | Delta pushed | Balance after run |
|---|---|---|---|---|
| Prior run · Week 1 end | 5 | 0 | **+5** | 5 |
| This run · Week 2 end | 12 | 5 | **+7** | 12 |
| Repeat · same data, re-run | 12 | 12 | **+0** | 12 |

> **Idempotency in one row** — Row three re-runs the same data as row two. Because the claimed balance now already reflects row two's push, the delta is zero. No new hours recorded. Payroll can safely re-execute the TCR without producing duplicate charges.

---

## The Updated Output Portfolio

![Portfolio expansion: eleven output buckets after Part 8](/images/posts/oracle-hcm-cloud-fast-formula-ot-claim-reconciliation/fig-05-portfolio-expansion.png)

Part 8 adds a single reconciliation bucket to the growing inventory. Eleven output buckets now — two absence, three worked-time, one aggregate night, four granular night, and the new reconciliation bucket.

**Focus bucket · New in Part 8:**

| Bucket | Value | Meaning |
|---|---|---|
| `Out_Measure_OT_Reconciled_Hours` | **7** | The delta between this run's allocated OT and the plan balance's prior claimed OT |

**Complete inventory (11 buckets):**

- `Out_Abs_Cd`
- `Out_Abs_Hours`
- `Out_Measure_RegHours`
- `Out_Measure_OT_150_Hours`
- `Out_Measure_OT_200_Hours`
- `Out_Measure_Night_Hours`
- `Out_Measure_Reg_Night_Hours`
- `Out_Measure_OT_150_Night_Hours`
- `Out_Measure_OT_200_Night_Hours`
- `Out_Measure_Weekend_Night_Hours`
- `Out_Measure_OT_Reconciled_Hours` **★ NEW · PART 8**

---

## Next in the Series

**Part 9 — The 12-Tier OT Counter Cascade and Why the Formula Unrolls Instead of Loops**

Twelve sequential `IF` blocks, one per accumulated OT hour above the threshold, each firing a distinct downstream trigger. Part 9 walks through why the formula uses explicit unrolled tiers instead of a `WHILE` loop — and what each tier actually does.

---

*Abhishek Mohanty · Oracle ACE Associate | AIOUG Member | Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Time & Labor, Core HR, Redwood, HDL, OTBI.*

*TCR Deep Dive · Part 8 / 11 · Series tag: #TCRDeepDive*
