---
title: "Oracle HCM Cloud Fast Formula: Deriving Daily Working Hours from PER_ASG_WORK_SCH_WORKDAY_PATTERN in TCR Calculations"
pubDate: 2026-06-05
description: "Oracle HCM Cloud Fast Formula: Deriving Daily Working Hours from PER_ASG_WORK_SCH_WORKDAY_PATTERN in TCR Calculations"
tags: ["Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 820px; margin: 0 auto; color: #2d2926; line-height: 1.65; font-size: 17px;">

<!-- ============ HEADER ============ -->
<div style="border-left: 4px solid #8b2e2a; padding-left: 20px; margin: 32px 0 40px 0;">
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-weight: 500;">ORACLE HCM CLOUD · TCR DEEP DIVE · PART 1 OF 12</div>
<h1 style="font-family: 'Source Sans 3', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.25; color: #2d2926;">Oracle HCM Cloud Fast Formula: Deriving Daily Working Hours from PER_ASG_WORK_SCH_WORKDAY_PATTERN in TCR Calculations</h1>
<div style="font-size: 18px; color: #5a5550; font-weight: 400; line-height: 1.5;">A breakdown of how Time Calculation Rule formulas parse the workday pattern DBI with INSTR + SUBSTR, guard null schedules with <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WAS NOT DEFAULTED</code>, and compute the monthly norm via <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_PAY_AVAILABILITY</code>.</div>
</div>

<!-- ============ TAG PILLS ============ -->
<div style="margin-bottom: 32px;">
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">FAST FORMULA</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">OTL</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">TIME CALCULATION RULE</span>
<span style="display: inline-block; background: #8b2e2a; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">DBI</span>
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
<p style="font-family: 'Source Sans 3', sans-serif; font-size: 19px; line-height: 1.6; color: #2d2926; margin: 0 0 24px 0;">Before a TCR formula calculates a single hour of overtime, it has to answer one question: <strong>how many hours is this worker supposed to put in on a normal day?</strong></p>

<p style="font-family: 'Source Sans 3', sans-serif;">You'd think this comes from a DBI. It doesn't — not reliably. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_STANDARD_WORKING_HOURS</code> exists, but it returns <em>weekly</em> hours. For a worker on a compressed schedule — say, four 10-hour days — dividing that by 5 gives you the wrong answer. The daily threshold isn't 8. It's 10.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">So the formula does something the documentation never mentions: it parses the worker's <strong>workday pattern string</strong>, one character at a time, seven times in a row.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The PER_ASG_WORK_SCH_WORKDAY_PATTERN DBI Structure</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Oracle stores a worker's weekly schedule shape in <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_WORK_SCH_WORKDAY_PATTERN</code> as a hyphen-delimited string. The format is one slot per day, Sunday through Saturday:</p>

<!-- VIZ: pattern breakdown -->
<div style="background: #faf8f5; border: 1px solid #e8e3dd; padding: 24px; margin: 24px 0; font-family: 'JetBrains Mono', monospace;">
<div style="font-size: 12px; color: #8a847d; margin-bottom: 12px; letter-spacing: 1px; font-weight: 500;">RAW DBI VALUE</div>
<div style="font-size: 20px; color: #2d2926; margin-bottom: 20px; letter-spacing: 2px; font-weight: 500;">0 - 8 - 8 - 8 - 8 - 8 - 0</div>
<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;">
<div style="text-align: center; padding: 8px 4px; background: #e8e3dd; border-radius: 3px;">
<div style="font-size: 10px; color: #8a847d; letter-spacing: 1px; font-weight: 500;">SUN</div>
<div style="font-size: 18px; color: #8a847d; font-weight: 700;">0</div>
</div>
<div style="text-align: center; padding: 8px 4px; background: #8b2e2a; border-radius: 3px;">
<div style="font-size: 10px; color: #fff; letter-spacing: 1px; font-weight: 500;">MON</div>
<div style="font-size: 18px; color: #fff; font-weight: 700;">8</div>
</div>
<div style="text-align: center; padding: 8px 4px; background: #8b2e2a; border-radius: 3px;">
<div style="font-size: 10px; color: #fff; letter-spacing: 1px; font-weight: 500;">TUE</div>
<div style="font-size: 18px; color: #fff; font-weight: 700;">8</div>
</div>
<div style="text-align: center; padding: 8px 4px; background: #8b2e2a; border-radius: 3px;">
<div style="font-size: 10px; color: #fff; letter-spacing: 1px; font-weight: 500;">WED</div>
<div style="font-size: 18px; color: #fff; font-weight: 700;">8</div>
</div>
<div style="text-align: center; padding: 8px 4px; background: #8b2e2a; border-radius: 3px;">
<div style="font-size: 10px; color: #fff; letter-spacing: 1px; font-weight: 500;">THU</div>
<div style="font-size: 18px; color: #fff; font-weight: 700;">8</div>
</div>
<div style="text-align: center; padding: 8px 4px; background: #8b2e2a; border-radius: 3px;">
<div style="font-size: 10px; color: #fff; letter-spacing: 1px; font-weight: 500;">FRI</div>
<div style="font-size: 18px; color: #fff; font-weight: 700;">8</div>
</div>
<div style="text-align: center; padding: 8px 4px; background: #e8e3dd; border-radius: 3px;">
<div style="font-size: 10px; color: #8a847d; letter-spacing: 1px; font-weight: 500;">SAT</div>
<div style="font-size: 18px; color: #8a847d; font-weight: 700;">0</div>
</div>
</div>
<div style="font-size: 12px; color: #8a847d; margin-top: 14px; letter-spacing: 1px; font-weight: 500;">5 WORKING DAYS · 40 WEEKLY HOURS · 8 HRS/DAY</div>
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">For a compressed-week worker (Mon–Thu, 10 hours each), the same DBI holds <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">0-10-10-10-10-0-0</code>. Four working days, 40 weekly hours, but <strong>10 hours/day</strong> is the threshold for overtime — not 8.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">This is the number the formula needs to derive at runtime.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Iterative String Parsing with INSTR and SUBSTR in Fast Formula</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The implementation is brute-force elegant. Three local variables hold the state:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_wrk_pattern</code> — the remaining string, shrinking left-to-right with each pass</li>
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_count</code> — count of working days seen so far (slots where value ≠ '0')</li>
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_normal_hours</code> — running sum of hours from those working days</li>
</ul>

<p style="font-family: 'Source Sans 3', sans-serif;">Each iteration finds the next hyphen, extracts the slot before it, decides whether to count it, then trims the slot off the front of the string. Seven iterations cover all seven days. The seventh uses <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">length(l_wrk_pattern)</code> instead of <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_indicate-1</code> because the final slot has no trailing hyphen.</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Iteration 1 — first slot */</span><br>
l_wrk_pattern <span style="color: #8b2e2a; font-weight: 700;">=</span> PER_ASG_WORK_SCH_WORKDAY_PATTERN<br>
l_indicate    <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">INSTR</span>(l_wrk_pattern, <span style="color: #2d6b3f;">'-'</span>)<br>
l_wrk_day     <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">SUBSTR</span>(l_wrk_pattern, 1, l_indicate-1)<br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_wrk_day <> <span style="color: #2d6b3f;">'0'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
( l_count       = l_count + 1<br>
  l_normal_hours = l_normal_hours + <span style="color: #8b2e2a; font-weight: 700;">to_number</span>(l_wrk_day) )<br><br>
<span style="color: #8a7560; font-style: italic;">/* Iterations 2–6 — shift left, repeat */</span><br>
l_wrk_pattern <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">SUBSTR</span>(l_wrk_pattern, l_indicate+1)<br>
l_indicate    <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">INSTR</span>(l_wrk_pattern, <span style="color: #2d6b3f;">'-'</span>)<br>
l_wrk_day     <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">SUBSTR</span>(l_wrk_pattern, 1, l_indicate-1)<br>
<span style="color: #8a7560; font-style: italic;">/* ...same IF block... */</span><br><br>
<span style="color: #8a7560; font-style: italic;">/* Iteration 7 — last slot, no trailing hyphen */</span><br>
l_wrk_pattern <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">SUBSTR</span>(l_wrk_pattern, l_indicate+1)<br>
l_wrk_day     <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">SUBSTR</span>(l_wrk_pattern, 1, <span style="color: #8b2e2a; font-weight: 700;">length</span>(l_wrk_pattern))<br>
<span style="color: #8a7560; font-style: italic;">/* ...final IF block... */</span><br><br>
l_working_hours <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">ROUNDUP</span>((l_normal_hours/l_count), 2)
</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Parser Execution Trace — Local Variable State per Iteration</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Walking the parser through <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">0-8-8-8-8-8-0</code>:</p>

<!-- TRACE TABLE -->
<div style="margin: 24px 0; overflow-x: auto;">
<table style="width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; font-size: 13px;">
<thead>
<tr style="background: #2d2926; color: #fff;">
<th style="padding: 10px 12px; text-align: left; font-weight: 600; letter-spacing: 1px; font-size: 11px;">ITER</th>
<th style="padding: 10px 12px; text-align: left; font-weight: 600; letter-spacing: 1px; font-size: 11px;">l_wrk_pattern</th>
<th style="padding: 10px 12px; text-align: left; font-weight: 600; letter-spacing: 1px; font-size: 11px;">l_wrk_day</th>
<th style="padding: 10px 12px; text-align: right; font-weight: 600; letter-spacing: 1px; font-size: 11px;">l_count</th>
<th style="padding: 10px 12px; text-align: right; font-weight: 600; letter-spacing: 1px; font-size: 11px;">l_normal_hours</th>
</tr>
</thead>
<tbody>
<tr style="background: #faf8f5; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 10px 12px; color: #8b2e2a; font-weight: 700;">1</td>
<td style="padding: 10px 12px;">0-8-8-8-8-8-0</td>
<td style="padding: 10px 12px; color: #8a847d;">'0' (skip)</td>
<td style="padding: 10px 12px; text-align: right;">0</td>
<td style="padding: 10px 12px; text-align: right;">0</td>
</tr>
<tr style="background: #fff; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 10px 12px; color: #8b2e2a; font-weight: 700;">2</td>
<td style="padding: 10px 12px;">8-8-8-8-8-0</td>
<td style="padding: 10px 12px;">'8'</td>
<td style="padding: 10px 12px; text-align: right;">1</td>
<td style="padding: 10px 12px; text-align: right;">8</td>
</tr>
<tr style="background: #faf8f5; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 10px 12px; color: #8b2e2a; font-weight: 700;">3</td>
<td style="padding: 10px 12px;">8-8-8-8-0</td>
<td style="padding: 10px 12px;">'8'</td>
<td style="padding: 10px 12px; text-align: right;">2</td>
<td style="padding: 10px 12px; text-align: right;">16</td>
</tr>
<tr style="background: #fff; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 10px 12px; color: #8b2e2a; font-weight: 700;">4</td>
<td style="padding: 10px 12px;">8-8-8-0</td>
<td style="padding: 10px 12px;">'8'</td>
<td style="padding: 10px 12px; text-align: right;">3</td>
<td style="padding: 10px 12px; text-align: right;">24</td>
</tr>
<tr style="background: #faf8f5; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 10px 12px; color: #8b2e2a; font-weight: 700;">5</td>
<td style="padding: 10px 12px;">8-8-0</td>
<td style="padding: 10px 12px;">'8'</td>
<td style="padding: 10px 12px; text-align: right;">4</td>
<td style="padding: 10px 12px; text-align: right;">32</td>
</tr>
<tr style="background: #fff; border-bottom: 1px solid #e8e3dd;">
<td style="padding: 10px 12px; color: #8b2e2a; font-weight: 700;">6</td>
<td style="padding: 10px 12px;">8-0</td>
<td style="padding: 10px 12px;">'8'</td>
<td style="padding: 10px 12px; text-align: right;">5</td>
<td style="padding: 10px 12px; text-align: right;">40</td>
</tr>
<tr style="background: #faf8f5;">
<td style="padding: 10px 12px; color: #8b2e2a; font-weight: 700;">7</td>
<td style="padding: 10px 12px;">0</td>
<td style="padding: 10px 12px; color: #8a847d;">'0' (skip)</td>
<td style="padding: 10px 12px; text-align: right;">5</td>
<td style="padding: 10px 12px; text-align: right;">40</td>
</tr>
</tbody>
</table>
</div>

<div style="background: #2d2926; color: #fff; padding: 16px 20px; margin: 24px 0; font-family: 'JetBrains Mono', monospace;">
<div style="font-size: 11px; color: #d4a574; letter-spacing: 2px; margin-bottom: 6px; font-weight: 500;">RESULT</div>
<div style="font-size: 15px;">l_working_hours = ROUNDUP(40 / 5, 2) = <span style="color: #d4a574; font-weight: 700;">8.00</span></div>
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Switch the same worker to four 10-hour days (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">0-10-10-10-10-0-0</code>) and the same parser yields <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">40 / 4 = 10.00</code>. The downstream OT threshold logic shifts automatically — no rule parameter change, no recompile.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Null-Safe DBI Reads with the WAS NOT DEFAULTED Guard</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The parser sits inside a guard:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (PER_ASG_WORK_SCH_WORKDAY_PATTERN <span style="color: #8b2e2a; font-weight: 700;">WAS NOT DEFAULTED</span>)<br>
<span style="color: #8b2e2a; font-weight: 700;">THEN</span> (<br>
  <span style="color: #8a7560; font-style: italic;">/* ...7-iteration parser... */</span><br>
)<br>
<span style="color: #8b2e2a; font-weight: 700;">ELSE</span><br>
  l_working_hours <span style="color: #8b2e2a; font-weight: 700;">=</span> 8
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">If the worker has no schedule attached — common for new hires before the OTL admin assigns one — the DBI defaults, the IF skips, and the formula assumes a standard 8-hour day. The worker doesn't crash the timecard. They just calculate against a safe default.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">This pattern matters because <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WAS NOT DEFAULTED</code> is only valid on input variables and DBIs — not on locally computed variables. The check has to happen <em>before</em> the parser tries to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">INSTR</code> a null string. Get this guard wrong and you'll see <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ORA-01403: no data found</code> bubble through the rule execution log with no clear pointer back to the source line.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Computing Monthly Working Hours with GET_PAY_AVAILABILITY</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The daily threshold is only half the answer. When OT also has a <strong>monthly cap</strong> — hours beyond the monthly working norm spill into OT 150% buckets regardless of which day they fall on — the formula needs to extend the daily number into a monthly target. Three lines do it:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
l_month_start_date <span style="color: #8b2e2a; font-weight: 700;">=</span> periodStartDate<br>
l_month_end_date   <span style="color: #8b2e2a; font-weight: 700;">=</span> periodEndDate<br>
l_working_days <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">GET_PAY_AVAILABILITY</span>(<span style="color: #2d6b3f;">'ASSIGN'</span>,<br>
               l_month_start_date, l_month_end_date,<br>
               <span style="color: #2d6b3f;">'Y'</span>,<span style="color: #2d6b3f;">'Y'</span>,<span style="color: #2d6b3f;">'Y'</span>,<span style="color: #2d6b3f;">'Y'</span>,<span style="color: #2d6b3f;">'D'</span>)<br>
l_monthly_hours <span style="color: #8b2e2a; font-weight: 700;">=</span> l_working_hours * l_working_days
</div>

<p style="font-family: 'Source Sans 3', sans-serif;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_PAY_AVAILABILITY</code> walks the period and returns the working day count, honoring the worker's schedule and the holiday calendar attached to the LDG. The five trailing flags — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'Y','Y','Y','Y','D'</code> — toggle weekday inclusion (Mon/Tue/Wed/Thu/Fri) and the return unit ('D' for days, 'H' for hours).</p>

<p style="font-family: 'Source Sans 3', sans-serif;">Multiply daily threshold by working days and you have the monthly norm. For an 8-hour worker in a 22-working-day month: <strong>176 monthly hours</strong>. Cross that, and the OT 150 cascade fires downstream.</p>

<!-- ============ CALLOUT ============ -->
<div style="background: #faf6f0; border-left: 4px solid #8b2e2a; padding: 20px 24px; margin: 32px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">A NOTE ON ROUNDUP</div>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; line-height: 1.65;">Fast Formula doesn't ship with a native <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ROUNDUP</code>. The line <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_working_hours = ROUNDUP((l_normal_hours/l_count),2)</code> only compiles if a custom function with that name has been registered at the instance level (via Setup & Maintenance → <em>Manage Formula Functions</em>). If you lift this parser into your own formula, swap <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ROUNDUP</code> for <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ROUND(...)</code> or build a CEIL-based equivalent — otherwise the compile will fail with a function-not-found error and the rule will refuse to validate.</p>
</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Why Fast Formula Lacks a String Array Type — and Loop Unrolling as the Workaround</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The parser is verbose, repetitive, and could absolutely be a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE</code> loop. The original developer chose explicit unrolling for one reason: <strong>Fast Formula has no string array type</strong>. You can't split on a delimiter into a collection. You can't <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">FOR EACH</code> over the slots. You can only INSTR + SUBSTR your way through, one slot at a time. Unrolling the loop makes the seven-day boundary visible to anyone reading the code six months later — and seven is a hard ceiling, so the loop guard would be a magic number anyway.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">That's the broader pattern this series will keep returning to: in a long TCR formula, the boring code is often the load-bearing code. The clever parts get rewritten. The ugly parts run for a decade.</p>

<!-- ============ NEXT UP ============ -->
<div style="background: #2d2926; color: #fff; padding: 32px; margin: 48px 0 24px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #d4a574; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">NEXT IN THE SERIES</div>
<h3 style="font-family: 'Source Sans 3', sans-serif; margin: 0 0 8px 0; font-size: 22px; color: #fff; font-weight: 700;">Part 2 — Day-Type Branching with GET_DATE_DAY_OF_WEEK, Public Holiday Override, and the FULL_TIME Fork</h3>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; color: #c4bdb5; line-height: 1.5; font-size: 15px;">Why <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_DATE_DAY_OF_WEEK</code> alone isn't enough to fork OT logic — the formula needs a FRI-anchored weekly compare, a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">pOvrdPubCat</code> rule parameter for public holiday overrides, and a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_FULL_PART_TIME</code> DBI check before threshold logic activates.</p>
</div>

<!-- ============ FOOTER ============ -->
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
<div style="margin-bottom: 6px; font-weight: 500;">TCR DEEP DIVE · PART 1 / 5</div>
<div>Series tag: <span style="color: #8b2e2a; font-weight: 500;">#TCRDeepDive</span></div>
</div>

</div>