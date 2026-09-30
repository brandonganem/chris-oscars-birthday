import { createScene } from './scene.js';
import { Sound } from './audio.js';
import * as D from './data.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const C = D.CONFIG;

// ── Toast ───────────────────────────────────────────
let toastTimer;
function toast(html, ms = 4200) {
  const t = $('#toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

// ── Scene ───────────────────────────────────────────
let factDeck = [];
const S = createScene($('#scene'), {
  decades: D.DECADES,
  onStatueClick() {
    if (!factDeck.length) factDeck = shuffle(D.STATUE_FACTS);
    Sound.sparkle();
    toast(`<b>DID YOU KNOW?</b>${factDeck.pop()}`);
  },
  onBillboardClick(i) { goDecade(i); },
  onCandleClick(i) { blow(i); },
});

const fontsReady = Promise.race([
  Promise.all([
    document.fonts.load('200px Limelight'),
    document.fonts.load('52px "Cormorant Garamond"'),
    document.fonts.load('italic 44px "Cormorant Garamond"'),
    document.fonts.load('600 38px "Josefin Sans"'),
  ]),
  wait(3500),
]);
fontsReady.then(() => {
  S.buildBoardTextures();
  S.setPlaque('And the Oscar goes to', '…', '');
});

// ── Screens ─────────────────────────────────────────
const SCENE_MODE = { menu: 'menu', round: 'quiz', quiz: 'quiz', results: 'quiz', walk: 'walk', speech: 'quiz', finale: 'finale', cake: 'cake', credits: 'credits' };
let current = 'intro';
function show(id) {
  current = id;
  $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  S.setMode(SCENE_MODE[id] || 'menu');
  const inGame = ['round', 'quiz', 'results'].includes(id);
  $('#scorePill').classList.toggle('hidden', !inGame);
  $('#streakPill').classList.toggle('hidden', !inGame || !game || game.streak < 2);
}

function cleanup() {
  stopTimer();
  stopSpeech();
  Sound.stopPlayoff();
  stopMic();
  S.fireworks(false);
  $('#creditsRoll').classList.remove('rolling');
}

function goHome() {
  cleanup();
  S.showCake(false);
  show('menu');
}

// ── Curtain ─────────────────────────────────────────
const enterBtn = $('#enter');
enterBtn.disabled = false;
enterBtn.textContent = '🎬 Raise the Curtain';
enterBtn.addEventListener('click', () => {
  Sound.init();
  Sound.fanfare();
  $('#curtain').classList.add('open');
  show('menu');
  setTimeout(() => S.burst(undefined, 220, 6), 900);
  setTimeout(() => { $('#curtain').style.display = 'none'; }, 3200);
});

$('#home').addEventListener('click', goHome);
$('#mute').addEventListener('click', () => {
  Sound.init();
  const m = Sound.toggleMute();
  $('#mute').textContent = m ? '🔇' : '🔊';
  if (m) speechSynthesis?.cancel();
});
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current !== 'intro') goHome();
  if (current === 'walk') {
    if (e.key === 'ArrowRight') stepDecade(1);
    if (e.key === 'ArrowLeft') stepDecade(-1);
  }
  if (current === 'quiz' && !answered && game) {
    const q = curQ();
    if (q.type === 'mc' && /^[1-4a-dA-D]$/.test(e.key)) {
      const idx = /\d/.test(e.key) ? +e.key - 1 : e.key.toLowerCase().charCodeAt(0) - 97;
      $$('#qOptions .opt')[idx]?.click();
    }
  }
});

$$('.ticket').forEach((b) => b.addEventListener('click', () => {
  const go = b.dataset.go;
  if (go === 'trivia') startGame();
  if (go === 'walk') enterWalk();
  if (go === 'speech') enterSpeech();
  if (go === 'finale') enterFinale();
}));

// ── Trivia ──────────────────────────────────────────
const ROUNDS = [
  { title: 'Classic Trivia', short: 'Classic', desc: 'Five questions from nearly a century of Oscar history. Faster answers earn more points.', time: 20 },
  { title: 'Best Picture… in Emoji', short: 'Emoji', desc: 'Every one of these won Best Picture. Can you decode it from three emoji?', time: 15 },
  { title: 'What Year Was That?', short: 'Year', desc: 'Slide to the year of the ceremony. Land within 2 years to win the statuette. Nail it for a bonus.', time: 25 },
];
let game = null;
let answered = false;
const curQ = () => game.questions[game.round][game.qi];

function buildQuestions() {
  const classic = sample(D.CLASSIC, 5).map((q) => ({ type: 'mc', text: q.q, correct: q.a, options: shuffle([q.a, ...q.wrong]), fact: q.fact }));
  const emoji = sample(D.EMOJI, 5).map((q) => {
    const other = sample(D.EMOJI.filter((x) => x.a !== q.a), 1).map((x) => x.a);
    const decoys = sample(D.EMOJI_DECOYS.filter((d) => d !== q.a), 2);
    return { type: 'mc', emoji: q.e, text: 'Which Best Picture winner is this?', correct: q.a, options: shuffle([q.a, ...other, ...decoys]), fact: `${q.a} (${q.year}) took home Best Picture.` };
  });
  const years = sample(D.YEARS, 5).map((q) => ({ type: 'year', text: q.e, correct: q.y }));
  return [classic, emoji, years];
}

function startGame() {
  cleanup();
  S.clearMinis();
  S.showCake(false);
  game = { round: 0, qi: 0, score: 0, oscars: 0, streak: 0, best: 0, questions: buildQuestions() };
  updateScore();
  showRound();
}

function updateScore(bump = false) {
  $('#scoreVal').textContent = game.score.toLocaleString();
  $('#streakVal').textContent = game.streak;
  $('#streakPill').classList.toggle('hidden', game.streak < 2);
  if (bump) { const p = $('#scorePill'); p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
}

function showRound() {
  const r = ROUNDS[game.round];
  $('#rnNum').textContent = `Round ${game.round + 1} of 3`;
  $('#rnTitle').textContent = r.title;
  $('#rnDesc').textContent = r.desc;
  show('round');
  Sound.whoosh();
}
$('#rnGo').addEventListener('click', () => { Sound.init(); showQuestion(); });

function showQuestion() {
  const q = curQ();
  const r = ROUNDS[game.round];
  answered = false;
  show('quiz');
  const card = $('.quiz-card');
  card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
  $('#qRound').textContent = `Round ${game.round + 1} · ${r.short}`;
  $('#qCount').textContent = `${game.qi + 1} / ${game.questions[game.round].length}`;
  $('#qEmoji').classList.toggle('hidden', !q.emoji);
  $('#qEmoji').textContent = q.emoji || '';
  $('#qText').textContent = q.type === 'year' ? `📅 ${q.text}` : q.text;
  $('#qFeedback').classList.add('hidden');
  const opts = $('#qOptions');
  opts.innerHTML = '';
  opts.classList.toggle('hidden', q.type !== 'mc');
  $('#qYear').classList.toggle('hidden', q.type !== 'year');
  if (q.type === 'mc') {
    q.options.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.innerHTML = `<span class="ltr">${'ABCD'[i]}</span><span></span>`;
      b.lastChild.textContent = o;
      b.addEventListener('click', () => answer(o, b));
      opts.appendChild(b);
    });
  } else {
    $('#yearRange').value = 1975;
    $('#yearVal').textContent = '1975';
    $('#yearLock').disabled = false;
    $('#yearRange').disabled = false;
  }
  startTimer(r.time);
}

$('#yearRange').addEventListener('input', (e) => {
  $('#yearVal').textContent = e.target.value;
  if (Math.random() < 0.25) Sound.tick();
});
$('#yearLock').addEventListener('click', () => answer(+$('#yearRange').value));

// Timer
let timer = null;
function startTimer(sec) {
  stopTimer();
  const bar = $('#timerBar');
  const start = performance.now();
  let lastWhole = sec;
  bar.classList.remove('low');
  timer = { sec, start, id: 0 };
  const loop = () => {
    const left = sec - (performance.now() - start) / 1000;
    bar.style.transform = `scaleX(${Math.max(0, left / sec)})`;
    if (left <= 5) {
      bar.classList.add('low');
      if (Math.ceil(left) < lastWhole) { lastWhole = Math.ceil(left); Sound.tick(); }
    }
    if (left <= 0) { timer = null; timeUp(); return; }
    timer.id = requestAnimationFrame(loop);
  };
  timer.id = requestAnimationFrame(loop);
}
function stopTimer() {
  if (!timer) return 0;
  cancelAnimationFrame(timer.id);
  const frac = Math.max(0, 1 - (performance.now() - timer.start) / 1000 / timer.sec);
  timer = null;
  return frac;
}
function timeUp() {
  if (answered) return;
  const q = curQ();
  if (q.type === 'year') { answer(+$('#yearRange').value, null, true); return; }
  Sound.startPlayoff();
  setTimeout(() => Sound.stopPlayoff(), 3500);
  answer(null, null, true);
}

function answer(choice, btn, timedOut = false) {
  if (answered) return;
  answered = true;
  const frac = stopTimer();
  const q = curQ();
  let correct = false, pts = 0, title = '', fact = q.fact || '';
  if (q.type === 'mc') {
    correct = choice === q.correct;
    $$('#qOptions .opt').forEach((b) => {
      b.disabled = true;
      if (b.lastChild.textContent === q.correct) b.classList.add('right');
    });
    if (btn && !correct) btn.classList.add('wrong');
    if (correct) {
      pts = 100 + Math.round(frac * 100);
      title = pick(['🏆 And the Oscar goes to… YOU!', '🏆 Correct! Cue the orchestra.', '🏆 Standing ovation!', '🏆 Nailed it. Thank your agent.']);
    } else {
      title = timedOut ? '🎻 The orchestra played you off!' : pick(['❌ Wrong envelope!', '❌ Snubbed!', '❌ The Academy disagrees.']);
      if (q.type === 'mc' && !timedOut) fact = `It was “${q.correct}.” ${fact}`;
      if (timedOut) fact = `It was “${q.correct}.” ${fact}`;
    }
  } else {
    const diff = Math.abs(choice - q.correct);
    $('#yearLock').disabled = true;
    $('#yearRange').disabled = true;
    $('#yearVal').textContent = q.correct;
    correct = diff <= 2;
    pts = diff === 0 ? 300 : diff === 1 ? 200 : diff === 2 ? 150 : diff <= 5 ? 60 : 0;
    title = diff === 0 ? '🎯 EXACTLY right! Bonus!' : correct ? `🏆 So close! Only ${diff} off.` : diff <= 5 ? `🥈 Close-ish: ${diff} years off` : `❌ ${diff} years off!`;
    fact = `It happened in ${q.correct}. You guessed ${choice}.`;
  }
  if (correct) {
    game.streak++;
    game.best = Math.max(game.best, game.streak);
    if (game.streak >= 3) pts += 25 * (game.streak - 2);
    game.oscars++;
    const idx = game.oscars - 1;
    S.awardMini();
    setTimeout(() => S.minisBurst(idx), 650);
    S.spinStatue(0.5);
    Sound.ding();
    if (game.streak >= 3) setTimeout(() => toast(`<b>🔥 ${game.streak} IN A ROW</b>Streak bonus +${25 * (game.streak - 2)}!`, 2200), 300);
  } else {
    game.streak = 0;
    if (!timedOut) Sound.sadTrombone();
  }
  game.score += pts;
  updateScore(pts > 0);
  $('#fbTitle').textContent = title + (pts ? `  +${pts}` : '');
  $('#fbFact').textContent = fact;
  $('#qFeedback').classList.remove('hidden');
  const last = game.round === 2 && game.qi === game.questions[2].length - 1;
  $('#qNext').textContent = last ? '🏆 See the results' : game.qi === game.questions[game.round].length - 1 ? 'Next round ▶' : 'Next ▶';
  $('#qNext').focus({ preventScroll: true });
}

$('#qNext').addEventListener('click', () => {
  Sound.stopPlayoff();
  game.qi++;
  if (game.qi >= game.questions[game.round].length) {
    game.round++;
    game.qi = 0;
    if (game.round >= 3) return showResults();
    return showRound();
  }
  showQuestion();
});

function showResults() {
  const rank = D.RANKS.find((r) => game.oscars >= r.min);
  $('#rCount').textContent = game.oscars;
  $('#rTitle').textContent = rank.title;
  $('#rBlurb').textContent = rank.blurb;
  $('#rScore').textContent = game.score.toLocaleString();
  $('#rStreak').textContent = game.best;
  show('results');
  Sound.fanfare();
  S.celebrate(0.8);
  S.burst(undefined, 260, 6);
  if (game.oscars >= 12) { S.fireworks(true); setTimeout(() => S.fireworks(false), 6000); }
}
$('#rAgain').addEventListener('click', startGame);
$('#rFinale').addEventListener('click', enterFinale);
$('#rShare').addEventListener('click', async () => {
  const rank = D.RANKS.find((r) => game.oscars >= r.min);
  const text = `🏆 I won ${game.oscars}/15 Oscars ("${rank.title}") with ${game.score.toLocaleString()} points at the Chris-cademy Awards! Happy birthday, ${C.honoree}! 🎂🎬`;
  const url = location.href.split('#')[0].split('?')[0];
  try {
    if (navigator.share) { await navigator.share({ text, url }); return; }
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast(`<b>COPIED TO CLIPBOARD</b>Now paste it on ${C.honoree}'s wall.`);
  } catch {
    toast(`<b>YOUR BRAG</b>${text}`, 7000);
  }
});

// ── Red carpet walk ─────────────────────────────────
let decade = 0;
const dots = $('#wDots');
D.DECADES.forEach((d, i) => {
  const b = document.createElement('button');
  b.title = d.d;
  b.setAttribute('aria-label', d.d);
  b.addEventListener('click', () => goDecade(i));
  dots.appendChild(b);
});
function enterWalk() {
  cleanup();
  S.showCake(false);
  show('walk');
  goDecade(0, true);
  toast('<b>THE RED CARPET</b>Use ◀ ▶, your arrow keys, or tap a poster.', 3500);
}
function goDecade(i, silent = false) {
  decade = S.focusDecade(i);
  $('#wLabel').textContent = D.DECADES[decade].d;
  [...dots.children].forEach((b, k) => b.classList.toggle('on', k === decade));
  $('#wNext').textContent = decade === D.DECADES.length - 1 ? '🏆' : '▶';
  $('#wNext').setAttribute('aria-label', decade === D.DECADES.length - 1 ? 'Go to the stage' : 'Next decade');
  if (!silent) { Sound.whoosh(); setTimeout(() => Sound.shutter(), 350); }
}
function stepDecade(d) {
  if (d > 0 && decade === D.DECADES.length - 1) { goHome(); toast('<b>WELCOME TO THE STAGE</b>You walked 100 years of red carpet. Your feet hurt. Worth it.'); return; }
  if (d < 0 && decade === 0) return;
  goDecade(decade + d);
}
$('#wPrev').addEventListener('click', () => stepDecade(-1));
$('#wNext').addEventListener('click', () => stepDecade(1));
let swipeX = null;
$('#scene').addEventListener('touchstart', (e) => { swipeX = e.touches[0].clientX; }, { passive: true });
$('#scene').addEventListener('touchend', (e) => {
  if (current !== 'walk' || swipeX === null) return;
  const dx = e.changedTouches[0].clientX - swipeX;
  if (Math.abs(dx) > 60) stepDecade(dx < 0 ? 1 : -1);
  swipeX = null;
});

// ── Speech generator ────────────────────────────────
const spCat = $('#spCat');
D.SPEECH.categories.forEach((c) => { const o = document.createElement('option'); o.textContent = c; spCat.appendChild(o); });
let speechState = null;
function enterSpeech() {
  cleanup();
  S.showCake(false);
  show('speech');
}
function makeSpeech() {
  const s = D.SPEECH;
  const [t1, t2, t3] = sample(s.thanks, 3);
  return `${pick(s.openers)} I'd like to thank ${t1}, ${t2}, and most of all, ${t3}. ${pick(s.middles)} ${pick(s.closers)}`;
}
function stopSpeech() {
  if (speechState) { clearInterval(speechState.type); cancelAnimationFrame(speechState.raf); clearTimeout(speechState.off); }
  speechState = null;
  try { speechSynthesis.cancel(); } catch {}
}
$('#spGen').addEventListener('click', () => {
  Sound.init();
  stopSpeech();
  Sound.stopPlayoff();
  const text = `🏆 “${spCat.value}”\n\n${makeSpeech()}`;
  const el = $('#spText');
  el.classList.remove('drowned');
  $('#wrapUp').classList.add('hidden');
  el.textContent = '';
  const words = text.split(' ');
  let i = 0;
  const st = { text, type: 0, raf: 0, off: 0 };
  speechState = st;
  st.type = setInterval(() => {
    el.textContent += (i ? ' ' : '') + words[i++];
    el.scrollTop = el.scrollHeight;
    if (i >= words.length) clearInterval(st.type);
  }, 170);
  const bar = $('#spBar');
  bar.classList.remove('low');
  const DUR = 20, start = performance.now();
  const loop = () => {
    const left = DUR - (performance.now() - start) / 1000;
    bar.style.transform = `scaleX(${Math.max(0, left / DUR)})`;
    $('#spTime').textContent = `0:${String(Math.max(0, Math.ceil(left))).padStart(2, '0')}`;
    if (left < 6) bar.classList.add('low');
    if (left <= 0) {
      clearInterval(st.type);
      try { speechSynthesis.cancel(); } catch {}
      el.classList.add('drowned');
      $('#wrapUp').classList.remove('hidden');
      Sound.startPlayoff();
      st.off = setTimeout(() => Sound.stopPlayoff(), 7000);
      return;
    }
    st.raf = requestAnimationFrame(loop);
  };
  st.raf = requestAnimationFrame(loop);
  S.spinStatue(0.8);
});
$('#spRead').addEventListener('click', () => {
  if (!('speechSynthesis' in window)) { toast('Your browser is too shy to read aloud. Try Chrome or Safari.'); return; }
  const text = speechState?.text || $('#spText').textContent;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[🏆“”]/g, ''));
  u.rate = 1.02;
  u.pitch = 1;
  const voices = speechSynthesis.getVoices();
  const v = voices.find((x) => /en[-_](GB|US)/i.test(x.lang) && /Daniel|Google UK English Male|Arthur|Guy|David/i.test(x.name)) || voices.find((x) => /^en/i.test(x.lang));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
});

// ── Finale ──────────────────────────────────────────
let finaleBusy = false;
function resetFinale() {
  const env = $('#envelope');
  env.className = 'envelope';
  $('#envName').textContent = '…';
  $('#envFor').textContent = '';
  $('#presenter').innerHTML = `And the Oscar for <em>${C.category}</em> goes to…`;
  $('#openEnv').classList.remove('hidden');
  $('#toCake').classList.add('hidden');
  $('#mistake').classList.add('hidden');
  $('#runner').classList.remove('go');
  S.setPlaque('And the Oscar goes to', '…', '');
}
function enterFinale() {
  cleanup();
  S.showCake(false);
  resetFinale();
  show('finale');
}
$('#openEnv').addEventListener('click', async () => {
  if (finaleBusy) return;
  finaleBusy = true;
  Sound.init();
  const env = $('#envelope');
  $('#openEnv').classList.add('hidden');
  env.classList.add('shake');
  Sound.drumroll(2.6);
  await wait(2600);
  env.classList.remove('shake');
  $('#envName').textContent = 'La La Land';
  $('#envFor').textContent = '';
  env.classList.add('open');
  Sound.fanfare();
  S.burst(undefined, 120, 5);
  await wait(3000);
  Sound.stopPlayoff();
  Sound.sadTrombone();
  $('#mistake').classList.remove('hidden');
  $('#runner').classList.add('go');
  $('#presenter').innerHTML = 'Hold on… someone from the accounting firm is running onstage…';
  await wait(2400);
  env.classList.add('swap');
  await wait(450);
  $('#envName').textContent = C.honoree;
  $('#envFor').textContent = 'for “Another Lap Around the Sun”';
  env.classList.add('winner');
  $('#mistake').classList.add('hidden');
  $('#presenter').innerHTML = `This is not a joke. The real winner is… <em>${C.honoree.toUpperCase()}!</em>`;
  await wait(500);
  const flash = $('#flash');
  flash.classList.add('on');
  setTimeout(() => flash.classList.remove('on'), 60);
  Sound.fanfare();
  S.celebrate(1);
  S.setPlaque(C.category, C.honoree, `The Chris-cademy Awards · ${C.year}`);
  S.spinStatue(2.5);
  S.burst(undefined, 400, 8);
  S.rain(700);
  S.fireworks(true);
  await wait(2200);
  $('#toCake').classList.remove('hidden');
  finaleBusy = false;
});
let lastBoom = 0;
S.onFirework = () => {
  const now = performance.now();
  if (now - lastBoom > 700) { lastBoom = now; Sound.boom(); }
};
$('#toCake').addEventListener('click', enterCake);

// ── Cake ────────────────────────────────────────────
let cakeDone = false;
function enterCake() {
  cleanup();
  cakeDone = false;
  S.showCake(true);
  show('cake');
  $('#cakeKicker').textContent = `Make a wish, ${C.honoree}`;
  $('#cakeTitle').textContent = 'Blow out the candles';
  $('#cakeHint').textContent = `Tap each flame, or blow into your mic. ${S.candlesLit()} candles to go.`;
  $('#micBtn').classList.remove('hidden', 'listening');
  $('#micBtn').textContent = '🎤 Blow into your mic';
  $('#blowAll').classList.remove('hidden');
  $('#toCredits').classList.add('hidden');
  Sound.whoosh();
}
function blow(i) {
  if (current !== 'cake' || cakeDone) return;
  if (!S.blowCandle(i)) return;
  Sound.poof();
  afterBlow();
}
function afterBlow() {
  const left = S.candlesLit();
  $('#cakeHint').textContent = left ? `${left} candle${left === 1 ? '' : 's'} to go…` : 'Wish granted. 🌟';
  if (!left) allOut();
}
function allOut() {
  if (cakeDone) return;
  cakeDone = true;
  stopMic();
  $('#cakeKicker').textContent = 'Wish granted';
  $('#cakeTitle').textContent = `Happy Birthday, ${C.honoree}! 🎉`;
  $('#micBtn').classList.add('hidden');
  $('#blowAll').classList.add('hidden');
  S.celebrate(1);
  S.rain(900);
  S.burst(S.cakeTopWorld(), 250, 6);
  S.fireworks(true);
  const dur = Sound.happyBirthday() || 12;
  setTimeout(() => { if (current === 'cake') $('#toCredits').classList.remove('hidden'); }, Math.min(dur * 1000, 4000));
}
$('#blowAll').addEventListener('click', () => {
  Sound.init();
  S.blowAll();
  Sound.poof();
  afterBlow();
});

// Mic blow detection
let mic = null;
async function startMic() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    Sound.init();
    const ctx = Sound.ctx;
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 1024;
    src.connect(an);
    const buf = new Float32Array(an.fftSize);
    let loud = 0, last = 0, raf = 0;
    const loop = (t) => {
      an.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
      const rms = Math.sqrt(sum / buf.length);
      loud = rms > 0.09 ? loud + 1 : Math.max(0, loud - 2);
      if (loud > 6 && t - last > 220) {
        last = t;
        const lit = [];
        for (let i = 0; i < 7; i++) lit.push(i);
        for (const i of shuffle(lit)) { if (S.blowCandle(i)) { Sound.poof(); afterBlow(); break; } }
      }
      mic.raf = requestAnimationFrame(loop);
    };
    mic = { stream, raf };
    mic.raf = requestAnimationFrame(loop);
    $('#micBtn').classList.add('listening');
    $('#micBtn').textContent = '🎤 Listening… blow!';
  } catch {
    toast('<b>NO MIC, NO PROBLEM</b>Just tap the flames instead.');
  }
}
function stopMic() {
  if (!mic) return;
  cancelAnimationFrame(mic.raf);
  mic.stream.getTracks().forEach((t) => t.stop());
  mic = null;
  $('#micBtn').classList.remove('listening');
  $('#micBtn').textContent = '🎤 Blow into your mic';
}
$('#micBtn').addEventListener('click', () => (mic ? stopMic() : startMic()));
$('#toCredits').addEventListener('click', enterCredits);

// ── Credits ─────────────────────────────────────────
const CREDITS = [
  ['h', 'The Chris-cademy Awards'],
  ['A', `${C.from} Production`],
  ['In association with', 'An Unreasonable Number of GPUs'],
  ['Starring', `${C.honoree.toUpperCase()} as Himself`],
  ['Also starring', 'The Oscar Statuette as The Oscar Statuette'],
  ['With', 'La La Land as The Wrong Envelope'],
  ['And', 'Moonlight as The Right Envelope'],
  ['Featuring', 'The Orchestra as The Orchestra (Playing You Off)'],
  ['Directed by', 'Artificial Intelligence'],
  ['Screenplay by', `A Large Language Model & ${C.from}`],
  ['Based on the true story of', `${C.honoree}'s Birthday`],
  ['Catering', `The Snack Table at ${C.honoree}'s Oscar Party`],
  ['Stunt Coordinator', 'Jennifer Lawrence\'s Staircase'],
  ['Envelope Security', 'Definitely Not the 2017 Team'],
  ['Budget', `${C.prize} (pending approval)`],
  ['Special thanks', 'Everyone who blocked today off on their calendars'],
  ['Filmed on location', 'Inside Your Browser'],
  ['fine', 'No actual statuettes were harmed in the making of this website. Oscar®, Academy Award® and the Oscar statuette are trademarks of the Academy of Motion Picture Arts and Sciences. This is an unofficial fan-made birthday card, and the Academy has not endorsed it (yet). Any resemblance to a real Oscar party is entirely intentional.'],
  ['h', `Happy Birthday, ${C.honoree}`],
];
const roll = $('#creditsRoll');
roll.innerHTML = CREDITS.map(([role, who]) => {
  if (role === 'h') return `<div class="blk"><h2>${who}</h2></div>`;
  if (role === 'fine') return `<p class="fine">${who}</p>`;
  return `<div class="blk"><div class="role">${role}</div><div class="who">${who}</div></div>`;
}).join('');
function enterCredits() {
  cleanup();
  show('credits');
  $('#endCard').classList.add('hidden');
  $('#skipCredits').classList.remove('hidden');
  roll.classList.remove('rolling'); void roll.offsetWidth; roll.classList.add('rolling');
  Sound.startPlayoff();
}
function endCredits() {
  roll.classList.remove('rolling');
  Sound.stopPlayoff();
  $('#skipCredits').classList.add('hidden');
  $('#endCard').classList.remove('hidden');
  Sound.fanfare();
  S.burst(undefined, 300, 7);
  S.fireworks(true);
}
roll.addEventListener('animationend', () => { if (current === 'credits') endCredits(); });
$('#skipCredits').addEventListener('click', endCredits);
$('#replay').addEventListener('click', enterFinale);
$('#toLobby').addEventListener('click', goHome);

// Handy for testing: ?go=finale / walk / trivia / speech / cake / credits
const go = new URLSearchParams(location.search).get('go');
if (go) {
  $('#curtain').style.display = 'none';
  ({ trivia: startGame, walk: enterWalk, speech: enterSpeech, finale: enterFinale, cake: enterCake, credits: enterCredits, menu: goHome })[go]?.();
}
