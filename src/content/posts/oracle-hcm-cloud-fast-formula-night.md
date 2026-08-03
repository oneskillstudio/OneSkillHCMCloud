---
title: "Oracle HCM Cloud Fast Formula: Night Surcharge Detection in a TCR — The PayrollTimeType Match, UPPER() Case-Insensitive Compare, and the Dual Daily/Period Night Accumulators"
pubDate: 2026-07-07
description: "Oracle HCM Cloud Fast Formula: Night Surcharge Detection in a TCR — The PayrollTimeType Match, UPPER() Case-Insensitive Compare, and the Dual..."
tags: ["Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 820px; margin: 0 auto; color: #2d2926; line-height: 1.65; font-size: 17px;">

<!-- ============ HEADER ============ -->
<div style="border-left: 4px solid #8b2e2a; padding-left: 20px; margin: 32px 0 40px 0;">
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-weight: 500;">ORACLE HCM CLOUD · TCR DEEP DIVE · PART 6 OF 12</div>
<h1 style="font-family: 'Source Sans 3', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.25; color: #2d2926;">Oracle HCM Cloud Fast Formula: Night Surcharge Detection in a TCR — The PayrollTimeType Match, UPPER() Case-Insensitive Compare, and the Dual Daily/Period Night Accumulators</h1>
<div style="font-size: 18px; color: #5a5550; font-weight: 400; line-height: 1.5;">How night hours are identified through a configurable time-type code, why <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_daily_night_total</code> resets at <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> while <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_night_total</code> keeps climbing, and how <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Night_Hours</code> stacks alongside the Reg / OT-150 / OT-200 buckets from Part 5 without disturbing any of them.</div>
</div>

<!-- ============ TAG PILLS ============ -->
<div style="margin-bottom: 32px;">
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">FAST FORMULA</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">OTL</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">NIGHT SURCHARGE</span>
<span style="display: inline-block; background: #8b2e2a; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">PARALLEL CLASSIFICATION</span>
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
<p style="font-family: 'Source Sans 3', sans-serif; font-size: 19px; line-height: 1.6; color: #2d2926; margin: 0 0 24px 0;">Part 5 covered how a worked hour gets classified into Regular, OT 150%, or OT 200% based on day type and daily threshold. Part 6 adds a second classification that runs in parallel: <strong>night surcharge</strong>. It doesn't replace any bucket — it stacks on top. The same hour can be Regular pay <em>and</em> Night Surcharge at the same time, without either classification interfering with the other.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The design choice matters because it's counterintuitive. If you're new to TCR output semantics, your instinct is that a worked hour belongs to <em>one</em> bucket — Regular <em>or</em> OT 150 <em>or</em> OT 200. But when night surcharge enters the picture, that mental model breaks. A single hour can (and often does) appear in two buckets simultaneously. Payroll then compensates each classification at its own rate.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">A concrete example threads through the post: a worker logs a <strong>12-hour Wednesday shift</strong> tagged as night time. Part 5's cascade produces <strong>8 Regular + 2 OT 150% + 2 OT 200%</strong>. Part 6's detection produces <strong>12 Night Surcharge hours</strong> — the entire shift. Both classifications hit the outputs; payroll pays for both. That's the layering pattern this post explains.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Night Surcharge as a Parallel Classification</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The mental model to hold is: <strong>every DETAIL entry passes through two independent classification layers</strong>. Layer 1 is the day-type-plus-threshold cascade from Part 5 that decides Reg / OT-150 / OT-200. Layer 2 is the PayrollTimeType match from Part 6 that decides Night Surcharge or not. Neither layer knows or cares what the other layer decided.</p>

<!-- VIZ: FIGURE 01 — Classification Layers -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 01 · CONTROL FLOW</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Two Classification Layers, One Entry</div>
</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; text-align: right; padding-bottom: 2px; letter-spacing: 0.5px;">independent · parallel</div>
</div>

<div style="padding: 24px 20px 20px 20px; background: #faf8f5;">

<!-- SVG FLOW DIAGRAM -->
<img src="/images/posts/oracle-hcm-cloud-fast-formula-night/diagram-1.png" alt="Diagram 1: Oracle HCM Cloud Fast Formula: Night Surcharge Detection in " style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />

<!-- Summary conclusion -->
<div style="background: #2d2926; color: #fff; padding: 16px 22px; margin-top: 20px; display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">SUM OF OUTPUT VALUES</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 20px; color: #fff; font-weight: 700; letter-spacing: 0.5px;">8 + 2 + 2 + 12 = <span style="color: #d4a574;">24</span></div>
</div>
<div style="flex: 1; min-width: 200px; font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #c4bdb5; line-height: 1.5;">
<strong style="color: #fff;">Twice the input.</strong> Not a double count — Reg/OT and Night are independent classifications. Payroll pays each rate element separately.
</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The sum of output values (24) is double the worked hours (12) — intentionally. Reg/OT hours and Night Surcharge hours are separate classifications, not partitions of the same time. Payroll interprets each bucket independently: standard rate × Reg hours + 150% × OT-150 hours + 200% × OT-200 hours + night differential × Night hours.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The PayrollTimeType Match — Detecting a Night Entry</h2>

<p style="font-family: 'Source Sans 3', sans-serif;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType</code> is one of the parallel-array input variables introduced in Part 3 — it sits alongside <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">measure</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StartTime</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StopTime</code> in the input block and gets populated by the worker's timecard entry classification. When the worker submits a shift as "Night," the entry lands in the TCR with <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType[nidx] = 'Night'</code> (or whatever code the LDG uses).</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The TCR's job is to match that value against the configured night-time code. Two small subtleties matter:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Guarded read — PayrollTimeType may be empty on phase markers */</span><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (PayrollTimeType.<span style="color: #8b2e2a; font-weight: 700;">exists</span>(nidx)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  l_time_type <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">UPPER</span>(PayrollTimeType[nidx])<br><br>
  <span style="color: #8a7560; font-style: italic;">/* Case-insensitive compare against the configured code */</span><br>
  <span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_time_type <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">UPPER</span>(l_night_code)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
  (<br>
    l_night_hours <span style="color: #8b2e2a; font-weight: 700;">=</span> measure[nidx]<br>
    l_daily_night_total  <span style="color: #8b2e2a; font-weight: 700;">=</span> l_daily_night_total + l_night_hours<br>
    l_period_night_total <span style="color: #8b2e2a; font-weight: 700;">=</span> l_period_night_total + l_night_hours<br>
    Out_Measure_Night_Hours <span style="color: #8b2e2a; font-weight: 700;">=</span> Out_Measure_Night_Hours + l_night_hours<br>
  )<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Two things to notice:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 10px;"><strong>The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">.exists()</code> guard is mandatory.</strong> Phase markers (END_DAY, END_PERIOD from Part 3) leave <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType</code> empty. Reading <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType[nidx]</code> at those positions without the guard raises <em>"no data found"</em> and aborts the rule.</li>
<li style="margin-bottom: 10px;"><strong>Both sides of the compare go through <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">UPPER()</code>.</strong> Timecard entry data can be entered in any case — 'Night', 'night', 'NIGHT'. Wrapping both operands in <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">UPPER()</code> makes the compare case-insensitive without needing to enforce case at the entry layer. A single-side <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">UPPER()</code> is a common bug — it works during dev testing with clean data and quietly misses matches in production.</li>
</ul>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Configurable Night-Time Code</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Hardcoding <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'Night'</code> as the trigger value would work for one implementation and break the next. Different LDGs use different codes — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'NIGHT'</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'NGT'</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'NIGHT_SHIFT'</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'N'</code>. The TCR reads the value from a rule input parameter, defaulting to a sensible fallback if the parameter isn't set:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Read once at the top of the formula, use throughout */</span><br>
l_night_code <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">get_rvalue_text</span>(rule_id, <span style="color: #2d6b3f;">'NIGHT_TIME_CODE'</span>, <span style="color: #2d6b3f;">'Night'</span>)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Same pattern Part 2 used for the holiday category code. The three-argument form of <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">get_rvalue_text</code> takes the rule ID, the parameter name, and a default value used when the parameter isn't configured on the rule instance. Deploy the same formula to two LDGs, configure different night codes on their respective rule instances, and both work without a formula change.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Two Night Accumulators — Daily Reset vs Period Persistence</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Alongside <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Night_Hours</code>, the formula maintains two <em>local</em> night accumulators — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_daily_night_total</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_night_total</code>. They differ in exactly one behavior: what happens at the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> phase marker.</p>

<p style="font-family: 'Source Sans 3', sans-serif;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_daily_night_total</code> is zeroed at <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">END_DAY</code> — just like <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> from Part 3. It tracks night hours <em>within a single day</em>, which matters for day-level rules (e.g., a maximum night-hour cap per day). <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_night_total</code> is <em>not</em> reset — it keeps accumulating across days, ending the period with the total night hours worked. That's the value the monthly night differential is computed against.</p>

<!-- VIZ: FIGURE 02 — Accumulator Trace -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 02 · ACCUMULATOR TRACE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Daily Sawtooth vs Period Monotonic</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">TRACE ACROSS</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">4 days</div>
</div>
</div>

<div style="padding: 28px 28px 22px 28px; background: #faf8f5;">

<!-- CHART: Y-axis + plot area -->
<div style="display: grid; grid-template-columns: 44px 1fr; gap: 12px;">

<!-- Y-axis labels (0, 4, 8, 12, 16) — aligned to horizontal grid rows -->
<div style="position: relative; height: 220px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; font-weight: 600;">
<div style="position: absolute; top: -5px; right: 8px; text-align: right; letter-spacing: 0.5px;">16</div>
<div style="position: absolute; top: 50px; right: 8px; text-align: right;">12</div>
<div style="position: absolute; top: 105px; right: 8px; text-align: right;">8</div>
<div style="position: absolute; top: 160px; right: 8px; text-align: right;">4</div>
<div style="position: absolute; top: 215px; right: 8px; text-align: right;">0</div>
<div style="position: absolute; top: 240px; right: 8px; text-align: right; color: #8b2e2a; font-weight: 700; letter-spacing: 0.5px;">hrs</div>
</div>

<!-- Plot area — SVG chart -->
<div>
<img src="/images/posts/oracle-hcm-cloud-fast-formula-night/diagram-2.png" alt="Diagram 2: Oracle HCM Cloud Fast Formula: Night Surcharge Detection in " style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />

<!-- X-axis day labels -->
<div style="display: grid; grid-template-columns: repeat(5, 1fr); margin-top: 8px; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d2926; font-weight: 700; letter-spacing: 0.5px;">
<div style="text-align: center;">MON</div>
<div style="text-align: center;">TUE</div>
<div style="text-align: center;">WED</div>
<div style="text-align: center;">THU</div>
<div style="text-align: center; color: #d4a574;">END_PERIOD</div>
</div>

<!-- Reset indicators row below x-axis -->
<div style="display: grid; grid-template-columns: repeat(5, 1fr); margin-top: 8px; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 0.5px;">
<div style="text-align: center; color: #c4b298; font-style: italic;">day shift</div>
<div style="text-align: center; color: #8b2e2a; font-weight: 700;">↻ reset</div>
<div style="text-align: center; color: #c4b298; font-style: italic;">day shift</div>
<div style="text-align: center; color: #8b2e2a; font-weight: 700;">↻ reset</div>
<div style="text-align: center; color: #d4a574; font-weight: 700;">→ 12 final</div>
</div>
</div>
</div>

<!-- Legend -->
<div style="display: flex; gap: 24px; margin-top: 22px; padding-top: 14px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5a5550; letter-spacing: 0.3px; flex-wrap: wrap;">
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 18px; height: 14px; background: linear-gradient(to bottom, #a83833, #8b2e2a);"></div>
<span><strong style="color: #2d2926;">l_daily_night_total</strong> · sawtooth peak per day (resets at END_DAY)</span>
</div>
<div style="display: flex; align-items: center; gap: 8px;">
<div style="width: 20px; height: 3px; background: #d4a574; align-self: center; position: relative;">
<div style="position: absolute; top: -3px; left: 3px; width: 6px; height: 6px; border-radius: 50%; background: #d4a574; border: 1.5px solid #fff;"></div>
</div>
<span><strong style="color: #2d2926;">l_period_night_total</strong> · monotonic climb (persists across days)</span>
</div>
</div>

<!-- Invariant callout -->
<div style="background: #faf6f0; border-left: 4px solid #d4a574; padding: 14px 18px; margin-top: 22px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">THE PATTERN TO SPOT</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55;">Maroon bars draw a sawtooth — climb, reset, climb, reset. Gold line only climbs, never falls. If your daily accumulator is climbing across days without resetting, you missed the END_DAY branch. If your period accumulator is resetting between days, you accidentally added it to the END_DAY reset list.</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The final value of <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_period_night_total</code> at END_PERIOD equals <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Night_Hours</code>. They track the same thing — but the local variable stays available to downstream logic (e.g., monthly night-hour caps) that reads its value inline before the outputs are sealed.</div>
</div>
</div>

</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The reset itself is one line in the END_DAY branch of the main loop:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (aiRecPosition <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'END_DAY'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  l_total           <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br>
  l_daily_night_total <span style="color: #8b2e2a; font-weight: 700;">=</span> 0<br>
  <span style="color: #8a7560; font-style: italic;">/* l_period_night_total NOT reset — deliberate */</span><br>
)
</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Stacking on Top of the Day-Type Buckets</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Back to the worked example: a 12-hour Wednesday shift tagged as night time. The day-type/threshold layer from Part 5 splits the 12 hours into Reg/OT-150/OT-200 buckets. The night detection from Part 6 puts all 12 hours into <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Night_Hours</code>. Both classifications hit the outputs independently:</p>

<!-- VIZ: FIGURE 03 — Stacking Visualization -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 03 · STACKING VIEW</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">One Entry, Two Classifications</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">WORKED</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">12 hrs</div>
</div>
</div>

<div style="padding: 28px 24px 22px 24px; background: #faf8f5;">

<!-- Source label -->
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">SOURCE — 12 HR NIGHT-TAGGED WEDNESDAY SHIFT (measure = 12 · PayrollTimeType = 'Night')</div>

<!-- 12 HOUR CELLS at top — each numbered 1-12 -->
<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; margin-bottom: 6px;">
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">1</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">2</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">3</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">4</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">5</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">6</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">7</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">8</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">9</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">10</div>
<!-- Hour 11 — highlighted with a special border/background as the focus hour -->
<div style="background: #fff5dc; border: 2px solid #d4a574; padding: 9px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #8a7038; position: relative;">
11
<div style="position: absolute; top: -6px; right: -6px; background: #d4a574; color: #fff; font-size: 8px; padding: 1px 4px; border-radius: 6px; font-weight: 700; letter-spacing: 0.3px;">★</div>
</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 10px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #2d2926;">12</div>
</div>

<!-- "hrs" label under the cells -->
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; margin-bottom: 24px; font-weight: 600;">↑  12 discrete worked hours  ↑</div>

<!-- LAYER 1 LABEL -->
<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
<div style="width: 22px; height: 22px; background: #2d6b3f; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 11px;">1</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d6b3f; letter-spacing: 1.5px; font-weight: 700;">LAYER 1 · PART 5 CASCADE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; font-style: italic;">day-type + l_total → three OT tiers</div>
</div>

<!-- LAYER 1 CLASSIFICATION BAND: green 1-8, gold 9-10, maroon 11-12 -->
<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px;">
<div style="grid-column: span 8; background: linear-gradient(to bottom, #4f8c5e, #2d6b3f); height: 42px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">8 hrs REGULAR</div>
<div style="grid-column: span 2; background: linear-gradient(to bottom, #e0b683, #d4a574); height: 42px; display: flex; align-items: center; justify-content: center; color: #2d2926; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;">2 · OT 150</div>
<!-- OT 200 segment includes the highlighted hour 11 — subtle inner glow to link visually -->
<div style="grid-column: span 2; background: linear-gradient(to bottom, #a83833, #8b2e2a); height: 42px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; box-shadow: inset 0 0 0 2px rgba(212, 165, 116, 0.4);">2 · OT 200</div>
</div>

<!-- Small note under Layer 1 -->
<div style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; margin-top: 4px; letter-spacing: 0.3px;">→ populates 3 output buckets</div>

<!-- SPACER + connector arrows -->
<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; margin-top: 16px; margin-bottom: 16px;">
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
<!-- Hour 11: highlighted arrow -->
<div style="text-align: center; color: #d4a574; font-size: 13px; font-weight: 700;">↓</div>
<div style="text-align: center; color: #8a847d; font-size: 11px;">↓</div>
</div>

<!-- LAYER 2 LABEL -->
<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
<div style="width: 22px; height: 22px; background: #2d2926; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 11px;">2</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d2926; letter-spacing: 1.5px; font-weight: 700;">LAYER 2 · PART 6 DETECTION</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; font-style: italic;">PayrollTimeType match → single bucket</div>
</div>

<!-- LAYER 2 CLASSIFICATION BAND: solid dark spanning all 12 -->
<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px;">
<div style="grid-column: span 12; background: linear-gradient(to bottom, #3d3936, #2d2926); height: 42px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; box-shadow: inset 0 0 0 2px rgba(212, 165, 116, 0.4);">12 hrs NIGHT SURCHARGE</div>
</div>

<!-- Small note under Layer 2 -->
<div style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; margin-top: 4px; letter-spacing: 0.3px;">→ populates 1 output bucket</div>

<!-- FOCUS-HOUR CALLOUT -->
<div style="background: #fff5dc; border: 1px solid #d4a574; border-left: 4px solid #d4a574; padding: 14px 18px; margin-top: 24px;">
<div style="display: flex; gap: 12px; align-items: flex-start;">
<div style="background: #d4a574; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; padding: 3px 8px; letter-spacing: 0.5px; flex-shrink: 0; margin-top: 1px;">★ HOUR 11</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a7038; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">LANDS IN TWO BUCKETS SIMULTANEOUSLY</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #2d2926; line-height: 1.8;">
+1 → <span style="color: #8b2e2a; font-weight: 700;">Out_Measure_OT_200_Hours</span>  <span style="color: #8a847d;">(via Layer 1 cascade)</span><br>
+1 → <span style="color: #2d2926; font-weight: 700;">Out_Measure_Night_Hours</span>  <span style="color: #8a847d;">(via Layer 2 detection)</span>
</div>
</div>
</div>
</div>

<!-- Combined final output totals -->
<div style="background: #faf6f0; border-left: 4px solid #2d2926; padding: 14px 18px; margin-top: 14px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d2926; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">FINAL OUTPUT TOTALS · 4 BUCKETS · 24 SUMMED HRS FROM 12 WORKED HRS</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #2d2926; line-height: 1.85;">
<span style="color: #2d6b3f; font-weight: 700;">Out_Measure_RegHours</span> = 8<br>
<span style="color: #d4a574; font-weight: 700;">Out_Measure_OT_150_Hours</span> = 2<br>
<span style="color: #8b2e2a; font-weight: 700;">Out_Measure_OT_200_Hours</span> = 2<br>
<span style="color: #2d2926; font-weight: 700;">Out_Measure_Night_Hours</span> = 12
</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The two OT-200 hours land in <em>both</em> <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_OT_200_Hours</code> <em>and</em> <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Night_Hours</code>. That's not a double count. Payroll interprets them as "two hours at 200% rate <em>and</em> two hours of night differential" — two separate rate elements applied to the same underlying worked time.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Weekday Night Split — Preparing for the Cascade</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">A subtle refinement to watch for in production formulas: some regimes split the night accumulator further into <strong>weekday night hours</strong> vs <strong>weekend/holiday night hours</strong>. The pattern reads the day type Part 5 computed and increments a different local depending on the branch:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_time_type <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">UPPER</span>(l_night_code)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  <span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_day_type <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'WD'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
  (<br>
    l_period_weekday_night_total <span style="color: #8b2e2a; font-weight: 700;">=</span> l_period_weekday_night_total + l_night_hours<br>
  )<br>
  <span style="color: #8b2e2a; font-weight: 700;">ELSE</span><br>
  (<br>
    l_period_weekend_night_total <span style="color: #8b2e2a; font-weight: 700;">=</span> l_period_weekend_night_total + l_night_hours<br>
  )<br>
  <span style="color: #8a7560; font-style: italic;">/* Combined total for the single output bucket */</span><br>
  Out_Measure_Night_Hours <span style="color: #8b2e2a; font-weight: 700;">=</span> Out_Measure_Night_Hours + l_night_hours<br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Why the split? Weekday night hours often feed the Part 9 OT cascade differently than weekend night hours — the weekend variant is usually already at OT 200% via Sunday/Public Holiday classification, so its night differential compounds a different way. Separating the two accumulators inline avoids a downstream re-scan of the output buckets.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Night Output Bucket</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">One output array carries night classification to downstream payroll processing. Together with the three worked-time buckets from Part 5 and the two absence buckets from Part 4, the TCR now returns six output arrays at END_PERIOD:</p>

<!-- VIZ: FIGURE 04 — Night Output Reference -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 04 · OUTPUT REFERENCE</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">The Night-Time Output Bucket</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">RUNNING TOTAL</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">6 buckets</div>
</div>
</div>

<div style="padding: 24px 20px 20px 20px; background: #faf8f5;">

<!-- SVG BUCKET PORTFOLIO CHART -->
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 20px 16px 12px 16px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 12px;">PORTFOLIO STATE · AFTER PART 6 EXAMPLE · 6 OUTPUT BUCKETS</div>

<div style="display: grid; grid-template-columns: 32px 1fr; gap: 8px;">

<!-- Y-axis labels -->
<div style="position: relative; height: 240px; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; font-weight: 600;">
<div style="position: absolute; top: -5px; right: 4px;">16</div>
<div style="position: absolute; top: 45px; right: 4px;">12</div>
<div style="position: absolute; top: 95px; right: 4px;">8</div>
<div style="position: absolute; top: 145px; right: 4px;">4</div>
<div style="position: absolute; top: 195px; right: 4px;">0</div>
<div style="position: absolute; top: 215px; right: 4px; color: #8b2e2a; font-weight: 700;">hrs</div>
</div>

<!-- SVG chart -->
<div>
<img src="/images/posts/oracle-hcm-cloud-fast-formula-night/diagram-3.png" alt="Diagram 3: Oracle HCM Cloud Fast Formula: Night Surcharge Detection in " style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />

<!-- X-axis labels below bars -->
<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-top: 10px;">
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; font-weight: 700; letter-spacing: 0.3px;">
<div style="border-top: 3px solid #d4a574; padding-top: 6px;">Abs_Cd</div>
<div style="font-size: 8px; color: #8a847d; margin-top: 2px; font-weight: 500;">metadata</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; font-weight: 700; letter-spacing: 0.3px;">
<div style="border-top: 3px solid #d4a574; padding-top: 6px;">Abs_Hours</div>
<div style="font-size: 8px; color: #8a847d; margin-top: 2px; font-weight: 500;">absence qty</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #2d6b3f; font-weight: 700; letter-spacing: 0.3px;">
<div style="border-top: 3px solid #2d6b3f; padding-top: 6px;">RegHours</div>
<div style="font-size: 8px; color: #8a847d; margin-top: 2px; font-weight: 500;">base rate</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a7038; font-weight: 700; letter-spacing: 0.3px;">
<div style="border-top: 3px solid #d4a574; padding-top: 6px;">OT_150</div>
<div style="font-size: 8px; color: #8a847d; margin-top: 2px; font-weight: 500;">first-tier OT</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; font-weight: 700; letter-spacing: 0.3px;">
<div style="border-top: 3px solid #8b2e2a; padding-top: 6px;">OT_200</div>
<div style="font-size: 8px; color: #8a847d; margin-top: 2px; font-weight: 500;">second-tier OT</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #2d2926; font-weight: 700; letter-spacing: 0.3px;">
<div style="border-top: 3px solid #2d2926; padding-top: 6px;">Night_Hours</div>
<div style="font-size: 8px; color: #d4a574; margin-top: 2px; font-weight: 700;">← THIS POST</div>
</div>
</div>
</div>
</div>

<!-- Category legend / grouping -->
<div style="display: flex; gap: 20px; margin-top: 18px; padding-top: 12px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #5a5550; letter-spacing: 0.3px; flex-wrap: wrap;">
<div style="display: flex; align-items: center; gap: 6px;">
<div style="width: 14px; height: 12px; background: url(#ghostFill), #faf6f0; border: 1px dashed #d4a574;"></div>
<span><strong style="color: #2d2926;">empty in this example</strong> · absence buckets (no absence entered)</span>
</div>
<div style="display: flex; align-items: center; gap: 6px;">
<div style="width: 14px; height: 12px; background: linear-gradient(to bottom, #4f8c5e, #2d6b3f);"></div>
<span><strong style="color: #2d2926;">worked-time</strong> · Part 5 cascade</span>
</div>
<div style="display: flex; align-items: center; gap: 6px;">
<div style="width: 14px; height: 12px; background: linear-gradient(to bottom, #3d3936, #2d2926); border: 1.5px solid #d4a574;"></div>
<span><strong style="color: #2d2926;">night surcharge</strong> · Part 6 parallel classification</span>
</div>
</div>
</div>

<!-- Focused reference card for the Night bucket -->
<div style="background: #fff; border: 1px solid #d9c9b0; margin-top: 18px; overflow: hidden;">
<div style="background: linear-gradient(to right, #2d2926, #3d3936); padding: 12px 18px; display: flex; align-items: center; gap: 12px;">
<div style="width: 30px; height: 30px; background: #d4a574; color: #2d2926; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 700; border-radius: 15px;">☾</div>
<div style="flex: 1;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700;">FOCUS BUCKET · PART 6</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #fff; font-weight: 700; margin-top: 2px;">Out_Measure_Night_Hours</div>
</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 20px; color: #d4a574; font-weight: 700;">12 hrs</div>
</div>
<div style="padding: 16px 18px;">
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">FED BY</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926; line-height: 1.5;">Every DETAIL entry whose <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType</code> matches the configured night code (case-insensitive via <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">UPPER()</code>).</div>
</div>
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">STACKS ON TOP OF</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13px; color: #2d2926; line-height: 1.5;">Reg / OT-150 / OT-200 without disturbing them. The 12 hrs here are the same underlying 12 hrs already classified into the 3 worked-time buckets — payroll pays each rate element separately.</div>
</div>
</div>
</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Six output buckets so far — two absence, three worked-time, one night. Parts 7 and 8 add night-OT spillover (a second night bucket that captures automatic night detection based on clock time) and OT claim reconciliation buckets. The output inventory keeps growing without any single bucket's semantics changing.</div>
</div>
</div>

</div>

<!-- ============ NEXT UP ============ -->
<div style="background: #2d2926; color: #fff; padding: 32px; margin: 48px 0 24px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #d4a574; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">NEXT IN THE SERIES</div>
<h3 style="font-family: 'Source Sans 3', sans-serif; margin: 0 0 8px 0; font-size: 22px; color: #fff; font-weight: 700;">Part 7 — Night OT Spillover with IS_DATE_BETWEEN, the StartTimeMid Wrap, and the Four-Bucket Allocation</h3>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; color: #c4bdb5; line-height: 1.5; font-size: 15px;">A shift starting at 22:00 crosses midnight into the next day. The PayrollTimeType may not be tagged as night, but the physical clock time falls squarely in the 22:00–06:00 window. Part 7 covers the second night-detection path — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IS_DATE_BETWEEN</code> against the night window, the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StartTimeMid + 24</code> arithmetic that handles day-boundary crossings, and the allocation into four different output buckets (regular night, night OT-150, night OT-200, weekend night) without any minute being counted twice.</p>
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
<div style="margin-bottom: 6px; font-weight: 500;">TCR DEEP DIVE · PART 6 / 11</div>
<div>Series tag: <span style="color: #8b2e2a; font-weight: 500;">#TCRDeepDive</span></div>
</div>

</div>