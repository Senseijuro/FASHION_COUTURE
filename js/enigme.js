document.addEventListener('DOMContentLoaded', function() {
  var state      = getGameState();
  var locked     = document.getElementById('locked');
  var gameArea   = document.getElementById('game-area');
  var resultDiv  = document.getElementById('result');
  var roundEl    = document.getElementById('def-round');
  var correctEl  = document.getElementById('def-correct');
  var wrongEl    = document.getElementById('def-wrong');
  var card       = document.getElementById('def-card');
  var iconEl     = document.getElementById('def-icon');
  var defEl      = document.getElementById('def-definition');
  var feedbackEl = document.getElementById('def-feedback');
  var choicesEl  = document.getElementById('def-choices');

  // 1. BYPASS
  if (!state.quiz || state.quiz.completed === null) {
    if (locked)   locked.classList.remove('hidden');
    if (gameArea) gameArea.classList.add('hidden');
    return;
  }
  if (state.enigma && state.enigma.completed !== null) {
    if (gameArea) gameArea.classList.add('hidden');
    if (locked)   locked.classList.add('hidden');
    showResult(state.enigma.completed, state.enigma.score || 0);
    return;
  }
  if (locked) locked.classList.add('hidden');

  // 2. CACHER LE JEU AU DÉMARRAGE
  if (gameArea) gameArea.classList.add('hidden');

  // 3. AFFICHER LE TUTORIEL
  Tutorial.show({
    icon: '📖',
    title: 'LE LANGAGE DU CUIR',
    subtitle: 'ÉPREUVE 3',
    description: 'Chaque métier a son vocabulaire. Retrouve les termes techniques de la maroquinerie.',
    steps: [
      { icon: '🤔', text: 'Lis la définition affichée à l\'écran.' },
      { icon: '👆', text: 'Choisis le mot ou l\'outil correspondant parmi les propositions.' },
      { icon: '🎯', text: 'Donne au moins 3 bonnes réponses sur 5 pour obtenir ton dernier badge.' }
    ],
    buttonText: 'C\'EST PARTI !',
    theme: 'purple'
  }).then(function() {
    if (window.globalTimer) globalTimer.start();
    if (gameArea) gameArea.classList.remove('hidden');
    initGame();
  });

  // 4. LOGIQUE DU JEU
  function initGame() {
    var allQuestions = [
      { icon: '🧤', definition: 'Matière souple et résistante issue de la peau d\'animaux, transformée par tannage, utilisée pour fabriquer sacs, ceintures et portefeuilles.', answer: 'Le cuir', choices: ['Le cuir', 'La laine', 'Le caoutchouc', 'La soie'] },
      { icon: '🔪', definition: 'Outil à lame fine et biseautée utilisé par le maroquinier pour couper proprement le cuir en tranches nettes.', answer: 'Le tranchet', choices: ['Le tranchet', 'Le maillet', 'L\'alène', 'Le réglet'] },
      { icon: '👷', definition: 'Artisan qui fabrique à la main des articles en cuir comme des sacs, des portefeuilles, des ceintures et parfois des selles.', answer: 'Le maroquinier', choices: ['Le maroquinier', 'Le plombier', 'Le charpentier', 'Le bottier'] },
      { icon: '🎓', definition: 'Diplôme de niveau 3 préparé en 2 ans, souvent en apprentissage, qui forme aux techniques de base de la confection en cuir.', answer: 'Le CAP Maroquinerie', choices: ['Le CAP Maroquinerie', 'Le BTS Design', 'Le Bac Pro Couture', 'La Licence Luxe'] },
      { icon: '🪡', definition: 'Outil métallique pointu servant à perforer le cuir avant de passer le fil pour coudre les pièces ensemble.', answer: 'L\'alène', choices: ['L\'alène', 'Le gabarit', 'Le tranchet', 'La cisaille'] },
      { icon: '🏭', definition: 'Processus chimique ou naturel qui transforme une peau brute d\'animal en cuir durable et utilisable par le maroquinier.', answer: 'Le tannage', choices: ['Le tannage', 'Le polissage', 'Le tressage', 'Le soudage'] },
      { icon: '📐', definition: 'Modèle rigide utilisé comme guide pour tracer et découper les pièces de cuir toujours à la même forme et dimension.', answer: 'Le gabarit', choices: ['Le gabarit', 'Le maillet', 'Le fil de lin', 'La teinture'] },
      { icon: '🐴', definition: 'Spécialité du maroquinier qui travaille les équipements pour les cavaliers : selles, étriers, brides et sangles.', answer: 'La sellerie', choices: ['La sellerie', 'La poterie', 'La joaillerie', 'La verrerie'] },
      { icon: '🧵', definition: 'Fil naturel, souvent ciré, très solide, utilisé pour coudre le cuir à la main ou à la machine en maroquinerie traditionnelle.', answer: 'Le fil de lin', choices: ['Le fil de lin', 'La laine mohair', 'Le fil de fer', 'Le nylon élastique'] },
      { icon: '💼', definition: 'Opération qui consiste à amincir le bord des pièces de cuir pour faciliter l\'assemblage et avoir un rendu soigné.', answer: 'Le parage', choices: ['Le parage', 'Le polissage', 'Le mordançage', 'Le gaufrage'] }
    ];

    function shuffle(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    }

    var questions = shuffle(allQuestions).slice(0, 5);
    var current = 0, correctCount = 0, wrongCount = 0;
    var answered = false;

    function updateStats() {
      if (roundEl)   roundEl.textContent   = '🔍 ' + (current + 1) + ' / ' + questions.length;
      if (correctEl) correctEl.textContent = '✅ ' + correctCount;
      if (wrongEl)   wrongEl.textContent   = '❌ ' + wrongCount;
    }

    function showQuestion() {
      if (current >= questions.length) { endGame(); return; }
      answered = false;
      updateStats();
      card.classList.remove('flash-correct', 'flash-wrong');
      if (feedbackEl) { feedbackEl.textContent = ''; feedbackEl.className = 'def-feedback'; }

      var q = questions[current];
      if (iconEl) iconEl.textContent = q.icon;
      if (defEl)  defEl.textContent  = q.definition;

      var shuffled = shuffle(q.choices);
      choicesEl.innerHTML = '';
      shuffled.forEach(function(choice) {
        var btn = document.createElement('div');
        btn.className = 'def-choice';
        btn.textContent = choice;
        btn.addEventListener('click', function() { handleChoice(choice, btn); });
        choicesEl.appendChild(btn);
      });
    }

    function handleChoice(choice, btn) {
      if (answered) return;
      answered = true;
      choicesEl.querySelectorAll('.def-choice').forEach(function(c) { c.classList.add('disabled'); });

      var correct = choice === questions[current].answer;
      if (correct) {
        correctCount++;
        btn.classList.add('correct');
        card.classList.add('flash-correct');
        if (feedbackEl) { feedbackEl.textContent = '✅ Bonne réponse !'; feedbackEl.className = 'def-feedback correct'; }
      } else {
        wrongCount++;
        btn.classList.add('wrong');
        card.classList.add('flash-wrong');
        if (navigator.vibrate) navigator.vibrate([50]); 
        choicesEl.querySelectorAll('.def-choice').forEach(function(c) {
          if (c.textContent === questions[current].answer) c.classList.add('reveal');
        });
        if (feedbackEl) { feedbackEl.textContent = '❌ C\'était : ' + questions[current].answer; feedbackEl.className = 'def-feedback wrong'; }
      }
      updateStats();
      setTimeout(function() { current++; showQuestion(); }, 1400);
    }

    function endGame() {
      var success = correctCount >= 3;
      state.enigma = { completed: success, score: correctCount };
      saveGameState(state);
      setTimeout(function() { if (gameArea) gameArea.classList.add('hidden'); showResult(success, correctCount); }, 300);
    }

    updateStats();
    setTimeout(function() { showQuestion(); }, 800);
  }

  // 5. FONCTION SHOWRESULT
  function showResult(success, score) {
    if (resultDiv) resultDiv.classList.remove('hidden');
    if (gameArea)  gameArea.classList.add('hidden');
    if (locked)    locked.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    var resultBox   = document.getElementById('result-box');
    var resultIcon  = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText  = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');
    if (resultScore) resultScore.textContent = score + ' / 5 définitions trouvées';
    
    if (success) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]); 
      if (window.confetti) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#a855f7', '#c8a96e'] }); 
      if (resultBox) { resultBox.classList.remove('success-effect'); void resultBox.offsetWidth; resultBox.classList.add('success-effect', 'success'); }
      if (resultIcon)  resultIcon.textContent = '✓';
      if (resultTitle) resultTitle.textContent = 'VOCABULAIRE MAÎTRISÉ !';
      if (resultText)  resultText.textContent  = 'Tu connais le langage du cuir ! L\'intervenant(e) va approfondir les métiers avec toi ! Dernier accessoire débloqué !';
    } else {
      if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 50]); 
      if (resultBox) { 
        resultBox.classList.remove('fail-effect'); 
        void resultBox.offsetWidth; 
        resultBox.classList.add('fail-effect', 'fail'); 
      }
      if (resultIcon)  resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'VOCABULAIRE À REVOIR';
      if (resultText)  resultText.textContent  = 'Il fallait au moins 3 bonnes réponses. L\'intervenant(e) t\'expliquera les termes ! Accessoire verrouillé.';
    }
  }
});