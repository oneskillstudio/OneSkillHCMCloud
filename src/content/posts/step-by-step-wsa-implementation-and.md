---
title: "Step-by-step WSA implementation and complete code of Oracle HCM Cloud HDL Transformation Fast Formula — WSA_EXISTS, WSA_GET, WSA_SET for Person caching and MultipleEntryCount tracking, full formula with INPUTS ARE, OPERATION routing, METADATA, GET_VALUE_SET, SourceSystemId, LINEREPEATNO, and ElementEntry .dat output. Part 3 of 3."
pubDate: 2026-03-27
description: "Step-by-step WSA implementation and complete code of Oracle HCM Cloud HDL Transformation Fast Formula — WSA_EXISTS, WSA_GET, WSA_SET for Person caching..."
tags: ["Fast Formula", "HDL", "Oracle HCM Cloud"]
author: "Abhishek Mohanty"
draft: false
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Complete Oracle HCM Cloud HDL Transformation Fast Formula with WSA_EXISTS, WSA_GET, WSA_SET caching for Person lookup and MultipleEntryCount. Full formula code ready to use. Part 3 of 3.">
<meta name="keywords" content="Oracle HCM Cloud, Fast Formula, HDL, HCM Data Loader, Transformation Formula, WSA, WSA_EXISTS, WSA_GET, WSA_SET, Working Storage Area, MultipleEntryCount, GET_VALUE_SET, ElementEntry, ElementEntryValue, LINEREPEATNO, SourceSystemId, Complete Formula">
<meta property="og:title" content="Oracle HCM Cloud HDL Transformation Fast Formula — WSA Implementation and Complete Formula Code (Part 3 of 3)">
<meta property="og:description" content="WSA caching code (WSA_EXISTS, WSA_GET, WSA_SET) integrated into a complete HDL Transformation Formula. Full code ready to adapt.">
<meta property="og:type" content="article">
<meta name="author" content="Abhishek Mohanty">
<title>Oracle HCM Cloud HDL Transformation Fast Formula — WSA Implementation and Complete Formula Code (Part 3 of 3)</title>
<style>
:root { --accent: #D4622B; --dark: #1A1A2E; --text: #3D3D5C; --muted: #8B8FA8; --bg-subtle: #F8F7F4; --border: #E8E4DE; --green: #2D8B6F; --red: #B8423A; --blue: #4A6FA5; --code-bg: #1B1D2E; }
.diag { background: var(--bg-subtle); border-radius: 14px; padding: 28px 24px; margin: 24px 0; position: relative; }
.diag-title { font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); margin-bottom: 18px; }
.timeline { position: relative; padding-left: 36px; }
.timeline::before { content: ''; position: absolute; left: 13px; top: 8px; bottom: 8px; width: 2px; background: linear-gradient(to bottom, var(--accent), var(--border)); border-radius: 1px; }
.tl-step { position: relative; margin-bottom: 18px; }
.tl-step:last-child { margin-bottom: 0; }
.tl-dot { position: absolute; left: -29px; top: 4px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--accent); background: var(--bg-subtle); }
.tl-dot.active { background: var(--accent); }
.tl-label { font-size: 13px; font-weight: 700; color: var(--dark); margin-bottom: 2px; }
.tl-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }
.tl-result { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 500; background: rgba(212,98,43,0.08); color: var(--accent); padding: 2px 8px; border-radius: 4px; margin-top: 4px; }
.decision-pair { display: flex; gap: 16px; flex-wrap: wrap; }
.decision-card { flex: 1; min-width: 220px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.decision-card-head { padding: 10px 16px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
.decision-card-body { background: #fff; padding: 16px; font-size: 13px; line-height: 1.7; }
.code-pro { border-radius: 10px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin: 20px 0; }
.code-pro-header { background: #151726; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); }
.code-pro-header .dots { display: flex; gap: 6px; }
.code-pro-header .dots span { width: 10px; height: 10px; border-radius: 50%; }
.code-pro-header .label { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6B6F88; letter-spacing: 0.3px; }
.code-pro pre { background: var(--code-bg); color: #C8C9D4; padding: 20px 24px; font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 13.5px; line-height: 1.85; overflow-x: auto; margin: 0; white-space: pre-wrap; }
.code-pro .ln { color: #3D4058; font-size: 12px; display: inline-block; width: 32px; text-align: right; margin-right: 16px; user-select: none; }
.ipe { background: #fff; border-left: 3px solid var(--green); border-radius: 0 10px 10px 0; padding: 16px 20px; margin: 18px 0 28px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.ipe p { margin: 0 0 6px; font-size: 14px; color: var(--text); line-height: 1.65; }
.ipe p:last-child { margin-bottom: 0; }
.ipe strong { color: var(--dark); }
@media (prefers-color-scheme: dark) {
.hdl-blog { background: #12131A !important; color: #C8C9D4 !important; }
.hdl-blog p, .hdl-blog li { color: #C8C9D4 !important; }
.hdl-blog strong { color: #EAEBF0 !important; }
.hdl-blog code { background: #1E1F2B !important; color: #D4D5DE !important; }
.hdl-blog hr { border-color: #2A2B38 !important; }
.hdl-blog pre { background: #0D0E14 !important; }
.hdl-blog .diag { background: #16171F !important; }
.hdl-blog .ipe, .hdl-blog .decision-card-body { background: #1A1B26 !important; }
.hdl-blog td, .hdl-blog th { border-color: #2A2B38 !important; }
.hdl-blog td { color: #C8C9D4 !important; }
.hdl-blog th { color: #fff !important; }
.hdl-blog .tl-dot { background: #16171F !important; }
.hdl-blog .tl-dot.active { background: var(--accent) !important; }
}
</style>
</head>
<body>
<div class="hdl-blog" style="font-family:'Plus Jakarta Sans',sans-serif;max-width:820px;margin:0 auto;padding:32px 24px;line-height:1.75;color:var(--dark);">

<!-- ══════ TAGS ══════ -->
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
<span style="background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:10px;letter-spacing:0.8px;">Fast Formula</span>
<span style="background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:10px;letter-spacing:0.8px;">HCM Data Loader</span>
<span style="background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:10px;letter-spacing:0.8px;">Transformation Formula</span>
<span style="background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:10px;letter-spacing:0.8px;">WSA</span>
<span style="background:var(--dark);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:10px;letter-spacing:0.8px;">Series Part 3 of 3</span>
</div>

<!-- ══════ TITLE ══════ -->
<h1 style="font-size:30px;font-weight:800;color:var(--dark);line-height:1.25;margin:0 0 6px;font-family:inherit;">WSA Implementation and Complete HDL Transformation Fast Formula Code</h1>
<div style="font-size:16px;color:var(--text);margin-bottom:4px;">Part 3 of 3 — WSA_EXISTS, WSA_GET, WSA_SET, and the Full Formula End-to-End</div>
<div style="font-size:13px;color:var(--muted);margin-bottom:24px;">March 2026 · 20 min read · Oracle HCM Cloud</div>

<!-- ══════ INTRO ══════ -->
<div style="background:#FDF5ED;border:1px solid #E8DDD0;border-radius:8px;padding:18px 22px;margin-bottom:28px;">
<p style="margin:0;font-size:15px;color:var(--text);">This is <strong>Part 3</strong> — the final post in this series. Part 1 explained the concepts. Part 2 walked through the code line by line. This post adds WSA caching into the formula and then gives you the <strong>complete formula in one code block</strong> — ready to adapt for your own implementation.</p>
</div>

<!-- ══════ SERIES ROADMAP ══════ -->
<h3 style="font-size:17px;font-weight:700;color:var(--dark);margin:28px 0 16px;font-family:inherit;">HDL Transformation Formula Series</h3>
<div style="display:flex;gap:16px;margin-bottom:32px;flex-wrap:wrap;">
<div style="flex:1;min-width:200px;background:var(--bg-subtle);border-radius:8px;padding:16px 18px;border-left:4px solid var(--muted);">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
<span style="background:var(--muted);color:#fff;font-size:13px;font-weight:800;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;">1</span>
<span style="font-size:14px;font-weight:700;color:var(--muted);">Pure Concepts</span></div>
<p style="margin:0;font-size:12px;color:var(--muted);">INPUTS, OPERATION, METADATA, MAP, WSA, LINEREPEATNO, RETURN.</p></div>
<div style="flex:1;min-width:200px;background:var(--bg-subtle);border-radius:8px;padding:16px 18px;border-left:4px solid var(--muted);">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
<span style="background:var(--muted);color:#fff;font-size:13px;font-weight:800;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;">2</span>
<span style="font-size:14px;font-weight:700;color:var(--muted);">Code Walkthrough</span></div>
<p style="margin:0;font-size:12px;color:var(--muted);">GET_VALUE_SET, ISNULL, SourceSystemId, ESS_LOG_WRITE, LINEREPEATNO.</p></div>
<div style="flex:1;min-width:200px;background:#FDF5ED;border-radius:8px;padding:16px 18px;border-left:4px solid var(--accent);">
<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
<span style="background:var(--accent);color:#fff;font-size:13px;font-weight:800;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;">3</span>
<span style="font-size:14px;font-weight:700;color:var(--accent);">WSA + Complete Formula ← You are here</span></div>
<p style="margin:0;font-size:12px;color:var(--text);">WSA caching code, then the full formula assembled end-to-end.</p></div>
</div>

<!-- ══════ AUTHOR ══════ -->
<div style="display:flex;align-items:center;gap:14px;margin-bottom:32px;padding:14px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);">
<div style="background:linear-gradient(135deg,var(--accent),#B8501F);color:#fff;font-size:15px;font-weight:800;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;">AM</div>
<div><div style="font-weight:700;font-size:15px;">Abhishek Mohanty</div><div style="font-size:13px;color:#888;line-height:1.5;">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant</div></div>
</div>

<hr style="border:none;border-top:1px solid var(--border);margin:36px 0;">

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- SECTION 1: WHY WSA                                         -->
<!-- ═══════════════════════════════════════════════════════════ -->
<h2 style="font-size:22px;font-weight:700;color:var(--dark);margin:30px 0 16px;font-family:inherit;">Why WSA Is Needed in This Formula</h2>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">Part 1 explained this in detail. Here's the short version with a quick visual.</p>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">Fast Formula has no memory between rows. The engine calls the formula once per row, then destroys all local variables. WSA (Working Storage Area) is an in-memory storage that <strong>survives between calls</strong>. You write a value on Row 1, and you can read it on Row 500.</p>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">This formula uses WSA for two reasons:</p>

<div class="decision-pair" style="margin:16px 0 24px;">
<div class="decision-card">
<div class="decision-card-head" style="background:var(--blue);color:#fff;">Reason 1 — Performance</div>
<div class="decision-card-body">
<p style="margin:0;font-size:13px;color:var(--text);line-height:1.7;">Same person appears in multiple rows (Dental, Medical, Vision). Without WSA, the formula calls GET_VALUE_SET for the same person 3 times and gets the same answer 3 times. With WSA, it calls once and reads from cache for the rest.</p>
<p style="margin:8px 0 0;font-size:12px;color:var(--muted);">WSA keys: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_<SSN>_<Date></code> and <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">ASG_<SSN>_<Date></code></p>
</div>
</div>
<div class="decision-card">
<div class="decision-card-head" style="background:var(--red);color:#fff;">Reason 2 — Correctness</div>
<div class="decision-card-body">
<p style="margin:0;font-size:13px;color:var(--text);line-height:1.7;">Two rows for the same person + element in the same batch. Both query the database for MultipleEntryCount and get the same MAX. Both assign the same count. Data is lost. WSA tracks what was already assigned so each row gets a unique count.</p>
<p style="margin:8px 0 0;font-size:12px;color:var(--muted);">WSA key: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">MEC_<Person>_<Element>_<Date></code></p>
</div>
</div>
</div>

<div class="ipe">
<p><strong>Reason 1 is optional</strong> — remove it and the formula still works, just slower. <strong>Reason 2 is mandatory</strong> — remove it and the formula produces wrong data.</p>
</div>

<hr style="border:none;border-top:1px solid var(--border);margin:36px 0;">

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- SECTION 2: WSA API                                         -->
<!-- ═══════════════════════════════════════════════════════════ -->
<h2 style="font-size:22px;font-weight:700;color:var(--dark);margin:30px 0 16px;font-family:inherit;">The WSA API — Three Functions</h2>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">WSA has only three functions. Every usage in this formula follows the same pattern:</p>

<div class="code-pro">
<div class="code-pro-header">
<div class="dots"><span style="background:#FF5F56;"></span><span style="background:#FFBD2E;"></span><span style="background:#27C93F;"></span></div>
<div class="label">WSA Pattern — Check → Hit or Miss → Store</div>
</div>
<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">
<span class="ln"> 1</span><span style="color:#57A64A;font-style:italic;">/* Step 1: Check — does WSA already have this value? */</span>
<span class="ln"> 2</span><span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">WSA_EXISTS</span>(<span style="color:#B5CEA8;">l_key</span>) <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 3</span>(
<span class="ln"> 4</span>    <span style="color:#57A64A;font-style:italic;">/* Step 2a: HIT — read from memory */</span>
<span class="ln"> 5</span>    <span style="color:#B5CEA8;">l_value</span> = <span style="color:#DCDCAA;">WSA_GET</span>(<span style="color:#B5CEA8;">l_key</span>, <span style="color:#CE9178;">' '</span>)
<span class="ln"> 6</span>)
<span class="ln"> 7</span><span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln"> 8</span>(
<span class="ln"> 9</span>    <span style="color:#57A64A;font-style:italic;">/* Step 2b: MISS — call the database */</span>
<span class="ln">10</span>    <span style="color:#B5CEA8;">l_value</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(...)
<span class="ln">11</span>
<span class="ln">12</span>    <span style="color:#57A64A;font-style:italic;">/* Step 3: Store — save for next row */</span>
<span class="ln">13</span>    <span style="color:#DCDCAA;">WSA_SET</span>(<span style="color:#B5CEA8;">l_key</span>, <span style="color:#B5CEA8;">l_value</span>)
<span class="ln">14</span>)</pre>
</div>

<div class="ipe">
<p><strong>WSA_EXISTS(key)</strong> — Returns TRUE if the key exists in memory. Always check before reading.</p>
<p><strong>WSA_GET(key, default)</strong> — Reads the stored value. The second parameter is a default that's returned if the key doesn't exist (but we always check with WSA_EXISTS first, so the default is never used — it's just required syntax).</p>
<p><strong>WSA_SET(key, value)</strong> — Stores a value. Overwrites if the key already exists.</p>
</div>

<hr style="border:none;border-top:1px solid var(--border);margin:36px 0;">

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- SECTION 3: WSA FOR PERSON LOOKUP                           -->
<!-- ═══════════════════════════════════════════════════════════ -->
<h2 style="font-size:22px;font-weight:700;color:var(--dark);margin:30px 0 16px;font-family:inherit;">WSA for Person and Assignment Lookup (Performance)</h2>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">Instead of calling GET_VALUE_SET every time, the formula checks WSA first. If this person was already looked up on a previous row, read from memory:</p>

<div class="code-pro">
<div class="code-pro-header">
<div class="dots"><span style="background:#FF5F56;"></span><span style="background:#FFBD2E;"></span><span style="background:#27C93F;"></span></div>
<div class="label">WSA — Person + Assignment Number Caching</div>
</div>
<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">
<span class="ln"> 1</span><span style="color:#57A64A;font-style:italic;">/* Build a unique key from Person Number + Date */</span>
<span class="ln"> 2</span><span style="color:#B5CEA8;">l_wsa_per_key</span> = <span style="color:#CE9178;">'PER_'</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION3</span>
<span class="ln"> 3</span><span style="color:#B5CEA8;">l_wsa_asg_key</span> = <span style="color:#CE9178;">'ASG_'</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION3</span>
<span class="ln"> 4</span>
<span class="ln"> 5</span><span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">WSA_EXISTS</span>(<span style="color:#B5CEA8;">l_wsa_per_key</span>) <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 6</span>(
<span class="ln"> 7</span>    <span style="color:#57A64A;font-style:italic;">/* HIT — person was already looked up on a previous row */</span>
<span class="ln"> 8</span>    <span style="color:#B5CEA8;">L_PersonNumber</span>     = <span style="color:#DCDCAA;">WSA_GET</span>(<span style="color:#B5CEA8;">l_wsa_per_key</span>, <span style="color:#CE9178;">' '</span>)
<span class="ln"> 9</span>    <span style="color:#B5CEA8;">l_AssignmentNumber</span> = <span style="color:#DCDCAA;">WSA_GET</span>(<span style="color:#B5CEA8;">l_wsa_asg_key</span>, <span style="color:#CE9178;">' '</span>)
<span class="ln">10</span>)
<span class="ln">11</span><span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">12</span>(
<span class="ln">13</span>    <span style="color:#57A64A;font-style:italic;">/* MISS — first time seeing this person. Call the database. */</span>
<span class="ln">14</span>    <span style="color:#B5CEA8;">l_AssignmentNumber</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">15</span>        <span style="color:#CE9178;">'XXTAV_GET_LATEST_ASSIGNMENT_NUMBER'</span>, ...)
<span class="ln">16</span>    <span style="color:#B5CEA8;">L_PersonNumber</span>     = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">17</span>        <span style="color:#CE9178;">'XXTAV_GET_PERSON_NUMBER'</span>, ...)
<span class="ln">18</span>
<span class="ln">19</span>    <span style="color:#57A64A;font-style:italic;">/* Save to WSA — next row with same person skips the DB */</span>
<span class="ln">20</span>    <span style="color:#DCDCAA;">WSA_SET</span>(<span style="color:#B5CEA8;">l_wsa_per_key</span>, <span style="color:#B5CEA8;">L_PersonNumber</span>)
<span class="ln">21</span>    <span style="color:#DCDCAA;">WSA_SET</span>(<span style="color:#B5CEA8;">l_wsa_asg_key</span>, <span style="color:#B5CEA8;">l_AssignmentNumber</span>)
<span class="ln">22</span>)</pre>
</div>

<div class="ipe">
<p><strong>Line 2:</strong> The key is built from Person Number + Date. Example: <code style="background:#3a352f;color:#e8944f;padding:2px 7px;border-radius:3px;font-size:13px;font-family:Consolas,'JetBrains Mono',monospace">PER_100045_2024-01-15</code>. If 3 rows have the same person and date (Dental, Medical, Vision), they all share this key.</p>
<p><strong>Lines 5–9:</strong> WSA has this key → read from memory. Zero database calls.</p>
<p><strong>Lines 13–21:</strong> WSA doesn't have this key → call the database, then save the result so the next row with the same person reads from cache.</p>
</div>

<hr style="border:none;border-top:1px solid var(--border);margin:36px 0;">

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- SECTION 4: WSA FOR MEC                                     -->
<!-- ═══════════════════════════════════════════════════════════ -->
<h2 style="font-size:22px;font-weight:700;color:var(--dark);margin:30px 0 16px;font-family:inherit;">WSA for MultipleEntryCount (Correctness)</h2>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">This is the critical one. Without it, two rows for the same person + element in the same batch get the same count — and one overwrites the other.</p>

<div class="code-pro">
<div class="code-pro-header">
<div class="dots"><span style="background:#FF5F56;"></span><span style="background:#FFBD2E;"></span><span style="background:#27C93F;"></span></div>
<div class="label">WSA — MultipleEntryCount Tracking</div>
</div>
<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">
<span class="ln"> 1</span><span style="color:#57A64A;font-style:italic;">/* Key includes Person + Element + Date — unique per combo */</span>
<span class="ln"> 2</span><span style="color:#B5CEA8;">l_wsa_mec_key</span> = <span style="color:#CE9178;">'MEC_'</span> || <span style="color:#B5CEA8;">L_PersonNumber</span> || <span style="color:#CE9178;">'_'</span>
<span class="ln"> 3</span>             || <span style="color:#B5CEA8;">l_ElementName</span> || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION3</span>
<span class="ln"> 4</span>
<span class="ln"> 5</span><span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">WSA_EXISTS</span>(<span style="color:#B5CEA8;">l_wsa_mec_key</span>) <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 6</span>(
<span class="ln"> 7</span>    <span style="color:#57A64A;font-style:italic;">/* A previous row already assigned a count for this combo */</span>
<span class="ln"> 8</span>    <span style="color:#57A64A;font-style:italic;">/* Read it and add 1                                      */</span>
<span class="ln"> 9</span>    <span style="color:#B5CEA8;">l_MultipleEntryCount</span> = <span style="color:#DCDCAA;">TO_CHAR</span>(
<span class="ln">10</span>        <span style="color:#DCDCAA;">TO_NUMBER</span>(<span style="color:#DCDCAA;">WSA_GET</span>(<span style="color:#B5CEA8;">l_wsa_mec_key</span>, <span style="color:#CE9178;">'0'</span>)) + <span style="color:#DCDCAA;">1</span>)
<span class="ln">11</span>)
<span class="ln">12</span><span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">13</span>(
<span class="ln">14</span>    <span style="color:#57A64A;font-style:italic;">/* First row for this combo. Ask the database. */</span>
<span class="ln">15</span>    <span style="color:#B5CEA8;">l_db_max</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">16</span>        <span style="color:#CE9178;">'XXTAV_MAX_MULTI_ENTRY_COUNT'</span>, ...)
<span class="ln">17</span>
<span class="ln">18</span>    <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_db_max</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">19</span>        <span style="color:#B5CEA8;">l_MultipleEntryCount</span> = <span style="color:#CE9178;">'1'</span>          <span style="color:#57A64A;font-style:italic;">/* nothing in cloud → start at 1 */</span>
<span class="ln">20</span>    <span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">21</span>        <span style="color:#B5CEA8;">l_MultipleEntryCount</span> = <span style="color:#DCDCAA;">TO_CHAR</span>(
<span class="ln">22</span>            <span style="color:#DCDCAA;">TO_NUMBER</span>(<span style="color:#B5CEA8;">l_db_max</span>) + <span style="color:#DCDCAA;">1</span>)    <span style="color:#57A64A;font-style:italic;">/* cloud has 1 → assign 2        */</span>
<span class="ln">23</span>)
<span class="ln">24</span>
<span class="ln">25</span><span style="color:#57A64A;font-style:italic;">/* Save what we assigned — next row reads this instead of DB */</span>
<span class="ln">26</span><span style="color:#DCDCAA;">WSA_SET</span>(<span style="color:#B5CEA8;">l_wsa_mec_key</span>, <span style="color:#B5CEA8;">l_MultipleEntryCount</span>)</pre>
</div>

<div class="ipe">
<p><strong>Lines 5–10:</strong> WSA has a value → a previous row already got a count for this person + element + date. Read it and add 1. Row 5 got count 2, so Row 8 gets count 3.</p>
<p><strong>Lines 14–22:</strong> WSA is empty → first row for this combo. Ask the database what's already in cloud. If cloud has nothing, start at 1. If cloud has MAX = 1, assign 2.</p>
<p><strong>Line 26:</strong> Save whatever we assigned. This is the critical line. Without it, the next row for the same combo queries the stale database again and gets the same MAX.</p>
</div>

<hr style="border:none;border-top:1px solid var(--border);margin:36px 0;">

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- SECTION 5: THREAD WARNING                                  -->
<!-- ═══════════════════════════════════════════════════════════ -->
<h2 style="font-size:22px;font-weight:700;color:var(--dark);margin:30px 0 16px;font-family:inherit;">WSA Requires Single Thread — Set Threads = 1</h2>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">WSA memory is per-thread. If "Load Data from File" runs with multiple threads, each thread gets its own empty WSA. The MEC counter breaks — two threads assign the same count.</p>

<div style="background:rgba(184,66,58,0.06);border:1px solid rgba(184,66,58,0.2);border-radius:10px;padding:16px 20px;margin:16px 0;">
<p style="margin:0 0 8px;font-size:14px;font-weight:700;color:var(--red);">Before running "Load Data from File":</p>
<p style="margin:0;font-size:14px;color:var(--text);">My Client Groups → Payroll → Payroll Process Configuration → <strong>Threads = 1</strong></p>
</div>

<hr style="border:none;border-top:1px solid var(--border);margin:36px 0;">

<!-- ═══════════════════════════════════════════════════════════ -->
<!-- SECTION 6: COMPLETE FORMULA                                -->
<!-- ═══════════════════════════════════════════════════════════ -->
<h2 style="font-size:22px;font-weight:700;color:var(--dark);margin:30px 0 16px;font-family:inherit;">The Complete Formula — All Sections Assembled</h2>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">Everything from Parts 1, 2, and 3 combined into one formula. OPERATION routing, METADATA, MAP block with WSA caching, GET_VALUE_SET calls, SourceSystemId resolution, LINEREPEATNO passes, and Cancel end-dating. This is the full, working code.</p>

<div class="code-pro">
<div class="code-pro-header">
<div class="dots"><span style="background:#FF5F56;"></span><span style="background:#FFBD2E;"></span><span style="background:#27C93F;"></span></div>
<div class="label">XXTAV_HDL_ACCRUAL_INBOUND — Complete Formula</div>
</div>
<pre style="background:#2d2926;border-left:3px solid #c0392b;padding:18px 22px;margin:22px 0;font-family:Consolas,'JetBrains Mono',Monaco,monospace;font-size:13.5px;color:#e8e6e3;line-height:1.7;overflow-x:auto;white-space:pre-wrap;border-radius:4px">
<span class="ln">  1</span><span style="color:#57A64A;font-style:italic;">/**************************************************************</span>
<span class="ln">  2</span><span style="color:#57A64A;font-style:italic;">FORMULA NAME : XXTAV_HDL_ACCRUAL_INBOUND</span>
<span class="ln">  3</span><span style="color:#57A64A;font-style:italic;">FORMULA TYPE : HCM Data Loader</span>
<span class="ln">  4</span><span style="color:#57A64A;font-style:italic;">DESCRIPTION  : Transform vendor accrual file into HDL format</span>
<span class="ln">  5</span><span style="color:#57A64A;font-style:italic;">****************************************************************/</span>
<span class="ln">  6</span>
<span class="ln">  7</span><span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════════ */</span>
<span class="ln">  8</span><span style="color:#57A64A;font-style:italic;">/*  INPUTS                                                     */</span>
<span class="ln">  9</span><span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════════ */</span>
<span class="ln"> 10</span><span style="color:#569CD6;font-weight:700;">INPUTS ARE</span> <span style="color:#B5CEA8;">OPERATION</span> (<span style="color:#4EC9B0;">TEXT</span>),
<span class="ln"> 11</span><span style="color:#B5CEA8;">LINEREPEATNO</span> (<span style="color:#4EC9B0;">NUMBER</span>),
<span class="ln"> 12</span><span style="color:#B5CEA8;">LINENO</span> (<span style="color:#4EC9B0;">NUMBER</span>),
<span class="ln"> 13</span><span style="color:#B5CEA8;">POSITION1</span> (<span style="color:#4EC9B0;">TEXT</span>), <span style="color:#B5CEA8;">POSITION2</span> (<span style="color:#4EC9B0;">TEXT</span>), <span style="color:#B5CEA8;">POSITION3</span> (<span style="color:#4EC9B0;">TEXT</span>),
<span class="ln"> 14</span><span style="color:#B5CEA8;">POSITION4</span> (<span style="color:#4EC9B0;">TEXT</span>), <span style="color:#B5CEA8;">POSITION5</span> (<span style="color:#4EC9B0;">TEXT</span>), <span style="color:#B5CEA8;">POSITION6</span> (<span style="color:#4EC9B0;">TEXT</span>),
<span class="ln"> 15</span><span style="color:#B5CEA8;">POSITION7</span> (<span style="color:#4EC9B0;">TEXT</span>), <span style="color:#B5CEA8;">POSITION8</span> (<span style="color:#4EC9B0;">TEXT</span>),
<span class="ln"> 16</span><span style="color:#B5CEA8;">POSITION9</span> (<span style="color:#4EC9B0;">TEXT</span>), <span style="color:#B5CEA8;">POSITION10</span> (<span style="color:#4EC9B0;">TEXT</span>), <span style="color:#B5CEA8;">POSITION11</span> (<span style="color:#4EC9B0;">TEXT</span>)
<span class="ln"> 17</span>
<span class="ln"> 18</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">LINENO</span> <span style="color:#569CD6;">IS</span> <span style="color:#DCDCAA;">1</span>
<span class="ln"> 19</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">LINEREPEATNO</span> <span style="color:#569CD6;">IS</span> <span style="color:#DCDCAA;">1</span>
<span class="ln"> 20</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION1</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 21</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION2</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 22</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION3</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 23</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION4</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 24</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION5</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 25</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION6</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 26</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION7</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 27</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION8</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 28</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION9</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 29</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION10</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 30</span><span style="color:#569CD6;font-weight:700;">DEFAULT FOR</span> <span style="color:#B5CEA8;">POSITION11</span> <span style="color:#569CD6;">IS</span> <span style="color:#CE9178;">'NO DATA'</span>
<span class="ln"> 31</span>
<span class="ln"> 32</span><span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════════ */</span>
<span class="ln"> 33</span><span style="color:#57A64A;font-style:italic;">/*  OPERATION ROUTING                                          */</span>
<span class="ln"> 34</span><span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════════ */</span>
<span class="ln"> 35</span><span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#B5CEA8;">OPERATION</span> = <span style="color:#CE9178;">'FILETYPE'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 36</span>   <span style="color:#B5CEA8;">OUTPUTVALUE</span> = <span style="color:#CE9178;">'DELIMITED'</span>
<span class="ln"> 37</span><span style="color:#569CD6;font-weight:700;">ELSE IF</span> <span style="color:#B5CEA8;">OPERATION</span> = <span style="color:#CE9178;">'DELIMITER'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 38</span>   <span style="color:#B5CEA8;">OUTPUTVALUE</span> = <span style="color:#CE9178;">','</span>
<span class="ln"> 39</span><span style="color:#569CD6;font-weight:700;">ELSE IF</span> <span style="color:#B5CEA8;">OPERATION</span> = <span style="color:#CE9178;">'READ'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 40</span>   <span style="color:#B5CEA8;">OUTPUTVALUE</span> = <span style="color:#CE9178;">'NONE'</span>
<span class="ln"> 41</span><span style="color:#569CD6;font-weight:700;">ELSE IF</span> <span style="color:#B5CEA8;">OPERATION</span> = <span style="color:#CE9178;">'NUMBEROFBUSINESSOBJECTS'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 42</span>(  <span style="color:#B5CEA8;">OUTPUTVALUE</span> = <span style="color:#CE9178;">'2'</span>
<span class="ln"> 43</span>   <span style="color:#569CD6;font-weight:700;">RETURN</span> <span style="color:#B5CEA8;">OUTPUTVALUE</span>
<span class="ln"> 44</span>)
<span class="ln"> 45</span>
<span class="ln"> 46</span><span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════════ */</span>
<span class="ln"> 47</span><span style="color:#57A64A;font-style:italic;">/*  METADATA                                                   */</span>
<span class="ln"> 48</span><span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════════ */</span>
<span class="ln"> 49</span><span style="color:#569CD6;font-weight:700;">ELSE IF</span> <span style="color:#B5CEA8;">OPERATION</span> = <span style="color:#CE9178;">'METADATALINEINFORMATION'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 50</span>(
<span class="ln"> 51</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">1</span>] = <span style="color:#CE9178;">'ElementEntry'</span>
<span class="ln"> 52</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">2</span>] = <span style="color:#CE9178;">'ElementEntry'</span>
<span class="ln"> 53</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">3</span>] = <span style="color:#CE9178;">'LegislativeDataGroupName'</span>
<span class="ln"> 54</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">4</span>] = <span style="color:#CE9178;">'EffectiveStartDate'</span>
<span class="ln"> 55</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">5</span>] = <span style="color:#CE9178;">'ElementName'</span>
<span class="ln"> 56</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">6</span>] = <span style="color:#CE9178;">'AssignmentNumber'</span>
<span class="ln"> 57</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">7</span>] = <span style="color:#CE9178;">'CreatorType'</span>
<span class="ln"> 58</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">8</span>] = <span style="color:#CE9178;">'EntryType'</span>
<span class="ln"> 59</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">9</span>] = <span style="color:#CE9178;">'MultipleEntryCount'</span>
<span class="ln"> 60</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">10</span>] = <span style="color:#CE9178;">'SourceSystemOwner'</span>
<span class="ln"> 61</span>    <span style="color:#B5CEA8;">METADATA1</span>[<span style="color:#DCDCAA;">11</span>] = <span style="color:#CE9178;">'SourceSystemId'</span>
<span class="ln"> 62</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">1</span>] = <span style="color:#CE9178;">'ElementEntry'</span>
<span class="ln"> 63</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">2</span>] = <span style="color:#CE9178;">'ElementEntryValue'</span>
<span class="ln"> 64</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">3</span>] = <span style="color:#CE9178;">'LegislativeDataGroupName'</span>
<span class="ln"> 65</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">4</span>] = <span style="color:#CE9178;">'EffectiveStartDate'</span>
<span class="ln"> 66</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">5</span>] = <span style="color:#CE9178;">'ElementName'</span>
<span class="ln"> 67</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">6</span>] = <span style="color:#CE9178;">'AssignmentNumber'</span>
<span class="ln"> 68</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">7</span>] = <span style="color:#CE9178;">'InputValueName'</span>
<span class="ln"> 69</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">8</span>] = <span style="color:#CE9178;">'EntryType'</span>
<span class="ln"> 70</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">9</span>] = <span style="color:#CE9178;">'MultipleEntryCount'</span>
<span class="ln"> 71</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">10</span>] = <span style="color:#CE9178;">'ScreenEntryValue'</span>
<span class="ln"> 72</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">11</span>] = <span style="color:#CE9178;">'ElementEntryId(SourceSystemId)'</span>
<span class="ln"> 73</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">12</span>] = <span style="color:#CE9178;">'SourceSystemOwner'</span>
<span class="ln"> 74</span>    <span style="color:#B5CEA8;">METADATA2</span>[<span style="color:#DCDCAA;">13</span>] = <span style="color:#CE9178;">'SourceSystemId'</span>
<span class="ln"> 75</span>    <span style="color:#569CD6;font-weight:700;">RETURN</span> <span style="color:#B5CEA8;">METADATA1</span>, <span style="color:#B5CEA8;">METADATA2</span>
<span class="ln"> 76</span>)
<span class="ln"> 77</span>
<span class="ln"> 78</span><span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════════ */</span>
<span class="ln"> 79</span><span style="color:#57A64A;font-style:italic;">/*  MAP BLOCK — Core Transformation                            */</span>
<span class="ln"> 80</span><span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════════ */</span>
<span class="ln"> 81</span><span style="color:#569CD6;font-weight:700;">ELSE IF</span> <span style="color:#B5CEA8;">OPERATION</span> = <span style="color:#CE9178;">'MAP'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 82</span>(
<span class="ln"> 83</span>    <span style="color:#57A64A;font-style:italic;">/* ─── Static values ─── */</span>
<span class="ln"> 84</span>    <span style="color:#B5CEA8;">l_InputValueName</span>           = <span style="color:#CE9178;">'XXTAV_PTO BALANCE'</span>
<span class="ln"> 85</span>    <span style="color:#B5CEA8;">l_LegislativeDataGroupName</span> = <span style="color:#CE9178;">'United States LDG'</span>
<span class="ln"> 86</span>    <span style="color:#B5CEA8;">l_entry_type</span>               = <span style="color:#CE9178;">'E'</span>
<span class="ln"> 87</span>    <span style="color:#B5CEA8;">l_MultipleEntryCount</span>       = <span style="color:#CE9178;">'1'</span>
<span class="ln"> 88</span>    <span style="color:#B5CEA8;">l_CreatorType</span>              = <span style="color:#CE9178;">'H'</span>
<span class="ln"> 89</span>
<span class="ln"> 90</span>    <span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════ */</span>
<span class="ln"> 91</span>    <span style="color:#57A64A;font-style:italic;">/*  WSA: Person + Assignment Number (Performance Cache)    */</span>
<span class="ln"> 92</span>    <span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════ */</span>
<span class="ln"> 93</span>    <span style="color:#B5CEA8;">l_wsa_per_key</span> = <span style="color:#CE9178;">'PER_'</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION3</span>
<span class="ln"> 94</span>    <span style="color:#B5CEA8;">l_wsa_asg_key</span> = <span style="color:#CE9178;">'ASG_'</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION3</span>
<span class="ln"> 95</span>
<span class="ln"> 96</span>    <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">WSA_EXISTS</span>(<span style="color:#B5CEA8;">l_wsa_per_key</span>) <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln"> 97</span>    (
<span class="ln"> 98</span>        <span style="color:#57A64A;font-style:italic;">/* HIT — read from cache */</span>
<span class="ln"> 99</span>        <span style="color:#B5CEA8;">L_PersonNumber</span>     = <span style="color:#DCDCAA;">WSA_GET</span>(<span style="color:#B5CEA8;">l_wsa_per_key</span>, <span style="color:#CE9178;">' '</span>)
<span class="ln">100</span>        <span style="color:#B5CEA8;">l_AssignmentNumber</span> = <span style="color:#DCDCAA;">WSA_GET</span>(<span style="color:#B5CEA8;">l_wsa_asg_key</span>, <span style="color:#CE9178;">' '</span>)
<span class="ln">101</span>    )
<span class="ln">102</span>    <span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">103</span>    (
<span class="ln">104</span>        <span style="color:#57A64A;font-style:italic;">/* MISS — call database, then cache */</span>
<span class="ln">105</span>        <span style="color:#B5CEA8;">l_AssignmentNumber</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">106</span>            <span style="color:#CE9178;">'XXTAV_GET_LATEST_ASSIGNMENT_NUMBER'</span>,
<span class="ln">107</span>            <span style="color:#CE9178;">'|=P_PERSON_NUMBER='''</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">''''</span>
<span class="ln">108</span>         || <span style="color:#CE9178;">'|P_EFFECTIVE_START_DATE='''</span>
<span class="ln">109</span>         || <span style="color:#DCDCAA;">TO_CHAR</span>(<span style="color:#DCDCAA;">TO_DATE</span>(<span style="color:#B5CEA8;">POSITION3</span>,<span style="color:#CE9178;">'YYYY-MM-DD'</span>),<span style="color:#CE9178;">'YYYY-MM-DD'</span>)
<span class="ln">110</span>         || <span style="color:#CE9178;">''''</span>)
<span class="ln">111</span>        <span style="color:#B5CEA8;">L_PersonNumber</span> = <span style="color:#B5CEA8;">POSITION4</span>
<span class="ln">112</span>
<span class="ln">113</span>        <span style="color:#DCDCAA;">WSA_SET</span>(<span style="color:#B5CEA8;">l_wsa_per_key</span>, <span style="color:#B5CEA8;">L_PersonNumber</span>)
<span class="ln">114</span>        <span style="color:#DCDCAA;">WSA_SET</span>(<span style="color:#B5CEA8;">l_wsa_asg_key</span>, <span style="color:#B5CEA8;">l_AssignmentNumber</span>)
<span class="ln">115</span>    )
<span class="ln">116</span>
<span class="ln">117</span>    <span style="color:#57A64A;font-style:italic;">/* ─── GET_VALUE_SET: Element Name ─── */</span>
<span class="ln">118</span>    <span style="color:#B5CEA8;">l_ElementName</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">119</span>        <span style="color:#CE9178;">'XXTAV_ACCRUAL_ELEMENTS TEST'</span>,
<span class="ln">120</span>        <span style="color:#CE9178;">'|=P_PAY_CODE='''</span> || <span style="color:#DCDCAA;">TRIM</span>(<span style="color:#B5CEA8;">POSITION2</span>) || <span style="color:#CE9178;">''''</span>)
<span class="ln">121</span>
<span class="ln">122</span>    <span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════ */</span>
<span class="ln">123</span>    <span style="color:#57A64A;font-style:italic;">/*  WSA: MultipleEntryCount (Correctness — Mandatory)      */</span>
<span class="ln">124</span>    <span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════ */</span>
<span class="ln">125</span>    <span style="color:#B5CEA8;">l_wsa_mec_key</span> = <span style="color:#CE9178;">'MEC_'</span> || <span style="color:#B5CEA8;">L_PersonNumber</span> || <span style="color:#CE9178;">'_'</span>
<span class="ln">126</span>                 || <span style="color:#B5CEA8;">l_ElementName</span> || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION3</span>
<span class="ln">127</span>
<span class="ln">128</span>    <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">WSA_EXISTS</span>(<span style="color:#B5CEA8;">l_wsa_mec_key</span>) <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">129</span>    (
<span class="ln">130</span>        <span style="color:#57A64A;font-style:italic;">/* Previous row already assigned a count — increment */</span>
<span class="ln">131</span>        <span style="color:#B5CEA8;">l_MultipleEntryCount</span> = <span style="color:#DCDCAA;">TO_CHAR</span>(
<span class="ln">132</span>            <span style="color:#DCDCAA;">TO_NUMBER</span>(<span style="color:#DCDCAA;">WSA_GET</span>(<span style="color:#B5CEA8;">l_wsa_mec_key</span>, <span style="color:#CE9178;">'0'</span>)) + <span style="color:#DCDCAA;">1</span>)
<span class="ln">133</span>    )
<span class="ln">134</span>    <span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">135</span>    (
<span class="ln">136</span>        <span style="color:#57A64A;font-style:italic;">/* First row for this combo — ask the database */</span>
<span class="ln">137</span>        <span style="color:#B5CEA8;">l_db_max</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">138</span>            <span style="color:#CE9178;">'XXTAV_MAX_MULTI_ENTRY_COUNT'</span>,
<span class="ln">139</span>            <span style="color:#CE9178;">'|=P_PERSON_NUMBER='''</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">''''</span>
<span class="ln">140</span>         || <span style="color:#CE9178;">'|P_EFFECTIVE_START_DATE='''</span>
<span class="ln">141</span>         || <span style="color:#DCDCAA;">TO_CHAR</span>(<span style="color:#DCDCAA;">TO_DATE</span>(<span style="color:#B5CEA8;">POSITION3</span>,<span style="color:#CE9178;">'YYYY/MM/DD'</span>),<span style="color:#CE9178;">'YYYY-MM-DD'</span>)
<span class="ln">142</span>         || <span style="color:#CE9178;">''''</span>
<span class="ln">143</span>         || <span style="color:#CE9178;">'|P_ELEMENT_NAME='''</span> || <span style="color:#B5CEA8;">l_ElementName</span> || <span style="color:#CE9178;">''''</span>)
<span class="ln">144</span>
<span class="ln">145</span>        <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_db_max</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">146</span>            <span style="color:#B5CEA8;">l_MultipleEntryCount</span> = <span style="color:#CE9178;">'1'</span>
<span class="ln">147</span>        <span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">148</span>            <span style="color:#B5CEA8;">l_MultipleEntryCount</span> = <span style="color:#DCDCAA;">TO_CHAR</span>(
<span class="ln">149</span>                <span style="color:#DCDCAA;">TO_NUMBER</span>(<span style="color:#B5CEA8;">l_db_max</span>) + <span style="color:#DCDCAA;">1</span>)
<span class="ln">150</span>    )
<span class="ln">151</span>
<span class="ln">152</span>    <span style="color:#57A64A;font-style:italic;">/* Save MEC to WSA — next row reads this, not the stale DB */</span>
<span class="ln">153</span>    <span style="color:#DCDCAA;">WSA_SET</span>(<span style="color:#B5CEA8;">l_wsa_mec_key</span>, <span style="color:#B5CEA8;">l_MultipleEntryCount</span>)
<span class="ln">154</span>
<span class="ln">155</span>    <span style="color:#57A64A;font-style:italic;">/* ─── SourceSystemId: Lookup or Construct ─── */</span>
<span class="ln">156</span>    <span style="color:#B5CEA8;">l_SourceSystemId</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">157</span>        <span style="color:#CE9178;">'XXTAV_GET_ELEMENT_ENTRY_SOURCE_SYSTEM_ID'</span>,
<span class="ln">158</span>        <span style="color:#CE9178;">'|=P_PERSON_NUMBER='''</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">''''</span>
<span class="ln">159</span>     || <span style="color:#CE9178;">'|P_EFFECTIVE_START_DATE='''</span>
<span class="ln">160</span>     || <span style="color:#DCDCAA;">TO_CHAR</span>(<span style="color:#DCDCAA;">TO_DATE</span>(<span style="color:#B5CEA8;">POSITION3</span>,<span style="color:#CE9178;">'YYYY-MM-DD'</span>),<span style="color:#CE9178;">'YYYY-MM-DD'</span>)
<span class="ln">161</span>     || <span style="color:#CE9178;">''''</span>
<span class="ln">162</span>     || <span style="color:#CE9178;">'|P_ELEMENT_NAME='''</span> || <span style="color:#B5CEA8;">l_ElementName</span> || <span style="color:#CE9178;">''''</span>)
<span class="ln">163</span>    <span style="color:#B5CEA8;">l_SourceSystemOwner</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">164</span>        <span style="color:#CE9178;">'XXTAV_GET_ELEMENT_ENTRY_SOURCE_SYSTEM_OWNER'</span>,
<span class="ln">165</span>        <span style="color:#CE9178;">'|=P_PERSON_NUMBER='''</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">''''</span>
<span class="ln">166</span>     || <span style="color:#CE9178;">'|P_EFFECTIVE_START_DATE='''</span>
<span class="ln">167</span>     || <span style="color:#DCDCAA;">TO_CHAR</span>(<span style="color:#DCDCAA;">TO_DATE</span>(<span style="color:#B5CEA8;">POSITION3</span>,<span style="color:#CE9178;">'YYYY-MM-DD'</span>),<span style="color:#CE9178;">'YYYY-MM-DD'</span>)
<span class="ln">168</span>     || <span style="color:#CE9178;">''''</span>
<span class="ln">169</span>     || <span style="color:#CE9178;">'|P_ELEMENT_NAME='''</span> || <span style="color:#B5CEA8;">l_ElementName</span> || <span style="color:#CE9178;">''''</span>)
<span class="ln">170</span>
<span class="ln">171</span>    <span style="color:#57A64A;font-style:italic;">/* ─── EEV SourceSystemId ─── */</span>
<span class="ln">172</span>    <span style="color:#B5CEA8;">l_EEV_SourceSystemId</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">173</span>        <span style="color:#CE9178;">'XXTAV_GET_ELEMENT_ENTRY_VALUE_SOURCE_SYSTEM_ID'</span>,
<span class="ln">174</span>        <span style="color:#CE9178;">'|=P_PERSON_NUMBER='''</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">''''</span>
<span class="ln">175</span>     || <span style="color:#CE9178;">'|P_EFFECTIVE_START_DATE='''</span>
<span class="ln">176</span>     || <span style="color:#DCDCAA;">TO_CHAR</span>(<span style="color:#DCDCAA;">TO_DATE</span>(<span style="color:#B5CEA8;">POSITION3</span>,<span style="color:#CE9178;">'YYYY-MM-DD'</span>),<span style="color:#CE9178;">'YYYY-MM-DD'</span>)
<span class="ln">177</span>     || <span style="color:#CE9178;">''''</span>
<span class="ln">178</span>     || <span style="color:#CE9178;">'|P_ELEMENT_NAME='''</span> || <span style="color:#B5CEA8;">l_ElementName</span> || <span style="color:#CE9178;">''''</span>
<span class="ln">179</span>     || <span style="color:#CE9178;">'|P_INPUT_VALUE_NAME='''</span> || <span style="color:#B5CEA8;">l_InputValueName</span> || <span style="color:#CE9178;">''''</span>)
<span class="ln">180</span>    <span style="color:#B5CEA8;">l_EEV_SourceSystemOwner</span> = <span style="color:#DCDCAA;">GET_VALUE_SET</span>(
<span class="ln">181</span>        <span style="color:#CE9178;">'XXTAV_GET_ELEMENT_ENTRY_VALUE_SOURCE_SYSTEM_OWNER'</span>,
<span class="ln">182</span>        <span style="color:#CE9178;">'|=P_PERSON_NUMBER='''</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">''''</span>
<span class="ln">183</span>     || <span style="color:#CE9178;">'|P_EFFECTIVE_START_DATE='''</span>
<span class="ln">184</span>     || <span style="color:#DCDCAA;">TO_CHAR</span>(<span style="color:#DCDCAA;">TO_DATE</span>(<span style="color:#B5CEA8;">POSITION3</span>,<span style="color:#CE9178;">'YYYY-MM-DD'</span>),<span style="color:#CE9178;">'YYYY-MM-DD'</span>)
<span class="ln">185</span>     || <span style="color:#CE9178;">''''</span>
<span class="ln">186</span>     || <span style="color:#CE9178;">'|P_ELEMENT_NAME='''</span> || <span style="color:#B5CEA8;">l_ElementName</span> || <span style="color:#CE9178;">''''</span>
<span class="ln">187</span>     || <span style="color:#CE9178;">'|P_INPUT_VALUE_NAME='''</span> || <span style="color:#B5CEA8;">l_InputValueName</span> || <span style="color:#CE9178;">''''</span>)
<span class="ln">188</span>
<span class="ln">189</span>    <span style="color:#57A64A;font-style:italic;">/* ─── Construct if not found ─── */</span>
<span class="ln">190</span>    <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_SourceSystemId</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">191</span>    (   <span style="color:#B5CEA8;">l_SourceSystemId</span> = <span style="color:#CE9178;">'XXTAV_HDL'</span> || <span style="color:#B5CEA8;">l_AssignmentNumber</span>
<span class="ln">192</span>            || <span style="color:#CE9178;">'_EE_'</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION2</span>
<span class="ln">193</span>            || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION3</span>   )
<span class="ln">194</span>    <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_EEV_SourceSystemId</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">195</span>    (   <span style="color:#B5CEA8;">l_EEV_SourceSystemId</span> = <span style="color:#CE9178;">'XXTAV_HDL'</span> || <span style="color:#B5CEA8;">l_AssignmentNumber</span>
<span class="ln">196</span>            || <span style="color:#CE9178;">'_EEV_'</span> || <span style="color:#B5CEA8;">POSITION4</span> || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION2</span>
<span class="ln">197</span>            || <span style="color:#CE9178;">'_'</span> || <span style="color:#B5CEA8;">POSITION3</span>   )
<span class="ln">198</span>    <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_SourceSystemOwner</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">199</span>    (   <span style="color:#B5CEA8;">l_SourceSystemOwner</span> = <span style="color:#CE9178;">'XXTAV_HDL'</span>   )
<span class="ln">200</span>    <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_EEV_SourceSystemOwner</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">201</span>    (   <span style="color:#B5CEA8;">l_EEV_SourceSystemOwner</span> = <span style="color:#CE9178;">'XXTAV_HDL'</span>   )
<span class="ln">202</span>
<span class="ln">203</span>    <span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════ */</span>
<span class="ln">204</span>    <span style="color:#57A64A;font-style:italic;">/*  LINEREPEATNO = 1 — ElementEntry header                 */</span>
<span class="ln">205</span>    <span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════ */</span>
<span class="ln">206</span>    <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#B5CEA8;">LINEREPEATNO</span> = <span style="color:#DCDCAA;">1</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">207</span>    (
<span class="ln">208</span>        <span style="color:#B5CEA8;">FileName</span>                 = <span style="color:#CE9178;">'ElementEntry'</span>
<span class="ln">209</span>        <span style="color:#B5CEA8;">BusinessOperation</span>        = <span style="color:#CE9178;">'MERGE'</span>
<span class="ln">210</span>        <span style="color:#B5CEA8;">FileDiscriminator</span>        = <span style="color:#CE9178;">'ElementEntry'</span>
<span class="ln">211</span>        <span style="color:#B5CEA8;">LegislativeDataGroupName</span> = <span style="color:#B5CEA8;">l_LegislativeDataGroupName</span>
<span class="ln">212</span>        <span style="color:#B5CEA8;">AssignmentNumber</span>         = <span style="color:#B5CEA8;">l_AssignmentNumber</span>
<span class="ln">213</span>        <span style="color:#B5CEA8;">ElementName</span>              = <span style="color:#B5CEA8;">l_ElementName</span>
<span class="ln">214</span>        <span style="color:#B5CEA8;">EffectiveStartDate</span>       = <span style="color:#DCDCAA;">TO_CHAR</span>(<span style="color:#DCDCAA;">TO_DATE</span>(<span style="color:#B5CEA8;">POSITION3</span>,<span style="color:#CE9178;">'YYYY-MM-DD'</span>),<span style="color:#CE9178;">'YYYY/MM/DD'</span>)
<span class="ln">215</span>        <span style="color:#B5CEA8;">MultipleEntryCount</span>       = <span style="color:#B5CEA8;">l_MultipleEntryCount</span>
<span class="ln">216</span>        <span style="color:#B5CEA8;">EntryType</span>                = <span style="color:#B5CEA8;">l_entry_type</span>
<span class="ln">217</span>        <span style="color:#B5CEA8;">CreatorType</span>              = <span style="color:#B5CEA8;">l_CreatorType</span>
<span class="ln">218</span>        <span style="color:#B5CEA8;">SourceSystemOwner</span>        = <span style="color:#B5CEA8;">l_SourceSystemOwner</span>
<span class="ln">219</span>        <span style="color:#B5CEA8;">SourceSystemId</span>           = <span style="color:#B5CEA8;">l_SourceSystemId</span>
<span class="ln">220</span>        <span style="color:#B5CEA8;">LINEREPEAT</span>               = <span style="color:#CE9178;">'Y'</span>
<span class="ln">221</span>
<span class="ln">222</span>        <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_ElementName</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">223</span>        (   <span style="color:#569CD6;font-weight:700;">RETURN</span> <span style="color:#B5CEA8;">LINEREPEAT</span>, <span style="color:#B5CEA8;">LINEREPEATNO</span>   )
<span class="ln">224</span>        <span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">225</span>        (   <span style="color:#569CD6;font-weight:700;">RETURN</span> <span style="color:#B5CEA8;">BusinessOperation</span>, <span style="color:#B5CEA8;">FileName</span>, <span style="color:#B5CEA8;">FileDiscriminator</span>,
<span class="ln">226</span>                   <span style="color:#B5CEA8;">MultipleEntryCount</span>, <span style="color:#B5CEA8;">CreatorType</span>,
<span class="ln">227</span>                   <span style="color:#B5CEA8;">EffectiveStartDate</span>, <span style="color:#B5CEA8;">ElementName</span>,
<span class="ln">228</span>                   <span style="color:#B5CEA8;">LegislativeDataGroupName</span>, <span style="color:#B5CEA8;">EntryType</span>,
<span class="ln">229</span>                   <span style="color:#B5CEA8;">AssignmentNumber</span>, <span style="color:#B5CEA8;">SourceSystemOwner</span>,
<span class="ln">230</span>                   <span style="color:#B5CEA8;">SourceSystemId</span>,
<span class="ln">231</span>                   <span style="color:#B5CEA8;">LINEREPEAT</span>, <span style="color:#B5CEA8;">LINEREPEATNO</span>   )
<span class="ln">232</span>    )
<span class="ln">233</span>
<span class="ln">234</span>    <span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════ */</span>
<span class="ln">235</span>    <span style="color:#57A64A;font-style:italic;">/*  LINEREPEATNO = 2 — ElementEntryValue (amount)          */</span>
<span class="ln">236</span>    <span style="color:#57A64A;font-style:italic;">/* ═══════════════════════════════════════════════════════ */</span>
<span class="ln">237</span>    <span style="color:#569CD6;font-weight:700;">ELSE IF</span> (<span style="color:#B5CEA8;">LINEREPEATNO</span> = <span style="color:#DCDCAA;">2</span>) <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">238</span>    (
<span class="ln">239</span>        <span style="color:#B5CEA8;">l_ScreenEntryValue</span> = <span style="color:#DCDCAA;">RTRIM</span>(<span style="color:#DCDCAA;">RTRIM</span>(<span style="color:#DCDCAA;">TRIM</span>(<span style="color:#B5CEA8;">POSITION6</span>),<span style="color:#CE9178;">'0'</span>),<span style="color:#CE9178;">'.'</span>)
<span class="ln">240</span>
<span class="ln">241</span>        <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_ScreenEntryValue</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">242</span>        (   <span style="color:#B5CEA8;">l_ScreenEntryValue</span> = <span style="color:#CE9178;">'0'</span>   )
<span class="ln">243</span>
<span class="ln">244</span>        <span style="color:#B5CEA8;">FileName</span>              = <span style="color:#CE9178;">'ElementEntry'</span>
<span class="ln">245</span>        <span style="color:#B5CEA8;">BusinessOperation</span>     = <span style="color:#CE9178;">'MERGE'</span>
<span class="ln">246</span>        <span style="color:#B5CEA8;">FileDiscriminator</span>     = <span style="color:#CE9178;">'ElementEntryValue'</span>
<span class="ln">247</span>        <span style="color:#B5CEA8;">AssignmentNumber</span>      = <span style="color:#B5CEA8;">l_AssignmentNumber</span>
<span class="ln">248</span>        <span style="color:#B5CEA8;">LegislativeDataGroupName</span> = <span style="color:#B5CEA8;">l_LegislativeDataGroupName</span>
<span class="ln">249</span>        <span style="color:#B5CEA8;">ElementName</span>           = <span style="color:#B5CEA8;">l_ElementName</span>
<span class="ln">250</span>        <span style="color:#B5CEA8;">EntryType</span>             = <span style="color:#B5CEA8;">l_entry_type</span>
<span class="ln">251</span>        <span style="color:#B5CEA8;">EffectiveStartDate</span>    = <span style="color:#DCDCAA;">TO_CHAR</span>(<span style="color:#DCDCAA;">TO_DATE</span>(<span style="color:#B5CEA8;">POSITION3</span>,<span style="color:#CE9178;">'YYYY-MM-DD'</span>),<span style="color:#CE9178;">'YYYY/MM/DD'</span>)
<span class="ln">252</span>        <span style="color:#B5CEA8;">MultipleEntryCount</span>    = <span style="color:#B5CEA8;">l_MultipleEntryCount</span>
<span class="ln">253</span>        <span style="color:#B5CEA8;">SourceSystemId</span>        = <span style="color:#B5CEA8;">l_EEV_SourceSystemId</span>
<span class="ln">254</span>        <span style="color:#B5CEA8;">SourceSystemOwner</span>     = <span style="color:#B5CEA8;">l_EEV_SourceSystemOwner</span>
<span class="ln">255</span>        <span style="color:#B5CEA8;">InputValueName</span>        = <span style="color:#B5CEA8;">l_InputValueName</span>
<span class="ln">256</span>        <span style="color:#B5CEA8;">ScreenEntryValue</span>      = <span style="color:#B5CEA8;">l_ScreenEntryValue</span>
<span class="ln">257</span>        <span style="color:#B5CEA8;">LINEREPEAT</span>            = <span style="color:#CE9178;">'N'</span>
<span class="ln">258</span>
<span class="ln">259</span>        <span style="color:#569CD6;font-weight:700;">IF</span> <span style="color:#DCDCAA;">ISNULL</span>(<span style="color:#B5CEA8;">l_ElementName</span>) = <span style="color:#CE9178;">'N'</span> <span style="color:#569CD6;font-weight:700;">THEN</span>
<span class="ln">260</span>        (   <span style="color:#569CD6;font-weight:700;">RETURN</span> <span style="color:#B5CEA8;">LINEREPEAT</span>, <span style="color:#B5CEA8;">LINEREPEATNO</span>   )
<span class="ln">261</span>        <span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">262</span>        (   <span style="color:#569CD6;font-weight:700;">RETURN</span> <span style="color:#B5CEA8;">BusinessOperation</span>, <span style="color:#B5CEA8;">FileName</span>, <span style="color:#B5CEA8;">FileDiscriminator</span>,
<span class="ln">263</span>                   <span style="color:#B5CEA8;">AssignmentNumber</span>, <span style="color:#B5CEA8;">EffectiveStartDate</span>,
<span class="ln">264</span>                   <span style="color:#B5CEA8;">ElementName</span>, <span style="color:#B5CEA8;">EntryType</span>,
<span class="ln">265</span>                   <span style="color:#B5CEA8;">LegislativeDataGroupName</span>, <span style="color:#B5CEA8;">MultipleEntryCount</span>,
<span class="ln">266</span>                   <span style="color:#B5CEA8;">InputValueName</span>, <span style="color:#B5CEA8;">ScreenEntryValue</span>,
<span class="ln">267</span>                   <span style="color:#B5CEA8;">SourceSystemOwner</span>, <span style="color:#B5CEA8;">SourceSystemId</span>,
<span class="ln">268</span>                   <span style="color:#B5CEA8;">LINEREPEAT</span>, <span style="color:#B5CEA8;">LINEREPEATNO</span>   )
<span class="ln">269</span>    )
<span class="ln">270</span>)
<span class="ln">271</span><span style="color:#569CD6;font-weight:700;">ELSE</span>
<span class="ln">272</span>   <span style="color:#B5CEA8;">OUTPUTVALUE</span> = <span style="color:#CE9178;">'NONE'</span>
<span class="ln">273</span><span style="color:#569CD6;font-weight:700;">RETURN</span> <span style="color:#B5CEA8;">OUTPUTVALUE</span>
<span class="ln">274</span><span style="color:#57A64A;font-style:italic;">/* End Formula Text */</span></pre>
</div>

<hr style="border:none;border-top:1px solid var(--border);margin:36px 0;">

<!-- ══════ SERIES COMPLETE ══════ -->
<h2 style="font-size:22px;font-weight:700;color:var(--dark);margin:30px 0 16px;font-family:inherit;">Series Complete</h2>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">That's all three parts.</p>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;"><strong>Part 1</strong> gave you the mental model — what each section of the formula does and why. <strong>Part 2</strong> walked through the code line by line — GET_VALUE_SET syntax, ISNULL patterns, SourceSystemId logic, ESS_LOG_WRITE debugging, LINEREPEATNO passes. <strong>Part 3</strong> added WSA caching and assembled the complete formula.</p>

<p style="font-size:15px;color:var(--text);margin-bottom:14px;">You should now be able to read any HDL Transformation Formula, understand every line, and build your own by adapting the code above to your vendor file layout and value set definitions.</p>

<!-- ══════ SERIES ROADMAP BOTTOM ══════ -->
<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:32px 0;">
<div style="background:var(--bg-subtle);border-radius:20px;padding:6px 16px;font-size:13px;color:var(--muted);font-weight:600;">Part 1: Pure Concepts</div>
<span style="color:var(--border);">→</span>
<div style="background:var(--bg-subtle);border-radius:20px;padding:6px 16px;font-size:13px;color:var(--muted);font-weight:600;">Part 2: Code Walkthrough</div>
<span style="color:var(--border);">→</span>
<div style="background:var(--accent);border-radius:20px;padding:6px 16px;font-size:13px;color:#fff;font-weight:600;">Part 3: WSA + Complete Formula ← This post</div>
</div>

<!-- ══════ AUTHOR BOTTOM ══════ -->
<div style="display:flex;align-items:center;gap:14px;padding:18px 0;border-top:1px solid var(--border);">
<div style="background:linear-gradient(135deg,var(--accent),#B8501F);color:#fff;font-size:15px;font-weight:800;width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;">AM</div>
<div><div style="font-weight:700;font-size:15px;">Abhishek Mohanty</div><div style="font-size:13px;color:#888;line-height:1.5;">Oracle ACE Apprentice | AIOUG Member | Oracle HCM Cloud Consultant & Technical Lead — Fast Formulas, Absence Management, Time & Labor, Core HR, Redwood, HDL, OTBI.</div></div>
</div>

</div>
</body>
</html>