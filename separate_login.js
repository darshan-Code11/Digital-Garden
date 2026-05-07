const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// 1. Extract CSS
const cssMatch = indexHtml.match(/\/\* \={3} AUTH OVERLAY \={3} \*\/[\s\S]*?\/\* \={3} MAIN LAYOUT \={3} \*\//);
const authCss = cssMatch ? cssMatch[0] : '';

// 2. Extract HTML
const htmlMatch = indexHtml.match(/<div class="auth-screen hidden" id="authScreen">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
let authHtml = htmlMatch ? htmlMatch[0] : '';
authHtml = authHtml.replace('hidden', ''); // remove hidden class so it shows by default
authHtml = authHtml.replace(/<button onclick="closeAuthScreen\(\)".*?<\/button>/, ''); // remove close button

// 3. Extract JS
// We need switchAuthTab, playLoginVideo, doLogin, doRegister, closeAuthScreen
const jsMatch = indexHtml.match(/\/\/ \={3} AUTH & USER LOGIC \={3}[\s\S]*?\/\/ \={3} DATA LAYER \={3}/);
let authJs = jsMatch ? jsMatch[0] : '';

const loginHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login - DailyGarden</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
    body { background: #fdfbf7; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
    \${authCss}
    
    /* Override for standalone page */
    .auth-screen { position: relative; background: transparent; backdrop-filter: none; z-index: 1; align-items: center; }
    .auth-box { box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
    #loginVideoContainer { z-index: 100; }
  </style>
</head>
<body>

  \${authHtml}

  <!-- Video container -->
  <div id="loginVideoContainer" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:#000; z-index:9999; flex-direction:column; justify-content:center; align-items:center;">
    <video id="loginVideo" src="https://videos.pexels.com/video-files/5267439/5267439-hd_1920_1080_30fps.mp4" playsinline style="width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 1s ease-in-out;"></video>
    <div id="loadingText" style="position:absolute; bottom:15%; color:#fff; font-family:'Outfit',sans-serif; font-size:1.5rem; letter-spacing:3px; opacity:0; transition:opacity 1s ease-in-out; font-weight:300;">GROWING YOUR GARDEN...</div>
  </div>

  <script>
    function switchAuthTab(tab) {
      document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
      document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
      document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
      document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
    }

    function showAuthError(msg) {
      const err = document.getElementById('authError');
      err.textContent = msg;
      err.style.display = 'block';
    }

    function playLoginVideo() {
      const vc = document.getElementById('loginVideoContainer');
      const v = document.getElementById('loginVideo');
      const txt = document.getElementById('loadingText');
      
      vc.style.display = 'flex';
      
      setTimeout(() => {
        v.style.opacity = '0.6';
        txt.style.opacity = '1';
        v.play().catch(e => console.log('Autoplay prevented', e));
      }, 50);

      setTimeout(() => {
        window.location.href = '/';
      }, 3500); // Redirect to home after 3.5s
    }

    // Google OAuth Handler
    document.getElementById('googleLoginBtn').onclick = () => {
        window.location.href = '/auth/google';
    };
    document.getElementById('googleRegBtn').onclick = () => {
        window.location.href = '/auth/google';
    };

    // Manual Login
    async function doLogin() {
      const email = document.getElementById('loginEmail').value.trim();
      if (!email) return showAuthError('Please enter an email.');
      
      let users = JSON.parse(localStorage.getItem('garden_users') || '{}');
      if (!users[email]) {
        return showAuthError('Account not found. Please create one.');
      }

      const user = users[email];
      sessionStorage.setItem('garden_session', JSON.stringify(user));

      // Sync backend
      try {
        await fetch('/api/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.name })
        });
      } catch (e) {}

      playLoginVideo();
    }

    // Manual Register
    async function doRegister() {
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      if (!name || !email) return showAuthError('Name and email are required.');

      let users = JSON.parse(localStorage.getItem('garden_users') || '{}');
      if (users[email]) {
        return showAuthError('Account already exists. Please sign in.');
      }

      const newUser = {
        name, email,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + name,
        joinDate: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        city: 'India',
        plants: [], harvestLog: [], wateringHistory: []
      };

      users[email] = newUser;
      localStorage.setItem('garden_users', JSON.stringify(users));
      sessionStorage.setItem('garden_session', JSON.stringify(newUser));

      try {
        await fetch('/api/sync-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: newUser.email, name: newUser.name })
        });
      } catch (e) {}

      playLoginVideo();
    }
  </script>
</body>
</html>`;

fs.writeFileSync('login.html', loginHtmlContent, 'utf8');

// Now, update index.html to remove authScreen HTML and JS, and redirect on load if not logged in.
if (htmlMatch) {
    indexHtml = indexHtml.replace(htmlMatch[0], '');
}

// Replace window onload logic in index.html
const oldInitLogic = `      if (session) {
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
        document.getElementById('authScreen').classList.remove('hidden');
        updateNavUser();
        checkBackendSession();
      }`;

const newInitLogic = `      if (session) {
        currentUser = session;
        updateNavUser(); updateProfilePage(); init();
        checkBackendSession();
      } else if (urlParams.get('login') === 'success') {
        window.history.replaceState({}, document.title, window.location.pathname);
        updateNavUser();
        checkBackendSession();
      } else {
        // Redirect to separate login page
        window.location.href = 'login.html';
      }`;

indexHtml = indexHtml.replace(oldInitLogic, newInitLogic);

// Replace "Sign In" clicks to redirect to login.html
indexHtml = indexHtml.replace(/document\.getElementById\('authScreen'\)\.classList\.remove\('hidden'\)/g, "window.location.href = 'login.html'");

// Remove the standalone video container since it's in login.html now
const videoContainerMatch = indexHtml.match(/<div id="loginVideoContainer"[\s\S]*?<\/div>\s*<\/div>/);
if (videoContainerMatch) {
    indexHtml = indexHtml.replace(videoContainerMatch[0], '');
}

fs.writeFileSync('index.html', indexHtml, 'utf8');

console.log('Successfully separated login screen');
