const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf-8');

// Replace media query
content = content.replace(
`      @media screen and (orientation: portrait) and (max-width: 900px) {
        #orientation-warning {
          display: flex;
        }
        #game-container {
          display: none;
        }
      }`,
`      @media screen and (orientation: portrait) and (max-width: 900px) {
        #orientation-warning:not(.dismissed) {
          display: flex;
        }
      }
      .btn-continue {
        margin-top: 24px;
        padding: 12px 24px;
        background-color: #64c48a;
        color: #fff;
        border: none;
        border-radius: 8px;
        font-family: 'Nunito', sans-serif;
        font-weight: 800;
        font-size: 16px;
        cursor: pointer;
      }`
);

// Replace warning div - we need to handle the mojibake that cat returned, or use regex
content = content.replace(
  /<div id="orientation-warning">[\s\S]*?<\/div>\s*<\/div>/,
`<div id="orientation-warning">
      <div class="rotate-phone-icon">📱 ➡️</div>
      <div class="rotate-title">Gợi ý xoay ngang</div>
      <div class="rotate-subtitle">Chơi ở màn hình ngang (Landscape) sẽ cho trải nghiệm tốt nhất!</div>
      <button class="btn-continue" onclick="document.getElementById('orientation-warning').classList.add('dismissed')">Tiếp tục chơi dọc</button>
    </div>`
);

fs.writeFileSync('index.html', content, 'utf-8');
console.log('Fixed HTML');
