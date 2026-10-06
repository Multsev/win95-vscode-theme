const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const manifest=JSON.parse(fs.readFileSync('package.json','utf8'));
const theme=JSON.parse(fs.readFileSync('themes/windows95.json','utf8'));
function luminance(hex){
 const c=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
 return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
test('extension is a declarative theme without executable code or startup hooks',()=>{
 assert.equal(manifest.main,undefined);
 assert.equal(manifest.activationEvents,undefined);
 assert.equal(manifest.contributes.commands,undefined);
 assert.equal(manifest.dependencies,undefined);
 assert.equal(manifest.contributes.themes.length,1);
 assert.ok(fs.existsSync(manifest.contributes.themes[0].path));
});
test('ordinary text, selected menu entries and syntax have readable contrast',()=>{
 for(const pair of [['editor.foreground','editor.background'],['menu.foreground','menu.background'],['menu.selectionForeground','menu.selectionBackground'],['titleBar.activeForeground','titleBar.activeBackground']]){
  assert.ok(contrast(theme.colors[pair[0]],theme.colors[pair[1]])>=4.5,pair.join(' / '));
 }
 for(const token of theme.tokenColors){const color=token.settings.foreground;if(color)assert.ok(contrast(color,theme.colors['editor.background'])>=4.5,token.scope.join(', '));}
});
test('preset contains only supported font and layout settings without custom stylesheet paths',()=>{
 const preset=JSON.parse(fs.readFileSync('presets/settings.json','utf8'));
 const allowed=new Set(['editor.fontFamily','editor.fontSize','editor.lineHeight','editor.fontLigatures','terminal.integrated.fontFamily','terminal.integrated.fontSize','window.titleBarStyle','window.density.editorTabHeight','markdown.preview.fontFamily','markdown.preview.fontSize']);
 for(const key of Object.keys(preset))assert.ok(allowed.has(key),key);
});
test('classic and modern tabs define readable active, hover and inactive states explicitly',()=>{
 const pairs=[
  ['tab.activeForeground','tab.activeBackground'],
  ['tab.inactiveForeground','tab.inactiveBackground'],
  ['tab.unfocusedActiveForeground','tab.unfocusedActiveBackground'],
  ['tab.unfocusedInactiveForeground','tab.inactiveBackground'],
  ['tab.hoverForeground','tab.hoverBackground'],
  ['tab.unfocusedHoverForeground','tab.unfocusedHoverBackground'],
  ['modernTab.activeForeground','modernTab.activeBackground'],
  ['modernTab.hoverForeground','modernTab.hoverBackground'],
  ['modernEditorTab.activeForeground','modernEditorTab.activeBackground'],
  ['modernEditorTab.activeForeground','modernEditorTab.activeActionBackground'],
  ['tab.inactiveForeground','modernEditorTab.inactiveBackground'],
  ['modernEditorTab.hoverForeground','modernEditorTab.hoverBackground'],
  ['modernEditorTab.hoverForeground','modernEditorTab.hoverActionBackground'],
  ['modernEditorTab.activeForeground','modernEditorTab.activeHoverBackground'],
  ['modernEditorTab.activeForeground','modernEditorTab.activeHoverActionBackground'],
  ['modernEditorTab.activeForeground','modernEditorTab.selectedActionBackground'],
  ['modernActivityBarItem.activeForeground','modernActivityBarItem.activeBackground'],
  ['modernActivityBarItem.hoverForeground','modernActivityBarItem.hoverBackground'],
  ['surface.foreground','surface.background'],
  ['quickInputList.focusIconForeground','quickInputList.focusBackground'],
  ['input.placeholderForeground','input.background'],
  ['inputOption.activeForeground','inputOption.activeBackground'],
  ['editorActionList.focusForeground','editorActionList.focusBackground'],
  ['list.activeSelectionIconForeground','list.activeSelectionBackground'],
  ['list.inactiveSelectionIconForeground','list.inactiveSelectionBackground'],
  ['list.focusHighlightForeground','list.focusBackground'],
  ['editorSuggestWidget.focusHighlightForeground','editorSuggestWidget.selectedBackground']
 ];
 for(const [fg,bg]of pairs){
  assert.ok(theme.colors[fg]&&theme.colors[bg],`explicit color missing: ${fg} / ${bg}`);
  assert.ok(contrast(theme.colors[fg],theme.colors[bg])>=4.5,`${fg} / ${bg}`);
 }
});
test('all ANSI text remains readable on the white terminal background',()=>{
 for(const [key,color]of Object.entries(theme.colors).filter(([k])=>k.startsWith('terminal.ansi'))){
  assert.ok(contrast(color,theme.colors['terminal.background'])>=4.5,key);
 }
});
test('every explicit opaque foreground/background pair meets normal-text contrast',()=>{
 for(const [key,color]of Object.entries(theme.colors)){
  if(!key.endsWith('.foreground'))continue;
  const background=theme.colors[key.replace(/\.foreground$/,'.background')];
  if(background&&/^#[0-9A-Fa-f]{6}$/.test(color)&&/^#[0-9A-Fa-f]{6}$/.test(background))assert.ok(contrast(color,background)>=4.5,key);
 }
 assert.ok(contrast(theme.colors['disabledForeground'],theme.colors['button.background'])>=4.5);
 assert.ok(contrast(theme.colors['editorLineNumber.foreground'],theme.colors['editor.background'])>=4.5);
});
test('search, terminal selections, validation and status states preserve text contrast',()=>{
 const pairs=[['editor.selectionForeground','editor.selectionBackground'],['editor.findMatchForeground','editor.findMatchBackground'],['terminal.selectionForeground','terminal.selectionBackground'],['diffEditor.unchangedRegionForeground','diffEditor.unchangedRegionBackground'],['inputValidation.errorForeground','inputValidation.errorBackground'],['inputValidation.warningForeground','inputValidation.warningBackground'],['inputValidation.infoForeground','inputValidation.infoBackground'],['editorSuggestWidget.selectedIconForeground','editorSuggestWidget.selectedBackground'],['statusBarItem.errorForeground','statusBarItem.errorBackground'],['statusBarItem.warningForeground','statusBarItem.warningBackground'],['statusBarItem.remoteForeground','statusBarItem.remoteBackground']];
 for(const [fg,bg]of pairs)assert.ok(contrast(theme.colors[fg],theme.colors[bg])>=4.5,`${fg} / ${bg}`);
 const composite=(overlay,base)=>{
  const alpha=parseInt(overlay.slice(7,9),16)/255;
  return '#'+[1,3,5].map(i=>Math.round(parseInt(overlay.slice(i,i+2),16)*alpha+parseInt(base.slice(i,i+2),16)*(1-alpha)).toString(16).padStart(2,'0')).join('');
 };
 // Real overlapping decorations: line diff, stronger text diff, then a search highlight.
 for(const kind of ['inserted','removed']){
  let background=theme.colors['editor.background'];
  background=composite(theme.colors[`diffEditor.${kind}LineBackground`],background);
  background=composite(theme.colors[`diffEditor.${kind}TextBackground`],background);
  background=composite(theme.colors['editor.findMatchHighlightBackground'],background);
  assert.ok(contrast(theme.colors['editor.findMatchHighlightForeground'],background)>=4.5,`${kind} diff + search`);
  assert.ok(contrast(theme.colors['editor.foreground'],background)>=4.5,`${kind} diff text`);
 }
});

test('workbench text selection preserves contrast of inherited headings and links',()=>{
 for(const key of ['foreground','descriptionForeground','textLink.foreground','textLink.activeForeground']){
  const color=theme.colors[key];
  if(color)assert.ok(contrast(color,theme.colors['selection.background'])>=4.5,`${key} on workbench selection`);
 }
 assert.ok(contrast('#000000',theme.colors['selection.background'])>=4.5,'Black extension headings must remain readable');
});
