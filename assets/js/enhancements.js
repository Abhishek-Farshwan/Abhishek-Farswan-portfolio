/* ============================================================
   enhancements.js — Separate Quest Log & Controls Modals,
   Home Featured Loadout (live Sketchfab MAX 4), Pipeline Engine
   Readiness Spec Sheet, About Skill Filter, and Contact Scope Tags.
   ============================================================ */

window.MANUAL = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var STORAGE_KEY = 'af-explorer-quests';
  var QUESTS = [
    { id: 'boot',     title: 'Player Ready',      desc: 'Entered the portfolio console menu.' },
    { id: 'inspect',  title: 'Mesh Inspector',    desc: 'Inspected a 3D asset in the full-size viewer.' },
    { id: 'pipeline', title: 'Ship Loop',         desc: 'Reviewed the 4-stage game asset pipeline.' },
    { id: 'npc',      title: 'Verified Signals',  desc: 'Browsed the LinkedIn NPC recommendations.' },
    { id: 'secret',   title: 'Secret Door',       desc: 'Unlocked the hidden Konami level.' }
  ];
  var state = { boot: true };
  var questModal = null;
  var manualModal = null;

  function sideQuestsComplete() {
    return QUESTS.filter(function (q) { return q.id !== 'secret'; })
      .every(function (q) { return Boolean(state[q.id]); });
  }

  function requireSideQuests() {
    if (sideQuestsComplete()) return true;
    UTIL.toast('COMPLETE ALL SIDE QUESTS TO UNLOCK THE SECRET LEVEL.', 3400);
    return false;
  }

  function loadState() {
    var raw = UTIL.storage.get(STORAGE_KEY);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.keys(parsed).forEach(function (k) { state[k] = Boolean(parsed[k]); });
        }
      } catch (e) { /* ignore malformed storage */ }
    }
    state.boot = true;
    if (UTIL.storage.get('af-portfolio-unlocked') === 'yes') {
      state.secret = true;
    }
    if (state.secret && !sideQuestsComplete()) {
      state.secret = false;
      UTIL.storage.set('af-portfolio-unlocked', 'no');
      saveState();
    }
  }

  function saveState() {
    try { UTIL.storage.set(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* memory fallback */ }
  }

  function paintHud() {
    var doneCount = QUESTS.filter(function (q) { return Boolean(state[q.id]); }).length;
    var label = document.getElementById('quest-hud-label');
    if (label) label.textContent = 'XP ' + doneCount + ' / ' + QUESTS.length;

    var promptLabel = document.getElementById('prompt-xp-label');
    if (promptLabel) promptLabel.textContent = 'XP ' + doneCount + ' / ' + QUESTS.length;

    var promptPips = document.getElementById('prompt-xp-pips');
    if (promptPips) {
      promptPips.innerHTML = QUESTS.map(function (_, i) {
        return '<i class="xp-pip' + (i < doneCount ? ' is-filled' : '') + '"></i>';
      }).join('');
    }

    var summaryNode = document.getElementById('quest-modal-summary');
    if (summaryNode) {
      summaryNode.textContent = doneCount + ' / ' + QUESTS.length + ' COMPLETED';
    }

    var listNode = document.getElementById('manual-quest-list');
    if (listNode) {
      listNode.innerHTML = QUESTS.map(function (q) {
        var done = Boolean(state[q.id]);
        return '<li class="quest-item' + (done ? ' is-done' : '') + '">' +
          '<span class="quest-badge" aria-hidden="true">' + (done ? '\u2713' : '\u00B7') + '</span>' +
          '<span><strong>' + UTIL.escapeHtml(q.title.toUpperCase()) + '</strong><br />' +
          '<span class="muted">' + UTIL.escapeHtml(q.desc) + '</span></span>' +
          '<span class="quest-status">' + (done ? 'DONE' : 'LOCKED') + '</span>' +
        '</li>';
      }).join('');
    }
  }

  function unlock(id, silent) {
    if (id === 'secret' && !requireSideQuests()) return false;
    if (state[id]) return true;
    state[id] = true;
    saveState();
    paintHud();
    if (!silent) {
      var match = QUESTS.filter(function (q) { return q.id === id; })[0];
      var doneCount = QUESTS.filter(function (q) { return Boolean(state[q.id]); }).length;
      if (match) {
        /* achievement toast is visual; calling action already played its own SFX cue */
        UTIL.toast('\uD83C\uDFC6 ACHIEVEMENT UNLOCKED \u2014 ' + match.title.toUpperCase() + ' (' + doneCount + '/' + QUESTS.length + ' XP)', 3400, 'achievement');
      }
    }
    return true;
  }

  function closeAll() {
    var closedAny = false;
    [questModal, manualModal].forEach(function (m) {
      if (m && !m.hidden) {
        m.hidden = true;
        closedAny = true;
      }
    });
    if (closedAny) {
      document.body.classList.remove('modal-open');
      window.SFX.back();
    }
  }

  function openQuestModal() {
    if (!questModal) return;
    if (manualModal) manualModal.hidden = true;
    paintHud();
    questModal.hidden = false;
    document.body.classList.add('modal-open');
    window.SFX.select();
    var closeBtn = questModal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function openManualModal() {
    if (!manualModal) return;
    if (questModal) questModal.hidden = true;
    manualModal.hidden = false;
    document.body.classList.add('modal-open');
    window.SFX.select();
    var closeBtn = manualModal.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus();
  }

  function wireModal(m) {
    if (!m) return;
    var closeBtn = m.querySelector('.modal-close');
    var backdrop = m.querySelector('.modal-backdrop');
    if (closeBtn) closeBtn.addEventListener('click', closeAll);
    if (backdrop) backdrop.addEventListener('click', closeAll);
  }

  function init() {
    loadState();
    questModal = document.getElementById('quest-modal');
    manualModal = document.getElementById('manual-modal');
    paintHud();

    var questBtn = document.getElementById('quest-open-btn');
    var manualBtn = document.getElementById('manual-open-btn');
    var promptXpBtn = document.getElementById('prompt-xp-btn');
    var promptControlsBtn = document.getElementById('prompt-controls-btn');
    if (questBtn) questBtn.addEventListener('click', openQuestModal);
    if (manualBtn) manualBtn.addEventListener('click', openManualModal);
    if (promptXpBtn) promptXpBtn.addEventListener('click', openQuestModal);
    if (promptControlsBtn) promptControlsBtn.addEventListener('click', openManualModal);

    if (window.ROUTER) {
      window.ROUTER.onChange(function (panel) {
        if (panel === 'pipeline') unlock('pipeline');
      });
    }

    wireModal(questModal);
    wireModal(manualModal);

    if (manualModal) {
      UTIL.qsa('[data-warp]', manualModal).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-warp');
          closeAll();
          if (target === 'resume') {
            location.href = 'resume.html';
          } else if (window.ROUTER) {
            window.ROUTER.activate(target);
          }
        });
      });
    }

    var konamiBtn = document.getElementById('manual-konami-btn');
    if (konamiBtn) {
      konamiBtn.addEventListener('click', function () {
        if (!requireSideQuests()) return;
        closeAll();
        ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
          .forEach(function (key) {
            document.dispatchEvent(new window.KeyboardEvent('keydown', { key: key, bubbles: true }));
          });
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      var tag = (event.target && event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      var anyOpen = (questModal && !questModal.hidden) || (manualModal && !manualModal.hidden);
      if (anyOpen && event.key === 'Escape') {
        event.preventDefault();
        closeAll();
        return;
      }

      if ((event.key === '?' || event.key === '/') && !document.body.classList.contains('modal-open')) {
        event.preventDefault();
        openManualModal();
      }
    });
  }

  return {
    init: init,
    unlock: unlock,
    open: openManualModal,
    openQuests: openQuestModal,
    close: closeAll
  };
})();

window.ENHANCEMENTS = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var CONFIG = window.SITE.sketchfab;
  var featuredPool = [];

  var CUBE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 2L3 7v10l9 5 9-5V7l-9-5z"/>' +
    '<path d="M3 7l9 5 9-5"/>' +
    '<path d="M12 12v10"/>' +
    '</svg>';

  var PIPELINE_SPECS = {
    '0': [
      { kicker: 'CAMERA READABILITY', title: 'Silhouette-First Blockout', body: 'Primary shapes are tested at actual gameplay camera distance so props and characters read clearly before adding secondary detail.' },
      { kicker: 'PROPORTION & SCALE', title: 'Consistent World Metrics', body: 'Built against a 1 unit = 1 meter scale human/chibi reference so doors, seating, and hand-held props match level metrics.' },
      { kicker: 'FORM HIERARCHY', title: 'Clean Sub-Object Separation', body: 'Logical mesh grouping for pivots, lids, wheels, or riggable joints so animators and gameplay scripts can drive parts cleanly.' }
    ],
    '1': [
      { kicker: 'UV PACKING', title: 'Non-Overlapping UV Islands', body: 'Cleanly unwrapped islands with deliberate padding to prevent mipmap bleeding at lower LODs and distance rendering.' },
      { kicker: 'TEXEL DENSITY', title: 'Balanced Resolution Across Kits', body: 'Uniform texel density across environment and prop sets so no asset looks blurry next to a crisp neighbor.' },
      { kicker: 'PBR WORKFLOW', title: 'Real-Time Material Channels', body: 'Baked Albedo, Roughness, Metallic, and Normal maps in Substance Painter tuned to hold up under dynamic engine lighting.' }
    ],
    '2': [
      { kicker: 'MESH INTEGRITY', title: 'Quad / Tri Discipline', body: 'Zero stray N-gons, non-manifold edges, or unmerged vertices. Unseen bottom and interior faces are stripped to save budget.' },
      { kicker: 'SHADING & NORMALS', title: 'Verified Smoothing & Bakes', body: 'Hard/soft edges and custom split normals checked against normal maps to eliminate shading seams or dark gradients.' },
      { kicker: 'QA VERIFICATION', title: 'Pre-Delivery Audit Pass', body: 'Every mesh undergoes a structured QA pass for naming conventions, material slot count, and clean outliner hierarchy.' }
    ],
    '3': [
      { kicker: 'ORIGIN & TRANSFORMS', title: 'Zeroed Ground-Contact Pivot', body: 'Location, rotation, and scale applied (1, 1, 1) with the pivot placed at ground contact (0, 0, 0) for instant level snapping.' },
      { kicker: 'PHYSICS & COLLISION', title: 'Simplified Collision Hulls', body: 'Tested in Godot with lightweight box, capsule, or convex collision shapes instead of expensive raw trimesh colliders.' },
      { kicker: 'ENGINE FORMAT', title: 'Drop-In GLB / FBX Delivery', body: 'Exported and verified inside a live Godot test scene so materials, scale, and animations work out of the box.' }
    ]
  };

  function embedFor(model) {
    var base = model.embed || model.embedUrl || ('https://sketchfab.com/models/' + model.uid + '/embed');
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

  function tagLabelFor(model, index) {
    if (model.tag) {
      return model.tag.split('/')[0].trim().toUpperCase();
    }
    var n = (model.name || '').toLowerCase();
    if (/cattail|plant|foliage|tree/.test(n)) return 'FOLIAGE';
    if (/chibi|character|base|avatar|bot/.test(n)) return 'CHARACTER';
    if (/throne|weapon|sword|hard/.test(n)) return 'HARD SURFACE';
    if (/cozy|prop|environment|room/.test(n)) return 'ENVIRONMENT';
    var defaults = ['FOLIAGE', 'CHARACTER', 'HARD SURFACE', 'ENVIRONMENT'];
    return defaults[index % defaults.length];
  }

  function metaLineFor(model) {
    if (model.views !== null && model.views !== undefined) {
      return 'VIEWS ' + UTIL.formatCount(model.views) +
        ' \u00B7 LIKES ' + UTIL.formatCount(model.likes) +
        (model.tris ? ' \u00B7 TRIS ' + UTIL.formatCount(model.tris) : '');
    }
    return (model.meta || 'BLENDER \u00B7 GAME-READY \u00B7 LOWPOLY').toUpperCase();
  }

  function renderFeaturedShowcase(items) {
    var grid = document.getElementById('showcase-grid');
    if (!grid) return;

    var topFour = (items || []).slice(0, 4);
    if (!topFour.length) return;
    featuredPool = topFour.slice(0, 4);

    grid.innerHTML = topFour.map(function (model, idx) {
      var tag = tagLabelFor(model, idx);
      var meta = metaLineFor(model);

      return '' +
        '<article class="showcase-slot" data-showcase-uid="' + UTIL.escapeHtml(model.uid) + '">' +
          '<div class="showcase-stage" data-showcase-inspect="' + UTIL.escapeHtml(model.uid) + '" role="button" tabindex="0" aria-label="Inspect ' + UTIL.escapeHtml(model.name) + ' in 3D">' +
            '<div class="showcase-fallback">' + CUBE_SVG + '<span>LIVE 3D MODEL</span></div>' +
            (model.thumb ? '<img class="showcase-thumb" data-src="' + UTIL.escapeHtml(model.thumb) + '" alt="' + UTIL.escapeHtml(model.name) + ' preview" />' : '') +
            '<span class="showcase-tag">' + UTIL.escapeHtml(tag) + '</span>' +
          '</div>' +
          '<div class="showcase-body">' +
            '<div class="showcase-info">' +
              '<h3 title="' + UTIL.escapeHtml(model.name) + '">' + UTIL.escapeHtml(model.name) + '</h3>' +
              '<p class="showcase-meta">' + UTIL.escapeHtml(meta) + '</p>' +
            '</div>' +
            '<button class="btn btn--ghost btn--sm" type="button" data-showcase-inspect="' + UTIL.escapeHtml(model.uid) + '">3D INSPECT \u25B8</button>' +
          '</div>' +
        '</article>';
    }).join('');

    UTIL.qsa('.showcase-thumb', grid).forEach(function (img) {
      img.addEventListener('error', function () {
        img.remove();
      }, { once: true });
      img.src = img.getAttribute('data-src');
    });
  }

  function fetchFeaturedFromSketchfab() {
    if (typeof window.fetch !== 'function') return;
    var controller = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, CONFIG.timeoutMs || 8000) : null;

    window.fetch(CONFIG.api, controller ? { signal: controller.signal } : undefined)
      .then(function (res) {
        if (timer) window.clearTimeout(timer);
        if (!res || !res.ok) throw new Error('Sketchfab sync failed');
        return res.json();
      })
      .then(function (payload) {
        var results = (payload && payload.results) || [];
        if (!results.length) return;
        var hidden = CONFIG.hiddenIds || [];
        var mapped = results
          .filter(function (m) { return hidden.indexOf(m.uid) === -1; })
          .map(function (m) {
            var thumb = '';
            if (m.thumbnails && m.thumbnails.images && m.thumbnails.images.length) {
              var imgs = m.thumbnails.images.slice().sort(function (a, b) { return b.width - a.width; });
              var pick = imgs.filter(function (img) { return img.width <= 1024; })[0] || imgs[imgs.length - 1];
              thumb = pick ? pick.url : '';
            }
            var curated = window.SITE.featured.filter(function (f) { return f.uid === m.uid; })[0];
            var override = CONFIG.descriptionOverrides && CONFIG.descriptionOverrides[m.uid];
            return {
              uid: m.uid,
              name: m.name || 'Untitled model',
              description: override || (m.description || '').trim(),
              views: m.viewCount || 0,
              likes: m.likeCount || 0,
              tris: m.faceCount || 0,
              published: m.publishedAt || '',
              staffPick: Boolean(m.staffpickedAt),
              thumb: thumb,
              embed: embedFor(m),
              view: m.viewerUrl || ('https://sketchfab.com/3d-models/' + m.uid),
              tag: curated ? curated.tag : '',
              meta: curated ? curated.meta : ''
            };
          });

        if (window.ART && typeof window.ART.setSyncedPoolIfIdle === 'function') {
          window.ART.setSyncedPoolIfIdle(mapped);
        }

        var picked = [];
        var seen = {};
        CONFIG.featuredIds.forEach(function (fid) {
          var match = mapped.filter(function (item) { return item.uid === fid; })[0];
          if (match && picked.length < 4) {
            picked.push(match);
            seen[match.uid] = true;
          }
        });
        mapped.forEach(function (item) {
          if (picked.length < 4 && !seen[item.uid]) {
            picked.push(item);
            seen[item.uid] = true;
          }
        });

        if (picked.length) {
          renderFeaturedShowcase(picked.slice(0, 4));
        }
      })
      .catch(function () {
        /* Keep curated fallback cards */
      });
  }

  function initHomeShowcase() {
    var grid = document.getElementById('showcase-grid');
    if (!grid) return;

    grid.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-showcase-inspect]');
      if (!trigger) return;
      var uid = trigger.getAttribute('data-showcase-inspect');
      window.SFX.confirm();
      if (window.MANUAL) window.MANUAL.unlock('inspect');
      if (window.ART && typeof window.ART.inspectByUid === 'function') {
        window.ART.inspectByUid(uid, featuredPool);
      }
    });

    grid.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      var trigger = event.target.closest('.showcase-stage[data-showcase-inspect]');
      if (!trigger) return;
      event.preventDefault();
      var uid = trigger.getAttribute('data-showcase-inspect');
      window.SFX.confirm();
      if (window.MANUAL) window.MANUAL.unlock('inspect');
      if (window.ART && typeof window.ART.inspectByUid === 'function') {
        window.ART.inspectByUid(uid, featuredPool);
      }
    });

    if (window.ART && typeof window.ART.onSync === 'function') {
      window.ART.onSync(function (topFour) {
        renderFeaturedShowcase(topFour);
      });
    }

    fetchFeaturedFromSketchfab();
  }

  function initPipelineSpecs() {
    var inspectBtn = document.getElementById('lab-specimen-inspect');
    var loadEmbedBtn = document.getElementById('lab-specimen-load');
    var stage = document.getElementById('lab-specimen-stage');
    var select = document.getElementById('lab-specimen-select');
    if (!stage) return;

    function currentUid() {
      return (select && select.value) || '699ee2e05bce46749ef93e3330cfb7d4';
    }

    function loadInlineSpecimen(uid) {
      var frame = stage.querySelector('iframe.viewer');
      var placeholder = stage.querySelector('.lab-placeholder');
      if (!frame) return;
      var embed = 'https://sketchfab.com/models/' + uid +
        '/embed?ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0';
      frame.classList.remove('loaded');
      if (placeholder) placeholder.classList.add('is-loading');
      frame.addEventListener('load', function () {
        frame.classList.add('loaded');
        if (placeholder) placeholder.classList.remove('is-loading');
      }, { once: true });
      frame.src = embed;
    }

    if (loadEmbedBtn) {
      loadEmbedBtn.addEventListener('click', function () {
        window.SFX.confirm();
        if (window.MANUAL) window.MANUAL.unlock('pipeline');
        loadInlineSpecimen(currentUid());
      });
    }

    if (inspectBtn) {
      inspectBtn.addEventListener('click', function () {
        window.SFX.confirm();
        if (window.MANUAL) window.MANUAL.unlock('inspect');
        if (window.ART && typeof window.ART.inspectByUid === 'function') {
          window.ART.inspectByUid(currentUid(), featuredPool);
        }
      });
    }

    if (select) {
      select.addEventListener('change', function () {
        window.SFX.move();
        var frame = stage.querySelector('iframe.viewer');
        if (frame && frame.src && frame.src !== 'about:blank') {
          loadInlineSpecimen(currentUid());
        }
      });
    }
  }

  function initSkillFilter() {
    var buttons = UTIL.qsa('[data-skill-filter]');
    var chips = UTIL.qsa('#about-skills-list .skill-chip');
    if (!buttons.length || !chips.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cat = btn.getAttribute('data-skill-filter');
        window.SFX.move();
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        chips.forEach(function (chip) {
          var tags = (chip.getAttribute('data-skill-cat') || '');
          if (cat === 'all') {
            chip.classList.remove('is-highlighted', 'is-dimmed');
          } else if (tags.indexOf(cat) > -1) {
            chip.classList.add('is-highlighted');
            chip.classList.remove('is-dimmed');
          } else {
            chip.classList.remove('is-highlighted');
            chip.classList.add('is-dimmed');
          }
        });
      });
    });
  }

  function initContactScopeTags() {
    var chips = UTIL.qsa('[data-scope-tag]');
    var textarea = document.getElementById('contact-message');
    if (!chips.length || !textarea) return;

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var next = chip.getAttribute('aria-pressed') !== 'true';
        chip.setAttribute('aria-pressed', String(next));
        window.SFX.move();
        var tagText = chip.getAttribute('data-scope-tag');
        var marker = '[' + tagText + ']';
        var current = textarea.value;
        if (next && current.indexOf(marker) === -1) {
          textarea.value = (current ? current.replace(/\s+$/, '') + ' ' : '') + marker + ' ';
        } else if (!next && current.indexOf(marker) > -1) {
          textarea.value = current.replace(marker, '').replace(/\s{2,}/g, ' ').trim();
        }
      });
    });
  }

  var HERO_SPECS = {
    form: {
      title: 'FORM // SILHOUETTE & TOPOLOGY',
      body: 'Clean low-to-mid-poly cages built to hold strong silhouettes at gameplay camera distance with zero wasted geometry.'
    },
    look: {
      title: 'LOOK // STYLIZED PBR & VALUE GROUPING',
      body: 'Hand-crafted proportions and grouped material values in Substance Painter that stay readable under real-time lighting.'
    },
    engine: {
      title: 'ENGINE // GODOT 4 SCENE INTEGRATION',
      body: 'Every mesh is tested in-engine with zeroed ground-contact pivots (0,0,0), verified scale, and simplified collision hulls.'
    },
    role: {
      title: 'ROLE // 3D ARTIST + QA VERIFIER EYE',
      body: '100+ game-ready props, characters, and environment assets delivered with professional quality-verification discipline.'
    }
  };

  function initHeroLoadoutInspector() {
    var buttons = UTIL.qsa('[data-loadout-spec]');
    var titleNode = document.getElementById('hero-spec-title');
    var bodyNode = document.getElementById('hero-spec-body');
    if (!buttons.length || !titleNode || !bodyNode) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-loadout-spec');
        var spec = HERO_SPECS[key];
        if (!spec) return;
        window.SFX.move();
        buttons.forEach(function (b) {
          b.setAttribute('aria-selected', String(b === btn));
        });
        titleNode.textContent = spec.title;
        bodyNode.textContent = spec.body;
      });
    });
  }

  function init() {
    window.MANUAL.init();
    initHeroLoadoutInspector();
    initHomeShowcase();
    initPipelineSpecs();
    initSkillFilter();
    initContactScopeTags();
  }

  return { init: init };
})();
