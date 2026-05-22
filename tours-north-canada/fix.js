const fs = require('fs');
let data = fs.readFileSync('index.html', 'utf8');
let lines = data.split('\n');
lines[643] = '                            <span class="text-3xl text-white">🛂</span>\r';
data = lines.join('\n');
fs.writeFileSync('index.html', data, 'utf8');
