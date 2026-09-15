/* ============================================================
   data.js — every real fact the site renders lives here.
   Mirrors CONTENT_SOURCE.md. If a fact changes, change it in
   CONTENT_SOURCE.md first, then here. Nothing in this file is
   invented: no fake metrics, no unclaimed titles.

   NOTE ON SPELLING: "Farshwan" and "Farswan" are both
   intentional and platform-specific. Do not normalise them.
   ============================================================ */

window.SITE = (function () {
  'use strict';

  var EMBED_PARAMS = {
    ui_theme: 'dark',
    ui_infos: '0',
    ui_watermark: '0',
    ui_watermark_link: '0'
  };

  function embedUrl(id) {
    return 'https://sketchfab.com/models/' + id +
      '/embed?ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0';
  }

  return {
    /* ---- identity ---- */
    identity: {
      displayName: 'Abhishek Farshwan',
      resumeName: 'Abhishek Farswan',
      shortName: 'Abhishek',
      role: '3D Game Artist',
      roleLine: '3D Artist \u00B7 Game-Ready Asset Pipeline',
      note: 'Stylized worlds, readable shapes, game-ready assets.',
      email: 'abhishekfarshwan@gmail.com',
      location: 'Uttarakhand, India',
      resumeLocation: 'Gopeshwar, Uttarakhand, India',
      tagline: 'Built like a game menu, shipped like a portfolio',
      heroLead: '3D artist creating stylized, optimized assets for real-time games \u2014 from clean blockouts to engine-ready final meshes.',
      heroTagline: 'Make it readable. Make it game-ready.',
      missionBrief: 'I model, texture, and optimize 3D assets for real-time games. The focus is clean silhouettes, purposeful detail, and a workflow that produces assets ready for actual engine constraints \u2014 not just pretty viewport renders.',
      bioShort: 'I model, texture, and optimize 3D assets for real-time games \u2014 the kind of props and characters that need to look good AND survive actually running in an engine.',
      bioLong: 'I started as a freelance 3D artist shipping 100+ game-ready assets, then spent time as a Quality Verifier \u2014 which means I have an unusually sharp eye for the small stuff that makes an asset actually ship-ready, not just render-ready. I have also taught computer fundamentals, so I am just as comfortable explaining a workflow as executing one.',
      bioStyle: 'My work leans stylized low-to-mid-poly: strong silhouettes, readable materials, restrained detail, and assets that hold up beyond the viewport.'
    },

    /* ---- quick stats shown on the home loadout panel ---- */
    loadoutStats: [
      { label: 'Form',   value: 'Low / mid poly' },
      { label: 'Look',   value: 'Stylized' },
      { label: 'Engine', value: 'Godot' },
      { label: 'Role',   value: '3D art' }
    ],

    /* ---- external links ---- */
    links: [
      {
        key: 'email',
        label: 'Email',
        detail: 'abhishekfarshwan@gmail.com',
        href: 'mailto:abhishekfarshwan@gmail.com',
        icon: 'gmail',
        mark: '@'
      },
      {
        key: 'github',
        label: 'GitHub',
        detail: 'Abhishek-Farshwan',
        href: 'https://github.com/Abhishek-Farshwan',
        icon: 'github',
        mark: 'GH'
      },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        detail: 'abhishek-farswan',
        href: 'https://in.linkedin.com/in/abhishek-farswan',
        icon: 'linkedin',
        mark: 'IN'
      },
      {
        key: 'artstation',
        label: 'ArtStation',
        detail: 'abhishek_farswan',
        href: 'https://www.artstation.com/abhishek_farswan',
        icon: 'artstation',
        mark: 'AS'
      },
      {
        key: 'sketchfab',
        label: 'Sketchfab',
        detail: 'AbhishekFarswan',
        href: 'https://sketchfab.com/AbhishekFarswan',
        icon: 'sketchfab',
        mark: 'SF'
      }
    ],

    /* ---- Sketchfab sync config ---- */
    sketchfab: {
      user: 'AbhishekFarswan',
      api: 'https://api.sketchfab.com/v3/models?user=AbhishekFarswan&count=24',
      profile: 'https://sketchfab.com/AbhishekFarswan',
      embedParams: EMBED_PARAMS,
      maxPages: 10,
      maxModels: 60,
      timeoutMs: 10000,
      featuredIds: [
        '2a1563b0a4ef40d79b52c3112d2d9437',
        '699ee2e05bce46749ef93e3330cfb7d4',
        '1fe25295ecc84383a65a109dcb42f60d',
        '951d2ca02d2b468391e738d065cebc87'
      ]
    },

    /* ---- curated fallback grid (approved baseline) ---- */
    featured: [
      {
        uid: '2a1563b0a4ef40d79b52c3112d2d9437',
        name: 'Stylized Cattail Plant',
        tag: 'foliage / stylized',
        meta: 'blender \u00B7 foliage \u00B7 lowpoly',
        description: 'Stylized 3D vegetation asset designed for game environments and organic level composition. Drag to orbit.',
        embed: embedUrl('2a1563b0a4ef40d79b52c3112d2d9437'),
        view: 'https://sketchfab.com/3d-models/stylized-cattail-plant-2a1563b0a4ef40d79b52c3112d2d9437'
      },
      {
        uid: '699ee2e05bce46749ef93e3330cfb7d4',
        name: 'Base Mesh Chibi',
        tag: 'character / basemesh',
        meta: '1.4k tris \u00B7 CC BY 4.0',
        description: 'Lightweight basemesh for small-scale characters \u2014 the foundation for an upcoming playable character. Drag to orbit.',
        embed: embedUrl('699ee2e05bce46749ef93e3330cfb7d4'),
        view: 'https://sketchfab.com/3d-models/base-mesh-chibi-699ee2e05bce46749ef93e3330cfb7d4'
      },
      {
        uid: '1fe25295ecc84383a65a109dcb42f60d',
        name: 'Stylized Throne',
        tag: 'props / hard surface',
        meta: 'blender \u00B7 props \u00B7 lowpoly',
        description: 'Low-poly stylized throne model featuring game-ready topology and hand-crafted proportions. Drag to orbit.',
        embed: embedUrl('1fe25295ecc84383a65a109dcb42f60d'),
        view: 'https://sketchfab.com/3d-models/stylized-throne-lowpoly-1-1fe25295ecc84383a65a109dcb42f60d'
      },
      {
        uid: '951d2ca02d2b468391e738d065cebc87',
        name: 'Stylized Cozy Props',
        tag: 'worldbuilding / props',
        meta: 'blender \u00B7 environment \u00B7 props',
        description: 'Atmospheric prop collection exploring cozy environment aesthetics, composition, and readable prop design. Drag to orbit.',
        embed: embedUrl('951d2ca02d2b468391e738d065cebc87'),
        view: 'https://sketchfab.com/3d-models/stylized-cozy-props-1-951d2ca02d2b468391e738d065cebc87'
      }
    ],

    /* ---- pipeline: a real sequence, so the numbering is earned ---- */
    pipeline: [
      {
        title: 'Modeling',
        body: 'Block the silhouette first, lock proportions, then resolve only the forms that actually read at gameplay distance. Low-poly and high-poly workflows in Blender, from rough block-out to a clean final mesh.',
        tools: ['Blender', 'Block-out', 'Low / high poly']
      },
      {
        title: 'Texturing',
        body: 'UV unwrapping, PBR texturing, and baking in Substance Painter. Restrained materials and grouped values so the asset stays readable under real-time lighting, not just in a render.',
        tools: ['Substance Painter', 'UV unwrap', 'PBR', 'Baking']
      },
      {
        title: 'Optimization & QA',
        body: 'Game-ready topology and tri-count discipline: strip geometry that earns nothing, verify normals and UVs, check the asset against real-time constraints with the same picky eye built up doing professional quality verification.',
        tools: ['Tri-count', 'Topology', 'QA-trained eye']
      },
      {
        title: 'Engine Integration',
        body: 'Import into Godot, assign materials, confirm scale and collisions, and test the asset inside an actual scene. Not every asset that looks great in a viewport survives contact with a real level.',
        tools: ['Godot', 'In-engine check', 'Real-time']
      }
    ],

    /* ---- toolchain ---- */
    loadout: [
      { name: 'Godot',      use: 'gameplay + prototypes' },
      { name: 'Blender',    use: 'modeling + lookdev' },
      { name: 'C# / GDScript', use: 'systems + tools' },
      { name: 'Git',        use: 'versioning + experiments' },
      { name: 'Photoshop',  use: 'quick texture / paintover work' }
    ],

    /* ---- about panel facts ---- */
    profileFacts: [
      { label: 'Craft',    value: '3D art for real-time games' },
      { label: 'Shipped',  value: '100+ game-ready assets' },
      { label: 'Focus',    value: 'Game-ready 3D assets' },
      { label: 'Medium',   value: 'Real-time props & environments' },
      { label: 'Engine',   value: 'Godot' },
      { label: 'Based in', value: 'Uttarakhand, India' }
    ],

    /* ---- resume ---- */
    resume: {
      summary: '3D Artist with 2 years of professional experience creating game-ready assets and stylized 3D models. Passionate about building visually appealing and optimized content for games while continuously learning new techniques and workflows. Always eager to grow as an artist, take on new challenges, and contribute to creative projects through collaboration and attention to detail.',
      experience: [
        {
          role: 'Quality Verifier',
          org: 'Berg Technologies',
          when: '09/2025 \u2013 Present',
          where: 'Dehradun',
          points: [
            'Contribute to project workflows requiring attention to detail and consistent quality.',
            'Collaborate effectively within a team while maintaining productivity and accuracy.',
            'Develop strong workflow management, communication, and quality assurance skills.'
          ]
        },
        {
          role: 'Computer Tutor',
          org: 'High Tech Institute of Technology',
          when: '2024 \u2013 2025',
          where: 'Chamoli',
          points: [
            'Taught computer fundamentals and productivity software.',
            'Delivered training on Adobe Photoshop, Canva, HTML, Python, and AI fundamentals.',
            'Designed practical learning exercises for students with different experience levels.',
            'Improved student engagement through hands-on project-based learning.'
          ]
        },
        {
          role: 'Freelance 3D Artist',
          org: 'Self-Employed',
          when: '2021 \u2013 2024',
          where: 'Remote',
          points: [
            'Delivered 100+ game-ready 3D assets and freelance projects across multiple art styles, focusing on optimized real-time workflows.',
            'Developed low-poly and high-poly models using Blender.',
            'Performed UV unwrapping, texture baking, and material creation using Blender and Substance Painter.'
          ]
        }
      ],
      education: [
        { title: 'B.Tech, Electrical Engineering', org: 'Uttarakhand Technical University', when: '2023' },
        { title: 'Intermediate', org: 'Uttarakhand Board of School Education', when: '2019' }
      ],
      skills: [
        '3D Modeling', 'Blender', 'Adobe Photoshop', 'Substance Painter',
        'Game Assets Creation', 'UV Unwrapping', 'PBR Texturing',
        'Asset Optimization', 'Hard Surface Modeling', 'Godot Engine'
      ],
      interests: [
        '3D Art', 'Game Development', 'Digital Sculpting', 'Artificial Intelligence',
        'Video Editing', 'Chess', 'Behavioral Psychology'
      ]
    },

    /* ---- contact copy ---- */
    contact: {
      heading: "Let's make something playable.",
      subline: 'Find me around the web, browse my 3D assets, or send me a message.',
      formNote: 'This form opens your own mail app with the message pre-filled \u2014 nothing is sent through a server, so nothing of yours is stored here.'
    },

    /* ---- navigation ---- */
    nav: [
      { id: 'home',     label: 'Home',     glyph: '\u2302' },
      { id: 'art',      label: 'Art',      glyph: '\u25C6' },
      { id: 'pipeline', label: 'Pipeline', glyph: '\u2699' },
      { id: 'about',    label: 'About',    glyph: '\u2617' },
      { id: 'contact',  label: 'Contact',  glyph: '\u2709' }
    ]
  };
})();
