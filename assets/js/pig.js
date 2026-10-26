/* The immutable PNG supplies every body pixel. The canvas replaces only two
   eye rectangles and a small mouth area, in the PNG's 1216 × 1181 coordinates. */
(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const STORAGE = 'oiia-carrots';
  let count = 0;
  try { const n = Number(sessionStorage.getItem(STORAGE)); if (Number.isSafeInteger(n) && n > 0) count = n; } catch (_) {}
  const counts = document.querySelectorAll('[data-feed-count]');
  const renderCount = () => counts.forEach(el => { el.textContent = String(count); });
  renderCount();

  document.querySelectorAll('[data-pig]').forEach(widget => {
    const pet = widget.querySelector('.pig-touch');
    const carrot = widget.querySelector('.carrot-button');
    const bubble = widget.querySelector('.pig-bubble');
    const img = pet.querySelector('.pig-art');
    const canvas = pet.querySelector('.pig-face');
    const ctx = canvas.getContext('2d');
    const portrait = pet.querySelector('.pig-portrait');
    const doctorButton = widget.querySelector('.doctor-toggle');
    const characters = {
      normalPig: {
        src: img.src, width: 1216, height: 1181, ink: [217,548],
        eyes: [{x:164,y:488,w:106,h:119,cx:217,cy:548}, {x:449,y:546,w:102,h:117,cx:500,cy:605}],
        sleeping: [-30,-6,0,18,30,-1,10], happy: [-29,8,-2,-25,29,4,12],
        mouth: {x:355,y:836,rx:20,ry:21,chew:17,scale:1,smile:[329,829,354,853,381,831,8],special:[329,829,354,859,381,831,8]}
      },
      doctorPig: {
        src: doctorButton?.dataset.doctorSrc, width:695, height:859, ink:[235,343],
        eyes: [
          {x:216,y:318,w:44,h:52,cx:236,cy:344,skinPoints:[[221,315],[257,315],[239,370]],protected:(x,y)=>(x<=218&&y>=342)||(x>=257&&y>=354)},
          {x:350,y:344,w:48,h:56,cx:374,cy:373,skinPoints:[[352,342],[398,342],[375,400]]}
        ],
        sleeping: [-15,-3,0,10,15,-1,6], happy: [-15,4,0,-13,15,3,6],
        mouth:{x:310,y:489,rx:9,ry:9,chew:8,scale:.45,smile:[298,486,310,499,324,488,4],special:[298,486,310,502,324,488,4]}
      }
    };
    let character = characters.normalPig;
    let eyes = character.eyes.map(eye => ({...eye}));
    let mouth = {x:character.mouth.x/character.width,y:character.mouth.y/character.height};
    let transitionGhost = null, generation = 0;
    widget.dataset.character = 'normalPig';
    let ink, faceReady = false;
    let state = 'idle', phase = '', sleepTimer, actionTimer, blinkTimer, suppressTimer, frame;
    let drag = null, ghost = null, suppressClick = false, pets = [], flight = null;
    const sleepAfter = Number(widget.dataset.sleepAfter) || 45000;
    const say = text => { bubble.textContent = text; };
    const busy = () => ['feeding','special','transforming'].includes(state);
    const stopFrame = () => { cancelAnimationFrame(frame); frame = null; };
    const curve = (x1, y1, cx, cy, x2, y2, width = 12) => {
      ctx.strokeStyle = ink; ctx.lineWidth = width; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(cx, cy, x2, y2); ctx.stroke();
    };
    const face = (expression, openness = 0) => {
      if (!faceReady) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.dataset.expression = expression;
      if (expression === 'idle') return; // Transparent canvas: exactly the original PNG.
      if (expression !== 'open') {
        eyes.forEach(eye => {
          // Repair the old eyes BEFORE drawing the new ones. Skin colors come
          // from the browser-decoded PNG, retaining its Display P3 appearance.
          ctx.putImageData(eye.skin, eye.x, eye.y);
          if (expression === 'blink' && openness > .12) {
            if (eye.sprite) ctx.drawImage(eye.sprite, eye.x, eye.y + eye.h * (1-openness)/2, eye.w, eye.h*openness);
            else ctx.drawImage(img, eye.x, eye.y, eye.w, eye.h, eye.x, eye.y + eye.h*(1-openness)/2, eye.w, eye.h*openness);
          } else if (expression === 'sleeping' || expression === 'blink') {
            const c = character.sleeping; curve(eye.cx+c[0],eye.cy+c[1],eye.cx+c[2],eye.cy+c[3],eye.cx+c[4],eye.cy+c[5],c[6]);
          } else {
            const c = character.happy; curve(eye.cx+c[0],eye.cy+c[1],eye.cx+c[2],eye.cy+c[3],eye.cx+c[4],eye.cy+c[5],c[6]);
          }
        });
      }
      if (expression === 'happy' || expression === 'special') {
        curve(...(expression === 'special' ? character.mouth.special : character.mouth.smile));
      } else if (expression === 'open' || expression === 'chewing') {
        ctx.fillStyle = ink;
        const m = character.mouth;
        ctx.beginPath(); ctx.ellipse(m.x,m.y,expression === 'open' ? m.rx : m.chew,expression === 'open' ? m.ry : openness*m.scale,-.12,0,Math.PI*2); ctx.fill();
      }
    };
    const prepareFace = () => {
      widget.dataset.ready = img.naturalWidth ? 'true' : 'error';
      if (!img.naturalWidth || !ctx) return;
      canvas.width = character.width; canvas.height = character.height;
      const source = document.createElement('canvas'); source.width = img.naturalWidth; source.height = img.naturalHeight;
      const original = source.getContext('2d', {willReadFrequently: true});
      original.drawImage(img, 0, 0);
      const black = original.getImageData(...character.ink, 1, 1).data;
      ink = `rgb(${black[0]}, ${black[1]}, ${black[2]})`;
      eyes.forEach(eye => {
        const pixels = original.getImageData(eye.x, eye.y, eye.w, eye.h);
        const saved = new Uint8ClampedArray(pixels.data);
        const samples = eye.skinPoints?.map(([x,y]) => original.getImageData(x,y,1,1).data);
        const sprite = samples ? document.createElement('canvas') : null;
        if (sprite) { sprite.width=eye.w; sprite.height=eye.h; }
        const spritePixels = sprite?.getContext('2d').createImageData(eye.w,eye.h);
        // Interpolate intact skin at the left/right edges of each scanline.
        // Blend only over eye-colored pixels; preserve the original skin rim.
        for (let y = 0; y < eye.h; y += 1) {
          for (let x = 0; x < eye.w; x += 1) {
            const p = (y * eye.w + x) * 4;
            const left = y * eye.w * 4, right = left + (eye.w - 1) * 4;
            const t = x / (eye.w - 1);
            const skin = [0,1,2].map(c => samples
              ? (samples[0][c]*(1-t)+samples[1][c]*t)*(1-y/eye.h)+samples[2][c]*y/eye.h
              : saved[left+c]*(1-t)+saved[right+c]*t);
            const contrast = Math.max(...skin.map((v, c) => Math.abs(v - saved[p + c])));
            const protectedPixel = eye.protected?.(eye.x+x,eye.y+y);
            if (contrast>8 && !protectedPixel) {
              for (let c=0;c<3;c++) pixels.data[p+c]=Math.round(skin[c]);
              if (spritePixels) for (let c=0;c<4;c++) spritePixels.data[p+c]=saved[p+c];
            }
          }
        }
        eye.skin = pixels;
        if (sprite) { sprite.getContext('2d').putImageData(spritePixels,0,0); eye.sprite=sprite; }
      });
      faceReady = true; widget.dataset.faceReady = 'true';
      face(state === 'sleeping' ? 'sleeping' : state === 'happy' || state === 'special' ? state : 'idle');
    };
    const setState = (next, nextPhase = '') => {
      clearTimeout(blinkTimer); stopFrame();
      state = next; phase = nextPhase;
      widget.dataset.state = next; widget.dataset.phase = nextPhase;
      if (doctorButton) doctorButton.disabled = next === 'feeding' || next === 'transforming';
      face(next === 'feeding' ? nextPhase === 'opening' ? 'open' : 'happy' : next === 'blinking' || next === 'transforming' ? 'idle' : next);
    };
    const scheduleBlink = () => {
      clearTimeout(blinkTimer);
      if (reducedMotion.matches || document.hidden) return;
      blinkTimer = setTimeout(() => {
        if (state !== 'idle' || drag || !faceReady) return;
        setState('blinking');
        let started;
        const blink = now => {
          if (started === undefined) started = now;
          const elapsed = now - started;
          // Close for 110 ms, stay closed for 85 ms, reopen for 140 ms.
          const open = elapsed < 110 ? 1 - elapsed / 110 : elapsed < 195 ? 0 : Math.min(1, (elapsed - 195) / 140);
          face('blink', open * open * (3 - 2 * open));
          if (elapsed < 335) frame = requestAnimationFrame(blink);
          else { setState('idle'); scheduleBlink(); }
        };
        frame = requestAnimationFrame(blink);
      }, 3600 + Math.random() * 4600);
    };
    const sleepLater = () => {
      clearTimeout(sleepTimer);
      sleepTimer = setTimeout(() => {
        if (!busy() && !drag) { setState('sleeping'); say('Zzz'); }
        else sleepLater();
      }, sleepAfter);
    };
    const idle = () => { setState('idle'); carrot.disabled = false; say(''); sleepLater(); scheduleBlink(); };
    const later = (fn, ms) => { clearTimeout(actionTimer); actionTimer = setTimeout(fn, ms); };
    if (widget.hasAttribute('data-pig-static')) {
      const sleepingPortrait = () => { prepareFace(); setState('sleeping'); };
      if (img.complete) sleepingPortrait();
      else img.addEventListener('load', sleepingPortrait, {once: true});
      return;
    }
    pet.addEventListener('click', () => {
      if (busy() || drag) return;
      clearTimeout(actionTimer); sleepLater();
      if (state === 'sleeping') { idle(); say('Awake!'); return; }
      const now = Date.now();
      pets = pets.filter(time => now - time < 4000); pets.push(now);
      if (pets.length >= 5) {
        pets = []; setState('special'); say('Secret unlocked!'); carrot.disabled = true;
        later(idle, 2300);
      } else {
        setState('idle'); void widget.offsetWidth; setState('happy');
        const words = ['That tickles!', 'Thanks for the pats!', 'More pats?', 'Hi!'];
        say(words[Math.floor(Math.random() * words.length)]);
        later(idle, 1100);
      }
    });
    const flyCarrot = dropPoint => {
      const source = carrot.querySelector('img');
      const from = source.getBoundingClientRect(), to = img.getBoundingClientRect();
      flight = source.cloneNode(); flight.alt = ''; flight.className = 'carrot-ghost';
      flight.setAttribute('aria-hidden', 'true'); document.body.append(flight);
      const startPoint = dropPoint || {x: from.left + from.width / 2, y: from.top + from.height / 2};
      const startScale = dropPoint ? 1 : from.width / 48;
      const start = `translate(${startPoint.x - 24}px, ${startPoint.y - 24}px) scale(${startScale})`;
      const end = `translate(${to.left + to.width * mouth.x - 24}px, ${to.top + to.height * mouth.y - 24}px) scale(.06) rotate(-15deg)`;
      flight.style.transform = start;
      if (flight.animate && !reducedMotion.matches) {
        flight.animate([{transform: start, opacity: 1}, {transform: end, opacity: 0}], {duration: 420, easing: 'ease-in', fill: 'forwards'});
      } else { flight.style.transform = end; flight.style.opacity = '0'; }
    };
    const clearFlight = () => { if (flight) flight.remove(); flight = null; };
    const chew = () => {
      let started;
      const tick = now => {
        if (started === undefined) started = now;
        const elapsed = now - started;
        // Three small local mouth movements, with the same happy eyes.
        const opening = 4 + 12 * (.5 + .5 * Math.cos(elapsed / 300 * Math.PI * 2));
        face('chewing', reducedMotion.matches ? 9 : opening);
        if (elapsed < 900 && state === 'feeding' && phase === 'chewing') frame = requestAnimationFrame(tick);
      };
      if (reducedMotion.matches) face('chewing', 9);
      else frame = requestAnimationFrame(tick);
    };
    const feed = dropPoint => {
      if (busy()) return;
      clearTimeout(sleepTimer); clearTimeout(actionTimer); pets = [];
      setState('feeding', 'opening'); flyCarrot(dropPoint); say('Ahh...'); carrot.disabled = true;
      later(() => {
        clearFlight(); count += 1;
        try { sessionStorage.setItem(STORAGE, String(count)); } catch (_) {}
        renderCount(); setState('feeding', 'chewing'); chew(); say('Crunch, crunch.');
        later(() => { setState('feeding', 'satisfied'); say('Thanks for the carrot!'); later(idle, 950); }, 950);
      }, 450);
    };
    carrot.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); return; } feed(); });
    const overMouth = (x, y) => {
      const box = img.getBoundingClientRect();
      const mx = box.left + box.width * mouth.x, my = box.top + box.height * mouth.y;
      return Math.abs(x - mx) <= Math.max(14, box.width * .075) && Math.abs(y - my) <= Math.max(14, box.height * .065);
    };
    const cleanupDrag = () => {
      if (ghost) ghost.remove(); ghost = null;
      widget.classList.remove('drop-ready'); carrot.classList.remove('is-dragging'); drag = null;
    };
    carrot.addEventListener('pointerdown', event => {
      if (busy() || event.button !== 0 || drag) return;
      clearTimeout(actionTimer); setState('idle');
      drag = {id: event.pointerId, x: event.clientX, y: event.clientY, moved: false};
      carrot.setPointerCapture(event.pointerId); sleepLater();
    });
    carrot.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8) {
        drag.moved = true; ghost = carrot.querySelector('img').cloneNode(); ghost.className = 'carrot-ghost'; ghost.alt = ''; ghost.setAttribute('aria-hidden', 'true'); document.body.append(ghost); carrot.classList.add('is-dragging');
      }
      if (!drag.moved) return;
      event.preventDefault();
      ghost.style.transform = `translate(${event.clientX - 24}px, ${event.clientY - 24}px)`;
      const ready = overMouth(event.clientX, event.clientY);
      widget.classList.toggle('drop-ready', ready);
      face(ready ? 'open' : 'idle'); say(ready ? 'Ahh...' : 'Drag to my mouth.');
    });
    const suppressNextClick = () => {
      suppressClick = true; clearTimeout(suppressTimer);
      suppressTimer = setTimeout(() => { suppressClick = false; }, 350);
    };
    carrot.addEventListener('pointerup', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const moved = drag.moved, success = moved && overMouth(event.clientX, event.clientY);
      cleanupDrag();
      if (moved) {
        suppressNextClick(); setState('idle');
        if (success) feed({x: event.clientX, y: event.clientY});
        else { idle(); say('Drop the carrot near my mouth.'); }
      } else { idle(); }
    });
    const cancel = () => {
      if (drag) { suppressNextClick(); cleanupDrag(); idle(); }
    };
    const clearTransition = () => {
      if (transitionGhost) transitionGhost.remove(); transitionGhost=null;
      portrait.style.opacity='';
      portrait.getAnimations().forEach(animation => { if (animation.id === 'character-fade') animation.cancel(); });
    };
    if (doctorButton) doctorButton.addEventListener('click', async () => {
      if (state === 'feeding' || state === 'transforming' || drag) return;
      clearTimeout(sleepTimer); clearTimeout(actionTimer); pets=[];
      setState('transforming');
      const ticket=++generation, previous=character;
      const nextName=widget.dataset.character === 'doctorPig' ? 'normalPig' : 'doctorPig';
      const next=characters[nextName];
      try {
        const preload=new Image(); preload.src=next.src; await preload.decode();
        if (ticket!==generation) return;
        clearTransition();
        transitionGhost=portrait.cloneNode(true);
        transitionGhost.classList.add('pig-transition-out');
        transitionGhost.setAttribute('aria-hidden','true');
        transitionGhost.querySelector('img').alt='';
        pet.append(transitionGhost);
        portrait.style.opacity='0';
        character=next; eyes=character.eyes.map(eye=>({...eye}));
        mouth={x:character.mouth.x/character.width,y:character.mouth.y/character.height};
        faceReady=false; widget.dataset.faceReady='false';
        widget.dataset.character=nextName; portrait.dataset.character=nextName;
        img.width=character.width; img.height=character.height; img.src=character.src;
        img.alt=nextName==='doctorPig' ? 'The original doctor pig illustration' : 'The original pig illustration';
        await img.decode();
        if (ticket!==generation) return;
        prepareFace(); portrait.style.opacity='';
        doctorButton.setAttribute('aria-pressed',String(nextName==='doctorPig'));
        doctorButton.setAttribute('aria-label',nextName==='doctorPig'?'Switch to normal pig':'Switch to doctor pig');
        doctorButton.querySelector('span').textContent=nextName==='doctorPig'?'Normal pig':'Doctor pig';
        say(nextName==='doctorPig'?'Hello!':'Hi!');
        if (!reducedMotion.matches) {
          const fade=portrait.animate([{opacity:0},{opacity:1}],{duration:280,easing:'ease-out'}); fade.id='character-fade';
          transitionGhost.animate([{opacity:1},{opacity:0}],{duration:260,fill:'forwards'});
        }
        later(()=>{clearTransition();idle();},reducedMotion.matches?0:320);
      } catch (_) {
        clearTransition(); character=previous; eyes=character.eyes.map(eye=>({...eye}));
        const previousName=previous===characters.normalPig?'normalPig':'doctorPig';
        mouth={x:character.mouth.x/character.width,y:character.mouth.y/character.height};
        widget.dataset.character=previousName; portrait.dataset.character=previousName;
        img.width=character.width; img.height=character.height; img.src=character.src;
        await img.decode().catch(()=>{}); prepareFace(); idle(); say('Image unavailable. Try again.');
      }
    });
    carrot.addEventListener('pointercancel', cancel);
    carrot.addEventListener('lostpointercapture', cancel);
    if (img.complete) prepareFace();
    else { img.addEventListener('load', prepareFace, {once: true}); img.addEventListener('error', prepareFace, {once: true}); }
    sleepLater(); scheduleBlink();
    reducedMotion.addEventListener('change', () => {
      if (state === 'blinking') setState('idle');
      if (state === 'idle') scheduleBlink();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { clearTimeout(blinkTimer); if (state === 'blinking') setState('idle'); }
      else if (state === 'idle') scheduleBlink();
    });
    addEventListener('pagehide', () => {
      clearTimeout(sleepTimer); clearTimeout(actionTimer); clearTimeout(blinkTimer); clearTimeout(suppressTimer);
      generation++; stopFrame(); cleanupDrag(); clearFlight(); clearTransition();
    });
    addEventListener('pageshow', event => { if (event.persisted) { suppressClick = false; clearTransition(); prepareFace(); idle(); } });
  });
})();
