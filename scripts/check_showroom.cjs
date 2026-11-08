/* DOM and animation-controller regression checks. This is not browser visual QA. */
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const renderer=fs.readFileSync(path.join(root,'dist/motion-preferences.js'),'utf8');
const app=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
function setup({mode='campaign',reduced=false,floor='',source='',brokenAssets=false,rejectAutoplay=false,rejectFirst=0,deferredPlayback=false,legacyMotion,savedMotion,storage}={}){
  const dom=new JSDOM(html,{url:'http://localhost:4173/?view='+mode+'&floor='+floor+'&source='+source,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,q=s=>w.document.querySelector(s);let timers=[],raf=new Map(),rafId=0,download,visibleCallback,virtualNow=100000;w.Date.now=()=>virtualNow;
  w.IntersectionObserver=class {constructor(callback){visibleCallback=callback;}observe(){}disconnect(){}};
  w.matchMedia=()=>({matches:reduced,addEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=function(){};
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};
  w.HTMLAnchorElement.prototype.click=function(){};
  w.HTMLCanvasElement.prototype.getContext=function(){
    if(this._ctx)return this._ctx;
    this._ctx=new Proxy({canvas:this,createImageData:(x,y)=>({data:new Uint8ClampedArray(x*y*4)}),createRadialGradient:()=>({addColorStop(){}})}, {get:(obj,key)=>key in obj?obj[key]:()=>{},set:(obj,key,value)=>{obj[key]=value;return true;}});return this._ctx;
  };
  Object.defineProperty(w.HTMLMediaElement.prototype,'duration',{get(){return 31.375;}});
  Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{get(){return this._mediaPaused!==false;}});
  w.HTMLMediaElement.prototype.load=function(){this._loads=(this._loads||0)+1;if(brokenAssets)Promise.resolve().then(()=>this.dispatchEvent(new w.Event('error')));};
  w.HTMLMediaElement.prototype.play=function(){
    this._plays=(this._plays||0)+1;
    if(brokenAssets)return Promise.reject(new Error('Missing media'));
    if(rejectAutoplay||this._plays<=rejectFirst)return Promise.reject(new w.DOMException('Autoplay disabled','NotAllowedError'));
    const begin=()=>{this._mediaPaused=false;this.dispatchEvent(new w.Event('playing'));};
    if(deferredPlayback)return new Promise(resolve=>{this.resolvePlayback=()=>{begin();resolve();};});
    begin();return Promise.resolve();
  };
  w.HTMLMediaElement.prototype.pause=function(){this._mediaPaused=true;this.dispatchEvent(new w.Event('pause'));};
  w.Image=class {constructor(){this.width=1536;this.height=1024;}set src(value){this._src=value;Promise.resolve().then(()=>brokenAssets?this.onerror?.():this.onload?.());}get src(){return this._src;}};
  w.setTimeout=(fn,ms)=>{timers.push({fn,ms});return timers.length;};w.clearTimeout=()=>{};
  w.requestAnimationFrame=fn=>{const id=++rafId;raf.set(id,fn);return id;};w.cancelAnimationFrame=id=>raf.delete(id);
  w.Blob=Blob;w.URL.createObjectURL=blob=>{download=blob;return 'blob:demo-test';};w.URL.revokeObjectURL=()=>{};
  if(legacyMotion)w.localStorage.setItem('wg.motion.v1',legacyMotion);
  if(savedMotion)w.localStorage.setItem('wg.accessibility.motion.v2',savedMotion);
  if(storage)w.localStorage.setItem('wg.showroom.order.v1',JSON.stringify(storage));
  w.eval(fs.readFileSync(path.join(root,'dist/catalog.js'),'utf8'));w.eval(renderer);w.eval(fs.readFileSync(path.join(root,'dist/hero.js'),'utf8'));w.eval(app);
  return {w,q,click:s=>{assert(q(s),'Missing '+s);q(s).click();},download:()=>download,
    visibility:visible=>visibleCallback([{isIntersecting:visible}]),
    tabVisibility:hidden=>{Object.defineProperty(w.document,'hidden',{configurable:true,value:hidden});w.document.dispatchEvent(new w.Event('visibilitychange'));},
    step:stamp=>{virtualNow=100000+stamp;const todo=[...raf.values()];raf.clear();for(const fn of todo)fn(stamp);},
    flush:async()=>{let guard=0;do{if(timers.length){assert(guard++<50,'Timer overflow');timers.shift().fn();}await new Promise(resolve=>setImmediate(resolve));}while(timers.length);},
    ready:()=>w.wgDelivery.ready, close:()=>{w.wgDelivery?.pause();w.gsap?.ticker.sleep();w.close();}};
}
(async()=>{
const data=JSON.parse(fs.readFileSync(path.join(root,'catalog/products.json'),'utf8'));
assert.equal(data.length,97);assert.equal(data.filter(p=>p.category==='Apparel').length,69);assert.equal(data.filter(p=>p.category==='Accessories').length,28);
for(const p of data){assert(!p.id.startsWith('demo-'));assert(p.image.includes('/catalog/studio/'));assert(fs.existsSync(path.join(root,'dist',p.image)));assert(fs.existsSync(path.join(root,'dist',p.sourceImage)));if(p.backImage)assert(fs.existsSync(path.join(root,'dist',p.backImage)));assert(!p.departments.includes('kids'));}
for(const mode of ['campaign','studio','linesheet']){
 const t=setup({mode}),{w,q,click}=t;await t.ready();
 assert.equal(q('#match-count').textContent,'97 PIECES');assert.equal(q('#campaign').hidden,mode!=='campaign');assert.equal(q('#studio').hidden,mode!=='studio');assert.equal(w.document.querySelectorAll('video').length,1);
 assert.equal(w.WGCatalog.length,97);assert.equal(q('#delivery-scene').dataset.engine,'video');assert.equal(q('#campaign').querySelectorAll('canvas').length,0);assert.equal(q('#campaign').querySelectorAll('video').length,1);assert.equal(q('#delivery-video').querySelector('source').hasAttribute('src'),mode==='campaign');assert.equal(q('#delivery-scene').dataset.ready,'true');assert(!q('#products').textContent.includes('DEMO'));
 for(const floor of ['men','women','kids']){
  click('[data-floor="'+floor+'"]');assert(q('#elevator').classList.contains('is-travelling'));assert.equal(q('main').inert,true);
  if(floor==='kids')assert(q('#lift-preview').textContent.includes('Awaiting confirmed'));else assert.equal(q('#lift-preview').querySelectorAll('figure').length,2);
  await t.flush();assert.equal(q('#collection').dataset.department,floor);assert(!q('main').inert);assert(!q('#elevator').classList.contains('is-travelling'));assert.equal(w.document.activeElement.id,'collection-title');
  assert.equal(q('#match-count').textContent,floor==='kids'?'00 PIECES':'69 PIECES');
  if(floor==='kids'){assert.equal(q('#products').querySelectorAll('[data-open]').length,0);assert(q('#department-wardrobe').textContent.includes('confirmed'));}
  else{assert.equal(q('#department-wardrobe').querySelectorAll('[data-open]').length,2);assert(q('#department-wardrobe img').src.includes('/catalog/studio/'));}
  click('[data-filter="Accessories"]');assert.equal(q('#collection').dataset.department,'all');assert.equal(q('#match-count').textContent,'28 PIECES');
 }
 // Preserve category access without inventing missing Tech or Fragrance goods.
 for(const category of ['Fragrance','Tech']){click('[data-filter="'+category+'"]');assert.equal(q('#match-count').textContent,'00 PIECES');assert(q('#products').textContent.includes('No supplied products'));}
 click('[data-family="Headwear"]');assert.equal(q('#match-count').textContent,'26 PIECES');click('[data-family="Trousers"]');assert.equal(q('#match-count').textContent,'08 PIECES');click('[data-filter="All"]');
 click('[data-open="sailor-bear-knit-ivory"]');assert(q('#product-dialog').open);assert(q('#pd-photo').src.endsWith('/studio/sailor-bear-knit-ivory.webp'));
 click('[data-action="alternate"]');assert(q('#pd-photo').src.endsWith('/source/source-01.jpg'));assert(q('#pd-image-note').textContent.includes('Original photo'));assert(q('#pd-source').href.endsWith('/source/source-01.jpg'));
 click('[data-action="detail"]');assert(q('.zoom-area').classList.contains('zoomed'));click('[data-action="add"]');
 click('[data-open="bear-rider-hoodie-ivory"]');assert(!q('[data-action="back"]').hidden);click('[data-action="back"]');assert(q('#pd-photo').src.endsWith('bear-rider-hoodie-ivory-back.webp'));assert.equal(q('#pd-frame').textContent,'04 / 04');q('#pd-qty').value=12;click('[data-action="add"]');
 click('[data-action="bag"]');assert(q('#bag-body').textContent.includes('Sailor Bear Knit'));assert(q('#bag-body').textContent.includes('Bear Rider Hoodie'));assert.equal(JSON.parse(w.localStorage.getItem('wg.showroom.order.v1'))['bear-rider-hoodie-ivory'],12);
 click('[data-action="export-bag"]');const csv=await t.download().text();const rows=csv.replace(/^\uFEFF/,'').split('\r\n');assert.equal(rows[0].split(',').length,9);assert.equal(rows[1].split(',').length,9);assert(csv.includes('"Unisex","Apparel","Knitwear"'));assert(csv.includes('Availability unconfirmed'));assert(csv.includes('source-')===false);assert(csv.includes('"12"'));click('#bag-dialog .close');
 click('[data-open="wg-signature-hoodie"]');assert(q('[data-action="add"]').disabled);assert(q('.order-controls').hidden);click('#product-dialog .close');
 click('[data-floor="kids"]');await t.flush();click('[data-action="search"]');q('#search-input').value='sailor';q('#search-input').dispatchEvent(new w.Event('input'));assert.equal(q('#search-matches').querySelectorAll('[data-open]').length,1);q('#search-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(q('#collection').dataset.department,'all');assert.equal(q('#match-count').textContent,'01 PIECE');
 assert.equal(q('#campaign').querySelectorAll('[data-action^="film-"],.film-controls,input[type="range"],#delivery-replay-overlay').length,0);
 q('#reduced-motion').checked=true;q('#reduced-motion').dispatchEvent(new w.Event('change'));assert(w.WGPreferences.reducedMotion);assert(w.wgDelivery.paused);assert.equal(w.wgDelivery.currentTime,0);
 click('[data-floor="kids"]');assert.equal(q('#match-count').textContent,'00 PIECES');assert(!q('#elevator').classList.contains('is-travelling'));assert(!q('main').inert);
 q('#reduced-motion').checked=false;q('#reduced-motion').dispatchEvent(new w.Event('change'));assert(!w.WGPreferences.reducedMotion);assert.equal(w.wgDelivery.paused,mode!=='campaign');
 console.log(mode+': source catalog, 3 floors, category/style filters, source/back views, bag/CSV, passive continuous hero, reduced motion PASS');t.close();
}
// A separate, accessible lift layer must always release the underlying showroom.
const escapeRide=setup();await escapeRide.ready();
assert.equal(escapeRide.q('#elevator').parentElement,escapeRide.w.document.body);
escapeRide.click('[data-floor="men"]');
assert.equal(escapeRide.q('#elevator').getAttribute('aria-hidden'),'false');
assert(!escapeRide.q('#elevator').inert);assert.equal(escapeRide.w.document.activeElement,escapeRide.q('.lift-skip'));
const tabDuringRide=new escapeRide.w.KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true});escapeRide.w.document.dispatchEvent(tabDuringRide);assert(tabDuringRide.defaultPrevented);assert.equal(escapeRide.w.document.activeElement,escapeRide.q('.lift-skip'));
escapeRide.click('[data-floor="women"]');assert.equal(escapeRide.q('#elevator').dataset.destination,'men');
escapeRide.w.document.dispatchEvent(new escapeRide.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await escapeRide.flush();
assert.equal(escapeRide.q('#collection').dataset.department,'men');assert(!escapeRide.q('main').inert);assert(!escapeRide.w.document.body.classList.contains('lift-active'));assert.equal(escapeRide.q('#elevator').getAttribute('aria-hidden'),'true');
escapeRide.click('[data-floor="kids"]');escapeRide.click('[data-action="skip-lift"]');await escapeRide.flush();assert.equal(escapeRide.q('#collection').dataset.department,'kids');assert(escapeRide.q('#floor-announcement').textContent.includes('await confirmation'));escapeRide.close();
const motionRide=setup();await motionRide.ready();motionRide.click('[data-floor="women"]');motionRide.w.WGPreferences.setReducedMotion(true);await motionRide.flush();assert.equal(motionRide.q('#collection').dataset.department,'women');assert(!motionRide.q('main').inert);assert(!motionRide.q('#elevator').classList.contains('is-travelling'));motionRide.close();
const hiddenRide=setup();await hiddenRide.ready();hiddenRide.click('[data-floor="men"]');hiddenRide.tabVisibility(true);await hiddenRide.flush();assert(!hiddenRide.q('main').inert);assert.equal(hiddenRide.q('#collection').dataset.department,'men');hiddenRide.close();
const failedRide=setup({brokenAssets:true});await failedRide.ready();failedRide.click('[data-floor="women"]');await failedRide.flush();assert.equal(failedRide.q('#match-count').textContent,'69 PIECES');assert(!failedRide.q('main').inert);failedRide.close();
const icons=setup();await icons.ready();for(const selector of ['.floor-buttons b','.arrows button','.lift-indicator i','.hero-collection-link'])assert(icons.q(selector).querySelector('svg.wg-icon path'));assert(!/[↗↑↓←→]/.test(icons.w.document.body.textContent));assert(!icons.q('.floor-intro').textContent.includes('CONCEPT'));icons.close();
console.log('Lift: real body layer, preload failures, busy re-entry, Escape/skip, mid-ride motion changes and visibility cleanup PASS; vector arrows PASS');
const os=setup({reduced:true});await os.ready();assert(os.w.wgDelivery.paused);assert.equal(os.w.wgDelivery.currentTime,0);assert(os.q('#reduced-motion').checked);os.q('#reduced-motion').checked=false;os.q('#reduced-motion').dispatchEvent(new os.w.Event('change'));assert(!os.w.WGPreferences.reducedMotion);assert(os.w.document.body.classList.contains('full-motion'));os.click('[data-floor="men"]');await os.flush();os.w.localStorage.setItem('wg.accessibility.motion.v2','reduced');os.w.dispatchEvent(new os.w.StorageEvent('storage',{key:'wg.accessibility.motion.v2'}));assert(os.q('#reduced-motion').checked);os.close();
const link=setup({floor:'women',mode:'studio'});await link.ready();assert.equal(link.q('#match-count').textContent,'69 PIECES');link.close();
const broken=setup({brokenAssets:true});await broken.ready();assert(broken.w.wgDelivery.error);assert(broken.q('#dispatch-loading').textContent.includes('unavailable'));assert.equal(broken.q('#match-count').textContent,'97 PIECES');broken.close();
const stored=setup({storage:{'sailor-bear-knit-ivory':20,'box-beanie-30':10,hoodie:10,'demo-kids-knit':5,'wg-signature-hoodie':100}});await stored.ready();stored.click('[data-action="bag"]');assert(stored.q('#bag-body').textContent.includes('Sailor Bear Knit'));assert(stored.q('#bag-body').textContent.includes('Box Logo Beanie'));assert(!stored.q('#bag-body').textContent.includes('Essential Pullover'));assert(!stored.q('#bag-body').textContent.includes('Signature Hoodie'));stored.close();
for(const filename of ['index.html','brand.html','motion-proof.html','sources.html']){
 const source=fs.readFileSync(path.join(root,'dist',filename),'utf8');for(const m of source.matchAll(/(?:src|href)="((?:assets\/[^"?#]+)|(?:[^"?#]+\.(?:css|js|html)))(?:\?[^"\s]*)?"/g))assert(fs.existsSync(path.join(root,'dist',m[1])),'Missing asset '+m[1]);assert.equal(source.includes('<video'),filename==='index.html','Only the main campaign uses the supplied film');
}
for(const file of ['logo-primary','logo-stacked','logo-gold','logo-black','logo-white','brand-symbol','brand-symbol-gold']){const svg=fs.readFileSync(path.join(root,'dist/assets',file+'.svg'),'utf8');assert(!/<(?:image|text|foreignObject)\b/.test(svg));}
const movie=setup();await movie.ready();const hero=movie.w.wgDelivery,video=movie.q('#delivery-video');
assert(!hero.paused);assert(movie.q('.hero-film-poster').hidden);assert(video.muted&&video.defaultMuted&&video.loop&&video.autoplay&&video.playsInline);assert(!video.controls);assert.equal(video.getAttribute('tabindex'),'-1');assert(!movie.q('.dispatch-copy').inert);assert.equal(video._loads,1);assert(video.querySelector('source').src.endsWith('/assets/wholesale-gods-arrival.mp4'));
for(let cycle=0;cycle<3;cycle++){hero.currentTime=31.375;video.dispatchEvent(new movie.w.Event('ended'));assert.equal(hero.currentTime,0);assert(!hero.paused);assert.equal(video._loads,1);}
hero.currentTime=8.5;movie.visibility(false);assert(hero.paused);movie.visibility(true);assert(!hero.paused);assert.equal(hero.currentTime,8.5);movie.tabVisibility(true);assert(hero.paused);movie.tabVisibility(false);assert(!hero.paused);
movie.w.WGPreferences.setReducedMotion(true);assert(hero.paused);assert(!movie.q('.hero-film-poster').hidden);assert.equal(movie.q('#delivery-scene').dataset.playback,'reduced');movie.w.WGPreferences.setReducedMotion(false);assert(!hero.paused);movie.close();
const blockedMovie=setup({rejectAutoplay:true});await blockedMovie.ready();assert(blockedMovie.w.wgDelivery.paused);assert(!blockedMovie.q('.hero-film-poster').hidden);assert(!blockedMovie.w.wgDelivery.error);assert.equal(blockedMovie.q('#match-count').textContent,'97 PIECES');await blockedMovie.flush();assert.equal(blockedMovie.q('#delivery-video')._plays,4);blockedMovie.close();
const reducedFilm=setup({reduced:true});await reducedFilm.ready();assert(!reducedFilm.q('#delivery-video source').hasAttribute('src'));assert.equal(reducedFilm.q('#delivery-video')._loads,undefined);assert(!reducedFilm.q('.hero-film-poster').hidden);reducedFilm.close();
const pending=setup({deferredPlayback:true});await new Promise(resolve=>setImmediate(resolve));pending.visibility(false);pending.q('#delivery-video').resolvePlayback();await pending.ready();assert(pending.w.wgDelivery.paused);assert(!pending.q('.hero-film-poster').hidden);pending.close();
const interrupted=setup({rejectFirst:1});await interrupted.ready();assert(interrupted.w.wgDelivery.paused);await interrupted.flush();assert(!interrupted.w.wgDelivery.paused);assert(interrupted.q('.hero-film-poster').hidden);assert.equal(interrupted.q('#delivery-video')._plays,2);interrupted.close();
const readyAgain=setup({rejectFirst:1});await readyAgain.ready();readyAgain.q('#delivery-video').dispatchEvent(new readyAgain.w.Event('canplay'));await readyAgain.flush();assert(!readyAgain.w.wgDelivery.paused);assert.equal(readyAgain.q('#delivery-video')._plays,2);readyAgain.close();
const concurrent=setup({deferredPlayback:true});await new Promise(resolve=>setImmediate(resolve));concurrent.q('#delivery-video').dispatchEvent(new concurrent.w.Event('loadeddata'));concurrent.q('#delivery-video').dispatchEvent(new concurrent.w.Event('canplay'));concurrent.visibility(true);assert.equal(concurrent.q('#delivery-video')._plays,1);concurrent.q('#delivery-video').resolvePlayback();await concurrent.ready();assert(!concurrent.w.wgDelivery.paused);concurrent.close();
const legacy=setup({legacyMotion:'reduced'});await legacy.ready();assert(!legacy.w.wgDelivery.paused);assert(!legacy.q('#reduced-motion').checked);assert.equal(legacy.q('#campaign').querySelectorAll('input,button').length,0);assert(legacy.q('footer #reduced-motion'));legacy.q('#delivery-video').pause();legacy.w.dispatchEvent(new legacy.w.Event('pageshow'));assert(!legacy.w.wgDelivery.paused);legacy.close();
const saved=setup({savedMotion:'reduced'});await saved.ready();assert(saved.w.wgDelivery.paused);assert(saved.q('#reduced-motion').checked);saved.close();
const filmBytes=fs.readFileSync(path.join(root,'dist/assets/wholesale-gods-arrival.mp4'));let offset=0,boxes=[];while(offset+8<=filmBytes.length){const size=filmBytes.readUInt32BE(offset);assert(size>=8);boxes.push(filmBytes.toString('ascii',offset+4,offset+8));offset+=size;}assert(boxes.indexOf('moov')>=0&&boxes.indexOf('moov')<boxes.indexOf('mdat'),'MP4 must be fast-start');assert(fs.existsSync(path.join(root,'dist/assets/wholesale-gods-arrival-poster.jpg')));
console.log('Automatic startup: interrupted-request retry, readiness recovery, concurrent request deduplication, pageshow resume, legacy review settings and footer accessibility PASS');
console.log('Native film: autoplay/muted/inline/loop, no controls, full-frame media, visibility resume, reduced-motion, autoplay rejection, delayed-play races and fast-start asset PASS');
const inventory=JSON.parse(fs.readFileSync(path.join(root,'catalog/sources.json'),'utf8'));assert.equal(inventory.length,52);assert(inventory.every(s=>s.status&&s.note));assert.equal(inventory.filter(s=>s.status==='Reference board').length,1);
const grouped=setup({source:'47'});await grouped.ready();assert.equal(grouped.q('#match-count').textContent,'15 PIECES');assert(grouped.q('#query-note').textContent.includes('source 47'));grouped.click('[data-action="clear-query"]');assert.equal(grouped.q('#match-count').textContent,'97 PIECES');grouped.close();
const sourcePage=new JSDOM(fs.readFileSync(path.join(root,'dist/sources.html'),'utf8'),{url:'http://localhost:4173/sources.html',runScripts:'outside-only'});sourcePage.window.eval(fs.readFileSync(path.join(root,'dist/source-data.js'),'utf8'));sourcePage.window.eval(fs.readFileSync(path.join(root,'dist/source-library.js'),'utf8'));assert.equal(sourcePage.window.document.querySelectorAll('.source-card').length,52);sourcePage.window.document.querySelector('[data-status="Reference board"]').click();assert.equal(sourcePage.window.document.querySelectorAll('.source-card').length,1);sourcePage.window.document.querySelector('[data-status="Individual pieces prepared"]').click();assert.equal(sourcePage.window.document.querySelectorAll('.source-card').length,43);assert(sourcePage.window.document.querySelector('.piece-link').href.includes('source='));sourcePage.window.close();
console.log('All 52 sources accounted for; staged image paths, OS/saved motion, deep links, asset failure, cart migration and SVG independence PASS');
})().catch(error=>{console.error(error);process.exitCode=1;});
