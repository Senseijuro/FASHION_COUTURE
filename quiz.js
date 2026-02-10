document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var hasValidated = false;

  var questions = [
    { 
      question: "Darling, c'est quoi le métier de la personne qui dessine les vêtements et imagine les collections ?", 
      options: [
        "Un couturier", 
        "Un styliste / designer de mode", 
        "Un mannequin",
        "Un photographe"
      ], 
      correct: 1 
    },
    { 
      question: "Comment s'appelle le long chemin éclairé sur lequel les mannequins défilent pendant une Fashion Week ?", 
      options: [
        "Le tapis rouge", 
        "La scène", 
        "Le podium (ou catwalk)", 
        "Le showroom"
      ], 
      correct: 2 
    },
    { 
      question: "Darling, c'est quoi la \"haute couture\" ?", 
      options: [
        "Des vêtements vendus en grande surface", 
        "Des vêtements faits main, sur mesure, par des maisons de luxe", 
        "Des vêtements de sport haut de gamme", 
        "Des vêtements vintage d'occasion"
      ], 
      correct: 1 
    }
  ];

  var currentQuestion = 0;
  var correctAnswers = 0;

  var locked = document.getElementById('locked');
  var quizLayout = document.getElementById('quiz-layout');
  var quizStartBox = document.getElementById('quiz-start-box');
  var quizContent = document.getElementById('quiz-content');
  var result = document.getElementById('result');
  var questionEl = document.getElementById('question');
  var optionsEl = document.getElementById('options');
  var progressText = document.getElementById('progress-text');
  var progressFill = document.getElementById('progress-fill');
  var backBtn = document.getElementById('back-btn');
  var btnStartQuiz = document.getElementById('btn-start-quiz');

  // Vérifier si débloqué (après Épreuve 1)
  if (!state.enigme1 || state.enigme1.completed === null) {
    hasValidated = true;
    if (locked) locked.classList.remove('hidden');
    if (quizLayout) quizLayout.classList.add('hidden');
    
    if (backBtn) {
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'index.html';
      });
    }
    return;
  }

  // Si déjà terminé
  if (state.quiz && state.quiz.completed !== null) {
    hasValidated = true;
    if (quizLayout) quizLayout.classList.add('hidden');
    if (locked) locked.classList.add('hidden');
    showResult(state.quiz.completed, state.quiz.score || 0);
    
    if (backBtn) {
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'index.html';
      });
    }
    return;
  }
  
  // S'assurer que le layout est visible
  if (locked) locked.classList.add('hidden');
  if (quizLayout) {
    quizLayout.classList.remove('hidden');
    quizLayout.style.display = 'grid';
  }
  if (quizStartBox) quizStartBox.classList.remove('hidden');
  if (quizContent) quizContent.classList.add('hidden');

  // Quitter via bouton retour = GAME OVER
  if (backBtn) {
    backBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!hasValidated) {
        if (!state.quiz) state.quiz = { completed: null, score: 0 };
        state.quiz.completed = false;
        state.quiz.score = 0;
        saveGameState(state);
        alert('⚠️ T\'as quitté le quiz, darling. Game over pour cette épreuve !');
      }
      window.location.href = 'index.html';
    });
  }

  // Quitter via fermeture/navigation = GAME OVER
  window.addEventListener('beforeunload', function() {
    if (!hasValidated) {
      if (!state.quiz) state.quiz = { completed: null, score: 0 };
      state.quiz.completed = false;
      state.quiz.score = 0;
      saveGameState(state);
    }
  });

  if (btnStartQuiz) {
    btnStartQuiz.addEventListener('click', function() {
      if (quizStartBox) quizStartBox.classList.add('hidden');
      if (quizContent) quizContent.classList.remove('hidden');
      showQuestion();
    });
  }

  function showQuestion() {
    var q = questions[currentQuestion];
    if (progressText) progressText.textContent = 'Question ' + (currentQuestion + 1) + '/3';
    if (progressFill) progressFill.style.width = (((currentQuestion + 1) / 3) * 100) + '%';
    if (questionEl) questionEl.textContent = q.question;

    if (optionsEl) {
      optionsEl.innerHTML = '';
      q.options.forEach(function(opt, i) {
        var btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', function() { selectAnswer(i); });
        optionsEl.appendChild(btn);
      });
    }
  }

  function selectAnswer(selected) {
    var q = questions[currentQuestion];
    document.querySelectorAll('.quiz-option').forEach(function(opt, i) {
      opt.disabled = true;
      opt.style.pointerEvents = 'none';
      if (i === q.correct) opt.classList.add('correct');
      else if (i === selected) opt.classList.add('wrong');
    });
    if (selected === q.correct) correctAnswers++;

    setTimeout(function() {
      currentQuestion++;
      if (currentQuestion < questions.length) showQuestion();
      else finishQuiz();
    }, 1000);
  }

  function finishQuiz() {
    hasValidated = true;
    var success = correctAnswers >= 2;
    if (!state.quiz) state.quiz = { completed: null, score: 0 };
    state.quiz.completed = success;
    state.quiz.score = correctAnswers;
    saveGameState(state);
    if (quizLayout) quizLayout.classList.add('hidden');
    showResult(success, correctAnswers);
  }

  function showResult(success, score) {
    if (result) result.classList.remove('hidden');
    if (locked) locked.classList.add('hidden');
    if (quizLayout) quizLayout.classList.add('hidden');

    var resultBox = document.getElementById('result-box');
    var resultIcon = document.getElementById('result-icon');
    var resultTitle = document.getElementById('result-title');
    var resultText = document.getElementById('result-text');
    var resultScore = document.getElementById('result-score');

    if (resultScore) resultScore.textContent = 'Score : ' + score + '/3';

    if (success) {
      if (resultBox) resultBox.classList.add('success');
      if (resultIcon) resultIcon.textContent = '✔';
      if (resultTitle) resultTitle.textContent = 'QUIZ VALIDÉ, DARLING !';
      if (resultText) resultText.textContent = 'Bien joué ! T\'as débloqué un look dans le dressing final.';
    } else {
      if (resultBox) resultBox.classList.add('fail');
      if (resultIcon) resultIcon.textContent = '✗';
      if (resultTitle) resultTitle.textContent = 'QUIZ RATÉ';
      if (resultText) resultText.textContent = 'Il fallait au moins 2 bonnes réponses, darling. Le look reste verrouillé.';
    }
  }
});
