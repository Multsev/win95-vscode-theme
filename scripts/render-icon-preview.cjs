const fs=require('node:fs'),path=require('node:path');
const sharp=require('sharp');
const root=path.resolve(__dirname,'..');
const files=fs.readdirSync(path.join(root,'icons/images')).filter(f=>f.endsWith('.svg'));
const sections=[['Panel','#C0C0C0','#000'],['Editor','#FFFFFF','#000'],['Selected','#000080','#fff']];
let content='';
sections.forEach(([label,background,ink],section)=>{
 const y=section*190;content+=`<rect x="0" y="${y}" width="820" height="190" fill="${background}"/><text x="12" y="${y+22}" font-family="sans-serif" font-size="14" fill="${ink}">${label}: 16 px / 32 px</text>`;
 files.forEach((file,i)=>{
  const x=12+(i%10)*80,top=y+38+Math.floor(i/10)*72;
  const svg=fs.readFileSync(path.join(root,'icons/images',file),'utf8').replace(/^<svg[^>]*>/,'').replace(/<\/svg>\s*$/,'');
  content+=`<g transform="translate(${x},${top})">${svg}</g><g transform="translate(${x+25},${top}) scale(2)">${svg}</g><text x="${x}" y="${top+50}" fill="${ink}" font-family="sans-serif" font-size="10">${file.replace('.svg','')}</text>`;
 });
});
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="820" height="570" viewBox="0 0 820 570">${content}</svg>`;
fs.writeFileSync(path.join(root,'artifacts/icon-preview.svg'),svg);
sharp(Buffer.from(svg)).png().toFile(path.join(root,'artifacts/icon-preview.png')).then(()=>console.log('Icon sheet rendered on gray, white and blue backgrounds.'));
