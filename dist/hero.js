/* Wholesale Gods: a GSAP timeline over native CSS 3D packaging and atmospheric
 * DOM layers. The photographic truck is a separate scenic asset, not a 3D rig. */
(function(root){
 'use strict';
 class DeliveryHero extends EventTarget{
  constructor(scene){
   super();this.scene=scene;this.stage=scene.closest('#film-stage');this.campaign=scene.closest('#campaign');this.duration=22;this._time=0;this.paused=true;this.ended=false;this.error=null;this._wanted=false;this._isVisible=true;this._notice=-1;this._chapter='';
   const gsap=root.gsap;
   if(!gsap){this.error=new Error('The motion library did not load.');this.ready=Promise.resolve();return;}
   this.scene.dataset.engine='gsap';
   const $=s=>scene.querySelector(s),copy=this.campaign.querySelector('.dispatch-copy'),end=this.campaign.querySelector('.hero-ending');
   this.copy=copy;this.end=end;
   const tl=this.timeline=gsap.timeline({paused:true,onUpdate:()=>{this._time=tl.time();this.notify();},onComplete:()=>{this._time=22;this.paused=true;this.ended=true;this._wanted=false;this.notify(true);this.dispatchEvent(new Event('ended'));}});
   const parcel=$('.parcel-rig'),truck=$('.delivery-truck'),halo=$('.delivery-halo'),mist=$('.hero-mist'),port=$('.cargo-aperture');
   gsap.set(parcel,{transformPerspective:1200,transformStyle:'preserve-3d'});
   tl.fromTo(truck,{x:460,y:-120,scale:.32},{x:-20,y:0,scale:.91,duration:4.8,ease:'power2.out'},0)
     .fromTo($('.truck-body'),{opacity:0},{opacity:.72,duration:3.1,ease:'power1.inOut'},.8)
     .fromTo($('.truck-headlights'),{opacity:0},{opacity:1,duration:1.2},.2)
     .fromTo($('.truck-identity'),{opacity:0},{opacity:.9,duration:1.1},3.5)
     .fromTo(halo,{opacity:0,scale:.25},{opacity:1,scale:1,duration:1.7,ease:'power3.inOut'},5.2)
     .fromTo($('.halo-light'),{opacity:0},{opacity:.8,duration:2},5.5)
     .fromTo(mist,{opacity:0,y:20},{opacity:.5,y:-12,duration:2.5,ease:'sine.inOut'},5.5)
     .fromTo(parcel,{x:0,y:230,z:0,scale:.35,rotationX:-13,rotationY:-28,rotationZ:-2,opacity:0},{y:0,scale:1,opacity:1,duration:3.2,ease:'power2.inOut'},7)
     .fromTo($('.parcel-shadow'),{opacity:0,scale:.6},{opacity:.65,scale:1,duration:2.2},7.6)
     .to(parcel,{y:-9,rotationY:-20,rotationZ:0,duration:1.7,ease:'sine.inOut'},10.2)
     .fromTo($('.foil-sweep'),{xPercent:-150,opacity:0},{xPercent:150,opacity:.5,duration:1.7,ease:'power1.inOut'},9.3)
     .fromTo(port,{opacity:0,scaleY:.2},{opacity:.8,scaleY:1,duration:.9},11.4)
     .to(parcel,{x:-235,y:-35,z:-140,scale:.14,rotationY:-8,opacity:0,duration:2.4,ease:'power2.inOut'},12)
     .to($('.parcel-shadow'),{opacity:0,scale:.3,duration:1.5},12.3)
     .to([halo,$('.halo-light'),mist],{opacity:0,duration:1.4},13.6)
     .to(port,{opacity:0,scaleY:.2,duration:.8},14)
     .to(truck,{x:1300,y:-10,duration:3.3,ease:'power3.in'},14.8)
     .to(copy,{opacity:0,y:-15,duration:1.2},17.5)
     .to(scene,{opacity:0,duration:1.3},18)
     .fromTo(end,{opacity:0,y:20},{opacity:1,y:0,duration:1.6,ease:'power2.out'},19)
     .to({}, {duration:.4},21.6);
   this.resize=()=>{
    const b=this.stage.getBoundingClientRect(),w=b.width||1280,h=b.height||720,mobile=w<680;
    const scale=Math.max(w/(mobile?730:1280),h/720),focalX=mobile?855:640,focalY=mobile?305:360;
    scene.querySelector('.delivery-world').style.transform='translate('+(-focalX*scale)+'px,'+(-focalY*scale)+'px) scale('+scale+')';
   };
   if(typeof ResizeObserver!=='undefined'){this._resize=new ResizeObserver(this.resize);this._resize.observe(this.stage);}else root.addEventListener('resize',this.resize);
   this.resize();this.timeline.time(0,true);this.notify(true);
   const urls=[...new Set([...scene.querySelectorAll('img')].map(im=>im.getAttribute('src')))];
   this.ready=Promise.all(urls.map(url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=resolve;im.onerror=()=>reject(new Error('Could not load '+url));im.src=url;}))).then(()=>{
    scene.dataset.ready='true';if(DeliveryHero.reducedMotion)this.summary();else if(this._wanted)this.play();else if(!this.campaign.hidden)this.idle();this.dispatchEvent(new Event('loadedmetadata'));
   }).catch(error=>{this.error=error;scene.dataset.error='true';this.pause();this.dispatchEvent(new Event('error'));});
   root.addEventListener('wg-motion-change',()=>{this.pause();if(DeliveryHero.reducedMotion)this.summary();this.dispatchEvent(new Event('motionchange'));});
   document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();});
   if(typeof IntersectionObserver!=='undefined'){this._visible=new IntersectionObserver(entries=>{this._isVisible=entries[0].isIntersecting;if(!this._isVisible)this.pause();},{threshold:0});this._visible.observe(this.stage);}
   if(DeliveryHero.reducedMotion)this.summary();
  }
  get currentTime(){return this._time;}
  set currentTime(time){this._ambient?.kill();this._idleMode=false;this._time=Math.max(0,Math.min(22,Number(time)||0));this.ended=this._time>=22;if(this.timeline)this.timeline.time(this._time,true);this.notify(true);}
  idle(){this.timeline.pause(10.6,true);this._time=10.6;this.ended=false;this.paused=!!document.hidden||!this._isVisible;this._wanted=false;this._idleMode=true;this._ambient?.kill();this._ambient=root.gsap.to(this.scene.querySelector(".parcel-rig"),{y:"-=8",rotationY:-24,duration:3.8,repeat:-1,yoyo:true,paused:this.paused,ease:"sine.inOut"});this.notify(true);this.dispatchEvent(new Event(this.paused?"pause":"play"));}
  summary(){this._ambient?.kill();this._idleMode=false;if(this.timeline)this.timeline.pause(10.6,true);this._time=22;this.paused=true;this.ended=true;this._wanted=false;this.copy.style.opacity='1';this.copy.inert=false;this.end.style.opacity='0';this.end.inert=true;this.end.setAttribute('aria-hidden','true');this.scene.style.opacity='1';this.notify(true,true);}
  notify(force=false,summary=false){
   if(!summary){const final=this._time>=18.8;this.end.inert=!final;this.end.setAttribute('aria-hidden',String(!final));this.copy.inert=final;}
   if(force||Math.floor(this._time*8)!==this._notice){this._notice=Math.floor(this._time*8);this.dispatchEvent(new Event('timeupdate'));}
   const chapter=DeliveryHero.sceneAt(this._time);if(chapter.label!==this._chapter){this._chapter=chapter.label;this.dispatchEvent(new CustomEvent('scenechange',{detail:chapter}));}
  }
  play(){
   if(this.error)return Promise.resolve();if(DeliveryHero.reducedMotion){this.summary();return Promise.resolve();}
   if(this._idleMode){this._ambient?.play();this.paused=false;this.dispatchEvent(new Event("play"));return Promise.resolve();}
   this._wanted=true;if(this.scene.dataset.ready!=='true')return this.ready;
   if(this.ended)this.currentTime=0;this.paused=false;this.ended=false;this.timeline.play();this.dispatchEvent(new Event('play'));return Promise.resolve();
  }
  pause(){this._wanted=false;this.paused=true;this._ambient?.pause();this.timeline?.pause();this.dispatchEvent(new Event('pause'));}
  static get reducedMotion(){return root.WGPreferences.reducedMotion;}
  static sceneAt(t){return [{time:0,label:'The approach'},{time:5.2,label:'A halo opens'},{time:7,label:'The ascent'},{time:12,label:'Special delivery'},{time:14.8,label:'The departure'},{time:19,label:'On its way'}].reduce((a,c)=>t>=c.time?c:a,{time:0,label:'The approach'});}
 }
 root.WGDeliveryHero=DeliveryHero;
})(window);
