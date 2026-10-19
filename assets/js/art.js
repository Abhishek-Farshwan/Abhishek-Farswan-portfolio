/* ============================================================
   art.js — Clean Blueprint Inventory + live Sketchfab sync
   with Poster-First on-demand 3D orbit.
   ============================================================ */

window.ART = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var CONFIG = window.SITE.sketchfab;
  var FEATURED = window.SITE.featured;

  var grid, status, modeSelect, sortSelect, searchInput, countChip;
  var activeCat = 'all';
  var models = [];
  var visible = [];
  var synced = false;
  var opened = false;
  var observer = null;
  var syncListeners = [];

  /* ---------- clean up known live Sketchfab draft typos ---------- */
  function cleanLiveDescription(raw, uid) {
    var override = CONFIG.descriptionOverrides && CONFIG.descriptionOverrides[uid];
    if (override) return override;
    var text = (raw || '').trim();
    if (!text) return '';
    return text
      .replace(/\bwille\b/gi, 'will')
      .replace(/\bthis the the\b/gi, 'This is the')
      .replace(/\bi'm working as a indie\b/gi, "I'm working on as an indie")
      .replace(/\bstrenghthen\b/gi, 'strengthen');
  }

  /* ---------- accurate category classification (prioritizing title & tag over description) ---------- */
  function inferCategoryLabel(model) {
    var primary = ((model.name || '') + ' ' + (model.tag || '') + ' ' + (model.meta || '')).toLowerCase();
    var desc = (model.description || '').toLowerCase();

    /* 1. Check title/tag/meta first so words like "worlds" in a weapon description never misclassify it */
    if (/\b(chibi|character|characters|basemesh|avatar|npc|bot|companion|player|warrior|knight|creature|monster|humanoid)\b/.test(primary)) {
      return 'CHARACTER';
    }
    if (/\b(weapon|weapons|blaster|blasters|gun|rifle|pistol|sword|blade|axe|shield|dagger|bow|hammer|sci-fi|scifi|throne|chair|table|furniture|chest|crate|barrel|coin|potion|key|lamp|lantern|helmet|armor|prop|props|asset|assets|pack|package|kit|hard surface)\b/.test(primary)) {
      if (/\b(cozy|environment|room|diorama|scene)\b/.test(primary)) return 'ENVIRONMENT';
      return 'PROPS';
    }
    if (/\b(cattail|plant|plants|foliage|flower|tree|trees|bush|shrub|grass|fern|vine|leaf|mushroom|nature|forest)\b/.test(primary)) {
      return 'FOLIAGE';
    }
    if (/\b(cozy|environment|world|scene|room|diorama|island|building|house|tower|dungeon|terrain|landscape)\b/.test(primary)) {
      return 'ENVIRONMENT';
    }

    /* 2. Fallback to description only if title had none of the above */
    if (/\b(chibi|character|basemesh|avatar|rigging|playable)\b/.test(desc)) return 'CHARACTER';
    if (/\b(cattail|vegetation|plant|foliage|flower|tree|botanical)\b/.test(desc)) return 'FOLIAGE';
    if (/\b(weapon|blaster|sword|shield|prop|furniture|hard surface|asset|package)\b/.test(desc)) return 'PROPS';
    if (/\b(environment|diorama|level composition)\b/.test(desc)) return 'ENVIRONMENT';
    return 'PROPS';
  }

  function matchesCategoryFilter(model, cat) {
    if (!cat || cat === 'all') return true;
    var label = inferCategoryLabel(model);
    var primary = ((model.name || '') + ' ' + (model.tag || '') + ' ' + (model.meta || '')).toLowerCase();
    if (cat === 'characters') {
      return label === 'CHARACTER';
    }
    if (cat === 'foliage') {
      return label === 'FOLIAGE' || label === 'ENVIRONMENT' || /\b(foliage|plant|environment|cozy|world|scene|nature)\b/.test(primary);
    }
    if (cat === 'props') {
      return label === 'PROPS' || /\b(prop|props|throne|cozy|hard surface|weapon|weapons|blaster|furniture|asset|assets|pack|package)\b/.test(primary);
    }
    return true;
  }

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  /* ---------- model shape ---------- */

  function fromApi(model) {
    var thumb = '';
    if (model.thumbnails && model.thumbnails.images && model.thumbnails.images.length) {
      var images = model.thumbnails.images.slice().sort(function (a, b) { return b.width - a.width; });
      var pick = images.filter(function (image) { return image.width <= 1024; })[0] || images[images.length - 1];
      thumb = pick ? pick.url : '';
    }
    var curatedMatch = FEATURED.filter(function (f) { return f.uid === model.uid; })[0];
    return {
      uid: model.uid,
      name: model.name || 'Untitled model',
      description: cleanLiveDescription(model.description, model.uid),
      views: model.viewCount || 0,
      likes: model.likeCount || 0,
      tris: model.faceCount || 0,
      published: model.publishedAt || '',
      staffPick: Boolean(model.staffpickedAt),
      thumb: thumb,
      embed: embedFor(model),
      view: model.viewerUrl || ('https://sketchfab.com/3d-models/' + model.uid),
      tag: curatedMatch ? curatedMatch.tag : '',
      meta: curatedMatch ? curatedMatch.meta : ''
    };
  }

  function fromCurated(item) {
    return {
      uid: item.uid,
      name: item.name,
      description: item.description,
      views: null,
      likes: null,
      tris: null,
      published: '',
      staffPick: false,
      thumb: item.thumb || '',
      embed: item.embed,
      view: item.view,
      meta: item.meta,
      tag: item.tag
    };
  }

  function embedFor(model) {
    var base = model.embedUrl || ('https://sketchfab.com/models/' + model.uid + '/embed');
    try {
      var url = new URL(base);
      Object.keys(CONFIG.embedParams).forEach(function (key) {
        url.searchParams.set(key, CONFIG.embedParams[key]);
      });
      return url.toString();
    } catch (error) {
      return base;
    }
  }

  function withAutostart(embedUrlStr) {
    if (!embedUrlStr) return '';
    try {
      var u = new URL(embedUrlStr);
      u.searchParams.set('autostart', '1');
      return u.toString();
    } catch (e) {
      return embedUrlStr + (embedUrlStr.indexOf('?') > -1 ? '&autostart=1' : '?autostart=1');
    }
  }

  /* ---------- fetching ---------- */

  function fetchModels() {
    var collected = [];
    var nextUrl = CONFIG.api;
    var page = 0;

    function step() {
      if (!nextUrl || page >= CONFIG.maxPages || collected.length >= CONFIG.maxModels) {
        return Promise.resolve(collected);
      }
      page += 1;

      var controller = new AbortController();
      var timer = window.setTimeout(function () { controller.abort(); }, CONFIG.timeoutMs);

      return fetch(nextUrl, { signal: controller.signal })
        .then(function (response) {
          window.clearTimeout(timer);
          if (!response.ok) throw new Error('Sketchfab responded ' + response.status);
          return response.json();
        })
        .then(function (payload) {
          var results = payload.results || [];
          collected = collected.concat(results.slice(0, CONFIG.maxModels - collected.length));
          nextUrl = payload.next;
          return step();
        });
    }

    return step();
  }

  /* ---------- rendering ---------- */

  function statChips(model) {
    if (model.views === null) {
      return [model.meta ? model.meta : 'curated'].map(function (text) {
        return '<span class="chip">' + UTIL.escapeHtml(String(text).toUpperCase()) + '</span>';
      }).join('');
    }
    return [
      'VIEWS ' + UTIL.formatCount(model.views),
      'LIKES ' + UTIL.formatCount(model.likes),
      'TRIS ' + UTIL.formatCount(model.tris)
    ].map(function (text) {
      return '<span class="chip">' + UTIL.escapeHtml(text) + '</span>';
    }).join('');
  }

  var DESC_LIMIT = 200;

  function truncateDescription(text) {
    if (!text) return 'Game-ready 3D model from the Sketchfab portfolio. Drag inside the viewer to orbit.';
    if (text.length <= DESC_LIMIT) return text;
    var cut = text.slice(0, DESC_LIMIT);
    var lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > DESC_LIMIT * 0.6) cut = cut.slice(0, lastSpace);
    return cut.replace(/[.,;:\u2014\-\s]+$/, '') + '\u2026';
  }

  function cardMarkup(model, index) {
    var description = truncateDescription(model.description);
    var isFeatured = synced && CONFIG.featuredIds.indexOf(model.uid) > -1;
    var rarity = isFeatured ? 'legendary' : (model.staffPick ? 'epic' : '');
    var hasPoster = Boolean(model.thumb);
    var poster = hasPoster
      ? ' style="background-image:url(' + UTIL.escapeHtml(model.thumb) + ')"'
      : '';
    var tierPill = isFeatured
      ? '<span class="art-tier-pill art-tier-pill--legend">\u2605 FEATURED</span>'
      : (model.staffPick ? '<span class="art-tier-pill art-tier-pill--epic">\u2605 STAFF PICK</span>' : '');
    var catLabel = inferCategoryLabel(model);
    var slotTag = '#' + pad2(index + 1) + ' \u00B7 ' + catLabel;

    return '' +
      '<article class="art-card model-card' + (hasPoster ? ' has-poster' : '') + '" data-index="' + index + '" ' +
        (rarity ? 'data-rarity="' + rarity + '" ' : '') +
        'data-src="' + UTIL.escapeHtml(model.embed) + '" ' +
        'data-view-url="' + UTIL.escapeHtml(model.view) + '" ' +
        'data-title="' + UTIL.escapeHtml(model.name) + '">' +
        '<div class="viewer-wrap" data-inline-orbit="' + index + '">' +
          '<iframe class="viewer" title="' + UTIL.escapeHtml(model.name) + ' \u2014 3D viewer" ' +
            'loading="lazy" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen ' +
            'sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"></iframe>' +
          '<div class="viewer-placeholder"' + poster + '><div>' +
            '<span class="spinner-ring" aria-hidden="true"></span>' +
            '<b>VIEWER STANDBY</b>' +
            '<span>The 3D viewer starts when this card reaches the screen.</span>' +
            '<a href="' + UTIL.escapeHtml(model.view) + '" target="_blank" rel="noreferrer">OPEN ON SKETCHFAB</a>' +
          '</div></div>' +
          '<span class="viewer-slot-tag">' + UTIL.escapeHtml(slotTag) + '</span>' +
          '<button class="viewer-orbit-pill" type="button" data-inline-orbit="' + index + '" aria-label="Orbit ' + UTIL.escapeHtml(model.name) + ' inline in 3D">\u25B6 ORBIT 3D</button>' +
        '</div>' +
        '<div class="art-body">' +
          '<div class="art-card-head">' +
            '<h3 title="' + UTIL.escapeHtml(model.name) + '">' + UTIL.escapeHtml(model.name) + '</h3>' +
            tierPill +
          '</div>' +
          '<div class="art-meta">' + statChips(model) +
            (model.staffPick ? '<span class="staff-badge">STAFF PICK</span>' : '') +
            (isFeatured ? '<span class="featured-badge">FEATURED</span>' : '') +
          '</div>' +
          '<p class="art-desc">' + UTIL.escapeHtml(description) + '</p>' +
          '<div class="art-card-foot">' +
            '<button class="btn btn--ghost btn--sm inspect-btn" type="button" data-inspect="' + index + '" ' +
              'aria-label="Inspect ' + UTIL.escapeHtml(model.name) + ' full size">3D INSPECT \u25B8</button>' +
            '<a class="art-ext-link" href="' + UTIL.escapeHtml(model.view) + '" target="_blank" rel="noopener noreferrer" aria-label="Open ' + UTIL.escapeHtml(model.name) + ' on Sketchfab">SKETCHFAB \u2197</a>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function emptyMarkup(term) {
    return '' +
      '<div class="art-empty">' +
        '<b class="mini-label">NO MATCH FOR "' + UTIL.escapeHtml(String(term).toUpperCase()) + '"</b>' +
        '<p class="art-desc">Try a shorter word, or clear the search to see every upload.</p>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-clear-search>CLEAR SEARCH</button>' +
      '</div>';
  }

  function skeletonMarkup(count) {
    var out = '';
    for (var i = 0; i < count; i += 1) out += '<div class="art-skeleton" aria-hidden="true"></div>';
    return out;
  }

  /* ---------- filtering ---------- */

  function apply() {
    var term = (searchInput.value || '').trim().toLowerCase();
    var mode = modeSelect.value;
    var sort = sortSelect.value;

    var list = models.slice();

    if (mode === 'featured') {
      list = list.filter(function (model) { return CONFIG.featuredIds.indexOf(model.uid) > -1; });
    }

    if (activeCat && activeCat !== 'all') {
      list = list.filter(function (model) {
        return matchesCategoryFilter(model, activeCat);
      });
    }

    if (term) {
      list = list.filter(function (model) {
        return (model.name + ' ' + model.description).toLowerCase().indexOf(term) > -1;
      });
    }

    list.sort(function (a, b) {
      if (sort === 'views')  return (b.views || 0) - (a.views || 0);
      if (sort === 'newest') return new Date(b.published || 0) - new Date(a.published || 0);
      if (sort === 'name')   return a.name.localeCompare(b.name);
      return (b.likes || 0) - (a.likes || 0);
    });

    visible = list;
    paint(term);
  }

  function paint(term) {
    if (observer) { observer.disconnect(); observer = null; }

    if (!visible.length) {
      grid.innerHTML = emptyMarkup(term || '');
    } else {
      grid.innerHTML = visible.map(cardMarkup).join('');
    }

    var label = visible.length === 1 ? '1 MODEL' : visible.length + ' MODELS';
    if (countChip) countChip.textContent = label;
    status.textContent = synced
      ? label + ' \u00B7 SYNCED FROM SKETCHFAB'
      : label + ' \u00B7 CURATED SET \u00B7 LIVE SYNC UNAVAILABLE';

    observeCards();
  }

  /* ---------- lazy / on-demand viewers ---------- */

  function loadViewer(card, autostart) {
    var frame = card.querySelector('.viewer');
    var src = card.getAttribute('data-src');
    if (!frame || !src || frame.src) return;

    var placeholder = card.querySelector('.viewer-placeholder');
    var heading = placeholder ? placeholder.querySelector('b') : null;
    var hintSpan = placeholder ? placeholder.querySelectorAll('div > span') : null;
    hintSpan = hintSpan && hintSpan.length > 1 ? hintSpan[1] : null;
    var timer;

    function fail() {
      window.clearTimeout(timer);
      frame.classList.add('viewer-failed');
      frame.classList.remove('loaded');
      card.classList.remove('is-orbiting');
      if (placeholder) {
        placeholder.classList.remove('is-loading');
        placeholder.classList.add('is-failed');
      }
      if (heading) heading.textContent = 'VIEWER UNAVAILABLE';
      if (hintSpan) hintSpan.textContent = 'The embedded viewer did not load. The model still opens on Sketchfab.';
    }

    frame.addEventListener('load', function () {
      window.clearTimeout(timer);
      frame.classList.add('loaded');
      card.classList.add('is-orbiting');
      if (placeholder) placeholder.classList.remove('is-loading');
    }, { once: true });
    frame.addEventListener('error', fail, { once: true });

    if (placeholder) placeholder.classList.add('is-loading');
    if (heading) heading.textContent = 'LOADING MODEL\u2026';
    if (hintSpan) hintSpan.textContent = 'Fetching the viewer from Sketchfab.';

    frame.src = autostart ? withAutostart(src) : src;
    timer = window.setTimeout(fail, 12000);
  }

  function observeCards() {
    var cards = UTIL.qsa('.model-card', grid);
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (c) { loadViewer(c, false); });
      return;
    }
    /* In real browsers, cards that already have a crisp Sketchfab thumbnail (.has-poster)
       stay in clean Poster-First mode so Sketchfab's un-started iframe doesn't cover
       every card with a giant black play button, avatar, share icon, and cyan cube.
       Users can click the viewport or [▶ ORBIT 3D] to boot inline 3D with autostart=1! */
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!entry.target.classList.contains('has-poster')) {
          loadViewer(entry.target, false);
        }
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '400px 0px', threshold: 0.01 });

    cards.forEach(function (card) { observer.observe(card); });
  }

  /* ---------- loading ---------- */

  function getFeaturedFour() {
    if (!models.length) return FEATURED.slice(0, 4).map(fromCurated);
    var picked = [];
    var seen = {};
    CONFIG.featuredIds.forEach(function (fid) {
      var m = models.filter(function (item) { return item.uid === fid; })[0];
      if (m && picked.length < 4) {
        picked.push(m);
        seen[m.uid] = true;
      }
    });
    models.forEach(function (item) {
      if (picked.length < 4 && !seen[item.uid]) {
        picked.push(item);
        seen[item.uid] = true;
      }
    });
    return picked.slice(0, 4);
  }

  function notifyListeners() {
    var topFour = getFeaturedFour();
    syncListeners.forEach(function (fn) { fn(topFour, synced); });
  }

  function load() {
    if (opened) return;
    opened = true;

    models = FEATURED.map(fromCurated);
    visible = models.slice();
    grid.innerHTML = skeletonMarkup(4);
    status.textContent = 'SYNCING WITH SKETCHFAB\u2026';

    fetchModels()
      .then(function (results) {
        if (!results.length) throw new Error('No models returned');
        var hidden = CONFIG.hiddenIds || [];
        models = results
          .filter(function (model) { return hidden.indexOf(model.uid) === -1; })
          .map(fromApi);
        synced = true;
        modeSelect.disabled = false;
        apply();
        notifyListeners();
      })
      .catch(function () {
        synced = false;
        modeSelect.value = 'featured';
        apply();
        notifyListeners();
      });
  }

  /* ---------- public model access for the inspector & home showcase ---------- */

  function at(index) { return visible[index]; }
  function count() { return visible.length; }
  function onSync(callback) { syncListeners.push(callback); }

  function setSyncedPoolIfIdle(pool) {
    if (opened || !pool || !pool.length) return;
    models = pool.slice();
    visible = models.slice();
  }

  function inspectByUid(uid, customPool) {
    var pool = (Array.isArray(customPool) && customPool.length)
      ? customPool.slice(0, 4)
      : getFeaturedFour();
    var idx = 0;
    pool.forEach(function (m, i) {
      if (m.uid === uid) idx = i;
    });
    if (window.INSPECTOR) {
      window.INSPECTOR.open(idx, pool);
    }
  }

  function init() {
    grid = document.getElementById('art-grid');
    status = document.getElementById('art-status');
    modeSelect = document.getElementById('art-mode');
    sortSelect = document.getElementById('art-sort');
    searchInput = document.getElementById('art-search');
    countChip = document.getElementById('art-count');
    if (!grid) return;

    models = FEATURED.map(fromCurated);
    visible = models.slice();

    [modeSelect, sortSelect].forEach(function (control) {
      control.addEventListener('change', function () { window.SFX.move(); apply(); });
    });

    var catButtons = UTIL.qsa('[data-art-cat]');
    catButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCat = btn.getAttribute('data-art-cat') || 'all';
        catButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        window.SFX.move();
        apply();
      });
    });

    var debounce;
    searchInput.addEventListener('input', function () {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(apply, 180);
    });

    grid.addEventListener('click', function (event) {
      var clear = event.target.closest('[data-clear-search]');
      if (clear) {
        searchInput.value = '';
        window.SFX.back();
        apply();
        return;
      }
      var inspect = event.target.closest('[data-inspect]');
      if (inspect) {
        window.SFX.confirm();
        window.INSPECTOR.open(Number(inspect.getAttribute('data-inspect')));
        return;
      }
      var inlineOrbit = event.target.closest('[data-inline-orbit]');
      if (inlineOrbit && !event.target.closest('a')) {
        var card = inlineOrbit.closest('.model-card');
        if (card) {
          window.SFX.confirm();
          if (window.MANUAL) window.MANUAL.unlock('inspect');
          loadViewer(card, true);
        }
      }
    });

    window.ROUTER.onChange(function (panel) {
      if (panel === 'art') load();
    });
  }

  return {
    init: init,
    at: at,
    count: count,
    loadViewer: loadViewer,
    onSync: onSync,
    setSyncedPoolIfIdle: setSyncedPoolIfIdle,
    inspectByUid: inspectByUid,
    inferCategoryLabel: inferCategoryLabel
  };
})();
