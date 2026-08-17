document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll reveal animations
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  // Secret Level Modal Handler
  const gameModal = document.getElementById('gameModalOverlay');
  const gameModalClose = document.getElementById('gameModalClose');
  const gameModalHome = document.getElementById('gameModalHome');
  const hudPlayBtn = document.getElementById('hudPlayBtn');

  function openGameModal() {
    if (gameModal) gameModal.classList.add('open');
  }

  function closeGameModal() {
    if (gameModal) gameModal.classList.remove('open');
  }

  if (hudPlayBtn) hudPlayBtn.addEventListener('click', openGameModal);
  if (gameModalClose) gameModalClose.addEventListener('click', closeGameModal);
  if (gameModalHome) gameModalHome.addEventListener('click', closeGameModal);
  if (gameModal) {
    gameModal.addEventListener('click', (e) => {
      if (e.target === gameModal) closeGameModal();
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGameModal();
  });

  // Theme Toggle Logic
  const themeToggle = document.getElementById('themeToggle');
  const themeIconDark = document.querySelector('.theme-icon-dark');
  const themeIconCozy = document.querySelector('.theme-icon-cozy');
  const root = document.documentElement;

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'cozy' : 'dark';
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'cozy') {
      if (themeIconDark) themeIconDark.style.display = 'none';
      if (themeIconCozy) themeIconCozy.style.display = 'inline';
    } else {
      if (themeIconDark) themeIconDark.style.display = 'inline';
      if (themeIconCozy) themeIconCozy.style.display = 'none';
    }
  }
});
