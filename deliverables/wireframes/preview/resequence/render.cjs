const fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/ICT-018/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=__dirname,changed=process.env.RENDER_PAGE?[Number(process.env.RENDER_PAGE)]:JSON.parse(fs.readFileSync(path.join(root,'changed.json'),'utf8'));
(async()=>{
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1250},deviceScaleFactor:1});let qa=process.env.RENDER_PAGE?JSON.parse(fs.readFileSync(path.join(root,'render-qa.json'),'utf8')):{};
for(const n of changed){qa[n]={};for(const mode of ['before','after']){
const f=path.join(root,mode,`WF-${String(n).padStart(3,'0')}`),svg=fs.readFileSync(f+'.svg','utf8');
await page.setContent(`<html><meta charset="utf-8"><style>body{margin:0}svg{font-family:'Malgun Gothic',sans-serif}</style>${svg}</html>`);
await page.screenshot({path:f+'.png'});
qa[n][mode]=await page.evaluate(()=>{const all=[...document.querySelector('svg').children];let groups=[],g=null;for(const el of all){if(el.tagName==='path'){g={nodes:[],texts:[]};groups.push(g)}else if(el.tagName==='line'){g=null}if(g){const b=el.getBBox();g.nodes.push({x:b.x,y:b.y,width:b.width,height:b.height,tag:el.tagName});if(el.tagName==='text')g.texts.push({value:el.textContent,x:b.x,y:b.y,width:b.width,height:b.height,size:el.getAttribute('font-size')});}}return groups;});
}if(n%10===0)console.log('Rendered',n);}
fs.writeFileSync(path.join(root,'render-qa.json'),JSON.stringify(qa));await browser.close();console.log(`Rendered ${changed.length} changed pages and baselines`);
})();
