const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const target = `    const now = new Date();
    const currentTimeString = \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`;`;

const replacement = `    const now = new Date();
    // Force the time to Indian Standard Time (IST) regardless of where the server is hosted
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const currentTimeString = \`\${istTime.getHours().toString().padStart(2, '0')}:\${istTime.getMinutes().toString().padStart(2, '0')}\`;`;

code = code.replace(target, replacement);

fs.writeFileSync('server.js', code, 'utf8');
console.log('Successfully updated cron job timezone to IST');
