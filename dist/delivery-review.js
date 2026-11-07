'use strict';
const get=s=>document.querySelector(s),delivery=new WGDispatch(get('#dispatch-canvas'));
window.wgDelivery=delivery;
function update(){const playing=!delivery.paused&&!delivery.ended,replay=get('#delivery-replay-overlay');replay.hidden=playing;replay.querySelector('b').textContent=WGDispatch.reducedMotion?'Enable motion & play':delivery.ended?'Replay delivery ↻':'Play delivery sequence ▷';get('#film-stage').classList.toggle('is-paused',!playing);get('#film-stage').classList.toggle('is-ended',delivery.ended);get('#play').textContent=WGDispatch.reducedMotion?'Delivery summary':delivery.ended?'↺ Replay':delivery.paused?'▷ Play':'Ⅱ Pause';get('#play').setAttribute('aria-label',get('#play').textContent);get('#seek').value=delivery.currentTime;get('#time').textContent='00:'+String(Math.floor(delivery.currentTime)).padStart(2,'0');get('#seek').setAttribute('aria-valuetext',delivery.currentTime.toFixed(1)+' seconds: '+WGDispatch.sceneAt(delivery.currentTime).label);}
['timeupdate','play','pause','ended','motionchange'].forEach(event=>delivery.addEventListener(event,update));
get('#play').onclick=()=>delivery.paused?delivery.play():delivery.pause();get('#replay').onclick=()=>{delivery.currentTime=0;delivery.play();};
get('#seek').oninput=event=>{delivery.pause();delivery.currentTime=Number(event.target.value);};
get('#fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else get('#film-stage').requestFullscreen?.().catch(()=>{});};
function motion(){get('#reduced-motion').checked=WGDispatch.reducedMotion;document.body.classList.toggle('reduce-motion',WGDispatch.reducedMotion);document.body.classList.toggle('full-motion',!WGDispatch.reducedMotion);get('#motion-note').textContent=WGDispatch.reducedMotion?'Static summary. Scrub to inspect individual moments.':'A quiet moment, in motion.';update();}
get('#reduced-motion').onchange=event=>WGDispatch.setReducedMotion(event.target.checked);window.addEventListener('wg-motion-change',motion);motion();
get('.chapters').innerHTML=WGDispatch.chapters.map(c=>'<button data-time="'+c.time+'"><small>00:'+String(Math.floor(c.time)).padStart(2,'0')+'</small>'+c.label+'</button>').join('');
get('.chapters').addEventListener('click',event=>{const button=event.target.closest('button');if(button){delivery.pause();delivery.currentTime=Number(button.dataset.time);if(!WGDispatch.reducedMotion)delivery.play();}});
delivery.addEventListener('scenechange',event=>get('#scene').textContent=event.detail.label.toUpperCase());
delivery.ready.then(()=>{if(delivery.error)get('#dispatch-loading').textContent='Delivery assets could not load. Please refresh to retry.';else{get('#dispatch-loading').hidden=true;if(!WGDispatch.reducedMotion)delivery.play();}});

get('#delivery-replay-overlay').onclick=()=>{if(WGDispatch.reducedMotion)WGDispatch.setReducedMotion(false);delivery.currentTime=0;delivery.play();};
