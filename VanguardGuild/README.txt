Guild Vanguard WebGL website template

Copy these items into the root of your Unity WebGL export:
- index.html
- TemplateData/guild-vanguard.css
- TemplateData/images/

Keep your generated folders beside index.html:
- Build/
- StreamingAssets/
- TemplateData/favicon.ico

The loader expects these exact files:
Build/Vanguard.loader.js
Build/Vanguard.data
Build/Vanguard.framework.js
Build/Vanguard.wasm

If Unity generated different filenames, update the four paths near the bottom of index.html.
