/* ============================================================
   main.js — Progressive & Priority-Preemptive Boot Coordinator.
   1. Tier 1 (Immediate): Mounts the Left Panel (CHROME), ROUTER,
      and active First Loadout (Home + HUD) with zero blocking.
   2. Tier 2 (Background Queue): Warms up remaining panels and
      their network assets progressively during idle frames.
   3. Tier 3 (Priority Pre-emption): Clicking, keying, or hovering
      any section early immediately loads that specific panel first.
   ============================================================ */

window.LOADER = (function () {
  'use strict';

  var ORDER = ['home', 'art', 'pipeline', 'about', 'contact'];
  var queue = ORDER.slice();
  var loaded = {};
  var tasks = {};
  var timer = null;
  var idleId = null;

  function cancelScheduled() {
    if (timer) {
      window.clearTimeout(timer);
      timer = null;
    }
    if (idleId && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idleId);
      idleId = null;
    }
  }

  function markMenuReady(name) {
    var btn = document.getElementById('tab-' + name);
    if (btn) btn.setAttribute('data-loaded', 'true');
    var mob = document.querySelector('.tabbar-btn[data-panel="' + name + '"]');
    if (mob) mob.setAttribute('data-loaded', 'true');
  }

  function runTask(name, isPriority) {
    if (!name || loaded[name]) return;
    loaded[name] = true;
    var idx = queue.indexOf(name);
    if (idx > -1) queue.splice(idx, 1);
    var fn = tasks[name];
    if (typeof fn === 'function') {
      fn(Boolean(isPriority));
    }
    markMenuReady(name);
  }

  function scheduleNext(delayMs) {
    cancelScheduled();
    if (!queue.length) return;
    var wait = typeof delayMs === 'number' ? delayMs : 80;
    timer = window.setTimeout(function () {
      timer = null;
      if (!queue.length) return;
      var step = function () {
        idleId = null;
        if (!queue.length) return;
        var next = queue.shift();
        runTask(next, false);
        if (queue.length) scheduleNext(90);
      };
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(step, { timeout: 400 });
      } else {
        step();
      }
    }, wait);
  }

  function register(name, fn) {
    tasks[name] = fn;
  }

  function prioritize(name) {
    if (!name) return;
    var wasPending = !loaded[name];
    if (wasPending) {
      cancelScheduled();
      runTask(name, true);
    }
    if (name === 'art' && window.ART && typeof window.ART.load === 'function') {
      window.ART.load();
    } else if (name === 'about' && window.ENDORSEMENTS && typeof window.ENDORSEMENTS.loadAssets === 'function') {
      window.ENDORSEMENTS.loadAssets(true);
    } else if (name === 'contact' && window.CONTACT && typeof window.CONTACT.loadAssets === 'function') {
      window.CONTACT.loadAssets(true);
    }
    if (queue.length) {
      scheduleNext(wasPending ? 180 : 90);
    }
  }

  function bump(name) {
    if (!name || loaded[name]) return;
    var idx = queue.indexOf(name);
    if (idx > 0) {
      queue.splice(idx, 1);
      queue.unshift(name);
      scheduleNext(16);
    }
  }

  function start(initialPanel) {
    var first = initialPanel && tasks[initialPanel] ? initialPanel : 'home';
    runTask('home', true);
    if (first !== 'home') {
      runTask(first, true);
    }
    scheduleNext(60);
  }

  return {
    register: register,
    prioritize: prioritize,
    bump: bump,
    start: start,
    isLoaded: function (name) { return Boolean(loaded[name]); },
    pending: function () { return queue.slice(); }
  };
})();

(function () {
  'use strict';

  var booted = false;

  function registerSectionLoaders() {
    window.LOADER.register('home', function (isPriority) {
      if (window.ENHANCEMENTS) {
        window.ENHANCEMENTS.initHome();
        // Let the Left Panel and Home portrait paint first before kicking off
        // the background Sketchfab sync for the 4 featured showcase slots.
        window.setTimeout(function () {
          window.ENHANCEMENTS.syncHomeShowcase(isPriority);
        }, 20);
      }
    });

    window.LOADER.register('art', function (isPriority) {
      if (!window.ART) return;
      window.ART.init();
      if (isPriority || (window.ROUTER && window.ROUTER.current() === 'art')) {
        window.ART.load();
      } else if (typeof window.ART.prefetch === 'function') {
        window.ART.prefetch(false);
      }
    });

    window.LOADER.register('pipeline', function () {
      if (window.ENHANCEMENTS) window.ENHANCEMENTS.initPipeline();
    });

    window.LOADER.register('about', function (isPriority) {
      if (window.ENDORSEMENTS) {
        window.ENDORSEMENTS.init();
        window.ENDORSEMENTS.loadAssets(isPriority);
      }
      if (window.ENHANCEMENTS) window.ENHANCEMENTS.initAbout();
    });

    window.LOADER.register('contact', function (isPriority) {
      if (window.CONTACT) {
        window.CONTACT.init();
        window.CONTACT.loadAssets(isPriority);
      }
      if (window.ENHANCEMENTS) window.ENHANCEMENTS.initContact();
    });
  }

  function boot() {
    if (booted) return;
    booted = true;

    // 1. Mount the Left Panel (Roster) and Navigation Router immediately
    var page = window.CHROME.mount();
    window.ROUTER.init(page);

    if (page === 'home') {
      // Wire lightweight in-memory listeners (zero network requests)
      if (window.MANUAL) window.MANUAL.init();
      if (window.INSPECTOR) window.INSPECTOR.init();
      if (window.ART) window.ART.init();
      if (window.ENDORSEMENTS) window.ENDORSEMENTS.init();
      if (window.CONTACT) window.CONTACT.init();
      if (window.EASTER) window.EASTER.init();

      // Register progressive & priority-preemptive section loaders
      registerSectionLoaders();

      var initial = window.ROUTER.current() || (location.hash || '').replace('#', '') || 'home';
      window.LOADER.start(initial);
    } else {
      if (window.CONTACT) window.CONTACT.init();
    }

    // Activate initial panel after listeners are registered
    window.ROUTER.start();

    var printBtn = window.UTIL.qs('#print-btn');
    if (printBtn) printBtn.addEventListener('click', function () {
      window.SFX.confirm();
      window.print();
    });

    if (page === 'resume') {
      window.UTIL.qsa('.menu-btn[href], .topbar .btn-row a, .resume-meta a').forEach(function (link) {
        link.addEventListener('click', function () { window.SFX.select(); });
      });
    }

    var year = window.UTIL.qs('#year');
    if (year) year.textContent = String(new Date().getFullYear());

    document.documentElement.classList.add('ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
