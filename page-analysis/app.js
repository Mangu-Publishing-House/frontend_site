(function () {
  const pages = window.MANGU_PAGES || [];
  const side = document.getElementById('side');
  const main = document.getElementById('main');
  const params = new URLSearchParams(location.search);
  const current = params.get('p') || (location.hash || '').replace(/^#/, '') || '';

  function noteKey(id) {
    return 'mangu-page-notes:' + id;
  }
  function featKey(id) {
    return 'mangu-page-feats:' + id;
  }

  const groups = [];
  pages.forEach((p) => {
    if (!groups.includes(p.group)) groups.push(p.group);
  });

  function navHtml(filter) {
    const q = (filter || '').toLowerCase();
    let html =
      '<h1>MANGU pages</h1><p class="meta">62 routes from my_publishing · analysis canvases</p>' +
      '<input class="search" id="q" placeholder="Filter routes…" value="' +
      (filter || '').replace(/"/g, '&quot;') +
      '" />';
    groups.forEach((g) => {
      const items = pages.filter(
        (p) =>
          p.group === g &&
          (!q ||
            p.route.toLowerCase().includes(q) ||
            p.id.includes(q) ||
            p.file.toLowerCase().includes(q))
      );
      if (!items.length) return;
      html += '<div class="group"><h2>' + g + '</h2><nav class="nav">';
      items.forEach((p) => {
        html +=
          '<a href="?p=' +
          encodeURIComponent(p.id) +
          '" class="' +
          (p.id === current ? 'active' : '') +
          '">' +
          p.route +
          '<span class="badge">' +
          p.status +
          '</span></a>';
      });
      html += '</nav></div>';
    });
    return html;
  }

  function pill(p) {
    const cls =
      p.status === 'off'
        ? 'off'
        : p.status === 'flagged'
          ? 'flag'
          : p.status === 'live'
            ? 'live'
            : '';
    return (
      '<span class="pill ' +
      cls +
      '">' +
      p.status +
      '</span><span class="pill auth">' +
      p.auth +
      '</span><span class="pill">' +
      p.group +
      '</span>'
    );
  }

  function renderHome() {
    main.innerHTML =
      '<p class="crumb">my_publishing / page-analysis</p>' +
      '<h2 class="page-title">Analyze every page</h2>' +
      '<p class="src">Source: App Router page.tsx files on main @ cb3950c7. Open a tile, check features, type notes — saved in this browser only.</p>' +
      '<div class="home-grid" style="margin-top:18px">' +
      pages
        .map(
          (p) =>
            '<a class="tile" href="?p=' +
            encodeURIComponent(p.id) +
            '"><div class="r">' +
            p.route +
            '</div><div>' +
            p.group +
            ' · ' +
            p.status +
            '</div></a>'
        )
        .join('') +
      '</div>';
  }

  function renderPage(p) {
    const savedNotes = localStorage.getItem(noteKey(p.id)) || '';
    let savedFeats = {};
    try {
      savedFeats = JSON.parse(localStorage.getItem(featKey(p.id)) || '{}');
    } catch (e) {}
    const blocks = (p.blocks || [])
      .map((b, i) => {
        const cls = i === 0 ? 'block hero' : 'block';
        return '<div class="' + cls + '">' + b + '</div>';
      })
      .join('');
    const feats = (p.features || [])
      .map((f, i) => {
        const checked = savedFeats[i] ? ' checked' : '';
        return (
          '<label class="feat"><input type="checkbox" data-i="' +
          i +
          '"' +
          checked +
          ' /> <span>' +
          f +
          '</span></label>'
        );
      })
      .join('');
    main.innerHTML =
      '<p class="crumb"><a href="index.html">All pages</a> / ' +
      p.group +
      '</p>' +
      '<div class="page-title">' +
      p.route +
      '</div>' +
      '<div class="src">' +
      p.file +
      '</div>' +
      '<div class="pills">' +
      pill(p) +
      '</div>' +
      '<div class="grid">' +
      '<section class="card"><h3>Now in code</h3><p>' +
      p.now +
      '</p></section>' +
      '<section class="card"><h3>Wireframe blocks</h3><div class="wire">' +
      blocks +
      '</div></section>' +
      '</div>' +
      '<section class="card"><h3>Add features</h3>' +
      feats +
      '</section>' +
      '<section class="card"><h3>Notes for this page</h3>' +
      '<textarea class="notes" id="notes" placeholder="What to ship on this route…">' +
      savedNotes.replace(/</g, '&lt;') +
      '</textarea></section>';

    const ta = document.getElementById('notes');
    ta.addEventListener('input', () => localStorage.setItem(noteKey(p.id), ta.value));
    main.querySelectorAll('input[type=checkbox][data-i]').forEach((box) => {
      box.addEventListener('change', () => {
        savedFeats[box.getAttribute('data-i')] = box.checked;
        localStorage.setItem(featKey(p.id), JSON.stringify(savedFeats));
      });
    });
  }

  function draw(filter) {
    side.innerHTML = navHtml(filter);
    const input = document.getElementById('q');
    input.addEventListener('input', () => draw(input.value));
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  draw('');
  const page = pages.find((p) => p.id === current);
  if (page) renderPage(page);
  else renderHome();
})();
