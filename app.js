/* ============================================================
   大肥鱼 · 学习任务 — 逻辑
   ============================================================ */
(function () {
  'use strict';

  var D = window.GAME_DATA;
  var KEY = 'fatfish_quest_v1';

  var TASK_XP = 12;
  var CLEAR_XP = 70;      /* 验收通过 50 + 通关 20 */
  var CHECKIN_BASE = 10;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- 状态 ---------------- */
  function blankWorld() { return { tasks: {}, cleared: {}, exams: {} }; }

  function defState() {
    var w = {};
    D.worlds.forEach(function (x) { w[x.id] = blankWorld(); });
    return {
      v: 1,
      player: { name: '无名猎人' },
      worlds: w,
      checkins: {},
      ach: {},
      settings: { sound: true, mapRoute: false },
      intel: {},
      gloss: { known: {}, daily: {} },
      lastWorld: D.worlds[0].id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  var S = load();

  function load() {
    var base = defState();
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) return base;
    var p;
    try { p = JSON.parse(raw); } catch (e) { return base; }
    if (!p || typeof p !== 'object') return base;
    base.player.name = (p.player && p.player.name) || base.player.name;
    base.lastWorld = p.lastWorld || base.lastWorld;
    if (p.settings) {
      var ps = p.settings;
      base.settings.sound = ps.sound !== false;
      if (ps.route !== undefined) base.settings.route = !!ps.route;
      if (ps.mapRoute !== undefined) base.settings.mapRoute = !!ps.mapRoute;
      if (ps.routePace) base.settings.routePace = ps.routePace;
      if (ps.pace) base.settings.pace = ps.pace;
      if (ps.paceByWorld) base.settings.paceByWorld = ps.paceByWorld;
    }
    if (p.checkins) base.checkins = p.checkins;
    if (p.ach) base.ach = p.ach;
    if (p.intel) base.intel = p.intel;
    if (p.gloss) base.gloss = p.gloss;
    Object.keys(base.worlds).forEach(function (id) {
      var src = p.worlds && p.worlds[id];
      if (!src) return;
      base.worlds[id].tasks = src.tasks || {};
      base.worlds[id].cleared = src.cleared || {};
      base.worlds[id].exams = src.exams || {};
    });
    return base;
  }

  function save() {
    S.updatedAt = Date.now();
    try { window.localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  }

  /* ---------------- 查询 ---------------- */
  function world(id) {
    for (var i = 0; i < D.worlds.length; i++) if (D.worlds[i].id === id) return D.worlds[i];
    return D.worlds[0];
  }
  function getStage(wid, sid) {
    var st = world(wid).stages;
    for (var i = 0; i < st.length; i++) if (st[i].id === sid) return st[i];
    return null;
  }
  function mainStages(w) { return w.stages.filter(function (s) { return !s.side; }); }
  function taskKey(sid, i) { return sid + ':' + i; }
  function isTask(wid, sid, i) { return !!S.worlds[wid].tasks[taskKey(sid, i)]; }

  function stats(wid, s) {
    var n = 0;
    s.tasks.forEach(function (_, i) { if (isTask(wid, s.id, i)) n++; });
    return { done: n, total: s.tasks.length, ratio: s.tasks.length ? n / s.tasks.length : 0 };
  }
  function cleared(wid, s) { return !!S.worlds[wid].cleared[s.id]; }

  function unlocked(wid, s) {
    var w = world(wid);
    if (s.open) return true;
    if (s.side) {
      if (!s.unlockAfter) return true;
      var anchor = getStage(wid, s.unlockAfter);
      return !anchor || cleared(wid, anchor);
    }
    var ms = mainStages(w);
    var idx = ms.indexOf(s);
    if (idx <= 0) return true;
    return cleared(wid, ms[idx - 1]);
  }

  function totalTasks() {
    var n = 0;
    D.worlds.forEach(function (w) {
      w.stages.forEach(function (s) {
        s.tasks.forEach(function (_, i) { if (isTask(w.id, s.id, i)) n++; });
      });
    });
    return n;
  }
  function totalClears() {
    var n = 0;
    D.worlds.forEach(function (w) {
      Object.keys(S.worlds[w.id].cleared).forEach(function (k) { if (S.worlds[w.id].cleared[k]) n++; });
    });
    return n;
  }
  function totalExp() {
    var xp = 0;
    D.worlds.forEach(function (w) {
      var st = S.worlds[w.id];
      w.stages.forEach(function (s) {
        s.tasks.forEach(function (_, i) { if (st.tasks[taskKey(s.id, i)]) xp += TASK_XP; });
        if (st.cleared[s.id]) xp += CLEAR_XP;
      });
    });
    Object.keys(S.checkins).forEach(function (k) { xp += (S.checkins[k] && S.checkins[k].xp) || 0; });
    return xp;
  }

  function levelOf(exp) {
    var c = D.curve;
    if (c && c.length) {
      var n = 1;
      for (var i = 0; i < c.length; i++) if (exp >= c[i]) n = i + 1;
      return n;
    }
    var m = 1;
    while (exp >= 50 * m * (m + 1)) m++;
    return m;
  }
  function levelBounds(lv) {
    var c = D.curve;
    if (c && c.length) {
      var from = c[lv - 1] || 0;
      var to = (c[lv] != null) ? c[lv] : from + 1000;
      return { from: from, to: to };
    }
    var f = lv === 1 ? 0 : 50 * (lv - 1) * lv;
    return { from: f, to: 50 * lv * (lv + 1) };
  }
  function titleOf(lv) {
    var t = D.levels[0];
    D.levels.forEach(function (x) { if (lv >= x.min) t = x; });
    return t;
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dkey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function todayKey() { return dkey(new Date()); }

  function streakNow() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    if (!S.checkins[dkey(d)]) d.setDate(d.getDate() - 1);
    var n = 0;
    while (S.checkins[dkey(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function maxStreak() {
    var days = Object.keys(S.checkins).sort();
    var best = 0, run = 0, prev = null;
    days.forEach(function (k) {
      var d = new Date(k + 'T00:00:00');
      if (prev) {
        var gap = Math.round((d - prev) / 86400000);
        run = gap === 1 ? run + 1 : 1;
      } else run = 1;
      if (run > best) best = run;
      prev = d;
    });
    return best;
  }

  /* ---------------- 音效 ---------------- */
  var actx = null;
  function beep(freq, dur, type, gain) {
    if (!S.settings.sound) return;
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      var o = actx.createOscillator(), g = actx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain || 0.05, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur);
    } catch (e) {}
  }
  function sfx(kind) {
    if (!S.settings.sound) return;
    if (kind === 'tick') beep(760, 0.08, 'triangle', 0.035);
    else if (kind === 'ok') { beep(680, 0.1, 'sine', 0.05); setTimeout(function () { beep(1020, 0.16, 'sine', 0.045); }, 90); }
    else if (kind === 'bad') { beep(220, 0.16, 'sawtooth', 0.04); setTimeout(function () { beep(160, 0.22, 'sawtooth', 0.035); }, 120); }
    else if (kind === 'up') {
      [523, 659, 784, 1047].forEach(function (f, i) {
        setTimeout(function () { beep(f, 0.22, 'triangle', 0.05); }, i * 110);
      });
    }
  }

  /* ---------------- Toast ---------------- */
  function copyText(t) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t); return; }
    } catch (e) {}
    try {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
  }
  function toast(msg, kind) {
    var stack = $('#toasts');
    var el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 320);
    }, 2100);
  }

  /* ---------------- HUD ---------------- */
  function renderHUD() {
    var exp = totalExp();
    var lv = levelOf(exp);
    var b = levelBounds(lv);
    var t = titleOf(lv);
    var span = b.to - b.from;

    $('#playerName').textContent = S.player.name || '无名猎人';
    $('#playerTitle').textContent = t.name;
    $('#playerLv').textContent = 'Lv.' + lv;
    $('#expNum').textContent = (exp - b.from) + ' / ' + span;
    $('#expFill').style.width = Math.max(2, Math.min(100, ((exp - b.from) / span) * 100)) + '%';
    $('#statStreak').textContent = streakNow();
    $('#statClear').textContent = totalClears();
    $('#statTask').textContent = totalTasks();
    document.title = 'Lv.' + lv + ' · ' + ((D.meta && D.meta.site) || '学习系统');

    var cc = $('#charCard');
    if (cc) {
      var pct2 = Math.max(0, Math.min(100, ((exp - b.from) / span) * 100));
      cc.innerHTML =
        '<div class="cc-top">' +
          '<div class="cc-avatar"><svg><use href="#mascot"/></svg></div>' +
          '<div class="cc-id"><b>' + (S.player.name || '无名猎人') + '</b>' +
          '<span>' + t.name + ' · Lv.' + lv + '</span></div>' +
        '</div>' +
        '<div class="cc-exp"><span>' + (exp - b.from) + ' / ' + span + ' EXP</span>' +
        '<i style="width:' + pct2 + '%"></i></div>' +
        '<div class="cc-stats">' +
          '<div><b>' + streakNow() + '</b><span>连击</span></div>' +
          '<div><b>' + totalClears() + '</b><span>通关</span></div>' +
          '<div><b>' + totalTasks() + '</b><span>任务</span></div>' +
        '</div>';
    }
  }

  /* ---------------- 世界线 ---------------- */
  function renderWorlds() {
    var box = $('#worlds');
    box.innerHTML = '';
    D.worlds.forEach(function (w) {
      var ms = mainStages(w);
      var done = ms.filter(function (s) { return cleared(w.id, s); }).length;
      var pct = ms.length ? (done / ms.length) * 100 : 0;
      var el = document.createElement('button');
      el.className = 'world-card' + ((!S.settings.mapRoute && S.lastWorld === w.id) ? ' is-on' : '');
      el.style.setProperty('--wc', w.accent);
      el.style.setProperty('--wc-line', w.color);
      el.innerHTML =
        '<div class="wc-tag">' + w.tag + ' / ' + w.jp + '</div>' +
        '<div class="wc-num">' + pad(done) + '/' + pad(ms.length) + '</div>' +
        '<h3>' + w.name + '<span class="jp">' + w.jp + '</span></h3>' +
        '<p>' + w.tagline + '</p>' +
        '<div class="wc-prog"><i style="width:' + pct + '%"></i></div>';
      el.addEventListener('click', function () {
        if (!S.settings.mapRoute && S.lastWorld === w.id) return;
        S.settings.mapRoute = false;
        S.lastWorld = w.id; save(); sfx('tick');
        renderWorlds(); renderRouteCard(); renderWorldHead(); renderMap();
      });
      box.appendChild(el);
    });
  }

  function routeSeq() {
    var out = [];
    var R = window.ROUTE;
    if (!R) return out;
    R.phases.forEach(function (p) {
      p.stages.forEach(function (sid) {
        var loc = findStageAnywhere(sid);
        if (!loc) return;
        out.push({ wid: loc.wid, s: getStage(loc.wid, sid), phase: p });
      });
    });
    var ok = true;
    out.forEach(function (it) {
      it.un = ok;
      ok = ok && cleared(it.wid, it.s);
    });
    return out;
  }

  function renderWorldHead() {
    var head = $('#worldHead');
    if (S.settings.mapRoute && window.ROUTE) {
      var totalH = 0, doneH = 0;
      routeSeq().forEach(function (it) {
        var h = it.s.hours || 0;
        totalH += h;
        doneH += h * stats(it.wid, it.s).ratio;
      });
      var months = Math.round(totalH / 12 / 4.33);
      head.style.setProperty('--wh', '#6ea8fe');
      head.innerHTML =
        '<div>' +
          '<div class="wh-jp">ROUTE · 先数媒，再补工程</div>' +
          '<h2>推荐路线</h2>' +
          '<div class="wh-tagline">四条线合并成一条主线：造管线 → 补工程 → 上线。约 ' + months + ' 个月（每周 12 小时）。</div>' +
        '</div>' +
        '<div class="wh-right">' +
          '<div class="wh-count">' + (totalH ? Math.round(doneH / totalH * 100) : 0) + '<small> % 完成</small></div>' +
          '<div class="wh-desc">' + totalH + ' 小时 · 已完成 ' + Math.round(doneH) + ' h</div>' +
        '</div>';
      return;
    }
    var w = world(S.lastWorld);
    var ms = mainStages(w);
    var done = ms.filter(function (s) { return cleared(w.id, s); }).length;
    head.style.setProperty('--wh', w.accent);
    head.innerHTML =
      '<div>' +
        '<div class="wh-jp">' + w.tag + ' · ' + w.jp + '</div>' +
        '<h2>' + w.name + '</h2>' +
        '<div class="wh-tagline">' + w.tagline + '</div>' +
      '</div>' +
      '<div class="wh-right">' +
        '<div class="wh-count">' + done + '<small> / ' + ms.length + ' 关</small></div>' +
        '<div class="wh-desc">' + w.desc + '</div>' +
      '</div>';
  }

  /* ---------------- 地图 ---------------- */
  function makeStageRow(wid, s, firstOpen, unOverride) {
    var w = world(wid);
    var st = stats(wid, s);
    var un = (unOverride === undefined) ? unlocked(wid, s) : unOverride;
    var cl = cleared(wid, s);

    var row = document.createElement('div');
    row.className = 'stage-row' +
      (cl ? ' is-cleared' : '') +
      (!un ? ' is-locked' : '') +
      (firstOpen === s ? ' is-current' : '');
    row.style.setProperty('--sc', w.accent);

    var badges = '';
    if (s.side) badges += '<span class="badge side">副线</span>';
    else if (s.open) badges += '<span class="badge side">并行</span>';
    if (cl) badges += '<span class="badge done">已通关</span>';
    else if (firstOpen === s) badges += '<span class="badge now">现在</span>';
    else if (!un) badges += '<span class="badge lock">未解锁</span>';

    row.innerHTML =
      '<div class="node">' +
        (cl ? '<svg><use href="#icon-check"/></svg>'
            : (!un ? '<svg><use href="#icon-lock"/></svg>' : '<span class="no">' + s.no + '</span>')) +
      '</div>' +
      '<button class="stage-card">' +
        '<div class="sc-top">' +
          '<h3>' + s.name + '</h3>' +
          '<span class="sc-jp">' + s.jp + '</span>' +
          badges +
          '<span class="sc-dur">' + s.duration + '</span>' +
        '</div>' +
        '<div class="sc-goal">' + s.goal + '</div>' +
        '<div class="sc-foot">' +
          '<div class="sc-bar"><i style="width:' + (st.ratio * 100) + '%"></i></div>' +
          '<span class="sc-num">' + st.done + '/' + st.total + ' 任务</span>' +
        '</div>' +
      '</button>';

    row.querySelector('.stage-card').addEventListener('click', function () {
      if (!un) { toast('前面的关卡还没通关，这里还锁着', 'bad'); sfx('bad'); return; }
      openSheet(wid, s.id);
    });
    return row;
  }

  function renderRouteCard() {
    var el = $('#routeCard');
    if (!el || !window.ROUTE) return;
    var totalH = 0, doneH = 0;
    routeSeq().forEach(function (it) {
      var h = it.s.hours || 0;
      totalH += h;
      doneH += h * stats(it.wid, it.s).ratio;
    });
    var pct = totalH ? Math.round(doneH / totalH * 100) : 0;
    el.style.setProperty('--wc', '#6ea8fe');
    el.className = 'world-card route-card' + (S.settings.mapRoute ? ' is-on' : '');
    el.innerHTML = '<h3>推荐路线</h3><span class="wc-num">' + pct + '%</span>' +
      '<div class="wc-prog"><i style="width:' + pct + '%"></i></div>';
    el.onclick = function () {
      S.settings.mapRoute = !S.settings.mapRoute;
      save(); sfx('tick');
      renderWorlds(); renderRouteCard(); renderWorldHead(); renderMap();
    };
  }

  function renderMap() {
    var box = $('#map');
    box.innerHTML = '';
    renderRouteCard();

    if (S.settings.mapRoute && window.ROUTE) {
      var seq = routeSeq();
      var firstOpen = null;
      seq.forEach(function (it) {
        if (it.un && !cleared(it.wid, it.s) && !firstOpen) firstOpen = it.s;
      });
      var lastPhase = null;
      seq.forEach(function (it) {
        if (it.phase !== lastPhase) {
          lastPhase = it.phase;
          var ph = document.createElement('div');
          ph.className = 'route-phase';
          ph.innerHTML = '<b>' + lastPhase.name + '</b><span>' + lastPhase.why + '</span>';
          box.appendChild(ph);
        }
        box.appendChild(makeStageRow(it.wid, it.s, firstOpen, it.un));
      });
      renderToday();
      return;
    }

    var w = world(S.lastWorld);
    var firstOpen2 = null;
    w.stages.forEach(function (s) {
      if (unlocked(w.id, s) && !cleared(w.id, s) && !firstOpen2) firstOpen2 = s;
    });
    w.stages.forEach(function (s) {
      box.appendChild(makeStageRow(w.id, s, firstOpen2));
    });
    renderToday();
  }

  /* ---------------- 今日任务 + 速通 ---------------- */
  function renderToday() {
    var box = $('#todayCard');
    if (!box) return;
    var target = null, taskText = '', examTarget = null, targetWid = null, examWid = null;

    if (S.settings.mapRoute && window.ROUTE) {
      var seq = routeSeq();
      for (var i = 0; i < seq.length; i++) {
        var it = seq[i];
        if (!it.un || cleared(it.wid, it.s)) continue;
        var st0 = stats(it.wid, it.s);
        if (st0.done === st0.total) { examTarget = it.s; examWid = it.wid; break; }
        for (var j = 0; j < it.s.tasks.length; j++) {
          if (!isTask(it.wid, it.s.id, j)) { target = it.s; targetWid = it.wid; taskText = it.s.tasks[j]; break; }
        }
        if (target) break;
      }
    } else {
      var w0 = world(S.lastWorld);
      for (var k = 0; k < w0.stages.length; k++) {
        var s0 = w0.stages[k];
        if (!unlocked(w0.id, s0) || cleared(w0.id, s0)) continue;
        var st1 = stats(w0.id, s0);
        if (st1.done === st1.total) { examTarget = s0; examWid = w0.id; break; }
        for (var m = 0; m < s0.tasks.length; m++) {
          if (!isTask(w0.id, s0.id, m)) { target = s0; targetWid = w0.id; taskText = s0.tasks[m]; break; }
        }
        if (target) break;
      }
    }

    if (examTarget) {
      var ew = world(examWid);
      box.innerHTML = '<div class="today-card is-exam">' +
        '<div class="tc-label">主线任务 · 验收 · ' + ew.name + ' / ' + examTarget.name + '</div>' +
        '<div class="tc-text">任务已经全部完成，去把这一关的验收考试过掉——不合格可以立刻重考。</div>' +
        '<div class="tc-foot">' +
          '<span class="tc-prog">' + examTarget.tasks.length + ' / ' + examTarget.tasks.length + ' 任务　约 ' + (examTarget.hours || 0) + ' 小时</span>' +
          '<button class="btn btn-main" id="todayExam">去验收</button>' +
        '</div>' +
        '</div>';
      var eb2 = $('#todayExam', box);
      if (eb2) eb2.addEventListener('click', function () { startExam(examWid, examTarget.id); });
      return;
    }

    if (!target) {
      box.innerHTML = '<div class="today-card is-done">' +
        '<div class="tc-label">主线任务</div>' +
        '<div class="tc-text">' + (S.settings.mapRoute ? '推荐路线已经全部走完。' : '这条世界线已经全部通关。换一条世界线，或者去把副线补完。') + '</div>' +
        '</div>';
      return;
    }

    var tw = world(targetWid);
    var st = stats(targetWid, target);
    box.innerHTML = '<div class="today-card">' +
      '<div class="tc-label">主线任务 · ' + tw.name + ' / ' + target.name + '</div>' +
      '<div class="tc-text">' + taskText + '</div>' +
      '<div class="tc-foot">' +
        '<span class="tc-prog">' + st.done + ' / ' + st.total + '　约 ' + (target.hours || 0) + ' 小时</span>' +
        '<button class="btn btn-main" id="todayGo">去完成</button>' +
      '</div>' +
      '</div>';

    var b = $('#todayGo', box);
    if (b) b.addEventListener('click', function () { openSheet(targetWid, target.id); });
  }

  /* ---------------- 人生进度表 ---------------- */
  function renderGantt() {
    var M = window.MILESTONE || {};
    var horizon = 0;
    var lanes = [];

    D.worlds.forEach(function (w) {
      var m = M[w.id] || {};
      var pace = (S.settings.paceByWorld && S.settings.paceByWorld[w.id]) || m.pace || 10;
      var parallel = w.stages.every(function (s) { return s.open; });
      var cum = 0;
      var bars = w.stages.map(function (s) {
        var h = s.hours || 0;
        var start, end;
        if (parallel) {
          start = 0; cum += h; end = h / pace / 4.33;
        } else {
          start = cum / pace / 4.33; cum += h; end = cum / pace / 4.33;
        }
        return { s: s, start: start, end: end, cl: cleared(w.id, s), ratio: stats(w.id, s).ratio };
      });
      var last = bars.length ? bars[bars.length - 1].end : 0;
      horizon = Math.max(horizon, last);
      lanes.push({ w: w, bars: bars });
    });

    horizon = Math.max(6, Math.ceil(horizon / 4) * 4);

    var ticks = '';
    for (var t = 0; t <= horizon; t += 4) {
      ticks += '<span style="left:' + (t / horizon * 100) + '%">' + t + '</span>';
    }

    $('#gantt').innerHTML =
      '<div class="gantt-axis"><div class="gantt-pad"></div>' +
        '<div class="gantt-axis-track">' + ticks + '<em>个月</em></div></div>' +
      lanes.map(function (L) {
        return '<div class="gantt-lane" style="--wc:' + L.w.accent + '">' +
          '<div class="gantt-name">' + L.w.name + '<span>' + (L.w.hours || 0) + ' h</span></div>' +
          '<div class="gantt-track">' +
            L.bars.map(function (b) {
              var left = b.start / horizon * 100;
              var width = Math.max(1, (b.end - b.start) / horizon * 100);
              var label = b.end - b.start > horizon * 0.055 ? b.s.name : '';
              var f = function (v) { return (Math.round(v * 10) / 10).toString(); };
              var tip = L.w.name + ' · ' + b.s.name + '：第 ' + f(b.start) + '–' + f(b.end) + ' 个月';
              return '<button class="gbar' + (b.cl ? ' is-done' : '') + '" data-w="' + L.w.id + '" data-s="' + b.s.id + '"' +
                ' style="left:' + left + '%;width:' + width + '%" title="' + tip + '">' +
                '<i style="width:' + (b.ratio * 100) + '%"></i>' +
                (label ? '<em>' + label + '</em>' : '') +
                '</button>';
            }).join('') +
          '</div>' +
          '</div>';
      }).join('');

    $$('#gantt .gbar').forEach(function (b) {
      b.addEventListener('click', function () {
        S.lastWorld = b.dataset.w;
        save();
        renderWorlds(); renderWorldHead(); renderMap();
        openSheet(b.dataset.w, b.dataset.s);
      });
    });
  }

  /* ---------------- 四条线总览 ---------------- */
  function buildLineOverview(M) {
    var routeOn = S.settings.route !== false;
    $('#lineOverview').innerHTML = D.worlds.map(function (x) {
      var ms = mainStages(x);
      var done = ms.filter(function (s) { return cleared(x.id, s); }).length;
      var pct = ms.length ? (done / ms.length) * 100 : 0;
      var mx = M[x.id] || {};
      var on = !routeOn && S.lastWorld === x.id;
      return '<button class="lo-card' + (on ? ' on' : '') + '" data-world="' + x.id + '" style="--wc:' + x.accent + '">' +
        '<div class="lo-top"><b>' + x.name + '</b><span>' + (x.hours || 0) + ' h</span></div>' +
        '<div class="lo-who">' + (mx.who || '') + '</div>' +
        '<div class="lo-bar"><i style="width:' + pct + '%"></i></div>' +
        '<div class="lo-foot"><span>' + done + '/' + ms.length + ' 里程碑</span><span>' + Math.round(pct) + '%</span></div>' +
        '</button>';
    }).join('');

    $$('#lineOverview .lo-card').forEach(function (b) {
      b.addEventListener('click', function () {
        var wasRoute = S.settings.route !== false;
        S.settings.route = false;
        if (S.lastWorld === b.dataset.world && !wasRoute) return;
        S.lastWorld = b.dataset.world;
        save(); sfx('tick');
        renderWorlds(); renderWorldHead(); renderMap(); renderSprint();
      });
    });
  }

  function buildModeRow() {
    var on = S.settings.route !== false;
    $('#modeRow').innerHTML =
      '<button class="mode-btn' + (on ? '' : ' on') + '" data-mode="parallel">并行四条线</button>' +
      '<button class="mode-btn' + (on ? ' on' : '') + '" data-mode="route">推荐路线</button>';
    $$('#modeRow .mode-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        S.settings.route = (b.dataset.mode === 'route');
        save(); sfx('tick'); renderSprint();
      });
    });
  }

  /* ---------------- 推荐路线（顺序模式） ---------------- */
  function renderRoute(M) {
    var R = window.ROUTE;
    var pace = S.settings.routePace || R.pace || 12;
    var f1 = function (v) { return (Math.round(v * 10) / 10).toString(); };

    var phases = R.phases.map(function (ph) {
      var items = ph.stages.map(function (sid) {
        var loc = findStageAnywhere(sid);
        if (!loc) return null;
        return { wid: loc.wid, s: getStage(loc.wid, sid), h: (getStage(loc.wid, sid).hours || 0) };
      }).filter(Boolean);
      return { ph: ph, items: items, h: items.reduce(function (a, b) { return a + b.h; }, 0) };
    });

    var totalH = 0, doneH = 0, firstOpen = null;
    phases.forEach(function (p) {
      p.items.forEach(function (it) {
        totalH += it.h;
        doneH += it.h * stats(it.wid, it.s).ratio;
        if (!firstOpen && !cleared(it.wid, it.s)) firstOpen = it.s.id;
      });
    });

    var totalM = totalH / pace / 4.33;
    var doneM = doneH / pace / 4.33;
    var horizon = Math.max(12, Math.ceil(totalM / 6) * 6);

    $('#msTitle').textContent = R.name;
    $('#msSub').textContent = totalH + ' 小时 · 约 ' + f1(totalM) + ' 个月 · 已完成 ' +
      Math.round(totalH ? (doneH / totalH) * 100 : 0) + '% · 剩 ' + f1(Math.max(0, totalM - doneM)) + ' 个月';

    var paces = [{ h: 8, name: '稳步' }, { h: 12, name: '标准' }, { h: 18, name: '冲刺' }];
    $('#paceRow').innerHTML = paces.map(function (p) {
      return '<button class="pace' + (p.h === pace ? ' on' : '') + '" data-pace="' + p.h + '">' +
        '<b>' + p.h + '</b><span>小时 / 周</span><em>' + p.name + '</em></button>';
    }).join('');
    $$('#paceRow .pace').forEach(function (b) {
      b.addEventListener('click', function () {
        S.settings.routePace = +b.dataset.pace;
        save(); sfx('tick'); renderSprint();
      });
    });

    /* 时间轴 */
    var html = '';
    var cur = 0;
    phases.forEach(function (p) {
      html += '<div class="phase-head"><b>' + p.ph.name + '</b>' +
        '<span>第 ' + f1(cur / pace / 4.33) + '–' + f1((cur + p.h) / pace / 4.33) + ' 个月 · ' + p.h + 'h</span></div>' +
        '<p class="phase-why">' + p.ph.why + '</p>';

      p.items.forEach(function (it) {
        var s = it.s, w = world(it.wid);
        var m0 = cur / pace / 4.33;
        cur += it.h;
        var m1 = cur / pace / 4.33;
        var mm = ((M[it.wid] || {}).stages || {})[s.id] || {};
        var cl = cleared(it.wid, s);
        var state = cl ? 'is-done' : (firstOpen === s.id ? 'is-now' : 'is-todo');
        html += '<div class="ms-item ' + state + '" style="--sc:' + w.accent + '">' +
          '<div class="ms-dot">' + s.no + '</div>' +
          '<div class="ms-card">' +
            '<div class="ms-head">' +
              '<span class="ms-world">' + w.name + '</span>' +
              '<b>' + s.name + '</b>' +
              '<span class="ms-dur">' + s.duration + '</span>' +
              '<em class="ms-time">' + it.h + 'h · 第 ' + f1(m0) + '–' + f1(m1) + ' 个月' + (cl ? ' · 已达成' : '') + '</em>' +
            '</div>' +
            (mm.cap ? '<div class="ms-cap"><i>能做到</i><span>' + mm.cap + '</span></div>' : '') +
            (mm.rank ? '<div class="ms-rank"><i>这时候的你</i><b>' + mm.rank + '</b></div>' : '') +
            '<div class="ms-prog"><i style="width:' + (stats(it.wid, s).ratio * 100) + '%"></i></div>' +
          '</div>' +
          '</div>';
      });
    });
    $('#msTimeline').innerHTML = html;

    /* 进度表：一条泳道 */
    var bars = '';
    var c2 = 0;
    phases.forEach(function (p) {
      p.items.forEach(function (it) {
        var w = world(it.wid);
        var left = (c2 / pace / 4.33) / horizon * 100;
        var widthPct = (it.h / pace / 4.33) / horizon * 100;
        var tip = w.name + ' · ' + it.s.name + '：第 ' + f1(c2 / pace / 4.33) + '–' + f1((c2 + it.h) / pace / 4.33) + ' 个月';
        bars += '<button class="gbar' + (cleared(it.wid, it.s) ? ' is-done' : '') + '"' +
          ' data-w="' + it.wid + '" data-s="' + it.s.id + '"' +
          ' style="--wc:' + w.accent + ';left:' + left + '%;width:' + Math.max(1, widthPct) + '%"' +
          ' title="' + tip + '">' +
          '<i style="width:' + (stats(it.wid, it.s).ratio * 100) + '%"></i>' +
          (widthPct > 5.5 ? '<em>' + it.s.name + '</em>' : '') +
          '</button>';
        c2 += it.h;
      });
    });

    var ticks = '';
    for (var i = 0; i <= 6; i++) {
      ticks += '<span style="left:' + (i / 6 * 100) + '%">' + Math.round(horizon * i / 6) + '</span>';
    }

    var cov = R.covered.map(function (c) {
      var loc = findStageAnywhere(c.id);
      if (!loc) return '';
      return '<b>' + getStage(loc.wid, c.id).name + '</b>　' + c.note;
    }).filter(Boolean).join('<br>');

    $('#gantt').innerHTML =
      '<div class="gantt-axis"><div class="gantt-pad"></div>' +
        '<div class="gantt-axis-track">' + ticks + '<em>个月</em></div></div>' +
      '<div class="gantt-lane"><div class="gantt-name">推荐顺序<span>' + totalH + ' h</span></div>' +
        '<div class="gantt-track">' + bars + '</div></div>' +
      '<p class="hint" style="margin-top:12px">' + R.desc + '</p>' +
      (cov ? '<p class="hint"><b style="color:var(--mint)">已被覆盖：</b>' + cov + '</p>' : '') +
      '<p class="hint"><b style="color:var(--dim-2)">之后补：</b>' + R.laterNote + '</p>';

    $$('#gantt .gbar').forEach(function (b) {
      b.addEventListener('click', function () {
        S.lastWorld = b.dataset.w; save();
        renderWorlds(); renderWorldHead(); renderMap();
        openSheet(b.dataset.w, b.dataset.s);
      });
    });

    $('#finalWho').textContent = (window.MILESTONE.all || {}).who || '';
    $('#finalNote').innerHTML = '这条路线走完，你手上会有一条能交付的 AIGC 生产线 + 一个能上线的产品。' +
      '<br><b>但别忘了：</b>素养线和创作线不在时间轴上，却决定你能走多远。';

    var fast = '';
    phases.forEach(function (p) {
      p.items.forEach(function (it) {
        var st = stats(it.wid, it.s);
        fast += '<div class="fast-row' + (cleared(it.wid, it.s) ? ' is-done' : '') + '">' +
          '<div class="fast-name"><b>' + it.s.name + '</b><span>' + world(it.wid).name + ' · ' + it.h + 'h</span></div>' +
          '<div class="fast-path">' + (it.s.fast || '——') + '</div>' +
          '<div class="fast-st">' + st.done + '/' + st.total + '</div>' +
          '</div>';
      });
    });
    $('#fastTable').innerHTML = fast;
  }

  function renderSprint() {
    var M = window.MILESTONE || {};
    buildLineOverview(M);
    buildModeRow();
    if (window.ROUTE && S.settings.route !== false) { renderRoute(M); return; }

    var wid = S.lastWorld;
    var w = world(wid);
    var m = M[wid] || { stages: {} };

    /* ---- 当前线 ---- */
    if (!S.settings.paceByWorld) S.settings.paceByWorld = {};
    var pace = S.settings.paceByWorld[wid] || m.pace || 10;

    var total = w.hours || 0;
    var spent = 0;
    var cum = 0;
    var rows = w.stages.map(function (s) {
      cum += (s.hours || 0);
      var st = stats(wid, s);
      spent += (s.hours || 0) * st.ratio;
      return { s: s, cum: cum, st: st, cl: cleared(wid, s) };
    });
    var remain = Math.max(0, total - spent);
    var pct = total ? (spent / total) * 100 : 0;
    var weeks = pace > 0 ? remain / pace : 0;
    var endDate = new Date(Date.now() + Math.round(weeks * 7) * 86400000);
    var endFmt = endDate.getFullYear() + '-' + pad(endDate.getMonth() + 1) + '-' + pad(endDate.getDate());

    $('#msTitle').textContent = w.name + '线';
    $('#msSub').textContent = total + ' 小时 · 已完成 ' + Math.round(pct) + '% · 剩 ' +
      Math.round(remain) + 'h ≈ ' + Math.ceil(weeks) + ' 周 · ' + endFmt;

    var paces = [{ h: Math.max(3, Math.round(m.pace * 0.7)), name: '稳步' }, { h: m.pace || 10, name: '标准' }, { h: Math.round((m.pace || 10) * 1.8), name: '冲刺' }];
    $('#paceRow').innerHTML = paces.map(function (p) {
      return '<button class="pace' + (p.h === pace ? ' on' : '') + '" data-pace="' + p.h + '">' +
        '<b>' + p.h + '</b><span>小时 / 周</span><em>' + p.name + '</em></button>';
    }).join('');
    $$('#paceRow .pace').forEach(function (b) {
      b.addEventListener('click', function () {
        S.settings.paceByWorld[wid] = +b.dataset.pace;
        save(); sfx('tick'); renderSprint();
      });
    });

    /* ---- 时间轴 ---- */
    var firstOpen = rows.filter(function (r) { return !r.cl; })[0];
    var parallel = w.stages.every(function (s) { return s.open; });
    $('#msTimeline').innerHTML = rows.map(function (r) {
      var s = r.s, mm = (m.stages || {})[s.id] || {};
      var state = r.cl ? 'is-done' : (firstOpen === r ? 'is-now' : 'is-todo');
      var month = Math.max(1, Math.round(r.cum / pace / 4.33));
      var tag = r.cl ? '已达成' : (firstOpen === r ? '进行中' : (s.open ? '并行' : '未开始'));
      var timeText = parallel
        ? '本关 ' + (s.hours || 0) + 'h · 约 ' + Math.ceil((s.hours || 0) / pace) + ' 周 · ' + tag
        : '累计 ' + r.cum + 'h · 约第 ' + month + ' 个月 · ' + tag;
      return '<div class="ms-item ' + state + '">' +
        '<div class="ms-dot">' + s.no + '</div>' +
        '<div class="ms-card">' +
          '<div class="ms-head">' +
            '<b>' + s.name + '</b>' +
            '<span class="ms-dur">' + s.duration + '</span>' +
            '<em class="ms-time">' + timeText + '</em>' +
          '</div>' +
          (mm.cap ? '<div class="ms-cap"><i>能做到</i><span>' + mm.cap + '</span></div>' : '') +
          (mm.rank ? '<div class="ms-rank"><i>这时候的你</i><b>' + mm.rank + '</b></div>' : '') +
          '<div class="ms-prog"><i style="width:' + (r.st.ratio * 100) + '%"></i></div>' +
        '</div>' +
        '</div>';
    }).join('');

    /* ---- 终点 ---- */
    $('#finalWho').textContent = m.who || '';
    var all = M.all || {};
    $('#finalNote').innerHTML = (m.note ? m.note + '<br>' : '') +
      (all.who ? '<b>四条线合起来：</b>' + all.who : '');

    /* ---- 最短闭环 ---- */
    $('#fastTable').innerHTML = w.stages.map(function (s) {
      var st = stats(wid, s);
      return '<div class="fast-row' + (cleared(wid, s) ? ' is-done' : '') + '">' +
        '<div class="fast-name"><b>' + s.name + '</b><span>' + s.duration + ' · ' + (s.hours || 0) + 'h</span></div>' +
        '<div class="fast-path">' + (s.fast || '——') + '</div>' +
        '<div class="fast-st">' + st.done + '/' + st.total + '</div>' +
        '</div>';
    }).join('');

    renderGantt();
  }

  /* ---------------- 关卡面板 ---------------- */
  function openSheet(wid, sid) {
    var w = world(wid), s = getStage(wid, sid);
    var wrap = $('#sheetWrap'), sheet = $('#sheet');
    var st = stats(wid, s);
    var cl = cleared(wid, s);
    var ex = S.worlds[wid].exams[sid];
    var allDone = st.done === st.total;

    var idx = w.stages.indexOf(s);
    var prevS = idx > 0 ? w.stages[idx - 1] : null;
    var nextS = idx < w.stages.length - 1 ? w.stages[idx + 1] : null;
    if (prevS && !unlocked(wid, prevS)) prevS = null;
    if (nextS && !unlocked(wid, nextS)) nextS = null;
    var navRow = '<div class="sh-nav">' +
      (prevS ? '<button class="btn btn-ghost" data-nav="' + prevS.id + '">← ' + prevS.name + '</button>' : '<span></span>') +
      (nextS ? '<button class="btn btn-ghost" data-nav="' + nextS.id + '">' + nextS.name + ' →</button>' : '<span></span>') +
      '</div>';

    sheet.style.setProperty('--sc', w.accent);
    sheet.innerHTML =
      '<div class="sh-hero">' +
        '<button class="sh-close" data-close="1" aria-label="关闭">✕</button>' +
        '<div class="sh-no">STAGE ' + s.no + ' · ' + s.jp + (s.side ? ' · SIDE' : '') + '</div>' +
        '<h2>' + s.name + '</h2>' +
        '<div class="sh-sub">' +
          '<span class="badge ' + (cl ? 'done' : (s.side ? 'side' : 'now')) + '">' + (cl ? '已通关' : (s.side ? '副线' : '进行中')) + '</span>' +
          '<span>' + s.duration + '</span>' +
          (s.hours ? '<span>约 ' + s.hours + ' 小时</span>' : '') +
          (ex && ex.best != null ? '<span>最高分 ' + (Number(ex.best) || 0) + '/' + s.exam.q.length + '</span>' : '') +
          '<button class="sh-link" id="copyLink" title="复制这一关的链接" aria-label="复制链接">🔗</button>' +
        '</div>' +
      '</div>' +
      '<div class="sh-body">' +
        '<div class="sh-sec">' +
          '<h3>目标</h3>' +
          '<p><b>' + s.goal + '</b></p>' +
          '<p class="muted" style="margin-top:8px">' + s.why + '</p>' +
        '</div>' +
        '<div class="sh-sec">' +
          '<h3>学习内容</h3>' +
          '<ul class="sh-list">' +
            (s.content || s.learn).map(function (x) { return '<li>' + x + '</li>'; }).join('') +
          '</ul>' +
        '</div>' +
        '<div class="sh-sec">' +
          '<h3>课程与资料</h3>' +
          (s.resources && s.resources.length
            ? '<div class="res-list">' + s.resources.map(function (r) {
                return '<a class="res" href="' + r.u + '" target="_blank" rel="noopener noreferrer">' +
                  '<span class="res-k">' + r.k + '</span>' +
                  '<span class="res-main"><b>' + r.t + '</b><em>' + r.n + '</em></span>' +
                  '<span class="res-go">↗</span>' +
                '</a>';
              }).join('') + '</div>'
            : '<p class="hint" style="margin-top:0">这一关还没挂资料，先去上面的学习内容。</p>') +
        '</div>' +
        '<div class="sh-sec">' +
          '<h3>任务 ' + st.done + ' / ' + st.total + '</h3>' +
          '<div class="task-bar"><div class="bar"><i style="width:' + (st.ratio * 100) + '%"></i></div>' +
            '<b>' + Math.round(st.ratio * 100) + '%</b></div>' +
          '<div class="tasks">' +
            s.tasks.map(function (t, i) {
              var on = isTask(wid, sid, i);
              var see = (window.SEE && window.SEE[sid + ':' + i]) || '';
              return '<button class="task' + (on ? ' on' : '') + '" data-task="' + i + '">' +
                '<span class="box"><svg><use href="#icon-check"/></svg></span>' +
                '<span class="tx"><b class="tx-t">' + t + '</b>' +
                  (see ? '<em class="see">▸ ' + see + '</em>' : '') +
                '</span></button>';
            }).join('') +
          '</div>' +
        '</div>' +
        '<div class="sh-sec">' +
          '<h3>别做</h3>' +
          '<ul class="sh-list warn">' + s.donts.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
        '</div>' +
        '<div class="sh-sec">' +
          '<h3>这一关的奖励</h3>' +
          '<p>' + s.reward + '</p>' +
        '</div>' +
        navRow +
      '</div>' +
      '<div class="sh-foot">' +
        '<span class="sh-foot-note">' + (allDone ? '任务已全部完成' : '还差 ' + (st.total - st.done) + ' 条任务') + '</span>' +
        '<button class="btn btn-main" id="examBtn"' + (allDone ? '' : ' disabled') + '>' +
          (cl ? '再次挑战验收' : '进入验收考试') +
        '</button>' +
      '</div>';

    wrap.hidden = false;
    document.body.style.overflow = 'hidden';

    $$('.task', sheet).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = +btn.dataset.task;
        toggleTask(wid, sid, i);
      });
    });

    var eb = $('#examBtn', sheet);
    if (eb) eb.addEventListener('click', function () { startExam(wid, sid); });

    $$('[data-nav]', sheet).forEach(function (b) {
      b.addEventListener('click', function () { openSheet(wid, b.dataset.nav); });
    });

    var cp = $('#copyLink', sheet);
    if (cp) cp.addEventListener('click', function () {
      var base = location.href.split('?')[0].split('#')[0];
      copyText(base + '?stage=' + sid);
      toast('已复制这一关的链接', 'ok');
    });

    $$('[data-close]', sheet).forEach(function (b) {
      b.addEventListener('click', closeSheet);
    });
  }

  function closeSheet() {
    $('#sheetWrap').hidden = true;
    document.body.style.overflow = '';
  }

  function toggleTask(wid, sid, i) {
    var lvBefore = levelOf(totalExp());
    var k = taskKey(sid, i);
    var on = !S.worlds[wid].tasks[k];
    if (on) S.worlds[wid].tasks[k] = true; else delete S.worlds[wid].tasks[k];
    save();
    sfx(on ? 'tick' : 'bad');
    if (on) toast('+' + TASK_XP + ' EXP', 'xp');
    renderHUD();
    renderMap();
    var sc = $('#sheet').scrollTop;
    openSheet(wid, sid);
    $('#sheet').scrollTop = sc;
    checkAch();
    checkLevel(lvBefore);
  }

  function checkLevel(lvBefore) {
    var lvNow = levelOf(totalExp());
    if (lvNow > lvBefore) { sfx('up'); showLevelUp(lvNow); }
  }

  function showLevelUp(lv) {
    var el = $('#levelup');
    var t = titleOf(lv);
    el.innerHTML =
      '<div class="lu-box">' +
        '<div class="lu-kicker">LEVEL UP</div>' +
        '<div class="lu-title">Lv.' + lv + '</div>' +
        '<div class="lu-sub">称号 · <b>' + t.name + '</b>　' + t.jp + '</div>' +
      '</div>';
    el.hidden = false;
    for (var i = 0; i < 26; i++) {
      var sp = document.createElement('i');
      sp.className = 'star';
      var ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 190;
      sp.style.left = '50%'; sp.style.top = '50%';
      sp.style.setProperty('--tx', Math.cos(ang) * dist + 'px');
      sp.style.setProperty('--ty', Math.sin(ang) * dist + 'px');
      sp.style.animationDelay = (Math.random() * 0.3) + 's';
      el.querySelector('.lu-box').appendChild(sp);
    }
    setTimeout(function () { el.hidden = true; el.innerHTML = ''; }, 2400);
  }

  /* ---------------- 考试 ---------------- */
  var EX = null;

  function startExam(wid, sid) {
    var w = world(wid), s = getStage(wid, sid);
    var qs = s.exam.q.map(function (q) { return q; }).slice();
    for (var i = qs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = qs[i]; qs[i] = qs[j]; qs[j] = t;
    }
    EX = { wid: wid, sid: sid, qs: qs, i: 0, ans: [], sel: -1, revealed: false, done: false };
    closeSheet();
    renderExam();
  }

  function renderExam() {
    var wrap = $('#examWrap');
    var s = getStage(EX.wid, EX.sid);
    var w = world(EX.wid);
    var q = EX.qs[EX.i];
    var total = EX.qs.length;

    var dots = '';
    for (var i = 0; i < total; i++) {
      var cls = '';
      if (EX.done) cls = (EX.ans[i] === EX.qs[i].a) ? 'ok' : 'no';
      else if (i < EX.i) cls = 'on';
      dots += '<i class="' + cls + '"></i>';
    }

    var opts = q.o.map(function (text, k) {
      var cls = 'opt';
      if (EX.done) {
        if (k === q.a) cls += ' right';
        else if (k === EX.ans[EX.i]) cls += ' wrong';
      } else if (EX.sel === k) cls += ' sel';
      return '<button class="' + cls + '" data-opt="' + k + '"' + (EX.done ? ' disabled' : '') + '>' +
        '<span class="k">' + 'ABCD'[k] + '</span><span>' + text + '</span></button>';
    }).join('');

    wrap.innerHTML =
      '<div class="exam"' + (EX.done ? '' : '') + '>' +
        '<div class="exam-top">' +
          '<div class="mini"><svg><use href="#mascot"/></svg></div>' +
          '<div class="et-t"><b>' + s.name + ' · 验收考试</b>' +
            '<span>' + (EX.done ? 'REVIEW' : 'QUESTION ' + (EX.i + 1) + ' / ' + total) + ' · 答对 ' + s.exam.need + ' 题合格</span></div>' +
          '<button class="btn btn-ghost" id="examQuit">退出</button>' +
        '</div>' +
        (EX.done ? '' : '<div class="dots">' + dots + '</div>') +
        (EX.done ? resultHTML() : questionHTML()) +
      '</div>';

    wrap.hidden = false;
    document.body.style.overflow = 'hidden';

    var quit = $('#examQuit');
    if (quit) quit.addEventListener('click', closeExam);

    if (EX.done) {
      $$('[data-act]').forEach(function (b) {
        b.addEventListener('click', function () {
          var act = b.dataset.act;
          if (act === 'map') { closeExam(); }
          else if (act === 'retry') { startExam(EX.wid, EX.sid); }
        });
      });
      return;
    }

    $$('.opt').forEach(function (b) {
      b.addEventListener('click', function () {
        EX.sel = +b.dataset.opt;
        sfx('tick');
        $$('.opt').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        var nb = $('#examNext');
        if (nb) nb.disabled = false;
      });
    });

    var nb = $('#examNext');
    if (nb) nb.addEventListener('click', function () {
      if (EX.sel < 0) return;
      EX.ans[EX.i] = EX.sel;
      EX.sel = -1;
      if (EX.i < EX.qs.length - 1) { EX.i++; renderExam(); }
      else finishExam();
    });

    function questionHTML() {
      return '<div class="q-card">' +
        '<div class="q-no">Q' + pad(EX.i + 1) + '</div>' +
        '<div class="q-text">' + q.q + '</div>' +
        '<div class="opts">' + opts + '</div>' +
      '</div>' +
      '<div class="exam-foot">' +
        '<span class="exam-note">答案不会显示对错，交卷后统一复盘</span>' +
        '<button class="btn btn-main" id="examNext" disabled>' +
          (EX.i < total - 1 ? '下一题' : '交卷') + '</button>' +
      '</div>';
    }
  }

  function resultHTML() {
    var s = getStage(EX.wid, EX.sid);
    var correct = 0;
    EX.qs.forEach(function (q, i) { if (EX.ans[i] === q.a) correct++; });
    var pass = correct >= s.exam.need;
    var lines = pass ? D.fish.examPass : D.fish.examFail;
    var say = lines[Math.floor(Math.random() * lines.length)];

    var review = EX.qs.map(function (q, i) {
      var ok = EX.ans[i] === q.a;
      return '<div class="rv ' + (ok ? 'ok' : 'no') + '">' +
        '<div class="rv-q"><i>' + (ok ? '✓' : '✕') + '</i><span>Q' + (i + 1) + '　' + q.q + '</span></div>' +
        '<div class="rv-a">正确答案：<b>' + 'ABCD'[q.a] + '. ' + q.o[q.a] + '</b></div>' +
        (q.e ? '<div class="rv-e">' + q.e + '</div>' : '') +
      '</div>';
    }).join('');

    return '<div class="result ' + (pass ? 'pass' : 'fail') + '">' +
        '<div class="verdict">' + (pass ? '合格' : '不合格') + '</div>' +
        '<div class="score">' + correct + '<small> / ' + EX.qs.length + '</small></div>' +
        '<div class="say">' +
          '<div class="mini"><svg><use href="#mascot"/></svg></div>' +
          '<p><b>蓝汐</b>' + say + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="review">' + review + '</div>' +
      '<div class="exam-foot" style="justify-content:center;gap:12px">' +
        (pass ? '' : '<button class="btn" data-act="retry">再考一次</button>') +
        '<button class="btn btn-main" data-act="map">回到地图</button>' +
      '</div>';
  }

  function finishExam() {
    EX.done = true;
    var s = getStage(EX.wid, EX.sid);
    var correct = 0;
    EX.qs.forEach(function (q, i) { if (EX.ans[i] === q.a) correct++; });
    var pass = correct >= s.exam.need;

    var rec = S.worlds[EX.wid].exams[EX.sid] || { attempts: 0, best: -1, passed: false };
    rec.attempts++;
    if (correct > rec.best) rec.best = correct;
    S.worlds[EX.wid].exams[EX.sid] = rec;

    var lvBefore = levelOf(totalExp());
    var justCleared = false;

    if (pass) {
      sfx('ok');
      var wasClear = cleared(EX.wid, s);
      rec.passed = true;
      if (!wasClear) {
        S.worlds[EX.wid].cleared[EX.sid] = true;
        justCleared = true;
        toast('通关 · ' + s.name + '　+' + CLEAR_XP + ' EXP', 'ok');
      } else {
        toast('合格 · 成绩已更新', 'ok');
      }
    } else {
      sfx('bad');
      toast('不合格。先读完解析，再来一次。', 'bad');
    }

    save();
    renderHUD();
    renderMap();
    renderExam();
    checkAch();

    var titled = justCleared ? showTitle(EX.wid, EX.sid) : false;
    if (titled) {
      setTimeout(function () { checkLevel(lvBefore); }, 3800);
    } else {
      checkLevel(lvBefore);
    }

    if (pass) {
      /* 解锁提示 */
      var w = world(EX.wid);
      var ms = mainStages(w);
      var idx = ms.indexOf(s);
      if (idx >= 0 && idx < ms.length - 1) {
        setTimeout(function () { toast('新关卡已解锁 · ' + ms[idx + 1].name, 'ach'); }, titled ? 4200 : 700);
      }
    }
  }

  /* ---------------- 称号获得 ---------------- */
  function showTitle(wid, sid) {
    var s = getStage(wid, sid);
    if (!s) return false;
    var m = (window.MILESTONE || {})[wid] || {};
    var mm = (m.stages || {})[sid] || {};
    if (!mm.rank) return false;

    var el = $('#titleGet');
    if (!el) return false;

    $('#tgRank').textContent = mm.rank;
    $('#tgStage').textContent = world(wid).name + ' · ' + s.name + ' 达成';
    $('#tgCap').textContent = mm.cap || '';
    el.hidden = false;
    sfx('up');

    /* 火花 */
    var box = $('.tg-box', el);
    $$('.tg-spark', box).forEach(function (x) { x.remove(); });
    for (var i = 0; i < 18; i++) {
      var sp = document.createElement('i');
      sp.className = 'tg-spark';
      var ang = Math.random() * Math.PI * 2;
      var dist = 120 + Math.random() * 220;
      sp.style.setProperty('--tx', Math.cos(ang) * dist + 'px');
      sp.style.setProperty('--ty', Math.sin(ang) * dist + 'px');
      sp.style.animationDelay = (Math.random() * 0.35) + 's';
      box.appendChild(sp);
    }

    clearTimeout(showTitle._t);
    showTitle._t = setTimeout(function () { el.hidden = true; }, 3600);
    return true;
  }

  function closeExam() {
    EX = null;
    $('#examWrap').hidden = true;
    document.body.style.overflow = '';
    renderWorlds(); renderWorldHead(); renderMap(); renderHUD();
    showFishLine();
  }

  /* ---------------- 情报 ---------------- */
  function weekStartKey() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    var dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    return dkey(d);
  }

  function renderIntel() {
    var I = window.INTEL;
    if (!I) return;
    if (!S.intel) S.intel = {};
    var wk = weekStartKey();
    var done = S.intel[wk] || [];

    $('#intelDesc').textContent = I.desc;
    $('#intelWeek').textContent = '本周 · ' + wk;
    $('#intelWeekly').innerHTML = I.weekly.map(function (t, i) {
      var on = done.indexOf(i) >= 0;
      return '<button class="task' + (on ? ' on' : '') + '" data-intel="' + i + '">' +
        '<span class="box"><svg><use href="#icon-check"/></svg></span>' +
        '<span class="tx"><b class="tx-t">' + t + '</b></span></button>';
    }).join('');

    $$('#intelWeekly .task').forEach(function (b) {
      b.addEventListener('click', function () { toggleIntel(+b.dataset.intel); });
    });

    var pct = I.weekly.length ? (done.length / I.weekly.length) * 100 : 0;
    $('#intelFill').style.width = pct + '%';
    $('#intelNum').textContent = done.length + ' / ' + I.weekly.length;

    var weeks = Object.keys(S.intel).filter(function (k) { return (S.intel[k] || []).length; }).length;
    $('#intelStat').textContent = '已经有 ' + weeks + ' 周做过情报整理。每周 20 分钟，一年就是 17 小时——' +
      '比追任何一条「重大突破」都值。';

    $('#intelSrc').innerHTML = I.sources.map(function (g) {
      return '<div class="src-group">' +
        '<div class="src-tier"><b>' + g.tier + '</b><span>' + g.items.length + ' 个源</span></div>' +
        g.items.map(function (it) {
          var inner = '<span class="res-k">' + g.label + '</span>' +
            '<span class="res-main"><b>' + it.t + '</b><em>' + it.n + '</em></span>' +
            '<span class="res-go">' + (it.u ? '↗' : '·') + '</span>';
          return it.u
            ? '<a class="res" href="' + it.u + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>'
            : '<div class="res res-flat">' + inner + '</div>';
        }).join('') +
        '</div>';
    }).join('');

    $('#intelFilter').innerHTML = I.filter.map(function (f, i) {
      return '<div class="filter-row"><span class="filter-no">0' + (i + 1) + '</span>' +
        '<div><b>' + f.q + '</b><em>' + f.a + '</em></div></div>';
    }).join('');

    $('#intelNoise').innerHTML = I.noise.map(function (x) { return '<li>' + x + '</li>'; }).join('');
  }

  function toggleIntel(i) {
    var wk = weekStartKey();
    if (!S.intel) S.intel = {};
    var arr = S.intel[wk] || (S.intel[wk] = []);
    var k = arr.indexOf(i);
    if (k >= 0) arr.splice(k, 1); else arr.push(i);
    if (!arr.length) delete S.intel[wk];
    save(); sfx('tick'); renderIntel();
  }

  /* ---------------- 术语 ---------------- */
  var glossFilter = { q: '', world: 'all', known: 'all' };

  function glossTerms() {
    return (window.GLOSSARY && window.GLOSSARY.terms) || [];
  }

  function glossStageOf(sid) {
    var loc = findStageAnywhere(sid);
    if (!loc) return { w: '', name: '' };
    return { w: loc.wid, name: world(loc.wid).name + ' · ' + getStage(loc.wid, sid).name };
  }

  function renderGloss() {
    var box = $('#glossList');
    if (!box) return;
    if (!S.gloss) S.gloss = { known: {}, daily: {} };
    var terms = glossTerms();

    var q = (glossFilter.q || '').toLowerCase();
    var list = terms.filter(function (t) {
      var w = glossStageOf(t.stage).w;
      if (glossFilter.world !== 'all' && w !== glossFilter.world) return false;
      var known = !!S.gloss.known[t.en];
      if (glossFilter.known === 'known' && !known) return false;
      if (glossFilter.known === 'todo' && known) return false;
      if (!q) return true;
      return (t.en + ' ' + t.zh + ' ' + t.def).toLowerCase().indexOf(q) >= 0;
    });

    $('#glossCount').textContent = Object.keys(S.gloss.known).length + ' / ' + terms.length;

    var worlds = [
      { id: 'all', name: '全部' }, { id: 'cs', name: '计算机' }, { id: 'dm', name: '数字媒体' },
      { id: 'edu', name: '素养' }, { id: 'create', name: '创作' }
    ];
    $('#glossChips').innerHTML =
      worlds.map(function (w) {
        return '<button class="chip' + (glossFilter.world === w.id ? ' on' : '') + '" data-w="' + w.id + '">' + w.name + '</button>';
      }).join('') +
      '<button class="chip' + (glossFilter.known === 'todo' ? ' on' : '') + '" data-k="todo">未掌握</button>' +
      '<button class="chip' + (glossFilter.known === 'known' ? ' on' : '') + '" data-k="known">已掌握</button>';

    $$('#glossChips .chip').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.w) { glossFilter.world = b.dataset.w; glossFilter.known = 'all'; }
        else glossFilter.known = glossFilter.known === b.dataset.k ? 'all' : b.dataset.k;
        sfx('tick'); renderGloss();
      });
    });

    renderGlossDaily();

    if (!list.length) {
      box.innerHTML = '<p class="hint">没有匹配的术语，换个关键词试试。</p>';
      return;
    }
    box.innerHTML = list.map(function (t) {
      var known = !!S.gloss.known[t.en];
      var st = glossStageOf(t.stage);
      return '<button class="gterm' + (known ? ' on' : '') + '" data-en="' + t.en + '">' +
        '<div class="gterm-top"><b>' + t.en + '</b><span class="gzh">' + t.zh + '</span>' +
          '<em class="gstage">' + (st.name || '通用') + '</em></div>' +
        '<p class="gdef">' + t.def + '</p>' +
        '<i class="gknow">' + (known ? '已掌握' : '标记掌握') + '</i>' +
      '</button>';
    }).join('');

    $$('#glossList .gterm').forEach(function (b) {
      b.addEventListener('click', function () { toggleGloss(b.dataset.en); });
    });
  }

  function renderGlossDaily() {
    var box = $('#glossDaily');
    if (!box) return;
    var d = todayKey();
    if (!S.gloss.daily || S.gloss.daily.date !== d) {
      var pool = glossTerms().filter(function (t) { return !S.gloss.known[t.en]; });
      if (pool.length < 3) pool = glossTerms().slice();
      var picked = [];
      var h = 2166136261;
      for (var i = 0; i < d.length; i++) { h ^= d.charCodeAt(i); h = Math.imul(h, 16777619); }
      while (picked.length < Math.min(3, pool.length)) {
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        var t = pool[Math.abs(h) % pool.length];
        if (picked.indexOf(t) < 0) picked.push(t);
      }
      S.gloss.daily = { date: d, items: picked.map(function (t) { return t.en; }) };
      save();
    }
    $('#glossDailyDate').textContent = d;
    var byEn = {};
    glossTerms().forEach(function (t) { byEn[t.en] = t; });
    var items = (S.gloss.daily.items || []).map(function (en) { return byEn[en]; }).filter(Boolean);
    box.innerHTML = items.map(function (t) {
      return '<div class="gd-card"><b>' + t.en + '</b><span>' + t.zh + '</span><p>' + t.def + '</p></div>';
    }).join('');
  }

  function toggleGloss(en) {
    if (!S.gloss.known) S.gloss.known = {};
    if (S.gloss.known[en]) delete S.gloss.known[en]; else S.gloss.known[en] = true;
    save(); sfx('tick'); renderGloss();
  }

  /* ---------------- 打卡 ---------------- */
  function renderCheckin() {
    var tk = todayKey();
    var done = !!S.checkins[tk];
    var btn = $('#checkinBtn');
    btn.disabled = done;
    btn.textContent = done ? '今天已经报到了' : '今天也来了';
    $('#checkinHint').textContent = done
      ? '明天见。断三天就断连击。'
      : '每次报到 +' + CHECKIN_BASE + ' EXP，连击越高奖励越多（上限 +20）。';
    $('#streakNum').textContent = streakNow();
    $('#streakBest').textContent = '最长 ' + maxStreak() + ' 天';
    renderHeatmap();
  }

  function doCheckin() {
    var tk = todayKey();
    if (S.checkins[tk]) return;
    var lvBefore = levelOf(totalExp());
    var st = streakNow();
    var bonus = Math.min(st, 10) * 2;
    var xp = CHECKIN_BASE + bonus;
    S.checkins[tk] = { xp: xp, streak: st + 1, t: Date.now() };
    save();
    sfx('ok');
    toast('报到成功　+' + xp + ' EXP' + (bonus ? '（连击 +' + bonus + '）' : ''), 'xp');
    renderHUD(); renderCheckin(); checkAch(); checkLevel(lvBefore);
    showFishLine();
  }

  function renderHeatmap() {
    var box = $('#heatmap');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var dow = (today.getDay() + 6) % 7;          /* 周一 = 0 */
    var start = new Date(today);
    start.setDate(start.getDate() - dow - 12 * 7);
    var cells = '';
    for (var i = 0; i < 13 * 7; i++) {
      var d = new Date(start);
      d.setDate(start.getDate() + i);
      if (d > today) { cells += '<i style="visibility:hidden"></i>'; continue; }
      var k = dkey(d);
      var rec = S.checkins[k];
      var cls = 'heatmap-cell';
      if (rec) cls += ' l4';
      if (k === todayKey()) cls += ' today';
      cells += '<i class="' + (rec ? 'l4' : '') + (k === todayKey() ? ' today' : '') + '" title="' + k + (rec ? ' · +' + (Math.round(Number(rec.xp)) || 0) + ' EXP' : '') + '"></i>';
    }
    box.innerHTML = cells;
  }

  /* ---------------- 成就 ---------------- */
  function achDone(id) { return !!S.ach[id]; }

  function achState() {
    var tasks = totalTasks();
    var clears = totalClears();
    var lv = levelOf(totalExp());
    var csW = world('cs'), dmW = world('dm');
    var csMain = mainStages(csW), dmMain = mainStages(dmW);
    var csAll = csMain.every(function (s) { return cleared('cs', s); });
    var dmAll = dmMain.every(function (s) { return cleared('dm', s); });
    var perfect = false;
    D.worlds.forEach(function (w) {
      Object.keys(S.worlds[w.id].exams).forEach(function (k) {
        var rec = S.worlds[w.id].exams[k];
        var st = getStage(w.id, k);
        if (rec && st && rec.best >= st.exam.q.length) perfect = true;
      });
    });
    return {
      checkin1: Object.keys(S.checkins).length >= 1,
      streak7: maxStreak() >= 7,
      task1: tasks >= 1,
      clear1: clears >= 1,
      dual: Object.keys(S.worlds.cs.cleared).length > 0 && Object.keys(S.worlds.dm.cleared).length > 0,
      task30: tasks >= 30,
      task60: tasks >= 60,
      allcs: csAll,
      alldm: dmAll,
      perfect: perfect,
      lv5: lv >= 5,
      lv9: lv >= 9,
      eduall: ['e1', 'e2', 'e3'].every(function (id) {
        return !!(S.worlds.edu && S.worlds.edu.cleared[id]);
      }),
      create1: !!(S.worlds.create && Object.keys(S.worlds.create.cleared).length > 0),
      dmai: !!(S.worlds.dm && S.worlds.dm.cleared.dmai)
    };
  }

  function checkAch(silent) {
    var st = achState();
    var got = [];
    D.achievements.forEach(function (a) {
      if (!S.ach[a.id] && st[a.key]) { S.ach[a.id] = true; got.push(a); }
    });
    if (got.length) {
      save();
      if (!silent) got.forEach(function (a, i) {
        setTimeout(function () { toast('成就解锁 · ' + a.name, 'ach'); sfx('ok'); }, i * 260);
      });
    }
    return got;
  }

  function renderAch() {
    var st = achState();
    var box = $('#achGrid');
    var on = 0;
    box.innerHTML = D.achievements.map(function (a) {
      var got = achDone(a.id) || st[a.key];
      if (got) on++;
      return '<div class="ach' + (got ? ' on' : '') + '">' +
        (got ? '' : '<svg class="lock-ic"><use href="#icon-lock"/></svg>') +
        '<div class="ic">' + a.icon + '</div>' +
        '<b>' + a.name + '</b>' +
        '<span>' + a.desc + '</span>' +
      '</div>';
    }).join('');
    $('#achCount').textContent = on + ' / ' + D.achievements.length;
  }

  /* ---------------- 存档 ---------------- */
  function renderSave() {
    $('#nameInput').value = S.player.name;
    $('#soundToggle').checked = S.settings.sound;
  }

  /* ---------------- 视图 ---------------- */
  var VIEWS = ['map', 'sprint', 'intel', 'gloss', 'checkin', 'ach', 'save'];
  function go(view) {
    VIEWS.forEach(function (v) {
      var el = document.getElementById('view-' + v);
      if (!el) return;
      el.classList.toggle('is-on', v === view);
      el.hidden = false;
    });
    $$('.tab').forEach(function (t) {
      t.classList.toggle('is-on', t.dataset.view === view);
    });
    if (view === 'checkin') renderCheckin();
    if (view === 'sprint') renderSprint();
    if (view === 'intel') renderIntel();
    if (view === 'gloss') renderGloss();
    if (view === 'ach') renderAch();
    if (view === 'save') renderSave();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showFishLine() {
    var pool = D.fish.idle;
    var line = pool[Math.floor(Math.random() * pool.length)];
    $('#fishLine').innerHTML = line;
  }

  /* ---------------- 初始化 ---------------- */
  function init() {
    renderHUD();
    renderWorlds();
    renderWorldHead();
    renderMap();
    checkAch(true);
    renderHUD();

    $$('.tab').forEach(function (t) {
      t.addEventListener('click', function () { sfx('tick'); go(t.dataset.view); });
    });

    $('#checkinBtn').addEventListener('click', doCheckin);

    $('#glossSearch').addEventListener('input', function (e) {
      glossFilter.q = e.target.value.trim();
      renderGloss();
    });

    $('#nameInput').addEventListener('input', function (e) {
      S.player.name = (e.target.value || '').trim().slice(0, 12) || '无名猎人';
      save(); renderHUD();
    });

    $('#soundToggle').addEventListener('change', function (e) {
      S.settings.sound = e.target.checked; save();
      if (e.target.checked) sfx('tick');
    });

    $('#exportBtn').addEventListener('click', function () {
      var box = $('#saveBox');
      box.value = JSON.stringify(S, null, 2);
      box.select();
      try {
        navigator.clipboard.writeText(box.value).then(function () { toast('存档已复制到剪贴板', 'ok'); })
          .catch(function () { try { document.execCommand('copy'); toast('存档已复制', 'ok'); } catch (e) { toast('请手动复制下面的 JSON', 'xp'); } });
      } catch (e) { toast('请手动复制下面的 JSON', 'xp'); }
    });

    $('#importBtn').addEventListener('click', function () {
      var txt = $('#saveBox').value.trim();
      if (!txt) { toast('先把存档 JSON 粘贴进来', 'bad'); return; }
      var p;
      try { p = JSON.parse(txt); } catch (e) { toast('JSON 格式不对', 'bad'); return; }
      if (!p || !p.worlds) { toast('这不是一个有效存档', 'bad'); return; }
      S = p;
      if (!S.player) S.player = { name: '无名猎人' };
      /* 存档是外部输入：名字只保留纯文本，防止导入恶意 JSON 时注入 */
      S.player.name = String(S.player.name || '无名猎人').replace(/[<>"'&]/g, '').slice(0, 12) || '无名猎人';
      if (!S.checkins) S.checkins = {};
      if (!S.ach) S.ach = {};
      if (!S.settings) S.settings = { sound: true };
      if (!S.intel) S.intel = {};
      if (!S.gloss) S.gloss = { known: {}, daily: {} };
      if (!S.worlds) S.worlds = {};
      D.worlds.forEach(function (w) {
        if (!S.worlds[w.id]) S.worlds[w.id] = blankWorld();
        var x = S.worlds[w.id];
        x.tasks = x.tasks || {};
        x.cleared = x.cleared || {};
        x.exams = x.exams || {};
      });
      save();
      renderAll();
      toast('存档已导入', 'ok');
    });

    $('#resetBtn').addEventListener('click', function () {
      if (!window.confirm('确定清空所有进度？这一步不可撤销。')) return;
      if (!window.confirm('再确认一次：任务、考试、打卡全部清零。')) return;
      try { window.localStorage.removeItem(KEY); } catch (e) {}
      S = defState();
      save();
      renderAll();
      toast('已重置。从第 0 关重新开始。', 'xp');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!$('#examWrap').hidden) closeExam();
        else if (!$('#sheetWrap').hidden) closeSheet();
      }
    });

    $('#sheetWrap').addEventListener('click', function (e) {
      if (e.target.dataset.close) closeSheet();
    });

    var tg = $('#titleGet');
    if (tg) tg.addEventListener('click', function () { tg.hidden = true; });

    showFishLine();
    setInterval(showFishLine, 12000);

    /* 进度能否落盘 */
    var persist = true;
    try {
      window.localStorage.setItem('__t__', '1');
      window.localStorage.removeItem('__t__');
    } catch (e) { persist = false; }
    if (!persist) {
      setTimeout(function () {
        toast('当前环境无法保存进度，建议用本地服务器打开', 'bad');
      }, 900);
    }

    applyQuery();
  }

  /* 深链接：?view=checkin / ?stage=dm3 / ?exam=dm0 */
  function findStageAnywhere(sid) {
    for (var i = 0; i < D.worlds.length; i++) {
      var w = D.worlds[i];
      for (var j = 0; j < w.stages.length; j++) {
        if (w.stages[j].id === sid) return { wid: w.id, sid: sid };
      }
    }
    return null;
  }

  function applyQuery() {
    var q;
    try { q = new URLSearchParams(window.location.search); } catch (e) { return; }
    var v = q.get('view');
    if (v && VIEWS.indexOf(v) >= 0) go(v);
    var stg = q.get('stage');
    if (stg) {
      var hit = findStageAnywhere(stg);
      if (hit) {
        S.lastWorld = hit.wid;
        renderWorlds(); renderWorldHead(); renderMap();
        openSheet(hit.wid, hit.sid);
      }
    }
    var ex = q.get('exam');
    if (ex) {
      var h2 = findStageAnywhere(ex);
      if (h2) startExam(h2.wid, h2.sid);
    }
  }

  function renderAll() {
    renderHUD();
    renderWorlds();
    renderWorldHead();
    renderMap();
    renderCheckin();
    renderAch();
    renderSave();
    $('#saveBox').value = '';
  }

  init();
})();
