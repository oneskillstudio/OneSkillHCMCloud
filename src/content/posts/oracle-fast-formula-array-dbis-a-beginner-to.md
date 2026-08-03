---
title: "Oracle Fast Formula Array DBIs: A Beginner-to-Expert Guide to Indexing, Looping & CHANGE_CONTEXTS"
pubDate: 2026-03-16
description: "Oracle Fast Formula Array DBIs: A Beginner-to-Expert Guide to Indexing, Looping & CHANGE_CONTEXTS"
tags: ["Fast Formula", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

<p> </p><div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.8;max-width:780px;margin:0 auto;">

<span style="display:inline-block;background:#c0392b;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Fast Formula</span>
<span style="display:inline-block;background:#2c3e50;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Array DBIs</span>
<span style="display:inline-block;background:#8e44ad;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Advanced</span>

<div style="font-size:32px;font-weight:800;color:#1a1a1a;line-height:1.25;margin:18px 0 8px;">Oracle Fast Formula Array DBIs: A Beginner-to-Expert Guide to Indexing, Looping & CHANGE_CONTEXTS</div>

<div style="font-size:13px;color:#888;margin-bottom:25px;letter-spacing:0.5px;">March 16, 2026 • 14 min read • Oracle HCM Cloud</div>

<div style="font-size:17px;color:#666;line-height:1.7;margin-bottom:30px;font-style:italic;border-left:4px solid #c0392b;padding-left:18px;">
Most Fast Formulas work with single values — one hire date, one assignment status, one accrual amount. But what happens when a person has multiple assignments, multiple date-tracked rows, or matrix bands with multiple accrual tiers? That's where Array Database Items come in — and they change everything about how formula logic works.
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

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">In the previous posts, we covered the 7 pillars of Fast Formula and saw them in action with a single-value accrual formula. But single-value DBIs only get you so far. The moment your business logic needs to iterate over multiple records, you need <b>Array DBIs</b>.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">This post covers how arrays work in Oracle HCM Cloud Fast Formula, the functions available to traverse them, and real examples using the PH Vacation Leave Accrual Matrix formula.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== WHAT ARE ARRAYS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">What Are Array DBIs?</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">A regular DBI is like a single cell in a spreadsheet — it holds one value. An array DBI is like an entire column — it holds many values, each sitting in a numbered row.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">How to tell the difference? Look at the data type. Single-value DBIs have types like DATE, NUMBER, or TEXT. Array DBIs have <b>two-part types</b>:</p>

<table style="margin:16px 0 24px;border-collapse:collapse;width:100%;">
<tr style="border-bottom:1px solid #e0dcd6;"><td style="width:40%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">DBI Type</td><td style="width:30%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Meaning</td><td style="width:30%;font-size:14px;font-weight:700;color:#1a1a1a;">Example</td></tr>
<tr style="border-bottom:1px solid #e0dcd6;"><td style="width:40%;padding:14px 8px;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">NUMBER_NUMBER</code></td><td style="width:30%;padding:14px 8px;font-size:14px;color:#555;">Number indexed by number</td><td style="width:30%;font-size:14px;color:#555;">Assignment IDs</td></tr>
<tr style="border-bottom:1px solid #e0dcd6;"><td style="width:40%;padding:14px 8px;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DATE_NUMBER</code></td><td style="width:30%;padding:14px 8px;font-size:14px;color:#555;">Date indexed by number</td><td style="width:30%;font-size:14px;color:#555;">Start dates</td></tr>
<tr style="border-bottom:1px solid #e0dcd6;"><td style="width:40%;padding:14px 8px;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">TEXT_NUMBER</code></td><td style="width:30%;padding:14px 8px;font-size:14px;color:#555;">Text indexed by number</td><td style="width:30%;font-size:14px;color:#555;">Statuses</td></tr>
</table>

<div style="margin:28px 0;padding:22px 25px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">
Two data types separated by an underscore = array. The first part is the value type, the second is how it's indexed.
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== WHERE ARRAYS USED ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Where Can Arrays Be Used?</div>

<p style="font-size:16px;margin-bottom:20px;color:#2a2a2a;">Arrays appear in four places within Fast Formula:</p>

<table style="margin:16px 0 24px;border-collapse:collapse;width:100%;">
<tr style="border-bottom:1px solid #e0dcd6;"><td style="width:40%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Database Items</td><td style="width:60%;padding:14px 8px;font-size:14px;color:#555;">Read multiple rows from HR tables</td></tr>
<tr style="border-bottom:1px solid #e0dcd6;"><td style="width:40%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Input Values</td><td style="width:60%;padding:14px 8px;font-size:14px;color:#555;">Receive arrays from the calling process</td></tr>
<tr style="border-bottom:1px solid #e0dcd6;"><td style="width:40%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Variables</td><td style="width:60%;padding:14px 8px;font-size:14px;color:#555;">Create and manipulate arrays inside formulas</td></tr>
<tr style="border-bottom:1px solid #e0dcd6;"><td style="width:40%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Return Values</td><td style="width:60%;padding:14px 8px;font-size:14px;color:#555;">Send arrays back to the calling process</td></tr>
</table>

<p style="font-size:14px;color:#888;line-height:1.6;margin-bottom:24px;"><b>Limitation:</b> Functions cannot return array values. Arrays work everywhere else, but seeded or custom functions cannot output them.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== HOW INDEXING WORKS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">How Array Indexing Works</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">If you've worked with arrays in C or any programming language, the concept is familiar. An array stores multiple values and you access each one using an index number in square brackets:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* In C programming */</span>
<span style="color:#e67e22;">int</span> salary[3] = {40000, 25000, 60000};

salary[0]  →  40000
salary[1]  →  25000
salary[2]  →  60000</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Fast Formula arrays work the same way — with two key differences:</p>

<table style="margin:16px 0 24px;border-collapse:collapse;width:100%;">
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="width:30%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;"></td>
<td style="width:35%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">C</td>
<td style="width:35%;padding:14px 8px;font-size:14px;font-weight:700;color:#1a1a1a;">Fast Formula</td>
</tr>
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="padding:14px 8px;font-size:14px;font-weight:700;color:#888;">Index starts at</td>
<td style="padding:14px 8px;font-size:14px;color:#555;">0</td>
<td style="padding:14px 8px;font-size:14px;color:#555;">1 (or any number)</td>
</tr>
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="padding:14px 8px;font-size:14px;font-weight:700;color:#888;">Indexes are</td>
<td style="padding:14px 8px;font-size:14px;color:#555;">Always 0, 1, 2, 3...</td>
<td style="padding:14px 8px;font-size:14px;color:#555;">Can have gaps: 5, 12, 47</td>
</tr>
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="padding:14px 8px;font-size:14px;font-weight:700;color:#888;">Access syntax</td>
<td style="padding:14px 8px;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">array[0]</code></td>
<td style="padding:14px 8px;font-size:14px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">array[1]</code></td>
</tr>
<tr style="border-bottom:1px solid #e0dcd6;">
<td style="padding:14px 8px;font-size:14px;font-weight:700;color:#888;">Navigate with</td>
<td style="padding:14px 8px;font-size:14px;color:#555;">for (i=0; i<n; i++)</td>
<td style="padding:14px 8px;font-size:14px;color:#555;">.FIRST / .NEXT</td>
</tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The biggest difference: in C, you can safely loop from 0 to length-1 because indexes are always sequential. In Fast Formula, indexes can have gaps — so you use FIRST and NEXT to hop between actual indexes instead of counting up.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Now let's see this with real Oracle HCM data. Say a person works 3 jobs:</p>

<!-- VISUAL: Single column spreadsheet -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;max-width:360px;overflow:hidden;">
<tr><td colspan="2" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">ASSIGNMENT_ID (array)</td></tr>
<tr><td style="width:80px;padding:12px 16px;background:#f5f2ed;font-size:13px;font-weight:700;color:#888;text-align:center;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">Row 1</td><td style="padding:12px 16px;font-size:15px;font-weight:600;color:#1a1a1a;border-bottom:1px solid #e0dcd6;">30012</td></tr>
<tr><td style="width:80px;padding:12px 16px;background:#f5f2ed;font-size:13px;font-weight:700;color:#888;text-align:center;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">Row 2</td><td style="padding:12px 16px;font-size:15px;font-weight:600;color:#1a1a1a;border-bottom:1px solid #e0dcd6;">30045</td></tr>
<tr><td style="width:80px;padding:12px 16px;background:#f5f2ed;font-size:13px;font-weight:700;color:#888;text-align:center;border-right:1px solid #e0dcd6;">Row 3</td><td style="padding:12px 16px;font-size:15px;font-weight:600;color:#1a1a1a;">30078</td></tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The row number is called the <b>index</b>. To get a specific value, provide the index in square brackets:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">ASSIGNMENT_ID[1]  →  30012
ASSIGNMENT_ID[2]  →  30045
ASSIGNMENT_ID[3]  →  30078</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Arrays become powerful when you have <b>multiple columns from the same source</b>. Think of it as a full spreadsheet table — row 1 across all columns describes the same record:</p>

<!-- VISUAL: Full spreadsheet table -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td colspan="5" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">All arrays from the SAME route share row numbers</td></tr>
<tr style="background:#f5f2ed;border-bottom:2px solid #1a1a1a;">
<td style="width:50px;padding:10px 8px;font-size:11px;font-weight:700;color:#888;text-align:center;border-right:1px solid #e0dcd6;border-bottom:2px solid #1a1a1a;">Row</td>
<td style="padding:10px 8px;font-size:11px;font-weight:700;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;border-bottom:2px solid #1a1a1a;">Asg ID</td>
<td style="padding:10px 8px;font-size:11px;font-weight:700;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;border-bottom:2px solid #1a1a1a;">Start Date</td>
<td style="padding:10px 8px;font-size:11px;font-weight:700;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;border-bottom:2px solid #1a1a1a;">Status</td>
<td style="padding:10px 8px;font-size:11px;font-weight:700;color:#1a1a1a;text-align:center;border-bottom:2px solid #1a1a1a;">Latest?</td>
</tr>
<tr style="background:#f0faf0;">
<td style="padding:10px 8px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">1</td>
<td style="padding:10px 8px;font-size:13px;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">30012</td>
<td style="padding:10px 8px;font-size:13px;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">01-Jan-25</td>
<td style="padding:10px 8px;font-size:13px;color:#27ae60;text-align:center;font-weight:600;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">ACTIVE</td>
<td style="padding:10px 8px;font-size:13px;color:#27ae60;text-align:center;font-weight:600;border-bottom:1px solid #e0dcd6;">Y</td>
</tr>
<tr style="background:#f0faf0;">
<td style="padding:10px 8px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">2</td>
<td style="padding:10px 8px;font-size:13px;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">30045</td>
<td style="padding:10px 8px;font-size:13px;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">15-Mar-25</td>
<td style="padding:10px 8px;font-size:13px;color:#27ae60;text-align:center;font-weight:600;border-right:1px solid #e0dcd6;border-bottom:1px solid #e0dcd6;">ACTIVE</td>
<td style="padding:10px 8px;font-size:13px;color:#27ae60;text-align:center;font-weight:600;border-bottom:1px solid #e0dcd6;">Y</td>
</tr>
<tr style="background:#fdf0f0;">
<td style="padding:10px 8px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;">3</td>
<td style="padding:10px 8px;font-size:13px;color:#888;text-align:center;border-right:1px solid #e0dcd6;">30078</td>
<td style="padding:10px 8px;font-size:13px;color:#888;text-align:center;border-right:1px solid #e0dcd6;">01-Jun-25</td>
<td style="padding:10px 8px;font-size:13px;color:#c0392b;text-align:center;font-weight:600;border-right:1px solid #e0dcd6;">INACTIVE</td>
<td style="padding:10px 8px;font-size:13px;color:#c0392b;text-align:center;font-weight:600;">N</td>
</tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">This alignment only works when all the array DBIs come from the <b>same source</b> (called a "route" in Oracle). Mix sources and the rows won't line up — Row 1 in one array might describe a completely different record than Row 1 in another.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/><!-- ==================== ARRAY TOOLKIT ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">The Array Toolkit</div>

<p style="font-size:16px;margin-bottom:20px;color:#2a2a2a;">Fast Formula provides these functions to navigate and inspect arrays:</p>

<div style="padding:20px 0;border-top:2px solid #1a1a1a;border-bottom:1px solid #e0dcd6;margin-bottom:16px;">
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">FIRST / LAST</div>
<div style="font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Get the first or last row number</div>
<div style="font-size:15px;color:#555;line-height:1.6;">Entry point into the array. Returns the default value if the array is empty.</div>
</div>

<div style="padding:20px 0;border-bottom:1px solid #e0dcd6;margin-bottom:16px;">
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">NEXT / PRIOR</div>
<div style="font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Move forward or backward one row</div>
<div style="font-size:15px;color:#555;line-height:1.6;">NEXT moves forward, PRIOR moves backward. Both return the default when there's nowhere to go — that's your exit signal.</div>
</div>

<div style="padding:20px 0;border-bottom:1px solid #e0dcd6;margin-bottom:16px;">
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">COUNT</div>
<div style="font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Total number of rows</div>
<div style="font-size:15px;color:#555;line-height:1.6;">Used without parentheses — it's a property, not a function call.</div>
</div>

<div style="padding:20px 0;border-bottom:1px solid #e0dcd6;margin-bottom:16px;">
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">EXISTS</div>
<div style="font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Check if a specific row exists</div>
<div style="font-size:15px;color:#555;line-height:1.6;">Use it to guard against accessing non-existent rows, or as a loop condition.</div>
</div>

<div style="padding:20px 0;border-bottom:2px solid #1a1a1a;margin-bottom:16px;">
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">DELETE</div>
<div style="font-size:16px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">Remove rows (variables only)</div>
<div style="font-size:15px;color:#555;line-height:1.6;">Only works on array variables — DBIs and input values are read-only.</div>
</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's the syntax for each, with what it does:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* Get first row number. -1 if empty */</span>
l_idx = my_array.<span style="color:#6cacec;">FIRST</span>(-1)

<span style="color:#6b8e6b;font-style:italic;">/* Read the value at that row */</span>
l_value = my_array[l_idx]

<span style="color:#6b8e6b;font-style:italic;">/* Move to next row. -1 if at end */</span>
l_idx = my_array.<span style="color:#6cacec;">NEXT</span>(l_idx, -1)

<span style="color:#6b8e6b;font-style:italic;">/* Move to previous row */</span>
l_idx = my_array.<span style="color:#6cacec;">PRIOR</span>(l_idx, -1)

<span style="color:#6b8e6b;font-style:italic;">/* Get last row number */</span>
l_idx = my_array.<span style="color:#6cacec;">LAST</span>(-1)

<span style="color:#6b8e6b;font-style:italic;">/* How many rows? (no parentheses) */</span>
l_total = my_array.<span style="color:#6cacec;">COUNT</span>

<span style="color:#6b8e6b;font-style:italic;">/* Does this row exist? */</span>
<span style="color:#e67e22;">IF</span> (my_array.<span style="color:#6cacec;">EXISTS</span>(l_idx)) <span style="color:#e67e22;">THEN</span> ( ... )</pre>

<!-- VISUAL: What each function returns -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;overflow:hidden;max-width:420px;border-collapse:collapse;width:100%;">
<tr><td colspan="6" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">What each function returns for our 3-row array</td></tr>
<tr><td style="width:55%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#1a1a1a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.FIRST(-1)</code></td><td style="width:45%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#555;">→ <b>1</b> (first row)</td></tr>
<tr><td style="width:55%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#1a1a1a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.NEXT(1, -1)</code></td><td style="width:45%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#555;">→ <b>2</b> (next after 1)</td></tr>
<tr><td style="width:55%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#1a1a1a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.NEXT(3, -1)</code></td><td style="width:45%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#555;">→ <b>-1</b> (no more rows)</td></tr>
<tr><td style="width:55%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#1a1a1a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.LAST(-1)</code></td><td style="width:45%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#555;">→ <b>3</b> (last row)</td></tr>
<tr><td style="width:55%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#1a1a1a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.COUNT</code></td><td style="width:45%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:14px;color:#555;">→ <b>3</b> (total rows)</td></tr>
<tr><td style="width:55%;padding:12px 16px;font-size:14px;color:#1a1a1a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.EXISTS(2)</code></td><td style="width:45%;padding:12px 16px;font-size:14px;color:#555;">→ <b>true</b> (row 2 exists)</td></tr>
</table>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== WALKING THROUGH ==================== -->


<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Looping Through Arrays: WHILE + FIRST/NEXT</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">If you know exactly how many items exist and the indexes are sequential (1, 2, 3, 4...), you could loop from 1 to N using a counter. That works fine for arrays you build yourself inside the formula.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">That approach looks like this:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* Get total number of rows */</span>
l_count = PER_ASG_ASSIGNMENT_ID.<span style="color:#6cacec;">COUNT</span>

<span style="color:#6b8e6b;font-style:italic;">/* Loop from 1 to count */</span>
l_idx = 1
<span style="color:#e67e22;">WHILE</span> l_idx <= l_count
<span style="color:#e67e22;">LOOP</span>
(
  l_asg_id = PER_ASG_ASSIGNMENT_ID[l_idx]
  <span style="color:#6b8e6b;">/* process... */</span>

  l_idx = l_idx + 1
)</pre>

<!-- Visual: when this works and when it breaks -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td colspan="1" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">This approach assumes indexes are 1, 2, 3</td></tr>
<tr><td style="padding:14px 20px;background:#f0faf0;border-bottom:1px solid #e0dcd6;font-size:13px;color:#27ae60;font-weight:600;">Works when indexes are sequential: 1, 2, 3</td></tr>
<tr><td style="padding:14px 20px;background:#fdf0f0;"><div style="font-size:13px;color:#c0392b;font-weight:600;">Breaks when indexes are non-sequential: 5, 12, 47</div><div style="font-size:12px;color:#888;margin-top:4px;">array[1] doesn't exist → runtime error or wrong data</div></td></tr>
</table>
</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The problem is that <b>array DBIs from Oracle HR tables don't always have sequential indexes</b>. The row numbers come from internal database IDs — they could be 5, 12, 47 with gaps in between. If the loop assumes 1, 2, 3 and the actual indexes are 5, 12, 47, the formula tries to access rows that don't exist.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">That's why the recommended pattern uses <b>FIRST</b> (jump to the first real index, whatever it is) and <b>NEXT</b> (hop to the next real index, skipping any gaps). Both take a default value — a number returned when there's nowhere to go. That default is your exit signal.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's the pattern:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* Start at the first row */</span>
l_idx = my_array.<span style="color:#6cacec;">FIRST</span>(-1)

<span style="color:#6b8e6b;font-style:italic;">/* Keep going until -1 (no more rows) */</span>
<span style="color:#e67e22;">WHILE</span> l_idx <> -1
<span style="color:#e67e22;">LOOP</span>
(
  <span style="color:#6b8e6b;font-style:italic;">/* Read the value at this row */</span>
  l_value = my_array[l_idx]

  <span style="color:#6b8e6b;font-style:italic;">/* Move to next row */</span>
  l_idx = my_array.<span style="color:#6cacec;">NEXT</span>(l_idx, -1)
)</pre>

<!-- VISUAL: What each line does -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;overflow:hidden;border-collapse:collapse;width:100%;">
<tr><td colspan="6" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">What each line does</td></tr>
<tr><td style="width:45%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.FIRST(-1)</code></td><td style="width:55%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;color:#555;">Jump to the first row. If array is empty, return -1.</td></tr>
<tr><td style="width:45%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE l_idx <> -1</code></td><td style="width:55%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;color:#555;">Keep looping as long as there are rows left.</td></tr>
<tr><td style="width:45%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">my_array[l_idx]</code></td><td style="width:55%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;color:#555;">Read the value at the current row number.</td></tr>
<tr><td style="width:45%;padding:12px 16px;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.NEXT(l_idx, -1)</code></td><td style="width:55%;padding:12px 16px;font-size:13px;color:#555;">Move to the next row. If at the end, return -1 → loop stops.</td></tr>
</table>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/><!-- ==================== DEEP TRACE ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Tracing the Loop Step by Step</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Let's trace exactly what happens when the loop runs against our PH formula's matrix bands:</p>

<!-- Starting data -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;overflow:hidden;max-width:480px;border-collapse:collapse;width:100%;">
<tr><td colspan="6" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">Data passed by the accrual engine</td></tr>
<tr style="background:#f5f2ed;"><td style="width:60px;border-bottom:2px solid #1a1a1a;padding:10px 12px;font-size:11px;font-weight:700;color:#888;text-align:center;border-right:1px solid #e0dcd6;">Index</td><td style="border-bottom:2px solid #1a1a1a;padding:10px 12px;font-size:11px;font-weight:700;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;">Event Date</td><td style="border-bottom:2px solid #1a1a1a;padding:10px 12px;font-size:11px;font-weight:700;color:#1a1a1a;text-align:center;">Accrual</td></tr>
<tr><td style="width:60px;border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;">1</td><td style="border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;text-align:center;border-right:1px solid #e0dcd6;">01-Jan-25</td><td style="border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;text-align:center;">0</td></tr>
<tr><td style="width:60px;border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;">2</td><td style="border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;text-align:center;border-right:1px solid #e0dcd6;">01-Jul-25</td><td style="border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;text-align:center;">1.25</td></tr>
<tr><td style="width:60px;padding:10px 12px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;">3</td><td style="padding:10px 12px;font-size:13px;text-align:center;border-right:1px solid #e0dcd6;">01-Jan-26</td><td style="padding:10px 12px;font-size:13px;text-align:center;">15</td></tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The loop code:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">l_idx = IV_EVENT_DATES.<span style="color:#6cacec;">FIRST</span>(-1)

<span style="color:#e67e22;">WHILE</span> l_idx <> -1
<span style="color:#e67e22;">LOOP</span>
(
  l_date    = IV_EVENT_DATES[l_idx]
  l_accrual = IV_ACCRUAL_VALUES[l_idx]

  l_log = <span style="color:#6cacec;">ESS_LOG_WRITE</span>(
    <span style="color:#8bc48b;">'Band '</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_idx) 
    || <span style="color:#8bc48b;">' date='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_date, <span style="color:#8bc48b;">'DD-MON-YYYY'</span>)
    || <span style="color:#8bc48b;">' accrual='</span> || <span style="color:#6cacec;">TO_CHAR</span>(l_accrual))

  l_idx = IV_EVENT_DATES.<span style="color:#6cacec;">NEXT</span>(l_idx, -1)
)</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's what happens at each step:</p>

<!-- TRACE VISUAL -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">Execution trace</td></tr>

<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;background:#f5f2ed;">
<div style="font-size:13px;font-weight:700;color:#888;margin-bottom:6px;">BEFORE THE LOOP</div>
<div style="font-size:14px;color:#2a2a2a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.FIRST(-1)</code> → <b>l_idx = 1</b></div>
<div style="font-size:13px;color:#888;margin-top:4px;">First row exists. 1 ≠ -1 → enter loop.</div>
</td></tr>

<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:6px;">ITERATION 1 — index = 1</div>
<div style="margin:8px 0;">
<div style="padding:6px 20px;background:#c0392b;border-radius:4px;color:#fff;font-size:13px;font-weight:700;margin-bottom:2px;">idx=1</div>
<div style="padding:6px 20px;background:#eee;border-radius:4px;color:#888;font-size:13px;margin-bottom:2px;">2</div>
<div style="padding:6px 20px;background:#eee;border-radius:4px;color:#888;font-size:13px;">3</div>
</div>
<div style="font-size:14px;color:#2a2a2a;">Reads: date = <b>01-Jan-25</b>, accrual = <b>0</b></div>
<div style="font-size:14px;color:#2a2a2a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.NEXT(1, -1)</code> → <b>l_idx = 2</b> → continue</div>
</td></tr>

<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:6px;">ITERATION 2 — index = 2</div>
<div style="margin:8px 0;">
<div style="padding:6px 20px;background:#ddd;border-radius:4px;color:#888;font-size:13px;margin-bottom:2px;">1</div>
<div style="padding:6px 20px;background:#c0392b;border-radius:4px;color:#fff;font-size:13px;font-weight:700;margin-bottom:2px;">idx=2</div>
<div style="padding:6px 20px;background:#eee;border-radius:4px;color:#888;font-size:13px;">3</div>
</div>
<div style="font-size:14px;color:#2a2a2a;">Reads: date = <b>01-Jul-25</b>, accrual = <b>1.25</b></div>
<div style="font-size:14px;color:#2a2a2a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.NEXT(2, -1)</code> → <b>l_idx = 3</b> → continue</div>
</td></tr>

<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:6px;">ITERATION 3 — index = 3</div>
<div style="margin:8px 0;">
<div style="padding:6px 20px;background:#ddd;border-radius:4px;color:#888;font-size:13px;margin-bottom:2px;">1</div>
<div style="padding:6px 20px;background:#ddd;border-radius:4px;color:#888;font-size:13px;margin-bottom:2px;">2</div>
<div style="padding:6px 20px;background:#c0392b;border-radius:4px;color:#fff;font-size:13px;font-weight:700;">idx=3</div>
</div>
<div style="font-size:14px;color:#2a2a2a;">Reads: date = <b>01-Jan-26</b>, accrual = <b>15</b></div>
<div style="font-size:14px;color:#2a2a2a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.NEXT(3, -1)</code> → <b>l_idx = -1</b> (no more rows)</div>
</td></tr>

<tr><td style="padding:16px 20px;background:#fdf0f0;">
<div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:6px;">EXIT</div>
<div style="font-size:14px;color:#2a2a2a;"><b>-1 ≠ -1</b> → false → loop ends.</div>
</td></tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;margin-top:24px;">Three things to notice:</p>

<div style="margin:16px 0;">
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">The index variable does double duty</b> — it holds the current position AND controls whether the loop continues. When NEXT returns -1, both the data access and the loop exit are handled by the same variable.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">NEXT must be the last line inside the loop</b> — if placed at the top, the first row gets skipped. If placed in the middle, code below it runs with the wrong index.</div></div>
<div style="padding:14px 0;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Empty array? Loop never runs</b> — if FIRST returns -1, the WHILE condition is immediately false. No iterations, no errors.</div>
</div>
</div>

<!-- ==================== SAME ROUTE RULE ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">The Same-Route Rule</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">When looping through one array and reading values from other arrays at the same row number, all those arrays <b>must come from the same route</b> (the same underlying data source).</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">If they don't, Row 1 in one array might describe a completely different record than Row 1 in another. The formula won't error — it will just silently return wrong results.</p>

<div style="margin:28px 0;padding:22px 25px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">
Same route = rows line up. Different route = data mismatch. Always verify your array DBIs share the same route before cross-referencing at the same index.
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== ARRAYS IN PH FORMULA ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Arrays in the PH Vacation Leave Accrual Formula</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The accrual engine passes two arrays to our formula. These represent the <b>bands</b> from the absence plan's matrix configuration:</p>

<!-- VISUAL: Matrix bands -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;overflow:hidden;max-width:480px;border-collapse:collapse;width:100%;">
<tr><td colspan="6" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">Matrix bands passed to the formula</td></tr>
<tr style="background:#f5f2ed;"><td style="width:60px;border-bottom:2px solid #1a1a1a;padding:10px 12px;font-size:11px;font-weight:700;color:#888;text-align:center;border-right:1px solid #e0dcd6;">Band</td><td style="border-bottom:2px solid #1a1a1a;padding:10px 12px;font-size:11px;font-weight:700;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;">Event Date</td><td style="border-bottom:2px solid #1a1a1a;padding:10px 12px;font-size:11px;font-weight:700;color:#1a1a1a;text-align:center;">Accrual Value</td></tr>
<tr><td style="width:60px;border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;">1</td><td style="border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;">01-Jan-2025</td><td style="border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;color:#888;text-align:center;">0 (probation)</td></tr>
<tr><td style="width:60px;border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;">2</td><td style="border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;">01-Jul-2025</td><td style="border-bottom:1px solid #e0dcd6;padding:10px 12px;font-size:13px;color:#1a1a1a;text-align:center;">1.25 per month</td></tr>
<tr><td style="width:60px;padding:10px 12px;font-size:13px;font-weight:700;color:#c0392b;text-align:center;border-right:1px solid #e0dcd6;">3</td><td style="padding:10px 12px;font-size:13px;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;">01-Jan-2026</td><td style="padding:10px 12px;font-size:13px;color:#1a1a1a;text-align:center;">15 (lump sum)</td></tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Our formula ignores these and calculates accrual using custom phase logic. But we <b>still must declare and default them</b> — otherwise the formula crashes:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* "Empty array" constants — FF's way of defaulting arrays */</span>
<span style="color:#e67e22;">DEFAULT FOR</span> IV_EVENT_DATES <span style="color:#e67e22;">IS</span> EMPTY_DATE_NUMBER
<span style="color:#e67e22;">DEFAULT FOR</span> IV_ACCRUAL_VALUES <span style="color:#e67e22;">IS</span> EMPTY_NUMBER_NUMBER

<span style="color:#e67e22;">INPUTS ARE</span>
  IV_ACCRUAL,
  IV_EVENT_DATES              (<span style="color:#e67e22;">DATE_NUMBER</span>),
  IV_ACCRUAL_VALUES           (<span style="color:#e67e22;">NUMBER_NUMBER</span>)</pre>

<!-- VISUAL: What the code does -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;overflow:hidden;border-collapse:collapse;width:100%;">
<tr><td colspan="6" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">What each line does</td></tr>
<tr><td style="width:50%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">EMPTY_DATE_NUMBER</code></td><td style="width:50%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;color:#555;">Built-in constant = "this array has zero rows"</td></tr>
<tr><td style="width:50%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">EMPTY_NUMBER_NUMBER</code></td><td style="width:50%;padding:12px 16px;border-bottom:1px solid #e0dcd6;font-size:13px;color:#555;">Same, but for numeric arrays</td></tr>
<tr><td style="width:50%;padding:12px 16px;font-size:13px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">(DATE_NUMBER)</code></td><td style="width:50%;padding:12px 16px;font-size:13px;color:#555;">Declares the input as a date array, not a single date</td></tr></table>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== CHANGE_CONTEXTS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">CHANGE_CONTEXTS: Checking Data at a Different Date</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Every absence accrual formula receives a set of <b>contexts</b> from the accrual engine before it runs. One of the most important is <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">EFFECTIVE_DATE</code> — it tells every DBI "return data as of this date."</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The engine also passes input values like <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IV_ACCRUAL_START_DATE</code> (the first day of the current accrual period) and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IV_ACCRUAL_END_DATE</code> (the last day). The EFFECTIVE_DATE context is usually set to the <b>period end date</b>.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">This means when the formula reads any DBI — like hire date, FTE, or assignment status — it gets the value as of the <b>last day</b> of the period. That's fine most of the time. But what if an employee changed from part-time to full-time mid-month? The formula would only see the end-of-month FTE (1.0) and miss that they were part-time (0.5) at the start.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CHANGE_CONTEXTS</code> solves this. It temporarily overrides a context value, lets you read DBIs at a different point in time, then automatically reverts when the block ends.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's the scenario: January 2026 accrual period. The engine sets EFFECTIVE_DATE to 31-Jan-2026. We want to check whether the FTE changed during the month.</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#6b8e6b;font-style:italic;">/* These are passed by the accrual engine: */</span>
<span style="color:#6b8e6b;">/* EFFECTIVE_DATE context = 31-Jan-2026 (period end) */</span>
<span style="color:#6b8e6b;">/* IV_ACCRUAL_START_DATE  = 01-Jan-2026 (period start) */</span>
<span style="color:#6b8e6b;">/* IV_ACCRUAL_END_DATE    = 31-Jan-2026 (period end) */</span>

<span style="color:#6b8e6b;font-style:italic;">/* Step 1: Read the FTE at period END (uses EFFECTIVE_DATE) */</span>
l_current_fte = PER_ASG_FTE_VALUE
<span style="color:#6b8e6b;">/* → 1.0 (full-time as of 31-Jan-2026) */</span>

<span style="color:#6b8e6b;font-style:italic;">/* Step 2: Temporarily switch to period START date */</span>
<span style="color:#6cacec;">CHANGE_CONTEXTS</span>(EFFECTIVE_DATE = IV_ACCRUAL_START_DATE)
(
  <span style="color:#6b8e6b;font-style:italic;">/* Now all DBIs return data as of 01-Jan-2026 */</span>
  l_start_fte = PER_ASG_FTE_VALUE
  <span style="color:#6b8e6b;">/* → 0.5 (was part-time at start of month) */</span>
)
<span style="color:#6b8e6b;font-style:italic;">/* Context automatically reverts to 31-Jan-2026 here */</span>

<span style="color:#6b8e6b;font-style:italic;">/* Step 3: Compare and decide */</span>
<span style="color:#e67e22;">IF</span> (l_start_fte <> l_current_fte) <span style="color:#e67e22;">THEN</span>
(
  <span style="color:#6b8e6b;">/* FTE changed during the month — prorate */</span>
  accrual = 1.25 * l_current_fte
)
<span style="color:#e67e22;">ELSE</span>
(
  <span style="color:#6b8e6b;">/* No change — standard accrual */</span>
  accrual = 1.25
)</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's what happened step by step:</p>

<!-- VISUAL: Timeline as proper table -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td colspan="2" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">January 2026 accrual period</td></tr>
<tr>
<td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;vertical-align:top;width:30%;font-size:13px;font-weight:700;color:#888;">Step 1 — Read at period end</td>
<td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;vertical-align:top;"><div style="font-size:14px;color:#2a2a2a;">EFFECTIVE_DATE = <b>31-Jan-2026</b> (set by engine)</div><div style="font-size:13px;color:#888;margin-top:4px;">PER_ASG_FTE_VALUE returns <b>1.0</b> (full-time now)</div></td>
</tr>
<tr style="background:#fefce8;">
<td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;vertical-align:top;font-size:13px;font-weight:700;color:#e67e22;">Step 2 — CHANGE_CONTEXTS</td>
<td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;vertical-align:top;"><div style="font-size:14px;color:#2a2a2a;">Temporarily switches to <b>01-Jan-2026</b> (IV_ACCRUAL_START_DATE)</div><div style="font-size:13px;color:#888;margin-top:4px;">PER_ASG_FTE_VALUE now returns <b>0.5</b> (part-time at month start)</div></td>
</tr>
<tr>
<td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;vertical-align:top;font-size:13px;font-weight:700;color:#888;">Step 3 — Auto revert</td>
<td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;vertical-align:top;"><div style="font-size:14px;color:#2a2a2a;">Context reverts to <b>31-Jan-2026</b> automatically</div><div style="font-size:13px;color:#888;margin-top:4px;">No manual cleanup needed</div></td>
</tr>
<tr style="background:#f5f2ed;">
<td style="padding:16px 20px;vertical-align:top;font-size:13px;font-weight:700;color:#1a1a1a;">Result</td>
<td style="padding:16px 20px;vertical-align:top;"><div style="font-size:14px;color:#2a2a2a;">FTE changed 0.5 → 1.0 mid-month → prorate: <b>1.25 × 1.0 = 1.25 days</b></div></td>
</tr>
</table>

<div style="margin:28px 0;padding:22px 25px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">CHANGE_CONTEXTS works with any context the formula has access to. In absence formulas, EFFECTIVE_DATE is the most common one to override — it lets you "time-travel" to any date and read what the data looked like then.
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== DBI REVERSE ENGINEERING ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Bonus: The DBI X-Ray Query</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Ever wondered what actually happens when your formula reads a DBI? There's a SQL query that lets you see exactly how Oracle resolves any Database Item — what table it reads from, what joins it performs, and which contexts it needs.</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><span style="color:#e67e22;">SELECT</span> d.base_user_name         DBI_NAME
,      d.data_type               DBI_DATA_TYPE
,      d.definition_text         SELECT_CLAUSE
,      r.text                    WHERE_CLAUSE
,      (<span style="color:#e67e22;">SELECT</span> <span style="color:#6cacec;">LISTAGG</span>(
         <span style="color:#8bc48b;">'<'</span> || rcu.sequence_no || <span style="color:#8bc48b;">','</span> 
         || c.base_context_name || <span style="color:#8bc48b;">'>'</span>, <span style="color:#8bc48b;">', '</span>)
         <span style="color:#e67e22;">WITHIN GROUP</span> (<span style="color:#e67e22;">ORDER BY</span> rcu.sequence_no)
       <span style="color:#e67e22;">FROM</span>   ff_route_context_usages rcu
       ,      ff_contexts_b c
       <span style="color:#e67e22;">WHERE</span>  rcu.route_id = r.route_id
       <span style="color:#e67e22;">AND</span>    rcu.context_id = c.context_id
       )                         ROUTE_CONTEXT_USAGES
<span style="color:#e67e22;">FROM</span>   ff_database_items_b d
,      ff_user_entities_b u
,      ff_routes_b r
<span style="color:#e67e22;">WHERE</span>  d.base_user_name = <span style="color:#8bc48b;">'PER_ASG_LOCATION_NAME'</span>
<span style="color:#e67e22;">AND</span>    d.user_entity_id = u.user_entity_id
<span style="color:#e67e22;">AND</span>    r.route_id = u.route_id</pre>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Run this in BI Publisher or any SQL tool connected to your HCM Cloud database. Replace <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_LOCATION_NAME</code> with any DBI name to see its internals. Here's what each column returns:</p>

<!-- VISUAL: Column explanation -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;border-collapse:collapse;width:100%;overflow:hidden;">
<tr><td colspan="2" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">What the query returns</td></tr>
<tr><td style="width:40%;padding:14px 16px;font-size:14px;font-weight:700;color:#c0392b;border-bottom:1px solid #e0dcd6;">DBI_NAME</td><td style="width:60%;padding:14px 16px;font-size:14px;color:#555;border-bottom:1px solid #e0dcd6;">The DBI you searched for</td></tr>
<tr><td style="padding:14px 16px;font-size:14px;font-weight:700;color:#c0392b;border-bottom:1px solid #e0dcd6;">DBI_DATA_TYPE</td><td style="padding:14px 16px;font-size:14px;color:#555;border-bottom:1px solid #e0dcd6;">T = text, N = number, D = date. Two-part type means array.</td></tr>
<tr><td style="padding:14px 16px;font-size:14px;font-weight:700;color:#c0392b;border-bottom:1px solid #e0dcd6;">SELECT_CLAUSE</td><td style="padding:14px 16px;font-size:14px;color:#555;border-bottom:1px solid #e0dcd6;">The actual column expression Oracle reads — this is the value your formula gets.</td></tr>
<tr><td style="padding:14px 16px;font-size:14px;font-weight:700;color:#c0392b;border-bottom:1px solid #e0dcd6;">WHERE_CLAUSE</td><td style="padding:14px 16px;font-size:14px;color:#555;border-bottom:1px solid #e0dcd6;">The full route SQL — tables, joins, filters, bind variables. This controls which row gets returned.</td></tr>
<tr><td style="padding:14px 16px;font-size:14px;font-weight:700;color:#c0392b;">ROUTE_CONTEXT_USAGES</td><td style="padding:14px 16px;font-size:14px;color:#555;">Which contexts the route needs and their bind order.</td></tr>
</table>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 12px;">Real Output: PER_ASG_LOCATION_NAME</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Here's what the query actually returned when run in BI Publisher:</p>

<!-- VISUAL: Actual result -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;overflow:hidden;border-collapse:collapse;width:100%;">
<tr><td colspan="6" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">Actual result from Oracle HCM Cloud</td></tr>

<tr><td style="padding:14px 16px;border-bottom:1px solid #e0dcd6;"><div style="font-size:12px;font-weight:700;color:#888;margin-bottom:4px;">DBI_NAME</div><div style="font-size:15px;color:#1a1a1a;font-weight:600;">PER_ASG_LOCATION_NAME</div></td></tr>

<tr><td style="padding:14px 16px;border-bottom:1px solid #e0dcd6;"><div style="font-size:12px;font-weight:700;color:#888;margin-bottom:4px;">DBI_DATA_TYPE</div><div style="font-size:15px;color:#1a1a1a;font-weight:600;">T <span style="font-weight:400;color:#888;">(Text — single value, not an array)</span></div></td></tr>

<tr><td style="padding:14px 16px;border-bottom:1px solid #e0dcd6;"><div style="font-size:12px;font-weight:700;color:#888;margin-bottom:4px;">SELECT_CLAUSE</div><div style="font-size:15px;color:#1a1a1a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">hrloc.location_name</code></div>
<div style="font-size:13px;color:#888;margin-top:4px;">Reads the location_name column from the hr_locations table (aliased as hrloc)</div></td></tr>

<tr><td style="padding:14px 16px;border-bottom:1px solid #e0dcd6;"><div style="font-size:12px;font-weight:700;color:#888;margin-bottom:4px;">ROUTE_CONTEXT_USAGES</div>
<div style="font-size:15px;color:#1a1a1a;font-weight:600;"><1,HR_ASSIGNMENT_ID>, <2,EFFECTIVE_DATE></div></td></tr>
</table>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 12px;">Decoding the Bind Variables</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The ROUTE_CONTEXT_USAGES column is to determine the route for DBI. It tells you which context maps to which bind variable in the WHERE clause:</p>

<!-- VISUAL: Bind variable mapping -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;overflow:hidden;border-collapse:collapse;width:100%;">
<tr><td colspan="6" style="background:#1a1a1a;padding:10px 16px;font-size:12px;font-weight:700;color:#fff;letter-spacing:1px;">How bind variables connect to contexts</td></tr>

<tr style="background:#f5f2ed;"><td style="width:33%;border-bottom:2px solid #1a1a1a;padding:10px 14px;font-size:12px;font-weight:700;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;">Bind Variable</td><td style="width:33%;border-bottom:2px solid #1a1a1a;padding:10px 14px;font-size:12px;font-weight:700;color:#1a1a1a;text-align:center;border-right:1px solid #e0dcd6;">Context</td><td style="width:34%;border-bottom:2px solid #1a1a1a;padding:10px 14px;font-size:12px;font-weight:700;color:#1a1a1a;text-align:center;">What it does in the WHERE clause</td></tr>

<tr><td style="width:33%;border-bottom:1px solid #e0dcd6;padding:12px 14px;font-size:14px;text-align:center;border-right:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">&B1</code></td><td style="width:33%;border-bottom:1px solid #e0dcd6;padding:12px 14px;font-size:14px;text-align:center;font-weight:600;border-right:1px solid #e0dcd6;">HR_ASSIGNMENT_ID</td><td style="width:34%;border-bottom:1px solid #e0dcd6;padding:12px 14px;font-size:13px;color:#555;">Filters to the specific assignment</td></tr>

<tr><td style="width:33%;padding:12px 14px;font-size:14px;text-align:center;border-right:1px solid #e0dcd6;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">&B2</code></td><td style="width:33%;padding:12px 14px;font-size:14px;text-align:center;font-weight:600;border-right:1px solid #e0dcd6;">EFFECTIVE_DATE</td><td style="width:34%;padding:12px 14px;font-size:13px;color:#555;">Filters date-tracked rows to the right date</td></tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">The sequence number tells you which bind variable (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">&B1</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">&B2</code>) in the WHERE clause maps to which context. So <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">&B1</code> = HR_ASSIGNMENT_ID, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">&B2</code> = EFFECTIVE_DATE.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 12px;">Why This Matters for Array DBIs</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Remember the same-route rule from earlier? When looping through an array and reading other array DBIs at the same index, they all must share the same route. But how do you <b>verify</b> that two DBIs share a route?</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Run this query for each DBI. If the WHERE_CLAUSE is identical, they share the same route — and their indexes are aligned. If the WHERE_CLAUSE is different, they come from different SQL queries, and the same index might point to completely different records.</p>

<!-- VISUAL: Same route check -->
<table style="margin:24px 0;border:2px solid #1a1a1a;border-radius:8px;overflow:hidden;border-collapse:collapse;width:100%;">


<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;"><div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:6px;">STEP 1</div><div style="font-size:14px;color:#2a2a2a;">Run the query for the DBI you're looping through</div><div style="font-size:13px;color:#888;margin-top:4px;">Example: PER_ASG_ASSIGNMENT_ID → note the WHERE_CLAUSE</div></td></tr>

<tr><td style="padding:16px 20px;border-bottom:1px solid #e0dcd6;"><div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:6px;">STEP 2</div><div style="font-size:14px;color:#2a2a2a;">Run it again for the DBI you want to cross-reference</div>
<div style="font-size:13px;color:#888;margin-top:4px;">Example: PER_ASG_STATUS_TYPE → compare the WHERE_CLAUSE</div></td></tr>

<tr><td style="padding:16px 20px;background:#ecfdf5;"><div style="font-size:13px;font-weight:700;color:#27ae60;margin-bottom:4px;">SAME WHERE_CLAUSE?</div>
<div style="font-size:14px;color:#2a2a2a;">Same route → indexes are aligned → safe to use at the same index</div></td></tr>

<tr><td style="padding:16px 20px;background:#fdf0f0;"><div style="font-size:13px;font-weight:700;color:#c0392b;margin-bottom:4px;">DIFFERENT WHERE_CLAUSE?</div><div style="font-size:14px;color:#2a2a2a;">Different route → indexes don't match → do not cross-reference</div></td></tr>
</table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">This is the practical way to apply the same-route rule. Instead of guessing whether two array DBIs are aligned, you can confirm it in SQL before writing a single line of formula code.</p>

<div style="margin:28px 0;padding:22px 25px;background:#fdf6f0;border-left:5px solid #c0392b;font-size:17px;font-style:italic;color:#333;line-height:1.7;">
This query is your debugging tool. When a DBI returns unexpected data, it shows you the exact SQL Oracle runs. When building array loops, it lets you verify the same-route rule. Swap the DBI name and run it for any Database Item.
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0;"/>

<!-- ==================== KEY TAKEAWAYS ==================== -->

<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3;">Key Takeaways</div>

<div style="margin:16px 0;">
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Two-part type = array</b> — NUMBER_NUMBER, DATE_NUMBER, TEXT_NUMBER. Single types are single-value.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">FIRST and NEXT are your loop</b> — start with .FIRST(-1), advance with .NEXT(idx, -1), stop when you get -1.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Same route or wrong data</b> — when cross-referencing arrays at the same index, they must share the same route.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Declare arrays even if unused</b> — IV_EVENT_DATES and IV_ACCRUAL_VALUES must be declared with defaults or the formula crashes.</div>
</div>
<div style="padding:14px 0;border-bottom:1px solid #e0dcd6;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">CHANGE_CONTEXTS for time-travel</b> — temporarily switch the effective date to read DBI values at a different point in time.</div>
</div>
<div style="padding:14px 0;">
<div style="font-size:15px;color:#2a2a2a;line-height:1.6;"><b style="color:#c0392b;">Functions can't return arrays</b> — arrays work as DBIs, inputs, variables, and returns, but not as function outputs.</div>
</div>
</div>

<p style="font-size:16px;margin-top:24px;margin-bottom:18px;color:#2a2a2a;">Array DBIs unlock the ability to work with multi-row data in Oracle HCM Cloud Fast Formula. Master the FIRST → NEXT loop pattern and the same-route rule, and you can handle virtually any multi-row scenario.</p>

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