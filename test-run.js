const fs = require('fs');

const script = fs.readFileSync('./script.js', 'utf8');
console.log("Script length:", script.length);
