/* Explicit accessibility preference for the film and showroom elevators. */
(function(root){
 'use strict';
 // The old campaign-review toggle is not an accessibility choice for this film.
 // Default to the OS preference until the visitor uses the footer setting.
 const key='wg.accessibility.motion.v2',system=root.matchMedia?.('(prefers-reduced-motion: reduce)');
 class MotionPreferences{
  static get reducedMotion(){try{const value=root.localStorage.getItem(key);if(value!==null)return value==='reduced';}catch{}return !!system?.matches;}
  static setReducedMotion(reduced){try{root.localStorage.setItem(key,reduced?'reduced':'full');}catch{}notify();}
 }
 function notify(){const reduced=MotionPreferences.reducedMotion;document.body.classList.toggle('reduce-motion',reduced);document.body.classList.toggle('full-motion',!reduced);root.dispatchEvent(new CustomEvent('wg-motion-change',{detail:{reduced}}));}
 root.WGPreferences=MotionPreferences;
 root.addEventListener('storage',event=>{if(event.key===key||event.key===null)notify();});
 system?.addEventListener?.('change',()=>{let saved=null;try{saved=root.localStorage.getItem(key);}catch{}if(saved===null)notify();});
})(window);
