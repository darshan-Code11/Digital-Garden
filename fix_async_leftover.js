const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The file likely has:
// async 
//         const plantDatabase = [

html = html.replace(/async\s+const plantDatabase/g, 'const plantDatabase');
html = html.replace(/async\s+\/\/\s*MEDICINAL/g, '// MEDICINAL');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed async leftover');
