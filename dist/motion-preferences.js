/* Shared motion preference for the GSAP hero and showroom elevators. */
(function(root){
 'use strict';
 const key='wg.motion.v1',system=root.matchMedia?.('(prefers-reduced-motion: reduce)');
 class MotionPreferences{
  static get reducedMotion(){try{const value=root.localStorage.getItem(key);if(value!==null)return value==='reduced';}catch{}return !!system?.matches;}
  static setReducedMotion(reduced){try{root.localStorage.setItem(key,reduced?'reduced':'full');}catch{}notify();}
 }
 function notify(){const reduced=MotionPreferences.reducedMotion;document.body.classList.toggle('reduce-motion',reduced);document.body.classList.toggle('full-motion',!reduced);root.dispatchEvent(new CustomEvent('wg-motion-change',{detail:{reduced}}));}
 root.WGPreferences=MotionPreferences;
 root.addEventListener('storage',event=>{if(event.key===key||event.key===null)notify();});
 system?.addEventListener?.('change',()=>{let saved=null;try{saved=root.localStorage.getItem(key);}catch{}if(saved===null)notify();});
})(window);
