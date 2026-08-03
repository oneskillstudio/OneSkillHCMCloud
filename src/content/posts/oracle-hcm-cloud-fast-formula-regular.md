---
title: "Oracle HCM Cloud Fast Formula: Regular and OT Bucket Allocation in a TCR — The Day-Type Branch, the l_total Threshold Cascade, and the l_ot_counter Tracking Pattern"
pubDate: 2026-07-02
description: "Oracle HCM Cloud Fast Formula: Regular and OT Bucket Allocation in a TCR — The Day-Type Branch, the l_total Threshold Cascade, and the l_ot_counter..."
tags: ["Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 820px; margin: 0 auto; color: #2d2926; line-height: 1.65; font-size: 17px;">

<!-- ============ HEADER ============ -->
<div style="border-left: 4px solid #8b2e2a; padding-left: 20px; margin: 32px 0 40px 0;">
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-weight: 500;">ORACLE HCM CLOUD · TCR DEEP DIVE · PART 5 OF 12</div>
<h1 style="font-family: 'Source Sans 3', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.25; color: #2d2926;">Oracle HCM Cloud Fast Formula: Regular and OT Bucket Allocation in a TCR — The Day-Type Branch, the l_total Threshold Cascade, and the l_ot_counter Tracking Pattern</h1>
<div style="font-size: 18px; color: #5a5550; font-weight: 400; line-height: 1.5;">How the worked-time branch of the DETAIL iteration decides whether each hour goes to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_RegHours</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_OT_150_Hours</code>, or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_OT_200_Hours</code> — driven by the day type (PH / SAT / SUN / Weekday), the daily threshold compare against <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code>, and the spillover logic that splits a single entry across multiple buckets when it straddles a threshold.</div>
</div>

<!-- ============ TAG PILLS ============ -->
<div style="margin-bottom: 32px;">
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">FAST FORMULA</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">OTL</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">OVERTIME ALLOCATION</span>
<span style="display: inline-block; background: #8b2e2a; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">THRESHOLD CASCADE</span>
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
<p style="font-family: 'Source Sans 3', sans-serif; font-size: 19px; line-height: 1.6; color: #2d2926; margin: 0 0 24px 0;">Part 4 covered the absence side of the DETAIL fork — when <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType.exists(nidx)</code> returns true. This post covers the other side: when it returns false and the entry represents <strong>worked time</strong>. That's where the bulk of the TCR's allocation logic lives.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The worked-time branch has one job — decide which output bucket every hour belongs in. The decision rests on two inputs: the <strong>day type</strong> (public holiday, Saturday, Sunday, or weekday) determined via Part 2's day-type branching logic, and the <strong>running daily total</strong> held in <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code>. Day type controls which thresholds apply; <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> controls whether the current entry has already crossed them.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">A worked example threads the whole post: a single Wednesday on which a worker logs <strong>two DETAIL entries</strong> — a 4-hour morning shift (09:00–13:00) and an 8-hour afternoon shift (14:00–22:00), for a 12-hour day. The daily thresholds are 8 hours for Regular and 10 hours for OT 150%, above which everything is OT 200%. The formula's job is to split those 12 hours across three buckets correctly: 8 Regular, 2 OT 150%, 2 OT 200% — even though no single entry is split that way in isolation.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Worked-Time Branch — Where the DETAIL Decision Tree Leads</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Inside every DETAIL iteration, the formula first checks <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType.exists(nidx)</code>. If true, the absence branch (Part 4) fires. If false, control flows here — into a sequence of four steps that map an entry's hours onto the right output buckets:</p>

<!-- VIZ: FIGURE 01 — Worked-Time Branch Decision Tree -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 01 · CONTROL FLOW</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">The Worked-Time Branch in the Iteration Loop</div>
</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; text-align: right; padding-bottom: 2px; letter-spacing: 0.5px;">four sequential gates</div>
</div>

<div style="padding: 32px 24px 28px 24px; background: #faf8f5;">

<!-- Entry node -->
<div style="display: flex; justify-content: center; margin-bottom: 12px;">
<div style="background: #fff; border: 1px solid #d9c9b0; border-top: 3px solid #2d2926; padding: 12px 22px; text-align: center; box-shadow: 0 2px 4px rgba(45, 41, 38, 0.06); min-width: 280px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">DETAIL ITERATION (worked path)</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700;">aiRecPosition = 'DETAIL'</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #5a5550; margin-top: 4px;">AbsenceType.exists(nidx) = false</div>
</div>
</div>

<div style="text-align: center; color: #2d2926; font-size: 14px; margin: 4px 0;">▼</div>

<!-- Step 1: Determine day type -->
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #8b2e2a; padding: 12px 18px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(45, 41, 38, 0.04);">
<div style="display: flex; align-items: center; gap: 12px;">
<div style="width: 24px; height: 24px; background: #8b2e2a; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px; flex-shrink: 0;">1</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700;">DETERMINE DAY TYPE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600; margin-top: 1px;">Branch on PH / SAT / SUN / Weekday (per Part 2 logic)</div>
</div>
</div>
</div>

<div style="text-align: center; color: #8b2e2a; font-size: 14px; margin: 4px 0;">▼</div>

<!-- Step 2: Compute regular capacity -->
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #8b2e2a; padding: 12px 18px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(45, 41, 38, 0.04);">
<div style="display: flex; align-items: center; gap: 12px;">
<div style="width: 24px; height: 24px; background: #8b2e2a; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px; flex-shrink: 0;">2</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700;">COMPARE l_total VS THRESHOLDS</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600; margin-top: 1px;">Determine remaining Regular capacity and OT 150 capacity for the day</div>
</div>
</div>
</div>

<div style="text-align: center; color: #8b2e2a; font-size: 14px; margin: 4px 0;">▼</div>

<!-- Step 3: Allocate measure -->
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #8b2e2a; padding: 12px 18px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(45, 41, 38, 0.04);">
<div style="display: flex; align-items: center; gap: 12px;">
<div style="width: 24px; height: 24px; background: #8b2e2a; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px; flex-shrink: 0;">3</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700;">SPLIT MEASURE ACROSS BUCKETS</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600; margin-top: 1px;">Allocate first to Regular, spillover to OT 150, then OT 200</div>
</div>
</div>
</div>

<div style="text-align: center; color: #8b2e2a; font-size: 14px; margin: 4px 0;">▼</div>

<!-- Step 4: Update counters -->
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #2d6b3f; padding: 12px 18px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(45, 41, 38, 0.04);">
<div style="display: flex; align-items: center; gap: 12px;">
<div style="width: 24px; height: 24px; background: #2d6b3f; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px; flex-shrink: 0;">4</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #1f4d2c; letter-spacing: 1.5px; font-weight: 700;">UPDATE l_total AND l_ot_counter</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600; margin-top: 1px;">Advance the daily total and OT-allocated counter for the next iteration</div>
</div>
</div>
</div>

<div style="text-align: center; color: #2d2926; font-size: 14px; margin: 4px 0;">▼</div>

<!-- Output -->
<div style="display: flex; justify-content: center;">
<div style="background: #2d2926; color: #fff; padding: 12px 22px; text-align: center; box-shadow: 0 2px 4px rgba(45, 41, 38, 0.15); min-width: 280px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">OUTPUT BUCKETS UPDATED</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #fff; font-weight: 700;">RegHours · OT_150_Hours · OT_200_Hours</div>
</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Four gates fire in strict order. Skip step 1 and the wrong thresholds apply. Skip step 2 and you allocate hours that should have been OT into Regular. Skip step 4 and the next iteration sees stale state. Each gate is one or two lines of code — and each one matters.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Four-Way Day-Type Branch — One Rule Set Per Day Category</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Day type changes everything about allocation. The same worked hour on a Wednesday is Regular pay; on a Sunday it's OT at 200%; on a public holiday it's a different output bucket entirely. Part 2 covered the day-type detection logic (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_DATE_DAY_OF_WEEK</code>, the FRI-anchored weekly compare, and the holiday calendar lookup). Part 5 uses the result:</p>

<!-- VIZ: FIGURE 02 — Day-Type Matrix -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 02 · ALLOCATION RULES</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Multiplier Logic by Day Type</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">BRANCHES</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">4 day types</div>
</div>
</div>

<div style="padding: 28px 24px 24px 24px; background: #faf8f5;">

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">

<!-- WEEKDAY -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="background: #2d6b3f; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
<div style="width: 22px; height: 22px; background: #fff; color: #2d6b3f; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 11px;">W</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4e8d8; letter-spacing: 1.5px; font-weight: 600;">DAY TYPE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #fff; font-weight: 700;">Weekday (Mon–Fri)</div>
</div>
</div>
<div style="padding: 14px 14px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">CASCADE</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; line-height: 1.8;">
0 – 8 hrs   → <span style="color: #2d6b3f; font-weight: 700;">Regular</span><br>
8 – 10 hrs  → <span style="color: #d4a574; font-weight: 700;">OT 150%</span><br>
10+ hrs    → <span style="color: #8b2e2a; font-weight: 700;">OT 200%</span>
</div>
</div>
</div>

<!-- SATURDAY -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="background: #d4a574; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
<div style="width: 22px; height: 22px; background: #fff; color: #8a7038; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 11px;">S</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #6d4f1f; letter-spacing: 1.5px; font-weight: 600;">DAY TYPE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 700;">Saturday</div>
</div>
</div>
<div style="padding: 14px 14px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">RULE</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; line-height: 1.8;">
0+ hrs    → <span style="color: #d4a574; font-weight: 700;">OT 150%</span>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; margin-top: 10px; line-height: 1.5; font-style: italic;">Weekend day with elevated rate from the first hour. No Regular allocation possible.</div>
</div>
</div>

<!-- SUNDAY -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="background: #8b2e2a; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
<div style="width: 22px; height: 22px; background: #fff; color: #8b2e2a; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 11px;">S</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #f5ede0; letter-spacing: 1.5px; font-weight: 600;">DAY TYPE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #fff; font-weight: 700;">Sunday</div>
</div>
</div>
<div style="padding: 14px 14px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">RULE</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; line-height: 1.8;">
0+ hrs    → <span style="color: #8b2e2a; font-weight: 700;">OT 200%</span>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; margin-top: 10px; line-height: 1.5; font-style: italic;">Mandatory day of rest. All worked hours at the higher OT rate.</div>
</div>
</div>

<!-- PUBLIC HOLIDAY -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="background: #2d2926; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
<div style="width: 22px; height: 22px; background: #fff; color: #2d2926; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 11px;">P</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4a574; letter-spacing: 1.5px; font-weight: 600;">DAY TYPE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #fff; font-weight: 700;">Public Holiday</div>
</div>
</div>
<div style="padding: 14px 14px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">RULE</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; line-height: 1.8;">
0+ hrs    → <span style="color: #2d2926; font-weight: 700;">OT 200% (Holiday bucket)</span>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; margin-top: 10px; line-height: 1.5; font-style: italic;">Routes to a separate holiday output bucket downstream — payroll often pays this at a different rate than Sunday OT 200.</div>
</div>
</div>

</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Only the Weekday branch has a cascade across three buckets. SAT, SUN, and PH all route every worked hour to a single bucket — which makes them simpler to allocate, but more sensitive to day-type misdetection. Get day type wrong and an entire day's hours land in the wrong bucket.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The l_total Threshold Cascade — Where Each Hour Lands</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The Weekday branch is the only one with a true threshold cascade, so it's the one worth visualizing. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> holds the running daily total of worked hours (introduced in Part 3, reset at every <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> phase marker). The cascade asks one question for every incoming hour: <em>where is <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> sitting right now relative to the two thresholds?</em></p>

<!-- VIZ: FIGURE 03 — Threshold Cascade -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 03 · BUCKET ZONES</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">The Weekday Threshold Cascade</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">DAY TYPE</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">Weekday</div>
</div>
</div>

<div style="padding: 28px 28px 24px 28px; background: #faf8f5;">

<!-- Three-zone bar showing 0-12 hours with thresholds at 8 and 10 -->
<div style="position: relative; padding-top: 38px; padding-bottom: 4px;">

<!-- Threshold labels ABOVE bar -->
<!-- Threshold 1 at 8/12 = 66.67% -->
<div style="position: absolute; top: 0; left: 66.67%; transform: translateX(-50%);">
<div style="background: #2d6b3f; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; padding: 5px 10px; letter-spacing: 0.5px; white-space: nowrap; border-radius: 2px; box-shadow: 0 2px 4px rgba(45, 107, 63, 0.15);">REG CAP · 8 hrs</div>
<div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #2d6b3f; margin: 0 auto;"></div>
</div>
<!-- Threshold 2 at 10/12 = 83.33% -->
<div style="position: absolute; top: 0; left: 83.33%; transform: translateX(-50%);">
<div style="background: #8b2e2a; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; padding: 5px 10px; letter-spacing: 0.5px; white-space: nowrap; border-radius: 2px; box-shadow: 0 2px 4px rgba(139, 46, 42, 0.15);">OT 150 CAP · 10 hrs</div>
<div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid #8b2e2a; margin: 0 auto;"></div>
</div>

<!-- The 3-zone bar -->
<div style="display: flex; height: 60px; border: 1px solid #d9c9b0; position: relative; overflow: visible;">
<!-- Regular zone: 0-8 = 66.67% -->
<div style="background: linear-gradient(to bottom, #4f8c5e, #2d6b3f); width: 66.67%; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15);">REGULAR · 0 – 8 hrs</div>
<!-- OT 150 zone: 8-10 = 16.67% -->
<div style="background: linear-gradient(to bottom, #e0b683, #d4a574); width: 16.67%; display: flex; align-items: center; justify-content: center; color: #2d2926; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.1);">OT 150</div>
<!-- OT 200 zone: 10-12 = 16.67% -->
<div style="background: linear-gradient(to bottom, #a83833, #8b2e2a); width: 16.67%; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15);">OT 200</div>
</div>

<!-- Scale markers below -->
<div style="position: relative; height: 24px; margin-top: 6px;">
<div style="position: absolute; left: 0%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">0</div>
<div style="position: absolute; left: 16.67%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">2</div>
<div style="position: absolute; left: 33.33%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">4</div>
<div style="position: absolute; left: 50%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">6</div>
<div style="position: absolute; left: 66.67%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d6b3f; font-weight: 700;">8</div>
<div style="position: absolute; left: 83.33%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; font-weight: 700;">10</div>
<div style="position: absolute; left: 100%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">12 (hrs)</div>
</div>
</div>

<!-- Legend -->
<div style="display: flex; gap: 22px; margin-top: 28px; padding-top: 14px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a5550; letter-spacing: 0.3px; flex-wrap: wrap;">
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 16px; height: 14px; background: linear-gradient(to bottom, #4f8c5e, #2d6b3f);"></div>
<span><strong style="color: #2d2926;">Regular zone</strong> · Out_Measure_RegHours</span>
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 16px; height: 14px; background: linear-gradient(to bottom, #e0b683, #d4a574);"></div>
<span><strong style="color: #2d2926;">OT 150 zone</strong> · Out_Measure_OT_150_Hours</span>
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 16px; height: 14px; background: linear-gradient(to bottom, #a83833, #8b2e2a);"></div>
<span><strong style="color: #2d2926;">OT 200 zone</strong> · Out_Measure_OT_200_Hours</span>
</div>
</div>

<!-- Key insight -->
<div style="background: #faf6f0; border-left: 4px solid #d4a574; padding: 14px 18px; margin-top: 22px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">HOW TO READ THE CASCADE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55;">Each incoming worked hour is placed in the zone where <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> currently sits, then <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> advances by one. A single multi-hour entry whose measure straddles a threshold gets split — the part below the threshold goes to one bucket, the part above to the next. That's the spillover logic Figure 04 traces.</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The 8 and 10 thresholds are configuration values held in rule input parameters, not hardcoded. Different jurisdictions and contracts set different caps — the formula reads them via <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">get_rvalue_number(rule_id, 'DAILY_REG_CAP', 8)</code> at the top of the formula.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Spillover Logic — One Entry Crossing Multiple Thresholds</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The interesting case is when a single DETAIL entry's measure straddles a threshold. Walk through the worked example. The second entry is 8 hours long, but <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> already sits at 4 from the first entry. There are 4 hours of Regular capacity left, then 2 hours of OT 150 capacity, then everything above goes to OT 200. The 8-hour measure has to split three ways:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Compute remaining capacity in each zone */</span><br>
l_reg_remaining    <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">GREATEST</span>(0, l_daily_reg_cap - l_total)<br>
l_ot150_remaining <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">GREATEST</span>(0, l_daily_ot_cap - <span style="color: #8b2e2a; font-weight: 700;">GREATEST</span>(l_total, l_daily_reg_cap))<br>
l_remaining <span style="color: #8b2e2a; font-weight: 700;">=</span> l_measure<br><br>
<span style="color: #8a7560; font-style: italic;">/* Regular portion */</span><br>
l_reg_alloc <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">LEAST</span>(l_remaining, l_reg_remaining)<br>
Out_Measure_RegHours <span style="color: #8b2e2a; font-weight: 700;">=</span> Out_Measure_RegHours + l_reg_alloc<br>
l_total      <span style="color: #8b2e2a; font-weight: 700;">=</span> l_total + l_reg_alloc<br>
l_remaining <span style="color: #8b2e2a; font-weight: 700;">=</span> l_remaining - l_reg_alloc<br><br>
<span style="color: #8a7560; font-style: italic;">/* OT 150 portion */</span><br>
l_ot150_alloc <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">LEAST</span>(l_remaining, l_ot150_remaining)<br>
Out_Measure_OT_150_Hours <span style="color: #8b2e2a; font-weight: 700;">=</span> Out_Measure_OT_150_Hours + l_ot150_alloc<br>
l_total      <span style="color: #8b2e2a; font-weight: 700;">=</span> l_total + l_ot150_alloc<br>
l_ot_counter <span style="color: #8b2e2a; font-weight: 700;">=</span> l_ot_counter + l_ot150_alloc<br>
l_remaining <span style="color: #8b2e2a; font-weight: 700;">=</span> l_remaining - l_ot150_alloc<br><br>
<span style="color: #8a7560; font-style: italic;">/* OT 200 portion — whatever is left */</span><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_remaining > 0) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  Out_Measure_OT_200_Hours <span style="color: #8b2e2a; font-weight: 700;">=</span> Out_Measure_OT_200_Hours + l_remaining<br>
  l_total      <span style="color: #8b2e2a; font-weight: 700;">=</span> l_total + l_remaining<br>
  l_ot_counter <span style="color: #8b2e2a; font-weight: 700;">=</span> l_ot_counter + l_remaining<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">LEAST</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GREATEST</code> are delivered Fast Formula functions — they're the idiomatic way to clamp values without nested IF blocks. The pattern reads as: "give the current zone as much as it can take, then move on." Figure 04 traces every step:</p>

<!-- VIZ: FIGURE 04 — Allocation Trace -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 04 · ALLOCATION TRACE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">A 12-Hour Wednesday Across Two Entries</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">TOTAL</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">12 hrs worked</div>
</div>
</div>

<div style="padding: 24px 24px 20px 24px; background: #faf8f5; overflow-x: auto;">

<table style="border-collapse: separate; border-spacing: 0; font-family: 'JetBrains Mono', monospace; font-size: 12px; width: 100%; background: #fff; border: 1px solid #d9c9b0; min-width: 720px;">
<thead>
<tr>
<th style="padding: 12px 14px; text-align: left; background: #2d2926; color: #d4a574; font-weight: 700; font-size: 10px; letter-spacing: 1.5px; border-bottom: 2px solid #8b2e2a;">STEP</th>
<th style="padding: 12px 10px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #8b2e2a;">l_total<br>(start)</th>
<th style="padding: 12px 10px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #8b2e2a;">REG<br>alloc</th>
<th style="padding: 12px 10px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #8b2e2a;">OT 150<br>alloc</th>
<th style="padding: 12px 10px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #8b2e2a;">OT 200<br>alloc</th>
<th style="padding: 12px 10px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; border-bottom: 2px solid #8b2e2a;">l_total<br>(end)</th>
</tr>
</thead>
<tbody>
<tr style="background: #faf6f0;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8a847d;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700;">ENTRY 1</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">09:00–13:00 · 4 hrs</div>
</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 700;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #ddebe1; color: #2d6b3f; font-weight: 700;">+4</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #c4b298; font-style: italic;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #c4b298; font-style: italic;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 700;">4</td>
</tr>
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #2d6b3f;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #1f4d2c; letter-spacing: 1px; font-weight: 700;">ENTRY 2 · PASS 1</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">Regular fill (4→8)</div>
</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">4</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #ddebe1; color: #2d6b3f; font-weight: 700;">+4</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #c4b298; font-style: italic;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #c4b298; font-style: italic;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 700;">8</td>
</tr>
<tr style="background: #faf8f5;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #d4a574;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; letter-spacing: 1px; font-weight: 700;">ENTRY 2 · PASS 2</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">OT 150 fill (8→10)</div>
</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">8</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #c4b298; font-style: italic;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faedd8; color: #8a7038; font-weight: 700;">+2</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #c4b298; font-style: italic;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 700;">10</td>
</tr>
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8b2e2a;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700;">ENTRY 2 · PASS 3</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">OT 200 fill (10→12)</div>
</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">10</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #c4b298; font-style: italic;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #c4b298; font-style: italic;">0</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #f0d6d4; color: #8b2e2a; font-weight: 700;">+2</td>
<td style="padding: 12px 10px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 700;">12</td>
</tr>
<tr style="background: #2d2926;">
<td style="padding: 12px 14px; border-left: 4px solid #d4a574;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4a574; letter-spacing: 1px; font-weight: 700;">END_DAY</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #fff; font-weight: 700; margin-top: 2px;">Final totals</div>
</td>
<td style="padding: 12px 10px; text-align: center; color: #c4bdb5;">12</td>
<td style="padding: 12px 10px; text-align: center; color: #fff; font-weight: 700;">8</td>
<td style="padding: 12px 10px; text-align: center; color: #fff; font-weight: 700;">2</td>
<td style="padding: 12px 10px; text-align: center; color: #fff; font-weight: 700;">2</td>
<td style="padding: 12px 10px; text-align: center; color: #d4a574; font-weight: 700;">→ reset</td>
</tr>
</tbody>
</table>

<!-- Conservation invariant -->
<div style="background: #faf6f0; border-left: 4px solid #d4a574; padding: 14px 18px; margin-top: 22px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">CONSERVATION INVARIANT</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55;">At every step: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">REG + OT_150 + OT_200 = sum of measures consumed</code>. Final totals: 8 + 2 + 2 = 12, matching the worked-time input exactly. No hour is double-counted; no hour is dropped.</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Entry 2 fires three internal passes — not three loop iterations. The DETAIL iteration for nidx=2 runs the spillover allocation block once; the block itself does the three-stage split using <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">LEAST</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GREATEST</code> arithmetic.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The l_ot_counter — A Running Tally for the Downstream Cascade</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Alongside <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code>, the formula maintains a second running counter: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_ot_counter</code>. It increments only when OT hours (150 or 200) are allocated. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> tracks how much was worked; <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_ot_counter</code> tracks how much of that was OT.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">Why a separate counter? Because Part 9 introduces a twelve-tier OT_200_counter cascade that fires once for every cumulative OT hour accumulated across the period — and that cascade needs an exact running count, not a derived value. Maintaining the counter inline during allocation is cheaper than recomputing it later from the output buckets.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">Unlike <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_ot_counter</code> is <strong>not</strong> reset at <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code>. It accumulates across the entire period because the downstream cascade is period-level, not daily.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Output Buckets — Where Worked Hours Land</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Three output arrays capture the worked-time classification for the period. Together with the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_*</code> buckets from Part 4, they form the complete picture of compensable time the formula returns to payroll:</p>

<!-- VIZ: FIGURE 05 — Worked-Time Output Bucket Reference -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 05 · OUTPUT REFERENCE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Worked-Time Output Buckets</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">BUCKETS</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">3 worked-time</div>
</div>
</div>

<div style="padding: 28px 24px 24px 24px; background: #faf8f5;">

<div style="display: grid; grid-template-columns: 1fr; gap: 14px;">

<!-- Out_Measure_RegHours -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="display: grid; grid-template-columns: 200px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #2d6b3f;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #2d6b3f; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">R</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; font-weight: 700;">Out_Measure_RegHours</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Hours at standard rate</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #2d6b3f; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #2d6b3f; border-radius: 2px;">BASE</div>
</div>
<div style="padding: 16px 18px;">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FED BY</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Hours where <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> sits below the daily Regular cap. Weekday days only — SAT/SUN/PH never feed this bucket.</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">EXAMPLE VALUE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">8 hrs after the 12-hour Wednesday — the first 8 hours of worked time.</div>
</div>
</div>
</div>
</div>

<!-- Out_Measure_OT_150_Hours -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="display: grid; grid-template-columns: 200px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #d4a574;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #d4a574; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">★</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; font-weight: 700;">Out_Measure_OT_150_Hours</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Overtime at 150% rate</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #d4a574; border-radius: 2px;">FIRST-TIER OT</div>
</div>
<div style="padding: 16px 18px;">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FED BY</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Weekday hours where <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> sits between the Reg cap and the OT cap, plus all Saturday hours, plus the absence back-fill (Part 4).</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">EXAMPLE VALUE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">2 hrs from the Wednesday cascade — hours 9 and 10 of the worked day.</div>
</div>
</div>
</div>
</div>

<!-- Out_Measure_OT_200_Hours -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="display: grid; grid-template-columns: 200px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #8b2e2a;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #8b2e2a; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">★★</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; font-weight: 700;">Out_Measure_OT_200_Hours</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Overtime at 200% rate</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #8b2e2a; border-radius: 2px;">SECOND-TIER OT</div>
</div>
<div style="padding: 16px 18px;">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FED BY</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Weekday hours above the OT cap, plus all Sunday hours, plus all Public Holiday hours. Feeds the Part 9 cascade trigger.</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">EXAMPLE VALUE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">2 hrs from the Wednesday cascade — hours 11 and 12 of the worked day.</div>
</div>
</div>
</div>
</div>

</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Three worked-time buckets, three rates. Add the two absence buckets from Part 4 and that's the full set of outputs the worked-time and absence branches produce. The next two parts add night-surcharge and night-overtime detection on top of these — without modifying any of the existing bucket allocations.</div>
</div>
</div>

</div>

<!-- ============ NEXT UP ============ -->
<div style="background: #2d2926; color: #fff; padding: 32px; margin: 48px 0 24px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #d4a574; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">NEXT IN THE SERIES</div>
<h3 style="font-family: 'Source Sans 3', sans-serif; margin: 0 0 8px 0; font-size: 22px; color: #fff; font-weight: 700;">Part 6 — Night Surcharge Detection with the Night-Time Code Match and the Monthly Night Accumulator</h3>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; color: #c4bdb5; line-height: 1.5; font-size: 15px;">A second classification layered on top of the day-type allocation — how the formula identifies night-time hours by matching <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType</code> against a configured night-time code, why <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_daily_night_total</code> resets on <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> while <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_night_total</code> doesn't, and how night-surcharge hours stack alongside the Reg/OT-150/OT-200 buckets without disturbing them.</p>
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
<div style="margin-bottom: 6px; font-weight: 500;">TCR DEEP DIVE · PART 5 / 10</div>
<div>Series tag: <span style="color: #8b2e2a; font-weight: 500;">#TCRDeepDive</span></div>
</div>

</div>