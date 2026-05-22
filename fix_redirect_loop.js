const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

// Fix the returnTo logic to avoid redirecting back to login.html
const oldReturnTo = "req.session.returnTo = req.header('Referer') || '/';";
const newReturnTo = "let ref = req.header('Referer') || '/'; if (ref.includes('login.html')) ref = '/'; req.session.returnTo = ref;";

code = code.replace(oldReturnTo, newReturnTo);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Fixed Google Auth redirect loop in server.js');
