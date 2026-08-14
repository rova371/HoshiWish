// HoshiWish - Logique de l'application

let wishes = JSON.parse(localStorage.getItem('hoshi_wishes')) || [];
let tasks = JSON.parse(localStorage.getItem('hoshi_tasks')) || [];
let playlist = [];
let currentTrackIndex = 0;
let currentTimeframe = 'day';

// Initialisation des 25 vœux par défaut s'ils sont vides
if (wishes.length === 0) {
    for (let i = 1; i <= 25; i++) {
        wishes.push({
            id: i,
            title: `Vœu n°${i}`,
            progress: 0
        });
    }
    saveWishes();
}

document.addEventListener("DOMContentLoaded", () => {
    renderWishes();
    renderTasks();
    updateOverallProgress();
});

function saveWishes() {
    localStorage.setItem('hoshi_wishes', JSON.stringify(wishes));
}

function saveTasks() {
    localStorage.setItem('hoshi_tasks', JSON.stringify(tasks));
}

function updateOverallProgress() {
    const totalProgress = wishes.reduce((acc, curr) => acc + curr.progress, 0);
    const overallPercentage = Math.round(totalProgress / 25);
    document.getElementById('overall-percentage').textContent = `${overallPercentage}%`;
    document.getElementById('overall-progress-fill').style.width = `${overallPercentage}%`;
}

// Changement d'Onglet
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Rendu des 25 Vœux
function renderWishes() {
    const grid = document.getElementById('wishes-grid');
    const select = document.getElementById('task-wish-link');
    grid.innerHTML = '';
    select.innerHTML = '<option value="">Lier à un vœu (Optionnel)</option>';

    wishes.forEach(wish => {
        const card = document.createElement('div');
        card.className = 'wish-card';
        card.innerHTML = `
            <div class="wish-header">
                <span class="wish-number">Vœu #${wish.id}</span>
                <span style="font-size:0.8rem; color:var(--text-subtle);">${wish.progress}%</span>
            </div>
            <div class="wish-title">${wish.title}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${wish.progress}%;"></div>
            </div>
            <div style="margin-top:10px; display:flex; gap:6px;">
                <button style="padding:4px 8px; font-size:0.75rem; border-radius:6px; border:none; background:rgba(255,255,255,0.15); color:white; cursor:pointer;" onclick="updateWishProgress(${wish.id}, -10)">-10%</button>
                <button style="padding:4px 8px; font-size:0.75rem; border-radius:6px; border:none; background:var(--primary-accent); color:#1e102d; cursor:pointer;" onclick="updateWishProgress(${wish.id}, 10)">+10%</button>
                <button style="padding:4px 8px; font-size:0.75rem; border-radius:6px; border:none; background:rgba(255,255,255,0.15); color:white; cursor:pointer; margin-left:auto;" onclick="renameWish(${wish.id})">✏️ Éditer</button>
            </div>
        `;
        grid.appendChild(card);

        const opt = document.createElement('option');
        opt.value = wish.id;
        opt.textContent = `#${wish.id} - ${wish.title}`;
        select.appendChild(opt);
    });
}

function updateWishProgress(id, change) {
    const wish = wishes.find(w => w.id === id);
    if (wish) {
        wish.progress = Math.min(100, Math.max(0, wish.progress + change));
        saveWishes();
        renderWishes();
        updateOverallProgress();
    }
}

function renameWish(id) {
    const wish = wishes.find(w => w.id === id);
    if (wish) {
        const newTitle = prompt("Entrez le titre de votre vœu :", wish.title);
        if (newTitle) {
            wish.title = newTitle;
            saveWishes();
            renderWishes();
        }
    }
}

// Gestion du Planning
function switchTimeframe(tf) {
    currentTimeframe = tf;
    document.querySelectorAll('.tf-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    renderTasks();
}

function addTask() {
    const input = document.getElementById('task-input');
    const wishSelect = document.getElementById('task-wish-link');
    
    if (!input.value.trim()) return;

    tasks.push({
        id: Date.now(),
        text: input.value,
        timeframe: currentTimeframe,
        wishId: wishSelect.value || null,
        completed: false
    });

    input.value = '';
    saveTasks();
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';

    const filtered = tasks.filter(t => t.timeframe === currentTimeframe);

    if (filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:var(--text-subtle); margin-top:20px; font-size:0.85rem;">Aucune tâche enregistrée pour la vue (${currentTimeframe}).</p>`;
        return;
    }

    filtered.forEach(task => {
        const item = document.createElement('div');
        item.className = 'task-item';
        const linkedWish = wishes.find(w => w.id == task.wishId);

        item.innerHTML = `
            <div>
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                <span style="${task.completed ? 'text-decoration: line-through; opacity:0.6;' : ''} margin-left:8px;">${task.text}</span>
                ${linkedWish ? `<br><small style="color:var(--primary-accent); margin-left:24px;">✨ ${linkedWish.title}</small>` : ''}
            </div>
            <button onclick="deleteTask(${task.id})" style="background:none; border:none; color:#f472b6; cursor:pointer;">🗑️</button>
        `;
        list.appendChild(item);
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// Lecteur Audio MP3
const audio = document.getElementById('audio-player');

function handleMusicUpload(e) {
    const files = e.target.files;
    for (let file of files) {
        const url = URL.createObjectURL(file);
        playlist.push({
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Mes Chansons",
            src: url
        });
    }
    renderPlaylist();
    if (playlist.length > 0 && !audio.src) {
        loadTrack(0);
    }
}

function renderPlaylist() {
    const plElement = document.getElementById('playlist');
    plElement.innerHTML = '';
    
    playlist.forEach((track, index) => {
        const li = document.createElement('li');
        li.className = `playlist-item ${index === currentTrackIndex ? 'active-track' : ''}`;
        li.innerHTML = `<span>🎵 ${track.title}</span>`;
        li.onclick = () => {
            loadTrack(index);
            playTrack();
        };
        plElement.appendChild(li);
    });
}

function loadTrack(index) {
    currentTrackIndex = index;
    const track = playlist[index];
    if (track) {
        audio.src = track.src;
        document.getElementById('current-title').textContent = track.title;
        document.getElementById('current-artist').textContent = track.artist;
        renderPlaylist();
    }
}

function togglePlay() {
    if (playlist.length === 0) {
        alert("Cliquez d'abord sur '+ Importer mes MP3' pour choisir vos musiques !");
        return;
    }
    if (audio.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
}

function playTrack() {
    audio.play();
    document.getElementById('play-pause-btn').textContent = '⏸️';
    document.getElementById('disc').classList.add('playing');
}

function pauseTrack() {
    audio.pause();
    document.getElementById('play-pause-btn').textContent = '▶️';
    document.getElementById('disc').classList.remove('playing');
}

function nextTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

function prevTrack() {
    if (playlist.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIndex);
    playTrack();
}

audio.addEventListener('ended', () => {
    nextTrack();
});