/* Passive native-video hero. The supplied film replaces the former GSAP scene. */
(function(root){
 'use strict';
 class DeliveryHero extends EventTarget{
  constructor(scene){
   super();this.scene=scene;this.stage=scene.closest('#film-stage');this.campaign=scene.closest('#campaign');this.video=scene.querySelector('video');this.poster=scene.querySelector('.hero-film-poster');this.error=null;this._isVisible=true;this._ready=false;this._request=0;this._sourceLoaded=false;this._paused=true;
   scene.dataset.engine='video';scene.dataset.playback='poster';
   this.video.muted=true;this.video.defaultMuted=true;this.video.loop=true;this.video.playsInline=true;this.video.disablePictureInPicture=true;
   this.video.addEventListener('playing',()=>this.markPlaying());
   this.video.addEventListener('pause',()=>{this._paused=true;this.dispatchEvent(new Event('pause'));});
   this.video.addEventListener('loadedmetadata',()=>this.dispatchEvent(new Event('loadedmetadata')));
   this.video.addEventListener('error',()=>this.fail());
   this.video.querySelector('source').addEventListener('error',()=>this.fail());
   // Native loop normally restarts without ended; cover players that emit it anyway.
   this.video.addEventListener('ended',()=>{if(this.shouldPlay()){this.video.currentTime=0;this.play();}});
   root.addEventListener('wg-motion-change',()=>{this.syncPlayback();this.dispatchEvent(new Event('motionchange'));});
   document.addEventListener('visibilitychange',()=>this.syncPlayback());
   if(typeof IntersectionObserver!=='undefined'){
    this._observer=new IntersectionObserver(entries=>{this._isVisible=entries[0].isIntersecting;this.syncPlayback();},{threshold:0});this._observer.observe(this.stage);
   }
   this.ready=Promise.resolve().then(()=>{this._ready=true;scene.dataset.ready='true';return this.syncPlayback();});
  }
  get currentTime(){return this.video.currentTime||0;}
  set currentTime(value){try{this.video.currentTime=Math.max(0,Math.min(this.duration,Number(value)||0));}catch{}}
  get duration(){return Number.isFinite(this.video.duration)&&this.video.duration>0?this.video.duration:31.375;}
  get paused(){return this._paused;}
  get ended(){return false;}
  shouldPlay(){return this._ready&&!this.error&&!DeliveryHero.reducedMotion&&!this.campaign.hidden&&!document.hidden&&this._isVisible;}
  markPlaying(){
   if(!this.shouldPlay()){this.pause();return;}
   this._paused=false;this.poster.hidden=true;this.scene.dataset.playback='playing';this.dispatchEvent(new Event('play'));
  }
  play(){
   if(!this.shouldPlay()){this.pause();return Promise.resolve();}
   const request=++this._request;
   if(!this._sourceLoaded){
    const source=this.video.querySelector('source');source.src=source.dataset.src;this._sourceLoaded=true;
    this.video.preload='auto';this.video.load();
   }
   this.video.muted=true;this.scene.dataset.playback='loading';
   try{
    return Promise.resolve(this.video.play()).then(()=>{
     if(request!==this._request)return;
     if(this.shouldPlay())this.markPlaying();else this.pause();
    }).catch(()=>{
     if(request!==this._request)return;
     // Low-power/autoplay restrictions retain the real poster, with no player UI.
     this.pause();this.poster.hidden=false;this.scene.dataset.playback='poster';
    });
   }catch{
    this.pause();this.poster.hidden=false;this.scene.dataset.playback='poster';return Promise.resolve();
   }
  }
  pause(){this._request++;this.video.pause();this._paused=true;if(this.scene.dataset.playback!=='error')this.scene.dataset.playback='paused';this.dispatchEvent(new Event('pause'));}
  summary(){this.pause();this.poster.hidden=false;this.scene.dataset.playback='reduced';}
  syncPlayback(){if(DeliveryHero.reducedMotion){this.summary();return Promise.resolve();}return this.play();}
  fail(){if(this.error)return;this.error=new Error('The delivery film could not load.');this.pause();this.poster.hidden=false;this.scene.dataset.playback='error';this.dispatchEvent(new Event('error'));}
  static get reducedMotion(){return root.WGPreferences.reducedMotion;}
 }
 root.WGDeliveryHero=DeliveryHero;
})(window);
