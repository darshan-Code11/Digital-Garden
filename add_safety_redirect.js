const fs = require('fs');
let html = fs.readFileSync('login.html', 'utf8');

const safetyRedirect = `  <script>
    // Safety: If we arrive here with login=success, redirect to home immediately
    if (window.location.search.includes('login=success')) {
      window.location.href = '/';
    }

    function switchAuthTab(tab) {`;

html = html.replace('  <script>\n    function switchAuthTab(tab) {', safetyRedirect);

fs.writeFileSync('login.html', html, 'utf8');
console.log('Added safety redirect to login.html');
