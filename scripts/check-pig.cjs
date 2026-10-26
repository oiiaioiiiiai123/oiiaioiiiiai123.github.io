/* Run against a built, locally served site. Requires Playwright and Chrome.
   PIG_QA_OUT keeps screenshots/reports outside the public assets directory. */
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const url = process.env.PIG_QA_URL || 'http://127.0.0.1:4173';
const output = process.env.PIG_QA_OUT || path.resolve('test-results/pig-expressions');
const checks = [], errors = [], requests = [];
const ok = (name, condition = true) => { assert.ok(condition, name); checks.push(name); console.log('PASS', name); };
const watch = p => {
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('requestfailed', r => errors.push(r.url()));
  p.on('request', r => requests.push(r.url()));
};
const state = p => p.locator('[data-pig]').getAttribute('data-state');
const phase = p => p.locator('[data-pig]').getAttribute('data-phase');
const count = async p => Number(await p.locator('[data-feed-count]').innerText());
const ready = p => p.waitForSelector('[data-face-ready=true]');
const advance = (p, ms) => p.clock.runFor(ms);
const reset = async (p, route = '/pigs-room/') => { await p.goto(url + route); await ready(p); };
const pet = p => p.locator('.pig-touch').click();
const feed = p => p.locator('.carrot-button').click();
const canvasHash = p => p.locator('.pig-face').evaluate(async c => {
  const pixels = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', pixels))].map(n => n.toString(16).padStart(2, '0')).join('');
});
const pixelStats = p => p.locator('.pig-art').evaluate(img => {
  const base = document.createElement('canvas'); base.width = img.naturalWidth; base.height = img.naturalHeight;
  const ctx = base.getContext('2d', {willReadFrequently: true}); ctx.drawImage(img, 0, 0);
  const original = ctx.getImageData(0, 0, base.width, base.height).data;
  const layer = document.querySelector('.pig-face'); ctx.drawImage(layer, 0, 0);
  const rendered = ctx.getImageData(0, 0, base.width, base.height).data;
  const allowed = [[164, 488, 270, 607], [449, 546, 551, 663], [322, 814, 390, 863]];
  let outside = 0, changed = 0;
  for (let y = 0; y < base.height; y++) for (let x = 0; x < base.width; x++) {
    const i = (y * base.width + x) * 4;
    if ([0, 1, 2, 3].some(c => original[i+c] !== rendered[i+c])) {
      changed++;
      if (!allowed.some(b => x >= b[0] && x < b[2] && y >= b[1] && y < b[3])) outside++;
    }
  }
  function darkBounds(b, data) {
    let minY = 9999, maxY = -1, pixels = 0;
    for (let y=b[1]; y<b[3]; y++) for (let x=b[0]; x<b[2]; x++) {
      const i=(y*base.width+x)*4;
      if (data[i]<100 && data[i+1]<100 && data[i+2]<100 && data[i+3]>240) { pixels++; minY=Math.min(minY,y); maxY=Math.max(maxY,y); }
    }
    return {height: maxY < 0 ? 0 : maxY-minY+1, pixels};
  }
  return {outside, changed, eyes:allowed.slice(0,2).map(b=>darkBounds(b,rendered)), oldEyes:allowed.slice(0,2).map(b=>darkBounds(b,original)), mouth:darkBounds(allowed[2],rendered), transparentCorner:rendered[3]===0};
});
const checkPixels = async (p, label, kind) => {
  const s=await pixelStats(p);
  ok(label+': zero changed pixels outside face regions',s.outside===0&&s.transparentCorner);
  if (kind==='idle') ok(label+': every displayed pixel matches the original',s.changed===0);
  if (kind==='closed') ok(label+': old black eyes completely replaced by thin closed curves',s.eyes.every((eye,i)=>eye.height<30&&eye.pixels<s.oldEyes[i].pixels*.25));
  if (kind==='happy') ok(label+': smiling eyes and small local mouth',s.eyes.every(e=>e.height<33)&&s.mouth.pixels>100&&s.mouth.height<25);
  if (kind==='open') ok(label+': mouth is below intact snout',s.mouth.pixels>600&&s.mouth.height>30);
  return s;
};
const dragTo = async (p, nx, ny) => {
  const c=await p.locator('.carrot-button').boundingBox(), i=await p.locator('.pig-art').boundingBox();
  const point={x:i.x+i.width*nx/1216,y:i.y+i.height*ny/1181};
  await p.mouse.move(c.x+c.width/2,c.y+c.height/2);await p.mouse.down();await p.mouse.move(point.x,point.y,{steps:12});await p.mouse.up();
  return point;
};
const clockPage = async (browser, options={}) => {
  const context=await browser.newContext({viewport:{width:1440,height:1000},...options});
  const page=await context.newPage();watch(page);
  await page.addInitScript(()=>{Math.random=()=>0;});
  const date=new Date('2026-10-20T09:00:00+08:00');
  await page.clock.install({time:date});await page.clock.pauseAt(date);
  await reset(page);return {context,page};
};

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  try {
    const {context,page:p}=await clockPage(browser);
    const originalResponse=await p.request.get(url+'/assets/images/pig/pig-original.png');
    ok('immutable original PNG matches supplied SHA-256',crypto.createHash('sha256').update(await originalResponse.body()).digest('hex')==='ad85b66a4d2d86026caef1f26437980bd273af8e2ff69a2fa3d0c98942884935');
    await checkPixels(p,'Idle','idle');
    await p.locator('.pig-widget').screenshot({path:path.join(output,'idle.png')});
    await advance(p,3670);ok('random idle timer enters blinking',await state(p)==='blinking');
    const half=await pixelStats(p);ok('eyes progressively close using source pixels',half.eyes.every((e,i)=>e.height<half.oldEyes[i].height&&e.height>30));
    await advance(p,80);await checkPixels(p,'Blink closed frame','closed');
    await p.locator('.pig-widget').screenshot({path:path.join(output,'blink.png')});
    await advance(p,300);ok('blink ends in idle',await state(p)==='idle');await checkPixels(p,'After blink','idle');
    await pet(p);ok('pet enters happy',await state(p)==='happy');await checkPixels(p,'Happy','happy');
    await p.locator('.pig-widget').screenshot({path:path.join(output,'happy.png')});
    await advance(p,1200);await checkPixels(p,'After pet','idle');
    // A happy expression can be interrupted by another pat or a feed.
    await feed(p);ok('feed enters opening phase',await state(p)==='feeding'&&await phase(p)==='opening');
    await checkPixels(p,'Feeding open mouth','open');
    ok('carrot flight ends at the new below-nose mouth',await p.locator('body>.carrot-ghost').evaluate(el=>{
      const b=document.querySelector('.pig-art').getBoundingClientRect();const f=el.getAnimations()[0].effect.getKeyframes().at(-1);const m=new DOMMatrix(f.transform);
      return Math.abs(m.m41+24-b.left-b.width*355/1216)<1&&Math.abs(m.m42+24-b.top-b.height*836/1181)<1;
    }));
    await advance(p,200);await p.locator('.pig-widget').screenshot({path:path.join(output,'feeding.png')});
    await advance(p,300);ok('carrot consumed exactly once',await count(p)===1&&await phase(p)==='chewing'&&await p.locator('body>.carrot-ghost').count()===0);
    const chew1=await canvasHash(p);await advance(p,130);const chew2=await canvasHash(p);
    ok('local chewing pixels really animate',chew1!==chew2);await checkPixels(p,'Chewing');
    await advance(p,850);ok('feeding reaches satisfied face',await phase(p)==='satisfied');await checkPixels(p,'Satisfied','happy');
    await advance(p,1000);ok('feeding returns to idle',await state(p)==='idle');await checkPixels(p,'After feeding','idle');
    await advance(p,45100);ok('sleep after inactivity closes eyes',await state(p)==='sleeping'&&await p.locator('.sleep-letters').isVisible());
    await checkPixels(p,'Sleeping','closed');await p.locator('.pig-widget').screenshot({path:path.join(output,'sleeping.png')});
    await p.locator('.pig-touch').focus();await p.keyboard.press('Space');ok('keyboard wake restores idle',await state(p)==='idle');await checkPixels(p,'Awake','idle');
    for(let i=0;i<5;i++){await pet(p);await advance(p,100);}
    ok('five quick pats unlock special',await state(p)==='special'&&await p.locator('.pig-bubble').innerText()==='Secret unlocked!');
    await checkPixels(p,'Special','happy');await p.locator('.pig-widget').screenshot({path:path.join(output,'special.png')});
    await advance(p,2400);ok('special restores idle',await state(p)==='idle');
    await reset(p,'/');ok('count survives page change',await count(p)===1);
    await pet(p);await checkPixels(p,'Homepage happy','happy');await advance(p,1200);
    const button=await p.locator('.carrot-button').boundingBox();
    for(let i=0;i<8;i++) await p.mouse.click(button.x+button.width/2,button.y+button.height/2);
    for(let i=0;i<8;i++) await pet(p);
    await advance(p,500);ok('rapid feed and pet events count one meal',await count(p)===2&&await phase(p)==='chewing');
    await advance(p,2100);ok('rapid feed recovers normally',await state(p)==='idle');
    for(let i=0;i<10;i++) await pet(p);
    ok('rapid pats leave a valid special state',await state(p)==='special');await advance(p,2400);ok('rapid pats recover to original',await state(p)==='idle');
    await pet(p);const c=await p.locator('.carrot-button').boundingBox(), image=await p.locator('.pig-art').boundingBox();
    const point={x:image.x+image.width*355/1216,y:image.y+image.height*836/1181};
    await p.mouse.move(c.x+20,c.y+20);await p.mouse.down();await p.mouse.move(point.x,point.y,{steps:10});await advance(p,1600);
    ok('holding a drag cancels prior happy timeout',await p.locator('.pig-widget').evaluate(e=>e.classList.contains('drop-ready'))&&await p.locator('.pig-face').getAttribute('data-expression')==='open');
    await p.mouse.up();ok('drag flight starts at release position',await p.locator('body>.carrot-ghost').evaluate((el,point)=>{const m=new DOMMatrix(el.getAnimations()[0].effect.getKeyframes()[0].transform);return Math.abs(m.m41+24-point.x)<1&&Math.abs(m.m42+24-point.y)<1;},point));
    await advance(p,2600);ok('drag feeds once without timer conflict',await count(p)===3&&await state(p)==='idle');
    // Sleep deadline during a meal must not override the feeding state.
    await advance(p,44900);await feed(p);await advance(p,200);ok('feed cancels imminent sleep',await state(p)==='feeding');await advance(p,2500);
    // Refresh, source and cache behavior.
    const src=await p.locator('.pig-art').getAttribute('src');await p.reload();await ready(p);
    ok('refresh uses the versioned original PNG',await p.locator('.pig-art').getAttribute('src')===src&&src.includes('pig-original.png?v='));
    ok('script and styles are cache-versioned',await p.locator('script[src*="pig.js?v="]').count()===1&&await p.locator('link[href*="pig.css?v="]').count()===1);
    const newCount=await count(p);await advance(p,250);
    // Cancel a real pointer gesture: no synthetic feeding event allowed.
    const cb=await p.locator('.carrot-button').boundingBox();await p.mouse.move(cb.x+20,cb.y+20);await p.mouse.down();await p.mouse.move(cb.x+55,cb.y-25,{steps:3});
    await p.locator('.carrot-button').dispatchEvent('pointercancel',{pointerId:1});await p.mouse.up();await advance(p,500);
    ok('cancelled pointer cleans ghosts and does not count',await count(p)===newCount&&await p.locator('body>.carrot-ghost').count()===0&&await state(p)==='idle');
    await context.close();

    // Fresh contexts avoid Chrome's full-page screenshot tiling after viewport changes.
    for(const width of [1440,950,851,768,650,390,320]) {
      const {context,page}=await clockPage(browser,{viewport:{width,height:1000},reducedMotion:'reduce'});
      for(const [route,name] of [['/','home'],['/pigs-room/','room']]) {
        await reset(page,route);
        const layout=await page.locator('.pig-art').evaluate(img=>{
          const i=img.getBoundingClientRect(), c=document.querySelector('.pig-face').getBoundingClientRect(), nav=document.querySelector('.nav-actions').getBoundingClientRect(),brand=document.querySelector('.brand').getBoundingClientRect();
          return {nw:img.naturalWidth,nh:img.naturalHeight,ratio:i.width/i.height,delta:Math.abs(c.x-i.x)+Math.abs(c.y-i.y)+Math.abs(c.width-i.width)+Math.abs(c.height-i.height),fit:getComputedStyle(img).objectFit,scroll:document.documentElement.scrollWidth,viewport:innerWidth,navOverlap:brand.right>nav.left};
        });
        ok(`${name} ${width}: original proportion and aligned local layer`,layout.nw===1216&&layout.nh===1181&&Math.abs(layout.ratio-1216/1181)<.0001&&layout.delta<.1&&layout.fit==='contain');
        ok(`${name} ${width}: full title and navigation fit`,layout.scroll<=layout.viewport&&!layout.navOverlap);
        assert.equal(await page.title(),route==='/'?"oiiaioiiiiai's HomePage":"Pig's Room · oiiaioiiiiai's HomePage");
        ok(`${name} ${width}: title, GitHub and canonical URL`,await page.locator('.brand-name').innerText()==="oiiaioiiiiai's HomePage"&&await page.locator('.site-footer a[href="https://github.com/oiiaioiiiiai123"]').count()===1&&(await page.locator('link[rel=canonical]').getAttribute('href')).startsWith('https://oiiaioiiiiai123.github.io/'));
        if(width===1440||width===390)await page.screenshot({path:path.join(output,`${name}-${width===1440?'desktop':'mobile'}.png`),fullPage:true});
        await checkPixels(page,`${name} ${width} original`,'idle');
        await pet(page);await checkPixels(page,`${name} ${width} happy`,'happy');await advance(page,1200);
      }
      if([1440,768,390,320].includes(width)) {
        const before=await count(page);
        for(const [x,y] of [[217,548],[800,400],[1100,200]]) {await dragTo(page,x,y);await advance(page,400);}
        ok(`eye, back and tail reject carrots ${width}`,await count(page)===before);
        await dragTo(page,355,836);await advance(page,2500);ok(`mouth accepts drag ${width}`,await count(page)===before+1);
      }
      ok(`reduced motion ${width}: no automatic blink or body motion`,await page.locator('.pig-portrait').evaluate(e=>getComputedStyle(e).animationName==='none'));
      await advance(page,12000);ok(`reduced motion ${width}: remains original idle`,await state(page)==='idle');
      if(width===390){await page.locator('.menu-toggle').click();ok('mobile navigation opens',await page.locator('#main-nav').isVisible());}
      await context.close();
    }
    const mobile=await clockPage(browser,{viewport:{width:390,height:844},isMobile:true,hasTouch:true});const m=mobile.page;
    await m.locator('.pig-touch').tap();ok('phone tap shows smiling eyes',await state(m)==='happy');await advance(m,1200);
    await m.locator('.carrot-button').tap();await advance(m,2500);ok('phone tap feeds one carrot',await count(m)===1&&await state(m)==='idle');
    const cd=await mobile.context.newCDPSession(m), cr=await m.locator('.carrot-button').boundingBox(), pr=await m.locator('.pig-art').boundingBox();
    await cd.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cr.x+20,y:cr.y+20}]});
    await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cr.x+20,y:cr.y-20}]});
    await cd.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:pr.x+pr.width*355/1216,y:pr.y+pr.height*836/1181}]});
    await cd.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await advance(m,2500);ok('phone touch drag feeds one carrot',await count(m)===2);
    await mobile.context.close();
    const storage=await browser.newContext();await storage.addInitScript(()=>{
      Object.defineProperty(Storage.prototype,'getItem',{value(){throw new Error('blocked');}});
      Object.defineProperty(Storage.prototype,'setItem',{value(){throw new Error('blocked');}});
    });const sp=await storage.newPage();watch(sp);await sp.clock.install();await reset(sp,'/');await feed(sp);await advance(sp,2600);ok('storage denied still allows feeding',await count(sp)===1);await storage.close();
    const links=await browser.newPage();watch(links);
    for(const route of ['/','/projects/','/projects/app/','/projects/website/','/projects/games/','/projects/more/','/projects/eggplant/','/projects/shanghai-metro-test/','/writing/','/pigs-room/','/404.html']) {
      const r=await links.goto(url+route);ok('page resolves '+route,r.status()===200);
      ok('new title and GitHub on '+route,(await links.title()).endsWith("oiiaioiiiiai's HomePage")&&await links.locator('.site-footer a[href="https://github.com/oiiaioiiiiai123"]').count()===1);
      if(route==='/projects/website/')ok('released metro card opens the real HTTPS test',(await links.locator('main').innerText()).includes('测测你是哪条上海地铁')&&(await links.locator('main').innerText()).includes('Released')&&await links.locator('.project-card[href="https://oiiaioiiiiai123.github.io/shmetro-personality/"]').count()===1);
      if(route==='/projects/eggplant/')ok('eggplant description and status preserved',(await links.locator('main').innerText()).includes('An English reading app.')&&(await links.locator('main').innerText()).includes('In Development'));
      if(route==='/writing/')ok('writing collection preserved',(await links.locator('h1').innerText()).replace(/\s+/g,' ').includes('If I Could Draw Life'));
    }
    ok('no old pig assets requested',!requests.some(u=>/\/assets\/images\/pig\/.*\.svg/.test(u)||u.includes('/assets/images/pig/archive/')));
    ok('no old personal GitHub links requested',!requests.some(u=>/^https:\/\/github\.com\/oiiaioiiiiai(?:\/|$)/.test(u)));
    ok('no browser console, request or script errors',errors.length===0);
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks:checks.length,results:checks,errors,screenshots:output},null,2));
    console.log('TOTAL',checks.length,'checks passed; screenshots:',output);
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
