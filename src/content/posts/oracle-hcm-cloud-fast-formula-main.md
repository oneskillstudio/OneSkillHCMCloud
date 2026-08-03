---
title: "Oracle HCM Cloud Fast Formula: The Main Iteration Loop in a TCR — HWM_CTXARY Parallel Arrays, aiRecPosition Phase Markers, and the Defensive raise_error Guard"
pubDate: 2026-06-18
description: "Oracle HCM Cloud Fast Formula: The Main Iteration Loop in a TCR — HWM_CTXARY Parallel Arrays, aiRecPosition Phase Markers, and the Defensive..."
tags: ["Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 820px; margin: 0 auto; color: #2d2926; line-height: 1.65; font-size: 17px;">

<!-- ============ HEADER ============ -->
<div style="border-left: 4px solid #8b2e2a; padding-left: 20px; margin: 32px 0 40px 0;">
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-weight: 500;">ORACLE HCM CLOUD · TCR DEEP DIVE · PART 3 OF 12</div>
<h1 style="font-family: 'Source Sans 3', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.25; color: #2d2926;">Oracle HCM Cloud Fast Formula: The Main Iteration Loop in a TCR — HWM_CTXARY Parallel Arrays, aiRecPosition Phase Markers, and the Defensive raise_error Guard</h1>
<div style="font-size: 18px; color: #5a5550; font-weight: 400; line-height: 1.5;">How a Time Calculation Rule walks the timecard one entry at a time — the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_*</code> array DBI family, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.count</code> / <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.exists()</code> array methods, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DETAIL</code> / <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> phase fork, and the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">raise_error</code> safety net that catches runaway loops.</div>
</div>

<!-- ============ TAG PILLS ============ -->
<div style="margin-bottom: 32px;">
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">FAST FORMULA</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">OTL</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">TIME CALCULATION RULE</span>
<span style="display: inline-block; background: #8b2e2a; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">ARRAY DBIs</span>
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
<p style="font-family: 'Source Sans 3', sans-serif; font-size: 19px; line-height: 1.6; color: #2d2926; margin: 0 0 24px 0;">A TCR formula doesn't run once per worker. It runs once per <strong>measure period entry</strong> — and a single timecard week can produce dozens of those entries (start/stop pairs, breaks, absences, end-of-day markers, period summaries). The formula has to walk all of them, allocate hours into the right output buckets, and emerge with consistent totals.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The walking is done with a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE</code> loop over Oracle's <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_*</code> array database items. The arrays are <em>parallel</em>: position 1 in one array refers to the same timecard entry as position 1 in every other array. That single design choice shapes how the rest of the formula reads.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">This post walks through the iteration mechanics: how the arrays are sized, how positions are accessed safely, what the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">aiRecPosition</code> phase marker means at each step, and why every well-written TCR closes the loop with a defensive <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">raise_error</code> trap.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The HWM_CTXARY Array DBI Family — Per-Entry Data Surfaced as Parallel Tracks</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Oracle's Time and Labor framework exposes the current measure period's data to the formula as a set of <strong>indexed array DBIs</strong>, all named with the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_</code> prefix (HWM = Workforce Management, CTXARY = context array). Common members of the family:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_RECORD_POSITIONS</code> — text array; each cell holds a phase marker like <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'DETAIL'</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'END_DAY'</code>, or a higher-level boundary marker.</li>
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_HWM_MEASURE_DAY</code> — number array; the day-of-period to which each entry belongs (1, 2, 3 …).</li>
<li style="margin-bottom: 8px;">Per-entry input variables — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">measure</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StartTime</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StopTime</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType</code> — declared in the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">INPUTS ARE</code> block and exposed as arrays.</li>
</ul>

<p style="font-family: 'Source Sans 3', sans-serif;">All of them share the same indexing. Position 1 of <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">RECORD_POSITIONS</code> tells you the phase of timecard entry 1; position 1 of <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StartTime</code> tells you when that same entry began; position 1 of <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">measure</code> tells you its hour value. The loop's job is to step through positions 1 through N and assemble a per-entry picture from these parallel tracks.</p>

<!-- VIZ: TIMECARD → ARRAY FLATTENING -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<!-- HEADER BAR -->
<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 01 · DATA STRUCTURE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">The Flattening Transformation</div>
</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; text-align: right; padding-bottom: 2px; letter-spacing: 0.5px;">timecard → array</div>
</div>

<!-- BODY -->
<div style="padding: 32px 24px 24px 24px; background: #faf8f5;">

<!-- STAGE 1 LABEL -->
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
<div style="background: #8b2e2a; color: #fff; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 13px; flex-shrink: 0;">1</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700;">INPUT</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600; margin-top: 1px;">Calendar view — what the worker enters</div>
</div>
</div>

<!-- CALENDAR CARDS -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 8px; padding: 0 24px;">
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #8b2e2a; padding: 14px 14px; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.06);">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">DAY 3</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #2d2926; font-weight: 700;">09:00 – 12:00</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; margin-top: 6px;">3.0 hours · Regular</div>
</div>
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #8b2e2a; padding: 14px 14px; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.06);">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">DAY 3</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #2d2926; font-weight: 700;">13:00 – 17:00</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; margin-top: 6px;">4.0 hours · Regular</div>
</div>
<div style="background: #fff; border: 1px solid #d9c9b0; border-left: 4px solid #8b2e2a; padding: 14px 14px; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.06);">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">DAY 8</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #2d2926; font-weight: 700;">09:00 – 17:00</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; margin-top: 6px;">8.0 hours · Regular</div>
</div>
</div>

<!-- TRANSFORMATION DIVIDER -->
<div style="display: flex; align-items: center; gap: 14px; margin: 28px 0;">
<div style="flex: 1; height: 1px; background: linear-gradient(to right, transparent, #d9c9b0);"></div>
<div style="background: #8b2e2a; color: #fff; padding: 7px 16px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 2px; font-weight: 700; display: flex; align-items: center; gap: 10px; box-shadow: 0 2px 6px rgba(139, 46, 42, 0.2);">
<span style="font-size: 12px;">▼</span>
<span>FRAMEWORK FLATTENS · INSERTS PHASE MARKERS</span>
<span style="font-size: 12px;">▼</span>
</div>
<div style="flex: 1; height: 1px; background: linear-gradient(to left, transparent, #d9c9b0);"></div>
</div>

<!-- STAGE 2 LABEL -->
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 18px;">
<div style="background: #8b2e2a; color: #fff; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 13px; flex-shrink: 0;">2</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700;">OUTPUT</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600; margin-top: 1px;">Array view — what the TCR formula iterates over</div>
</div>
</div>

<!-- ARRAY POSITION CARDS -->
<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;">
<!-- nidx=1 DETAIL -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 2px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="background: #f5ede0; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #5a5550; padding: 4px 6px; letter-spacing: 0.5px; font-weight: 700; text-align: center;">nidx = 1</div>
<div style="padding: 10px 4px; text-align: center;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; font-weight: 700;">DETAIL</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #5a5550; margin-top: 4px;">3.0h</div>
</div>
</div>
<!-- nidx=2 DETAIL -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 2px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="background: #f5ede0; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #5a5550; padding: 4px 6px; letter-spacing: 0.5px; font-weight: 700; text-align: center;">nidx = 2</div>
<div style="padding: 10px 4px; text-align: center;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; font-weight: 700;">DETAIL</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #5a5550; margin-top: 4px;">4.0h</div>
</div>
</div>
<!-- nidx=3 END_DAY -->
<div style="background: #8b2e2a; border: 1px solid #8b2e2a; box-shadow: 0 1px 3px rgba(139, 46, 42, 0.15); overflow: hidden;">
<div style="background: #6d2421; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #f5ede0; padding: 4px 6px; letter-spacing: 0.5px; font-weight: 700; text-align: center;">nidx = 3</div>
<div style="padding: 10px 4px; text-align: center;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #fff; font-weight: 700;">END_DAY</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #f5ede0; margin-top: 4px; font-style: italic;">marker</div>
</div>
</div>
<!-- nidx=4 DETAIL -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 2px rgba(45, 41, 38, 0.04); overflow: hidden;">
<div style="background: #f5ede0; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #5a5550; padding: 4px 6px; letter-spacing: 0.5px; font-weight: 700; text-align: center;">nidx = 4</div>
<div style="padding: 10px 4px; text-align: center;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #2d2926; font-weight: 700;">DETAIL</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #5a5550; margin-top: 4px;">8.0h</div>
</div>
</div>
<!-- nidx=5 END_DAY -->
<div style="background: #8b2e2a; border: 1px solid #8b2e2a; box-shadow: 0 1px 3px rgba(139, 46, 42, 0.15); overflow: hidden;">
<div style="background: #6d2421; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #f5ede0; padding: 4px 6px; letter-spacing: 0.5px; font-weight: 700; text-align: center;">nidx = 5</div>
<div style="padding: 10px 4px; text-align: center;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #fff; font-weight: 700;">END_DAY</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #f5ede0; margin-top: 4px; font-style: italic;">marker</div>
</div>
</div>
<!-- nidx=6 END_PERIOD -->
<div style="background: #8b2e2a; border: 1px solid #8b2e2a; box-shadow: 0 1px 3px rgba(139, 46, 42, 0.15); overflow: hidden;">
<div style="background: #6d2421; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #f5ede0; padding: 4px 6px; letter-spacing: 0.5px; font-weight: 700; text-align: center;">nidx = 6</div>
<div style="padding: 10px 4px; text-align: center;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #fff; font-weight: 700;">END_PERIOD</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #f5ede0; margin-top: 4px; font-style: italic;">marker</div>
</div>
</div>
</div>

<!-- LEGEND -->
<div style="display: flex; gap: 24px; margin-top: 20px; padding-top: 16px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a5550; letter-spacing: 0.3px;">
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 14px; height: 14px; background: #fff; border: 1px solid #d9c9b0;"></div>
<span><strong style="color: #2d2926;">DETAIL</strong> — worked time entry with measure data</span>
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 14px; height: 14px; background: #8b2e2a;"></div>
<span><strong style="color: #2d2926;">Phase marker</strong> — boundary, no measure data</span>
</div>
</div>
</div>

<!-- FOOTER CAPTION -->
<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Three worked-time entries become six array positions. The framework inserts <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> between same-day entries and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_PERIOD</code> to close the iteration. Both carry no measure data — the reason every read inside the loop needs an <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.exists()</code> guard.</div>
</div>
</div>

</div>

<!-- VIZ: PARALLEL ARRAY VIEW -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<!-- HEADER BAR -->
<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 02 · DATA INDEX</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Parallel Arrays — One nidx, Many Tracks</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">SHARED INDEX</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">nidx = 1 … 6</div>
</div>
</div>

<!-- BODY -->
<div style="padding: 24px 24px 20px 24px; background: #faf8f5; overflow-x: auto;">

<!-- Section labels above table -->
<div style="display: grid; grid-template-columns: 220px 1fr; gap: 0; margin-bottom: 8px; font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 1.5px; font-weight: 700; color: #8a847d;">
<div>TRACK NAME</div>
<div style="text-align: center;">VALUE AT EACH POSITION</div>
</div>

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
<th style="padding: 12px 8px; text-align: center; background: #6d2421; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">
<div>nidx 3</div>
<div style="font-size: 9px; color: #f5ede0; margin-top: 2px; font-weight: 500;">END_DAY</div>
</th>
<th style="padding: 12px 8px; text-align: center; background: #2d2926; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">
<div>nidx 4</div>
<div style="font-size: 9px; color: #8a847d; margin-top: 2px; font-weight: 500;">DETAIL</div>
</th>
<th style="padding: 12px 8px; text-align: center; background: #6d2421; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">
<div>nidx 5</div>
<div style="font-size: 9px; color: #f5ede0; margin-top: 2px; font-weight: 500;">END_DAY</div>
</th>
<th style="padding: 12px 8px; text-align: center; background: #6d2421; color: #fff; font-weight: 700; font-size: 11px; border-bottom: 2px solid #8b2e2a;">
<div>nidx 6</div>
<div style="font-size: 9px; color: #f5ede0; margin-top: 2px; font-weight: 500;">END_PERIOD</div>
</th>
</tr>
</thead>
<tbody>
<!-- Phase track (foundational) -->
<tr style="background: #faf6f0;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #8b2e2a;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700;">PHASE TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">HWM_CTXARY_RECORD_POSITIONS</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">DETAIL</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">DETAIL</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #f5ede0; color: #8b2e2a; font-weight: 700;">END_DAY</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">DETAIL</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #f5ede0; color: #8b2e2a; font-weight: 700;">END_DAY</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #f5ede0; color: #8b2e2a; font-weight: 700;">END_PERIOD</td>
</tr>
<!-- Day track -->
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #d4a574;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; letter-spacing: 1px; font-weight: 700;">DAY TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">HWM_CTXARY_HWM_MEASURE_DAY</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">3</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">3</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">3</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">8</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">8</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
<!-- Time tracks -->
<tr style="background: #faf8f5;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #5a8fa3;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #4a7286; letter-spacing: 1px; font-weight: 700;">TIME TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">StartTime</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">09:00</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">13:00</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">09:00</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #5a8fa3;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #4a7286; letter-spacing: 1px; font-weight: 700;">TIME TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">StopTime</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">12:00</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">17:00</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926;">17:00</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
<!-- Measure track -->
<tr style="background: #faf8f5;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e8e3dd; border-left: 4px solid #2d6b3f;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #1f4d2c; letter-spacing: 1px; font-weight: 700;">MEASURE TRACK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">measure</div>
</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 600;">3.0</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 600;">4.0</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; color: #2d2926; font-weight: 600;">8.0</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; border-bottom: 1px solid #e8e3dd; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
<!-- Classification track -->
<tr style="background: #fff;">
<td style="padding: 12px 14px; border-left: 4px solid #8a7560;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #6d5b48; letter-spacing: 1px; font-weight: 700;">CLASSIFICATION</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-top: 2px;">PayrollTimeType</div>
</td>
<td style="padding: 12px 8px; text-align: center; color: #2d2926;">Regular</td>
<td style="padding: 12px 8px; text-align: center; color: #2d2926;">Regular</td>
<td style="padding: 12px 8px; text-align: center; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; color: #2d2926;">Regular</td>
<td style="padding: 12px 8px; text-align: center; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
<td style="padding: 12px 8px; text-align: center; background: #faf6f0; color: #c4b298; font-style: italic;">empty</td>
</tr>
</tbody>
</table>

<!-- Track-color legend -->
<div style="display: flex; gap: 20px; margin-top: 18px; padding-top: 14px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a5550; letter-spacing: 0.3px; flex-wrap: wrap;">
<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 4px; height: 14px; background: #8b2e2a;"></div><strong style="color: #2d2926;">PHASE</strong></div>
<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 4px; height: 14px; background: #d4a574;"></div><strong style="color: #2d2926;">DAY</strong></div>
<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 4px; height: 14px; background: #5a8fa3;"></div><strong style="color: #2d2926;">TIME</strong></div>
<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 4px; height: 14px; background: #2d6b3f;"></div><strong style="color: #2d2926;">MEASURE</strong></div>
<div style="display: flex; align-items: center; gap: 6px;"><div style="width: 4px; height: 14px; background: #8a7560;"></div><strong style="color: #2d2926;">CLASSIFICATION</strong></div>
</div>
</div>

<!-- FOOTER CAPTION -->
<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Read this table <strong style="color: #fff;">column by column</strong>, not row by row. Each column is a complete timecard entry assembled from its parallel array cells. Empty cells appear at every phase-marker column — the explicit visual signature of why <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.exists()</code> guards belong in the loop.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Array Cardinality with .count and the WHILE Loop Skeleton</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Fast Formula array DBIs expose a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.count</code> method that returns the number of populated positions. The TCR captures this once at the top and uses it as the loop's upper bound:</p>

<!-- CODE BLOCK - PAPER STYLE -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Capture the array bound once. Calling .count inside<br>
   the loop would re-resolve the DBI on every iteration. */</span><br>
wMaAry <span style="color: #8b2e2a; font-weight: 700;">=</span> HWM_CTXARY_RECORD_POSITIONS.<span style="color: #8b2e2a; font-weight: 700;">count</span><br>
nidx   <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br><br>
<span style="color: #8b2e2a; font-weight: 700;">WHILE</span> (nidx < wMaAry) <span style="color: #8b2e2a; font-weight: 700;">LOOP</span><br>
(<br>
  nidx <span style="color: #8b2e2a; font-weight: 700;">=</span> nidx + 1<br>
  aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> HWM_CTXARY_RECORD_POSITIONS[nidx]<br><br>
  <span style="color: #8a7560; font-style: italic;">/* ...per-entry processing... */</span><br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">A few details worth flagging:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 10px;"><strong>1-based indexing.</strong> Fast Formula arrays start at index 1, not 0. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">nidx = 0</code> with increment-then-access inside the loop yields positions 1, 2, 3 ... wMaAry — the increment happens <em>before</em> any array access, which is the safe pattern.</li>
<li style="margin-bottom: 10px;"><strong>Capture .count once.</strong> Reading <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">HWM_CTXARY_RECORD_POSITIONS.count</code> inside the loop condition would force the DBI to resolve on every iteration. Capturing it in <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">wMaAry</code> beforehand cuts the DBI resolution cost to one call. Oracle's own Fast Formula performance guidance specifically calls this out.</li>
<li style="margin-bottom: 10px;"><strong>No FOR loop in Fast Formula.</strong> The language has no <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">FOR i IN 1..N</code> construct. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE</code> with manual counter advance is the idiomatic substitute. Forgetting the increment is the most common cause of runaway loops — which is exactly the failure mode the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">raise_error</code> guard at the end of the loop catches.</li>
</ul>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Null-Safe Array Access with the .exists() Method</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Parallel arrays don't always carry data at every position. Look back at the visualization: at <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">nidx=3</code> the position is <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'END_DAY'</code> — a phase marker — but <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">measure</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StartTime</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StopTime</code> have no values there. Reading <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">measure[3]</code> directly would raise <em>"no data found"</em> and abort the rule.</p>

<!-- VIZ: SAFE VS UNSAFE ARRAY ACCESS -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<!-- HEADER BAR -->
<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 03 · CONTROL FLOW</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">A One-Line Guard, Two Outcomes</div>
</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; text-align: right; padding-bottom: 2px; letter-spacing: 0.5px;">measure[nidx] at END_DAY</div>
</div>

<!-- BODY -->
<div style="padding: 32px 24px 28px 24px; background: #faf8f5;">

<!-- STARTING NODE -->
<div style="display: flex; justify-content: center; margin-bottom: 14px;">
<div style="background: #fff; border: 1px solid #d9c9b0; border-top: 3px solid #2d2926; padding: 12px 22px; text-align: center; box-shadow: 0 2px 4px rgba(45, 41, 38, 0.06); min-width: 240px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">ITERATION ENTRY</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #2d2926; font-weight: 700;">nidx = 3</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8b2e2a; margin-top: 4px; font-weight: 600;">aiRecPosition = 'END_DAY'</div>
</div>
</div>

<!-- BRANCHING ARROWS -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
<div style="display: flex; justify-content: center; align-items: center; height: 28px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700;">⤹  DIRECT READ</div>
</div>
<div style="display: flex; justify-content: center; align-items: center; height: 28px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d6b3f; letter-spacing: 1.5px; font-weight: 700;">GUARDED READ  ⤸</div>
</div>
</div>

<!-- TWO BRANCHES -->
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">

<!-- LEFT: WITHOUT GUARD -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(139, 46, 42, 0.06); overflow: hidden;">

<!-- Branch header -->
<div style="background: #8b2e2a; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
<div style="width: 22px; height: 22px; background: #fff; color: #8b2e2a; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; border-radius: 11px;">!</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #f5ede0; letter-spacing: 1.5px; font-weight: 600;">PATH A</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #fff; font-weight: 700;">Without .exists() guard</div>
</div>
</div>

<!-- Branch body -->
<div style="padding: 16px 14px;">
<!-- Step 1 -->
<div style="background: #faf8f5; border-left: 3px solid #8b2e2a; padding: 10px 12px; margin-bottom: 6px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px;">STEP 1 · ACCESS</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926;">l_measure = measure[3]</div>
</div>
<div style="text-align: center; color: #8b2e2a; font-size: 14px; line-height: 1; margin: 4px 0;">▼</div>
<!-- Step 2 -->
<div style="background: #faf8f5; border-left: 3px solid #8b2e2a; padding: 10px 12px; margin-bottom: 6px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px;">STEP 2 · RAISE</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8b2e2a; font-weight: 700;">ORA-01403</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #5a5550; margin-top: 2px;">no data found</div>
</div>
<div style="text-align: center; color: #8b2e2a; font-size: 14px; line-height: 1; margin: 4px 0;">▼</div>
<!-- Result -->
<div style="background: #8b2e2a; color: #fff; padding: 12px 14px; text-align: center; box-shadow: inset 0 -3px 0 #6d2421;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #f5ede0; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 3px;">OUTCOME</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #fff; font-weight: 700; letter-spacing: 0.5px;">FORMULA ABORTS</div>
</div>
</div>
</div>

<!-- RIGHT: WITH GUARD -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 107, 63, 0.06); overflow: hidden;">

<!-- Branch header -->
<div style="background: #2d6b3f; padding: 10px 14px; display: flex; align-items: center; gap: 10px;">
<div style="width: 22px; height: 22px; background: #fff; color: #2d6b3f; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 11px;">✓</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4e8d8; letter-spacing: 1.5px; font-weight: 600;">PATH B</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #fff; font-weight: 700;">With .exists() guard</div>
</div>
</div>

<!-- Branch body -->
<div style="padding: 16px 14px;">
<!-- Step 1 -->
<div style="background: #faf8f5; border-left: 3px solid #2d6b3f; padding: 10px 12px; margin-bottom: 6px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px;">STEP 1 · CHECK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926;">IF measure.exists(3)</div>
</div>
<div style="text-align: center; color: #2d6b3f; font-size: 14px; line-height: 1; margin: 4px 0;">▼</div>
<!-- Step 2 -->
<div style="background: #faf8f5; border-left: 3px solid #2d6b3f; padding: 10px 12px; margin-bottom: 6px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 700; margin-bottom: 4px;">STEP 2 · SKIP</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d6b3f; font-weight: 700;">FALSE → bypass</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 11px; color: #5a5550; margin-top: 2px;">block not executed</div>
</div>
<div style="text-align: center; color: #2d6b3f; font-size: 14px; line-height: 1; margin: 4px 0;">▼</div>
<!-- Result -->
<div style="background: #2d6b3f; color: #fff; padding: 12px 14px; text-align: center; box-shadow: inset 0 -3px 0 #1f4d2c;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4e8d8; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 3px;">OUTCOME</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #fff; font-weight: 700; letter-spacing: 0.5px;">CONTINUE TO nidx = 4</div>
</div>
</div>
</div>
</div>

</div>

<!-- FOOTER CAPTION -->
<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The same <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">measure[3]</code> read either crashes the rule or quietly skips, depending on a one-line guard. In a long-running payroll batch the crash version surfaces hours after submission, attributed to the worker whose timecard contained the phase marker — not the engineer who wrote the formula.</div>
</div>
</div>

</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The defensive read is the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.exists()</code> method, which returns true only when the array has a populated cell at the given index:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Always check .exists() before parallel-array access */</span><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (HWM_CTXARY_HWM_MEASURE_DAY.<span style="color: #8b2e2a; font-weight: 700;">exists</span>(nidx)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  aiMeasureDay <span style="color: #8b2e2a; font-weight: 700;">=</span> HWM_CTXARY_HWM_MEASURE_DAY[nidx]<br>
)<br><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (measure.<span style="color: #8b2e2a; font-weight: 700;">exists</span>(nidx)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  l_measure <span style="color: #8b2e2a; font-weight: 700;">=</span> measure[nidx]<br>
)<br><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (STARTTIME.<span style="color: #8b2e2a; font-weight: 700;">exists</span>(nidx)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  aiStartTime <span style="color: #8b2e2a; font-weight: 700;">=</span> STARTTIME[nidx]<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">A common shortcut is to assume that if <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">RECORD_POSITIONS</code> exists at a given index, all parallel arrays must too. <strong>Don't.</strong> Phase markers like <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_PERIOD</code> deliberately leave the data tracks empty. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.exists()</code> is cheap; the runtime error from a wrong assumption is not.</p>

<!-- ============ CALLOUT ============ -->
<div style="background: #faf6f0; border-left: 4px solid #8b2e2a; padding: 20px 24px; margin: 32px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">.exists() VS DEFAULT FOR — WHEN TO USE WHICH</div>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; line-height: 1.65;">The top-of-formula declaration <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DEFAULT FOR measure IS EMPTY_NUMBER_NUMBER</code> tells the compiler what to substitute if the <em>whole array DBI</em> isn't populated. It does <strong>not</strong> protect you from accessing an unpopulated <em>index</em> within an otherwise populated array. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.exists()</code> is the per-index guard; <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DEFAULT FOR</code> is the per-DBI guard. Both are needed for a robust loop.</p>
</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The aiRecPosition Phase Markers — DETAIL, END_DAY, and Period Boundaries</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The single most important value in the loop is <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">aiRecPosition</code>. It tells the formula what kind of position the current <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">nidx</code> represents, and therefore which branch of the formula's logic should run:</p>

<!-- PHASE MARKER REFERENCE -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<!-- HEADER BAR -->
<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 04 · STATE REFERENCE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">aiRecPosition Phase Markers</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">STATES</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">3 values</div>
</div>
</div>

<!-- BODY -->
<div style="padding: 28px 24px 24px 24px; background: #faf8f5;">

<!-- PHASE CARDS -->
<div style="display: grid; grid-template-columns: 1fr; gap: 14px;">

<!-- DETAIL CARD -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">

<!-- Card header strip -->
<div style="display: grid; grid-template-columns: 120px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #2d6b3f;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #2d6b3f; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">▶</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #2d2926; font-weight: 700;">'DETAIL'</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Worked time entry</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #2d6b3f; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #2d6b3f; border-radius: 2px;">DATA-BEARING</div>
</div>

<!-- Card body -->
<div style="padding: 16px 18px;">
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55; margin-bottom: 14px;">All per-entry input variables (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">measure</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StartTime</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StopTime</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType</code>) are populated at this position.</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 12px; border-top: 1px dashed #e8e3dd;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FIRES WHEN</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">A worker submits a start/stop pair, break, or absence entry on the timecard.</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">TRIGGERS</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Allocation logic — day-type branch, OT bucket assignment, night-time detection.</div>
</div>
</div>
</div>
</div>

<!-- END_DAY CARD -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">

<div style="display: grid; grid-template-columns: 120px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #8b2e2a;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #8b2e2a; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">⏷</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #2d2926; font-weight: 700;">'END_DAY'</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Daily summary boundary</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #8b2e2a; border-radius: 2px;">PHASE MARKER</div>
</div>

<div style="padding: 16px 18px;">
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55; margin-bottom: 14px;">Fired once after the last <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DETAIL</code> entry of a day. Carries no measure or time data — every per-entry input is empty at this position.</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 12px; border-top: 1px dashed #e8e3dd;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FIRES WHEN</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">A day's DETAIL entries have all been emitted and the framework inserts a closing boundary.</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">TRIGGERS</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Daily accumulator resets — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_daily_night_total</code> back to zero.</div>
</div>
</div>
</div>
</div>

<!-- END_PERIOD CARD -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 1px 3px rgba(45, 41, 38, 0.04); overflow: hidden;">

<div style="display: grid; grid-template-columns: 120px 1fr auto; align-items: center; gap: 16px; padding: 12px 18px; background: #faf6f0; border-bottom: 1px solid #e8d8b8; border-left: 4px solid #2d2926;">
<div style="display: flex; align-items: center; gap: 10px;">
<div style="width: 24px; height: 24px; background: #2d2926; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; border-radius: 12px;">■</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #2d2926; font-weight: 700;">'END_PERIOD'</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; font-weight: 600;">Period summary boundary</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #2d2926; letter-spacing: 1px; font-weight: 700; background: #fff; padding: 4px 10px; border: 1px solid #2d2926; border-radius: 2px;">TERMINAL</div>
</div>

<div style="padding: 16px 18px;">
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55; margin-bottom: 14px;">Final position in the array. The loop's next iteration check (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">nidx < wMaAry</code>) becomes false and execution exits naturally.</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 12px; border-top: 1px dashed #e8e3dd;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FIRES WHEN</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">The framework closes the entire measure period — once per formula execution, always the last position.</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">TRIGGERS</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926;">Period-level sealing — monthly OT claim totals, holiday counts, final output bucket assembly.</div>
</div>
</div>
</div>
</div>

</div>

</div>

<!-- FOOTER CAPTION -->
<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Only <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DETAIL</code> carries data. The other two are control signals — empty rows whose only job is to mark <em>where you are</em> in the period so the formula knows when to reset and when to seal.</div>
</div>
</div>

</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The canonical phase-branch inside the loop reads like this:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'DETAIL'</span> <span style="color: #8b2e2a; font-weight: 700;">AND</span> aiMeasureDay > 0) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  <span style="color: #8a7560; font-style: italic;">/* Allocate worked hours into OT buckets:<br>
     day-type branch, night-time detection,<br>
     threshold crossing, bucket spillover */</span><br>
)<br><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'END_DAY'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  <span style="color: #8a7560; font-style: italic;">/* Reset daily accumulators */</span><br>
  l_total <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br>
  l_daily_night_total <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Note the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">aiMeasureDay > 0</code> guard alongside the DETAIL check. Some installations populate <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">DETAIL</code> phase markers with placeholder rows that have no actual measure day — typically header or pre-allocation records. Skipping those keeps the allocation logic from running against null data.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The END_DAY Reset Pattern — Why l_total Returns to Zero Mid-Iteration</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> reset on <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> is one of those patterns that looks wrong at first glance. Why zero the daily total in the middle of a loop?</p>

<p style="font-family: 'Source Sans 3', sans-serif;">Because <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> is a <strong>per-day</strong> accumulator, not a per-period one. It builds up during the DETAIL entries of one calendar day, gets compared against the daily threshold to determine OT, and must start fresh on the next day's DETAIL entries. The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> position is the only safe place to do the reset, because:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 8px;">Resetting inside the DETAIL branch would zero out partial-day accumulations before they were used.</li>
<li style="margin-bottom: 8px;">Resetting at the start of the next day's first DETAIL would require knowing it's the first one, which means tracking yet another flag.</li>
<li style="margin-bottom: 8px;">Resetting on every iteration would prevent any same-day accumulation at all.</li>
</ul>

<p style="font-family: 'Source Sans 3', sans-serif;">The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> marker exists precisely so the framework can give formulas a cheap, deterministic reset point. Period-level accumulators (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_regular</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_night_total</code>) are deliberately <em>not</em> reset on END_DAY — they keep accumulating across days and only end with the formula execution itself.</p>

<!-- VIZ: l_total SAWTOOTH ACROSS ITERATIONS -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<!-- HEADER BAR -->
<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 05 · ACCUMULATOR TRACE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">l_total Across the Iteration Loop</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">UNIT</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">hours</div>
</div>
</div>

<!-- BODY -->
<div style="padding: 28px 28px 24px 28px; background: #faf8f5;">

<!-- CHART AREA -->
<div style="position: relative; padding: 12px 0 0 0;">

<!-- Chart grid + bars -->
<div style="display: grid; grid-template-columns: 32px 1fr; gap: 12px; height: 220px; align-items: stretch;">

<!-- Y-axis -->
<div style="display: flex; flex-direction: column; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; text-align: right; padding-right: 6px; border-right: 1px solid #d9c9b0; padding-top: 12px; padding-bottom: 24px;">
<div>8</div>
<div>6</div>
<div>4</div>
<div>2</div>
<div>0</div>
</div>

<!-- Plot area (with horizontal grid lines as backgrounds via gradient) -->
<div style="position: relative; padding-bottom: 24px; padding-top: 12px;">

<!-- Horizontal grid lines (dashed) -->
<div style="position: absolute; top: 12px; left: 0; right: 0; bottom: 24px;">
<div style="position: absolute; top: 0%; left: 0; right: 0; border-top: 1px dashed #e8e3dd;"></div>
<div style="position: absolute; top: 25%; left: 0; right: 0; border-top: 1px dashed #e8e3dd;"></div>
<div style="position: absolute; top: 50%; left: 0; right: 0; border-top: 1px dashed #e8e3dd;"></div>
<div style="position: absolute; top: 75%; left: 0; right: 0; border-top: 1px dashed #e8e3dd;"></div>
<div style="position: absolute; top: 100%; left: 0; right: 0; border-top: 1px solid #d9c9b0;"></div>
</div>

<!-- Bars -->
<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; align-items: end; height: 100%; position: relative;">

<!-- nidx=1, DETAIL, l_total = 3 (height 37.5%) -->
<div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-bottom: 4px;">3</div>
<div style="background: linear-gradient(to bottom, #a83833, #8b2e2a); width: 100%; height: 37.5%; border-radius: 3px 3px 0 0; box-shadow: 0 1px 2px rgba(139, 46, 42, 0.2);"></div>
</div>

<!-- nidx=2, DETAIL, l_total = 7 (height 87.5%) -->
<div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-bottom: 4px;">7</div>
<div style="background: linear-gradient(to bottom, #a83833, #8b2e2a); width: 100%; height: 87.5%; border-radius: 3px 3px 0 0; box-shadow: 0 1px 2px rgba(139, 46, 42, 0.2);"></div>
</div>

<!-- nidx=3, END_DAY, l_total = 0 (reset) -->
<div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
<!-- Reset annotation arrow -->
<div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; font-weight: 700; letter-spacing: 0.5px; white-space: nowrap;">↓ RESET</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8a847d; font-weight: 700; margin-bottom: 4px;">0</div>
<div style="background: repeating-linear-gradient(45deg, #d9c9b0, #d9c9b0 4px, #e8d8b8 4px, #e8d8b8 8px); width: 100%; height: 3%; border-radius: 3px 3px 0 0; border: 1px solid #c4b298;"></div>
</div>

<!-- nidx=4, DETAIL, l_total = 8 (height 100%) -->
<div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; font-weight: 700; margin-bottom: 4px;">8</div>
<div style="background: linear-gradient(to bottom, #a83833, #8b2e2a); width: 100%; height: 100%; border-radius: 3px 3px 0 0; box-shadow: 0 1px 2px rgba(139, 46, 42, 0.2);"></div>
</div>

<!-- nidx=5, END_DAY, l_total = 0 (reset) -->
<div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
<div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; font-weight: 700; letter-spacing: 0.5px; white-space: nowrap;">↓ RESET</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8a847d; font-weight: 700; margin-bottom: 4px;">0</div>
<div style="background: repeating-linear-gradient(45deg, #d9c9b0, #d9c9b0 4px, #e8d8b8 4px, #e8d8b8 8px); width: 100%; height: 3%; border-radius: 3px 3px 0 0; border: 1px solid #c4b298;"></div>
</div>

<!-- nidx=6, END_PERIOD, l_total = 0 -->
<div style="display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; position: relative;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #8a847d; font-weight: 700; margin-bottom: 4px;">0</div>
<div style="background: repeating-linear-gradient(45deg, #d9c9b0, #d9c9b0 4px, #e8d8b8 4px, #e8d8b8 8px); width: 100%; height: 3%; border-radius: 3px 3px 0 0; border: 1px solid #c4b298;"></div>
</div>

</div>
</div>
</div>

<!-- X-axis labels -->
<div style="display: grid; grid-template-columns: 32px 1fr; gap: 12px; margin-top: -4px;">
<div></div>
<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px;">
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px;">
<div style="background: #f5ede0; color: #2d2926; font-weight: 700; padding: 3px 4px; letter-spacing: 0.5px;">nidx 1</div>
<div style="color: #8a847d; margin-top: 4px; letter-spacing: 0.5px;">DETAIL</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px;">
<div style="background: #f5ede0; color: #2d2926; font-weight: 700; padding: 3px 4px; letter-spacing: 0.5px;">nidx 2</div>
<div style="color: #8a847d; margin-top: 4px; letter-spacing: 0.5px;">DETAIL</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px;">
<div style="background: #8b2e2a; color: #fff; font-weight: 700; padding: 3px 4px; letter-spacing: 0.5px;">nidx 3</div>
<div style="color: #8b2e2a; margin-top: 4px; font-weight: 700; letter-spacing: 0.5px;">END_DAY</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px;">
<div style="background: #f5ede0; color: #2d2926; font-weight: 700; padding: 3px 4px; letter-spacing: 0.5px;">nidx 4</div>
<div style="color: #8a847d; margin-top: 4px; letter-spacing: 0.5px;">DETAIL</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px;">
<div style="background: #8b2e2a; color: #fff; font-weight: 700; padding: 3px 4px; letter-spacing: 0.5px;">nidx 5</div>
<div style="color: #8b2e2a; margin-top: 4px; font-weight: 700; letter-spacing: 0.5px;">END_DAY</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px;">
<div style="background: #8b2e2a; color: #fff; font-weight: 700; padding: 3px 4px; letter-spacing: 0.5px;">nidx 6</div>
<div style="color: #8b2e2a; margin-top: 4px; font-weight: 700; letter-spacing: 0.5px;">END_PERIOD</div>
</div>
</div>
</div>

<!-- Y-axis label -->
<div style="position: absolute; left: -8px; top: 50%; transform: rotate(-90deg) translateX(50%); transform-origin: left top; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; white-space: nowrap;">l_total (hrs)</div>
</div>

<!-- LEGEND -->
<div style="display: flex; gap: 20px; margin-top: 24px; padding-top: 14px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a5550; letter-spacing: 0.3px;">
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 16px; height: 14px; background: linear-gradient(to bottom, #a83833, #8b2e2a); border-radius: 2px 2px 0 0;"></div>
<span><strong style="color: #2d2926;">Accumulating</strong> — DETAIL iteration adds to l_total</span>
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 16px; height: 14px; background: repeating-linear-gradient(45deg, #d9c9b0, #d9c9b0 3px, #e8d8b8 3px, #e8d8b8 6px); border: 1px solid #c4b298; border-radius: 2px 2px 0 0;"></div>
<span><strong style="color: #2d2926;">Reset</strong> — END_DAY/END_PERIOD zeroes l_total</span>
</div>
</div>

<!-- KEY INSIGHT CALLOUT -->
<div style="background: #faf6f0; border-left: 4px solid #d4a574; padding: 14px 18px; margin-top: 22px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">KEY INSIGHT</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55;">Day 3 climbs to 7 hours, the END_DAY reset zeroes it, then Day 8 starts fresh and accumulates to 8. Without the reset, Day 8's threshold compare would fire against <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">7 + 8 = 15</code> hours and misclassify regular time as overtime.</div>
</div>

</div>

<!-- FOOTER CAPTION -->
<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The sawtooth pattern is the visible signature of correct daily accumulator handling. Period-level accumulators (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_regular</code>) would climb monotonically across the same iteration range — no resets — and that's intentional too.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Infinite-Loop Guard — raise_error at nidx > 1000</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Fast Formula has no compile-time loop termination analysis. A <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WHILE</code> loop whose increment line is accidentally inside an <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IF</code> branch that never fires will run until the runtime governor terminates the rule with a vague <em>"formula execution exceeded threshold"</em> error — long after the timecard submission has already failed for the user.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">A defensive ceiling check inside the loop catches this earlier, with a useful error message:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Defensive ceiling — fires before the runtime governor does */</span><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (nidx > 1000) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  ex <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">raise_error</span>(ffs_id, rule_id,<br>
                  <span style="color: #2d6b3f;">'Formula '</span> || ffName ||<br>
                  <span style="color: #2d6b3f;">' terminated due to possible end-less loop.'</span>)<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Why <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">1000</code>? It's a sanity ceiling, not a hard requirement. A single worker's measure period entries rarely exceed 200 in normal use (semi-monthly period × multiple daily entries × phase markers). Anything past 1000 means something is wrong upstream — either the loop counter isn't advancing, or the array has unexpected entries.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">Four practical notes on <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">raise_error</code>:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 8px;">It takes <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ffs_id</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">rule_id</code> as required parameters so the OTL audit log can attribute the error to the specific Fast Formula session and rule instance.</li>
<li style="margin-bottom: 8px;">The return value (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ex</code>) is assigned but never used — the call's side effect is the error raise. Some installations omit the assignment; both work.</li>
<li style="margin-bottom: 8px;">The error message string is what the worker sees in the timecard submission failure. Concatenating <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ffName</code> into it makes diagnosis dramatically faster when multiple TCRs are chained together.</li>
<li style="margin-bottom: 8px;">Once raised, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">raise_error</code> terminates the entire formula execution. Logs written via <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">add_log</code> before the raise are flushed to the audit trail; logs after are lost.</li>
</ul>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Complete Loop Skeleton</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Putting all five elements together — array cardinality capture, the WHILE bound, increment-before-access, .exists()-guarded reads, phase-branch logic, daily reset, and the runaway guard:</p>

<!-- COMPLETE SKELETON -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Cardinality capture */</span><br>
wMaAry <span style="color: #8b2e2a; font-weight: 700;">=</span> HWM_CTXARY_RECORD_POSITIONS.<span style="color: #8b2e2a; font-weight: 700;">count</span><br>
nidx   <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br><br>
<span style="color: #8b2e2a; font-weight: 700;">WHILE</span> (nidx < wMaAry) <span style="color: #8b2e2a; font-weight: 700;">LOOP</span><br>
(<br>
  nidx <span style="color: #8b2e2a; font-weight: 700;">=</span> nidx + 1<br>
  aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> HWM_CTXARY_RECORD_POSITIONS[nidx]<br><br>
  <span style="color: #8a7560; font-style: italic;">/* Null-safe reads of parallel arrays */</span><br>
  <span style="color: #8b2e2a; font-weight: 700;">IF</span> (HWM_CTXARY_HWM_MEASURE_DAY.<span style="color: #8b2e2a; font-weight: 700;">exists</span>(nidx)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
    aiMeasureDay <span style="color: #8b2e2a; font-weight: 700;">=</span> HWM_CTXARY_HWM_MEASURE_DAY[nidx]<br><br>
  <span style="color: #8a7560; font-style: italic;">/* Phase branch — DETAIL entries trigger allocation */</span><br>
  <span style="color: #8b2e2a; font-weight: 700;">IF</span> (aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'DETAIL'</span> <span style="color: #8b2e2a; font-weight: 700;">AND</span> aiMeasureDay > 0) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
  (<br>
    <span style="color: #8a7560; font-style: italic;">/* ...per-entry allocation logic... */</span><br>
  )<br><br>
  <span style="color: #8a7560; font-style: italic;">/* Daily reset on END_DAY phase marker */</span><br>
  <span style="color: #8b2e2a; font-weight: 700;">IF</span> (aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'END_DAY'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
  (<br>
    l_total <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br>
    l_daily_night_total <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br>
  )<br><br>
  <span style="color: #8a7560; font-style: italic;">/* Defensive ceiling */</span><br>
  <span style="color: #8b2e2a; font-weight: 700;">IF</span> (nidx > 1000) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
  (<br>
    ex <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">raise_error</span>(ffs_id, rule_id,<br>
                    <span style="color: #2d6b3f;">'Formula '</span> || ffName ||<br>
                    <span style="color: #2d6b3f;">' terminated due to possible end-less loop.'</span>)<br>
  )<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Every line earns its place. The cardinality capture cuts DBI calls. The 1-based increment-then-access avoids off-by-one errors. The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.exists()</code> guard prevents <em>no data found</em> crashes on phase-marker rows. The DETAIL+aiMeasureDay compound condition keeps allocation logic from running against placeholders. The END_DAY reset prevents accumulator bleed-through. The 1000-iteration ceiling catches runaway loops before the runtime governor does.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">Strip any one of these out and the TCR still compiles. Skip enough of them and it will quietly produce wrong totals in production — the failure mode the next post in this series picks up.</p>

<!-- ============ NEXT UP ============ -->
<div style="background: #2d2926; color: #fff; padding: 32px; margin: 48px 0 24px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #d4a574; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">NEXT IN THE SERIES</div>
<h3 style="font-family: 'Source Sans 3', sans-serif; margin: 0 0 8px 0; font-size: 22px; color: #fff; font-weight: 700;">Part 4 — Absence Integration in a TCR with AbsenceType, GET_VALUE_SET, and the Monthly Back-Fill</h3>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; color: #c4bdb5; line-height: 1.5; font-size: 15px;">How worked hours and absence hours share the same monthly bucket — the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">AbsenceType</code> array, a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_VALUE_SET</code> lookup that excludes certain absence types from OT, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_Cd</code> / <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Abs_Hours</code> output buckets, and the back-fill WHILE loop that retroactively reclassifies regular hours as OT when an absence pushes the worker over the monthly cap.</p>
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
<div style="margin-bottom: 6px; font-weight: 500;">TCR DEEP DIVE · PART 3 / 10</div>
<div>Series tag: <span style="color: #8b2e2a; font-weight: 500;">#TCRDeepDive</span></div>
</div>

</div>