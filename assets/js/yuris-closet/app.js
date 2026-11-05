/* yuri的衣橱 / original, offline, layer-based dress-up game */
(()=>{
 'use strict';
 const W=1024,H=1536,STORAGE='yuris-closet-v4';
 const DEFAULT={hair:0,top:0,bottom:0,socks:0,shoes:0,hat:0,accessory:0,scene:0,suit:null,name:'Yuri · 暮色便服'};
 const SCENES=[
  ['奶油摄影棚','STUDIO','#f1ebe4'],['黄昏车站','PLATFORM','#c7a5a9'],['幼儿园教室','CLASSROOM','#e5bf78'],
  ['事务所走廊','OFFICE','#a0a3ad'],['午后小花园','GARDEN','#b7cbb0'],['像素棋盘','CHECKER','#dbd6cf'],
  ['月色窗边','MOONLIGHT','#65617e'],['粉灰卧室','BEDROOM','#d5b7b9']
 ];
 const P=[
  {name:'原作 · 初始立绘',tag:'ORIGINAL ART',hue:'#a53f56',desc:'黑红调查制服 · 蓝色腿环 · 红色武器',look:{hair:0,top:1,bottom:1,socks:0,shoes:0,hat:0,accessory:1,scene:0}},
  {name:'幼儿园围裙',tag:'KINDERGARTEN',hue:'#e2bb59',desc:'黄色小围裙 · 小企鹅 · 花朵',look:{hair:0,top:2,bottom:1,socks:0,shoes:0,hat:0,accessory:0,scene:2}},
  {name:'黑帽学院装',tag:'BLACK HAT',hue:'#493e49',desc:'黑色小礼帽 · 红色领结 · 百褶裙',look:{hair:0,top:3,bottom:2,socks:3,shoes:3,hat:1,accessory:1,scene:0}},
  {name:'秋日双马尾',tag:'AUTUMN',hue:'#9c5968',desc:'双马尾 · 薄荷毛衣 · 红格裙',look:{hair:2,top:4,bottom:11,socks:3,shoes:3,hat:2,accessory:0,scene:4}},
  {name:'轻松休息日',tag:'DAY OFF',hue:'#9d87a5',desc:'半扎发 · 宽松卫衣 · 牛仔短裤',look:{hair:5,top:9,bottom:6,socks:1,shoes:6,hat:0,accessory:3,scene:7}},
  {name:'雨后花园',tag:'GARDEN DAY',hue:'#869f8b',desc:'双麻花辫 · 焦糖针织 · 长裙',look:{hair:3,top:7,bottom:5,socks:1,shoes:1,hat:4,accessory:0,scene:4}}
 ];
 const categories={
  preset:{title:'SIGNATURE LOOKS / 完整套装',hint:'保留原作、幼儿园、黑帽三套重要造型',items:P.map(x=>[x.name,x.tag,x.hue])},
  hair:{title:'HAIRSTYLES / 发型',hint:'熟悉的刘海与神态，十种发型自由换',items:[
    ['自然披发','ORIGINAL','#b43954'],['高马尾','HIGH PONY','#c14b62'],['双马尾','TWIN TAILS','#aa4b65'],
    ['双麻花辫','TWIN BRAIDS','#b64d61'],['侧麻花辫','SIDE BRAID','#bd5168'],['半扎发','HALF-UP','#bd465f'],
    ['齐肩短发','SHORT BOB','#b94356'],['双丸子头','DOUBLE BUNS','#ba4461'],['侧低马尾','LOW SIDE PONY','#9a3650'],['柔顺长发','SLEEK LONG','#b84157']]},
  top:{title:'TOPS / 上衣',hint:'不同领口、袖子与印花细节',items:[
    ['暮色便服','ORIGINAL','#3e3944'],['原作调查制服','UNIFORM','#44343e'],['幼儿园围裙','KINDERGARTEN','#ecc64b'],
    ['黑帽学院风','SCHOOL','#33313e'],['薄荷针织衫','KNIT','#799486'],['蔷薇衬衫','BLOUSE','#c991a5'],
    ['海军水手服','SAILOR','#516e8a'],['焦糖针织','CARDIGAN','#af8769'],['午夜机车夹克','LEATHER','#4d4e5b'],
    ['葡萄卫衣','HOODIE','#8c7a9e'],['森林工装','UTILITY','#78896e'],['白色医生外套','WHITE COAT','#e6e1da'],
    ['蝴蝶结针织','RIBBON','#ccb9b5'],['红格短外套','CHECKED','#a96471'],['露营 T 恤','CAMPING','#ddc9b5'],
    ['深红高领','TURTLENECK','#8e4b5c'],['复古女仆衫','MAID','#6e5d6b'],['柠檬围裙','LEMON','#f4d36f']]},
  bottom:{title:'BOTTOMS / 下装',hint:'短裤、长裤、裙装真正切换轮廓',items:[
    ['炭黑短裤','SHORTS','#45404a'],['原作黑长裤','ORIGINAL','#35313d'],['黑色百褶裙','PLEATED','#4f4a56'],
    ['酒红百褶裙','WINE','#864756'],['海蓝百褶裙','NAVY','#4d6780'],['白色长裙','LONG SKIRT','#e8dcd3'],
    ['蓝灰牛仔短裤','DENIM','#7790a3'],['棕色短裙','BROWN','#997866'],['森林工装长裤','UTILITY','#6e7c70'],
    ['黑色连裤袜','TIGHTS','#5c515e'],['浅粉荷叶裙','RUFFLE','#dfb3c2'],['红格纹裙','TARTAN','#aa6570'],
    ['奶油阔腿裤','WIDE LEG','#d0bda7'],['灰色制服裙','SCHOOL','#898999'],['学院格裙','ACADEMY','#7e9177']]},
  socks:{title:'SOCKS / 袜子',hint:'袜子会被长裤自然遮住',items:[
    ['自然裸腿','NONE','#f3c9bb'],['白短袜','WHITE','#e7dcd5'],['黑色过膝袜','KNEE HIGH','#544b57'],
    ['奶白长袜','IVORY','#f2e9db'],['灰色连裤袜','TIGHTS','#706c7a'],['黑红条纹袜','STRIPED','#8c5b6a']]},
  shoes:{title:'SHOES / 鞋子',hint:'靴子、皮鞋、运动鞋轮廓各不相同',items:[
    ['黑色厚底靴','ORIGINAL','#473e48'],['棕皮马丁靴','LEATHER','#816353'],['奶白厚底靴','IVORY','#d0c2b4'],
    ['黑色玛丽珍','MARY JANE','#4c3d4b'],['酒红小皮鞋','BERRY','#946071'],['海军运动鞋','SNEAKERS','#70859f'],
    ['帆布鞋','CANVAS','#d3beb0'],['长筒靴','TALL BOOTS','#614653'],['羊皮绒靴','SHEARLING','#b69c86']]},
  hat:{title:'HEADWEAR / 帽饰',hint:'宽檐黑帽可独立穿戴或摘下',items:[
    ['不戴帽子','NO HAT','#d7c4c1'],['小黑帽','BLACK HAT','#3d343f'],['红丝带发箍','HEADBAND','#be6378'],
    ['深灰贝雷帽','BERET','#6b6370'],['草编小帽','STRAW','#cfb58c'],['黑色蝴蝶结','BOW','#4a414e'],
    ['蓝色棒球帽','CAP','#6e86a2'],['白色蕾丝发带','LACE','#e8d5d5']]},
  accessory:{title:'ACCESSORIES / 配饰',hint:'剑、胸针、包包等小物件',items:[
    ['无配饰','NONE','#e0d6cc'],['红色武器','SWORD','#c43a53'],['奶油蝴蝶结','BOW','#e8b4b8'],
    ['棕色邮差包','BAG','#95725b'],['米色围巾','SCARF','#c9ac9e'],['金色小胸针','BROOCH','#c6aa6c'],
    ['草莓发夹','CLIP','#e78b9e'],['小花胸章','FLOWER','#e0b568'],['随身速写本','SKETCH','#cbc4b0'],
    ['黑色手套','GLOVES','#59515a'],['彩色书包','BACKPACK','#b2657a'],['白色画笔','PAINT','#d0c8bc']]},
  scene:{title:'BACKGROUNDS / 场景',hint:'八种不同的像素房间和风景',items:SCENES}
 };
 const keys=Object.keys(categories).filter(k=>k!=='preset');
 const by=id=>document.getElementById(id);
 const E={stage:by('stage'),grid:by('itemsGrid'),tabs:by('tabs'),heading:by('categoryHeading'),hint:by('categoryHint'),count:by('choiceCount'),name:by('lookName'),lookTitle:by('lookNameDisplay'),saved:by('savedGrid'),savedCount:by('savedCount'),toast:by('toast'),file:by('customFile'),filename:by('customName'),clear:by('clearCustom')};
 let previewMode='master';
 let active='preset',state={...DEFAULT},saved=[],pics={},custom=null,customPose=null,customHeadOnly=false,customLabel='',toastTimer=null;
 function clean(x){const next={...DEFAULT};for(const k of keys){const v=Number(x?.[k]);if(Number.isInteger(v)&&v>=0&&v<categories[k].items.length)next[k]=v;}if(typeof x?.name==='string'&&x.name.trim())next.name=x.name.slice(0,30);next.view=['original','master','dressup'].includes(x?.view)?x.view:'dressup';if(Number.isInteger(x?.suit)&&P[x.suit]&&['top','bottom','socks','shoes','accessory'].every(k=>next[k]===P[x.suit].look[k]))next.suit=x.suit;return next;}
 try{const old=JSON.parse(localStorage.getItem(STORAGE)||localStorage.getItem('yuris-closet-v3')||'{}');if(old.state){state=clean(old.state);previewMode=state.view;}if(Array.isArray(old.saved))saved=old.saved.map(clean).slice(0,12);}catch(_){}
 function persist(){try{state.view=previewMode;localStorage.setItem(STORAGE,JSON.stringify({state,saved}));}catch(_){}}
 function notice(msg){E.toast.textContent=msg;E.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>E.toast.classList.remove('show'),2350);}
 function block(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
 function sceneryLow(c,id){
  const W=256,H=384;
  if(id===0){block(c,0,0,W,H,'#f4efe8');block(c,0,339,256,45,'#eae3dc');for(let x=12;x<256;x+=29)block(c,x,346,14,1,'#ddd1c8');for(const [x,y] of [[30,32],[43,32],[222,40],[235,53],[24,295]])block(c,x,y,3,3,'#e0c9ca');}
  else if(id===1){block(c,0,0,W,H,'#d4b3b3');block(c,0,150,W,144,'#be9ea9');block(c,0,294,W,90,'#686674');block(c,0,297,W,7,'#f0d1ba');block(c,14,106,7,183,'#8b8190');block(c,224,106,7,183,'#8b8190');block(c,14,109,217,7,'#8b8190');block(c,40,135,96,10,'#968996');block(c,46,146,21,14,'#e4cec7');block(c,202,40,22,12,'#f5d3a7');for(let x=5;x<252;x+=40)block(c,x,354,25,2,'#8b818b');}
  else if(id===2){block(c,0,0,W,H,'#e6d8ba');block(c,0,292,256,92,'#bca782');block(c,0,299,256,5,'#806b6c');block(c,16,47,90,105,'#ac9e82');block(c,22,52,78,94,'#eaf0d7');block(c,36,75,24,25,'#eab7ab');block(c,67,82,21,19,'#d5bd85');block(c,38,114,47,7,'#abc6b4');block(c,175,54,61,83,'#c99487');block(c,180,59,51,73,'#f0dcc5');block(c,180,90,50,3,'#d1b49e');block(c,205,58,3,73,'#d1b49e');block(c,9,219,80,20,'#ad947b');block(c,16,238,68,54,'#d3bca0');for(let x=15;x<254;x+=31)block(c,x,339,19,2,'#ae9a7e');}
  else if(id===3){block(c,0,0,W,H,'#acacb6');block(c,0,305,W,79,'#74737d');block(c,15,41,102,263,'#6e6b79');block(c,20,46,92,253,'#9a97a1');block(c,122,41,119,263,'#66616e');block(c,128,47,107,251,'#a6a1a5');block(c,182,48,5,249,'#6e6773');block(c,201,170,8,5,'#dbccbc');block(c,0,303,W,7,'#4c4957');for(let x=4;x<250;x+=43)block(c,x,355,26,2,'#8c8a95');}
  else if(id===4){block(c,0,0,W,H,'#dce7d6');block(c,0,301,W,83,'#afbea1');block(c,0,304,W,2,'#839f88');block(c,10,70,62,153,'#a5bba3');block(c,25,55,48,129,'#bdd3b3');block(c,52,65,15,215,'#8fa88e');block(c,181,92,74,141,'#91ab95');block(c,186,73,44,112,'#b1cdb1');for(let i=0;i<15;i++){const x=12+(i*37)%238;const y=308+(i*23)%58;block(c,x,y,12,2,'#8eaf8e');if(i%3===0)block(c,x+3,y-5,4,4,'#e9b9b5');}}
  else if(id===5){block(c,0,0,W,H,'#eee9e1');for(let y=0;y<H;y+=16)for(let x=0;x<W;x+=16)if(((x+y)/16)%2===0)block(c,x,y,16,16,'#dcd7d1');}
  else if(id===6){block(c,0,0,W,H,'#343e5a');block(c,0,308,W,76,'#26314c');block(c,18,28,218,276,'#77809a');block(c,23,33,208,264,'#37445f');block(c,119,30,5,269,'#69758f');block(c,25,171,207,5,'#68718d');block(c,181,54,35,34,'#f1d8be');block(c,184,50,12,15,'#37445f');for(let i=0;i<25;i++){const x=29+(i*39)%192,y=43+(i*61)%226;block(c,x,y,i%3?2:3,2,'#b9c2d5');}}
  else{block(c,0,0,W,H,'#e5d4d1');block(c,0,291,W,93,'#a58e98');block(c,0,294,W,5,'#816e80');block(c,171,38,65,97,'#9a929f');block(c,176,43,55,87,'#f1dedd');block(c,201,44,4,87,'#b7a4ac');block(c,178,88,52,4,'#b7a4ac');block(c,0,247,93,47,'#a48d9b');block(c,8,230,79,53,'#cdb4b6');block(c,9,236,71,22,'#ead5d0');block(c,19,206,31,28,'#ab949b');for(let x=4;x<256;x+=36)block(c,x,343,24,2,'#b9a0a9');}
  if(id!==5){const shadow=id===6?'#1f2b47':id===1?'#514858':'#c4b8af';block(c,88,370,104,2,shadow);block(c,96,372,88,1,shadow);}
 }
 function scenery(c,id){c.save();c.scale(4,4);sceneryLow(c,id);c.restore();}
 const KEY={hair:'hair',top:'top',bottom:'bottom',socks:'socks',shoes:'shoes',hat:'hat',accessory:'accessory'};
 const native=window.YURI_NATIVE;
 function poseSignature(look){const p=window.YURI_POSES.resolve(look);return [p.full||'',p.upper,p.lower].join('/');}
 function customCompatible(look){return !custom||customHeadOnly||customPose===poseSignature(look);}
 function layer(c,key){const item=native.layers[key],im=pics[key];if(item&&im)c.drawImage(im,...item.origin);}
 function contour(c,points){c.moveTo(...points[0]);for(const xy of points.slice(1))c.lineTo(...xy);c.closePath();}
 function paintedPart(c,cmd){
  c.save();try{
  if(cmd.only){c.beginPath();contour(c,cmd.only);c.clip();}
  if(cmd.onlyRegions?.length){c.beginPath();for(const points of cmd.onlyRegions)contour(c,points);c.clip();}
  if(cmd.omit?.length){c.beginPath();c.rect(0,0,W,H);for(const points of cmd.omit)contour(c,points);c.clip('evenodd');}
  layer(c,cmd.key);
  }finally{c.restore();}
 }
 function draw(c,look,includeBackground=true,includeCustom=true,mode='dressup'){
  c.save();try{
  c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.filter='none';c.imageSmoothingEnabled=false;c.clearRect(0,0,W,H);
  if(mode!=='dressup'){layer(c,mode==='original'?'master_original':'master_formal');return;}
  if(includeBackground)scenery(c,look.scene);
  for(const cmd of window.YURI_POSES.commands(look).commands)paintedPart(c,cmd);
  if(includeCustom&&custom&&customCompatible(look))c.drawImage(custom,0,0);
  }finally{c.restore();}
 }
 function setPreview(mode){previewMode=mode;render();persist();}
 function render(){
  draw(E.stage.getContext('2d'),state,true,true,previewMode);
  const dress=previewMode==='dressup';document.documentElement.classList.toggle('native-dressup',dress);
  const master=by('masterImage');master.hidden=dress;master.src=window.PIXEL_ASSETS[previewMode==='original'?'master_original':'master_formal'];
  for(const [id,mode] of [['viewOriginal','original'],['viewMaster','master'],['viewDressup','dressup']])by(id).setAttribute('aria-pressed',String(previewMode===mode));
  E.lookTitle.textContent=dress?state.name:previewMode==='original'?'原始生成图 · 未叠加图层':'Yuri · 正式母版';
  const pose=window.YURI_POSES.resolve(state);E.stage.dataset.upperPose=pose.upper;E.stage.dataset.lowerPose=pose.lower;E.stage.dataset.suit=pose.full||'';
  if(custom)E.filename.textContent='当前图层：'+customLabel+(customCompatible(state)?'':'（对应另一种姿势，已暂存；切回原姿势恢复）');
  if(E.name.value!==state.name)E.name.value=state.name;
 }
 function matchPreset(p){return state.suit===P.indexOf(p)&&keys.every(key=>state[key]===p.look[key]);}
 function activeIndex(){return active==='preset'?P.findIndex(matchPreset):state[active];}
 function counter(){const ix=activeIndex();E.count.textContent=(ix<0?'—':String(ix+1).padStart(2,'0'))+' / '+String(categories[active].items.length).padStart(2,'0');}
 function thumb(group,index){
  const look=group==='preset'?{...DEFAULT,...P[index].look,suit:index}:({...state,[group]:index});
  if(!['preset','hair','hat','scene'].includes(group))look.suit=null;
  const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;
  if(group==='hair')look.hat=0; // hair thumbnails must not be hidden by hats
  draw(tmp.getContext('2d'),look,group==='scene',false);
  const cvs=document.createElement('canvas');cvs.width=120;cvs.height=100;const c=cvs.getContext('2d');c.imageSmoothingEnabled=false;
  block(c,0,0,120,100,group==='scene'?'#f1e4df':'#ece5df');
  const crops={hair:[52,8,154,184],top:[68,116,132,192],bottom:[85,198,112,158],socks:[88,254,115,119],shoes:[84,290,120,83],hat:[43,0,172,116],accessory:[5,114,200,260]};
  let cr=crops[group]?crops[group].map(v=>v*4):[0,0,W,H];


  const scale=Math.min(120/cr[2],100/cr[3]),dw=Math.round(cr[2]*scale),dh=Math.round(cr[3]*scale);
  c.drawImage(tmp,...cr,Math.floor((120-dw)/2),Math.floor((100-dh)/2),dw,dh);
  return cvs;
 }
 function refresh(){
  const g=categories[active];E.heading.textContent=g.title;E.hint.textContent=g.hint;E.grid.replaceChildren();
  const selected=activeIndex();
  const frag=document.createDocumentFragment();
  g.items.forEach(([name,subtitle,color],index)=>{
    const cell=document.createElement('button');cell.type='button';cell.className='item-card'+(index===selected?' selected':'');cell.setAttribute('aria-pressed',String(index===selected));cell.setAttribute('aria-label',active==='preset'?name+'套装':name);
    const frame=document.createElement('span');frame.className='thumb-frame';frame.appendChild(thumb(active,index));
    const label=document.createElement('span');label.className='item-name';label.textContent=name;
    const sub=document.createElement('span');sub.className='item-sub';sub.textContent=subtitle;
    cell.append(frame,label,sub);
    if(index===selected){const tick=document.createElement('span');tick.className='item-check';tick.textContent='✓';cell.append(tick);}
    cell.addEventListener('click',()=>{
    if(active==='preset'){state=clean({...state,...P[index].look,suit:index,name:P[index].name});}
    else if(state[active]!==index||(!['hair','hat','scene'].includes(active)&&state.suit!==null)){state[active]=index;if(!['hair','hat','scene'].includes(active))state.suit=null;if(active==='top'&&index===1&&state.accessory===0)state.accessory=1;}
      else{if(previewMode!=='dressup'){previewMode='dressup';render();refresh();notice('已进入自由换装');}else notice('这一项已经穿在 Yuri 身上啦');return;}
    previewMode='dressup';persist();render();refresh();notice(window.YURI_POSES.resolve(state).message||(active==='preset'?'已换上「'+P[index].name+'」':'尤莉换装完成 ✦'));
    });
    frag.append(cell);
  });
  E.grid.appendChild(frag);counter();
 }
 function tab(key){if(!categories[key])return;active=key;
  for(const btn of E.tabs.querySelectorAll('[data-tab]')){const yes=btn.dataset.tab===key;btn.classList.toggle('active',yes);btn.setAttribute('aria-selected',String(yes));}
  refresh();
 }
 function updateSaved(){
  E.savedCount.textContent=saved.length+' / 12';E.saved.replaceChildren();
  if(!saved.length){const none=document.createElement('div');none.className='no-saves';none.textContent='还没有收藏的搭配。试着为尤莉搭配一套，再点击「♡ 收藏搭配」。';E.saved.append(none);return;}
  saved.forEach((item,index)=>{
   const cell=document.createElement('div');cell.className='saved-cell';const swatch=document.createElement('span');swatch.className='saved-swatch';const preview=document.createElement('canvas');preview.width=W;preview.height=H;draw(preview.getContext('2d'),item,false,false,item.view||'dressup');swatch.append(preview);
   const load=document.createElement('button');load.type='button';load.className='saved-load';const title=document.createElement('strong');title.textContent=item.name;const small=document.createElement('small');small.textContent='SLOT '+String(index+1).padStart(2,'0');load.append(title,small);
   const remove=document.createElement('button');remove.type='button';remove.className='saved-remove';remove.textContent='×';remove.setAttribute('aria-label','删除 '+item.name);
   load.addEventListener('click',()=>{state=clean(item);previewMode=item.view||'dressup';persist();render();refresh();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});notice('已读取收藏搭配');});
   remove.addEventListener('click',()=>{saved.splice(index,1);persist();updateSaved();notice('已删除这条穿搭存档');});
   cell.append(swatch,load,remove);E.saved.append(cell);
  });
 }
 function fileLabel(){return (state.name||'Yuri').trim().replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,35)||'Yuri';}
 function saveCanvas(canvas,file){
  try{canvas.toBlob(blob=>{if(!blob){notice('PNG 生成失败，请重试');return;}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.download=file;a.href=url;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);notice('已生成 PNG 图片');},'image/png');}catch(e){console.error(e);notice('当前浏览器限制了 PNG 导出');}
 }
 function exportSprite(){
  if(previewMode==='dressup'){const out=document.createElement('canvas');out.width=W;out.height=H;draw(out.getContext('2d'),state,false,true);saveCanvas(out,fileLabel()+'_1024x1536.png');return;}
  // Full-image mode exports the exact source PNG, including original alpha RGB.
  const a=document.createElement('a');a.download='yuri-'+previewMode+'-1024x1536.png';a.href=window.PIXEL_ASSETS[previewMode==='original'?'master_original':'master_formal'];document.body.append(a);a.click();a.remove();notice('已导出原始尺寸 PNG');
 }

 function exportCard(){
  const out=document.createElement('canvas');out.width=800;out.height=1080;const c=out.getContext('2d');c.imageSmoothingEnabled=false;
  block(c,0,0,800,1080,'#e9e1d9');block(c,20,20,760,1040,'#faf5ed');block(c,20,20,760,76,'#33313d');
  c.font='bold 30px monospace';c.fillStyle='#fff3ea';c.fillText("YURI'S CLOSET",48,69);
  block(c,56,124,688,802,'#e8dfd8');const sprite=document.createElement('canvas');sprite.width=W;sprite.height=H;draw(sprite.getContext('2d'),state,true,true,previewMode);
  c.drawImage(sprite,0,0,W,H,144,144,512,768);
  c.font='bold 31px sans-serif';c.fillStyle='#453743';c.fillText(state.name.slice(0,22),57,977);c.font='19px monospace';c.fillStyle='#986e7c';c.fillText('PIXEL LOOK / YURI · NON-COMMERCIAL FAN WORK',60,1026);
  saveCanvas(out,fileLabel()+'_card.png');
 }
 function guide(){
  const out=document.createElement('canvas');out.width=W;out.height=H;const c=out.getContext('2d');c.imageSmoothingEnabled=false;
  const sprite=document.createElement('canvas');sprite.width=W;sprite.height=H;draw(sprite.getContext('2d'),state,false,false);
  c.globalAlpha=.4;c.drawImage(sprite,0,0);c.globalAlpha=1;
  const current=window.YURI_POSES.resolve(state),anchors={...native.poseSystem.poses[current.upper].anchors,...native.poseSystem.poses[current.lower].anchors};
  c.fillStyle='#a66a7b';for(const [name,[x,y]] of Object.entries(anchors)){c.fillRect(x-3,y-3,6,6);}
  saveCanvas(out,'yuri_draw_guide_1024x1536.png');
 }
 function init(){
  for(const [id,mode] of [['viewOriginal','original'],['viewMaster','master'],['viewDressup','dressup']])by(id).addEventListener('click',()=>setPreview(mode));
  E.tabs.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)tab(b.dataset.tab);});
  E.name.value=state.name;E.name.addEventListener('input',()=>{state.name=E.name.value.slice(0,30);E.lookTitle.textContent=state.name||'Yuri';persist();});
  E.name.addEventListener('blur',()=>{if(!state.name.trim()){state.name='Yuri · 今日穿搭';render();persist();}});
  by('randomBtn').addEventListener('click',()=>{state.suit=null;for(const k of keys){if(k==='scene')continue;state[k]=Math.floor(Math.random()*categories[k].items.length);}state.name='Yuri · 随机造型';previewMode='dressup';persist();render();refresh();notice(window.YURI_POSES.resolve(state).message||'随机穿搭完成 ✳');});
  by('resetBtn').addEventListener('click',()=>{state={...DEFAULT};previewMode='master';persist();render();refresh();notice('已恢复正式母版');});
  by('saveBtn').addEventListener('click',()=>{saved.unshift(clean({...state,view:previewMode}));saved=saved.slice(0,12);persist();updateSaved();notice('已将这套衣服放进搭配存档 ♡');});
  by('exportSprite').addEventListener('click',exportSprite);by('exportCard').addEventListener('click',exportCard);by('guideBtn').addEventListener('click',guide);
  E.file.addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;
   if(file.type!=='image/png'||file.size>8*1024*1024){notice('请选择不超过 8MB 的透明 PNG 图片');return;}
   const reader=new FileReader();reader.onload=()=>{const pic=new Image();pic.onload=()=>{if(pic.width!==W||pic.height!==H){notice('请使用 1024×1536 的透明 PNG；原图不会被自动拉伸');return;}custom=pic;customLabel=file.name;customPose=poseSignature(state);const probe=document.createElement('canvas');probe.width=W;probe.height=H;probe.getContext('2d').drawImage(pic,0,0);const alpha=probe.getContext('2d').getImageData(0,460,W,H-460).data;customHeadOnly=true;for(let i=3;i<alpha.length;i+=4)if(alpha[i]){customHeadOnly=false;break;}previewMode='dressup';E.clear.disabled=false;render();notice('自绘图层已导入');};pic.onerror=()=>notice('图片打开失败');pic.src=reader.result;};reader.readAsDataURL(file);
  });
  E.clear.addEventListener('click',()=>{custom=null;customPose=null;customLabel='';E.file.value='';E.filename.textContent='';E.clear.disabled=true;render();notice('已移除自定义图层');});
  window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;const n=Number(e.key);if(n>=1&&n<=9)tab(Object.keys(categories)[n-1]);if(e.key.toLowerCase()==='r'&&!e.ctrlKey&&!e.metaKey)by('randomBtn').click();});
  render();refresh();updateSaved();
  if(new URLSearchParams(location.search).get('qa')==='1')window.YURI_QA={version:window.YURI_NATIVE.version,draw,drawLayer:paintedPart,scenery,getState:()=>({...state}),presets:P.map((p,suit)=>({...p.look,suit,name:p.name})),categories,resolvePose:window.YURI_POSES.resolve,commands:window.YURI_POSES.commands,
    assets:()=>Object.keys(pics),setState:(look,refreshMenu=true)=>{state=clean(look);previewMode='dressup';render();if(refreshMenu)refresh();},getMode:()=>previewMode,setPreview,
    snapshot:()=>E.stage.toDataURL('image/png')};
  document.documentElement.dataset.yuriReady='true';
 }
 async function load(){const input=Object.entries(window.PIXEL_ASSETS||{});if(!input.length)throw Error('图片资产丢失');
  const loaded=await Promise.all(input.map(([k,src])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve([k,im]);im.onerror=()=>reject(new Error(k));im.src=src;})));pics=Object.fromEntries(loaded);init();
 }
 load().catch(e=>{console.error(e);E.grid.textContent='图片素材未能加载。请重新解压 ZIP，或使用独立版 HTML。';notice('衣橱素材加载失败');});
})();
