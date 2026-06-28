
const playlist = [
  {
    title:  "Chill Lofi Beat",
    artist: "Free Music Archive",
    color:  "#2a1a3e",
    accent: "#c084fc",
  
    src: null, // placeholder
    duration: "3:24",
  },
  {
    title:  "Jazz Café",
    artist: "Pixabay Music",
    color:  "#1a2e1e",
    accent: "#4ade80",
    src: null,
    duration: "2:58",
  },
  {
    title:  "Ambient Drift",
    artist: "SoundHelix",
    color:  "#1e1a2e",
    accent: "#818cf8",
    src: null,
    duration: "4:11",
  },
  {
    title:  "Electric Blues",
    artist: "ccMixter",
    color:  "#2e1a1a",
    accent: "#fb923c",
    src: null,
    duration: "3:47",
  },
  {
    title:  "Deep Focus",
    artist: "Bensound",
    color:  "#1a2028",
    accent: "#38bdf8",
    src: null,
    duration: "5:02",
  },
];

// Real open audio files for demo
const audioFiles = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
];
playlist.forEach((t, i) => t.src = audioFiles[i]);


let currentIdx  = 0;
let isPlaying   = false;
let isShuffle   = false;
let isRepeat    = false;
let isAutoplay  = true;
let isMuted     = false;
let prevVol     = 75;


const audioEl      = document.getElementById('audioEl');
const playBtn      = document.getElementById('playBtn');
const prevBtn      = document.getElementById('prevBtn');
const nextBtn      = document.getElementById('nextBtn');
const shuffleBtn   = document.getElementById('shuffleBtn');
const repeatBtn    = document.getElementById('repeatBtn');
const queueBtn     = document.getElementById('queueBtn');
const autoplayBtn  = document.getElementById('autoplayBtn');
const volSlider    = document.getElementById('volSlider');
const volPct       = document.getElementById('volPct');
const volIcon      = document.getElementById('volIcon');
const progressTrack= document.getElementById('progressTrack');
const progressFill = document.getElementById('progressFill');
const timeElapsed  = document.getElementById('timeElapsed');
const timeDuration = document.getElementById('timeDuration');
const trackTitle   = document.getElementById('trackTitle');
const trackArtist  = document.getElementById('trackArtist');
const trackNum     = document.getElementById('trackNum');
const trackTotal   = document.getElementById('trackTotal');
const statusPill   = document.getElementById('statusPill');
const record       = document.getElementById('record');
const recordStage  = document.getElementById('recordStage');
const tonearm      = document.getElementById('tonearm');
const recordLabel  = document.getElementById('recordLabel');
const labelFallback= document.getElementById('labelFallback');
const playlistPanel= document.getElementById('playlistPanel');
const playlistItems= document.getElementById('playlistItems');


function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}


function loadTrack(idx, autostart = false) {
  const t = playlist[idx];
  currentIdx = idx;

  // Info
  trackTitle.textContent  = t.title;
  trackArtist.textContent = t.artist;
  trackNum.textContent    = idx + 1;
  trackTotal.textContent  = playlist.length;

  // Accent color on label
  labelFallback.style.color = t.accent;
  recordLabel.style.background = `linear-gradient(135deg, ${t.color}, #0d0d1a)`;
  recordLabel.style.borderColor = t.accent + '44';

  // Note emoji as "art"
  const notes = ['♩','♪','♫','♬','🎵'];
  labelFallback.textContent = notes[idx % notes.length];

  // Audio
  audioEl.src = t.src;
  audioEl.load();

  // Reset progress
  progressFill.style.width = '0%';
  timeElapsed.textContent = '0:00';
  timeDuration.textContent = t.duration;

  // Highlight playlist
  document.querySelectorAll('.playlist-item').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });

  if (autostart) {
    audioEl.play().then(() => setPlaying(true)).catch(() => {});
  } else {
    setPlaying(false);
  }
}

function setPlaying(state) {
  isPlaying = state;
  playBtn.innerHTML        = state ? '⏸' : '▶';
  record.classList.toggle('playing', state);
  recordStage.classList.toggle('playing', state);
  tonearm.classList.toggle('playing', state);
  statusPill.textContent   = state ? '● Playing' : 'Paused';
  statusPill.classList.toggle('playing', state);
}

playBtn.addEventListener('click', () => {
  if (isPlaying) {
    audioEl.pause();
    setPlaying(false);
  } else {
    audioEl.play().catch(() => {
   
    });
    setPlaying(true);
  }
});

prevBtn.addEventListener('click', () => {
 
  if (audioEl.currentTime > 3) {
    audioEl.currentTime = 0;
    return;
  }
  let idx = currentIdx - 1;
  if (idx < 0) idx = playlist.length - 1;
  loadTrack(idx, isPlaying);
});

nextBtn.addEventListener('click', () => {
  let idx;
  if (isShuffle) {
    do { idx = Math.floor(Math.random() * playlist.length); }
    while (idx === currentIdx && playlist.length > 1);
  } else {
    idx = (currentIdx + 1) % playlist.length;
  }
  loadTrack(idx, isPlaying);
});

shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active', isRepeat);
  audioEl.loop = isRepeat;
});

// Autoplay toggle
autoplayBtn.addEventListener('click', () => {
  isAutoplay = !isAutoplay;
  autoplayBtn.classList.toggle('on', isAutoplay);
});

// Queue toggle
queueBtn.addEventListener('click', () => {
  const open = playlistPanel.classList.toggle('open');
  queueBtn.classList.toggle('active', open);
  // Adjust card border-radius
  document.querySelector('.card').style.borderRadius = open ? '28px 28px 0 0' : '28px';
});


audioEl.addEventListener('timeupdate', () => {
  if (!audioEl.duration) return;
  const pct = (audioEl.currentTime / audioEl.duration) * 100;
  progressFill.style.width = pct + '%';
  timeElapsed.textContent  = fmt(audioEl.currentTime);
  timeDuration.textContent = fmt(audioEl.duration);
});

progressTrack.addEventListener('click', (e) => {
  const rect = progressTrack.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audioEl.currentTime = pct * (audioEl.duration || 0);
});

// Drag scrub
let scrubbing = false;
progressTrack.addEventListener('mousedown', () => scrubbing = true);
document.addEventListener('mousemove', (e) => {
  if (!scrubbing) return;
  const rect = progressTrack.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audioEl.currentTime = pct * (audioEl.duration || 0);
});
document.addEventListener('mouseup', () => scrubbing = false);


function updateVolume(val) {
  audioEl.volume = val / 100;
  volPct.textContent = val + '%';
  volIcon.textContent = val === 0 ? '🔇' : val < 50 ? '🔈' : '🔉';
  
  const pct = val + '%';
  volSlider.style.background = `linear-gradient(90deg, #F5A623 ${pct}, #2A2A3E ${pct})`;
}
volSlider.addEventListener('input', () => {
  isMuted = false;
  prevVol = +volSlider.value;
  updateVolume(+volSlider.value);
});
volIcon.addEventListener('click', () => {
  isMuted = !isMuted;
  if (isMuted) {
    prevVol = +volSlider.value || 75;
    volSlider.value = 0;
    updateVolume(0);
  } else {
    volSlider.value = prevVol;
    updateVolume(prevVol);
  }
});
updateVolume(75);


audioEl.addEventListener('ended', () => {
  if (isRepeat) return;
  if (isAutoplay) {
    let idx;
    if (isShuffle) {
      do { idx = Math.floor(Math.random() * playlist.length); }
      while (idx === currentIdx && playlist.length > 1);
    } else {
      idx = (currentIdx + 1) % playlist.length;
    }
    loadTrack(idx, true);
  } else {
    setPlaying(false);
    progressFill.style.width = '0%';
    audioEl.currentTime = 0;
  }
});


function renderPlaylist() {
  playlistItems.innerHTML = '';
  playlist.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'playlist-item' + (i === currentIdx ? ' active' : '');
    div.innerHTML = `
      <div class="pl-num">${i + 1}</div>
      <div class="pl-eq"><div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div></div>
      <div class="pl-info">
        <div class="pl-title">${t.title}</div>
        <div class="pl-artist">${t.artist}</div>
      </div>
      <div class="pl-dur">${t.duration}</div>
    `;
    div.addEventListener('click', () => {
      loadTrack(i, true);
      renderPlaylist();
    });
    playlistItems.appendChild(div);
  });
}
renderPlaylist();


document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space')      { e.preventDefault(); playBtn.click(); }
  if (e.code === 'ArrowRight') { e.preventDefault(); nextBtn.click(); }
  if (e.code === 'ArrowLeft')  { e.preventDefault(); prevBtn.click(); }
  if (e.code === 'ArrowUp')    { e.preventDefault(); const v = Math.min(100, +volSlider.value+5); volSlider.value = v; updateVolume(v); }
  if (e.code === 'ArrowDown')  { e.preventDefault(); const v = Math.max(0,   +volSlider.value-5); volSlider.value = v; updateVolume(v); }
  if (e.code === 'KeyM')       { volIcon.click(); }
  if (e.code === 'KeyQ')       { queueBtn.click(); }
});


loadTrack(0, false);
trackTotal.textContent = playlist.length;