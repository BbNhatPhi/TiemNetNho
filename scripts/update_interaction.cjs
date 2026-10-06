const fs = require('fs');

let code = fs.readFileSync('src/systems/InteractionSystem.js', 'utf8');

code = code.replace(
  /const bg = this\.scene\.add\.rectangle\(0, 0, 140, 40, 0x000000, 0\.8\)\.setOrigin\(0\.5\);\n\s+bg\.setStrokeStyle\(2, 0xffffff\);/m,
  "const bg = this.scene.add.nineslice(0, 0, 'ui_panel', 0, 160, 40, 16, 16, 16, 16);"
);

code = code.replace(
  /fill: '#ffffff'/g,
  "fill: '#4a3b32'"
);

// We need to change the prompt text format
code = code.replace(
  /\[E\] T.*NG TA\?C/g,
  "[E] TƯƠNG TÁC"
);

fs.writeFileSync('src/systems/InteractionSystem.js', code);
