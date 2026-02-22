import"./modulepreload-polyfill-B5Qt9EMX.js";import{G as H,V as m,a as me,A as Et,C as dt,M,b as k,S as te,c as J,L as Mt,d as _,P as ne,e as Q,D as ie,O as Ct,B as At,F as Ke,U as ht,f as I,W as Y,H as ee,N as je,g as pt,h as D,i as Dt,R as Lt,j as De,k as It,l as Me,m as qe,n as K,o as Pt,p as j,q as se,r as Ge,s as $e,T as Ot,t as We,u as ut,v as W,w as Xe,x as zt,y as Rt,z as Bt,E as Nt,I as gt,J as Ie,K as pe,Q as Ut,X as Ft,Y as _t,Z as Ht,_ as jt,$ as Pe,a0 as qt,a1 as Gt,a2 as $t,a3 as Ce,a4 as Wt,a5 as Vt,a6 as Kt,a7 as Xt,a8 as Yt,a9 as Qt,aa as Jt,ab as Zt,ac as es,ad as ts,ae as ss,af as Ye,ag as Qe,ah as is,ai as ns,aj as Je,ak as as,al as os,am as rs,an as Oe,ao as ls,ap as cs,aq as ds,ar as hs,as as ps}from"./OrbitControls-BM5tREKB.js";import{g as us,c as gs,a as fs,b as ms}from"./StatsUtils-Dj8vluZS.js";import{b as F,g as ze,T as bs}from"./TransformControls-BqcytDZ_.js";import{F as ft,O as ys}from"./OBJLoader-T3R-nVsm.js";const y={INITIALIZING:"initializing",LOADING:"loading",MENU:"menu",COUNTDOWN:"countdown",FIGHTING:"fighting",ROUND_END:"round_end",MATCH_END:"match_end",PAUSED:"paused"},T={LOAD_COMPLETE:"load_complete",START_MATCH:"start_match",COUNTDOWN_DONE:"countdown_done",FIGHTER_DEFEATED:"fighter_defeated",ROUND_TIMEOUT:"round_timeout",NEXT_ROUND:"next_round",MATCH_WON:"match_won",PAUSE:"pause",RESUME:"resume",QUIT:"quit",RESET:"reset"},Ze={[y.INITIALIZING]:{[T.LOAD_COMPLETE]:y.MENU},[y.LOADING]:{[T.LOAD_COMPLETE]:y.MENU},[y.MENU]:{[T.START_MATCH]:y.COUNTDOWN},[y.COUNTDOWN]:{[T.COUNTDOWN_DONE]:y.FIGHTING,[T.PAUSE]:y.PAUSED},[y.FIGHTING]:{[T.FIGHTER_DEFEATED]:y.ROUND_END,[T.ROUND_TIMEOUT]:y.ROUND_END,[T.PAUSE]:y.PAUSED},[y.ROUND_END]:{[T.NEXT_ROUND]:y.COUNTDOWN,[T.MATCH_WON]:y.MATCH_END},[y.MATCH_END]:{[T.RESET]:y.MENU,[T.QUIT]:y.MENU},[y.PAUSED]:{[T.RESUME]:y.FIGHTING,[T.QUIT]:y.MENU}};class mt{constructor(){this.state=y.INITIALIZING,this.previousState=null,this.listeners=new Map,this.stateData=this.createInitialData(),this.transitionQueue=[],this.isTransitioning=!1}createInitialData(){return{roundNumber:1,roundsToWin:2,maxRounds:3,roundTime:90,roundTimer:90,countdownTimer:3,scores:{player:0,opponent:0},playerHealth:100,playerMaxHealth:100,opponentHealth:100,opponentMaxHealth:100,winner:null,matchWinner:null,loadProgress:0,loadStatus:"",isPaused:!1,pauseReason:null}}getState(){return this.state}getData(){return{...this.stateData}}updateData(e){Object.assign(this.stateData,e),this.emit("dataChange",this.stateData)}canTransition(e){const t=Ze[this.state];return t&&e in t}dispatch(e,t={}){this.transitionQueue.push({event:e,payload:t}),this.isTransitioning||this.processQueue()}processQueue(){if(this.transitionQueue.length===0){this.isTransitioning=!1;return}this.isTransitioning=!0;const{event:e,payload:t}=this.transitionQueue.shift(),s=Ze[this.state];if(!s||!(e in s)){console.warn(`Invalid transition: ${this.state} + ${e}`),this.processQueue();return}const i=s[e];this.previousState=this.state,this.state=i,this.onEnterState(i,t),this.emit("stateChange",{from:this.previousState,to:i,event:e,data:this.stateData}),this.processQueue()}onEnterState(e,t){switch(e){case y.MENU:this.stateData=this.createInitialData();break;case y.COUNTDOWN:this.stateData.countdownTimer=3,this.stateData.isPaused=!1;break;case y.FIGHTING:break;case y.ROUND_END:t.winner&&(this.stateData.winner=t.winner,t.winner==="player"?this.stateData.scores.player++:this.stateData.scores.opponent++);break;case y.MATCH_END:this.stateData.matchWinner=t.matchWinner||(this.stateData.scores.player>this.stateData.scores.opponent?"player":"opponent");break;case y.PAUSED:this.stateData.isPaused=!0,this.stateData.pauseReason=t.reason||"user";break}}on(e,t){return this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t),()=>this.off(e,t)}off(e,t){const s=this.listeners.get(e);if(s){const i=s.indexOf(t);i>-1&&s.splice(i,1)}}emit(e,t){(this.listeners.get(e)||[]).forEach(i=>{try{i(t)}catch(n){console.error(`State listener error for ${e}:`,n)}})}isInState(...e){return e.includes(this.state)}isFighting(){return this.state===y.FIGHTING}isActive(){return this.isInState(y.COUNTDOWN,y.FIGHTING,y.ROUND_END)}reset(){this.state=y.INITIALIZING,this.previousState=null,this.stateData=this.createInitialData(),this.transitionQueue=[],this.isTransitioning=!1}serialize(){return{state:this.state,previousState:this.previousState,data:{...this.stateData}}}deserialize(e){this.state=e.state,this.previousState=e.previousState,this.stateData={...e.data}}}new mt;const Ae={PLAYER:"player",AI:"ai"};class ge{constructor(e={}){this.id=e.id||crypto.randomUUID(),this.type=e.type||Ae.PLAYER,this.name=e.name||"Entity",this.group=new H,this.group.userData.entity=this,this.mesh=null,this.mixer=null,this.animations=new Map,this.currentAnimation=null,this.stats=this.createStats(e.stats||{}),this.effectiveStats=this.calculateEffectiveStats(),this.powerScore=0,this.powerRanking=null,this.recalculatePower(),this.state=this.createState(),this.position=e.position||new m(0,0,0),this.rotation=e.rotation||0,this.scale=e.scale||1,this.modelPath=e.modelPath||null,this.color=e.color||16777215,this.components=new Map,this.isLoaded=!1,this.isActive=!0,this.group.position.copy(this.position),this.group.rotation.y=this.rotation}createStats(e={}){return{maxHealth:e.maxHealth||100,health:e.health||100,maxStamina:e.stamina||100,stamina:e.stamina||100,strength:e.strength||10,dexterity:e.dexterity||10,constitution:e.constitution||10,intelligence:e.intelligence||10,wisdom:e.wisdom||10,charisma:e.charisma||10,luck:e.luck||10,willpower:e.willpower||10,moveSpeed:e.moveSpeed||5,runSpeed:e.runSpeed||10,attackPower:e.attackPower||10,defense:e.defense||5,critChance:e.critChance||.05,critMultiplier:e.critMultiplier||1.5,level:e.level||1,experience:e.experience||0}}calculateEffectiveStats(){const e=["strength","dexterity","constitution","intelligence","wisdom","charisma","luck","willpower"],t={};for(const s of e)t[s]=us(this.stats[s]);return t}recalculatePower(){this.effectiveStats=this.calculateEffectiveStats(),this.powerScore=gs({...this.stats,strength:this.stats.strength,dexterity:this.stats.dexterity,constitution:this.stats.constitution,intelligence:this.stats.intelligence,wisdom:this.stats.wisdom,charisma:this.stats.charisma,luck:this.stats.luck,willpower:this.stats.willpower}),this.powerRanking=fs(this.powerScore)}getEffectiveStat(e){return this.effectiveStats[e]??this.stats[e]??0}createState(){return{isAlive:!0,isMoving:!1,isRunning:!1,isAttacking:!1,isBlocking:!1,isDodging:!1,isStaggered:!1,isCasting:!1,targetEntity:null,lastAttackTime:0,lastDamageTime:0,invincibleUntil:0,velocity:new m,moveDirection:new m,facingDirection:new m(0,0,-1)}}async loadModel(){if(!this.modelPath){this.createPlaceholderMesh(),this.isLoaded=!0;return}const e=new me;try{const t=await new Promise((s,i)=>{e.load(this.modelPath,s,void 0,i)});this.mesh=t.scene,this.mesh.scale.setScalar(this.scale),this.mesh.traverse(s=>{s.isMesh&&(s.castShadow=!0,s.receiveShadow=!0)}),this.group.add(this.mesh),t.animations&&t.animations.length>0&&(this.mixer=new Et(this.mesh),t.animations.forEach(s=>{this.animations.set(s.name.toLowerCase(),s)})),this.isLoaded=!0,console.log(`Entity ${this.name} loaded: ${this.modelPath}`)}catch(t){console.warn(`Failed to load model for ${this.name}:`,t),this.createPlaceholderMesh(),this.isLoaded=!0}}createPlaceholderMesh(){const e=new dt(.4,1.2,8,16),t=new M({color:this.color,metalness:.3,roughness:.7});this.mesh=new k(e,t),this.mesh.position.y=1,this.mesh.castShadow=!0;const s=new te(.2),i=new J({color:this.type===Ae.PLAYER?65280:16711680}),n=new k(s,i);n.position.set(0,2.2,0),this.mesh.add(n),this.group.add(this.mesh)}playAnimation(e,t={}){const s=this.animations.get(e.toLowerCase());if(!s||!this.mixer)return null;const i=this.mixer.clipAction(s);return t.loop===!1&&(i.setLoop(Mt),i.clampWhenFinished=!0),t.crossFade&&this.currentAnimation?this.currentAnimation.crossFadeTo(i,t.crossFade,!0):(this.currentAnimation&&this.currentAnimation.fadeOut(.2),i.reset().fadeIn(.2).play()),this.currentAnimation=i,i}stopAnimation(){this.currentAnimation&&(this.currentAnimation.fadeOut(.2),this.currentAnimation=null)}takeDamage(e,t=null){if(!this.state.isAlive)return{dealt:0,killed:!1};if(Date.now()<this.state.invincibleUntil)return{dealt:0,blocked:!0};let s=e;this.state.isBlocking&&(s=Math.floor(s*.3));const i=this.getEffectiveStat("constitution"),n=this.stats.defense+(i-10)*.5;return s=Math.max(0,s-n*.5),this.stats.health=Math.max(0,this.stats.health-s),this.state.lastDamageTime=Date.now(),this.stats.health<=0?(this.die(),{dealt:s,killed:!0}):(this.state.isStaggered=!0,setTimeout(()=>{this.state.isStaggered=!1},200),{dealt:s,killed:!1})}heal(e){if(!this.state.isAlive)return 0;const t=this.stats.health;return this.stats.health=Math.min(this.stats.maxHealth,this.stats.health+e),this.stats.health-t}die(){this.state.isAlive=!1,this.stats.health=0,this.playAnimation("death",{loop:!1})}respawn(e=null){this.stats.health=this.stats.maxHealth,this.stats.stamina=this.stats.maxStamina,this.state=this.createState(),e&&this.setPosition(e),this.playAnimation("idle")}attack(e="light"){if(!this.state.isAlive||this.state.isAttacking||this.state.isStaggered)return null;const t={light:{damage:10,range:2,cooldown:300,animation:"attack_light"},heavy:{damage:25,range:2.5,cooldown:800,animation:"attack_heavy"},special:{damage:40,range:3,cooldown:2e3,animation:"attack_special"}},s=t[e]||t.light,i=Date.now();if(i-this.state.lastAttackTime<s.cooldown)return null;this.state.isAttacking=!0,this.state.lastAttackTime=i;const n=this.getEffectiveStat("strength"),a=Math.floor(s.damage*(1+(n-10)*.05)*(1+this.stats.attackPower/100)),o=this.getEffectiveStat("luck"),r=this.getEffectiveStat("dexterity"),l=this.stats.critChance+(o-10)*.005+(r-10)*.003,h=Math.random()<l,d=h?Math.floor(a*this.stats.critMultiplier):a;return this.playAnimation(s.animation,{loop:!1}),setTimeout(()=>{this.state.isAttacking=!1},s.cooldown*.5),{damage:d,range:s.range,isCrit:h,type:e}}startBlock(){return!this.state.isAlive||this.state.isAttacking?!1:(this.state.isBlocking=!0,this.playAnimation("block"),!0)}endBlock(){this.state.isBlocking=!1,this.playAnimation("idle")}move(e,t,s=!1){if(!this.state.isAlive||this.state.isAttacking||this.state.isStaggered)return;const i=s?this.stats.runSpeed:this.stats.moveSpeed;if(this.state.moveDirection.copy(e).normalize(),this.state.velocity.copy(this.state.moveDirection).multiplyScalar(i*t),this.group.position.add(this.state.velocity),e.lengthSq()>.001){const n=Math.atan2(e.x,e.z);this.group.rotation.y=_.lerp(this.group.rotation.y,n,.15),this.state.isMoving=!0,this.state.isRunning=s,this.state.isAttacking||this.playAnimation(s?"run":"walk")}else this.state.isMoving=!1,this.state.isRunning=!1,!this.state.isAttacking&&!this.state.isBlocking&&this.playAnimation("idle")}lookAt(e){if(e instanceof m){const t=e.clone().sub(this.group.position);t.y=0,t.lengthSq()>.001&&(this.group.rotation.y=Math.atan2(t.x,t.z),this.state.facingDirection.copy(t.normalize()))}else e instanceof ge&&this.lookAt(e.group.position)}distanceTo(e){return e instanceof ge?this.group.position.distanceTo(e.group.position):this.group.position.distanceTo(e)}canAttack(e){return!e||!this.state.isAlive||!e.state.isAlive?!1:this.distanceTo(e)<=3}setPosition(e){e instanceof m?this.position.copy(e):this.position.set(e.x||0,e.y||0,e.z||0),this.group.position.copy(this.position)}getPosition(){return this.group.position.clone()}getHealthPercent(){return this.stats.health/this.stats.maxHealth}getStaminaPercent(){return this.stats.stamina/this.stats.maxStamina}addComponent(e,t){t.entity=this,this.components.set(e,t),t.onAttach&&t.onAttach()}getComponent(e){return this.components.get(e)}removeComponent(e){const t=this.components.get(e);t&&(t.onDetach&&t.onDetach(),this.components.delete(e))}update(e,t=null){this.mixer&&this.mixer.update(e),this.components.forEach(s=>{s.update&&s.update(e,t)}),this.state.stamina<this.stats.maxStamina&&!this.state.isRunning&&(this.stats.stamina=Math.min(this.stats.maxStamina,this.stats.stamina+10*e))}serialize(){return{id:this.id,type:this.type,name:this.name,position:{x:this.position.x,y:this.position.y,z:this.position.z},rotation:this.rotation,stats:{...this.stats},effectiveStats:{...this.effectiveStats},powerScore:this.powerScore,powerRanking:this.powerRanking,state:{isAlive:this.state.isAlive,health:this.stats.health}}}getPowerScore(){return this.powerScore}getPowerRanking(){return this.powerRanking}dispose(){this.components.forEach(e=>{e.dispose&&e.dispose()}),this.components.clear(),this.mixer&&this.mixer.stopAllAction(),this.group.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(t=>t.dispose()):e.material.dispose())}),this.group.parent&&this.group.parent.remove(this.group)}}const A={IDLE:"idle",APPROACH:"approach",CIRCLE:"circle",ATTACK:"attack",RETREAT:"retreat",BLOCK:"block",DODGE:"dodge"},xe={EASY:{reactionTime:800,accuracy:.4,aggression:.3,blockChance:.2},MEDIUM:{reactionTime:500,accuracy:.6,aggression:.5,blockChance:.4},HARD:{reactionTime:300,accuracy:.8,aggression:.7,blockChance:.6},NIGHTMARE:{reactionTime:150,accuracy:.95,aggression:.85,blockChance:.8}};class xs{constructor(e,t="MEDIUM"){this.entity=e,this.target=null,this.difficulty=xe[t]||xe.MEDIUM,this.behavior=A.IDLE,this.nextDecisionTime=0,this.decisionInterval=500,this.circleDirection=Math.random()>.5?1:-1,this.circleTimer=0,this.retreatTimer=0,this.preferredRange=2.5,this.attackRange=3,this.retreatRange=5,this.comboCounter=0,this.maxCombo=3,this.lastAttackType=null}setTarget(e){this.target=e}setDifficulty(e){this.difficulty=xe[e]||xe.MEDIUM}update(e){if(!this.entity||!this.target||!this.entity.state.isAlive)return this.createIdleInput();const t=Date.now();return t>=this.nextDecisionTime&&(this.makeDecision(),this.nextDecisionTime=t+this.decisionInterval*(.8+Math.random()*.4)),this.executeBehavior(e)}makeDecision(){if(!this.target.state.isAlive){this.behavior=A.IDLE;return}const e=this.entity.distanceTo(this.target),t=this.entity.getHealthPercent();if(this.target.getHealthPercent(),t<.2&&Math.random()<.6){this.behavior=A.RETREAT,this.retreatTimer=2e3;return}if(this.target.state.isAttacking&&Math.random()<this.difficulty.blockChance&&e<this.attackRange){this.behavior=Math.random()<.5?A.BLOCK:A.DODGE;return}if(e>this.preferredRange*2){this.behavior=A.APPROACH;return}if(e<=this.attackRange&&Math.random()<this.difficulty.aggression){this.behavior=A.ATTACK;return}if(e<this.preferredRange&&Math.random()<.3){this.behavior=A.CIRCLE,this.circleTimer=1e3+Math.random()*1e3;return}this.behavior=A.APPROACH}executeBehavior(e){const t=this.createIdleInput();switch(this.behavior){case A.APPROACH:return this.executeApproach(t);case A.CIRCLE:return this.executeCircle(t,e);case A.ATTACK:return this.executeAttack(t);case A.RETREAT:return this.executeRetreat(t,e);case A.BLOCK:return this.executeBlock(t);case A.DODGE:return this.executeDodge(t);case A.IDLE:default:return t}}createIdleInput(){return{forward:!1,backward:!1,left:!1,right:!1,attack:!1,attackType:null,block:!1,dodge:!1,run:!1,moveDirection:new m}}executeApproach(e){const t=this.getDirectionToTarget(),s=this.entity.distanceTo(this.target);return s>this.preferredRange&&(e.moveDirection.copy(t),e.forward=!0,e.run=s>this.preferredRange*2),this.entity.lookAt(this.target),e}executeCircle(e,t){if(this.circleTimer-=t*1e3,this.circleTimer<=0)return this.behavior=A.APPROACH,e;const s=this.getDirectionToTarget(),i=new m(-s.z,0,s.x);i.multiplyScalar(this.circleDirection);const n=this.entity.distanceTo(this.target);return n>this.preferredRange*1.2?i.add(s.multiplyScalar(.5)):n<this.preferredRange*.8&&i.sub(s.multiplyScalar(.3)),e.moveDirection.copy(i.normalize()),this.entity.lookAt(this.target),e}executeAttack(e){return this.entity.distanceTo(this.target)>this.attackRange?this.executeApproach(e):(Math.random()<this.difficulty.accuracy&&(e.attack=!0,e.attackType=this.chooseAttackType()),this.entity.lookAt(this.target),this.behavior=A.CIRCLE,this.circleTimer=500+Math.random()*500,e)}chooseAttackType(){if(this.comboCounter>=this.maxCombo)return this.comboCounter=0,"heavy";const e=Math.random();return e<.6?(this.comboCounter++,"light"):e<.85?(this.comboCounter=0,"heavy"):(this.comboCounter=0,"special")}executeRetreat(e,t){if(this.retreatTimer-=t*1e3,this.retreatTimer<=0)return this.behavior=A.CIRCLE,e;const s=this.getDirectionToTarget();return e.moveDirection.copy(s).negate(),e.backward=!0,e.run=!0,this.entity.lookAt(this.target),e}executeBlock(e){return e.block=!0,setTimeout(()=>{this.behavior=A.CIRCLE},this.difficulty.reactionTime),e}executeDodge(e){return e.dodge=!0,e.moveDirection.set(Math.random()>.5?1:-1,0,Math.random()>.5?.5:-.5).normalize(),this.behavior=A.CIRCLE,e}getDirectionToTarget(){if(!this.target)return new m(0,0,-1);const e=this.target.getPosition().sub(this.entity.getPosition());return e.y=0,e.normalize()}reset(){this.behavior=A.IDLE,this.nextDecisionTime=0,this.comboCounter=0,this.circleTimer=0,this.retreatTimer=0}}var vs=`uniform float uTime;
uniform float uScale;
uniform float uHeight;
uniform float uFrequency;

varying vec2 vUv;
varying float vElevation;
varying vec3 vNormal;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float simplexNoise2d(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float getElevation(vec2 pos) {
  float elevation = 0.0;
  float frequency = uFrequency;
  float amplitude = 1.0;
  
  for(int i = 0; i < 4; i++) {
    elevation += simplexNoise2d(pos * frequency + uTime * 0.1) * amplitude;
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return elevation * uHeight;
}

void main() {
  vUv = uv;
  
  vec3 pos = position * uScale;
  float elevation = getElevation(pos.xz);
  pos.y += elevation;
  vElevation = elevation;
  
  float delta = 0.01;
  float elevationX = getElevation(pos.xz + vec2(delta, 0.0));
  float elevationZ = getElevation(pos.xz + vec2(0.0, delta));
  vec3 tangent = normalize(vec3(delta, elevationX - elevation, 0.0));
  vec3 bitangent = normalize(vec3(0.0, elevationZ - elevation, delta));
  vNormal = normalize(cross(bitangent, tangent));
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`,ws=`uniform float uHeight;

varying vec2 vUv;
varying float vElevation;
varying vec3 vNormal;

void main() {
  float normalizedElevation = (vElevation / uHeight + 1.0) * 0.5;
  
  vec3 lowColor = vec3(0.15, 0.25, 0.1);
  vec3 midColor = vec3(0.3, 0.35, 0.2);
  vec3 highColor = vec3(0.5, 0.45, 0.35);
  vec3 peakColor = vec3(0.9, 0.9, 0.95);
  
  vec3 terrainColor;
  if(normalizedElevation < 0.25) {
    terrainColor = mix(lowColor, midColor, normalizedElevation * 4.0);
  } else if(normalizedElevation < 0.5) {
    terrainColor = mix(midColor, highColor, (normalizedElevation - 0.25) * 4.0);
  } else if(normalizedElevation < 0.75) {
    terrainColor = mix(highColor, peakColor, (normalizedElevation - 0.5) * 4.0);
  } else {
    terrainColor = peakColor;
  }
  
  vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
  float diffuse = max(dot(vNormal, lightDir), 0.0);
  float ambient = 0.3;
  
  vec3 finalColor = terrainColor * (ambient + diffuse * 0.7);
  
  gl_FragColor = vec4(finalColor, 1.0);
}`;class Ss{constructor(e={}){this.width=e.width||100,this.depth=e.depth||100,this.segments=e.segments||128,this.uniforms={uTime:{value:0},uScale:{value:e.scale||1},uHeight:{value:e.height||2},uFrequency:{value:e.frequency||.5}},this.createTerrain()}createTerrain(){const e=new ne(this.width,this.depth,this.segments,this.segments);e.rotateX(-Math.PI/2);const t=new Q({vertexShader:vs,fragmentShader:ws,uniforms:this.uniforms,side:ie});this.mesh=new k(e,t),this.mesh.receiveShadow=!0}update(e,t=1){this.uniforms.uTime.value+=e*t}setScale(e){this.uniforms.uScale.value=e}setHeight(e){this.uniforms.uHeight.value=e}setFrequency(e){this.uniforms.uFrequency.value=e}getMesh(){return this.mesh}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose()}}const G={THIRD_PERSON:"thirdPerson",FPS:"fps",ACTION:"action",RTS:"rts",TOP_DOWN:"topDown",ISOMETRIC:"isometric"};class ks{constructor(){this.playerPosition=new m,this.playerRotation=0,this.opponentPosition=new m,this.targetLocked=!1,this.deltaTime=0,this.input=null,this.arenaBounds={width:40,depth:30}}update(e,t,s,i,n=!1){e&&(this.playerPosition.copy(e.getPosition()),this.playerRotation=e.getMesh().rotation.y),t&&this.opponentPosition.copy(t.getPosition()),this.input=s,this.deltaTime=i,this.targetLocked=n}}class oe{constructor(e,t){this.name=e,this.description=t,this.transitionSpeed=5}activate(e,t){}deactivate(e,t){}update(e,t){}lerpPosition(e,t,s,i){e.position.lerp(t,s*i)}}class Ts extends oe{constructor(){super("Third Person","Camera behind and above player"),this.offset=new m(0,5,10),this.lookOffset=new m(0,1.5,0)}update(e,t){const{playerPosition:s,playerRotation:i,opponentPosition:n,targetLocked:a,deltaTime:o}=t;if(a){const r=n.clone().sub(s).normalize(),l=s.clone().sub(r.multiplyScalar(8));l.y=6,this.lerpPosition(e,l,this.transitionSpeed,o),e.lookAt(n.x,1.5,n.z)}else{const r=this.offset.clone().applyAxisAngle(new m(0,1,0),i),l=s.clone().add(r);this.lerpPosition(e,l,this.transitionSpeed,o);const h=s.clone().add(this.lookOffset);e.lookAt(h)}}}class Es extends oe{constructor(){super("First Person","Camera at player eye level"),this.eyeHeight=1.8}update(e,t){const{playerPosition:s,playerRotation:i,deltaTime:n}=t,a=s.clone();a.y+=this.eyeHeight,this.lerpPosition(e,a,15,n);const o=new m(0,0,-1).applyAxisAngle(new m(0,1,0),i),r=a.clone().add(o.multiplyScalar(10));e.lookAt(r)}}class Ms extends oe{constructor(){super("Action","Dynamic combat camera"),this.baseDistance=8,this.maxDistance=15,this.baseFOV=50,this.actionFOV=65,this.currentFOV=50}update(e,t){const{playerPosition:s,opponentPosition:i,targetLocked:n,deltaTime:a}=t,o=s.clone().add(i).multiplyScalar(.5),r=s.distanceTo(i),l=Math.min(this.maxDistance,this.baseDistance+r*.3),h=n?this.actionFOV:this.baseFOV;this.currentFOV=_.lerp(this.currentFOV,h,3*a),e.fov=this.currentFOV,e.updateProjectionMatrix();const d=5+r*.2,f=new m(o.x,d,o.z+l);this.lerpPosition(e,f,4,a),n?e.lookAt(i.x,1.5,i.z):e.lookAt(o.x,1,o.z)}}class Cs extends oe{constructor(){super("RTS","Top-down angled strategy view"),this.height=25,this.angle=Math.PI/4,this.panSpeed=20,this.zoomSpeed=5,this.minZoom=15,this.maxZoom=50,this.targetPosition=new m(0,0,0)}activate(e,t){this.targetPosition.copy(t.playerPosition),this.targetPosition.y=0}update(e,t){const{input:s,deltaTime:i}=t;if(s){const a=s.getMovementVector();this.targetPosition.x+=a.x*this.panSpeed*i,this.targetPosition.z+=a.z*this.panSpeed*i}const n=new m(this.targetPosition.x,this.height,this.targetPosition.z+Math.tan(this.angle)*this.height);this.lerpPosition(e,n,8,i),e.lookAt(this.targetPosition.x,0,this.targetPosition.z)}}class As extends oe{constructor(){super("Top Down","Directly overhead view"),this.height=30}update(e,t){const{playerPosition:s,deltaTime:i}=t,n=new m(s.x,this.height,s.z);this.lerpPosition(e,n,6,i),e.lookAt(s.x,0,s.z)}}class Ds extends oe{constructor(){super("Isometric","Fixed 45-degree angle view"),this.distance=20,this.angle=Math.PI/4,this.elevation=Math.PI/6}update(e,t){const{playerPosition:s,deltaTime:i}=t,n=Math.sin(this.angle)*Math.cos(this.elevation)*this.distance,a=Math.sin(this.elevation)*this.distance,o=Math.cos(this.angle)*Math.cos(this.elevation)*this.distance,r=new m(s.x+n,s.y+a,s.z+o);this.lerpPosition(e,r,6,i),e.lookAt(s.x,s.y+1,s.z)}}class Ls{constructor(e){this.camera=e,this.context=new ks,this.currentMode=G.THIRD_PERSON,this.controllers={[G.THIRD_PERSON]:new Ts,[G.FPS]:new Es,[G.ACTION]:new Ms,[G.RTS]:new Cs,[G.TOP_DOWN]:new As,[G.ISOMETRIC]:new Ds},this.onModeChange=null,this.initialized=!1}activate(){this.initialized||(this.getCurrentController().activate(this.camera,this.context),this.initialized=!0)}getCurrentController(){return this.controllers[this.currentMode]}getModeName(){return this.getCurrentController().name}getModeDescription(){return this.getCurrentController().description}setMode(e,t=null,s=null){if(this.controllers[e]&&e!==this.currentMode){this.getCurrentController().deactivate(this.camera,this.context),this.currentMode=e,t&&this.context.update(t,s,null,0,!1);const n=this.getCurrentController();n.activate(this.camera,this.context),this.onModeChange&&this.onModeChange(e,n.name),console.log(`Camera mode: ${n.name}`)}}nextMode(){const e=Object.values(G),s=(e.indexOf(this.currentMode)+1)%e.length;this.setMode(e[s])}previousMode(){const e=Object.values(G),s=(e.indexOf(this.currentMode)-1+e.length)%e.length;this.setMode(e[s])}update(e,t,s,i,n=!1){this.initialized||this.activate(),this.context.update(e,t,s,i,n),this.getCurrentController().update(this.camera,this.context)}}class Is{constructor(){this.world=null,this.bodies=new Map,this.colliders=new Map,this.initialized=!1,this.eventQueue=null}async init(){await F.init();const e={x:0,y:-9.81,z:0};this.world=new F.World(e),this.eventQueue=new F.EventQueue(!0),this.initialized=!0,console.log("Rapier physics initialized")}createStaticBody(e={x:0,y:0,z:0}){if(!this.initialized)return null;const t=F.RigidBodyDesc.fixed().setTranslation(e.x,e.y,e.z);return this.world.createRigidBody(t)}createDynamicBody(e={x:0,y:0,z:0},t=1){if(!this.initialized)return null;const s=F.RigidBodyDesc.dynamic().setTranslation(e.x,e.y,e.z).setAdditionalMass(t);return this.world.createRigidBody(s)}createKinematicBody(e={x:0,y:0,z:0}){if(!this.initialized)return null;const t=F.RigidBodyDesc.kinematicPositionBased().setTranslation(e.x,e.y,e.z);return this.world.createRigidBody(t)}createBoxCollider(e,t={x:.5,y:.5,z:.5}){if(!this.initialized)return null;const s=F.ColliderDesc.cuboid(t.x,t.y,t.z);return this.world.createCollider(s,e)}createSphereCollider(e,t=.5){if(!this.initialized)return null;const s=F.ColliderDesc.ball(t);return this.world.createCollider(s,e)}createCapsuleCollider(e,t=1,s=.5){if(!this.initialized)return null;const i=F.ColliderDesc.capsule(t,s);return this.world.createCollider(i,e)}createGroundCollider(e={x:50,z:50},t=0){if(!this.initialized)return null;const s=this.createStaticBody({x:0,y:t,z:0}),i=F.ColliderDesc.cuboid(e.x,.1,e.z);return this.world.createCollider(i,s)}createTrimeshCollider(e,t,s){if(!this.initialized)return null;const i=F.ColliderDesc.trimesh(new Float32Array(t),new Uint32Array(s));return this.world.createCollider(i,e)}registerBody(e,t){this.bodies.set(e,t)}getBody(e){return this.bodies.get(e)}removeBody(e){const t=this.bodies.get(e);t&&(this.world.removeRigidBody(t),this.bodies.delete(e))}setBodyPosition(e,t){e&&e.setTranslation(t,!0)}setBodyRotation(e,t){e&&e.setRotation(t,!0)}getBodyPosition(e){return e?e.translation():{x:0,y:0,z:0}}getBodyRotation(e){return e?e.rotation():{x:0,y:0,z:0,w:1}}applyImpulse(e,t){e&&e.applyImpulse(t,!0)}applyForce(e,t){e&&e.addForce(t,!0)}castRay(e,t,s=100){if(!this.initialized)return null;const i=new F.Ray(e,t),n=this.world.castRay(i,s,!0);return n?{point:i.pointAt(n.toi),normal:n.normal,distance:n.toi,collider:n.collider}:null}step(e=1/60){this.initialized&&(this.world.step(this.eventQueue),this.eventQueue.drainCollisionEvents((t,s,i)=>{}),this.eventQueue.drainContactForceEvents(t=>{}))}dispose(){this.world&&(this.world.free(),this.world=null),this.bodies.clear(),this.colliders.clear(),this.initialized=!1}}let ve=null;async function Ps(){return ve||(ve=new Is,await ve.init()),ve}const bt={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class be{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Os=new Ct(-1,1,1,-1,0,1);class zs extends At{constructor(){super(),this.setAttribute("position",new Ke([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ke([0,2,0,0,2,0],2))}}const Rs=new zs;class yt{constructor(e){this._mesh=new k(Rs,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Os)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class xt extends be{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof Q?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ht.clone(e.uniforms),this.material=new Q({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new yt(this.material)}render(e,t,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class et extends be{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,s){const i=e.getContext(),n=e.state;n.buffers.color.setMask(!1),n.buffers.depth.setMask(!1),n.buffers.color.setLocked(!0),n.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),n.buffers.stencil.setTest(!0),n.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),n.buffers.stencil.setFunc(i.ALWAYS,a,4294967295),n.buffers.stencil.setClear(o),n.buffers.stencil.setLocked(!0),e.setRenderTarget(s),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),n.buffers.color.setLocked(!1),n.buffers.depth.setLocked(!1),n.buffers.color.setMask(!0),n.buffers.depth.setMask(!0),n.buffers.stencil.setLocked(!1),n.buffers.stencil.setFunc(i.EQUAL,1,4294967295),n.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),n.buffers.stencil.setLocked(!0)}}class Bs extends be{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class vt{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const s=e.getSize(new I);this._width=s.width,this._height=s.height,t=new Y(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:ee}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new xt(bt),this.copyPass.material.blending=je,this.clock=new pt}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let s=!1;for(let i=0,n=this.passes.length;i<n;i++){const a=this.passes[i];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,s),a.needsSwap){if(s){const o=this.renderer.getContext(),r=this.renderer.state.buffers.stencil;r.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),r.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}et!==void 0&&(a instanceof et?s=!0:a instanceof Bs&&(s=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new I);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const s=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(s,i),this.renderTarget2.setSize(s,i);for(let n=0;n<this.passes.length;n++)this.passes[n].setSize(s,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class wt extends be{constructor(e,t,s=null,i=null,n=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=s,this.clearColor=i,this.clearAlpha=n,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new D}render(e,t,s){const i=e.autoClear;e.autoClear=!1;let n,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(n=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(n),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=i}}class V extends be{constructor(e,t,s,i){super(),this.renderScene=t,this.renderCamera=s,this.selectedObjects=i!==void 0?i:[],this.visibleEdgeColor=new D(1,1,1),this.hiddenEdgeColor=new D(.1,.04,.02),this.edgeGlow=0,this.usePatternTexture=!1,this.edgeThickness=1,this.edgeStrength=3,this.downSampleRatio=2,this.pulsePeriod=0,this._visibilityCache=new Map,this._selectionCache=new Set,this.resolution=e!==void 0?new I(e.x,e.y):new I(256,256);const n=Math.round(this.resolution.x/this.downSampleRatio),a=Math.round(this.resolution.y/this.downSampleRatio);this.renderTargetMaskBuffer=new Y(this.resolution.x,this.resolution.y),this.renderTargetMaskBuffer.texture.name="OutlinePass.mask",this.renderTargetMaskBuffer.texture.generateMipmaps=!1,this.depthMaterial=new Dt,this.depthMaterial.side=ie,this.depthMaterial.depthPacking=Lt,this.depthMaterial.blending=je,this.prepareMaskMaterial=this.getPrepareMaskMaterial(),this.prepareMaskMaterial.side=ie,this.prepareMaskMaterial.fragmentShader=h(this.prepareMaskMaterial.fragmentShader,this.renderCamera),this.renderTargetDepthBuffer=new Y(this.resolution.x,this.resolution.y,{type:ee}),this.renderTargetDepthBuffer.texture.name="OutlinePass.depth",this.renderTargetDepthBuffer.texture.generateMipmaps=!1,this.renderTargetMaskDownSampleBuffer=new Y(n,a,{type:ee}),this.renderTargetMaskDownSampleBuffer.texture.name="OutlinePass.depthDownSample",this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps=!1,this.renderTargetBlurBuffer1=new Y(n,a,{type:ee}),this.renderTargetBlurBuffer1.texture.name="OutlinePass.blur1",this.renderTargetBlurBuffer1.texture.generateMipmaps=!1,this.renderTargetBlurBuffer2=new Y(Math.round(n/2),Math.round(a/2),{type:ee}),this.renderTargetBlurBuffer2.texture.name="OutlinePass.blur2",this.renderTargetBlurBuffer2.texture.generateMipmaps=!1,this.edgeDetectionMaterial=this.getEdgeDetectionMaterial(),this.renderTargetEdgeBuffer1=new Y(n,a,{type:ee}),this.renderTargetEdgeBuffer1.texture.name="OutlinePass.edge1",this.renderTargetEdgeBuffer1.texture.generateMipmaps=!1,this.renderTargetEdgeBuffer2=new Y(Math.round(n/2),Math.round(a/2),{type:ee}),this.renderTargetEdgeBuffer2.texture.name="OutlinePass.edge2",this.renderTargetEdgeBuffer2.texture.generateMipmaps=!1;const o=4,r=4;this.separableBlurMaterial1=this.getSeperableBlurMaterial(o),this.separableBlurMaterial1.uniforms.texSize.value.set(n,a),this.separableBlurMaterial1.uniforms.kernelRadius.value=1,this.separableBlurMaterial2=this.getSeperableBlurMaterial(r),this.separableBlurMaterial2.uniforms.texSize.value.set(Math.round(n/2),Math.round(a/2)),this.separableBlurMaterial2.uniforms.kernelRadius.value=r,this.overlayMaterial=this.getOverlayMaterial();const l=bt;this.copyUniforms=ht.clone(l.uniforms),this.materialCopy=new Q({uniforms:this.copyUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader,blending:je,depthTest:!1,depthWrite:!1}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new D,this.oldClearAlpha=1,this.fsQuad=new yt(null),this.tempPulseColor1=new D,this.tempPulseColor2=new D,this.textureMatrix=new De;function h(d,f){const p=f.isPerspectiveCamera?"perspective":"orthographic";return d.replace(/DEPTH_TO_VIEW_Z/g,p+"DepthToViewZ")}}dispose(){this.renderTargetMaskBuffer.dispose(),this.renderTargetDepthBuffer.dispose(),this.renderTargetMaskDownSampleBuffer.dispose(),this.renderTargetBlurBuffer1.dispose(),this.renderTargetBlurBuffer2.dispose(),this.renderTargetEdgeBuffer1.dispose(),this.renderTargetEdgeBuffer2.dispose(),this.depthMaterial.dispose(),this.prepareMaskMaterial.dispose(),this.edgeDetectionMaterial.dispose(),this.separableBlurMaterial1.dispose(),this.separableBlurMaterial2.dispose(),this.overlayMaterial.dispose(),this.materialCopy.dispose(),this.fsQuad.dispose()}setSize(e,t){this.renderTargetMaskBuffer.setSize(e,t),this.renderTargetDepthBuffer.setSize(e,t);let s=Math.round(e/this.downSampleRatio),i=Math.round(t/this.downSampleRatio);this.renderTargetMaskDownSampleBuffer.setSize(s,i),this.renderTargetBlurBuffer1.setSize(s,i),this.renderTargetEdgeBuffer1.setSize(s,i),this.separableBlurMaterial1.uniforms.texSize.value.set(s,i),s=Math.round(s/2),i=Math.round(i/2),this.renderTargetBlurBuffer2.setSize(s,i),this.renderTargetEdgeBuffer2.setSize(s,i),this.separableBlurMaterial2.uniforms.texSize.value.set(s,i)}updateSelectionCache(){const e=this._selectionCache;function t(s){s.isMesh&&e.add(s)}e.clear();for(let s=0;s<this.selectedObjects.length;s++)this.selectedObjects[s].traverse(t)}changeVisibilityOfSelectedObjects(e){const t=this._visibilityCache;for(const s of this._selectionCache)e===!0?s.visible=t.get(s):(t.set(s,s.visible),s.visible=e)}changeVisibilityOfNonSelectedObjects(e){const t=this._visibilityCache,s=this._selectionCache;function i(n){if(n.isMesh||n.isSprite){if(!s.has(n)){const a=n.visible;(e===!1||t.get(n)===!0)&&(n.visible=e),t.set(n,a)}}else(n.isPoints||n.isLine)&&(e===!0?n.visible=t.get(n):(t.set(n,n.visible),n.visible=e))}this.renderScene.traverse(i)}updateTextureMatrix(){this.textureMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),this.textureMatrix.multiply(this.renderCamera.projectionMatrix),this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse)}render(e,t,s,i,n){if(this.selectedObjects.length>0){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,n&&e.state.buffers.stencil.setTest(!1),e.setClearColor(16777215,1),this.updateSelectionCache(),this.changeVisibilityOfSelectedObjects(!1);const o=this.renderScene.background;if(this.renderScene.background=null,this.renderScene.overrideMaterial=this.depthMaterial,e.setRenderTarget(this.renderTargetDepthBuffer),e.clear(),e.render(this.renderScene,this.renderCamera),this.changeVisibilityOfSelectedObjects(!0),this._visibilityCache.clear(),this.updateTextureMatrix(),this.changeVisibilityOfNonSelectedObjects(!1),this.renderScene.overrideMaterial=this.prepareMaskMaterial,this.prepareMaskMaterial.uniforms.cameraNearFar.value.set(this.renderCamera.near,this.renderCamera.far),this.prepareMaskMaterial.uniforms.depthTexture.value=this.renderTargetDepthBuffer.texture,this.prepareMaskMaterial.uniforms.textureMatrix.value=this.textureMatrix,e.setRenderTarget(this.renderTargetMaskBuffer),e.clear(),e.render(this.renderScene,this.renderCamera),this.renderScene.overrideMaterial=null,this.changeVisibilityOfNonSelectedObjects(!0),this._visibilityCache.clear(),this._selectionCache.clear(),this.renderScene.background=o,this.fsQuad.material=this.materialCopy,this.copyUniforms.tDiffuse.value=this.renderTargetMaskBuffer.texture,e.setRenderTarget(this.renderTargetMaskDownSampleBuffer),e.clear(),this.fsQuad.render(e),this.tempPulseColor1.copy(this.visibleEdgeColor),this.tempPulseColor2.copy(this.hiddenEdgeColor),this.pulsePeriod>0){const r=.625+Math.cos(performance.now()*.01/this.pulsePeriod)*.75/2;this.tempPulseColor1.multiplyScalar(r),this.tempPulseColor2.multiplyScalar(r)}this.fsQuad.material=this.edgeDetectionMaterial,this.edgeDetectionMaterial.uniforms.maskTexture.value=this.renderTargetMaskDownSampleBuffer.texture,this.edgeDetectionMaterial.uniforms.texSize.value.set(this.renderTargetMaskDownSampleBuffer.width,this.renderTargetMaskDownSampleBuffer.height),this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value=this.tempPulseColor1,this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value=this.tempPulseColor2,e.setRenderTarget(this.renderTargetEdgeBuffer1),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.separableBlurMaterial1,this.separableBlurMaterial1.uniforms.colorTexture.value=this.renderTargetEdgeBuffer1.texture,this.separableBlurMaterial1.uniforms.direction.value=V.BlurDirectionX,this.separableBlurMaterial1.uniforms.kernelRadius.value=this.edgeThickness,e.setRenderTarget(this.renderTargetBlurBuffer1),e.clear(),this.fsQuad.render(e),this.separableBlurMaterial1.uniforms.colorTexture.value=this.renderTargetBlurBuffer1.texture,this.separableBlurMaterial1.uniforms.direction.value=V.BlurDirectionY,e.setRenderTarget(this.renderTargetEdgeBuffer1),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.separableBlurMaterial2,this.separableBlurMaterial2.uniforms.colorTexture.value=this.renderTargetEdgeBuffer1.texture,this.separableBlurMaterial2.uniforms.direction.value=V.BlurDirectionX,e.setRenderTarget(this.renderTargetBlurBuffer2),e.clear(),this.fsQuad.render(e),this.separableBlurMaterial2.uniforms.colorTexture.value=this.renderTargetBlurBuffer2.texture,this.separableBlurMaterial2.uniforms.direction.value=V.BlurDirectionY,e.setRenderTarget(this.renderTargetEdgeBuffer2),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.overlayMaterial,this.overlayMaterial.uniforms.maskTexture.value=this.renderTargetMaskBuffer.texture,this.overlayMaterial.uniforms.edgeTexture1.value=this.renderTargetEdgeBuffer1.texture,this.overlayMaterial.uniforms.edgeTexture2.value=this.renderTargetEdgeBuffer2.texture,this.overlayMaterial.uniforms.patternTexture.value=this.patternTexture,this.overlayMaterial.uniforms.edgeStrength.value=this.edgeStrength,this.overlayMaterial.uniforms.edgeGlow.value=this.edgeGlow,this.overlayMaterial.uniforms.usePatternTexture.value=this.usePatternTexture,n&&e.state.buffers.stencil.setTest(!0),e.setRenderTarget(s),this.fsQuad.render(e),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=a}this.renderToScreen&&(this.fsQuad.material=this.materialCopy,this.copyUniforms.tDiffuse.value=s.texture,e.setRenderTarget(null),this.fsQuad.render(e))}getPrepareMaskMaterial(){return new Q({uniforms:{depthTexture:{value:null},cameraNearFar:{value:new I(.5,.5)},textureMatrix:{value:null}},vertexShader:`#include <morphtarget_pars_vertex>
				#include <skinning_pars_vertex>

				varying vec4 projTexCoord;
				varying vec4 vPosition;
				uniform mat4 textureMatrix;

				void main() {

					#include <skinbase_vertex>
					#include <begin_vertex>
					#include <morphtarget_vertex>
					#include <skinning_vertex>
					#include <project_vertex>

					vPosition = mvPosition;

					vec4 worldPosition = vec4( transformed, 1.0 );

					#ifdef USE_INSTANCING

						worldPosition = instanceMatrix * worldPosition;

					#endif

					worldPosition = modelMatrix * worldPosition;

					projTexCoord = textureMatrix * worldPosition;

				}`,fragmentShader:`#include <packing>
				varying vec4 vPosition;
				varying vec4 projTexCoord;
				uniform sampler2D depthTexture;
				uniform vec2 cameraNearFar;

				void main() {

					float depth = unpackRGBAToDepth(texture2DProj( depthTexture, projTexCoord ));
					float viewZ = - DEPTH_TO_VIEW_Z( depth, cameraNearFar.x, cameraNearFar.y );
					float depthTest = (-vPosition.z > viewZ) ? 1.0 : 0.0;
					gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);

				}`})}getEdgeDetectionMaterial(){return new Q({uniforms:{maskTexture:{value:null},texSize:{value:new I(.5,.5)},visibleEdgeColor:{value:new m(1,1,1)},hiddenEdgeColor:{value:new m(1,1,1)}},vertexShader:`varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform vec2 texSize;
				uniform vec3 visibleEdgeColor;
				uniform vec3 hiddenEdgeColor;

				void main() {
					vec2 invSize = 1.0 / texSize;
					vec4 uvOffset = vec4(1.0, 0.0, 0.0, 1.0) * vec4(invSize, invSize);
					vec4 c1 = texture2D( maskTexture, vUv + uvOffset.xy);
					vec4 c2 = texture2D( maskTexture, vUv - uvOffset.xy);
					vec4 c3 = texture2D( maskTexture, vUv + uvOffset.yw);
					vec4 c4 = texture2D( maskTexture, vUv - uvOffset.yw);
					float diff1 = (c1.r - c2.r)*0.5;
					float diff2 = (c3.r - c4.r)*0.5;
					float d = length( vec2(diff1, diff2) );
					float a1 = min(c1.g, c2.g);
					float a2 = min(c3.g, c4.g);
					float visibilityFactor = min(a1, a2);
					vec3 edgeColor = 1.0 - visibilityFactor > 0.001 ? visibleEdgeColor : hiddenEdgeColor;
					gl_FragColor = vec4(edgeColor, 1.0) * vec4(d);
				}`})}getSeperableBlurMaterial(e){return new Q({defines:{MAX_RADIUS:e},uniforms:{colorTexture:{value:null},texSize:{value:new I(.5,.5)},direction:{value:new I(.5,.5)},kernelRadius:{value:1}},vertexShader:`varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;
				uniform float kernelRadius;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}

				void main() {
					vec2 invSize = 1.0 / texSize;
					float sigma = kernelRadius/2.0;
					float weightSum = gaussianPdf(0.0, sigma);
					vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;
					vec2 delta = direction * invSize * kernelRadius/float(MAX_RADIUS);
					vec2 uvOffset = delta;
					for( int i = 1; i <= MAX_RADIUS; i ++ ) {
						float x = kernelRadius * float(i) / float(MAX_RADIUS);
						float w = gaussianPdf(x, sigma);
						vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);
						vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);
						diffuseSum += ((sample1 + sample2) * w);
						weightSum += (2.0 * w);
						uvOffset += delta;
					}
					gl_FragColor = diffuseSum/weightSum;
				}`})}getOverlayMaterial(){return new Q({uniforms:{maskTexture:{value:null},edgeTexture1:{value:null},edgeTexture2:{value:null},patternTexture:{value:null},edgeStrength:{value:1},edgeGlow:{value:1},usePatternTexture:{value:0}},vertexShader:`varying vec2 vUv;

				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;

				uniform sampler2D maskTexture;
				uniform sampler2D edgeTexture1;
				uniform sampler2D edgeTexture2;
				uniform sampler2D patternTexture;
				uniform float edgeStrength;
				uniform float edgeGlow;
				uniform bool usePatternTexture;

				void main() {
					vec4 edgeValue1 = texture2D(edgeTexture1, vUv);
					vec4 edgeValue2 = texture2D(edgeTexture2, vUv);
					vec4 maskColor = texture2D(maskTexture, vUv);
					vec4 patternColor = texture2D(patternTexture, 6.0 * vUv);
					float visibilityFactor = 1.0 - maskColor.g > 0.0 ? 1.0 : 0.5;
					vec4 edgeValue = edgeValue1 + edgeValue2 * edgeGlow;
					vec4 finalColor = edgeStrength * maskColor.r * edgeValue;
					if(usePatternTexture)
						finalColor += + visibilityFactor * (1.0 - maskColor.r) * (1.0 - patternColor.r);
					gl_FragColor = finalColor;
				}`,blending:It,depthTest:!1,depthWrite:!1,transparent:!0})}}V.BlurDirectionX=new I(1,0);V.BlurDirectionY=new I(0,1);const Ns={name:"GammaCorrectionShader",uniforms:{tDiffuse:{value:null}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 tex = texture2D( tDiffuse, vUv );

			gl_FragColor = sRGBTransferOETF( tex );

		}`};class Us{constructor(e,t,s){this.scene=e,this.camera=t,this.renderer=s,this.currentTarget=null,this.potentialTargets=[],this.targetIndex=0,this.isLocked=!1,this.maxTargetDistance=50,this.targetAngle=Math.PI/3,this.composer=null,this.outlinePass=null,this.targetUI=null,this.onTargetChange=null,this.onTargetLock=null,this.onTargetLost=null,this.setupPostProcessing(),this.createTargetUI()}setupPostProcessing(){const e=this.renderer.getSize(new I);this.composer=new vt(this.renderer),this.composer.addPass(new wt(this.scene,this.camera)),this.outlinePass=new V(new I(e.x,e.y),this.scene,this.camera),this.outlinePass.edgeStrength=4,this.outlinePass.edgeGlow=.5,this.outlinePass.edgeThickness=2,this.outlinePass.pulsePeriod=2,this.outlinePass.visibleEdgeColor.set(15680580),this.outlinePass.hiddenEdgeColor.set(9109504),this.composer.addPass(this.outlinePass);const t=new xt(Ns);this.composer.addPass(t)}createTargetUI(){this.targetUI=document.createElement("div"),this.targetUI.id="targeting-ui",this.targetUI.innerHTML=`
            <style>
                #targeting-ui { position: fixed; pointer-events: none; z-index: 150; }
                .target-reticle { position: fixed; width: 80px; height: 80px; pointer-events: none; display: none; }
                .target-reticle.active { display: block; }
                .target-reticle-inner { position: absolute; inset: 0; border: 2px solid #ef4444; border-radius: 50%; animation: targetPulse 1.5s infinite; }
                .target-reticle-corners { position: absolute; inset: 4px; }
                .target-reticle-corners::before, .target-reticle-corners::after { content: ''; position: absolute; width: 12px; height: 12px; border-color: #ef4444; border-style: solid; }
                .target-reticle-corners::before { top: 0; left: 0; border-width: 3px 0 0 3px; }
                .target-reticle-corners::after { bottom: 0; right: 0; border-width: 0 3px 3px 0; }
                .target-reticle-corners-2 { position: absolute; inset: 4px; }
                .target-reticle-corners-2::before, .target-reticle-corners-2::after { content: ''; position: absolute; width: 12px; height: 12px; border-color: #ef4444; border-style: solid; }
                .target-reticle-corners-2::before { top: 0; right: 0; border-width: 3px 3px 0 0; }
                .target-reticle-corners-2::after { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
                .target-info { position: fixed; top: 60px; left: 50%; transform: translateX(-50%); background: rgba(20, 26, 43, 0.9); border: 2px solid #ef4444; border-radius: 8px; padding: 10px 20px; display: none; text-align: center; }
                .target-info.active { display: block; }
                .target-name { color: #ef4444; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
                .target-health-bar { width: 150px; height: 8px; background: #1a1a2e; border-radius: 4px; overflow: hidden; }
                .target-health-fill { height: 100%; background: linear-gradient(90deg, #ef4444, #dc2626); transition: width 0.2s; }
                .target-distance { color: #a5b4d0; font-size: 11px; margin-top: 4px; }
                @keyframes targetPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
                .target-locked-text { position: fixed; top: 100px; left: 50%; transform: translateX(-50%); color: #ef4444; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; display: none; }
                .target-locked-text.active { display: block; animation: fadeInOut 2s; }
                @keyframes fadeInOut { 0% { opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { opacity: 0; } }
            </style>
            <div class="target-reticle" id="target-reticle">
                <div class="target-reticle-inner"></div>
                <div class="target-reticle-corners"></div>
                <div class="target-reticle-corners-2"></div>
            </div>
            <div class="target-info" id="target-info">
                <div class="target-name" id="target-name">Enemy</div>
                <div class="target-health-bar">
                    <div class="target-health-fill" id="target-health-fill" style="width: 100%"></div>
                </div>
                <div class="target-distance" id="target-distance">0m</div>
            </div>
            <div class="target-locked-text" id="target-locked-text">TARGET LOCKED</div>
        `,document.body.appendChild(this.targetUI),this.reticle=document.getElementById("target-reticle"),this.targetInfo=document.getElementById("target-info"),this.targetName=document.getElementById("target-name"),this.targetHealthFill=document.getElementById("target-health-fill"),this.targetDistance=document.getElementById("target-distance"),this.lockedText=document.getElementById("target-locked-text")}registerTarget(e,t={}){e.userData.targetable=!0,e.userData.targetData={name:t.name||"Enemy",health:t.health||100,maxHealth:t.maxHealth||100,faction:t.faction||"enemy",...t},this.potentialTargets.push(e)}unregisterTarget(e){const t=this.potentialTargets.indexOf(e);t>-1&&(this.potentialTargets.splice(t,1),this.currentTarget===e&&this.clearTarget())}findNearestTarget(e,t){let s=null,i=1/0;for(const n of this.potentialTargets){if(!n.userData.targetable)continue;const a=new m;n.getWorldPosition(a);const o=e.distanceTo(a);if(o>this.maxTargetDistance)continue;const r=a.clone().sub(e).normalize(),l=Math.acos(t.dot(r));if(l>this.targetAngle)continue;const h=o+l*20;h<i&&(i=h,s=n)}return s}cycleTarget(e=1){this.potentialTargets.length!==0&&(this.targetIndex=(this.targetIndex+e+this.potentialTargets.length)%this.potentialTargets.length,this.setTarget(this.potentialTargets[this.targetIndex]))}setTarget(e){if(this.currentTarget!==e)if(this.currentTarget=e,e){const t=[];e.isMesh?t.push(e):e.traverse(i=>{i.isMesh&&t.push(i)}),this.outlinePass.selectedObjects=t,this.reticle.classList.add("active"),this.targetInfo.classList.add("active");const s=e.userData.targetData;s&&(this.targetName.textContent=s.name,this.updateTargetHealth(s.health,s.maxHealth)),this.onTargetChange&&this.onTargetChange(e)}else this.clearTarget()}lockTarget(){this.currentTarget&&(this.isLocked=!0,this.lockedText.classList.add("active"),setTimeout(()=>this.lockedText.classList.remove("active"),2e3),this.onTargetLock&&this.onTargetLock(this.currentTarget))}unlockTarget(){this.isLocked=!1}toggleLock(){this.isLocked?this.unlockTarget():this.lockTarget()}clearTarget(){this.currentTarget=null,this.isLocked=!1,this.outlinePass.selectedObjects=[],this.reticle.classList.remove("active"),this.targetInfo.classList.remove("active"),this.onTargetLost&&this.onTargetLost()}updateTargetHealth(e,t){const s=Math.max(0,Math.min(100,e/t*100));this.targetHealthFill.style.width=`${s}%`}update(e){if(!this.currentTarget)return;const t=new m;this.currentTarget.getWorldPosition(t);const s=e.distanceTo(t);if(this.targetDistance.textContent=`${s.toFixed(1)}m`,s>this.maxTargetDistance&&!this.isLocked){this.clearTarget();return}const i=t.clone().project(this.camera),n=(i.x*.5+.5)*window.innerWidth,a=(-i.y*.5+.5)*window.innerHeight;i.z>0&&i.z<1?(this.reticle.style.left=`${n-40}px`,this.reticle.style.top=`${a-40}px`):this.reticle.classList.remove("active")}render(){return this.composer?(this.composer.render(),!0):!1}onResize(e,t){this.composer&&this.composer.setSize(e,t),this.outlinePass&&this.outlinePass.resolution.set(e,t)}destroy(){this.targetUI?.remove(),this.potentialTargets=[],this.currentTarget=null}}const we={attack_light:{key:"1",name:"Light Attack",category:"combat",animation:"attack_light"},attack_heavy:{key:"2",name:"Heavy Attack",category:"combat",animation:"attack_heavy"},attack_special:{key:"3",name:"Special Attack",category:"combat",animation:"attack_special"},block:{key:"4",name:"Block",category:"combat",animation:"block"},dodge_left:{key:"q",name:"Dodge Left",category:"movement",animation:"dodge_left"},dodge_right:{key:"e",name:"Dodge Right",category:"movement",animation:"dodge_right"},dodge_back:{key:"s",name:"Dodge Back",category:"movement",animation:"dodge_back"},jump:{key:"Space",name:"Jump",category:"movement",animation:"jump"},sprint:{key:"Shift",name:"Sprint",category:"movement",animation:"run"},target_lock:{key:"Tab",name:"Target Lock",category:"targeting",animation:null},target_next:{key:"Tab",name:"Next Target",category:"targeting",animation:null},skill_1:{key:"5",name:"Skill 1",category:"skills",animation:"skill_1"},skill_2:{key:"6",name:"Skill 2",category:"skills",animation:"skill_2"},skill_3:{key:"7",name:"Skill 3",category:"skills",animation:"skill_3"},skill_4:{key:"8",name:"Skill 4",category:"skills",animation:"skill_4"},ultimate:{key:"r",name:"Ultimate",category:"skills",animation:"ultimate"},potion_health:{key:"f1",name:"Health Potion",category:"items",animation:"use_item"},potion_mana:{key:"f2",name:"Mana Potion",category:"items",animation:"use_item"},interact:{key:"f",name:"Interact",category:"general",animation:"interact"},menu:{key:"Escape",name:"Menu",category:"general",animation:null}},Fs=[{id:"idle",name:"Idle",category:"base"},{id:"walk",name:"Walk",category:"movement"},{id:"run",name:"Run",category:"movement"},{id:"jump",name:"Jump",category:"movement"},{id:"dodge_left",name:"Dodge Left",category:"movement"},{id:"dodge_right",name:"Dodge Right",category:"movement"},{id:"dodge_back",name:"Dodge Back",category:"movement"},{id:"attack_light",name:"Light Attack",category:"combat"},{id:"attack_heavy",name:"Heavy Attack",category:"combat"},{id:"attack_special",name:"Special Attack",category:"combat"},{id:"block",name:"Block",category:"combat"},{id:"block_hit",name:"Block Hit",category:"combat"},{id:"hit_react",name:"Hit React",category:"combat"},{id:"stun",name:"Stunned",category:"combat"},{id:"death",name:"Death",category:"combat"},{id:"skill_1",name:"Skill 1",category:"skills"},{id:"skill_2",name:"Skill 2",category:"skills"},{id:"skill_3",name:"Skill 3",category:"skills"},{id:"skill_4",name:"Skill 4",category:"skills"},{id:"ultimate",name:"Ultimate",category:"skills"},{id:"use_item",name:"Use Item",category:"items"},{id:"interact",name:"Interact",category:"general"},{id:"victory",name:"Victory",category:"emotes"},{id:"taunt",name:"Taunt",category:"emotes"}];class _s{constructor(){this.bindings={},this.listeners=new Map,this.isListening=!1,this.rebindingAction=null,this.onRebindComplete=null,this.load(),this.bindGlobalListener()}load(){const e=localStorage.getItem("grudge_keybindings");if(e)try{const t=JSON.parse(e);this.bindings={...we,...t}}catch{this.bindings={...we}}else this.bindings={...we}}save(){localStorage.setItem("grudge_keybindings",JSON.stringify(this.bindings))}reset(){this.bindings={...we},this.save()}getBinding(e){return this.bindings[e]}setBinding(e,t,s=null){this.bindings[e]&&(this.bindings[e].key=t,s!==null&&(this.bindings[e].animation=s),this.save())}setAnimation(e,t){this.bindings[e]&&(this.bindings[e].animation=t,this.save())}getKeyForAction(e){return this.bindings[e]?.key||null}getActionForKey(e){const t=e.toLowerCase();for(const[s,i]of Object.entries(this.bindings))if(i.key.toLowerCase()===t)return{actionId:s,...i};return null}getAllBindings(){return{...this.bindings}}getBindingsByCategory(e){return Object.entries(this.bindings).filter(([,t])=>t.category===e).reduce((t,[s,i])=>({...t,[s]:i}),{})}startRebind(e,t){this.rebindingAction=e,this.onRebindComplete=t,this.isListening=!0}cancelRebind(){this.rebindingAction=null,this.onRebindComplete=null,this.isListening=!1}bindGlobalListener(){document.addEventListener("keydown",e=>{if(this.isListening&&this.rebindingAction){e.preventDefault(),e.stopPropagation();let s=e.key;s===" "&&(s="Space"),this.setBinding(this.rebindingAction,s),this.onRebindComplete&&this.onRebindComplete(this.rebindingAction,s),this.cancelRebind();return}const t=this.getActionForKey(e.key);if(t){const s=this.listeners.get(t.actionId);s&&s.forEach(i=>i(t))}})}on(e,t){return this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t),()=>this.off(e,t)}off(e,t){const s=this.listeners.get(e);if(s){const i=s.indexOf(t);i>-1&&s.splice(i,1)}}emit(e){const t=this.listeners.get(e),s=this.bindings[e];t&&s&&t.forEach(i=>i(s))}}const q=new _s;let tt=!1;function Hs(){if(tt)return;tt=!0;const c=document.createElement("style");c.id="action-bar-styles",c.textContent=`
        .action-bar { position: fixed; display: flex; gap: 4px; pointer-events: auto; z-index: 200; }
        .action-bar-bottom { bottom: 20px; left: 50%; transform: translateX(-50%); flex-direction: row; }
        .action-bar-bottom-2 { bottom: 80px; left: 50%; transform: translateX(-50%); flex-direction: row; }
        .action-bar-left { left: 20px; top: 50%; transform: translateY(-50%); flex-direction: column; }
        .action-slot { width: 50px; height: 50px; background: rgba(20, 26, 43, 0.9); border: 2px solid #2a3150; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; position: relative; }
        .action-slot:hover { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.1); }
        .action-slot.active { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.2); }
        .action-slot.cooldown { opacity: 0.5; }
        .action-slot .slot-icon { font-size: 20px; }
        .action-slot .slot-key { position: absolute; bottom: 2px; right: 4px; font-size: 10px; color: #6ee7b7; font-weight: 700; }
        .action-slot .slot-cooldown { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; border-radius: 6px; display: none; }
        .action-slot.on-cooldown .slot-cooldown { display: flex; }
        .action-slot-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(20, 26, 43, 0.98); padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s; border: 1px solid #2a3150; margin-bottom: 8px; }
        .action-slot:hover .action-slot-tooltip { opacity: 1; }
        .slot-edit-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(20, 26, 43, 0.98); border: 1px solid #2a3150; border-radius: 12px; padding: 20px; z-index: 1000; min-width: 400px; color: #e8eaf6; font-family: 'Jost', sans-serif; }
        .slot-edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .slot-edit-title { font-size: 16px; font-weight: 600; color: #6ee7b7; }
        .slot-edit-close { background: none; border: none; color: #a5b4d0; font-size: 20px; cursor: pointer; }
        .slot-edit-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; }
        .slot-edit-label { width: 100px; color: #a5b4d0; font-size: 13px; }
        .slot-edit-input { flex: 1; padding: 8px 12px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 6px; color: #e8eaf6; font-size: 13px; }
        .slot-edit-input:focus { outline: none; border-color: #6ee7b7; }
        .slot-edit-btn { padding: 8px 16px; background: rgba(110, 231, 183, 0.2); border: 1px solid #6ee7b7; border-radius: 6px; color: #6ee7b7; cursor: pointer; font-size: 13px; }
        .slot-edit-btn:hover { background: rgba(110, 231, 183, 0.3); }
        .slot-edit-btn.waiting { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #ef4444; }
        .animation-preview { width: 150px; height: 150px; background: #0a0a1a; border-radius: 8px; border: 1px solid #2a3150; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #6ee7b7; font-size: 12px; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }
    `,document.head.appendChild(c)}class js{constructor(e={}){this.id=e.id||"actionbar-1",this.position=e.position||"bottom",this.slots=e.slots||6,this.actions=e.actions||[],this.container=null,this.onAction=e.onAction||null,this.onSlotEdit=e.onSlotEdit||null,this.editingSlot=null}create(){return Hs(),this.container=document.createElement("div"),this.container.className=`action-bar action-bar-${this.position}`,this.container.id=this.id,this.container.innerHTML=this.render(),document.body.appendChild(this.container),this.bindEvents(),this}getStyles(){return`<style>
            .action-bar { position: fixed; display: flex; gap: 4px; pointer-events: auto; z-index: 200; }
            .action-bar-bottom { bottom: 20px; left: 50%; transform: translateX(-50%); flex-direction: row; }
            .action-bar-bottom-2 { bottom: 80px; left: 50%; transform: translateX(-50%); flex-direction: row; }
            .action-bar-left { left: 20px; top: 50%; transform: translateY(-50%); flex-direction: column; }
            .action-slot { width: 50px; height: 50px; background: rgba(20, 26, 43, 0.9); border: 2px solid #2a3150; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: all 0.15s; position: relative; }
            .action-slot:hover { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.1); }
            .action-slot.active { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.2); }
            .action-slot.cooldown { opacity: 0.5; }
            .action-slot .slot-icon { font-size: 20px; }
            .action-slot .slot-key { position: absolute; bottom: 2px; right: 4px; font-size: 10px; color: #6ee7b7; font-weight: 700; }
            .action-slot .slot-cooldown { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff; border-radius: 6px; display: none; }
            .action-slot.on-cooldown .slot-cooldown { display: flex; }
            .action-slot-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: rgba(20, 26, 43, 0.98); padding: 8px 12px; border-radius: 6px; font-size: 12px; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s; border: 1px solid #2a3150; margin-bottom: 8px; }
            .action-slot:hover .action-slot-tooltip { opacity: 1; }
            .slot-edit-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(20, 26, 43, 0.98); border: 1px solid #2a3150; border-radius: 12px; padding: 20px; z-index: 1000; min-width: 400px; }
            .slot-edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
            .slot-edit-title { font-size: 16px; font-weight: 600; color: #6ee7b7; }
            .slot-edit-close { background: none; border: none; color: #a5b4d0; font-size: 20px; cursor: pointer; }
            .slot-edit-row { display: flex; align-items: center; margin-bottom: 12px; gap: 12px; }
            .slot-edit-label { width: 100px; color: #a5b4d0; font-size: 13px; }
            .slot-edit-input { flex: 1; padding: 8px 12px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 6px; color: #e8eaf6; font-size: 13px; }
            .slot-edit-input:focus { outline: none; border-color: #6ee7b7; }
            .slot-edit-btn { padding: 8px 16px; background: rgba(110, 231, 183, 0.2); border: 1px solid #6ee7b7; border-radius: 6px; color: #6ee7b7; cursor: pointer; font-size: 13px; }
            .slot-edit-btn:hover { background: rgba(110, 231, 183, 0.3); }
            .slot-edit-btn.waiting { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #ef4444; }
            .animation-dropdown { max-height: 200px; overflow-y: auto; }
            .animation-option { padding: 8px 12px; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; }
            .animation-option:hover { background: rgba(110, 231, 183, 0.15); }
            .animation-option.selected { background: rgba(110, 231, 183, 0.2); }
            .animation-preview { width: 150px; height: 150px; background: #0a0a1a; border-radius: 8px; border: 1px solid #2a3150; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #6ee7b7; }
            .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; }
        </style>`}syncBindings(){this.actions.forEach((e,t)=>{if(e?.actionId){const s=q.getBinding(e.actionId);s&&(e.key=s.key,e.animation=s.animation)}})}render(){this.syncBindings();let e='<div class="action-bar-slots" style="display:flex;gap:4px;">';for(let t=0;t<this.slots;t++){const s=this.actions[t],i=s?q.getBinding(s.actionId):null;e+=`
                <div class="action-slot" data-slot="${t}" data-action="${s?.actionId||""}">
                    <span class="slot-icon">${s?.icon||"+"}</span>
                    <span class="slot-key">${i?.key||t+1}</span>
                    <div class="slot-cooldown"></div>
                    <div class="action-slot-tooltip">${i?.name||"Empty Slot"}<br><span style="color:#6ee7b7">[${i?.key||"Unbound"}]</span></div>
                </div>
            `}return e+="</div>",e}bindEvents(){this.container.querySelectorAll(".action-slot").forEach(e=>{e.addEventListener("click",t=>{const s=e.dataset.action;s&&this.onAction&&this.onAction(s)}),e.addEventListener("contextmenu",t=>{t.preventDefault();const s=parseInt(e.dataset.slot);this.openSlotEditor(s)})})}openSlotEditor(e){this.editingSlot=e;const t=this.actions[e],s=t?q.getBinding(t.actionId):null,i=document.createElement("div");i.className="modal-backdrop",i.id="slot-edit-backdrop",i.onclick=()=>this.closeSlotEditor(),document.body.appendChild(i);const n=document.createElement("div");n.className="slot-edit-modal",n.id="slot-edit-modal",n.innerHTML=`
            <div class="slot-edit-header">
                <span class="slot-edit-title">Edit Slot ${e+1}</span>
                <button class="slot-edit-close" onclick="document.getElementById('slot-edit-backdrop').click()">×</button>
            </div>
            <div class="slot-edit-row">
                <span class="slot-edit-label">Keybind</span>
                <input type="text" class="slot-edit-input" id="slot-keybind" value="${s?.key||""}" readonly>
                <button class="slot-edit-btn" id="rebind-btn">Rebind</button>
            </div>
            <div class="slot-edit-row">
                <span class="slot-edit-label">Animation</span>
                <select class="slot-edit-input" id="slot-animation">
                    <option value="">-- Select Animation --</option>
                    ${Fs.map(a=>`
                        <option value="${a.id}" ${s?.animation===a.id?"selected":""}>${a.name} (${a.category})</option>
                    `).join("")}
                </select>
            </div>
            <div class="slot-edit-row">
                <span class="slot-edit-label">Preview</span>
                <div class="animation-preview" id="animation-preview">
                    Animation preview available in-game
                </div>
            </div>
            <div class="slot-edit-row" style="justify-content: flex-end;">
                <button class="slot-edit-btn" id="save-slot-btn">Save Changes</button>
            </div>
        `,document.body.appendChild(n),document.getElementById("rebind-btn").addEventListener("click",()=>{const a=document.getElementById("rebind-btn");a.textContent="Press any key...",a.classList.add("waiting"),t?.actionId&&q.startRebind(t.actionId,(o,r)=>{document.getElementById("slot-keybind").value=r,a.textContent="Rebind",a.classList.remove("waiting"),this.refresh()})}),document.getElementById("slot-animation").addEventListener("change",a=>{t?.actionId&&q.setAnimation(t.actionId,a.target.value)}),document.getElementById("save-slot-btn").addEventListener("click",()=>{this.closeSlotEditor(),this.refresh()})}closeSlotEditor(){q.cancelRebind(),document.getElementById("slot-edit-backdrop")?.remove(),document.getElementById("slot-edit-modal")?.remove(),this.editingSlot=null}setAction(e,t){this.actions[e]=t,this.refresh()}setCooldown(e,t){const s=this.container.querySelector(`[data-slot="${e}"]`);if(!s)return;s.classList.add("on-cooldown");const i=s.querySelector(".slot-cooldown");let n=t;const a=setInterval(()=>{n-=.1,n<=0?(clearInterval(a),s.classList.remove("on-cooldown"),i.textContent=""):i.textContent=n.toFixed(1)},100)}refresh(){const e=this.container.querySelector(".action-bar-slots");e&&(e.outerHTML=this.render(),this.bindEvents())}destroy(){this.container?.remove()}}class qs{constructor(){this.bars=new Map}create(e,t){const s=new js({id:e,...t});return s.create(),this.bars.set(e,s),s}get(e){return this.bars.get(e)}remove(e){const t=this.bars.get(e);t&&(t.destroy(),this.bars.delete(e))}createDefaultLayout(){return this.create("actionbar-1",{position:"bottom",slots:8,actions:[{actionId:"attack_light",icon:"⚔️"},{actionId:"attack_heavy",icon:"🗡️"},{actionId:"attack_special",icon:"💫"},{actionId:"block",icon:"🛡️"},{actionId:"skill_1",icon:"🔥"},{actionId:"skill_2",icon:"❄️"},{actionId:"skill_3",icon:"⚡"},{actionId:"skill_4",icon:"🌀"}]}),this.create("actionbar-2",{position:"bottom-2",slots:6,actions:[{actionId:"potion_health",icon:"❤️"},{actionId:"potion_mana",icon:"💙"},{actionId:"dodge_left",icon:"◀️"},{actionId:"dodge_right",icon:"▶️"},{actionId:"ultimate",icon:"🌟"},{actionId:"interact",icon:"🤝"}]}),this.create("actionbar-3",{position:"left",slots:4,actions:[{actionId:"target_lock",icon:"🎯"},{actionId:"sprint",icon:"🏃"},{actionId:"jump",icon:"⬆️"},{actionId:"menu",icon:"⚙️"}]}),this}hideAll(){this.bars.forEach(e=>e.container.style.display="none")}showAll(){this.bars.forEach(e=>e.container.style.display="flex")}destroyAll(){this.bars.forEach(e=>e.destroy()),this.bars.clear()}}const de=new qs,Se={DEFAULT:0,ARENA:1,PLAYER:2,MONSTERS:3,UI:4,EFFECTS:5,MESH:6,TEXTURE:7};function ke(c,e){c.layers.set(e),c.traverse(t=>{t.layers.set(e)})}class Gs{constructor(e,t){this.renderer=e,this.camera=t,this.scene=new Me,this.clock=new pt,this.stateMachine=new mt,this.player=null,this.opponent=null,this.aiController=null,this.entities=new Map,this.cameraManager=null,this.targetingSystem=null,this.physics=null,this.terrain=null,this.arenaModel=null,this.lights=[],this.environmentObjects=[],this.callbacks={onLoadProgress:null,onStateChange:null,onHealthUpdate:null,onRoundEnd:null,onMatchEnd:null,onCameraModeChange:null},this.config={arenaWidth:40,arenaDepth:30,playerStartDistance:15,roundTime:90,roundsToWin:2,maxRounds:3,countdownDuration:3},this.setupStateListeners()}setupStateListeners(){this.stateMachine.on("stateChange",e=>{this.onStateTransition(e),this.callbacks.onStateChange?.(e.to,e.data)}),this.stateMachine.on("dataChange",e=>{this.stateMachine.isFighting()&&this.callbacks.onHealthUpdate?.(e.playerHealth/e.playerMaxHealth,e.opponentHealth/e.opponentMaxHealth,Math.ceil(e.roundTimer))})}onStateTransition(e){switch(e.to){case y.COUNTDOWN:this.startCountdown();break;case y.FIGHTING:this.startFighting();break;case y.ROUND_END:this.handleRoundEnd(e.data);break;case y.MATCH_END:this.handleMatchEnd(e.data);break;case y.MENU:this.returnToMenu();break}}async init(){this.reportProgress(5,"Initializing physics..."),await this.initPhysics(),this.reportProgress(15,"Setting up lighting..."),this.setupLighting(),this.reportProgress(25,"Creating environment..."),this.setupEnvironment(),this.reportProgress(40,"Loading arena model..."),await this.loadArenaModel(),this.reportProgress(60,"Generating terrain..."),this.createTerrain(),this.reportProgress(75,"Creating fighters..."),await this.createFighters(),this.reportProgress(90,"Setting up camera and systems..."),this.setupCamera(),this.setupTargeting(),this.setupActionBars(),this.setupHotkeys(),this.reportProgress(100,"Ready!"),this.stateMachine.dispatch(T.LOAD_COMPLETE)}reportProgress(e,t){this.stateMachine.updateData({loadProgress:e,loadStatus:t}),this.callbacks.onLoadProgress?.(e,t)}async initPhysics(){try{this.physics=await Ps(),this.physics.createGroundCollider({x:this.config.arenaWidth,z:this.config.arenaDepth},0)}catch(e){console.warn("Physics initialization failed:",e)}}setupLighting(){const e=new qe(4210784,.5);this.scene.add(e),this.lights.push(e);const t=new K(16777215,1.5);t.position.set(10,20,10),t.castShadow=!0,t.shadow.mapSize.width=2048,t.shadow.mapSize.height=2048,t.shadow.camera.near=.5,t.shadow.camera.far=50,t.shadow.camera.left=-30,t.shadow.camera.right=30,t.shadow.camera.top=30,t.shadow.camera.bottom=-30,t.shadow.bias=-1e-4,this.scene.add(t),this.lights.push(t);const s=new K(8947967,.3);s.position.set(-10,10,-10),this.scene.add(s),this.lights.push(s);const i=new K(16746564,.4);i.position.set(0,5,-15),this.scene.add(i),this.lights.push(i)}setupEnvironment(){this.scene.background=new D(657946),this.scene.fog=new Pt(657946,.015);const e=new ne(150,150),t=new M({color:1710638,metalness:.2,roughness:.8}),s=new k(e,t);s.rotation.x=-Math.PI/2,s.position.y=-.01,s.receiveShadow=!0,this.scene.add(s),this.environmentObjects.push(s);const i=new ne(this.config.arenaWidth,this.config.arenaDepth),n=new M({color:2763342,metalness:.3,roughness:.6}),a=new k(i,n);a.rotation.x=-Math.PI/2,a.position.y=.01,a.receiveShadow=!0,this.scene.add(a),this.environmentObjects.push(a),this.createArenaBoundary()}createArenaBoundary(){const{arenaWidth:e,arenaDepth:t}=this.config,s=e/2,i=t/2,n=new M({color:6717162,emissive:3359863,metalness:.8,roughness:.2});[{pos:[0,.3,-i-.2],size:[e+.8,.6,.4]},{pos:[0,.3,i+.2],size:[e+.8,.6,.4]},{pos:[-s-.2,.3,0],size:[.4,.6,t]},{pos:[s+.2,.3,0],size:[.4,.6,t]}].forEach(({pos:r,size:l})=>{const h=new j(...l),d=new k(h,n);d.position.set(...r),d.castShadow=!0,d.receiveShadow=!0,this.scene.add(d),this.environmentObjects.push(d)}),[{x:-s,z:-i},{x:s,z:-i},{x:-s,z:i},{x:s,z:i}].forEach(r=>{const l=new se(.5,.6,5,8),h=new M({color:3816030,metalness:.5,roughness:.5}),d=new k(l,h);d.position.set(r.x,2.5,r.z),d.castShadow=!0,this.scene.add(d),this.environmentObjects.push(d);const f=new te(.3,16,16),p=new J({color:6717162}),u=new k(f,p);u.position.set(r.x,5.5,r.z),this.scene.add(u),this.environmentObjects.push(u);const g=new Ge(6717162,.5,12);g.position.copy(u.position),this.scene.add(g),this.lights.push(g)})}async loadArenaModel(){const e=new me;try{const t=await new Promise((n,a)=>{e.load(ze("/models/arena.glb"),n,o=>{if(o.total){const r=40+o.loaded/o.total*20;this.reportProgress(r,"Loading arena model...")}},a)});this.arenaModel=t.scene,this.arenaModel.traverse(n=>{n.isMesh&&(n.castShadow=!0,n.receiveShadow=!0)});const s=new $e().setFromObject(this.arenaModel),i=s.getCenter(new m);this.arenaModel.position.x-=i.x,this.arenaModel.position.z-=i.z,this.arenaModel.position.y-=s.min.y,ke(this.arenaModel,Se.ARENA),this.scene.add(this.arenaModel)}catch(t){console.warn("Could not load arena model:",t)}}createTerrain(){this.terrain=new Ss({width:200,depth:200,segments:128,scale:1,height:3,frequency:.3});const e=this.terrain.getMesh();e.position.set(80,-15,60),ke(e,Se.ARENA),this.scene.add(e)}async createFighters(){const e=ze("/models/characters/viking/scene.gltf"),t=ze("/models/characters/orc/scene.gltf"),s=this.config.playerStartDistance;this.player=new ge({type:Ae.PLAYER,name:"Viking Warrior",position:new m(-s/2,0,0),rotation:0,modelPath:e,color:4906624,stats:{maxHealth:100,health:100,strength:12,dexterity:10,constitution:11}}),this.opponent=new ge({type:Ae.AI,name:"Orc Warrior",position:new m(s/2,0,0),rotation:Math.PI,modelPath:t,color:15680580,stats:{maxHealth:100,health:100,strength:14,dexterity:8,constitution:12}}),await Promise.all([this.player.loadModel(),this.opponent.loadModel()]),ke(this.player.group,Se.PLAYER),ke(this.opponent.group,Se.MONSTERS),this.scene.add(this.player.group),this.scene.add(this.opponent.group),this.entities.set(this.player.id,this.player),this.entities.set(this.opponent.id,this.opponent),this.aiController=new xs(this.opponent,"MEDIUM"),this.aiController.setTarget(this.player),this.stateMachine.updateData({playerHealth:this.player.stats.health,playerMaxHealth:this.player.stats.maxHealth,opponentHealth:this.opponent.stats.health,opponentMaxHealth:this.opponent.stats.maxHealth})}setupCamera(){this.camera.position.set(0,15,25),this.camera.lookAt(0,0,0),this.cameraManager=new Ls(this.camera),this.cameraManager.onModeChange=(e,t)=>{this.callbacks.onCameraModeChange?.(e,t)}}setupTargeting(){this.targetingSystem=new Us(this.scene,this.camera,this.renderer),this.opponent&&this.targetingSystem.registerTarget(this.opponent.group,{name:this.opponent.name,health:this.opponent.stats.health,maxHealth:this.opponent.stats.maxHealth,faction:"enemy"}),this.targetingSystem.onTargetChange=e=>{console.log("Target:",e?.userData?.targetData?.name)}}setupActionBars(){de.createDefaultLayout(),de.hideAll()}setupHotkeys(){q.on("attack_light",()=>this.performPlayerAction("attack_light")),q.on("attack_heavy",()=>this.performPlayerAction("attack_heavy")),q.on("attack_special",()=>this.performPlayerAction("attack_special")),q.on("block",()=>this.performPlayerAction("block")),q.on("target_lock",()=>this.cycleTarget())}performPlayerAction(e){if(!(!this.player||!this.stateMachine.isFighting()))switch(e){case"attack_light":case"attack_heavy":case"attack_special":const t=e.replace("attack_",""),s=this.player.attack(t);if(s&&this.player.canAttack(this.opponent)){const i=this.opponent.takeDamage(s.damage,this.player);this.updateHealthDisplay(),i.killed&&this.stateMachine.dispatch(T.FIGHTER_DEFEATED,{winner:"player"})}break;case"block":this.player.startBlock();break}}cycleTarget(){if(this.targetingSystem)if(this.targetingSystem.currentTarget)this.targetingSystem.toggleLock();else{const e=this.player?.getPosition()||new m,t=new m;this.camera.getWorldDirection(t);const s=this.targetingSystem.findNearestTarget(e,t);s&&(this.targetingSystem.setTarget(s),this.targetingSystem.lockTarget())}}startMatch(){this.resetFighters(),this.stateMachine.dispatch(T.START_MATCH),de.showAll()}startCountdown(){let e=this.config.countdownDuration;const t=setInterval(()=>{e--,this.stateMachine.updateData({countdownTimer:e}),e<=0&&(clearInterval(t),this.stateMachine.dispatch(T.COUNTDOWN_DONE))},1e3)}startFighting(){this.stateMachine.updateData({roundTimer:this.config.roundTime})}handleRoundEnd(e){const{scores:t,roundNumber:s}=e;if(this.callbacks.onRoundEnd?.(s,e.winner==="player",t),t.player>=this.config.roundsToWin||t.opponent>=this.config.roundsToWin){const i=t.player>=this.config.roundsToWin?"player":"opponent";this.stateMachine.dispatch(T.MATCH_WON,{matchWinner:i})}else this.stateMachine.updateData({roundNumber:s+1}),setTimeout(()=>{this.resetFighters(),this.stateMachine.dispatch(T.NEXT_ROUND)},2e3)}handleMatchEnd(e){this.callbacks.onMatchEnd?.(e.matchWinner==="player",e.scores),de.hideAll()}returnToMenu(){this.resetFighters(),de.hideAll()}resetFighters(){const e=this.config.playerStartDistance;this.player&&(this.player.respawn(new m(-e/2,0,0)),this.player.group.rotation.y=0),this.opponent&&(this.opponent.respawn(new m(e/2,0,0)),this.opponent.group.rotation.y=Math.PI),this.aiController&&this.aiController.reset(),this.updateHealthDisplay()}updateHealthDisplay(){this.stateMachine.updateData({playerHealth:this.player?.stats.health||0,opponentHealth:this.opponent?.stats.health||0})}update(e,t=!1){const s=this.clock.getDelta();if(this.physics&&this.physics.step(s),this.terrain&&this.terrain.update(s,.2),this.stateMachine.isFighting()){const n=this.stateMachine.getData().roundTimer-s;if(n<=0){const a=this.player.stats.health>this.opponent.stats.health?"player":"opponent";this.stateMachine.dispatch(T.ROUND_TIMEOUT,{winner:a})}else this.stateMachine.updateData({roundTimer:n});this.updatePlayer(s,e,t),this.updateOpponent(s),this.checkCombat(),this.targetingSystem&&(this.targetingSystem.update(this.player?.getPosition()||new m),this.opponent&&this.targetingSystem.updateTargetHealth(this.opponent.stats.health,this.opponent.stats.maxHealth))}this.entities.forEach(i=>{i.update(s)}),this.cameraManager&&this.stateMachine.isActive()&&this.cameraManager.update(this.player,this.opponent,e,s,t),this.render()}updatePlayer(e,t,s){if(!this.player||!t)return;const i=new m;if(t.isForward()&&(i.z-=1),t.isBackward()&&(i.z+=1),t.isLeft()&&(i.x-=1),t.isRight()&&(i.x+=1),this.camera&&i.lengthSq()>0){const a=new m;this.camera.getWorldDirection(a),a.y=0,a.normalize();const o=new m;o.crossVectors(a,new m(0,1,0));const r=new m;r.addScaledVector(a,-i.z),r.addScaledVector(o,i.x),i.copy(r)}const n=t.isRunning?.()||!1;this.player.move(i,e,n),s&&this.opponent&&this.player.lookAt(this.opponent),this.constrainToArena(this.player)}updateOpponent(e){if(!this.opponent||!this.aiController)return;const t=this.aiController.update(e);if(t.moveDirection.lengthSq()>0&&this.opponent.move(t.moveDirection,e,t.run),t.attack&&this.opponent.canAttack(this.player)){const s=this.opponent.attack(t.attackType||"light");if(s){const i=this.player.takeDamage(s.damage,this.opponent);this.updateHealthDisplay(),i.killed&&this.stateMachine.dispatch(T.FIGHTER_DEFEATED,{winner:"opponent"})}}t.block?this.opponent.startBlock():this.opponent.state.isBlocking&&this.opponent.endBlock(),this.constrainToArena(this.opponent)}checkCombat(){!this.player?.state.isAlive||!this.opponent?.state.isAlive||(this.player.state.isAlive?this.opponent.state.isAlive||this.stateMachine.dispatch(T.FIGHTER_DEFEATED,{winner:"player"}):this.stateMachine.dispatch(T.FIGHTER_DEFEATED,{winner:"opponent"}))}constrainToArena(e){const{arenaWidth:t,arenaDepth:s}=this.config,i=t/2-1,n=s/2-1,a=e.group.position;a.x=_.clamp(a.x,-i,i),a.z=_.clamp(a.z,-n,n)}render(){this.targetingSystem?this.targetingSystem.render()||this.renderer.render(this.scene,this.camera):this.renderer.render(this.scene,this.camera)}setCameraMode(e){const t=Object.values(G);e>=0&&e<t.length&&this.cameraManager&&this.cameraManager.setMode(t[e],this.player,this.opponent)}pause(){this.stateMachine.isFighting()&&this.stateMachine.dispatch(T.PAUSE)}resume(){this.stateMachine.getState()===y.PAUSED&&(this.stateMachine.dispatch(T.RESUME),this.clock.getDelta())}quit(){this.stateMachine.dispatch(T.QUIT)}getState(){return this.stateMachine.getState()}getScene(){return this.scene}dispose(){this.entities.forEach(e=>e.dispose()),this.entities.clear(),this.terrain&&this.terrain.dispose(),this.environmentObjects.forEach(e=>{e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(t=>t.dispose()):e.material.dispose())}),this.scene.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(t=>t.dispose()):e.material.dispose())})}}class $s{constructor(){this.keys={},this.keysJustPressed={},this.mouse={x:0,y:0,dx:0,dy:0},this.mouseButtons={left:!1,right:!1},this.isPointerLocked=!1,this.tabTargetPressed=!1,this.cameraModePressed=null,this.bindEvents()}bindEvents(){document.addEventListener("keydown",e=>{this.keys[e.code]||(this.keysJustPressed[e.code]=!0),this.keys[e.code]=!0,e.code==="Tab"&&(e.preventDefault(),this.tabTargetPressed=!0),e.repeat||(e.code==="F1"&&(e.preventDefault(),this.cameraModePressed=0),e.code==="F2"&&(e.preventDefault(),this.cameraModePressed=1),e.code==="F3"&&(e.preventDefault(),this.cameraModePressed=2),e.code==="F4"&&(e.preventDefault(),this.cameraModePressed=3),e.code==="F5"&&(e.preventDefault(),this.cameraModePressed=4),e.code==="F6"&&(e.preventDefault(),this.cameraModePressed=5))}),document.addEventListener("keyup",e=>{this.keys[e.code]=!1,this.keysJustPressed[e.code]=!1}),document.addEventListener("mousemove",e=>{this.isPointerLocked&&(this.mouse.dx=e.movementX,this.mouse.dy=e.movementY),this.mouse.x=e.clientX,this.mouse.y=e.clientY}),document.addEventListener("mousedown",e=>{e.button===0&&(this.mouseButtons.left=!0),e.button===2&&(this.mouseButtons.right=!0)}),document.addEventListener("mouseup",e=>{e.button===0&&(this.mouseButtons.left=!1),e.button===2&&(this.mouseButtons.right=!1)}),document.addEventListener("pointerlockchange",()=>{this.isPointerLocked=document.pointerLockElement!==null}),document.addEventListener("contextmenu",e=>e.preventDefault())}requestPointerLock(e){e.requestPointerLock()}exitPointerLock(){document.exitPointerLock()}isKeyDown(e){return this.keys[e]===!0}getMovementVector(){let e=0,t=0;(this.isKeyDown("KeyW")||this.isKeyDown("ArrowUp"))&&(t-=1),(this.isKeyDown("KeyS")||this.isKeyDown("ArrowDown"))&&(t+=1),(this.isKeyDown("KeyA")||this.isKeyDown("ArrowLeft"))&&(e-=1),(this.isKeyDown("KeyD")||this.isKeyDown("ArrowRight"))&&(e+=1);const s=Math.sqrt(e*e+t*t);return s>0&&(e/=s,t/=s),{x:e,z:t}}consumeMouseDelta(){const e={x:this.mouse.dx,y:this.mouse.dy};return this.mouse.dx=0,this.mouse.dy=0,e}isJumpPressed(){return this.isKeyDown("Space")}isLightAttack(){return this.mouseButtons.left}isHeavyAttack(){return this.mouseButtons.right}isSpecialAttack(){return this.isKeyDown("KeyQ")}isRunning(){return this.isKeyDown("ShiftLeft")||this.isKeyDown("ShiftRight")}isForward(){return this.isKeyDown("KeyW")||this.isKeyDown("ArrowUp")}isBackward(){return this.isKeyDown("KeyS")||this.isKeyDown("ArrowDown")}isLeft(){return this.isKeyDown("KeyA")||this.isKeyDown("ArrowLeft")}isRight(){return this.isKeyDown("KeyD")||this.isKeyDown("ArrowRight")}isTabTargetPressed(){const e=this.tabTargetPressed;return this.tabTargetPressed=!1,e}getCameraModePressed(){const e=this.cameraModePressed;return this.cameraModePressed=null,e}update(){Object.keys(this.keysJustPressed).forEach(e=>{this.keysJustPressed[e]=!1})}}const B={LOADING:"loading",MENU:"menu",PLAYING:"playing",PAUSED:"paused",ROUND_END:"round_end",MATCH_END:"match_end"};class Ws{constructor(){this.screens={loading:document.getElementById("loading-screen"),menu:document.getElementById("menu-screen"),hud:document.getElementById("hud"),pause:document.getElementById("pause-menu")},this.elements={loadingProgress:document.querySelector(".loading-progress"),loadingStatus:document.getElementById("loading-status"),p1Health:document.getElementById("p1-health"),p2Health:document.getElementById("p2-health"),roundNumber:document.getElementById("round-number"),roundTimer:document.getElementById("round-timer"),p1Score:document.getElementById("p1-score"),p2Score:document.getElementById("p2-score"),announcement:document.getElementById("round-announcement"),announcementText:document.getElementById("announcement-text")},this.callbacks={}}init(e){this.callbacks=e,this.bindEvents()}bindEvents(){document.getElementById("btn-arena")?.addEventListener("click",()=>{this.callbacks.onEnterArena&&this.callbacks.onEnterArena()}),document.getElementById("btn-practice")?.addEventListener("click",()=>{this.callbacks.onStartMatch&&this.callbacks.onStartMatch()}),document.getElementById("btn-world-builder")?.addEventListener("click",()=>{this.callbacks.onWorldBuilder&&this.callbacks.onWorldBuilder()}),document.getElementById("btn-playground")?.addEventListener("click",()=>{window.location.href="/playground.html"}),document.getElementById("btn-builder")?.addEventListener("click",()=>{window.location.href="/character-builder.html"}),document.getElementById("btn-skills")?.addEventListener("click",()=>{window.location.href="/skill-tree.html"}),document.getElementById("btn-viewer")?.addEventListener("click",()=>{window.location.href="/viewer.html"}),document.getElementById("btn-assets")?.addEventListener("click",()=>{window.location.href="/assets.html"}),document.getElementById("btn-resume")?.addEventListener("click",()=>{this.callbacks.onResume&&this.callbacks.onResume()}),document.getElementById("btn-quit")?.addEventListener("click",()=>{this.callbacks.onQuit&&this.callbacks.onQuit()}),document.addEventListener("keydown",e=>{e.code==="Escape"&&this.callbacks.onPause&&this.callbacks.onPause()})}showScreen(e){Object.values(this.screens).forEach(t=>{t&&t.classList.remove("active")}),this.screens[e]&&this.screens[e].classList.add("active")}hideAllScreens(){Object.values(this.screens).forEach(e=>{e&&e.classList.remove("active")})}updateLoadingProgress(e,t){this.elements.loadingProgress&&(this.elements.loadingProgress.style.width=`${e}%`),this.elements.loadingStatus&&(this.elements.loadingStatus.textContent=t)}onStateChange(e){switch(e){case B.LOADING:this.showScreen("loading");break;case B.MENU:this.showScreen("menu");break;case B.PLAYING:this.showScreen("hud");break;case B.PAUSED:this.showScreen("pause");break;case B.MATCH_END:this.showScreen("menu");break}}updateHealth(e,t,s){this.elements.p1Health&&(this.elements.p1Health.style.width=`${e*100}%`),this.elements.p2Health&&(this.elements.p2Health.style.width=`${t*100}%`),this.elements.roundTimer&&(this.elements.roundTimer.textContent=s)}updateRound(e,t){this.elements.roundNumber&&(this.elements.roundNumber.textContent=`Round ${e}`),this.elements.p1Score&&(this.elements.p1Score.textContent=t.player),this.elements.p2Score&&(this.elements.p2Score.textContent=t.opponent)}showAnnouncement(e,t=2e3){this.elements.announcement&&this.elements.announcementText&&(this.elements.announcementText.textContent=e,this.elements.announcement.classList.remove("hidden"),setTimeout(()=>{this.elements.announcement.classList.add("hidden")},t))}showRoundStart(e){this.updateRound(e,{player:0,opponent:0}),this.showAnnouncement(`ROUND ${e}`,1500),setTimeout(()=>{this.showAnnouncement("FIGHT!",1e3)},1500)}showRoundEnd(e){const t=e?"YOU WIN!":"YOU LOSE!";this.showAnnouncement(t,2e3)}showMatchEnd(e,t){const s=e?"VICTORY!":"DEFEAT!";this.showAnnouncement(s,3e3)}}const Te={CHARACTER_SELECT:"character_select",WORLD_BUILDER:"world_builder"};class Vs{constructor(e,t){this.renderer=e,this.camera=t,this.currentScene=null,this.scenes=new Map,this.transitions=new Map,this.isTransitioning=!1,this.onSceneChange=null}registerScene(e,t){this.scenes.set(e,t)}async switchTo(e,t={}){if(this.isTransitioning)return;if(this.isTransitioning=!0,this.currentScene){const i=this.scenes.get(this.currentScene);i&&i.onExit&&await i.onExit()}if(e===null||!this.scenes.has(e))return this.currentScene=null,this.isTransitioning=!1,this.onSceneChange&&this.onSceneChange(null,t),null;const s=this.scenes.get(e);return s.onEnter&&await s.onEnter(t),this.currentScene=e,this.isTransitioning=!1,this.onSceneChange&&this.onSceneChange(e,t),s}async exitCurrentScene(){if(this.currentScene){const e=this.scenes.get(this.currentScene);e&&e.onExit&&await e.onExit(),this.currentScene=null}}getCurrentScene(){return this.currentScene?this.scenes.get(this.currentScene):null}update(e){const t=this.getCurrentScene();t&&t.update&&t.update(e)}render(){const e=this.getCurrentScene();e&&(e.render?e.render():e.threeScene&&this.renderer.render(e.threeScene,this.camera))}}class St{constructor(e){this.name=e,this.threeScene=new Me,this.isActive=!1,this.data={}}async onEnter(e={}){this.data=e,this.isActive=!0,console.log(`Entering scene: ${this.name}`)}async onExit(){this.isActive=!1,console.log(`Exiting scene: ${this.name}`)}update(e){}dispose(){this.threeScene.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(t=>t.dispose()):e.material.dispose())})}}const Z=[{id:"viking",name:"Viking Warrior",model:"/models/characters/viking.glb",fallback:"/models/characters/viking/scene.gltf",description:"Heavy-hitting Norse warrior with axe",collider:{type:"capsule",radius:.5,height:1.8},isDefault:!0},{id:"orc",name:"Orc Warrior",model:"/models/characters/orc.glb",fallback:"/models/characters/orc/scene.gltf",description:"Brutal orc fighter with massive strength",collider:{type:"capsule",radius:.6,height:2}},{id:"wolf",name:"Shadow Wolf",model:"/models/characters/wolf.glb",fallback:"/models/characters/wolf/scene.gltf",description:"Swift beast with deadly fangs",collider:{type:"capsule",radius:.4,height:1}},{id:"shepherd",name:"War Hound",model:"/models/characters/shepherd.glb",fallback:"/models/characters/shepherd/scene.gltf",description:"Loyal companion with ferocious attacks",collider:{type:"capsule",radius:.35,height:.9}},{id:"toon",name:"Toon Fighter",model:"/models/characters/toon_character.glb",description:"Animated cartoon warrior",collider:{type:"capsule",radius:.5,height:1.8}},{id:"swimmer",name:"Aqua Warrior",model:"/models/characters/swimmer.glb",description:"Agile fighter from the depths",collider:{type:"capsule",radius:.5,height:1.8}},{id:"base",name:"Arena Fighter",model:"/models/characters/base_character.glb",description:"Classic arena combatant",collider:{type:"capsule",radius:.5,height:1.8}}],Re=[{id:"sword",name:"Iron Sword",damage:10,speed:1,type:"melee"},{id:"axe",name:"Battle Axe",damage:15,speed:.7,type:"melee"},{id:"spear",name:"War Spear",damage:12,speed:.9,type:"melee"}],Be=[{id:"warrior",name:"Warrior",stats:{strength:30,vitality:25,endurance:25}},{id:"mage",name:"Battle Mage",stats:{intellect:35,wisdom:25,agility:20}},{id:"rogue",name:"Shadow Rogue",stats:{dexterity:30,agility:30,tactics:20}}];class Ks extends St{constructor(){super("character_select"),this.loader=new me,this.heroModels=[],this.selectedHero=0,this.selectedWeapon=0,this.selectedClass=0,this.rotationSpeed=.5,this.heroGroup=new H,this.onConfirm=null}async onEnter(e={}){await super.onEnter(e),this.setupScene(),this.setupLighting(),await this.loadHeroes(),this.createUI()}setupScene(){this.threeScene.background=new D(657941);const e=new k(new se(3,3.5,.3,32),new M({color:1710638,metalness:.8,roughness:.3}));e.position.y=-1.5,this.threeScene.add(e);const t=new k(new Ot(3.2,.05,16,64),new J({color:7268279}));t.rotation.x=-Math.PI/2,t.position.y=-1.35,this.threeScene.add(t),this.threeScene.add(this.heroGroup)}setupLighting(){const e=new qe(16777215,.5);this.threeScene.add(e);const t=new K(16777215,1);t.position.set(5,5,5),this.threeScene.add(t);const s=new K(7268279,.5);s.position.set(-5,3,-5),this.threeScene.add(s);const i=new We(16777215,1.5);i.position.set(0,8,0),i.angle=Math.PI/6,i.penumbra=.5,this.threeScene.add(i)}async loadHeroes(){for(let e=0;e<Z.length;e++){const t=Z[e];let s=null;try{s=(await this.loader.loadAsync(t.model)).scene}catch{if(t.fallback)try{console.log(`Trying fallback for ${t.name}: ${t.fallback}`),s=(await this.loader.loadAsync(t.fallback)).scene}catch{console.warn(`Failed to load fallback for ${t.name}`)}}if(s)s.scale.setScalar(1.5),s.position.set(e*4-4,-1.2,0),s.visible=e===0,s.userData.heroId=t.id,s.userData.collider=t.collider,this.heroGroup.add(s),this.heroModels.push(s);else{console.warn(`Failed to load hero model: ${t.model}`);const i=new k(new dt(t.collider?.radius||.5,t.collider?.height||1.8,8,16),new M({color:7268279}));i.position.set(e*4-4,0,0),i.visible=e===0,i.userData.heroId=t.id,i.userData.collider=t.collider,this.heroGroup.add(i),this.heroModels.push(i)}}}selectHero(e){this.heroModels.forEach((t,s)=>{t.visible=s===e}),this.selectedHero=e,this.updateUI()}selectWeapon(e){this.selectedWeapon=e,this.updateUI()}selectClass(e){this.selectedClass=e,this.updateUI()}createUI(){const e=document.getElementById("character-select-ui");e&&e.remove();const t=document.createElement("div");t.id="character-select-ui",t.innerHTML=`
            <style>
                #character-select-ui {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: 100;
                    font-family: 'Jost', sans-serif;
                }
                .cs-panel {
                    position: absolute;
                    background: linear-gradient(135deg, rgba(20,26,43,0.95), rgba(20,26,43,0.8));
                    border: 1px solid #2a3150;
                    border-radius: 12px;
                    padding: 20px;
                    pointer-events: auto;
                    color: #e8eaf6;
                }
                .cs-title {
                    font-size: 1.5rem;
                    color: #6ee7b7;
                    margin-bottom: 15px;
                    font-weight: 700;
                }
                .cs-options { display: flex; flex-direction: column; gap: 8px; }
                .cs-option {
                    padding: 12px 16px;
                    background: rgba(42, 49, 80, 0.5);
                    border: 2px solid transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cs-option:hover { border-color: #6ee7b7; }
                .cs-option.selected { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.15); }
                .cs-option-name { font-weight: 600; }
                .cs-option-desc { font-size: 0.85rem; color: #a5b4d0; margin-top: 4px; }
                .cs-hero-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    justify-content: space-between;
                    width: 100%;
                    padding: 0 20px;
                    box-sizing: border-box;
                    pointer-events: none;
                }
                .cs-nav-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(20, 26, 43, 0.9);
                    border: 2px solid #6ee7b7;
                    color: #6ee7b7;
                    font-size: 24px;
                    cursor: pointer;
                    pointer-events: auto;
                    transition: all 0.2s;
                }
                .cs-nav-btn:hover { background: #6ee7b7; color: #0a0a15; }
                .cs-confirm-panel {
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    text-align: center;
                }
                .cs-confirm-btn {
                    padding: 15px 60px;
                    font-size: 1.2rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #6ee7b7, #10b981);
                    border: none;
                    border-radius: 8px;
                    color: #0a0a15;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .cs-confirm-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(110, 231, 183, 0.4); }
                .cs-summary { margin-top: 10px; color: #a5b4d0; font-size: 0.9rem; }
                .cs-back-btn {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    padding: 10px 20px;
                    background: rgba(42, 49, 80, 0.8);
                    border: 1px solid #2a3150;
                    border-radius: 6px;
                    color: #e8eaf6;
                    cursor: pointer;
                    pointer-events: auto;
                }
                .cs-back-btn:hover { background: rgba(42, 49, 80, 1); }
            </style>
            
            <button class="cs-back-btn" id="cs-back">← Back to Menu</button>
            
            <div class="cs-panel" style="left: 30px; top: 50%; transform: translateY(-50%); width: 280px;">
                <div class="cs-title">Select Class</div>
                <div class="cs-options" id="class-options"></div>
            </div>

            <div class="cs-hero-nav">
                <button class="cs-nav-btn" id="hero-prev">‹</button>
                <button class="cs-nav-btn" id="hero-next">›</button>
            </div>

            <div class="cs-panel" style="right: 30px; top: 50%; transform: translateY(-50%); width: 280px;">
                <div class="cs-title">Select Weapon</div>
                <div class="cs-options" id="weapon-options"></div>
            </div>

            <div class="cs-panel cs-confirm-panel">
                <button class="cs-confirm-btn" id="cs-confirm">Enter Arena</button>
                <div class="cs-summary" id="cs-summary"></div>
            </div>
        `,document.body.appendChild(t),this.bindUIEvents(),this.updateUI()}bindUIEvents(){document.getElementById("hero-prev").onclick=()=>{this.selectHero((this.selectedHero-1+Z.length)%Z.length)},document.getElementById("hero-next").onclick=()=>{this.selectHero((this.selectedHero+1)%Z.length)},document.getElementById("cs-back").onclick=()=>{this.removeUI(),this.onBack&&this.onBack()},document.getElementById("cs-confirm").onclick=()=>{this.removeUI(),this.onConfirm&&this.onConfirm({hero:Z[this.selectedHero],weapon:Re[this.selectedWeapon],class:Be[this.selectedClass]})}}updateUI(){const e=document.getElementById("class-options");e&&(e.innerHTML=Be.map((i,n)=>`
                <div class="cs-option ${n===this.selectedClass?"selected":""}" data-class="${n}">
                    <div class="cs-option-name">${i.name}</div>
                    <div class="cs-option-desc">STR: ${i.stats.strength||0} | INT: ${i.stats.intellect||0} | DEX: ${i.stats.dexterity||0}</div>
                </div>
            `).join(""),e.querySelectorAll(".cs-option").forEach(i=>{i.onclick=()=>this.selectClass(parseInt(i.dataset.class))}));const t=document.getElementById("weapon-options");t&&(t.innerHTML=Re.map((i,n)=>`
                <div class="cs-option ${n===this.selectedWeapon?"selected":""}" data-weapon="${n}">
                    <div class="cs-option-name">${i.name}</div>
                    <div class="cs-option-desc">DMG: ${i.damage} | SPD: ${i.speed}x</div>
                </div>
            `).join(""),t.querySelectorAll(".cs-option").forEach(i=>{i.onclick=()=>this.selectWeapon(parseInt(i.dataset.weapon))}));const s=document.getElementById("cs-summary");s&&(s.textContent=`${Z[this.selectedHero].name} • ${Be[this.selectedClass].name} • ${Re[this.selectedWeapon].name}`)}removeUI(){const e=document.getElementById("character-select-ui");e&&e.remove()}update(e){const t=this.heroModels[this.selectedHero];t&&(t.rotation.y+=e*this.rotationSpeed)}async onExit(){for(await super.onExit(),this.removeUI(),this.heroModels=[];this.heroGroup.children.length>0;)this.heroGroup.remove(this.heroGroup.children[0])}dispose(){this.removeUI(),super.dispose()}}class Xs{constructor(){this.listeners=new Map}on(e,t){return this.listeners.has(e)||this.listeners.set(e,[]),this.listeners.get(e).push(t),()=>this.off(e,t)}off(e,t){const s=this.listeners.get(e);if(s){const i=s.indexOf(t);i>-1&&s.splice(i,1)}}emit(e,t){const s=this.listeners.get(e);s&&s.forEach(i=>i(t))}}class Ys{constructor(){this.events=new Xs,this.selectedObjects=[],this.hierarchyNodes=new Map,this.undoStack=[],this.redoStack=[],this.clipboardData=null,this.panels={hierarchy:!0,inspector:!0,assets:!0}}select(e){this.selectedObjects=Array.isArray(e)?e:[e],this.events.emit("selection-changed",this.selectedObjects)}clearSelection(){this.selectedObjects=[],this.events.emit("selection-changed",[])}addToSelection(e){this.selectedObjects.includes(e)||(this.selectedObjects.push(e),this.events.emit("selection-changed",this.selectedObjects))}registerNode(e,t){this.hierarchyNodes.set(e,t),this.events.emit("hierarchy-changed")}unregisterNode(e){this.hierarchyNodes.delete(e),this.events.emit("hierarchy-changed")}updateNode(e,t){const s=this.hierarchyNodes.get(e);s&&(Object.assign(s,t),this.events.emit("hierarchy-changed"))}pushUndo(e){this.undoStack.push(e),this.redoStack=[],this.events.emit("history-changed")}undo(){if(this.undoStack.length===0)return;const e=this.undoStack.pop();e.undo&&e.undo(),this.redoStack.push(e),this.events.emit("history-changed")}redo(){if(this.redoStack.length===0)return;const e=this.redoStack.pop();e.redo&&e.redo(),this.undoStack.push(e),this.events.emit("history-changed")}togglePanel(e){this.panels[e]=!this.panels[e],this.events.emit("panels-changed",this.panels)}copy(){this.selectedObjects.length>0&&(this.clipboardData=this.selectedObjects.map(e=>({type:e.userData.assetId||"unknown",position:e.position.clone(),rotation:e.rotation.clone(),scale:e.scale.clone()})),this.events.emit("clipboard-changed"))}canPaste(){return this.clipboardData!==null&&this.clipboardData.length>0}}const w=new Ys;class Qs{constructor(){this.tooltip=null,this.showDelay=500,this.hideDelay=100,this.showTimeout=null,this.hideTimeout=null,this.init()}init(){this.tooltip=document.createElement("div"),this.tooltip.id="editor-tooltip",this.tooltip.style.cssText=`
            position: fixed;
            background: rgba(20, 26, 43, 0.98);
            color: #e8eaf6;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 250px;
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.15s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            border: 1px solid rgba(110, 231, 183, 0.3);
        `,document.body.appendChild(this.tooltip),document.addEventListener("mouseover",e=>this.handleMouseOver(e)),document.addEventListener("mouseout",e=>this.handleMouseOut(e)),document.addEventListener("mousemove",e=>this.updatePosition(e))}handleMouseOver(e){const t=e.target.closest("[data-tooltip]");t&&(clearTimeout(this.hideTimeout),this.showTimeout=setTimeout(()=>{const s=t.getAttribute("data-tooltip"),i=t.getAttribute("data-shortcut");let n=s;i&&(n+=` <span style="color: #6ee7b7; margin-left: 8px;">[${i}]</span>`),this.tooltip.innerHTML=n,this.tooltip.style.opacity="1"},this.showDelay))}handleMouseOut(e){clearTimeout(this.showTimeout),this.hideTimeout=setTimeout(()=>{this.tooltip.style.opacity="0"},this.hideDelay)}updatePosition(e){if(this.tooltip.style.opacity==="0")return;const t=e.clientX+15,s=e.clientY+15,i=this.tooltip.getBoundingClientRect(),n=window.innerWidth-i.width-10,a=window.innerHeight-i.height-10;this.tooltip.style.left=`${Math.min(t,n)}px`,this.tooltip.style.top=`${Math.min(s,a)}px`}destroy(){this.tooltip&&this.tooltip.parentNode&&this.tooltip.parentNode.removeChild(this.tooltip)}}new Qs;class Js{constructor(e,t,s,i){this.container=e,this.scene=t,this.onSelect=s,this.onDelete=i,this.expandedNodes=new Set,this.contextMenu=null,this.clipboard=null,this.draggedNode=null,this.init(),w.events.on("selection-changed",()=>this.render()),w.events.on("hierarchy-changed",()=>this.render()),document.addEventListener("keydown",n=>this.handleKeyboard(n))}handleKeyboard(e){if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;const t=w.selectedObjects[0];t&&((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="c"&&this.copyObject(t),(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="v"&&this.pasteObject(),(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="x"&&this.cutObject(t))}copyObject(e){e&&(this.clipboard={object:e,isCut:!1},console.log("[Hierarchy] Copied:",e.userData.assetName||e.name))}cutObject(e){e&&(this.clipboard={object:e,isCut:!0},console.log("[Hierarchy] Cut:",e.userData.assetName||e.name))}pasteObject(){this.clipboard&&(w.events.emit("paste-object",this.clipboard),this.clipboard.isCut&&(this.clipboard=null))}init(){this.container.innerHTML=`
            <div class="hierarchy-header">
                <span>Scene Hierarchy</span>
                <button class="hierarchy-btn" data-tooltip="Expand All" data-action="expand-all">+</button>
                <button class="hierarchy-btn" data-tooltip="Collapse All" data-action="collapse-all">-</button>
            </div>
            <div class="hierarchy-search">
                <input type="text" placeholder="Search..." id="hierarchy-search-input" data-tooltip="Filter objects by name">
            </div>
            <div class="hierarchy-tree" id="hierarchy-tree"></div>
        `,this.treeContainer=this.container.querySelector("#hierarchy-tree"),this.searchInput=this.container.querySelector("#hierarchy-search-input"),this.container.querySelector('[data-action="expand-all"]').addEventListener("click",()=>this.expandAll()),this.container.querySelector('[data-action="collapse-all"]').addEventListener("click",()=>this.collapseAll()),this.searchInput.addEventListener("input",()=>this.render()),this.createContextMenu()}createContextMenu(){this.contextMenu=document.createElement("div"),this.contextMenu.className="hierarchy-context-menu",this.contextMenu.style.cssText=`
            position: fixed;
            background: rgba(20, 26, 43, 0.98);
            border: 1px solid #2a3150;
            border-radius: 8px;
            padding: 4px 0;
            min-width: 150px;
            z-index: 10001;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        `,this.contextMenu.innerHTML=`
            <div class="ctx-item" data-action="rename"><span>Rename</span><span class="ctx-shortcut">F2</span></div>
            <div class="ctx-separator"></div>
            <div class="ctx-item" data-action="cut"><span>Cut</span><span class="ctx-shortcut">Ctrl+X</span></div>
            <div class="ctx-item" data-action="copy"><span>Copy</span><span class="ctx-shortcut">Ctrl+C</span></div>
            <div class="ctx-item" data-action="paste"><span>Paste</span><span class="ctx-shortcut">Ctrl+V</span></div>
            <div class="ctx-item" data-action="duplicate"><span>Duplicate</span><span class="ctx-shortcut">Ctrl+D</span></div>
            <div class="ctx-separator"></div>
            <div class="ctx-item" data-action="focus"><span>Focus Camera</span><span class="ctx-shortcut">F</span></div>
            <div class="ctx-item" data-action="hide"><span>Hide/Show</span><span class="ctx-shortcut">H</span></div>
            <div class="ctx-item" data-action="unpack"><span>Unpack Model</span><span class="ctx-shortcut">U</span></div>
            <div class="ctx-separator"></div>
            <div class="ctx-item ctx-danger" data-action="delete"><span>Delete</span><span class="ctx-shortcut">Del</span></div>
        `,document.body.appendChild(this.contextMenu),document.addEventListener("click",()=>this.hideContextMenu()),this.contextMenu.querySelectorAll(".ctx-item").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation(),this.handleContextAction(e.dataset.action)})})}showContextMenu(e,t){e.preventDefault(),this.contextMenuTarget=t,this.contextMenu.style.display="block",this.contextMenu.style.left=`${e.clientX}px`,this.contextMenu.style.top=`${e.clientY}px`}hideContextMenu(){this.contextMenu.style.display="none"}handleContextAction(e){if(this.contextMenuTarget){switch(e){case"rename":this.startRename(this.contextMenuTarget);break;case"cut":this.cutObject(this.contextMenuTarget);break;case"copy":this.copyObject(this.contextMenuTarget);break;case"paste":this.pasteObject();break;case"duplicate":w.events.emit("duplicate-object",this.contextMenuTarget);break;case"focus":w.events.emit("focus-object",this.contextMenuTarget);break;case"hide":w.events.emit("toggle-visibility",this.contextMenuTarget);break;case"unpack":w.events.emit("unpack-object",this.contextMenuTarget);break;case"delete":this.onDelete&&this.onDelete(this.contextMenuTarget);break}this.hideContextMenu()}}startRename(e){const t=this.treeContainer.querySelector(`[data-uuid="${e.uuid}"]`);if(!t)return;const s=t.querySelector(".node-label"),i=e.userData.assetName||e.name||"Object";s.innerHTML=`<input type="text" class="rename-input" value="${i}">`;const n=s.querySelector("input");n.focus(),n.select();const a=()=>{const o=n.value.trim()||i;e.userData.assetName=o,e.name=o,this.render()};n.addEventListener("blur",a),n.addEventListener("keydown",o=>{o.key==="Enter"&&a(),o.key==="Escape"&&this.render()})}getSceneObjects(){const e=[];return this.scene.traverse(t=>{t.userData.isTerrain&&(t.userData.assetName=t.userData.assetName||"Terrain",t.userData.objectType="terrain",e.push(t)),t.userData.isWater&&(t.userData.assetName=t.userData.assetName||"Water",t.userData.objectType="water",e.push(t)),(t.userData.assetId||t.userData.assetName)&&!t.userData.isTerrain&&!t.userData.isWater&&e.push(t)}),e}render(){const e=this.searchInput?.value.toLowerCase()||"",t=this.getSceneObjects(),s=e?t.filter(i=>(i.userData.assetName||i.name||"Object").toLowerCase().includes(e)):t;this.treeContainer.innerHTML=s.length===0?'<div class="hierarchy-empty">No objects in scene</div>':s.map(i=>this.renderNode(i)).join(""),this.treeContainer.querySelectorAll(".hierarchy-node").forEach(i=>{i.addEventListener("click",n=>{n.stopPropagation();const a=i.dataset.uuid,o=t.find(r=>r.uuid===a);o&&this.onSelect&&this.onSelect(o)}),i.addEventListener("contextmenu",n=>{const a=i.dataset.uuid,o=t.find(r=>r.uuid===a);o&&this.showContextMenu(n,o)})}),this.treeContainer.querySelectorAll(".node-expand").forEach(i=>{i.addEventListener("click",n=>{n.stopPropagation();const a=i.closest(".hierarchy-node").dataset.uuid;this.toggleExpand(a)})})}renderNode(e,t=0){const s=e.userData.assetName||e.name||"Object",i=w.selectedObjects.includes(e),n=e.children.length>0,a=this.expandedNodes.has(e.uuid),o=this.getIcon(e);return`
            <div class="hierarchy-node ${i?"selected":""}" 
                 data-uuid="${e.uuid}" 
                 style="padding-left: ${t*16+8}px"
                 data-tooltip="${s} (${e.userData.assetId||"Object"})">
                ${n?`<span class="node-expand">${a?"▼":"▶"}</span>`:'<span class="node-spacer"></span>'}
                <span class="node-icon">${o}</span>
                <span class="node-label">${s}</span>
            </div>
        `}getIcon(e){const t=e.userData.assetId||e.userData.objectType||"";return{empty:"⬚",trigger:"🔶",spawn:"🎯",waypoint:"📍",tree:"🌲",rock:"🪨",bush:"🌿",gladiator:"⚔️",spartan:"🛡️",arena:"🏛️",point_light:"💡",spot_light:"🔦",dir_light:"☀️",light:"💡",camera:"📷",cube:"⬜",sphere:"🔵",plane:"▬",cylinder:"🛢️",primitive:"⬜",terrain:"🏔️",water:"💧"}[t]||"📦"}toggleExpand(e){this.expandedNodes.has(e)?this.expandedNodes.delete(e):this.expandedNodes.add(e),this.render()}expandAll(){this.getSceneObjects().forEach(e=>this.expandedNodes.add(e.uuid)),this.render()}collapseAll(){this.expandedNodes.clear(),this.render()}destroy(){this.contextMenu&&this.contextMenu.parentNode&&this.contextMenu.parentNode.removeChild(this.contextMenu)}}class Zs{constructor(e,t){this.container=e,this.onTransformChange=t,this.currentObject=null,this.updateQueued=!1,this.init(),w.events.on("selection-changed",s=>{this.currentObject=s[0]||null,this.render()})}init(){this.render()}render(){if(!this.currentObject){this.container.innerHTML=`
                <div class="inspector-header">Inspector</div>
                <div class="inspector-empty">Select an object to view properties</div>
            `;return}const e=this.currentObject,t=e.position,s=e.rotation,i=e.scale;this.container.innerHTML=`
            <div class="inspector-header">Inspector</div>
            <div class="inspector-content">
                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Object identification and metadata">
                        <span class="section-icon">📋</span> Identity
                    </div>
                    <div class="section-content">
                        <div class="prop-row">
                            <label data-tooltip="Display name of this object">Name</label>
                            <input type="text" id="prop-name" value="${e.userData.assetName||e.name||"Object"}" data-tooltip="Click to edit object name">
                        </div>
                        <div class="prop-row">
                            <label data-tooltip="Asset type identifier">Type</label>
                            <span class="prop-value">${e.userData.assetId||"Custom"}</span>
                        </div>
                        <div class="prop-row">
                            <label data-tooltip="Unique identifier">UUID</label>
                            <span class="prop-value prop-uuid">${e.uuid.substring(0,8)}...</span>
                        </div>
                    </div>
                </div>

                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Position, rotation, and scale of object">
                        <span class="section-icon">📐</span> Transform
                    </div>
                    <div class="section-content">
                        <div class="transform-group">
                            <label data-tooltip="World position (X, Y, Z)">Position</label>
                            <div class="vec3-inputs">
                                <div class="vec-input">
                                    <span class="axis x">X</span>
                                    <input type="number" step="0.1" id="pos-x" value="${t.x.toFixed(2)}" data-tooltip="X position">
                                </div>
                                <div class="vec-input">
                                    <span class="axis y">Y</span>
                                    <input type="number" step="0.1" id="pos-y" value="${t.y.toFixed(2)}" data-tooltip="Y position (height)">
                                </div>
                                <div class="vec-input">
                                    <span class="axis z">Z</span>
                                    <input type="number" step="0.1" id="pos-z" value="${t.z.toFixed(2)}" data-tooltip="Z position">
                                </div>
                            </div>
                        </div>
                        <div class="transform-group">
                            <label data-tooltip="Rotation in degrees (X, Y, Z)">Rotation</label>
                            <div class="vec3-inputs">
                                <div class="vec-input">
                                    <span class="axis x">X</span>
                                    <input type="number" step="1" id="rot-x" value="${(s.x*180/Math.PI).toFixed(1)}" data-tooltip="X rotation (pitch)">
                                </div>
                                <div class="vec-input">
                                    <span class="axis y">Y</span>
                                    <input type="number" step="1" id="rot-y" value="${(s.y*180/Math.PI).toFixed(1)}" data-tooltip="Y rotation (yaw)">
                                </div>
                                <div class="vec-input">
                                    <span class="axis z">Z</span>
                                    <input type="number" step="1" id="rot-z" value="${(s.z*180/Math.PI).toFixed(1)}" data-tooltip="Z rotation (roll)">
                                </div>
                            </div>
                        </div>
                        <div class="transform-group">
                            <label data-tooltip="Scale multiplier (X, Y, Z)">Scale</label>
                            <div class="vec3-inputs">
                                <div class="vec-input">
                                    <span class="axis x">X</span>
                                    <input type="number" step="0.1" min="0.01" id="scale-x" value="${i.x.toFixed(2)}" data-tooltip="X scale">
                                </div>
                                <div class="vec-input">
                                    <span class="axis y">Y</span>
                                    <input type="number" step="0.1" min="0.01" id="scale-y" value="${i.y.toFixed(2)}" data-tooltip="Y scale">
                                </div>
                                <div class="vec-input">
                                    <span class="axis z">Z</span>
                                    <input type="number" step="0.1" min="0.01" id="scale-z" value="${i.z.toFixed(2)}" data-tooltip="Z scale">
                                </div>
                            </div>
                            <button class="uniform-scale-btn" id="uniform-scale" data-tooltip="Toggle uniform scaling">🔗</button>
                        </div>
                    </div>
                </div>

                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Visibility and rendering options">
                        <span class="section-icon">👁️</span> Visibility
                    </div>
                    <div class="section-content">
                        <div class="prop-row">
                            <label data-tooltip="Show or hide this object">Visible</label>
                            <input type="checkbox" id="prop-visible" ${e.visible?"checked":""} data-tooltip="Toggle visibility">
                        </div>
                        <div class="prop-row">
                            <label data-tooltip="Whether this object casts shadows">Cast Shadow</label>
                            <input type="checkbox" id="prop-cast-shadow" ${e.castShadow?"checked":""} data-tooltip="Toggle shadow casting">
                        </div>
                    </div>
                </div>

                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Attached components and scripts">
                        <span class="section-icon">🧩</span> Components
                    </div>
                    <div class="section-content">
                        <div class="component-list" id="component-list">
                            ${this.renderComponents(e)}
                        </div>
                        <div class="component-dropzone" id="component-dropzone" data-tooltip="Drag scripts, textures, or prefabs here">
                            <span class="dropzone-icon">📥</span>
                            <span class="dropzone-text">Drop Script / Texture / Prefab</span>
                        </div>
                        <button class="add-component-btn" id="btn-add-component" data-tooltip="Add a new component">+ Add Component</button>
                    </div>
                </div>

                <div class="inspector-section">
                    <div class="section-header" data-tooltip="Material and texture settings">
                        <span class="section-icon">🎨</span> Materials
                    </div>
                    <div class="section-content">
                        <div class="material-dropzone" id="material-dropzone" data-tooltip="Drag texture files here">
                            <span class="dropzone-icon">🖼️</span>
                            <span class="dropzone-text">Drop Texture Here</span>
                        </div>
                        <div class="material-list" id="material-list">
                            ${this.renderMaterials(e)}
                        </div>
                    </div>
                </div>

                <div class="inspector-actions">
                    <button class="action-btn" id="btn-reset-transform" data-tooltip="Reset position, rotation, and scale to defaults">Reset Transform</button>
                    <button class="action-btn danger" id="btn-delete" data-tooltip="Remove this object from the scene">Delete</button>
                </div>
            </div>
        `,this.bindInputs(),this.bindDropZones()}bindInputs(){const e=this.currentObject;if(!e)return;this.container.querySelector("#prop-name")?.addEventListener("change",s=>{e.userData.assetName=s.target.value,e.name=s.target.value,w.events.emit("hierarchy-changed")})["pos-z"].forEach((s,i)=>{this.container.querySelector(`#${s}`)?.addEventListener("change",a=>{const o=parseFloat(a.target.value)||0;i===0&&(e.position.x=o),i===1&&(e.position.y=o),i===2&&(e.position.z=o),this.onTransformChange?.(e)})})["rot-z"].forEach((s,i)=>{this.container.querySelector(`#${s}`)?.addEventListener("change",a=>{const r=(parseFloat(a.target.value)||0)*Math.PI/180;i===0&&(e.rotation.x=r),i===1&&(e.rotation.y=r),i===2&&(e.rotation.z=r),this.onTransformChange?.(e)})})["scale-z"].forEach((s,i)=>{this.container.querySelector(`#${s}`)?.addEventListener("change",a=>{const o=Math.max(.01,parseFloat(a.target.value)||1);i===0&&(e.scale.x=o),i===1&&(e.scale.y=o),i===2&&(e.scale.z=o),this.onTransformChange?.(e)})}),this.container.querySelector("#prop-visible")?.addEventListener("change",s=>{e.visible=s.target.checked}),this.container.querySelector("#prop-cast-shadow")?.addEventListener("change",s=>{e.castShadow=s.target.checked,e.traverse(i=>{i.isMesh&&(i.castShadow=s.target.checked)})}),this.container.querySelector("#btn-reset-transform")?.addEventListener("click",()=>{e.position.set(0,0,0),e.rotation.set(0,0,0),e.scale.set(1,1,1),this.render(),this.onTransformChange?.(e)}),this.container.querySelector("#btn-delete")?.addEventListener("click",()=>{w.events.emit("delete-object",e)})}queueUpdate(){this.updateQueued||(this.updateQueued=!0,requestAnimationFrame(()=>{this.render(),this.updateQueued=!1}))}renderComponents(e){const t=e.userData.components||[];return t.length===0?'<div class="no-components">No components attached</div>':t.map((s,i)=>`
            <div class="component-item" data-index="${i}">
                <span class="component-icon">${this.getComponentIcon(s.type)}</span>
                <span class="component-name">${s.name||s.type}</span>
                <button class="component-remove" data-index="${i}" title="Remove">×</button>
            </div>
        `).join("")}getComponentIcon(e){return{script:"📜",collider:"🧱",rigidbody:"⚙️",animator:"🎬",audio:"🔊",light:"💡",particle:"✨",prefab:"📦"}[e]||"🧩"}renderMaterials(e){const t=[];return e.traverse(s=>{s.isMesh&&s.material&&(Array.isArray(s.material)?s.material:[s.material]).forEach(n=>{t.find(a=>a.uuid===n.uuid)||t.push(n)})}),t.length===0?'<div class="no-materials">No materials</div>':t.slice(0,5).map((s,i)=>`
            <div class="material-item" data-index="${i}">
                <span class="material-color" style="background: ${s.color?"#"+s.color.getHexString():"#888"}"></span>
                <span class="material-name">${s.name||"Material "+(i+1)}</span>
            </div>
        `).join("")}bindDropZones(){const e=this.container.querySelector("#component-dropzone"),t=this.container.querySelector("#material-dropzone");e&&(e.addEventListener("dragover",i=>{i.preventDefault(),e.classList.add("dragover")}),e.addEventListener("dragleave",()=>{e.classList.remove("dragover")}),e.addEventListener("drop",i=>{i.preventDefault(),e.classList.remove("dragover"),this.handleComponentDrop(i)})),t&&(t.addEventListener("dragover",i=>{i.preventDefault(),t.classList.add("dragover")}),t.addEventListener("dragleave",()=>{t.classList.remove("dragover")}),t.addEventListener("drop",i=>{i.preventDefault(),t.classList.remove("dragover"),this.handleMaterialDrop(i)}));const s=this.container.querySelector("#btn-add-component");s&&s.addEventListener("click",()=>this.showComponentMenu()),this.container.querySelectorAll(".component-remove").forEach(i=>{i.addEventListener("click",n=>{n.stopPropagation();const a=parseInt(i.dataset.index);this.removeComponent(a)})})}handleComponentDrop(e){const t=e.dataTransfer?.files,s=e.dataTransfer?.getData("text/plain");if(t&&t.length>0){const i=t[0],n=i.name.split(".").pop().toLowerCase();["js","lua","ts"].includes(n)?this.addComponent({type:"script",name:i.name,file:i.name}):["glb","gltf","fbx"].includes(n)&&this.addComponent({type:"prefab",name:i.name,file:i.name})}else if(s)try{const i=JSON.parse(s);this.addComponent(i)}catch{this.addComponent({type:"script",name:s})}}handleMaterialDrop(e){const t=e.dataTransfer?.files;if(t&&t.length>0){const s=t[0],i=s.name.split(".").pop().toLowerCase();["png","jpg","jpeg","webp"].includes(i)&&(console.log("[Inspector] Texture dropped:",s.name),w.events.emit("texture-dropped",{object:this.currentObject,file:s}))}}addComponent(e){this.currentObject&&(this.currentObject.userData.components||(this.currentObject.userData.components=[]),this.currentObject.userData.components.push({type:e.type||"script",name:e.name||"New Component",file:e.file||null,enabled:!0}),this.render(),console.log("[Inspector] Component added:",e.name))}removeComponent(e){this.currentObject?.userData.components&&(this.currentObject.userData.components.splice(e,1),this.render())}showComponentMenu(){const e=[{type:"script",name:"Lua Script",icon:"📜"},{type:"collider",name:"Box Collider",icon:"🧱"},{type:"rigidbody",name:"Rigidbody",icon:"⚙️"},{type:"animator",name:"Animator",icon:"🎬"},{type:"audio",name:"Audio Source",icon:"🔊"},{type:"particle",name:"Particle System",icon:"✨"}],t=document.createElement("div");t.className="component-menu",t.innerHTML=e.map(i=>`
            <div class="component-menu-item" data-type="${i.type}" data-name="${i.name}">
                <span>${i.icon}</span> ${i.name}
            </div>
        `).join("");const s=this.container.querySelector("#btn-add-component");s&&(s.parentNode.insertBefore(t,s.nextSibling),t.querySelectorAll(".component-menu-item").forEach(i=>{i.addEventListener("click",()=>{this.addComponent({type:i.dataset.type,name:i.dataset.name}),t.remove()})}),setTimeout(()=>{document.addEventListener("click",function i(n){t.contains(n.target)||(t.remove(),document.removeEventListener("click",i))})},10))}}class ei{constructor(e,t){this.container=e,this.commands=t,this.activeMenu=null,this.menus=[{name:"File",items:[{label:"New Scene",shortcut:"Ctrl+N",action:"new-scene",tooltip:"Create a new empty scene"},{label:"Save Scene",shortcut:"Ctrl+S",action:"save-scene",tooltip:"Save current scene locally"},{label:"Load Scene",shortcut:"Ctrl+O",action:"load-scene",tooltip:"Load scene from local storage"},{separator:!0},{label:"Save to Cloud",shortcut:"Ctrl+Shift+S",action:"save-cloud",tooltip:"Save scene to cloud storage"},{label:"Load from Cloud",shortcut:"Ctrl+Shift+O",action:"load-cloud",tooltip:"Load scene from cloud storage"},{separator:!0},{label:"Import Asset...",shortcut:"Ctrl+I",action:"import-asset",tooltip:"Import FBX, OBJ, GLB, GLTF, or JSON files"},{separator:!0},{label:"Export as GLB",action:"export-glb",tooltip:"Export scene as GLB file"},{label:"Export as JSON",action:"export-json",tooltip:"Export scene data as JSON"},{separator:!0},{label:"Exit to Menu",action:"exit",tooltip:"Return to main menu"}]},{name:"Edit",items:[{label:"Undo",shortcut:"Ctrl+Z",action:"undo",tooltip:"Undo last action"},{label:"Redo",shortcut:"Ctrl+Y",action:"redo",tooltip:"Redo last undone action"},{separator:!0},{label:"Cut",shortcut:"Ctrl+X",action:"cut",tooltip:"Cut selected objects"},{label:"Copy",shortcut:"Ctrl+C",action:"copy",tooltip:"Copy selected objects"},{label:"Paste",shortcut:"Ctrl+V",action:"paste",tooltip:"Paste copied objects"},{label:"Duplicate",shortcut:"Ctrl+D",action:"duplicate",tooltip:"Duplicate selected objects"},{separator:!0},{label:"Delete",shortcut:"Del",action:"delete",tooltip:"Delete selected objects"},{label:"Select All",shortcut:"Ctrl+A",action:"select-all",tooltip:"Select all objects in scene"}]},{name:"View",items:[{label:"Toggle Hierarchy",shortcut:"H",action:"toggle-hierarchy",tooltip:"Show/hide hierarchy panel"},{label:"Toggle Inspector",shortcut:"I",action:"toggle-inspector",tooltip:"Show/hide inspector panel"},{label:"Toggle Assets",shortcut:"A",action:"toggle-assets",tooltip:"Show/hide assets panel"},{separator:!0},{label:"Reset Camera",action:"reset-camera",tooltip:"Reset camera to default position"},{label:"Focus Selected",shortcut:"F",action:"focus-selected",tooltip:"Focus camera on selected object"},{separator:!0},{label:"Toggle Grid",shortcut:"G",action:"toggle-grid",tooltip:"Show/hide grid overlay"},{label:"Toggle Wireframe",action:"toggle-wireframe",tooltip:"Toggle wireframe rendering"}]},{name:"Add",items:[{label:"Empty Object",action:"add-empty",tooltip:"Add an empty transform node"},{separator:!0},{label:"Tree",action:"add-tree",tooltip:"Add a procedural tree"},{label:"Rock",action:"add-rock",tooltip:"Add a procedural rock"},{label:"Bush",action:"add-bush",tooltip:"Add a procedural bush"},{separator:!0},{label:"Gladiator",action:"add-gladiator",tooltip:"Add gladiator character"},{label:"Spartan",action:"add-spartan",tooltip:"Add spartan character"},{separator:!0},{label:"Point Light",action:"add-point-light",tooltip:"Add a point light source"},{label:"Spot Light",action:"add-spot-light",tooltip:"Add a spotlight"}]},{name:"Settings",items:[{label:"Grid Size...",action:"settings-grid",tooltip:"Adjust placement grid size"},{label:"Snap to Grid",action:"toggle-snap",tooltip:"Toggle grid snapping",checked:!0},{separator:!0},{label:"Show Gizmos",action:"toggle-gizmos",tooltip:"Show/hide transform gizmos",checked:!0},{label:"Show Helpers",action:"toggle-helpers",tooltip:"Show/hide light/camera helpers",checked:!0},{separator:!0},{label:"Editor Theme",action:"settings-theme",tooltip:"Change editor color theme"},{label:"Performance",action:"settings-performance",tooltip:"Adjust rendering quality"},{separator:!0},{label:"Stats Admin",action:"stats-admin",tooltip:"Configure attribute diminishing returns and power rankings"},{separator:!0},{label:"Reset Preferences",action:"reset-prefs",tooltip:"Reset all editor settings to defaults"}]},{name:"Help",items:[{label:"Keyboard Shortcuts",shortcut:"?",action:"show-shortcuts",tooltip:"View all keyboard shortcuts"},{label:"Documentation",action:"show-docs",tooltip:"Open documentation"},{separator:!0},{label:"About Grudge Studio",action:"show-about",tooltip:"About this editor"}]}],this.init(),this.bindKeyboardShortcuts()}init(){this.container.innerHTML=`
            <div class="menu-bar">
                ${this.menus.map(e=>`
                    <div class="menu-item" data-menu="${e.name}">
                        <span class="menu-label">${e.name}</span>
                        <div class="menu-dropdown">
                            ${e.items.map(t=>t.separator?'<div class="menu-separator"></div>':`<div class="menu-option" data-action="${t.action}" data-tooltip="${t.tooltip||""}">
                                        <span>${t.label}</span>
                                        ${t.shortcut?`<span class="menu-shortcut">${t.shortcut}</span>`:""}
                                    </div>`).join("")}
                        </div>
                    </div>
                `).join("")}
            </div>
        `,this.container.querySelectorAll(".menu-item").forEach(e=>{e.addEventListener("mouseenter",()=>{this.activeMenu&&(this.closeAllMenus(),this.openMenu(e))}),e.querySelector(".menu-label").addEventListener("click",t=>{t.stopPropagation(),this.activeMenu===e?this.closeAllMenus():(this.closeAllMenus(),this.openMenu(e))})}),this.container.querySelectorAll(".menu-option").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const s=e.dataset.action;this.executeCommand(s),this.closeAllMenus()})}),document.addEventListener("click",()=>this.closeAllMenus())}openMenu(e){e.classList.add("active"),this.activeMenu=e}closeAllMenus(){this.container.querySelectorAll(".menu-item").forEach(e=>{e.classList.remove("active")}),this.activeMenu=null}executeCommand(e){this.commands[e]?this.commands[e]():console.log("Command not implemented:",e)}bindKeyboardShortcuts(){document.addEventListener("keydown",e=>{if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;const t=e.ctrlKey||e.metaKey;t&&e.key==="z"?(e.preventDefault(),this.executeCommand("undo")):t&&e.key==="y"?(e.preventDefault(),this.executeCommand("redo")):t&&e.key==="s"?(e.preventDefault(),this.executeCommand("save-scene")):t&&e.key==="c"?(e.preventDefault(),this.executeCommand("copy")):t&&e.key==="v"?(e.preventDefault(),this.executeCommand("paste")):t&&e.key==="d"?(e.preventDefault(),this.executeCommand("duplicate")):t&&e.key==="a"?(e.preventDefault(),this.executeCommand("select-all")):e.key==="f"&&!t?this.executeCommand("focus-selected"):e.key==="?"&&this.executeCommand("show-shortcuts")})}}const R={RAISE:"raise",LOWER:"lower",SMOOTH:"smooth",FLATTEN:"flatten",PAINT:"paint",NOISE:"noise",WATER:"water"},Ee={CIRCLE:"circle",SQUARE:"square",SOFT:"soft"};class ti{constructor(e,t,s){this.scene=e,this.camera=t,this.renderer=s,this.terrain=null,this.heightData=null,this.resolution=128,this.size=100,this.maxHeight=20,this.currentTool=R.RAISE,this.brushSize=5,this.brushStrength=.5,this.brushType=Ee.SOFT,this.flattenHeight=0,this.brushIndicator=null,this.raycaster=new ut,this.mouse=new I,this.isPainting=!1,this.lastPaintPos=null,this.paintLayers=[],this.currentPaintLayer=0,this.undoStack=[],this.redoStack=[],this.maxUndoLevels=20,this.enabled=!1,this.onTerrainUpdate=null,this.waterPlane=null,this.waterLevel=0,this.waterVisible=!0,this.waterColor=1740031,this.waterOpacity=.6}increaseBrushSize(){this.brushSize=Math.min(30,this.brushSize+1),this.updateBrushIndicator(),console.log("[TerrainEditor] Brush size:",this.brushSize)}decreaseBrushSize(){this.brushSize=Math.max(1,this.brushSize-1),this.updateBrushIndicator(),console.log("[TerrainEditor] Brush size:",this.brushSize)}updateBrushIndicator(){if(this.brushIndicator){const e=this.brushSize*(this.size/this.resolution);this.brushIndicator.scale.set(e,e,e)}}exportHeightData(){return{resolution:this.resolution,size:this.size,heightData:Array.from(this.heightData)}}init(){this.createTerrain(),this.createBrushIndicator(),this.setupPaintLayers(),this.createWaterPlane(),console.log("[TerrainEditor] Initialized with",this.resolution,"x",this.resolution,"terrain")}createTerrain(){this.heightData=new Float32Array(this.resolution*this.resolution);const e=new ne(this.size,this.size,this.resolution-1,this.resolution-1);e.rotateX(-Math.PI/2);const t=new M({color:4881497,roughness:.85,metalness:0,flatShading:!1,side:ie,vertexColors:!0});return this.initVertexColors(e),this.terrain=new k(e,t),this.terrain.receiveShadow=!0,this.terrain.castShadow=!0,this.terrain.userData.isTerrain=!0,this.terrain.userData.isEditable=!0,this.terrain.name="Terrain",this.scene.add(this.terrain),this.terrain}initVertexColors(e){const t=e.attributes.position.count,s=new Float32Array(t*3),i=new D(4881497);for(let n=0;n<t;n++)s[n*3]=i.r,s[n*3+1]=i.g,s[n*3+2]=i.b;e.setAttribute("color",new W(s,3))}setupPaintLayers(){this.paintLayers=[{name:"Grass",color:new D(4881497)},{name:"Dirt",color:new D(9127187)},{name:"Rock",color:new D(6908265)},{name:"Sand",color:new D(12759680)},{name:"Snow",color:new D(16775930)}]}createWaterPlane(){const e=new ne(this.size*1.2,this.size*1.2,1,1);e.rotateX(-Math.PI/2);const t=new M({color:this.waterColor,transparent:!0,opacity:this.waterOpacity,side:ie,roughness:.1,metalness:.3,depthWrite:!1});this.waterPlane=new k(e,t),this.waterPlane.position.y=this.waterLevel,this.waterPlane.visible=this.waterVisible,this.waterPlane.renderOrder=1,this.waterPlane.userData.isWater=!0,this.waterPlane.userData.noSelect=!0,this.waterPlane.name="Water",this.scene.add(this.waterPlane),console.log("[TerrainEditor] Water plane created at level:",this.waterLevel)}setWaterLevel(e){this.waterLevel=e,this.waterPlane&&(this.waterPlane.position.y=e),console.log("[TerrainEditor] Water level set to:",e)}setWaterVisible(e){this.waterVisible=e,this.waterPlane&&(this.waterPlane.visible=e)}setWaterColor(e){this.waterColor=e,this.waterPlane&&this.waterPlane.material.color.setHex(e)}setWaterOpacity(e){this.waterOpacity=Math.max(.1,Math.min(1,e)),this.waterPlane&&(this.waterPlane.material.opacity=this.waterOpacity)}getWaterSettings(){return{level:this.waterLevel,visible:this.waterVisible,color:this.waterColor,opacity:this.waterOpacity}}createBrushIndicator(){const e=new Xe(this.brushSize-.1,this.brushSize,32);e.rotateX(-Math.PI/2);const t=new J({color:65280,transparent:!0,opacity:.6,side:ie,depthTest:!1});this.brushIndicator=new k(e,t),this.brushIndicator.visible=!1,this.brushIndicator.renderOrder=999,this.scene.add(this.brushIndicator)}updateBrushIndicator(){if(this.brushIndicator)switch(this.brushIndicator.geometry.dispose(),this.brushIndicator.geometry=new Xe(this.brushSize*.9,this.brushSize,32),this.brushIndicator.geometry.rotateX(-Math.PI/2),this.currentTool){case R.RAISE:this.brushIndicator.material.color.setHex(65280);break;case R.LOWER:this.brushIndicator.material.color.setHex(16729156);break;case R.SMOOTH:this.brushIndicator.material.color.setHex(4500223);break;case R.FLATTEN:this.brushIndicator.material.color.setHex(16755200);break;case R.PAINT:this.brushIndicator.material.color.copy(this.paintLayers[this.currentPaintLayer].color);break;case R.NOISE:this.brushIndicator.material.color.setHex(16711935);break;case R.WATER:this.brushIndicator.material.color.setHex(1740031);break}}enable(){this.enabled=!0,this.brushIndicator&&(this.brushIndicator.visible=!0)}disable(){this.enabled=!1,this.brushIndicator&&(this.brushIndicator.visible=!1),this.isPainting=!1}setTool(e){this.currentTool=e,this.updateBrushIndicator(),console.log("[TerrainEditor] Tool changed to:",e)}setBrushSize(e){this.brushSize=Math.max(1,Math.min(30,e)),this.updateBrushIndicator()}setBrushStrength(e){this.brushStrength=Math.max(.01,Math.min(1,e))}setPaintLayer(e){this.currentPaintLayer=Math.max(0,Math.min(this.paintLayers.length-1,e)),this.updateBrushIndicator()}onMouseMove(e){if(!this.enabled||!this.terrain)return;const t=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(e.clientX-t.left)/t.width*2-1,this.mouse.y=-((e.clientY-t.top)/t.height)*2+1,this.raycaster.setFromCamera(this.mouse,this.camera);const s=this.raycaster.intersectObject(this.terrain);if(s.length>0){const i=s[0].point;this.brushIndicator.position.copy(i),this.brushIndicator.position.y+=.1,this.brushIndicator.visible=!0,this.isPainting&&this.applyBrush(i)}else this.brushIndicator.visible=!1}onMouseDown(e){if(!this.enabled||e.button!==0)return;this.raycaster.setFromCamera(this.mouse,this.camera);const t=this.raycaster.intersectObject(this.terrain);t.length>0&&(this.saveUndoState(),this.isPainting=!0,this.lastPaintPos=t[0].point.clone(),this.applyBrush(t[0].point))}onMouseUp(e){e.button===0&&(this.isPainting=!1,this.lastPaintPos=null)}applyBrush(e){const t=this.terrain.geometry,s=t.attributes.position.array,i=t.attributes.color?.array,n=this.size/2,a=e.x+n,o=e.z+n;let r=!1;for(let l=0;l<s.length/3;l++){const h=s[l*3]+n,d=s[l*3+2]+n,f=h-a,p=d-o,u=Math.sqrt(f*f+p*p);if(u<=this.brushSize){let g=this.calculateFalloff(u);switch(this.currentTool){case R.RAISE:s[l*3+1]+=this.brushStrength*g*.1,r=!0;break;case R.LOWER:s[l*3+1]-=this.brushStrength*g*.1,r=!0;break;case R.SMOOTH:const b=this.getAverageHeight(l,s);s[l*3+1]=_.lerp(s[l*3+1],b,this.brushStrength*g*.2),r=!0;break;case R.FLATTEN:s[l*3+1]=_.lerp(s[l*3+1],this.flattenHeight,this.brushStrength*g*.3),r=!0;break;case R.NOISE:s[l*3+1]+=(Math.random()-.5)*this.brushStrength*g*.2,r=!0;break;case R.PAINT:if(i){const C=this.paintLayers[this.currentPaintLayer],L=this.brushStrength*g*.3;i[l*3]=_.lerp(i[l*3],C.color.r,L),i[l*3+1]=_.lerp(i[l*3+1],C.color.g,L),i[l*3+2]=_.lerp(i[l*3+2],C.color.b,L),r=!0}break}s[l*3+1]=Math.max(-this.maxHeight,Math.min(this.maxHeight,s[l*3+1]))}}r&&(t.attributes.position.needsUpdate=!0,i&&(t.attributes.color.needsUpdate=!0),t.computeVertexNormals(),this.onTerrainUpdate&&this.onTerrainUpdate())}calculateFalloff(e){const t=e/this.brushSize;switch(this.brushType){case Ee.CIRCLE:return t<=1?1:0;case Ee.SQUARE:return 1;case Ee.SOFT:default:return Math.cos(t*Math.PI*.5)}}getAverageHeight(e,t){const s=t[e*3],i=t[e*3+2],n=this.brushSize*.5;let a=0,o=0;for(let r=0;r<t.length/3;r++){const l=t[r*3]-s,h=t[r*3+2]-i;Math.sqrt(l*l+h*h)<=n&&(a+=t[r*3+1],o++)}return o>0?a/o:t[e*3+1]}saveUndoState(){const e=this.terrain.geometry.attributes.position.array,t=this.terrain.geometry.attributes.color?.array;this.undoStack.push({positions:new Float32Array(e),colors:t?new Float32Array(t):null}),this.undoStack.length>this.maxUndoLevels&&this.undoStack.shift(),this.redoStack=[]}undo(){if(this.undoStack.length===0)return;const e=this.terrain.geometry,t=new Float32Array(e.attributes.position.array),s=e.attributes.color?new Float32Array(e.attributes.color.array):null;this.redoStack.push({positions:t,colors:s});const i=this.undoStack.pop();e.attributes.position.array.set(i.positions),e.attributes.position.needsUpdate=!0,i.colors&&e.attributes.color&&(e.attributes.color.array.set(i.colors),e.attributes.color.needsUpdate=!0),e.computeVertexNormals(),console.log("[TerrainEditor] Undo applied")}redo(){if(this.redoStack.length===0)return;const e=this.terrain.geometry,t=new Float32Array(e.attributes.position.array),s=e.attributes.color?new Float32Array(e.attributes.color.array):null;this.undoStack.push({positions:t,colors:s});const i=this.redoStack.pop();e.attributes.position.array.set(i.positions),e.attributes.position.needsUpdate=!0,i.colors&&e.attributes.color&&(e.attributes.color.array.set(i.colors),e.attributes.color.needsUpdate=!0),e.computeVertexNormals(),console.log("[TerrainEditor] Redo applied")}generateFromNoise(e=.05,t=5,s=4){this.saveUndoState();const i=this.terrain.geometry.attributes.position.array,n=this.size/2;for(let a=0;a<i.length/3;a++){const o=i[a*3]+n,r=i[a*3+2]+n;let l=0,h=t,d=e;for(let f=0;f<s;f++)l+=this.noise2D(o*d,r*d)*h,h*=.5,d*=2;i[a*3+1]=l}this.terrain.geometry.attributes.position.needsUpdate=!0,this.terrain.geometry.computeVertexNormals(),console.log("[TerrainEditor] Generated noise terrain")}noise2D(e,t){const s=Math.floor(e)&255,i=Math.floor(t)&255;e-=Math.floor(e),t-=Math.floor(t);const n=this.fade(e),a=this.fade(t),o=this.p[s]+i&255,r=this.p[s+1]+i&255;return this.lerp(a,this.lerp(n,this.grad(this.p[o],e,t),this.grad(this.p[r],e-1,t)),this.lerp(n,this.grad(this.p[o+1],e,t-1),this.grad(this.p[r+1],e-1,t-1)))}fade(e){return e*e*e*(e*(e*6-15)+10)}lerp(e,t,s){return t+e*(s-t)}grad(e,t,s){const i=e&3,n=i<2?t:s,a=i<2?s:t;return(i&1?-n:n)+(i&2?-a:a)}p=(()=>{const e=[];for(let t=0;t<256;t++)e[t]=t;for(let t=255;t>0;t--){const s=Math.floor(Math.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}return[...e,...e]})();flattenAll(e=0){this.saveUndoState();const t=this.terrain.geometry.attributes.position.array;for(let s=0;s<t.length/3;s++)t[s*3+1]=e;this.terrain.geometry.attributes.position.needsUpdate=!0,this.terrain.geometry.computeVertexNormals(),console.log("[TerrainEditor] Terrain flattened to height:",e)}setFlattenHeight(e){this.flattenHeight=e}exportHeightmap(){const e=this.terrain.geometry.attributes.position.array,t=[];for(let s=0;s<e.length/3;s++)t.push(e[s*3+1]);return{width:this.resolution,height:this.resolution,data:t,size:this.size,maxHeight:this.maxHeight}}importHeightmap(e){if(!e||!e.data)return;this.saveUndoState();const t=this.terrain.geometry.attributes.position.array,s=e.data;for(let i=0;i<Math.min(t.length/3,s.length);i++)t[i*3+1]=s[i];this.terrain.geometry.attributes.position.needsUpdate=!0,this.terrain.geometry.computeVertexNormals(),console.log("[TerrainEditor] Heightmap imported")}dispose(){this.terrain&&(this.terrain.geometry.dispose(),this.terrain.material.dispose(),this.scene.remove(this.terrain)),this.brushIndicator&&(this.brushIndicator.geometry.dispose(),this.brushIndicator.material.dispose(),this.scene.remove(this.brushIndicator)),this.waterPlane&&(this.waterPlane.geometry.dispose(),this.waterPlane.material.dispose(),this.scene.remove(this.waterPlane)),this.undoStack=[],this.redoStack=[]}}class si{constructor(e,t){this.container=e,this.terrainEditor=t,this.isExpanded=!0}init(){this.render(),this.bindEvents()}render(){this.container.innerHTML=`
            <div class="terrain-panel">
                <div class="terrain-header" id="terrain-header-toggle">
                    <span class="terrain-icon">🏔️</span>
                    <span>Terrain Tools</span>
                    <span class="terrain-toggle">▼</span>
                </div>
                <div class="terrain-content" id="terrain-content">
                    <div class="terrain-section">
                        <label class="section-label">Sculpt Tools</label>
                        <div class="terrain-tools-grid">
                            <button class="terrain-tool-btn active" data-tool="raise" title="Raise Terrain">
                                <span class="tool-icon">⬆️</span>
                                <span class="tool-name">Raise</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="lower" title="Lower Terrain">
                                <span class="tool-icon">⬇️</span>
                                <span class="tool-name">Lower</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="smooth" title="Smooth Terrain">
                                <span class="tool-icon">〰️</span>
                                <span class="tool-name">Smooth</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="flatten" title="Flatten Terrain">
                                <span class="tool-icon">➖</span>
                                <span class="tool-name">Flatten</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="noise" title="Add Noise">
                                <span class="tool-icon">🌊</span>
                                <span class="tool-name">Noise</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="paint" title="Paint Terrain">
                                <span class="tool-icon">🎨</span>
                                <span class="tool-name">Paint</span>
                            </button>
                            <button class="terrain-tool-btn" data-tool="water" title="Water Level">
                                <span class="tool-icon">💧</span>
                                <span class="tool-name">Water</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="terrain-section">
                        <label class="section-label">Brush Settings</label>
                        <div class="brush-setting">
                            <span>Size</span>
                            <input type="range" id="brush-size" min="1" max="30" value="5" />
                            <span id="brush-size-val">5</span>
                        </div>
                        <div class="brush-setting">
                            <span>Strength</span>
                            <input type="range" id="brush-strength" min="1" max="100" value="50" />
                            <span id="brush-strength-val">50%</span>
                        </div>
                        <div class="brush-setting" id="flatten-height-row" style="display: none;">
                            <span>Height</span>
                            <input type="range" id="flatten-height" min="-20" max="20" value="0" />
                            <span id="flatten-height-val">0</span>
                        </div>
                    </div>
                    
                    <div class="terrain-section" id="paint-layers-section" style="display: none;">
                        <label class="section-label">Paint Layers</label>
                        <div class="paint-layers">
                            <button class="paint-layer-btn active" data-layer="0" style="background: #4a7c59;">Grass</button>
                            <button class="paint-layer-btn" data-layer="1" style="background: #8B4513;">Dirt</button>
                            <button class="paint-layer-btn" data-layer="2" style="background: #696969;">Rock</button>
                            <button class="paint-layer-btn" data-layer="3" style="background: #C2B280;">Sand</button>
                            <button class="paint-layer-btn" data-layer="4" style="background: #FFFAFA; color: #333;">Snow</button>
                        </div>
                    </div>
                    
                    <div class="terrain-section" id="water-settings-section" style="display: none;">
                        <label class="section-label">Water Settings</label>
                        <div class="brush-setting">
                            <span>Level</span>
                            <input type="range" id="water-level" min="-10" max="10" value="0" step="0.5" />
                            <span id="water-level-val">0</span>
                        </div>
                        <div class="brush-setting">
                            <span>Opacity</span>
                            <input type="range" id="water-opacity" min="10" max="100" value="60" />
                            <span id="water-opacity-val">60%</span>
                        </div>
                        <div class="water-toggle-row">
                            <label class="water-toggle-label">
                                <input type="checkbox" id="water-visible" checked />
                                <span>Show Water</span>
                            </label>
                        </div>
                        <div class="water-colors">
                            <button class="water-color-btn active" data-color="0x1a8cff" style="background: #1a8cff;" title="Ocean Blue">🌊</button>
                            <button class="water-color-btn" data-color="0x00ced1" style="background: #00ced1;" title="Turquoise">💎</button>
                            <button class="water-color-btn" data-color="0x2e8b57" style="background: #2e8b57;" title="Swamp Green">🌿</button>
                            <button class="water-color-btn" data-color="0x4169e1" style="background: #4169e1;" title="Royal Blue">🔵</button>
                            <button class="water-color-btn" data-color="0x8b4513" style="background: #8b4513;" title="Muddy">🟤</button>
                        </div>
                    </div>
                    
                    <div class="terrain-section">
                        <label class="section-label">Generate</label>
                        <div class="terrain-actions">
                            <button class="terrain-action-btn" id="generate-noise">
                                <span>🏔️</span> Generate Hills
                            </button>
                            <button class="terrain-action-btn" id="flatten-all">
                                <span>📐</span> Flatten All
                            </button>
                        </div>
                    </div>
                    
                    <div class="terrain-section">
                        <label class="section-label">History</label>
                        <div class="terrain-actions">
                            <button class="terrain-action-btn" id="terrain-undo">
                                <span>↶</span> Undo
                            </button>
                            <button class="terrain-action-btn" id="terrain-redo">
                                <span>↷</span> Redo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .terrain-panel {
                    background: rgba(20, 26, 43, 0.98);
                    border: 1px solid #2a3150;
                    border-radius: 10px;
                    overflow: hidden;
                    font-family: 'Jost', sans-serif;
                }
                .terrain-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: rgba(14, 18, 32, 0.6);
                    border-bottom: 1px solid #2a3150;
                    cursor: pointer;
                    font-weight: 600;
                    color: #6ee7b7;
                    font-size: 13px;
                }
                .terrain-header:hover {
                    background: rgba(110, 231, 183, 0.1);
                }
                .terrain-icon {
                    font-size: 16px;
                }
                .terrain-toggle {
                    margin-left: auto;
                    font-size: 10px;
                    transition: transform 0.2s;
                }
                .terrain-panel.collapsed .terrain-toggle {
                    transform: rotate(-90deg);
                }
                .terrain-panel.collapsed .terrain-content {
                    display: none;
                }
                .terrain-content {
                    padding: 10px;
                }
                .terrain-section {
                    margin-bottom: 14px;
                }
                .terrain-section:last-child {
                    margin-bottom: 0;
                }
                .section-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: #a5b4d0;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .terrain-tools-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 6px;
                }
                .terrain-tool-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2px;
                    padding: 8px 4px;
                    background: rgba(42, 49, 80, 0.5);
                    border: 2px solid transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #a5b4d0;
                }
                .terrain-tool-btn:hover {
                    border-color: #6ee7b7;
                    color: #e8eaf6;
                }
                .terrain-tool-btn.active {
                    border-color: #6ee7b7;
                    background: rgba(110, 231, 183, 0.2);
                    color: #6ee7b7;
                }
                .tool-icon {
                    font-size: 18px;
                }
                .tool-name {
                    font-size: 10px;
                }
                .brush-setting {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 12px;
                    color: #a5b4d0;
                }
                .brush-setting span:first-child {
                    width: 60px;
                }
                .brush-setting input[type="range"] {
                    flex: 1;
                    height: 4px;
                    -webkit-appearance: none;
                    background: rgba(42, 49, 80, 0.8);
                    border-radius: 2px;
                }
                .brush-setting input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 14px;
                    height: 14px;
                    background: #6ee7b7;
                    border-radius: 50%;
                    cursor: pointer;
                }
                .brush-setting span:last-child {
                    width: 40px;
                    text-align: right;
                    color: #6ee7b7;
                    font-weight: 600;
                }
                .paint-layers {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .paint-layer-btn {
                    padding: 6px 10px;
                    border: 2px solid transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                    color: #fff;
                    transition: all 0.15s;
                }
                .paint-layer-btn:hover {
                    transform: scale(1.05);
                }
                .paint-layer-btn.active {
                    border-color: #fff;
                    box-shadow: 0 0 8px rgba(255,255,255,0.3);
                }
                .terrain-actions {
                    display: flex;
                    gap: 8px;
                }
                .terrain-action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px;
                    background: rgba(42, 49, 80, 0.6);
                    border: 1px solid #2a3150;
                    border-radius: 6px;
                    color: #e8eaf6;
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.15s;
                }
                .terrain-action-btn:hover {
                    border-color: #6ee7b7;
                    background: rgba(110, 231, 183, 0.15);
                }
                .water-toggle-row {
                    margin: 10px 0;
                }
                .water-toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #a5b4d0;
                    font-size: 12px;
                    cursor: pointer;
                }
                .water-toggle-label input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    accent-color: #6ee7b7;
                }
                .water-colors {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }
                .water-color-btn {
                    width: 32px;
                    height: 32px;
                    border: 2px solid transparent;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .water-color-btn:hover {
                    transform: scale(1.1);
                }
                .water-color-btn.active {
                    border-color: #fff;
                    box-shadow: 0 0 8px rgba(255,255,255,0.4);
                }
            </style>
        `}bindEvents(){this.container.querySelector("#terrain-header-toggle")?.addEventListener("click",()=>{this.container.querySelector(".terrain-panel")?.classList.toggle("collapsed")}),this.container.querySelectorAll(".terrain-tool-btn").forEach(p=>{p.addEventListener("click",()=>{this.container.querySelectorAll(".terrain-tool-btn").forEach(L=>L.classList.remove("active")),p.classList.add("active");const u=p.dataset.tool;this.terrainEditor?.setTool(u);const g=this.container.querySelector("#flatten-height-row"),b=this.container.querySelector("#paint-layers-section"),C=this.container.querySelector("#water-settings-section");g&&(g.style.display=u==="flatten"?"flex":"none"),b&&(b.style.display=u==="paint"?"block":"none"),C&&(C.style.display=u==="water"?"block":"none")})});const t=this.container.querySelector("#brush-size"),s=this.container.querySelector("#brush-size-val");t?.addEventListener("input",p=>{const u=parseInt(p.target.value);s&&(s.textContent=u),this.terrainEditor?.setBrushSize(u)});const i=this.container.querySelector("#brush-strength"),n=this.container.querySelector("#brush-strength-val");i?.addEventListener("input",p=>{const u=parseInt(p.target.value);n&&(n.textContent=u+"%"),this.terrainEditor?.setBrushStrength(u/100)});const a=this.container.querySelector("#flatten-height"),o=this.container.querySelector("#flatten-height-val");a?.addEventListener("input",p=>{const u=parseFloat(p.target.value);o&&(o.textContent=u),this.terrainEditor?.setFlattenHeight(u)}),this.container.querySelectorAll(".paint-layer-btn").forEach(p=>{p.addEventListener("click",()=>{this.container.querySelectorAll(".paint-layer-btn").forEach(u=>u.classList.remove("active")),p.classList.add("active"),this.terrainEditor?.setPaintLayer(parseInt(p.dataset.layer))})}),this.container.querySelector("#generate-noise")?.addEventListener("click",()=>{this.terrainEditor?.generateFromNoise(.03,6,4)}),this.container.querySelector("#flatten-all")?.addEventListener("click",()=>{this.terrainEditor?.flattenAll(0)}),this.container.querySelector("#terrain-undo")?.addEventListener("click",()=>{this.terrainEditor?.undo()}),this.container.querySelector("#terrain-redo")?.addEventListener("click",()=>{this.terrainEditor?.redo()});const r=this.container.querySelector("#water-level"),l=this.container.querySelector("#water-level-val");r?.addEventListener("input",p=>{const u=parseFloat(p.target.value);l&&(l.textContent=u),this.terrainEditor?.setWaterLevel(u)});const h=this.container.querySelector("#water-opacity"),d=this.container.querySelector("#water-opacity-val");h?.addEventListener("input",p=>{const u=parseInt(p.target.value);d&&(d.textContent=u+"%"),this.terrainEditor?.setWaterOpacity(u/100)}),this.container.querySelector("#water-visible")?.addEventListener("change",p=>{this.terrainEditor?.setWaterVisible(p.target.checked)}),this.container.querySelectorAll(".water-color-btn").forEach(p=>{p.addEventListener("click",()=>{this.container.querySelectorAll(".water-color-btn").forEach(b=>b.classList.remove("active")),p.classList.add("active");const u=p.dataset.color,g=parseInt(u,16);this.terrainEditor?.setWaterColor(g)})})}show(){this.container.style.display="block"}hide(){this.container.style.display="none"}}class ii{constructor(e,t,s={}){this.container=e,this.scene=t,this.options=s,this.settings={ambientIntensity:1.2,ambientColor:"#ffffff",sunIntensity:2,sunColor:"#ffffff",sunAngle:45,skyColor:"#87CEEB",fogEnabled:!0,fogNear:80,fogFar:300,gridVisible:!0,gridSize:100,terrainSize:100},this.isExpanded=!0,this.onUpdate=s.onUpdate||(()=>{})}init(){this.render(),this.bindEvents()}render(){this.container.innerHTML=`
            <div class="scene-settings-panel">
                <div class="settings-header" id="settings-header-toggle">
                    <span class="settings-icon">⚙️</span>
                    <span>Scene Settings</span>
                    <span class="settings-toggle">▼</span>
                </div>
                <div class="settings-content" id="settings-content">
                    <div class="settings-section">
                        <label class="section-label">Lighting</label>
                        <div class="setting-row">
                            <span>Ambient</span>
                            <input type="range" id="ambient-intensity" min="0" max="3" step="0.1" value="${this.settings.ambientIntensity}" />
                            <span id="ambient-val">${this.settings.ambientIntensity.toFixed(1)}</span>
                        </div>
                        <div class="setting-row">
                            <span>Sun</span>
                            <input type="range" id="sun-intensity" min="0" max="5" step="0.1" value="${this.settings.sunIntensity}" />
                            <span id="sun-val">${this.settings.sunIntensity.toFixed(1)}</span>
                        </div>
                        <div class="setting-row">
                            <span>Sun Angle</span>
                            <input type="range" id="sun-angle" min="0" max="90" step="1" value="${this.settings.sunAngle}" />
                            <span id="sun-angle-val">${this.settings.sunAngle}°</span>
                        </div>
                        <div class="setting-row color-row">
                            <span>Sun Color</span>
                            <input type="color" id="sun-color" value="${this.settings.sunColor}" />
                        </div>
                    </div>

                    <div class="settings-section">
                        <label class="section-label">Sky & Fog</label>
                        <div class="setting-row color-row">
                            <span>Sky Color</span>
                            <input type="color" id="sky-color" value="${this.settings.skyColor}" />
                        </div>
                        <div class="setting-row checkbox-row">
                            <label><input type="checkbox" id="fog-enabled" ${this.settings.fogEnabled?"checked":""} /> Enable Fog</label>
                        </div>
                        <div class="setting-row" id="fog-settings" style="${this.settings.fogEnabled?"":"opacity: 0.5; pointer-events: none;"}">
                            <span>Distance</span>
                            <input type="range" id="fog-far" min="100" max="1000" step="10" value="${this.settings.fogFar}" />
                            <span id="fog-val">${this.settings.fogFar}</span>
                        </div>
                    </div>

                    <div class="settings-section">
                        <label class="section-label">Grid & Terrain</label>
                        <div class="setting-row checkbox-row">
                            <label><input type="checkbox" id="grid-visible" ${this.settings.gridVisible?"checked":""} /> Show Grid</label>
                        </div>
                        <div class="setting-row">
                            <span>Grid Size</span>
                            <input type="range" id="grid-size" min="20" max="200" step="10" value="${this.settings.gridSize}" />
                            <span id="grid-size-val">${this.settings.gridSize}</span>
                        </div>
                        <div class="setting-row">
                            <span>Terrain</span>
                            <input type="range" id="terrain-size" min="50" max="500" step="10" value="${this.settings.terrainSize}" />
                            <span id="terrain-size-val">${this.settings.terrainSize}</span>
                        </div>
                    </div>

                    <div class="settings-section">
                        <label class="section-label">Presets</label>
                        <div class="preset-buttons">
                            <button class="preset-btn" data-preset="day" title="Bright daylight">☀️ Day</button>
                            <button class="preset-btn" data-preset="sunset" title="Golden hour">🌅 Sunset</button>
                            <button class="preset-btn" data-preset="night" title="Moonlit night">🌙 Night</button>
                            <button class="preset-btn" data-preset="overcast" title="Cloudy weather">☁️ Overcast</button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .scene-settings-panel {
                    background: rgba(20, 26, 43, 0.98);
                    border: 1px solid #2a3150;
                    border-radius: 10px;
                    overflow: hidden;
                    font-family: 'Jost', sans-serif;
                }
                .settings-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: rgba(14, 18, 32, 0.6);
                    border-bottom: 1px solid #2a3150;
                    cursor: pointer;
                    font-weight: 600;
                    color: #6ee7b7;
                    font-size: 13px;
                }
                .settings-header:hover {
                    background: rgba(110, 231, 183, 0.1);
                }
                .settings-icon {
                    font-size: 16px;
                }
                .settings-toggle {
                    margin-left: auto;
                    font-size: 10px;
                    transition: transform 0.2s;
                }
                .scene-settings-panel.collapsed .settings-toggle {
                    transform: rotate(-90deg);
                }
                .scene-settings-panel.collapsed .settings-content {
                    display: none;
                }
                .settings-content {
                    padding: 10px;
                    max-height: 400px;
                    overflow-y: auto;
                }
                .settings-content::-webkit-scrollbar {
                    width: 4px;
                }
                .settings-content::-webkit-scrollbar-thumb {
                    background: #2a3150;
                    border-radius: 2px;
                }
                .settings-section {
                    margin-bottom: 14px;
                }
                .settings-section:last-child {
                    margin-bottom: 0;
                }
                .section-label {
                    display: block;
                    font-size: 11px;
                    font-weight: 600;
                    color: #a5b4d0;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .setting-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 12px;
                    color: #e8eaf6;
                }
                .setting-row span:first-child {
                    min-width: 60px;
                    color: #a5b4d0;
                }
                .setting-row input[type="range"] {
                    flex: 1;
                    height: 4px;
                    accent-color: #6ee7b7;
                }
                .setting-row span:last-child {
                    min-width: 35px;
                    text-align: right;
                    font-size: 11px;
                    color: #6ee7b7;
                }
                .color-row input[type="color"] {
                    width: 32px;
                    height: 24px;
                    border: 1px solid #2a3150;
                    border-radius: 4px;
                    padding: 0;
                    cursor: pointer;
                    background: transparent;
                }
                .checkbox-row label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    color: #e8eaf6;
                }
                .checkbox-row input[type="checkbox"] {
                    accent-color: #6ee7b7;
                }
                .preset-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 6px;
                }
                .preset-btn {
                    padding: 8px 12px;
                    background: rgba(42, 49, 80, 0.5);
                    border: 1px solid #2a3150;
                    border-radius: 6px;
                    color: #e8eaf6;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .preset-btn:hover {
                    border-color: #6ee7b7;
                    background: rgba(110, 231, 183, 0.1);
                }
            </style>
        `}bindEvents(){const e=this.container.querySelector("#settings-header-toggle"),t=this.container.querySelector(".scene-settings-panel");e&&t&&e.addEventListener("click",()=>{t.classList.toggle("collapsed"),this.isExpanded=!t.classList.contains("collapsed")}),this.bindSlider("ambient-intensity","ambient-val",s=>{this.settings.ambientIntensity=s,this.onUpdate("ambientIntensity",s)},s=>s.toFixed(1)),this.bindSlider("sun-intensity","sun-val",s=>{this.settings.sunIntensity=s,this.onUpdate("sunIntensity",s)},s=>s.toFixed(1)),this.bindSlider("sun-angle","sun-angle-val",s=>{this.settings.sunAngle=s,this.onUpdate("sunAngle",s)},s=>`${s}°`),this.bindSlider("fog-far","fog-val",s=>{this.settings.fogFar=s,this.onUpdate("fogFar",s)}),this.bindSlider("grid-size","grid-size-val",s=>{this.settings.gridSize=s,this.onUpdate("gridSize",s)}),this.bindSlider("terrain-size","terrain-size-val",s=>{this.settings.terrainSize=s,this.onUpdate("terrainSize",s)}),this.bindColorPicker("sun-color",s=>{this.settings.sunColor=s,this.onUpdate("sunColor",s)}),this.bindColorPicker("sky-color",s=>{this.settings.skyColor=s,this.onUpdate("skyColor",s)}),this.bindCheckbox("fog-enabled",s=>{this.settings.fogEnabled=s,this.onUpdate("fogEnabled",s);const i=document.getElementById("fog-settings");i&&(i.style.opacity=s?"1":"0.5",i.style.pointerEvents=s?"auto":"none")}),this.bindCheckbox("grid-visible",s=>{this.settings.gridVisible=s,this.onUpdate("gridVisible",s)}),this.container.querySelectorAll(".preset-btn").forEach(s=>{s.addEventListener("click",()=>this.applyPreset(s.dataset.preset))})}bindSlider(e,t,s,i=n=>n){const n=document.getElementById(e),a=document.getElementById(t);n&&a&&n.addEventListener("input",()=>{const o=parseFloat(n.value);a.textContent=i(o),s(o)})}bindColorPicker(e,t){const s=document.getElementById(e);s&&s.addEventListener("input",()=>t(s.value))}bindCheckbox(e,t){const s=document.getElementById(e);s&&s.addEventListener("change",()=>t(s.checked))}applyPreset(e){const s={day:{ambientIntensity:1.2,sunIntensity:2,sunAngle:60,sunColor:"#ffffff",skyColor:"#87CEEB",fogEnabled:!0,fogFar:300},sunset:{ambientIntensity:.8,sunIntensity:1.5,sunAngle:15,sunColor:"#ff8c42",skyColor:"#ff6b6b",fogEnabled:!0,fogFar:200},night:{ambientIntensity:.3,sunIntensity:.5,sunAngle:30,sunColor:"#8ba4c7",skyColor:"#1a1a2e",fogEnabled:!0,fogFar:150},overcast:{ambientIntensity:1,sunIntensity:.8,sunAngle:45,sunColor:"#c9c9c9",skyColor:"#9ca3af",fogEnabled:!0,fogFar:250}}[e];s&&(Object.assign(this.settings,s),this.updateUIFromSettings(),Object.entries(s).forEach(([i,n])=>{this.onUpdate(i,n)}))}updateUIFromSettings(){const e=this.settings;this.updateSlider("ambient-intensity","ambient-val",e.ambientIntensity,o=>o.toFixed(1)),this.updateSlider("sun-intensity","sun-val",e.sunIntensity,o=>o.toFixed(1)),this.updateSlider("sun-angle","sun-angle-val",e.sunAngle,o=>`${o}°`),this.updateSlider("fog-far","fog-val",e.fogFar),this.updateSlider("grid-size","grid-size-val",e.gridSize),this.updateSlider("terrain-size","terrain-size-val",e.terrainSize);const t=document.getElementById("sun-color");t&&(t.value=e.sunColor);const s=document.getElementById("sky-color");s&&(s.value=e.skyColor);const i=document.getElementById("fog-enabled");i&&(i.checked=e.fogEnabled);const n=document.getElementById("grid-visible");n&&(n.checked=e.gridVisible);const a=document.getElementById("fog-settings");a&&(a.style.opacity=e.fogEnabled?"1":"0.5",a.style.pointerEvents=e.fogEnabled?"auto":"none")}updateSlider(e,t,s,i=n=>n){const n=document.getElementById(e),a=document.getElementById(t);n&&(n.value=s),a&&(a.textContent=i(s))}}class ni extends zt{constructor(e){super(e)}load(e,t,s,i){const n=this,a=this.path===""?Rt.extractUrlBase(e):this.path,o=new Bt(this.manager);o.setPath(this.path),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(r){try{t(n.parse(r,a))}catch(l){i?i(l):console.error(l),n.manager.itemError(e)}},s,i)}setMaterialOptions(e){return this.materialOptions=e,this}parse(e,t){const s=e.split(`
`);let i={};const n=/\s+/,a={};for(let r=0;r<s.length;r++){let l=s[r];if(l=l.trim(),l.length===0||l.charAt(0)==="#")continue;const h=l.indexOf(" ");let d=h>=0?l.substring(0,h):l;d=d.toLowerCase();let f=h>=0?l.substring(h+1):"";if(f=f.trim(),d==="newmtl")i={name:f},a[f]=i;else if(d==="ka"||d==="kd"||d==="ks"||d==="ke"){const p=f.split(n,3);i[d]=[parseFloat(p[0]),parseFloat(p[1]),parseFloat(p[2])]}else i[d]=f}const o=new ai(this.resourcePath||t,this.materialOptions);return o.setCrossOrigin(this.crossOrigin),o.setManager(this.manager),o.setMaterials(a),o}}class ai{constructor(e="",t={}){this.baseUrl=e,this.options=t,this.materialsInfo={},this.materials={},this.materialsArray=[],this.nameLookup={},this.crossOrigin="anonymous",this.side=this.options.side!==void 0?this.options.side:Nt,this.wrap=this.options.wrap!==void 0?this.options.wrap:gt}setCrossOrigin(e){return this.crossOrigin=e,this}setManager(e){this.manager=e}setMaterials(e){this.materialsInfo=this.convert(e),this.materials={},this.materialsArray=[],this.nameLookup={}}convert(e){if(!this.options)return e;const t={};for(const s in e){const i=e[s],n={};t[s]=n;for(const a in i){let o=!0,r=i[a];const l=a.toLowerCase();switch(l){case"kd":case"ka":case"ks":this.options&&this.options.normalizeRGB&&(r=[r[0]/255,r[1]/255,r[2]/255]),this.options&&this.options.ignoreZeroRGBs&&r[0]===0&&r[1]===0&&r[2]===0&&(o=!1);break}o&&(n[l]=r)}}return t}preload(){for(const e in this.materialsInfo)this.create(e)}getIndex(e){return this.nameLookup[e]}getAsArray(){let e=0;for(const t in this.materialsInfo)this.materialsArray[e]=this.create(t),this.nameLookup[t]=e,e++;return this.materialsArray}create(e){return this.materials[e]===void 0&&this.createMaterial_(e),this.materials[e]}createMaterial_(e){const t=this,s=this.materialsInfo[e],i={name:e,side:this.side};function n(o,r){return typeof r!="string"||r===""?"":/^https?:\/\//i.test(r)?r:o+r}function a(o,r){if(i[o])return;const l=t.getTextureParams(r,i),h=t.loadTexture(n(t.baseUrl,l.url));h.repeat.copy(l.scale),h.offset.copy(l.offset),h.wrapS=t.wrap,h.wrapT=t.wrap,(o==="map"||o==="emissiveMap")&&(h.colorSpace=pe),i[o]=h}for(const o in s){const r=s[o];let l;if(r!=="")switch(o.toLowerCase()){case"kd":i.color=Ie.toWorkingColorSpace(new D().fromArray(r),pe);break;case"ks":i.specular=Ie.toWorkingColorSpace(new D().fromArray(r),pe);break;case"ke":i.emissive=Ie.toWorkingColorSpace(new D().fromArray(r),pe);break;case"map_kd":a("map",r);break;case"map_ks":a("specularMap",r);break;case"map_ke":a("emissiveMap",r);break;case"norm":a("normalMap",r);break;case"map_bump":case"bump":a("bumpMap",r);break;case"map_d":a("alphaMap",r),i.transparent=!0;break;case"ns":i.shininess=parseFloat(r);break;case"d":l=parseFloat(r),l<1&&(i.opacity=l,i.transparent=!0);break;case"tr":l=parseFloat(r),this.options&&this.options.invertTrProperty&&(l=1-l),l>0&&(i.opacity=1-l,i.transparent=!0);break}}return this.materials[e]=new Ut(i),this.materials[e]}getTextureParams(e,t){const s={scale:new I(1,1),offset:new I(0,0)},i=e.split(/\s+/);let n;return n=i.indexOf("-bm"),n>=0&&(t.bumpScale=parseFloat(i[n+1]),i.splice(n,2)),n=i.indexOf("-s"),n>=0&&(s.scale.set(parseFloat(i[n+1]),parseFloat(i[n+2])),i.splice(n,4)),n=i.indexOf("-o"),n>=0&&(s.offset.set(parseFloat(i[n+1]),parseFloat(i[n+2])),i.splice(n,4)),s.url=i.join(" ").trim(),s}loadTexture(e,t,s,i,n){const a=this.manager!==void 0?this.manager:Ft;let o=a.getHandler(e);o===null&&(o=new _t(a)),o.setCrossOrigin&&o.setCrossOrigin(this.crossOrigin);const r=o.load(e,s,i,n);return t!==void 0&&(r.mapping=t),r}}const st={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]};class fe{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new fi(e)}),this.register(function(e){return new mi(e)}),this.register(function(e){return new vi(e)}),this.register(function(e){return new wi(e)}),this.register(function(e){return new Si(e)}),this.register(function(e){return new ki(e)}),this.register(function(e){return new bi(e)}),this.register(function(e){return new yi(e)}),this.register(function(e){return new xi(e)}),this.register(function(e){return new Ti(e)}),this.register(function(e){return new Ei(e)}),this.register(function(e){return new Mi(e)}),this.register(function(e){return new Ci(e)}),this.register(function(e){return new Ai(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,s,i){const n=new gi,a=[];for(let o=0,r=this.pluginCallbacks.length;o<r;o++)a.push(this.pluginCallbacks[o](n));n.setPlugins(a),n.setTextureUtils(this.textureUtils),n.writeAsync(e,t,i).catch(s)}parseAsync(e,t){const s=this;return new Promise(function(i,n){s.parse(e,i,n,t)})}}const S={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},Ne="KHR_mesh_quantization",U={};U[Vt]=S.NEAREST;U[Kt]=S.NEAREST_MIPMAP_NEAREST;U[Xt]=S.NEAREST_MIPMAP_LINEAR;U[Yt]=S.LINEAR;U[Qt]=S.LINEAR_MIPMAP_NEAREST;U[Jt]=S.LINEAR_MIPMAP_LINEAR;U[Zt]=S.CLAMP_TO_EDGE;U[gt]=S.REPEAT;U[es]=S.MIRRORED_REPEAT;const it={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},oi=new D,nt=12,ri=1179937895,li=2,at=8,ci=1313821514,di=5130562;function ue(c,e){return c.length===e.length&&c.every(function(t,s){return t===e[s]})}function hi(c){return new TextEncoder().encode(c).buffer}function pi(c){return ue(c.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function ui(c,e,t){const s={min:new Array(c.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(c.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let i=e;i<e+t;i++)for(let n=0;n<c.itemSize;n++){let a;c.itemSize>4?a=c.array[i*c.itemSize+n]:(n===0?a=c.getX(i):n===1?a=c.getY(i):n===2?a=c.getZ(i):n===3&&(a=c.getW(i)),c.normalized===!0&&(a=_.normalize(a,c.array))),s.min[n]=Math.min(s.min[n],a),s.max[n]=Math.max(s.max[n],a)}return s}function kt(c){return Math.ceil(c/4)*4}function Ue(c,e=0){const t=kt(c.byteLength);if(t!==c.byteLength){const s=new Uint8Array(t);if(s.set(new Uint8Array(c)),e!==0)for(let i=c.byteLength;i<t;i++)s[i]=e;return s.buffer}return c}function ot(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function rt(c,e){if(c.toBlob!==void 0)return new Promise(s=>c.toBlob(s,e));let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),c.convertToBlob({type:e,quality:t})}class gi{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r"+jt}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,s={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},s),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);const i=this,n=i.buffers,a=i.json;s=i.options;const o=i.extensionsUsed,r=i.extensionsRequired,l=new Blob(n,{type:"application/octet-stream"}),h=Object.keys(o),d=Object.keys(r);if(h.length>0&&(a.extensionsUsed=h),d.length>0&&(a.extensionsRequired=d),a.buffers&&a.buffers.length>0&&(a.buffers[0].byteLength=l.size),s.binary===!0){const f=new FileReader;f.readAsArrayBuffer(l),f.onloadend=function(){const p=Ue(f.result),u=new DataView(new ArrayBuffer(at));u.setUint32(0,p.byteLength,!0),u.setUint32(4,di,!0);const g=Ue(hi(JSON.stringify(a)),32),b=new DataView(new ArrayBuffer(at));b.setUint32(0,g.byteLength,!0),b.setUint32(4,ci,!0);const C=new ArrayBuffer(nt),L=new DataView(C);L.setUint32(0,ri,!0),L.setUint32(4,li,!0);const ye=nt+b.byteLength+g.byteLength+u.byteLength+p.byteLength;L.setUint32(8,ye,!0);const x=new Blob([C,b,g,u,p],{type:"application/octet-stream"}),E=new FileReader;E.readAsArrayBuffer(x),E.onloadend=function(){t(E.result)}}}else if(a.buffers&&a.buffers.length>0){const f=new FileReader;f.readAsDataURL(l),f.onloadend=function(){const p=f.result;a.buffers[0].uri=p,t(a)}}else t(a)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;const s=this.options,i=this.extensionsUsed;try{const n=JSON.parse(JSON.stringify(e.userData));if(s.includeCustomExtensions&&n.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(const a in n.gltfExtensions)t.extensions[a]=n.gltfExtensions[a],i[a]=!0;delete n.gltfExtensions}Object.keys(n).length>0&&(t.extras=n)}catch(n){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+n.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){const i=new Map;i.set(!0,this.uid++),i.set(!1,this.uid++),this.uids.set(e,i)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;const s=new m;for(let i=0,n=e.count;i<n;i++)if(Math.abs(s.fromBufferAttribute(e,i).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){const t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);const s=e.clone(),i=new m;for(let n=0,a=s.count;n<a;n++)i.fromBufferAttribute(s,n),i.x===0&&i.y===0&&i.z===0?i.setX(1):i.normalize(),s.setXYZ(n,i.x,i.y,i.z);return t.attributesNormalized.set(e,s),s}applyTextureTransform(e,t){let s=!1;const i={};(t.offset.x!==0||t.offset.y!==0)&&(i.offset=t.offset.toArray(),s=!0),t.rotation!==0&&(i.rotation=t.rotation,s=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(i.scale=t.repeat.toArray(),s=!0),s&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=i,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function s(p){return p.colorSpace===pe?function(g){return g<.04045?g*.0773993808:Math.pow(g*.9478672986+.0521327014,2.4)}:function(g){return g}}e instanceof Pe&&(e=await this.decompressTextureAsync(e)),t instanceof Pe&&(t=await this.decompressTextureAsync(t));const i=e?e.image:null,n=t?t.image:null,a=Math.max(i?i.width:0,n?n.width:0),o=Math.max(i?i.height:0,n?n.height:0),r=ot();r.width=a,r.height=o;const l=r.getContext("2d",{willReadFrequently:!0});l.fillStyle="#00ffff",l.fillRect(0,0,a,o);const h=l.getImageData(0,0,a,o);if(i){l.drawImage(i,0,0,a,o);const p=s(e),u=l.getImageData(0,0,a,o).data;for(let g=2;g<u.length;g+=4)h.data[g]=p(u[g]/256)*256}if(n){l.drawImage(n,0,0,a,o);const p=s(t),u=l.getImageData(0,0,a,o).data;for(let g=1;g<u.length;g+=4)h.data[g]=p(u[g]/256)*256}l.putImageData(h,0,0);const f=(e||t).clone();return f.source=new qt(r),f.colorSpace=Gt,f.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),f}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){const t=this.json,s=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),s.push(e),0}processBufferView(e,t,s,i,n){const a=this.json;a.bufferViews||(a.bufferViews=[]);let o;switch(t){case S.BYTE:case S.UNSIGNED_BYTE:o=1;break;case S.SHORT:case S.UNSIGNED_SHORT:o=2;break;default:o=4}let r=e.itemSize*o;n===S.ARRAY_BUFFER&&(r=Math.ceil(r/4)*4);const l=kt(i*r),h=new DataView(new ArrayBuffer(l));let d=0;for(let u=s;u<s+i;u++){for(let g=0;g<e.itemSize;g++){let b;e.itemSize>4?b=e.array[u*e.itemSize+g]:(g===0?b=e.getX(u):g===1?b=e.getY(u):g===2?b=e.getZ(u):g===3&&(b=e.getW(u)),e.normalized===!0&&(b=_.normalize(b,e.array))),t===S.FLOAT?h.setFloat32(d,b,!0):t===S.INT?h.setInt32(d,b,!0):t===S.UNSIGNED_INT?h.setUint32(d,b,!0):t===S.SHORT?h.setInt16(d,b,!0):t===S.UNSIGNED_SHORT?h.setUint16(d,b,!0):t===S.BYTE?h.setInt8(d,b):t===S.UNSIGNED_BYTE&&h.setUint8(d,b),d+=o}d%r!==0&&(d+=r-d%r)}const f={buffer:this.processBuffer(h.buffer),byteOffset:this.byteOffset,byteLength:l};return n!==void 0&&(f.target=n),n===S.ARRAY_BUFFER&&(f.byteStride=r),this.byteOffset+=l,a.bufferViews.push(f),{id:a.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){const t=this,s=t.json;return s.bufferViews||(s.bufferViews=[]),new Promise(function(i){const n=new FileReader;n.readAsArrayBuffer(e),n.onloadend=function(){const a=Ue(n.result),o={buffer:t.processBuffer(a),byteOffset:t.byteOffset,byteLength:a.byteLength};t.byteOffset+=a.byteLength,i(s.bufferViews.push(o)-1)}})}processAccessor(e,t,s,i){const n=this.json,a={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"};let o;if(e.array.constructor===Float32Array)o=S.FLOAT;else if(e.array.constructor===Int32Array)o=S.INT;else if(e.array.constructor===Uint32Array)o=S.UNSIGNED_INT;else if(e.array.constructor===Int16Array)o=S.SHORT;else if(e.array.constructor===Uint16Array)o=S.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)o=S.BYTE;else if(e.array.constructor===Uint8Array)o=S.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(s===void 0&&(s=0),(i===void 0||i===1/0)&&(i=e.count),i===0)return null;const r=ui(e,s,i);let l;t!==void 0&&(l=e===t.index?S.ELEMENT_ARRAY_BUFFER:S.ARRAY_BUFFER);const h=this.processBufferView(e,o,s,i,l),d={bufferView:h.id,byteOffset:h.byteOffset,componentType:o,count:i,max:r.max,min:r.min,type:a[e.itemSize]};return e.normalized===!0&&(d.normalized=!0),n.accessors||(n.accessors=[]),n.accessors.push(d)-1}processImage(e,t,s,i="image/png"){if(e!==null){const n=this,a=n.cache,o=n.json,r=n.options,l=n.pending;a.images.has(e)||a.images.set(e,{});const h=a.images.get(e),d=i+":flipY/"+s.toString();if(h[d]!==void 0)return h[d];o.images||(o.images=[]);const f={mimeType:i},p=ot();p.width=Math.min(e.width,r.maxTextureSize),p.height=Math.min(e.height,r.maxTextureSize);const u=p.getContext("2d",{willReadFrequently:!0});if(s===!0&&(u.translate(0,p.height),u.scale(1,-1)),e.data!==void 0){t!==$t&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>r.maxTextureSize||e.height>r.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);const b=new Uint8ClampedArray(e.height*e.width*4);for(let C=0;C<b.length;C+=4)b[C+0]=e.data[C+0],b[C+1]=e.data[C+1],b[C+2]=e.data[C+2],b[C+3]=e.data[C+3];u.putImageData(new ImageData(b,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)u.drawImage(e,0,0,p.width,p.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");r.binary===!0?l.push(rt(p,i).then(b=>n.processBufferViewImage(b)).then(b=>{f.bufferView=b})):p.toDataURL!==void 0?f.uri=p.toDataURL(i):l.push(rt(p,i).then(b=>new FileReader().readAsDataURL(b)).then(b=>{f.uri=b}));const g=o.images.push(f)-1;return h[d]=g,g}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){const t=this.json;t.samplers||(t.samplers=[]);const s={magFilter:U[e.magFilter],minFilter:U[e.minFilter],wrapS:U[e.wrapS],wrapT:U[e.wrapT]};return t.samplers.push(s)-1}async processTextureAsync(e){const s=this.options,i=this.cache,n=this.json;if(i.textures.has(e))return i.textures.get(e);n.textures||(n.textures=[]),e instanceof Pe&&(e=await this.decompressTextureAsync(e,s.maxTextureSize));let a=e.userData.mimeType;a==="image/webp"&&(a="image/png");const o={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY,a)};e.name&&(o.name=e.name),await this._invokeAllAsync(async function(l){l.writeTexture&&await l.writeTexture(e,o)});const r=n.textures.push(o)-1;return i.textures.set(e,r),r}async processMaterialAsync(e){const t=this.cache,s=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;s.materials||(s.materials=[]);const i={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const n=e.color.toArray().concat([e.opacity]);if(ue(n,[1,1,1,1])||(i.pbrMetallicRoughness.baseColorFactor=n),e.isMeshStandardMaterial?(i.pbrMetallicRoughness.metallicFactor=e.metalness,i.pbrMetallicRoughness.roughnessFactor=e.roughness):(i.pbrMetallicRoughness.metallicFactor=0,i.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){const o=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),r={index:await this.processTextureAsync(o),texCoord:o.channel};this.applyTextureTransform(r,o),i.pbrMetallicRoughness.metallicRoughnessTexture=r}if(e.map){const o={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(o,e.map),i.pbrMetallicRoughness.baseColorTexture=o}if(e.emissive){const o=e.emissive;if(Math.max(o.r,o.g,o.b)>0&&(i.emissiveFactor=e.emissive.toArray()),e.emissiveMap){const l={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(l,e.emissiveMap),i.emissiveTexture=l}}if(e.normalMap){const o={index:await this.processTextureAsync(e.normalMap),texCoord:e.normalMap.channel};e.normalScale&&e.normalScale.x!==1&&(o.scale=e.normalScale.x),this.applyTextureTransform(o,e.normalMap),i.normalTexture=o}if(e.aoMap){const o={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(o.strength=e.aoMapIntensity),this.applyTextureTransform(o,e.aoMap),i.occlusionTexture=o}e.transparent?i.alphaMode="BLEND":e.alphaTest>0&&(i.alphaMode="MASK",i.alphaCutoff=e.alphaTest),e.side===ie&&(i.doubleSided=!0),e.name!==""&&(i.name=e.name),this.serializeUserData(e,i),await this._invokeAllAsync(async function(o){o.writeMaterialAsync&&await o.writeMaterialAsync(e,i)});const a=s.materials.push(i)-1;return t.materials.set(e,a),a}async processMeshAsync(e){const t=this.cache,s=this.json,i=[e.geometry.uuid];if(Array.isArray(e.material))for(let x=0,E=e.material.length;x<E;x++)i.push(e.material[x].uuid);else i.push(e.material.uuid);const n=i.join(":");if(t.meshes.has(n))return t.meshes.get(n);const a=e.geometry;let o;e.isLineSegments?o=S.LINES:e.isLineLoop?o=S.LINE_LOOP:e.isLine?o=S.LINE_STRIP:e.isPoints?o=S.POINTS:o=e.material.wireframe?S.LINES:S.TRIANGLES;const r={},l={},h=[],d=[],f={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},p=a.getAttribute("normal");p!==void 0&&!this.isNormalizedNormalAttribute(p)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),a.setAttribute("normal",this.createNormalizedNormalAttribute(p)));let u=null;for(let x in a.attributes){if(x.slice(0,5)==="morph")continue;const E=a.attributes[x];if(x=f[x]||x.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(x)||(x="_"+x),t.attributes.has(this.getUID(E))){l[x]=t.attributes.get(this.getUID(E));continue}u=null;const P=E.array;x==="JOINTS_0"&&!(P instanceof Uint16Array)&&!(P instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),u=new W(new Uint16Array(P),E.itemSize,E.normalized)):(P instanceof Uint32Array||P instanceof Int32Array)&&!x.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${x}" converted to type FLOAT.`),u=fe.Utils.toFloat32BufferAttribute(E));const N=this.processAccessor(u||E,a);N!==null&&(x.startsWith("_")||this.detectMeshQuantization(x,E),l[x]=N,t.attributes.set(this.getUID(E),N))}if(p!==void 0&&a.setAttribute("normal",p),Object.keys(l).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){const x=[],E=[],O={};if(e.morphTargetDictionary!==void 0)for(const P in e.morphTargetDictionary)O[e.morphTargetDictionary[P]]=P;for(let P=0;P<e.morphTargetInfluences.length;++P){const N={};let Ve=!1;for(const re in a.morphAttributes){if(re!=="position"&&re!=="normal"){Ve||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),Ve=!0);continue}const $=a.morphAttributes[re][P],Le=re.toUpperCase(),le=a.attributes[re];if(t.attributes.has(this.getUID($,!0))){N[Le]=t.attributes.get(this.getUID($,!0));continue}const ce=$.clone();if(!a.morphTargetsRelative)for(let z=0,Tt=$.count;z<Tt;z++)for(let ae=0;ae<$.itemSize;ae++)ae===0&&ce.setX(z,$.getX(z)-le.getX(z)),ae===1&&ce.setY(z,$.getY(z)-le.getY(z)),ae===2&&ce.setZ(z,$.getZ(z)-le.getZ(z)),ae===3&&ce.setW(z,$.getW(z)-le.getW(z));N[Le]=this.processAccessor(ce,a),t.attributes.set(this.getUID(le,!0),N[Le])}d.push(N),x.push(e.morphTargetInfluences[P]),e.morphTargetDictionary!==void 0&&E.push(O[P])}r.weights=x,E.length>0&&(r.extras={},r.extras.targetNames=E)}const g=Array.isArray(e.material);if(g&&a.groups.length===0)return null;let b=!1;if(g&&a.index===null){const x=[];for(let E=0,O=a.attributes.position.count;E<O;E++)x[E]=E;a.setIndex(x),b=!0}const C=g?e.material:[e.material],L=g?a.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let x=0,E=L.length;x<E;x++){const O={mode:o,attributes:l};if(this.serializeUserData(a,O),d.length>0&&(O.targets=d),a.index!==null){let N=this.getUID(a.index);(L[x].start!==void 0||L[x].count!==void 0)&&(N+=":"+L[x].start+":"+L[x].count),t.attributes.has(N)?O.indices=t.attributes.get(N):(O.indices=this.processAccessor(a.index,a,L[x].start,L[x].count),t.attributes.set(N,O.indices)),O.indices===null&&delete O.indices}const P=await this.processMaterialAsync(C[L[x].materialIndex]);P!==null&&(O.material=P),h.push(O)}b===!0&&a.setIndex(null),r.primitives=h,s.meshes||(s.meshes=[]),await this._invokeAllAsync(function(x){x.writeMesh&&x.writeMesh(e,r)});const ye=s.meshes.push(r)-1;return t.meshes.set(n,ye),ye}detectMeshQuantization(e,t){if(this.extensionsUsed[Ne])return;let s;switch(t.array.constructor){case Int8Array:s="byte";break;case Uint8Array:s="unsigned byte";break;case Int16Array:s="short";break;case Uint16Array:s="unsigned short";break;default:return}t.normalized&&(s+=" normalized");const i=e.split("_",1)[0];st[i]&&st[i].includes(s)&&(this.extensionsUsed[Ne]=!0,this.extensionsRequired[Ne]=!0)}processCamera(e){const t=this.json;t.cameras||(t.cameras=[]);const s=e.isOrthographicCamera,i={type:s?"orthographic":"perspective"};return s?i.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:i.perspective={aspectRatio:e.aspect,yfov:_.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(i.name=e.type),t.cameras.push(i)-1}processAnimation(e,t){const s=this.json,i=this.nodeMap;s.animations||(s.animations=[]),e=fe.Utils.mergeMorphTargetTracks(e.clone(),t);const n=e.tracks,a=[],o=[];for(let r=0;r<n.length;++r){const l=n[r],h=Ce.parseTrackName(l.name);let d=Ce.findNode(t,h.nodeName);const f=it[h.propertyName];if(h.objectName==="bones"&&(d.isSkinnedMesh===!0?d=d.skeleton.getBoneByName(h.objectIndex):d=void 0),!d||!f){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',l.name);continue}const p=1;let u=l.values.length/l.times.length;f===it.morphTargetInfluences&&(u/=d.morphTargetInfluences.length);let g;l.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(g="CUBICSPLINE",u/=3):l.getInterpolation()===Wt?g="STEP":g="LINEAR",o.push({input:this.processAccessor(new W(l.times,p)),output:this.processAccessor(new W(l.values,u)),interpolation:g}),a.push({sampler:o.length-1,target:{node:i.get(d),path:f}})}return s.animations.push({name:e.name||"clip_"+s.animations.length,samplers:o,channels:a}),s.animations.length-1}processSkin(e){const t=this.json,s=this.nodeMap,i=t.nodes[s.get(e)],n=e.skeleton;if(n===void 0)return null;const a=e.skeleton.bones[0];if(a===void 0)return null;const o=[],r=new Float32Array(n.bones.length*16),l=new De;for(let d=0;d<n.bones.length;++d)o.push(s.get(n.bones[d])),l.copy(n.boneInverses[d]),l.multiply(e.bindMatrix).toArray(r,d*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new W(r,16)),joints:o,skeleton:s.get(a)}),i.skin=t.skins.length-1}async processNodeAsync(e){const t=this.json,s=this.options,i=this.nodeMap;t.nodes||(t.nodes=[]);const n={};if(s.trs){const o=e.quaternion.toArray(),r=e.position.toArray(),l=e.scale.toArray();ue(o,[0,0,0,1])||(n.rotation=o),ue(r,[0,0,0])||(n.translation=r),ue(l,[1,1,1])||(n.scale=l)}else e.matrixAutoUpdate&&e.updateMatrix(),pi(e.matrix)===!1&&(n.matrix=e.matrix.elements);if(e.name!==""&&(n.name=String(e.name)),this.serializeUserData(e,n),e.isMesh||e.isLine||e.isPoints){const o=await this.processMeshAsync(e);o!==null&&(n.mesh=o)}else e.isCamera&&(n.camera=this.processCamera(e));if(e.isSkinnedMesh&&this.skins.push(e),e.children.length>0){const o=[];for(let r=0,l=e.children.length;r<l;r++){const h=e.children[r];if(h.visible||s.onlyVisible===!1){const d=await this.processNodeAsync(h);d!==null&&o.push(d)}}o.length>0&&(n.children=o)}await this._invokeAllAsync(function(o){o.writeNode&&o.writeNode(e,n)});const a=t.nodes.push(n)-1;return i.set(e,a),a}async processSceneAsync(e){const t=this.json,s=this.options;t.scenes||(t.scenes=[],t.scene=0);const i={};e.name!==""&&(i.name=e.name),t.scenes.push(i);const n=[];for(let a=0,o=e.children.length;a<o;a++){const r=e.children[a];if(r.visible||s.onlyVisible===!1){const l=await this.processNodeAsync(r);l!==null&&n.push(l)}}n.length>0&&(i.nodes=n),this.serializeUserData(e,i)}async processObjectsAsync(e){const t=new Me;t.name="AuxScene";for(let s=0;s<e.length;s++)t.children.push(e[s]);await this.processSceneAsync(t)}async processInputAsync(e){const t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(i){i.beforeParse&&i.beforeParse(e)});const s=[];for(let i=0;i<e.length;i++)e[i]instanceof Me?await this.processSceneAsync(e[i]):s.push(e[i]);s.length>0&&await this.processObjectsAsync(s);for(let i=0;i<this.skins.length;++i)this.processSkin(this.skins[i]);for(let i=0;i<t.animations.length;++i)this.processAnimation(t.animations[i],e[0]);await this._invokeAllAsync(function(i){i.afterParse&&i.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,s=this.plugins.length;t<s;t++)await e(this.plugins[t])}}class fi{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}const s=this.writer,i=s.json,n=s.extensionsUsed,a={};e.name&&(a.name=e.name),a.color=e.color.toArray(),a.intensity=e.intensity,e.isDirectionalLight?a.type="directional":e.isPointLight?(a.type="point",e.distance>0&&(a.range=e.distance)):e.isSpotLight&&(a.type="spot",e.distance>0&&(a.range=e.distance),a.spot={},a.spot.innerConeAngle=(1-e.penumbra)*e.angle,a.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),n[this.name]||(i.extensions=i.extensions||{},i.extensions[this.name]={lights:[]},n[this.name]=!0);const o=i.extensions[this.name].lights;o.push(a),t.extensions=t.extensions||{},t.extensions[this.name]={light:o.length-1}}}class mi{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;const i=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},i[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}}class bi{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;const s=this.writer,i=s.extensionsUsed,n={};if(n.clearcoatFactor=e.clearcoat,e.clearcoatMap){const a={index:await s.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};s.applyTextureTransform(a,e.clearcoatMap),n.clearcoatTexture=a}if(n.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){const a={index:await s.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};s.applyTextureTransform(a,e.clearcoatRoughnessMap),n.clearcoatRoughnessTexture=a}if(e.clearcoatNormalMap){const a={index:await s.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(a.scale=e.clearcoatNormalScale.x),s.applyTextureTransform(a,e.clearcoatNormalMap),n.clearcoatNormalTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class yi{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;const i=this.writer.extensionsUsed,n={};n.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class xi{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;const s=this.writer,i=s.extensionsUsed,n={};if(n.iridescenceFactor=e.iridescence,e.iridescenceMap){const a={index:await s.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};s.applyTextureTransform(a,e.iridescenceMap),n.iridescenceTexture=a}if(n.iridescenceIor=e.iridescenceIOR,n.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],n.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){const a={index:await s.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};s.applyTextureTransform(a,e.iridescenceThicknessMap),n.iridescenceThicknessTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class vi{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const s=this.writer,i=s.extensionsUsed,n={};if(n.transmissionFactor=e.transmission,e.transmissionMap){const a={index:await s.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};s.applyTextureTransform(a,e.transmissionMap),n.transmissionTexture=a}t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class wi{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const s=this.writer,i=s.extensionsUsed,n={};if(n.thicknessFactor=e.thickness,e.thicknessMap){const a={index:await s.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};s.applyTextureTransform(a,e.thicknessMap),n.thicknessTexture=a}e.attenuationDistance!==1/0&&(n.attenuationDistance=e.attenuationDistance),n.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class Si{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;const i=this.writer.extensionsUsed,n={};n.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class ki{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(oi)&&!e.specularIntensityMap&&!e.specularColorMap)return;const s=this.writer,i=s.extensionsUsed,n={};if(e.specularIntensityMap){const a={index:await s.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};s.applyTextureTransform(a,e.specularIntensityMap),n.specularTexture=a}if(e.specularColorMap){const a={index:await s.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};s.applyTextureTransform(a,e.specularColorMap),n.specularColorTexture=a}n.specularFactor=e.specularIntensity,n.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class Ti{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;const s=this.writer,i=s.extensionsUsed,n={};if(e.sheenRoughnessMap){const a={index:await s.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};s.applyTextureTransform(a,e.sheenRoughnessMap),n.sheenRoughnessTexture=a}if(e.sheenColorMap){const a={index:await s.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};s.applyTextureTransform(a,e.sheenColorMap),n.sheenColorTexture=a}n.sheenRoughnessFactor=e.sheenRoughness,n.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class Ei{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;const s=this.writer,i=s.extensionsUsed,n={};if(e.anisotropyMap){const a={index:await s.processTextureAsync(e.anisotropyMap)};s.applyTextureTransform(a,e.anisotropyMap),n.anisotropyTexture=a}n.anisotropyStrength=e.anisotropy,n.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class Mi{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;const i=this.writer.extensionsUsed,n={};n.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class Ci{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;const s=this.writer,i=s.extensionsUsed,n={};if(e.bumpMap){const a={index:await s.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};s.applyTextureTransform(a,e.bumpMap),n.bumpTexture=a}n.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=n,i[this.name]=!0}}class Ai{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;const s=this.writer,i=e,n=new Float32Array(i.count*3),a=new Float32Array(i.count*4),o=new Float32Array(i.count*3),r=new De,l=new m,h=new Ht,d=new m;for(let p=0;p<i.count;p++)i.getMatrixAt(p,r),r.decompose(l,h,d),l.toArray(n,p*3),h.toArray(a,p*4),d.toArray(o,p*3);const f={TRANSLATION:s.processAccessor(new W(n,3)),ROTATION:s.processAccessor(new W(a,4)),SCALE:s.processAccessor(new W(o,3))};i.instanceColor&&(f._COLOR_0=s.processAccessor(i.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:f},s.extensionsUsed[this.name]=!0,s.extensionsRequired[this.name]=!0}}fe.Utils={insertKeyframe:function(c,e){const s=c.getValueSize(),i=new c.TimeBufferType(c.times.length+1),n=new c.ValueBufferType(c.values.length+s),a=c.createInterpolant(new c.ValueBufferType(s));let o;if(c.times.length===0){i[0]=e;for(let r=0;r<s;r++)n[r]=0;o=0}else if(e<c.times[0]){if(Math.abs(c.times[0]-e)<.001)return 0;i[0]=e,i.set(c.times,1),n.set(a.evaluate(e),0),n.set(c.values,s),o=0}else if(e>c.times[c.times.length-1]){if(Math.abs(c.times[c.times.length-1]-e)<.001)return c.times.length-1;i[i.length-1]=e,i.set(c.times,0),n.set(c.values,0),n.set(a.evaluate(e),c.values.length),o=i.length-1}else for(let r=0;r<c.times.length;r++){if(Math.abs(c.times[r]-e)<.001)return r;if(c.times[r]<e&&c.times[r+1]>e){i.set(c.times.slice(0,r+1),0),i[r+1]=e,i.set(c.times.slice(r+1),r+2),n.set(c.values.slice(0,(r+1)*s),0),n.set(a.evaluate(e),(r+1)*s),n.set(c.values.slice((r+1)*s),(r+2)*s),o=r+1;break}}return c.times=i,c.values=n,o},mergeMorphTargetTracks:function(c,e){const t=[],s={},i=c.tracks;for(let n=0;n<i.length;++n){let a=i[n];const o=Ce.parseTrackName(a.name),r=Ce.findNode(e,o.nodeName);if(o.propertyName!=="morphTargetInfluences"||o.propertyIndex===void 0){t.push(a);continue}if(a.createInterpolant!==a.InterpolantFactoryMethodDiscrete&&a.createInterpolant!==a.InterpolantFactoryMethodLinear){if(a.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),a=a.clone(),a.setInterpolation(ts)}const l=r.morphTargetInfluences.length,h=r.morphTargetDictionary[o.propertyIndex];if(h===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+o.propertyIndex);let d;if(s[r.uuid]===void 0){d=a.clone();const p=new d.ValueBufferType(l*d.times.length);for(let u=0;u<d.times.length;u++)p[u*l+h]=d.values[u];d.name=(o.nodeName||"")+".morphTargetInfluences",d.values=p,s[r.uuid]=d,t.push(d);continue}const f=a.createInterpolant(new a.ValueBufferType(1));d=s[r.uuid];for(let p=0;p<d.times.length;p++)d.values[p*l+h]=f.evaluate(d.times[p]);for(let p=0;p<a.times.length;p++){const u=this.insertKeyframe(d,a.times[p]);d.values[u*l+h]=a.values[p]}}return c.tracks=t,c},toFloat32BufferAttribute:function(c){const e=new W(new Float32Array(c.count*c.itemSize),c.itemSize,!1);if(!c.normalized&&!c.isInterleavedBufferAttribute)return e.array.set(c.array),e;for(let t=0,s=c.count;t<s;t++)for(let i=0;i<c.itemSize;i++)e.setComponent(t,i,c.getComponent(t,i));return e}};class Di{constructor(){this.gltfLoader=new me,this.fbxLoader=new ft,this.objLoader=new ys,this.mtlLoader=new ni,this.gltfExporter=new fe}getSupportedFormats(){return[".glb",".gltf",".fbx",".obj",".json"]}getAcceptString(){return".glb,.gltf,.fbx,.obj,.json"}async importFromFile(e){const t=this.getExtension(e.name),s=URL.createObjectURL(e);try{let i;switch(t){case"glb":case"gltf":i=await this.loadGLTF(s,e.name);break;case"fbx":i=await this.loadFBX(s,e.name);break;case"obj":i=await this.loadOBJ(s,e.name);break;case"json":i=await this.loadJSON(e);break;default:throw new Error(`Unsupported format: .${t}`)}return URL.revokeObjectURL(s),i}catch(i){throw URL.revokeObjectURL(s),i}}getExtension(e){return e.split(".").pop().toLowerCase()}async loadGLTF(e,t){return new Promise((s,i)=>{this.gltfLoader.load(e,n=>{const a=n.scene;a.userData.assetName=t.replace(/\.[^/.]+$/,""),a.userData.assetId="imported_gltf",a.userData.sourceFormat="gltf",a.userData.animations=n.animations||[],this.normalizeModel(a),s({type:"model",object:a,animations:n.animations})},void 0,i)})}async loadFBX(e,t){return new Promise((s,i)=>{this.fbxLoader.load(e,n=>{n.userData.assetName=t.replace(/\.[^/.]+$/,""),n.userData.assetId="imported_fbx",n.userData.sourceFormat="fbx",n.userData.animations=n.animations||[],this.normalizeModel(n),s({type:"model",object:n,animations:n.animations})},void 0,i)})}async loadOBJ(e,t){return new Promise((s,i)=>{this.objLoader.load(e,n=>{n.userData.assetName=t.replace(/\.[^/.]+$/,""),n.userData.assetId="imported_obj",n.userData.sourceFormat="obj",this.normalizeModel(n),s({type:"model",object:n,animations:[]})},void 0,i)})}async loadJSON(e){const t=await e.text(),s=JSON.parse(t);if(s.metadata&&s.metadata.type==="Object"){const n=new ss().parse(s);return n.userData.assetName=e.name.replace(/\.[^/.]+$/,""),n.userData.assetId="imported_json",n.userData.sourceFormat="three_json",{type:"model",object:n,animations:[]}}if(Array.isArray(s)||s.objects)return{type:"scene",data:s,filename:e.name};throw new Error("Unknown JSON format")}normalizeModel(e){const t=new $e().setFromObject(e),s=t.getSize(new m),i=Math.max(s.x,s.y,s.z);if(i>10){const a=5/i;e.scale.multiplyScalar(a)}else if(i<.1){const a=1/i;e.scale.multiplyScalar(a)}t.setFromObject(e);const n=t.getCenter(new m);e.position.sub(new m(n.x,t.min.y,n.z)),e.traverse(a=>{a.isMesh&&(a.castShadow=!0,a.receiveShadow=!0)})}async exportToGLB(e,t="model.glb"){return new Promise((s,i)=>{this.gltfExporter.parse(e,n=>{const a=new Blob([n],{type:"application/octet-stream"});this.downloadBlob(a,t),s(a)},i,{binary:!0})})}async exportToGLTF(e,t="model.gltf"){return new Promise((s,i)=>{this.gltfExporter.parse(e,n=>{const a=new Blob([JSON.stringify(n,null,2)],{type:"application/json"});this.downloadBlob(a,t),s(a)},i,{binary:!1})})}async convertToGLB(e){return new Promise((t,s)=>{this.gltfExporter.parse(e,i=>{const n=new Blob([i],{type:"application/octet-stream"});t(n)},s,{binary:!0})})}downloadBlob(e,t){const s=URL.createObjectURL(e),i=document.createElement("a");i.href=s,i.download=t,i.click(),URL.revokeObjectURL(s)}showImportDialog(e){const t=document.createElement("div");t.className="import-dialog-overlay",t.innerHTML=`
            <div class="import-dialog">
                <div class="import-header">
                    <h2>Import Asset</h2>
                    <button class="import-close">&times;</button>
                </div>
                <div class="import-body">
                    <div class="import-dropzone" id="import-dropzone">
                        <div class="dropzone-icon">📁</div>
                        <div class="dropzone-text">Drag & drop files here</div>
                        <div class="dropzone-hint">or click to browse</div>
                        <div class="dropzone-formats">Supported: GLB, GLTF, FBX, OBJ, JSON</div>
                        <input type="file" id="import-file-input" accept="${this.getAcceptString()}" multiple hidden>
                    </div>
                    <div class="import-preview" id="import-preview" style="display: none;">
                        <div class="preview-list" id="preview-list"></div>
                    </div>
                </div>
                <div class="import-footer">
                    <label class="import-option">
                        <input type="checkbox" id="import-convert-glb" checked>
                        <span>Convert to GLB format</span>
                    </label>
                    <div class="import-actions">
                        <button class="import-btn cancel" id="import-cancel">Cancel</button>
                        <button class="import-btn primary" id="import-confirm" disabled>Import</button>
                    </div>
                </div>
            </div>
        `,document.body.appendChild(t);const s=t.querySelector("#import-dropzone"),i=t.querySelector("#import-file-input"),n=t.querySelector("#import-preview"),a=t.querySelector("#preview-list"),o=t.querySelector("#import-confirm"),r=t.querySelector("#import-cancel"),l=t.querySelector(".import-close"),h=t.querySelector("#import-convert-glb");let d=[];const f=()=>{if(d.length===0){n.style.display="none",s.style.display="flex",o.disabled=!0;return}n.style.display="block",s.style.display="none",o.disabled=!1,a.innerHTML=d.map((u,g)=>`
                <div class="preview-item">
                    <span class="preview-icon">${this.getFileIcon(u.name)}</span>
                    <span class="preview-name">${u.name}</span>
                    <span class="preview-size">${this.formatSize(u.size)}</span>
                    <button class="preview-remove" data-index="${g}">&times;</button>
                </div>
            `).join(""),a.querySelectorAll(".preview-remove").forEach(u=>{u.addEventListener("click",g=>{d.splice(parseInt(g.target.dataset.index),1),f()})})};s.addEventListener("click",()=>i.click()),s.addEventListener("dragover",u=>{u.preventDefault(),s.classList.add("dragover")}),s.addEventListener("dragleave",()=>{s.classList.remove("dragover")}),s.addEventListener("drop",u=>{u.preventDefault(),s.classList.remove("dragover"),d=[...u.dataTransfer.files],f()}),i.addEventListener("change",()=>{d=[...i.files],f()});const p=()=>t.remove();l.addEventListener("click",p),r.addEventListener("click",p),t.addEventListener("click",u=>{u.target===t&&p()}),o.addEventListener("click",async()=>{const u=h.checked;o.disabled=!0,o.textContent="Importing...";try{for(const g of d){const b=await this.importFromFile(g);b.type==="model"&&u&&b.object.userData.sourceFormat!=="gltf"&&(b.glbBlob=await this.convertToGLB(b.object)),e&&e(b)}p()}catch(g){console.error("Import failed:",g),alert("Import failed: "+g.message),o.disabled=!1,o.textContent="Import"}})}getFileIcon(e){const t=this.getExtension(e);return{glb:"📦",gltf:"📦",fbx:"🎭",obj:"🔷",json:"📄"}[t]||"📁"}formatSize(e){return e<1024?e+" B":e<1024*1024?(e/1024).toFixed(1)+" KB":(e/(1024*1024)).toFixed(1)+" MB"}}const Li=new Di;class Ii{constructor(e,t){this.container=e,this.onAction=t,this.isExpanded=!1,this.element=null,this.init()}init(){this.element=document.createElement("div"),this.element.id="quick-actions-bar",this.element.innerHTML=this.getHTML(),this.element.style.cssText=this.getStyles(),document.body.appendChild(this.element),this.bindEvents()}getStyles(){return`
            position: fixed;
            right: 340px;
            top: 52px;
            z-index: 150;
            pointer-events: auto;
        `}getHTML(){return`
            <style>
                #quick-actions-bar {
                    font-family: 'Jost', sans-serif;
                }
                .qa-toggle {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6ee7b7, #10b981);
                    border: 2px solid rgba(255,255,255,0.2);
                    color: #0e1220;
                    font-size: 20px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 16px rgba(110, 231, 183, 0.4);
                    transition: all 0.3s;
                }
                .qa-toggle:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 24px rgba(110, 231, 183, 0.6);
                }
                .qa-toggle.active {
                    transform: rotate(45deg);
                }
                .qa-menu {
                    position: absolute;
                    top: 54px;
                    right: 0;
                    background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(30,36,53,0.98));
                    border: 1px solid #2a3150;
                    border-radius: 12px;
                    padding: 12px;
                    min-width: 180px;
                    display: none;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                }
                .qa-menu.visible {
                    display: block;
                    animation: qaSlideIn 0.2s ease-out;
                }
                @keyframes qaSlideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .qa-section-label {
                    color: #6ee7b7;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 8px 0 6px 0;
                    padding-bottom: 4px;
                    border-bottom: 1px solid rgba(110, 231, 183, 0.2);
                }
                .qa-section-label:first-child {
                    margin-top: 0;
                }
                .qa-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    color: #e8eaf6;
                    font-size: 13px;
                }
                .qa-item:hover {
                    background: rgba(110, 231, 183, 0.15);
                }
                .qa-item-icon {
                    font-size: 18px;
                    width: 24px;
                    text-align: center;
                }
                .qa-item-label {
                    flex: 1;
                }
                .qa-item-hint {
                    font-size: 10px;
                    color: #6ee7b7;
                    opacity: 0.7;
                }
                .qa-divider {
                    height: 1px;
                    background: #2a3150;
                    margin: 8px 0;
                }
            </style>
            <button class="qa-toggle" id="qa-toggle" title="Quick Add Menu">+</button>
            <div class="qa-menu" id="qa-menu">
                <div class="qa-section-label">Game Objects</div>
                <div class="qa-item" data-action="add-spawn">
                    <span class="qa-item-icon">🎯</span>
                    <span class="qa-item-label">Spawn Point</span>
                </div>
                <div class="qa-item" data-action="add-trigger">
                    <span class="qa-item-icon">🔶</span>
                    <span class="qa-item-label">Trigger Zone</span>
                </div>
                <div class="qa-item" data-action="add-waypoint">
                    <span class="qa-item-icon">📍</span>
                    <span class="qa-item-label">AI Waypoint</span>
                </div>
                <div class="qa-item" data-action="add-camera">
                    <span class="qa-item-icon">📷</span>
                    <span class="qa-item-label">Camera</span>
                </div>
                
                <div class="qa-section-label">Lights</div>
                <div class="qa-item" data-action="add-point-light">
                    <span class="qa-item-icon">💡</span>
                    <span class="qa-item-label">Point Light</span>
                </div>
                <div class="qa-item" data-action="add-spot-light">
                    <span class="qa-item-icon">🔦</span>
                    <span class="qa-item-label">Spot Light</span>
                </div>
                
                <div class="qa-section-label">Primitives</div>
                <div class="qa-item" data-action="add-cube">
                    <span class="qa-item-icon">⬜</span>
                    <span class="qa-item-label">Cube</span>
                </div>
                <div class="qa-item" data-action="add-sphere">
                    <span class="qa-item-icon">🔵</span>
                    <span class="qa-item-label">Sphere</span>
                </div>
                <div class="qa-item" data-action="add-plane">
                    <span class="qa-item-icon">▬</span>
                    <span class="qa-item-label">Plane</span>
                </div>
                
                <div class="qa-divider"></div>
                <div class="qa-item" data-action="play-mode" style="background: rgba(110, 231, 183, 0.1);">
                    <span class="qa-item-icon">▶️</span>
                    <span class="qa-item-label">Play Mode</span>
                    <span class="qa-item-hint">Test</span>
                </div>
            </div>
        `}bindEvents(){const e=this.element.querySelector("#qa-toggle"),t=this.element.querySelector("#qa-menu");e.addEventListener("click",()=>{this.isExpanded=!this.isExpanded,e.classList.toggle("active",this.isExpanded),t.classList.toggle("visible",this.isExpanded)}),document.addEventListener("click",s=>{!this.element.contains(s.target)&&this.isExpanded&&(this.isExpanded=!1,e.classList.remove("active"),t.classList.remove("visible"))}),this.element.querySelectorAll(".qa-item").forEach(s=>{s.addEventListener("click",()=>{const i=s.dataset.action;this.onAction&&this.onAction(i),this.isExpanded=!1,e.classList.remove("active"),t.classList.remove("visible")})})}destroy(){this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element)}}class Pi{constructor(){this.hints=[{id:"welcome",message:"Welcome to World Builder! Middle-click to rotate camera, right-click to pan.",duration:5e3},{id:"tools",message:"Tip: Use Q/W/E/R for quick tool switching (Select/Move/Rotate/Scale)",duration:4e3},{id:"terrain",message:"Tip: Press T to enter terrain sculpting mode",duration:4e3},{id:"place",message:"Tip: Drag assets from the library or use + button for quick placement",duration:4e3},{id:"play",message:"Tip: Click ▶️ Play Mode to test your scene with a character!",duration:4e3}],this.currentIndex=0,this.container=null,this.storageKey="grudge_editor_hints_seen",this.hasSeenHints=this.loadSeenStatus(),this.hintTimeout=null,this.isActive=!1}loadSeenStatus(){try{return JSON.parse(localStorage.getItem(this.storageKey))||!1}catch{return!1}}markAsSeen(){this.hasSeenHints=!0,localStorage.setItem(this.storageKey,"true")}init(){this.container=document.createElement("div"),this.container.id="onboarding-hints",this.container.innerHTML=`
            <style>
                #onboarding-hints {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 200;
                    pointer-events: auto;
                    font-family: 'Jost', sans-serif;
                }
                .hint-bubble {
                    background: linear-gradient(135deg, rgba(110, 231, 183, 0.95), rgba(16, 185, 129, 0.95));
                    color: #0e1220;
                    padding: 12px 20px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 24px rgba(110, 231, 183, 0.4);
                    animation: hintSlideUp 0.4s ease-out;
                    max-width: 500px;
                }
                @keyframes hintSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .hint-bubble.hiding {
                    animation: hintSlideDown 0.3s ease-in forwards;
                }
                @keyframes hintSlideDown {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(20px); }
                }
                .hint-icon {
                    font-size: 18px;
                }
                .hint-message {
                    flex: 1;
                }
                .hint-dismiss {
                    background: rgba(0,0,0,0.2);
                    border: none;
                    color: #0e1220;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }
                .hint-dismiss:hover {
                    background: rgba(0,0,0,0.3);
                }
                .hint-skip-all {
                    background: none;
                    border: none;
                    color: rgba(14, 18, 32, 0.7);
                    font-size: 11px;
                    cursor: pointer;
                    text-decoration: underline;
                    margin-left: 8px;
                }
                .hint-skip-all:hover {
                    color: #0e1220;
                }
            </style>
            <div class="hint-bubble" id="hint-bubble" style="display: none;">
                <span class="hint-icon">💡</span>
                <span class="hint-message" id="hint-message"></span>
                <button class="hint-dismiss" id="hint-dismiss">×</button>
                <button class="hint-skip-all" id="hint-skip-all">Don't show again</button>
            </div>
        `,document.body.appendChild(this.container),this.bindEvents()}bindEvents(){this.container.querySelector("#hint-dismiss").addEventListener("click",()=>{this.hideCurrentHint(),this.showNextHint()}),this.container.querySelector("#hint-skip-all").addEventListener("click",()=>{this.markAsSeen(),this.hideCurrentHint(),this.isActive=!1})}start(){this.hasSeenHints||(this.isActive=!0,this.currentIndex=0,setTimeout(()=>this.showHint(0),1500))}showHint(e){if(!this.isActive||e>=this.hints.length){this.markAsSeen();return}const t=this.hints[e],s=this.container.querySelector("#hint-bubble"),i=this.container.querySelector("#hint-message");i.textContent=t.message,s.style.display="flex",s.classList.remove("hiding"),this.hintTimeout=setTimeout(()=>{this.hideCurrentHint(),this.currentIndex++,setTimeout(()=>this.showHint(this.currentIndex),500)},t.duration)}showNextHint(){this.currentIndex++,this.currentIndex<this.hints.length?setTimeout(()=>this.showHint(this.currentIndex),300):this.markAsSeen()}hideCurrentHint(){clearTimeout(this.hintTimeout);const e=this.container.querySelector("#hint-bubble");e.classList.add("hiding"),setTimeout(()=>{e.style.display="none",e.classList.remove("hiding")},300)}showCustomHint(e,t=3e3){const s=this.container.querySelector("#hint-bubble"),i=this.container.querySelector("#hint-message");i.textContent=e,s.style.display="flex",s.classList.remove("hiding"),clearTimeout(this.hintTimeout),this.hintTimeout=setTimeout(()=>this.hideCurrentHint(),t)}destroy(){clearTimeout(this.hintTimeout),this.container&&this.container.parentNode&&this.container.parentNode.removeChild(this.container)}}class Oi{constructor(e){this.onAction=e,this.element=null,this.isVisible=!1,this.centerX=0,this.centerY=0,this.items=[{action:"add-cube",icon:"⬜",label:"Cube",angle:0},{action:"add-sphere",icon:"🔵",label:"Sphere",angle:40},{action:"add-cylinder",icon:"🛢️",label:"Cylinder",angle:80},{action:"add-spawn",icon:"🎯",label:"Spawn",angle:120},{action:"add-point-light",icon:"💡",label:"Light",angle:160},{action:"add-camera",icon:"📷",label:"Camera",angle:200},{action:"add-trigger",icon:"🔶",label:"Trigger",angle:240},{action:"add-waypoint",icon:"📍",label:"Waypoint",angle:280},{action:"add-plane",icon:"▬",label:"Plane",angle:320}],this.init()}init(){this.element=document.createElement("div"),this.element.id="radial-menu",this.element.innerHTML=this.getHTML(),this.injectStyles(),document.body.appendChild(this.element),this.bindEvents()}injectStyles(){if(document.getElementById("radial-menu-styles"))return;const e=document.createElement("style");e.id="radial-menu-styles",e.textContent=`
            #radial-menu {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
                display: none;
                font-family: 'Jost', sans-serif;
            }
            #radial-menu.visible {
                display: block;
            }
            .radial-container {
                position: relative;
                width: 200px;
                height: 200px;
                transform: translate(-50%, -50%);
            }
            .radial-center {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, rgba(20,26,43,0.95), rgba(30,36,53,0.95));
                border: 2px solid #6ee7b7;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6ee7b7;
                font-size: 20px;
                box-shadow: 0 0 20px rgba(110, 231, 183, 0.4);
                pointer-events: auto;
                animation: radialPulse 2s ease-in-out infinite;
            }
            @keyframes radialPulse {
                0%, 100% { box-shadow: 0 0 20px rgba(110, 231, 183, 0.4); }
                50% { box-shadow: 0 0 30px rgba(110, 231, 183, 0.7); }
            }
            .radial-item {
                position: absolute;
                width: 48px;
                height: 48px;
                background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(30,36,53,0.95));
                border: 2px solid #2a3150;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease-out;
                pointer-events: auto;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                opacity: 0;
                transform: scale(0.6);
            }
            #radial-menu.visible .radial-item {
                opacity: 1;
                transform: scale(1);
            }
            .radial-item:hover {
                border-color: #6ee7b7;
                background: rgba(110, 231, 183, 0.25);
                box-shadow: 0 0 20px rgba(110, 231, 183, 0.6);
                transform: scale(1.15);
                z-index: 10;
            }
            .radial-item-icon {
                font-size: 18px;
                line-height: 1;
            }
            .radial-item-label {
                font-size: 8px;
                color: #a5b4d0;
                margin-top: 2px;
                white-space: nowrap;
                transition: color 0.15s;
            }
            .radial-item:hover .radial-item-label {
                color: #6ee7b7;
            }
            .radial-tooltip {
                position: absolute;
                bottom: -28px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(14, 18, 32, 0.95);
                border: 1px solid #6ee7b7;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 11px;
                color: #e8eaf6;
                white-space: nowrap;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.15s;
            }
            .radial-item:hover .radial-tooltip {
                opacity: 1;
            }
            .radial-backdrop {
                position: fixed;
                inset: 0;
                pointer-events: auto;
            }
        `,document.head.appendChild(e)}getHTML(){return`
            <div class="radial-backdrop" id="radial-backdrop"></div>
            <div class="radial-container">
                <div class="radial-center">+</div>
                ${this.items.map((s,i)=>{const n=(s.angle-90)*Math.PI/180,a=Math.cos(n)*75,o=Math.sin(n)*75,r=i*.03,l=100+a-24,h=100+o-24;return`
                <div class="radial-item" 
                     data-action="${s.action}" 
                     title="${s.label}"
                     style="left: ${l}px; top: ${h}px; transition-delay: ${r}s;">
                    <span class="radial-item-icon">${s.icon}</span>
                    <span class="radial-item-label">${s.label}</span>
                </div>
            `}).join("")}
            </div>
        `}bindEvents(){const e=this.element.querySelector("#radial-backdrop");e.addEventListener("click",()=>this.hide()),e.addEventListener("contextmenu",t=>{t.preventDefault(),this.hide()}),this.element.querySelectorAll(".radial-item").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.action;this.onAction&&this.onAction(s),this.hide()})})}show(e,t){const a=Math.max(120,Math.min(window.innerWidth-100-20,e)),o=Math.max(120,Math.min(window.innerHeight-100-20,t));this.centerX=a,this.centerY=o,this.element.style.left=a+"px",this.element.style.top=o+"px",this.isVisible=!0,this.element.classList.add("visible"),this.onKeyDownBound=this.onKeyDown.bind(this),window.addEventListener("keydown",this.onKeyDownBound)}onKeyDown(e){e.key==="Escape"&&this.isVisible&&this.hide()}hide(){this.isVisible=!1,this.element.classList.remove("visible"),this.onKeyDownBound&&window.removeEventListener("keydown",this.onKeyDownBound)}toggle(e,t){this.isVisible?this.hide():this.show(e,t)}destroy(){this.hide(),this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element);const e=document.getElementById("radial-menu-styles");e&&e.remove()}}class zi{constructor(){this.prefix="grudge_scenes_",this.storageKey="grudge_cloud_scenes"}async saveScene(e,t){try{const s=this.prefix+e,i=JSON.stringify(t),n=this.getStoredScenes();return n[e]={data:t,savedAt:Date.now()},localStorage.setItem(this.storageKey,JSON.stringify(n)),console.log("Scene saved:",e),{success:!0,key:s}}catch(s){return console.error("Failed to save scene:",s),{success:!1,error:s.message}}}async loadScene(e){try{const s=this.getStoredScenes()[e];if(!s)throw new Error("Scene not found: "+e);return console.log("Scene loaded:",e),{success:!0,data:s.data}}catch(t){return console.error("Failed to load scene:",t),{success:!1,error:t.message}}}async listScenes(){try{const e=this.getStoredScenes();return{success:!0,scenes:Object.entries(e).map(([s,i])=>({name:s,savedAt:i.savedAt,size:JSON.stringify(i.data).length}))}}catch(e){return console.error("Failed to list scenes:",e),{success:!1,error:e.message,scenes:[]}}}async deleteScene(e){try{const t=this.getStoredScenes();return delete t[e],localStorage.setItem(this.storageKey,JSON.stringify(t)),console.log("Scene deleted:",e),{success:!0}}catch(t){return console.error("Failed to delete scene:",t),{success:!1,error:t.message}}}getStoredScenes(){try{const e=localStorage.getItem(this.storageKey);return e?JSON.parse(e):{}}catch{return{}}}serializeScene(e,t={}){const s={version:"1.0",name:t.name||"Untitled Scene",created:Date.now(),metadata:{author:t.author||"Unknown",description:t.description||""},settings:t.settings||{},objects:[]};return e.traverse(i=>{if(i===e||i.isHelper||i.type==="GridHelper"||i.userData?.isGizmo||!i.parent||i.parent!==e)return;const n=this.serializeObject(i);n&&s.objects.push(n)}),s}serializeObject(e){const t={uuid:e.uuid,name:e.name||"Object",type:e.type,position:e.position.toArray(),rotation:[e.rotation.x,e.rotation.y,e.rotation.z],scale:e.scale.toArray(),visible:e.visible,userData:{...e.userData}};return e.isMesh&&e.geometry&&(t.geometry={type:e.geometry.type,parameters:e.geometry.parameters||{}},e.material&&(t.material={type:e.material.type,color:e.material.color?.getHex(),metalness:e.material.metalness,roughness:e.material.roughness,transparent:e.material.transparent,opacity:e.material.opacity})),e.isLight&&(t.lightData={color:e.color.getHex(),intensity:e.intensity},e.isSpotLight&&(t.lightData.angle=e.angle,t.lightData.penumbra=e.penumbra,t.lightData.distance=e.distance),e.isPointLight&&(t.lightData.distance=e.distance,t.lightData.decay=e.decay)),e.children&&e.children.length>0&&(t.children=[],e.children.forEach(s=>{if(!s.isHelper){const i=this.serializeObject(s);i&&t.children.push(i)}})),t}deserializeScene(e,t){if(!e||!e.objects)return console.warn("Invalid scene data"),[];const s=[];return e.objects.forEach(i=>{const n=this.deserializeObject(i);n&&(t.add(n),s.push(n))}),s}deserializeObject(e){let t;switch(e.type){case"Mesh":t=this.createMesh(e);break;case"PointLight":t=new Ge(e.lightData?.color||16777215,e.lightData?.intensity||1,e.lightData?.distance||0,e.lightData?.decay||2);break;case"SpotLight":t=new We(e.lightData?.color||16777215,e.lightData?.intensity||1,e.lightData?.distance||0,e.lightData?.angle||Math.PI/3,e.lightData?.penumbra||0);break;case"DirectionalLight":t=new K(e.lightData?.color||16777215,e.lightData?.intensity||1);break;case"Group":default:t=new H;break}return t.name=e.name,t.position.fromArray(e.position),t.rotation.set(e.rotation[0],e.rotation[1],e.rotation[2]),t.scale.fromArray(e.scale),t.visible=e.visible!==!1,t.userData=e.userData||{},e.children&&e.children.forEach(s=>{const i=this.deserializeObject(s);i&&t.add(i)}),t}createMesh(e){let t;const s=e.geometry||{},i=s.parameters||{};switch(s.type){case"BoxGeometry":t=new j(i.width||1,i.height||1,i.depth||1);break;case"SphereGeometry":t=new te(i.radius||.5,i.widthSegments||32,i.heightSegments||16);break;case"CylinderGeometry":t=new se(i.radiusTop||.5,i.radiusBottom||.5,i.height||1);break;case"PlaneGeometry":t=new ne(i.width||1,i.height||1);break;default:t=new j(1,1,1)}let n;const a=e.material||{};n=new M({color:a.color??8947848,metalness:a.metalness??0,roughness:a.roughness??1,transparent:a.transparent??!1,opacity:a.opacity??1});const o=new k(t,n);return o.castShadow=!0,o.receiveShadow=!0,o}}const he=new zi,lt="grudge_stats_config",Fe={diminishingThreshold:25,hardCapThreshold:35,decayRate:.9,postCapEffectiveness:1e-4,statWeights:{strength:1.2,dexterity:1.1,constitution:1.3,intelligence:1,wisdom:.9,charisma:.6,luck:.7,willpower:.8},powerRankings:[{name:"Fodder",minScore:0,maxScore:49,color:"#888888"},{name:"Rookie",minScore:50,maxScore:74,color:"#AAAAAA"},{name:"Novice",minScore:75,maxScore:99,color:"#FFFFFF"},{name:"Apprentice",minScore:100,maxScore:124,color:"#00FF00"},{name:"Journeyman",minScore:125,maxScore:149,color:"#00FFAA"},{name:"Adept",minScore:150,maxScore:174,color:"#00AAFF"},{name:"Expert",minScore:175,maxScore:199,color:"#0066FF"},{name:"Master",minScore:200,maxScore:249,color:"#AA00FF"},{name:"Grandmaster",minScore:250,maxScore:299,color:"#FF00FF"},{name:"Champion",minScore:300,maxScore:349,color:"#FF6600"},{name:"Legend",minScore:350,maxScore:399,color:"#FFD700"},{name:"Mythic",minScore:400,maxScore:499,color:"#FF0000"},{name:"Divine",minScore:500,maxScore:9999,color:"#FFFFFF"}]};class Ri{constructor(){this.container=null,this.config=this.loadConfig(),this.isVisible=!1,this.onConfigChange=null}loadConfig(){try{const e=localStorage.getItem(lt);if(e)return{...Fe,...JSON.parse(e)}}catch(e){console.warn("Failed to load stats config:",e)}return{...Fe}}saveConfig(){try{localStorage.setItem(lt,JSON.stringify(this.config)),this.onConfigChange&&this.onConfigChange(this.config)}catch(e){console.warn("Failed to save stats config:",e)}}getConfig(){return this.config}create(){return this.container=document.createElement("div"),this.container.id="stats-admin-panel",this.container.style.cssText=`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 700px;
            max-height: 80vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #4a4a6a;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            z-index: 10000;
            display: none;
            flex-direction: column;
            font-family: 'Segoe UI', system-ui, sans-serif;
            color: #e0e0e0;
            overflow: hidden;
        `,this.container.innerHTML=`
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(0,0,0,0.3); border-bottom: 1px solid #4a4a6a;">
                <h2 style="margin: 0; font-size: 18px; color: #fff;">Stats Administration</h2>
                <button id="stats-admin-close" style="background: none; border: none; color: #888; font-size: 24px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            </div>
            
            <div style="padding: 20px; overflow-y: auto; max-height: calc(80vh - 120px);">
                <div style="display: grid; gap: 20px;">
                    
                    <section style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #8ab4f8;">Diminishing Returns Settings</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Threshold Start</label>
                                <input type="number" id="cfg-threshold" value="${this.config.diminishingThreshold}" min="1" max="100" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Hard Cap Point</label>
                                <input type="number" id="cfg-hardcap" value="${this.config.hardCapThreshold}" min="1" max="100" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Decay Rate (0-1)</label>
                                <input type="number" id="cfg-decay" value="${this.config.decayRate}" min="0.01" max="0.99" step="0.01" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                            <div>
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Post-Cap Effectiveness</label>
                                <input type="number" id="cfg-postcap" value="${this.config.postCapEffectiveness}" min="0" max="0.1" step="0.0001" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                        </div>
                    </section>
                    
                    <section style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #8ab4f8;">Stat Weights (Power Score Calculation)</h3>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                            ${Object.entries(this.config.statWeights).map(([e,t])=>`
                                <div>
                                    <label style="display: block; font-size: 11px; color: #888; margin-bottom: 4px; text-transform: capitalize;">${e}</label>
                                    <input type="number" id="weight-${e}" value="${t}" min="0" max="5" step="0.1" style="width: 100%; padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
                                </div>
                            `).join("")}
                        </div>
                    </section>
                    
                    <section style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #8ab4f8;">Power Rankings</h3>
                        <div id="rankings-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto;">
                            ${this.config.powerRankings.map((e,t)=>`
                                <div class="rank-row" data-index="${t}" style="display: grid; grid-template-columns: 120px 80px 80px 80px 30px; gap: 8px; align-items: center;">
                                    <input type="text" value="${e.name}" data-field="name" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
                                    <input type="number" value="${e.minScore}" data-field="minScore" placeholder="Min" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
                                    <input type="number" value="${e.maxScore}" data-field="maxScore" placeholder="Max" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
                                    <input type="color" value="${e.color}" data-field="color" style="padding: 2px; height: 30px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px;">
                                    <button class="remove-rank" style="background: #ff4444; border: none; color: white; border-radius: 4px; cursor: pointer; padding: 4px 8px;">&times;</button>
                                </div>
                            `).join("")}
                        </div>
                        <button id="add-ranking" style="margin-top: 10px; padding: 8px 16px; background: #4a6fa5; border: none; border-radius: 4px; color: white; cursor: pointer;">+ Add Ranking</button>
                    </section>
                    
                    <section style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #8ab4f8;">Preview Calculator</h3>
                        <div style="display: flex; gap: 12px; align-items: end;">
                            <div style="flex: 1;">
                                <label style="display: block; font-size: 12px; color: #888; margin-bottom: 4px;">Raw Stat Value</label>
                                <input type="number" id="preview-stat" value="25" min="1" max="100" style="width: 100%; padding: 8px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff;">
                            </div>
                            <button id="calc-preview" style="padding: 8px 20px; background: #4a6fa5; border: none; border-radius: 4px; color: white; cursor: pointer;">Calculate</button>
                        </div>
                        <div id="preview-result" style="margin-top: 12px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 4px; font-family: monospace; font-size: 12px;">
                            Enter a stat value and click Calculate
                        </div>
                    </section>
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 10px; padding: 16px 20px; background: rgba(0,0,0,0.3); border-top: 1px solid #4a4a6a;">
                <button id="stats-admin-reset" style="padding: 10px 20px; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer;">Reset to Defaults</button>
                <button id="stats-admin-save" style="padding: 10px 20px; background: #4CAF50; border: none; border-radius: 4px; color: white; cursor: pointer;">Save Changes</button>
            </div>
        `,document.body.appendChild(this.container),this.bindEvents(),this.container}bindEvents(){this.container.querySelector("#stats-admin-close").addEventListener("click",()=>this.hide()),this.container.querySelector("#stats-admin-save").addEventListener("click",()=>this.save()),this.container.querySelector("#stats-admin-reset").addEventListener("click",()=>this.reset()),this.container.querySelector("#add-ranking").addEventListener("click",()=>this.addRanking()),this.container.querySelector("#calc-preview").addEventListener("click",()=>this.calculatePreview()),this.container.querySelectorAll(".remove-rank").forEach(e=>{e.addEventListener("click",t=>{const s=t.target.closest(".rank-row");s&&s.remove()})})}show(){this.container||this.create(),this.container.style.display="flex",this.isVisible=!0}hide(){this.container&&(this.container.style.display="none"),this.isVisible=!1}toggle(){this.isVisible?this.hide():this.show()}save(){this.config.diminishingThreshold=parseInt(this.container.querySelector("#cfg-threshold").value),this.config.hardCapThreshold=parseInt(this.container.querySelector("#cfg-hardcap").value),this.config.decayRate=parseFloat(this.container.querySelector("#cfg-decay").value),this.config.postCapEffectiveness=parseFloat(this.container.querySelector("#cfg-postcap").value),Object.keys(this.config.statWeights).forEach(t=>{const s=this.container.querySelector(`#weight-${t}`);s&&(this.config.statWeights[t]=parseFloat(s.value))});const e=this.container.querySelectorAll(".rank-row");this.config.powerRankings=Array.from(e).map(t=>({name:t.querySelector('[data-field="name"]').value,minScore:parseInt(t.querySelector('[data-field="minScore"]').value),maxScore:parseInt(t.querySelector('[data-field="maxScore"]').value),color:t.querySelector('[data-field="color"]').value})),this.saveConfig(),this.hide(),alert("Stats configuration saved!")}reset(){confirm("Reset all stats settings to defaults?")&&(this.config={...Fe},this.saveConfig(),this.hide(),this.show())}addRanking(){const e=this.container.querySelector("#rankings-list"),t=e.children.length,s=document.createElement("div");s.className="rank-row",s.dataset.index=t,s.style.cssText="display: grid; grid-template-columns: 120px 80px 80px 80px 30px; gap: 8px; align-items: center;",s.innerHTML=`
            <input type="text" value="New Rank" data-field="name" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
            <input type="number" value="0" data-field="minScore" placeholder="Min" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
            <input type="number" value="100" data-field="maxScore" placeholder="Max" style="padding: 6px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px; color: #fff; font-size: 12px;">
            <input type="color" value="#FFFFFF" data-field="color" style="padding: 2px; height: 30px; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 4px;">
            <button class="remove-rank" style="background: #ff4444; border: none; color: white; border-radius: 4px; cursor: pointer; padding: 4px 8px;">&times;</button>
        `,s.querySelector(".remove-rank").addEventListener("click",()=>s.remove()),e.appendChild(s)}calculatePreview(){const e=parseInt(this.container.querySelector("#preview-stat").value),t=ms(e),s=this.container.querySelector("#preview-result");s.innerHTML=`
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div><strong>Raw Value:</strong> ${t.raw}</div>
                <div><strong>Effective Value:</strong> ${t.effective}</div>
                <div><strong>Category:</strong> <span style="color: ${t.category==="Normal"?"#4CAF50":t.category==="Diminishing"?"#FFC107":"#FF5722"}">${t.category}</span></div>
                <div><strong>Next Point Eff:</strong> ${t.nextPointEffectiveness}%</div>
                ${t.wastedPoints>0?`<div style="grid-column: span 2; color: #FF5722;"><strong>Wasted Points:</strong> ${t.wastedPoints}</div>`:""}
            </div>
        `}dispose(){this.container&&this.container.parentNode&&this.container.parentNode.removeChild(this.container),this.container=null}}const Bi=new Ri,X=[{id:"empty",name:"Empty Object",icon:"⬚",type:"empty",category:"Core"},{id:"trigger",name:"Trigger Zone",icon:"🔶",type:"trigger",category:"Core"},{id:"spawn",name:"Spawn Point",icon:"🎯",type:"spawn",category:"Core"},{id:"waypoint",name:"Waypoint",icon:"📍",type:"waypoint",category:"Core"},{id:"tree",name:"Tree",icon:"🌲",type:"procedural",generator:"tree",category:"Nature"},{id:"rock",name:"Rock",icon:"🪨",type:"procedural",generator:"rock",category:"Nature"},{id:"bush",name:"Bush",icon:"🌿",type:"procedural",generator:"bush",category:"Nature"},{id:"gladiator",name:"Gladiator",icon:"⚔️",type:"model",path:"/models/gladiator.glb",category:"Characters",animated:!0,collider:"capsule"},{id:"spartan",name:"Spartan",icon:"🛡️",type:"fbx",path:"/models/spartan.fbx",category:"Characters",animated:!0,collider:"capsule"},{id:"viking",name:"Viking",icon:"🪓",type:"model",path:"/models/characters/viking.glb",fallback:"/models/characters/viking/scene.gltf",category:"Characters",animated:!0,collider:{type:"capsule",radius:.5,height:1.8}},{id:"orc",name:"Orc Warrior",icon:"👹",type:"model",path:"/models/characters/orc.glb",fallback:"/models/characters/orc/scene.gltf",category:"Characters",animated:!0,collider:{type:"capsule",radius:.6,height:2}},{id:"wolf",name:"Wolf",icon:"🐺",type:"model",path:"/models/characters/wolf.glb",fallback:"/models/characters/wolf/scene.gltf",category:"Characters",animated:!0,collider:{type:"capsule",radius:.4,height:1}},{id:"shepherd",name:"German Shepherd",icon:"🐕",type:"model",path:"/models/characters/shepherd.glb",fallback:"/models/characters/shepherd/scene.gltf",category:"Characters",animated:!0,collider:{type:"capsule",radius:.35,height:.9}},{id:"toon",name:"Toon Character",icon:"🎭",type:"model",path:"/models/characters/toon_character.glb",category:"Characters",animated:!0,collider:"capsule"},{id:"swimmer",name:"Swimmer",icon:"🏊",type:"model",path:"/models/characters/swimmer.glb",category:"Characters",animated:!0,collider:"capsule"},{id:"base_char",name:"Base Character",icon:"🧍",type:"model",path:"/models/characters/base_character.glb",category:"Characters",animated:!0,collider:"capsule"},{id:"arena",name:"Arena",icon:"🏛️",type:"model",path:"/models/fps_shooter_game_arena_map_v3.glb",category:"Structures"},{id:"point_light",name:"Point Light",icon:"💡",type:"light",lightType:"point",category:"Lights"},{id:"spot_light",name:"Spot Light",icon:"🔦",type:"light",lightType:"spot",category:"Lights"},{id:"dir_light",name:"Dir Light",icon:"☀️",type:"light",lightType:"directional",category:"Lights"},{id:"camera",name:"Camera",icon:"📷",type:"camera",category:"Core"},{id:"cube",name:"Cube",icon:"⬜",type:"primitive",shape:"box",category:"Primitives"},{id:"sphere",name:"Sphere",icon:"🔵",type:"primitive",shape:"sphere",category:"Primitives"},{id:"plane",name:"Plane",icon:"▬",type:"primitive",shape:"plane",category:"Primitives"},{id:"cylinder",name:"Cylinder",icon:"🛢️",type:"primitive",shape:"cylinder",category:"Primitives"}],Ni=["Core","Primitives","Nature","Characters","Structures","Lights"],v={SELECT:"select",MOVE:"move",ROTATE:"rotate",SCALE:"scale",PLACE:"place",DELETE:"delete",SCULPT:"sculpt"};class Ui extends St{constructor(e){super("world_builder"),this.renderer=e,this.gltfLoader=new me,this.fbxLoader=new ft,this.gladiatorTexture=null,this.placedObjects=[],this.selectedObject=null,this.currentTool=v.SELECT,this.currentAsset=null,this.gridSize=1,this.orbitControls=null,this.transformControls=null,this.onBack=null,this.raycaster=new ut,this.mouse=new I,this.composer=null,this.outlinePass=null,this.isPlacing=!1,this.lastPlacePosition=null,this.placeSpacing=2,this.hierarchyPanel=null,this.inspectorPanel=null,this.menuBar=null,this.terrainEditor=null,this.terrainToolsPanel=null,this.undoStack=[],this.redoStack=[],this.clipboard=null,this.quickActions=null,this.onboardingHints=null,this.hoveredObject=null,this.radialMenu=null}async onEnter(e={}){await super.onEnter(e),this.setupScene(),this.setupLighting(),this.setupControls(),this.setupPostProcessing(),this.createTerrain(),this.createUI(),this.bindEvents(),await this.preloadGladiatorTexture()}async preloadGladiatorTexture(){try{(await this.gltfLoader.loadAsync("/models/gladiator.glb")).scene.traverse(t=>{t.isMesh&&t.material&&t.material.map&&(this.gladiatorTexture=t.material.map)}),console.log("Gladiator texture preloaded:",!!this.gladiatorTexture)}catch(e){console.warn("Could not preload gladiator texture:",e)}}setupPostProcessing(){if(!this.data.camera)return;const e=this.renderer.getSize(new I);this.composer=new vt(this.renderer);const t=new wt(this.threeScene,this.data.camera);this.composer.addPass(t),this.outlinePass=new V(new I(e.x,e.y),this.threeScene,this.data.camera),this.outlinePass.edgeStrength=3,this.outlinePass.edgeGlow=1,this.outlinePass.edgeThickness=2,this.outlinePass.pulsePeriod=2,this.outlinePass.visibleEdgeColor.set(65535),this.outlinePass.hiddenEdgeColor.set(65535),this.composer.addPass(this.outlinePass)}setupScene(){this.threeScene.background=new D(8900331),this.threeScene.fog=new Ye(8900331,80,300);const e=new Qe(100,100,6710886,4473924);e.position.y=.02,this.threeScene.add(e),this.grid=e}setupLighting(){this.ambient=new qe(16777215,1.2),this.threeScene.add(this.ambient);const e=new K(16777215,2);e.position.set(50,80,30),e.castShadow=!0,e.shadow.mapSize.width=2048,e.shadow.mapSize.height=2048,e.shadow.camera.near=.5,e.shadow.camera.far=200,e.shadow.camera.left=-50,e.shadow.camera.right=50,e.shadow.camera.top=50,e.shadow.camera.bottom=-50,this.threeScene.add(e),this.sun=e,this.hemi=new is(8900331,5597999,.8),this.threeScene.add(this.hemi);const t=new K(16772829,.5);t.position.set(-30,40,-30),this.threeScene.add(t)}handleSceneSettingChange(e,t){switch(e){case"ambientIntensity":this.ambient&&(this.ambient.intensity=t);break;case"sunIntensity":this.sun&&(this.sun.intensity=t);break;case"sunAngle":if(this.sun){const s=t*Math.PI/180,i=100;this.sun.position.set(Math.cos(s)*i,Math.sin(s)*i,30)}break;case"sunColor":this.sun&&this.sun.color.set(t);break;case"skyColor":this.threeScene.background=new D(t),this.threeScene.fog&&this.threeScene.fog.color.set(t),this.hemi&&this.hemi.color.set(t);break;case"fogEnabled":if(t){const s=this.threeScene.background?.getHex()||8900331;this.threeScene.fog=new Ye(s,80,300)}else this.threeScene.fog=null;break;case"fogFar":this.threeScene.fog&&(this.threeScene.fog.far=t);break;case"gridVisible":this.grid&&(this.grid.visible=t);break;case"gridSize":this.recreateGrid(t);break}}recreateGrid(e){this.grid&&(this.threeScene.remove(this.grid),this.grid.geometry.dispose(),this.grid.material.dispose()),this.grid=new Qe(e,e,6710886,4473924),this.grid.position.y=.02,this.threeScene.add(this.grid)}setupControls(){this.data.camera&&(this.orbitControls=new ns(this.data.camera,this.renderer.domElement),this.orbitControls.enableDamping=!0,this.orbitControls.dampingFactor=.1,this.orbitControls.maxPolarAngle=Math.PI/2.1,this.orbitControls.minDistance=5,this.orbitControls.maxDistance=100,this.orbitControls.target.set(0,0,0),this.orbitControls.mouseButtons={LEFT:null,MIDDLE:Je.ROTATE,RIGHT:Je.PAN},this.transformControls=new bs(this.data.camera,this.renderer.domElement),this.transformControls.addEventListener("dragging-changed",e=>{this.orbitControls.enabled=!e.value}),this.threeScene.add(this.transformControls))}createTerrain(){this.terrainEditor=new ti(this.threeScene,this.data.camera,this.renderer),this.terrainEditor.init(),this.ground=this.terrainEditor.terrain}createUI(){const e=document.getElementById("world-builder-ui");e&&e.remove();const t=document.createElement("div");t.id="world-builder-ui",t.innerHTML=this.getEditorStyles()+this.getEditorHTML(),document.body.appendChild(t),this.initEditorPanels(),this.populateAssets(),this.bindUIEvents(),this.setupEditorEventListeners()}getEditorStyles(){return`<style>
            #world-builder-ui { position: fixed; inset: 0; pointer-events: none; z-index: 100; font-family: 'Jost', sans-serif; }
            .editor-menubar { position: absolute; top: 0; left: 0; right: 0; height: 32px; background: rgba(14, 18, 32, 0.98); border-bottom: 1px solid #2a3150; pointer-events: auto; display: flex; align-items: center; }
            .menu-bar { display: flex; height: 100%; }
            .menu-item { position: relative; height: 100%; }
            .menu-label { padding: 0 14px; height: 100%; display: flex; align-items: center; color: #a5b4d0; cursor: pointer; font-size: 13px; transition: all 0.15s; }
            .menu-label:hover, .menu-item.active .menu-label { background: rgba(110, 231, 183, 0.15); color: #e8eaf6; }
            .menu-dropdown { position: absolute; top: 100%; left: 0; min-width: 200px; background: rgba(20, 26, 43, 0.98); border: 1px solid #2a3150; border-radius: 0 0 8px 8px; display: none; box-shadow: 0 8px 24px rgba(0,0,0,0.4); z-index: 99999; }
            .menu-item.active .menu-dropdown { display: block; }
            .menu-option { padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; color: #e8eaf6; cursor: pointer; font-size: 13px; }
            .menu-option:hover { background: rgba(110, 231, 183, 0.15); }
            .menu-shortcut { color: #6ee7b7; font-size: 11px; }
            .menu-separator { height: 1px; background: #2a3150; margin: 4px 8px; }
            .wb-toolbar { position: absolute; top: 52px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; background: rgba(20, 26, 43, 0.95); padding: 8px 12px; border-radius: 10px; border: 1px solid #2a3150; pointer-events: auto; }
            .wb-tool-btn { width: 38px; height: 38px; border: 2px solid transparent; border-radius: 6px; background: rgba(42, 49, 80, 0.5); color: #a5b4d0; font-size: 16px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
            .wb-tool-btn:hover { border-color: #6ee7b7; color: #e8eaf6; }
            .wb-tool-btn.active { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.2); color: #6ee7b7; }
            .wb-panel { position: absolute; background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(20,26,43,0.92)); border: 1px solid #2a3150; border-radius: 10px; pointer-events: auto; color: #e8eaf6; overflow: hidden; display: flex; flex-direction: column; min-width: 180px; min-height: 100px; }
            .wb-panel.resizable { resize: both; overflow: auto; }
            .wb-panel .panel-drag-handle { cursor: move; user-select: none; }
            .wb-panel .panel-resize-handle { position: absolute; right: 0; bottom: 0; width: 16px; height: 16px; cursor: nwse-resize; background: linear-gradient(135deg, transparent 50%, #6ee7b7 50%); border-radius: 0 0 10px 0; opacity: 0.5; transition: opacity 0.2s; }
            .wb-panel .panel-resize-handle:hover { opacity: 1; }
            .wb-panel.dragging { opacity: 0.9; box-shadow: 0 8px 32px rgba(0,0,0,0.5); z-index: 1000; }
            .wb-panel .panel-collapse-btn { width: 20px; height: 20px; border: none; border-radius: 4px; background: rgba(42, 49, 80, 0.6); color: #a5b4d0; cursor: pointer; font-size: 10px; margin-left: auto; transition: all 0.15s; }
            .wb-panel .panel-collapse-btn:hover { background: rgba(110, 231, 183, 0.2); color: #6ee7b7; }
            .wb-panel.collapsed .panel-content { display: none; }
            .wb-panel.collapsed { height: auto !important; min-height: 40px; }
            .wb-panel::-webkit-scrollbar { width: 6px; }
            .wb-panel::-webkit-scrollbar-track { background: rgba(20,26,43,0.5); }
            .wb-panel::-webkit-scrollbar-thumb { background: #6ee7b7; border-radius: 3px; }
            .hierarchy-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(14, 18, 32, 0.6); border-bottom: 1px solid #2a3150; font-weight: 600; color: #6ee7b7; font-size: 13px; }
            .hierarchy-btn { width: 22px; height: 22px; border: none; border-radius: 4px; background: rgba(42, 49, 80, 0.6); color: #a5b4d0; cursor: pointer; font-size: 12px; }
            .hierarchy-btn:hover { background: rgba(110, 231, 183, 0.2); color: #6ee7b7; }
            .hierarchy-search { padding: 8px; border-bottom: 1px solid #2a3150; }
            .hierarchy-search input { width: 100%; padding: 6px 10px; background: rgba(42, 49, 80, 0.5); border: 1px solid #2a3150; border-radius: 6px; color: #e8eaf6; font-size: 12px; }
            .hierarchy-search input:focus { outline: none; border-color: #6ee7b7; }
            .hierarchy-tree { flex: 1; overflow-y: auto; padding: 6px 0; max-height: calc(100% - 90px); }
            .hierarchy-node { display: flex; align-items: center; gap: 6px; padding: 6px 8px; cursor: pointer; font-size: 12px; transition: background 0.15s; }
            .hierarchy-node:hover { background: rgba(110, 231, 183, 0.1); }
            .hierarchy-node.selected { background: rgba(110, 231, 183, 0.2); }
            .node-expand { width: 16px; text-align: center; font-size: 10px; color: #6ee7b7; }
            .node-spacer { width: 16px; }
            .node-icon { font-size: 14px; }
            .node-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .hierarchy-empty { padding: 20px; text-align: center; color: #a5b4d0; font-size: 12px; }
            .hierarchy-context-menu .ctx-item { padding: 8px 16px; cursor: pointer; font-size: 13px; color: #e8eaf6; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
            .hierarchy-context-menu .ctx-item:hover { background: rgba(110, 231, 183, 0.15); }
            .hierarchy-context-menu .ctx-danger { color: #ef4444; }
            .hierarchy-context-menu .ctx-separator { height: 1px; background: #2a3150; margin: 4px 0; }
            .hierarchy-context-menu .ctx-shortcut { color: #6ee7b7; font-size: 11px; opacity: 0.7; }
            .rename-input { background: rgba(42, 49, 80, 0.8); border: 1px solid #6ee7b7; border-radius: 4px; color: #e8eaf6; padding: 2px 6px; font-size: 12px; width: 100%; }
            .inspector-header { padding: 10px 12px; background: rgba(14, 18, 32, 0.6); border-bottom: 1px solid #2a3150; font-weight: 600; color: #6ee7b7; font-size: 13px; }
            .inspector-content { flex: 1; overflow-y: auto; padding: 10px; }
            .inspector-empty { padding: 20px; text-align: center; color: #a5b4d0; font-size: 12px; }
            .inspector-section { margin-bottom: 12px; background: rgba(42, 49, 80, 0.3); border-radius: 8px; overflow: hidden; }
            .section-header { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(14, 18, 32, 0.4); font-size: 12px; font-weight: 600; color: #a5b4d0; }
            .section-icon { font-size: 14px; }
            .section-content { padding: 10px; }
            .prop-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
            .prop-row label { color: #a5b4d0; }
            .prop-row input[type="text"], .prop-row input[type="number"] { width: 100px; padding: 4px 8px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 4px; color: #e8eaf6; font-size: 11px; }
            .prop-row input:focus { outline: none; border-color: #6ee7b7; }
            .prop-value { color: #e8eaf6; }
            .prop-uuid { font-family: monospace; font-size: 10px; color: #6ee7b7; }
            .transform-group { margin-bottom: 12px; }
            .transform-group > label { display: block; margin-bottom: 6px; color: #a5b4d0; font-size: 11px; font-weight: 600; }
            .vec3-inputs { display: flex; gap: 6px; }
            .vec-input { flex: 1; display: flex; align-items: center; gap: 4px; }
            .vec-input .axis { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border-radius: 3px; font-size: 10px; font-weight: 700; }
            .vec-input .axis.x { background: rgba(239, 68, 68, 0.3); color: #ef4444; }
            .vec-input .axis.y { background: rgba(34, 197, 94, 0.3); color: #22c55e; }
            .vec-input .axis.z { background: rgba(59, 130, 246, 0.3); color: #3b82f6; }
            .vec-input input { flex: 1; width: 50px; padding: 4px 6px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 4px; color: #e8eaf6; font-size: 11px; }
            .uniform-scale-btn { margin-top: 6px; padding: 4px 8px; background: rgba(42, 49, 80, 0.5); border: 1px solid #2a3150; border-radius: 4px; color: #a5b4d0; cursor: pointer; font-size: 12px; }
            .uniform-scale-btn:hover { border-color: #6ee7b7; }
            .inspector-actions { padding: 10px; display: flex; gap: 8px; border-top: 1px solid #2a3150; }
            .action-btn { flex: 1; padding: 8px; background: rgba(42, 49, 80, 0.6); border: 1px solid #2a3150; border-radius: 6px; color: #e8eaf6; cursor: pointer; font-size: 11px; transition: all 0.15s; }
            .action-btn:hover { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.15); }
            .action-btn.danger { border-color: rgba(239, 68, 68, 0.5); }
            .action-btn.danger:hover { border-color: #ef4444; background: rgba(239, 68, 68, 0.15); }
            .wb-assets-panel { top: 420px; left: 20px; width: 220px; max-height: calc(100vh - 460px); }
            .asset-category-header { padding: 6px 10px; background: rgba(14, 18, 32, 0.6); color: #6ee7b7; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; grid-column: 1 / -1; }
            .assets-header { padding: 10px 12px; background: rgba(14, 18, 32, 0.6); border-bottom: 1px solid #2a3150; font-weight: 600; color: #6ee7b7; font-size: 13px; }
            .wb-asset-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; padding: 10px; overflow-y: auto; }
            .wb-asset-item { padding: 8px 6px; background: rgba(42, 49, 80, 0.5); border: 2px solid transparent; border-radius: 6px; cursor: pointer; text-align: center; font-size: 11px; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 2px; }
            .wb-asset-item .asset-icon { font-size: 18px; }
            .wb-asset-item .asset-label { font-size: 9px; color: #a5b4d0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
            .wb-asset-item:hover { border-color: #6ee7b7; }
            .wb-asset-item.selected { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.15); }
            .wb-info { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(20, 26, 43, 0.95); padding: 8px 16px; border-radius: 6px; color: #a5b4d0; font-size: 12px; pointer-events: none; border: 1px solid #2a3150; }
            .shortcut-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; font-size: 13px; color: #a5b4d0; }
            .shortcut-row .key { display: inline-block; min-width: 70px; padding: 4px 8px; background: rgba(42, 49, 80, 0.8); border: 1px solid #2a3150; border-radius: 4px; color: #6ee7b7; font-family: monospace; font-size: 11px; text-align: center; }
            
            .import-dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center; }
            .import-dialog { background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(30,36,53,0.98)); border: 1px solid #2a3150; border-radius: 12px; width: 500px; max-width: 90vw; overflow: hidden; }
            .import-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #2a3150; }
            .import-header h2 { margin: 0; color: #6ee7b7; font-size: 16px; }
            .import-close { background: none; border: none; color: #a5b4d0; font-size: 24px; cursor: pointer; padding: 0; line-height: 1; }
            .import-close:hover { color: #e8eaf6; }
            .import-body { padding: 20px; }
            .import-dropzone { border: 2px dashed #2a3150; border-radius: 10px; padding: 40px 20px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 8px; }
            .import-dropzone:hover, .import-dropzone.dragover { border-color: #6ee7b7; background: rgba(110, 231, 183, 0.05); }
            .dropzone-icon { font-size: 48px; }
            .dropzone-text { color: #e8eaf6; font-size: 14px; font-weight: 500; }
            .dropzone-hint { color: #a5b4d0; font-size: 12px; }
            .dropzone-formats { color: #6ee7b7; font-size: 11px; margin-top: 8px; }
            .import-preview { max-height: 200px; overflow-y: auto; }
            .preview-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: rgba(42, 49, 80, 0.4); border-radius: 6px; margin-bottom: 8px; }
            .preview-icon { font-size: 20px; }
            .preview-name { flex: 1; color: #e8eaf6; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .preview-size { color: #a5b4d0; font-size: 11px; }
            .preview-remove { background: none; border: none; color: #ef4444; font-size: 18px; cursor: pointer; padding: 0; line-height: 1; }
            .import-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-top: 1px solid #2a3150; }
            .import-option { display: flex; align-items: center; gap: 8px; color: #a5b4d0; font-size: 12px; cursor: pointer; }
            .import-option input { accent-color: #6ee7b7; }
            .import-actions { display: flex; gap: 10px; }
            .import-btn { padding: 8px 20px; border-radius: 6px; font-size: 13px; cursor: pointer; transition: all 0.2s; }
            .import-btn.cancel { background: transparent; border: 1px solid #2a3150; color: #a5b4d0; }
            .import-btn.cancel:hover { border-color: #6ee7b7; color: #e8eaf6; }
            .import-btn.primary { background: #6ee7b7; border: none; color: #0e1220; font-weight: 600; }
            .import-btn.primary:hover { background: #5dd9ac; }
            .import-btn.primary:disabled { background: #3a4a5a; color: #6a7a8a; cursor: not-allowed; }
        </style>`}getEditorHTML(){return`
            <div class="editor-menubar" id="editor-menubar"></div>
            
            <div class="wb-toolbar">
                <button class="wb-tool-btn active" data-tool="select" data-tooltip="Select objects (Q)" data-shortcut="Q">⬚</button>
                <button class="wb-tool-btn" data-tool="move" data-tooltip="Move tool (W)" data-shortcut="W">✥</button>
                <button class="wb-tool-btn" data-tool="rotate" data-tooltip="Rotate tool (E)" data-shortcut="E">↻</button>
                <button class="wb-tool-btn" data-tool="scale" data-tooltip="Scale tool (R)" data-shortcut="R">⤢</button>
                <button class="wb-tool-btn" data-tool="place" data-tooltip="Place assets (P)" data-shortcut="P">+</button>
                <button class="wb-tool-btn" data-tool="sculpt" data-tooltip="Sculpt terrain (T)" data-shortcut="T">🏔️</button>
                <button class="wb-tool-btn" data-tool="delete" data-tooltip="Delete (X)" data-shortcut="X">✕</button>
                <div style="width: 1px; height: 24px; background: #2a3150; margin: 0 4px;"></div>
                <button class="wb-tool-btn" id="info-btn" data-tooltip="Keyboard Shortcuts">ℹ️</button>
            </div>
            
            <div id="shortcuts-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 1000; pointer-events: auto; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, rgba(20,26,43,0.98), rgba(30,36,53,0.98)); border: 1px solid #2a3150; border-radius: 12px; padding: 24px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; color: #e8eaf6;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #6ee7b7; font-size: 18px;">Keyboard Shortcuts</h2>
                        <button id="close-shortcuts" style="background: none; border: none; color: #a5b4d0; font-size: 24px; cursor: pointer;">&times;</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0; border-bottom: 1px solid #2a3150; padding-bottom: 8px;">Tools</h3>
                            <div class="shortcut-row"><span class="key">Q</span> Select</div>
                            <div class="shortcut-row"><span class="key">W</span> Move</div>
                            <div class="shortcut-row"><span class="key">E</span> Rotate</div>
                            <div class="shortcut-row"><span class="key">R</span> Scale</div>
                            <div class="shortcut-row"><span class="key">P</span> Place</div>
                            <div class="shortcut-row"><span class="key">T</span> Sculpt Terrain</div>
                            <div class="shortcut-row"><span class="key">X</span> Delete</div>
                        </div>
                        <div>
                            <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0; border-bottom: 1px solid #2a3150; padding-bottom: 8px;">Edit</h3>
                            <div class="shortcut-row"><span class="key">Ctrl+Z</span> Undo</div>
                            <div class="shortcut-row"><span class="key">Ctrl+Y</span> Redo</div>
                            <div class="shortcut-row"><span class="key">Ctrl+C</span> Copy</div>
                            <div class="shortcut-row"><span class="key">Ctrl+X</span> Cut</div>
                            <div class="shortcut-row"><span class="key">Ctrl+V</span> Paste</div>
                            <div class="shortcut-row"><span class="key">Ctrl+D</span> Duplicate</div>
                            <div class="shortcut-row"><span class="key">Ctrl+S</span> Save Scene</div>
                            <div class="shortcut-row"><span class="key">Ctrl+O</span> Load Scene</div>
                        </div>
                        <div>
                            <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0; border-bottom: 1px solid #2a3150; padding-bottom: 8px;">Selection</h3>
                            <div class="shortcut-row"><span class="key">Ctrl+A</span> Select All</div>
                            <div class="shortcut-row"><span class="key">Esc</span> Deselect</div>
                            <div class="shortcut-row"><span class="key">F</span> Focus Object</div>
                            <div class="shortcut-row"><span class="key">H</span> Hide/Show</div>
                            <div class="shortcut-row"><span class="key">U</span> Unpack Model</div>
                        </div>
                        <div>
                            <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0; border-bottom: 1px solid #2a3150; padding-bottom: 8px;">Terrain Sculpting</h3>
                            <div class="shortcut-row"><span class="key">[</span> Decrease Brush</div>
                            <div class="shortcut-row"><span class="key">]</span> Increase Brush</div>
                            <div class="shortcut-row"><span class="key">1</span> Raise</div>
                            <div class="shortcut-row"><span class="key">2</span> Lower</div>
                            <div class="shortcut-row"><span class="key">3</span> Smooth</div>
                            <div class="shortcut-row"><span class="key">4</span> Flatten</div>
                            <div class="shortcut-row"><span class="key">5</span> Paint</div>
                            <div class="shortcut-row"><span class="key">6</span> Noise</div>
                        </div>
                    </div>
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #2a3150;">
                        <h3 style="color: #6ee7b7; font-size: 14px; margin: 0 0 12px 0;">Camera Controls</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div class="shortcut-row"><span class="key">Middle Click</span> Rotate Camera</div>
                            <div class="shortcut-row"><span class="key">Right Click</span> Pan Camera</div>
                            <div class="shortcut-row"><span class="key">Scroll</span> Zoom In/Out</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="wb-panel resizable" style="left: 20px; top: 120px; width: 240px; height: 280px;" id="hierarchy-panel" data-panel-id="hierarchy">
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-panel resizable" style="left: 20px; top: 415px; width: 240px; display: none;" id="terrain-tools-panel" data-panel-id="terrain-tools">
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-panel resizable" style="left: 20px; top: 415px; width: 240px; height: 200px;" id="scene-settings-panel" data-panel-id="scene-settings">
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-panel resizable" style="top: auto; bottom: 60px; left: 20px; width: 240px; height: 220px;" id="assets-panel" data-panel-id="assets">
                <div class="assets-header panel-drag-handle" data-tooltip="Drag and place objects into the scene">
                    <span>Asset Library</span>
                    <button class="panel-collapse-btn" data-action="collapse">▼</button>
                </div>
                <div class="panel-content">
                    <div class="wb-asset-grid" id="wb-assets"></div>
                </div>
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-panel resizable" style="right: 20px; top: 52px; width: 300px; height: calc(100vh - 100px);" id="inspector-panel" data-panel-id="inspector">
                <div class="panel-resize-handle"></div>
            </div>

            <div class="wb-info">
                <span id="wb-status">Middle-click to rotate camera • Right-click to pan • Left-click to interact</span>
            </div>
        `}initEditorPanels(){const e=document.getElementById("hierarchy-panel");this.hierarchyPanel=new Js(e,this.threeScene,a=>this.selectObject(a),a=>this.deleteObject(a));const t=document.getElementById("inspector-panel");this.inspectorPanel=new Zs(t,a=>this.onTransformChange(a));const s=document.getElementById("editor-menubar");this.menuBar=new ei(s,this.getMenuCommands());const i=document.getElementById("terrain-tools-panel");i&&this.terrainEditor&&(this.terrainToolsPanel=new si(i,this.terrainEditor),this.terrainToolsPanel.init());const n=document.getElementById("scene-settings-panel");n&&(this.sceneSettingsPanel=new ii(n,this.threeScene,{onUpdate:(a,o)=>this.handleSceneSettingChange(a,o)}),this.sceneSettingsPanel.init()),this.quickActions=new Ii(null,a=>this.handleQuickAction(a)),this.onboardingHints=new Pi,this.onboardingHints.init(),this.onboardingHints.start(),this.radialMenu=new Oi(a=>this.handleQuickAction(a)),this.setupDraggablePanels(),w.events.on("delete-object",a=>this.deleteObject(a)),w.events.on("duplicate-object",a=>this.duplicateObject(a)),w.events.on("focus-object",a=>this.focusObject(a)),w.events.on("unpack-object",a=>this.unpackModel(a)),w.events.on("toggle-visibility",a=>this.toggleVisibility(a)),w.events.on("paste-object",a=>this.pasteFromClipboard(a))}pasteFromClipboard(e){if(!e||!e.object)return;this.saveUndoState();const t=e.object.clone();t.position.x+=2,t.userData={...e.object.userData},this.threeScene.add(t),this.placedObjects.push(t),e.isCut&&this.deleteObject(e.object),this.selectObject(t),w.events.emit("hierarchy-changed"),console.log("[WorldBuilder] Pasted object")}setupDraggablePanels(){document.querySelectorAll(".wb-panel.resizable").forEach(t=>{const s=t.querySelector(".hierarchy-header, .inspector-header, .assets-header, .terrain-header, .scene-settings-header");s&&s.classList.add("panel-drag-handle");let i=!1,n,a,o,r;const l=t.querySelector(".panel-drag-handle")||s;l&&l.addEventListener("mousedown",d=>{if(d.target.tagName==="BUTTON"||d.target.tagName==="INPUT")return;i=!0,t.classList.add("dragging"),n=d.clientX,a=d.clientY;const f=t.getBoundingClientRect();o=f.left,r=f.top,d.preventDefault()}),document.addEventListener("mousemove",d=>{if(!i)return;const f=d.clientX-n,p=d.clientY-a;t.style.left=o+f+"px",t.style.top=r+p+"px",t.style.right="auto",t.style.bottom="auto"}),document.addEventListener("mouseup",()=>{i&&(i=!1,t.classList.remove("dragging"),this.savePanelLayout())});const h=t.querySelector(".panel-collapse-btn");h&&h.addEventListener("click",()=>{t.classList.toggle("collapsed"),h.textContent=t.classList.contains("collapsed")?"▶":"▼"})}),this.loadPanelLayout()}savePanelLayout(){const e={};document.querySelectorAll(".wb-panel[data-panel-id]").forEach(t=>{const s=t.dataset.panelId;t.getBoundingClientRect(),e[s]={left:t.style.left,top:t.style.top,width:t.style.width,height:t.style.height}}),localStorage.setItem("worldBuilderPanelLayout",JSON.stringify(e))}loadPanelLayout(){try{const e=localStorage.getItem("worldBuilderPanelLayout");if(!e)return;const t=JSON.parse(e);Object.entries(t).forEach(([s,i])=>{const n=document.querySelector(`[data-panel-id="${s}"]`);n&&i&&(i.left&&(n.style.left=i.left),i.top&&(n.style.top=i.top),i.width&&(n.style.width=i.width),i.height&&(n.style.height=i.height),n.style.right="auto",n.style.bottom="auto")})}catch(e){console.warn("[WorldBuilder] Could not load panel layout:",e)}}getMenuCommands(){return{"new-scene":()=>this.newScene(),"save-scene":()=>this.saveScene(),"load-scene":()=>this.loadScene(),"save-cloud":()=>this.saveToCloud(),"load-cloud":()=>this.loadFromCloud(),"export-json":()=>this.exportJSON(),"export-glb":()=>this.exportGLB(),"import-asset":()=>this.showImportDialog(),exit:()=>{this.onBack&&this.onBack()},undo:()=>w.undo(),redo:()=>w.redo(),copy:()=>w.copy(),paste:()=>this.paste(),duplicate:()=>this.duplicateSelected(),delete:()=>{this.selectedObject&&this.deleteObject(this.selectedObject)},"select-all":()=>this.selectAll(),"toggle-hierarchy":()=>this.togglePanel("hierarchy-panel"),"toggle-inspector":()=>this.togglePanel("inspector-panel"),"toggle-assets":()=>this.togglePanel("wb-assets-panel"),"reset-camera":()=>this.resetCamera(),"focus-selected":()=>{this.selectedObject&&this.focusObject(this.selectedObject)},"toggle-grid":()=>{this.grid&&(this.grid.visible=!this.grid.visible)},"add-tree":()=>this.quickAdd("tree"),"add-rock":()=>this.quickAdd("rock"),"add-bush":()=>this.quickAdd("bush"),"add-gladiator":()=>this.quickAdd("gladiator"),"add-spartan":()=>this.quickAdd("spartan"),"show-shortcuts":()=>this.showShortcuts(),"show-about":()=>this.showAbout(),"stats-admin":()=>Bi.toggle()}}async saveToCloud(){const e=prompt("Enter scene name:","my-scene");if(!e)return;this.showNotification("Saving to cloud...");const t=he.serializeScene(this.threeScene,{name:e,settings:{terrain:this.terrainEditor?this.terrainEditor.exportHeightData():null}}),s=await he.saveScene(e,t);s.success?this.showNotification(`Saved to cloud: ${e}`):this.showNotification(`Save failed: ${s.error}`)}async loadFromCloud(){this.showNotification("Loading cloud scenes...");const e=await he.listScenes();if(!e.success||e.scenes.length===0){this.showNotification("No cloud scenes found");return}const t=e.scenes.map(n=>n.name).join(`
`),s=prompt(`Available scenes:
${t}

Enter scene name to load:`);if(!s)return;const i=await he.loadScene(s);if(i.success){this.newScene();const n=he.deserializeScene(i.data,this.threeScene);this.placedObjects.push(...n),w.events.emit("hierarchy-changed"),this.showNotification(`Loaded: ${s} (${n.length} objects)`)}else this.showNotification(`Load failed: ${i.error}`)}setupEditorEventListeners(){this.transformControls?.addEventListener("change",()=>{this.selectedObject&&this.inspectorPanel?.queueUpdate()})}onTransformChange(e){w.events.emit("hierarchy-changed")}duplicateObject(e){if(!e)return;const t=e.clone();t.position.x+=2,t.userData={...e.userData},this.threeScene.add(t),this.placedObjects.push(t),this.selectObject(t),w.events.emit("hierarchy-changed")}duplicateSelected(){this.selectedObject&&this.duplicateObject(this.selectedObject)}focusObject(e){if(!e||!this.orbitControls)return;const s=new $e().setFromObject(e).getCenter(new m);this.orbitControls.target.copy(s),this.data.camera&&this.data.camera.position.set(s.x+10,s.y+5,s.z+10)}selectAll(){this.placedObjects.forEach(e=>w.addToSelection(e))}togglePanel(e){const t=document.querySelector(`.${e}`)||document.getElementById(e);t&&(t.style.display=t.style.display==="none"?"flex":"none")}resetCamera(){this.data.camera&&(this.data.camera.position.set(20,20,20),this.data.camera.lookAt(0,0,0)),this.orbitControls&&this.orbitControls.target.set(0,0,0)}quickAdd(e){const t=X.find(s=>s.id===e);if(t){const s=this.orbitControls?.target.clone()||new m;this.placeAsset(t,s)}}newScene(){confirm("Clear all objects? This cannot be undone.")&&([...this.placedObjects].forEach(e=>this.deleteObject(e)),w.clearSelection())}saveScene(){const e=this.placedObjects.map(t=>({assetId:t.userData.assetId,assetName:t.userData.assetName,position:{x:t.position.x,y:t.position.y,z:t.position.z},rotation:{x:t.rotation.x,y:t.rotation.y,z:t.rotation.z},scale:{x:t.scale.x,y:t.scale.y,z:t.scale.z}}));localStorage.setItem("grudge_world_builder_scene",JSON.stringify(e)),alert("Scene saved!")}loadScene(){const e=localStorage.getItem("grudge_world_builder_scene");if(!e){alert("No saved scene found.");return}try{const t=JSON.parse(e);this.newScene(),t.forEach(s=>{const i=X.find(n=>n.id===s.assetId);i&&this.placeAsset(i,new m(s.position.x,s.position.y,s.position.z))})}catch(t){console.error("Failed to load scene:",t)}}exportJSON(){const e=this.placedObjects.map(n=>({assetId:n.userData.assetId,assetName:n.userData.assetName,position:n.position.toArray(),rotation:[n.rotation.x,n.rotation.y,n.rotation.z],scale:n.scale.toArray()})),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),s=URL.createObjectURL(t),i=document.createElement("a");i.href=s,i.download="scene.json",i.click(),URL.revokeObjectURL(s),this.showNotification("Exported JSON")}exportGLB(){if(this.placedObjects.length===0){this.showNotification("No objects to export");return}const e=new H;this.placedObjects.forEach(s=>{const i=s.clone();e.add(i)}),new fe().parse(e,s=>{const i=new Blob([s],{type:"application/octet-stream"}),n=URL.createObjectURL(i),a=document.createElement("a");a.href=n,a.download="scene.glb",a.click(),URL.revokeObjectURL(n),this.showNotification("Exported GLB")},s=>{console.error("GLB export failed:",s),this.showNotification("Export failed")},{binary:!0})}showImportDialog(){Li.showImportDialog(e=>{this.handleImportResult(e)})}handleImportResult(e){if(e.type==="model"){this.saveUndoState();const t=e.object;t.position.copy(this.orbitControls?.target||new m),this.threeScene.add(t),this.placedObjects.push(t),this.selectObject(t),w.events.emit("hierarchy-changed"),this.showNotification(`Imported: ${t.userData.assetName}`),console.log("[WorldBuilder] Imported model:",t.userData.assetName)}else e.type==="scene"&&(this.loadSceneData(e.data),this.showNotification(`Loaded scene: ${e.filename}`))}loadSceneData(e){const t=Array.isArray(e)?e:e.objects||[];t.forEach(s=>{if(s.assetId){const i=X.find(n=>n.id===s.assetId);if(i){const n=Array.isArray(s.position)?new m(...s.position):new m(s.position?.x||0,s.position?.y||0,s.position?.z||0);this.placeAsset(i,n)}}}),console.log("[WorldBuilder] Loaded scene with",t.length,"objects")}paste(){w.canPaste()&&w.clipboardData.forEach(e=>{const t=X.find(s=>s.id===e.type);if(t){const s=e.position.clone();s.x+=2,this.placeAsset(t,s)}})}showShortcuts(){alert(`Keyboard Shortcuts (Unity-style):
Q / V - Select tool
W / G - Move tool  
E - Rotate tool
R - Scale tool
P - Place tool
X / Delete - Delete selected
F - Focus on selected
U - Unpack model into parts
Ctrl+S - Save scene
Ctrl+Z - Undo
Ctrl+Y - Redo
Ctrl+C - Copy
Ctrl+V - Paste
Ctrl+D - Duplicate
Ctrl+A - Select all`)}showAbout(){alert(`Grudge Studio World Builder v1.0

A professional 3D scene editor for creating game worlds.

Built with Three.js`)}populateAssets(){const e=document.getElementById("wb-assets");if(!e)return;let t="";Ni.forEach(s=>{const i=X.filter(n=>n.category===s);i.length>0&&(t+=`<div class="asset-category-header">${s}</div>`,i.forEach((n,a)=>{const o=X.indexOf(n);t+=`
                        <div class="wb-asset-item" data-asset="${o}" data-tooltip="${n.name}">
                            <span class="asset-icon">${n.icon||"📦"}</span>
                            <span class="asset-label">${n.name}</span>
                        </div>
                    `}))}),e.innerHTML=t,e.querySelectorAll(".wb-asset-item").forEach(s=>{s.onclick=()=>{e.querySelectorAll(".wb-asset-item").forEach(i=>i.classList.remove("selected")),s.classList.add("selected"),this.currentAsset=X[parseInt(s.dataset.asset)],this.setTool(v.PLACE)}})}bindUIEvents(){const e=document.getElementById("wb-back");e&&(e.onclick=()=>{this.removeUI(),this.onBack&&this.onBack()}),document.querySelectorAll(".wb-tool-btn[data-tool]").forEach(n=>{n.onclick=()=>this.setTool(n.dataset.tool)});const t=document.getElementById("info-btn"),s=document.getElementById("shortcuts-modal"),i=document.getElementById("close-shortcuts");t&&s&&(t.onclick=()=>{s.style.display="flex"},i.onclick=()=>{s.style.display="none"},s.onclick=n=>{n.target===s&&(s.style.display="none")})}setTool(e){this.currentTool=e,document.querySelectorAll(".wb-tool-btn").forEach(n=>{n.classList.toggle("active",n.dataset.tool===e)}),this.transformControls&&(e===v.MOVE?this.transformControls.setMode("translate"):e===v.ROTATE?this.transformControls.setMode("rotate"):e===v.SCALE&&this.transformControls.setMode("scale"),[v.MOVE,v.ROTATE,v.SCALE].includes(e)&&this.selectedObject?this.transformControls.attach(this.selectedObject):this.transformControls.detach()),this.terrainEditor&&(e===v.SCULPT?(this.terrainEditor.enable(),this.orbitControls&&(this.orbitControls.enabled=!0)):this.terrainEditor.disable());const t=document.getElementById("terrain-tools-panel"),s=document.getElementById("scene-settings-panel");t&&s&&(e===v.SCULPT?(t.style.display="block",s.style.display="none"):(t.style.display="none",s.style.display="block"));const i=document.getElementById("wb-status");if(i){const n={select:"Click objects to select",move:"Drag to move selected object",rotate:"Drag to rotate selected object",scale:"Drag to scale selected object",place:"Click terrain to place asset",sculpt:"Left-click to sculpt terrain • Use terrain tools panel",delete:"Click objects to delete"};i.textContent=n[e]||""}}bindEvents(){this.onMouseDownBound=this.onMouseDown.bind(this),this.onMouseMoveBound=this.onMouseMoveDrag.bind(this),this.onMouseUpBound=this.onMouseUp.bind(this),this.onKeyDownBound=this.onKeyDown.bind(this),this.onContextMenuBound=this.onContextMenu.bind(this),this.renderer.domElement.addEventListener("mousedown",this.onMouseDownBound),this.renderer.domElement.addEventListener("mousemove",this.onMouseMoveBound),this.renderer.domElement.addEventListener("mouseup",this.onMouseUpBound),this.renderer.domElement.addEventListener("contextmenu",this.onContextMenuBound),window.addEventListener("keydown",this.onKeyDownBound)}onContextMenu(e){e.preventDefault(),this.radialMenu&&this.radialMenu.show(e.clientX,e.clientY)}onMouseDown(e){if(e.button===0&&!(this.transformControls&&this.transformControls.dragging)){if(this.updateMouse(e),this.raycaster.setFromCamera(this.mouse,this.data.camera),this.currentTool===v.SCULPT&&this.terrainEditor){this.terrainEditor.onMouseDown(e);return}if(this.currentTool===v.PLACE&&this.currentAsset){this.isPlacing=!0;const t=this.raycaster.intersectObject(this.ground);t.length>0&&(this.placeAsset(this.currentAsset,t[0].point),this.lastPlacePosition=t[0].point.clone())}else if([v.SELECT,v.DELETE,v.MOVE,v.ROTATE,v.SCALE].includes(this.currentTool)){const t=this.raycaster.intersectObjects(this.placedObjects,!0);if(t.length>0){let s=t[0].object;for(;s.parent&&!this.placedObjects.includes(s);)s=s.parent;this.currentTool===v.DELETE?this.deleteObject(s):(this.selectObject(s),[v.MOVE,v.ROTATE,v.SCALE].includes(this.currentTool)&&this.transformControls&&this.transformControls.attach(s))}else this.currentTool!==v.DELETE&&this.deselectObject()}}}onMouseMoveDrag(e){if(this.updateMouse(e),this.currentTool===v.SCULPT&&this.terrainEditor){this.terrainEditor.onMouseMove(e);return}if(this.isPlacing&&this.currentTool===v.PLACE&&this.currentAsset){this.raycaster.setFromCamera(this.mouse,this.data.camera);const t=this.raycaster.intersectObject(this.ground);if(t.length>0){const s=t[0].point;this.lastPlacePosition&&s.distanceTo(this.lastPlacePosition)>=this.placeSpacing&&(this.placeAsset(this.currentAsset,s),this.lastPlacePosition=s.clone())}}this.updateHoverHighlight()}updateHoverHighlight(){if(this.currentTool===v.SCULPT||this.currentTool===v.PLACE){this.hoveredObject&&(this.hoveredObject=null,this.updateOutlineSelection());return}this.raycaster.setFromCamera(this.mouse,this.data.camera);const e=this.placedObjects.map(i=>i.object).filter(Boolean),t=this.raycaster.intersectObjects(e,!0);let s=null;if(t.length>0){let i=t[0].object;for(;i.parent&&!e.includes(i);)i=i.parent;e.includes(i)&&(s=i)}s!==this.hoveredObject&&(this.hoveredObject=s,this.updateOutlineSelection(),this.renderer.domElement.style.cursor=s?"pointer":"default")}updateOutlineSelection(){if(!this.outlinePass)return;const e=[],t=s=>{s&&(s.isMesh?e.push(s):s.traverse(i=>{i.isMesh&&e.push(i)}))};t(this.selectedObject),this.hoveredObject&&this.hoveredObject!==this.selectedObject&&t(this.hoveredObject),this.selectedObject?(this.outlinePass.visibleEdgeColor.set(65535),this.outlinePass.hiddenEdgeColor.set(65535),this.outlinePass.edgeStrength=3,this.outlinePass.edgeGlow=1):this.hoveredObject&&(this.outlinePass.visibleEdgeColor.set(7268279),this.outlinePass.hiddenEdgeColor.set(7268279),this.outlinePass.edgeStrength=2,this.outlinePass.edgeGlow=.5),this.outlinePass.selectedObjects=e}onMouseUp(e){this.currentTool===v.SCULPT&&this.terrainEditor&&this.terrainEditor.onMouseUp(e),e.button===0&&(this.isPlacing=!1,this.lastPlacePosition=null)}onKeyDown(e){if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;const t=e.key.toLowerCase();if(e.ctrlKey||e.metaKey)switch(t){case"z":e.preventDefault(),e.shiftKey?this.redo():this.undo();return;case"y":e.preventDefault(),this.redo();return;case"d":e.preventDefault(),this.selectedObject&&this.duplicateObject(this.selectedObject);return;case"a":e.preventDefault(),this.selectAll();return;case"s":e.preventDefault(),this.saveScene();return;case"o":e.preventDefault(),this.loadScene();return;case"g":e.preventDefault(),this.selectedObject&&this.groupSelected();return;case"c":e.preventDefault(),this.selectedObject&&this.copyObject(this.selectedObject);return;case"x":e.preventDefault(),this.selectedObject&&this.cutObject(this.selectedObject);return;case"v":e.preventDefault(),this.pasteObject();return}switch(t){case"q":case"v":this.setTool(v.SELECT);break;case"w":case"g":this.setTool(v.MOVE);break;case"e":this.setTool(v.ROTATE);break;case"r":this.setTool(v.SCALE);break;case"p":this.setTool(v.PLACE);break;case"t":this.setTool(v.SCULPT);break;case"x":case"delete":case"backspace":this.selectedObject&&this.deleteObject(this.selectedObject);break;case"f":this.selectedObject&&this.focusObject(this.selectedObject);break;case"u":this.selectedObject&&this.unpackModel(this.selectedObject);break;case"escape":this.deselectAll();break;case"h":this.selectedObject&&this.toggleVisibility(this.selectedObject);break;case"[":this.terrainEditor&&this.terrainEditor.decreaseBrushSize();break;case"]":this.terrainEditor&&this.terrainEditor.increaseBrushSize();break;case"1":this.setTerrainTool("raise");break;case"2":this.setTerrainTool("lower");break;case"3":this.setTerrainTool("smooth");break;case"4":this.setTerrainTool("flatten");break;case"5":this.setTerrainTool("paint");break;case"6":this.setTerrainTool("noise");break}}setTerrainTool(e){this.currentTool!==v.SCULPT&&this.setTool(v.SCULPT),this.terrainEditor&&this.terrainEditor.setTool(e)}unpackModel(e){if(!e)return;const t=[],s=(r,l=0)=>{r.children.forEach(h=>{h.isMesh?t.push({mesh:h,depth:l}):(h.isGroup||h.children?.length>0)&&s(h,l+1)})};if(s(e),t.length===0){console.log("No meshes to unpack - this is already a simple object");return}if(t.length===1&&!e.isGroup){console.log("Only one mesh, nothing to unpack");return}w.clearSelection(),this.transformControls&&this.transformControls.detach();const i=e.userData.assetName||e.name||"Model",n=[];let a=0;t.forEach(({mesh:r})=>{const l=new De;r.updateWorldMatrix(!0,!1),l.copy(r.matrixWorld);const h=r.clone();h.matrix.copy(l),h.matrix.decompose(h.position,h.quaternion,h.scale),h.matrixAutoUpdate=!0;const d=r.name||`Part_${a++}`;h.userData.assetId="unpacked",h.userData.assetName=`${i}/${d}`,h.userData.unpackedFrom=e.uuid,h.castShadow=!0,h.receiveShadow=!0,this.threeScene.add(h),this.placedObjects.push(h),n.push(h)});const o=this.placedObjects.indexOf(e);o>-1&&this.placedObjects.splice(o,1),this.threeScene.remove(e),e.traverse(r=>{r.geometry&&r.geometry.dispose?.(),r.material&&(Array.isArray(r.material)?r.material.forEach(l=>l.dispose?.()):r.material.dispose?.())}),this.selectedObject=null,w.events.emit("hierarchy-changed"),n.length>0&&this.selectObject(n[0]),console.log(`Unpacked ${n.length} objects from ${i}`)}updateMouse(e){const t=this.renderer.domElement.getBoundingClientRect();this.mouse.x=(e.clientX-t.left)/t.width*2-1,this.mouse.y=-((e.clientY-t.top)/t.height)*2+1}async placeAsset(e,t){let s;if(e.type==="empty")s=new H,s.userData.objectType="empty";else if(e.type==="trigger"){const i=new j(2,2,2),n=new J({color:16753920,transparent:!0,opacity:.3,wireframe:!1});s=new k(i,n);const a=new as(new os(i),new rs({color:16753920}));s.add(a),s.userData.objectType="trigger",s.userData.triggerEvent="onEnter"}else if(e.type==="spawn"){const i=new k(new se(.5,.5,.1,16),new M({color:65280})),n=new k(new Oe(.3,.8,8),new M({color:65280}));n.position.y=.5,s=new H,s.add(i,n),s.userData.objectType="spawn",s.userData.spawnId="spawn_"+Date.now()}else if(e.type==="waypoint"){const i=new k(new te(.3,16,16),new M({color:3900150}));s=new H,s.add(i),s.userData.objectType="waypoint",s.userData.waypointIndex=this.placedObjects.filter(n=>n.userData.objectType==="waypoint").length}else if(e.type==="light"){s=new H;let i;if(e.lightType==="point"){i=new Ge(16777215,1,10);const n=new k(new te(.2,8,8),new J({color:16776960}));s.add(n)}else if(e.lightType==="spot"){i=new We(16777215,1,20,Math.PI/6);const n=new k(new Oe(.3,.5,8),new J({color:16776960}));n.rotation.x=Math.PI,s.add(n)}else if(e.lightType==="directional"){i=new K(16777215,.5);const n=new k(new j(.3,.3,.3),new J({color:16776960}));s.add(n)}i&&s.add(i),s.userData.objectType="light",s.userData.lightType=e.lightType}else if(e.type==="camera"){const i=new k(new j(.4,.3,.5),new M({color:6710886})),n=new k(new se(.1,.15,.2,8),new M({color:3355443}));n.rotation.x=Math.PI/2,n.position.z=.35,s=new H,s.add(i,n),s.userData.objectType="camera",s.userData.cameraType="perspective"}else if(e.type==="primitive"){let i;switch(e.shape){case"box":i=new j(1,1,1);break;case"sphere":i=new te(.5,16,16);break;case"plane":i=new ne(2,2);break;case"cylinder":i=new se(.5,.5,1,16);break;default:i=new j(1,1,1)}s=new k(i,new M({color:7268279})),e.shape==="plane"&&(s.rotation.x=-Math.PI/2),s.userData.objectType="primitive",s.userData.shape=e.shape}else if(e.type==="procedural")s=this.generateProceduralAsset(e.generator);else if(e.type==="model")try{s=(await this.gltfLoader.loadAsync(e.path)).scene,e.id==="gladiator"&&!this.gladiatorTexture&&s.traverse(n=>{n.isMesh&&n.material&&n.material.map&&(this.gladiatorTexture=n.material.map)})}catch{console.warn("Failed to load model:",e.path),s=new k(new j(1,1,1),new M({color:7268279}))}else if(e.type==="fbx")try{s=await this.fbxLoader.loadAsync(e.path),s.scale.set(.01,.01,.01),e.id==="spartan"&&this.gladiatorTexture&&s.traverse(i=>{i.isMesh&&(i.material=new M({map:this.gladiatorTexture,roughness:.6,metalness:.3}))})}catch(i){console.warn("Failed to load FBX model:",e.path,i),s=new k(new j(1,1,1),new M({color:7268279}))}s&&(t.x=Math.round(t.x/this.gridSize)*this.gridSize,t.z=Math.round(t.z/this.gridSize)*this.gridSize,s.position.copy(t),s.userData.assetId=e.id,s.userData.assetName=e.name,this.threeScene.add(s),this.placedObjects.push(s))}generateProceduralAsset(e){let t;switch(e){case"tree":const s=new k(new se(.2,.3,2,8),new M({color:9127187}));s.position.y=1;const i=new k(new Oe(1.5,3,8),new M({color:2263842}));i.position.y=3.5;const n=new H;n.add(s,i),t=n;break;case"rock":t=new k(new ls(.5+Math.random()*.5,0),new M({color:8421504,roughness:.9})),t.position.y=.3,t.rotation.set(Math.random(),Math.random(),Math.random());break;case"bush":const a=new H;for(let o=0;o<3;o++){const r=new k(new te(.3+Math.random()*.2,8,8),new M({color:3050327}));r.position.set((Math.random()-.5)*.5,.3+Math.random()*.2,(Math.random()-.5)*.5),a.add(r)}t=a;break;default:t=new k(new j(1,1,1),new M({color:7268279}))}return t}selectObject(e){this.selectedObject=e,w.select(e),this.transformControls&&[v.MOVE,v.ROTATE,v.SCALE].includes(this.currentTool)&&this.transformControls.attach(e),this.updateOutlineSelection()}deselectObject(){this.selectedObject=null,w.clearSelection(),this.transformControls&&this.transformControls.detach(),this.updateOutlineSelection()}deleteObject(e){const t=this.placedObjects.indexOf(e);t>-1&&(this.saveUndoState(),this.placedObjects.splice(t,1),this.threeScene.remove(e),this.selectedObject===e&&this.deselectObject(),w.events.emit("hierarchy-changed"))}undo(){if(this.currentTool===v.SCULPT&&this.terrainEditor){this.terrainEditor.undo(),this.showNotification("Terrain Undo");return}if(this.undoStack&&this.undoStack.length>0){const e=this.undoStack.pop();this.redoStack.push(this.captureSceneState()),this.restoreSceneState(e),this.showNotification(`Undo (${this.undoStack.length} left)`),console.log("[WorldBuilder] Undo")}}redo(){if(this.currentTool===v.SCULPT&&this.terrainEditor){this.terrainEditor.redo(),this.showNotification("Terrain Redo");return}if(this.redoStack&&this.redoStack.length>0){const e=this.redoStack.pop();this.undoStack.push(this.captureSceneState()),this.restoreSceneState(e),this.showNotification(`Redo (${this.redoStack.length} left)`),console.log("[WorldBuilder] Redo")}}saveUndoState(){this.undoStack=this.undoStack||[],this.redoStack=[],this.undoStack.push(this.captureSceneState()),this.undoStack.length>20&&this.undoStack.shift()}captureSceneState(){return this.placedObjects.map(e=>({uuid:e.uuid,position:e.position.clone(),rotation:e.rotation.clone(),scale:e.scale.clone(),visible:e.visible,userData:{...e.userData}}))}restoreSceneState(e){e.forEach(t=>{const s=this.placedObjects.find(i=>i.uuid===t.uuid);s&&(s.position.copy(t.position),s.rotation.copy(t.rotation),s.scale.copy(t.scale),s.visible=t.visible)}),w.events.emit("hierarchy-changed")}duplicateObject(e){if(!e)return;this.saveUndoState();const t=e.clone();t.position.x+=2,t.userData={...e.userData},this.threeScene.add(t),this.placedObjects.push(t),this.selectObject(t),w.events.emit("hierarchy-changed"),console.log("[WorldBuilder] Duplicated object")}selectAll(){console.log("[WorldBuilder] Select all - ",this.placedObjects.length,"objects")}deselectAll(){this.deselectObject(),this.transformControls&&this.transformControls.detach(),console.log("[WorldBuilder] Deselected all")}toggleVisibility(e){e&&(e.visible=!e.visible,w.events.emit("hierarchy-changed"),console.log("[WorldBuilder] Toggled visibility:",e.visible))}copyObject(e){e&&(this.clipboard={object:e,isCut:!1},this.showNotification("Copied"),console.log("[WorldBuilder] Copied:",e.userData.assetName||e.name))}cutObject(e){e&&(this.clipboard={object:e,isCut:!0},this.showNotification("Cut"),console.log("[WorldBuilder] Cut:",e.userData.assetName||e.name))}pasteObject(){if(!this.clipboard||!this.clipboard.object){this.showNotification("Nothing to paste");return}this.saveUndoState();const e=this.clipboard.object.clone();e.position.x+=2,e.userData={...this.clipboard.object.userData},this.threeScene.add(e),this.placedObjects.push(e),this.clipboard.isCut&&(this.deleteObject(this.clipboard.object),this.clipboard=null),this.selectObject(e),w.events.emit("hierarchy-changed"),this.showNotification("Pasted"),console.log("[WorldBuilder] Pasted object")}showNotification(e){let t=document.getElementById("wb-notification");t||(t=document.createElement("div"),t.id="wb-notification",t.style.cssText=`
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(110, 231, 183, 0.9);
                color: #0e1220;
                padding: 8px 20px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s;
                pointer-events: none;
            `,document.body.appendChild(t)),t.textContent=e,t.style.opacity="1",clearTimeout(this.notifTimeout),this.notifTimeout=setTimeout(()=>{t.style.opacity="0"},1500)}groupSelected(){console.log("[WorldBuilder] Group selected (not implemented)")}saveScene(){const e={objects:this.placedObjects.map(a=>({name:a.userData.assetName||a.name,assetId:a.userData.assetId,position:a.position.toArray(),rotation:[a.rotation.x,a.rotation.y,a.rotation.z],scale:a.scale.toArray()})),terrain:this.terrainEditor?this.terrainEditor.exportHeightData():null},t=JSON.stringify(e,null,2),s=new Blob([t],{type:"application/json"}),i=URL.createObjectURL(s),n=document.createElement("a");n.href=i,n.download="world-scene.json",n.click(),URL.revokeObjectURL(i),console.log("[WorldBuilder] Scene saved")}loadScene(){const e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=async t=>{const s=t.target.files[0];if(s){const i=await s.text(),n=JSON.parse(i);console.log("[WorldBuilder] Scene loaded:",n)}},e.click()}removeUI(){const e=document.getElementById("world-builder-ui");e&&e.remove(),this.quickActions&&this.quickActions.destroy(),this.onboardingHints&&this.onboardingHints.destroy(),this.radialMenu&&this.radialMenu.destroy()}handleQuickAction(e){const t={"add-spawn":"spawn","add-trigger":"trigger","add-waypoint":"waypoint","add-camera":"camera","add-point-light":"point_light","add-spot-light":"spot_light","add-cube":"cube","add-sphere":"sphere","add-plane":"plane","add-cylinder":"cylinder","play-mode":null};if(e==="play-mode"){this.menuBar?.commands?.["play-mode"]?.();return}const s=t[e];if(s){const i=X.find(n=>n.id===s);i&&(this.currentAsset=i,this.placeCurrentAsset(new m(0,0,0)))}}update(e){this.orbitControls&&this.orbitControls.update()}render(){this.composer&&this.data.camera?this.composer.render():this.renderer.render(this.threeScene,this.data.camera)}onResize(e,t){this.composer&&this.composer.setSize(e,t),this.outlinePass&&this.outlinePass.resolution.set(e,t)}async onExit(){await super.onExit(),this.removeUI(),this.renderer.domElement.removeEventListener("mousedown",this.onMouseDownBound),this.renderer.domElement.removeEventListener("mousemove",this.onMouseMoveBound),this.renderer.domElement.removeEventListener("mouseup",this.onMouseUpBound),window.removeEventListener("keydown",this.onKeyDownBound),this.orbitControls&&(this.orbitControls.dispose(),this.orbitControls=null),this.transformControls&&(this.threeScene.remove(this.transformControls),this.transformControls.dispose(),this.transformControls=null),this.composer&&(this.composer.dispose(),this.composer=null,this.outlinePass=null)}dispose(){this.removeUI(),this.orbitControls&&this.orbitControls.dispose(),this.transformControls&&this.transformControls.dispose(),super.dispose()}}const _e=[{id:"weapon_q",key:"Q",name:"Basic Strike",icon:"⚔️",cooldown:0,description:"Quick melee attack"},{id:"weapon_w",key:"W",name:"Power Swing",icon:"🗡️",cooldown:5,description:"Heavy damage attack"},{id:"weapon_e",key:"E",name:"Whirlwind",icon:"🌀",cooldown:10,description:"AoE spin attack"},{id:"weapon_r",key:"R",name:"Execute",icon:"💀",cooldown:20,description:"Ultimate weapon ability"}],He=[{id:"trait_1",key:"1",name:"Heal",icon:"❤️",cooldown:15,description:"Restore health"},{id:"trait_2",key:"2",name:"Shield",icon:"🛡️",cooldown:20,description:"Defensive barrier"},{id:"trait_3",key:"3",name:"Dash",icon:"💨",cooldown:8,description:"Quick movement"},{id:"trait_4",key:"4",name:"Rage",icon:"🔥",cooldown:30,description:"Damage boost"}];class Fi{constructor(){this.weaponBar=null,this.traitBar=null,this.cooldowns=new Map,this.onAbilityUse=null}init(){this.weaponBar=document.getElementById("weapon-action-bar"),this.traitBar=document.getElementById("trait-action-bar"),this.weaponBar&&this.renderBar(this.weaponBar,_e,"weapon"),this.traitBar&&this.renderBar(this.traitBar,He,"trait"),this.bindKeyEvents(),console.log("[GameActionBars] Initialized weapon and trait bars")}renderBar(e,t,s){e.innerHTML=t.map((i,n)=>`
            <div class="action-slot" data-id="${i.id}" data-type="${s}" data-index="${n}">
                <span class="slot-icon">${i.icon}</span>
                <span class="slot-key">${i.key}</span>
                <div class="slot-cooldown"></div>
                <div class="action-slot-tooltip">
                    <strong>${i.name}</strong><br>
                    <span style="color:#888">${i.description}</span><br>
                    <span style="color:#6ee7b7">[${i.key}] CD: ${i.cooldown}s</span>
                </div>
            </div>
        `).join(""),e.querySelectorAll(".action-slot").forEach(i=>{i.addEventListener("click",()=>this.useAbility(i.dataset.id)),i.addEventListener("mouseenter",()=>{const n=i.querySelector(".action-slot-tooltip");n&&(n.style.opacity="1")}),i.addEventListener("mouseleave",()=>{const n=i.querySelector(".action-slot-tooltip");n&&(n.style.opacity="0")})})}bindKeyEvents(){document.addEventListener("keydown",e=>{if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;const t=e.key.toUpperCase(),s=_e.find(n=>n.key.toUpperCase()===t);if(s){this.useAbility(s.id);return}const i=He.find(n=>n.key===t);if(i){this.useAbility(i.id);return}})}useAbility(e){if(this.cooldowns.has(e)){console.log(`[GameActionBars] ${e} is on cooldown`);return}const s=[..._e,...He].find(n=>n.id===e);if(!s)return;console.log(`[GameActionBars] Using ability: ${s.name}`);const i=document.querySelector(`.action-slot[data-id="${e}"]`);i&&(i.classList.add("active"),setTimeout(()=>i.classList.remove("active"),200)),s.cooldown>0&&this.startCooldown(e,s.cooldown),this.onAbilityUse&&this.onAbilityUse(s)}startCooldown(e,t){const s=document.querySelector(`.action-slot[data-id="${e}"]`);if(!s)return;s.classList.add("on-cooldown");const i=s.querySelector(".slot-cooldown");let n=t;this.cooldowns.set(e,n),i.style.display="flex",i.textContent=n;const a=setInterval(()=>{n--,i.textContent=n,this.cooldowns.set(e,n),n<=0&&(clearInterval(a),this.cooldowns.delete(e),s.classList.remove("on-cooldown"),i.style.display="none")},1e3)}setWeaponSkills(e){this.weaponBar&&e.length===4&&this.renderBar(this.weaponBar,e,"weapon")}setTraitAbilities(e){this.traitBar&&e.length===4&&this.renderBar(this.traitBar,e,"trait")}resetCooldowns(){this.cooldowns.clear(),document.querySelectorAll(".action-slot").forEach(e=>{e.classList.remove("on-cooldown");const t=e.querySelector(".slot-cooldown");t&&(t.style.display="none")})}}const ct=new Fi;class _i{constructor(){this.canvas=document.querySelector("canvas.webgl"),this.renderer=null,this.camera=null,this.arena=null,this.input=null,this.ui=null,this.isRunning=!1,this.isTargetLocked=!1,this.targetIndicator=null,this.sceneDirector=null,this.characterSelect=null,this.worldBuilder=null,this.currentMode="menu"}async init(){this.setupRenderer(),this.setupCamera(),this.input=new $s,this.ui=new Ws,this.ui.init({onEnterArena:()=>this.enterCharacterSelect(),onStartMatch:()=>this.startMatch(),onWorldBuilder:()=>this.enterWorldBuilder(),onResume:()=>this.resume(),onQuit:()=>this.quit(),onPause:()=>this.togglePause()}),this.sceneDirector=new Vs(this.renderer,this.camera),this.characterSelect=new Ks,this.characterSelect.onConfirm=e=>this.startMatchWithSelection(e),this.characterSelect.onBack=()=>this.returnToMenu(),this.sceneDirector.registerScene(Te.CHARACTER_SELECT,this.characterSelect),this.worldBuilder=new Ui(this.renderer),this.worldBuilder.onBack=()=>this.returnToMenu(),this.sceneDirector.registerScene(Te.WORLD_BUILDER,this.worldBuilder),this.arena=new Gs(this.renderer,this.camera),this.arena.callbacks.onLoadProgress=(e,t)=>{this.ui.updateLoadingProgress(e,t)},this.arena.callbacks.onStateChange=(e,t)=>{const s=this.mapArenaStateToGameState(e);this.ui.onStateChange(s)},this.arena.callbacks.onHealthUpdate=(e,t,s)=>{this.ui.updateHealth(e,t,s)},this.arena.callbacks.onRoundEnd=(e,t,s)=>{this.ui.updateRound(e,s),this.ui.showRoundEnd(t)},this.arena.callbacks.onMatchEnd=(e,t)=>{this.ui.showMatchEnd(e,t)},this.arena.callbacks.onCameraModeChange=(e,t)=>{this.updateCameraModeDisplay(t)},this.ui.updateLoadingProgress(10,"Initializing..."),await this.arena.init(),window.addEventListener("resize",()=>this.onResize()),this.targetIndicator=document.getElementById("target-indicator"),this.cameraModeIndicator=document.getElementById("camera-mode"),this.isRunning=!0,this.animate()}updateCameraModeDisplay(e){this.cameraModeIndicator&&(this.cameraModeIndicator.textContent=e,this.cameraModeIndicator.classList.remove("hidden"),this.cameraModeIndicator.classList.add("show"),clearTimeout(this.cameraModeTimeout),this.cameraModeTimeout=setTimeout(()=>{this.cameraModeIndicator.classList.remove("show")},2e3))}setupRenderer(){this.renderer=new cs({canvas:this.canvas,antialias:!0}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=ds,this.renderer.toneMapping=hs,this.renderer.toneMappingExposure=1}setupCamera(){this.camera=new ps(50,window.innerWidth/window.innerHeight,.1,500)}async enterCharacterSelect(){this.currentMode="character_select",this.ui.hideAllScreens(),await this.sceneDirector.switchTo(Te.CHARACTER_SELECT,{camera:this.camera})}async enterWorldBuilder(){this.currentMode="world_builder",this.ui.hideAllScreens(),this.camera.position.set(20,20,20),this.camera.lookAt(0,0,0),await this.sceneDirector.switchTo(Te.WORLD_BUILDER,{camera:this.camera})}async startMatchWithSelection(e){console.log("Starting match with:",e),localStorage.setItem("grudge_match_selection",JSON.stringify(e)),this.currentMode="arena",await this.sceneDirector.switchTo(null),this.startMatch()}async returnToMenu(){this.currentMode="menu",await this.sceneDirector.switchTo(null),this.cleanupSceneUI(),this.ui.showScreen("menu")}cleanupSceneUI(){["character-select-ui","world-builder-ui"].forEach(t=>{const s=document.getElementById(t);s&&(console.log(`[Main] Cleaning up stray UI: ${t}`),s.remove())})}startMatch(){this.currentMode="arena",this.cleanupSceneUI(),this.canvas.requestPointerLock(),this.arena.startMatch(),this.ui.showRoundStart(1),ct.init(),ct.onAbilityUse=e=>{console.log("[Main] Ability used:",e.name),this.arena&&this.arena.player&&this.arena.player.useAbility(e.id)}}mapArenaStateToGameState(e){return{[y.INITIALIZING]:B.LOADING,[y.LOADING]:B.LOADING,[y.MENU]:B.MENU,[y.COUNTDOWN]:B.PLAYING,[y.FIGHTING]:B.PLAYING,[y.ROUND_END]:B.ROUND_END,[y.MATCH_END]:B.MATCH_END,[y.PAUSED]:B.PAUSED}[e]||B.MENU}togglePause(){const e=this.arena.getState();e===y.FIGHTING?(this.arena.pause(),document.exitPointerLock()):e===y.PAUSED&&this.resume()}resume(){this.canvas.requestPointerLock(),this.arena.resume()}quit(){document.exitPointerLock(),this.arena.quit()}onResize(){this.camera.aspect=window.innerWidth/window.innerHeight,this.camera.updateProjectionMatrix(),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))}animate(){if(this.isRunning&&(requestAnimationFrame(()=>this.animate()),this.currentMode!=="menu")){if(this.currentMode==="character_select"||this.currentMode==="world_builder"){this.sceneDirector.update(.016666666666666666),this.sceneDirector.render(),this.input.update();return}if(this.currentMode==="arena"){this.input.isTabTargetPressed()&&(this.isTargetLocked=!this.isTargetLocked,this.targetIndicator&&this.targetIndicator.classList.toggle("hidden",!this.isTargetLocked));const e=this.input.getCameraModePressed();e!==null&&this.arena.setCameraMode(e),this.arena.update(this.input,this.isTargetLocked)}this.input.update()}}dispose(){this.isRunning=!1,this.arena.dispose(),this.renderer.dispose()}}const Hi=new _i;Hi.init().catch(console.error);
