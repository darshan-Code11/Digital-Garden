const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.indexOf('<script>') + 8;
const scriptEnd = html.lastIndexOf('</script>');
const script = html.slice(scriptStart, scriptEnd);

// 1. Syntax Check
console.log('--- JS Syntax Check ---');
try {
    new Function(script);
    console.log('✅ Syntax is valid.');
} catch (e) {
    console.log('❌ Syntax Error:', e.message);

    // Try to find the line
    const lines = script.split('\n');
    let errLine = -1;
    const match = e.stack.match(/<anonymous>:(\d+):(\d+)/);
    if (match) {
        errLine = parseInt(match[1]) - 1; // 0-indexed
        console.log(`Error near line ${errLine + 1} of script:`);
        for (let i = Math.max(0, errLine - 2); i <= Math.min(lines.length - 1, errLine + 2); i++) {
            console.log(`${i === errLine ? '>>' : '  '} ${i + 1}: ${lines[i]}`);
        }
    }
}

// 2. Check for getElementById IDs vs actual HTML IDs
console.log('\n--- DOM ID Check ---');
const idUsedRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const usedIds = new Set();
while ((match = idUsedRegex.exec(script)) !== null) {
    usedIds.add(match[1]);
}

const htmlIdsRegex = /id=['"]([^'"]+)['"]/g;
const htmlSection = html.slice(0, scriptStart); // Before the script tag mostly
const existingIds = new Set();
let htmlMatch;
while ((htmlMatch = htmlIdsRegex.exec(htmlSection)) !== null) {
    existingIds.add(htmlMatch[1]);
}

const missingIds = [];
usedIds.forEach(id => {
    if (!existingIds.has(id)) {
        missingIds.push(id);
    }
});

if (missingIds.length > 0) {
    console.log('⚠️ Warning: The following IDs are accessed by getElementById but do not exist in HTML:');
    console.log(missingIds.join('\n'));
} else {
    console.log('✅ All requested IDs exist in HTML.');
}

// 3. Find missing basic tags or malformed HTML
console.log('\n--- Basic HTML Sanity ---');
console.log('html closes:', html.lastIndexOf('</html>') > 0);
console.log('body closes:', html.lastIndexOf('</body>') > 0);

// 4. Duplicate ID check
const idArr = [];
const idCount = {};
let htmlMatch2;
const htmlIdsRegex2 = /id=['"]([^'"]+)['"]/g;
while ((htmlMatch2 = htmlIdsRegex2.exec(htmlSection)) !== null) {
    const id = htmlMatch2[1];
    idCount[id] = (idCount[id] || 0) + 1;
}

const duplicateIds = Object.keys(idCount).filter(k => idCount[k] > 1);
if (duplicateIds.length > 0) {
    console.log('❌ Duplicate HTML IDs found:', duplicateIds);
} else {
    console.log('✅ No duplicate IDs.');
}

