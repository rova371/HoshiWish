// ---------- Persistance locale ----------
// Toutes les données (statut, notes, journal, photos) sont stockées dans
// localStorage, directement sur l'appareil de l'utilisateur.
// Fonctionne une fois l'app hébergée (ex: GitHub Pages) et ouverte dans le navigateur du téléphone.
const STORAGE_KEY = "voeux25-state-v2";

function defaultWishState(period){
  return { status: "todo", period, note: "", journal: [], photos: [] };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      // s'assure que chaque vœu a bien toutes les clés (utile si mise à jour de l'app)
      WISHES.forEach(w => {
        if(!parsed[w.id]) parsed[w.id] = defaultWishState(w.period);
        else{
          parsed[w.id].journal = parsed[w.id].journal || [];
          parsed[w.id].photos = parsed[w.id].photos || [];
        }
      });
      if(!parsed.meta) parsed.meta = { musicUsed: false };
      return parsed;
    }
  }catch(e){ console.warn("Lecture localStorage impossible", e); }
  const initial = { meta: { musicUsed: false } };
  WISHES.forEach(w => { initial[w.id] = defaultWishState(w.period); });
  return initial;
}

function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){
    console.warn("Écriture localStorage impossible (quota atteint ?)", e);
    alert("Espace de stockage local plein : essaie de supprimer une ancienne photo avant d'en ajouter de nouvelles.");
  }
}

let state = loadState();

// ---------- Onglets principaux ----------
const tabBtns = document.querySelectorAll(".tab-btn");
tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById("view-" + btn.dataset.view).classList.add("active");
    if(btn.dataset.view === "stats") renderStats();
    if(btn.dataset.view === "planning") renderPlanning();
    if(btn.dataset.view === "calendrier"){ renderCountdown(); renderCalendar(); }
  });
});

const periodLabels = {
  daily: "Quotidien", weekly: "Hebdomadaire", monthly: "Mensuel",
  yearly: "Annuel", once: "Un jour"
};
const statusLabels = { todo: "À faire", progress: "En cours", done: "Accompli" };

// ---------- Rendu carte vœu (réutilisé par Vœux + Planning) ----------
function wishCardHTML(w, s){
  const icons = [];
  if(s.journal.length) icons.push(`📖 ${s.journal.length}`);
  if(s.photos.length) icons.push(`📸 ${s.photos.length}`);
  return `
    <div class="wish-num">${w.id}</div>
    <div class="wish-text">${w.text}</div>
    <div class="wish-meta">
      <div class="wish-status status-${s.status}">${statusLabels[s.status]}</div>
      ${icons.length ? `<div class="wish-icons">${icons.join(" · ")}</div>` : ""}
    </div>
  `;
}

// ---------- Vue Vœux ----------
const wishListEl = document.getElementById("wishList");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const periodFilter = document.getElementById("periodFilter");
const statusFilter = document.getElementById("statusFilter");

function renderList(){
  const pf = periodFilter.value;
  const sf = statusFilter.value;

  wishListEl.innerHTML = "";
  WISHES.forEach(w => {
    const s = state[w.id];
    if(pf !== "all" && s.period !== pf) return;
    if(sf !== "all" && s.status !== sf) return;

    const li = document.createElement("li");
    li.className = "wish-card";
    li.innerHTML = wishCardHTML(w, s);
    li.addEventListener("click", () => openModal(w.id));
    wishListEl.appendChild(li);
  });

  const done = WISHES.filter(w => state[w.id].status === "done").length;
  progressLabel.textContent = `${done} / 25 accomplis`;
  progressBar.style.width = (done / 25 * 100) + "%";
}

periodFilter.addEventListener("change", renderList);
statusFilter.addEventListener("change", renderList);

// ---------- Vue Planning ----------
const planningList = document.getElementById("planningList");
const planningEmpty = document.getElementById("planningEmpty");
const segBtns = document.querySelectorAll(".seg-btn");
let currentPlanningPeriod = "daily";

segBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    segBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentPlanningPeriod = btn.dataset.period;
    renderPlanning();
  });
});

function renderPlanning(){
  planningList.innerHTML = "";
  const items = WISHES.filter(w => state[w.id].period === currentPlanningPeriod);
  planningEmpty.hidden = items.length > 0;
  items.forEach(w => {
    const s = state[w.id];
    const li = document.createElement("li");
    li.className = "wish-card";
    li.innerHTML = wishCardHTML(w, s);
    li.addEventListener("click", () => openModal(w.id));
    planningList.appendChild(li);
  });
}

// ---------- Vue Stats ----------
const BADGES = [
  { id:"premier-pas", icon:"🌱", label:"Premier pas", cond: () => WISHES.some(w => state[w.id].status !== "todo") },
  { id:"cinq", icon:"✨", label:"5 vœux accomplis", cond: () => countDone() >= 5 },
  { id:"dix", icon:"🌟", label:"10 vœux accomplis", cond: () => countDone() >= 10 },
  { id:"vingt", icon:"💫", label:"20 vœux accomplis", cond: () => countDone() >= 20 },
  { id:"complet", icon:"🏆", label:"25/25 — Tout accompli", cond: () => countDone() >= 25 },
  { id:"ecrivaine", icon:"📖", label:"Journal assidu (5 entrées)", cond: () => countJournal() >= 5 },
  { id:"souvenirs", icon:"📸", label:"Album souvenirs (5 photos)", cond: () => countPhotos() >= 5 },
  { id:"melomane", icon:"🎵", label:"Mélomane", cond: () => !!state.meta.musicUsed },
];

function countDone(){ return WISHES.filter(w => state[w.id].status === "done").length; }
function countJournal(){ return WISHES.reduce((n,w) => n + state[w.id].journal.length, 0); }
function countPhotos(){ return WISHES.reduce((n,w) => n + state[w.id].photos.length, 0); }

function renderStats(){
  const done = countDone();
  const progress = WISHES.filter(w => state[w.id].status === "progress").length;
  const todo = 25 - done - progress;
  const pct = Math.round(done/25*100);

  document.getElementById("statsGrid").innerHTML = `
    <div class="stat-card"><div class="stat-num">${pct}%</div><div class="stat-label">de vœux accomplis</div></div>
    <div class="stat-card"><div class="stat-num">${done}</div><div class="stat-label">accomplis</div></div>
    <div class="stat-card"><div class="stat-num">${progress}</div><div class="stat-label">en cours</div></div>
    <div class="stat-card"><div class="stat-num">${todo}</div><div class="stat-label">à faire</div></div>
    <div class="stat-card"><div class="stat-num">${countJournal()}</div><div class="stat-label">entrées de journal</div></div>
    <div class="stat-card"><div class="stat-num">${countPhotos()}</div><div class="stat-label">souvenirs photo</div></div>
  `;

  document.getElementById("badgesGrid").innerHTML = BADGES.map(b => `
    <li class="badge ${b.cond() ? "earned" : ""}">
      <span class="badge-icon">${b.icon}</span>${b.label}
    </li>
  `).join("");
}

// ---------- Modale : onglets internes ----------
const modalTabBtns = document.querySelectorAll(".modal-tab-btn");
modalTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    modalTabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".modal-pane").forEach(p => p.classList.remove("active"));
    document.getElementById("mpane-" + btn.dataset.mtab).classList.add("active");
  });
});

// ---------- Modale : Suivi ----------
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalStatus = document.getElementById("modalStatus");
const modalPeriod = document.getElementById("modalPeriod");
const modalNote = document.getElementById("modalNote");
const modalSave = document.getElementById("modalSave");
const modalClose = document.getElementById("modalClose");

let currentWishId = null;

function openModal(id){
  currentWishId = id;
  const w = WISHES.find(w => w.id === id);
  const s = state[id];
  modalTitle.textContent = `${id}. ${w.text}`;
  modalStatus.value = s.status;
  modalPeriod.value = s.period;
  modalNote.value = s.note || "";

  // reset sur l'onglet Suivi à chaque ouverture
  modalTabBtns.forEach(b => b.classList.remove("active"));
  document.querySelector('.modal-tab-btn[data-mtab="suivi"]').classList.add("active");
  document.querySelectorAll(".modal-pane").forEach(p => p.classList.remove("active"));
  document.getElementById("mpane-suivi").classList.add("active");

  renderJournal();
  renderPhotos();
  modalOverlay.hidden = false;
}

function closeModal(){
  modalOverlay.hidden = true;
  currentWishId = null;
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if(e.target === modalOverlay) closeModal();
});

modalSave.addEventListener("click", () => {
  if(currentWishId == null) return;
  const s = state[currentWishId];
  s.status = modalStatus.value;
  s.period = modalPeriod.value;
  s.note = modalNote.value;
  saveState();
  renderList();
  closeModal();
});

// ---------- Modale : Journal ----------
const journalEntry = document.getElementById("journalEntry");
const journalAdd = document.getElementById("journalAdd");
const journalList = document.getElementById("journalList");

function renderJournal(){
  const s = state[currentWishId];
  if(!s.journal.length){
    journalList.innerHTML = `<li class="empty-inline">Pas encore d'entrée pour ce vœu.</li>`;
    return;
  }
  journalList.innerHTML = s.journal.slice().reverse().map(e => `
    <li class="journal-entry">
      <div class="journal-date">${e.date}</div>
      <p class="journal-text"></p>
    </li>
  `).join("");
  // insertion sécurisée du texte (évite les injections HTML)
  const items = journalList.querySelectorAll(".journal-text");
  s.journal.slice().reverse().forEach((e, i) => { items[i].textContent = e.text; });
}

journalAdd.addEventListener("click", () => {
  if(currentWishId == null) return;
  const text = journalEntry.value.trim();
  if(!text) return;
  const s = state[currentWishId];
  s.journal.push({
    id: Date.now(),
    date: new Date().toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }),
    isoDate: new Date().toISOString().slice(0,10),
    text
  });
  journalEntry.value = "";
  saveState();
  renderJournal();
  renderList();
});

// ---------- Modale : Photos ----------
const photoPicker = document.getElementById("photoPicker");
const photoGrid = document.getElementById("photoGrid");

function renderPhotos(){
  const s = state[currentWishId];
  photoGrid.innerHTML = "";
  s.photos.forEach(p => {
    const img = document.createElement("img");
    img.src = p.dataUrl;
    img.addEventListener("click", () => openPhotoView(p.id));
    photoGrid.appendChild(img);
  });
}

photoPicker.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if(!files.length) return;
  const s = state[currentWishId];
  let remaining = files.length;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      s.photos.push({ id: Date.now() + Math.random(), dataUrl: reader.result });
      remaining--;
      if(remaining === 0){
        saveState();
        renderPhotos();
        renderList();
      }
    };
    reader.readAsDataURL(file);
  });
  photoPicker.value = "";
});

// ---------- Visionneuse photo ----------
const photoViewOverlay = document.getElementById("photoViewOverlay");
const photoViewImg = document.getElementById("photoViewImg");
const photoViewClose = document.getElementById("photoViewClose");
const photoViewDelete = document.getElementById("photoViewDelete");
let currentPhotoId = null;

function openPhotoView(photoId){
  const s = state[currentWishId];
  const photo = s.photos.find(p => p.id === photoId);
  if(!photo) return;
  currentPhotoId = photoId;
  photoViewImg.src = photo.dataUrl;
  photoViewOverlay.hidden = false;
}

photoViewClose.addEventListener("click", () => { photoViewOverlay.hidden = true; });
photoViewOverlay.addEventListener("click", (e) => {
  if(e.target === photoViewOverlay) photoViewOverlay.hidden = true;
});
photoViewDelete.addEventListener("click", () => {
  if(currentWishId == null || currentPhotoId == null) return;
  const s = state[currentWishId];
  s.photos = s.photos.filter(p => p.id !== currentPhotoId);
  saveState();
  photoViewOverlay.hidden = true;
  renderPhotos();
  renderList();
});

// ---------- Compte à rebours ----------
const countdownLabel = document.getElementById("countdownLabel");
const countdownDays = document.getElementById("countdownDays");
const countdownDateLabel = document.getElementById("countdownDateLabel");
const countdownEditBtn = document.getElementById("countdownEditBtn");
const countdownEdit = document.getElementById("countdownEdit");
const countdownDateInput = document.getElementById("countdownDateInput");
const countdownSave = document.getElementById("countdownSave");
const headerCountdown = document.getElementById("headerCountdown");

function daysUntil(targetIso){
  const target = new Date(targetIso + "T00:00:00");
  const now = new Date();
  const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - todayMid) / 86400000);
}

function renderCountdown(){
  const iso = state.meta.targetDate;
  if(!iso){
    countdownLabel.textContent = "Choisis ta date du jour J";
    countdownDays.textContent = "—";
    countdownDateLabel.textContent = "";
    headerCountdown.hidden = true;
    return;
  }
  const days = daysUntil(iso);
  const dateStr = new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" });
  countdownDateLabel.textContent = dateStr;

  let mini = "";
  if(days > 0){
    countdownLabel.textContent = "avant le jour J";
    countdownDays.textContent = "J-" + days;
    mini = "J-" + days + " avant le jour J";
  } else if(days === 0){
    countdownLabel.textContent = "C'est aujourd'hui ! 🎉";
    countdownDays.textContent = "🎉";
    mini = "C'est aujourd'hui 🎉";
  } else {
    countdownLabel.textContent = "Passé depuis";
    countdownDays.textContent = "J+" + Math.abs(days);
    mini = "";
  }
  headerCountdown.textContent = mini;
  headerCountdown.hidden = !mini;
}

countdownEditBtn.addEventListener("click", () => {
  countdownEdit.hidden = !countdownEdit.hidden;
  if(state.meta.targetDate) countdownDateInput.value = state.meta.targetDate;
});

countdownSave.addEventListener("click", () => {
  if(!countdownDateInput.value) return;
  state.meta.targetDate = countdownDateInput.value;
  saveState();
  renderCountdown();
  countdownEdit.hidden = true;
});

// ---------- Calendrier ----------
const calMonthLabel = document.getElementById("calMonthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const calPrev = document.getElementById("calPrev");
const calNext = document.getElementById("calNext");

const today = new Date();
let calYear = today.getFullYear();
let calMonth = today.getMonth(); // 0-indexé

function getJournalDatesSet(){
  const set = new Set();
  WISHES.forEach(w => {
    state[w.id].journal.forEach(e => { if(e.isoDate) set.add(e.isoDate); });
  });
  return set;
}

function renderCalendar(){
  const journalDates = getJournalDatesSet();
  const first = new Date(calYear, calMonth, 1);
  const offset = (first.getDay() + 6) % 7; // lundi = 0
  const nbDays = new Date(calYear, calMonth + 1, 0).getDate();

  calMonthLabel.textContent = first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  calendarGrid.innerHTML = "";
  for(let i = 0; i < offset; i++){
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    calendarGrid.appendChild(empty);
  }
  for(let d = 1; d <= nbDays; d++){
    const iso = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const cell = document.createElement("div");
    cell.className = "cal-day";
    const isToday = calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();
    if(isToday) cell.classList.add("today");
    if(journalDates.has(iso)) cell.classList.add("has-journal");
    cell.innerHTML = `${d}${journalDates.has(iso) ? '<span class="cal-dot">📖</span>' : ""}`;
    calendarGrid.appendChild(cell);
  }
}

calPrev.addEventListener("click", () => {
  calMonth--;
  if(calMonth < 0){ calMonth = 11; calYear--; }
  renderCalendar();
});
calNext.addEventListener("click", () => {
  calMonth++;
  if(calMonth > 11){ calMonth = 0; calYear++; }
  renderCalendar();
});

// ---------- Musique de fond ----------
const bgMusicPicker = document.getElementById("bgMusicPicker");
const bgAudio = document.getElementById("bgAudio");
const bgMusicControls = document.getElementById("bgMusicControls");
const bgTrackName = document.getElementById("bgTrackName");
const bgPlayPause = document.getElementById("bgPlayPause");
const bgVolume = document.getElementById("bgVolume");
const miniPlayer = document.getElementById("miniPlayer");
const miniPlayerName = document.getElementById("miniPlayerName");
const miniPlayerToggle = document.getElementById("miniPlayerToggle");

bgAudio.volume = parseFloat(bgVolume.value);

bgMusicPicker.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if(!file) return;
  bgAudio.src = URL.createObjectURL(file);
  bgAudio.loop = true;
  bgTrackName.textContent = file.name;
  bgMusicControls.hidden = false;
  bgAudio.play().catch(() => {});
  miniPlayer.hidden = false;
  miniPlayerName.textContent = "🎵 " + file.name;
  state.meta.musicUsed = true;
  saveState();
  bgMusicPicker.value = "";
});

function toggleBgPlayback(){
  if(!bgAudio.src) return;
  if(bgAudio.paused){ bgAudio.play().catch(() => {}); }
  else{ bgAudio.pause(); }
}

bgPlayPause.addEventListener("click", toggleBgPlayback);
miniPlayerToggle.addEventListener("click", toggleBgPlayback);

bgAudio.addEventListener("play", () => {
  bgPlayPause.textContent = "⏸️ Pause";
  miniPlayerToggle.textContent = "⏸️";
});
bgAudio.addEventListener("pause", () => {
  bgPlayPause.textContent = "▶️ Lire";
  miniPlayerToggle.textContent = "▶️";
});

bgVolume.addEventListener("input", () => {
  bgAudio.volume = parseFloat(bgVolume.value);
});

// ---------- Musique locale (playlist) ----------
const musicPicker = document.getElementById("musicPicker");
const playlistEl = document.getElementById("playlist");
const player = document.getElementById("player");
const audio = document.getElementById("audio");
const nowPlaying = document.getElementById("nowPlaying");

let tracks = [];

musicPicker.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  if(!files.length) return;
  const newTracks = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
  tracks = tracks.concat(newTracks);
  state.meta.musicUsed = true;
  saveState();
  renderPlaylist();
  musicPicker.value = "";
});

function renderPlaylist(){
  playlistEl.innerHTML = "";
  tracks.forEach((t, i) => {
    const li = document.createElement("li");
    li.textContent = t.name;
    li.addEventListener("click", () => playTrack(i));
    playlistEl.appendChild(li);
  });
}

function playTrack(i){
  const t = tracks[i];
  audio.src = t.url;
  audio.play();
  nowPlaying.textContent = t.name;
  player.hidden = false;
  document.querySelectorAll(".playlist li").forEach((li, idx) => {
    li.classList.toggle("playing", idx === i);
  });
}

// ---------- Service worker (mode hors-ligne basique) ----------
if ("serviceWorker" in navigator){
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// ---------- Premier rendu ----------
renderList();
renderCountdown();
