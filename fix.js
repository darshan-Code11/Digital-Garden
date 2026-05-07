const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Change HTML structure for the payment page
html = html.replace(
  /<div class="pay-modal-overlay" id="payModalOverlay"[^>]*>\s*<div class="pay-modal" id="payModal">/s,
  '<!-- PAYMENT PAGE -->\n  <div class="page" id="page-checkout">\n    <div style="padding: 4rem 1.5rem; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh;">\n      <div class="pay-modal" id="payModal" style="transform:none; box-shadow:0 16px 40px rgba(0,0,0,0.15); max-height:none; overflow:visible; margin:0; width:100%;">'
);

// 2. Add extra closing div for the new wrapper before NAVBAR
html = html.replace(
  /    <\/div>\s*<\/div>\s*<!-- NAVBAR -->/s,
  '      </div>\n    </div>\n  </div>\n\n  <!-- NAVBAR -->'
);

// 3. Update Javascript: openPayModal
html = html.replace(
  /document\.getElementById\('payModalOverlay'\)\.classList\.add\('open'\);\s*document\.body\.style\.overflow = 'hidden';/g,
  "showPage('checkout');\n      window.scrollTo(0,0);"
);

// 4. Update Javascript: closePayModal
const oldClosePayModalRegex = /document\.getElementById\('payModalOverlay'\)\.classList\.remove\('open'\);\s*document\.body\.style\.overflow = '';/g;
html = html.replace(oldClosePayModalRegex, "showPage('home');");

// 5. Update array of modal overlays
html = html.replace(
  /\['modalOverlay',\s*'payModalOverlay',\s*'prodModalOverlay',\s*'detailOverlay',\s*'guideModalOverlay'\]/g,
  "['modalOverlay', 'prodModalOverlay', 'detailOverlay', 'guideModalOverlay']"
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with regex');
