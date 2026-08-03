---
title: "Breaking Down a PH Vacation Leave Accrual Matrix Formula — Section by Section"
pubDate: 2026-03-14
description: "A production Philippine vacation leave accrual matrix formula, walked through block by block — DEFAULT handling, DBIs versus input values, the l_process flag pattern, the monthly frequency guard, and the three-phase accrual logic with its one-time January credit."
tags: ["Absence Management", "Fast Formula", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

**A full Absence Accrual Matrix formula, taken apart one block at a time. It implements Philippine vacation leave rules, but the patterns underneath — defaults, the process flag, date arithmetic, one-time credits — carry over to any accrual formula you'll write.**

---

## What Even Is an Accrual Matrix Formula?

Oracle Absence Management has several formula types. This one is an **Absence Accrual Matrix Formula**.

The absence plan already has a matrix table configured — a grid with bands based on years of service, grade, or similar. The matrix engine calculates an accrual value and passes it to your formula as `IV_ACCRUAL`. Your formula either accepts that value or overrides it.

Here we ignore `IV_ACCRUAL` entirely and calculate our own. That's the point of a matrix formula: you get a hook to intercept and customise.

The rules being implemented:

![Three phases: no accrual during probation, 1.25 days per month, then a one-time 15-day January credit](/images/posts/breaking-down-a-ph-vacation-leave-accrual-matrix/fig-01-three-phases.png)

---

## The Header Block

```plsql
/*************************************************************
FORMULA NAME: PH_VACATION_LEAVE_ACCRUAL_MATRIX
FORMULA TYPE: Absence Accrual Matrix Formula

DESCRIPTION: Philippine Vacation Leave Accrual Matrix Formula
  - First 6 months (probation): No accrual
  - Month 6 to 12: Accrue 1.25 days per month
  - Post regularization (12 months), from subsequent
    January: 15 days credited ONE TIME only
  - If regularized in January, credit that same January
  - After the one-time credit, no further accrual

VERSION: 13.2

REFERENCE: Oracle HCM Cloud Absence Management
Fast Formula Reference Guide (pages 15-19)
This formula overrides IV_ACCRUAL from the matrix
engine with custom phase-based calculation.
*************************************************************/
```

It's a comment block, but don't skip it. It records the formula type — which determines the available inputs and returns — the business rules, the doc reference, and the processing frequency the formula assumes. That last one matters: there's a guard for it further down.

---

## DEFAULT Statements — Why They Exist in FF

```plsql
/* DBI defaults - HR_ASSIGNMENT_ID context available */
DEFAULT FOR PER_ASG_REL_ORIGINAL_DATE_OF_HIRE     IS '4712/12/31 00:00:00' (date)
DEFAULT FOR PER_ASG_REL_ACTUAL_TERMINATION_DATE   IS '4712/12/31 00:00:00' (date)
DEFAULT FOR PER_ASG_STATUS_USER_STATUS            IS 'NA'
DEFAULT FOR PER_ASG_FTE_VALUE                     IS 1
DEFAULT FOR ANC_ABS_PLN_NAME                      IS 'NA'

/* Input value defaults per Oracle doc page 16-17 */
DEFAULT FOR IV_ACCRUAL                    IS 0
DEFAULT FOR IV_CARRYOVER                  IS 0
DEFAULT FOR IV_CEILING                    IS 0
DEFAULT FOR IV_ACCRUAL_CEILING            IS 0
DEFAULT FOR IV_ACCRUALPERIODSTARTDATE     IS '4712/12/31 00:00:00' (date)
DEFAULT FOR IV_ACCRUALPERIODENDDATE       IS '4712/12/31 00:00:00' (date)
DEFAULT FOR IV_CALENDARSTARTDATE          IS '4712/12/31 00:00:00' (date)
```

**In Fast Formula there is no null.** If a database item or input value returns nothing and you haven't declared a `DEFAULT`, the formula errors at runtime. Not a warning — a hard error, and the ESS process marks that employee as failed.

So `DEFAULT` is mandatory for every DBI and every input value you reference.

![Database items versus input values, and why both need a DEFAULT](/images/posts/breaking-down-a-ph-vacation-leave-accrual-matrix/fig-04-dbi-vs-iv.png)

> **The 4712/12/31 date.** This is Oracle's "end of time" constant, used across all Oracle products to mean "no value" for a date. `DEFAULT FOR PER_ASG_REL_ACTUAL_TERMINATION_DATE IS '4712/12/31'` means: if the employee has no termination date — they're active — use 4712/12/31 rather than crashing.

---

## INPUTS ARE — Declaring What the Engine Passes In

```plsql
INPUTS ARE
  IV_ACCRUAL,
  IV_CARRYOVER,
  IV_CEILING,
  IV_ACCRUAL_CEILING,
  IV_ACCRUALPERIODSTARTDATE        (DATE),
  IV_ACCRUALPERIODENDDATE          (DATE),
  IV_CALENDARSTARTDATE             (DATE),
  IV_CALENDARENDDATE               (DATE),
  IV_PLANENROLLMENTSTARTDATE       (DATE),
  IV_PLANENROLLMENTENDDATE         (DATE),
  IV_EVENT_DATES                   (DATE_NUMBER),
  IV_ACCRUAL_VALUES                (NUMBER_NUMBER)
```

You must list every input, even the ones you never use. Pages 16–17 of the Reference Guide list what's available per formula type.

Note the type declarations — `(DATE)` on date inputs, `(DATE_NUMBER)` and `(NUMBER_NUMBER)` on arrays. Numbers need nothing; FF assumes numeric. **Forgetting `(DATE)` is a common beginner compilation error** — FF treats the input as a number and the compile fails.

| Input | What it is |
|---|---|
| `IV_ACCRUAL` | The value the matrix engine pre-calculated. We override this. |
| `IV_ACCRUALPERIODSTARTDATE` / `ENDDATE` | The current processing period, e.g. Jan 1 to Jan 31 |
| `IV_CALENDARSTARTDATE` / `ENDDATE` | The plan's calendar year bounds |
| `IV_PLANENROLLMENTSTARTDATE` / `ENDDATE` | When the worker enrolled in the plan |
| `IV_CEILING` / `IV_CARRYOVER` | Plan limits — declared, unused here |
| `IV_EVENT_DATES` / `IV_ACCRUAL_VALUES` | Array inputs — declared, unused here |

---

## Initialization — Variable Setup and Context DBIs

```plsql
/*=============== INITIALIZATION ===============*/
l_debug_flag = 'Y'

accrual   = 0
l_process = 'Y'

l_acc_st_dt    = IV_ACCRUALPERIODSTARTDATE
l_acc_end_dt   = IV_ACCRUALPERIODENDDATE
l_cal_st_dt    = IV_CALENDARSTARTDATE
l_cal_end_dt   = IV_CALENDARENDDATE
l_enroll_st_dt = IV_PLANENROLLMENTSTARTDATE

l_abs_plan_name = ANC_ABS_PLN_NAME
l_person_id     = GET_CONTEXT(PERSON_ID, 0)
l_assignment_id = GET_CONTEXT(HR_ASSIGNMENT_ID, 0)

/* PER_ASG_ DBIs - HR_ASSIGNMENT_ID is a context */
l_hire_date  = PER_ASG_REL_ORIGINAL_DATE_OF_HIRE
l_term_date  = PER_ASG_REL_ACTUAL_TERMINATION_DATE
l_asg_status = PER_ASG_STATUS_USER_STATUS

l_acc_st_month = TO_NUMBER(TO_CHAR(l_acc_st_dt, 'MM'))
l_acc_st_year  = TO_NUMBER(TO_CHAR(l_acc_st_dt, 'YYYY'))
```

`GET_CONTEXT()` retrieves values Oracle sets before the formula runs. For absence formulas, `PERSON_ID` and `HR_ASSIGNMENT_ID` are always available. The second argument is the fallback if the context isn't set.

The `PER_ASG_` items are assignment-level DBIs. They work *because* `HR_ASSIGNMENT_ID` is a context — Oracle uses it to know which assignment to pull.

> **Date extraction pattern.** FF has no "get month from date" function. The workaround is `TO_CHAR` with a format mask to get a string, then `TO_NUMBER` to make it an integer. `'MM'` gives 01–12, `'YYYY'` gives the four-digit year. You'll use this constantly.

**`l_process` starts as `'Y'`.** FF doesn't support early returns — you can only `RETURN` at the very end — so a flag variable controls flow instead. Each validation can set it to `'N'`, and everything downstream checks it first. It's the FF equivalent of a guard clause.

---

## ESS_LOG_WRITE — The Only Debugging Tool You Have

```plsql
IF (l_debug_flag = 'Y') THEN
(
  l_log = ESS_LOG_WRITE('Starting PH Vacation Leave accrual matrix calculation')
  l_log = ESS_LOG_WRITE('Person ' || TO_CHAR(l_person_id)
        || ', assignment ' || TO_CHAR(l_assignment_id)
        || ', plan ' || l_abs_plan_name)
  l_log = ESS_LOG_WRITE('Hire date ' || TO_CHAR(l_hire_date, 'DD-MON-YYYY'))
  l_log = ESS_LOG_WRITE('Assignment status ' || l_asg_status)
)
```

No debugger, no breakpoints, no console. `ESS_LOG_WRITE` writes a line to the Enterprise Scheduler job output log, and that's the whole toolkit.

> **You must assign the return to a variable.** You cannot call `ESS_LOG_WRITE('...')` as a standalone statement — FF requires every function call to be assigned. `l_log` is a throwaway; its value is never used.

`||` joins strings. `TO_CHAR` converts numbers and dates for concatenation, and takes a format mask for dates. Wrapping all logging in `IF (l_debug_flag = 'Y')` means you turn it off in production by changing one variable.

---

## Monthly Frequency Guard — A Defensive Pattern

```plsql
/*=============== MONTHLY FREQUENCY GUARD ===============*/

l_period_days = DAYS_BETWEEN(l_acc_end_dt, l_acc_st_dt) + 1

IF (l_period_days < 28) THEN
(
  l_process = 'N'
  IF (l_debug_flag = 'Y') THEN
  (
    l_log = ESS_LOG_WRITE('This formula requires monthly processing, current period is '
          || TO_CHAR(l_period_days) || ' days, skipping')
  )
)
```

`DAYS_BETWEEN` is exclusive, hence the `+ 1` — Jan 1 to Jan 31 returns 30, but the period is 31 days.

**Why the guard exists:** this formula assumes monthly processing and returns 1.25 days per period. Configure the plan to run weekly and the employee gets 1.25 days *per week*. The check rejects anything under 28 days — February being the shortest month.

Worth reusing. If your formula assumes a frequency, validate it. Note that it logs the actual period length, which is what makes the misconfiguration diagnosable.

---

## Eligibility Checks — Cascading Flag Pattern

```plsql
/*=============== ELIGIBILITY ===============*/

/* Check 1: Hire date exists */
IF (l_process = 'Y' AND
    l_hire_date = TO_DATE('4712/12/31 00:00:00', 'YYYY/MM/DD HH24:MI:SS')) THEN
(  l_process = 'N'  )

/* Check 2: Period is after hire date */
IF (l_process = 'Y' AND l_acc_end_dt < l_hire_date) THEN
(  l_process = 'N'  )

/* Check 3: Not terminated before period */
IF (l_process = 'Y' AND
    l_term_date < l_acc_st_dt AND
    l_term_date <> TO_DATE('4712/12/31 00:00:00', 'YYYY/MM/DD HH24:MI:SS')) THEN
(  l_process = 'N'  )

/* Check 4: Assignment is active */
IF (l_process = 'Y' AND l_asg_status <> 'ACTIVE') THEN
(  l_process = 'N'  )
```

![The four eligibility checks, each gated on the l_process flag](/images/posts/breaking-down-a-ph-vacation-leave-accrual-matrix/fig-03-process-flag.png)

Four checks, one pattern. Each tests `l_process = 'Y'` first, so once any check fails the rest are skipped automatically.

**Check 3's second condition is the critical one.** Without `l_term_date <> 4712/12/31`, you'd be comparing the "no termination" default against the period start for every active employee — and every one of them would fail.

**Check 4 is case-sensitive.** FF string comparison is exact. If your instance uses `'Active'` or `'Active - Payroll Eligible'`, this fails for everyone. Verify the exact string in your setup.

> **`TO_DATE()` format masks must match the string exactly.** `'YYYY/MM/DD HH24:MI:SS'` against `'4712/12/31 00:00:00'`. `HH24` is 24-hour time. Wrong mask, runtime error.

---

## Accrual Logic — The Core Calculation

```plsql
/*=============== ACCRUAL LOGIC ===============*/

IF (l_process = 'Y') THEN
(
  l_months_of_service = MONTHS_BETWEEN(l_acc_end_dt, l_hire_date)
)
```

This is where `IV_ACCRUAL` gets overridden. `MONTHS_BETWEEN` returns a decimal — hired 15 Mar with a period ending 15 Sep gives exactly 6; ending 10 Sep gives about 5.83.

### Phase 1 — Probation, under 6 months

```plsql
IF (l_months_of_service < 6) THEN
(
  accrual = 0
  /* Employee is still in probation, no vacation accrual */
)
```

### Phase 2 — Monthly accrual, 6 to 12 months

```plsql
IF (l_months_of_service >= 6 AND l_months_of_service < 12) THEN
(
  accrual = 1.25
  /* Accruing 1.25 days this period */
)
```

The formula runs once a month and returns 1.25, so the engine accumulates it. Six months at 1.25 gives 7.5 days by regularization.

### Phase 3 — Post-regularization, 12 months and beyond

The complex one. It has three sub-phases, and the first job is working out *which January* gets the credit.

```plsql
l_reg_date  = ADD_MONTHS(l_hire_date, 12)
l_reg_year  = TO_NUMBER(TO_CHAR(l_reg_date, 'YYYY'))
l_reg_month = TO_NUMBER(TO_CHAR(l_reg_date, 'MM'))

/* If regularized IN January, credit that same January
   Otherwise credit the following year January */
IF (l_reg_month = 1) THEN
(  l_first_jan_year = l_reg_year  )
ELSE
(  l_first_jan_year = l_reg_year + 1  )

l_first_jan_date = TO_DATE('01/01/' || TO_CHAR(l_first_jan_year), 'DD/MM/YYYY')
```

![How the regularization month decides which January receives the 15-day credit](/images/posts/breaking-down-a-ph-vacation-leave-accrual-matrix/fig-02-first-january.png)

| Hire date | Regularization date | First eligible January |
|---|---|---|
| Jan 15, 2024 | Jan 15, 2025 | January 2025 |
| Mar 10, 2024 | Mar 10, 2025 | January 2026 |
| Dec 1, 2024 | Dec 1, 2025 | January 2026 |

**3A — the bridge.** Between regularization and that first January, keep accruing 1.25 a month:

```plsql
IF (l_acc_end_dt < l_first_jan_date) THEN
(
  accrual = 1.25
  /* First January not reached yet, continuing monthly 1.25 days */
)
```

**3B — the one-time lump sum.** Only in the first eligible January. Both period start *and* end must fall in that same January:

```plsql
IF (l_acc_st_month = 1 AND
    l_acc_st_year  = l_first_jan_year AND
    l_acc_end_month = 1 AND
    l_acc_end_year  = l_first_jan_year) THEN
(
  accrual = 15
  /* One-time January credit: 15 days */
)
```

**3C — nothing afterwards.** Without this the credit would repeat every January:

```plsql
IF (l_acc_end_year > l_first_jan_year OR
    (l_acc_end_year = l_first_jan_year AND l_acc_end_month > 1)) THEN
(
  accrual = 0
  /* One-time 15 day credit was already given, no further accrual */
)
```

---

## RETURN — The Formula Output

```plsql
/*=============== SINGLE RETURN per Oracle Doc page 19 ===============*/

IF (l_debug_flag = 'Y') THEN
(
  l_log = ESS_LOG_WRITE('Returning accrual ' || TO_CHAR(accrual))
)

RETURN accrual
```

Accrual matrix formulas return one numeric value named `accrual`. The engine adds it to the worker's balance for the period.

> **One RETURN, and it must be the last executable statement.** No early returns. That constraint is exactly why the whole formula runs on the `l_process` flag and a chain of independent `IF` blocks.

---

## FF Syntax Things to Remember

| Rule | Detail |
|---|---|
| `=` does everything | Assignment *and* comparison — context decides which. There is no `==`. |
| Parentheses required | `IF (condition) THEN ( statements )`. Drop the parens around the body and it won't compile. |
| No `ELSE IF` | Nest an `IF` inside `ELSE`, or use independent `IF` blocks with a flag. There is no `ELSIF`. |
| Strings are case-sensitive | `'ACTIVE' <> 'Active'`. Verify the exact value in your setup. |
| Functions must be assigned | Even void-like ones. `l_log = ESS_LOG_WRITE(...)`. |
| `\|\|` is concatenation | Not logical OR. Logical OR is the word `OR`. |
| `RETURN` must be last | No early returns. Use flags for flow control. |
| No semicolons | Line breaks and parser context determine statement boundaries. |

---

## Wrapping Up

That's the whole formula. The concepts it covers: `DEFAULT` handling, DBIs versus input values, `GET_CONTEXT`, date manipulation via `TO_CHAR` / `TO_NUMBER` / `TO_DATE` / `ADD_MONTHS` / `MONTHS_BETWEEN` / `DAYS_BETWEEN`, `ESS_LOG_WRITE` debugging, the process-flag pattern, and RETURN behaviour.

If you're new to Fast Formula, type this out in the formula editor rather than pasting it. The syntax patterns stick faster that way.

---

*Abhishek Mohanty · Oracle ACE Associate | AIOUG Member | Oracle HCM Cloud Consultant & Technical Architect — Fast Formulas, Absence Management, Time & Labor, Core HR, Redwood, HDL, OTBI.*
