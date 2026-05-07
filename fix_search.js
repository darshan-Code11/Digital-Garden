const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const newSearchFn = `    function globalSearch(q) {
      if (!currentUser) return;
      const ud = getUserData(currentUser.email);
      
      if (q && document.querySelector('.page.active').id !== 'page-plants') {
        showPage('plants');
      }

      if (!q) {
        renderPlantGrid('plantsPageGrid', ud.plants);
        const countEl = document.getElementById('plantsPageCount');
        if (countEl) countEl.textContent = '(' + ud.plants.length + ')';
        if (document.querySelector('.page.active').id !== 'page-plants') {
            return;
        }
        return;
      }

      const lower = q.toLowerCase();
      const filtered = ud.plants.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.variety.toLowerCase().includes(lower)
      );
      
      renderPlantGrid('plantsPageGrid', filtered);
      const countEl = document.getElementById('plantsPageCount');
      if (countEl) countEl.textContent = '(' + filtered.length + ' found)';
    }`;

// use regex to replace the function entirely
html = html.replace(/function globalSearch\(q\)\s*\{[\s\S]*?\}\s*(?=\/\/ ==================== DISEASE DETECTOR)/, newSearchFn + '\n\n    ');

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated globalSearch');
