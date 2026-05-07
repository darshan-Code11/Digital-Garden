const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = `      saveUserDB();
      renderHomePlants(ud);
      if (document.getElementById('page-plants').classList.contains('active')) renderPlantsPage();`;

const replacement = `      saveUserDB();
      renderHomePlants(ud);
      renderTaskList(ud);
      updateStats(ud);
      if (document.getElementById('page-plants').classList.contains('active')) renderPlantsPage();`;

html = html.replace(target, replacement);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Restored addPlant sync');
