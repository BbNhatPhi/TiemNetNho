const fs = require('fs');

let code = fs.readFileSync('src/systems/InteractionSystem.js', 'utf8');

code = code.replace(/\[E\] T.*C/, '[E] TƯƠNG TÁC');

fs.writeFileSync('src/systems/InteractionSystem.js', code);
