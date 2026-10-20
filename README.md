# VEXORANT — The Infinite Identity Universe

Static site: `index.html`, `style.css`, `script.js`. No backend, build step, or dependencies.

## Run locally
Open `index.html` in a browser, or serve the folder: `python3 -m http.server 8000` then visit http://localhost:8000.

## Deploy to GitHub Pages
Push these files to a repo, then Settings → Pages → deploy from the main branch root.

## How it works
- `gen(id)` derives a seed from the full decimal string of the identity (no Number conversion), so any identity of any length maps to the same profile every time (generator version `GEN = 1`).
- The feed is a sliding window of 30 rows. Rows are added at the bottom and removed from the top (and the reverse when scrolling up), with exact scroll compensation. Row numbers are BigInt, so position is tracked without browser height limits. Scroll events plus a 400 ms heartbeat trigger the pump, so no single observer can stall it.
- Search by number jumps directly to that identity (BigInt arithmetic, limit 5000 digits, shown as an error, never truncated). Search by name scans 20,000 identities around your current position and says so; it cannot search every possible name.
- Previous/Next/related identities are computed with BigInt.

## Limitations
Not yet verified in a real browser: scroll feel on low-end Android, and the full test list in the brief (A–J) still needs to be run by you. Portraits are generated SVG; no external images are used.
