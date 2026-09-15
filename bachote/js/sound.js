/* ============================================================
   BACHOTE — sons de synthèse (Web Audio). Aucun fichier audio.
   Discrets : on révise, on ne joue pas à un jeu d'arcade.
   ============================================================ */
(function () {
  "use strict";

  var ctx = null, master = null, ready = false;

  function init() {
    if (ready) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.42;
      var limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -8;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.12;
      // Voie sèche + une petite réverbération pour donner de la matière.
      var wet = ctx.createGain(); wet.gain.value = 0.16;
      var rev = ctx.createConvolver(); rev.buffer = makeIR(1.1, 2.2);
      master.connect(limiter);
      master.connect(rev); rev.connect(wet); wet.connect(limiter);
      limiter.connect(ctx.destination);
      ready = true;
      return true;
    } catch (e) { return false; }
  }

  function on() { return window.Store ? window.Store.setting("sound") !== false : true; }

  function makeIR(seconds, decay) {
    var rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    var buf = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function tone(freq, start, dur, opts) {
    opts = opts || {};
    var t0 = ctx.currentTime + start;
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = opts.type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.glide) osc.frequency.exponentialRampToValueAtTime(opts.glide, t0 + dur);

    var peak = opts.gain == null ? 0.22 : opts.gain;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.04);
  }

  function noise(start, dur, gain) {
    var t0 = ctx.currentTime + start;
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = "bandpass"; f.frequency.value = 2400; f.Q.value = 0.8;
    var g = ctx.createGain();
    g.gain.value = gain == null ? 0.1 : gain;
    src.connect(f).connect(g).connect(master);
    src.start(t0);
  }

  // Notes (Hz) — gamme majeure de do, pour des accords agréables.
  var N = { C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.0, A4:440.0, B4:493.88, C5:523.25, D5:587.33, E5:659.25, G5:783.99, C6:1046.5 };

  function chord(notes, start, dur, opts) {
    opts = opts || {};
    notes.forEach(function (f, k) {
      tone(f, start + k * (opts.spread || 0), dur, {
        type: opts.type || "triangle",
        gain: (opts.gain == null ? 0.12 : opts.gain) * (1 - k * 0.12)
      });
    });
  }

  var SOUNDS = {
    // Retournement de carte : souffle bref + petit "toc" boisé.
    flip: function () {
      noise(0, 0.05, 0.05);
      tone(430, 0, 0.05, { type: "triangle", gain: 0.05, glide: 620 });
    },
    // Clic doux et neutre.
    click: function () {
      tone(660, 0, 0.035, { type: "sine", gain: 0.06 });
    },
    // Bonne réponse : tierce montante brillante et chaleureuse.
    good: function () {
      tone(N.E5, 0, 0.16, { type: "triangle", gain: 0.14 });
      tone(N.G5, 0.055, 0.2, { type: "triangle", gain: 0.12 });
      tone(N.E5 / 2, 0, 0.18, { type: "sine", gain: 0.05 });
    },
    // Paire trouvée (jeu Associer) : petit arpège cristallin.
    pair: function () {
      tone(N.G4, 0, 0.1, { type: "sine", gain: 0.11 });
      tone(N.C5, 0.05, 0.12, { type: "sine", gain: 0.1 });
      tone(N.E5, 0.1, 0.16, { type: "sine", gain: 0.1 });
    },
    // Mauvaise réponse : deux notes descendantes, douces (jamais agressif).
    bad: function () {
      tone(300, 0, 0.14, { type: "sine", gain: 0.11, glide: 250 });
      tone(225, 0.11, 0.2, { type: "sine", gain: 0.1, glide: 190 });
    },
    // Fin de session : petit accord résolu, satisfaisant.
    done: function () {
      chord([N.C5, N.E5, N.G5], 0, 0.5, { type: "triangle", gain: 0.12, spread: 0.09 });
      tone(N.C6, 0.32, 0.5, { type: "sine", gain: 0.09 });
      tone(N.C4, 0, 0.6, { type: "sine", gain: 0.06 });
    }
  };

  function play(name) {
    if (!on()) return;
    if (!init()) return;
    if (ctx.state === "suspended") ctx.resume();
    var fn = SOUNDS[name];
    if (fn) { try { fn(); } catch (e) { /* le son n'est jamais critique */ } }
  }

  // Débloque le contexte audio au premier geste (politique des navigateurs).
  ["pointerdown", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, function once() {
      if (init() && ctx.state === "suspended") ctx.resume();
      window.removeEventListener(ev, once);
    }, { once: true });
  });

  window.Sfx = { play: play };
})();
