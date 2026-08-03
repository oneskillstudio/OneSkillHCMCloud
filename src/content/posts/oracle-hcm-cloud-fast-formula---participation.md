---
title: "Oracle HCM Cloud Fast Formula - Participation and Rate Eligibility formula with CHANGE_CONTEXTS, WAS DEFAULTED null handling, PER_EXT_ORG array DBI loop"
pubDate: 2026-03-19
description: "Oracle HCM Cloud Fast Formula - Participation and Rate Eligibility formula with CHANGE_CONTEXTS, WAS DEFAULTED null handling, PER_EXT_ORG array DBI loop"
tags: ["Fast Formula", "Null Handling", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

<div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#1a1a1a;line-height:1.8;max-width:780px;margin:0 auto;">

<span style="display:inline-block;background:#c0392b;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Fast Formula</span>
<span style="display:inline-block;background:#2c3e50;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">Participation & Rate Eligibility</span>
<span style="display:inline-block;background:#27ae60;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">CHANGE_CONTEXTS</span>
<span style="display:inline-block;background:#8e44ad;color:#fff;padding:4px 14px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;margin-bottom:6px;margin-right:6px;">WAS DEFAULTED</span>

<div style="font-size:28px;font-weight:800;color:#1a1a1a;margin:20px 0 6px;line-height:1.3;">Oracle Fast Formula: Participation and Rate Eligibility — Work State Exclusion Using CHANGE_CONTEXTS, Extract Org Array DBIs & a Three-Tier Fallback Chain</div>

<div style="font-size:13px;color:#888;margin-bottom:25px;letter-spacing:0.5px;">March 2026 • 18 min read • Oracle HCM Cloud</div>

<div style="font-size:16px;color:#555;line-height:1.7;margin-bottom:30px;font-style:italic;border-left:4px solid #c0392b;padding-left:18px;">
The business says "exclude workers in Puerto Rico and Washington DC." Simple — until you realize that the worker's work state can come from three different places in Oracle HCM depending on whether they work from home, whether their department has a state configured, or whether you have to fall back to the assignment location. This Participation and Rate Eligibility formula handles all three scenarios — and the org location lookup at the center of it uses CHANGE_CONTEXTS and array looping, both of which we covered in the previous posts.
</div>

<div style="display:flex;align-items:center;gap:14px;padding:20px 0;border-top:2px solid #1a1a1a;border-bottom:2px solid #1a1a1a;margin-bottom:35px;">
<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0;">AM</div>
<div>
<div style="font-weight:700;font-size:15px;">Abhishek Mohanty</div>
<div style="font-size:13px;color:#888;">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant</div>
</div>
</div>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">In the previous posts, we covered <a href="#">the 7 building blocks of Fast Formula</a>, <a href="#">the PH Vacation Leave Accrual Matrix formula</a>, <a href="#">Array DBIs with CHANGE_CONTEXTS</a>, and <a href="#">There Is No NULL in Fast Formula</a>. This post puts all of that together in a real-world <strong><a href="https://docs.oracle.com/en/cloud/saas/human-resources/oapff/participation-and-rate-eligibility.html" target="_blank"><u>Participation and Rate Eligibility</u> ↗</a></strong> formula — the formula type Oracle uses to determine whether a person is eligible for a compensation object. This one uses standard DBIs, extract org array DBIs, CHANGE_CONTEXTS, WAS DEFAULTED null handling, and a multi-tier fallback chain.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">I'll walk through the formula section by section, explain why each piece exists, and show the actual DBI metadata from the <a href="https://www.scribd.com/document/511029660/HCM-Extract-DBI-List-REL11-updated" target="_blank"><u>REL11 DBI export file</u> ↗</a> to prove it.</p>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== WHAT THE FORMULA DOES ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">What This Formula Does</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">This is a <strong>Participation and Rate Eligibility</strong> formula. In Oracle Benefits, you attach this formula type to an Eligibility Profile to determine whether a person qualifies for a compensation object (plan, option, rate). The return value is simple: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ELIGIBLE = 'Y'</code> or <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">'N'</code>.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Our eligibility rule: <strong>if the worker's work state is Puerto Rico (PR) or Washington DC (DC), they're excluded.</strong> Everyone else is eligible.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The complication is that the worker's work state can come from three possible sources. The formula checks them in order — Tier 1 first, Tier 2 if Tier 1 doesn't apply, Tier 3 only as a fallback.</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">Tier</th>
<th style="padding:10px 14px;text-align:left;">Condition</th>
<th style="padding:10px 14px;text-align:left;">State Source</th>
<th style="padding:10px 14px;text-align:left;">DBI Used</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:700;">1</td>
<td style="padding:10px 14px;">Work at Home = Y</td>
<td style="padding:10px 14px;">Assignment Work Location State</td>
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">PER_ASG_LOC_REGION2</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:700;">2</td>
<td style="padding:10px 14px;">Work at Home = N, department state found</td>
<td style="padding:10px 14px;">Department's Organization Location State</td>
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">PER_EXT_ORG_LOC_REGION2[i]</td>
</tr>
<tr style="background:#f8f9fa;">
<td style="padding:10px 14px;font-weight:700;">3</td>
<td style="padding:10px 14px;">Work at Home = N, no department state</td>
<td style="padding:10px 14px;">Assignment Location (fallback)</td>
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">PER_ASG_LOC_REGION2</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The first thing you'll notice: <strong>Tier 1 and Tier 3 use the same DBI</strong> (<code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_LOC_REGION2</code>). And Tier 2 uses a completely different one — an array DBI that requires CHANGE_CONTEXTS and a loop. Why?</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Because each tier answers a different business question:</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:24px 0 12px;">Tier 1 — Remote Workers (Work at Home = Y)</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The worker works from home. Their assignment still has a location on record — the office they're affiliated with for payroll, tax, or reporting. For remote workers, the business says: check the state on their assignment location. If it's PR or DC, exclude them.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">DBI: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_LOC_REGION2</code> — standard DBI, single value, no loop needed.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:24px 0 12px;">Tier 2 — Office Workers with Department State (Work at Home = N)</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The worker goes to an office. But the business doesn't want to check where the worker <em>sits</em> — they want to check where the worker's <strong>department is located</strong>. A worker could sit in a New York office but belong to a department headquartered in Puerto Rico. The eligibility is based on the department's jurisdiction, not the worker's physical desk.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The problem: there's no DBI that directly returns "department's location state." You have to loop through the org array, match the org ID against the worker's department ID, and grab the state.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">DBI: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_EXT_ORG_LOC_REGION2[i]</code> — array DBI, needs CHANGE_CONTEXTS + WHILE loop + org ID matching. This is the most complex part of the formula.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:24px 0 12px;">Tier 3 — Office Workers, No Department State (Fallback)</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The formula tried to look up the department's state — but found nothing. The department doesn't have a location configured in Manage Organizations. Fall back to the worker's own assignment location.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">DBI: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_ASG_LOC_REGION2</code> — same DBI as Tier 1, different reason. Tier 1 uses it because the worker is remote. Tier 3 uses it because the department lookup failed.</p>

<div style="background:#fff3cd;border-left:4px solid #f0ad4e;padding:14px 18px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0 0 10px;font-size:14px;color:#856404;"><strong>Why the same DBI in Tier 1 and Tier 3 but not Tier 2?</strong></p>
<p style="margin:0;font-size:14px;color:#856404;"><code>PER_ASG_LOC_REGION2</code> answers: <em>"What state is on the worker's assignment location?"</em> That's the right question for remote workers (Tier 1) and when department data is missing (Tier 3). But for office workers with a department location configured (Tier 2), the business wants a different question: <em>"What state is the department's organization located in?"</em> — that requires the org array lookup.</p>
</div>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:24px 0 12px;">A Real-World Example</div>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:8px 12px;text-align:left;"></th>
<th style="padding:8px 12px;text-align:center;">Maria<br><span style="font-size:10px;font-weight:400;">Remote</span></th>
<th style="padding:8px 12px;text-align:center;">James<br><span style="font-size:10px;font-weight:400;">Office, dept in PR</span></th>
<th style="padding:8px 12px;text-align:center;">Priya<br><span style="font-size:10px;font-weight:400;">Office, no dept loc</span></th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;font-weight:600;">Work at Home</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">Y</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">N</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">N</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;font-weight:600;">Assignment Location</td>
<td style="padding:8px 12px;text-align:center;">TX Office</td>
<td style="padding:8px 12px;text-align:center;">NY Office</td>
<td style="padding:8px 12px;text-align:center;">FL Office</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;font-weight:600;">Dept Location State</td>
<td style="padding:8px 12px;text-align:center;color:#888;">— (not checked)</td>
<td style="padding:8px 12px;text-align:center;font-weight:700;color:#c0392b;">PR</td>
<td style="padding:8px 12px;text-align:center;color:#888;">— (not configured)</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;font-weight:600;">Tier that fires</td>
<td style="padding:8px 12px;text-align:center;font-weight:700;">Tier 1</td>
<td style="padding:8px 12px;text-align:center;font-weight:700;">Tier 2</td>
<td style="padding:8px 12px;text-align:center;font-weight:700;">Tier 3</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;font-weight:600;">State checked</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">TX (asg loc)</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">PR (dept org loc)</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">FL (asg loc fallback)</td>
</tr>
<tr style="background:#fff;">
<td style="padding:8px 12px;font-weight:700;">Result</td>
<td style="padding:8px 12px;text-align:center;font-weight:700;color:#27ae60;">ELIGIBLE</td>
<td style="padding:8px 12px;text-align:center;font-weight:700;color:#c0392b;">EXCLUDED</td>
<td style="padding:8px 12px;text-align:center;font-weight:700;color:#27ae60;">ELIGIBLE</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">Notice James: he sits in the New York office, but his department (HR) is headquartered in Puerto Rico. If the formula only checked assignment location, James would pass. Tier 2 catches it.</p>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== THE COMPLETE FORMULA ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">The Complete Formula</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Here's the full Participation and Rate Eligibility formula. I'll break it into blocks below.</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">/* ================================================== */
/* Participation and Rate Eligibility Formula         */
/* Work State Exclusion (Exclude PR, DC)              */
/* ================================================== */

DEFAULT for PER_ASG_WORK_AT_HOME is 'NO_DATA'
DEFAULT for PER_ASG_LOC_REGION2 is 'NO_DATA'

DEFAULT_DATA_VALUE for PER_EXT_ORG_LOC_REGION2 is 'NO_REGION'
DEFAULT_DATA_VALUE for PER_EXT_ORG_ORGANIZATION_ID is 0
DEFAULT FOR PER_ASG_DEPARTMENT_ID IS 0

/* ----- Initialize ----- */
i = 1
l_loc = 'NO_REGION'

l_ORGANIZATION_ID = PER_ASG_DEPARTMENT_ID

l_eff_date = get_context(EFFECTIVE_DATE, '1900/01/01 00:00:00'(date))

ELIGIBLE = 'N'

/* ----- Resolve Department State via Org Location ----- */
CHANGE_CONTEXTS (EFFECTIVE_DATE = l_eff_date)
(
    WHILE PER_EXT_ORG_LOC_REGION2.exists(i)  LOOP
    (
        IF PER_EXT_ORG_ORGANIZATION_ID[i] = PER_ASG_DEPARTMENT_ID THEN
        (
            l_loc = PER_EXT_ORG_LOC_REGION2[i]
            EXIT
        )

        i = i + 1
    )
)

/* ----- Eligibility Decision Chain ----- */

/* Tier 0: Bad data — critical DBIs returned null */
IF (PER_ASG_WORK_AT_HOME WAS DEFAULTED OR
    PER_ASG_LOC_REGION2 WAS DEFAULTED) THEN
(eligible = 'N')

ELSE

/* Tier 1: Remote worker — check assignment work state */
IF (PER_ASG_WORK_AT_HOME = 'Y' AND
   (PER_ASG_LOC_REGION2 != 'PR' AND
    PER_ASG_LOC_REGION2 != 'DC'))
THEN (eligible = 'Y')

ELSE

/* Tier 2: Office worker — check department org location */
IF (PER_ASG_WORK_AT_HOME = 'N' AND
   (l_loc != 'PR' AND l_loc != 'DC') AND
    l_loc != 'NO_REGION')
THEN (eligible = 'Y')

ELSE

/* Tier 3: Fallback — no dept state, use assignment location */
IF (PER_ASG_WORK_AT_HOME = 'N' AND l_loc = 'NO_REGION' AND
   (PER_ASG_LOC_REGION2 != 'PR' AND
    PER_ASG_LOC_REGION2 != 'DC'))
THEN (eligible = 'Y')

ELSE eligible = 'N'

/* ----- Debug Logging ----- */
l = ess_log_write('Work at Home : ' || (PER_ASG_WORK_AT_HOME))
l = ess_log_write('Work State : ' || (PER_ASG_LOC_REGION2))
l = ess_log_write('Department State : ' || (l_loc))
l = ess_log_write('Eligible : ' || (eligible))

RETURN eligible</pre>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== BLOCK 1: DEFAULTS ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Block 1: DEFAULT Declarations</div>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">DEFAULT for PER_ASG_WORK_AT_HOME is 'NO_DATA'
DEFAULT for PER_ASG_LOC_REGION2 is 'NO_DATA'

DEFAULT_DATA_VALUE for PER_EXT_ORG_LOC_REGION2 is 'NO_REGION'
DEFAULT_DATA_VALUE for PER_EXT_ORG_ORGANIZATION_ID is 0
DEFAULT FOR PER_ASG_DEPARTMENT_ID IS 0</pre>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Two kinds of defaults here, and they do different things:</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">Keyword</th>
<th style="padding:10px 14px;text-align:left;">Used For</th>
<th style="padding:10px 14px;text-align:left;">When It Kicks In</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-weight:600;">DEFAULT for</td>
<td style="padding:10px 14px;">Standard (single-value) DBIs</td>
<td style="padding:10px 14px;">DBI returns no data — e.g., worker has no location assigned</td>
</tr>
<tr style="background:#fff;">
<td style="padding:10px 14px;font-family:monospace;font-weight:600;">DEFAULT_DATA_VALUE for</td>
<td style="padding:10px 14px;">Array DBIs (extract org / multi-row)</td>
<td style="padding:10px 14px;">A specific array index has a null/empty value for that column</td>
</tr>
</tbody></table>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">Why <code>'NO_DATA'</code> and <code>'NO_REGION'</code>? Self-Documenting Defaults</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Every default value in this formula is <strong>self-documenting</strong>. When you read the ESS process log, the values tell you exactly what happened:</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">Default Value</th>
<th style="padding:10px 14px;text-align:left;">Used By</th>
<th style="padding:10px 14px;text-align:left;">What It Means in the ESS Log</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-weight:600;">'NO_DATA'</td>
<td style="padding:10px 14px;">PER_ASG_WORK_AT_HOME, PER_ASG_LOC_REGION2</td>
<td style="padding:10px 14px;">DBI returned null — worker has no value for this field in the database</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-weight:600;">'NO_REGION'</td>
<td style="padding:10px 14px;">PER_EXT_ORG_LOC_REGION2, l_loc (init value)</td>
<td style="padding:10px 14px;">Department's org either wasn't found in the array, or the org row has no region configured</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">When you read the ESS log, <code>Work State : NO_DATA</code> and <code>Department State : NO_REGION</code> immediately tell the consultant what happened without having to read the formula code.</p>

<div style="background:#fff3cd;border-left:4px solid #f0ad4e;padding:14px 18px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0;font-size:14px;color:#856404;"><strong>Why <code>l_loc</code> is initialized to <code>'NO_REGION'</code> (same as the DEFAULT_DATA_VALUE):</strong> If the loop doesn't find a matching org, <code>l_loc</code> stays as <code>'NO_REGION'</code>. Tier 2 checks <code>l_loc != 'NO_REGION'</code> — false, so it falls to Tier 3. If <code>l_loc</code> were initialized to a different value, a no-match scenario would accidentally pass Tier 2's check and the worker would be eligible based on a meaningless init value.</p>
</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== BLOCK 2: TIER 0 — WAS DEFAULTED ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Block 2: Tier 0 — WAS DEFAULTED (Null Check)</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The first IF in the eligibility chain isn't about PR or DC — it's about <strong>missing data</strong>:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">/* Tier 0: Bad data — critical DBIs returned null */
IF (PER_ASG_WORK_AT_HOME WAS DEFAULTED OR
    PER_ASG_LOC_REGION2 WAS DEFAULTED) THEN
(eligible = 'N')

ELSE

/* Tier 1: Remote worker — check assignment work state */
IF (PER_ASG_WORK_AT_HOME = 'Y' AND ...
...</pre>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">If you've read the <a href="#">"There Is No NULL in Fast Formula"</a> post, you know the background: <strong>Fast Formula has no NULL. No <code>IS NULL</code>. No <code>= NULL</code>.</strong> When a DBI returns null from the database, the engine silently replaces it with the DEFAULT value and sets an internal flag. <code>WAS DEFAULTED</code> checks that flag.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">By making it the <strong>first IF</strong> in the chain, Tier 0 catches null data before Tiers 1–3 ever run. If it fires, <code>eligible = 'N'</code> and the remaining ELSE blocks are skipped naturally. No early RETURN. No extra flags. Just part of the same IF/ELSE chain.</p>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">Why Tier 0 Matters</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Without it, here's what happens when a worker has <strong>no location assigned</strong> (null in the database):</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">Step</th>
<th style="padding:10px 14px;text-align:left;">Without Tier 0</th>
<th style="padding:10px 14px;text-align:left;">With Tier 0</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:600;">Database value</td>
<td style="padding:10px 14px;">Location = NULL</td>
<td style="padding:10px 14px;">Location = NULL</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:600;">Formula sees</td>
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">PER_ASG_LOC_REGION2 = 'NO_DATA'</td>
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">PER_ASG_LOC_REGION2 = 'NO_DATA'</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:600;">What happens</td>
<td style="padding:10px 14px;color:#c0392b;"><strong>'NO_DATA' != 'PR' is true</strong> → worker passes eligibility with a default value</td>
<td style="padding:10px 14px;color:#27ae60;"><strong>WAS DEFAULTED = true</strong> → Tier 0 fires, <code>eligible = 'N'</code>, remaining tiers skipped</td>
</tr>
<tr style="background:#fff;">
<td style="padding:10px 14px;font-weight:600;">Result</td>
<td style="padding:10px 14px;font-weight:700;color:#c0392b;">BUG — worker with no location passes</td>
<td style="padding:10px 14px;font-weight:700;color:#27ae60;">CORRECT — worker with no data excluded</td>
</tr>
</tbody></table>

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">The Pattern: DEFAULT + WAS DEFAULTED = Fast Formula's IS NULL</div>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">SQL / PL/SQL</th>
<th style="padding:10px 14px;text-align:left;">Fast Formula</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#c0392b;">IF x IS NULL</td>
<td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#27ae60;">IF x WAS DEFAULTED</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#c0392b;">IF x IS NOT NULL</td>
<td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#27ae60;">IF NOT x WAS DEFAULTED</td>
</tr>
<tr style="background:#f8f9fa;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#c0392b;">NVL(x, 'default')</td>
<td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#27ae60;">DEFAULT FOR x IS 'default'</td>
</tr>
</tbody></table>

<div style="background:#f8d7da;border-left:4px solid #dc3545;padding:14px 18px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0 0 10px;font-size:14px;color:#721c24;"><strong>Common mistake:</strong> Checking the value instead of WAS DEFAULTED.</p>
<p style="margin:0;font-size:14px;color:#721c24;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">IF PER_ASG_LOC_REGION2 = 'NO_DATA' THEN</code> — this compares against the default value. <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">WAS DEFAULTED</code> checks the engine's internal flag — it knows whether the database had null, regardless of the default value. Always use WAS DEFAULTED.</p>
</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== BLOCK 3: THE ARRAY LOOP ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Block 3: GET_CONTEXT + CHANGE_CONTEXTS + The Array Loop</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">This is the most complex block in the formula. Before looking at the code, let's understand the <strong>problem it's solving</strong>.</p>

<!-- WHY NOT JUST USE PER_ASG_LOC_REGION2? -->

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">Why Not Just Use PER_ASG_LOC_REGION2 for Everyone?</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Because <strong>the worker's assignment location and their department's location can be different states.</strong> In Oracle HCM, two separate location fields exist:</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;width:35%;">Field</th>
<th style="padding:10px 14px;text-align:left;">Where It Lives</th>
<th style="padding:10px 14px;text-align:left;">What It Answers</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:600;">Assignment Location</td>
<td style="padding:10px 14px;">Worker's <strong>assignment record</strong></td>
<td style="padding:10px 14px;">"Where does this worker physically sit?"</td>
</tr>
<tr style="background:#fff;">
<td style="padding:10px 14px;font-weight:600;">Organization Location</td>
<td style="padding:10px 14px;"><strong>Department's org record</strong> (Manage Organizations)</td>
<td style="padding:10px 14px;">"Where is this department headquartered?"</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">A worker could sit in NY Office (<code>PER_ASG_LOC_REGION2</code> = NY) but belong to a department headquartered in Puerto Rico (<code>PER_EXT_ORG_LOC_REGION2[i]</code> = PR). Two different location fields. Two different states. Same worker.</p>

<div style="background:#fff3cd;border-left:4px solid #f0ad4e;padding:14px 18px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0;font-size:14px;color:#856404;"><strong>Why can't we just use a single DBI for the department's state?</strong> Because Oracle doesn't provide one out of the box. There's no <code>PER_ASG_DEPARTMENT_LOC_REGION2</code>. The department's location data lives at the organization level — the only way to access it from a formula is through the <code>PER_EXT_ORG_*</code> array DBIs. That means looping through all orgs and matching by ORGANIZATION_ID.</p>
</div>

<!-- HOW THE LOOKUP WORKS -->

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">How the Lookup Works</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;"><code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_EXT_ORG_LOC_REGION2</code> returns the location state for <strong>every organization</strong> in the system that has a location configured. Your company might have 50 departments — the DBI dumps all of them into one array. We loop through it, find the row where the org ID matches the worker's department ID, and grab the state. It's doing a SQL JOIN manually — Fast Formula can't write SQL.</p>

<!-- WHAT THE ARRAY LOOKS LIKE -->

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">What the Array Looks Like</div>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:center;width:80px;">Row</th>
<th style="padding:10px 14px;text-align:left;">PER_EXT_ORG_ORGANIZATION_ID</th>
<th style="padding:10px 14px;text-align:left;">PER_EXT_ORG_LOC_REGION2</th>
<th style="padding:10px 14px;text-align:left;color:#aaa;">Description</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;text-align:center;font-weight:700;">1</td>
<td style="padding:10px 14px;font-family:monospace;">3100</td>
<td style="padding:10px 14px;font-family:monospace;">'NY'</td>
<td style="padding:10px 14px;color:#888;">Sales Dept — New York</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;text-align:center;font-weight:700;">2</td>
<td style="padding:10px 14px;font-family:monospace;">2200</td>
<td style="padding:10px 14px;font-family:monospace;">'PR'</td>
<td style="padding:10px 14px;color:#888;">HR Dept — Puerto Rico</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;text-align:center;font-weight:700;">3</td>
<td style="padding:10px 14px;font-family:monospace;">4400</td>
<td style="padding:10px 14px;font-family:monospace;">'TX'</td>
<td style="padding:10px 14px;color:#888;">Engineering Dept — Texas</td>
</tr>
<tr style="background:#fff;">
<td style="padding:10px 14px;text-align:center;font-weight:700;">4</td>
<td style="padding:10px 14px;font-family:monospace;">5500</td>
<td style="padding:10px 14px;font-family:monospace;">'DC'</td>
<td style="padding:10px 14px;color:#888;">Finance Dept — Washington DC</td>
</tr>
</tbody></table>

<!-- WHAT THE MATCHING CODE DOES -->

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">What the Matching Code Is Really Doing</div>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">IF PER_EXT_ORG_ORGANIZATION_ID[i] = PER_ASG_DEPARTMENT_ID THEN
(
    l_loc = PER_EXT_ORG_LOC_REGION2[i]
    EXIT
)</pre>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">Line</th>
<th style="padding:10px 14px;text-align:left;">What it's really asking</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">ORGANIZATION_ID[i] = DEPARTMENT_ID</td>
<td style="padding:10px 14px;">"Is the org at row [i] <strong>the same org</strong> as the department on this worker's assignment?"</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">l_loc = LOC_REGION2[i]</td>
<td style="padding:10px 14px;">"Yes — so the location state on that org's record <strong>is this worker's department state</strong>. Grab it."</td>
</tr>
<tr style="background:#f8f9fa;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">EXIT</td>
<td style="padding:10px 14px;">"Found what we needed. Stop looking."</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The <code>IF</code> line connects the worker's world (assignment → department ID) to the organization's world (org record → location → state). The <code>l_loc</code> line crosses that bridge and pulls the value.</p>

<!-- THE FULL CODE BLOCK -->

<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin:28px 0 14px;">The Code</div>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">l_eff_date = get_context(EFFECTIVE_DATE, '1900/01/01 00:00:00'(date))

CHANGE_CONTEXTS (EFFECTIVE_DATE = l_eff_date)
(
    WHILE PER_EXT_ORG_LOC_REGION2.exists(i)  LOOP
    (
        IF PER_EXT_ORG_ORGANIZATION_ID[i] = PER_ASG_DEPARTMENT_ID THEN
        (
            l_loc = PER_EXT_ORG_LOC_REGION2[i]
            EXIT
        )

        i = i + 1
    )
)</pre>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;width:40%;">Line</th>
<th style="padding:10px 14px;text-align:left;">What it does</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">get_context(EFFECTIVE_DATE, ...)</td>
<td style="padding:10px 14px;">Reads EFFECTIVE_DATE from the engine's runtime into a local variable.</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">CHANGE_CONTEXTS (...)</td>
<td style="padding:10px 14px;">Binds EFFECTIVE_DATE for the extract org DBIs inside the block. Standard DBIs pick up contexts automatically; extract org DBIs do not.</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">.exists(i)</td>
<td style="padding:10px 14px;"><strong>"Does row i exist?"</strong> Returns false past the last row — loop stops.</td>
</tr>
<tr style="background:#fff;">
<td style="padding:10px 14px;font-family:monospace;font-size:12px;">i = i + 1</td>
<td style="padding:10px 14px;">Move to next row. When <code>.exists(5)</code> is false after row 4, loop ends naturally.</td>
</tr>
</tbody></table>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== WHY CHANGE_CONTEXTS ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Why CHANGE_CONTEXTS? What Oracle's Docs Say</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">We're reading EFFECTIVE_DATE with <code>get_context()</code> and setting it back to the same value with <code>CHANGE_CONTEXTS</code>. Seems redundant — and Oracle's docs warn against exactly this in certain cases.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The <strong>Administering Fast Formulas guide (24D)</strong> says:</p>

<p style="font-size:16px;margin-bottom:10px;color:#2a2a2a;"><strong>Guidance 1:</strong> <em>"The best practice approach is to use CHANGE_CONTEXTS statement only when required, because CHANGE_CONTEXTS can cause database item values to be fetched again from the database."</em></p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;"><strong>Guidance 2:</strong> <em>"Don't use the CHANGE_CONTEXTS statement to set contexts that you would reasonably expect to be already set."</em></p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Our formula looks like the anti-pattern. But it's not — because our DBI sits on a <strong>different route</strong>.</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;width:80px;">Case</th>
<th style="padding:10px 14px;text-align:left;">What You're Doing</th>
<th style="padding:10px 14px;text-align:left;">Oracle Says</th>
</tr></thead>
<tbody>
<tr style="background:#fdf2f2;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:700;color:#c0392b;">Case 1</td>
<td style="padding:10px 14px;">Setting contexts <strong>already bound</strong> to standard routes</td>
<td style="padding:10px 14px;color:#c0392b;font-weight:600;">DON'T. Redundant.</td>
</tr>
<tr style="background:#d4edda;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:700;color:#27ae60;">Case 2</td>
<td style="padding:10px 14px;">DBI on a <strong>different route</strong> that doesn't auto-bind ← <strong>Our formula</strong></td>
<td style="padding:10px 14px;color:#27ae60;font-weight:600;">DO. Required.</td>
</tr>
<tr style="background:#f8f9fa;">
<td style="padding:10px 14px;font-weight:700;color:#2980b9;">Case 3</td>
<td style="padding:10px 14px;">Override context to a <strong>different value</strong> (time-travel)</td>
<td style="padding:10px 14px;color:#2980b9;font-weight:600;">DO.</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">From the <a href="https://www.scribd.com/document/511029660/HCM-Extract-DBI-List-REL11-updated" target="_blank"><u>REL11 data</u> ↗</a>: <code>PER_ASG_WORK_AT_HOME</code> uses route <code>PER_ASG_ASSIGNMENT_DETAILS</code> (auto-bound). <code>PER_EXT_ORG_LOC_REGION2</code> uses route <code>PER_EXT_SEC_ORGANIZATION</code> (NOT auto-bound). Same syntax as the anti-pattern, but different route, different reason.</p>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Oracle's own <a href="https://docs.oracle.com/en/cloud/saas/human-resources/oapff/participation-and-rate-eligibility.html" target="_blank"><u>Sample Formula 3</u> ↗</a> on the Participation and Rate Eligibility docs page uses this exact pattern: <code>GET_CONTEXT</code> → <code>CHANGE_CONTEXTS</code> → <code>.exists(i)</code> loop → <code>RETURN ELIGIBLE</code>.</p>

<div style="background:#f8d7da;border-left:4px solid #dc3545;padding:14px 18px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0;font-size:14px;color:#721c24;"><strong>What happens if you skip CHANGE_CONTEXTS?</strong> The formula compiles. Runs without error. <code>.exists(i)</code> returns false immediately (empty array), the loop never executes, <code>l_loc</code> stays as <code>'NO_REGION'</code>, and the formula falls to Tier 3. No crash — just silently wrong results. If ESS log shows <code>Department State : NO_REGION</code> for a worker whose department <em>does</em> have a location, this is the first thing to check.</p>
</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== TRACING THE LOOP ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Tracing the Loop Step by Step</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Worker is in Department <strong>4400</strong> (Engineering). <code>PER_ASG_DEPARTMENT_ID</code> = 4400. <code>i</code> starts at 1.</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<tbody>
<tr style="border-bottom:2px solid #dee2e6;">
<td style="padding:14px 16px;background:#fff;">
<div style="font-weight:700;color:#2c3e50;margin-bottom:8px;">ITERATION 1 — i = 1</div>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px;">
<tr><td style="padding:4px 0;width:220px;">Read <code>ORGANIZATION_ID[1]</code></td><td style="padding:4px 0;">→ <strong>3100</strong> (Sales)</td></tr>
<tr><td style="padding:4px 0;">3100 = 4400?</td><td style="padding:4px 0;">→ <strong>NO</strong> → <code>i = 2</code></td></tr>
</table>
</td>
</tr>
<tr style="border-bottom:2px solid #dee2e6;">
<td style="padding:14px 16px;background:#f8f9fa;">
<div style="font-weight:700;color:#2c3e50;margin-bottom:8px;">ITERATION 2 — i = 2</div>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px;">
<tr><td style="padding:4px 0;width:220px;">Read <code>ORGANIZATION_ID[2]</code></td><td style="padding:4px 0;">→ <strong>2200</strong> (HR)</td></tr>
<tr><td style="padding:4px 0;">2200 = 4400?</td><td style="padding:4px 0;">→ <strong>NO</strong> → <code>i = 3</code></td></tr>
</table>
</td>
</tr>
<tr style="border-bottom:2px solid #dee2e6;">
<td style="padding:14px 16px;background:#d4edda;">
<div style="font-weight:700;color:#155724;margin-bottom:8px;">ITERATION 3 — i = 3 ✔ MATCH</div>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px;">
<tr><td style="padding:4px 0;width:220px;">Read <code>ORGANIZATION_ID[3]</code></td><td style="padding:4px 0;">→ <strong>4400</strong> (Engineering)</td></tr>
<tr><td style="padding:4px 0;">4400 = 4400?</td><td style="padding:4px 0;">→ <strong>YES!</strong></td></tr>
<tr><td style="padding:4px 0;">Read <code>LOC_REGION2[3]</code></td><td style="padding:4px 0;">→ <strong>'TX'</strong></td></tr>
<tr><td style="padding:4px 0;">Action:</td><td style="padding:4px 0;"><code>l_loc = 'TX'</code> then <code>EXIT</code></td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:14px 16px;background:#f0f0f0;color:#999;">
<div style="font-weight:700;margin-bottom:8px;">ROW 4 — never reached</div>
EXIT already fired. Formula continues with <code>l_loc = 'TX'</code>. TX is not PR or DC → eligible.
</td>
</tr>
</tbody></table>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== BLOCK 4: ELIGIBILITY CHAIN ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Block 4: The Eligibility Decision Chain (Tiers 0–3)</div>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">/* Tier 0: Bad data — critical DBIs returned null */
IF (PER_ASG_WORK_AT_HOME WAS DEFAULTED OR
    PER_ASG_LOC_REGION2 WAS DEFAULTED) THEN
(eligible = 'N')

ELSE

/* Tier 1: Remote worker — check assignment work state */
IF (PER_ASG_WORK_AT_HOME = 'Y' AND
   (PER_ASG_LOC_REGION2 != 'PR' AND
    PER_ASG_LOC_REGION2 != 'DC'))
THEN (eligible = 'Y')

ELSE

/* Tier 2: Office worker — check department org location */
IF (PER_ASG_WORK_AT_HOME = 'N' AND
   (l_loc != 'PR' AND l_loc != 'DC') AND
    l_loc != 'NO_REGION')
THEN (eligible = 'Y')

ELSE

/* Tier 3: Fallback — no dept state, use assignment location */
IF (PER_ASG_WORK_AT_HOME = 'N' AND l_loc = 'NO_REGION' AND
   (PER_ASG_LOC_REGION2 != 'PR' AND
    PER_ASG_LOC_REGION2 != 'DC'))
THEN (eligible = 'Y')

ELSE eligible = 'N'</pre>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:10px 14px;text-align:left;">Tier</th>
<th style="padding:10px 14px;text-align:left;">What it checks</th>
<th style="padding:10px 14px;text-align:left;">Why this tier exists</th>
</tr></thead>
<tbody>
<tr style="background:#fdf2f2;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:700;color:#c0392b;">Tier 0</td>
<td style="padding:10px 14px;">WAS DEFAULTED — Work at Home or Work State is null</td>
<td style="padding:10px 14px;">Catches missing data before it infects the decision chain</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:700;">Tier 1</td>
<td style="padding:10px 14px;">Work at Home = Y AND work state not PR/DC</td>
<td style="padding:10px 14px;">Remote workers — check assignment work location state</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:700;">Tier 2</td>
<td style="padding:10px 14px;"><code>l_loc</code> not PR/DC AND <code>l_loc != 'NO_REGION'</code></td>
<td style="padding:10px 14px;">Office workers — department has a location state configured</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:10px 14px;font-weight:700;">Tier 3</td>
<td style="padding:10px 14px;"><code>l_loc = 'NO_REGION'</code> AND assignment loc not PR/DC</td>
<td style="padding:10px 14px;">Fallback — no department state found</td>
</tr>
<tr style="background:#fff;">
<td style="padding:10px 14px;font-weight:700;">ELSE</td>
<td style="padding:10px 14px;">None of the above</td>
<td style="padding:10px 14px;">Worker is in PR or DC — excluded</td>
</tr>
</tbody></table>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== BLOCK 5: DEBUG LOGGING ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Block 5: Debug Logging</div>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">l = ess_log_write('Work at Home : ' || (PER_ASG_WORK_AT_HOME))
l = ess_log_write('Work State : ' || (PER_ASG_LOC_REGION2))
l = ess_log_write('Department State : ' || (l_loc))
l = ess_log_write('Eligible : ' || (eligible))</pre>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Four log lines. The self-documenting defaults make the ESS output immediately readable:</p>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:8px 12px;text-align:left;">Log Line</th>
<th style="padding:8px 12px;text-align:center;">Worker A<br><span style="font-size:10px;font-weight:400;">(Remote in TX)</span></th>
<th style="padding:8px 12px;text-align:center;">Worker B<br><span style="font-size:10px;font-weight:400;">(Office, PR dept)</span></th>
<th style="padding:8px 12px;text-align:center;">Worker C<br><span style="font-size:10px;font-weight:400;">(No dept state)</span></th>
<th style="padding:8px 12px;text-align:center;">Worker D<br><span style="font-size:10px;font-weight:400;">(No location)</span></th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;">Work at Home</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">Y</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">N</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">N</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;color:#c0392b;font-weight:700;">NO_DATA</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;">Work State</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">TX</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">NY</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">FL</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;color:#c0392b;font-weight:700;">NO_DATA</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;">Department State</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">NO_REGION</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;">PR</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">NO_REGION</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;">NO_REGION</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 12px;font-weight:700;">Eligible</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;color:#27ae60;">Y</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;color:#c0392b;">N</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;color:#27ae60;">Y</td>
<td style="padding:8px 12px;text-align:center;font-family:monospace;font-weight:700;color:#c0392b;">N</td>
</tr>
<tr style="background:#e8e8e8;">
<td style="padding:8px 12px;font-weight:600;">Tier that fired</td>
<td style="padding:8px 12px;text-align:center;">Tier 1</td>
<td style="padding:8px 12px;text-align:center;">Tier 2</td>
<td style="padding:8px 12px;text-align:center;">Tier 3</td>
<td style="padding:8px 12px;text-align:center;color:#c0392b;font-weight:700;">Tier 0</td>
</tr>
</tbody></table>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;"><strong>Worker D</strong> is the new one — no location assigned at all. Without Tier 0, they'd pass eligibility on a fake default value. With Tier 0, <code>WAS DEFAULTED</code> catches it immediately. And the ESS log shows <code>NO_DATA</code> — the consultant knows exactly what happened without reading the formula.</p>

<div style="background:#d4edda;border-left:4px solid #28a745;padding:14px 18px;margin:18px 0;border-radius:0 6px 6px 0;">
<p style="margin:0;font-size:14px;color:#155724;"><strong>Debugging tip:</strong> If Department State shows <code>'NO_REGION'</code> for a worker who should be using Tier 2, either (a) CHANGE_CONTEXTS didn't resolve the ext org array — check your CHANGE_CONTEXTS block, or (b) the loop ran but no org matched — check the department's location setup in Manage Organizations.</p>
</div>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== DBI REFERENCE ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">DBI Reference — All 5 DBIs from the <a href="https://www.scribd.com/document/511029660/HCM-Extract-DBI-List-REL11-updated" target="_blank"><u>REL11 Export</u> ↗</a></div>

<table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:12px;">
<thead><tr style="background:#2c3e50;color:#fff;">
<th style="padding:8px 10px;text-align:left;">DBI</th>
<th style="padding:8px 10px;text-align:left;">Description</th>
<th style="padding:8px 10px;text-align:left;">SQL Column</th>
<th style="padding:8px 10px;text-align:left;">Contexts Used</th>
<th style="padding:8px 10px;text-align:center;">Multi-Row</th>
</tr></thead>
<tbody>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 10px;font-family:monospace;font-size:11px;">PER_ASG_WORK_AT_HOME</td>
<td style="padding:8px 10px;">Work at Home flag</td>
<td style="padding:8px 10px;font-family:monospace;font-size:11px;">paf_asg.work_at_home</td>
<td style="padding:8px 10px;font-size:11px;">EFFECTIVE_DATE, HR_ASSIGNMENT_ID</td>
<td style="padding:8px 10px;text-align:center;">N</td>
</tr>
<tr style="background:#fff;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 10px;font-family:monospace;font-size:11px;">PER_ASG_LOC_REGION2</td>
<td style="padding:8px 10px;">Assignment Location State</td>
<td style="padding:8px 10px;font-family:monospace;font-size:11px;">hrloc.region_2</td>
<td style="padding:8px 10px;font-size:11px;">EFFECTIVE_DATE, HR_ASSIGNMENT_ID</td>
<td style="padding:8px 10px;text-align:center;">N</td>
</tr>
<tr style="background:#f8f9fa;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 10px;font-family:monospace;font-size:11px;">PER_ASG_DEPARTMENT_ID</td>
<td style="padding:8px 10px;">Department Org ID</td>
<td style="padding:8px 10px;font-family:monospace;font-size:11px;">paf_asg.ORGANIZATION_ID</td>
<td style="padding:8px 10px;font-size:11px;">EFFECTIVE_DATE, HR_ASSIGNMENT_ID</td>
<td style="padding:8px 10px;text-align:center;">N</td>
</tr>
<tr style="background:#fdf2f2;border-bottom:1px solid #dee2e6;">
<td style="padding:8px 10px;font-family:monospace;font-size:11px;color:#c0392b;font-weight:600;">PER_EXT_ORG_ORGANIZATION_ID</td>
<td style="padding:8px 10px;">Extract Org ID (per row)</td>
<td style="padding:8px 10px;font-family:monospace;font-size:11px;">org.ORGANIZATION_ID</td>
<td style="padding:8px 10px;font-size:11px;color:#c0392b;">EFFECTIVE_DATE</td>
<td style="padding:8px 10px;text-align:center;color:#c0392b;font-weight:700;">Y</td>
</tr>
<tr style="background:#fdf2f2;">
<td style="padding:8px 10px;font-family:monospace;font-size:11px;color:#c0392b;font-weight:600;">PER_EXT_ORG_LOC_REGION2</td>
<td style="padding:8px 10px;">Extract Org Location Region2</td>
<td style="padding:8px 10px;font-family:monospace;font-size:11px;">hla.REGION_2</td>
<td style="padding:8px 10px;font-size:11px;color:#c0392b;">EFFECTIVE_DATE</td>
<td style="padding:8px 10px;text-align:center;color:#c0392b;font-weight:700;">Y</td>
</tr>
</tbody></table>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== DBI X-RAY QUERY ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Bonus: The DBI X-Ray Query</div>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">The <a href="https://www.scribd.com/document/511029660/HCM-Extract-DBI-List-REL11-updated" target="_blank"><u>REL11 export</u> ↗</a> gives you metadata in a spreadsheet. But if you want the <strong>actual SQL</strong> Oracle runs — run this in BI Publisher:</p>

<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">SELECT d.base_user_name         DBI_NAME
,      d.data_type               DBI_DATA_TYPE
,      d.definition_text         SELECT_CLAUSE
,      r.text                    WHERE_CLAUSE
,      (SELECT LISTAGG(
         '<' || rcu.sequence_no || ','
         || c.base_context_name || '>', ', ')
         WITHIN GROUP (ORDER BY rcu.sequence_no)
       FROM   ff_route_context_usages rcu
       ,      ff_contexts_b c
       WHERE  rcu.route_id = r.route_id
       AND    rcu.context_id = c.context_id
       )                         ROUTE_CONTEXT_USAGES
FROM   ff_database_items_b d
,      ff_user_entities_b u
,      ff_routes_b r
WHERE  d.base_user_name = 'PER_EXT_ORG_LOC_REGION2'
AND    d.user_entity_id = u.user_entity_id
AND    r.route_id = u.route_id</pre>

<p style="font-size:16px;margin-bottom:14px;color:#2a2a2a;">Replace the DBI name to see any DBI's internals. Check three things before writing formula code: (1) do the arrays share a route? (2) do you need CHANGE_CONTEXTS? (3) single value or array?</p>

<hr style="border:none;border-top:2px solid #eee;margin:35px 0;">

<!-- ==================== KEY TAKEAWAYS ==================== -->

<div style="font-size:22px;font-weight:700;color:#1a1a1a;margin:30px 0 16px;">Key Takeaways</div>

<p style="font-size:16px;margin-bottom:12px;color:#2a2a2a;"><strong>Guard with WAS DEFAULTED (Tier 0) before the main logic</strong> — if a critical DBI returns null, the engine substitutes the default and the IF chain can produce wrong results. <code>WAS DEFAULTED</code> catches nulls. There is no <code>IS NULL</code> in Fast Formula — <code>DEFAULT</code> + <code>WAS DEFAULTED</code> is the null-handling system.</p>

<p style="font-size:16px;margin-bottom:12px;color:#2a2a2a;"><strong>CHANGE_CONTEXTS is mandatory for extract org DBIs</strong> — even when setting the context to the same value. Without it, the ext org route has no bound EFFECTIVE_DATE and silently returns nothing.</p>

<p style="font-size:16px;margin-bottom:12px;color:#2a2a2a;"><strong>Use self-documenting default values</strong> — <code>'NO_DATA'</code> and <code>'NO_REGION'</code> make the ESS log immediately readable. Initialize <code>l_loc</code> to the same value as DEFAULT_DATA_VALUE so "loop didn't match" and "matched but null" both fall correctly to Tier 3.</p>

<p style="font-size:16px;margin-bottom:12px;color:#2a2a2a;"><strong>Assignment location ≠ department location</strong> — <code>PER_ASG_LOC_REGION2</code> is where the worker sits. <code>PER_EXT_ORG_LOC_REGION2[i]</code> is where the department is headquartered. The array loop bridges the two using ORGANIZATION_ID as the join key.</p>

<p style="font-size:16px;margin-bottom:12px;color:#2a2a2a;"><strong>Always verify DBIs against the <a href="https://www.scribd.com/document/511029660/HCM-Extract-DBI-List-REL11-updated" target="_blank"><u>REL11 export</u> ↗</a></strong> — check CONTEXTS_USED, MULTI_ROW_FLAG, and route name. Use the DBI X-Ray query to see the actual SQL.</p>

<p style="font-size:16px;margin:30px 0 18px;color:#2a2a2a;">This Participation and Rate Eligibility formula ties together most of what we've covered in the previous posts: contexts, DBIs, routes, array looping, CHANGE_CONTEXTS, WAS DEFAULTED null-handling, and debug logging.</p>

<p style="font-size:16px;margin-bottom:18px;color:#2a2a2a;">If you're on the functional team and you understood this formula — the WAS DEFAULTED guard for null data, the three-tier fallback chain, how CHANGE_CONTEXTS binds to a non-standard route, how the array loop matches org IDs, and why the sentinel default drives the decision logic — you can write any Participation and Rate Eligibility formula. The business rules will change, the excluded states will change, the DBIs might change. But the pattern is always the same: resolve the data, check the condition, return <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ELIGIBLE</code>. Everything else is just variations of what you've already seen here. Fast Formula isn't just for technical consultants — if a functional consultant understands the logic flow, they can build these formulas too.</p>

<p style="font-size:16px;margin-bottom:30px;color:#2a2a2a;">Hope this helps someone.</p>

<!-- ==================== AUTHOR FOOTER ==================== -->

<div style="display:flex;align-items:center;gap:14px;padding:20px 0;border-top:2px solid #1a1a1a;">
<div style="width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#c0392b,#e67e22);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:18px;flex-shrink:0;">AM</div>
<div>
<div style="font-weight:700;font-size:15px;">Abhishek Mohanty</div>
<div style="font-size:13px;color:#888;line-height:1.5;">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Time & Labor, Core HR, Redwood, HDL, OTBI.</div>
</div>
</div>

</div>