---
title: "Oracle Fast Formula: NULL Doesn't Exist — Use WAS DEFAULTED"
pubDate: 2026-03-22
description: "Oracle Fast Formula: NULL Doesn't Exist — Use WAS DEFAULTED"
tags: ["Fast Formula", "Null Handling", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>There Is No NULL in Oracle Fast Formula — And Here's What You Use Instead</title>
</head>
<body style="margin:0;padding:24px 16px;background:#fdfdfd;">

<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.8;max-width:780px;margin:0 auto;">

<span style="display:inline-block;background:#c0392b;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Fast Formula</span>
<span style="display:inline-block;background:#e67e22;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Fun Fact</span>
<span style="display:inline-block;background:#8e44ad;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">WAS DEFAULTED</span>
<span style="display:inline-block;background:#2c3e50;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Must Know</span>

<div style="font-size:28px;font-weight:800;color:#1a1a1a;margin:20px 0 6px;line-height:1.3;">There Is No NULL in Oracle Fast Formula — And Here's What You Use Instead</div>

<div style="font-size:13px;color:#888;margin-bottom:25px;letter-spacing:0.5px;">March 19, 2026 • 5 min read • Oracle HCM Cloud</div>

<div style="font-size:16px;color:#555;line-height:1.7;margin-bottom:30px;font-style:italic;border-left:4px solid #b08d57;padding-left:18px;">
A big shoutout to Mr. Scott Klein — who, after reading my Fast Formula blog series, pointed out a concept that every developer searches for but never finds in the docs: how to check for NULL. This one's inspired by that conversation.
</div>

<div style="display:flex;align-items:center;gap:14px;padding:20px 0;border-top:2px solid #1a1a1a;border-bottom:2px solid #1a1a1a;margin-bottom:35px;">
<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0;">AM</div>
<div>
<div style="font-weight:700;font-size:15px;">Abhishek Mohanty</div>
<div style="font-size:13px;color:#888;">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant</div>
</div>
</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== THE PROBLEM ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">The Problem Every Developer Runs Into</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">You come from SQL, PL/SQL, Java, or Python. You need to check if an employee has a termination date. You try everything you know:</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">Background</th>
<th style="padding:10px 14px;text-align:left;">What you try</th>
<th style="padding:10px 14px;text-align:center;">Result</th>
</tr></thead>
<tbody>
<tr style="background:#fafafa;border-bottom:1px solid #eee;">
<td style="padding:10px 14px;">SQL</td>
<td style="padding:10px 14px;font-family:monospace;font-size:13px;">IF l_term_date IS NULL THEN</td>
<td style="padding:10px 14px;text-align:center;color:#b05a5a;font-weight:600;">✘ Compile Error</td>
</tr>
<tr style="background:#fafafa;border-bottom:1px solid #eee;">
<td style="padding:10px 14px;">PL/SQL</td>
<td style="padding:10px 14px;font-family:monospace;font-size:13px;">IF l_term_date = NULL THEN</td>
<td style="padding:10px 14px;text-align:center;color:#b05a5a;font-weight:600;">✘ Compile Error</td>
</tr>
<tr style="background:#fafafa;border-bottom:1px solid #eee;">
<td style="padding:10px 14px;">Java</td>
<td style="padding:10px 14px;font-family:monospace;font-size:13px;">IF (l_term_date == null)</td>
<td style="padding:10px 14px;text-align:center;color:#b05a5a;font-weight:600;">✘ Compile Error</td>
</tr>
<tr style="background:#fafafa;border-bottom:1px solid #eee;">
<td style="padding:10px 14px;">Guess</td>
<td style="padding:10px 14px;font-family:monospace;font-size:13px;">IF l_term_date IS EMPTY</td>
<td style="padding:10px 14px;text-align:center;color:#b05a5a;font-weight:600;">✘ Compile Error</td>
</tr>
<tr style="background:#fff8ec;">
<td style="padding:10px 14px;">Guess</td>
<td style="padding:10px 14px;font-family:monospace;font-size:13px;">IF l_grade_name = ''</td>
<td style="padding:10px 14px;text-align:center;color:#b07a2e;font-weight:600;">⚠ Compiles — but never matches</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">You Google "fast formula null check" — and find nothing useful.</p>

<!-- TWEAK 1: Fun Fact callout — scoped claim, no longer denies the concept -->
<div style="background:#f5f8fc;border-left:4px solid #6b8fad;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;">
<p style="margin:0;font-size:15px;color:#1a1a1a;"><strong>Fun Fact:</strong> There is no NULL <em>keyword</em> in Oracle Fast Formula. You can't write <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IF x IS NULL</code> or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">x = NULL</code>. And for DBIs declared with <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DEFAULT FOR</code>, the engine never lets you see a null — it substitutes the default instead.</p>
</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== HOW FF HANDLES MISSING DATA ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">How Fast Formula Handles Missing Data</div>

<!-- TWEAK 2: scoped to DBIs declared with DEFAULT FOR -->
<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The database absolutely has null values. An employee might not have a termination date, a grade, or a location. For DBIs declared with <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DEFAULT FOR</code>, Fast Formula never lets you see the null directly — it uses a two-step mechanism instead:</p>

<!-- VISUAL FLOW -->

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">How the Fast Formula engine handles NULL — step by step</div>

<!-- VISUAL: PIPELINE DIAGRAM -->
<div style="margin:24px 0;font-size:14px;">

<!-- ROW 1: DATABASE -->
<div style="display:flex;align-items:stretch;margin-bottom:0;">
<div style="width:60px;display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
<span style="background:#d4726a;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">1</span>
<div style="width:3px;flex:1;background:#d4726a;margin-top:4px;"></div>
</div>
<div style="flex:1;background:#fdf2f2;border:1px solid #ddd;border-radius:8px;padding:16px 20px;margin-bottom:0;">
<div style="font-weight:800;color:#8b4049;font-size:16px;margin-bottom:8px;">DATABASE</div>
<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
<span style="background:#282C34;color:#ABB2BF;font-family:monospace;padding:6px 14px;border-radius:4px;font-size:13px;"><span style="color:#C678DD;">SELECT</span> <span style="color:#E06C75;">termination_date</span> <span style="color:#C678DD;">FROM</span> <span style="color:#56B6C2;">per_all_assignments</span></span>
<span style="font-size:18px;">→</span>
<span style="background:#d4726a;color:#fff;padding:6px 14px;border-radius:4px;font-weight:600;font-size:13px;">NULL</span>
</div>
</div>
</div>

<!-- ARROW 1→2 -->
<div style="display:flex;align-items:stretch;">
<div style="width:60px;display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
<div style="width:3px;height:28px;background:#b08d57;"></div>
</div>
<div style="flex:1;padding:4px 20px;">
<span style="color:#888;font-size:12px;font-style:italic;">▼ Engine intercepts the null before your formula sees it</span>
</div>
</div>

<!-- ROW 2: ENGINE -->
<div style="display:flex;align-items:stretch;margin-bottom:0;">
<div style="width:60px;display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
<span style="background:#b08d57;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">2</span>
<div style="width:3px;flex:1;background:#b08d57;margin-top:4px;"></div>
</div>
<div style="flex:1;background:#fef9e7;border:1px solid #ddd;border-radius:8px;padding:16px 20px;margin-bottom:0;">
<div style="font-weight:800;color:#8a7340;font-size:16px;margin-bottom:8px;">FAST FORMULA ENGINE</div>
<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
<span style="background:#d4726a;color:#fff;padding:4px 10px;border-radius:4px;font-weight:600;font-size:12px;">NULL</span>
<span style="font-size:14px;">→ replaced with →</span>
<span style="background:#b08d57;color:#fff;padding:4px 10px;border-radius:4px;font-weight:600;font-size:12px;">31-Dec-4712</span>
</div>
<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
<span style="font-size:13px;">Internal flag set:</span>
<span style="background:#f5f0e8;color:#b08d57;padding:4px 10px;border-radius:4px;font-family:monospace;font-weight:700;font-size:12px;">⚑ DEFAULTED = TRUE</span>
</div>
</div>
</div>

<!-- ARROW 2→3 -->
<div style="display:flex;align-items:stretch;">
<div style="width:60px;display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
<div style="width:3px;height:28px;background:#2d6a4f;"></div>
</div>
<div style="flex:1;padding:4px 20px;">
<span style="color:#888;font-size:12px;font-style:italic;">▼ Your formula receives the default value — never sees null</span>
</div>
</div>

<!-- ROW 3: YOUR FORMULA -->
<div style="display:flex;align-items:stretch;">
<div style="width:60px;display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
<span style="background:#2d6a4f;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">3</span>
</div>
<div style="flex:1;background:#f5faf5;border:1px solid #ddd;border-radius:8px;padding:16px 20px;">
<div style="font-weight:800;color:#2d6a4f;font-size:16px;margin-bottom:8px;">YOUR FORMULA</div>
<div style="background:#282C34;border-radius:6px;padding:12px 16px;font-family:monospace;font-size:14.5px;line-height:1.8;margin-bottom:10px;">
<span style="color:#C678DD;">IF</span> <span style="color:#56B6C2;">PER_ASG_TERMINATION_DATE</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">THEN</span><br>
<span style="color:#7C9C5A;">  /* Engine checks flag → TRUE → database had null */</span>
</div>
<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
<span style="font-size:13px;color:#2d6a4f;">Result:</span>
<span style="background:#2d6a4f;color:#fff;padding:4px 10px;border-radius:4px;font-weight:600;font-size:12px;">TRUE</span>
<span style="font-size:13px;color:#2d6a4f;">→ you now know the database had null</span>
</div>
</div>
</div>

</div>

<!-- SIDE-BY-SIDE: ACTIVE vs TERMINATED -->
<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">Two Scenarios, Same Formula</div>

<div style="display:flex;gap:20px;margin:18px 0;flex-wrap:wrap;">

<!-- ACTIVE -->
<div style="flex:1;min-width:300px;border-radius:10px;overflow:hidden;border:1px solid #b8d4b8;border-left:4px solid #3d7a52;">
<div style="background:#dceede;padding:14px 20px;text-align:center;border-bottom:1px solid #b8d4b8;">
<div style="font-weight:800;font-size:16px;color:#1e5035;letter-spacing:1px;">ACTIVE EMPLOYEE</div>
<div style="font-size:11px;color:#5a8a65;">No termination date in the database</div>
</div>
<div style="padding:18px;background:#fafdf9;">

<div style="background:#edf5ed;border-radius:6px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
<span style="font-size:12px;color:#555;font-weight:700;">DATABASE</span>
<span style="background:#c25a5a;color:#fff;padding:3px 12px;border-radius:12px;font-family:monospace;font-size:12px;font-weight:700;">NULL</span>
</div>

<div style="text-align:center;margin:6px 0;">
<div style="width:1px;height:12px;background:#ccc;margin:0 auto;"></div>
<span style="font-size:10px;color:#888;font-weight:700;">ENGINE REPLACES</span>
<div style="width:1px;height:12px;background:#ccc;margin:0 auto;"></div>
</div>

<div style="background:#edf5ed;border-radius:6px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
<span style="font-size:12px;color:#555;font-weight:700;">FORMULA SEES</span>
<span style="background:#9a7830;color:#fff;padding:4px 14px;border-radius:12px;font-family:monospace;font-size:12px;font-weight:700;">31-Dec-4712</span>
</div>

<div style="background:#f5f5f0;border-radius:6px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
<span style="font-size:12px;color:#666;font-weight:700;">INTERNAL FLAG</span>
<span style="color:#b08d57;font-family:monospace;font-size:12px;font-weight:700;">⚑ DEFAULTED = TRUE</span>
</div>

<div style="background:#edf5ed;border-radius:6px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;">
<span style="font-size:14px;color:#2d6a4f;font-weight:800;">WAS DEFAULTED?</span>
<span style="background:#1e5035;color:#fff;padding:6px 18px;border-radius:16px;font-weight:800;font-size:13px;">TRUE ✔</span>
</div>

</div>
</div>

<!-- TERMINATED -->
<div style="flex:1;min-width:300px;border-radius:10px;overflow:hidden;border:1px solid #d6c3c3;border-left:4px solid #a05050;">
<div style="background:#f0e4e4;padding:14px 20px;text-align:center;border-bottom:1px solid #d6c3c3;">
<div style="font-weight:800;font-size:16px;color:#7a2e38;letter-spacing:1px;">TERMINATED EMPLOYEE</div>
<div style="font-size:11px;color:#996666;">Real termination date exists</div>
</div>
<div style="padding:18px;background:#fdfafa;">

<div style="background:#f5eaea;border-radius:6px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
<span style="font-size:12px;color:#555;font-weight:700;">DATABASE</span>
<span style="background:#3b4f5e;color:#fff;padding:3px 12px;border-radius:12px;font-family:monospace;font-size:12px;font-weight:700;">15-Aug-2025</span>
</div>

<div style="text-align:center;margin:6px 0;">
<div style="width:1px;height:12px;background:#ccc;margin:0 auto;"></div>
<span style="font-size:10px;color:#888;font-weight:700;">REAL VALUE — NO REPLACEMENT</span>
<div style="width:1px;height:12px;background:#ccc;margin:0 auto;"></div>
</div>

<div style="background:#fafafa;border-radius:6px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
<span style="font-size:12px;color:#666;font-weight:700;">FORMULA SEES</span>
<span style="background:#3b4f5e;color:#fff;padding:4px 14px;border-radius:12px;font-family:monospace;font-size:12px;font-weight:700;">15-Aug-2025</span>
</div>

<div style="background:#fafafa;border-radius:6px;padding:10px 14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
<span style="font-size:12px;color:#666;font-weight:700;">INTERNAL FLAG</span>
<span style="color:#aaa;font-family:monospace;font-size:12px;font-weight:600;">DEFAULTED = FALSE</span>
</div>

<div style="background:#f5f0f0;border-radius:6px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;">
<span style="font-size:14px;color:#8b4049;font-weight:800;">WAS DEFAULTED?</span>
<span style="background:#7a2e38;color:#fff;padding:6px 18px;border-radius:16px;font-weight:800;font-size:13px;">FALSE ✘</span>
</div>

</div>
</div>

</div>

<!-- TRANSLATION TABLE -->

<!-- TWEAK 3: scoped to DBIs and input values -->
<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Here's the mental model for DBIs and input values — translate what you know into what Fast Formula uses:</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">In SQL / PL/SQL</th>
<th style="padding:10px 14px;text-align:left;">In Fast Formula</th>
</tr></thead>
<tbody>
<tr style="background:#fafafa;border-bottom:1px solid #eee;">
<td style="padding:10px 14px;font-family:monospace;font-size:13px;color:#8b4049;">✘ IF x IS NULL</td>
<td style="padding:10px 14px;font-family:monospace;font-size:13px;color:#2d6a4f;">IF x WAS DEFAULTED ✔</td>
</tr>
<tr style="background:#fdf2f2;">
<td style="padding:10px 14px;font-family:monospace;font-size:13px;color:#8b4049;">✘ IF x IS NOT NULL</td>
<td style="padding:10px 14px;font-family:monospace;font-size:13px;color:#2d6a4f;">IF NOT x WAS DEFAULTED ✔</td>
</tr>
</tbody></table>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== REAL EXAMPLE ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Real Example: Is This Employee Terminated?</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">In absence accrual formulas, you need to check if the employee is still active. An active employee has no termination date in the database — that column is null. Here's how you check:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#7C9C5A;">/* Step 1: Declare a default for the termination date DBI.</span>
<span style="color:#7C9C5A;">   If the database has null, the engine will use this date. */</span>
<span style="color:#C678DD;">DEFAULT</span> <span style="color:#C678DD;">FOR</span> <span style="color:#56B6C2;">PER_ASG_TERMINATION_DATE</span> <span style="color:#C678DD;">IS</span> <span style="color:#E5C07B;">'4712/12/31 00:00:00'</span> (<span style="color:#C678DD;">date</span>)

<span style="color:#7C9C5A;">/* Step 2: Read the DBI. If the employee has no termination</span>
<span style="color:#7C9C5A;">   date, l_term_date will silently become 31-Dec-4712. */</span>
<span style="color:#E06C75;">l_term_date</span> = <span style="color:#56B6C2;">PER_ASG_TERMINATION_DATE</span>

<span style="color:#7C9C5A;">/* Step 3: Check if it WAS DEFAULTED (= database had null) */</span>
<span style="color:#C678DD;">IF</span> <span style="color:#56B6C2;">PER_ASG_TERMINATION_DATE</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">THEN</span>
(
    <span style="color:#7C9C5A;">/* No termination date exists → employee is ACTIVE */</span>
    <span style="color:#E06C75;">l_debug</span> = <span style="color:#61AFEF;">ESS_LOG_WRITE</span>(<span style="color:#E5C07B;">'Employee is active (no term date)'</span>)
    <span style="color:#E06C75;">l_process</span> = <span style="color:#E5C07B;">'Y'</span>
)
<span style="color:#C678DD;">ELSE</span>
(
    <span style="color:#7C9C5A;">/* Real termination date exists → employee IS terminated */</span>
    <span style="color:#E06C75;">l_debug</span> = <span style="color:#61AFEF;">ESS_LOG_WRITE</span>(<span style="color:#E5C07B;">'Terminated: '</span>
              || <span style="color:#61AFEF;">TO_CHAR</span>(<span style="color:#E06C75;">l_term_date</span>, <span style="color:#E5C07B;">'DD-MON-YYYY'</span>))
    <span style="color:#E06C75;">l_process</span> = <span style="color:#E5C07B;">'N'</span>
)</pre>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== INPUT VALUES ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">It Works on Input Values Too</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">WAS DEFAULTED isn't limited to DBIs. It also works on input values — useful when the calling process doesn't always pass every input:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#C678DD;">DEFAULT</span> <span style="color:#C678DD;">FOR</span> <span style="color:#56B6C2;">IV_OVERRIDE_AMOUNT</span> <span style="color:#C678DD;">IS</span> <span style="color:#D19A66;">0</span>

<span style="color:#C678DD;">INPUTS</span> <span style="color:#C678DD;">ARE</span> <span style="color:#56B6C2;">IV_OVERRIDE_AMOUNT</span>

<span style="color:#C678DD;">IF</span> <span style="color:#56B6C2;">IV_OVERRIDE_AMOUNT</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">THEN</span>
(
    <span style="color:#7C9C5A;">/* No override passed → use the calculated value */</span>
    <span style="color:#E06C75;">accrual</span> = <span style="color:#E06C75;">l_calculated_accrual</span>
)
<span style="color:#C678DD;">ELSE</span>
(
    <span style="color:#7C9C5A;">/* Override was explicitly passed → use it */</span>
    <span style="color:#E06C75;">accrual</span> = <span style="color:#56B6C2;">IV_OVERRIDE_AMOUNT</span>
)</pre>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Without WAS DEFAULTED, you couldn't distinguish between "the process passed 0 as the override" and "the process didn't pass an override at all." Both would show as 0 in the formula. WAS DEFAULTED tells you which case you're in.</p>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== HOW TO CHECK IS NOT NULL ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">How to Check "IS NOT NULL" — The NOT Operator</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Checking for null is one thing. But in most formulas, you actually want to check the opposite: <strong>"does this DBI have a real value?"</strong> — the equivalent of SQL's <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IF x IS NOT NULL</code>.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Oracle's documentation confirms that you can combine conditions using the logical operators <strong>AND, OR, NOT</strong>. From the <strong>Oracle FastFormula User Guide</strong>:</p>

<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:16px 20px;margin:18px 0;">
<p style="font-size:14px;margin:0;color:#2a2a2a;border-left:3px solid #2980b9;padding-left:14px;"><em>"You can combine conditions using the logical operators AND, OR, NOT. Use NOT if you want an action to occur when a condition is not true."</em></p>
</div>

<!-- VISUAL: WAS DEFAULTED vs NOT WAS DEFAULTED -->

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">WAS DEFAULTED vs NOT WAS DEFAULTED — Visual</div>

<div style="display:flex;gap:20px;margin:18px 0;flex-wrap:wrap;">

<!-- IS NULL CARD -->
<div style="flex:1;min-width:300px;border-radius:10px;overflow:hidden;border:1px solid #d6c3c3;border-left:4px solid #a05050;">
<div style="background:#f0e4e4;padding:14px 20px;text-align:center;border-bottom:1px solid #d6c3c3;">
<div style="font-weight:800;font-size:16px;color:#7a2e38;letter-spacing:1px;">IS NULL</div>
<div style="font-size:11px;color:#996666;">Database had no value</div>
</div>
<div style="padding:18px;background:#fdfafa;">

<div style="background:#282C34;border-radius:6px;padding:10px 14px;font-family:monospace;font-size:14.5px;line-height:1.8;margin-bottom:14px;">
<span style="color:#C678DD;">IF</span> <span style="color:#56B6C2;">MY_DBI</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">THEN</span>
</div>

<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
<span style="font-size:12px;color:#666;font-weight:700;width:90px;">Database:</span>
<span style="background:#c25a5a;color:#fff;padding:4px 14px;border-radius:12px;font-family:monospace;font-size:12px;font-weight:700;">NULL</span>
</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
<span style="font-size:12px;color:#666;font-weight:700;width:90px;">Engine flag:</span>
<span style="background:#f0e4d8;color:#9a7030;padding:4px 14px;border-radius:12px;font-family:monospace;font-size:12px;font-weight:700;">⚑ DEFAULTED</span>
</div>
<div style="display:flex;align-items:center;gap:8px;">
<span style="font-size:12px;color:#666;font-weight:700;width:90px;">Condition:</span>
<span style="background:#7a2e38;color:#fff;padding:5px 16px;border-radius:16px;font-weight:800;font-size:13px;">TRUE → enters THEN</span>
</div>

</div>
</div>

<!-- IS NOT NULL CARD -->
<div style="flex:1;min-width:300px;border-radius:10px;overflow:hidden;border:1px solid #b8d4b8;border-left:4px solid #3d7a52;">
<div style="background:#dceede;padding:14px 20px;text-align:center;border-bottom:1px solid #b8d4b8;">
<div style="font-weight:800;font-size:16px;color:#1e5035;letter-spacing:1px;">IS NOT NULL</div>
<div style="font-size:11px;color:#5a8a65;">Database had a real value</div>
</div>
<div style="padding:18px;background:#fafdf9;">

<div style="background:#282C34;border-radius:6px;padding:10px 14px;font-family:monospace;font-size:14.5px;line-height:1.8;margin-bottom:14px;">
<span style="color:#C678DD;">IF</span> <span style="color:#C678DD;">NOT</span> <span style="color:#56B6C2;">MY_DBI</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">THEN</span>
</div>

<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
<span style="font-size:12px;color:#666;font-weight:700;width:90px;">Database:</span>
<span style="background:#3d7a52;color:#fff;padding:4px 14px;border-radius:12px;font-family:monospace;font-size:12px;font-weight:700;">Grade A</span>
</div>
<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
<span style="font-size:12px;color:#666;font-weight:700;width:90px;">Engine flag:</span>
<span style="background:#e8ede8;color:#7a9a80;padding:4px 14px;border-radius:12px;font-family:monospace;font-size:12px;font-weight:700;">NOT DEFAULTED</span>
</div>
<div style="display:flex;align-items:center;gap:8px;">
<span style="font-size:12px;color:#666;font-weight:700;width:90px;">Condition:</span>
<span style="background:#1e5035;color:#fff;padding:5px 16px;border-radius:16px;font-weight:800;font-size:13px;">TRUE → enters THEN</span>
</div>

</div>
</div>

</div>

<!-- SYNTAX TABLE -->
<p style="font-size:16px;margin:20px 0 14px;color:#2a2a2a;">Fast Formula supports two valid syntaxes for the NOT NULL check:</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#3b4f5e;color:#fff;">
<th style="padding:10px 14px;text-align:left;">Syntax</th>
<th style="padding:10px 14px;text-align:left;">Style</th>
<th style="padding:10px 14px;text-align:center;">Valid?</th>
</tr></thead>
<tbody>
<tr style="background:#edf5ed;border-bottom:1px solid #c8dcc8;">
<td style="padding:10px 14px;font-family:monospace;font-size:13px;font-weight:700;">IF NOT MY_DBI WAS DEFAULTED</td>
<td style="padding:10px 14px;">NOT operator before the DBI name</td>
<td style="padding:10px 14px;text-align:center;color:#1e5035;font-weight:700;">✔</td>
</tr>
<tr style="background:#e4f0e4;">
<td style="padding:10px 14px;font-family:monospace;font-size:13px;font-weight:700;">IF MY_DBI WAS NOT DEFAULTED</td>
<td style="padding:10px 14px;">WAS NOT DEFAULTED as one comparator</td>
<td style="padding:10px 14px;text-align:center;color:#1e5035;font-weight:700;">✔</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Both compile and both work. Use whichever reads more naturally to you.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">Real Example: Only Process Workers Who Have a Grade</div>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#C678DD;">DEFAULT</span> <span style="color:#C678DD;">FOR</span> <span style="color:#56B6C2;">PER_ASG_GRADE_NAME</span> <span style="color:#C678DD;">IS</span> <span style="color:#E5C07B;">'NO_GRADE'</span>

<span style="color:#E06C75;">l_grade</span> = <span style="color:#56B6C2;">PER_ASG_GRADE_NAME</span>

<span style="color:#7C9C5A;">/* IS NOT NULL check — only process if grade exists */</span>
<span style="color:#C678DD;">IF</span> <span style="color:#C678DD;">NOT</span> <span style="color:#56B6C2;">PER_ASG_GRADE_NAME</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">THEN</span>
(
    <span style="color:#7C9C5A;">/* Grade has a real value — process it */</span>
    <span style="color:#E06C75;">l_debug</span> = <span style="color:#61AFEF;">ESS_LOG_WRITE</span>(<span style="color:#E5C07B;">'Grade: '</span> || <span style="color:#E06C75;">l_grade</span>)
    <span style="color:#E06C75;">l_process</span> = <span style="color:#E5C07B;">'Y'</span>
)
<span style="color:#C678DD;">ELSE</span>
(
    <span style="color:#7C9C5A;">/* Grade is null in the database — skip */</span>
    <span style="color:#E06C75;">l_debug</span> = <span style="color:#61AFEF;">ESS_LOG_WRITE</span>(<span style="color:#E5C07B;">'No grade assigned — skipping'</span>)
    <span style="color:#E06C75;">l_process</span> = <span style="color:#E5C07B;">'N'</span>
)</pre>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">Real Example: Use Work-Relationship Hire Date, Fall Back to Enterprise Hire Date</div>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#C678DD;">DEFAULT</span> <span style="color:#C678DD;">FOR</span> <span style="color:#56B6C2;">PER_ASG_REL_ORIGINAL_DATE_OF_HIRE</span> <span style="color:#C678DD;">IS</span> <span style="color:#E5C07B;">'1900/01/01 00:00:00'</span> (<span style="color:#C678DD;">date</span>)
<span style="color:#C678DD;">DEFAULT</span> <span style="color:#C678DD;">FOR</span> <span style="color:#56B6C2;">PER_PERSON_ENTERPRISE_HIRE_DATE</span> <span style="color:#C678DD;">IS</span> <span style="color:#E5C07B;">'1900/01/01 00:00:00'</span> (<span style="color:#C678DD;">date</span>)

<span style="color:#7C9C5A;">/* Prefer work-relationship original hire date if it exists (IS NOT NULL) */</span>
<span style="color:#C678DD;">IF</span> <span style="color:#C678DD;">NOT</span> <span style="color:#56B6C2;">PER_ASG_REL_ORIGINAL_DATE_OF_HIRE</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">THEN</span>
(
    <span style="color:#E06C75;">l_anchor_date</span> = <span style="color:#56B6C2;">PER_ASG_REL_ORIGINAL_DATE_OF_HIRE</span>
    <span style="color:#E06C75;">l_debug</span> = <span style="color:#61AFEF;">ESS_LOG_WRITE</span>(<span style="color:#E5C07B;">'Using work-relationship original hire date'</span>)
)
<span style="color:#C678DD;">ELSE</span>
(
    <span style="color:#7C9C5A;">/* No work-relationship hire date — fall back to enterprise hire date */</span>
    <span style="color:#E06C75;">l_anchor_date</span> = <span style="color:#56B6C2;">PER_PERSON_ENTERPRISE_HIRE_DATE</span>
    <span style="color:#E06C75;">l_debug</span> = <span style="color:#61AFEF;">ESS_LOG_WRITE</span>(<span style="color:#E5C07B;">'Falling back to enterprise hire date'</span>)
)</pre>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">This is a common pattern in absence accrual formulas — the work-relationship original hire date isn't always populated (especially for migrated employees or post-Global Transfer scenarios), so you check if it has a real value before using it. If it's null (WAS DEFAULTED), fall back to the enterprise hire date.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">Combining NOT with AND / OR</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">You can combine <code>NOT WAS DEFAULTED</code> with other conditions using AND and OR:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#7C9C5A;">/* Only check the state if the DBI actually has data */</span>
<span style="color:#C678DD;">IF</span> (<span style="color:#C678DD;">NOT</span> <span style="color:#56B6C2;">PER_ASG_LOC_REGION2</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">AND</span>
    <span style="color:#56B6C2;">PER_ASG_LOC_REGION2</span> != <span style="color:#E5C07B;">'PR'</span> <span style="color:#C678DD;">AND</span>
    <span style="color:#56B6C2;">PER_ASG_LOC_REGION2</span> != <span style="color:#E5C07B;">'DC'</span>) <span style="color:#C678DD;">THEN</span>
(
    <span style="color:#E06C75;">eligible</span> = <span style="color:#E5C07B;">'Y'</span>
)</pre>

<!-- OPERATOR PRECEDENCE VISUAL -->
<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Oracle's docs note that <code>NOT</code> has the <strong>highest precedence</strong> among logical operators. Here's the evaluation order:</p>

<div style="display:flex;align-items:center;gap:0;margin:18px 0;flex-wrap:wrap;">
<div style="background:#3b4f5e;color:#fff;padding:12px 22px;border-radius:8px 0 0 8px;font-weight:800;font-size:14px;text-align:center;">
NOT<br><span style="font-size:10px;font-weight:400;opacity:0.7;">highest</span>
</div>
<div style="width:0;height:0;border-top:24px solid transparent;border-bottom:24px solid transparent;border-left:14px solid #3b4f5e;"></div>
<div style="background:#5a7080;color:#fff;padding:12px 22px;font-weight:800;font-size:14px;text-align:center;">
AND<br><span style="font-size:10px;font-weight:400;opacity:0.7;">second</span>
</div>
<div style="width:0;height:0;border-top:24px solid transparent;border-bottom:24px solid transparent;border-left:14px solid #5a7080;"></div>
<div style="background:#8299a8;color:#fff;padding:12px 22px;border-radius:0 8px 8px 0;font-weight:800;font-size:14px;text-align:center;">
OR<br><span style="font-size:10px;font-weight:400;opacity:0.7;">lowest</span>
</div>
</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">So <code>NOT PER_ASG_LOC_REGION2 WAS DEFAULTED AND ...</code> evaluates the NOT first, then the AND — which is exactly what we want.</p>

<!-- QUICK REFERENCE -->
<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">Quick Reference</div>

<div style="display:flex;gap:14px;margin:18px 0;flex-wrap:wrap;">

<div style="flex:1;min-width:200px;background:#f5eaea;border:1px solid #d6c0c0;border-top:3px solid #a05050;border-radius:10px;padding:18px;text-align:center;">
<div style="font-size:11px;color:#7a4a4a;margin-bottom:6px;letter-spacing:1px;font-weight:700;">SQL</div>
<div style="font-family:monospace;font-size:15px;font-weight:800;color:#7a2e38;margin-bottom:10px;">IF x IS NULL</div>
<div style="margin:8px 0;">
<span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#d6c0c0;line-height:28px;font-size:13px;color:#7a2e38;font-weight:700;">↓</span>
</div>
<div style="font-size:11px;color:#3d6a50;margin-bottom:6px;letter-spacing:1px;font-weight:700;">FAST FORMULA</div>
<div style="font-family:monospace;font-size:15px;font-weight:800;color:#1e5035;">IF x WAS DEFAULTED</div>
</div>

<div style="flex:1;min-width:200px;background:#e8f2e8;border:1px solid #b8d4b8;border-top:3px solid #3d7a52;border-radius:10px;padding:18px;text-align:center;">
<div style="font-size:11px;color:#4a6a50;margin-bottom:6px;letter-spacing:1px;font-weight:700;">SQL</div>
<div style="font-family:monospace;font-size:15px;font-weight:800;color:#7a2e38;margin-bottom:10px;">IF x IS NOT NULL</div>
<div style="margin:8px 0;">
<span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#b8d4b8;line-height:28px;font-size:13px;color:#1e5035;font-weight:700;">↓</span>
</div>
<div style="font-size:11px;color:#3d6a50;margin-bottom:6px;letter-spacing:1px;font-weight:700;">FAST FORMULA</div>
<div style="font-family:monospace;font-size:15px;font-weight:800;color:#1e5035;">IF NOT x WAS DEFAULTED</div>
</div>

<div style="flex:1;min-width:200px;background:#eeeee5;border:1px solid #d0d0c0;border-top:3px solid #6a6a50;border-radius:10px;padding:18px;text-align:center;">
<div style="font-size:11px;color:#6a6a50;margin-bottom:6px;letter-spacing:1px;font-weight:700;">ALTERNATE SYNTAX</div>
<div style="font-family:monospace;font-size:15px;font-weight:800;color:#7a2e38;margin-bottom:10px;">IF x IS NOT NULL</div>
<div style="margin:8px 0;">
<span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#d0d0c0;line-height:28px;font-size:13px;color:#4a4a35;font-weight:700;">↓</span>
</div>
<div style="font-size:11px;color:#3d6a50;margin-bottom:6px;letter-spacing:1px;font-weight:700;">FAST FORMULA</div>
<div style="font-family:monospace;font-size:15px;font-weight:800;color:#1e5035;">IF x WAS NOT DEFAULTED</div>
</div>

</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== COMMON MISTAKES ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Common Mistakes</div>

<!-- MISTAKE 1 -->
<div style="background:#faf5f5;border-left:4px solid #c07070;padding:16px 20px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0 0 8px;font-size:14px;color:#8b4049;font-weight:700;">MISTAKE 1: Checking the value instead of WAS DEFAULTED</p>
<p style="margin:0;font-size:14px;color:#7a4a4a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IF l_term_date = '4712/12/31'</code> — This compares against the default value, but what if someone's actual date happens to be that value? Always use WAS DEFAULTED instead.</p>
</div>

<!-- MISTAKE 2 -->
<div style="background:#faf5f5;border-left:4px solid #c07070;padding:16px 20px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0 0 8px;font-size:14px;color:#8b4049;font-weight:700;">MISTAKE 2: Forgetting the DEFAULT declaration</p>
<p style="margin:0;font-size:14px;color:#7a4a4a;">If you don't declare a DEFAULT and the DBI returns null, the formula <strong>crashes at runtime</strong>. No compile error — it compiles fine. The crash happens when the process runs for an employee whose data is null.</p>
</div>

<!-- MISTAKE 3 -->
<div style="background:#faf5f5;border-left:4px solid #c07070;padding:16px 20px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0 0 8px;font-size:14px;color:#8b4049;font-weight:700;">MISTAKE 3: Using WAS DEFAULTED on a variable</p>
<p style="margin:0;font-size:14px;color:#7a4a4a;">WAS DEFAULTED only works on <strong>DBIs and input values</strong> — not on local variables. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IF l_my_var WAS DEFAULTED</code> doesn't give you the answer you want, because the engine's internal default-substitution flag is only set on DBIs and inputs that have a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DEFAULT</code> declaration. Local variables don't carry that flag.</p>
</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== CHEAT SHEET ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">The Cheat Sheet</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Next time you need to check for null in Fast Formula, follow this pattern:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#7C9C5A;">/* 1. Declare a default */</span>
<span style="color:#C678DD;">DEFAULT</span> <span style="color:#C678DD;">FOR</span> <span style="color:#56B6C2;">MY_DBI_NAME</span> <span style="color:#C678DD;">IS</span> <span style="color:#E5C07B;">'some_safe_value'</span>

<span style="color:#7C9C5A;">/* 2. Read the value */</span>
<span style="color:#E06C75;">l_value</span> = <span style="color:#56B6C2;">MY_DBI_NAME</span>

<span style="color:#7C9C5A;">/* 3. Check if it was null in the database */</span>
<span style="color:#C678DD;">IF</span> <span style="color:#56B6C2;">MY_DBI_NAME</span> <span style="color:#61AFEF;">WAS DEFAULTED</span> <span style="color:#C678DD;">THEN</span>
(
    <span style="color:#7C9C5A;">/* database had NULL */</span>
)
<span style="color:#C678DD;">ELSE</span>
(
    <span style="color:#7C9C5A;">/* database had a real value */</span>
)</pre>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">That's it. Three lines replace what every other language does with <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IS NULL</code>.</p>

<!-- TWEAK 4: scoped to DBIs and input values -->
<div style="background:#f5f8fc;border-left:4px solid #6b8fad;padding:16px 20px;margin:20px 0;border-radius:0 6px 6px 0;">
<p style="margin:0;font-size:15px;color:#1a1a1a;"><strong>DEFAULT</strong> is not just a safety net. <strong>DEFAULT + WAS DEFAULTED</strong> together are Fast Formula's null-handling system for DBIs and input values. If you're coming from SQL or PL/SQL and looking for IS NULL on a DBI — this is it.</p>
</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== ORACLE DOCS ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">What Oracle Documentation Says</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">This isn't a workaround or a hack — it's Oracle's official design. Here's what the docs say:</p>

<div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:20px;margin:18px 0;">

<p style="font-size:13px;color:#888;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px;">From Oracle's official Fast Formula documentation</p>

<p style="font-size:14px;margin:0 0 16px;color:#2a2a2a;border-left:3px solid #2980b9;padding-left:14px;"><strong>Oracle HRMS FastFormula User Guide</strong><br><em>"There is a special comparator called WAS DEFAULTED that you can use to test database items and input values. If there is no value available for an input value or database item, the formula uses a default value. The condition containing the WAS DEFAULTED comparator is True if a default value was used."</em></p>

<p style="font-size:14px;margin:0 0 16px;color:#2a2a2a;border-left:3px solid #2980b9;padding-left:14px;"><strong>Oracle Cloud HCM — Understanding Fast Formula Structure</strong><br><em>"You can use the WAS DEFAULTED statement to determine if a database item or input is null."</em></p>

<div style="background:#faf5f5;border-left:4px solid #c07070;padding:12px 16px;margin:16px 0 0;border-radius:0 6px 6px 0;">
<p style="margin:0;font-size:14px;color:#7a4a4a;"><strong>Critical warning from Oracle:</strong> <em>"You must use the Default statement for database items that can be empty."</em></p>
<p style="margin:8px 0 0;font-size:14px;color:#7a4a4a;">Translation: if you skip the DEFAULT and the DBI returns null, your formula crashes at runtime.</p>
</div>

</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<p style="font-size:16px;margin-bottom:30px;color:#2a2a2a;">Hope this helps someone.</p>

<!-- ==================== AUTHOR FOOTER ==================== -->

<div style="display:flex;align-items:center;gap:14px;padding:20px 0;border-top:2px solid #1a1a1a;">
<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0;">AM</div>
<div>
<div style="font-weight:700;font-size:15px;">Abhishek Mohanty</div>
<div style="font-size:13px;color:#888;line-height:1.5;">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Core HR, Redwood, HDL, OTBI.</div>
</div>
</div>

</div>

</body>
</html>