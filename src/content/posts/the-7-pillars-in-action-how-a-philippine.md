---
title: "The 7 Pillars in Action: How a Philippine Leave Formula Brings Every Concept to Life"
pubDate: 2026-03-16
description: "The 7 Pillars in Action: How a Philippine Leave Formula Brings Every Concept to Life"
tags: ["Absence Management", "Fast Formula", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

<p> </p><div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.8;max-width:780px;margin:0 auto;">

<span style="display:inline-block;background:#c0392b;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Fast Formula</span>

<span style="display:inline-block;background:#2c3e50;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Formula Types</span>

<span style="display:inline-block;background:#27ae60;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Hands-On</span>

<div style="font-size:13px;color:#888;margin-bottom:25px;letter-spacing:0.5px;">March 14, 2026 • 12 min read • Oracle HCM Cloud</div>

<div style="font-size:17px;color:#666;line-height:1.7;margin-bottom:30px;font-style:italic;border-left:4px solid #c0392b;padding-left:18px;">

You can't write a formula without a Formula Type. You can't attach it without knowing which column expects it. And you can't debug it without understanding the contexts and input variables tied to it. In this post, I'll use a real-world Absence Accrual Matrix formula — one I built for Philippine vacation leave — to explain every concept hands-on.

</div>

<div style="display:flex;align-items:center;gap:14px;padding:20px 0;border-top:2px solid #1a1a1a;border-bottom:2px solid #1a1a1a;margin-bottom:35px;">

<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0;">AM</div>

<div>

<div style="font-weight:700;font-size:15px;">Abhishek Mohanty</div>

<div style="font-size:13px;color:#888;">Oracle HCM Cloud Consultant & Technical Lead</div>

</div>

</div>

<!-- ==================== INTRO ==================== -->

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">In the <b>previous post</b>, we covered the 7 default components of Fast Formula — what each building block is and how they relate. In this post, we go hands-on using a real production formula: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PH_VACATION_LEAVE_ACCRUAL_MATRIX</code> — a Philippine vacation leave accrual formula I built that handles probation periods, monthly accruals, and one-time lump sum credits.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Instead of a toy "return Y" example, we'll use this formula to see how Formula Types, Contexts, Input Values, and the type-to-column linkage work in a real-world scenario.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== SECTION 1 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Formula Type: The Decision That Shapes Everything</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">For our Philippine leave formula, the type is <b>Absence Accrual Matrix Formula</b>. That single selection determined:</p>

<div style="background:#1e1e1e;border-radius:10px;padding:28px;margin:20px 0;color:#f5ebe0;">

<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px;">

<span style="background:#c0392b;color:#fff;padding:6px 14px;border-radius:4px;font-size:13px;font-weight:700;">Absence Accrual Matrix</span>

<span style="color:#888;font-size:13px;">automatically gave us:</span>

</div>

<div style="display:flex;flex-wrap:wrap;gap:10px;margin-left:20px;">

<span style="background:#e67e22;color:#fff;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600;">PERSON_ID context</span>

<span style="background:#e67e22;color:#fff;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600;">HR_ASSIGNMENT_ID context</span>

<span style="background:#2980b9;color:#fff;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600;">IV_ACCRUAL input</span>

<span style="background:#2980b9;color:#fff;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600;">IV_ACCRUALPERIOD dates</span>

<span style="background:#27ae60;color:#fff;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600;">PER_ASG_ DBIs</span>

<span style="background:#8e44ad;color:#fff;padding:5px 12px;border-radius:4px;font-size:12px;font-weight:600;">Single RETURN accrual</span>

</div>

</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">If I had accidentally chosen <b>Compensation Person Selection</b> instead, none of the absence-specific inputs (IV_ACCRUAL, IV_ACCRUALPERIODSTARTDATE, etc.) would be available, the formula couldn't attach to an absence plan, and the PER_ASG_ DBIs might behave differently due to different context availability.</p>

<div style="display:flex;gap:14px;background:#fff;border:1px solid #e0dcd6;border-radius:6px;padding:22px;margin:24px 0;align-items:flex-start;">

<div style="font-size:22px;flex-shrink:0;">⚠️</div>

<div>

<div style="font-size:15px;font-weight:700;margin:0 0 6px;">The Trap</div>

<div style="font-size:14px;color:#666;margin:0;line-height:1.6;">The formula editor will let you create and compile a formula under the wrong type with zero errors. It only breaks when you try to attach it or run the process. By then you've wasted hours debugging something that was wrong from step one.</div>

</div>

</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== SECTION 2 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Contexts in Action: How Our Formula Knows "Whose" Data to Fetch</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Look at this line from our accrual formula:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">l_hire_date = PER_ASG_REL_ORIGINAL_DATE_OF_HIRE</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">This DBI returns a hire date — but <i>whose</i> hire date? The answer is: whoever the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HR_ASSIGNMENT_ID</code> context points to.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">When the absence accrual process runs for 500 employees, it calls this formula 500 times. Each time, it sets a different HR_ASSIGNMENT_ID context. The DBI automatically returns that specific employee's hire date. You never write SQL — the context-route-DBI chain handles it.</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* We also retrieved context values directly: */</span>

l_person_id     = <span style="color:#6cacec;">GET_CONTEXT</span>(PERSON_ID, 0)

l_assignment_id = <span style="color:#6cacec;">GET_CONTEXT</span>(HR_ASSIGNMENT_ID, 0)

<span style="color:#6b8e6b;font-style:italic;">/* These DBIs work BECAUSE the context is set: */</span>

l_hire_date  = PER_ASG_REL_ORIGINAL_DATE_OF_HIRE

l_term_date  = PER_ASG_REL_ACTUAL_TERMINATION_DATE

l_asg_status = PER_ASG_STATUS_USER_STATUS</pre>

<div style="margin:28px 0;padding:22px 25px 22px 28px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">

No context = no data. If HR_ASSIGNMENT_ID isn't set as a context for your formula type, PER_ASG_ DBIs will fail at runtime. This is why the formula type matters — it determines which contexts are available, which determines which DBIs work.

</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== SECTION 3 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Input Values: What the Accrual Engine Passes to Our Formula</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's the INPUTS ARE block from our formula:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#e67e22;">INPUTS ARE</span>

  IV_ACCRUAL,

  IV_CARRYOVER,

  IV_CEILING,

  IV_ACCRUAL_CEILING,

  IV_ACCRUALPERIODSTARTDATE        (<span style="color:#e67e22;">DATE</span>),

  IV_ACCRUALPERIODENDDATE          (<span style="color:#e67e22;">DATE</span>),

  IV_CALENDARSTARTDATE             (<span style="color:#e67e22;">DATE</span>),

  IV_CALENDARENDDATE               (<span style="color:#e67e22;">DATE</span>),

  IV_PLANENROLLMENTSTARTDATE       (<span style="color:#e67e22;">DATE</span>),

  IV_PLANENROLLMENTENDDATE         (<span style="color:#e67e22;">DATE</span>),

  IV_EVENT_DATES                   (<span style="color:#e67e22;">DATE_NUMBER</span>),

  IV_ACCRUAL_VALUES                (<span style="color:#e67e22;">NUMBER_NUMBER</span>)</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">These aren't random — they're defined in the Oracle FF Reference Guide (pages 16-17) specifically for the Absence Accrual Matrix formula type. The accrual engine populates them automatically at runtime.</p>

<table style="width:100%;border-collapse:collapse;font-size:14px;margin:20px 0;">

<tr><th style="background:#2d2926;color:#f5ebe0;padding:12px 16px;text-align:left;">Input Value</th><th style="background:#2d2926;color:#f5ebe0;padding:12px 16px;text-align:left;">What Our Formula Does With It</th></tr>

<tr><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IV_ACCRUAL</code></td><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;">Matrix engine's pre-calculated value — <b>we completely override it</b> with our own logic</td></tr>

<tr><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IV_ACCRUALPERIODSTARTDATE</code></td><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;">Used to determine which month we're processing and calculate months of service</td></tr>

<tr><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IV_ACCRUALPERIODENDDATE</code></td><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;">End of current period — critical for the MONTHS_BETWEEN calculation</td></tr>

<tr><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IV_PLANENROLLMENTSTARTDATE</code></td><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;">When the employee enrolled — used in eligibility checks</td></tr>

<tr><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IV_EVENT_DATES</code></td><td style="padding:10px 16px;border-bottom:1px solid #e0dcd6;">Array type — declared but not used in our logic (still must be declared)</td></tr>

</table>

<div style="display:flex;gap:14px;background:#fff;border:1px solid #e0dcd6;border-radius:6px;padding:22px;margin:24px 0;align-items:flex-start;">

<div style="font-size:22px;flex-shrink:0;">💡</div>

<div>

<div style="font-size:15px;font-weight:700;margin:0 0 6px;">Same Formula Type, Different Inputs</div>

<div style="font-size:14px;color:#666;margin:0;line-height:1.6;">If the same formula type is used by a different process (like a different absence plan configuration), the input values may differ. Always check the FF Reference Guide for <b>your specific process</b>, not just the formula type.</div>

</div>

</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== SECTION 4 ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">DEFAULTs: What Happens When Data Doesn't Exist</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Every DBI and input value in our formula has a DEFAULT. This isn't optional — it's the difference between a working formula and a runtime crash:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* What if the employee has no termination date? */</span>

<span style="color:#e67e22;">DEFAULT FOR</span> PER_ASG_REL_ACTUAL_TERMINATION_DATE 

  <span style="color:#e67e22;">IS</span> <span style="color:#8bc48b;">'4712/12/31 00:00:00'</span> (date)

<span style="color:#6b8e6b;font-style:italic;">/* What if the matrix engine sends no accrual value? */</span>

<span style="color:#e67e22;">DEFAULT FOR</span> IV_ACCRUAL <span style="color:#e67e22;">IS</span> 0

<span style="color:#6b8e6b;font-style:italic;">/* What if assignment status DBI returns nothing? */</span>

<span style="color:#e67e22;">DEFAULT FOR</span> PER_ASG_STATUS_USER_STATUS <span style="color:#e67e22;">IS</span> <span style="color:#8bc48b;">'NA'</span></pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">In our formula, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">4712/12/31</code> default for termination date is clever — later in the logic, we check if <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_term_date = TO_DATE('4712/12/31...')</code> to determine "is this person active?" If they are active, the DBI returns empty, the DEFAULT kicks in with 4712, and our check correctly identifies them as active.</p>

<div style="margin:28px 0;padding:22px 25px 22px 28px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">

DEFAULTs aren't just safety nets — they're part of your business logic. Choose default values that make your downstream conditions work correctly, not just arbitrary placeholders.

</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== WRITE vs VALIDATE ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Write Formulas vs. Validate Formulas</div>

<p style="font-size:16px;margin-bottom:24px;color:#2a2a2a;">All Fast Formulas do one of two things:</p>

<div style="padding:20px 0;border-top:2px solid #1a1a1a;border-bottom:1px solid #e0dcd6;margin-bottom:16px;">

<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Write Formula</div>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:6px;">Calculates and returns a value</div>

<div style="font-size:15px;color:#555;line-height:1.6;">Our PH accrual formula returns a number — 0, 1.25, or 15 — depending on months of service. Other examples: Total Compensation Items, Salary calculations.</div>

</div>

<div style="padding:20px 0;border-bottom:2px solid #1a1a1a;margin-bottom:24px;">

<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Validate Formula</div>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:6px;">Checks a condition and returns Y or N</div>

<div style="font-size:15px;color:#555;line-height:1.6;">Should this person be included? Is this employee eligible? Examples: Person Selection, Benefits Eligibility, Participation Rules.</div>

</div>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* Write — returns a number */</span>

<span style="color:#e67e22;">RETURN</span> accrual  <span style="color:#6b8e6b;">/* 0, 1.25, or 15 */</span>

<span style="color:#6b8e6b;font-style:italic;">/* Validate — returns Y or N */</span>

<span style="color:#e67e22;">RETURN</span> l_value  <span style="color:#6b8e6b;">/* 'Y' or 'N' */</span></pre>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/><!-- ==================== COLUMN TRAP ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">The Column Trap: Why Your Formula Doesn't Show Up</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;line-height:1.8;">You wrote a formula. It compiled. Green checkmark. But when you go to attach it to a setup field — it's not in the dropdown. You search, refresh, recompile. Nothing.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;line-height:1.8;">The reason: every formula has a <b>type</b>, and every setup field expects a <b>specific type</b>. If they don't match — the formula simply won't appear. No error, no warning. It's just invisible.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;line-height:1.8;"><b>A real mistake I've seen:</b></p>

<p style="font-size:16px;margin-bottom:24px;color:#2a2a2a;line-height:1.8;">A consultant needed to write an absence accrual formula. They went to the formula editor and accidentally selected <b>Absence Accrual</b> instead of <b>Absence Accrual Matrix</b>. Two very similar-sounding types — but different.</p>

<div style="background:#fdedec;border-radius:8px;padding:20px;margin:0 0 12px 0;">

<div style="font-size:15px;color:#1a1a1a;line-height:1.7;">

<b>What happened:</b> The formula compiled fine. No errors. But when they went to the Absence Plan → Accrual Matrix Formula field — their formula was not in the dropdown. The field expected <b>Absence Accrual Matrix</b>. The formula was created as <b>Absence Accrual</b>. Close — but not the same type.

</div>

</div>

<div style="background:#eafaf1;border-radius:8px;padding:20px;margin:0 0 24px 0;">

<div style="font-size:15px;color:#1a1a1a;line-height:1.7;">

<b>The fix:</b> They recreated the formula under the correct type — <b>Absence Accrual Matrix</b>. Same code, same logic. Now it appeared instantly.

</div>

</div>

<div style="margin:28px 0;padding:22px 25px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">

If your formula isn't showing up in a dropdown, it's almost always the wrong type. You can't change a formula's type after creation — the fix is to create a new formula under the correct type.

</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== CREATING AND COMPILING ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Creating and Compiling: The Step-by-Step</div>

<p style="font-size:16px;margin-bottom:24px;color:#2a2a2a;">Here's how I created the PH accrual formula.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 12px;">Step 1 — Navigate</div>

<p style="font-size:15px;color:#2a2a2a;line-height:1.7;margin-bottom:20px;">Go to <b>Setup and Maintenance</b>, search for <b>"Fast Formulas"</b>, and open the Fast Formulas task.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 16px;">Step 2 — Fill in the header</div>

<div style="margin:16px 0 24px;">

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:40%;font-size:14px;font-weight:700;color:#1a1a1a;">Formula Type</div>

<div style="width:60%;font-size:14px;color:#555;">Absence Accrual Matrix Formula</div>

</div>

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:40%;font-size:14px;font-weight:700;color:#1a1a1a;">Name</div>

<div style="width:60%;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PH_VACATION_LEAVE_ACCRUAL_MATRIX</code></div>

</div>

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:40%;font-size:14px;font-weight:700;color:#1a1a1a;">LDG</div>

<div style="width:60%;font-size:14px;color:#555;"><b>Required</b> — Absence formulas need LDG</div>

</div>

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:40%;font-size:14px;font-weight:700;color:#1a1a1a;">Effective Date</div>

<div style="width:60%;font-size:14px;color:#555;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">01/01/2000</code> — far past for safety</div>

</div>

</div>

<p style="font-size:14px;color:#888;line-height:1.6;margin-bottom:24px;"><b>Why a far-past date?</b> If the absence process runs for a past period (Jan 2024) but the formula was created with today's date, it won't be found. Using 01/01/2000 ensures it's always available.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 16px;">Step 3 — Save, Submit, Compile</div>

<div style="margin:16px 0 24px;">

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:30px;font-size:14px;font-weight:700;color:#c0392b;flex-shrink:0;">01</div>

<div style="font-size:15px;color:#2a2a2a;"><b>Save</b> — stores the formula, still editable</div>

</div>

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:30px;font-size:14px;font-weight:700;color:#c0392b;flex-shrink:0;">02</div>

<div style="font-size:15px;color:#2a2a2a;"><b>Submit</b> — locks the formula for compilation</div>

</div>

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:30px;font-size:14px;font-weight:700;color:#c0392b;flex-shrink:0;">03</div>

<div style="font-size:15px;color:#2a2a2a;"><b>Compile</b> — triggers an ESS background job</div>

</div>

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:30px;font-size:14px;font-weight:700;color:#c0392b;flex-shrink:0;">04</div>

<div style="font-size:15px;color:#2a2a2a;">Check status — green means ready, red means fix errors</div>

</div>

</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== LDG ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">LDG: When You Need It and When You Don't</div>

<p style="font-size:16px;margin-bottom:20px;color:#2a2a2a;">Our PH formula required an LDG because Absence formulas are country-specific. Here's the general rule:</p>

<div style="margin:16px 0 24px;">

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:40%;font-size:14px;font-weight:700;color:#1a1a1a;">LDG Required</div>

<div style="width:60%;font-size:14px;color:#555;"><b>Absence</b> and <b>Payroll</b> — anything touching country-specific legislation</div>

</div>

<div style="display:flex;padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="width:40%;font-size:14px;font-weight:700;color:#1a1a1a;">LDG Optional</div>

<div style="width:60%;font-size:14px;color:#555;"><b>Compensation</b> and <b>Benefits</b> — if skipped, formula becomes global</div>

</div>

</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== WORKFLOW ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">The Complete Workflow</div>

<p style="font-size:16px;margin-bottom:20px;color:#2a2a2a;">Every formula follows this path from idea to production:</p>

<p style="font-size:15px;color:#2a2a2a;line-height:2.2;">

<span style="font-weight:700;color:#c0392b;">Identify the correct Type</span><br/>

<span style="color:#888;">↓</span><br/>

<span style="font-weight:700;color:#c0392b;">Check if LDG is required</span><br/>

<span style="color:#888;">↓</span><br/>

<span style="font-weight:700;color:#c0392b;">Write the formula code</span> — DEFAULTs, INPUTS ARE, logic, RETURN<br/>

<span style="color:#888;">↓</span><br/>

<span style="font-weight:700;color:#c0392b;">Save → Submit → Compile</span> — wait for green status<br/>

<span style="color:#888;">↓</span><br/>

<span style="font-weight:700;color:#c0392b;">Verify attachment</span> — confirm the formula appears in the correct setup field

</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== KEY TAKEAWAYS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Key Takeaways</div>

<p style="font-size:14px;color:#888;margin-bottom:18px;">What our PH Accrual Formula taught us:</p>

<div style="margin:16px 0;">

<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Formula Type shapes everything</b> — Absence Accrual Matrix gave us IV_ACCRUAL, period dates, and PER_ASG_ DBIs</div>

</div>

<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Contexts make DBIs work</b> — PER_ASG_REL_ORIGINAL_DATE_OF_HIRE only returns the right data because HR_ASSIGNMENT_ID tells it whose data to fetch</div>

</div>

<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">DEFAULTs are business logic</b> — 4712/12/31 isn't arbitrary, it's how we detect active employees</div>

</div>

<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">

<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">The Column Trap is real</b> — wrong type means formula compiles but never shows up where you need it</div>

</div>

<div style="padding:14px 0;">

<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Absence formulas need LDG</b> — country-specific formulas require Legislative Data Group, Compensation doesn't</div>

</div>

</div>

<p style="font-size:16px;margin-top:24px;margin-bottom:18px;color:#2a2a2a;">Want to see the full formula code with line-by-line explanation? Check out my detailed breakdown: <b>Breaking Down a PH Vacation Leave Accrual Matrix Formula — Section by Section</b>.</p>

<!-- ==================== FOOTER ==================== -->

<div style="display:flex;align-items:center;gap:16px;padding-top:25px;border-top:2px solid #1a1a1a;margin-top:40px;">

<div style="width:65px;height:65px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:22px;flex-shrink:0;">AM</div>

<div>

<div style="font-size:18px;font-weight:700;">Abhishek Mohanty</div>

<div style="font-size:14px;color:#666;line-height:1.6;">Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Core HR, Redwood, HDL, OTBI.</div>

</div>

</div>

</div>