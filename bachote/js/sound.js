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
      master.gain.value = 0.5;
      var limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -8;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.12;
      master.connect(limiter).connect(ctx.destination);
      ready = true;
      return true;
    } catch (e) { return false; }
  }

  function on() { return window.Store ? window.Store.setting("sound") !== false : true; }

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

  var SOUNDS = {
    flip:  function () { noise(0, 0.07, 0.07); tone(520, 0, 0.06, { type: "triangle", gain: 0.06 }); },
    good:  function () { tone(660, 0, 0.1, { type: "sine", gain: 0.16 }); tone(990, 0.07, 0.16, { type: "sine", gain: 0.13 }); },
    bad:   function () { tone(210, 0, 0.16, { type: "sawtooth", gain: 0.09, glide: 150 }); },
    click: function () { tone(440, 0, 0.04, { type: "square", gain: 0.05 }); },
    pair:  function () { tone(784, 0, 0.09, { type: "sine", gain: 0.13 }); tone(1175, 0.06, 0.12, { type: "sine", gain: 0.1 }); },
    done:  function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(f, i * 0.075, 0.42, { type: "sine", gain: 0.13 });
      });
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
