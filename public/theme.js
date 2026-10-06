(() => {
  const key = 'portfolio-dark-mode';
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    themeColor.content = dark ? '#171916' : '#f7f7f2';
  }

  // Restore before rendering the page. Storage may be disabled by the browser.
  let dark = false;
  try {
    dark = sessionStorage.getItem(key) === 'true';
  } catch {}
  applyTheme(dark);

  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('#theme-toggle');
    toggle.hidden = false;
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.addEventListener('click', () => {
      dark = !document.body.classList.contains('dark');
      applyTheme(dark);
      toggle.setAttribute('aria-pressed', String(dark));
      try {
        sessionStorage.setItem(key, String(dark));
      } catch {}
    });
  });
})();
