/* Wholesale Gods — live Canvas 2D delivery. No MP4, GIF, or prerecorded frames.
 * Photographic sprites are layered with procedural lighting and mist.
 * The renderer is also exported for deterministic, non-browser frame checks. */
(function (root) {
  'use strict';
  const WIDTH=1280, HEIGHT=720, DURATION=22;
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const phase=(t,a,b)=>ease((t-a)/(b-a));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const chapters=[{time:0,label:'Out of the dark'},{time:4.5,label:'The signature'},{time:6.8,label:'The halo'},{time:8.5,label:'The ascent'},{time:11.2,label:'Special delivery'},{time:15,label:'Departure'},{time:19,label:'On its way'}];
  const sceneAt=t=>chapters.reduce((last,c)=>t>=c.time?c:last,chapters[0]);
  const sources={truck:'assets/truck-campaign.png',bay:'assets/dock.jpg',parcel:'assets/parcel-photo.png',logo:'assets/logo-gold.svg',symbol:'assets/brand-symbol-gold.svg',packageLogo:'assets/logo-black.svg'};
  function glow(ctx,x,y,rx,ry,alpha,color='232,204,153'){
    if(alpha<=0 || rx<=0 || ry<=0)return;
    ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
    const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'rgba('+color+','+alpha+')');g.addColorStop(.18,'rgba('+color+','+(alpha*.38)+')');g.addColorStop(1,'rgba('+color+',0)');
    ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
  }
  function aperture(ctx,x,y,rx,ry,alpha,front=false){
    if(alpha<.001 || rx<1)return;
    ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#dcc28e';ctx.lineWidth=1.5;
    ctx.shadowColor='#cfaa67';ctx.shadowBlur=17;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,front?0:0,front?Math.PI:Math.PI*2);ctx.stroke();
    ctx.shadowBlur=5;ctx.strokeStyle='#ffebc8';ctx.lineWidth=1;ctx.stroke();ctx.restore();
  }
  function fog(ctx,t,x,y,width,height,alpha,texture){
    if(!texture||alpha<.001)return;
    // Two independently advected noise fields give wisps continuous motion.
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let i=0;i<3;i++){
      const drift=Math.sin(t*.19+i*2)*width*.1;
      ctx.globalAlpha=alpha*(.5-i*.06);
      ctx.drawImage(texture,x+drift-i*width*.13,y-height-Math.sin(t*.15+i)*8,width*(1+i*.15),height*(1+i*.1));
    }ctx.restore();
  }
  function makeFog(makeCanvas){
    const c=makeCanvas(256,256),ctx=c.getContext('2d'),im=ctx.createImageData(256,256);
    let seed=7261;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    const grids=[8,17,35].map(n=>({n,v:Array.from({length:n*n},random)}));
    function noise(g,x,y){const u=x*(g.n-1)/255,v=y*(g.n-1)/255,xi=Math.floor(u),yi=Math.floor(v),fx=ease(u-xi),fy=ease(v-yi);const at=(a,b)=>g.v[Math.min(g.n-1,b)*g.n+Math.min(g.n-1,a)];return lerp(lerp(at(xi,yi),at(xi+1,yi),fx),lerp(at(xi,yi+1),at(xi+1,yi+1),fx),fy);}
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
      const u=(x-128)/128,v=(y-128)/128;
      const n=noise(grids[0],x,y)*.57+noise(grids[1],x,y)*.29+noise(grids[2],x,y)*.14;
      const a=Math.max(0,(n-.28)*1.4)*Math.exp(-(u*u*2.7+v*v*3.3));
      const k=(y*256+x)*4;im.data[k]=203;im.data[k+1]=197;im.data[k+2]=179;im.data[k+3]=Math.round(a*220);
    }ctx.putImageData(im,0,0);return c;
  }
  function prepareAssets(images,makeCanvas){
    const truck=makeCanvas(930,498),ctx=truck.getContext('2d');
    // Alpha-trimmed photographic truck, kept separate from its vector livery.
    ctx.drawImage(images.truck,50,128,1450,776,0,0,930,498);
    ctx.save();ctx.transform(1,-.127,0,1,92,221);ctx.globalAlpha=.92;ctx.drawImage(images.logo,0,0,337,78.6);ctx.restore();
    const parcel=makeCanvas(520,350),pc=parcel.getContext('2d');
    const ratio=Math.min(520/images.parcel.width,350/images.parcel.height);
    pc.drawImage(images.parcel,(520-images.parcel.width*ratio)/2,(350-images.parcel.height*ratio)/2,images.parcel.width*ratio,images.parcel.height*ratio);
    pc.save();pc.transform(1,.13,0,1,165,205);pc.drawImage(images.packageLogo,0,0,220,51.3);pc.restore();
    return {...images,paintedTruck:truck,paintedParcel:parcel,fog:makeFog(makeCanvas)};
  }
  function drawFrame(ctx,time,assets,options={}){
    const t=Math.max(0,Math.min(DURATION,time));
    ctx.save();ctx.setTransform(ctx.canvas.width/WIDTH,0,0,ctx.canvas.height/HEIGHT,0,0);
    ctx.fillStyle='#030506';ctx.fillRect(0,0,WIDTH,HEIGHT);
    if(!assets){ctx.restore();return;}
    const arrival=phase(t,.45,4.5),departure=phase(t,15,18.1),reveal=phase(t,1.1,4.3);
    const w=lerp(210,940,arrival),h=w*498/930;
    const x=lerp(700,140,arrival)+1510*Math.pow(departure,1.6),ground=lerp(405,547,arrival),y=ground-h;
    ctx.save();ctx.globalAlpha=(.02+.42*reveal)*(1-phase(t,18,19.2));ctx.drawImage(assets.bay,0,0,WIDTH,HEIGHT);ctx.restore();
    fog(ctx,t*.4,0,560,1100,150,.25*reveal,assets.fog);
    glow(ctx,x+w*.5,ground+1,w*.55,37,.48*reveal,'0,0,0');
    ctx.save();ctx.globalAlpha=.09*reveal;ctx.translate(x,ground);ctx.scale(1,-.19);ctx.drawImage(assets.paintedTruck,0,-h,w,h);ctx.restore();
    ctx.save();ctx.globalAlpha=.025+.975*reveal;ctx.drawImage(assets.paintedTruck,x,y,w,h);ctx.restore();
    // Live photographic wheel faces turn inside perspective-correct ellipses.
    const spin=(arrival*480+departure*1600)*Math.PI/180;
    for(const wheel of [[.145,.837,27,39],[.657,.852,37,48]]){
      const [fx,fy,rx,ry]=wheel,s=w/930;
      ctx.save();ctx.globalAlpha=reveal*.9;ctx.translate(x+w*fx,y+h*fy);ctx.scale(rx/ry*s,s);
      ctx.beginPath();ctx.arc(0,0,ry-2,0,Math.PI*2);ctx.clip();ctx.rotate(spin);
      ctx.drawImage(assets.paintedTruck,930*fx-rx,498*fy-ry,rx*2,ry*2,-ry,-ry,ry*2,ry*2);ctx.restore();
    }
    const hx=x+w*.807,hy=y+h*.64,head=phase(t,.18,1.3)*(1-phase(t,17.8,18.5));
    ctx.save();ctx.globalCompositeOperation='screen';
    glow(ctx,hx+140,hy+34,275,55,head*.13);glow(ctx,hx,hy,55*lerp(.28,1,arrival),41*lerp(.28,1,arrival),head*.8);glow(ctx,hx,hy,8,6,head*.95,'255,243,216');glow(ctx,x+w*.985,hy-2,30,27,head*.5);
    glow(ctx,hx+60,ground+13,200,27,head*.15);ctx.restore();
    // A restrained highlight sweeps across the crown and globe after arrival.
    const signature=phase(t,4.4,5.2)*(1-phase(t,5.8,6.7));
    glow(ctx,x+w*.3,y+h*.38,210,82,signature*.055,'220,193,132');
    const open=phase(t,6.8,8.1)*(1-phase(t,13.8,14.8));
    const lift=phase(t,8.5,10.7),load=phase(t,11.2,13.5),cx=420,cy=579,portX=465,portY=324;
    if(open>.001){
      glow(ctx,cx,cy,220,52,open*.14);aperture(ctx,cx,cy,105*phase(t,6.8,8.1),29*phase(t,6.8,8.1),open);
      fog(ctx,t,315,577,190,220,open*.9,assets.fog);
      aperture(ctx,portX,portY,40,61,open*phase(t,10.6,11.7)*.75);
      glow(ctx,portX,portY,85,115,open*phase(t,10.6,11.7)*.07);
    }
    if(t>=8.5 && t<14){
      const bx=lerp(cx,portX,load),by=cy-26-109*lift-(cy-135-portY)*load-22*Math.sin(Math.PI*load);
      const bw=156*(1-.7*load),bh=bw*350/520;
      ctx.save();ctx.beginPath();ctx.rect(0,0,WIDTH,cy+4);ctx.clip();ctx.globalAlpha=phase(t,8.5,8.9)*(1-phase(t,13.1,13.9));
      ctx.drawImage(assets.paintedParcel,bx-bw/2,by-bh/2+(1-lift)*69,bw,bh);ctx.restore();
      aperture(ctx,cx,cy,105,29,open,true);
      fog(ctx,t*.8,bx-45,by,90,115,(1-load)*.26,assets.fog);
    }
    if(departure>0)fog(ctx,t,140,551,560,125,(1-departure)*.65,assets.fog);
    const edge=ctx.createRadialGradient(640,330,170,640,330,740);edge.addColorStop(0,'#0000');edge.addColorStop(1,'#000b');ctx.fillStyle=edge;ctx.fillRect(0,0,WIDTH,HEIGHT);
    // A real-time branding insert makes the new delivery visibly distinct.
    const close=phase(t,4.65,5.15)*(1-phase(t,6.25,6.85));
    if(close>.001){
      ctx.save();ctx.globalAlpha=close;ctx.fillStyle='#080b0b';ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.drawImage(assets.paintedTruck,70-(t-5)*14,-60,1760,942);
      const shade=ctx.createRadialGradient(570,340,100,570,340,740);shade.addColorStop(0,'#0000');shade.addColorStop(1,'#000c');ctx.fillStyle=shade;ctx.fillRect(0,0,WIDTH,HEIGHT);
      ctx.fillStyle='#bca679';ctx.font='11px Helvetica, Arial, sans-serif';ctx.fillText('T H E   S I G N A T U R E',75,640);ctx.restore();
    }
    const out=phase(t,18,19.2);ctx.fillStyle='rgba(3,5,6,'+out+')';ctx.fillRect(0,0,WIDTH,HEIGHT);
    const end=phase(t,19,20.2);
    if(end>0){ctx.save();ctx.globalAlpha=end;ctx.drawImage(assets.logo,455,205,370,86.3);ctx.strokeStyle='#9d8257';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(610,333);ctx.lineTo(670,333);ctx.stroke();ctx.fillStyle='#eee6d7';ctx.textAlign='center';ctx.font='52px Didot, Georgia, serif';ctx.fillText('Your package is on its way.',640,423);ctx.font='10px Helvetica, Arial, sans-serif';ctx.fillStyle='#a69c87';ctx.fillText('W H O L E S A L E   G O D S   /   S P E C I A L   D E L I V E R Y',640,482);ctx.restore();}
    ctx.restore();
  }
  class Dispatch extends EventTarget {
    constructor(canvas){
      super();this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.duration=DURATION;this._time=0;this.paused=true;this.ended=false;this.assets=null;this.error=null;this._raf=0;this._stamp=0;this._lastNotice=-1;this._scene='';this._wanted=false;
      if(!this.ctx){this.error=new Error('Canvas 2D is unavailable');canvas.dataset.error='true';this.ready=Promise.resolve();return;}
      const makeCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
      this.ready=Promise.all(Object.entries(sources).map(([key,url])=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve([key,im]);im.onerror=()=>reject(new Error('Could not load '+url));im.src=url;}))).then(entries=>{
        this.assets=prepareAssets(Object.fromEntries(entries),makeCanvas);canvas.dataset.ready='true';this.resize();this.dispatchEvent(new Event('loadedmetadata'));if(this._wanted)this.play();
      }).catch(error=>{this.error=error;canvas.dataset.error='true';this.paused=true;this._wanted=false;this.dispatchEvent(new Event('error'));});
      this.resize=()=>{const box=canvas.getBoundingClientRect(),ratio=Math.min(2,root.devicePixelRatio||1);canvas.width=Math.max(640,Math.min(1920,Math.round((box.width||1280)*ratio)));canvas.height=Math.round(canvas.width*HEIGHT/WIDTH);this.draw();};
      if(typeof ResizeObserver!=='undefined'){this._resizeObserver=new ResizeObserver(this.resize);this._resizeObserver.observe(canvas);}else root.addEventListener('resize',this.resize);
      document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();});
      if(typeof IntersectionObserver!=='undefined'){this._intersection=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)this.pause();},{threshold:0});this._intersection.observe(canvas);}
      this._motionListener=()=>{this.pause();if(Dispatch.reducedMotion)this.currentTime=DURATION;this.dispatchEvent(new Event('motionchange'));};
      root.addEventListener('wg-motion-change',this._motionListener);this.resize();
      if(Dispatch.reducedMotion)this.currentTime=DURATION;
    }
    get currentTime(){return this._time;}
    set currentTime(value){this._time=Math.max(0,Math.min(DURATION,Number(value)||0));this.ended=this._time>=DURATION;this.draw();this.notify(true);}
    draw(){if(this.ctx)drawFrame(this.ctx,this._time,this.assets);}
    notify(force=false){
      if(force||Math.floor(this._time*8)!==this._lastNotice){this._lastNotice=Math.floor(this._time*8);this.dispatchEvent(new Event('timeupdate'));}
      const chapter=sceneAt(this._time);if(chapter.label!==this._scene){this._scene=chapter.label;this.dispatchEvent(new CustomEvent('scenechange',{detail:chapter}));}
    }
    play(){
      if(this.error){this.dispatchEvent(new Event('error'));return Promise.resolve();}
      if(Dispatch.reducedMotion){this.pause();this.currentTime=DURATION;return Promise.resolve();}
      this._wanted=true;if(!this.assets)return this.ready;
      if(!this.paused)return Promise.resolve();if(this.ended)this.currentTime=0;
      this.paused=false;this.ended=false;this._stamp=0;this._paintStamp=0;this.dispatchEvent(new Event('play'));
      const tick=stamp=>{if(this.paused)return;if(this._stamp)this._time=Math.min(DURATION,this._time+Math.min(.1,(stamp-this._stamp)/1000));this._stamp=stamp;if(stamp-this._paintStamp>=1000/30){this._paintStamp=stamp;this.draw();this.notify();}if(this._time>=DURATION){this.draw();this.notify(true);this.ended=true;this.paused=true;this._wanted=false;this.dispatchEvent(new Event('ended'));return;}this._raf=root.requestAnimationFrame(tick);};
      this._raf=root.requestAnimationFrame(tick);return Promise.resolve();
    }
    pause(){this._wanted=false;this.paused=true;root.cancelAnimationFrame(this._raf);this._raf=0;this._stamp=0;this.dispatchEvent(new Event('pause'));}
    static get reducedMotion(){
      try{const saved=root.localStorage.getItem('wg.motion.v1');if(saved!==null)return saved==='reduced';}catch{}
      return typeof root.matchMedia==='function'&&root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    static setReducedMotion(reduced){try{root.localStorage.setItem('wg.motion.v1',reduced?'reduced':'full');}catch{}root.document?.body.classList.toggle('reduce-motion',reduced);root.document?.body.classList.toggle('full-motion',!reduced);root.dispatchEvent(new CustomEvent('wg-motion-change',{detail:{reduced}}));}
  }
  Dispatch.drawFrame=drawFrame;Dispatch.prepareAssets=prepareAssets;Dispatch.sources=sources;Dispatch.chapters=chapters;Dispatch.sceneAt=sceneAt;Dispatch.DURATION=DURATION;
  root.WGDispatch=Dispatch;
  root.addEventListener?.('storage',event=>{if(event.key==='wg.motion.v1')root.dispatchEvent(new Event('wg-motion-change'));});
  if(typeof root.matchMedia==='function')root.matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',()=>{let saved;try{saved=root.localStorage.getItem('wg.motion.v1');}catch{}if(saved===null){root.document?.body.classList.toggle('reduce-motion',Dispatch.reducedMotion);root.dispatchEvent(new Event('wg-motion-change'));}});
})(typeof window!=='undefined'?window:globalThis);
