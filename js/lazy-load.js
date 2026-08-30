/**
 * Lazy Loading Optimization for Sketchfab Embeds
 * 
 * Defers iframe loading until they enter the viewport using IntersectionObserver.
 * This significantly improves initial page load performance when multiple embeds exist.
 * 
 * Fallback: Browsers without IntersectionObserver support will load iframes normally.
 */

document.addEventListener('DOMContentLoaded', () => {
  const embeds = document.querySelectorAll('.thumb.embed iframe');
  
  // Check for IntersectionObserver support
  if (!('IntersectionObserver' in window) || embeds.length === 0) {
    return;
  }

  const iframeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        
        // Load iframe if not already loaded
        if (iframe.hasAttribute('data-src') && !iframe.src) {
          iframe.src = iframe.getAttribute('data-src');
        }
        
        // Stop observing once loaded
        iframeObserver.unobserve(iframe);
      }
    });
  }, { 
    rootMargin: '50px',
    threshold: 0.01 
  });

  // Convert src to data-src and defer loading
  embeds.forEach(iframe => {
    if (iframe.src && !iframe.hasAttribute('data-src')) {
      iframe.setAttribute('data-src', iframe.src);
      iframe.src = ''; // Clear until element enters viewport
    }
    
    // Start observing
    iframeObserver.observe(iframe);
  });
});

