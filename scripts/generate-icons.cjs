/* Original 16px pixel-style artwork, not copied Windows assets. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'icons/images');fs.mkdirSync(out,{recursive:true});
const glyphs={J:['111','001','001','101','111'],T:['111','010','010','010','010'],P:['110','101','110','100','100'],Y:['101','101','010','010','010'],M:['101','111','111','101','101'],C:['111','100','100','100','111'],S:['111','100','111','001','111'],G:['111','100','101','101','111'],D:['110','101','101','101','110']};
function glyph(letter,color,x=6,y=8){return glyphs[letter].flatMap((row,dy)=>[...row].map((bit,dx)=>bit==='1'?`<rect x="${x+dx}" y="${y+dy}" width="1" height="1" fill="${color}"/>`:'')).join('');}
function svg(content){return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" shape-rendering="crispEdges">${content}</svg>\n`;}
const paper='<path d="M3 1H10L13 4V15H3Z" fill="#fff" stroke="#000"/><path d="M10 1V4H13" fill="#c0c0c0" stroke="#000"/><path d="M4 2H9M4 14H12" stroke="#fff"/>';
const line='<path d="M5 6H11M5 8H11M5 10H11M5 12H9" stroke="#666"/>';
const icons={
 file:paper+line,
 text:paper+line,
 markdown:paper+glyph('M','#000080'),
 javascript:paper+glyph('J','#795400'),
 typescript:paper+glyph('T','#000080'),
 python:paper+glyph('P','#006666'),
 yaml:paper+glyph('Y','#800080'),
 json:paper+'<path d="M6 7H5V9H4V10H5V12H6M10 7H11V9H12V10H11V12H10" fill="none" stroke="#006000"/>',
 code:paper+'<path d="M6 7L4 9L6 11M10 7L12 9L10 11M9 6L7 12" fill="none" stroke="#000080"/>',
 shell:paper+'<path d="M4 7H12V13H4Z" fill="#000080"/><path d="M5 8L7 9L5 10M8 11H10" fill="none" stroke="#fff"/>',
 config:paper+'<path d="M5 7H11M5 10H11M5 13H11" stroke="#666"/><path d="M7 6V8M9 9V11M6 12V14" stroke="#000080" stroke-width="2"/>',
 git:paper+glyph('G','#800000'),
 pdf:paper+glyph('D','#800000'),
 stylesheet:paper+glyph('S','#800080'),
 image:paper+'<path d="M4 6H12V13H4Z" fill="#c0ffff" stroke="#000"/><path d="M4 12L7 8L10 12L12 10V13H4" fill="#008000"/><rect x="10" y="7" width="1" height="1" fill="#795400"/>',
 archive:paper+'<path d="M7 5H9V14H7Z" fill="#c0c0c0"/><path d="M7 5H8M8 6H9M7 7H8M8 8H9M7 9H8M8 10H9M7 11H9" stroke="#000"/>',
 folder:'<path d="M1 4V14H15V6H7L5 3H1Z" fill="#c0c0c0" stroke="#000"/><path d="M1 6H15V14H1Z" fill="#ffff80" stroke="#000"/><path d="M2 7H14M2 7V13" stroke="#fff"/><path d="M14 8V13H3" fill="none" stroke="#808000"/>',
 'folder-open':'<path d="M1 3H5L7 5H13V13H1Z" fill="#c0c0c0" stroke="#000"/><path d="M3 7H15L13 14H1Z" fill="#ffff80" stroke="#000"/><path d="M4 8H14M4 8L2 13" stroke="#fff"/>',
 workspace:'<path d="M1 2H15V12H1Z" fill="#c0c0c0" stroke="#000"/><path d="M3 4H13V10H3Z" fill="#000080" stroke="#fff"/><path d="M5 13H11V15H5Z" fill="#c0c0c0" stroke="#000"/>',
 'workspace-open':'<path d="M1 2H15V12H1Z" fill="#c0c0c0" stroke="#000"/><path d="M3 4H13V10H3Z" fill="#000080" stroke="#fff"/><path d="M4 7H12L11 10H3Z" fill="#ffff80"/><path d="M5 13H11V15H5Z" fill="#c0c0c0" stroke="#000"/>'
};
for(const [name,content]of Object.entries(icons))fs.writeFileSync(path.join(out,name+'.svg'),svg(content));
const fileExtensions={md:'markdown',markdown:'markdown',mdx:'markdown',txt:'text',js:'javascript',mjs:'javascript',cjs:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',py:'python',pyw:'python',yaml:'yaml',yml:'yaml',json:'json',jsonc:'json',jsonl:'json',html:'code',htm:'code',xml:'code',css:'stylesheet',scss:'stylesheet',sass:'stylesheet',less:'stylesheet',sh:'shell',bash:'shell',zsh:'shell',ps1:'shell',bat:'shell',cmd:'shell',ini:'config',toml:'config',cfg:'config',properties:'config',png:'image',jpg:'image',jpeg:'image',gif:'image',webp:'image',svg:'image',ico:'image',pdf:'pdf',zip:'archive',gz:'archive','tar.gz':'archive',tar:'archive','7z':'archive',rar:'archive',kt:'code',java:'code',c:'code',h:'code',cpp:'code',rs:'code',go:'code',sql:'code'};
const definition={iconDefinitions:Object.fromEntries(Object.keys(icons).map(name=>[name,{iconPath:`./images/${name}.svg`}])),file:'file',folder:'folder',folderExpanded:'folder-open',rootFolder:'workspace',rootFolderExpanded:'workspace-open',hidesExplorerArrows:false,fileExtensions,fileNames:{'.gitignore':'git','.gitattributes':'git','.gitmodules':'git','.env':'config','Dockerfile':'config','Makefile':'config','package.json':'json','package-lock.json':'json','tsconfig.json':'json'},languageIds:{markdown:'markdown',javascript:'javascript',javascriptreact:'javascript',typescript:'typescript',typescriptreact:'typescript',python:'python',yaml:'yaml',json:'json',jsonc:'json',shellscript:'shell',powershell:'shell',css:'stylesheet',html:'code',xml:'code',plaintext:'text'}};
fs.writeFileSync(path.join(root,'icons/windows95-icon-theme.json'),JSON.stringify(definition,null,2)+'\n');
console.log(`${Object.keys(icons).length} original SVG icons generated.`);
