/* ============================================================
   art.js — the inventory screen.

   Behaviour contract (see PROJECT_GUIDE.md):
   - opening Art attempts a live sync of the Sketchfab account;
   - synced results replace the grid and can be sorted/filtered/searched;
   - the four curated models stay as the fallback and as "Featured";
   - embeds use the shared dark, no-watermark query string;
   - viewers load lazily, requests are bounded and time out;
   - every model keeps a direct Sketchfab link if its viewer fails.
   ============================================================ */

window.ART = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var CONFIG = window.SITE.sketchfab;
  var FEATURED = window.SITE.featured;

  var grid, status, modeSelect, sortSelect, searchInput, countChip;
  var models = [];
  var visible = [];
  var synced = false;
  var opened = false;
  var observer = null;

  /* ---------- model shape ---------- */

  function fromApi(model) {
    var thumb = '';
    if (model.thumbnails && model.thumbnails.images && model.thumbnails.images.length) {
      var images = model.thumbnails.images.slice().sort(function (a, b) { return b.width - a.width; });
      var pick = images.filter(function (image) { return image.width <= 1024; })[0] || images[images.length - 1];
      thumb = pick ? pick.url : '';
    }
    return {
      uid: model.uid,
      name: model.name || 'Untitled model',
      description: (model.description || '').trim(),
      views: model.viewCount || 0,
      likes: model.likeCount || 0,
      tris: model.faceCount || 0,
      published: model.publishedAt || '',
      staffPick: Boolean(model.staffpickedAt),
      thumb: thumb,
      embed: embedFor(model),
      view: model.viewerUrl || ('https://sketchfab.com/3d-models/' + model.uid)
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
      thumb: '',
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

  function cardMarkup(model, index) {
    var description = model.description
      ? model.description.slice(0, 200)
      : 'Game-ready 3D model from the Sketchfab portfolio. Drag inside the viewer to orbit.';

    var poster = model.thumb
      ? ' style="background-image:url(' + UTIL.escapeHtml(model.thumb) + ')"'
      : '';

    return '' +
      '<article class="art-card model-card" data-index="' + index + '" ' +
        'data-src="' + UTIL.escapeHtml(model.embed) + '" ' +
        'data-view-url="' + UTIL.escapeHtml(model.view) + '" ' +
        'data-title="' + UTIL.escapeHtml(model.name) + '">' +
        '<div class="viewer-wrap">' +
          '<iframe class="viewer" title="' + UTIL.escapeHtml(model.name) + ' \u2014 3D viewer" ' +
            'loading="lazy" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen ' +
            'sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"></iframe>' +
          '<div class="viewer-placeholder"' + poster + '><div>' +
            '<b>VIEWER STANDBY</b>' +
            '<span>The 3D viewer starts when this card reaches the screen.</span>' +
            '<a href="' + UTIL.escapeHtml(model.view) + '" target="_blank" rel="noreferrer">OPEN ON SKETCHFAB</a>' +
          '</div></div>' +
          '<button class="inspect-btn" type="button" data-inspect="' + index + '" ' +
            'aria-label="Inspect ' + UTIL.escapeHtml(model.name) + ' full size">INSPECT</button>' +
        '</div>' +
        '<div class="art-body">' +
          '<h3>' + UTIL.escapeHtml(model.name) + '</h3>' +
          '<div class="art-meta">' + statChips(model) +
            (model.staffPick ? '<span class="staff-badge">STAFF PICK</span>' : '') +
          '</div>' +
          '<p class="art-desc">' + UTIL.escapeHtml(description) + '</p>' +
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

  /* ---------- lazy viewers ---------- */

  function loadViewer(card) {
    var frame = card.querySelector('.viewer');
    var src = card.getAttribute('data-src');
    if (!frame || !src || frame.src) return;

    var placeholder = card.querySelector('.viewer-placeholder');
    var heading = placeholder ? placeholder.querySelector('b') : null;
    var timer;

    function fail() {
      window.clearTimeout(timer);
      frame.classList.add('viewer-failed');
      frame.classList.remove('loaded');
      if (heading) heading.textContent = 'VIEWER UNAVAILABLE';
      var hint = placeholder ? placeholder.querySelector('span') : null;
      if (hint) hint.textContent = 'The embedded viewer did not load. The model still opens on Sketchfab.';
    }

    frame.addEventListener('load', function () {
      window.clearTimeout(timer);
      frame.classList.add('loaded');
    }, { once: true });
    frame.addEventListener('error', fail, { once: true });

    frame.src = src;
    timer = window.setTimeout(fail, 12000);
  }

  function observeCards() {
    var cards = UTIL.qsa('.model-card', grid);
    if (!('IntersectionObserver' in window)) {
      cards.forEach(loadViewer);
      return;
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        loadViewer(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '400px 0px', threshold: 0.01 });

    cards.forEach(function (card) { observer.observe(card); });
  }

  /* ---------- loading ---------- */

  function load() {
    if (opened) return;
    opened = true;

    models = FEATURED.map(fromCurated);
    grid.innerHTML = skeletonMarkup(4);
    status.textContent = 'SYNCING WITH SKETCHFAB\u2026';

    fetchModels()
      .then(function (results) {
        if (!results.length) throw new Error('No models returned');
        models = results.map(fromApi);
        synced = true;
        modeSelect.disabled = false;
        apply();
      })
      .catch(function () {
        synced = false;
        modeSelect.value = 'featured';
        apply();
      });
  }

  /* ---------- public model access for the inspector ---------- */

  function at(index) { return visible[index]; }
  function count() { return visible.length; }

  function init() {
    grid = document.getElementById('art-grid');
    status = document.getElementById('art-status');
    modeSelect = document.getElementById('art-mode');
    sortSelect = document.getElementById('art-sort');
    searchInput = document.getElementById('art-search');
    countChip = document.getElementById('art-count');
    if (!grid) return;

    [modeSelect, sortSelect].forEach(function (control) {
      control.addEventListener('change', function () { window.SFX.move(); apply(); });
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
      }
    });

    window.ROUTER.onChange(function (panel) {
      if (panel === 'art') load();
    });
  }

  return { init: init, at: at, count: count };
})();
