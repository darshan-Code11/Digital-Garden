const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/function addPlant\(\) \{/g, "async function addPlant() {");
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed async function addPlant');
