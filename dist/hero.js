/* Passive native-video hero. The supplied film replaces the former GSAP scene. */
(function(root){
 'use strict';
 class DeliveryHero extends EventTarget{
  constructor(scene){
   super();this.scene=scene;this.stage=scene.closest('#film-stage');this.campaign=scene.closest('#campaign');this.video=scene.querySelector('video');this.poster=scene.querySelector('.hero-film-poster');this.error=null;this._isVisible=true;this._ready=false;this._request=0;this._sourceLoaded=false;this._paused=true;this._playPromise=null;this._retryTimer=null;this._retryCount=0;
   scene.dataset.engine='video';scene.dataset.playback='poster';
   this.video.muted=true;this.video.defaultMuted=true;this.video.loop=true;this.video.playsInline=true;this.video.disablePictureInPicture=true;
   this.video.addEventListener('playing',()=>this.markPlaying());
   this.video.addEventListener('pause',()=>{this._paused=true;this.dispatchEvent(new Event('pause'));});
   this.video.addEventListener('loadedmetadata',()=>this.dispatchEvent(new Event('loadedmetadata')));
   const retryWhenReady=()=>{if(this.shouldPlay()&&this.video.paused)this.play();};
   this.video.addEventListener('loadeddata',retryWhenReady);
   this.video.addEventListener('canplay',retryWhenReady);
   this.video.addEventListener('error',()=>this.fail());
   this.video.querySelector('source').addEventListener('error',()=>this.fail());
   // Native loop normally restarts without ended; cover players that emit it anyway.
   this.video.addEventListener('ended',()=>{if(this.shouldPlay()){this.video.currentTime=0;this.play();}});
   root.addEventListener('wg-motion-change',()=>{this._retryCount=0;this.syncPlayback();this.dispatchEvent(new Event('motionchange'));});
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)this._retryCount=0;this.syncPlayback();});
   root.addEventListener('pageshow',()=>{this._retryCount=0;this.syncPlayback();});
   if(typeof IntersectionObserver!=='undefined'){
    this._observer=new IntersectionObserver(entries=>{const visible=entries[0].isIntersecting;if(visible&&!this._isVisible)this._retryCount=0;this._isVisible=visible;this.syncPlayback();},{threshold:0});this._observer.observe(this.scene);
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
   if(!this.shouldPlay()){if(DeliveryHero.reducedMotion)this.summary();else this.pause();return;}
   root.clearTimeout(this._retryTimer);this._retryTimer=null;this._retryCount=0;
   this._paused=false;this.poster.hidden=true;this.scene.dataset.playback='playing';this.dispatchEvent(new Event('play'));
  }
  play(){
   if(!this.shouldPlay()){this.pause();return Promise.resolve();}
   // Metadata and visibility events can arrive together. Keep one pending play
   // request instead of interrupting the browser's initial autoplay attempt.
   if(this._playPromise)return this._playPromise;
   if(!this.video.paused){this.markPlaying();return Promise.resolve();}
   const request=++this._request;
   if(!this._sourceLoaded){
    const source=this.video.querySelector('source');source.src=source.dataset.src;this._sourceLoaded=true;
    this.video.preload='auto';this.video.load();
   }
   this.video.muted=true;this.scene.dataset.playback='loading';
   try{
    let pending;
    pending=Promise.resolve(this.video.play()).then(()=>{
     if(request!==this._request)return;
     if(this.shouldPlay())this.markPlaying();else this.pause();
    }).catch(()=>{
     if(request!==this._request)return;
     this.pause();this.poster.hidden=false;this.scene.dataset.playback='poster';this.retryAutomatically();
    }).finally(()=>{if(this._playPromise===pending)this._playPromise=null;});
    this._playPromise=pending;return pending;
   }catch{
    this.pause();this.poster.hidden=false;this.scene.dataset.playback='poster';this.retryAutomatically();return Promise.resolve();
   }
  }
  retryAutomatically(){
   if(!this.shouldPlay()||this._retryTimer!==null||this._retryCount>=3)return;
   const delay=[250,1000,2500][this._retryCount++];
   this._retryTimer=root.setTimeout(()=>{this._retryTimer=null;if(this.shouldPlay()&&this.video.paused)this.play();},delay);
  }
  pause(){this._request++;root.clearTimeout(this._retryTimer);this._retryTimer=null;this._playPromise=null;this.video.pause();this._paused=true;if(this.scene.dataset.playback!=='error')this.scene.dataset.playback='paused';this.dispatchEvent(new Event('pause'));}
  summary(){this.pause();this.poster.hidden=false;this.scene.dataset.playback='reduced';}
  syncPlayback(){if(DeliveryHero.reducedMotion){this.summary();return Promise.resolve();}return this.play();}
  fail(){if(this.error)return;this.error=new Error('The delivery film could not load.');this.pause();this.poster.hidden=false;this.scene.dataset.playback='error';this.dispatchEvent(new Event('error'));}
  static get reducedMotion(){return root.WGPreferences.reducedMotion;}
 }
 root.WGDeliveryHero=DeliveryHero;
})(window);
