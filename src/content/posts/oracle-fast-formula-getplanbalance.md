---
title: "Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, and the Two Traps That Quietly Ship the Wrong Number"
pubDate: 2026-04-28
description: "Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, and the Two Traps That Quietly Ship the Wrong Number"
tags: ["Absence Management", "Fast Formula", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

<p> </p><!--
Reading Absence Balance in Fast Formulas
Look-and-feel matched to abhishekmohanty-hcm.blogspot.com
with rich SVG visualizations inline.
Author: Abhishek Mohanty (Oracle ACE Apprentice, AIOUG)
-->

<style>
.am-post { font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1c1c1a; line-height: 1.65; max-width: 940px; margin: 0 auto; padding: 28px 22px; font-size: 16px; -webkit-font-smoothing: antialiased; }
.am-post h1 { font-size: 30px; line-height: 1.25; color: #1a1a1a; margin: 22px 0 14px; font-weight: 700; letter-spacing: -0.3px; }
.am-post h2 { font-size: 22px; color: #1c1c1a; margin: 30px 0 12px; font-weight: 700; letter-spacing: -0.2px; }
.am-post h3 { font-size: 17px; color: #2d2926; margin: 22px 0 8px; font-weight: 600; }
.am-post p { margin: 10px 0 12px; color: #2d2926; }
.am-post hr { border: none; border-top: 1px solid #e0d8d4; margin: 32px 0 24px; }

.am-meta { color: #6b6b6b; font-size: 13.5px; margin: 4px 0 14px; letter-spacing: 0.1px; }
.am-meta strong { color: #2d2926; font-weight: 600; }

.am-tags { margin: 6px 0 18px; }
.am-tag { display: inline-block; font-size: 11px; letter-spacing: 0.6px; text-transform: uppercase; color: #c0392b; border: 1px solid #e6c8c4; padding: 3px 10px; margin: 0 6px 6px 0; border-radius: 3px; background: #faf6f5; font-weight: 600; }

.am-bio { display: flex; align-items: center; gap: 14px; padding: 16px 18px; background: #faf6f3; border: 1px solid #ede4e0; border-radius: 8px; margin: 14px 0 22px; }
.am-bio-avatar { flex: 0 0 46px; width: 46px; height: 46px; border-radius: 50%; background: #c0392b; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }
.am-bio-name { font-weight: 700; font-size: 14.5px; color: #1c1c1a; margin: 0 0 2px; }
.am-bio-role { font-size: 13px; color: #5a5856; line-height: 1.45; }

.am-post code { font-family: 'Fira Code', 'SFMono-Regular', Consolas, monospace; font-size: 13px; background: #f4eeec; color: #7a2418; padding: 2px 6px; border-radius: 3px; }
.am-post pre { background: #1f1d1c; color: #f0ebe6; font-family: 'Fira Code', 'SFMono-Regular', Consolas, monospace; font-size: 12.5px; line-height: 1.55; padding: 18px 20px; border-radius: 6px; overflow-x: auto; margin: 14px 0 18px; border: 1px solid #2d2926; }
.am-post pre code { background: transparent; color: inherit; padding: 0; }

.am-where { font-style: italic; color: #5a5856; margin: 4px 0 12px; font-size: 14.5px; }
.am-where strong { font-style: normal; color: #2d2926; font-weight: 600; }

.am-post table { width: 100%; border-collapse: collapse; margin: 14px 0 18px; font-size: 13.5px; background: #fff; border: 1px solid #e8e2dd; border-radius: 6px; overflow: hidden; }
.am-post th, .am-post td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #ede4e0; vertical-align: top; }
.am-post tr:last-child td { border-bottom: none; }
.am-post th { background: #faf6f3; font-weight: 700; font-size: 12.5px; letter-spacing: 0.3px; text-transform: uppercase; color: #2d2926; }

.am-post ul, .am-post ol { margin: 8px 0 14px; padding-left: 24px; }
.am-post li { margin: 4px 0; }

.am-fig { background: #fbfaf8; border: 1px solid #ede4e0; border-radius: 8px; padding: 18px 20px 14px; margin: 16px 0 20px; }
.am-fig-title { font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: #8e8b87; margin: 0 0 14px; font-weight: 600; }
.am-fig-caption { font-size: 13px; color: #6b6b6b; line-height: 1.5; margin-top: 12px; padding-top: 10px; border-top: 1px solid #ede4e0; }
.am-fig-caption strong { color: #2d2926; font-weight: 600; }
.am-fig svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }

.am-call { margin: 14px 0; padding: 12px 16px; border-radius: 0 4px 4px 0; font-size: 14px; line-height: 1.55; }
.am-call.note { background: #f0f3fa; border-left: 3px solid #4a5d8f; }
.am-call.note .am-call-tag { color: #2f3e63; }
.am-call.warn { background: #fdf2f0; border-left: 3px solid #c0392b; }
.am-call.warn .am-call-tag { color: #7a2418; }
.am-call.tip { background: #fdf6e3; border-left: 3px solid #b8860b; }
.am-call.tip .am-call-tag { color: #7a5800; }
.am-call.success { background: #ecf6f1; border-left: 3px solid #0d7377; }
.am-call.success .am-call-tag { color: #0a5a5d; }
.am-call-tag { font-weight: 700; display: block; margin-bottom: 4px; font-size: 13.5px; }

.am-pill { display: inline-block; padding: 2px 9px; border-radius: 11px; font-size: 11px; font-weight: 700; letter-spacing: 0.4px; }
.am-pill-green { background: #ecf6f1; color: #0a5a5d; border: 1px solid #b6dccd; }
.am-pill-yellow { background: #fdf6e3; color: #7a5800; border: 1px solid #e6cf94; }
.am-pill-red { background: #fdf2f0; color: #7a2418; border: 1px solid #e6c8c4; }
</style>

<div class="am-post">

<div class="am-meta">
<a href="https://abhishekmohanty-hcm.blogspot.com/2026/04/" style="color:#c0392b;text-decoration:none;font-weight:600;">April 28, 2026</a>
</div>

<div class="am-tags">
<span class="am-tag">Fast Formula</span>
<span class="am-tag">Absence Management</span>
<span class="am-tag">GET_PLAN_BALANCE</span>
<span class="am-tag">DBI</span>
</div>

<h1>Oracle Fast Formula: Reading Absence Balance — Four Mechanisms, the Naming Traps, and a Recipe That Actually Works</h1>

<div class="am-meta">
<strong>Abhishek Mohanty</strong> · April 2026 · 14 min read · Oracle HCM Cloud
</div>

<p>If you have ever written an absence Fast Formula, deployed it, watched it compile cleanly, and then opened the timecard or the absence record only to find a wrong balance — this post is for you.</p>

<p>Reading absence balance fails for two reasons. Either the function you picked reads from the wrong place — the saved snapshot when you needed live, or vice versa. Or the filter you wrote does nothing because of a status-column naming asymmetry that is easy to miss. Most blogs jump straight to the function call. But if the mechanism does not match the use case, no amount of tweaking inside it will produce the right number.</p>

<p>This post walks through all four mechanisms in order: what each one queries under the hood, when it works, when it silently fails, and the production-ready composite recipe that combines two of them into a balance reader you can defend in audit.</p>

<div class="am-fig">
<p class="am-fig-title">FORMULA CONTEXT · THE QUESTION</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-1.png" alt="Diagram 1: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 1 —</strong> Five formula contexts converge on the same sub-question. Four mechanisms can answer it, but the silent failure mode — wrong number, no compile error — is what makes the choice load-bearing.</p>
</div>

<hr>

<h2>The Four Mechanisms — Side by Side</h2>

<p>Before we go deep on each one, here is the quick reference table. Keep it open when you are halfway through writing a formula and trying to remember which function fits the use case.</p>

<table>
<thead><tr><th>Mechanism</th><th>Reads From</th><th>Sees In-Progress</th><th>Filter Visible</th><th>Best For</th></tr></thead>
<tbody>
<tr><td><code>GET_PLAN_BALANCE</code></td><td>Saved balance</td><td><span class="am-pill am-pill-red">No</span></td><td><span class="am-pill am-pill-yellow">N/A</span></td><td>Carryover, period-end reports, snapshot anchor</td></tr>
<tr><td><code>GET_ABSENCE_COUNTS</code></td><td>Live entries</td><td><span class="am-pill am-pill-green">Yes</span></td><td><span class="am-pill am-pill-red">No</span></td><td>"Applied for" occurrence rules</td></tr>
<tr><td><code>GET_ABSENCE_DAYS_PER_TYPE</code></td><td>Live entries</td><td><span class="am-pill am-pill-green">Yes</span></td><td><span class="am-pill am-pill-red">Hidden</span></td><td>Indicative reports only</td></tr>
<tr><td>Read each entry yourself <em>(recommended)</em></td><td>Live entries</td><td><span class="am-pill am-pill-green">Yes</span></td><td><span class="am-pill am-pill-green">Yes</span></td><td>Real-time decisions, audit-grade rules</td></tr>
</tbody>
</table>

<div class="am-fig">
<p class="am-fig-title">CAPABILITY MATRIX</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-2.png" alt="Diagram 2: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 2 —</strong> Capability matrix across all four mechanisms. Mechanism 4 is the only path that earns a "yes" on every dimension — at the cost of around fifty lines of structural setup that the other three avoid.</p>
</div>

<div class="am-call note">
<span class="am-call-tag">📌 Why this is harder than it should be</span>
The four functions all return a number related to absence consumption. They all compile. The differences only show up in specific lifecycle states — in-progress requests, withdrawn entries, post-batch lag — which UAT often does not exercise systematically. The bug ships and surfaces three months later when an auditor asks why the numbers do not reconcile.
</div>

<hr>

<h2>Mechanism 1 — <code>GET_PLAN_BALANCE</code> (the saved snapshot)</h2>

<p>The default reach for anyone who has read the Oracle documentation. Returns a clean numeric balance, well-named, and works perfectly in unit tests. It is also the most frequent root cause of broken Entry Validation rules in production.</p>

<p class="am-where"><strong>Where the data comes from:</strong> <em>ANC_PER_ACRL_ENTRY_DTLS — the committed accrual ledger, refreshed only when the absence accrual engine runs (typically nightly batch).</em></p>

<h3>Scenario from the UI</h3>

<p>Open <strong>Me > Time and Absences > Absence Balance</strong>. The plan balance shown there comes from the latest accrual run — signed off and stable. But if a leave was submitted this morning, you will not see its impact here until the next batch runs. <code>GET_PLAN_BALANCE</code> reads from the exact same place.</p>

<div class="am-fig">
<p class="am-fig-title">SEQUENCE DIAGRAM · A DAY IN THE LIFE OF A BALANCE</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-3.png" alt="Diagram 3: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 3 —</strong> Sequence diagram of the lag mechanism. The 14:00 absence submission writes to the live table immediately, but the snapshot ledger is not updated until the next batch run at 02:00. Any formula calling <code>GET_PLAN_BALANCE</code> in the intervening 12-hour window reads stale data, and the absence engine provides no callback to invalidate it.</p>
</div>

<h3>The signature most authors get wrong</h3>

<p>The function takes <strong>one explicit argument</strong> — the plan name. Person, assignment, plan ID, effective date, and LDG must already be in scope as <strong>contexts</strong>. The PL/SQL-style three-argument call is a common carry-over from data-warehouse SQL habits, and it is wrong.</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><code>/* Correct call */
g_balance = GET_PLAN_BALANCE('Annual Leave Plan')

/* These must be in scope as contexts — you do NOT pass them as arguments:
   PERSON_ID
   HR_ASSIGNMENT_ID
   EFFECTIVE_DATE
   ACCRUAL_PLAN_ID
   LEGISLATIVE_DATA_GROUP_ID                                              */</code></pre>

<div class="am-call success">
<span class="am-call-tag">✅ Use it for</span>
Carryover formulas (where you want the snapshot — that is precisely the point), period-end reporting, accrual statements, and as the "starting balance" inside the composite recipe later in this post. Do <strong>not</strong> use it stand-alone for any decision that must reflect the current moment.
</div>

<hr>

<h2>Mechanism 2 — <code>GET_ABSENCE_COUNTS</code> (counts everything, even withdrawn)</h2>

<p>Reads the live absence collection. Counts entries in a date range and returns six duration totals via OUT parameters. Useful, with one well-known catch: it applies <strong>no status filter at all</strong>. Withdrawn entries count. Denied entries count. Approved entries count. They are all the same to this function.</p>

<p class="am-where"><strong>Where the data comes from:</strong> <em>ANC_PER_ABS_ENTRIES — the live absence collection, updated transactionally on every Submit, Approve, or Withdraw.</em></p>

<h3>Scenario from the UI</h3>

<p>Switch to <strong>Me > Time and Absences > Existing Absences</strong>. It lists every absence the employee ever recorded — submitted, approved, withdrawn, denied, all of them. If you simply count the rows, you get a true count of entries, but not a count of leave actually consumed. <code>GET_ABSENCE_COUNTS</code> works the same way.</p>

<div class="am-fig">
<p class="am-fig-title">DATA VIEW · GET_ABSENCE_COUNTS</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-4.png" alt="Diagram 4: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 4 —</strong> Three live entries on <code>ANC_PER_ABS_ENTRIES</code>; <code>GET_ABSENCE_COUNTS</code> returns 3 regardless of how many should logically count. The withdrawn entry inflates every consumption-derived metric you build on top of this number.</p>
</div>

<div class="am-call warn">
<span class="am-call-tag">⚠️ Documented limitation — MOS Doc ID 2899647.1</span>
<em>"Need To Exclude Denied And Withdrawn Absences From GET_ABSENCE_COUNTS Results"</em> — Oracle has confirmed this. There is no setting to filter; you have to live with what it returns or switch to Mechanism 4.
</div>

<div class="am-call note">
<span class="am-call-tag">📌 Hidden capability most authors miss</span>
Despite the name, the function returns <em>seven</em> values via OUT parameters — occurrence count plus six duration totals (days, hours, calendar days, weeks, months, years). If you only read the count, you are throwing away half its value.
</div>

<div class="am-call success">
<span class="am-call-tag">✅ Use it for</span>
"Applied for" rules — e.g. <em>"no more than 5 sick leave applications per quarter, regardless of approval"</em>. Do <strong>not</strong> use it for consumption arithmetic where withdrawn or denied entries must be excluded.
</div>

<hr>

<h2>Mechanism 3 — <code>GET_ABSENCE_DAYS_PER_TYPE</code> (the opaque sum)</h2>

<p>Looks like the obvious answer. Returns days consumed for a given type, in a given window, for a given person. Three arguments, one numeric output, no setup required. The catch is what happens between input and output.</p>

<h3>Scenario from the UI</h3>

<p>Run the seeded <strong>Absence Records OTBI report</strong> for the same employee. The "Absence Days" column shows a number, but the report has hidden filters baked into the subject area — you cannot see which entries got included. After the next quarterly upgrade, the same employee might show a different total. <code>GET_ABSENCE_DAYS_PER_TYPE</code> has the same problem.</p>

<div class="am-fig">
<p class="am-fig-title">FILTER VISIBILITY · THE OPAQUE-FILTER PROBLEM</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-5.png" alt="Diagram 5: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 5 —</strong> The function sums <code>DURATION</code> from <code>ANC_PER_ABS_ENTRIES</code>, but applies an internal filter that Oracle does not document. The same query against the same data could return a different number after a quarterly upgrade, with no compile error to surface the change.</p>
</div>

<div class="am-call warn">
<span class="am-call-tag">⚠️ SOX and audit implication</span>
If you cannot certify what a function does on every release, it is not safe for governance rules. Prefer mechanisms where the filter is visible in your formula text.
</div>

<div class="am-call success">
<span class="am-call-tag">✅ Use it for</span>
Indicative day totals in management reports or debug logging. Do <strong>not</strong> use it for any rule where state-by-state correctness must be certified or audited.
</div>

<hr>

<h2>Mechanism 4 — Read each entry yourself <em>(recommended)</em></h2>

<p>This is the pattern the previous three mechanisms exist as shortcuts for. Verbose, careful with defaults, deliberate with the iteration. In return, it gives you the only path where the filter logic lives <em>inside</em> your formula text and survives quarterly upgrades unchanged.</p>

<h3>Scenario from the UI</h3>

<p>Go back to <strong>Existing Absences</strong>. The page first loads a list of absences — just dates and types. To see the duration breakdown, approval history, or comments for any one of them, you click that row. List first, full details one at a time — that is exactly how Oracle exposes live absence data inside Fast Formula.</p>

<h3>The two-step structure</h3>

<p>If I had seen this diagram three years ago, I would have saved a lot of compile errors. The DBI dictionary for absence entries is <em>not</em> seven parallel arrays you can index by a shared loop counter. It is one list-DBI of entry IDs, plus a set of scalar DBIs that resolve per-entry once you set the right context.</p>

<div class="am-fig">
<p class="am-fig-title">DBI ARCHITECTURE · TWO-STEP MODEL</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-6.png" alt="Diagram 6: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 6 —</strong> The documented Oracle DBI model for live absence entries. <strong>One</strong> array DBI (Tier 1), <strong>six</strong> scalar DBIs (Tier 2). The trap that catches most authors is reaching for parallel <code>_ARR</code> siblings — <code>ANC_PER_ABS_ENTRS_START_DATE_ARR</code>, <code>..._APPROVAL_STATUS_CD_ARR</code>, and so on — which do not exist in the dictionary. Code that references them looks plausible but does not compile.</p>
</div>

<h3>Going through the list one entry at a time</h3>

<p>Once you have the list of IDs, you walk through it one ID at a time. For each ID, you switch focus to that entry, read its details, decide if it counts, and add to your running total. Then move to the next ID.</p>

<div class="am-fig">
<p class="am-fig-title">FLOWCHART · LIVE-LOOP CONTROL FLOW</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-7.png" alt="Diagram 7: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 7 —</strong> Loop control flow with proper UML/BPMN symbology. Five distinct guards shape the path: array existence (top diamond), entry-type match, self-exclusion (the entry being validated must not count itself), absence-status filter, and approval-status filter. Failure on any guard skips the entry without aborting the loop.</p>
</div>

<h3>Two syntactic landmines</h3>

<p>Get these two wrong and your formula will not compile. Both are easy to copy from older blogs that show pre-current syntax.</p>

<table>
<thead><tr><th>Looks plausible · will not compile</th><th>Documented Oracle pattern</th></tr></thead>
<tbody>
<tr>
<td><code>FIRST_INDEX('N', arr)</code><br><code>NEXT_INDEX('N', arr, i)</code><br><code>WHILE i WAS NOT DEFAULTED</code></td>
<td><code>arr.FIRST(-1)</code><br><code>arr.NEXT(i, -1)</code><br><code>WHILE arr.EXISTS(i)</code></td>
</tr>
<tr>
<td><code>EMPTY_NUMBER_DATE</code><br><span style="font-size:12px;color:#7a2418;">DATE cannot be an index type</span></td>
<td><code>EMPTY_DATE_NUMBER</code><br><span style="font-size:12px;color:#0a5a5d;">format: <code>EMPTY_<data>_<index></code></span></td>
</tr>
</tbody>
</table>

<div class="am-call success">
<span class="am-call-tag">✅ Use it for</span>
Any rule that needs an accurate live balance — real-time validation, audit-grade governance, anything where you need to defend the number. The verbosity is the price; correctness is what you buy.
</div>

<hr>

<h2>Snapshot vs Live — The Architectural Split</h2>

<p>The four mechanisms split cleanly across two underlying data sources. This is the diagnostic question to ask before writing any balance formula.</p>

<div class="am-fig">
<p class="am-fig-title">DATA TOPOLOGY · SNAPSHOT VS LIVE</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-8.png" alt="Diagram 8: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 8 —</strong> The two data worlds. The accrual engine periodically reconciles the live collection into the snapshot ledger, but between engine runs the two are out of sync — which is why the same person can have a different "balance" depending on which world your formula reads.</p>
</div>

<div class="am-call note">
<span class="am-call-tag">📌 Diagnostic question</span>
If a user submits an absence and immediately submits a second one, does my formula need to <em>see</em> the first submission? If yes — live world. If no — snapshot world is fine, and the simpler <code>GET_PLAN_BALANCE</code> path is appropriate.
</div>

<hr>

<h2>The Status-Code Naming Trap</h2>

<p>Of all the silent bugs in this domain, this one accounts for more support tickets than the rest combined. Two columns describe an absence's status. They use <em>different</em> naming conventions. A filter that looks correct against one column is a no-op against the other.</p>

<div class="am-fig">
<p class="am-fig-title">DIAGNOSTIC · THE STATUS-CODE NAMING TRAP</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-9.png" alt="Diagram 9: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 9 —</strong> The asymmetry is structural — the two columns originate in different framework layers and follow different conventions. There is no Oracle plan to reconcile them. The defensive practice is to filter on both columns with both naming conventions, every time.</p>
</div>

<div class="am-call warn">
<span class="am-call-tag">⚠️ The bug everyone ships at least once</span>
Writing <code>IF arr_app_status[i] <> 'ORA_WITHDRAWN'</code> on the approval column is always TRUE — because that column never carries the <code>ORA_</code> prefix. The filter is a silent no-op. Withdrawn entries pass through. The formula compiles and ships.
</div>

<div class="am-call note">
<span class="am-call-tag">📌 Edge case worth knowing — MOS 2624787.1</span>
The two columns can drift in administrative-cancellation paths. An absence reaching <code>ABSENCE_STATUS_CD = 'ORA_COMPLETED'</code> can be retroactively cancelled in error/expiry flows such that only <code>APPROVAL_STATUS_CD</code> updates. A two-pronged filter catches both paths; a single-column filter misses them.
</div>

<p>The defensive pattern, every time:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><code>IF abs_status <> 'ORA_WITHDRAWN'
   AND app_status <> 'WITHDRAWN'
   AND app_status <> 'DENIED' THEN
  /* this entry counts towards consumption */
END IF</code></pre>

<hr>

<h2>The Composite Pattern — Snapshot Anchor + Live Loop</h2>

<p>For accurate live balance, the working practitioner pattern combines two of the four mechanisms. <code>GET_PLAN_BALANCE</code> gives you the starting balance. Mechanism 4 gives you the live adjustment. The result is a balance that is both contractually stable and current to this instant.</p>

<div class="am-fig">
<p class="am-fig-title">COMPOSITE PATTERN · END-TO-END</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-10.png" alt="Diagram 10: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 10 —</strong> The composite pattern, end-to-end. Step 2 is not just hygiene — on plans with high consumption rates it short-circuits a non-trivial fraction of formula executions, which matters at year-end peak load.</p>
</div>

<h3>The Production-Ready Recipe</h3>

<p>Below is the full reader. It returns <code>g_live_balance</code> for whatever calling formula type wraps it — Entry Validation will use it to drive a <code>VALID</code>/<code>ERROR_MESSAGE</code> decision, a Plan Use Rate formula will use it to compute deduction, a Type Duration formula will use it to constrain the duration calculation. Only the way you consume the final number changes.</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px"><code>/******************************************************************
  RECIPE  : LIVE_ABSENCE_BALANCE_READER
  PURPOSE : Return live balance = snapshot anchor minus
            in-flight consumption, using documented Oracle
            DBI patterns.
  USE IN  : Any Absence FF type that needs accurate live
            balance (Entry Validation, Plan Use Rate,
            Type Duration, custom Accrual logic, etc.).
******************************************************************/

/* A. DEFAULTS — input contexts */
DEFAULT FOR EFFECTIVE_DATE              IS '4712/12/31' (date)
DEFAULT_DATA_VALUE FOR PERSON_ID        IS 0
DEFAULT_DATA_VALUE FOR ABSENCE_ENTRY_ID IS -1

/* B. DEFAULTS — the list-DBI (Step 1) */
DEFAULT FOR ANC_PER_ABS_ENTRS_ABSENCE_ENTRY_ID_ARR
                                        IS EMPTY_NUMBER_NUMBER

/* C. DEFAULTS — the per-entry scalars (Step 2) */
DEFAULT FOR ANC_ABS_ENTRS_ABSENCE_TYPE_ID    IS 0
DEFAULT FOR ANC_ABS_ENTRS_START_DATE         IS '1900/01/01' (date)
DEFAULT FOR ANC_ABS_ENTRS_END_DATE           IS '4712/12/31' (date)
DEFAULT FOR ANC_ABS_ENTRS_ABSENCE_STATUS_CD  IS 'ORA_COMPLETED'
DEFAULT FOR ANC_ABS_ENTRS_APPROVAL_STATUS_CD IS 'APPROVED'
DEFAULT FOR ANC_ABS_ENTRS_DURATION           IS 0

INPUTS ARE iv_target_type_id (number), iv_window_start (date)

/* D. CONTEXT INIT */
l_self_entry_id = GET_CONTEXT(ABSENCE_ENTRY_ID, -1)
l_person        = GET_CONTEXT(PERSON_ID, 0)
l_eff_date      = GET_CONTEXT(EFFECTIVE_DATE, iv_window_start)
c_plan_name     = 'Annual Leave Plan'

/* E. SNAPSHOT ANCHOR */
g_opening = GET_PLAN_BALANCE(c_plan_name)

/* F. EARLY-EXIT GUARD */
IF g_opening <= 0 THEN
(
  g_live_balance = 0
  RETURN g_live_balance
)

/* G. STEP 1 — resolve the list of entry IDs */
CHANGE_CONTEXTS(PERSON_ID      = l_person,
                EFFECTIVE_DATE = l_eff_date)
(
  arr_entry_id = ANC_PER_ABS_ENTRS_ABSENCE_ENTRY_ID_ARR
)

/* H. STEP 2 — loop through, read scalars per entry, filter, accumulate */
g_consumed = 0
NI = arr_entry_id.FIRST(-1)

WHILE arr_entry_id.EXISTS(NI) LOOP
(
  l_entry_id = arr_entry_id[NI]

  CHANGE_CONTEXTS(ABSENCE_ENTRY_ID = l_entry_id)
  (
    l_type_id    = ANC_ABS_ENTRS_ABSENCE_TYPE_ID
    l_abs_status = ANC_ABS_ENTRS_ABSENCE_STATUS_CD
    l_app_status = ANC_ABS_ENTRS_APPROVAL_STATUS_CD
    l_duration   = ANC_ABS_ENTRS_DURATION
  )

  /* Nested IFs — guaranteed skip, no short-circuit assumption */
  IF l_type_id = iv_target_type_id THEN
  (
    IF l_entry_id <> l_self_entry_id THEN
    (
      IF l_abs_status <> 'ORA_WITHDRAWN' THEN
      (
        IF l_app_status <> 'WITHDRAWN'
           AND l_app_status <> 'DENIED' THEN
        (
          g_consumed = g_consumed + l_duration
        )
      )
    )
  )

  NI = arr_entry_id.NEXT(NI, -1)
)

/* I. RECONCILE */
g_live_balance = g_opening - g_consumed
IF g_live_balance < 0 THEN g_live_balance = 0

RETURN g_live_balance
</code></pre>

<div class="am-call success">
<span class="am-call-tag">✅ What this recipe covers</span>
<strong>Snapshot anchor</strong> — <code>GET_PLAN_BALANCE</code> for the stable starting number. <strong>Early-exit guard</strong> — cheap short-circuit when nothing remains to subtract from. <strong>Step 1 + Step 2 DBI pattern</strong> — list of IDs, then per-entry scalar reads inside <code>CHANGE_CONTEXTS</code>. <strong>Self-exclusion</strong> — the entry being validated does not count itself. <strong>Both-column status filter</strong> — ORA_ on lifecycle, no prefix on approval. <strong>Reconciliation</strong> — floor at zero. Every guard is explicit and auditable.
</div>

<hr>

<h2>Anti-Pattern Catalogue — Five Mistakes That Ship Silently</h2>

<p>If you have written Absence Fast Formulas long enough, you have seen all five — usually in code you wrote yourself a year earlier. Numbers 1, 3, and 4 surface as compile errors or empty results eventually. Numbers 2 and 5 are the silent ones — the formula compiles, runs, and returns subtly wrong numbers.</p>

<div class="am-fig">
<p class="am-fig-title">ANTI-PATTERN CATALOGUE</p>
<div style="text-align:center;">
<img src="/images/posts/oracle-fast-formula-getplanbalance/diagram-11.png" alt="Diagram 11: Oracle Fast Formula: GET_PLAN_BALANCE, GET_ABSENCE_COUNTS, a" style="max-width:100%;height:auto;margin:26px auto;display:block;border-radius:6px;border:1px solid #e5e0d8" loading="lazy" />
</div>
<p class="am-fig-caption"><strong>Fig 11 —</strong> The five highest-frequency anti-patterns in this domain. Numbers 1, 3, and 4 are syntactic and surface eventually as compile errors or empty results. Numbers 2 and 5 are silent — the formula compiles and runs, returning subtly wrong numbers.</p>
</div>

<hr>

<h2>The 30-Second Checklist</h2>

<p>If your absence formula compiles cleanly but returns the wrong number, walk this checklist in order.</p>

<table>
<thead><tr><th>#</th><th>Check</th><th>Where</th></tr></thead>
<tbody>
<tr><td>1</td><td>Mechanism matches use case (snapshot vs live)</td><td>This post — sections on Mechanism 1 vs 4</td></tr>
<tr><td>2</td><td><code>GET_PLAN_BALANCE</code> called with one argument, not three</td><td>Inside the formula</td></tr>
<tr><td>3</td><td>List-DBI prefix <code>ANC_PER_ABS_ENTRS_</code> · scalar prefix <code>ANC_ABS_ENTRS_</code></td><td>Inside the formula</td></tr>
<tr><td>4</td><td>Iteration uses <code>arr.FIRST(-1)</code> / <code>arr.EXISTS(i)</code> / <code>arr.NEXT(i, -1)</code></td><td>Loop body</td></tr>
<tr><td>5</td><td>Empty-array default uses <code>EMPTY_<data>_<index></code> format</td><td>DEFAULT FOR section</td></tr>
<tr><td>6</td><td>Both <code>ABSENCE_STATUS_CD</code> and <code>APPROVAL_STATUS_CD</code> filtered, with their own prefix conventions</td><td>Filter chain</td></tr>
<tr><td>7</td><td>Self-exclusion guard (<code>l_entry_id <> l_self_entry_id</code>)</td><td>Filter chain — only inside Entry Validation</td></tr>
<tr><td>8</td><td>Snapshot anchor + early-exit guard if performance matters</td><td>Step E and F of the recipe</td></tr>
</tbody>
</table>

<hr>

<h2>Quick Reference Card</h2>

<table>
<thead><tr><th>Function</th><th>Source</th><th>Filter Behaviour</th><th>Use For</th></tr></thead>
<tbody>
<tr><td><code>GET_PLAN_BALANCE</code></td><td>Snapshot ledger</td><td>Only finalised consumption</td><td>Carryover, reporting, snapshot anchor</td></tr>
<tr><td><code>GET_ABSENCE_COUNTS</code></td><td>Live entries</td><td>No filter (MOS 2899647.1)</td><td>"Applied for" occurrence rules</td></tr>
<tr><td><code>GET_ABSENCE_DAYS_PER_TYPE</code></td><td>Live entries</td><td>Hidden internal filter</td><td>Indicative reports only</td></tr>
<tr><td>List-DBI + per-entry scalars</td><td>Live entries</td><td>Filter visible in your formula</td><td>Real-time, audit-grade rules</td></tr>
</tbody>
</table>

<hr>

<h2>Key Takeaways</h2>

<p><strong>Pick the mechanism by use case, not by familiarity.</strong> The default function (<code>GET_PLAN_BALANCE</code>) is right for snapshot questions and wrong for live ones. Reaching for it by reflex is the most common reason Entry Validation rules break in production.</p>

<p><strong>The DBI model is two-step, not parallel arrays.</strong> One list of entry IDs (Step 1), then per-entry scalar reads inside <code>CHANGE_CONTEXTS(ABSENCE_ENTRY_ID = ...)</code> (Step 2). Code written against parallel <code>_ARR</code> siblings does not match the published dictionary — will not compile.</p>

<p><strong>Both status columns, both prefix conventions.</strong> <code>ABSENCE_STATUS_CD</code> uses the <code>ORA_</code> prefix; <code>APPROVAL_STATUS_CD</code> does not. Filter on both, every time, regardless of how confident you are that the entries you care about only ever update one column.</p>

<p><strong>The composite recipe is the production pattern.</strong> Snapshot anchor + early-exit guard + live loop + reconcile. Drop it in, replace the plan name and the input parameters, and you have a balance reader you can defend in audit.</p>

<p>Next in this series: the equivalent function reference for OTL Time Entry Rules — where the live data lives in the <code>HWM_*</code> schema, the available functions are substantially different, and the lifecycle states map onto a different framework altogether.</p>

<div class="am-bio">
<div class="am-bio-avatar">AM</div>
<div>
<div class="am-bio-name">Abhishek Mohanty</div>
<div class="am-bio-role">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Time and Labor, Core HR, Redwood, HDL, OTBI.</div>
</div>
</div>

<div class="am-tags" style="margin-top:18px;">
<span class="am-tag">Fast Formula</span>
<span class="am-tag">Absence Management</span>
<span class="am-tag">GET_PLAN_BALANCE</span>
<span class="am-tag">GET_ABSENCE_COUNTS</span>
<span class="am-tag">CHANGE_CONTEXTS</span>
<span class="am-tag">DBI</span>
<span class="am-tag">Oracle HCM 26A</span>
</div>

</div>