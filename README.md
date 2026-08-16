# Opsvibe Homepage

The dev homepage for [TechLuddite](https://github.com/TechLuddite): a single static page listing
every public project, how to support the work, and who it owes something to.

**Live:** https://opsvibe.systems/ (the old https://techluddite.github.io/Opsvibe-Homepage/ URL
redirects there)

---

## What it is

Three files and a JSON blob. No framework, no bundler, no `npm install`, nothing to keep patched.

```
index.html          # the whole page
assets/styles.css   # dark-first, light theme via the toggle or your OS setting
assets/app.js       # renders the cards, filters/search, fetches live repo stats
data/repos.json     # the curated copy for each project; edit this, not the HTML
```

Open `index.html` through any static server and you have the site:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

(`file://` won't work: `app.js` fetches `data/repos.json`, and that's a cross-origin request from
a file URL.)

## Adding or editing a project

Edit `data/repos.json`. Each entry takes:

| Field | Purpose |
| --- | --- |
| `name` | Repository name, exactly as on GitHub; used to match live stats |
| `title`, `emoji` | Card heading and badge |
| `tagline` | One line, bold, above the description |
| `blurb` | A paragraph. `<code>` and `<em>` are the only tags allowed; everything else is escaped |
| `highlights` | Up to three or four bullets: the things worth knowing |
| `stack` | Chips along the bottom; also what the Web/Android/Python filters key off |
| `live` | Deployed URL, or `null`. A non-null value earns the card its "Live" badge |
| `repo` | GitHub URL |
| `accent` | `cyan`, `amber`, `violet`, `emerald`, `rose`, `lime`, `sky`, `orange`, `teal` |

A public repo that *isn't* in `repos.json` still appears: `app.js` pulls the full public list from
the GitHub API and appends a plain card for anything it doesn't recognise. So a new project shows
up here as soon as it's pushed; writing it up properly is optional, and an improvement.

## Live stats, and what happens when they fail

Language, star count and last-push are fetched from the unauthenticated GitHub API on load. That
endpoint is rate-limited by IP and will sometimes refuse.

When it does, the affected fields render `—` and a note under the grid says why. They do not fall
back to stale or invented numbers, the same rule the projects themselves are built on.

## Deployment

`.github/workflows/deploy.yml` publishes the repository root to GitHub Pages on every push to
`main`. It parses `data/repos.json` first, so a trailing comma fails the build instead of blanking
the page.

One-time setup: **Settings → Pages → Source → GitHub Actions**.

The site is served at the custom domain https://opsvibe.systems/, configured under
**Settings → Pages → Custom domain** with the DNS record pointed at GitHub Pages. The old
github.io URL redirects there. Every asset path is relative, so the page works at a subpath or a
domain root without changes.

## License

MIT. See [LICENSE](LICENSE).
