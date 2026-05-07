const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const startTag = '<!-- PAYMENT PAGE -->';
const navTag = '<!-- NAVBAR -->';
const endNavTag = '</nav>';

const startIdx = html.indexOf(startTag);
const navIdx = html.indexOf(navTag);

if (startIdx !== -1 && navIdx !== -1 && startIdx < navIdx) {
  // Extract the page-checkout block
  const checkoutBlock = html.substring(startIdx, navIdx);
  
  // Remove the checkout block from its original position
  html = html.substring(0, startIdx) + html.substring(navIdx);
  
  // Find where </nav> is now
  const newEndNavIdx = html.indexOf(endNavTag) + endNavTag.length;
  
  // Insert the checkout block after </nav>
  html = html.substring(0, newEndNavIdx) + '\n\n  ' + checkoutBlock.trim() + '\n\n  ' + html.substring(newEndNavIdx);
  
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Moved page-checkout below navbar!');
} else {
  console.log('Could not find markers', startIdx, navIdx);
}
