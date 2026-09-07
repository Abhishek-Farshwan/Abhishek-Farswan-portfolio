/**
 * Shared UI Components
 * Handles footer injection and theme toggling across all pages
 */

// Inject footer from components/footer.html
function injectFooter(tagline) {
  fetch('components/footer.html')
    .then(r => r.text())
    .then(html => {
      const footer = html.replace(
        '<span>built like a game menu, shipped like a portfolio</span>',
        `<span>${tagline}</span>`
      );
      document.body.insertAdjacentHTML('beforeend', footer);
    })
    .catch(() => {
      // Fallback if fetch fails (file:// protocol)
      const fallback = `<footer><span>© 2026 Abhishek Farshwan</span><span>${tagline}</span></footer>`;
      document.body.insertAdjacentHTML('beforeend', fallback);
    });
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIconDark = document.querySelector('.theme-icon-dark');
  const themeIconCozy = document.querySelector('.theme-icon-cozy');
  const root = document.documentElement;

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn('localStorage not available for theme persistence');
    }
    const isDark = theme === 'dark';
    if (themeIconDark) themeIconDark.style.display = isDark ? 'inline' : 'none';
    if (themeIconCozy) themeIconCozy.style.display = isDark ? 'none' : 'inline';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'cozy' : 'dark';
      setTheme(newTheme);
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
});