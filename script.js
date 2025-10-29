
const STORAGE_KEY = 'pokemon_users';
function getUsers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

const $ = (s) => document.querySelector(s);
const loginBox   = $('#login');
const regBox     = $('#register');
const dashBox    = $('#dashboard');
const userDisp   = $('#user-display');
const addrDisp   = $('#user-address');

function showTab(tab) {
  $('.tab-btn.active').classList.remove('active');
  $(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
  $('.form-box.active').classList.remove('active');
  $(`#${tab}`).classList.add('active');
}
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => showTab(btn.dataset.tab));
});

$('#register-btn').addEventListener('click', () => {
  const username = $('#reg-username').value.trim();
  const pass     = $('#reg-password').value;
  const confirm  = $('#reg-confirm').value;
  const msg      = $('#reg-msg');

  if (!username || !pass) return msg.textContent = 'Fill all fields', msg.className = 'msg error';
  if (pass !== confirm) return msg.textContent = 'Passwords do not match', msg.className = 'msg error';

  const users = getUsers();
  if (users[username]) return msg.textContent = 'Username already taken', msg.className = 'msg error';

  users[username] = { password: pass, address: null };
  saveUsers(users);
  msg.textContent = 'Account created! You can now log in.';
  msg.className = 'msg success';
  setTimeout(() => showTab('login'), 1500);
});

$('#login-classic-btn').addEventListener('click', () => {
  const username = $('#login-username').value.trim();
  const pass     = $('#login-password').value;
  const msg      = $('#login-msg');

  const users = getUsers();
  const user  = users[username];

  if (!user) return msg.textContent = 'User not found', msg.className = 'msg error';
  if (user.password !== pass) return msg.textContent = 'Wrong password', msg.className = 'msg error';

  loginSuccess(username, user.address);
});

let metamaskSDK;
let provider;
let accounts = [];

async function initMetaMask() {
  if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
    provider = window.ethereum || window.web3.currentProvider;
  } else {
    metamaskSDK = new MetaMaskSDK.MetaMaskSDK();
    provider = metamaskSDK.getProvider();
  }
}

$('#metamask-login-btn').addEventListener('click', async () => {
  const msg = $('#login-msg');
  msg.textContent = 'Waiting for MetaMask…';
  msg.className = 'msg';

  try {
    await initMetaMask();

    accounts = await provider.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) throw new Error('No account returned');

    const address = accounts[0].toLowerCase();

    const signature = await provider.request({
      method: 'personal_sign',
      params: [address, 'Login to Pokémon Battle Arena'],
    });

    const users = getUsers();
    let username = null;
    for (const [u, data] of Object.entries(users)) {
      if (data.address && data.address.toLowerCase() === address) {
        username = u;
        break;
      }
    }

    if (username) {
      // Existing user – auto-login
      loginSuccess(username, address);
    } else {
      // New wallet – ask for a username (or auto-create)
      const promptName = prompt('Wallet connected! Choose a username:');
      if (!promptName) throw new Error('Username required');
      const trimmed = promptName.trim();
      if (users[trimmed]) throw new Error('Username already taken');

      users[trimmed] = { password: null, address };
      saveUsers(users);
      loginSuccess(trimmed, address);
    }
  } catch (err) {
    console.error(err);
    msg.textContent = err.message || 'MetaMask login failed';
    msg.className = 'msg error';
  }
});

function loginSuccess(username, address) {
  loginBox.classList.remove('active');
  regBox.classList.remove('active');

  // Show dashboard
  dashBox.classList.remove('hidden');
  userDisp.textContent = username;
  addrDisp.textContent = address || '—';

  // Store current session (simple)
  sessionStorage.setItem('currentUser', JSON.stringify({ username, address }));
}

/* ==============================================================
   Logout
   ============================================================== */
$('#logout-btn').addEventListener('click', () => {
  sessionStorage.removeItem('currentUser');
  dashBox.classList.add('hidden');
  showTab('login');
  $('#login-username').value = '';
  $('#login-password').value = '';
  $('#login-msg').textContent = '';
});

/* ==============================================================
   Auto-login if session exists
   ============================================================== */
window.addEventListener('load', () => {
  const sess = sessionStorage.getItem('currentUser');
  if (sess) {
    const { username, address } = JSON.parse(sess);
    loginSuccess(username, address);
  }
});

/* ==============================================================
   Play button – replace with your actual game entry point
   ============================================================== */
$('#play-game').addEventListener('click', (e) => {
  e.preventDefault();
  alert('Redirecting to the Pokémon game… (implement your game URL here)');
  // window.location.href = 'game.html';
});




