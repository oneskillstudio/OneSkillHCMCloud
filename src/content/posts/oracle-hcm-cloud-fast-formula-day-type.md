---
title: "Oracle HCM Cloud Fast Formula: Day-Type Branching in TCR Calculations with GET_DATE_DAY_OF_WEEK, CALL_FORMULA Holiday Resolution, and the PER_ASG_FULL_PART_TIME Fork_TCR Part-2"
pubDate: 2026-06-09
description: "Oracle HCM Cloud Fast Formula: Day-Type Branching in TCR Calculations with GET_DATE_DAY_OF_WEEK, CALL_FORMULA Holiday Resolution, and the..."
tags: ["Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 820px; margin: 0 auto; color: #2d2926; line-height: 1.65; font-size: 17px;">

<!-- ============ HEADER ============ -->
<div style="border-left: 4px solid #8b2e2a; padding-left: 20px; margin: 32px 0 40px 0;">
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-weight: 500;">ORACLE HCM CLOUD · TCR DEEP DIVE · PART 2 OF 12</div>
<h1 style="font-family: 'Source Sans 3', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.25; color: #2d2926;">Oracle HCM Cloud Fast Formula: Day-Type Branching in TCR Calculations with GET_DATE_DAY_OF_WEEK, CALL_FORMULA Holiday Resolution, and the PER_ASG_FULL_PART_TIME Fork</h1>
<div style="font-size: 18px; color: #5a5550; font-weight: 400; line-height: 1.5;">How a Time Calculation Rule formula picks the right OT bucket — examining <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_DATE_DAY_OF_WEEK</code> return values, the FRI-anchored weekly compare via <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_DAYS</code> in a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE 1=1</code> loop, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CALL_FORMULA</code> bind syntax for holiday resolution, and the four-way day-type fork.</div>
</div>

<!-- ============ TAG PILLS ============ -->
<div style="margin-bottom: 32px;">
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">FAST FORMULA</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">OTL</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">TIME CALCULATION RULE</span>
<span style="display: inline-block; background: #8b2e2a; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">CALL_FORMULA</span>
</div>

<!-- ============ AUTHOR BYLINE (TOP) ============ -->
<div style="display: flex; align-items: center; background: #faf6f0; border: 1px solid #e8ddc9; margin: 24px 0 32px 0;">
<div style="background: #8b2e2a; color: #fff; width: 64px; min-width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; font-family: 'Source Sans 3', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 1px;">AM</div>
<div style="padding: 12px 20px;">
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 700; color: #2d2926; margin-bottom: 2px;">Abhishek Mohanty</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #8b2e2a; line-height: 1.4;">Oracle ACE Associate  |  AIOUG Member  |  Oracle HCM Cloud Consultant</div>
</div>
</div>

<!-- ============ LEAD ============ -->
<p style="font-family: 'Source Sans 3', sans-serif; font-size: 19px; line-height: 1.6; color: #2d2926; margin: 0 0 24px 0;">In Part 1 the formula derived <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_working_hours</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_monthly_hours</code> — the daily and monthly thresholds. Knowing the threshold isn't enough. <strong>The same hour worked on a Tuesday afternoon doesn't pay the same as that hour worked on a Sunday or on a public holiday.</strong></p>

<p style="font-family: 'Source Sans 3', sans-serif;">Most OT regimes have at least four distinct day types — regular weekday, Saturday, Sunday, and gazetted public holiday — and each one routes worked hours into a different OT bucket. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_DATE_DAY_OF_WEEK</code> alone doesn't distinguish a regular Wednesday from Wednesday-when-Diwali-falls-on-a-Wednesday. The formula has to do that disambiguation itself.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">This post walks through the four Oracle HCM Cloud constructs the formula uses to make that decision: the day-of-week function, an <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_DAYS</code>-based scan for the next Friday, a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CALL_FORMULA</code> invocation that resolves the public holiday calendar, and a text-DBI fork on <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_FULL_PART_TIME</code>.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">GET_DATE_DAY_OF_WEEK Return Values and Date-to-Day-Name Conversion</h2>

<p style="font-family: 'Source Sans 3', sans-serif;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_DATE_DAY_OF_WEEK</code> is a built-in Fast Formula function that takes a date and returns the corresponding day name as a three-letter uppercase string. It is locale-independent — the return values do not change with the user's session language:</p>

<!-- VIZ: GET_DATE_DAY_OF_WEEK return table -->
<div style="background: #faf8f5; border: 1px solid #e8e3dd; padding: 24px; margin: 24px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8a847d; margin-bottom: 14px; letter-spacing: 1px; font-weight: 500;">RETURN VALUES — FIXED, LOCALE-INDEPENDENT</div>
<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; font-family: 'JetBrains Mono', monospace;">
<div style="text-align: center; padding: 12px 4px; background: #e8e3dd; border-radius: 3px;">
<div style="font-size: 13px; color: #2d2926; font-weight: 700;">'SUN'</div>
</div>
<div style="text-align: center; padding: 12px 4px; background: #fff; border: 1px solid #d9c9b0; border-radius: 3px;">
<div style="font-size: 13px; color: #2d2926; font-weight: 700;">'MON'</div>
</div>
<div style="text-align: center; padding: 12px 4px; background: #fff; border: 1px solid #d9c9b0; border-radius: 3px;">
<div style="font-size: 13px; color: #2d2926; font-weight: 700;">'TUE'</div>
</div>
<div style="text-align: center; padding: 12px 4px; background: #fff; border: 1px solid #d9c9b0; border-radius: 3px;">
<div style="font-size: 13px; color: #2d2926; font-weight: 700;">'WED'</div>
</div>
<div style="text-align: center; padding: 12px 4px; background: #fff; border: 1px solid #d9c9b0; border-radius: 3px;">
<div style="font-size: 13px; color: #2d2926; font-weight: 700;">'THU'</div>
</div>
<div style="text-align: center; padding: 12px 4px; background: #fff; border: 1px solid #d9c9b0; border-radius: 3px;">
<div style="font-size: 13px; color: #2d2926; font-weight: 700;">'FRI'</div>
</div>
<div style="text-align: center; padding: 12px 4px; background: #e8e3dd; border-radius: 3px;">
<div style="font-size: 13px; color: #2d2926; font-weight: 700;">'SAT'</div>
</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #5a5550; margin-top: 14px; line-height: 1.5;">Every comparison in the day-type branch must use uppercase three-letter literals: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_week_day = 'SAT'</code>, never <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'Sat'</code> or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'Saturday'</code>. Mismatched case silently fails the IF branch and the formula falls through to weekday logic.</div>
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The TCR formula calls it once per measure period entry against the timecard's start time:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
l_week_day <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">GET_DATE_DAY_OF_WEEK</span>(aiStartTime)<br>
flog <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">add_log</span>(ffs_id, <span style="color: #2d6b3f;">'>>> ffName: '</span> || ffName || <span style="color: #2d6b3f;">' l_week_day '</span> || l_week_day)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">From here, every subsequent branch in the formula compares against <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_week_day</code> using equality on those exact string literals.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The FRI-Anchored Weekly Compare with ADD_DAYS and WHILE 1=1 LOOP</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Day-of-week alone tells you what day it is. It doesn't tell you whether you've crossed into a new <em>OT week</em>. Most OT regimes accumulate worked hours against a weekly cap that resets every Friday at midnight — so the formula needs to know when "this Friday" passes to clear the running weekly counter.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The pattern used here is a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE 1=1 LOOP</code> that walks forward day by day from the current timecard entry until it lands on a Friday, then stores that date as the reset boundary:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> ((aiStartTime > l_date_compare) <span style="color: #8b2e2a; font-weight: 700;">AND</span> (l_week_day <> <span style="color: #2d6b3f;">'SAT'</span>) <span style="color: #8b2e2a; font-weight: 700;">AND</span> (l_week_day <> <span style="color: #2d6b3f;">'SUN'</span>)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
( l_weekly_reg <span style="color: #8b2e2a; font-weight: 700;">=</span> 0 )<br><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_week_day <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'SAT'</span> <span style="color: #8b2e2a; font-weight: 700;">OR</span> l_week_day <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'SUN'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
( l_weekly_reg <span style="color: #8b2e2a; font-weight: 700;">=</span> 0 )<br>
<span style="color: #8b2e2a; font-weight: 700;">ELSE</span><br>
(<br>
  j <span style="color: #8b2e2a; font-weight: 700;">=</span> 1<br>
  <span style="color: #8b2e2a; font-weight: 700;">WHILE</span>( 1=1 ) <span style="color: #8b2e2a; font-weight: 700;">LOOP</span><br>
  (<br>
    l_temp_date <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">ADD_DAYS</span>(aiStartTime, j)<br>
    l_temp_week_day <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">GET_DATE_DAY_OF_WEEK</span>(l_temp_date)<br>
    <span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_temp_week_day <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'FRI'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
    (<br>
      l_date_compare <span style="color: #8b2e2a; font-weight: 700;">=</span> l_temp_date<br>
      <span style="color: #8b2e2a; font-weight: 700;">EXIT</span><br>
    )<br>
    <span style="color: #8b2e2a; font-weight: 700;">ELSE</span><br>
      j <span style="color: #8b2e2a; font-weight: 700;">=</span> j + 1<br>
  )<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Three Oracle HCM Cloud constructs are worth pausing on here:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 10px;"><strong><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_DAYS(date, integer)</code></strong> — adds the integer to the date and returns a date. Negative integers walk backwards. Fast Formula evaluates this purely as arithmetic on the underlying date column; there is no calendar consultation, no holiday awareness, no DST adjustment.</li>
<li style="margin-bottom: 10px;"><strong><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE 1=1 LOOP</code></strong> — Fast Formula has no native FOR-loop construct that increments by 1. The idiomatic pattern is an infinite WHILE with manual counter advance and an explicit <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">EXIT</code> when the termination condition is met. This is safer than <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE (j <= 7)</code> because the loop body decides when to leave — useful when there are multiple exit conditions.</li>
<li style="margin-bottom: 10px;"><strong>The implicit bound</strong> — since Friday occurs every seven days, the loop is guaranteed to exit within seven iterations. Fast Formula has no infinite-loop detection at compile time, so loops that <em>could</em> run forever (e.g., a typo in the condition) will hit the runtime governor and abort the rule with a vague "formula execution exceeded threshold" error. The seven-day natural ceiling here makes this pattern safe.</li>
</ul>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">CALL_FORMULA Pattern for Worker Holiday Schedule Resolution</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Knowing it's a Wednesday isn't enough. The formula has to know whether <em>this</em> Wednesday is also a public holiday — and the public holiday list lives in a Worker Holiday Calendar attached to the worker's LDG, not in any DBI the TCR formula can read directly.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The escape hatch is <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CALL_FORMULA</code>, which invokes another Fast Formula and binds its inputs and outputs by name. The TCR delegates holiday resolution to a utility formula:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">CALL_FORMULA</span> (<span style="color: #2d6b3f;">'XX_HOLIDAY_LOOKUP_FF'</span><br>
  , ffs_id            > <span style="color: #2d6b3f;">'ffs_id'</span><br>
  , rule_id           > <span style="color: #2d6b3f;">'rule_id'</span><br>
  , l_holiday_cat   > <span style="color: #2d6b3f;">'holiday_category'</span><br>
  , l_start_time    > <span style="color: #2d6b3f;">'start_date_override'</span><br>
  , l_stop_time     > <span style="color: #2d6b3f;">'end_date_override'</span><br>
  , l_holiday_count < <span style="color: #2d6b3f;">'OUT_COUNT'</span>  <span style="color: #8b2e2a; font-weight: 700;">DEFAULT</span> 0<br>
  , l_holiday_dates < <span style="color: #2d6b3f;">'OUT_DATES'</span>  <span style="color: #8b2e2a; font-weight: 700;">DEFAULT</span> EMPTY_DATE_NUMBER<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The syntax is non-obvious if you've never seen it before. The two arrow operators distinguish input bindings from output bindings:</p>

<!-- ARROW REFERENCE BOX -->
<div style="background: #faf8f5; border: 1px solid #e8e3dd; padding: 20px 24px; margin: 24px 0;">
<div style="display: grid; grid-template-columns: auto 1fr; gap: 16px 20px; align-items: start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #8b2e2a; font-weight: 700; line-height: 1;">></div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 15px; line-height: 1.5;"><strong>Input binding.</strong> Local variable on the left flows into the called formula's input parameter (named on the right). The local must already be populated.</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #8b2e2a; font-weight: 700; line-height: 1;"><</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 15px; line-height: 1.5;"><strong>Output binding.</strong> Called formula's RETURN value (named on the right) flows back into the local variable on the left. The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DEFAULT</code> clause is mandatory for outputs and provides a fallback if the called formula errors or returns null.</div>
</div>
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Once the call returns, the formula reads <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_holiday_count</code> — set to 1 if the date falls on a gazetted public holiday for the worker's LDG, 0 otherwise — and uses that as the first fork in the day-type decision tree.</p>

<!-- ============ CALLOUT ============ -->
<div style="background: #faf6f0; border-left: 4px solid #8b2e2a; padding: 20px 24px; margin: 32px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">A NOTE ON DEFAULT FOR OUTPUT BINDINGS</div>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; line-height: 1.65;">Unlike the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DEFAULT FOR <DBI> IS</code> declaration at the top of the formula, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DEFAULT</code> clause inside a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CALL_FORMULA</code> bind is required, not optional. Omit it and the formula will compile but fail at runtime with <em>"output parameter must specify DEFAULT value"</em>. The default has to match the declared type of the local variable — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">0</code> for number, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">EMPTY_DATE_NUMBER</code> for date arrays, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">' '</code> for text.</p>
</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Inside the Called Formula — How Bindings Map to INPUTS and RETURN</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">For the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CALL_FORMULA</code> bindings to resolve cleanly, the called formula must declare its inputs and return its outputs using exactly the labels the caller specifies. Here's the skeleton of <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">XX_HOLIDAY_LOOKUP_FF</code> showing both sides of the contract:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/****************************************************************<br>
 * FORMULA NAME : XX_HOLIDAY_LOOKUP_FF<br>
 * FORMULA TYPE : Time Calculation Rules<br>
 * DESCRIPTION  : Returns the count and date list of public holidays<br>
 *              for a worker over a date range, filtered by<br>
 *              a configurable holiday category code.<br>
 ****************************************************************/</span><br><br>
<span style="color: #8b2e2a; font-weight: 700;">INPUTS ARE</span><br>
  ffs_id              (<span style="color: #8b2e2a; font-weight: 700;">number</span>),<br>
  rule_id             (<span style="color: #8b2e2a; font-weight: 700;">number</span>),<br>
  holiday_category    (<span style="color: #8b2e2a; font-weight: 700;">text</span>),<br>
  start_date_override (<span style="color: #8b2e2a; font-weight: 700;">date</span>),<br>
  end_date_override   (<span style="color: #8b2e2a; font-weight: 700;">date</span>)<br><br>
<span style="color: #8a7560; font-style: italic;">/* Local declarations */</span><br>
ffName      <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'XX_HOLIDAY_LOOKUP_FF'</span><br>
l_person_id <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">GET_CONTEXT</span>(HWM_RESOURCE_ID, 0)<br>
OUT_COUNT   <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br>
OUT_DATES   <span style="color: #8b2e2a; font-weight: 700;">=</span> EMPTY_DATE_NUMBER<br><br>
<span style="color: #8a7560; font-style: italic;">/* Fetch the count via a parameterized value set that queries the<br>
   calendar event repository for the worker's holiday eligibility */</span><br>
l_params <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'|=P_PERSON_ID='''</span>   || <span style="color: #8b2e2a; font-weight: 700;">TO_CHAR</span>(l_person_id)<br>
        || <span style="color: #2d6b3f;">'''|P_START_DATE='''</span> || <span style="color: #8b2e2a; font-weight: 700;">TO_CHAR</span>(start_date_override, <span style="color: #2d6b3f;">'YYYY-MM-DD'</span>)<br>
        || <span style="color: #2d6b3f;">'''|P_END_DATE='''</span>   || <span style="color: #8b2e2a; font-weight: 700;">TO_CHAR</span>(end_date_override,   <span style="color: #2d6b3f;">'YYYY-MM-DD'</span>)<br>
        || <span style="color: #2d6b3f;">'''|P_CATEGORY='''</span>    || holiday_category || <span style="color: #2d6b3f;">''''</span><br><br>
OUT_COUNT <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">TO_NUMBER</span>(<span style="color: #8b2e2a; font-weight: 700;">GET_VALUE_SET</span>(<span style="color: #2d6b3f;">'XX_HOLIDAY_COUNT_VS'</span>, l_params))<br><br>
<span style="color: #8a7560; font-style: italic;">/* OUT_DATES would be populated similarly via a date-array value set<br>
   or a holiday DBI iteration loop. Omitted here for brevity. */</span><br><br>
<span style="color: #8b2e2a; font-weight: 700;">RETURN</span> OUT_COUNT, OUT_DATES
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Three contracts to notice between the caller and the called formula:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 10px;"><strong>Input names match the caller's bind labels.</strong> The caller writes <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_holiday_cat > 'holiday_category'</code>, so the called formula must declare <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">holiday_category</code> in its INPUTS block with a matching type. Typos here fail at runtime, not at compile time.</li>
<li style="margin-bottom: 10px;"><strong>Output names match the caller's bind labels.</strong> The caller writes <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_holiday_count < 'OUT_COUNT'</code>, so the called formula must have a local called <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">OUT_COUNT</code> and include it in the RETURN statement.</li>
<li style="margin-bottom: 10px;"><strong>Formula type must be compatible.</strong> Both the caller and the called formula here are <em>Time Calculation Rules</em>. Mismatched types compile but fail at runtime with a <em>"formula not found in compatible type"</em> error — one of the more frequent debugging dead-ends in custom utility design.</li>
</ul>

<p style="font-family: 'Source Sans 3', sans-serif;">The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_VALUE_SET</code> call is the standard Fast Formula escape hatch for querying tables that aren't exposed as DBIs. The value set itself is configured under <em>Setup and Maintenance → Manage Value Sets</em> as a Table value set with the SQL that joins the calendar event repository against the worker's holiday eligibility profile. Keeping the SQL out of Fast Formula and inside the value set keeps the formula portable and lets the database optimizer cache the query plan.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Externalizing the Public Holiday Category via a Rule Input Parameter</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The holiday category bind is the one parameter most engineers miss. The Worker Holiday Calendar can hold multiple <em>categories</em> of non-working days — gazetted public holidays, optional restricted holidays, bridge days, company-declared shutdowns. Each category has its own OT treatment.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The TCR formula reads which category counts as a "real" holiday for OT purposes from a rule input parameter, populated when the rule is configured under <em>Setup and Maintenance → Manage Time Calculation Rules</em>:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Fixed Values from Rule Input parameters */</span><br>
l_holiday_cat <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">get_rvalue_text</span>(rule_id, <span style="color: #2d6b3f;">'HOLIDAY_CATEGORY_CODE'</span>, <span style="color: #2d6b3f;">'PH'</span>)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">get_rvalue_text</code> reads a text parameter off the rule definition by name (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'HOLIDAY_CATEGORY_CODE'</code>), falling back to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'PH'</code> if the parameter wasn't configured. The same formula deployed for two different LDGs can therefore treat different calendar categories as the "real" holiday set — without recompiling.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">This is one of the cleanest separations of policy and code in the Fast Formula language. The rule parameter is the policy. The formula is the engine. Reuse follows naturally.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The PER_ASG_FULL_PART_TIME Fork — Why Default 'X' Matters</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Even after day-type is resolved, the formula has one more fork: <strong>part-time workers don't trigger the monthly threshold the same way full-time workers do</strong>. A part-timer's "normal" daily hours might be 4. A full-timer's might be 8. Both can rack up OT, but the bucket-fill mechanics differ.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The split is gated by <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_FULL_PART_TIME</code>, a text DBI whose values are <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'FULL_TIME'</code> or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'PART_TIME'</code> drawn from the worker's assignment record. Notice the default at the top of the formula:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">DEFAULT FOR</span> PER_ASG_FULL_PART_TIME <span style="color: #8b2e2a; font-weight: 700;">IS</span> <span style="color: #2d6b3f;">'X'</span>
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The fallback is <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'X'</code>, not <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">' '</code>. The reason is deliberate. Both branches in the fork compare against specific values:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (PER_ASG_FULL_PART_TIME <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'FULL_TIME'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
( <span style="color: #8a7560; font-style: italic;">/* monthly threshold logic */</span> )<br>
<span style="color: #8b2e2a; font-weight: 700;">ELSE</span><br>
( <span style="color: #8a7560; font-style: italic;">/* part-time / public holiday logic */</span> )
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">If the DBI is null and the default was a blank string, the comparison <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">' ' = 'FULL_TIME'</code> returns false and the ELSE branch fires — silently routing a worker with missing data through the part-time path. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'X'</code> as the sentinel makes the missing-data case explicit in logs — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_FULL_PART_TIME: X</code> in the rule execution log is a clear signal that the worker's assignment is incomplete and the calculation should be reviewed.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">This is a small thing. It saves hours of debugging in production.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Day-Type Branching Flow — SAT, SUN, Weekday, and Public Holiday Paths</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">With all four constructs in hand — day-of-week, weekly compare, holiday count, full-time flag — the formula assembles them into a four-way fork. Once the call to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CALL_FORMULA</code> returns and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_holiday_count</code> is populated, the decision tree fires:</p>

<!-- DECISION TABLE -->
<div style="margin: 24px 0; overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; font-family: 'Source Sans 3', sans-serif; font-size: 14px;">
<thead>
<tr style="background: #2d2926; color: #fff;">
<th style="padding: 12px 14px; text-align: left; font-weight: 600; letter-spacing: 1px; font-size: 11px; font-family: 'JetBrains Mono', monospace;">CONDITION</th>
<th style="padding: 12px 14px; text-align: left; font-weight: 600; letter-spacing: 1px; font-size: 11px; font-family: 'JetBrains Mono', monospace;">PATH</th>
<th style="padding: 12px 14px; text-align: left; font-weight: 600; letter-spacing: 1px; font-size: 11px; font-family: 'JetBrains Mono', monospace;">BUCKET FILLED</th>
</tr>
</thead>
<tbody>
<tr style="background: #faf8f5; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 12px 14px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #8b2e2a; font-weight: 600;">l_holiday_count = 1</td>
<td style="padding: 12px 14px;"><strong>Public Holiday</strong></td>
<td style="padding: 12px 14px; color: #5a5550;">All worked hours → OT 200%</td>
</tr>
<tr style="background: #fff; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 12px 14px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #8b2e2a; font-weight: 600;">l_week_day = 'SAT'</td>
<td style="padding: 12px 14px;"><strong>Saturday</strong></td>
<td style="padding: 12px 14px; color: #5a5550;">First <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_working_hours</code> → OT 200%; surplus → OT 150%</td>
</tr>
<tr style="background: #faf8f5; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 12px 14px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #8b2e2a; font-weight: 600;">l_week_day = 'SUN'</td>
<td style="padding: 12px 14px;"><strong>Sunday</strong></td>
<td style="padding: 12px 14px; color: #5a5550;">All worked hours → OT 200%</td>
</tr>
<tr style="background: #fff;">
<td style="padding: 12px 14px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #8b2e2a; font-weight: 600;">Weekday + FULL_TIME</td>
<td style="padding: 12px 14px;"><strong>Regular Weekday</strong></td>
<td style="padding: 12px 14px; color: #5a5550;">Worked hours → Regular until monthly cap; surplus → OT 150%</td>
</tr>
</tbody>
</table>
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The cascade is evaluated top-down with <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IF / ELSE IF / ELSE</code>. <strong>The public holiday check is the outermost gate because a holiday that falls on a Sunday is still a holiday</strong> — the formula must not let Sunday's OT 200% logic override the holiday's OT 200% logic just because the comparison happens to produce the same multiplier. The two paths fill different output buckets downstream, which matters for payroll element mapping in Part 4.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">Each branch ends by zeroing <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_reg</code> (regular hours), since worked hours on a non-regular day don't contribute to the weekly or monthly normal-time accumulator. Only the weekday branch can leave <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_reg</code> populated.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Why Use CALL_FORMULA Instead of Inlining the Holiday Lookup</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">A reasonable question — why route through a separate utility formula at all? The TCR could read the holiday calendar inline with array DBIs like <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_HOLIDAY_DATE_LIST</code> and avoid the call overhead.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The separation pays for itself three ways:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 10px;"><strong>Reuse.</strong> The same holiday-resolution formula is called from absence accrual matrices, entry validations, and other TCR rules. Centralizing it means changes to the calendar interpretation (new category filters, date-range adjustments) ripple to all callers without touching them.</li>
<li style="margin-bottom: 10px;"><strong>Testability.</strong> The utility formula can be unit-tested by directly executing it from the Fast Formula UI with sample input values — much easier than running an entire TCR for one date.</li>
<li style="margin-bottom: 10px;"><strong>Compilation scope.</strong> Array DBIs like <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_HOLIDAY_DATE_LIST</code> require specific contexts (LDG_ID, EFFECTIVE_DATE) that not every formula type supplies. Putting them in a dedicated formula with the right type isolates the context dependency to one place.</li>
</ul>

<p style="font-family: 'Source Sans 3', sans-serif;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CALL_FORMULA</code> has overhead — every call instantiates a new evaluation context. For a TCR that fires once per measure period entry, that overhead is negligible. For a payroll batch processing tens of thousands of assignments, you'd profile before relying on it heavily.</p>

<!-- ============ NEXT UP ============ -->
<div style="background: #2d2926; color: #fff; padding: 32px; margin: 48px 0 24px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #d4a574; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">NEXT IN THE SERIES</div>
<h3 style="font-family: 'Source Sans 3', sans-serif; margin: 0 0 8px 0; font-size: 22px; color: #fff; font-weight: 700;">Part 3 — The Main Iteration Loop with HWM_CTXARY_RECORD_POSITIONS, aiRecPosition, and the Infinite-Loop Guard</h3>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; color: #c4bdb5; line-height: 1.5; font-size: 15px;">How a TCR walks the timecard one entry at a time — array iteration via <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_RECORD_POSITIONS</code>, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">aiRecPosition = 'DETAIL'</code> vs <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'END_DAY'</code> branch, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_HWM_MEASURE_DAY</code> companion array, and the defensive <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">raise_error</code> at nidx > 1000 that saves your rule from a runaway loop.</p>
</div>

<!-- ============ AUTHOR BYLINE (BOTTOM) ============ -->
<div style="display: flex; align-items: stretch; background: #faf6f0; border: 1px solid #e8ddc9; margin: 32px 0 24px 0;">
<div style="background: #8b2e2a; color: #fff; width: 64px; min-width: 64px; display: flex; align-items: center; justify-content: center; font-family: 'Source Sans 3', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: 1px;">AM</div>
<div style="padding: 14px 20px;">
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 700; color: #2d2926; margin-bottom: 4px;">Abhishek Mohanty</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #5a5550; line-height: 1.5;"><span style="color: #8b2e2a; font-weight: 600;">Oracle ACE Associate  |  AIOUG Member  |  Oracle HCM Cloud Consultant & Technical Lead</span> — Fast Formulas, Absence Management, Time & Labor, Core HR, Redwood, HDL, OTBI.</div>
</div>
</div>

<!-- ============ FOOTER ============ -->
<div style="border-top: 2px solid #f0e9dd; padding-top: 24px; margin-top: 48px; font-size: 13px; color: #8a847d; font-family: 'JetBrains Mono', monospace; line-height: 1.6;">
<div style="margin-bottom: 6px; font-weight: 500;">TCR DEEP DIVE · PART 2 / 10</div>
<div>Series tag: <span style="color: #8b2e2a; font-weight: 500;">#TCRDeepDive</span></div>
</div>

</div>