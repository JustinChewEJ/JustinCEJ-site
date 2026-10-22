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
  const heading = document.createElement('h2');
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
  stars.textContent = `${count} stars`;
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

// Pages: each menu item is its own page, chosen by the URL hash so links and
// the back button keep working. Without JavaScript every page stays visible.
const pages = [...document.querySelectorAll('main > section[id]')];
const pageLinks = new Map([...document.querySelectorAll('.board-nav a[data-board]')].map(link => [link.dataset.board, link]));
const breadcrumb = document.querySelector('#breadcrumb-current');

function routeFor(hash) {
  const target = hash.length > 1 && document.getElementById(decodeURIComponent(hash.slice(1)));
  const page = target && target.closest('main > section[id]');
  if (!page) return null;
  return { page, target: target === page ? null : target };
}

function showPage({ page, target }, moveFocus) {
  for (const section of pages) section.hidden = section !== page;
  pageLinks.forEach((link, id) => {
    if (id === page.id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  breadcrumb.textContent = page.dataset.label;
  document.title = page.id === 'hero' ? 'Justin Chew — Portfolio' : `${page.dataset.label} — Justin Chew`;
  if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
  if (moveFocus) page.querySelector('h1').focus({ preventScroll: true });
}

showPage(routeFor(location.hash) || { page: pages[0], target: null }, false);
window.addEventListener('hashchange', () => {
  const route = location.hash ? routeFor(location.hash) : { page: pages[0], target: null };
  if (route) {
    showPage(route, true);
    updateBackToTop();
  }
});

// Mobile menu: the sidebar opens below the top bar.
const menuToggle = document.querySelector('#menu-toggle');
const sidebar = document.querySelector('#sidebar');

function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

menuToggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
sidebar.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
sidebar.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    setMenu(false);
    menuToggle.focus();
  }
});

// Project cards: show or hide the full write-up, sliding it open and shut.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function slideDetails(details, open) {
  // Start from the current height, so a second click mid-slide turns it around smoothly.
  const from = details.hidden ? 0 : details.getBoundingClientRect().height;
  for (const animation of details.getAnimations()) animation.cancel();
  details.hidden = false;
  if (reduceMotion.matches) {
    details.hidden = !open;
    updateBackToTop();
    return;
  }
  const to = open ? details.scrollHeight : 0;
  // The card's 10px gap above the write-up opens and closes with it.
  const gap = height => `${Math.min(height, 10) - 10}px`;
  details.classList.add('animating');
  const slide = details.animate(
    { height: [`${from}px`, `${to}px`], marginTop: [gap(from), gap(to)], opacity: [from ? 1 : 0, open ? 1 : 0] },
    { duration: open ? 360 : 260, easing: 'cubic-bezier(.22,1,.36,1)' }
  );
  slide.onfinish = () => {
    details.classList.remove('animating');
    details.hidden = !open;
    updateBackToTop();
  };
}

for (const button of document.querySelectorAll('.details-toggle')) {
  const details = document.getElementById(button.getAttribute('aria-controls'));
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Hide details' : 'Show details';
    slideDetails(details, open);
  });
}

// Project grid: a plain grid lines cards up in rows, so a tall open card pushed the
// whole next row down. Each card is kept in its own column and spans as many 4px rows
// as it is tall, so only the cards below it move.
const projectGrid = document.querySelector('.project-grid');
const projectCards = [...projectGrid.children];

function stackProjects() {
  if (!projectGrid.offsetParent) return; // page hidden: nothing to measure
  const style = getComputedStyle(projectGrid);
  const columns = style.gridTemplateColumns.split(' ').length;
  const gap = parseFloat(style.columnGap);
  projectGrid.classList.add('stacked');
  projectCards.forEach((card, index) => {
    card.style.gridColumn = String((index % columns) + 1);
    card.style.gridRowEnd = `span ${Math.ceil((card.getBoundingClientRect().height + gap) / 4)}`;
  });
}

const projectObserver = new ResizeObserver(stackProjects);
projectObserver.observe(projectGrid);
for (const card of projectCards) projectObserver.observe(card);

// Back-to-top button: only on pages long enough to scroll, once scrolling starts.
const backToTop = document.querySelector('#back-to-top');

function updateBackToTop() {
  const scrollable = document.documentElement.scrollHeight > window.innerHeight + 1;
  backToTop.hidden = !scrollable || window.scrollY < 200;
}

window.addEventListener('scroll', updateBackToTop, { passive: true });
window.addEventListener('resize', updateBackToTop);
window.addEventListener('pageshow', updateBackToTop);
updateBackToTop();

// Scrolls to the top quickly at first, easing out as it nears the top.
// Native smooth scrolling has no adjustable duration, so each frame is set here.
// Longer pages get a little more time, between 450ms and 900ms.
let scrollFrame = 0;

function scrollToTop() {
  cancelAnimationFrame(scrollFrame);
  const from = window.scrollY;
  // Plays even when the visitor prefers reduced motion.
  if (!from) return;
  const duration = Math.min(900, 450 + from * 0.25);
  const start = performance.now();
  const step = now => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 4);
    window.scrollTo({ top: from * (1 - eased), behavior: 'instant' });
    if (progress < 1) scrollFrame = requestAnimationFrame(step);
  };
  scrollFrame = requestAnimationFrame(step);
}

backToTop.addEventListener('click', () => {
  pages.find(page => !page.hidden).querySelector('h1').focus({ preventScroll: true });
  scrollToTop();
  updateBackToTop();
});
