document.addEventListener('DOMContentLoaded', function() {
  var state = getGameState();
  var backBtn = document.getElementById('back-btn');
  var btnReset = document.getElementById('btn-reset');
  var modalSuccess = document.getElementById('modal-success');
  var modalFail    = document.getElementById('modal-fail');
  var btnCloseSuccess = document.getElementById('btn-close-success');
  var btnCloseFail    = document.getElementById('btn-close-fail');
  var failMessage     = document.getElementById('fail-message');

  // Le lien <a href="index.html"> fonctionne nativement, aucun JS nécessaire.

  function updateDisplay() {
    var nextZone      = document.getElementById('next-zone');
    var nextZoneTitle = document.getElementById('next-zone-title');
    var nextZoneText  = document.getElementById('next-zone-text');
    var cs = 0, cc = 0;

    var p1 = document.querySelector('#prog-enigme1 .progress-circle');
    var s1 = document.getElementById('status-enigme1');
    var r1 = document.getElementById('reward-enigme1');
    if (state.enigme1 && state.enigme1.completed === true)  { cs++; cc++; if(p1){p1.classList.add('success');p1.textContent='OK';} if(s1){s1.textContent='Débloqué';s1.classList.add('unlocked');} if(r1)r1.classList.add('unlocked'); }
    else if (state.enigme1 && state.enigme1.completed === false) { cc++; if(p1){p1.classList.add('fail');p1.textContent='X';} if(s1){s1.textContent='Échoué';s1.classList.add('failed');} }

    var p2 = document.querySelector('#prog-quiz .progress-circle');
    var s2 = document.getElementById('status-quiz');
    var r2 = document.getElementById('reward-quiz');
    if (state.quiz && state.quiz.completed === true)  { cs++; cc++; if(p2){p2.classList.add('success');p2.textContent='OK';} if(s2){s2.textContent='Débloqué';s2.classList.add('unlocked');} if(r2)r2.classList.add('unlocked'); }
    else if (state.quiz && state.quiz.completed === false) { cc++; if(p2){p2.classList.add('fail');p2.textContent='X';} if(s2){s2.textContent='Échoué';s2.classList.add('failed');} }

    var p3 = document.querySelector('#prog-enigma .progress-circle');
    var s3 = document.getElementById('status-enigma');
    var r3 = document.getElementById('reward-enigma');
    if (state.enigma && state.enigma.completed === true)  { cs++; cc++; if(p3){p3.classList.add('success');p3.textContent='OK';} if(s3){s3.textContent='Débloqué';s3.classList.add('unlocked');} if(r3)r3.classList.add('unlocked'); }
    else if (state.enigma && state.enigma.completed === false) { cc++; if(p3){p3.classList.add('fail');p3.textContent='X';} if(s3){s3.textContent='Échoué';s3.classList.add('failed');} }

    if (cc === 3 && nextZone) {
      nextZone.classList.remove('hidden');
      if (cs === 3)      { nextZone.classList.add('success-zone'); if(nextZoneTitle)nextZoneTitle.textContent='L\'ATELIER APPROUVE !'; if(nextZoneText)nextZoneText.textContent='Tous les accessoires débloqués ! Échange maintenant avec l\'intervenant(e) !'; }
      else if (cs >= 1)  { nextZone.classList.add('partial-zone'); if(nextZoneTitle)nextZoneTitle.textContent='ÉPREUVES TERMINÉES'; if(nextZoneText)nextZoneText.textContent=cs+'/3 accessoires. L\'intervenant(e) peut t\'aider à comprendre le reste !'; }
      else               { nextZone.classList.add('fail-zone');    if(nextZoneTitle)nextZoneTitle.textContent='ÉPREUVES TERMINÉES'; if(nextZoneText)nextZoneText.textContent='Pas d\'accessoire cette fois. L\'intervenant(e) sera là pour t\'expliquer !'; }
    }
  }

  document.querySelectorAll('.reward-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var g  = card.dataset.game;
      var gs = state[g];
      if (gs && gs.completed === true)        { if(modalSuccess)modalSuccess.classList.add('visible'); }
      else if (gs && gs.completed === false)  { if(failMessage)failMessage.textContent='Épreuve échouée. Accessoire verrouillé.'; if(modalFail)modalFail.classList.add('visible'); }
      else                                    { if(failMessage)failMessage.textContent='Complète d\'abord l\'épreuve.'; if(modalFail)modalFail.classList.add('visible'); }
    });
  });

  if(btnCloseSuccess) btnCloseSuccess.addEventListener('click', function(){ if(modalSuccess)modalSuccess.classList.remove('visible'); });
  if(btnCloseFail)    btnCloseFail.addEventListener('click',    function(){ if(modalFail)modalFail.classList.remove('visible'); });
  if(modalSuccess)    modalSuccess.addEventListener('click', function(e){ if(e.target===modalSuccess)modalSuccess.classList.remove('visible'); });
  if(modalFail)       modalFail.addEventListener('click',    function(e){ if(e.target===modalFail)modalFail.classList.remove('visible'); });

  if(btnReset) btnReset.addEventListener('click', function(){
    if(confirm('Recommencer ?')){
      resetGameState();
      window.location.href='index.html';
    }
  });

  updateDisplay();
});
