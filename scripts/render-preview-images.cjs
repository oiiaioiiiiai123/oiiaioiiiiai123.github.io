/* Development-only artwork composition. Reuses the original bitmap assets;
   no illustrated pig or app UI is generated. Requires Playwright + Chrome. */
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const scalar = (file, key) => {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  const value = text.match(new RegExp('^'+key+':\\s*(.+)$', 'm'))?.[1]?.trim();
  if (!value) throw new Error('Missing '+key+' in '+file);
  return value.replace(/^(["'])(.*)\1$/, '$2');
};
const data = file => 'data:image/'+(file.endsWith('.webp')?'webp':'png')+';base64,'+fs.readFileSync(path.join(root, file)).toString('base64');
const title=scalar('_config.yml','title'), description=scalar('_config.yml','description'), host=new URL(scalar('_config.yml','url')).hostname;
const version=scalar('_projects/eggplant.md','version'), status=scalar('_projects/eggplant.md','status'), appName=scalar('_projects/eggplant.md','title'), appDescription=scalar('_projects/eggplant.md','description');
const pig=data('assets/images/pig/pig-original.png'), icon=data('assets/images/projects/eggplant/app-icon.webp');
const home=data('assets/images/projects/eggplant/home.webp'), reader=data('assets/images/projects/eggplant/reading.webp');
const common=`*{box-sizing:border-box}html,body{margin:0;width:1200px;height:100%;background:#fbf9f3;color:#363e35;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}h1,p{margin:0}.card{position:relative;width:1200px;overflow:hidden;border:1px solid #dedfd3}.eyebrow{font-size:15px;letter-spacing:3px;color:#78836d}.host{position:absolute;bottom:43px;left:68px;font-size:16px;color:#6d7368}.flower{color:#dd9fa9;font-size:48px}.app-icon{width:112px;height:112px;border-radius:25px;border:1px solid #dedfd3}.pills{display:flex;gap:10px;margin-top:30px}.pills span{padding:9px 16px;border:1px solid #d5d0df;border-radius:24px;font-size:16px;color:#66636e}.screen{height:100%;width:auto;border:1px solid #dedfd3;border-radius:16px;box-shadow:0 10px 24px #4640360a}.app-left h1{font:76px/1.04 Georgia,serif;margin:25px 0 20px;letter-spacing:-2px}.app-left p{font-size:25px;line-height:1.5;color:#6d7368}.screens{display:flex;gap:22px;align-items:center}.real-label{position:absolute;font-size:14px;color:#6d7368;letter-spacing:1px}`;
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    const page=await browser.newPage({deviceScaleFactor:1});
    async function render(height,body,style,out){
      await page.setViewportSize({width:1200,height});
      await page.setContent('<!doctype html><meta charset="utf-8"><style>'+common+style+'</style>'+body);
      await page.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
      await page.screenshot({path:path.join(root,out)});
      console.log('Rendered',out,'1200×'+height);
    }
    const split=title.lastIndexOf(' ');
    await render(630,`<main class="card home"><div class="home-copy"><p class="eyebrow">A LITTLE CORNER OF MY WORLD</p><h1>${esc(title.slice(0,split))}<br><em>${esc(title.slice(split+1))}</em><span class="flower"> ✳</span></h1><p class="intro">${esc(description)}</p></div><div class="arch"><img src="${pig}" alt=""></div><p class="host">${esc(host)}</p></main>`,`.home{height:630px;padding:95px 68px}.home-copy{position:relative;z-index:1;max-width:610px}.home h1{font:70px/1.09 Georgia,serif;letter-spacing:-2.5px;margin:44px 0 30px}.home h1 em{font-weight:400}.intro{max-width:570px;font-size:22px;line-height:1.6;color:#6d7368}.arch{position:absolute;right:60px;top:79px;width:350px;height:470px;background:#eaf0e5;border:1px solid #dedfd3;border-radius:190px 190px 16px 16px;display:grid;place-items:center}.arch img{width:315px;height:auto;translate:-.206% -2.92%}`, 'assets/images/social/home.png');
    for(const [height,out] of [[750,'cover.png'],[630,'share.png']]){
      await render(height,`<main class="card app"><div class="app-left"><img class="app-icon" src="${icon}" alt=""><h1>${esc(appName)}</h1><p>${esc(appDescription)}</p><div class="pills"><span>Android</span><span>v${esc(version)}</span><span>${esc(status)}</span></div></div><div class="screens"><img class="screen" src="${home}" alt=""><img class="screen" src="${reader}" alt=""></div><p class="real-label">Actual app screens</p><p class="host">${esc(host)}</p></main>`,`.app{height:${height}px;background:#f2eff5;padding:68px}.app-left{position:absolute;left:68px;top:${height===750?164:115}px}.app-left p{max-width:450px}.screens{position:absolute;right:58px;top:${height===750?88:76}px;height:${height===750?550:460}px}.real-label{right:58px;bottom:36px}.app .host{bottom:36px}`, 'assets/images/projects/eggplant/'+out);
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
