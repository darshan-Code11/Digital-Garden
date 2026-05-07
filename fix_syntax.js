const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\/\/ Default stage since we removed the picker\s*let selectedStage = '🌱 Vegetative';/, "// Default stage since we removed the picker\n    selectedStage = '🌱 Vegetative';");
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed let selectedStage');
