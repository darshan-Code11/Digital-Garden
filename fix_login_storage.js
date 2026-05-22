const fs = require('fs');
let code = fs.readFileSync('login.html', 'utf8');

// Change sessionStorage to localStorage
code = code.replace(/sessionStorage\.setItem\('gardenlog_session'/g, "localStorage.setItem('gardenlog_session'");

fs.writeFileSync('login.html', code, 'utf8');
console.log('Fixed login.html to use localStorage for sessions');
