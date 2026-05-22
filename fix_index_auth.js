const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Fix the DOMContentLoaded listener and the auth logic
const oldBlock = `    window.addEventListener('DOMContentLoaded', () => {
      loadUserDB();
      const session = loadSession();
      const urlParams = new URLSearchParams(window.location.search);

      if (session) {
        currentUser = session;
        document.getElementById('authScreen').classList.add('hidden');
        updateNavUser(); updateProfilePage(); init();
        checkBackendSession(); // Sync with backend to ensure data consistency
      } else if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        document.getElementById('authScreen').classList.add('hidden');
        updateNavUser();
        checkBackendSession();
      } else {
        document.getElementById('authScreen').classList.add('hidden');
        updateNavUser();
        checkBackendSession();
      }
      document.getElementById('loginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
      document.getElementById('regEmail').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
      document.getElementById('loginEmail').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
      document.getElementById('regPassword').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
    });`;

const newBlock = `    window.addEventListener('DOMContentLoaded', () => {
      loadUserDB();
      const session = loadSession();
      const urlParams = new URLSearchParams(window.location.search);
      const authEl = document.getElementById('authScreen');

      if (session) {
        currentUser = session;
        if (authEl) authEl.classList.add('hidden');
        updateNavUser(); 
        updateProfilePage(); 
        init();
        checkBackendSession();
      } else if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        if (authEl) authEl.classList.add('hidden');
        updateNavUser();
        checkBackendSession();
      } else {
        // No session? Redirect to separate login page
        window.location.href = 'login.html';
      }
    });`;

html = html.replace(oldBlock, newBlock);

// Also remove any other calls to authScreen that might crash
html = html.replace(/document\.getElementById\('authScreen'\)\.classList\.add\('hidden'\);/g, "if(document.getElementById('authScreen')) document.getElementById('authScreen').classList.add('hidden');");
html = html.replace(/document\.getElementById\('authScreen'\)\.classList\.remove\('hidden'\);/g, "window.location.href = 'login.html';");

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed index.html auth logic and null checks');
