const status = document.querySelector('#repo-status');
const grid = document.querySelector('#repo-grid');
const retry = document.querySelector('#retry-repos');
document.querySelector('#year').textContent = new Date().getFullYear();

function repositoryCard(repo) {
  const card = document.createElement('a');
  card.className = 'repo-card';
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  // Construct the destination ourselves; never insert API content as HTML.
  card.href = `https://github.com/JustinChewEJ/${encodeURIComponent(repo.name)}`;
  const heading = document.createElement('h3');
  const name = document.createElement('span');
  name.textContent = repo.name;
  heading.append(name);
  const description = document.createElement('p');
  description.textContent = repo.description || 'No description provided.';
  const meta = document.createElement('div');
  meta.className = 'repo-meta';
  const language = document.createElement('span');
  language.textContent = repo.language || 'Not specified';
  const stars = document.createElement('span');
  const count = new Intl.NumberFormat(navigator.language).format(repo.stargazers_count || 0);
  stars.textContent = `☆ ${count}`;
  stars.setAttribute('aria-label', `${count} stars`);
  meta.append(language, stars);
  card.append(heading, description, meta);
  return card;
}

async function loadRepositories() {
  retry.hidden = true;
  grid.replaceChildren();
  status.hidden = false;
  status.classList.remove('visually-hidden');
  status.textContent = 'Loading repositories…';
  grid.setAttribute('aria-busy', 'true');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://api.github.com/users/JustinChewEJ/repos?sort=updated&per_page=12', { signal: controller.signal });
    if (!response.ok) throw new Error('Repository request failed');
    const repos = await response.json();
    if (!Array.isArray(repos) || repos.some(repo => typeof repo.name !== 'string')) throw new Error('Invalid repository response');
    if (!repos.length) {
      status.textContent = 'No public repositories yet. Check back soon.';
      return;
    }
    grid.append(...repos.map(repositoryCard));
    status.textContent = `${repos.length} public ${repos.length === 1 ? 'repository' : 'repositories'} loaded.`;
    // Keep the live announcement available to assistive technology.
    status.classList.add('visually-hidden');
  } catch {
    status.classList.remove('visually-hidden');
    status.textContent = 'Repositories couldn’t be loaded. Try again or view them on GitHub.';
    retry.hidden = false;
  } finally {
    clearTimeout(timeout);
    grid.setAttribute('aria-busy', 'false');
  }
}

retry.addEventListener('click', loadRepositories);
loadRepositories();

const backToTop = document.querySelector('#back-to-top');
const hero = document.querySelector('#hero');

function updateBackToTop() {
  backToTop.hidden = hero.getBoundingClientRect().bottom > 0;
}

window.addEventListener('scroll', updateBackToTop, { passive: true });
window.addEventListener('resize', updateBackToTop);
window.addEventListener('pageshow', updateBackToTop);
updateBackToTop();

backToTop.addEventListener('click', () => {
  document.querySelector('#hero-title').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
  updateBackToTop();
});
