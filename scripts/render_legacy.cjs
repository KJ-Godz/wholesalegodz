const fs=require('fs'),path=require('path'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const root=path.resolve(__dirname,'..')+path.sep;require(root+'dist/dispatch.js');
fs.mkdirSync(path.join(root,'motion'),{recursive:true});
(async()=>{const images={};for(const [key,url] of Object.entries(WGDispatch.sources))images[key]=await loadImage(path.join(root,'dist',url));
const assets=WGDispatch.prepareAssets(images,createCanvas);const c=createCanvas(1280,720),ctx=c.getContext('2d');const sheet=createCanvas(1280,540),sc=sheet.getContext('2d');
let i=0;for(const t of [0,1.8,3.5,5.6,7.9,9,10.6,12.9,14.7,16.5,18.4,21]){WGDispatch.drawFrame(ctx,t,assets);fs.writeFileSync(root+'motion/legacy-frame-'+i+'.jpg',c.toBuffer('image/jpeg'));sc.drawImage(c,(i%4)*320,Math.floor(i/4)*180,320,180);i++;}
fs.writeFileSync(root+'motion/legacy-storyboard.jpg',sheet.toBuffer('image/jpeg'));fs.writeFileSync(root+'dist/assets/dispatch-legacy-poster.jpg',fs.readFileSync(root+'motion/legacy-frame-2.jpg'));
const identity=createCanvas(1200,540),ic=identity.getContext('2d');ic.fillStyle='#f8f7f1';ic.fillRect(0,0,1200,540);ic.drawImage(await loadImage(root+'dist/assets/logo-primary.svg'),70,60,650,152);ic.drawImage(await loadImage(root+'dist/assets/brand-symbol.svg'),900,45,120,132);ic.fillStyle='#10120f';ic.fillRect(0,280,1200,260);ic.drawImage(await loadImage(root+'dist/assets/logo-gold.svg'),70,330,650,152);ic.drawImage(await loadImage(root+'dist/assets/brand-symbol-gold.svg'),900,325,120,132);fs.writeFileSync(root+'brand/identity-review.png',identity.toBuffer('image/png'));
console.log('Rendered twelve frames with the legacy Canvas renderer, plus vector identity review.');})();
