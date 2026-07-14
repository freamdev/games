# Guild Vanguard WebGL page

1. Copy the supplied `index.html` into the root of your Unity WebGL export.
2. Copy `TemplateData/guild-vanguard.css` and
   `TemplateData/guild-vanguard-background.png` into the export's TemplateData folder.
3. Keep your existing `Build`, `StreamingAssets`, favicon, and Unity files.
4. The page expects these build files:
   - Build/Vanguard.loader.js
   - Build/Vanguard.data
   - Build/Vanguard.framework.js
   - Build/Vanguard.wasm

If your generated build uses another filename, change the four `Vanguard...` references
inside `index.html`.

The Google Fonts import requires internet access. To make the page fully offline,
remove the first line of the CSS or replace the fonts with locally hosted web fonts.
