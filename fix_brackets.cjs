const fs = require('fs');

let gameContent = fs.readFileSync('src/scenes/GameScene.js', 'utf-8');

gameContent = gameContent.replace(
`    if (this.achievementSystem) {
      this.achievementSystem.checkAchievements(this.stats);
    }
  }
    }
  }`,
`    if (this.achievementSystem) {
      this.achievementSystem.checkAchievements(this.stats);
    }
  }`
);

// We should also verify if there is an extra `}` for createHUD.
// original createHUD regex: /createHUD\(\) \{[\s\S]*?this\.layerUI\.add\(\[.*?\]\);\s*\}/
// replacement had `}` at the end.
// Original code had `  }` at the end.
// So there might be an extra `}` after createHUD!
gameContent = gameContent.replace(
`    this.layerUI.add([this.moneyText, this.dayText, this.timeText, this.repText]);
  }
  }

  createBottomUI() {`,
`    this.layerUI.add([this.moneyText, this.dayText, this.timeText, this.repText]);
  }

  createBottomUI() {`
);

fs.writeFileSync('src/scenes/GameScene.js', gameContent, 'utf-8');
console.log('Fixed extra brackets');

