/* TechLuddite homepage — no framework, no build step, no tracking.
   House rule that applies here too: anything we couldn't load renders as "—",
   never as a plausible-looking guess. */
(() => {
  'use strict';

  const GH_USER = 'TechLuddite';
  const API = `https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ── Theme ─────────────────────────────────────────────────────────── */
  const root = document.documentElement;
  const stored = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  setTheme(stored || (prefersLight ? 'light' : 'dark'));

  function setTheme(mode) {
    root.dataset.theme = mode;
    const btn = $('#theme-toggle');
    if (btn) btn.setAttribute('aria-label', `Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`);
  }

  $('#theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch { /* private mode; not important */ }
  });

  /* ── Helpers ───────────────────────────────────────────────────────── */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  // Blurbs may contain a small, fixed set of inline tags authored in repos.json.
  const inline = (s) => esc(s)
    .replace(/&lt;code&gt;/g, '<code>').replace(/&lt;\/code&gt;/g, '</code>')
    .replace(/&lt;em&gt;/g, '<em>').replace(/&lt;\/em&gt;/g, '</em>');

  const host = (url) => { try { return new URL(url).host; } catch { return url; } };

  function ago(iso) {
    if (!iso) return null;
    const then = new Date(iso);
    if (Number.isNaN(then.getTime())) return null;
    const days = Math.floor((Date.now() - then.getTime()) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }

  function categories(project, live) {
    const tags = new Set();
    if (live) tags.add('live');
    const stack = (project.stack || []).join(' ').toLowerCase();
    if (/kotlin|compose|android|room/.test(stack)) tags.add('mobile');
    else if (/python|ollama|opencv/.test(stack)) tags.add('python');
    else tags.add('web');
    return tags;
  }

  /* ── Render ────────────────────────────────────────────────────────── */
  const grid = $('#grid');
  const emptyMsg = $('#empty');
  let cards = [];

  function cardHTML(p) {
    const live = p.live;
    const stack = (p.stack || []).map((s) => `<span>${esc(s)}</span>`).join('');
    const highlights = (p.highlights || [])
      .map((h) => `<li>${inline(h)}</li>`).join('');

    return `
      <article class="card" data-accent="${esc(p.accent || 'cyan')}" data-name="${esc(p.name)}">
        <div class="card-top">
          <div class="card-emoji" aria-hidden="true">${esc(p.emoji || '📦')}</div>
          <div class="card-heading">
            <h3>${esc(p.title || p.name)}</h3>
            <p class="card-repo">${esc(GH_USER)}/${esc(p.name)}</p>
          </div>
          ${live ? '<span class="card-badge"><span class="dot"></span>Live</span>' : ''}
        </div>

        <p class="card-tagline">${inline(p.tagline || '')}</p>
        <p class="card-blurb">${inline(p.blurb || '')}</p>
        ${highlights ? `<ul class="card-highlights">${highlights}</ul>` : ''}
        ${stack ? `<div class="stack">${stack}</div>` : ''}

        <div class="card-foot">
          ${live ? `<a class="btn btn-primary" href="${esc(live)}">Open ${esc(host(live))}</a>` : ''}
          <a class="btn" href="${esc(p.repo)}">Source</a>
          <div class="card-meta">
            <span title="Primary language">◆ <b data-meta="lang">—</b></span>
            <span title="Stars">★ <b data-meta="stars">—</b></span>
            <span title="Last push">⟳ <b data-meta="pushed">—</b></span>
          </div>
        </div>
      </article>`;
  }

  function applyFilters() {
    const q = ($('#q')?.value || '').trim().toLowerCase();
    const active = $('.chip.is-active')?.dataset.filter || 'all';
    let shown = 0;

    cards.forEach(({ el, tags, haystack }) => {
      const matchTag = active === 'all' || tags.has(active);
      const matchText = !q || haystack.includes(q);
      const show = matchTag && matchText;
      el.hidden = !show;
      if (show) shown++;
    });

    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  /* ── Live GitHub metadata ──────────────────────────────────────────── */
  async function hydrate(known) {
    const note = $('#live-note');
    let repos;
    try {
      const res = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
      repos = await res.json();
      if (!Array.isArray(repos)) throw new Error('Unexpected API payload');
    } catch (err) {
      if (note) {
        note.hidden = false;
        note.textContent =
          `Live repository stats are unavailable right now (${err.message}), so language, ` +
          `stars and last-push read “—”. The project details above are static and unaffected.`;
      }
      return;
    }

    const byName = new Map(repos.map((r) => [r.name.toLowerCase(), r]));

    // Fill in the per-card metadata we actually received.
    cards.forEach(({ el, name }) => {
      const r = byName.get(name.toLowerCase());
      if (!r) return;
      const set = (key, val) => {
        const node = el.querySelector(`[data-meta="${key}"]`);
        if (node && val != null && val !== '') node.textContent = val;
      };
      set('lang', r.language);
      set('stars', typeof r.stargazers_count === 'number' ? r.stargazers_count : null);
      set('pushed', ago(r.pushed_at));
    });

    // Any public repo not in repos.json still gets a card, so a new project
    // shows up here the moment it is pushed.
    const extras = repos.filter((r) =>
      !r.private && !r.fork && !r.archived &&
      !known.has(r.name.toLowerCase()) &&
      r.name.toLowerCase() !== 'opsvibe-homepage'
    );

    extras.forEach((r) => {
      const p = {
        name: r.name,
        title: r.name.replace(/[-_]/g, ' '),
        emoji: '📦',
        tagline: r.description || 'No description yet.',
        blurb: 'Newly published — this card is generated straight from GitHub and has not been written up yet.',
        highlights: [],
        stack: r.language ? [r.language] : [],
        live: r.homepage || null,
        repo: r.html_url,
        accent: 'sky'
      };
      grid.insertAdjacentHTML('beforeend', cardHTML(p));
      registerCard(grid.lastElementChild, p);
    });

    // Keep the counter honest: it reports what is on the page, not a separate
    // tally that can disagree with it.
    const reposStat = $('[data-stat="repos"]');
    if (reposStat) reposStat.textContent = cards.length;

    applyFilters();
  }

  function registerCard(el, p) {
    const tags = categories(p, p.live);
    const haystack = [p.name, p.title, p.tagline, p.blurb, (p.stack || []).join(' '), (p.highlights || []).join(' ')]
      .join(' ').toLowerCase();
    cards.push({ el, name: p.name, tags, haystack });
  }

  /* ── Boot ──────────────────────────────────────────────────────────── */
  (async () => {
    let data;
    try {
      const res = await fetch('data/repos.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`repos.json responded ${res.status}`);
      data = await res.json();
    } catch (err) {
      grid.innerHTML =
        `<p class="loading">Could not load the project list (${esc(err.message)}). ` +
        `Everything is on <a href="https://github.com/${GH_USER}">github.com/${GH_USER}</a> in the meantime.</p>`;
      return;
    }

    const projects = data.repos || [];
    grid.innerHTML = projects.map(cardHTML).join('');
    cards = [];
    $$('.card', grid).forEach((el, i) => registerCard(el, projects[i]));

    const liveCount = projects.filter((p) => p.live).length;
    const liveStat = $('[data-stat="live"]');
    if (liveStat) liveStat.textContent = liveCount;
    const reposStat = $('[data-stat="repos"]');
    if (reposStat) reposStat.textContent = projects.length;

    $$('.chip').forEach((chip) => chip.addEventListener('click', () => {
      $$('.chip').forEach((c) => c.classList.toggle('is-active', c === chip));
      applyFilters();
    }));
    $('#q')?.addEventListener('input', applyFilters);

    hydrate(new Set(projects.map((p) => p.name.toLowerCase())));
  })();
})();
