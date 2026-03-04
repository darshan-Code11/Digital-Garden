const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = fs.readFileSync('c:/Gradern-project/index.html', 'utf8');
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err, ...args) => {
    console.error("PAGE ERROR:", err ? (err.stack || err) : 'Unknown', args);
    process.exit(1);
});
virtualConsole.on("jsdomError", (err) => {
    console.error("JSDOM ERROR:", err.message);
});
const dom = new JSDOM(html, {
    runScripts: "dangerously",
    virtualConsole,
    url: "http://localhost/",
    beforeParse(window) {
        window.fetch = async () => ({ ok: true, json: async () => ({}) });
        window.scrollTo = () => { };
    }
});
setTimeout(() => {
    console.log('Page loaded without fatal errors.');
    process.exit(0);
}, 2000);
