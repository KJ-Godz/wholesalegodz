'use strict';
const sources=window.WGSourceLibrary||[],grid=document.querySelector('#source-grid');
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function render(status='all'){
 const items=sources.filter(s=>status==='all'||s.status===status);
 document.querySelector('#source-count').textContent=items.length+' supplied files';
 grid.innerHTML=items.map(s=>'<article class="source-card"><a href="'+s.image+'" target="_blank" rel="noreferrer" aria-label="Open original source '+s.number+'"><img loading="lazy" src="'+s.image+'" alt="Supplied photograph '+s.number+'"></a><h2>Source '+String(s.number).padStart(2,'0')+'</h2><span class="status">'+escapeHTML(s.status.toUpperCase())+'</span><p>'+escapeHTML(s.note)+'</p><span class="name">'+escapeHTML(s.name)+'</span>'+(s.products.length?'<a class="piece-link" href="/?rev=05&source='+s.number+'#collection">View '+s.products.length+' prepared piece'+(s.products.length===1?'':'s')+' <svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 19 19 5M5 5h14v14\"/></svg></a>':'')+'</article>').join('');
 document.querySelectorAll('[data-status]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.status===status)));
}
document.querySelector('nav').addEventListener('click',event=>{const b=event.target.closest('[data-status]');if(b)render(b.dataset.status);});render();
