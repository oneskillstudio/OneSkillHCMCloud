---
title: "Oracle HCM Cloud Fast Formula: Absence Integration in a TCR — The AbsenceType Array, the GET_VALUE_SET Claim Lookup, and the Back-Fill WHILE Loop"
pubDate: 2026-06-25
description: "Oracle HCM Cloud Fast Formula: Absence Integration in a TCR — The AbsenceType Array, the GET_VALUE_SET Claim Lookup, and the Back-Fill WHILE Loop"
tags: ["Absence Management", "Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 820px; margin: 0 auto; color: #2d2926; line-height: 1.65; font-size: 17px;">

<!-- ============ HEADER ============ -->
<div style="border-left: 4px solid #8b2e2a; padding-left: 20px; margin: 32px 0 40px 0;">
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-weight: 500;">ORACLE HCM CLOUD · TCR DEEP DIVE · PART 4 OF 12</div>
<h1 style="font-family: 'Source Sans 3', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.25; color: #2d2926;">Oracle HCM Cloud Fast Formula: Absence Integration in a TCR — The AbsenceType Array, the GET_VALUE_SET Claim Lookup, and the Back-Fill WHILE Loop</h1>
<div style="font-size: 18px; color: #5a5550; font-weight: 400; line-height: 1.5;">How worked hours and absence hours share the same monthly bucket — the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType</code> array as a sparse parallel track, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_VALUE_SET</code> lookup that resolves the OT-eligibility claim, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_Cd</code> / <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_Hours</code> output buckets, and the retroactive <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE</code> loop that reclassifies regular hours as overtime when an absence pushes the worker over the monthly cap.</div>
</div>

<!-- ============ TAG PILLS ============ -->
<div style="margin-bottom: 32px;">
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">FAST FORMULA</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">OTL</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">ABSENCE MANAGEMENT</span>
<span style="display: inline-block; background: #8b2e2a; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">BACK-FILL PATTERN</span>
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
<p style="font-family: 'Source Sans 3', sans-serif; font-size: 19px; line-height: 1.6; color: #2d2926; margin: 0 0 24px 0;">A TCR doesn't only track worked hours. Absence hours — sick leave, vacation, jury duty, bereavement — flow through the same parallel-array iteration framework, share the same monthly threshold arithmetic, and end up affecting the same output buckets. The formula has to handle them as first-class citizens of the period, not as a parallel pipeline.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">This post walks through the absence integration pattern: how the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType</code> array surfaces absence entries to the TCR, how <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_VALUE_SET</code> resolves each absence to its OT-eligibility claim, how the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_*</code> output buckets carry the data downstream to payroll, and — the most interesting move in the whole formula — how the TCR retroactively reclassifies already-allocated regular hours as overtime when an absence pushes the worker over the monthly threshold.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">A single worked example threads through the post: a worker with <strong>156 worked hours</strong>, <strong>8 hours of OT-eligible absence</strong>, against a <strong>160 hour monthly threshold</strong>. Total counted time: 164 hours. The 4 hours over threshold have to become OT — but the absence portion can't be "OT" because it's not worked time. So four of the previously-allocated worked hours have to be reclassified.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">AbsenceType — The Sparse Track in the Parallel Array Stack</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Part 3 introduced the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_*</code> parallel-array family — multiple DBIs and input variables co-indexed by <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">nidx</code> so that position 1 across every track refers to the same timecard entry. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType</code> joins that stack as a sixth parallel track.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">It behaves differently from the worked-time tracks in one important way: it's <strong>sparse</strong>. The framework populates <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType[nidx]</code> only on positions that represent absence transactions. Worked-time entries leave it empty. Phase markers leave it empty. The first move inside the loop body — before any allocation logic fires — is checking whether this position is an absence.</p>

<!-- VIZ: FIGURE 01 — Extended parallel array with AbsenceType -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<!-- HEADER BAR -->
<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 01 · DATA STRUCTURE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">AbsenceType — The Sparse Track</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">POPULATED</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">1 of 6 cells</div>
</div>
</div>

<!-- BODY -->
<div style="padding: 24px 24px 20px 24px; background: #faf8f5; overflow-x: auto;">

<table style="border-collapse: separate; border-spacing: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; min-width: 720px; width: 100%; background: #fff; border: 1px solid #d9c9b0;">
<thead>
<tr>
<th style="padding: 12px 14px; text-align: left; background: #2d2926; color: #d4a574; font-weight: 700; font-size: 10px; letter-spacing: 1.5px; width: 220px; border-bottom: 2px solid #8b2e2a;">DBI · INPUT</th>
<th style="padding: 12px 8px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">
<div>nidx 1</div>
<div style="font-size: 9px; color: #8a847d; margin-top: 2px; font-weight: 500;">DETAIL</div>
</th>
<th style="padding: 12px 8px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">
<div>nidx 2</div>
<div style="font-size: 9px; color: #8a847d; margin-top: 2px; font-weight: 500;">DETAIL</div>
</th>
<th style="padding: 12px 8px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">
<div>nidx 3</div>
<div style="font-size: 9px; color: #d4a574; margin-top: 2px; font-weight: 700;">ABSENCE</div>
</th>
<th style="padding: 12px 8px; text-align: center; background: #6d2421; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">
<div>nidx 4</div>
<div style="font-size: 9px; color: #f5ede0; margin-top: 2px; font-weight: 500;">END_DAY</div>
</th>
</tr>
</thead>
<tbody>
<tr style="background: #faf6f0;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8b2e2a;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700;">PHASE TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">HWM_CTXARY_RECORD_POSITIONS</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">DETAIL</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">DETAIL</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">DETAIL</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #f5ede0; color: #8b2e2a; font-weight: 700;">END_DAY</td>
</tr>
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #2d6b3f;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #1f4d2c; letter-spacing: 1px; font-weight: 700;">MEASURE TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">measure</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 600;">3.0</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 600;">5.0</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 600;">8.0</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
<tr style="background: #faf8f5;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #5a8fa3;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #4a7286; letter-spacing: 1px; font-weight: 700;">TIME TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">StartTime</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">09:00</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">13:00</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8a7560;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #6d5b48; letter-spacing: 1px; font-weight: 700;">CLASSIFICATION</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">PayrollTimeType</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">Regular</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">Regular</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
<tr style="background: #faf6f0;">
<td style="padding: 12px 14px; border-left: 4px solid #d4a574;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; letter-spacing: 1px; font-weight: 700;">ABSENCE TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">AbsenceType</div>
</td>
<td style="padding: 12px 8px; text-align: center; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; background: #fff5dc; color: #8a7038; font-weight: 700; border: 2px solid #d4a574;">SICK</td>
<td style="padding: 12px 8px; text-align: center; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
</tbody>
</table>

<div style="display: flex; gap: 20px; margin-top: 18px; padding-top: 14px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a5550; letter-spacing: 0.3px; flex-wrap: wrap;">
<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 4px; height: 14px; background: #d4a574;"></div><strong style="color: #2d2926;">ABSENCE TRACK — sparse, populated only on absence entries</strong></div>
</div>
</div>

<!-- FOOTER CAPTION -->
<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">At <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">nidx 3</code> the worker has 8 hours of sick leave. The measure track carries the duration, but the time tracks and classification track are empty — absence entries don't have a start/stop time the way worked entries do. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType[3] = 'SICK'</code> is the only signal that distinguishes this position from a worked entry.</div>
</div>
</div>

</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The detection pattern is a straightforward <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.EXISTS()</code> check at the top of the loop body:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'DETAIL'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  <span style="color: #8b2e2a; font-weight: 700;">IF</span> (AbsenceType.<span style="color: #8b2e2a; font-weight: 700;">exists</span>(nidx)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
  (<br>
    l_absence_code   <span style="color: #8b2e2a; font-weight: 700;">=</span> AbsenceType[nidx]<br>
    l_absence_hours  <span style="color: #8b2e2a; font-weight: 700;">=</span> measure[nidx]<br>
    <span style="color: #8a7560; font-style: italic;">/* Absence branch — claim lookup + bucket population */</span><br>
  )<br>
  <span style="color: #8b2e2a; font-weight: 700;">ELSE</span><br>
  (<br>
    <span style="color: #8a7560; font-style: italic;">/* Worked-time branch — covered in Part 5 */</span><br>
  )<br>
)
</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Absence Claim ID Lookup with GET_VALUE_SET</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Detecting that an entry is an absence is only the first step. Not every absence counts toward the worker's OT calculation — that's a configuration decision, defined per absence type and per worker eligibility profile. Sick leave might count toward the monthly cap. Unpaid leave might not. Bereavement might be excluded entirely.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The TCR resolves this through a value-set lookup that takes the worker's person ID and the absence type code, and returns the <strong>absence claim ID</strong> — a reference to the OT plan configuration that governs how this particular absence interacts with threshold arithmetic. A non-zero return means the absence is OT-eligible and should accumulate toward the monthly bucket. A zero return means it flows to the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_*</code> buckets for payroll but is excluded from the OT calculation.</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
l_params <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'|=P_PERSON_ID='''</span>  || <span style="color: #8b2e2a; font-weight: 700;">TO_CHAR</span>(l_person_id)<br>
        || <span style="color: #2d6b3f;">'''|P_ABS_CODE='''</span> || l_absence_code || <span style="color: #2d6b3f;">''''</span><br><br>
l_abs_claim_id <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">TO_NUMBER</span>(<span style="color: #8b2e2a; font-weight: 700;">GET_VALUE_SET</span>(<span style="color: #2d6b3f;">'XX_ABS_CLAIM_LOOKUP_VS'</span>, l_params))<br><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_abs_claim_id > 0) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  l_is_ot_eligible <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'Y'</span><br>
)<br>
<span style="color: #8b2e2a; font-weight: 700;">ELSE</span><br>
(<br>
  l_is_ot_eligible <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'N'</span><br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The value set itself joins the absence plan configuration tables against the worker's plan enrollment, returning the claim ID if a match exists and zero otherwise. Keeping the SQL inside the value set (rather than inside the formula) lets the database optimizer cache the query plan and lets administrators update eligibility rules without touching the Fast Formula.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Populating the Out_Abs Output Buckets</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Two output arrays carry absence data out of the TCR and into downstream payroll processing:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 10px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_Cd[nidx]</code> — the absence type code (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'SICK'</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'VAC'</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'BEREAVE'</code>) so the payroll element for that absence type fires.</li>
<li style="margin-bottom: 10px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_Hours[nidx]</code> — the absence duration so the element receives a quantity to pay.</li>
</ul>

<p style="font-family: 'Source Sans 3', sans-serif;">Both arrays are populated unconditionally for every detected absence entry, regardless of whether the absence is OT-eligible. The payroll downstream needs both values to issue absence pay; OT eligibility only affects the threshold arithmetic.</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
Out_Abs_Cd[nidx]    <span style="color: #8b2e2a; font-weight: 700;">=</span> l_absence_code<br>
Out_Abs_Hours[nidx] <span style="color: #8b2e2a; font-weight: 700;">=</span> l_absence_hours
</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Monthly Accumulator — Why Absence Hours Count Toward OT</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">This is the design choice that catches most engineers off guard the first time they trace through the formula: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_regular</code> accumulates <strong>both worked hours and OT-eligible absence hours</strong>. Not just worked hours.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The reasoning is regulatory. Many OT regimes treat paid absence as "working time" for the purpose of calculating whether a worker has exceeded the period threshold — the rationale being that the worker would have been earning regular hours during that time if they hadn't been on leave, so excluding leave from the threshold would unfairly punish workers who take statutory time off. The TCR encodes this by adding eligible-absence hours to the same period accumulator that tracks worked hours:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_is_ot_eligible <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'Y'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  l_period_regular <span style="color: #8b2e2a; font-weight: 700;">=</span> l_period_regular + l_absence_hours<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The same line gets executed during the worked-time branch (covered in Part 5) for each worked hour. By the time the loop reaches <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_PERIOD</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_regular</code> holds the combined total: worked + OT-eligible-absence.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Threshold Crossover Problem</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Walk through the worked example. The worker accumulates:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 8px;"><strong>156 worked hours</strong> across the month, each one initially classified as Regular and added to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_RegHours</code> during DETAIL iterations.</li>
<li style="margin-bottom: 8px;"><strong>8 hours of sick leave</strong> entered on one day, OT-eligible (claim ID returned non-zero), added to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_regular</code> alongside the worked hours.</li>
<li style="margin-bottom: 8px;"><strong>Monthly threshold: 160 hours</strong>.</li>
</ul>

<p style="font-family: 'Source Sans 3', sans-serif;">Total combined time: 156 + 8 = <strong>164 hours</strong>. Over threshold by 4.</p>

<!-- VIZ: FIGURE 02 — Monthly Accumulator Projection -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 02 · THRESHOLD ARITHMETIC</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Monthly Hours vs Threshold</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">CAP</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">160 hrs</div>
</div>
</div>

<div style="padding: 28px 28px 24px 28px; background: #faf8f5;">

<!-- STAT CARDS — three key numbers at top -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 32px;">
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #8b2e2a; padding: 14px 16px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700;">WORKED</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #2d2926; font-weight: 700; margin-top: 4px; line-height: 1.1;">156<span style="font-size: 13px; color: #5a5550; font-weight: 500;"> hrs</span></div>
</div>
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #d4a574; padding: 14px 16px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700;">ABSENCE</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #2d2926; font-weight: 700; margin-top: 4px; line-height: 1.1;">8<span style="font-size: 13px; color: #5a5550; font-weight: 500;"> hrs</span></div>
</div>
<div style="background: #faf6f0; border: 1px solid #8b2e2a; border-left: 4px solid #8b2e2a; padding: 14px 16px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700;">OVER THRESHOLD</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #8b2e2a; font-weight: 700; margin-top: 4px; line-height: 1.1;">+4<span style="font-size: 13px; color: #5a5550; font-weight: 500;"> hrs</span></div>
</div>
</div>

<!-- THE BAR — rescaled 0-200 so threshold/total are not at the edge -->
<!-- On 0-200 scale: 156 = 78%, 8 = 4%, total 164 = 82%, threshold 160 = 80% -->
<div style="position: relative; padding-top: 36px; padding-bottom: 4px;">

<!-- Threshold marker label ABOVE the bar at 80% — plenty of horizontal room -->
<div style="position: absolute; top: 0; left: 80%; transform: translateX(-50%);">
<div style="background: #2d2926; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; padding: 5px 12px; letter-spacing: 0.5px; white-space: nowrap; border-radius: 2px; box-shadow: 0 2px 4px rgba(45, 41, 38, 0.15);">THRESHOLD · 160 hrs</div>
<!-- Small downward triangle/connector -->
<div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #2d2926; margin: 0 auto;"></div>
</div>

<!-- The bar itself -->
<div style="display: flex; height: 60px; background: #e8e3dd; border: 1px solid #d9c9b0; position: relative; overflow: visible;">
<!-- 156 worked = 78% -->
<div style="background: linear-gradient(to bottom, #a83833, #8b2e2a); width: 78%; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15);">156 hrs worked</div>
<!-- 8 absence = 4% -->
<div style="background: linear-gradient(to bottom, #e0b683, #d4a574); width: 4%; display: flex; align-items: center; justify-content: center; color: #2d2926; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.1);">8 abs</div>
<!-- Empty (remaining 18%) -->
<div style="flex: 1;"></div>

<!-- Threshold vertical line overlay at 80% — clean line through the bar -->
<div style="position: absolute; top: -4px; bottom: -4px; left: 80%; width: 2px; background: #2d2926; transform: translateX(-50%); box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5);"></div>
</div>

<!-- Scale markers below the bar -->
<div style="position: relative; height: 24px; margin-top: 6px;">
<!-- Tick at 0 -->
<div style="position: absolute; left: 0%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">0</div>
<!-- Tick at 40 = 20% -->
<div style="position: absolute; left: 20%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">40</div>
<!-- Tick at 80 = 40% -->
<div style="position: absolute; left: 40%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">80</div>
<!-- Tick at 120 = 60% -->
<div style="position: absolute; left: 60%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">120</div>
<!-- Tick at 160 = 80% — threshold position -->
<div style="position: absolute; left: 80%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d2926; font-weight: 700;">160</div>
<!-- Tick at 164 = 82% — actual total, in red -->
<div style="position: absolute; left: 82%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; font-weight: 700; top: 14px;">164</div>
<!-- Tick at 200 = 100% -->
<div style="position: absolute; left: 100%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">200</div>
</div>
</div>

<!-- Legend -->
<div style="display: flex; gap: 24px; margin-top: 24px; padding-top: 14px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a5550; letter-spacing: 0.3px; flex-wrap: wrap;">
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 16px; height: 14px; background: linear-gradient(to bottom, #a83833, #8b2e2a);"></div>
<span><strong style="color: #2d2926;">Worked hours</strong> · 156 hrs classified as Regular</span>
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 16px; height: 14px; background: linear-gradient(to bottom, #e0b683, #d4a574);"></div>
<span><strong style="color: #2d2926;">OT-eligible absence</strong> · 8 hrs of sick leave</span>
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 16px; height: 14px; background: #2d2926;"></div>
<span><strong style="color: #2d2926;">Threshold line</strong> · 160 hr cap</span>
</div>
</div>

<!-- Key insight callout -->
<div style="background: #faf6f0; border-left: 4px solid #d4a574; padding: 14px 18px; margin-top: 22px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">THE PROBLEM</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55;">The 4 over-threshold hours need to become OT 150% — but the absence portion can't be OT because it's not worked time. So four hours of the 156 already-classified worked hours must be reclassified from Regular to OT 150% by the back-fill WHILE loop at END_PERIOD.</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The formula doesn't know about the 8 hrs of sick leave until it reaches that <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">nidx</code> position — possibly long after the worked hours have already been allocated to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_RegHours</code>. The misclassification has to be corrected after the fact.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Back-Fill WHILE Loop — Retroactive Reclassification</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The correction happens at <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_PERIOD</code> — the final position in the iteration loop, where the formula has visibility into the total counted time. The over-threshold amount is computed, and a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE</code> loop runs that decrements <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_RegHours</code> and increments <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_OT_150_Hours</code> by an equal amount, one hour at a time, until the over-threshold amount has been fully redistributed:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'END_PERIOD'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  l_over_threshold <span style="color: #8b2e2a; font-weight: 700;">=</span> l_period_regular - l_monthly_threshold<br><br>
  <span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_over_threshold > 0) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
  (<br>
    l_remaining_adjustment <span style="color: #8b2e2a; font-weight: 700;">=</span> l_over_threshold<br><br>
    <span style="color: #8b2e2a; font-weight: 700;">WHILE</span> (l_remaining_adjustment > 0) <span style="color: #8b2e2a; font-weight: 700;">LOOP</span><br>
    (<br>
      Out_Measure_RegHours    <span style="color: #8b2e2a; font-weight: 700;">=</span> Out_Measure_RegHours - 1<br>
      Out_Measure_OT_150_Hours <span style="color: #8b2e2a; font-weight: 700;">=</span> Out_Measure_OT_150_Hours + 1<br>
      l_remaining_adjustment   <span style="color: #8b2e2a; font-weight: 700;">=</span> l_remaining_adjustment - 1<br>
    )<br>
  )<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The total worked hours stay constant — only the classification changes. 156 worked = (152 Regular) + (4 OT 150%). The 8 absence hours remain in their own buckets, untouched.</p>

<!-- VIZ: FIGURE 03 — Control flow showing absence branch -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 03 · CONTROL FLOW</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">The Absence Branch in the Iteration Loop</div>
</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; text-align: right; padding-bottom: 2px; letter-spacing: 0.5px;">detect → allocate → adjust</div>
</div>

<div style="padding: 32px 24px 28px 24px; background: #faf8f5;">

<!-- Starting node -->
<div style="display: flex; justify-content: center; margin-bottom: 14px;">
<div style="background: #fff; border: 1px solid #d9c9b0; border-top: 3px solid #2d2926; padding: 12px 22px; text-align: center; box-shadow: 0 2px 4px rgba(45, 41, 38, 0.06); min-width: 260px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">DETAIL ITERATION</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700;">aiRecPosition = 'DETAIL'</div>
</div>
</div>

<div style="text-align: center; color: #2d2926; font-size: 14px; margin: 4px 0;">▼</div>

<!-- Decision diamond -->
<div style="display: flex; justify-content: center; margin-bottom: 14px;">
<div style="background: #faf6f0; border: 1px solid #d4a574; padding: 12px 24px; text-align: center; min-width: 260px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">DECISION</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700;">AbsenceType.exists(nidx)?</div>
</div>
</div>

<!-- Branch markers -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
<div style="display: flex; justify-content: center; align-items: center; height: 24px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700;">YES ⤹ ABSENCE PATH</div>
</div>
<div style="display: flex; justify-content: center; align-items: center; height: 24px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700;">NO → WORKED PATH (Part 5)</div>
</div>
</div>

<!-- Two branches -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">

<!-- Absence path -->
<div style="background: #fff; border: 1px solid #d4a574; box-shadow: 0 1px 3px rgba(212, 165, 116, 0.1); overflow: hidden;">
<div style="background: #d4a574; padding: 10px 14px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #6d4f1f; letter-spacing: 1.5px; font-weight: 600;">ABSENCE BRANCH</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926; font-weight: 700;">Four steps fire in sequence</div>
</div>
<div style="padding: 14px 14px;">
<div style="background: #faf8f5; border-left: 3px solid #d4a574; padding: 8px 12px; margin-bottom: 6px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700;">STEP 1</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; margin-top: 2px;">GET_VALUE_SET claim lookup</div>
</div>
<div style="text-align: center; color: #d4a574; font-size: 12px; margin: 2px 0;">▼</div>
<div style="background: #faf8f5; border-left: 3px solid #d4a574; padding: 8px 12px; margin-bottom: 6px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700;">STEP 2</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; margin-top: 2px;">Populate Out_Abs_Cd, Out_Abs_Hours</div>
</div>
<div style="text-align: center; color: #d4a574; font-size: 12px; margin: 2px 0;">▼</div>
<div style="background: #faf8f5; border-left: 3px solid #d4a574; padding: 8px 12px; margin-bottom: 6px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700;">STEP 3</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; margin-top: 2px;">IF eligible → add to l_period_regular</div>
</div>
<div style="text-align: center; color: #d4a574; font-size: 12px; margin: 2px 0;">▼</div>
<div style="background: #faf8f5; border-left: 3px solid #d4a574; padding: 8px 12px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700;">STEP 4</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; margin-top: 2px;">Continue to next nidx</div>
</div>
</div>
</div>

<!-- Worked path placeholder -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="background: #8a847d; padding: 10px 14px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #c4bdb5; letter-spacing: 1.5px; font-weight: 600;">WORKED BRANCH</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #fff; font-weight: 700;">Covered in Part 5</div>
</div>
<div style="padding: 14px 14px; color: #5a5550; font-family: 'Source Sans 3', sans-serif; font-size: 13px; line-height: 1.55;">
The four-way day-type branch (PH/SAT/SUN/Weekday), the l_ovt_150 and l_ovt_200 calculation, and the l_OT_counter mechanics that determine which worked hours get classified as Regular versus OT during the DETAIL pass.
<div style="margin-top: 10px; font-size: 11px; font-style: italic; color: #8a847d;">Both branches converge at l_period_regular — the same period accumulator that drives the threshold check.</div>
</div>
</div>
</div>

<!-- Convergence -->
<div style="text-align: center; color: #2d2926; font-size: 14px; margin: 14px 0 8px 0;">▼</div>
<div style="display: flex; justify-content: center;">
<div style="background: #2d2926; color: #fff; padding: 12px 22px; text-align: center; box-shadow: 0 2px 4px rgba(45, 41, 38, 0.15); min-width: 260px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">AT END_PERIOD</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #fff; font-weight: 700;">Back-fill if l_period_regular > threshold</div>
</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The absence branch and the worked branch both feed the same accumulator — which is what makes the threshold compare at <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_PERIOD</code> meaningful. Decouple them and the OT calculation drifts.</div>
</div>
</div>

</div>

<!-- VIZ: FIGURE 04 — Back-fill iteration trace -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 04 · BACK-FILL TRACE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Step-by-Step Reclassification</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">ITERATIONS</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">4 to redistribute</div>
</div>
</div>

<div style="padding: 24px 24px 20px 24px; background: #faf8f5; overflow-x: auto;">

<table style="border-collapse: separate; border-spacing: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; width: 100%; background: #fff; border: 1px solid #d9c9b0; min-width: 600px;">
<thead>
<tr>
<th style="padding: 12px 14px; text-align: left; background: #2d2926; color: #d4a574; font-weight: 700; font-size: 10px; letter-spacing: 1.5px; border-bottom: 2px solid #8b2e2a;">ITERATION</th>
<th style="padding: 12px 12px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">l_remaining_adjustment</th>
<th style="padding: 12px 12px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">Out_Measure_RegHours</th>
<th style="padding: 12px 12px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">Out_Measure_OT_150_Hours</th>
</tr>
</thead>
<tbody>
<tr style="background: #faf6f0;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8a847d;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700;">ENTRY</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">Pre-loop state</div>
</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 700;">4</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 700;">156</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 700;">0</td>
</tr>
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8b2e2a;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700;">STEP 1</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">First swap</div>
</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">3</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">155</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d6b3f; font-weight: 600;">1</td>
</tr>
<tr style="background: #faf8f5;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8b2e2a;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700;">STEP 2</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">Second swap</div>
</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">2</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">154</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d6b3f; font-weight: 600;">2</td>
</tr>
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8b2e2a;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700;">STEP 3</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">Third swap</div>
</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">1</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">153</td>
<td style="padding: 12px 12px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d6b3f; font-weight: 600;">3</td>
</tr>
<tr style="background: #2d6b3f;">
<td style="padding: 12px 14px; border-left: 4px solid #1f4d2c;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4e8d8; letter-spacing: 1px; font-weight: 700;">STEP 4</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #fff; font-weight: 700; margin-top: 2px;">Final swap · LOOP EXITS</div>
</td>
<td style="padding: 12px 12px; text-align: center; color: #d4e8d8; font-weight: 700;">0</td>
<td style="padding: 12px 12px; text-align: center; color: #fff; font-weight: 700;">152</td>
<td style="padding: 12px 12px; text-align: center; color: #fff; font-weight: 700;">4</td>
</tr>
</tbody>
</table>

<div style="background: #faf6f0; border-left: 4px solid #d4a574; padding: 14px 18px; margin-top: 22px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">CONSERVATION INVARIANT</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55;">At every step: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_RegHours + Out_Measure_OT_150_Hours = 156</code>. Total worked hours never change. Only the classification mix shifts as hours migrate from Regular into OT 150%.</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The one-hour-at-a-time decrement looks inefficient — and at the formula level, it is. A single subtraction would produce the same final values. The iterative form exists because a higher-tier overtime cascade (Part 9) needs an intermediate trigger for each unit of OT 150 added.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Output Bucket Reference</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Four output buckets carry the full picture of the worker's month downstream to payroll. Each one represents a different category of compensable time, and the back-fill loop is what guarantees the four sums add up correctly:</p>

<!-- VIZ: FIGURE 05 — Output bucket reference cards -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 05 · OUTPUT REFERENCE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Where Each Hour Lands</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">BUCKETS</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">4 outputs</div>
</div>
</div>

<div style="padding: 28px 24px 24px 24px; background: #faf8f5;">

<div style="display: grid; grid-template-columns: 1fr; gap: 14px;">

<!-- Out_Abs_Cd -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="display: grid; grid-template-columns: 180px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #d4a574;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #d4a574; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">#</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700;">Out_Abs_Cd</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Absence type code per entry</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #d4a574; border-radius: 2px;">METADATA</div>
</div>
<div style="padding: 16px 18px;">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FIRES WHEN</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Absence detection inside the DETAIL branch.</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">CONSUMER</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Payroll element selector — picks the absence element by type code.</div>
</div>
</div>
</div>
</div>

<!-- Out_Abs_Hours -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="display: grid; grid-template-columns: 180px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #d4a574;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #d4a574; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">∑</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700;">Out_Abs_Hours</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Absence duration per entry</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #d4a574; border-radius: 2px;">QUANTITY</div>
</div>
<div style="padding: 16px 18px;">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FIRES WHEN</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Set to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">measure[nidx]</code> alongside the type code.</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">CONSUMER</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Quantity input to the absence payroll element — drives the pay calculation.</div>
</div>
</div>
</div>
</div>

<!-- Out_Measure_RegHours -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="display: grid; grid-template-columns: 180px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #2d6b3f;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #2d6b3f; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">R</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700;">Out_Measure_RegHours</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Regular worked hours (post-adjustment)</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #2d6b3f; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #2d6b3f; border-radius: 2px;">ADJUSTED</div>
</div>
<div style="padding: 16px 18px;">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FIRES WHEN</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Accumulates during DETAIL worked-time iterations, then decremented by the back-fill loop at END_PERIOD.</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FINAL VALUE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">152 hours (was 156 before reclassification).</div>
</div>
</div>
</div>
</div>

<!-- Out_Measure_OT_150_Hours -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="display: grid; grid-template-columns: 180px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #8b2e2a;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #8b2e2a; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">★</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700;">Out_Measure_OT_150_Hours</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Overtime at 150% rate</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #8b2e2a; border-radius: 2px;">BACK-FILLED</div>
</div>
<div style="padding: 16px 18px;">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FIRES WHEN</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Incremented by the back-fill WHILE loop and by direct worked-OT detection (Part 5).</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FINAL VALUE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">4 hours from this back-fill (more added in later parts).</div>
</div>
</div>
</div>
</div>

</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Four output buckets, two flows. The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_*</code> buckets carry absence data to payroll's absence pay calculation. The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_*</code> buckets carry worked-time classification to payroll's earnings element resolution. The back-fill loop is the bridge that keeps the worked-time buckets in sync with the threshold arithmetic.</div>
</div>
</div>

</div>

<!-- ============ NEXT UP ============ -->
<div style="background: #2d2926; color: #fff; padding: 32px; margin: 48px 0 24px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #d4a574; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">NEXT IN THE SERIES</div>
<h3 style="font-family: 'Source Sans 3', sans-serif; margin: 0 0 8px 0; font-size: 22px; color: #fff; font-weight: 700;">Part 5 — Regular and OT Bucket Allocation with the Day-Type Branch, l_ovt_150 / l_ovt_200, and the l_OT_counter Cascade</h3>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; color: #c4bdb5; line-height: 1.5; font-size: 15px;">The worked-time branch of the DETAIL iteration — how the formula decides, for every worked hour as it streams through the loop, whether to allocate it to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_RegHours</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_OT_150_Hours</code>, or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_OT_200_Hours</code> based on the day type (public holiday, Saturday, Sunday, weekday) and the running daily total.</p>
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
<div style="margin-bottom: 6px; font-weight: 500;">TCR DEEP DIVE · PART 4 / 10</div>
<div>Series tag: <span style="color: #8b2e2a; font-weight: 500;">#TCRDeepDive</span></div>
</div>

</div>