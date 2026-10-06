
import re
with open('src/scenes/GameScene.js', 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(r'import\(\'../ui/SyncUI\'\)\.then\(\(\{ syncUI \}\) => \{\s*syncUI\.show\(\);\s*\}\);',
           'import(\'../ui/SyncUI\').then(({ syncUI }) => {\\n            syncUI.show();\\n            syncUI.setOnCloudSaveLoaded(() => {\\n                window.location.reload();\\n            });\\n        });', c)

with open('src/scenes/GameScene.js', 'w', encoding='utf-8') as f:
    f.write(c)

