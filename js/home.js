
  const session = JSON.parse(localStorage.getItem('trainerSession'));
  if (!session) location.href = 'index.html';

  const trainerName = document.getElementById('trainerName');
  trainerName.textContent = session.type === 'metamask' 
    ? `${session.address.slice(0,6)}...${session.address.slice(-4)}`
    : session.address.split('@')[0];

  const walletDisplay = document.getElementById('walletDisplay');

  // === Player & Coins ===
  let player = { id: 25, name: "Pikachu", hp: 100, maxHp: 100 };
  const USER_ID = session.type === 'metamask' ? session.address.toLowerCase() : session.address.toLowerCase();
  const ns = (k) => `${USER_ID}:${k}`;
  const COIN_KEY = ns('coins');
  const STARTER_KEY = ns('starterClaimed');
  const SETTINGS_KEY = ns('settings');
  const WALLET = session.type === 'metamask' ? session.address : null;
  if (WALLET) walletDisplay.textContent = WALLET.slice(0,6)+"..."+WALLET.slice(-4);

  function getCoins(){ return parseInt(localStorage.getItem(COIN_KEY) || '0'); }
  function setCoins(v){ 
    localStorage.setItem(COIN_KEY, String(v));
    localStorage.setItem('coins', String(v));
    document.getElementById('coinDisplay').textContent = v + ' Coins';
    document.getElementById('trainerCoins').textContent = v;
  }
  if (localStorage.getItem(COIN_KEY) === null) { setCoins(500); } else { setCoins(getCoins()); }

  // === POKEMON SELECTOR FUNCTIONALITY ===
  const mainPikachu = document.getElementById('mainPikachu');
  const pokemonSelector = document.getElementById('pokemonSelector');
  const pokemonOptions = pokemonSelector.querySelectorAll('.pokemon-option');

  function updateMainPokemon(pokemonId) {
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`;
    mainPikachu.src = spriteUrl;
    mainPikachu.alt = `${pokemonOptions[pokemonId === 25 ? 0 : pokemonId === 1 ? 1 : pokemonId === 4 ? 2 : pokemonId === 7 ? 3 : 4].dataset.pokemonId}`;
    
    // Update player object
    player.id = pokemonId;
    
   
    pokemonOptions.forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-pokemon-id="${pokemonId}"]`).classList.add('active');
  }

  pokemonOptions.forEach(option => {
    option.addEventListener('click', () => {
      const pokemonId = parseInt(option.dataset.pokemonId);
      updateMainPokemon(pokemonId);
    });
  });

  
  updateMainPokemon(25);

  const menuMap = {
    continueBtn : 'home.html',   
    arenaBtn    : 'arena.html',
    shopBtn     : 'shop.html',
    settingsBtn : 'settings.html'
  };

  Object.entries(menuMap).forEach(([btnId, targetPage]) => {
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.onclick = () => location.href = targetPage;
    }
  });

  document.getElementById('logoutBtn').onclick = () => {
    localStorage.removeItem('trainerSession');
    location.href = 'index.html';
  };
