const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const tm=require('vscode-textmate'),onig=require('vscode-oniguruma');
const app=process.env.VSCODE_APP||'/Applications/Visual Studio Code.app/Contents/Resources/app';
const extensionRoot=path.join(app,'extensions');
const theme=JSON.parse(fs.readFileSync('themes/windows95.json'));
const mappings=new Map(),languageScopes=new Map();
if(fs.existsSync(extensionRoot))for(const entry of fs.readdirSync(extensionRoot)){
 const manifestPath=path.join(extensionRoot,entry,'package.json');if(!fs.existsSync(manifestPath))continue;
 const manifest=JSON.parse(fs.readFileSync(manifestPath));
 for(const grammar of manifest.contributes?.grammars||[]){mappings.set(grammar.scopeName,path.join(extensionRoot,entry,grammar.path));if(grammar.language)languageScopes.set(grammar.language,grammar.scopeName);}
}
let registry;
async function setup(){
 if(registry)return registry;
 const buffer=fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));
 await onig.loadWASM(buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength));
 registry=new tm.Registry({theme:{settings:[{settings:{foreground:theme.colors['editor.foreground'],background:theme.colors['editor.background']}},...theme.tokenColors]},onigLib:Promise.resolve({createOnigScanner:patterns=>new onig.OnigScanner(patterns),createOnigString:text=>new onig.OnigString(text)}),loadGrammar:async scope=>{const file=mappings.get(scope);return file?tm.parseRawGrammar(fs.readFileSync(file,'utf8'),file):null;}});
 return registry;
}
const cases=[['javascript','const tasks = [];','const','#000080'],['typescript','interface Task { name: string; }','interface','#000080'],['python','class Task:','class','#000080'],['json','{"name": "Windows 95"}','name','#000080'],['yaml','active: true','true','#800000'],['markdown','# Заметки проекта','Заметки','#000080']];
for(const [language,line,word,expected]of cases)test(`installed ${language} grammar resolves representative syntax to the intended palette`,{skip:!fs.existsSync(extensionRoot)},async()=>{
 const registry=await setup();const grammar=await registry.loadGrammar(languageScopes.get(language));assert.ok(grammar,language);
 const tokens=grammar.tokenizeLine2(line,null).tokens;const at=line.indexOf(word);let color;
 for(let i=0;i<tokens.length;i+=2)if(tokens[i]<=at&&(i+2>=tokens.length||tokens[i+2]>at))color=registry.getColorMap()[(tokens[i+1]>>>15)&0x1ff];
 assert.equal(color,expected,`${language}: ${word}`);
});
test('copied working Markdown tokenizes with readable colors without changing its contents',{skip:!fs.existsSync('.runtime/review.md')||!fs.existsSync(extensionRoot)},async()=>{
 const registry=await setup(),grammar=await registry.loadGrammar(languageScopes.get('markdown'));
 const input=fs.readFileSync('.runtime/review.md','utf8'),colors=registry.getColorMap();
 let state=null,count=0;
 const luminance=hex=>hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4).reduce((sum,x,i)=>sum+x*[0.2126,0.7152,0.0722][i],0);
 for(const line of input.split(/\r?\n/)){
  const result=grammar.tokenizeLine2(line,state);state=result.ruleStack;
  for(let i=1;i<result.tokens.length;i+=2){const color=colors[(result.tokens[i]>>>15)&0x1ff];assert.ok(1.05/(luminance(color)+0.05)>=4.5,'Unreadable Markdown token');count++;}
 }
 assert.ok(count>0);assert.equal(fs.readFileSync('.runtime/review.md','utf8'),input);
});
