const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const manifest=JSON.parse(fs.readFileSync('package.json'));
const iconTheme=JSON.parse(fs.readFileSync('icons/windows95-icon-theme.json'));
test('file icon mappings resolve to self-contained 16px SVG artwork',()=>{
 assert.equal(manifest.contributes.iconThemes[0].id,'win95-classic-icons');
 const mapped=[iconTheme.file,iconTheme.folder,iconTheme.folderExpanded,iconTheme.rootFolder,iconTheme.rootFolderExpanded,...Object.values(iconTheme.fileExtensions),...Object.values(iconTheme.fileNames),...Object.values(iconTheme.languageIds)];
 for(const id of mapped)assert.ok(iconTheme.iconDefinitions[id],`missing icon: ${id}`);
 for(const definition of Object.values(iconTheme.iconDefinitions)){
  const file=path.resolve('icons',definition.iconPath);assert.ok(file.startsWith(path.resolve('icons')+path.sep));
  const svg=fs.readFileSync(file,'utf8');assert.match(svg,/viewBox="0 0 16 16"/);assert.match(svg,/shape-rendering="crispEdges"/);
  assert.doesNotMatch(svg,/<(?:script|image|foreignObject)|(?:href|url\()|<text\b/,'Icons must not load remote assets, scripts or fonts.');
 }
 assert.notEqual(iconTheme.folder,iconTheme.folderExpanded);
 assert.equal(iconTheme.hidesExplorerArrows,false);
});
