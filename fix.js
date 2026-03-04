const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
const scriptStart = c.indexOf('<script>') + 8;
const scriptEnd = c.lastIndexOf('</script>');
let script = c.slice(scriptStart, scriptEnd);

// Fix updateNavUser — show "Sign In" when no user, user name when logged in
const unStart = script.indexOf('function updateNavUser(){');
const unEnd = script.indexOf('\nfunction ', unStart + 10);
const oldFn = script.slice(unStart, unEnd);
console.log('Replacing updateNavUser...');

const newFn = `function updateNavUser(){
  const nameEl   = document.getElementById('navUserName');
  const avatarEl = document.getElementById('navUserAvatar');
  if(!currentUser){
    if(nameEl)   nameEl.textContent = 'Sign In';
    if(avatarEl) avatarEl.textContent = '?';
    return;
  }
  const initials = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'G';
  if(avatarEl) avatarEl.textContent = initials;
  if(nameEl)   nameEl.textContent   = currentUser.name?.split(' ')[0] || 'Gardener';
}`;

script = script.slice(0, unStart) + newFn + script.slice(unEnd);

// Also call updateNavUser() on page load (even without a session, so "Sign In" shows)
const domMarker = "window.addEventListener('DOMContentLoaded'";
const domIdx = script.indexOf(domMarker);
if (domIdx !== -1) {
    // Find '}); at the end and insert updateNavUser() call before it
    // Add an extra call after DOMContentLoaded loads
    script = script.replace(
        "document.getElementById('authScreen').classList.add('hidden');\n  }",
        "document.getElementById('authScreen').classList.add('hidden');\n    updateNavUser();\n  }"
    );
    // Also call it in the else branch
    script = script.replace(
        "document.getElementById('authScreen').classList.add('hidden');\n  } else {\n    document.getElementById('authScreen').classList.add('hidden');\n  }",
        "document.getElementById('authScreen').classList.add('hidden');\n    updateNavUser();\n  } else {\n    document.getElementById('authScreen').classList.add('hidden');\n    updateNavUser(); // show 'Sign In'\n  }"
    );
    console.log('✓ updateNavUser called on page load (both logged in and out)');
}

const output = c.slice(0, scriptStart) + script + c.slice(scriptEnd);

// Verify brace balance
let depth = 0;
for (const ch of script) { if (ch === '{') depth++; if (ch === '}') depth--; }
console.log('JS brace balance:', depth, depth === 0 ? '✅' : '⚠️');

fs.writeFileSync('index.html', output, 'utf8');
console.log('✅ Saved! Size:', output.length);
