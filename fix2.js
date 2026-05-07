const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove the max-width restriction on the page wrapper
html = html.replace(
  /<div class="page" id="page-checkout" style="background: var\(--bg\);">\s*<div style="max-width: 680px; margin: 0 auto; min-height: 100vh; background: var\(--panel\);">/s,
  '<div class="page" id="page-checkout" style="background: var(--panel); min-height: 100vh;">\n    <div>'
);

// 2. Add centering wrapper inside pay-modal-top
html = html.replace(
  /<div class="pay-modal-top" id="payModalTop" style="border-radius:0; padding-top:4rem;">/s,
  '<div class="pay-modal-top" id="payModalTop" style="border-radius:0; padding-top:4rem;">\n          <div style="max-width: 680px; margin: 0 auto;">'
);

// 3. Close the centering wrapper at the end of pay-modal-top, and add centering wrapper to pay-modal-body
html = html.replace(
  /<div id="paySavings" class="pay-savings" style="display:none">🎉 Save ₹989 vs monthly billing!<\/div>\s*<\/div>\s*<div class="pay-modal-body" id="payModalBody">/s,
  '<div id="paySavings" class="pay-savings" style="display:none">🎉 Save ₹989 vs monthly billing!</div>\n          </div>\n        </div>\n        <div class="pay-modal-body" id="payModalBody" style="max-width: 680px; margin: 0 auto; padding-bottom: 4rem;">'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated full screen layout');
