---
title: "Debugging Oracle Fast Formula: 5 Logging Patterns Every HCM Cloud Consultant Must Know"
pubDate: 2026-03-17
description: "Debugging Oracle Fast Formula: 5 Logging Patterns Every HCM Cloud Consultant Must Know"
tags: ["Debugging", "Fast Formula", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

<p> </p><div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.8;max-width:780px;margin:0 auto;">

<span style="display:inline-block;background:#c0392b;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Fast Formula</span>
<span style="display:inline-block;background:#2c3e50;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Debugging</span>
<span style="display:inline-block;background:#27ae60;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Essential</span>

<div style="font-size:32px;font-weight:800;color:#1a1a1a;line-height:1.25;margin:18px 0 8px;">Oracle Fast Formula Debug Logging: How to Use ESS_LOG_WRITE to Trace, Debug & Fix Formulas in HCM Cloud</div>

<div style="font-size:13px;color:#888;margin-bottom:25px;letter-spacing:0.5px;">March 17, 2026 • 10 min read • Oracle HCM Cloud</div>

<div style="font-size:17px;color:#666;line-height:1.7;margin-bottom:30px;font-style:italic;border-left:4px solid #c0392b;padding-left:18px;">
Your formula compiled successfully. It even runs without errors. But the result is wrong — and you have no idea why. Welcome to the world of Fast Formula debugging, where the only tool you have is a single function: ESS_LOG_WRITE.
</div>

<table style="padding:20px 0;border-top:2px solid #1a1a1a;border-bottom:2px solid #1a1a1a;margin-bottom:35px;border-collapse:collapse;">
<tr>
<td style="width:50px;vertical-align:middle;padding-right:14px;"><div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);text-align:center;line-height:50px;color:#fff;font-weight:700;font-size:18px;">AM</div></td>
<td style="vertical-align:middle;">
<div style="font-weight:700;font-size:15px;">Abhishek Mohanty</div>
<div style="font-size:13px;color:#888;">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant</div>
</td>
</tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Fast Formula has no debugger. No breakpoints. No step-through execution. No variable watch window. The only way to see what's happening inside a running formula is to write messages to the ESS process log using <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code>.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">This post covers how the function works, the patterns that make debug logs actually useful, and real examples from production absence formulas.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== THE BASICS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">The Basics: How ESS_LOG_WRITE Works</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code> is a built-in function that writes a text message to the Enterprise Scheduler Service (ESS) log. When the formula runs as part of a scheduled process (like accrual calculation or absence validation), the message appears in the process output log.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">There's one quirk: the function returns a number, so you must assign its result to a variable — even though you'll never use that variable for anything else:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* The basic syntax */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Hello from my formula'</span>)

<span style="color:#6b8e6b;font-style:italic;">/* l_debug is a throwaway variable — declare it once */</span>
l_debug = 0  <span style="color:#6b8e6b;">/* initialize at the top of your formula */</span></pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The message can include any text. To include variable values, concatenate them with <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">||</code> and convert non-text values using <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">TO_CHAR</code>:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* Log a text variable */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Status = '</span> || l_status)

<span style="color:#6b8e6b;font-style:italic;">/* Log a number — must convert to text first */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Months of service = '</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_months))

<span style="color:#6b8e6b;font-style:italic;">/* Log a date — specify the format */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Hire date = '</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_hire_date, <span style="color:#8bc48b;">'DD-MON-YYYY'</span>))

<span style="color:#6b8e6b;font-style:italic;">/* Log multiple values in one line */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(
  <span style="color:#8bc48b;">'Person='</span> || l_person_number 
  || <span style="color:#8bc48b;">' | Hire='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_hire_date, <span style="color:#8bc48b;">'DD-MON-YYYY'</span>) 
  || <span style="color:#8bc48b;">' | FTE='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_fte))</pre>

<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">Quick reference: TO_CHAR conversions</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">TO_CHAR(l_number)</code> — number to text</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">TO_CHAR(l_date, 'DD-MON-YYYY')</code> — date to text</td></tr>
<tr><td style="padding:12px 16px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">TO_CHAR(l_date, 'DD/MM/YYYY HH24:MI:SS')</code> — date with time</td></tr>
</table>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== WHERE TO FIND LOGS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Where to Find the Log Output</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The messages only appear when the formula runs inside a scheduled process. Here's how to find them:</p>

<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">Steps to view formula logs</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 1</div>
<div style="font-size:14px;color:#2a2a2a;">Go to <b>Tools → Scheduled Processes</b></div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 2</div>
<div style="font-size:14px;color:#2a2a2a;">Find the process that ran your formula (e.g. <b>Evaluate Absence Management Accruals</b>)</div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 3</div>
<div style="font-size:14px;color:#2a2a2a;">Click on the completed process → <b>View Log and Output</b></div>
</td></tr>
<tr><td style="padding:16px 20px;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 4</div>
<div style="font-size:14px;color:#2a2a2a;">Search the log for your formula name or a unique string from your log messages</div>
</td></tr>
</table>

<div style="margin:28px 0;padding:22px 25px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">
ESS_LOG_WRITE messages only appear in ESS process logs — not in the formula editor, not in the browser console, and not in standard application logs. If you're testing from the formula editor's "Run" button, you won't see the output.
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== PATTERN 1 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Pattern 1: Section Markers</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The most basic and most useful pattern. Wrap your formula in START and END markers so you can instantly find where your formula's output begins and ends in a log that might contain output from dozens of formulas:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* From an Annual Leave Carryover formula */</span>

l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(
  <span style="color:#8bc48b;">'******** Absence Carryover - Formula Start ********'</span>)

<span style="color:#6b8e6b;font-style:italic;">/* ... all formula logic here ... */</span>

l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(
  <span style="color:#8bc48b;">'******** Absence Carryover - Formula End ********'</span>)</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">In the ESS log, this looks like:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#888;">... hundreds of other log lines ...</span>
******** Absence Carryover - Formula Start ********
FTE: 1
Plan Name = DHB_REGULAR_25D
CarryOver Date: 23/01/2026
CarryOver From UDT: 5
CarryOver: 5
******** Absence Carryover - Formula End ********
<span style="color:#888;">... more log lines ...</span></pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Use the formula name in the markers — when multiple formulas run in the same process, you can search for yours instantly.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== PATTERN 2 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Pattern 2: Variable Dump at Key Decision Points</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Don't just log at the start and end. Log the values that feed into every IF/ELSE decision. When the result is wrong, the log tells you exactly which branch was taken and why:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* From a PH Vacation Leave Accrual formula */</span>

l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'=== PH Accrual Start ==='</span>)
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Person: '</span> || PER_ASG_PERSON_NUMBER)
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Hire date: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(l_hire_date, <span style="color:#8bc48b;">'DD-MON-YYYY'</span>))
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Months of service: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(l_months))
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Termination date: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(l_term_date, <span style="color:#8bc48b;">'DD-MON-YYYY'</span>))

<span style="color:#6b8e6b;font-style:italic;">/* Now the decision — log BEFORE and AFTER */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Checking phase...'</span>)

<span style="color:#e67e22;">IF</span> (l_months < 6) <span style="color:#e67e22;">THEN</span>
(
  l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Phase 1: PROBATION → accrual = 0'</span>)
  accrual = 0
)
<span style="color:#e67e22;">ELSE IF</span> (l_months < 12) <span style="color:#e67e22;">THEN</span>
(
  l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Phase 2: MONTHLY → accrual = 1.25'</span>)
  accrual = 1.25
)
<span style="color:#e67e22;">ELSE</span>
(
  l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Phase 3: ANNUAL → accrual = 15'</span>)
  accrual = 15
)

l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Final accrual = '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(accrual))
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'=== PH Accrual End ==='</span>)</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">In the ESS log:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">=== PH Accrual Start ===
Person: 1042
Hire date: 15-JUL-2025
Months of service: 7
Termination date: 31-DEC-4712
Checking phase...
Phase 2: MONTHLY → accrual = 1.25
Final accrual = 1.25
=== PH Accrual End ===</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Now if someone says "this employee should be getting 15 days, not 1.25" — you open the log and immediately see: months of service = 7, which triggered Phase 2 instead of Phase 3. The data tells the story.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/><!-- ==================== PATTERN 3 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Pattern 3: Validation Pass/Fail Logging</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">For absence entry validation formulas, log the rule being checked, the values being compared, and whether it passed or failed:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* From a Leave Entry Validation formula */</span>

l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'=== Leave Validation Start ==='</span>)
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Duration requested: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(l_duration) || <span style="color:#8bc48b;">' days'</span>)
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Max per instance: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(l_max_per_instance))
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Year-to-date used: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(l_ytd_used))
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Annual limit: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(l_annual_limit))

<span style="color:#6b8e6b;font-style:italic;">/* Rule 1: Single instance check */</span>
<span style="color:#e67e22;">IF</span> (l_duration > l_max_per_instance) <span style="color:#e67e22;">THEN</span>
(
  l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'FAIL: '</span> 
    || <span style="color:#6cacec;">TO_CHAR</span>(l_duration) 
    || <span style="color:#8bc48b;">' exceeds max '</span> 
    || <span style="color:#6cacec;">TO_CHAR</span>(l_max_per_instance))
  VALID = <span style="color:#8bc48b;">'N'</span>
)
<span style="color:#e67e22;">ELSE</span>
(
  l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'PASS: Instance check OK'</span>)

  <span style="color:#6b8e6b;font-style:italic;">/* Rule 2: Annual limit check */</span>
  <span style="color:#e67e22;">IF</span> (l_ytd_used + l_duration > l_annual_limit) <span style="color:#e67e22;">THEN</span>
  (
    l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'FAIL: YTD '</span> 
      || <span style="color:#6cacec;">TO_CHAR</span>(l_ytd_used) || <span style="color:#8bc48b;">' + '</span> 
      || <span style="color:#6cacec;">TO_CHAR</span>(l_duration) || <span style="color:#8bc48b;">' = '</span> 
      || <span style="color:#6cacec;">TO_CHAR</span>(l_ytd_used + l_duration) 
      || <span style="color:#8bc48b;">' exceeds annual '</span> 
      || <span style="color:#6cacec;">TO_CHAR</span>(l_annual_limit))
    VALID = <span style="color:#8bc48b;">'N'</span>
  )
  <span style="color:#e67e22;">ELSE</span>
  (
    l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'PASS: Annual limit check OK'</span>)
    VALID = <span style="color:#8bc48b;">'Y'</span>
  )
)</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The ESS log for a failed validation:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">=== Leave Validation Start ===
Duration requested: 4 days
Max per instance: 3
Year-to-date used: 5
Annual limit: 7
FAIL: 4 exceeds max 3
=== Leave Validation End ===</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">One glance and you know exactly which rule failed and why. Without the log, you'd just see "leave request rejected" with no explanation of the data behind the decision.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== PATTERN 4 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Pattern 4: Bracket Wrapping for Hidden Characters</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">One of the most frustrating bugs: a value looks correct in the log but doesn't match. The culprit is usually trailing spaces, invisible characters, or null values that display as blank. Wrap suspicious values in square brackets to expose them:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* Bad — can't see trailing spaces */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Plan name = '</span> || l_plan_name)
<span style="color:#6b8e6b;">/* Log shows: Plan name = DHB_REGULAR_25D
   But actual value might be: DHB_REGULAR_25D   (with spaces) */</span>

<span style="color:#6b8e6b;font-style:italic;">/* Good — brackets expose the exact value */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Plan name = ['</span> || l_plan_name || <span style="color:#8bc48b;">']'</span>)
<span style="color:#6b8e6b;">/* Log shows: Plan name = [DHB_REGULAR_25D   ]
   Now you can see the trailing spaces! */</span>

<span style="color:#6b8e6b;font-style:italic;">/* Also useful: log the length */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Plan name = ['</span> || l_plan_name || <span style="color:#8bc48b;">'] length='</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(<span style="color:#6cacec;">LENGTH</span>(l_plan_name)))</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">This is especially useful when debugging UDT lookups and DBI values that don't match expected strings.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== PATTERN 5 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Pattern 5: Loop Iteration Logging</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">When looping through array DBIs (as covered in the previous blog post), log each iteration with its index and values. Without this, you're blind to what the loop is actually processing:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Array count: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(IV_EVENT_DATES.<span style="color:#6cacec;">COUNT</span>))

l_idx = IV_EVENT_DATES.<span style="color:#6cacec;">FIRST</span>(-1)
l_iteration = 0

<span style="color:#e67e22;">WHILE</span> l_idx <> -1
<span style="color:#e67e22;">LOOP</span>
(
  l_iteration = l_iteration + 1
  l_date    = IV_EVENT_DATES[l_idx]
  l_accrual = IV_ACCRUAL_VALUES[l_idx]

  l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(
    <span style="color:#8bc48b;">'  Loop #'</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_iteration) 
    || <span style="color:#8bc48b;">' idx='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_idx) 
    || <span style="color:#8bc48b;">' date='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_date, <span style="color:#8bc48b;">'DD-MON-YYYY'</span>) 
    || <span style="color:#8bc48b;">' accrual='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_accrual))

  l_idx = IV_EVENT_DATES.<span style="color:#6cacec;">NEXT</span>(l_idx, -1)
)

l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Loop complete. Iterations: '</span> 
  || <span style="color:#6cacec;">TO_CHAR</span>(l_iteration))</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">ESS log output:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">Array count: 3
  Loop #1 idx=1 date=01-JAN-2025 accrual=0
  Loop #2 idx=2 date=01-JUL-2025 accrual=1.25
  Loop #3 idx=3 date=01-JAN-2026 accrual=15
Loop complete. Iterations: 3</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Notice the two-space indent on loop lines. Small detail, but it makes the log structure immediately scannable.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/><!-- ==================== OTHER DEBUG METHODS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Beyond ESS_LOG_WRITE: Other Debug Methods</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">ESS_LOG_WRITE is the most common method, but Oracle provides different debug functions depending on which module runs the formula. Here's the complete reference:</p>

<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr>
<td style="width:30%;background:#1a1a1a;padding:10px 14px;font-size:12px;font-weight:700;color:#fff;border-right:1px solid #333;">Method</td>
<td style="width:35%;background:#1a1a1a;padding:10px 14px;font-size:12px;font-weight:700;color:#fff;border-right:1px solid #333;">Module</td>
<td style="width:35%;background:#1a1a1a;padding:10px 14px;font-size:12px;font-weight:700;color:#fff;">Where logs appear</td>
</tr>
<tr>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;border-right:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code></td>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;border-right:1px solid #e0dcd6;font-size:13px;color:#555;">All modules (most common)</td>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;font-size:13px;color:#555;">ESS process log</td>
</tr>
<tr>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;border-right:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PAY_INTERNAL_LOG_WRITE</code></td>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;border-right:1px solid #e0dcd6;font-size:13px;color:#555;">Payroll only</td>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;font-size:13px;color:#555;">ESS log (with F flag for Payroll debug)</td>
</tr>
<tr>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;border-right:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_RLOG</code></td>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;border-right:1px solid #e0dcd6;font-size:13px;color:#555;">OTL (Time and Labor)</td>
<td style="padding:12px 14px;border-bottom:1px solid #e0dcd6;font-size:13px;color:#555;">OTL Rule Processing Details page</td>
</tr>
<tr>
<td style="padding:12px 14px;border-right:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_LOG</code></td>
<td style="padding:12px 14px;border-right:1px solid #e0dcd6;font-size:13px;color:#555;">OTL (subset of ADD_RLOG)</td>
<td style="padding:12px 14px;font-size:13px;color:#555;">OTL Rule Processing Details page</td>
</tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's the syntax for each:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* ESS_LOG_WRITE — works everywhere, logs to ESS */</span>
l_debug = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(<span style="color:#8bc48b;">'Test message'</span>)

<span style="color:#6b8e6b;font-style:italic;">/* PAY_INTERNAL_LOG_WRITE — Payroll only */</span>
l_debug = <span style="color:#6cacec;">PAY_INTERNAL_LOG_WRITE</span>(<span style="color:#8bc48b;">'Test message'</span>)
<span style="color:#6b8e6b;">/* Enable with F flag in Payroll debug settings */</span>

<span style="color:#6b8e6b;font-style:italic;">/* ADD_RLOG — OTL only, needs formula and rule IDs */</span>
l_log = <span style="color:#6cacec;">ADD_RLOG</span>(ffs_id, rule_id, <span style="color:#8bc48b;">'Test message'</span>)
<span style="color:#6b8e6b;">/* ffs_id from context HWM_FFS_ID
   rule_id from context HWM_RULE_ID */</span>

<span style="color:#6b8e6b;font-style:italic;">/* ADD_LOG — OTL shorthand (rule_id auto-determined) */</span>
l_log = <span style="color:#6cacec;">ADD_LOG</span>(ffs_id, <span style="color:#8bc48b;">'Test message'</span>)</pre>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 12px;">OTL Logging: Where to Find Logs</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">OTL formulas (Time Calculation Rules) use <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_RLOG</code> or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_LOG</code> instead of ESS_LOG_WRITE. The logs don't go to the ESS process log — they go to a dedicated OTL page:</p>

<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">Viewing OTL formula logs</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 1</div>
<div style="font-size:14px;color:#2a2a2a;">Navigator → <b>Workforce Management</b> → <b>Time Management</b></div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 2</div>
<div style="font-size:14px;color:#2a2a2a;">Select <b>Analyze Rule Processing Details</b></div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 3</div>
<div style="font-size:14px;color:#2a2a2a;">Search by <b>Rule Set Name</b> → click the <b>Time Card Processing ID</b></div>
</td></tr>
<tr><td style="padding:16px 20px;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 4</div>
<div style="font-size:14px;color:#2a2a2a;">View the <b>Rule Processing Log</b> on the detail page</div>
</td></tr>
</table>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 12px;">Which Method Should You Use?</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">For most consultants, the decision is simple:</p>

<table style="margin:16px 0 24px;border-collapse:collapse;width:100%;">
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="width:50%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">If your formula runs in...</td>
<td style="width:50%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Use this</td>
</tr>
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="padding:14px 8px;font-size:14px;color:#555;">Absence, Compensation, Benefits, Core HR</td>
<td style="padding:14px 8px;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code></td>
</tr>
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="padding:14px 8px;font-size:14px;color:#555;">Payroll</td>
<td style="padding:14px 8px;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PAY_INTERNAL_LOG_WRITE</code> or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code></td>
</tr>
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="padding:14px 8px;font-size:14px;color:#555;">Time and Labor (OTL)</td>
<td style="padding:14px 8px;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_LOG</code> or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_RLOG</code></td>
</tr>
</table>

<div style="margin:28px 0;padding:22px 25px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">
When in doubt, start with ESS_LOG_WRITE. It works across all modules and the logs are easy to find in Scheduled Processes. For Payroll, use PAY_INTERNAL_LOG_WRITE. For OTL, use ADD_LOG or ADD_RLOG. For formulas that don't generate any logs, use the ADD_RLOG trick in the next section.
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/><!-- ==================== NO-LOG HACK ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">The Hidden Trick: Debugging Formulas That Don't Generate Logs</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Some formula types don't run through a scheduled process at all. They fire from the UI — when a user submits a form, triggers a checklist, or enters a compensation value. Examples include Checklist formulas, Compensation Default and Validation formulas, and many others.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">For these formulas, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code> does nothing — there's no ESS process, so there's no log to write to. This is one of the most frustrating situations in Fast Formula development.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The workaround: use <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_RLOG</code> with a fake formula ID. Even though ADD_RLOG is designed for OTL, it writes to a database table that you can query directly from BI Publisher — regardless of which module triggered the formula.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's a full-scale example — a Compensation Validation formula with ADD_RLOG logging at every step:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* ********************************************************
   FORMULA: XX_COMP_SALARY_VALIDATION_FF
   TYPE:    Compensation Validation
   NOTE:    ESS_LOG_WRITE won't work here — this formula
            fires from the Compensation worksheet UI.
            Using ADD_RLOG to write to HWM_RULE_FF_WORK_LOG.
   ******************************************************** */</span>

<span style="color:#6b8e6b;font-style:italic;">/* ========== DEFAULTS ========== */</span>
<span style="color:#e67e22;">DEFAULT FOR</span> PER_ASG_PERSON_NUMBER <span style="color:#e67e22;">IS</span> <span style="color:#8bc48b;">'UNKNOWN'</span>
<span style="color:#e67e22;">DEFAULT FOR</span> PER_ASG_GRADE_NAME <span style="color:#e67e22;">IS</span> <span style="color:#8bc48b;">'NO_GRADE'</span>

<span style="color:#6b8e6b;font-style:italic;">/* ========== INPUTS ========== */</span>
<span style="color:#e67e22;">INPUTS ARE</span> IV_PROPOSED_SALARY

<span style="color:#6b8e6b;font-style:italic;">/* ========== DEBUG SETUP ==========
   -999001 = unique fake ID for this formula
   seq     = increments to preserve log order */</span>
l_ffs_id = -999001
seq = 1

<span style="color:#6b8e6b;font-style:italic;">/* ========== LOG: START ========== */</span>
l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
  <span style="color:#8bc48b;">'======== XX_COMP_SALARY_VALIDATION Start ========'</span>)
seq = seq + 1

<span style="color:#6b8e6b;font-style:italic;">/* ========== LOG: INPUT VALUES ========== */</span>
l_person = PER_ASG_PERSON_NUMBER
l_grade  = PER_ASG_GRADE_NAME

l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
  <span style="color:#8bc48b;">'Person: '</span> || l_person)
seq = seq + 1

l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
  <span style="color:#8bc48b;">'Grade: ['</span> || l_grade || <span style="color:#8bc48b;">']'</span>)
seq = seq + 1

l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
  <span style="color:#8bc48b;">'Proposed salary: '</span> || <span style="color:#6cacec;">TO_CHAR</span>(IV_PROPOSED_SALARY))
seq = seq + 1

<span style="color:#6b8e6b;font-style:italic;">/* ========== LOOKUP: Get salary range from UDT ========== */</span>
l_min = <span style="color:#6cacec;">TO_NUMBER</span>(<span style="color:#6cacec;">GET_TABLE_VALUE</span>(
  <span style="color:#8bc48b;">'XX_SALARY_RANGE_UDT'</span>, <span style="color:#8bc48b;">'MIN_SALARY'</span>, l_grade, <span style="color:#8bc48b;">'0'</span>))
l_max = <span style="color:#6cacec;">TO_NUMBER</span>(<span style="color:#6cacec;">GET_TABLE_VALUE</span>(
  <span style="color:#8bc48b;">'XX_SALARY_RANGE_UDT'</span>, <span style="color:#8bc48b;">'MAX_SALARY'</span>, l_grade, <span style="color:#8bc48b;">'0'</span>))

l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
  <span style="color:#8bc48b;">'UDT range: min='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_min) 
  || <span style="color:#8bc48b;">' max='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_max))
seq = seq + 1

<span style="color:#6b8e6b;font-style:italic;">/* ========== VALIDATION ========== */</span>
<span style="color:#e67e22;">IF</span> (l_min = 0 <span style="color:#e67e22;">AND</span> l_max = 0) <span style="color:#e67e22;">THEN</span>
(
  l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
    <span style="color:#8bc48b;">'WARN: No UDT row for grade ['</span> || l_grade 
    || <span style="color:#8bc48b;">'] — skipping validation'</span>)
  seq = seq + 1
  VALID = <span style="color:#8bc48b;">'Y'</span>
)
<span style="color:#e67e22;">ELSE IF</span> (IV_PROPOSED_SALARY < l_min) <span style="color:#e67e22;">THEN</span>
(
  l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
    <span style="color:#8bc48b;">'FAIL: '</span> || <span style="color:#6cacec;">TO_CHAR</span>(IV_PROPOSED_SALARY) 
    || <span style="color:#8bc48b;">' below min '</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_min))
  seq = seq + 1
  VALID = <span style="color:#8bc48b;">'N'</span>
  ERROR_MESSAGE = <span style="color:#8bc48b;">'Salary below minimum for grade'</span>
)
<span style="color:#e67e22;">ELSE IF</span> (IV_PROPOSED_SALARY > l_max) <span style="color:#e67e22;">THEN</span>
(
  l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
    <span style="color:#8bc48b;">'FAIL: '</span> || <span style="color:#6cacec;">TO_CHAR</span>(IV_PROPOSED_SALARY) 
    || <span style="color:#8bc48b;">' above max '</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_max))
  seq = seq + 1
  VALID = <span style="color:#8bc48b;">'N'</span>
  ERROR_MESSAGE = <span style="color:#8bc48b;">'Salary exceeds maximum for grade'</span>
)
<span style="color:#e67e22;">ELSE</span>
(
  l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
    <span style="color:#8bc48b;">'PASS: Salary within range'</span>)
  seq = seq + 1
  VALID = <span style="color:#8bc48b;">'Y'</span>
)

<span style="color:#6b8e6b;font-style:italic;">/* ========== LOG: END ========== */</span>
l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
  <span style="color:#8bc48b;">'Result: VALID='</span> || VALID)
seq = seq + 1

l = <span style="color:#6cacec;">ADD_RLOG</span>(l_ffs_id, seq, 
  <span style="color:#8bc48b;">'======== XX_COMP_SALARY_VALIDATION End ========'</span>)

<span style="color:#e67e22;">RETURN</span> VALID</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Key things to notice in the code above:</p>

<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">ADD_RLOG anatomy</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #e0dcd6;">
<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_ffs_id = -999001</code> — a unique negative number for this formula. Use a different number for each formula you're debugging so logs don't mix.
</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #e0dcd6;">
<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">seq = seq + 1</code> — must increment after every ADD_RLOG call. Without this, log rows have the same sequence and the ORDER BY won't preserve your message order.
</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #e0dcd6;">
<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l = ADD_RLOG(...)</code> — returns the number 1. Must assign to a variable (same pattern as ESS_LOG_WRITE).
</td></tr>
<tr><td style="padding:12px 16px;">
<b>Bracket wrapping</b> — notice <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'['</code> around the grade value. UDT lookups fail silently on trailing spaces — the brackets expose them.
</td></tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">After the formula runs (when a manager submits a salary on the Compensation worksheet), query the logs from BI Publisher:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#e67e22;">SELECT</span> log_text
<span style="color:#e67e22;">FROM</span>   HWM_RULE_FF_WORK_LOG
<span style="color:#e67e22;">WHERE</span>  ffs_id = -999001
<span style="color:#e67e22;">ORDER BY</span> log_id, rule_id</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The query returns something like this:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">======== XX_COMP_SALARY_VALIDATION Start ========
Person: 1042
Grade: [IC3]
Proposed salary: 85000
UDT range: min=60000 max=95000
PASS: Salary within range
Result: VALID=Y
======== XX_COMP_SALARY_VALIDATION End ========</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">And for a failed validation:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">======== XX_COMP_SALARY_VALIDATION Start ========
Person: 2087
Grade: [IC5]
Proposed salary: 150000
UDT range: min=80000 max=120000
FAIL: 150000 above max 120000
Result: VALID=N
======== XX_COMP_SALARY_VALIDATION End ========</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The logs accumulate in the table over time. To clean up, you have two options: raise an SR with Oracle to purge the rows, or add a cleanup step at the <b>start</b> of your formula that limits how many rows you keep. In practice, most consultants simply leave the logs — the table handles it. Just use different negative ffs_id values for different formulas so logs don't mix.</p>

<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">When to use the ADD_RLOG trick</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:14px;color:#2a2a2a;"><b>Checklist formulas</b> — triggered when a user opens or completes a checklist task</div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:14px;color:#2a2a2a;"><b>Compensation Default & Validation formulas</b> — fire when a manager enters comp values on the worksheet</div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:14px;color:#2a2a2a;"><b>Person Selection formulas</b> — triggered during eligibility checks from the UI</div>
</td></tr>
<tr><td style="padding:16px 20px;">
<div style="font-size:14px;color:#2a2a2a;"><b>Any formula that runs from the UI</b> — where ESS_LOG_WRITE produces no output</div>
</td></tr>
</table>

<div style="margin:28px 0;padding:22px 25px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">
This is the only way to get debug output from formulas that don't run through scheduled processes. Use a unique negative ffs_id for each formula you're debugging, and remember to clean up the table after debugging (or the logs accumulate).
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== TROUBLESHOOTING ==================== --><div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Oracle's Recommended Troubleshooting Steps</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">When a formula doesn't return the correct values, Oracle's official documentation recommends a systematic approach — start simple, then add complexity back:</p>

<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">Diagnosis steps (in order)</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 1 — Test seeded behavior first</div>
<div style="font-size:14px;color:#2a2a2a;">Remove your custom formula temporarily and test the seeded (out-of-the-box) functionality. This confirms whether the issue is in your formula or in the setup.</div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 2 — Hardcode values</div>
<div style="font-size:14px;color:#2a2a2a;">Replace all DBI reads and function calls with hardcoded values. If the formula works with hardcoded values, the issue is in the data, not the logic.</div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 3 — Replace functions with hardcoded values</div>
<div style="font-size:14px;color:#2a2a2a;">If your formula uses custom functions (SET_INPUT/EXECUTE/GET_OUTPUT), replace them one at a time with hardcoded values to isolate which function is returning unexpected data.</div>
</td></tr>
<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 4 — Trace the formula</div>
<div style="font-size:14px;color:#2a2a2a;">Add ESS_LOG_WRITE (or the appropriate debug method) to trace every variable value at every decision point. This is where the logging patterns from this post come in.</div>
</td></tr>
<tr><td style="padding:16px 20px;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">STEP 5 — Provide results to Oracle Support</div>
<div style="font-size:14px;color:#2a2a2a;">If the above steps don't resolve the issue, document the results from each step and raise an SR with Oracle. The trace output from Step 4 will be the first thing they ask for.</div>
</td></tr>
</table>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 12px;">Critical Warnings from Oracle Documentation</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">These are from Oracle's official Fast Formula administration guide — ignore them at your peril:</p>

<div style="margin:24px 0;padding:22px 25px;background:#fdedec;border-left:5px solid #c0392b;line-height:1.7;">
<div style="font-size:15px;color:#2a2a2a;margin-bottom:14px;"><b style="color:#c0392b;">Never delete a formula that's been attached to a Benefits plan design</b> — especially after the plan has been processed and participants have been found eligible. Deleting it will break the plan's processing chain.</div>
<div style="font-size:15px;color:#2a2a2a;"><b style="color:#c0392b;">Never recreate a formula with the same name after deleting</b> — it doesn't reinstate the old behavior. You'll get runtime errors. Instead, edit the existing formula or create a new formula with a different name and reattach it.</div>
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/><!-- ==================== BEST PRACTICES ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Best Practices</div>

<div style="margin:16px 0;">
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Always use section markers</b> — START and END with the formula name. In a log with 50+ formulas running for 200+ employees, this is the only way to find your output.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Log inputs before decisions</b> — dump every variable that feeds into an IF/ELSE before the condition is evaluated. When the result is wrong, the input values tell you why.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Log which branch was taken</b> — inside every IF and ELSE block, log a message identifying which path executed. Don't make the reader guess from the data.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Use brackets for string comparisons</b> — when a lookup or comparison fails unexpectedly, bracket-wrap both sides to expose trailing spaces and hidden characters.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Include the person identifier</b> — when the process runs for multiple employees, include the person number or assignment number in at least the START marker so you can search for a specific person.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Log the RETURN value</b> — always log the final value being returned, right before the RETURN statement. This confirms what the formula actually sent back, not what you think it sent back.</div>
</div>
<div style="padding:14px 0;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Keep logs in production</b> — don't remove debug logging after go-live. You'll need it again when the first support ticket comes in. The performance impact of ESS_LOG_WRITE is negligible.</div>
</div>
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== KEY TAKEAWAYS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Key Takeaways</div>

<div style="margin:16px 0;">
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">ESS_LOG_WRITE is your only debugging tool</b> — no debugger, no breakpoints, no watch window. Log everything you need to understand what happened.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Must assign to a variable</b> — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_debug = ESS_LOG_WRITE('...')</code> because the function returns a number.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Convert non-text with TO_CHAR</b> — numbers need <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">TO_CHAR(n)</code>, dates need <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">TO_CHAR(d, 'DD-MON-YYYY')</code>.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Find logs in Scheduled Processes</b> — Tools → Scheduled Processes → View Log and Output. Not visible from the formula editor.</div>
</div>
<div style="padding:14px 0;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Five patterns to master</b> — section markers, variable dumps at decisions, pass/fail validation, bracket wrapping, and loop iteration logging.</div>
</div>
</div>

<p style="font-size:16px;margin-top:24px;margin-bottom:18px;color:#2a2a2a;">A well-logged formula is a formula you can fix. A formula without logs is a formula you'll rewrite from scratch when something goes wrong six months after go-live.</p>

<!-- ==================== FOOTER ==================== -->

<table style="padding-top:25px;border-top:2px solid #1a1a1a;margin-top:40px;border-collapse:collapse;">
<tr>
<td style="width:65px;vertical-align:middle;padding-right:16px;"><div style="width:65px;height:65px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);text-align:center;line-height:65px;color:#fff;font-weight:700;font-size:22px;">AM</div></td>
<td style="vertical-align:middle;">
<div style="font-size:18px;font-weight:700;">Abhishek Mohanty</div>
<div style="font-size:14px;color:#666;line-height:1.6;">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Core HR, Redwood, HDL, OTBI.</div>
</td>
</tr>
</table>

</div>