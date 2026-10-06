# JustinCEJ-site

Personal portfolio for Justin Chew, built with HTML, CSS, and vanilla JavaScript.

Site files live in `public/`, with deployment to GitHub Pages through GitHub Actions.

## Local preview

Run `python -m http.server 8000 --directory public`, then open http://localhost:8000.

## Content

Edit `public/index.html` to update the bio, toolkit, projects, and contact links. The repository feed in `public/script.js` loads public projects from GitHub and includes empty and error states.

## Deployment

In the repository’s Settings → Pages, select **GitHub Actions** as the source. Pushes to `main` deploy the `public/` folder. The site is served at https://justinchewej.github.io/JustinCEJ-site/.
