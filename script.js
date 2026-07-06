const $=id=>document.getElementById(id);let data=null,teamAssets={},allRounds=[],player="",selectedRound=null,matchIndex=0,score=0,resultAttempts=3,scorerAttempts=3,remainingScorers=[],stats=null;const APP_VERSION="4.3";const SAVE_KEY="cavalliSegugiSaveV43",LEADERBOARD_KEY="cavalliSegugiLeaderboardV3";const compoundSurnames=["de bruyne","de ketelaere","loftus cheek","yoan bonny","da cunha","di lorenzo","norton cuffy","de winter","el shaarawy","del prato","de silvestri"];function normalizeText(value){
  const specialMap = {
    "ı":"i","İ":"i",
    "ø":"o","Ø":"o",
    "æ":"ae","Æ":"ae",
    "œ":"oe","Œ":"oe",
    "ß":"ss",
    "ð":"d","Ð":"d",
    "þ":"th","Þ":"th",
    "ł":"l","Ł":"l",
    "đ":"d","Đ":"d",
    "á":"a","à":"a","ä":"a","â":"a","ã":"a","å":"a","Á":"a","À":"a","Ä":"a","Â":"a","Ã":"a","Å":"a",
    "é":"e","è":"e","ë":"e","ê":"e","É":"e","È":"e","Ë":"e","Ê":"e",
    "í":"i","ì":"i","ï":"i","î":"i","Í":"i","Ì":"i","Ï":"i","Î":"i",
    "ó":"o","ò":"o","ö":"o","ô":"o","õ":"o","Ó":"o","Ò":"o","Ö":"o","Ô":"o","Õ":"o",
    "ú":"u","ù":"u","ü":"u","û":"u","Ú":"u","Ù":"u","Ü":"u","Û":"u",
    "ç":"c","Ç":"c","ğ":"g","Ğ":"g",
    "ñ":"n","Ñ":"n"
  };

  return String(value || "")
    .replace(/[ıİøØæÆœŒßðÐþÞłŁđĐáàäâãåÁÀÄÂÃÅéèëêÉÈËÊíìïîÍÌÏÎóòöôõÓÒÖÔÕúùüûÚÙÜÛçÇñÑ]/g, char => specialMap[char] || char)
    .toLowerCase()
    .normalize("NFKD")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[’']/g,"")
    .replace(/[^\p{L}\p{N}\s-]/gu,"")
    .replace(/\s+/g," ")
    .trim();
}
function surnameOf(fullName){const cleaned=normalizeText(fullName);for(const compound of compoundSurnames){if(cleaned.endsWith(compound))return compound}const parts=cleaned.split(" ").filter(Boolean);return parts.length?parts[parts.length-1]:cleaned}function matchesScorerGuess(guess,scorerName){const normalizedGuess=normalizeText(guess);if(!normalizedGuess)return false;return normalizedGuess===normalizeText(scorerName)||normalizedGuess===surnameOf(scorerName)}async function loadData(){if(data)return;const [dataRes,teamsRes]=await Promise.all([fetch("seriea_data.json"),fetch("teams.json").catch(()=>null)]);data=await dataRes.json();teamAssets=teamsRes?await teamsRes.json():{};allRounds=[];data.seasons.forEach(season=>{season.rounds.forEach(round=>{allRounds.push({season:season.season,round:round.round,matches:round.matches})})})}function emptyStats(){return{exactResults:0,partialResults:0,wrongResults:0,scorersFound:0,scorerErrors:0,matchesCompleted:0}}function teamMeta(name){return teamAssets[name]||{abbr:name.split(" ").map(x=>x[0]).join("").slice(0,3).toUpperCase(),primary:"#345",secondary:"#89a"}}function crestHtml(team){
  const meta = teamMeta(team);
  if(meta.logoData || meta.logo){
    const src = meta.logoData || meta.logo;
    return `<div class="team-logo-wrap"><img class="team-logo" src="${src}" alt="Logo ${team}" loading="eager" decoding="async"></div>`;
  }
  return `<div class="team-crest" style="--team-a:${meta.primary};--team-b:${meta.secondary}"><span>${meta.abbr}</span></div>`;
}
async function startNewGame(){player=$("playerName").value.trim();if(!player){alert("Inserisci il tuo nome.");return}await loadData();selectedRound=allRounds[Math.floor(Math.random()*allRounds.length)];matchIndex=0;score=0;stats=emptyStats();showScreen("game");prepareGameLabels();showMatch();saveGame()}function prepareGameLabels(){$("playerLabel").textContent=player;$("roundLabel").textContent=`Serie A ${selectedRound.season} · Giornata ${selectedRound.round}`;updateScore()}function showScreen(id){["home","game","final","leaderboard"].forEach(screen=>$(screen).classList.add("hidden"));$(id).classList.remove("hidden")}function updateScore(){$("scoreLabel").textContent=score}function updateProgress(){const total=selectedRound.matches.length,current=Math.min(matchIndex+1,total);$("progressText").textContent=`Partita ${current}/${total}`;$("statsMini").textContent=`Esatti ${stats.exactResults} · Parziali ${stats.partialResults} · Marcatori ${stats.scorersFound}`;$("progressFill").style.width=`${matchIndex/total*100}%`}function showMatch(){if(matchIndex>=selectedRound.matches.length){finishGame();return}const m=selectedRound.matches[matchIndex];resultAttempts=3;scorerAttempts=3;remainingScorers=m.scorers.map((s,i)=>({...s,id:i,guessed:false}));$("feedback").innerHTML="";updateProgress();$("matchArea").innerHTML=`<div class="teams-board"><div class="team-side">${crestHtml(m.home)}<div class="team-name">${m.home}</div></div><div class="vs-badge">VS</div><div class="team-side">${crestHtml(m.away)}<div class="team-name">${m.away}</div></div></div><div id="resultPanel" class="panel"><h3>1. Indovina il risultato</h3><p class="small">Hai <strong id="resultAttempts">${resultAttempts}</strong> tentativi. Il bonus parziale da 25 punti vale solo al terzo tentativo.</p><div class="inputs-row"><input id="homeGoals" type="number" min="0" placeholder="Gol ${m.home}"><input id="awayGoals" type="number" min="0" placeholder="Gol ${m.away}"><button id="resultBtn">Conferma</button></div></div><div id="scorerPanel" class="panel hidden"><h3>2. Indovina i marcatori</h3><p class="small">Puoi scrivere nome+cognome oppure solo il cognome. Se un calciatore ha segnato più gol, scriverlo una sola volta assegna subito tutti i punti.</p><p class="small">Errori rimasti: <strong id="scorerAttempts">${scorerAttempts}</strong></p><div class="inputs-row"><input id="scorerInput" type="text" placeholder="Marcatore"><button id="scorerBtn">Conferma</button><button id="skipScorersBtn" class="secondary">Mostra soluzione</button></div><div id="foundScorers" class="scorer-list"></div></div>`;$("resultBtn").addEventListener("click",checkResult);$("homeGoals").addEventListener("keydown",handleResultEnter);$("awayGoals").addEventListener("keydown",handleResultEnter);saveGame()}function handleResultEnter(e){if(e.key==="Enter")checkResult()}function checkResult(){const m=selectedRound.matches[matchIndex],hRaw=$("homeGoals").value,aRaw=$("awayGoals").value,h=Number(hRaw),a=Number(aRaw);if(hRaw===""||aRaw===""||!Number.isInteger(h)||!Number.isInteger(a)||h<0||a<0){setFeedback("Inserisci due punteggi validi.","warn");return}if(h===m.score.home&&a===m.score.away){score+=50;stats.exactResults++;updateScore();setFeedback("✅ Risultato esatto! +50 punti.","ok");lockResultInputs();openScorers();saveGame();return}const isPartial=h===m.score.home||a===m.score.away;resultAttempts--;$("resultAttempts").textContent=resultAttempts;if(resultAttempts>0){setFeedback(isPartial?"🟡 Metà risultato corretta, ma il bonus parziale vale solo all'ultimo tentativo. Riprova.":"❌ Risultato sbagliato. Riprova.",isPartial?"warn":"bad");saveGame();return}if(isPartial){score+=25;stats.partialResults++;updateScore();setFeedback("🟡 Ultimo tentativo: risultato parzialmente corretto. +25 punti.","warn")}else{stats.wrongResults++;setFeedback("❌ Tentativi risultato finiti.","bad")}showResultSolution();saveGame()}function lockResultInputs(){["resultBtn","homeGoals","awayGoals"].forEach(id=>{const el=$(id);if(el)el.disabled=true})}function showResultSolution(){const m=selectedRound.matches[matchIndex];$("resultPanel").innerHTML=`<h3>Soluzione risultato</h3><div class="solution"><p>Il risultato corretto era:</p><strong>${m.home} ${m.score.home}-${m.score.away} ${m.away}</strong></div><button id="goScorersBtn">Vai avanti</button>`;$("goScorersBtn").addEventListener("click",()=>{openScorers();saveGame()})}function openScorers(){const scorerPanel=$("scorerPanel");if(!scorerPanel)return;scorerPanel.classList.remove("hidden");lockResultInputs();const m=selectedRound.matches[matchIndex];if(m.scorers.length===0){scorerPanel.innerHTML=`<h3>Marcatori</h3><div class="solution"><p>Questa partita è finita 0-0: nessun marcatore.</p></div><button id="nextBtn">Vai avanti</button>`;$("nextBtn").addEventListener("click",nextMatch);return}$("scorerBtn").addEventListener("click",checkScorer);$("scorerInput").addEventListener("keydown",e=>{if(e.key==="Enter")checkScorer()});$("skipScorersBtn").addEventListener("click",showCorrectScorers);$("scorerInput").focus()}async function checkScorer(){
  const guess = $("scorerInput").value;
  if(!normalizeText(guess)){
    setFeedback("Inserisci un nome o un cognome.", "warn");
    return;
  }

  const btn = $("scorerBtn");
  const input = $("scorerInput");
  if(btn) btn.disabled = true;
  if(input) input.disabled = true;

  const foundGroup = remainingScorers.filter(s => !s.guessed && matchesScorerGuess(guess, s.name));

  if(foundGroup.length > 0){
    let kind = "goal";
    if(foundGroup.length === 2) kind = "double";
    if(foundGroup.length >= 3) kind = "triple";
    await playShotAnimation(kind);

    foundGroup.forEach(s => s.guessed = true);
    const gained = foundGroup.length * 20;
    score += gained;
    stats.scorersFound += foundGroup.length;
    updateScore();

    $("scorerInput").value = "";
    renderFoundScorers();

    const suffix = foundGroup.length > 1 ? ` ×${foundGroup.length}` : "";
    setFeedback(`⚽ ${foundGroup[0].name}${suffix}: +${gained} punti.`, "ok");

    if(remainingScorers.every(s => s.guessed)){
      showAllScorersFound();
      saveGame();
      return;
    }
  } else {
    scorerAttempts--;
    stats.scorerErrors++;
    $("scorerAttempts").textContent = scorerAttempts;
    setFeedback("NOOOO, CHE ERRORE!", "bad");

    if(scorerAttempts <= 0){
      showCorrectScorers();
      saveGame();
      return;
    }
  }

  if(btn) btn.disabled = false;
  if(input){
    input.disabled = false;
    input.focus();
  }
  saveGame();
}

function groupScorers(list){const groups=[];list.forEach(s=>{const key=normalizeText(s.name)+"|"+Boolean(s.ownGoal);let group=groups.find(g=>g.key===key);if(!group){group={key,name:s.name,ownGoal:Boolean(s.ownGoal),count:0};groups.push(group)}group.count++});return groups}function renderFoundScorers(){const groups=groupScorers(remainingScorers.filter(s=>s.guessed));$("foundScorers").innerHTML=groups.map(g=>{const suffix=g.count>1?` ×${g.count}`:"";return `<span class="chip">${g.ownGoal?"🔴⚽ ":"⚽ "}${g.name}${suffix}</span>`}).join("")}function scorerSolutionHtml(){if(remainingScorers.length===0)return `<p>Nessun marcatore.</p>`;const groups=groupScorers(remainingScorers);return `<div class="scorer-list">${groups.map(g=>{const suffix=g.count>1?` ×${g.count}`:"";return `<span class="chip">${g.ownGoal?"🔴⚽ ":"⚽ "}${g.name}${suffix}</span>`}).join("")}</div>`}function showAllScorersFound(){$("scorerPanel").innerHTML=`<h3>Marcatori completati</h3><div class="solution"><p>Hai trovato tutti i marcatori della partita.</p>${scorerSolutionHtml()}</div><button id="nextBtn">Vai avanti</button>`;setFeedback("✅ Tutti i marcatori indovinati!","ok");$("nextBtn").addEventListener("click",nextMatch)}function showCorrectScorers(){$("scorerPanel").innerHTML=`<h3>Soluzione marcatori</h3><div class="solution"><p>I marcatori corretti erano:</p>${scorerSolutionHtml()}</div><button id="nextBtn">Vai avanti</button>`;setFeedback("Soluzione mostrata.","bad");$("nextBtn").addEventListener("click",nextMatch);saveGame()}function nextMatch(){stats.matchesCompleted++;matchIndex++;if(selectedRound)$("progressFill").style.width=`${matchIndex/selectedRound.matches.length*100}%`;showMatch()}
function playShotAnimation(kind){
  const overlay = $("shotOverlay");
  const text = $("shotText");
  if(!overlay || !text){
    return Promise.resolve();
  }

  overlay.className = "shot-overlay";
  overlay.classList.add(kind === "miss" ? "miss" : "goal");

  if(kind === "double"){
    overlay.classList.add("double");
    text.textContent = "DOPPIETTA!!!!";
  } else if(kind === "triple"){
    overlay.classList.add("triple");
    text.textContent = "HAT-TRICK!";
  } else if(kind === "miss"){
    text.textContent = "NOOOO, CHE ERRORE!";
  } else {
    text.textContent = "E C\'È IL GRAN GOL!";
  }

  overlay.classList.remove("hidden");

  return new Promise(resolve => {
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.className = "shot-overlay hidden";
      resolve();
    }, 2250);
  });
}

function setFeedback(text,type){$("feedback").innerHTML=`<div class="feedback ${type}">${text}</div>`}function finishGame(){localStorage.removeItem(SAVE_KEY);addLeaderboardEntry();showScreen("final");$("finalText").textContent=`${player}, hai totalizzato ${score} punti nella giornata ${selectedRound.round} (${selectedRound.season}).`;$("finalStats").innerHTML=`<div class="metric"><span>Risultati esatti</span><strong>${stats.exactResults}</strong></div><div class="metric"><span>Risultati parziali al 3º tentativo</span><strong>${stats.partialResults}</strong></div><div class="metric"><span>Marcatori indovinati</span><strong>${stats.scorersFound}</strong></div><div class="metric"><span>Errori marcatori</span><strong>${stats.scorerErrors}</strong></div>`}function saveGame(){if(!selectedRound||!stats)return;localStorage.setItem(SAVE_KEY,JSON.stringify({version:APP_VERSION,player,selectedRound,matchIndex,score,stats}));updateContinueButton()}function updateContinueButton(){const hasSave=Boolean(localStorage.getItem(SAVE_KEY));$("continueBtn").classList.toggle("hidden",!hasSave)}async function continueSavedGame(){await loadData();const raw=localStorage.getItem(SAVE_KEY);if(!raw){localStorage.removeItem("cavalliSegugiSaveV40");localStorage.removeItem("cavalliSegugiSaveV38");localStorage.removeItem("cavalliSegugiSaveV37");localStorage.removeItem("cavalliSegugiSaveV36");localStorage.removeItem("cavalliSegugiSaveV3");localStorage.removeItem("cavalliSegugiSaveV2");updateContinueButton();return}try{const save=JSON.parse(raw);if(save.version!==APP_VERSION){localStorage.removeItem(SAVE_KEY);alert("La partita salvata era di una versione precedente: inizia una nuova partita per usare i marcatori corretti.");updateContinueButton();return;}player=save.player;selectedRound=save.selectedRound;matchIndex=save.matchIndex;score=save.score;stats=save.stats||emptyStats();showScreen("game");prepareGameLabels();showMatch()}catch{localStorage.removeItem(SAVE_KEY);updateContinueButton()}}function addLeaderboardEntry(){const list=getLeaderboard();list.push({player,score,round:selectedRound.round,season:selectedRound.season,date:new Date().toLocaleDateString("it-IT")});list.sort((a,b)=>b.score-a.score);localStorage.setItem(LEADERBOARD_KEY,JSON.stringify(list.slice(0,10)))}function getLeaderboard(){try{return JSON.parse(localStorage.getItem(LEADERBOARD_KEY))||[]}catch{return[]}}function showLeaderboard(){const list=getLeaderboard();showScreen("leaderboard");if(list.length===0){$("leaderboardList").innerHTML=`<p class="subtitle">Nessun punteggio salvato.</p>`;return}$("leaderboardList").innerHTML=list.map((entry,i)=>`<div class="leader-row"><div class="leader-rank">#${i+1}</div><div><strong>${entry.player}</strong><div class="small">Giornata ${entry.round} · ${entry.season} · ${entry.date}</div></div><div class="leader-score">${entry.score}</div></div>`).join("")}function clearLeaderboard(){localStorage.removeItem(LEADERBOARD_KEY);showLeaderboard()}$("playBtn").addEventListener("click",startNewGame);$("playerName").addEventListener("keydown",e=>{if(e.key==="Enter")startNewGame()});$("continueBtn").addEventListener("click",continueSavedGame);$("leaderboardBtn").addEventListener("click",showLeaderboard);$("showLeaderboardFinalBtn").addEventListener("click",showLeaderboard);$("backHomeBtn").addEventListener("click",()=>{showScreen("home");updateContinueButton()});$("clearLeaderboardBtn").addEventListener("click",clearLeaderboard);$("restartBtn").addEventListener("click",()=>{showScreen("home");updateContinueButton()});updateContinueButton();

const shotCloseBtn = document.querySelector(".shot-close");
if(shotCloseBtn){
  shotCloseBtn.addEventListener("click", () => {
    const overlay = $("shotOverlay");
    if(overlay){
      overlay.className = "shot-overlay hidden";
    }
  });
}
