// ==========================================
// MUSIC.JS - Gestion de la musique de fond
// Musique adaptée selon le résultat final :
//   win     → coffre_win.mp3     (3/3 réussis)
//   partial → coffre_partial.mp3 (1-2/3 réussis)
//   fail    → coffre_fail.mp3    (0/3 réussis)
// Autoplay + fallback au moindre contact
// ==========================================

(function() {

  // --- 1. Détecter l'état final -------------------------------------------

  function detectResultState() {
    // getGameState() est déclaré dans gameState.js, chargé avant music.js
    if (typeof getGameState !== 'function') return 'neutral';
    var state = getGameState();
    var games = ['enigme1', 'quiz', 'enigma'];
    var completed = 0;
    var succeeded = 0;
    games.forEach(function(g) {
      if (state[g] && state[g].completed !== undefined) {
        completed++;
        if (state[g].completed === true) succeeded++;
      }
    });
    if (completed < 3) return 'neutral';   // toutes les épreuves pas encore faites
    if (succeeded === 3) return 'win';
    if (succeeded >= 1) return 'partial';
    return 'fail';
  }

  // --- 2. Choisir le bon élément <audio> -----------------------------------

  var resultState = detectResultState();

  var musicMap = {
    win:     document.getElementById('music-win'),
    partial: document.getElementById('music-partial'),
    fail:    document.getElementById('music-fail'),
    neutral: document.getElementById('bg-music')   // musique générique
  };

  var music = musicMap[resultState] || document.getElementById('bg-music');
  if (!music) return;

  // Couper les autres éléments audio pour éviter les conflits
  Object.keys(musicMap).forEach(function(key) {
    var el = musicMap[key];
    if (el && el !== music) {
      el.pause();
      el.currentTime = 0;
    }
  });

  music.volume = 0.2;
  var started = false;

  // --- 3. Lecture (autoplay + fallback interaction) ------------------------

  function tryPlay() {
    if (started) return;
    var p = music.play();
    if (p !== undefined) {
      p.then(function() {
        started = true;
        removeListeners();
      }).catch(function() {});
    } else {
      started = true;
      removeListeners();
    }
  }

  var events = ['click', 'touchstart', 'touchend', 'mousemove', 'mousedown',
                'scroll', 'keydown', 'pointerdown', 'pointerup'];

  function onInteraction() { tryPlay(); }

  function addListeners() {
    events.forEach(function(evt) {
      document.addEventListener(evt, onInteraction, { once: true, passive: true });
    });
  }

  function removeListeners() {
    events.forEach(function(evt) {
      document.removeEventListener(evt, onInteraction);
    });
  }

  tryPlay();
  if (!started) addListeners();

  // --- 4. Bouton toggle musique -------------------------------------------

  var musicBtn = document.createElement('button');
  musicBtn.id = 'music-toggle';
  musicBtn.innerHTML = '🔊';
  musicBtn.title = 'Couper/Activer la musique';
  musicBtn.style.cssText = [
    'position:fixed;bottom:20px;right:20px;z-index:9999',
    'width:50px;height:50px;border-radius:50%',
    'border:2px solid rgba(255,255,255,0.3)',
    'background:rgba(17,17,20,0.9);color:white',
    'font-size:1.5rem;cursor:pointer;transition:all 0.3s',
    'display:flex;align-items:center;justify-content:center'
  ].join(';');
  document.body.appendChild(musicBtn);

  musicBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (music.muted) {
      music.muted = false;
      musicBtn.innerHTML = '🔊';
      musicBtn.style.opacity = '1';
    } else {
      music.muted = true;
      musicBtn.innerHTML = '🔇';
      musicBtn.style.opacity = '0.5';
    }
  });

  musicBtn.addEventListener('mouseenter', function() {
    musicBtn.style.transform = 'scale(1.1)';
    musicBtn.style.borderColor = '#ff007f';
  });
  musicBtn.addEventListener('mouseleave', function() {
    musicBtn.style.transform = 'scale(1)';
    musicBtn.style.borderColor = 'rgba(255,255,255,0.3)';
  });

})();
