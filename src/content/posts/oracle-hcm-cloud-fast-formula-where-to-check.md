---
title: "Oracle HCM Cloud Fast Formula — Where to Check Logs: ESS Process Names, Navigation Paths & Prerequisites for Absence, Payroll, Compensation, Benefits, OTL, HCM Extract & Talent Management"
pubDate: 2026-03-20
description: "Oracle HCM Cloud Fast Formula — Where to Check Logs: ESS Process Names, Navigation Paths & Prerequisites for Absence, Payroll, Compensation, Benefits,..."
tags: ["Absence Management", "Benefits", "Debugging", "Fast Formula", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.8;max-width:780px;margin:0 auto">

<!-- TAG PILLS -->
<div style="margin-bottom:18px">
<span style="display:inline-block;background:#c0392b;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px">Fast Formula</span>
<span style="display:inline-block;background:#2c3e50;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px">Debugging</span>
<span style="display:inline-block;background:#c0392b;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px">ESS Logs</span>
<span style="display:inline-block;background:#2c3e50;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px">Consolidated Reference</span>
</div>

<!-- TITLE -->
<div style="font-size:24px;font-weight:700;color:#1a1a1a;line-height:1.35;margin-bottom:8px">Oracle Fast Formula: Where to Check Logs — The One Reference That Should Have Existed Years Ago</div>

<!-- META -->
<div style="font-size:13px;color:#888;margin-bottom:25px;letter-spacing:0.5px">March 2026 • 10 min read • Oracle HCM Cloud</div>

<!-- INTRO -->
<div style="font-size:17px;color:#666;line-height:1.7;margin-bottom:30px;font-style:italic;border-left:4px solid #c0392b;padding-left:18px">You added <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code> to your formula. You ran the process. Now you're staring at the screen wondering where the output went. This post is for that moment.</div>

<!-- AUTHOR BOX -->
<div style="display:flex;align-items:center;gap:14px;padding:20px 0;border-top:2px solid #1a1a1a;border-bottom:2px solid #1a1a1a;margin-bottom:35px">
<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0">AM</div>
<div>
<div style="font-weight:700;font-size:15px">Abhishek Mohanty</div>
<div style="font-size:13px;color:#888">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant</div>
</div>
</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a">Every Fast Formula post I've written so far has had <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code> in the code. And in every post I showed the log output — but I never once explained where I went to <em>get</em> that output.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a"><a href="https://www.linkedin.com/in/roopesh-madan-11b94128/" target="_blank" style="color:#c0392b;text-decoration:none;font-weight:700">Roopesh Madan</a> helped me consolidate this — he sent me a module-by-module breakdown of which logging function works where, which ESS job to run, and where to check the output. That email became the skeleton of this post. Nobody had written the consolidated version. So here it is.</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0">

<!-- ============================================================ -->
<!-- THE FULL PICTURE -->
<!-- ============================================================ -->
<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:40px 0 18px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3">The Full Picture</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a">Scan this first. The details for each module are below.</p>

<div style="overflow-x:auto;margin:14px 0 22px">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead>
<tr>
<th style="background:#2c3e50;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Module</th>
<th style="background:#2c3e50;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">ESS Process Names</th>
<th style="background:#2c3e50;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Where to Check</th>
<th style="background:#2c3e50;color:#fff;padding:10px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Prerequisite</th>
</tr>
</thead>
<tbody>
<tr><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Absence</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Calculate Accruals and Balances<br>Evaluate Absences<br>Update Accrual Plan Enrollments</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Scheduled Processes > Log/Output</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#c0392b"><strong>"Include trace statements in audit log"</strong></td></tr>
<tr style="background:#faf8f5"><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Time & Labor</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Timecard Submission<br>Mass Submit and Approve Time Cards<br>Resubmit Time Cards<br>Submit Queued Time Cards<br>Transfer Time Cards from Time and Labor</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Analyze Rule Processing Details<br>Or query HWM_RULE_FF_WORK_LOG</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#27ae60"><strong>None</strong></td></tr>
<tr><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Payroll</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Calculate Payroll<br>QuickPay<br>Calculate Gross Earnings<br>Recalculate Payroll for Retroactive Changes</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Payroll Flow > View Results<br>Or Scheduled Processes > Log</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#c0392b"><strong>Manage Payroll Process Configuration</strong></td></tr>
<tr style="background:#faf8f5"><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Compensation</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333"><strong>CWB:</strong> Start Workforce Compensation Cycle<br>Refresh Workforce Compensation Data<br>Transfer / Back Out<br><strong>TCS:</strong> Generate Total Compensation Statements</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333"><strong>CWB:</strong> Monitor Process > Child Process > ESS_L_xxxxx<br><strong>TCS:</strong> Monitor Processes and Logs > Subprocess > View Log</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#c0392b"><strong>CWB: "Include trace statements in the log file"<br>TCS: "Include trace statements in Audit log"</strong></td></tr>
<tr><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Benefits</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Participation Evaluation<br>Default Enrollment<br>Close Enrollment<br>Reevaluate Designee Eligibility<br>Upload Benefit Enrollments</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Evaluation & Reporting > Monitor Process Request</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#27ae60"><strong>None</strong></td></tr>
<tr style="background:#faf8f5"><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">HCM Extract</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Run Extract (Data Exchange > Submit Extracts)</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#333">Scheduled Processes > Log/Output</td><td style="padding:10px 12px;border-bottom:1px solid #e0dcd6;color:#c0392b"><strong>Logging Category Detailed = GMFZT</strong></td></tr>
<tr><td style="padding:10px 12px;font-weight:600;color:#1a1a1a">Talent Mgmt</td><td style="padding:10px 12px;color:#333">No ESS — UI-triggered</td><td style="padding:10px 12px;color:#333">Query HWM_RULE_FF_WORK_LOG</td><td style="padding:10px 12px;color:#e67e22"><strong>ADD_RLOG — test first, not supported for all FF types</strong></td></tr>
</tbody>
</table>
</div>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0">

<!-- ============================================================ -->
<!-- SECTION 1: WORKFORCE MANAGEMENT — ABSENCE & OTL -->
<!-- ============================================================ -->
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Section 1</div>
<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 24px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3">Workforce Management — Absence & Time and Labor</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a">These are the two modules most HCM technical consultants hit first. And they use completely different logging mechanisms.</p>

<!-- ABSENCE -->
<div style="font-size:19px;font-weight:700;color:#1a1a1a;margin:28px 0 12px">Absence Management</div>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a"><strong>Where to check:</strong> Scheduled Processes > Search for process > <strong>Log/Output</strong> attachment. <strong>Prerequisite:</strong> Enable <strong>"Include trace statements in audit log"</strong> on the submission page. Without this, ESS_LOG_WRITE output is silently dropped. <strong>Entry Validation shortcut:</strong> Set <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">VALID = 'N'</code> and put debug values in <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ERROR_MESSAGE</code> — shows on the UI directly, no ESS needed. Remove before production.</p>

<div style="overflow-x:auto;margin:14px 0 12px">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead><tr><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Formula Type</th><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Linked ESS Job</th></tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Global Absence Accrual</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Accruals and Balances</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Absence Accrual Matrix</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Accruals and Balances</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Global Absence Carryover</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Accruals and Balances</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Global Absence Transfer</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Accruals and Balances</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Global Absence Type Duration</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Evaluate Absences</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Global Absence Entry Validation</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Evaluate Absences (also UI-triggered on absence entry)</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Participation and Rate Eligibility (absence)</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Update Accrual Plan Enrollments</td></tr>
</tbody>
</table>
</div>
<p style="font-size:13px;margin-bottom:0;color:#888;font-style:italic">Ref: Oracle Docs — Administering Fast Formulas > Troubleshooting Tips (24B/24D) • Oracle Docs — Absence Processes (R20B)</p>

<!-- OTL -->
<div style="font-size:19px;font-weight:700;color:#1a1a1a;margin:32px 0 12px">Oracle Time and Labor (OTL)</div>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a">OTL doesn't use <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_LOG_WRITE</code>. It has its own: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_RLOG</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_LOG</code>. No prerequisite. <strong>Where to check:</strong> <strong>Workforce Management > Time Management > Analyze Rule Processing Details</strong> > Search by Rule Set Name > Click Timecard Processing ID. Or query <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_RULE_FF_WORK_LOG</code> via SQL/OTBI.</p>

<div style="overflow-x:auto;margin:14px 0 12px">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead><tr><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Formula Type</th><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Linked ESS Job</th></tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Workforce Management Time Entry Rules</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Timecard Submission / Mass Submit and Approve Time Cards</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Workforce Management Time Calculation Rules</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Timecard Submission / Resubmit Time Cards</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Workforce Management Time Submission Rules</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Submit Queued Time Cards / Mass Submit</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Workforce Management Time Device Event Rules</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Generate Time Cards from Time Collection Device</td></tr>
</tbody>
</table>
</div>
<p style="font-size:13px;margin-bottom:0;color:#888;font-style:italic">Ref: Oracle Docs — Using Time and Labor > Scheduled Processes (20C) • tilak-lakshmi.blogspot.com — "How to Debug a Fast Formula"</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0">

<!-- ============================================================ -->
<!-- SECTION 2: PAYROLL & COMPENSATION -->
<!-- ============================================================ -->
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Section 2</div>
<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 24px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3">Payroll & Compensation</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a">Both of these run batch processes and both have specific prerequisites you need to enable before logging will work.</p>

<!-- PAYROLL -->
<div style="font-size:19px;font-weight:700;color:#1a1a1a;margin:28px 0 12px">Payroll</div>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a">Payroll has the most involved logging setup. <strong>Where to check:</strong> Payroll Flow > View Results > Log/Output. Or Scheduled Processes > Log. <strong>Prerequisite:</strong> <strong>Manage Payroll Process Configuration</strong> (My Client Groups > Payroll > Payroll Process Configuration) > Group Overrides > Create group > Add <strong>Logging Category</strong> = <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">F</code> and <strong>Formula Execution Logging</strong> = <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">i</code>. Select group when submitting. Remove after testing. <strong>QuickPay gotcha:</strong> QuickPay doesn't accept a group — must use <strong>Default Group</strong>. Profile option <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ACTION_PARAMETER_GROUPS</code> controls the default.</p>

<div style="overflow-x:auto;margin:14px 0 12px">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead><tr><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Formula Type</th><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Linked ESS Job</th></tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Payroll Calculation (element formulas)</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Payroll / QuickPay</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Proration</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Payroll / QuickPay</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Element Skip</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Payroll / QuickPay</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Payroll Formula Result Rules</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Payroll / QuickPay</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Balance Adjustment</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Payroll</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Gross Earnings calculation formulas</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Calculate Gross Earnings</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Retroactive Proration / Retro component formulas</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Recalculate Payroll for Retroactive Changes</td></tr>
</tbody>
</table>
</div>
<p style="font-size:13px;margin-bottom:0;color:#888;font-style:italic">Ref: Oracle Docs — Logging Processing Parameters • Oracle Docs — Payroll Process Configuration Groups (24D) • MOS Doc ID 1559909.1</p>

<!-- COMPENSATION -->
<div style="font-size:19px;font-weight:700;color:#1a1a1a;margin:32px 0 12px">Compensation (CWB / TCS / GSP)</div>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a">Compensation has two different log paths depending on whether you're running Workforce Compensation (CWB) or Total Compensation Statements (TCS).</p>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a"><strong>CWB (Workforce Compensation):</strong> Compensation > Run Batch Process > <strong>Monitor Process</strong> > Hierarchy ON > <strong>Child Process</strong> > scroll to bottom > <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ESS_L_xxxxx</code> attachment (some releases: "View Log" button). <strong>Prerequisite:</strong> Enable <strong>"Include trace statements in the log file"</strong> on cycle start.</p>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a"><strong>TCS (Total Compensation Statements):</strong> The TCS Monitor page (<em>Monitor Total Compensation Statement Processes</em>) does <strong>not</strong> show formula logs — that's a known limitation. To see logs: click <strong>"Monitor Processes and Logs"</strong> (top right of TCS Monitor page) > takes you to <strong>Manage Scheduled Processes</strong> > find <strong>"Generate Total Compensation Statements: Subprocess"</strong> entries > click <strong>View Log</strong>. <strong>Prerequisite:</strong> Check <strong>"Include trace statements in Audit log"</strong> on the Generate Statements submission page.</p>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a"><strong>Gotcha:</strong> Compensation Default & Override formulas also fire from the worksheet UI — no ESS log there. Use <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_RLOG</code> and query <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_RULE_FF_WORK_LOG</code> for those (see ADD_RLOG note at the end).</p>

<div style="overflow-x:auto;margin:14px 0 12px">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead><tr><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Formula Type</th><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Linked ESS Job</th></tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Compensation Default and Override</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Start Workforce Compensation Cycle / Refresh (also UI-triggered)</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Compensation Person Selection</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Start Workforce Compensation Cycle</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Compensation Currency Selection</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Start Workforce Compensation Cycle</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Compensation Hierarchy Determination</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Start Workforce Compensation Cycle</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Compensation Start Date</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Transfer Workforce Compensation Data to HR</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Total Compensation Item (TCS)</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Generate Total Compensation Statements</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Participation and Rate Eligibility (TCS)</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Generate Total Compensation Statements</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Compensation Person Selection (TCS)</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Generate Total Compensation Statements</td></tr>
</tbody>
</table>
</div>
<p style="font-size:13px;margin-bottom:0;color:#888;font-style:italic">Ref: Oracle Docs — Plan Validation & Starting Workforce Compensation Cycle (24C) • Oracle Docs — Implementing Compensation (25A) • tilak-lakshmi.blogspot.com — "Fast Formula – Compensation Example"</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0">

<!-- ============================================================ -->
<!-- SECTION 3: BENEFITS & HCM EXTRACT -->
<!-- ============================================================ -->
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Section 3</div>
<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 24px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3">Benefits & HCM Extract</div>

<!-- BENEFITS -->
<div style="font-size:19px;font-weight:700;color:#1a1a1a;margin:28px 0 12px">Benefits</div>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a">Processes run from <strong>Evaluation and Reporting</strong> work area. <strong>Where to check:</strong> Evaluation & Reporting > <strong>Monitor Process Request</strong>. Also check Scheduled Processes for ESS log. <strong>No prerequisite</strong> for ESS_LOG_WRITE. <strong>Formula Tab:</strong> Evaluation & Reporting has a Formula Tab to test a benefits FF for a sample participant without changing data — can't test runtime-dependent FFs like Rate Periodization.</p>

<div style="overflow-x:auto;margin:14px 0 12px">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead><tr><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Formula Type</th><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Linked ESS Job</th></tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Participation and Rate Eligibility</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Participation Evaluation</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Coverage / Rate Determination</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Default Enrollment</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Certification Required</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Participation Evaluation</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Post Election Edit</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Close Enrollment</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Rate Periodization</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Participation Evaluation / Default Enrollment</td></tr>
</tbody>
</table>
</div>
<p style="font-size:13px;margin-bottom:0;color:#888;font-style:italic">Ref: Oracle Docs — Manage Benefits Processing and Uploads (R20B) • Benefits Fast Formula Reference Guide (MOS 1456985.1)</p>

<!-- HCM EXTRACT -->
<div style="font-size:19px;font-weight:700;color:#1a1a1a;margin:32px 0 12px">HCM Extract</div>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a"><strong>Where to check:</strong> Scheduled Processes > Extract run > Download Log. <strong>Prerequisite — GMFZT:</strong> Manage Payroll Process Configuration > <strong>Default Group</strong> tab > "+" > <strong>Logging Category Detailed</strong> = <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GMFZT</code>. Remove after testing — impacts performance. <strong>Known issue:</strong> ESS_LOG_WRITE may produce blank output in Extract Rule FFs — regenerate the extract (Refine HCM Extracts > Select > Generate).</p>

<div style="overflow-x:auto;margin:14px 0 12px">
<table style="width:100%;border-collapse:collapse;font-size:14px">
<thead><tr><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Formula Type</th><th style="background:#2c3e50;color:#fff;padding:8px 12px;text-align:left;font-size:12px;letter-spacing:0.5px">Linked ESS Job</th></tr></thead>
<tbody>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Extract Rule</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Run Extract (Data Exchange > Submit Extracts)</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Extract Criteria</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Run Extract</td></tr>
<tr><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Extract Advanced Condition</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Run Extract</td></tr>
<tr style="background:#faf8f5"><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;color:#333">Extract Record</td><td style="padding:8px 12px;border-bottom:1px solid #e0dcd6;font-weight:600;color:#1a1a1a">Run Extract</td></tr>
</tbody>
</table>
</div>
<p style="font-size:13px;margin-bottom:0;color:#888;font-style:italic">Ref: Oracle Docs — HCM Extracts • fusionhcmknowledgebase.com — "Configure GMFZT Logging for HCM Extract" • Cloud Customer Connect — "Extract Rule FF has debug ess_log_write"</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0">

<!-- ============================================================ -->
<!-- SECTION 4: TALENT & ADD_RLOG -->
<!-- ============================================================ -->
<div style="font-size:13px;font-weight:700;color:#c0392b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Section 4</div>
<div style="font-size:24px;font-weight:700;color:#1a1a1a;margin:0 0 24px;padding-left:16px;border-left:4px solid #c0392b;line-height:1.3">Talent Management & A Note on ADD_RLOG</div>

<!-- TALENT -->
<div style="font-size:19px;font-weight:700;color:#1a1a1a;margin:28px 0 12px">Talent Management (Performance, Goals, Checklist)</div>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a">No ESS process. UI-triggered — the formula fires when a manager calculates ratings in a performance document or when a checklist task is evaluated. <strong>ESS_LOG_WRITE does nothing here.</strong> Community blogs report <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_RLOG(-123456, seq, 'message')</code> works for Performance Rating and Checklist formulas — but test it for your specific formula type first.</p>

<p style="font-size:13px;margin-bottom:0;color:#888;font-style:italic">Ref: Oracle Docs — "How You Use Fast Formulas in Performance Documents" (24D) • iavinash.com — "How to Debug Any Oracle Fast Formula Like a Pro" • fusionhcmforest.com — "Debugging Fast Formula when logs are not generating"</p>

<!-- ADD_RLOG NOTE -->
<div style="font-size:19px;font-weight:700;color:#1a1a1a;margin:32px 0 12px">A Note on ADD_RLOG</div>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ADD_RLOG</code> is an OTL function that writes to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_RULE_FF_WORK_LOG</code>. Community blogs call it a "universal debugger" — but that's not entirely accurate. <strong>It works for many formula types, but not all.</strong></p>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a"><strong>Confirmed to work:</strong> OTL formulas (native), Compensation Default and Validation, Checklist, HCM Extract Rule, Performance Rating Calculation. <strong>Reported NOT working:</strong> Participation and Rate Eligibility (Benefits) — per Cloud Customer Connect (May 2025). Oracle has never officially documented ADD_RLOG as a cross-module function.</p>

<p style="font-size:15px;margin-bottom:18px;color:#2a2a2a"><strong>Bottom line:</strong> If ESS_LOG_WRITE doesn't work and you want to try ADD_RLOG — test it. If the formula compiles and logs appear in <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_RULE_FF_WORK_LOG</code>, you're good. If not, it's not supported for that formula type.</p>

<p style="font-size:13px;margin-bottom:0;color:#888;font-style:italic">Ref: Cloud Customer Connect — "How to enable Logging in Fast formulas" (May 2025) • apps2fusion.com — Ashish Harbhajanka</p>

<hr style="border:none;border-top:1px solid #e0dcd6;margin:35px 0">

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a">Hope this helps.</p>

<!-- FOOTER AUTHOR -->
<div style="display:flex;align-items:center;gap:16px;padding-top:25px;border-top:2px solid #1a1a1a;margin-top:40px">
<div style="width:65px;height:65px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:22px;flex-shrink:0">AM</div>
<div>
<div style="font-size:18px;font-weight:700">Abhishek Mohanty</div>
<div style="font-size:14px;color:#666;line-height:1.6">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Time & Labor, Core HR, Redwood, HDL, OTBI.</div>
</div>
</div>

</div>