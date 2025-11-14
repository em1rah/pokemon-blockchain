
    // Tab switching functionality
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const formId = tab.dataset.form + 'Form';
        document.querySelectorAll('.form').forEach(f => f.classList.remove('active'));
        document.getElementById(formId).classList.add('active');
      });
    });
    document.querySelector('.switch-to-login').addEventListener('click', e => {
      e.preventDefault();
      document.querySelector('[data-form="login"]').click();
    });

    // Music control functionality
    const musicControl = document.getElementById('musicControl');
    const pokemonMusic = document.getElementById('pokemonMusic');
    const playIcon = musicControl.querySelector('.icon');
    let isPlaying = false;

    // SVG icons (play = music note, pause = bars)
    const PLAY_ICON  = '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>';
    const PAUSE_ICON = '<rect x="6" y="6" width="4" height="12" rx="1"/><rect x="14" y="6" width="4" height="12" rx="1"/>';

    function setIcon(svgPath) {
      playIcon.innerHTML = svgPath;
    }

    // Unlock audio on first user interaction (iOS/Android fix)
    let unlocked = false;
    function unlockAudio() {
      if (unlocked) return;
      const silent = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA');
      silent.play().catch(() => {});
      unlocked = true;
    }
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });

    musicControl.addEventListener('click', () => {
      if (isPlaying) {
        // Stop music
        pokemonMusic.pause();
        pokemonMusic.currentTime = 0;
        musicControl.classList.remove('playing');
        setIcon(PLAY_ICON);
        isPlaying = false;
      } else {
        // Play music
        pokemonMusic.play()
          .then(() => {
            musicControl.classList.add('playing');
            setIcon(PAUSE_ICON);
            isPlaying = true;
          })
          .catch(err => {
            console.warn('Audio play failed:', err);
            // Silent retry after unlock
            setTimeout(() => {
              if (!unlocked) unlockAudio();
              pokemonMusic.play().catch(() => {});
            }, 100);
          });
      }
    });

    // Auto-start on first interaction (smooth UX)
    let firstInteraction = true;
    document.body.addEventListener('click', function autoStart(e) {
      if (!firstInteraction) return;
      firstInteraction = false;
      if (!isPlaying && !e.target.closest('#musicControl')) {
        musicControl.click();
      }
    }, { once: true });

    // MetaMask connection functionality
    async function connectMetaMask(statusEl, action) {
      const eth = window.ethereum;
      if (!eth) {
        statusEl.textContent = 'MetaMask not detected';
        statusEl.style.color = '#ff4444';
        alert('Please install MetaMask to continue.');
        return;
      }

      try {
        statusEl.textContent = 'Connecting to wallet...';
        statusEl.style.color = '#ffcb05';

        const accounts = await eth.request({ method: 'eth_requestAccounts' });
        if (!accounts?.length) throw new Error('No account selected');

        const addr = accounts[0];
        const shortAddr = `${addr.slice(0,6)}...${addr.slice(-4)}`;

        try {
          await eth.request({
            method: 'personal_sign',
            params: [addr, `Welcome to PikaPlay! ${action === 'register' ? 'Registering' : 'Logging in'} as trainer.`]
          });
        } catch (_) {  }

        statusEl.textContent = `Connected: ${shortAddr}`;
        statusEl.style.color = '#4CAF50';

        localStorage.setItem('trainerSession', JSON.stringify({
          type: 'metamask',
          address: addr,
          action: action
        }));

        setTimeout(() => location.href = 'home.html', 1200);
      } catch (err) {
        const msg = err.code === 4001 
          ? 'Connection rejected by user' 
          : (err.message || 'Connection failed');
        statusEl.textContent = msg;
        statusEl.style.color = '#f44336';
      }
    }

    document.getElementById('metamaskLogin').onclick = () => 
      connectMetaMask(document.getElementById('loginStatus'), 'login');

    document.getElementById('metamaskRegister').onclick = () => 
      connectMetaMask(document.getElementById('registerStatus'), 'register');

      const canvas = document.getElementById("fire-fx");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
 
const flames = [];
const flameCount = 60;

for (let i = 0; i < flameCount; i++) {
  flames.push({
    x: Math.random() * canvas.width,
    y: canvas.height - Math.random() * 100,
    radius: Math.random() * 30 + 10,
    alpha: Math.random() * 0.4 + 0.3,
    speed: Math.random() * 0.5 + 0.2,
    hue: 30 + Math.random() * 30
  });
}
 
function animateFire() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
 
  flames.forEach(f => {
    const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
    gradient.addColorStop(0, `hsla(${f.hue}, 100%, 60%, ${f.alpha})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
 
   
    f.y -= f.speed;
    f.x += (Math.random() - 0.5) * 0.5; 
    f.alpha -= 0.003;
 
  
    if (f.alpha <= 0) {
      f.x = Math.random() * canvas.width;
      f.y = canvas.height - Math.random() * 80;
      f.radius = Math.random() * 25 + 10;
      f.alpha = Math.random() * 0.5 + 0.3;
    }
  });
 
  requestAnimationFrame(animateFire);
}
animateFire();
 
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
 