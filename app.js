// ── DATA ────────────────────────────────────────────────────────────────────

// Tricks have no difficulty rating — just name, category, and a base success rate
// used for bot probability calculations. Base rate = ~pro skater consistency.
const TRICKS = [
  // FLATGROUND
  { id: 'ollie',       name: 'Ollie',           cat: 'flatground', base: .96 },
  { id: 'pop_shove',   name: 'Pop Shove-it',    cat: 'flatground', base: .88 },
  { id: 'bs180',       name: 'Backside 180',    cat: 'flatground', base: .86 },
  { id: 'fs180',       name: 'Frontside 180',   cat: 'flatground', base: .84 },
  { id: 'kickflip',    name: 'Kickflip',        cat: 'flatground', base: .80 },
  { id: 'heelflip',    name: 'Heelflip',        cat: 'flatground', base: .78 },
  { id: 'varial_kick', name: 'Varial Kickflip', cat: 'flatground', base: .72 },
  { id: 'varial_heel', name: 'Varial Heelflip', cat: 'flatground', base: .69 },
  { id: 'bs_flip',     name: 'Backside Flip',   cat: 'flatground', base: .65 },
  { id: 'fs_flip',     name: 'Frontside Flip',  cat: 'flatground', base: .62 },
  { id: '360_shove',   name: '360 Shove-it',    cat: 'flatground', base: .68 },
  { id: 'hardflip',    name: 'Hardflip',        cat: 'flatground', base: .55 },
  { id: 'inward_heel', name: 'Inward Heelflip', cat: 'flatground', base: .52 },
  { id: 'tre_flip',    name: '360 Flip',        cat: 'flatground', base: .50 },
  { id: 'double_kick', name: 'Double Kickflip', cat: 'flatground', base: .44 },
  // GRINDS & SLIDES
  { id: '5050',        name: '50-50 Grind',     cat: 'grind', base: .92 },
  { id: 'boardslide',  name: 'Boardslide',      cat: 'grind', base: .88 },
  { id: 'tailslide',   name: 'Tailslide',       cat: 'grind', base: .83 },
  { id: 'noseslide',   name: 'Noseslide',       cat: 'grind', base: .81 },
  { id: 'five_o',      name: '5-0 Grind',       cat: 'grind', base: .76 },
  { id: 'nosegrind',   name: 'Nosegrind',       cat: 'grind', base: .72 },
  { id: 'bluntslide',  name: 'Bluntslide',      cat: 'grind', base: .66 },
  { id: 'crook',       name: 'Crooked Grind',   cat: 'grind', base: .63 },
  { id: 'feeble',      name: 'Feeble Grind',    cat: 'grind', base: .60 },
  { id: 'smith',       name: 'Smith Grind',     cat: 'grind', base: .53 },
  { id: 'lipslide',    name: 'Lipslide',        cat: 'grind', base: .50 },
  { id: 'suski',       name: 'Suski Grind',     cat: 'grind', base: .46 },
  // RAMPS (light transition tricks — coping & stalls, no big airs)
  { id: 'drop_in',     name: 'Drop In',         cat: 'ramp',  base: .95 },
  { id: 'kickturn',    name: 'Kickturn',        cat: 'ramp',  base: .88 },
  { id: 'fakie_kt',    name: 'Fakie Kickturn',  cat: 'ramp',  base: .82 },
  { id: 'rock_fakie',  name: 'Rock to Fakie',   cat: 'ramp',  base: .78 },
  { id: 'tail_stall',  name: 'Tail Stall',      cat: 'ramp',  base: .74 },
  { id: 'nose_stall',  name: 'Nose Stall',      cat: 'ramp',  base: .70 },
  { id: '5050_stall',  name: '50-50 Stall',     cat: 'ramp',  base: .68 },
  { id: 'rock_roll',   name: 'Rock n Roll',     cat: 'ramp',  base: .66 },
  { id: 'axle_stall',  name: 'Axle Stall',      cat: 'ramp',  base: .62 },
  { id: 'pivot_fakie', name: 'Pivot Fakie',     cat: 'ramp',  base: .58 },
  { id: 'disaster',    name: 'Disaster',        cat: 'ramp',  base: .52 },
];

const TRICK_MAP = Object.fromEntries(TRICKS.map(t => [t.id, t]));
const SKATE = ['S','K','A','T','E'];

// Default preset pools — which tricks each difficulty starts with
const DEFAULT_POOLS = {
  easy: new Set([
    'ollie','pop_shove','bs180','fs180',
    '5050','boardslide','tailslide','noseslide',
    'drop_in','kickturn','fakie_kt','rock_fakie',
  ]),
  medium: new Set([
    'ollie','pop_shove','bs180','fs180',
    'kickflip','heelflip','varial_kick','varial_heel','bs_flip','fs_flip','360_shove',
    '5050','boardslide','tailslide','noseslide',
    'five_o','nosegrind','bluntslide','crook','feeble',
    'drop_in','kickturn','fakie_kt','rock_fakie',
    'tail_stall','nose_stall','5050_stall','rock_roll','axle_stall',
  ]),
  hard: new Set(TRICKS.map(t => t.id)),
};

// Default accuracy ranges per difficulty [min%, max%]
// Higher difficulty = bot lands more consistently = harder to beat
const DEFAULT_ACCURACY = {
  easy:   [38, 65],
  medium: [58, 80],
  hard:   [78, 95],
};

// ── STATE ────────────────────────────────────────────────────────────────────

let S = {
  screen: 'menu',
  difficulty: 'medium',
  settingsOpen: false,
  customTricks: [],   // user-created tricks (persist for session)
  // user-editable presets (cloned from defaults)
  presets: {
    easy:   { tricks: new Set(DEFAULT_POOLS.easy),   accMin: DEFAULT_ACCURACY.easy[0],   accMax: DEFAULT_ACCURACY.easy[1]   },
    medium: { tricks: new Set(DEFAULT_POOLS.medium), accMin: DEFAULT_ACCURACY.medium[0], accMax: DEFAULT_ACCURACY.medium[1] },
    hard:   { tricks: new Set(DEFAULT_POOLS.hard),   accMin: DEFAULT_ACCURACY.hard[0],   accMax: DEFAULT_ACCURACY.hard[1]   },
  },
  // game
  playerLetters: 0,
  botLetters: 0,
  setter: 'player',
  phase: 'setter_pick',
  trick: null,
  picked: null,
  msgText: null,
  msgType: null,
  log: [],
  winner: null,
};

// ── ANIMATION HELPERS ────────────────────────────────────────────────────────

let prev = { playerLetters: 0, botLetters: 0, trick: null, setter: null, phase: null };
let menuShownOnce = false;

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function triggerAnim(el, className, duration) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // force reflow so animation restarts
  el.classList.add(className);
  if (duration) setTimeout(() => el.classList.remove(className), duration);
}

function flashScreen(color) {
  const f = document.getElementById('screen-flash');
  if (!f) return;
  f.classList.remove('flash-red', 'flash-green', 'flash-yellow');
  void f.offsetWidth;
  f.classList.add('flash-' + color);
  setTimeout(() => f.classList.remove('flash-' + color), 600);
}

function showCallout(text, type = 'info') {
  const container = document.getElementById('callout-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `callout callout-${type}`;
  el.textContent = text;
  el.style.setProperty('--ox',  ((Math.random() - .5) * 40) + 'px');
  el.style.setProperty('--oy',  ((Math.random() - .5) * 40 - 10) + 'px');
  el.style.setProperty('--rot', ((Math.random() - .5) * 16) + 'deg');
  container.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function spawnConfetti(count = 80) {
  const colors = ['#f5c518', '#44cc77', '#5bbde8', '#e89040', '#ee4444', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = (Math.random() * 100) + 'vw';
    el.style.background = pick(colors);
    el.style.animationDelay = (Math.random() * 1.4) + 's';
    el.style.animationDuration = (2 + Math.random() * 1.5) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
}

function spawnSparks(count = 18, color = '#f5c518') {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'spark';
    el.style.background = color;
    el.style.boxShadow = `0 0 8px ${color}`;
    el.style.setProperty('--sx', (Math.random() * 100) + 'vw');
    el.style.animationDelay = (Math.random() * .4) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function botPool()      { return TRICKS.filter(t => S.presets[S.difficulty].tricks.has(t.id)); }
function botRate(trick) {
  const { accMin, accMax } = S.presets[S.difficulty];
  const acc = accMin + Math.random() * (accMax - accMin);
  return (acc / 100) * trick.base;
}
function botRoll(t)     { return Math.random() < botRate(t); }
function botPick()      { const p = botPool(); return p.length ? p[Math.floor(Math.random() * p.length)] : TRICKS[0]; }

function addLetter(who) {
  if (who === 'player') { S.playerLetters++; if (S.playerLetters >= 5) { S.winner = 'bot';    S.screen = 'gameover'; } }
  else                  { S.botLetters++;    if (S.botLetters    >= 5) { S.winner = 'player'; S.screen = 'gameover'; } }
}
function log(text, type) { S.log.unshift({ text, type }); if (S.log.length > 30) S.log.pop(); }
function msg(text, type = null) { S.msgText = text; S.msgType = type; }

// ── GAME LOGIC ───────────────────────────────────────────────────────────────

function startGame() {
  S.setter = Math.random() < .5 ? 'player' : 'bot';
  S.playerLetters = 0; S.botLetters = 0;
  S.phase = 'setter_pick'; S.trick = null; S.picked = null;
  S.log = []; S.winner = null;
  prev = { playerLetters: 0, botLetters: 0, trick: null, setter: null, phase: null };
  msg(`Coin flip: ${S.setter === 'player' ? 'YOU set first!' : 'BOT sets first!'}`);
  S.screen = 'game';
  render();
  setTimeout(() => {
    showCallout(S.setter === 'player' ? 'YOU SET FIRST' : 'BOT SETS FIRST', 'info');
  }, 250);
  if (S.setter === 'bot') setTimeout(doBotPick, 1500);
}

function doBotPick() {
  S.trick = botPick();
  S.phase = 'setter_attempt';
  msg(`Bot picked: ${S.trick.name} — attempting...`);
  render();
  setTimeout(doBotSetterAttempt, 1400);
}

function doBotSetterAttempt() {
  if (botRoll(S.trick)) {
    showCallout(pick(['BOT LANDS IT', 'BOT STUCK IT', 'BOT POPS']), 'sick');
    msg(`Bot landed the ${S.trick.name}! Your turn to match it.`, 'ok');
    log(`Bot landed ${S.trick.name} (set)`, 'land');
    S.phase = 'matcher_attempt';
  } else {
    showCallout(pick(['BOT BAILED!', 'BOT SLAMMED!', 'BOT ATE IT!']), 'bail');
    flashScreen('yellow');
    msg(`Bot bailed the ${S.trick.name}. No letter — your turn to set.`, 'bad');
    log(`Bot bailed ${S.trick.name} — round resets`, 'bail');
    S.setter = 'player'; S.trick = null; S.picked = null; S.phase = 'setter_pick';
  }
  render();
}

function doBotMatchAttempt() {
  if (botRoll(S.trick)) {
    showCallout(pick(['BOT MATCHED', 'BOT NAILED IT', 'BOT GOT IT']), 'sick');
    msg(`Bot matched the ${S.trick.name}. Bot sets next.`, 'ok');
    log(`Bot matched ${S.trick.name}`, 'land');
    S.setter = 'bot'; S.trick = null; S.picked = null; S.phase = 'setter_pick';
    render();
    setTimeout(doBotPick, 1100);
  } else {
    showCallout(pick(['BOT WIPED OUT!', 'BOT BAILED!', 'BOT EATS IT!']), 'bail');
    const letter = SKATE[S.botLetters];
    addLetter('bot');
    if (S.screen === 'gameover') { render(); return; }
    msg(`Bot bailed! Bot gets "${letter}". You set again.`, 'bad');
    log(`Bot bailed ${S.trick.name} — BOT gets ${letter}`, 'bail');
    S.trick = null; S.picked = null; S.phase = 'setter_pick';
    render();
  }
}

// ── PLAYER ACTIONS ───────────────────────────────────────────────────────────

function pickTrick(id) {
  S.picked = id;
  document.querySelectorAll('.trick-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.pick === id);
  });
  const attemptBtn = document.getElementById('attempt-btn');
  if (attemptBtn) attemptBtn.disabled = false;
}

function playerAttemptSet() {
  const t = TRICK_MAP[S.picked];
  if (!t) return;
  S.trick = t; S.phase = 'setter_attempt';
  msg(`You're attempting: ${t.name} — did you land it?`);
  render();
}

function playerLand() {
  triggerAnim(document.getElementById('land-btn'), 'pressed', 400);
  if (S.phase === 'setter_attempt') {
    showCallout(pick(['SICK!', 'STUCK IT!', 'POPPED!', 'NAILED IT!', 'CLEAN!']), 'sick');
    flashScreen('green');
    log(`You set & landed ${S.trick.name}`, 'land');
    msg(`You landed it! Bot must now attempt: ${S.trick.name}.`, 'ok');
    S.phase = 'matcher_attempt';
    render();
    setTimeout(doBotMatchAttempt, 1400);
  } else if (S.phase === 'matcher_attempt') {
    showCallout(pick(['MATCHED!', 'CLEAN!', 'RIPPING!', 'SHRED!', 'SMOOTH!']), 'sick');
    flashScreen('green');
    log(`You matched ${S.trick.name}`, 'land');
    msg(`You matched it! Your turn to set.`, 'ok');
    S.setter = 'player'; S.trick = null; S.picked = null; S.phase = 'setter_pick';
    render();
  }
}

function playerBail() {
  triggerAnim(document.getElementById('bail-btn'), 'pressed', 400);
  if (S.phase === 'setter_attempt') {
    showCallout(pick(['SLAM!', 'EAT IT!', 'OUCH!', 'CHUNDER!']), 'bail');
    log(`You bailed ${S.trick.name} (your set) — round resets`, 'bail');
    msg(`You bailed your own trick. No letter — bot sets next.`, 'bad');
    S.setter = 'bot'; S.trick = null; S.picked = null; S.phase = 'setter_pick';
    render();
    setTimeout(doBotPick, 1100);
  } else if (S.phase === 'matcher_attempt') {
    showCallout(pick(['WIPEOUT!', 'SLAMMED!', 'BUSTED!', 'KOOK!']), 'bail');
    const letter = SKATE[S.playerLetters];
    addLetter('player');
    if (S.screen === 'gameover') { render(); return; }
    log(`You bailed ${S.trick.name} — YOU get ${letter}`, 'bail');
    msg(`You bailed! You get the letter "${letter}". Bot sets again.`, 'bad');
    S.trick = null; S.picked = null; S.phase = 'setter_pick';
    render();
    setTimeout(doBotPick, 1100);
  }
}

// ── RENDER ───────────────────────────────────────────────────────────────────

let gameInitialized = false;

function render() {
  document.body.classList.remove('screen-menu', 'screen-game', 'screen-gameover');
  document.body.classList.add('screen-' + S.screen);
  const app = document.getElementById('app');
  if (S.screen === 'menu') {
    gameInitialized = false;
    app.innerHTML = renderMenu();
    bindMenu();
  } else if (S.screen === 'game') {
    if (!gameInitialized) {
      app.innerHTML = renderGameShell();
      gameInitialized = true;
    }
    updateGame();
  } else {
    gameInitialized = false;
    app.innerHTML = renderGameover();
    bindGameover();
    if (S.winner === 'player') {
      setTimeout(() => spawnConfetti(100), 250);
      setTimeout(() => showCallout('CHAMPION!', 'sick'), 600);
    } else {
      setTimeout(() => showCallout('GAME OVER', 'bail'), 600);
    }
  }
}

// ── MENU ──

function renderMenu() {
  const diffs = ['easy','medium','hard'];
  const meta  = { easy:{icon:'🟢',label:'Easy'}, medium:{icon:'🟡',label:'Medium'}, hard:{icon:'🔴',label:'Hard'} };
  const p     = S.presets[S.difficulty];

  return `
    <div class="title">SKATE</div>
    <div class="subtitle">You vs the Bot</div>

    <div class="label">Bot Difficulty</div>
    <div class="diff-grid">
      ${diffs.map(d => `
        <button class="diff-btn${S.difficulty===d?' active':''}" data-d="${d}">
          <span class="icon">${meta[d].icon}</span>${meta[d].label}
        </button>
      `).join('')}
    </div>

    <div class="settings-panel">
      <div class="settings-header" id="settings-toggle">
        <span class="settings-header-label">
          ${meta[S.difficulty].label} Settings
        </span>
        <span class="settings-chevron${S.settingsOpen?' open':''}">▼</span>
      </div>
      <div class="settings-body${S.settingsOpen?'':' hidden'}">
        <div style="margin-top:4px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
            <span class="label" style="margin:0">Bot Accuracy</span>
            <span style="font-size:15px;font-weight:700;color:var(--accent)" id="acc-range-display">${p.accMin}% – ${p.accMax}%</span>
          </div>
          <div class="accuracy-row" style="margin-bottom:8px">
            <span style="font-size:12px;color:var(--text-dim);width:28px">Min</span>
            <input type="range" id="acc-min" min="10" max="100" step="5" value="${p.accMin}">
            <span class="acc-val" id="acc-min-val">${p.accMin}%</span>
          </div>
          <div class="accuracy-row" style="margin-bottom:0">
            <span style="font-size:12px;color:var(--text-dim);width:28px">Max</span>
            <input type="range" id="acc-max" min="10" max="100" step="5" value="${p.accMax}">
            <span class="acc-val" id="acc-max-val">${p.accMax}%</span>
          </div>
        </div>

        <div class="label">Trick Pool</div>
        ${renderSettingToggles()}

        <div style="margin-top:14px">
          <button id="reset-btn" style="
            background:none; border:none; color:var(--text-dim);
            font-size:12px; cursor:pointer; text-decoration:underline; padding:0;
          ">Reset to defaults</button>
        </div>
      </div>
    </div>

    <button class="btn-primary" id="start-btn">DROP IN</button>
  `;
}

function renderSettingToggles() {
  const cats = [
    { key: 'flatground', label: 'Flatground',      cls: 'flat'  },
    { key: 'grind',      label: 'Grinds & Slides', cls: 'grind' },
    { key: 'ramp',       label: 'Ramps',            cls: 'ramp'  },
  ];
  const pool = S.presets[S.difficulty].tricks;
  return cats.map(c => `
    <div class="cat-label" style="color:var(--text-dim)">
      <div class="cat-dot ${c.cls}"></div>${c.label}
    </div>
    <div class="toggle-grid">
      ${TRICKS.filter(t=>t.cat===c.key).map(t => `
        <label class="trick-toggle">
          <input type="checkbox" data-t="${t.id}" ${pool.has(t.id)?'checked':''}>
          ${t.name}
        </label>
      `).join('')}
    </div>
  `).join('');
}

function bindMenu() {
  if (!menuShownOnce) {
    document.body.classList.add('menu-first');
    menuShownOnce = true;
    setTimeout(() => document.body.classList.remove('menu-first'), 2000);
  }

  document.querySelectorAll('.diff-btn').forEach(b =>
    b.addEventListener('click', () => { S.difficulty = b.dataset.d; render(); })
  );

  document.getElementById('settings-toggle').addEventListener('click', () => {
    S.settingsOpen = !S.settingsOpen; render();
  });

  function updateRangeDisplay() {
    const p = S.presets[S.difficulty];
    document.getElementById('acc-range-display').textContent = `${p.accMin}% – ${p.accMax}%`;
  }

  const accMin = document.getElementById('acc-min');
  const accMax = document.getElementById('acc-max');
  if (accMin) accMin.addEventListener('input', () => {
    const val = +accMin.value;
    if (val > S.presets[S.difficulty].accMax) { accMin.value = S.presets[S.difficulty].accMax; return; }
    S.presets[S.difficulty].accMin = val;
    document.getElementById('acc-min-val').textContent = val + '%';
    updateRangeDisplay();
  });
  if (accMax) accMax.addEventListener('input', () => {
    const val = +accMax.value;
    if (val < S.presets[S.difficulty].accMin) { accMax.value = S.presets[S.difficulty].accMin; return; }
    S.presets[S.difficulty].accMax = val;
    document.getElementById('acc-max-val').textContent = val + '%';
    updateRangeDisplay();
  });

  document.querySelectorAll('input[data-t]').forEach(cb =>
    cb.addEventListener('change', () => {
      cb.checked
        ? S.presets[S.difficulty].tricks.add(cb.dataset.t)
        : S.presets[S.difficulty].tricks.delete(cb.dataset.t);
    })
  );

  document.getElementById('reset-btn')?.addEventListener('click', () => {
    S.presets[S.difficulty].tricks = new Set(DEFAULT_POOLS[S.difficulty]);
    const [min, max] = DEFAULT_ACCURACY[S.difficulty];
    S.presets[S.difficulty].accMin = min;
    S.presets[S.difficulty].accMax = max;
    render();
  });

  document.getElementById('start-btn').addEventListener('click', startGame);
}

// ── GAME SHELL (rendered once per session) ──

// letterHtml still used by gameover screen
function letterHtml(count) {
  return SKATE.map((l,i) =>
    `<div class="letter${i<count?' earned':''}">${l}</div>`
  ).join('');
}

function renderGameShell() {
  return `
    <div class="scoreboard">
      <div class="score-col">
        <div class="score-name">You</div>
        <div class="skate-letters">
          ${SKATE.map((l,i) => `<div class="letter" id="pl-${i}">${l}</div>`).join('')}
        </div>
      </div>
      <div class="vs-label">VS</div>
      <div class="score-col">
        <div class="score-name">Bot</div>
        <div class="skate-letters">
          ${SKATE.map((l,i) => `<div class="letter" id="bot-${i}">${l}</div>`).join('')}
        </div>
      </div>
    </div>

    <div class="state-box">
      <div class="setter-tag" id="setter-tag"></div>
      <div class="trick-name" id="trick-name" style="display:none"></div>
      <div class="state-msg"  id="state-msg"  style="display:none"></div>
    </div>

    <div id="game-content"></div>
    <div class="log" id="event-log" style="display:none"></div>
  `;
}

// ── SURGICAL UPDATERS ──

function updateGame() {
  updateLetters();
  updateStateBox();
  updateContent();
  updateLog();
}

function updateLetters() {
  SKATE.forEach((_, i) => {
    const plEl  = document.getElementById(`pl-${i}`);
    const botEl = document.getElementById(`bot-${i}`);
    const plEarned  = i < S.playerLetters;
    const botEarned = i < S.botLetters;

    if (plEl) {
      const was = plEl.classList.contains('earned');
      if (plEarned && !was)       { plEl.classList.add('earned'); triggerAnim(plEl, 'slam', 800); }
      else if (!plEarned && was)  { plEl.classList.remove('earned'); }
    }
    if (botEl) {
      const was = botEl.classList.contains('earned');
      if (botEarned && !was)      { botEl.classList.add('earned'); triggerAnim(botEl, 'slam', 800); }
      else if (!botEarned && was) { botEl.classList.remove('earned'); }
    }
  });

  // Big reactions on newly-earned letters
  if (S.playerLetters > prev.playerLetters) {
    triggerAnim(document.querySelector('.scoreboard'), 'shake', 600);
    flashScreen('red');
    showCallout(`"${SKATE[S.playerLetters - 1]}"!`, 'letter');
  }
  if (S.botLetters > prev.botLetters) {
    triggerAnim(document.querySelector('.scoreboard'), 'shake', 600);
    flashScreen('green');
    spawnSparks(20, '#44cc77');
  }

  prev.playerLetters = S.playerLetters;
  prev.botLetters    = S.botLetters;
}

function updateStateBox() {
  const botSetting = S.setter === 'bot';

  const setterEl = document.getElementById('setter-tag');
  setterEl.textContent = S.trick
    ? (botSetting ? '🤖 Bot Set' : '🛹 You Set')
    : (botSetting ? "🤖 Bot's Turn" : '🛹 Your Turn to Set');
  if (S.setter !== prev.setter) triggerAnim(setterEl, 'changed', 450);

  const trickEl = document.getElementById('trick-name');
  trickEl.textContent   = S.trick ? S.trick.name : '';
  trickEl.style.display = S.trick ? '' : 'none';
  // Color trick name based on most recent result
  if (S.trick) {
    if      (S.msgType === 'ok')  trickEl.style.color = 'var(--land)';
    else if (S.msgType === 'bad') trickEl.style.color = 'var(--bail)';
    else                          trickEl.style.color = '';
  } else {
    trickEl.style.color = '';
  }
  if (S.trick && S.trick !== prev.trick) triggerAnim(trickEl, 'reveal', 600);

  const msgEl = document.getElementById('state-msg');
  if (S.msgText) {
    msgEl.textContent = S.msgText;
    msgEl.className   = 'state-msg' + (S.msgType ? ' ' + S.msgType : '');
    msgEl.style.display = '';
  } else {
    msgEl.style.display = 'none';
  }

  if (S.phase !== prev.phase) {
    triggerAnim(document.querySelector('.state-box'), 'pulse', 850);
  }

  prev.trick  = S.trick;
  prev.setter = S.setter;
  prev.phase  = S.phase;
}

function updateContent() {
  const botSetting    = S.setter === 'bot';
  const playerSetting = !botSetting;

  let html = '';
  if      (S.phase === 'setter_pick'    && playerSetting) html = renderPicker();
  else if (S.phase === 'setter_attempt' && playerSetting) html = renderAttemptBtns('Did you land your set trick?');
  else if (S.phase === 'matcher_attempt' && botSetting)   html = renderAttemptBtns(`Can you match the ${S.trick?.name}?`);
  else                                                     html = renderBotThinking();

  const el = document.getElementById('game-content');
  if (el) { el.innerHTML = html; bindContent(); }
}

function updateLog() {
  const el = document.getElementById('event-log');
  if (!el) return;
  if (!S.log.length) { el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = S.log.map(e => `<div class="log-entry ${e.type}">${e.text}</div>`).join('');
}

function bindContent() {
  document.querySelectorAll('.trick-btn').forEach(b =>
    b.addEventListener('click', () => pickTrick(b.dataset.pick))
  );
  document.getElementById('attempt-btn')?.addEventListener('click', playerAttemptSet);
  document.getElementById('land-btn')?.addEventListener('click', playerLand);
  document.getElementById('bail-btn')?.addEventListener('click', playerBail);

  const custInput = document.getElementById('custom-trick-input');
  const custBtn   = document.getElementById('add-custom-trick');
  if (custInput) {
    custInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); addCustomTrick(); }
    });
  }
  if (custBtn) custBtn.addEventListener('click', addCustomTrick);
}

function addCustomTrick() {
  const input = document.getElementById('custom-trick-input');
  if (!input) return;
  const name = input.value.trim();
  if (!name) return;
  // de-dupe: if a custom trick with this name already exists, just select it
  const existing = S.customTricks.find(t => t.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    S.picked = existing.id;
    input.value = '';
    updateContent();
    document.getElementById('custom-trick-input')?.focus();
    return;
  }
  const id = 'custom_' + Date.now();
  const newTrick = { id, name, cat: 'other', base: .60, custom: true };
  S.customTricks.push(newTrick);
  TRICK_MAP[id] = newTrick;
  S.picked = id;            // auto-select the new trick
  input.value = '';
  updateContent();
  document.getElementById('custom-trick-input')?.focus();
}

function renderPicker() {
  const cats = [
    { key:'flatground', label:'Flatground',      cls:'flat',  color:'var(--flat)'  },
    { key:'grind',      label:'Grinds & Slides', cls:'grind', color:'var(--grind)' },
    { key:'ramp',       label:'Ramps',            cls:'ramp',  color:'var(--ramp)'  },
  ];
  return `
    <div class="trick-picker">
      <div class="picker-label">Pick your trick to set:</div>
      ${cats.map(c => `
        <div class="trick-cat-header" style="color:${c.color}">
          <div class="cat-dot ${c.cls}"></div>${c.label}
        </div>
        <div class="trick-grid">
          ${TRICKS.filter(t=>t.cat===c.key).map(t => `
            <button class="trick-btn ${c.cls}${S.picked===t.id?' selected':''}" data-pick="${t.id}">
              <div class="type-dot" style="background:${c.color}"></div>
              ${t.name}
            </button>
          `).join('')}
        </div>
      `).join('')}

      <div class="trick-cat-header" style="color:var(--other)">
        <div class="cat-dot other"></div>Other
      </div>
      ${S.customTricks.length ? `
        <div class="trick-grid">
          ${S.customTricks.map(t => `
            <button class="trick-btn other${S.picked===t.id?' selected':''}" data-pick="${t.id}">
              <div class="type-dot" style="background:var(--other)"></div>
              ${t.name}
            </button>
          `).join('')}
        </div>
      ` : ''}
      <div class="custom-trick-input">
        <input type="text" id="custom-trick-input" placeholder="Make your own trick..." maxlength="40">
        <button id="add-custom-trick" title="Add trick">+</button>
      </div>
    </div>
    <div class="action-row one">
      <button class="btn-set" id="attempt-btn"${!S.picked?' disabled':''}>ATTEMPT TRICK</button>
    </div>
  `;
}

function renderAttemptBtns(prompt) {
  return `
    <div style="font-size:13px;color:var(--text-dim);margin-bottom:10px">${prompt}</div>
    <div class="action-row two">
      <button class="btn-land" id="land-btn">LAND</button>
      <button class="btn-bail" id="bail-btn">BAIL</button>
    </div>
  `;
}

function renderBotThinking() {
  return `
    <div class="state-box" style="display:flex;align-items:center;min-height:64px">
      <div class="bot-thinking-arcade">
        <div class="skate-roll">
          <div class="board">
            <div class="deck"></div>
            <div class="truck back"></div>
            <div class="truck front"></div>
            <div class="wheel back"></div>
            <div class="wheel front"></div>
          </div>
        </div>
        <span>Bot is shredding...</span>
      </div>
    </div>
  `;
}

// ── GAME OVER ──

function renderGameover() {
  const won = S.winner === 'player';
  return `
    <div class="gameover">
      <div class="title ${won?'win':'lose'}">${won ? 'YOU WIN' : 'BOT WINS'}</div>
      <div class="gameover-sub">${won ? 'Bot spells SKATE!' : 'You spell SKATE!'}</div>
      <div class="gameover-scores">
        <div class="gameover-score">
          <div class="score-name">You</div>
          <div class="skate-letters">${letterHtml(S.playerLetters)}</div>
        </div>
        <div class="gameover-score">
          <div class="score-name">Bot</div>
          <div class="skate-letters">${letterHtml(S.botLetters)}</div>
        </div>
      </div>
      <div class="gameover-btns">
        <button class="btn-primary" id="play-again" style="width:auto;padding:14px 36px">Play Again</button>
        <button class="btn-secondary" id="go-menu">Menu</button>
      </div>
    </div>
  `;
}

function bindGameover() {
  document.getElementById('play-again').addEventListener('click', startGame);
  document.getElementById('go-menu').addEventListener('click', () => { S.screen='menu'; render(); });
}

// ── SERVICE WORKER REGISTRATION (PWA install support) ────────────────────────

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service worker registered:', reg.scope))
      .catch(err => console.warn('Service worker registration failed:', err));
  });
}

// ── INIT ─────────────────────────────────────────────────────────────────────

render();
