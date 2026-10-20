'use strict';
(function () {
  var GEN = 1, MAXDIG = 5000, CH = 356, GAP = 16, RH = CH + GAP, N = 30, K = 8, BUF = 8, ANCH = 12;
  var $ = function (s) { return document.querySelector(s); };
  var feed = $('#feed'), pv = $('#pv'), pvc = $('#pvc'), sr = $('#sr'), si = $('#si'), ss = $('#ss'), sl = $('#sl'), counter = $('#counter');

  // ---------- deterministic engine ----------
  function hash(s) {
    var a = 0xdeadbeef ^ GEN, b = 0x41c6ce57, c = 0x9e3779b9, d = 0x85ebca6b;
    for (var i = 0; i < s.length; i++) {
      var k = s.charCodeAt(i);
      a = Math.imul(a ^ k, 2654435761); b = Math.imul(b ^ k, 1597334677);
      c = Math.imul(c ^ k, 2246822507); d = Math.imul(d ^ k, 3266489909);
    }
    a = Math.imul(c ^ (a >>> 18), 2246822507); b = Math.imul(d ^ (b >>> 22), 3266489909);
    c = Math.imul(a ^ (c >>> 17), 2654435761); d = Math.imul(b ^ (d >>> 19), 1597334677);
    return [(a ^ b ^ c ^ d) >>> 0, (b ^ a) >>> 0, (c ^ a) >>> 0, (d ^ a) >>> 0];
  }
  function sfc32(a, b, c, d) {
    return function () {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0;
      c = (c << 21 | c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0;
      return (t >>> 0) / 4294967296;
    };
  }
  var L = {
    on: ['b','d','f','g','h','k','l','m','n','r','s','t','v','z','th','kr','sh','vr','ael','ys','qu','dr'],
    vo: ['a','e','i','o','u','ae','ei','ia','ou','y'],
    co: ['','','n','r','s','l','x','m','k','th','sh'],
    sx: ['-vane','-kross','-holt','-morrow','-sable','-thorne','-lace','-veil','','','',''],
    tier: ['Wandering','Dormant','Sovereign','Fractured','Luminous','Hollow','Veiled','Ascendant'],
    kind: ['Archivist','Cartographer','Oracle','Smith','Envoy','Dreamer','Sentinel','Cipher','Alchemist','Navigator','Mimic','Chronicler'],
    tr: ['patient','restless','dryly funny','guarded','tender','relentless','curious','stoic','theatrical','nocturnal','precise','impulsive','warm','skeptical','devoted','evasive','radiant','blunt','dreamy','meticulous','fearless','wistful','playful','austere','loyal','secretive','inventive','calm','stubborn','observant','gentle','restive','ironic','proud','humble','vigilant'],
    pl: ['a drowned observatory','a tram line that no longer runs','the salt flats of Orrin','a lighthouse with no sea','the lower archives','a city built on a bell','a glass orchard','the third moon dock','a village of clockmakers','a quiet canyon','a floating market','a vacant cathedral','the last reading room','a harbor of mirrors','a fog-bound ridge','an abandoned relay station','a night train','a cliffside library','the violet district','a tidal monastery','a stairwell without a top','a greenhouse in orbit','a market under ice','a lantern town'],
    jb: ['a lock-keeper of lost doors','a translator of silences','a mapmaker of rooms that moved','a repairer of old radios','a night-shift archivist','a courier between dimensions','a tuner of church bells','a collector of unfinished letters','a gardener of strange moss','a forger of harmless maps','a keeper of other people\u2019s promises','a pilot of small ferries','a cook for travelers who never arrive','a clerk in the office of coincidences','a sculptor of smoke','an appraiser of dreams'],
    ob: ['collecting the sound of rain on different roofs','finding the exact center of every city','memorizing the faces of strangers','rebuilding a song from one remembered note','charting stars that only appear in puddles','sorting every color into a private order','writing letters to a future self','learning every language\u2019s word for home'],
    sc: ['keeps a door in a wall that no one else can see','once swapped names with a stranger for a year','has never told the truth about their age','hears a second heartbeat when it rains','carries a key to a lock they have not found','is quietly afraid of long hallways','left a different life behind on purpose','writes in a code only one other identity can read'],
    q1: ['Every door remembers','I am what stays','Nothing is lost','Silence is a language','The map is not the road','Light bends around the brave','Even echoes need a first voice','Time is generous to the patient'],
    q2: ['if you knock softly.','when no one is watching.','longer than you expect.','and so do I.','once you stop counting.','between one breath and the next.','so I keep walking.','and that is enough.'],
    ey: ['violet-ringed','crimson-flecked','mirror-dark','pale silver','ink-black','storm-grey','deep indigo','garnet'],
    mk: ['a thin scar over the left brow','a constellation of freckles','a faint circuit-like tattoo','a notch in one ear','a streak of white hair','ink-stained fingertips','a silver tooth','a crescent birthmark'],
    au: ['hushed','magnetic','static-edged','slow-burning','cold and clear','low and humming','restless','velvet'],
    ob2: ['a brass compass that points inward','a folded paper star','a cracked pocket watch','a jar of night air','a tiny tuning fork','a coin from no known country','a ribbon of old film','a lantern with no flame']
  };
  var cache = new Map();
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function norm(id) {
    id = String(id).trim();
    if (!/^[0-9]+$/.test(id)) throw new Error('Identity must be a positive whole number.');
    id = id.replace(/^0+/, '');
    if (!id) throw new Error('Identities start at 1.');
    return id;
  }
  function gen(id, nocache) {
    id = norm(id);
    if (!nocache && cache.has(id)) return cache.get(id);
    var h = hash(id), r = sfc32(h[0], h[1], h[2], h[3]); for (var w = 0; w < 8; w++) r();
    var pk = function (a) { return a[Math.floor(r() * a.length)]; };
    var syl = function () { return pk(L.on) + pk(L.vo); };
    var first = cap(syl() + syl() + (r() < .4 ? syl() : '') + pk(L.co));
    var last = cap(syl() + syl()) + pk(L.sx);
    var traits = [], t; while (traits.length < 3) { t = pk(L.tr); if (traits.indexOf(t) < 0) traits.push(t); }
    var s1 = [first + ' was born in ' + pk(L.pl) + ' and works as ' + pk(L.jb) + '.',
      'Raised near ' + pk(L.pl) + ', ' + first + ' became ' + pk(L.jb) + '.',
      'Few know that ' + first + ', ' + pk(L.jb) + ', first appeared in ' + pk(L.pl) + '.'][Math.floor(r() * 3)];
    var s2 = ['Most days are spent ' + pk(L.ob) + '.', first + ' is happiest ' + pk(L.ob) + '.', 'An old habit remains: ' + pk(L.ob) + '.'][Math.floor(r() * 3)];
    var s3 = first + ' ' + pk(L.sc) + '.';
    var pool = [258, 266, 274, 282, 292, 300, 340, 350, 355], h1 = pool[Math.floor(r() * 9)] + Math.floor(r() * 8), h2 = pool[Math.floor(r() * 9)] + Math.floor(r() * 8);
    var p = {
      id: id, name: first + ' ' + last, cls: pk(L.tier) + ' ' + pk(L.kind), traits: traits,
      persona: cap(traits[0]) + ', ' + traits[1] + ', ' + traits[2],
      bio1: s1 + ' ' + s2, bio: s1 + ' ' + s2 + ' ' + s3,
      quote: '\u201C' + pk(L.q1) + ' ' + pk(L.q2) + '\u201D',
      feat: [['Eyes', pk(L.ey)], ['Aura', pk(L.au)], ['Mark', pk(L.mk)], ['Carries', pk(L.ob2)]],
      vis: { h1: h1, h2: h2, ang: Math.floor(r() * 360), rings: 1 + Math.floor(r() * 4), cx: 30 + Math.floor(r() * 40), cy: 30 + Math.floor(r() * 30),
        hw: 15 + Math.floor(r() * 6), hh: 18 + Math.floor(r() * 6), eye: Math.floor(r() * 4), crest: Math.floor(r() * 3) }
    };
    if (!nocache) { if (cache.size > 600) cache.delete(cache.keys().next().value); cache.set(id, p); }
    return p;
  }
  function avatar(p) {
    var v = p.vis, s = '<span class="av" style="background:linear-gradient(' + v.ang + 'deg,hsl(' + v.h1 + ' 55% 14%),hsl(' + v.h2 + ' 60% 24%))"><svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    for (var i = 0; i < v.rings; i++) s += '<circle cx="' + v.cx + '" cy="' + v.cy + '" r="' + (18 + i * 11) + '" fill="none" stroke="hsl(' + v.h2 + ' 70% 60% / .3)" stroke-width=".6"/>';
    s += '<path d="M8 100C14 74 34 68 50 68S86 74 92 100Z" fill="hsl(' + v.h1 + ' 35% 9%)"/>';
    if (v.crest === 1) s += '<path d="M50 14L58 30H42Z" fill="hsl(' + v.h2 + ' 70% 50% / .7)"/>';
    if (v.crest === 2) s += '<path d="M30 40Q50 6 70 40" fill="none" stroke="hsl(' + v.h2 + ' 70% 60% / .7)" stroke-width="1.5"/>';
    s += '<ellipse cx="50" cy="46" rx="' + v.hw + '" ry="' + v.hh + '" fill="hsl(' + v.h1 + ' 25% 12%)" stroke="hsl(' + v.h2 + ' 70% 55% / .6)" stroke-width="1"/>';
    var e = 'hsl(' + v.h2 + ' 90% 72%)';
    if (v.eye === 0) s += '<circle cx="43" cy="46" r="2.4" fill="' + e + '"/><circle cx="57" cy="46" r="2.4" fill="' + e + '"/>';
    else if (v.eye === 1) s += '<rect x="38" y="43" width="24" height="5" rx="2.5" fill="' + e + '"/>';
    else if (v.eye === 2) s += '<circle cx="50" cy="46" r="4.5" fill="none" stroke="' + e + '" stroke-width="1.5"/>';
    else s += '<circle cx="42" cy="48" r="1.6" fill="' + e + '"/><circle cx="50" cy="42" r="1.6" fill="' + e + '"/><circle cx="58" cy="48" r="1.6" fill="' + e + '"/>';
    return s + '</svg></span>';
  }
  function card(id) {
    var p = gen(id);
    return '<button class="card" data-id="' + id + '" aria-label="Open profile ' + p.name + '">' + avatar(p) + '<span class="cb"><span class="cl">' + p.cls + '</span><span class="cn">' + p.name + '</span><span class="ci">#' + id + '</span><span class="cp">' + p.persona + '</span><span class="cbio">' + p.bio1 + '</span></span></button>';
  }

  // ---------- windowed infinite feed ----------
  var cols = 2, baseRow = 0n, busy = false, queued = false;
  function measure() {
    var w = innerWidth; cols = w >= 1100 ? 4 : w >= 720 ? 3 : w >= 380 ? 2 : 1;
    var st = document.documentElement.style; st.setProperty('--cols', cols); st.setProperty('--ch', CH + 'px'); st.setProperty('--gap', GAP + 'px');
  }
  function row(r) {
    var d = document.createElement('div'), h = '', c, b = BigInt(cols);
    d.className = 'row';
    for (c = 0; c < cols; c++) h += card((r * b + BigInt(c) + 1n).toString());
    d.innerHTML = h; return d;
  }
  function topId() {
    var i = Math.max(0, Math.floor((scrollY - feed.offsetTop + 70) / RH));
    return ((baseRow + BigInt(i)) * BigInt(cols) + 1n).toString();
  }
  function build(id) {
    measure(); id = norm(id);
    var ar = (BigInt(id) - 1n) / BigInt(cols);
    baseRow = ar > BigInt(ANCH) ? ar - BigInt(ANCH) : 0n;
    var f = document.createDocumentFragment();
    for (var i = 0; i < N; i++) f.appendChild(row(baseRow + BigInt(i)));
    feed.textContent = ''; feed.appendChild(f);
    scrollTo(0, id === '1' ? 0 : feed.offsetTop + Number(ar - baseRow) * RH - 80);
    upd();
  }
  function pump() {
    queued = false;
    if (busy || !feed.firstChild) return;
    busy = true; var moved = false;
    try {
      var top = scrollY - feed.offsetTop, bot = top + innerHeight, n = feed.children.length, i, f;
      if (bot > (n - BUF) * RH) {
        f = document.createDocumentFragment();
        for (i = 0; i < K; i++) f.appendChild(row(baseRow + BigInt(n + i)));
        feed.appendChild(f);
        for (i = 0; i < K; i++) feed.removeChild(feed.firstChild);
        baseRow += BigInt(K); scrollBy(0, -K * RH); moved = true;
      } else if (top < BUF * RH && baseRow > 0n) {
        var k = baseRow < BigInt(K) ? Number(baseRow) : K;
        f = document.createDocumentFragment();
        for (i = k; i >= 1; i--) f.appendChild(row(baseRow - BigInt(i)));
        feed.insertBefore(f, feed.firstChild);
        for (i = 0; i < k; i++) feed.removeChild(feed.lastChild);
        baseRow -= BigInt(k); scrollBy(0, k * RH); moved = true;
      }
    } catch (e) { console.error('VEXORANT batch failed, will retry', e); }
    busy = false;
    if (moved) { document.body.classList.add('gen'); setTimeout(function () { document.body.classList.remove('gen'); }, 200); req(); }
    upd();
  }
  function req() { if (!queued) { queued = true; requestAnimationFrame(pump); } }
  function upd() { counter.textContent = '#' + (pv.hidden ? topId() : view); }
  addEventListener('scroll', req, { passive: true });
  setInterval(req, 400); // heartbeat fallback: generation never depends on a single trigger
  document.addEventListener('visibilitychange', req);
  var rt; addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(function () { var id = topId(), oc = cols; measure(); if (cols !== oc) build(id); else req(); }, 150);
  });

  // ---------- profile view ----------
  var view = '1', origin = '1';
  function rel(id) { return '<button data-id="' + id + '">#' + id + '</button>'; }
  function show(id) {
    id = norm(id); view = id;
    var p = gen(id), b = BigInt(id), prev = b > 1n ? (b - 1n).toString() : '', next = (b + 1n).toString();
    var echo1 = (b + BigInt(1 + parseInt(hash(id)[1] % 9973))).toString(), echo2 = (b * 2n).toString();
    pvc.innerHTML = '<div class="pav">' + avatar(p) + '</div><h2 class="pn">' + p.name + '</h2><div class="pid">Identity #' + id + '</div>' +
      '<div class="chips"><span>' + p.cls + '</span>' + p.traits.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
      '<h3>Biography</h3><p>' + p.bio + '</p><h3>Distinctive characteristics</h3><dl>' + p.feat.map(function (f) { return '<dt>' + f[0] + '</dt><dd>' + f[1] + '</dd>'; }).join('') + '</dl>' +
      '<h3>Quote</h3><p class="q">' + p.quote + '</p><h3>Related identities</h3><div class="rel">' + rel(echo1) + rel(echo2) + '</div>' +
      '<div class="nav"><button data-id="' + prev + '"' + (prev ? '' : ' disabled') + '>Previous</button><button data-id="' + next + '">Next</button></div>';
    pv.hidden = false; pv.scrollTop = 0; $('#pvx').focus(); upd();
  }
  function open(id) { origin = norm(id); history.pushState({ pv: 1, pushed: 1 }, '', '#/id/' + origin); show(origin); }
  function go(id) { id = norm(id); history.replaceState({ pv: 1, pushed: history.state && history.state.pushed }, '', '#/id/' + id); show(id); }
  function hide() { pv.hidden = true; if (view !== origin) { origin = view; build(view); } upd(); }
  function close() {
    if (history.state && history.state.pushed) history.back();
    else { history.replaceState(null, '', location.pathname + location.search); hide(); }
  }
  feed.addEventListener('click', function (e) { var c = e.target.closest('.card'); if (c) open(c.dataset.id); });
  pvc.addEventListener('click', function (e) { var b = e.target.closest('button[data-id]'); if (b && b.dataset.id) go(b.dataset.id); });
  $('#pvx').addEventListener('click', close);
  addEventListener('popstate', function () {
    var m = /^#\/id\/(\d+)$/.exec(location.hash);
    if (m && m[1].length <= MAXDIG) { if (pv.hidden) origin = topId(); show(m[1]); } else if (!pv.hidden) hide();
  });

  // ---------- search ----------
  var tok = 0;
  function openSearch() { sr.hidden = false; si.focus(); }
  function closeSearch() { tok++; sr.hidden = true; }
  $('#sbtn').addEventListener('click', openSearch); $('#sx').addEventListener('click', closeSearch);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!sr.hidden) closeSearch(); else if (!pv.hidden) close(); } });
  function scan(q, from, count) {
    var my = ++tok, pos = from, end = from + BigInt(count), found = [];
    sl.textContent = ''; ss.textContent = 'Scanning\u2026';
    (function step() {
      if (my !== tok) return;
      var lim = pos + 400n < end ? pos + 400n : end;
      for (; pos < lim; pos++) { if (gen(pos.toString(), true).name.toLowerCase().indexOf(q) >= 0 && found.length < 30) { found.push(pos.toString()); sl.insertAdjacentHTML('beforeend', '<button data-id="' + pos + '">' + gen(pos.toString()).name + ' \u2014 #' + pos + '</button>'); } }
      if (pos < end) { ss.textContent = 'Scanning identities ' + from + ' to ' + (pos - 1n) + '\u2026 ' + found.length + ' match(es)'; setTimeout(step, 0); }
      else ss.innerHTML = 'Scanned identities ' + from + ' to ' + (end - 1n) + ': ' + found.length + ' match(es). Name search covers only this range, not the whole universe. <button type="button" id="more">Scan next ' + count + '</button>';
      var m = $('#more'); if (m) m.onclick = function () { scan(q, end, count); };
    })();
  }
  sl.addEventListener('click', function (e) { var b = e.target.closest('button[data-id]'); if (b) { closeSearch(); build(b.dataset.id); open(b.dataset.id); } });
  $('#sf').addEventListener('submit', function (e) {
    e.preventDefault(); var v = si.value.trim(); sl.textContent = ''; if (!v) return;
    if (/^\d+$/.test(v)) {
      if (v.length > MAXDIG) { ss.textContent = 'That number has ' + v.length + ' digits. The safety limit is ' + MAXDIG + ' digits; nothing was truncated.'; return; }
      var id; try { id = norm(v); } catch (x) { ss.textContent = x.message; return; }
      closeSearch(); build(id); open(id);
    } else {
      var c = BigInt(topId()), s = c > 10000n ? c - 10000n : 1n;
      scan(v.toLowerCase(), s, 20000);
    }
  });

  // ---------- start ----------
  measure();
  var m0 = /^#\/id\/(\d+)$/.exec(location.hash);
  if (m0 && m0[1].length <= MAXDIG) { origin = norm(m0[1]); build(origin); show(origin); } else build('1');
  req();
})();
