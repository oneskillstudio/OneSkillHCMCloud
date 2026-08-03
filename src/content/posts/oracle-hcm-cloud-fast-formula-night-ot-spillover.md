---
title: "Oracle HCM Cloud Fast Formula: Night OT Spillover in a TCR — IS_DATE_BETWEEN, the StopTime+24 Midnight Wrap, and the Four-Bucket Night Allocation"
pubDate: 2026-07-07
description: "Oracle HCM Cloud Fast Formula: Night OT Spillover in a TCR — IS_DATE_BETWEEN, the StopTime+24 Midnight Wrap, and the Four-Bucket Night Allocation"
tags: ["Fast Formula", "Oracle HCM Cloud", "Time & Labor"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 820px; margin: 0 auto; color: #2d2926; line-height: 1.65; font-size: 17px;">

<!-- ============ HEADER ============ -->
<div style="border-left: 4px solid #8b2e2a; padding-left: 20px; margin: 32px 0 40px 0;">
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 11px; color: #8b2e2a; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; font-weight: 500;">ORACLE HCM CLOUD · TCR DEEP DIVE · PART 7 OF 12</div>
<h1 style="font-family: 'Source Sans 3', sans-serif; font-size: 30px; font-weight: 700; margin: 0 0 12px 0; line-height: 1.25; color: #2d2926;">Oracle HCM Cloud Fast Formula: Night OT Spillover in a TCR — IS_DATE_BETWEEN, the StopTime+24 Midnight Wrap, and the Four-Bucket Night Allocation</h1>
<div style="font-size: 18px; color: #5a5550; font-weight: 400; line-height: 1.5;">The second night-detection path — how the formula catches night hours that aren't tagged as such by <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType</code>, how <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IS_DATE_BETWEEN</code> plus the <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StopTime + 24</code> unwrap handle a shift that crosses midnight, and how the resulting night hours split across four output buckets based on day type and the Part 5 tier they fell into.</div>
</div>

<!-- ============ TAG PILLS ============ -->
<div style="margin-bottom: 32px;">
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">FAST FORMULA</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">OTL</span>
<span style="display: inline-block; background: #2d2926; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">NIGHT SPILLOVER</span>
<span style="display: inline-block; background: #8b2e2a; color: #fff; padding: 4px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-right: 6px; margin-bottom: 6px; font-weight: 500;">MIDNIGHT CROSSING</span>
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
<p style="font-family: 'Source Sans 3', sans-serif; font-size: 19px; line-height: 1.6; color: #2d2926; margin: 0 0 24px 0;">Part 6 covered the easy case — the timecard entry is tagged as <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType = 'Night'</code> and the TCR just needs to detect the tag. Part 7 covers the case that gives engineers pause: <strong>the entry isn't tagged, but its physical clock time falls squarely inside the night window</strong>. A shift stamped <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'Regular'</code> can still owe night differential if it runs from 22:00 through the small hours.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The TCR has to detect the overlap between the shift and the configured night window purely from <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StartTime</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StopTime</code>. And because shifts routinely cross midnight — 22:00 to 06:00 is one of the most common patterns in a 24/7 operation — the arithmetic has to handle a stop-time that's numerically <em>less than</em> the start-time. That's where <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StopTime + 24</code> comes in.</p>

<p style="font-family: 'Source Sans 3', sans-serif;">The worked example threading through the post: a worker logs <strong>one shift starting at 20:00 Wednesday and ending at 08:00 Thursday</strong> — 12 hours total, tagged <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType = 'Regular'</code>. Part 6's detection sees nothing to do. Part 7's detection finds <strong>8 hours in the night window</strong> — from 22:00 Wednesday to 06:00 Thursday — and has to split those 8 hours across the four night buckets based on which Part 5 tier each hour fell into. The final allocation: <strong>6 Regular-Night + 2 OT-150-Night + 0 OT-200-Night + 0 Weekend-Night</strong>.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Untagged Night Entry Problem</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Not every organization tags night shifts at the timecard entry layer. Some rely purely on <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PayrollTimeType</code> for classification (Part 6's world). Others let workers submit everything as <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'Regular'</code> and expect the TCR to figure out night eligibility from the clock time. A robust TCR runs <em>both</em> detection paths — one for the tag, one for the time — so the formula works regardless of how the timecard is configured downstream.</p>

<!-- VIZ: FIGURE 01 — Two Detection Paths -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 01 · DETECTION PATHS</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Two Paths, One Bucket Family</div>
</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; text-align: right; padding-bottom: 2px; letter-spacing: 0.5px;">tag · clock · guard</div>
</div>

<div style="padding: 24px 20px 20px 20px; background: #faf8f5;">

<img src="/images/posts/oracle-hcm-cloud-fast-formula-night-ot-spillover/diagram-1.png" alt="Diagram 1: Oracle HCM Cloud Fast Formula: Night OT Spillover in a TCR —" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />

<!-- Below-diagram note -->
<div style="background: #faf6f0; border-left: 4px solid #d4a574; padding: 12px 16px; margin-top: 16px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 4px;">TWO PATHS · ONE POLICY</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #2d2926; line-height: 1.5;">Both paths feed the same bucket family. The dedup guard makes them mutually exclusive per entry: if Path A already fired for this <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">nidx</code>, Path B skips it — otherwise the same night hours would be counted twice.</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Part 6's single <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Night_Hours</code> stays as an aggregate. Part 7 adds four <em>granular</em> buckets that split night hours by day-type and OT tier — because payroll needs the granularity to apply different rate elements.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Night Window as a Rule Parameter</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The night window's start and end hours aren't hardcoded — they're rule input parameters. Different jurisdictions define night hours differently (22:00–06:00 is common but not universal), and even within one jurisdiction the definition can differ by contract:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Read once at the top of the formula */</span><br>
l_night_start <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">get_rvalue_number</span>(rule_id, <span style="color: #2d6b3f;">'NIGHT_WINDOW_START'</span>, 22)<br>
l_night_end   <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">get_rvalue_number</span>(rule_id, <span style="color: #2d6b3f;">'NIGHT_WINDOW_END'</span>,   6)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Two numbers held in decimal hours. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">22</code> means 22:00 (10 PM); <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">6</code> means 06:00 (6 AM). The formula treats these as anchors on a 24-hour clock — with the understanding that when <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">end < start</code>, the window wraps past midnight.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">IS_DATE_BETWEEN and the StopTime + 24 Unwrap</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">A shift from 22:00 Wednesday to 06:00 Thursday is 8 hours long. But if you subtract <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">StopTime - StartTime</code> naively, you get <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">6 - 22 = -16</code>. Negative. Because the numeric clock resets to zero at midnight, and any arithmetic that ignores day boundaries collapses. The <strong>StopTime + 24 unwrap</strong> is the standard fix: if the stop-time is numerically less than the start-time, add 24 to it. Now the shift runs from <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">22</code> to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">30</code> on an extended clock, and every subsequent calculation works.</p>

<!-- VIZ: FIGURE 02 — Midnight Math -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 02 · TIME ARITHMETIC</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">The Midnight-Crossing Unwrap</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">EXTENDED CLOCK</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">0 → 30</div>
</div>
</div>

<div style="padding: 28px 24px 22px 24px; background: #faf8f5;">

<img src="/images/posts/oracle-hcm-cloud-fast-formula-night-ot-spillover/diagram-2.png" alt="Diagram 2: Oracle HCM Cloud Fast Formula: Night OT Spillover in a TCR —" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />

<!-- Code snippet showing the unwrap -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 14px 18px; margin-top: 22px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.7; color: #2d2926;">
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_stop < l_start) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
  l_stop_adj <span style="color: #8b2e2a; font-weight: 700;">=</span> l_stop + 24  <span style="color: #8a7560; font-style: italic;">/* shift wrapped past midnight */</span><br>
<span style="color: #8b2e2a; font-weight: 700;">ELSE</span><br>
  l_stop_adj <span style="color: #8b2e2a; font-weight: 700;">=</span> l_stop
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">+ 24</code> trick works because everything downstream — the night window compare, the overlap arithmetic, all of it — operates on the <em>same</em> extended clock. As long as both <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_stop_adj</code> and the night-window end are consistently unwrapped, day boundaries stop mattering.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Computing the Night-Window Overlap</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Once the shift's clock times are unwrapped, computing the overlap with the night window is a two-line clamp. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GREATEST</code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">LEAST</code> — same idiom Part 5 used for spillover — do the whole job:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Night window on the extended clock: 22:00 to 06:00 next day = 22 to 30 */</span><br>
l_win_start <span style="color: #8b2e2a; font-weight: 700;">=</span> l_night_start        <span style="color: #8a7560; font-style: italic;">/* 22 */</span><br>
l_win_end   <span style="color: #8b2e2a; font-weight: 700;">=</span> l_night_end + 24  <span style="color: #8a7560; font-style: italic;">/* 6 + 24 = 30 */</span><br><br>
<span style="color: #8a7560; font-style: italic;">/* Overlap interval between (l_start, l_stop_adj) and (l_win_start, l_win_end) */</span><br>
l_overlap_start <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">GREATEST</span>(l_start,    l_win_start)<br>
l_overlap_end   <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">LEAST</span>   (l_stop_adj, l_win_end)<br>
l_night_hours <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">GREATEST</span>(0, l_overlap_end - l_overlap_start)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">Plug in the worked example — <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_start = 20</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_stop_adj = 32</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_win_start = 22</code>, <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_win_end = 30</code>. Overlap runs from <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">MAX(20,22) = 22</code> to <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">MIN(32,30) = 30</code>, so night hours detected = <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">30 - 22 = 8</code>. The shift includes 2 hours before the night window (20:00–22:00) and 2 hours after (06:00–08:00) that don't qualify.</p>

<!-- VIZ: FIGURE 03 — Overlap Timeline -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 03 · OVERLAP DETECTION</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Shift × Night Window Intersection</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">OVERLAP</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">8 of 12 hrs</div>
</div>
</div>

<div style="padding: 28px 24px 22px 24px; background: #faf8f5;">

<!-- Shift row -->
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">SHIFT · 12 hrs from Wed 20:00 to Thu 08:00</div>
<div style="position: relative; height: 44px; margin-bottom: 22px;">
<!-- Full timeline background -->
<div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #f0e9dd; border: 1px solid #d9c9b0;"></div>
<!-- Shift bar from position 20 to 32 on scale of 18-32 (14-hr span) -->
<!-- 20 - 18 = 2, so start at 2/14 = 14.3% -->
<!-- 32 - 18 = 14, so end at 100% -->
<div style="position: absolute; left: 14.28%; right: 0; top: 0; bottom: 0; background: linear-gradient(to bottom, #a83833, #8b2e2a); display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;">12 hrs · PayrollTimeType = 'Regular'</div>
</div>

<!-- Night window row -->
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">NIGHT WINDOW · 22:00 to 06:00 (extended: 22 → 30)</div>
<div style="position: relative; height: 44px; margin-bottom: 22px;">
<div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #f0e9dd; border: 1px solid #d9c9b0;"></div>
<!-- Night window from 22 to 30 on scale of 18-32 -->
<!-- 22 - 18 = 4, so start at 4/14 = 28.57% -->
<!-- 30 - 18 = 12, so end at 12/14 = 85.71% -->
<div style="position: absolute; left: 28.57%; width: 57.14%; top: 0; bottom: 0; background: linear-gradient(to bottom, #3d3936, #2d2926); display: flex; align-items: center; justify-content: center; color: #d4a574; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;">8 hrs</div>
</div>

<!-- Overlap row -->
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">OVERLAP · GREATEST(20,22) to LEAST(32,30) = 22 to 30</div>
<div style="position: relative; height: 44px; margin-bottom: 8px;">
<div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; background: #f0e9dd; border: 1px solid #d9c9b0;"></div>
<!-- Same span as night window (22 to 30) since it's fully within shift -->
<div style="position: absolute; left: 28.57%; width: 57.14%; top: 0; bottom: 0; background: linear-gradient(to bottom, #e0b683, #d4a574); display: flex; align-items: center; justify-content: center; color: #2d2926; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; box-shadow: inset 0 0 0 2px #d4a574;">8 hrs detected as night</div>
</div>

<!-- Time scale -->
<div style="position: relative; height: 22px; margin-top: 8px;">
<div style="position: absolute; left: 0%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">18</div>
<div style="position: absolute; left: 14.28%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d2926; font-weight: 700;">20<div style="font-size: 8px; color: #8a847d; font-weight: 500;">Wed</div></div>
<div style="position: absolute; left: 28.57%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; font-weight: 700;">22</div>
<div style="position: absolute; left: 42.86%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">24</div>
<div style="position: absolute; left: 57.14%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">26</div>
<div style="position: absolute; left: 71.43%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d;">28</div>
<div style="position: absolute; left: 85.71%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; font-weight: 700;">30<div style="font-size: 8px; color: #8a847d; font-weight: 500;">= 06 Thu</div></div>
<div style="position: absolute; left: 100%; transform: translateX(-50%); font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d2926; font-weight: 700;">32<div style="font-size: 8px; color: #8a847d; font-weight: 500;">= 08 Thu</div></div>
</div>

<!-- Insight callout -->
<div style="background: #faf6f0; border-left: 4px solid #d4a574; padding: 14px 18px; margin-top: 42px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8b2e2a; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 6px;">FOUR CASES · ONE CLAMP</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; color: #2d2926; line-height: 1.55;">The same <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GREATEST/LEAST</code> pair handles all four possible cases without a single <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IF</code>: shift entirely inside the window, window entirely inside the shift (this example), partial overlap on either side, and no overlap at all. The final <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GREATEST(0, ...)</code> clamps negatives to zero for the no-overlap case.</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The gold overlap bar sits inside the shift bar because the night window is entirely contained within the shift. Change the shift to 04:00–14:00 and the overlap shrinks to 2 hours — the arithmetic still holds. The clamp is scenario-agnostic.</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Allocating Night Hours Across Four Buckets</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">The 8 detected night hours can't all go into one bucket. Payroll needs to know which tier each night hour belonged to under Part 5's cascade — because a night hour that's <em>also</em> an OT 200 hour pays at a different combined rate than a night hour that's still Regular. Four output buckets carry the split:</p>

<ul style="font-family: 'Source Sans 3', sans-serif; padding-left: 24px; margin: 16px 0;">
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Reg_Night_Hours</code> — weekday night hours in the Regular tier (below the daily OT threshold)</li>
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_OT_150_Night_Hours</code> — weekday night hours in the OT 150 tier</li>
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_OT_200_Night_Hours</code> — weekday night hours in the OT 200 tier</li>
<li style="margin-bottom: 8px;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Weekend_Night_Hours</code> — all night hours on Saturday, Sunday, or Public Holiday (day-type takes precedence over tier)</li>
</ul>

<p style="font-family: 'Source Sans 3', sans-serif;">In the worked example the shift is on a Wednesday (weekday), so the Weekend_Night bucket stays at zero. The remaining 8 night hours split by Part 5 tier — specifically, where each night hour falls in the shift's running <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">l_total</code> position:</p>

<!-- VIZ: FIGURE 04 — Four-Bucket Allocation -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 04 · TIER × NIGHT SPLIT</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Where Each Night Hour Lands</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">SPLIT</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">6 + 2 + 0 + 0</div>
</div>
</div>

<div style="padding: 28px 24px 22px 24px; background: #faf8f5;">

<!-- 12 hour cells with clock times -->
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 8px;">12 SHIFT HOURS · CLOCK TIMES ACROSS THE DAY BOUNDARY</div>
<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; margin-bottom: 4px;">
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #8a847d;">20</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #8a847d;">21</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #d4a574;">22</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #d4a574;">23</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #d4a574;">00</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #d4a574;">01</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #d4a574;">02</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #d4a574;">03</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #d4a574;">04</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #d4a574;">05</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #8a847d;">06</div>
<div style="background: #fff; border: 1px solid #d9c9b0; padding: 8px 0 4px 0; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #8a847d;">07</div>
</div>
<!-- Day marker row -->
<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; margin-bottom: 20px;">
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Wed</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Wed</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Wed</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Wed</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8b2e2a; font-weight: 700;">Thu ↓</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Thu</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Thu</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Thu</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Thu</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Thu</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Thu</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a847d;">Thu</div>
</div>

<!-- Layer A: Part 5 cascade tier -->
<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
<div style="width: 22px; height: 22px; background: #2d6b3f; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 11px;">A</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d6b3f; letter-spacing: 1.5px; font-weight: 700;">PART 5 CASCADE · REG / OT-150 / OT-200</div>
</div>
<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px;">
<div style="grid-column: span 8; background: linear-gradient(to bottom, #4f8c5e, #2d6b3f); height: 40px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;">8 hrs REGULAR</div>
<div style="grid-column: span 2; background: linear-gradient(to bottom, #e0b683, #d4a574); height: 40px; display: flex; align-items: center; justify-content: center; color: #2d2926; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;">2 · 150</div>
<div style="grid-column: span 2; background: linear-gradient(to bottom, #a83833, #8b2e2a); height: 40px; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700;">2 · 200</div>
</div>

<div style="margin: 12px 0;"></div>

<!-- Layer B: Night window overlap -->
<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
<div style="width: 22px; height: 22px; background: #2d2926; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; border-radius: 11px;">B</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #2d2926; letter-spacing: 1.5px; font-weight: 700;">PART 7 NIGHT WINDOW · 22:00 – 06:00</div>
</div>
<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px;">
<div style="grid-column: span 2; background: #f0e9dd; border: 1px dashed #c4b298; height: 40px; display: flex; align-items: center; justify-content: center; color: #8a847d; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-style: italic;">not night</div>
<div style="grid-column: span 8; background: linear-gradient(to bottom, #3d3936, #2d2926); height: 40px; display: flex; align-items: center; justify-content: center; color: #d4a574; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; box-shadow: inset 0 0 0 2px rgba(212, 165, 116, 0.4);">8 hrs NIGHT</div>
<div style="grid-column: span 2; background: #f0e9dd; border: 1px dashed #c4b298; height: 40px; display: flex; align-items: center; justify-content: center; color: #8a847d; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-style: italic;">not night</div>
</div>

<!-- Cross-product result: 4 buckets -->
<div style="margin-top: 24px; padding: 16px 18px; background: #fff; border: 1px solid #d9c9b0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 12px;">CROSS-PRODUCT · TIER × NIGHT = FOUR BUCKETS</div>
<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
<!-- Reg_Night -->
<div style="background: #faf6f0; border: 1px solid #d9c9b0; border-top: 3px solid #2d6b3f; padding: 12px 10px; text-align: center;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #2d6b3f; letter-spacing: 1px; font-weight: 700;">REG × NIGHT</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #2d6b3f; font-weight: 700; margin: 6px 0 2px 0;">6</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #5a5550;">Reg_Night_Hours</div>
</div>
<!-- OT_150_Night -->
<div style="background: #faf6f0; border: 1px solid #d9c9b0; border-top: 3px solid #d4a574; padding: 12px 10px; text-align: center;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a7038; letter-spacing: 1px; font-weight: 700;">OT-150 × NIGHT</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #8a7038; font-weight: 700; margin: 6px 0 2px 0;">2</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #5a5550;">OT_150_Night_Hours</div>
</div>
<!-- OT_200_Night -->
<div style="background: #faf6f0; border: 1px solid #d9c9b0; border-top: 3px solid #8b2e2a; padding: 12px 10px; text-align: center; opacity: 0.6;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8b2e2a; letter-spacing: 1px; font-weight: 700;">OT-200 × NIGHT</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #8b2e2a; font-weight: 700; margin: 6px 0 2px 0;">0</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #5a5550;">OT_200_Night_Hours</div>
</div>
<!-- Weekend_Night -->
<div style="background: #faf6f0; border: 1px solid #d9c9b0; border-top: 3px solid #2d2926; padding: 12px 10px; text-align: center; opacity: 0.6;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #2d2926; letter-spacing: 1px; font-weight: 700;">WEEKEND × NIGHT</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 24px; color: #2d2926; font-weight: 700; margin: 6px 0 2px 0;">0</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #5a5550;">Weekend_Night_Hours</div>
</div>
</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 12px; color: #5a5550; margin-top: 12px; line-height: 1.5; font-style: italic; text-align: center;">Sum = 8 · matches Layer B total · no double count</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">Overlay Layer A on Layer B and read where the dark night band intersects each cascade tier. Regular tier ends at hour 8 (clock 04:00). The night window ends at hour 10 (clock 06:00). Six night hours land in Regular (22:00–04:00), two in OT-150 (04:00–06:00), zero in OT-200 (which starts at 06:00 — after the window closed).</div>
</div>
</div>

</div>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">Deduplication with Part 6 Detection</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">If both detection paths were allowed to fire on the same entry, the same night hours would be counted twice — once via Part 6's tag match and once via Part 7's clock-time overlap. The formula prevents that by giving Part 6 priority: if the entry is tagged as night, Part 7 skips the entry entirely. A local flag set inside Part 6's branch does the guarding:</p>

<!-- CODE BLOCK -->
<div style="background: #f5ede0; border: 1px solid #d9c9b0; padding: 20px 24px; margin: 24px 0; overflow-x: auto; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 13px; line-height: 1.75; color: #2d2926;">
<span style="color: #8a7560; font-style: italic;">/* Part 6 detection sets this flag when a tag match fires */</span><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_time_type <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #8b2e2a; font-weight: 700;">UPPER</span>(l_night_code)) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  <span style="color: #8a7560; font-style: italic;">/* ... existing Part 6 logic ... */</span><br>
  l_night_detected <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'Y'</span><br>
)<br><br>
<span style="color: #8a7560; font-style: italic;">/* Part 7 detection skips if Part 6 already handled it */</span><br>
<span style="color: #8b2e2a; font-weight: 700;">IF</span> (l_night_detected <span style="color: #8b2e2a; font-weight: 700;">=</span> <span style="color: #2d6b3f;">'N'</span>) <span style="color: #8b2e2a; font-weight: 700;">THEN</span><br>
(<br>
  <span style="color: #8a7560; font-style: italic;">/* Run IS_DATE_BETWEEN + overlap + four-bucket allocation */</span><br>
)
</div>

<p style="font-family: 'Source Sans 3', sans-serif;">The flag is reset at every new DETAIL iteration. Two paths, one policy, zero double-counts.</p>

<!-- ============ SECTION ============ -->
<h2 style="font-family: 'Source Sans 3', sans-serif; font-size: 24px; font-weight: 700; color: #2d2926; margin: 48px 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #f0e9dd;">The Updated Output Portfolio</h2>

<p style="font-family: 'Source Sans 3', sans-serif;">Four new buckets join the running inventory. The output-array count is now ten — two absence, three worked-time, one aggregate night, and four granular night buckets:</p>

<!-- VIZ: FIGURE 05 — Updated Portfolio -->
<div style="background: #fff; border: 1px solid #d9c9b0; box-shadow: 0 2px 0 #e8e3dd, 0 1px 3px rgba(45, 41, 38, 0.04); margin: 36px 0; overflow: hidden;">

<div style="background: #2d2926; padding: 16px 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; border-bottom: 3px solid #8b2e2a;">
<div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 2.5px; font-weight: 600;">FIGURE 05 · UPDATED PORTFOLIO</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 17px; color: #fff; font-weight: 700; margin-top: 6px; line-height: 1.3;">Ten Output Buckets After Part 7</div>
</div>
<div style="text-align: right;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; letter-spacing: 1px; font-weight: 600;">TOTAL</div>
<div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #d4a574; font-weight: 700; margin-top: 2px;">10 buckets</div>
</div>
</div>

<div style="padding: 22px 20px 20px 20px; background: #faf8f5;">

<div style="background: #fff; border: 1px solid #d9c9b0; padding: 20px 16px 12px 16px;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #8a847d; letter-spacing: 1.5px; font-weight: 700; margin-bottom: 14px;">PORTFOLIO STATE · AFTER PART 7 EXAMPLE · 10 OUTPUT BUCKETS</div>

<div style="display: grid; grid-template-columns: 32px 1fr; gap: 8px;">

<!-- Y-axis labels -->
<div style="position: relative; height: 240px; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #8a847d; font-weight: 600;">
<div style="position: absolute; top: -5px; right: 4px;">12</div>
<div style="position: absolute; top: 40px; right: 4px;">9</div>
<div style="position: absolute; top: 80px; right: 4px;">6</div>
<div style="position: absolute; top: 120px; right: 4px;">3</div>
<div style="position: absolute; top: 195px; right: 4px;">0</div>
<div style="position: absolute; top: 215px; right: 4px; color: #8b2e2a; font-weight: 700;">hrs</div>
</div>

<!-- SVG chart · 10 bars -->
<div>
<img src="/images/posts/oracle-hcm-cloud-fast-formula-night-ot-spillover/diagram-3.png" alt="Diagram 3: Oracle HCM Cloud Fast Formula: Night OT Spillover in a TCR —" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />

<!-- X-axis labels below bars -->
<div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin-top: 10px;">
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a7038; font-weight: 700;">
<div style="border-top: 2px solid #d4a574; padding-top: 4px;">Abs_Cd</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a7038; font-weight: 700;">
<div style="border-top: 2px solid #d4a574; padding-top: 4px;">Abs_Hrs</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #2d6b3f; font-weight: 700;">
<div style="border-top: 2px solid #2d6b3f; padding-top: 4px;">RegHours</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a7038; font-weight: 700;">
<div style="border-top: 2px solid #d4a574; padding-top: 4px;">OT_150</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8b2e2a; font-weight: 700;">
<div style="border-top: 2px solid #8b2e2a; padding-top: 4px;">OT_200</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #2d2926; font-weight: 700;">
<div style="border-top: 2px solid #2d2926; padding-top: 4px;">Night</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #2d6b3f; font-weight: 700;">
<div style="border-top: 2px solid #2d6b3f; padding-top: 4px;">Reg_Ngt</div>
<div style="font-size: 7px; color: #d4a574; margin-top: 1px;">NEW</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8a7038; font-weight: 700;">
<div style="border-top: 2px solid #d4a574; padding-top: 4px;">OT150_Ngt</div>
<div style="font-size: 7px; color: #d4a574; margin-top: 1px;">NEW</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #8b2e2a; font-weight: 700;">
<div style="border-top: 2px solid #8b2e2a; padding-top: 4px;">OT200_Ngt</div>
<div style="font-size: 7px; color: #d4a574; margin-top: 1px;">NEW</div>
</div>
<div style="text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #2d2926; font-weight: 700;">
<div style="border-top: 2px solid #2d2926; padding-top: 4px;">Wknd_Ngt</div>
<div style="font-size: 7px; color: #d4a574; margin-top: 1px;">NEW</div>
</div>
</div>
</div>
</div>

<!-- Legend -->
<div style="display: flex; gap: 18px; margin-top: 18px; padding-top: 12px; border-top: 1px dashed #d9c9b0; font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #5a5550; flex-wrap: wrap;">
<div style="display: flex; align-items: center; gap: 6px;">
<div style="width: 14px; height: 12px; background: url(#p7ghost), #faf6f0; border: 1px dashed #d4a574;"></div>
<span><strong style="color: #2d2926;">not activated</strong> · exists but unfilled in this scenario</span>
</div>
<div style="display: flex; align-items: center; gap: 6px;">
<div style="width: 14px; height: 12px; background: linear-gradient(to bottom, #4f8c5e, #2d6b3f); border: 2px solid #d4a574;"></div>
<span><strong style="color: #2d2926;">Part 7 addition</strong> · gold border indicates new bucket</span>
</div>
</div>
</div>

</div>

<div style="background: #2d2926; padding: 16px 24px; border-top: 1px solid #8b2e2a;">
<div style="display: flex; gap: 14px; align-items: flex-start;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #d4a574; letter-spacing: 1.5px; font-weight: 700; padding-top: 2px; flex-shrink: 0;">READ →</div>
<div style="font-family: 'Source Sans 3', sans-serif; font-size: 13.5px; color: #c4bdb5; line-height: 1.55;">The gold dashed vertical divider separates Parts 1–6 buckets (left) from Part 7's four new additions (right). Note that in this scenario <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">Out_Measure_Night_Hours</code> stays at 0 — the Part 6 tag match didn't fire because the entry was tagged 'Regular'. The clock-time overlap detection did all the work.</div>
</div>
</div>

</div>

<!-- ============ NEXT UP ============ -->
<div style="background: #2d2926; color: #fff; padding: 32px; margin: 48px 0 24px 0;">
<div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #d4a574; letter-spacing: 2px; margin-bottom: 8px; font-weight: 500;">NEXT IN THE SERIES</div>
<h3 style="font-family: 'Source Sans 3', sans-serif; margin: 0 0 8px 0; font-size: 22px; color: #fff; font-weight: 700;">Part 8 — OT Claim Reconciliation with GET_PLAN_BALANCE Inside a CHANGE_CONTEXTS Block</h3>
<p style="font-family: 'Source Sans 3', sans-serif; margin: 0; color: #c4bdb5; line-height: 1.5; font-size: 15px;">How the TCR reconciles OT hours it just allocated against previously-claimed OT balances stored in the absence plan — using <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">GET_PLAN_BALANCE</code> inside a <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">CHANGE_CONTEXTS</code> block so the balance function reads under the right effective-date and legislation code, and why doing it outside the CHANGE_CONTEXTS block returns silently wrong values.</p>
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
<div style="margin-bottom: 6px; font-weight: 500;">TCR DEEP DIVE · PART 7 / 11</div>
<div>Series tag: <span style="color: #8b2e2a; font-weight: 500;">#TCRDeepDive</span></div>
</div>

</div>