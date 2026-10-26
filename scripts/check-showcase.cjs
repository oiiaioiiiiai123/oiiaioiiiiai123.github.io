/* Browser checks for the real app showcase, shared gallery, social metadata and
   custom 404. Run after Jekyll build against a local server with 404 fallback. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const url=process.env.SHOWCASE_QA_URL||'http://127.0.0.1:4173';
const output=process.env.SHOWCASE_QA_OUT||path.resolve('test-results/showcase');
const results=[],errors=[];
const ok=(label,condition=true)=>{assert.ok(condition,label);results.push(label);console.log('PASS',label)};
const watch=page=>{
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&!page.url().includes('/missing-showcase-page/'))errors.push(m.text())});
  page.on('requestfailed',r=>errors.push(r.url()));
};
const load=async(page,route)=>{const r=await page.goto(url+route);assert.equal(r.status(),200);};
const eagerGallery=async page=>{
  await page.locator('.screenshot-track').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector('.screenshot-link img').naturalWidth===1080);
  await page.locator('.screenshot-link img').evaluateAll(images=>Promise.all(images.map(i=>{i.loading='eager';return i.decode();})));
};

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  try{
    for(const width of [1440,768,390,320]){
      const context=await browser.newContext({viewport:{width,height:950},reducedMotion:'reduce'});
      const page=await context.newPage();watch(page);
      await load(page,'/projects/eggplant/');
      ok(`eggplant ${width}: correct identity, development status and real version`,await page.locator('h1').innerText()==='eggplant'&&(await page.locator('.project-identity p').innerText())==='An English reading app.'&&(await page.locator('.platform-badge').innerText())==='Android · v1.0'&&(await page.locator('.status').first().innerText())==='In Development');
      ok(`eggplant ${width}: original icon is loaded`,await page.locator('.app-icon').evaluate(img=>img.complete&&img.naturalWidth===192&&img.currentSrc.endsWith('/app-icon.webp')));
      ok(`eggplant ${width}: no invented repository, demo or download buttons`,await page.locator('.project-links a').count()===0);
      ok(`eggplant ${width}: six implemented feature descriptions`,await page.locator('.feature-item').count()===6);
      ok(`eggplant ${width}: no made-up release date`,await page.locator('.version-grid dt').allInnerTexts().then(v=>v.join('|')==='Version|Platform|Development status'));
      await eagerGallery(page);
      ok(`gallery ${width}: all five genuine captures loaded at original dimensions`,await page.locator('.screenshot-link img').evaluateAll(images=>images.length===5&&images.every(i=>i.naturalWidth===1080&&i.naturalHeight===2400)));
      ok(`gallery ${width}: screenshots preserve their full aspect ratio`,await page.locator('.screenshot-link img').evaluateAll(images=>images.every(i=>{const b=i.getBoundingClientRect();return Math.abs(b.width/b.height-.45)<.002&&getComputedStyle(i).objectFit==='contain';})));
      ok(`layout ${width}: no horizontal page overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      const track=page.locator('.screenshot-track');
      await page.locator('[data-scroll="1"]').click();await page.waitForFunction(()=>document.querySelector('.screenshot-track').scrollLeft>20);
      ok(`gallery ${width}: next button moves the track`,await track.evaluate(el=>el.scrollLeft>20));
      await track.evaluate(el=>{el.scrollLeft=0});
      await page.locator('.screenshot-link').first().click();
      ok(`viewer ${width}: native dialog opens`,await page.locator('dialog').evaluate(d=>d.open));
      await page.locator('.viewer-image img').evaluate(i=>i.decode());
      ok(`viewer ${width}: full image fits available space`,await page.locator('.viewer-image img').evaluate(img=>{const i=img.getBoundingClientRect(),p=img.parentElement.getBoundingClientRect();return i.width<=p.width&&i.height<=p.height&&Math.abs(i.width/i.height-.45)<.002;}));
      await page.keyboard.press('ArrowRight');ok(`viewer ${width}: keyboard advances image`,(await page.locator('.viewer-caption').innerText()).startsWith('2 / 5'));
      await page.keyboard.press('ArrowLeft');ok(`viewer ${width}: keyboard returns image`,(await page.locator('.viewer-caption').innerText()).startsWith('1 / 5'));
      for(let i=0;i<8;i++)await page.keyboard.press('Tab');
      ok(`viewer ${width}: focus stays in the dialog`,await page.locator('dialog').evaluate(d=>d.contains(document.activeElement)));
      if(width===1440||width===390)await page.screenshot({path:path.join(output,'gallery-'+(width===1440?'desktop':'mobile')+'.png')});
      await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('dialog').open&&!document.body.classList.contains('is-viewing-screenshot'));ok(`viewer ${width}: Escape closes and releases scroll lock`,await page.locator('dialog').evaluate(d=>!d.open)&&await page.locator('body').evaluate(b=>!b.classList.contains('is-viewing-screenshot')));
      ok(`viewer ${width}: focus returns to the image link`,await page.locator('.screenshot-link').first().evaluate(a=>a===document.activeElement));
      if(width===1440||width===390){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(output,'eggplant-'+(width===1440?'desktop':'mobile')+'.png'),fullPage:true});}
      await page.locator('.screenshot-link').last().click();ok(`viewer ${width}: final image disables next`,await page.locator('[data-viewer-step="1"]').isDisabled());await page.locator('.viewer-close').click();
      await page.locator('.screenshot-link').first().click();
      for(let i=0;i<4;i++)await page.locator('[data-viewer-step="1"]').click();
      ok(`viewer ${width}: last-image navigation retains keyboard focus`,await page.locator('dialog').evaluate(d=>d.contains(document.activeElement)));
      await page.locator('.viewer-close').click();
      await page.reload();ok(`eggplant ${width}: direct refresh resolves`,await page.locator('h1').innerText()==='eggplant');
      await load(page,'/projects/shanghai-metro-test/');
      ok(`metro ${width}: released test has its real HTTPS entry`,await page.locator('h1').innerText()==='测测你是哪条上海地铁'&&await page.locator('.status').first().innerText()==='Released'&&await page.locator('.project-links a[href="https://oiiaioiiiiai123.github.io/shmetro-personality/"]').count()===1);
      await load(page,'/404.html');await page.waitForSelector('[data-face-ready=true]');
      ok(`404 ${width}: requested copy and sleeping original PNG`,await page.locator('.not-found-code').innerText()==='404'&&await page.locator('h1').innerText()==='Oops! Page not found.'&&await page.locator('[data-pig-static]').getAttribute('data-state')==='sleeping'&&await page.locator('.pig-art').evaluate(i=>i.naturalWidth===1216&&i.naturalHeight===1181));
      ok(`404 ${width}: closed-eye layer and no feeding controls`,await page.locator('.pig-face').getAttribute('data-expression')==='sleeping'&&await page.locator('.carrot-button').count()===0);
      ok(`404 ${width}: no horizontal overflow`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(width===1440||width===390)await page.screenshot({path:path.join(output,'404-'+(width===1440?'desktop':'mobile')+'.png'),fullPage:true});
      await page.getByRole('link',{name:'Back to Home',exact:true}).click();ok(`404 ${width}: Back to Home reaches homepage`,new URL(page.url()).pathname==='/');
      await context.close();
    }
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const mobile=await context.newPage();watch(mobile);
    await load(mobile,'/projects/eggplant/');await eagerGallery(mobile);
    const box=await mobile.locator('.screenshot-track').boundingBox();const cd=await context.newCDPSession(mobile);
    await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width-40,y:box.y+100}]});
    for(let i=1;i<=8;i++)await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width-40-i*25,y:box.y+100}]});
    await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForFunction(()=>document.querySelector('.screenshot-track').scrollLeft>30);
    ok('phone: native touch swipe moves gallery',await mobile.locator('.screenshot-track').evaluate(t=>t.scrollLeft>30));
    await context.close();
    const nojs=await browser.newContext({javaScriptEnabled:false});const fallback=await nojs.newPage();await load(fallback,'/projects/eggplant/');
    ok('without JavaScript: gallery links and hidden enhancement controls',await fallback.locator('.screenshot-link').count()===5&&!await fallback.locator('.gallery-controls').isVisible());
    await fallback.locator('.screenshot-link').first().click();ok('without JavaScript: original full image opens',new URL(fallback.url()).pathname.endsWith('/home.webp'));await nojs.close();
    const page=await browser.newPage();watch(page);
    for(const route of ['/','/projects/','/projects/app/','/projects/website/','/projects/games/','/projects/more/','/projects/eggplant/','/projects/shanghai-metro-test/','/writing/','/pigs-room/','/404.html']){
      await load(page,route);
      for(const property of ['og:title','og:description','og:image','og:url'])assert.equal(await page.locator(`meta[property="${property}"]`).count(),1,route+' '+property);
      ok('social tags: one non-conflicting set '+route,await page.locator('meta[name="twitter:card"]').count()===1&&await page.locator('meta[name="twitter:card"]').getAttribute('content')==='summary_large_image');
      const image=await page.locator('meta[property="og:image"]').getAttribute('content');const imageUrl=new URL(image);
      const response=await page.request.get(url+imageUrl.pathname);const bytes=await response.body();
      ok('social image: absolute live URL and real 1200×630 PNG '+route,imageUrl.origin==='https://oiiaioiiiiai123.github.io'&&response.status()===200&&bytes.readUInt32BE(16)===1200&&bytes.readUInt32BE(20)===630);
      ok('social URL and real profile '+route,(await page.locator('meta[property="og:url"]').getAttribute('content'))==='https://oiiaioiiiiai123.github.io'+route&&await page.locator('.site-footer a[href="https://github.com/oiiaioiiiiai123"]').count()===1);
      if(route==='/projects/eggplant/')ok('eggplant has its own social image',imageUrl.pathname==='/assets/images/projects/eggplant/share.png');
      if(route==='/writing/')ok('If I Could Draw Life collection remains usable',(await page.locator('h1').innerText()).replace(/\s+/g,' ').includes('If I Could Draw Life'));
    }
    await load(page,'/');
    for(const [name,route] of [['App','/projects/app/'],['Website','/projects/website/'],['Games','/projects/games/'],['More to Come','/projects/more/']]){
      const card=page.locator('.category-card').filter({has:page.locator('h3',{hasText:name})});await card.click();ok('category link '+name,new URL(page.url()).pathname===route);await load(page,'/');
    }
    await load(page,'/projects/app/');await page.locator('.project-card').filter({hasText:'eggplant'}).click();ok('App → eggplant detail route',new URL(page.url()).pathname==='/projects/eggplant/');
    const dark=await browser.newPage({viewport:{width:390,height:844},colorScheme:'dark'});watch(dark);await load(dark,'/projects/eggplant/');await eagerGallery(dark);await dark.locator('.screenshot-link').first().click();await dark.screenshot({path:path.join(output,'gallery-dark.png')});ok('dark mode gallery opens',await dark.locator('html').getAttribute('data-theme')==='dark'&&await dark.locator('dialog').evaluate(d=>d.open));await dark.close();
    const missing=await page.goto(url+'/missing-showcase-page/deep-link/');await page.waitForSelector('[data-face-ready=true]');
    ok('unknown nested route returns actual HTTP 404 with the themed page',missing.status()===404&&await page.locator('h1').innerText()==='Oops! Page not found.');
    await page.getByRole('link',{name:'Back to Home',exact:true}).click();ok('unknown nested route can return home',new URL(page.url()).pathname==='/');
    ok('no unexpected browser console, script or request errors',errors.length===0);
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks:results.length,results,errors,screenshots:output},null,2));console.log('TOTAL',results.length,'checks passed');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
