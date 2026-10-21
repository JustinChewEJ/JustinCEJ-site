(() => {
  const key = 'portfolio-dark-mode';
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(dark) {
    const root = document.documentElement;
    // Every colour changes in the same frame: no transition may run while the theme swaps.
    root.classList.add('theme-switching');
    document.body.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    themeColor.content = dark ? '#171916' : '#f7f7f2';
    const done = () => root.classList.remove('theme-switching');
    requestAnimationFrame(() => requestAnimationFrame(done));
    setTimeout(done, 250); // frames pause in a background tab; never leave transitions off
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
    toggle.addEventListener('animationend', () => toggle.classList.remove('spin'));
    toggle.addEventListener('click', () => {
      dark = !document.body.classList.contains('dark');
      const swap = () => {
        applyTheme(dark);
        toggle.setAttribute('aria-pressed', String(dark));
      };
      // The whole page crossfades as one picture, so no colour runs ahead of another.
      // A fade has no movement, so it runs even when reduced motion is on.
      if (document.startViewTransition) {
        document.startViewTransition(swap);
      } else {
        swap();
      }
      // Restart the icon spin even on quick repeat clicks.
      toggle.classList.remove('spin');
      void toggle.offsetWidth;
      toggle.classList.add('spin');
      try {
        sessionStorage.setItem(key, String(dark));
      } catch {}
    });
  });
})();
