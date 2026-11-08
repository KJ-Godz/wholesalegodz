"use strict";

const catalog = window.WGCatalog || [];
let currentFloor="all";
const get = selector => document.querySelector(selector);
const all = selector => [...document.querySelectorAll(selector)];
const num = n => String(n).padStart(2,"0");
const imagePath = p => p.image;
const piece = id => catalog.find(p => p.id === id);
const categories = ["All","Apparel","Accessories","Fragrance","Tech"];
const views = ["campaign","studio","linesheet"];
const requested = new URLSearchParams(location.search).get("view");
const view = views.includes(requested) ? requested : "campaign";
const storageKey = "wg.showroom.order.v1";
let category = "All", family = "All", sourceNumber = null, query = "", study = 0, selected, detailTrigger, toastTimer;
function units(value) { const n = Number(value); return Number.isInteger(n) && n > 0 && n <= 99999; }
function tier(n) { return n >= 200 ? "Enterprise" : n >= 50 ? "Growth" : n >= 10 ? "Starter" : "Below starter tier"; }
function readOrder() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return Object.fromEntries(catalog.filter(p => !p.referenceOnly && units(stored?.[p.id])).map(p => [p.id, Number(stored[p.id])]));
  } catch { return {}; }
}
let order = readOrder();
function badge() {
  const n = Object.keys(order).length;
  get("#bag-count").textContent = num(n);
  get(".bag-tool").setAttribute("aria-label","Open buyer bag, " + n + " selected styles");
}
function save() {
  try { localStorage.setItem(storageKey,JSON.stringify(order)); } catch {}
  badge();
}
function matches(p,text) {
  const index = [p.name,p.color,p.category,p.family,p.department||"",p.ref].join(" ").toLowerCase();
  return text.trim().toLowerCase().split(/\s+/).every(word => index.includes(word));
}
function results() { return catalog.filter(p => (currentFloor === "all" || p.departments.includes(currentFloor)) && (category === "All" || p.category === category) && (family === "All" || p.family === family) && (sourceNumber===null || p.sourceNumber===sourceNumber || p.supportingSourceNumber===sourceNumber) && matches(p,query)); }
function thumb(p,lazy=true) {
  return '<img src="' + imagePath(p) + '" alt="' + p.name + ' in ' + p.color + '"' + (lazy ? ' loading="lazy"' : '') + '>';
}
function card(p) {
  return '<article class="card"><button data-open="' + p.id + '" aria-label="Inspect ' + p.name + '"><span class="card-img"><span class="card-no">' + (p.referenceOnly?"DESIGN REFERENCE":"STUDIO EDIT") + '</span>' + thumb(p,true) + '<span class="card-plus" aria-hidden="true">+</span></span><span class="card-caption"><span class="card-title">' + p.name + '</span><span class="card-category">' + p.family + '</span></span><span class="card-finish"><i class="swatch" style="background:' + p.swatch + '"></i>' + p.color + '</span></button></article>';
}
function sheet(items) {
  const rows = items.map(p => '<tr><td><button class="line-item" data-open="' + p.id + '">' + thumb(p,true) + '<span><span class="line-title">' + p.name + '</span><span class="line-sub">' + p.color + '</span></span></button></td><td class="hide-small line-ref">' + p.ref + '</td><td class="hide-small">' + p.category + '</td><td><button class="row-add" data-quick="' + p.id + '" aria-label="Add ten units of ' + p.name + '">+ 10 units</button></td></tr>').join("");
  return '<table class="sheet"><thead><tr><th scope="col">Piece / finish</th><th scope="col" class="hide-small">Item number</th><th scope="col" class="hide-small">Department</th><th scope="col">Buyer bag</th></tr></thead><tbody>' + rows + '</tbody></table>';
}
function render() {
  const items = results();
  get("#filters").innerHTML = categories.map(c => '<button data-filter="' + c + '" aria-pressed="' + (c===category) + '">' + (c==="All"?"All wholesale":c) + '</button>').join("");
  get("#family-filters").innerHTML=["All",...new Set(catalog.map(p=>p.family))].map(f=>'<button data-family="'+f+'" aria-pressed="'+(f===family)+'">'+(f==="All"?"All styles":f)+'</button>').join("");
  get("#match-count").textContent = num(items.length) + (items.length===1?" PIECE":" PIECES");
  get("#query-strip").hidden = !query && sourceNumber===null;
  get("#query-note").textContent = query?"Search results for “"+query+"”":"Prepared pieces from source "+num(sourceNumber);
  const host = get("#products");
  host.className = items.length && view!=="linesheet" ? "gallery" : "";
  host.innerHTML = !items.length ? '<p class="empty">'+(currentFloor==="kids"?"Children’s collection awaits confirmed items and sizes.":category!=="All"?"No supplied products match this category yet.":"No matching pieces.")+' <button class="under" data-action="reset">Browse all supplied pieces</button></p>' : view==="linesheet" ? sheet(items) : items.map(card).join("");
}
function renderStudy() {
  const p = catalog[study];if(!p)return;
  get("#study-count").textContent = num(study+1) + " / " + num(catalog.length);
  get("#study-image").src = imagePath(p);
  get("#study-image").alt = p.name + " in " + p.color;
  get("#study-name").textContent = p.name;
  get("#study-cat").textContent = p.category + " / " + p.color;
  get(".study-image-button").setAttribute("aria-label","Inspect " + p.name);
}
function popup(id, focus) {
  const dialog = get(id);
  const old = get("dialog[open]");
  if (old && old!==dialog) old.close();
  if (!dialog.open) dialog.showModal();
  dialog.querySelector(focus)?.focus();
}
function zoom(yes) {
  get(".zoom-area").classList.toggle("zoomed",yes);
  get(".zoom-area").setAttribute("aria-label",yes?"Show full piece":"Inspect detail crop");
  get("#pd-frame").textContent = yes?"02 / 02":"01 / 02";
  get('[data-action="detail"]').setAttribute("aria-pressed",String(yes));
  get('[data-action="full"]').setAttribute("aria-pressed",String(!yes));
}
function productTier() {
  const n = get("#pd-qty").value;
  get("#pd-tier").textContent = units(n) ? tier(Number(n)) + " · " + Number(n) + " requested units" : "Enter a whole number from 1 to 99,999.";
}
function openProduct(id,trigger) {
  selected=piece(id);
  if (!selected) return;
  detailTrigger=trigger?.closest("dialog") ? get(".search-tool") : trigger;
  const p=selected;
  get("#pd-photo").src=imagePath(p);
  get("#pd-photo").alt=p.name + ", " + p.color;
  get("#pd-category").textContent="UNISEX / "+p.family+" / "+(p.referenceOnly?"DESIGN REFERENCE":"SUPPLIED COLLECTION");
  get("#pd-name").textContent=p.name;
  get("#pd-ref").textContent="SHOWROOM REF / "+p.ref;
  get("#pd-desc").textContent=p.detail;
  get("#pd-color").textContent=p.color;
  get("#pd-swatch").style.background=p.swatch;
  get("#pd-qty").value=10;
  get('[data-action="add"]').disabled=!!p.referenceOnly;
  get(".order-controls").hidden=!!p.referenceOnly;
  get("#pd-source").href=p.sourceImage;
  get("#pd-image-note").textContent=p.referenceOnly?"Supplied design reference; manufacturing is unconfirmed.":"Studio image re-staged from your supplied photo. Use Original photo to compare the exact artwork.";
  showFrame(0); productTier(); popup("#product-dialog",".close");
}
function toast(message) {
  clearTimeout(toastTimer);
  get("#toast").textContent=message;
  get("#toast").classList.add("shown");
  toastTimer=setTimeout(()=>get("#toast").classList.remove("shown"),2500);
}
function add(id,n) {
  if(!piece(id) || piece(id).referenceOnly){toast("This is a design reference, not confirmed stock.");return false;}
  if (!units(n) || (order[id]||0)+n>99999) { toast("Use up to 99,999 units per piece."); return false; }
  order[id]=(order[id]||0)+n; save(); return true;
}
function searchMatches() {
  const list=catalog.filter(p=>matches(p,get("#search-input").value));
  get("#search-matches").innerHTML=list.length ? list.map(p=>'<button class="mini-row" data-open="'+p.id+'">'+thumb(p)+'<span><span class="mini-name">'+p.name+'</span><small>'+p.ref+' · '+p.color+'</small></span><span class="go"><svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 19 19 5M5 5h14v14\"/></svg></span></button>').join("") : '<p class="empty">No matches. Try another name, color or item number.</p>';
}
function bag() {
  const items=catalog.filter(p=>order[p.id]);
  if (!items.length) {
    get("#bag-body").innerHTML='<p class="empty">Your bag is empty. Choose a piece to begin a selection request.</p><button class="button dark-btn" data-action="browse">Browse the goods <span><svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 19 19 5M5 5h14v14\"/></svg></span></button>'; return;
  }
  const total=items.reduce((sum,p)=>sum+order[p.id],0);
  get("#bag-body").innerHTML=items.map(p=>'<div class="mini-row bag-row">'+thumb(p)+'<div class="row-body"><span class="mini-name">'+p.name+'</span><small>'+p.color+'</small><button class="remove" data-remove="'+p.id+'" aria-label="Remove '+p.name+'">Remove</button></div><label class="bag-edit"><input type="number" min="1" max="99999" required step="1" value="'+order[p.id]+'" data-qty="'+p.id+'" aria-label="Quantity for '+p.name+'"> units</label></div>').join("")+'<div class="bag-summary"><div><span>Total units</span><strong>'+total.toLocaleString("en-US")+'</strong></div><div><span>Selection size</span><strong>'+tier(total)+'</strong></div><button class="button dark-btn" data-action="export-bag">Download selection request <span><svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 4v16M5 13l7 7 7-7\"/></svg></span></button><button class="text-link" data-action="preview-dispatch">View the delivery campaign <span><svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 19 19 5M5 5h14v14\"/></svg></span></button><p>The CSV records your selection request. Sizes, final pricing and stock require confirmation.</p></div>';
}
function exportCSV(isOrder) {
  const items=isOrder?catalog.filter(p=>order[p.id]):results();
  if(!items.length){toast("No goods to export.");return;}
  const header=["Item number","Name","Department","Category","Style","Finish","Status","Source photo"];
  if(isOrder)header.push("Requested units");
  const rows=items.map(p=>{const row=[p.ref,p.name,"Unisex",p.category,p.family,p.color,p.referenceOnly?"Design reference":"Availability unconfirmed",p.sourceName]; if(isOrder)row.push(order[p.id]);return row;});
  const csv=[header,...rows].map(row=>row.map(cell=>'"'+String(cell).replace(/"/g,'""')+'"').join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");
  link.href=url;link.download="wholesale-gods-"+(isOrder?"selection-request":"line-sheet")+".csv";document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function browse() { all("dialog[open]").forEach(d=>d.close());get("#collection").scrollIntoView(); }
const film=new WGDeliveryHero(get("#delivery-scene"));
window.wgDelivery=film;
function filmState() {
  get("#film-stage").classList.toggle("is-reduced",WGPreferences.reducedMotion);
}
["motionchange","loadedmetadata"].forEach(type=>film.addEventListener(type,filmState));
function dispatchPreview() {
  all("dialog[open]").forEach(d=>d.close());
  if(view!=="campaign"){location.href="?view=campaign&play=1#campaign";return;}
  get("#campaign").scrollIntoView();
}
const actions={
  close:b=>b.closest("dialog")?.close(),
  search(){get("#search-input").value=query;searchMatches();popup("#search-dialog","input");},
  bag(){bag();popup("#bag-dialog",".close");},browse,
  reset(){setDepartment("all");category="All";family="All";sourceNumber=null;query="";render();},"clear-query"(){query="";sourceNumber=null;render();},
  "study-prev"(){study=(study+catalog.length-1)%catalog.length;renderStudy();},
  "study-next"(){study=(study+1)%catalog.length;renderStudy();},
  "study-open":b=>openProduct(catalog[study].id,b),
  full:()=>zoom(false),detail:()=>zoom(true),zoom:()=>zoom(!get(".zoom-area").classList.contains("zoomed")),
  less(){get("#pd-qty").stepDown();productTier();},more(){get("#pd-qty").stepUp();productTier();},
  add(){const input=get("#pd-qty");if(!units(input.value)){input.reportValidity();input.focus();return;}if(add(selected.id,Number(input.value))){get("#product-dialog").close();toast(input.value+" units added to buyer bag");}},
  "export-sheet":()=>exportCSV(false),"export-bag":()=>exportCSV(true),
  "preview-dispatch":dispatchPreview
};
document.addEventListener("click",event=>{
  const b=event.target.closest("button");if(!b)return;
  const d=b.dataset;
  if(d.filter){if(d.filter!=="Apparel")setDepartment("all");category=d.filter;family="All";sourceNumber=null;render();get('#filters [aria-pressed="true"]').focus({preventScroll:true});}
  else if(d.family){if(currentFloor==="kids")setDepartment("all");family=d.family;sourceNumber=null;category=family==="Headwear"||family==="Socks"?"Accessories":family==="All"?"All":"Apparel";query="";render();get('#family-filters [aria-pressed="true"]').focus({preventScroll:true});}
  else if(d.open)openProduct(d.open,b);
  else if(d.quick){if(add(d.quick,10))toast("10 units added to buyer bag");}
  else if(d.remove){delete order[d.remove];save();bag();}
  else if(d.action && actions[d.action])actions[d.action](b);
});
get("#pd-qty").addEventListener("input",productTier);
get("#bag-body").addEventListener("change",event=>{
  const input=event.target.closest("[data-qty]");if(!input)return;
  if(units(input.value)){order[input.dataset.qty]=Number(input.value);save();bag();}
  else{input.reportValidity();input.value=order[input.dataset.qty];}
});
get("#search-input").addEventListener("input",searchMatches);
get("#search-form").addEventListener("submit",e=>{e.preventDefault();query=get("#search-input").value.trim();setDepartment("all");category="All";family="All";sourceNumber=null;render();browse();});
all("dialog").forEach(d=>d.addEventListener("click",e=>{const r=d.getBoundingClientRect();if(e.target===d&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))d.close();}));
get("#product-dialog").addEventListener("close",()=>{if(detailTrigger?.isConnected&&!get("dialog[open]"))detailTrigger.focus({preventScroll:true});});
window.addEventListener("storage",e=>{if(e.key===storageKey||e.key===null){order=readOrder();badge();if(get("#bag-dialog").open)bag();}});
document.body.classList.add("mode-"+view);
get('[data-mode="'+view+'"]').setAttribute("aria-current","page");
get("#campaign").hidden=view!=="campaign";
get("#film-caption").hidden=view!=="campaign";
get("#studio").hidden=view!=="studio";
if(view==="studio"){document.body.classList.add("studio-mode");renderStudy();document.title="Wholesale Gods — Studio";get("#layout-note").textContent="STUDIO GALLERY";}
if(view==="linesheet"){
  document.body.classList.add("linesheet");document.title="Wholesale Gods — Buyer Line Sheet";
  get("#section-label").textContent="BUYER REFERENCE";const heading=document.createElement("h1");heading.className="line-headline";heading.id="collection-title";heading.innerHTML='The <i>line sheet.</i>';get("#collection-title").replaceWith(heading);
  get("#section-meta").innerHTML="Compare the goods by item number.<br> Add units or download the filtered sheet.";
  get("#catalog-action").dataset.action="export-sheet";get("#catalog-action").innerHTML='<span>Download CSV</span><span><svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 4v16M5 13l7 7 7-7\"/></svg></span>';get("#layout-note").textContent="BUYER INDEX";
}
badge();render();filmState();

let productFrame=0;
function showFrame(frame) {
  const count=selected.backImage?4:3;
  productFrame=(frame+count)%count;
  const source=productFrame===1,detail=productFrame===2,back=productFrame===3;
  get("#pd-photo").src=source?selected.sourceImage:back?selected.backImage:imagePath(selected);
  get("#pd-photo").alt=selected.name+(source?", original supplied photograph":detail?", detail crop":back?", back view":", studio view");
  zoom(detail);
  get('[data-action="alternate"]').hidden=false;
  get('[data-action="back"]').hidden=!selected.backImage;
  get("#pd-frame").textContent=num(productFrame+1)+" / "+num(count);
  for(const [index,action] of ["full","alternate","detail","back"].entries())get('[data-action="'+action+'"]').setAttribute("aria-pressed",String(index===productFrame));
  get("#pd-image-note").textContent=source?"Original photo supplied for this piece. Stock, size and pricing still require confirmation.":selected.referenceOnly?"Supplied design reference; manufacturing is unconfirmed.":"Studio image re-staged from your supplied photo. Compare Original photo for exact artwork.";
}
actions.full=()=>showFrame(0);actions.alternate=()=>showFrame(1);actions.detail=()=>showFrame(2);actions.back=()=>showFrame(3);
actions.zoom=()=>showFrame(productFrame===2?0:2);
const photoArea=get(".zoom-area");
let pressX, pressY, swiped=false;
photoArea.addEventListener("touchstart",e=>{pressX=e.changedTouches[0].clientX;pressY=e.changedTouches[0].clientY;swiped=false;},{passive:true});
photoArea.addEventListener("touchend",e=>{
  const dx=e.changedTouches[0].clientX-pressX,dy=e.changedTouches[0].clientY-pressY;
  if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)){swiped=true;showFrame(productFrame+(dx<0?1:-1));}
},{passive:true});
photoArea.addEventListener("click",e=>{if(swiped){e.stopPropagation();swiped=false;}},true);
get("#product-dialog").addEventListener("keydown",e=>{
  if(e.target.matches("input"))return;
  if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();showFrame(productFrame+(e.key==="ArrowRight"?1:-1));}
});

// Shared garments are unisex, confirmed by the user. Kids awaits confirmed items.
const floorNames={men:["01","Men","Walnut. Bronze. A considered perspective."],women:["02","Women","Champagne. Travertine. A different point of view."],kids:["03","Kids","Sage. Pale oak. Room for discovery."],all:["G","All goods","The complete showroom edit."]};
actions["return-floors"]=()=>{get(".floor-selector").scrollIntoView({block:"start"});get('[data-floor="'+currentFloor+'"]').focus({preventScroll:true});};


const originalHeading=get("#collection-title").innerHTML;
const originalMeta=get("#section-meta").innerHTML;
let elevatorBusy=false, activeRide=null;
const departmentImages=new Map();
function prepareDepartment(floor){
  if(departmentImages.has(floor))return departmentImages.get(floor);
  const ready=Promise.all((floor==="kids"?[]:featuredPieces(floor)).map(p=>new Promise(resolve=>{
    const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=imagePath(p);
  })));
  departmentImages.set(floor,ready);return ready;
}
actions["skip-lift"]=()=>activeRide?.abort();
async function chooseFloor(floor,trigger){
  if(elevatorBusy || !floorNames[floor])return;
  elevatorBusy=true;film.pause();
  const controller=activeRide=new AbortController(),signal=controller.signal;
  const elevator=get("#elevator"),collection=get("#collection"),[number,name]=floorNames[floor];
  const wait=ms=>new Promise(resolve=>{
    if(signal.aborted){resolve();return;}
    const finish=()=>{clearTimeout(timer);signal.removeEventListener("abort",finish);resolve();};
    const timer=setTimeout(finish,ms);signal.addEventListener("abort",finish,{once:true});
  });
  let arrived=false;
  const arrive=()=>{
    if(arrived)return;arrived=true;
    setDepartment(floor);category=floor==="all"?"All":"Apparel";family="All";sourceNumber=null;query="";render();
    get("#collection-title").setAttribute("tabindex","-1");
    collection.scrollIntoView({behavior:"instant",block:"start"});
  };
  const frozen=Array.from(document.body.children).filter(el=>el!==elevator && el.tagName!=="SCRIPT");
  const skipOnKey=event=>{
    if(event.key==="Escape"){event.preventDefault();controller.abort();}
    if(event.key==="Tab"){event.preventDefault();get(".lift-skip").focus({preventScroll:true});}
  };
  const skipOnMotion=()=>{if(WGPreferences.reducedMotion)controller.abort();};
  const skipWhenHidden=()=>{if(document.hidden)controller.abort();};
  document.addEventListener("keydown",skipOnKey);
  document.addEventListener("visibilitychange",skipWhenHidden);
  window.addEventListener("wg-motion-change",skipOnMotion);
  try{
    trigger.setAttribute("aria-busy","true");
    if(WGPreferences.reducedMotion){arrive();return;}
    get("#elevator-floor").textContent=number;get("#elevator-name").textContent=name.toUpperCase();
    get("#lift-destination").textContent=name;
    get("#elevator-progress").textContent=floorNames[currentFloor][0];
    const goingUp=Object.keys(floorNames).indexOf(floor)>Object.keys(floorNames).indexOf(currentFloor);
    const ascending=currentFloor==="all" || (floor!=="all" && goingUp);
    get("#lift-state").textContent=ascending?"ASCENDING":"DESCENDING";
    get(".lift-indicator i").innerHTML=ascending?"<svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 20V4M5 11l7-7 7 7\"/></svg>":"<svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 4v16M5 13l7 7 7-7\"/></svg>";
    elevator.dataset.destination=floor;
    get("#lift-preview").innerHTML=floor==="kids"?'<div class="awaiting-pieces"><strong>The little ones.</strong><p>Awaiting confirmed children’s items and sizes.</p></div>':featuredPieces(floor).map(p=>'<figure>'+thumb(p,false)+'<figcaption>'+p.name+' / '+p.color+'</figcaption></figure>').join("");
    // Preload real department images while the doors close, with a bounded wait.
    const ready=prepareDepartment(floor);
    frozen.forEach(el=>{el.dataset.liftWasInert=String(el.inert);el.inert=true;});
    document.body.classList.add("lift-active");
    elevator.setAttribute("aria-hidden","false");
    elevator.classList.add("is-travelling");
    get(".lift-skip").focus({preventScroll:true});
    await wait(800);
    if(!signal.aborted)elevator.classList.add("is-riding");
    await wait(500);
    await Promise.race([ready,wait(1200)]);
    get("#elevator-progress").textContent=number;get("#lift-state").textContent="ARRIVING";
    // Commit the destination behind fully closed doors; never reveal the old floor.
    arrive();
    await wait(250);
    if(!signal.aborted){elevator.classList.add("is-opening");get("#lift-state").textContent="WELCOME";}
    await wait(900);
    if(!signal.aborted)elevator.classList.add("is-entering");
    await wait(600);
  }finally{
    arrive();controller.abort();activeRide=null;
    document.removeEventListener("keydown",skipOnKey);document.removeEventListener("visibilitychange",skipWhenHidden);window.removeEventListener("wg-motion-change",skipOnMotion);
    elevator.classList.remove("is-travelling","is-riding","is-opening","is-entering");
    elevator.setAttribute("aria-hidden","true");document.body.classList.remove("lift-active");
    frozen.forEach(el=>{if(el.dataset.liftWasInert!==undefined){el.inert=el.dataset.liftWasInert==="true";delete el.dataset.liftWasInert;}});
    trigger.removeAttribute("aria-busy");elevatorBusy=false;
    get("#collection-title").focus({preventScroll:true});
    get("#floor-announcement").textContent="Arrived at "+name+". "+(floor==="kids"?"Children’s items and sizing await confirmation.":"The collection is ready to explore.");
  }
}
document.querySelectorAll("[data-floor]").forEach(button=>button.addEventListener("click",()=>chooseFloor(button.dataset.floor,button)));


const departmentCopy={
  men:{title:"Men.",label:"01 / THE MENSWEAR EDIT",description:"Strong silhouettes. Quiet details. Everyday pieces with presence."},
  women:{title:"Women.",label:"02 / THE WOMENSWEAR EDIT",description:"Sculpted form. Fluid texture. A considered wardrobe, beautifully balanced."},
  kids:{title:"Kids.",label:"03 / THE CHILDRENSWEAR EDIT",description:"A little room for discovery. Children’s items and sizing are awaiting confirmation."}
};
function setDepartment(floor){
  currentFloor=floor;
  get("#collection").dataset.department=floor;
  get("#arrival-note").hidden=floor==="all";
  get("#department-scene").hidden=floor==="all";
  all("[data-floor]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.floor===floor)));
  if(floor==="all"){
    get("#collection-title").innerHTML=originalHeading;
    get("#section-meta").textContent=catalog.length+" curated pieces. Availability, sizing and pricing are confirmed on request.";
    return;
  }
  const [number,name,copy]=floorNames[floor],story=departmentCopy[floor];
  get("#arrival-number").textContent=number;get("#arrival-copy").textContent=copy;
  get("#collection-title").textContent=name+" / Selected pieces.";
  get("#section-meta").textContent=floor==="kids"?"No children’s assortment or sizes have been confirmed. The supplied adult collection remains available from All wholesale.":"A shared unisex collection, thoughtfully selected. Availability and sizing are confirmed on request.";
  get("#department-title").textContent=story.title;get("#department-kicker").textContent=story.label;get("#department-description").textContent=story.description;
  get("#department-wardrobe").innerHTML=floor==="kids"?'<div class="awaiting-pieces"><span>THE CHILDRENSWEAR COLLECTION</span><h3>Coming when it’s confirmed.</h3><p>Children’s pieces and sizing are being confirmed. Explore the unisex collection in the meantime.</p><button data-action="reset">Browse the collection <svg class=\"wg-icon\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M5 19 19 5M5 5h14v14\"/></svg></button></div>':featuredPieces(floor).map(p=>'<button data-open="'+p.id+'" aria-label="Inspect '+p.name+'"><span class="wardrobe-hanger" aria-hidden="true"></span>'+thumb(p)+'<span>'+p.name+'<small>THE WHOLESALE EDIT</small></span></button>').join("");
}
function featuredPieces(floor){
  const ids=floor==="women"?["sailor-bear-knit-ivory","bear-hooded-knit-grey"]:["rider-zip-black","college-bear-knit-navy"];
  return ids.map(piece).filter(Boolean);
}
const motionToggle=get("#reduced-motion");
function syncMotion(){
  const reduced=WGPreferences.reducedMotion;
  motionToggle.checked=reduced;document.body.classList.toggle("reduce-motion",reduced);document.body.classList.toggle("full-motion",!reduced);
  get("#motion-note").textContent=reduced?"Still campaign image. Floor changes are immediate.":"The delivery plays continuously.";
  filmState();
}
motionToggle.addEventListener("change",()=>WGPreferences.setReducedMotion(motionToggle.checked));
window.addEventListener("wg-motion-change",syncMotion);syncMotion();
film.addEventListener("scenechange",event=>get("#dispatch-status").textContent=event.detail.label.toUpperCase());
film.addEventListener("error",()=>{get("#dispatch-loading").hidden=false;get("#dispatch-loading").textContent="Delivery film unavailable. Your showroom is ready to browse.";});
film.ready.then(()=>{if(!film.error)get("#dispatch-loading").hidden=true;else get("#dispatch-loading").textContent="Delivery film unavailable. Your showroom is ready to browse.";});
const firstFloor=new URLSearchParams(location.search).get("floor");
if(firstFloor && departmentCopy[firstFloor]){setDepartment(firstFloor);category="Apparel";render();}
get("#section-meta").textContent=currentFloor==="all"?catalog.length+" curated pieces. Availability, sizing and pricing are confirmed on request.":get("#section-meta").textContent;

const firstProduct=new URLSearchParams(location.search).get("product");if(firstProduct && piece(firstProduct))openProduct(firstProduct,get(".brand"));

const firstSource=Number(new URLSearchParams(location.search).get("source"));if(Number.isInteger(firstSource) && firstSource>0 && firstSource<=52){setDepartment("all");category="All";family="All";sourceNumber=firstSource;query="";render();}
