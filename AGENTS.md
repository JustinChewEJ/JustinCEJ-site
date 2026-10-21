# JustinCEJ-site: personal portfolio
Plain HTML/CSS plus a little vanilla JS. No frameworks, no build step.
Layout: dashboard with a sticky left menu (#sidebar) and a sticky top bar. Each menu item is its own page: a `main > section[id]`, shown by the URL hash (script.js hides the others).
Deploy: push to main, GitHub Actions publishes to GitHub Pages.

## Conventions
- Site files live in public/.
- Page ids: #hero (Overview) #about #experience #skills #projects #repos #contact.
- Project screenshots and photos live in public/images/. Use only real images Justin supplied.
- Keep it responsive; no horizontal scroll at 375px. Below 900px the sidebar becomes a menu opened from the top bar.
- The dark-mode toggle must stay the only <button> inside any <nav> (the tests find it as `nav button`).
- Use no arrow icons or gradients.
- Font: Open Sauce Sans, self-hosted as woff2 in public/fonts/ (OFL licence alongside).
