document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for scroll reveal animations
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  // Game Modal Handler
  const gameModal = document.getElementById('gameModalOverlay');
  const gameModalClose = document.getElementById('gameModalClose');
  const gameModalHome = document.getElementById('gameModalHome');
  const hudPlayBtn = document.getElementById('hudPlayBtn');
  const mobilePlayBtn = document.getElementById('mobilePlayBtn');

  function openGameModal() {
    if (gameModal) {
      gameModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeGameModal() {
    if (gameModal) {
      gameModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // Attach modal event listeners
  if (hudPlayBtn) hudPlayBtn.addEventListener('click', openGameModal);
  if (mobilePlayBtn) mobilePlayBtn.addEventListener('click', openGameModal);
  if (gameModalClose) gameModalClose.addEventListener('click', closeGameModal);
  if (gameModalHome) gameModalHome.addEventListener('click', closeGameModal);
  if (gameModal) {
    gameModal.addEventListener('click', (e) => {
      if (e.target === gameModal) closeGameModal();
    });
  }

  // Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGameModal();
  });

  // Mobile/Desktop Play Button Visibility Handler
  function updatePlayButtonVisibility() {
    const isMobile = window.innerWidth <= 480;
    if (mobilePlayBtn) mobilePlayBtn.style.display = isMobile ? 'block' : 'none';
    if (hudPlayBtn) hudPlayBtn.style.display = isMobile ? 'none' : 'block';
  }

  updatePlayButtonVisibility();
  window.addEventListener('resize', updatePlayButtonVisibility);

  // Theme Toggle Logic with localStorage
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

  // Load saved theme or default to dark
  try {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  } catch (e) {
    setTheme('dark');
  }

  // Theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'cozy' : 'dark';
      setTheme(newTheme);
    });
  }
});
