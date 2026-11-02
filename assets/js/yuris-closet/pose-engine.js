/* Painted pose ownership. No transforms, limb warps or generated geometry. */
(()=>{
 'use strict';
 const config=window.YURI_NATIVE.poseSystem;
 const held={1:['left'],8:['left'],9:['left','right'],11:['right']};
 const worn=[2,3,4,5,7,10];
 function wearRelation(look){
  const rules=config.wearRules,item=rules?.bottoms[String(look.bottom)];
  if(item)return item.shoes?.[String(look.shoes)]||item[rules.bootShoes.includes(look.shoes)?'boots':'low'];
  return rules?.bootShoes.includes(look.shoes)?'bootsOverLegs':'exposedAnkle';
 }
 function compatibleSuit(look){const suit=config.suits[String(look.suit)];return suit&&Object.entries(suit.requires).every(([key,value])=>look[key]===value)?suit:null;}
 function resolve(look){
  const suit=compatibleSuit(look),hands=held[look.accessory]||[];
  if(suit?.body){return {full:suit.poseId,upper:suit.poseId,lower:suit.poseId,body:suit.body,headAnchor:config.poses[suit.poseId].anchors.head,layers:[suit.body],hands:[],message:'',owners:{torso:suit.poseId,leftArm:suit.poseId,rightArm:suit.poseId,leftLeg:suit.poseId,rightLeg:suit.poseId}};}
  const item=config.items.top[String(look.top)];let upper='relaxed',message='';
  if(item.preferredPose){
   const pose=config.poses[item.preferredPose];
   const required=pose.requiresAccessory;
   const conflict=hands.some(side=>pose.occupiedHands.includes(side));
   if(required!==undefined&&look.accessory!==required){message='这件制服使用常规手势，可自由搭配手持物。';}
   else if(conflict){message=pose.id==='hoodie-pocket'?'拿好手持物，卫衣切换为常规袖姿。':'拿好手持物，外套切换为常规袖姿。';}
   else upper=pose.id;
  }
  let lower='shoe-'+look.shoes,lowerLayer='lower_legs_'+look.shoes,ownsBottom=false;
  if(look.bottom===5&&look.shoes===1&&[0,1].includes(look.socks)){
   lower='garden-crossed';lowerLayer='pose_lower_garden';ownsBottom=true;
  }else if(look.shoes===7&&look.socks===0&&![1,5,8,9,12].includes(look.bottom)){
   lower='boots-outturn';lowerLayer='pose_lower_boots';
  }else if(look.shoes===7){message=message||'长裤或袜子搭配同款长靴的常规腿姿。';}
  const upperLayer=upper==='relaxed'?'upper_top_'+look.top:config.poses[upper].upper;
  const integrated=upper==='uniform-sword'&&look.accessory===1;
  const hiddenHands=integrated?[]:hands;
  const longBottom=config.wearRules?.longBottoms.includes(look.bottom)||false;
  const lowerAdaptation=look.shoes===7?config.wearRules?.tallAdaptations[String(look.bottom)]:null;
  return {full:null,upper,lower,upperLayer,lowerLayer,ownsBottom,integrated,hiddenHands,longBottom,lowerAdaptation,wearRelation:wearRelation(look),
   upperHandMasks:item.handMasks,frontRegions:config.poses[upper].frontRegions||[],
   lowerHasShoes:true,drawSocks:lower.startsWith('shoe-'),drawShoes:lower.startsWith('shoe-'),
   headAnchor:config.poses[upper].anchors.head,message,
   owners:{torso:upper,leftArm:upper,rightArm:upper,leftLeg:longBottom?(lowerAdaptation||'bottom_'+look.bottom):lower,rightLeg:longBottom?(lowerAdaptation||'bottom_'+look.bottom):lower,feet:lower}};
 }
 function commands(look){
  const p=resolve(look),out=[],add=(key,extra={})=>{if(window.YURI_NATIVE.layers[key])out.push({key,...extra});};
  add('hair_back_'+look.hair);
  if(!p.full)add('accessory_back_'+look.accessory);
  if(p.full)add(p.body);
  else{
   if(p.ownsBottom)add(p.lowerLayer);
   else if(p.lower==='boots-outturn'){add(p.lowerLayer);add('bottom_'+look.bottom);}
   else if(p.longBottom){
    add('foot_base_'+look.shoes);
    const bottom=p.lowerAdaptation||'bottom_'+look.bottom;
    if(p.wearRelation==='pantsOverBoots'){add('shoes_'+look.shoes);add(bottom);}
    else{add(bottom);add('shoes_'+look.shoes);}
   }else{
    add(p.lowerLayer);if(p.drawSocks)add('socks_'+look.socks);
    if(p.drawShoes)add('shoes_'+look.shoes);
    add('bottom_'+look.bottom); // Skirt/short hems are in front of the shoe shafts, which cover only the legs.
   }
   if(!p.integrated)add('accessory_wrist_'+look.accessory);
   add(p.upperLayer);
   if(worn.includes(look.accessory))add('accessory_front_'+look.accessory);
   for(const key of config.frontLayers?.[p.upperLayer]||[])add(key);
  }
  add('head');add('hair_front_'+look.hair);add('hat_'+look.hat);
  const hands=config.handLayers?.[p.body||p.upperLayer]||{};
  for(const [side,key]of Object.entries(hands))if(p.full||!p.hiddenHands?.includes(side))add(key);
  if(!p.full&&!p.integrated&&!worn.includes(look.accessory))add('accessory_front_'+look.accessory);
  return {pose:p,commands:out};
 }
 window.YURI_POSES=Object.freeze({resolve,commands,compatibleSuit,wearRelation,heldHands:held});
})();
