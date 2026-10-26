// Browser proof of Home -> Website -> the independently deployed Metro quiz.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const home=(process.env.DEPLOY_QA_HOME||'https://oiiaioiiiiai123.github.io').replace(/\/$/,'');
const metro='https://oiiaioiiiiai123.github.io/shmetro-personality/';
const output=process.env.DEPLOY_QA_OUT||path.resolve('test-results/deployment');
const checks=[],errors=[];
const ok=(name,value)=>{assert.ok(value,name);checks.push(name);};
const watch=p=>{
  p.on('pageerror',e=>errors.push(e.message));
  p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  p.on('requestfailed',r=>errors.push(r.url()));
  p.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${r.url()}`);});
};
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  try{
    for(const width of [1440,768,390,320]){
      const mobile=width<=390;
      const context=await browser.newContext({viewport:{width,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
      const p=await context.newPage();watch(p);
      const response=await p.goto(home+'/',{waitUntil:'networkidle'});
      ok(`${width}: public home HTTP 200`,response.status()===200);
      ok(`${width}: original page title`,await p.title()==="oiiaioiiiiai's HomePage");
      ok(`${width}: home retains four category entrances`,await p.locator('.category-card').count()===4);
      await p.waitForSelector('[data-face-ready=true]');
      ok(`${width}: original pig PNG loads`,await p.locator('.pig-art').evaluate(i=>i.naturalWidth===1216&&i.naturalHeight===1181));
      ok(`${width}: home has no horizontal overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(width===1440||width===390)await p.screenshot({path:path.join(output,`home-${width}.png`),fullPage:true});
      await p.locator('.category-card[href="/projects/website/"]').click();
      ok(`${width}: Home Website entrance navigates correctly`,p.url()===home+'/projects/website/');
      const card=p.locator('.project-card').filter({hasText:'测测你是哪条上海地铁'});
      ok(`${width}: existing metro card is released`,await card.locator('.status').innerText()==='Released');
      ok(`${width}: card has real HTTPS URL and safe accessible new tab`,await card.getAttribute('href')===metro&&await card.getAttribute('target')==='_blank'&&(await card.getAttribute('rel')).includes('noopener')&&(await card.getAttribute('rel')).includes('noreferrer')&&(await card.getAttribute('aria-label')).includes('新标签页'));
      await card.locator('img').evaluate(i=>i.decode());
      ok(`${width}: original quiz cover loads`,await card.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0&&i.currentSrc.endsWith('/shanghai-metro-test/cover.webp')));
      ok(`${width}: Website category has no horizontal overflow`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(width===1440||width===390)await p.screenshot({path:path.join(output,`website-${width}.png`),fullPage:true});
      const pending=p.waitForEvent('popup');
      if(mobile)await card.tap();else await card.click();
      const quiz=await pending;watch(quiz);await quiz.waitForLoadState('networkidle');
      ok(`${width}: actual card click reaches live quiz`,quiz.url()===metro&&await quiz.title()==='测测你是哪条上海地铁');
      if(mobile)await quiz.locator('#start-btn').tap();else await quiz.locator('#start-btn').click();
      if(mobile)await quiz.locator('.choice[data-key=A]').tap();else await quiz.locator('.choice[data-key=A]').click();
      await quiz.locator('#next-btn').click();
      ok(`${width}: quiz works after arriving through home`,(await quiz.locator('#progress-num').innerText()).startsWith('02'));
      await quiz.close();
      for(const route of ['/projects/shanghai-metro-test/','/writing/','/pigs-room/']){
        const r=await p.goto(home+route,{waitUntil:'networkidle'});
        ok(`${width}: direct access ${route}`,r.status()===200);
        ok(`${width}: no overflow ${route}`,await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
        await p.reload({waitUntil:'networkidle'});
        ok(`${width}: refresh ${route}`,await p.locator('main h1').count()===1);
        if(route==='/writing/')ok(`${width}: original Writing title`,(await p.locator('h1').innerText()).replace(/\s+/g,' ').includes('If I Could Draw Life'));
      }
      await p.goto(home+'/');
      await p.locator('.theme-toggle').click();
      ok(`${width}: original dark mode toggle`,await p.locator('html').getAttribute('data-theme')==='dark');
      ok(`${width}: original footer`,(await p.locator('.site-footer').innerText()).includes('happy everyday'));
      await context.close();
    }
    ok('No browser, console or resource errors during real entry flow',errors.length===0);
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({home,metro,checks,errors},null,2));
    console.log(`PASS: ${checks.length} Home -> Website -> Metro browser assertions`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);console.error(errors);process.exit(1);});
