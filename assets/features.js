/* Atkinson Library: features (skills, search, listen, notes, highlights, my library, offline) */
(function () {
'use strict';
var root = document.body.getAttribute('data-root') || '';
function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
function jget(k, d) { try { var v = JSON.parse(get(k)); return v == null ? d : v; } catch (e) { return d; } }
function jset(k, v) { set(k, JSON.stringify(v)); }
function el(t, c, txt) { var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function tog(d, open) { if (window.alToggle) window.alToggle(d, open); else d.open = open === undefined ? !d.open : open; }

if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register(root + 'sw.js').catch(function () {});

/* ---------- library views ---------- */
(function () {
  var segs = $$('.seg'); if (!segs.length) return;
  function show(v) { segs.forEach(function (b) { b.classList.toggle('on', b.dataset.view === v); }); ['theme', 'pen', 'az'].forEach(function (k) { var e = document.getElementById('view-' + k); if (e) e.hidden = k !== v; }); set('al-libview', v); }
  segs.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.view); }); });
  show(get('al-libview') || 'theme');
  if (location.hash && document.getElementById(location.hash.slice(1))) show('theme');
})();

/* ---------- ideas filter ---------- */
(function () {
  var q = document.getElementById('iq'); if (!q) return;
  q.addEventListener('input', function () { var v = q.value.toLowerCase().trim(); $$('.idea').forEach(function (d) { d.hidden = v && d.dataset.name.indexOf(v) < 0; }); });
})();

/* ---------- skills page ---------- */
(function () {
  var L = document.getElementById('sklist'); if (!L) return;
  var items = $$('li.skill', L), P = window.SKP || [], pmap = {}; P.forEach(function (p) { pmap[p.k] = p; });
  var q = $('#sq2'), lv = $('#sl2'), bk = $('#sb2'), od = $('#so2'), pn = $('#spn'), cnt = $('#skn2'), purpose = '';
  var openG = {}; var practice = jget('al-practice', []);
  function passes(li) {
    if (purpose && li.dataset.purposes.split(' ').indexOf(purpose) < 0) return false;
    if (lv.value !== '' && li.dataset.level !== lv.value) return false;
    if (bk.value && li.dataset.book !== bk.value) return false;
    if (pn.checked && li.dataset.partner === '1') return false;
    var v = q.value.toLowerCase().trim(); if (v && li.textContent.toLowerCase().indexOf(v) < 0) return false;
    return true;
  }
  function sorter(m) {
    return function (a, b) {
      if (m === 'title') return a.dataset.title.localeCompare(b.dataset.title);
      if (m === 'short') return a.dataset.words - b.dataset.words;
      if (m === 'long') return b.dataset.words - a.dataset.words;
      if (m === 'level') return a.dataset.level - b.dataset.level || a.dataset.order - b.dataset.order;
      return a.dataset.order - b.dataset.order;
    };
  }
  function group(key, name, desc, list, idx) {
    var li = el('li', 'pgroup'), d = el('details', 'tg pg'), s = el('summary'), body = el('div', 'tgb'), ol = el('ol', 'pl');
    li.style.setProperty('--c', ['#ffc233', '#19e6d4', '#a98bff', '#ff4da0', '#4da8ff', '#42ff8e'][idx % 6]);
    s.innerHTML = '<span class="pmark" aria-hidden="true"><b>' + list.length + '</b></span><span class="ptext"><span class="ptitle">' + esc(name) + '</span><span class="pdesc">' + esc(desc) + '</span></span><span class="pplus" aria-hidden="true"></span>';
    d.appendChild(s); body.appendChild(ol); d.appendChild(body); li.appendChild(d);
    list.forEach(function (x, i) { x.style.setProperty('--i', i); ol.appendChild(x); });
    d.open = !!openG[key] || !!q.value.trim();
    d.addEventListener('toggle', function () { openG[key] = d.open; });
    return li;
  }
  function render() {
    var m = od.value, vis = items.filter(passes).sort(sorter(m === 'purpose' || m === 'book' ? 'order' : m));
    while (L.firstChild) L.removeChild(L.firstChild);
    if (m === 'purpose') {
      P.forEach(function (p, i) { var l = vis.filter(function (x) { return x.dataset.purpose === p.k; }); if (l.length) L.appendChild(group('p' + p.k, p.n, p.d, l, i)); });
    } else if (m === 'book') {
      var seen = {}, order = []; vis.sort(function (a, b) { return a.dataset.order - b.dataset.order; }).forEach(function (x) { var b = x.dataset.book; if (!seen[b]) { seen[b] = []; order.push(b); } seen[b].push(x); });
      order.forEach(function (b, i) { L.appendChild(group('b' + b, b, 'Techniques from this book, in the order they appear.', seen[b], i)); });
    } else vis.forEach(function (x) { x.style.setProperty('--i', 0); L.appendChild(x); });
    cnt.textContent = vis.length + ' technique' + (vis.length === 1 ? '' : 's') + ' shown';
    $$('.pchip').forEach(function (c) { c.classList.toggle('on', c.dataset.p === purpose); });
  }
  [q, lv, bk, od, pn].forEach(function (e) { e.addEventListener('input', render); e.addEventListener('change', render); });
  $$('.pchip').forEach(function (c) { c.addEventListener('click', function () { purpose = c.dataset.p; if (purpose) openG['p' + purpose] = true; render(); }); });
  $('#sx2').addEventListener('click', function () { $$('details', L).forEach(function (d, i) { setTimeout(function () { tog(d, true); }, Math.min(i, 14) * 25); }); });
  $('#sc2').addEventListener('click', function () { $$('details[open]', L).reverse().forEach(function (d) { tog(d, false); }); });
  L.addEventListener('click', function (e) {
    var b = e.target.closest('.addp'); if (!b) return; var id = b.dataset.id, k = practice.indexOf(id);
    if (k < 0) practice.push(id); else practice.splice(k, 1); jset('al-practice', practice); paintAdd();
  });
  function paintAdd() { $$('.addp', L).forEach(function (b) { var on = practice.indexOf(b.dataset.id) > -1; b.setAttribute('aria-pressed', on); b.textContent = on ? 'In my practice (remove)' : 'Add to my practice'; b.classList.toggle('on', on); }); }
  var pb = new URLSearchParams(location.search).get('b'); if (pb) bk.value = pb;
  var h = location.hash.slice(1);
  render(); paintAdd();
  if (h) { var t = document.getElementById(h); if (t) { var g = t.closest('.pg'); if (g) g.open = true; var d = t.querySelector('details'); if (d) d.open = true; setTimeout(function () { t.scrollIntoView({ block: 'start' }); }, 200); } }
})();

/* ---------- search ---------- */
(function () {
  var f = document.getElementById('sf2'); if (!f) return;
  var inp = $('#q2'), out = $('#res2'), st = $('#st2'), more = $('#more2'), cache = {}, dec = {}, state = null;
  function words(k) { if (dec[k]) return dec[k]; var ids = [], cs = [], last = 0; window.IDX.w[k].split(',').forEach(function (x) { var p = x.split('.'); last += parseInt(p[0], 36); ids.push(last); cs.push(parseInt(p[1], 36)); }); return dec[k] = { ids: ids, cs: cs }; }
  function parse(q) {
    var phrases = [], rest = q.replace(/"([^"]+)"/g, function (m, p) { phrases.push(p.toLowerCase().trim()); return ' '; });
    var terms = rest.toLowerCase().split(/\s+/).filter(function (t) { return t.length >= 3; });
    phrases.forEach(function (p) { p.split(/\s+/).forEach(function (w) { if (w.length >= 3) terms.push(w); }); });
    return { phrases: phrases, terms: terms.filter(function (t, i) { return terms.indexOf(t) === i; }) };
  }
  function candidates(p) {
    var W = Object.keys(window.IDX.w), N = window.IDX.c.length, per = [];
    p.terms.forEach(function (t) {
      var m = {}; if (t.length < 4) { /* too short to index: skip as a filter */ per.push(null); return; }
      W.forEach(function (k) { if (k.indexOf(t) === 0) { var w = words(k), idf = Math.log(N / (w.ids.length + 1)) + 1; for (var i = 0; i < w.ids.length; i++) m[w.ids[i]] = (m[w.ids[i]] || 0) + idf * Math.log(1 + w.cs[i]); } });
      per.push(m);
    });
    var real = per.filter(Boolean); if (!real.length) return [];
    var ids = Object.keys(real[0]).filter(function (i) { return real.every(function (m) { return m[i]; }); });
    return ids.map(function (i) {
      var s = 0, c = window.IDX.c[i], ttl = (c[2] + ' ' + c[3]).toLowerCase();
      real.forEach(function (m) { s += m[i]; }); p.terms.forEach(function (t) { if (ttl.indexOf(t) > -1) s += 4; });
      return { id: +i, s: s };
    }).sort(function (a, b) { return b.s - a.s; });
  }
  function text(url) {
    if (cache[url]) return cache[url];
    return cache[url] = fetch(url).then(function (r) { return r.text(); }).then(function (h) { var d = new DOMParser().parseFromString(h, 'text/html'); var p = d.querySelector('.prose'); return p ? p.textContent.replace(/\s+/g, ' ').trim() : ''; }).catch(function () { return ''; });
  }
  function snippet(t, p) {
    var sents = t.split(/(?<=[.!?])\s+/), best = '', bs = -1, low;
    sents.forEach(function (s) { low = s.toLowerCase(); var sc = 0; p.terms.forEach(function (x) { if (low.indexOf(x) > -1) sc++; }); p.phrases.forEach(function (x) { if (low.indexOf(x) > -1) sc += 3; }); if (sc > bs) { bs = sc; best = s; } });
    if (best.length > 280) { var i = Math.max(0, best.toLowerCase().indexOf(p.terms[0] || '') - 100); best = (i ? '...' : '') + best.slice(i, i + 260) + '...'; }
    return best;
  }
  function mark(s, p) {
    var h = esc(s), all = p.terms.concat(p.phrases).sort(function (a, b) { return b.length - a.length; });
    all.forEach(function (x) { h = h.replace(new RegExp('(' + x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\w*)', 'gi'), '<mark>$1</mark>'); });
    return h;
  }
  function showMore() {
    var made = 0, st_ = state;
    function next() {
      if (made >= 10 || st_.pos >= st_.list.length) { more.hidden = st_.pos >= st_.list.length; if (!made && !out.children.length) st.textContent = 'No chapters match. Try a shorter word or remove the quotes.'; return; }
      var r = st_.list[st_.pos++], c = window.IDX.c[r.id], url = root + 'b/' + c[0] + '/' + c[1] + '.html';
      text(url).then(function (t) {
        if (st_ !== state) return;
        if (st_.p.phrases.length && !st_.p.phrases.every(function (x) { return t.toLowerCase().indexOf(x) > -1; })) return next();
        made++; var li = el('li'), a = el('a', null, c[2]); a.href = url + '?q=' + encodeURIComponent(st_.q.replace(/"/g, ''));
        var sp = el('span', 'rmeta', c[3] + ', chapter ' + c[1]), sn = el('p', 'rsnip'); sn.innerHTML = mark(snippet(t, st_.p), st_.p);
        li.appendChild(a); li.appendChild(sp); li.appendChild(sn); out.appendChild(li); next();
      });
    }
    next();
  }
  function run(q) {
    q = q.trim(); out.innerHTML = ''; more.hidden = true;
    if (!window.IDX) { st.textContent = 'Loading the index. Try again in a moment.'; return; }
    var p = parse(q); if (!p.terms.length) { st.textContent = 'Type at least three letters.'; return; }
    var list = candidates(p); state = { q: q, p: p, list: list, pos: 0 };
    st.textContent = list.length ? list.length + ' chapter' + (list.length > 1 ? 's' : '') + ' match, best first' + (p.phrases.length ? ' (phrase checked as results load)' : '') : 'No chapters match. Try a shorter word.';
    if (list.length) showMore();
  }
  f.addEventListener('submit', function (e) { e.preventDefault(); history.replaceState(null, '', '?q=' + encodeURIComponent(inp.value)); run(inp.value); });
  more.addEventListener('click', showMore);
  var u = new URLSearchParams(location.search).get('q'); if (u) { inp.value = u; var go = function () { run(u); }; if (window.IDX) go(); else window.addEventListener('load', go); }
})();

/* ---------- chapter: bookmark, notes, listen, highlights ---------- */
(function () {
  var ch = $('.chapter'); if (!ch) return;
  var slug = ch.dataset.book, num = +ch.dataset.n, prose = $('.prose', ch);
  /* bookmark */
  var bm = $('#bm');
  function bmList() { return jget('al-bm', []); }
  function bmPaint() { var on = bmList().some(function (x) { return x.b === slug && x.n === num; }); bm.setAttribute('aria-pressed', on); bm.textContent = on ? 'Bookmarked' : 'Bookmark'; bm.classList.toggle('on', on); }
  bm.addEventListener('click', function () {
    var l = bmList(), k = -1; l.forEach(function (x, i) { if (x.b === slug && x.n === num) k = i; });
    if (k > -1) l.splice(k, 1); else l.push({ b: slug, n: num, bt: ch.dataset.btitle, ct: ch.dataset.ctitle, ts: Date.now() });
    jset('al-bm', l); bmPaint();
  }); bmPaint();
  /* notes */
  var ta = $('#cnote'), nk = 'al-note-' + slug + '-' + num, ns = $('#nstat'), tm;
  if (ta) { ta.value = get(nk) || ''; if (ta.value) ns.textContent = 'has a note'; ta.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(function () { if (ta.value.trim()) set(nk, ta.value); else { try { localStorage.removeItem(nk); } catch (e) {} } ns.textContent = ta.value.trim() ? 'saved' : ''; }, 400); }); }
  /* listen */
  var lb = $('#listen'), lp = $('#lpanel');
  if (lb && 'speechSynthesis' in window) {
    var syn = window.speechSynthesis, blocks = $$('p, li, summary h3', prose), idx = 0, token = 0, playing = false;
    var play = $('#lplay'), stop = $('#lstop'), rate = $('#lrate'), vs = $('#lvoice'), ls = $('#lstat');
    rate.value = get('al-rate') || '1';
    function voices() { var v = syn.getVoices().filter(function (x) { return /^en/i.test(x.lang); }); vs.innerHTML = ''; v.forEach(function (x, i) { var o = el('option', null, x.name); o.value = x.name; vs.appendChild(o); }); var saved = get('al-voice'); if (saved) vs.value = saved; }
    voices(); if (syn.onvoiceschanged !== undefined) syn.onvoiceschanged = voices;
    function clear() { blocks.forEach(function (b) { b.classList.remove('speaking'); }); }
    function say(i) {
      var my = ++token; syn.cancel(); clear();
      if (i >= blocks.length) { playing = false; play.textContent = 'Play'; ls.textContent = 'Finished. Use Next chapter below.'; return; }
      idx = i; var b = blocks[i], t = b.textContent.replace(/\s+/g, ' ').trim();
      if (!t) return say(i + 1);
      var u = new SpeechSynthesisUtterance(t); u.rate = parseFloat(rate.value) || 1;
      var v = syn.getVoices().filter(function (x) { return x.name === vs.value; })[0]; if (v) { u.voice = v; u.lang = v.lang; }
      u.onend = function () { if (my === token && playing) say(i + 1); };
      u.onerror = function () { if (my === token && playing) { playing = false; play.textContent = 'Play'; } };
      b.classList.add('speaking'); b.scrollIntoView({ block: 'center', behavior: 'smooth' }); ls.textContent = 'Reading ' + (i + 1) + ' of ' + blocks.length;
      syn.speak(u);
    }
    lb.addEventListener('click', function () { var o = lp.hidden; lp.hidden = !o; lb.setAttribute('aria-expanded', o); });
    play.addEventListener('click', function () {
      if (playing && !syn.paused) { syn.pause(); play.textContent = 'Resume'; return; }
      if (playing && syn.paused) { syn.resume(); play.textContent = 'Pause'; return; }
      playing = true; play.textContent = 'Pause'; say(idx);
    });
    stop.addEventListener('click', function () { playing = false; token++; syn.cancel(); clear(); idx = 0; play.textContent = 'Play'; ls.textContent = ''; });
    rate.addEventListener('change', function () { set('al-rate', rate.value); if (playing) say(idx); });
    vs.addEventListener('change', function () { set('al-voice', vs.value); if (playing) say(idx); });
    prose.addEventListener('dblclick', function (e) { var b = e.target.closest('p, li'); var i = blocks.indexOf(b); if (i > -1 && !lp.hidden) { playing = true; play.textContent = 'Pause'; say(i); } });
    window.addEventListener('beforeunload', function () { syn.cancel(); });
  } else if (lb) lb.hidden = true;
  /* highlights */
  var units = $$('p, li', prose), hk = 'al-hl';
  function hls() { return jget(hk, []); }
  function wrap(block, start, len, id) {
    var w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT), n, pos = 0, end = start + len, nodes = [];
    while ((n = w.nextNode())) { var l = n.nodeValue.length; if (pos < end && pos + l > start) nodes.push([n, Math.max(0, start - pos), Math.min(l, end - pos)]); pos += l; }
    nodes.forEach(function (x) { var r = document.createRange(); r.setStart(x[0], x[1]); r.setEnd(x[0], x[2]); var m = el('mark', 'hl'); m.dataset.id = id; try { r.surroundContents(m); } catch (e) {} });
  }
  function applyAll() { hls().filter(function (h) { return h.b === slug && h.n === num; }).forEach(function (h) { var b = units[h.i]; if (b && b.textContent.substr(h.s, h.t.length) === h.t) wrap(b, h.s, h.t.length, h.id); }); }
  applyAll();
  var pop = el('div', 'hlpop'); pop.hidden = true; document.body.appendChild(pop);
  function hide() { pop.hidden = true; pop.innerHTML = ''; }
  function place(rect) { pop.hidden = false; var x = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, rect.left + rect.width / 2 - pop.offsetWidth / 2)); pop.style.left = x + 'px'; pop.style.top = Math.max(8, rect.top - pop.offsetHeight - 8) + 'px'; }
  function btn(t, fn) { var b = el('button', null, t); b.type = 'button'; b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.addEventListener('click', fn); pop.appendChild(b); return b; }
  prose.addEventListener('mouseup', function () { setTimeout(sel, 10); }); prose.addEventListener('touchend', function () { setTimeout(sel, 300); });
  function sel() {
    var s = window.getSelection(); if (!s || s.isCollapsed || !s.rangeCount) return;
    var r = s.getRangeAt(0), a = (r.startContainer.nodeType === 3 ? r.startContainer.parentNode : r.startContainer).closest('p, li'), b = (r.endContainer.nodeType === 3 ? r.endContainer.parentNode : r.endContainer).closest('p, li');
    var t = s.toString().replace(/\s+/g, ' ').trim(); if (!a || a !== b || t.length < 3 || t.length > 500) return;
    var pre = document.createRange(); pre.selectNodeContents(a); pre.setEnd(r.startContainer, r.startOffset); var start = pre.toString().length, raw = r.toString();
    var rect = r.getBoundingClientRect(); pop.innerHTML = '';
    function save(note) {
      var id = 'h' + Date.now().toString(36), l = hls(); l.push({ id: id, b: slug, n: num, bt: ch.dataset.btitle, ct: ch.dataset.ctitle, i: units.indexOf(a), s: start, t: raw, note: note || '', ts: Date.now() });
      jset(hk, l); wrap(a, start, raw.length, id); s.removeAllRanges(); hide();
    }
    btn('Highlight', function () { save(''); });
    btn('Highlight and note', function () { var n = window.prompt('Your note on this passage:', ''); if (n !== null) save(n); });
    place(rect);
  }
  prose.addEventListener('click', function (e) {
    var m = e.target.closest('mark.hl'); if (!m) return; var id = m.dataset.id, l = hls(), h = l.filter(function (x) { return x.id === id; })[0]; if (!h) return;
    pop.innerHTML = ''; if (h.note) { var p = el('p', 'hlnote', h.note); pop.appendChild(p); }
    btn(h.note ? 'Edit note' : 'Add note', function () { var n = window.prompt('Your note:', h.note || ''); if (n !== null) { h.note = n; jset(hk, l); } hide(); });
    btn('Remove highlight', function () { jset(hk, l.filter(function (x) { return x.id !== id; })); $$('mark.hl[data-id="' + id + '"]').forEach(function (mk) { var par = mk.parentNode; while (mk.firstChild) par.insertBefore(mk.firstChild, mk); par.removeChild(mk); par.normalize(); }); hide(); });
    place(m.getBoundingClientRect());
  });
  document.addEventListener('mousedown', function (e) { if (!pop.contains(e.target) && !e.target.closest('mark.hl')) hide(); });
  document.addEventListener('scroll', hide, { passive: true });
})();

/* ---------- book page: save for offline ---------- */
(function () {
  var b = $('#offline'); if (!b) return;
  if (!('caches' in window)) { b.hidden = true; return; }
  var st = $('#offst'), total = +b.dataset.total;
  b.addEventListener('click', function () {
    var urls = ['index.html', 'full.html']; for (var i = 1; i <= total; i++) urls.push(i + '.html');
    b.disabled = true; var done = 0;
    caches.open('al-v1').then(function (c) {
      return urls.reduce(function (p, u) { return p.then(function () { return fetch(u).then(function (r) { if (r.ok) return c.put(u, r); }).then(function () { done++; st.textContent = 'Saving ' + done + ' of ' + urls.length; }); }); }, Promise.resolve());
    }).then(function () { st.textContent = 'Saved. This book now works without internet on this device.'; b.disabled = false; }).catch(function () { st.textContent = 'Could not save everything. Try again online.'; b.disabled = false; });
  });
})();

/* ---------- my library ---------- */
(function () {
  var m = $('#m-last'); if (!m) return;
  function link(h, t) { var a = el('a', null, t); a.href = root + h; return a; }
  function row(cls) { return el('div', cls || 'mrow'); }
  function empty(t) { return el('p', 'facts', t); }
  /* last */
  var last = jget('al-last', null);
  if (last) { var r = row(); r.appendChild(link('b/' + last.b + '/' + last.n + '.html', last.bt + ', ' + last.ct)); m.appendChild(r); } else m.appendChild(empty('Nothing yet. Open any chapter and it will appear here.'));
  var rc = 0; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('al-read-') === 0) rc += jget(k, []).length; }
  if (rc) m.appendChild(empty(rc + ' chapters read so far.'));
  /* trails */
  var tr = $('#m-trails'), fol = jget('al-follow', []), shown = 0, slugs = fol.slice();
  for (i = 0; i < localStorage.length; i++) { k = localStorage.key(i); if (k.indexOf('al-trailinfo-') === 0) { var s = k.slice(13); if (slugs.indexOf(s) < 0) { var inf0 = jget(k, null); if (inf0 && inf0.done > 0) slugs.push(s); } } }
  slugs.forEach(function (s) { var inf = jget('al-trailinfo-' + s, null); var r = row(); r.appendChild(link('start/' + s + '.html', inf ? inf.t : s)); r.appendChild(el('span', 'facts', inf ? ' ' + inf.done + ' of ' + inf.n + ' books finished' + (fol.indexOf(s) > -1 ? ', following' : '') : ' following')); if (inf && inf.next) { r.appendChild(document.createTextNode(' Next: ')); r.appendChild(link(inf.href, inf.next)); } tr.appendChild(r); shown++; });
  if (!shown) { tr.appendChild(empty('You are not following a trail yet.')); tr.appendChild(link('start.html', 'Choose a trail')); }
  /* practice */
  function paintPractice() {
    var box = $('#m-practice'); box.innerHTML = ''; var ids = jget('al-practice', []), log = jget('al-plog', {}), today = new Date().toISOString().slice(0, 10), SKD = window.SKD || {};
    if (!ids.length) { box.appendChild(empty('Add techniques from the Skills page and they will collect here as a daily checklist.')); box.appendChild(link('skills.html', 'Browse skills')); return; }
    var doneToday = log[today] || [], c = 0; ids.forEach(function (id) { if (doneToday.indexOf(id) > -1) c++; });
    var streak = 0, d = new Date(); if (!(log[today] && log[today].length)) d.setDate(d.getDate() - 1);
    while (true) { var key = d.toISOString().slice(0, 10); if (log[key] && log[key].length) { streak++; d.setDate(d.getDate() - 1); } else break; }
    box.appendChild(el('p', 'facts', c + ' of ' + ids.length + ' done today. Streak: ' + streak + ' day' + (streak === 1 ? '' : 's') + '.'));
    ids.forEach(function (id) {
      var info = SKD[id]; var r = row('mrow prow'), lab = el('label', 'done'), cb = el('input'); cb.type = 'checkbox'; cb.checked = doneToday.indexOf(id) > -1;
      cb.addEventListener('change', function () { var lg = jget('al-plog', {}), a = lg[today] || []; var k = a.indexOf(id); if (cb.checked && k < 0) a.push(id); if (!cb.checked && k > -1) a.splice(k, 1); lg[today] = a; jset('al-plog', lg); paintPractice(); });
      lab.appendChild(cb); lab.appendChild(document.createTextNode(' ' + (info ? info[0] : id))); r.appendChild(lab);
      if (info) { r.appendChild(el('span', 'facts', ' ' + info[3] + ', ' + info[1] + ' ')); r.appendChild(link('skills.html#' + id, 'Open')); r.appendChild(document.createTextNode(' ')); r.appendChild(link(info[2], 'Chapter')); }
      var rm = el('button', 'btn ghost sm', 'Remove'); rm.type = 'button'; rm.addEventListener('click', function () { var l = jget('al-practice', []); l.splice(l.indexOf(id), 1); jset('al-practice', l); paintPractice(); }); r.appendChild(rm);
      box.appendChild(r);
    });
  }
  window.addEventListener('load', paintPractice); paintPractice();
  /* bookmarks */
  function paintBm() {
    var box = $('#m-bm'); box.innerHTML = ''; var l = jget('al-bm', []); if (!l.length) { box.appendChild(empty('Use the Bookmark button at the top of any chapter.')); return; }
    l.slice().reverse().forEach(function (x) { var r = row(); r.appendChild(link('b/' + x.b + '/' + x.n + '.html', x.bt + ', ' + x.ct)); var rm = el('button', 'btn ghost sm', 'Remove'); rm.type = 'button'; rm.addEventListener('click', function () { jset('al-bm', jget('al-bm', []).filter(function (y) { return !(y.b === x.b && y.n === x.n); })); paintBm(); }); r.appendChild(rm); box.appendChild(r); });
  }
  paintBm();
  /* highlights and notes */
  function paintHl() {
    var box = $('#m-hl'); box.innerHTML = ''; var l = jget('al-hl', []), notes = [];
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('al-note-') === 0) notes.push(k); }
    if (!l.length && !notes.length) { box.appendChild(empty('Select any passage in a chapter to highlight it or add a note.')); return; }
    l.slice().reverse().forEach(function (h) {
      var r = row('mrow hrow'); r.appendChild(el('blockquote', 'hq', h.t)); if (h.note) r.appendChild(el('p', 'hn', 'Note: ' + h.note));
      r.appendChild(link('b/' + h.b + '/' + h.n + '.html', h.bt + ', ' + h.ct)); r.appendChild(document.createTextNode(' '));
      var rm = el('button', 'btn ghost sm', 'Delete'); rm.type = 'button'; rm.addEventListener('click', function () { jset('al-hl', jget('al-hl', []).filter(function (y) { return y.id !== h.id; })); paintHl(); }); r.appendChild(rm); box.appendChild(r);
    });
    notes.forEach(function (k) { var m = k.match(/^al-note-(.+)-(\d+)$/); if (!m) return; var r = row('mrow hrow'); r.appendChild(el('p', 'hn', 'Chapter note: ' + get(k))); r.appendChild(link('b/' + m[1] + '/' + m[2] + '.html', m[1].replace(/-/g, ' ') + ', chapter ' + m[2])); box.appendChild(r); });
  }
  paintHl();
  /* export / import */
  $('#m-export').addEventListener('click', function () {
    var o = {}; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k.indexOf('al-') === 0) o[k] = localStorage.getItem(k); }
    var a = el('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(o, null, 1)], { type: 'application/json' })); a.download = 'atkinson-library-backup.json'; document.body.appendChild(a); a.click(); a.remove();
    $('#m-msg').textContent = 'Exported ' + Object.keys(o).length + ' items.';
  });
  $('#m-import').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return; var rd = new FileReader();
    rd.onload = function () { try { var o = JSON.parse(rd.result), n = 0; Object.keys(o).forEach(function (k) { if (k.indexOf('al-') === 0) { set(k, o[k]); n++; } }); $('#m-msg').textContent = 'Imported ' + n + ' items. Reloading...'; setTimeout(function () { location.reload(); }, 700); } catch (x) { $('#m-msg').textContent = 'That file could not be read.'; } };
    rd.readAsText(f);
  });
})();
})();
