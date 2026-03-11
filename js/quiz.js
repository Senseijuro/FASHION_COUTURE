document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var locked      = document.getElementById('locked');
  var gameArea    = document.getElementById('game-area');
  var resultDiv   = document.getElementById('result');
  var phaseEl     = document.getElementById('seq-phase');
  var livesEl     = document.getElementById('seq-lives');
  var phaseMemo   = document.getElementById('phase-memo');
  var phaseAnswer = document.getElementById('phase-answer');
  var stepsDisplay= document.getElementById('steps-display');
  var countdown   = document.getElementById('seq-countdown');
  var dropZone    = document.getElementById('drop-zone');
  var dropEmpty   = document.getElementById('drop-empty');
  var choicesPool = document.getElementById('choices-pool');
  var feedbackEl  = document.getElementById('seq-feedback');
  var btnUndo     = document.getElementById('btn-undo');
  var btnValidate = document.getElementById('btn-validate');
  var btnSkip     = document.getElementById('btn-skip');

  if (!state.enigme1 || state.enigme1.completed === null) {
    if (locked)   locked.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    return;
  }
  if (state.quiz && state.quiz.completed !== null) {
    if (gameArea) gameArea.classList.add('hidden');
    if (locked)   locked.classList.add('hidden');
    showResult(state.quiz.completed);
    return;
  }
  if (locked) locked.classList.add('hidden');

  var allSequences = [
    {
      title: 'Fabrication d\'un sac en cuir',
      steps: [
        { icon: '📐', text: 'Tracer et découper les pièces avec le gabarit' },
        { icon: '🔪', text: 'Parer les bords au tranchet pour les amincir' },
        { icon: '🪡', text: 'Percer les trous avec l\'alène' },
        { icon: '🧵', text: 'Coudre les pièces au fil de lin ciré' },
        { icon: '🪣', text: 'Teindre et finir les tranches de cuir' }
      ]
    },
    {
      title: 'Fabrication d\'un portefeuille',
      steps: [
        { icon: '📏', text: 'Mesurer et tracer le patron sur le cuir' },
        { icon: '✂️', text: 'Découper les pièces aux cisailles' },
        { icon: '🔨', text: 'Aplanir le cuir au maillet sur le marbre' },
        { icon: '🪡', text: 'Piquer les soufflets et les poches au fil' },
        { icon: '✨', text: 'Lustrer et vernir pour la finition' }
      ]
    },
    {
      title: 'Fabrication d\'une ceinture',
      steps: [
        { icon: '📐', text: 'Choisir et préparer le cuir selon l\'épaisseur' },
        { icon: '🔪', text: 'Couper la lanière en bande régulière' },
        { icon: '🔩', text: 'Percer les trous de réglage à l\'alène' },
        { icon: '🪛', text: 'Fixer la boucle métal sur le bout de ceinture' },
        { icon: '🪣', text: 'Colorer et cirer les bords pour la finition' }
      ]
    }
  ];

  var seq = allSequences[Math.floor(Math.random() * allSequences.length)];
  var correctOrder = seq.steps; 
  var MEMO_TIME = 8; 
  var lives = 2;
  var placed = []; 

  stepsDisplay.innerHTML = '';
  correctOrder.forEach(function(step, i) {
    var row = document.createElement('div');
    row.className = 'seq-step-shown';
    row.innerHTML = '<div class="seq-step-num">' + (i+1) + '</div>'
      + '<div class="seq-step-text">' + step.icon + ' ' + step.text + '</div>';
    stepsDisplay.appendChild(row);
  });

  if (phaseEl) phaseEl.textContent = '👁️ Mémorise — ' + seq.title;

  var timeLeft = MEMO_TIME;
  if (countdown) countdown.textContent = timeLeft;
  var memoTimer = setInterval(function() {
    timeLeft--;
    if (countdown) countdown.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(memoTimer);
      startAnswerPhase();
    }
  }, 1000);

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length-1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i+1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var shuffledIndices = [];

  function startAnswerPhase() {
    phaseMemo.style.display = 'none';
    phaseAnswer.style.display = 'block';
    if (phaseEl) phaseEl.textContent = '🎯 Remets dans l\'ordre !';
    updateLives();
    placed = [];
    shuffledIndices = shuffle([0,1,2,3,4]);
    renderDropZone();
    renderPool();
    if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'seq-feedback'; }
  }

  function updateLives() {
    if (livesEl) livesEl.textContent = '❤️ ' + lives + (lives > 1 ? ' essais' : ' essai');
  }

  function renderDropZone() {
    dropZone.innerHTML = '';
    if (placed.length === 0) {
      var empty = document.createElement('span');
      empty.className = 'seq-drop-empty';
      empty.textContent = 'Clique sur les étapes ci-dessous pour les placer ici…';
      dropZone.appendChild(empty);
      return;
    }
    placed.forEach(function(stepIdx, pos) {
      var step = correctOrder[stepIdx];
      var el = document.createElement('div');
      el.className = 'seq-placed';
      el.innerHTML = '<div class="seq-placed-num">' + (pos+1) + '</div>'
        + '<span class="seq-placed-icon">' + step.icon + '</span>'
        + '<span class="seq-placed-text">' + step.text + '</span>';
      dropZone.appendChild(el);
    });
  }

  function renderPool() {
    choicesPool.innerHTML = '';
    shuffledIndices.forEach(function(stepIdx) {
      var step = correctOrder[stepIdx];
      var el = document.createElement('div');
      el.className = 'seq-chip' + (placed.indexOf(stepIdx) !== -1 ? ' used' : '');
      el.innerHTML = '<span class="seq-chip-icon">' + step.icon + '</span>' + step.text;
      el.addEventListener('click', function() { addStep(stepIdx); });
      choicesPool.appendChild(el);
    });
  }

  function addStep(stepIdx) {
    if (placed.indexOf(stepIdx) !== -1) return;
    placed.push(stepIdx);
    renderDropZone();
    renderPool();
    if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'seq-feedback'; }
  }

  btnUndo.addEventListener('click', function() {
    if (placed.length === 0) return;
    placed.pop();
    renderDropZone();
    renderPool();
    if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'seq-feedback'; }
  });

  btnValidate.addEventListener('click', function() {
    if (placed.length < correctOrder.length) {
      if (feedbackEl) { feedbackEl.textContent = 'Place toutes les étapes avant de valider !'; feedbackEl.className = 'seq-feedback wrong'; }
      return;
    }
    
    var perfect = true;
    for (var i = 0; i < placed.length; i++) {
      if (placed[i] !== i) { perfect = false; break; }
    }

    if (perfect) {
      if (feedbackEl) { feedbackEl.textContent = '✅ Parfait ! Tu connais le processus !'; feedbackEl.className = 'seq-feedback correct'; }
      setTimeout(function() { endGame(true); }, 900);
    } else {
      lives--;
      updateLives();
      if (navigator.vibrate) navigator.vibrate([50, 100, 50]); // Vibration d'erreur

      if (lives <= 0) {
        if (feedbackEl) { feedbackEl.textContent = '❌ Mauvais ordre — plus d\'essai !'; feedbackEl.className = 'seq-feedback wrong'; }
        setTimeout(function() { endGame(false); }, 900);
      } else {
        if (feedbackEl) { feedbackEl.textContent = '❌ Mauvais ordre — encore ' + lives + ' essai(s) !'; feedbackEl.className = 'seq-feedback wrong'; }
        setTimeout(function() {
          placed = [];
          renderDropZone();
          renderPool();
          feedbackEl.textContent = ''; feedbackEl.className = 'seq-feedback';
        }, 1200);
      }
    }
  });

  btnSkip.addEventListener('click', function() {
    if (confirm('Passer cette épreuve ? Elle sera comptée comme échouée.')) {
      endGame(false);
    }
  });

  function endGame(success) {
    state.quiz = { completed: success };
    saveGameState(state);
    if (gameArea) gameArea.classList.add('hidden');
    showResult(success);
  }

  function showResult(success) {
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (gameArea)  gameArea.classList.add('hidden');
    if (locked)    locked.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    var resultBox   = document.getElementById('result-box');
    var resultIcon  = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText  = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');
    if (resultScore) resultScore.textContent = success ? 'Séquence maîtrisée !' : 'Séquence non trouvée.';
    
    if (success) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      if (window.confetti) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#c8a96e', '#ff007f'] }); // Confettis
      if (resultBox)   resultBox.classList.add('success');
      if (resultIcon)  resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'L\'ATELIER EN ORDRE !';
      if (resultText)  resultText.textContent  = 'Tu connais les étapes de fabrication — l\'artisan est impressionné ! Accessoire débloqué !';
    } else {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]); // Vibration d'échec lourd
      if (resultBox) { 
        resultBox.classList.remove('fail-effect'); 
        void resultBox.offsetWidth; 
        resultBox.classList.add('fail-effect', 'fail'); 
      }
      if (resultIcon)  resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'SÉQUENCE RATÉE';
      if (resultText)  resultText.textContent  = 'L\'intervenant t\'expliquera le processus de fabrication en détail ! Accessoire verrouillé.';
    }
  }
});