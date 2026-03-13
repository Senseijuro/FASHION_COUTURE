document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var gameArea    = document.getElementById('game-area');
  var resultDiv   = document.getElementById('result');
  var roundEl     = document.getElementById('qcm-round');
  var correctEl   = document.getElementById('qcm-correct');
  var wrongEl     = document.getElementById('qcm-wrong');
  var timerFill   = document.getElementById('qcm-timer-fill');
  var card        = document.getElementById('qcm-card');
  var categoryEl  = document.getElementById('qcm-category');
  var questionEl  = document.getElementById('qcm-question');
  var feedbackEl  = document.getElementById('qcm-feedback');
  var choicesEl   = document.getElementById('qcm-choices');

  // 1. BYPASS
  if (state.enigme1 && state.enigme1.completed !== null) {
    if (gameArea) gameArea.classList.add('hidden');
    showResult(state.enigme1.completed, state.enigme1.score || 0);
    return;
  }

  // 2. CACHER LE JEU AU DÉMARRAGE
  if (gameArea) gameArea.classList.add('hidden');

  // 3. AFFICHER LE TUTORIEL
  Tutorial.show({
    icon: '🎓',
    title: 'QUIZ DU MAROQUINIER',
    subtitle: 'ÉPREUVE 1',
    description: 'Teste tes connaissances sur l\'univers du cuir et de la maroquinerie.',
    steps: [
      { icon: '⏱️', text: 'Lis chaque question avant la fin du chronomètre (10 secondes).' },
      { icon: '👆', text: 'Sélectionne la bonne réponse parmi les 4 choix.' },
      { icon: '🎯', text: 'Obtiens au moins 3 bonnes réponses sur 5 pour réussir l\'épreuve.' }
    ],
    warning: 'Attention, le temps s\'écoule vite !',
    buttonText: 'C\'EST PARTI !',
    theme: 'gold'
  }).then(function() {
    if (window.globalTimer) globalTimer.start();
    if (gameArea) gameArea.classList.remove('hidden');
    initGame();
  });

  // 4. LOGIQUE DU JEU
  function initGame() {
    var allQuestions = [
      { cat: '🎓 Formation', q: 'Quel diplôme permet de devenir maroquinier après 2 ans de formation ?', answer: 'CAP Maroquinerie', choices: ['CAP Maroquinerie', 'BTS Luxe', 'Bac Pro Mode', 'Licence Cuir'] },
      { cat: '🛠️ Outils', q: 'Comment s\'appelle l\'outil pointu qui perce les trous dans le cuir avant de coudre ?', answer: 'L\'alène', choices: ['L\'alène', 'Le tranchet', 'Le maillet', 'Le réglet'] },
      { cat: '🏭 Secteur', q: 'Quelle grande maison française est réputée pour ses sacs en cuir fabriqués entièrement à la main ?', answer: 'Hermès', choices: ['Hermès', 'Renault', 'L\'Oréal', 'Michelin'] },
      { cat: '🧵 Matières', q: 'Quelle matière est principalement travaillée par le maroquinier ?', answer: 'Le cuir', choices: ['Le cuir', 'La soie', 'Le béton', 'Le plastique'] },
      { cat: '💼 Métier', q: 'Quel professionnel peut fabriquer à la fois des sacs, des ceintures ET des selles pour chevaux ?', answer: 'Le sellier-maroquinier', choices: ['Le sellier-maroquinier', 'Le styliste', 'Le bottier', 'Le tailleur'] },
      { cat: '🏭 Conditions', q: 'Dans quel type de structure travaille principalement un maroquinier artisanal ?', answer: 'Un atelier', choices: ['Un atelier', 'Un hôpital', 'Un chantier naval', 'Une école'] },
      { cat: '🛠️ Techniques', q: 'Comment appelle-t-on l\'action de coudre les pièces de cuir ensemble en maroquinerie ?', answer: 'Le piquage', choices: ['Le piquage', 'Le tressage', 'Le soudage', 'Le tricotage'] },
      { cat: '🎓 Débouchés', q: 'Où un maroquinier diplômé peut-il travailler en dehors des ateliers artisanaux ?', answer: 'En manufacture de luxe', choices: ['En manufacture de luxe', 'En pharmacie', 'En boulangerie', 'En mécanique auto'] },
      { cat: '🧵 Matières', q: 'Quel fil résistant et ciré est traditionnellement utilisé pour coudre le cuir ?', answer: 'Le fil de lin', choices: ['Le fil de lin', 'La laine', 'Le nylon fin', 'La ficelle de jute'] },
      { cat: '💼 Métier', q: 'Quelle qualité est INDISPENSABLE pour exercer le métier de maroquinier ?', answer: 'La dextérité manuelle', choices: ['La dextérité manuelle', 'La force physique', 'La rapidité de frappe', 'Le sens de la musique'] }
    ];

    function shuffle(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    var questions = shuffle(allQuestions).slice(0, 5);
    var QUESTION_TIME = 10000;
    var current = 0, correctCount = 0, wrongCount = 0;
    var answered = false, questionTimer = null;

    function updateStats() {
      if (roundEl)   roundEl.textContent   = '❓ ' + (current + 1) + ' / ' + questions.length;
      if (correctEl) correctEl.textContent = '✅ ' + correctCount;
      if (wrongEl)   wrongEl.textContent   = '❌ ' + wrongCount;
    }

    function startQuestion() {
      if (current >= questions.length) { endGame(); return; }
      answered = false;
      updateStats();
      card.classList.remove('flash-correct', 'flash-wrong');
      if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'qcm-feedback'; }
      if (timerFill)  { timerFill.style.width = '100%'; timerFill.classList.remove('danger'); }

      var q = questions[current];
      if (categoryEl) categoryEl.textContent = q.cat;
      if (questionEl) questionEl.textContent = q.q;

      var shuffled = shuffle(q.choices);
      choicesEl.innerHTML = '';
      shuffled.forEach(function(choice) {
        var btn = document.createElement('div');
        btn.className = 'qcm-choice';
        btn.textContent = choice;
        btn.addEventListener('click', function() { handleChoice(choice, btn); });
        choicesEl.appendChild(btn);
      });

      var start = Date.now();
      questionTimer = setInterval(function() {
        var elapsed = Date.now() - start;
        var pct = Math.max(0, 100 - (elapsed / QUESTION_TIME * 100));
        if (timerFill) { timerFill.style.width = pct + '%'; if (pct < 30) timerFill.classList.add('danger'); }
        if (elapsed >= QUESTION_TIME && !answered) { clearInterval(questionTimer); handleTimeout(); }
      }, 50);
    }

    function handleChoice(choice, btn) {
      if (answered) return;
      answered = true;
      clearInterval(questionTimer);
      choicesEl.querySelectorAll('.qcm-choice').forEach(function(c) { c.classList.add('disabled'); });

      var correct = choice === questions[current].answer;
      if (correct) {
        correctCount++;
        btn.classList.add('correct');
        card.classList.add('flash-correct');
        if (feedbackEl) { feedbackEl.textContent = '✅ Bonne réponse !'; feedbackEl.className = 'qcm-feedback correct'; }
      } else {
        wrongCount++;
        btn.classList.add('wrong');
        card.classList.add('flash-wrong');
        if (navigator.vibrate) navigator.vibrate([50]); 
        choicesEl.querySelectorAll('.qcm-choice').forEach(function(c) { if (c.textContent === questions[current].answer) c.classList.add('reveal'); });
        if (feedbackEl) { feedbackEl.textContent = '❌ Raté ! C\'était : ' + questions[current].answer; feedbackEl.className = 'qcm-feedback wrong'; }
      }
      updateStats();
      setTimeout(function() { current++; startQuestion(); }, 1400);
    }

    function handleTimeout() {
      answered = true;
      wrongCount++;
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]); 
      choicesEl.querySelectorAll('.qcm-choice').forEach(function(c) {
        c.classList.add('disabled');
        if (c.textContent === questions[current].answer) c.classList.add('reveal');
      });
      card.classList.add('flash-wrong');
      if (feedbackEl) { feedbackEl.textContent = '⏰ Temps écoulé ! C\'était : ' + questions[current].answer; feedbackEl.className = 'qcm-feedback wrong'; }
      updateStats();
      setTimeout(function() { current++; startQuestion(); }, 1400);
    }

    function endGame() {
      var success = correctCount >= 3;
      state.enigme1 = { completed: success, score: correctCount };
      saveGameState(state);
      setTimeout(function() { if (gameArea) gameArea.classList.add('hidden'); showResult(success, correctCount); }, 300);
    }

    updateStats();
    setTimeout(function() { startQuestion(); }, 800);
  }

  // 5. FONCTION SHOWRESULT
  function showResult(success, score) {
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (gameArea)  gameArea.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    var resultBox   = document.getElementById('result-box');
    var resultIcon  = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText  = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');
    if (resultScore) resultScore.textContent = score + ' / 5 bonnes réponses';
    
    if (success) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      if (window.confetti) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#c8a96e', '#00d4ff'] }); 
      if (resultBox) { resultBox.classList.remove('success-effect'); void resultBox.offsetWidth; resultBox.classList.add('success-effect', 'success'); }
      if (resultIcon) resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'L\'ATELIER EST FIER DE TOI !';
      if (resultText)  resultText.textContent  = 'Tu maîtrises les bases des métiers du cuir. L\'intervenant pourra approfondir avec toi ! Accessoire débloqué !';
    } else {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]); 
      if (resultBox) {
        resultBox.classList.remove('fail-effect');
        void resultBox.offsetWidth; 
        resultBox.classList.add('fail-effect', 'fail');
      }
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'À REVOIR !';
      if (resultText)  resultText.textContent  = 'Il fallait au moins 3 bonnes réponses. Pose tes questions à l\'intervenant ! Accessoire verrouillé.';
    }
  }
});