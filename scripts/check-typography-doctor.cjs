/* Typography/flower/doctor QA. The article URL points at an isolated Jekyll
   fixture, never a published post. A temporary Chrome profile tests native 200%. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const base=process.env.VISUAL_QA_URL||'http://127.0.0.1:4173';
const article=process.env.ARTICLE_QA_URL||'http://127.0.0.1:4174/writing/2026/10/20/typography-check/';
const output=process.env.VISUAL_QA_OUT||path.resolve('test-results/typography-doctor');
const executable=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const results=[],errors=[],pixelEvidence=[];
const ok=(name,condition=true)=>{assert.ok(condition,name);results.push(name);console.log('PASS',name)};
const watch=p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('requestfailed',r=>errors.push(r.url()));};
const ready=p=>p.waitForSelector('[data-face-ready=true]');
const state=p=>p.locator('[data-pig]').getAttribute('data-state');
const role=p=>p.locator('[data-pig]').getAttribute('data-character');
const count=async p=>Number(await p.locator('[data-feed-count]').innerText());
const load=async(p,route)=>{const r=await p.goto(route.startsWith('http')?route:base+route);assert.equal(r.status(),200,route);};
const switchRole=async p=>{
  const next=(await role(p))==='normalPig'?'doctorPig':'normalPig';
  await p.locator('.doctor-toggle').click();
  await p.waitForFunction(next=>{const w=document.querySelector('[data-pig]');return w.dataset.character===next&&w.dataset.faceReady==='true';},next);
  if(p.__clock)await p.clock.runFor(450);
  else await p.waitForFunction(()=>document.querySelector('[data-pig]').dataset.state==='idle');
};
const pixels=p=>p.locator('.pig-art').first().evaluate(img=>{
  const doctor=img.naturalWidth===695;
  const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0);
  const original=ctx.getImageData(0,0,c.width,c.height).data;
  ctx.drawImage(img.parentElement.querySelector('.pig-face'),0,0);
  const actual=ctx.getImageData(0,0,c.width,c.height).data;
  const boxes=doctor?[[216,318,260,370],[350,344,398,400],[294,477,329,505]]:[[164,488,270,607],[449,546,551,663],[322,814,390,863]];
  let changed=0,outside=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
    const n=(y*c.width+x)*4;
    if([0,1,2,3].some(k=>original[n+k]!==actual[n+k])){
      changed++;if(!boxes.some(b=>x>=b[0]&&x<b[2]&&y>=b[1]&&y<b[3]))outside++;
    }
  }
  const eyeBoxes=doctor?[[221,319,256,369],[350,344,398,400]]:boxes.slice(0,2);
  const dark=(box,data)=>{
    let min=9999,max=-1,total=0;
    for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++){
      const n=(y*c.width+x)*4;
      if(data[n]<160&&data[n+1]<130&&data[n+2]<110&&data[n+3]>200){total++;min=Math.min(min,y);max=Math.max(max,y)}
    }return{height:max<0?0:max-min+1,total};
  };
  const glasses=doctor?[[216,350],[218,359],[258,366]].every(([x,y])=>{const n=(y*c.width+x)*4;return[0,1,2,3].every(k=>original[n+k]===actual[n+k]);}):true;
  return{doctor,changed,outside,eyes:eyeBoxes.map(b=>dark(b,actual)),originalEyes:eyeBoxes.map(b=>dark(b,original)),glasses};
});
const pixelCheck=async(p,label,kind)=>{
  const data=await pixels(p);pixelEvidence.push({label,...data});
  ok(label+': body, clothes, halo, nose and pattern unchanged',data.outside===0&&data.glasses);
  if(kind==='idle')ok(label+': all pixels restored to the original',data.changed===0);
  if(kind==='closed')ok(label+': round eyes replaced by small closed curves',data.eyes.every((e,i)=>e.total<data.originalEyes[i].total*.4&&e.height<20));
  return data;
};
const flowers=async(p,width)=>{
  const data=await p.locator('.pig-flowers').evaluate(layer=>{
    const widget=layer.closest('[data-pig]'),img=widget.querySelector('.pig-art'),r=img.getBoundingClientRect();
    const boxes=img.naturalWidth===695?[[184,190,260,295],[216,318,398,475],[220,40,535,145]]:[[100,230,285,445],[164,488,550,812],[970,132,1169,315]];
    const forbidden=boxes.map(b=>({left:r.x+b[0]*r.width/img.naturalWidth,right:r.x+b[2]*r.width/img.naturalWidth,top:r.y+b[1]*r.height/img.naturalHeight,bottom:r.y+b[3]*r.height/img.naturalHeight}));
    for(const el of widget.querySelectorAll('.carrot-button,.doctor-toggle'))forbidden.push(el.getBoundingClientRect());
    const entry=widget.closest('.pig-sticker')?.querySelector('.room-link');if(entry)forbidden.push(entry.getBoundingClientRect());
    return[...layer.querySelectorAll('.pig-flower')].map(f=>{const b=f.getBoundingClientRect();return{petals:f.querySelectorAll('ellipse').length,hidden:f.querySelector('svg').getAttribute('aria-hidden'),pointer:getComputedStyle(f).pointerEvents,overlap:forbidden.some(a=>b.left<a.right&&b.right>a.left&&b.top<a.bottom&&b.bottom>a.top)};});
  });
  ok('flowers '+width+': four rounded petals, hidden from accessibility and click-through',data.length===4&&data.every(f=>f.petals===4&&f.hidden==='true'&&f.pointer==='none'));
  ok('flowers '+width+': do not cover face, ears, tail or controls',data.every(f=>!f.overlap));
};
const noOverflow=async(p,label)=>ok(label+': no page horizontal overflow',await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({executablePath:executable,headless:true});
  try{
    for(const width of[320,375,390,768,1024,1440,1920]){
      const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await context.newPage();watch(p);
      for(const[route,name]of[['/','home'],['/projects/app/','app'],['/projects/eggplant/','eggplant'],['/projects/shanghai-metro-test/','metro'],['/writing/','writing'],['/pigs-room/','room'],['/404.html','404'],[article,'article']]){
        await load(p,route);await noOverflow(p,name+' '+width);
        ok(name+' '+width+': readable footer and auxiliary labels',await p.locator('.site-footer').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=14)&&await p.locator('.eyebrow').evaluateAll(els=>els.every(e=>parseFloat(getComputedStyle(e).fontSize)>=13)));
        const meta=await p.locator('meta[name=viewport]').getAttribute('content');ok(name+' '+width+': user zoom remains enabled',!/(maximum-scale|user-scalable\s*=\s*no)/i.test(meta));
        if(name==='home'){
          const type=await p.evaluate(()=>({nav:parseFloat(getComputedStyle(document.querySelector('.main-nav')).fontSize),subtitle:parseFloat(getComputedStyle(document.querySelector('.about p:last-child')).fontSize),button:parseFloat(getComputedStyle(document.querySelector('.hero-link')).fontSize),bubble:parseFloat(getComputedStyle(document.querySelector('.pig-bubble')).fontSize)}));
          ok('home '+width+': navigation, introduction, link and pig controls enlarged',type.nav>=15&&type.subtitle>=14&&type.button>=14&&type.bubble>=14);
          ok('home '+width+': category descriptions stay deleted',await p.locator('.category-card').count()===4&&await p.locator('.category-card p').count()===0);
          await flowers(p,width);
          ok('header '+width+': brand and controls do not overlap',await p.locator('.brand').evaluate(a=>a.getBoundingClientRect().right<=document.querySelector('.nav-actions').getBoundingClientRect().left+1));
          if(width<=1024){await p.locator('.menu-toggle').click();ok('menu '+width+': large links open without clipping',await p.locator('.main-nav').isVisible()&&await p.locator('.main-nav a').evaluateAll(links=>links.every(a=>parseFloat(getComputedStyle(a).fontSize)>=15&&a.scrollWidth<=a.clientWidth+1)));await p.keyboard.press('Escape');}
        }
        if(name==='room'){
          await ready(p);await switchRole(p);ok('doctor '+width+': supplied original at correct ratio',await p.locator('.pig-art').evaluate(i=>{const r=i.getBoundingClientRect();return i.naturalWidth===695&&i.naturalHeight===859&&Math.abs(r.width/r.height-695/859)<.001;}));
          await pixelCheck(p,'doctor idle '+width,'idle');await flowers(p,'doctor '+width);
          ok('doctor '+width+': stethoscope pressed state reflects doctor',await p.locator('.doctor-toggle').getAttribute('aria-pressed')==='true');
          if(width===1440||width===390)await p.screenshot({path:path.join(output,'doctor-'+width+'.png'),fullPage:true});
          await switchRole(p);ok('normal restored '+width,await role(p)==='normalPig'&&await p.locator('.pig-portrait').count()===1);
        }
        if(name==='article'){
          ok('article '+width+': 17px comfortable body and 15px metadata',await p.locator('.article-body').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)===17)&&await p.locator('.post-heading time').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=14));
          ok('article '+width+': contents and mixed-language text remain functional',await p.locator('.post-toc').isVisible()&&(await p.locator('.article-body').innerText()).includes('中英文混排'));
        }
        if((width===1440||width===390)&&['home','eggplant','room','article','404'].includes(name)){
          if(name==='eggplant')await p.locator('.screenshot-link img').evaluateAll(imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode()})));
          await p.screenshot({path:path.join(output,name+'-'+width+'.png'),fullPage:true});
          if(name==='home')await p.locator('.pig-sticker').screenshot({path:path.join(output,'home-pig-'+width+'.png')});
        }
      }
      await context.close();
    }
    // Controlled animation sampling verifies real local changes, not only state names.
    const p=await browser.newPage({viewport:{width:1440,height:1000}});watch(p);p.__clock=true;
    await p.addInitScript(()=>{Math.random=()=>0});const date=new Date('2026-10-20T12:00:00+08:00');await p.clock.install({time:date});await p.clock.pauseAt(date);
    await load(p,'/pigs-room/');await ready(p);await switchRole(p);
    for(let n=0;n<110&&await state(p)!=='blinking';n++)await p.clock.runFor(40);await p.clock.runFor(40);ok('doctor idle occasionally enters blinking',await state(p)==='blinking');const partial=await pixels(p);ok('doctor blink progressively closes original eyes',partial.eyes.every((e,i)=>e.total<partial.originalEyes[i].total));
    await p.clock.runFor(110);await pixelCheck(p,'doctor blink closed','closed');await p.locator('.pig-widget').screenshot({path:path.join(output,'doctor-blink.png')});
    await p.clock.runFor(300);await pixelCheck(p,'doctor after blink','idle');
    await p.locator('.pig-touch').click();ok('doctor pet creates a real smiling face',await state(p)==='happy'&&(await pixels(p)).changed>1000);await pixelCheck(p,'doctor happy');await p.locator('.pig-widget').screenshot({path:path.join(output,'doctor-happy.png')});await p.clock.runFor(1200);
    await p.locator('.carrot-button').click();ok('doctor feed keeps role-switching disabled during a meal',await p.locator('.doctor-toggle').isDisabled()&&await state(p)==='feeding');
    ok('doctor carrot target is under the original nose',await p.locator('body>.carrot-ghost').evaluate(e=>{const b=document.querySelector('.pig-art').getBoundingClientRect(),f=e.getAnimations()[0].effect.getKeyframes().at(-1),m=new DOMMatrix(f.transform);return Math.abs(m.m41+24-b.x-b.width*310/695)<1&&Math.abs(m.m42+24-b.y-b.height*489/859)<1;}));
    await p.clock.runFor(600);const chewA=await p.locator('.pig-face').evaluate(c=>c.toDataURL());await p.clock.runFor(140);const chewB=await p.locator('.pig-face').evaluate(c=>c.toDataURL());ok('doctor mouth chews locally',chewA!==chewB);await pixelCheck(p,'doctor chewing');await p.clock.runFor(2000);ok('doctor meal counts once and recovers',await count(p)===1&&await state(p)==='idle');
    await p.clock.runFor(45100);await pixelCheck(p,'doctor sleeping','closed');await p.locator('.pig-widget').screenshot({path:path.join(output,'doctor-sleeping.png')});
    await p.locator('.pig-touch').click();await pixelCheck(p,'doctor awake','idle');
    await switchRole(p);ok('return to normal preserves count',await count(p)===1&&await role(p)==='normalPig');await pixelCheck(p,'normal restored after doctor','idle');
    const b=await p.locator('.doctor-toggle').boundingBox();for(let n=0;n<12;n++)await p.mouse.click(b.x+b.width/2,b.y+b.height/2);
    await p.waitForFunction(()=>document.querySelector('[data-pig]').dataset.faceReady==='true');await p.clock.runFor(600);ok('rapid switching leaves one coherent role and timer state',await state(p)==='idle'&&await p.locator('.pig-portrait').count()===1&&await count(p)===1);
    await p.emulateMedia({reducedMotion:'reduce'});ok('reduced motion stops flowers and the body',await p.locator('.pig-flower').evaluateAll(els=>els.every(e=>getComputedStyle(e).animationName==='none'))&&await p.locator('.pig-portrait').evaluate(e=>getComputedStyle(e).animationName==='none'));
    await switchRole(p);ok('reduced-motion role switch has no crossfade animation',await p.locator('.pig-transition-out').count()===0&&await state(p)==='idle');
    await p.locator('.doctor-toggle').focus();await p.keyboard.press('Enter');
    await p.waitForFunction(()=>document.querySelector('[data-pig]').dataset.faceReady==='true'&&document.querySelector('[data-pig]').dataset.character==='doctorPig');await p.clock.runFor(450);
    ok('keyboard Enter activates the stethoscope',await role(p)==='doctorPig'&&await state(p)==='idle');
    for(let n=0;n<5;n++){await p.locator('.pig-touch').click();await p.clock.runFor(100);}
    ok('doctor retains the five-pat hidden special',await state(p)==='special');await pixelCheck(p,'doctor special');await p.locator('.pig-widget').screenshot({path:path.join(output,'doctor-special.png')});await p.clock.runFor(2400);
    const drag=async(x,y)=>{const r=await p.locator('.carrot-button').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.mouse.move(x,y,{steps:8});await p.mouse.up();};
    const target=await p.locator('.pig-art').evaluate(i=>{const r=i.getBoundingClientRect();return{x:r.x+r.width*310/695,y:r.y+r.height*489/859,wrongX:r.x+r.width*.7,wrongY:r.y+r.height*.5}});
    await drag(target.wrongX,target.wrongY);await p.clock.runFor(400);ok('doctor back rejects a dragged carrot',await count(p)===1&&await state(p)==='idle');
    await drag(target.x,target.y);ok('doctor mouth accepts a dragged carrot',await state(p)==='feeding');await p.clock.runFor(2600);ok('doctor drag consumes exactly one carrot',await count(p)===2&&await state(p)==='idle');await p.close();
    const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const m=await mobile.newPage();watch(m);await load(m,'/pigs-room/');await ready(m);await m.locator('.doctor-toggle').tap();await m.waitForFunction(()=>document.querySelector('[data-pig]').dataset.state==='idle'&&document.querySelector('[data-pig]').dataset.character==='doctorPig');await m.locator('.pig-touch').tap();ok('phone: tap pets the actual doctor image',await state(m)==='happy');await m.locator('.carrot-button').tap();await m.waitForFunction(()=>document.querySelector('[data-feed-count]').textContent==='1'&&document.querySelector('[data-pig]').dataset.state==='idle');ok('phone: doctor feeds once',await count(m)===1);await m.locator('.doctor-toggle').tap();await m.waitForFunction(()=>document.querySelector('[data-pig]').dataset.character==='normalPig'&&document.querySelector('[data-pig]').dataset.state==='idle');ok('phone: return to normal retains the count',await count(m)===1);await mobile.close();
    for(const theme of['light','dark']){
      const context=await browser.newContext({viewport:{width:390,height:1000},colorScheme:theme,reducedMotion:'reduce'});const page=await context.newPage();watch(page);
      for(const[route,name]of[['/','home'],['/pigs-room/','room'],[article,'article']]){await load(page,route);if(name==='room')await switchRole(page);await page.screenshot({path:path.join(output,name+'-'+theme+'.png'),fullPage:true});await noOverflow(page,name+' '+theme);}
      await context.close();
    }
    // A browser-managed zoom preference applies true layout zoom: 1440 physical
    // pixels become 720 CSS px and DPR=2. It is NOT a screenshot scale or pinch.
    const profile=fs.mkdtempSync(path.join(os.tmpdir(),'oiia-doctor-zoom-'));
    fs.mkdirSync(path.join(profile,'Default'));fs.writeFileSync(path.join(profile,'Default','Preferences'),JSON.stringify({partition:{default_zoom_level:{x:Math.log(2)/Math.log(1.2)}}}));
    const zoom=await chromium.launchPersistentContext(profile,{headless:true,executablePath:executable,viewport:null,args:['--window-size=1440,1000'],reducedMotion:'reduce'});
    try{const z=zoom.pages()[0];watch(z);for(const[route,name]of[['/','home'],['/projects/eggplant/','eggplant'],['/pigs-room/','room'],[article,'article']]){
      await load(z,route);ok(name+' at native 200%: real browser zoom confirmed',await z.evaluate(()=>innerWidth===720&&outerWidth===1440&&devicePixelRatio===2&&visualViewport.scale===1));await noOverflow(z,name+' at native 200%');
      if(name==='home'){await z.locator('.menu-toggle').click();ok('native 200% menu remains usable',await z.locator('.main-nav').isVisible());await z.keyboard.press('Escape');}
      if(name==='room'){await switchRole(z);await z.locator('.pig-touch').click();ok('native 200% doctor can be petted',await state(z)==='happy');}
      await z.evaluate(()=>scrollTo(0,0));await z.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      // Playwright's explicit CSS-sized clip is incorrect under native browser
      // zoom. Capture the actual compositor surface with no clip instead.
      const cdp=await zoom.newCDPSession(z);
      const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
      fs.writeFileSync(path.join(output,name+'-zoom-200.png'),Buffer.from(shot.data,'base64'));
      if(name==='room'){
        await z.locator('.doctor-toggle').scrollIntoViewIfNeeded();
        const detail=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});
        fs.writeFileSync(path.join(output,'doctor-zoom-200.png'),Buffer.from(detail.data,'base64'));
      }
      await cdp.detach();
    }}finally{await zoom.close();fs.rmSync(profile,{recursive:true,force:true});}
    // Font-only enlargement is an additional reflow check, not a substitute for zoom.
    const text=await browser.newPage({viewport:{width:390,height:950},reducedMotion:'reduce'});watch(text);
    for(const route of['/','/projects/eggplant/','/pigs-room/',article]){await load(text,route);await text.evaluate(()=>document.documentElement.style.fontSize='200%');await noOverflow(text,'200% text '+route);}
    ok('no browser script, asset or console errors',errors.length===0);
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({checks:results.length,results,errors,pixelEvidence},null,2));console.log('TOTAL',results.length,'checks passed');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
