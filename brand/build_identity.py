"""Vector web adaptations of the approved crowned WG/globe/truck signature.
The supplied PNG is preserved separately as logo-final-approved.png; these
outlined SVGs adapt its identity for small web placements, not pixel tracing.
"""
from pathlib import Path
from fontTools.ttLib import TTCollection
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets'
font=TTCollection('/System/Library/Fonts/Supplemental/Bodoni 72.ttc').fonts[2]
glyphs=font.getGlyphSet();cmap=font.getBestCmap();units=font['head'].unitsPerEm

def width(text,size,tracking=0):
 return sum(glyphs[cmap[ord(c)]].width*size/units+tracking for c in text)-tracking

def lettering(text,x,y,size,tracking=0,fill='url(#gold)'):
 parts=[];scale=size/units
 for c in text:
  g=glyphs[cmap[ord(c)]];pen=SVGPathPen(glyphs);g.draw(TransformPen(pen,(scale,0,0,-scale,x,y)))
  parts.append('<path d="'+pen.getCommands()+'"/>');x+=g.width*scale+tracking
 return '<g fill="'+fill+'">'+''.join(parts)+'</g>'

def crown():
 return '''<g fill="url(#gold)" stroke="#c79333" stroke-width="2.5" stroke-linejoin="round">
 <path fill-rule="evenodd" d="M185 57Q220 103 247 46Q275 100 300 12Q325 100 353 46Q380 103 415 57L392 123Q300 94 208 123ZM300 43 313 66 300 85 287 66Z"/>
 <path d="M208 124Q300 97 392 124L388 138Q300 112 212 138Z"/>
 <circle cx="185" cy="54" r="8"/><circle cx="247" cy="43" r="7"/><circle cx="300" cy="9" r="9"/><circle cx="353" cy="43" r="7"/><circle cx="415" cy="54" r="8"/>
 </g>'''

def emblem():
 globe='''<g stroke="url(#gold-line)" stroke-width="2.4" fill="none" stroke-linecap="round">
 <path d="M33 475C33 183 567 183 567 475M90 457C64 220 536 220 510 457M168 461C130 271 201 205 230 194M430 461C468 271 397 205 368 194M38 395Q300 339 562 395M70 321Q300 269 530 321"/>
 </g>'''
 return globe+crown()+lettering('W',152,321,258)+lettering('G',277,468,255)+'''<path d="M187 213C120 325 194 355 301 296C390 247 463 203 505 226L508 247C464 225 395 264 311 314C202 380 112 348 149 266C159 243 174 225 187 213Z" fill="url(#gold)" stroke="#c79333" stroke-width="1.5"/><path d="M156 267C125 345 209 359 307 304C393 255 464 217 501 235" fill="none" stroke="#fff0b2" stroke-width="2"/>'''

def truck():
 return '''<g stroke="url(#gold-line)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
 <path d="M4 20 179 4V62L4 69ZM187 6V64L201 67 210 76H286V53L268 20 235 10Z" fill="none"/>
 <path d="M207 20 235 22 251 37H209ZM246 22 261 25 269 39H258Z" fill="url(#gold)" stroke="none"/>
 <path d="M191 65H99M18 76H86M209 46H224M276 50H286M271 57H285M271 64H285M209 74V45M233 43V72" fill="none"/>
 <path d="M207 75Q208 52 226 53Q241 53 243 75M270 77H287" fill="none"/>
 <g fill="none" stroke-width="4"><ellipse cx="23" cy="79" rx="7" ry="10"/><ellipse cx="42" cy="79" rx="7" ry="10"/><ellipse cx="151" cy="77" rx="8" ry="11"/><ellipse cx="172" cy="77" rx="8" ry="11"/><ellipse cx="226" cy="77" rx="11" ry="14"/></g>
 </g>'''

def svg(body,w,h,title,tone='gold'):
 stops='<stop stop-color="#fff0b2"/><stop offset=".18" stop-color="#d39728"/><stop offset=".38" stop-color="#fff1b1"/><stop offset=".56" stop-color="#e9b741"/><stop offset=".76" stop-color="#a86b13"/><stop offset="1" stop-color="#e8b94c"/>'
 if tone!='gold':
  body=body.replace('#c79333',tone).replace('#fff0b2',tone)
  stops=f'<stop stop-color="{tone}"/><stop offset="1" stop-color="{tone}"/>'
 defs=f'<defs><linearGradient id="gold" x1="0" y1="0" x2=".85" y2="1">{stops}</linearGradient><linearGradient id="gold-line" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="600" y2="350">{stops}</linearGradient></defs>'
 return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}">{defs}{body}</svg>'

def horizontal(tone='gold'):
 text='WHOLESALE GODS';size=650/width(text,1)
 art='<g transform="translate(4 5) scale(.43)">'+emblem()+'</g>'
 art+=lettering(text,294,116,size)
 art+='<g transform="translate(546 146) scale(.56)">'+truck()+'</g>'
 art+='<path d="M298 187H520M730 187H944" stroke="url(#gold-line)" stroke-width="1.2"/>'
 return svg(art,970,230,'Wholesale Gods — crowned WG, globe and delivery truck',tone)
for name,tone in [('logo-primary','gold'),('logo-gold','gold'),('logo-black','#161812'),('logo-white','#f4ebd2')]:
 (OUT/(name+'.svg')).write_text(horizontal(tone))
body='<g transform="translate(200 10)">'+emblem()+'</g>'
text='WHOLESALE GODS';size=900/width(text,1)
body+=lettering(text,50,600,size)+'<g transform="translate(377 640) scale(.85)">'+truck()+'</g><path d="M75 706H355M645 706H925" stroke="url(#gold-line)" stroke-width="1.5"/>'
(OUT/'logo-stacked.svg').write_text(svg(body,1000,760,'Wholesale Gods — full crown, WG globe and truck signature'))
for name in ['brand-symbol','brand-symbol-gold']:(OUT/(name+'.svg')).write_text(svg(emblem(),600,495,'Wholesale Gods — crowned WG globe monogram'))
# Simplified monogram remains readable as a browser icon.
icon=crown()+lettering('W',122,360,340)
(OUT/'brand-icon.svg').write_text(svg(icon,600,500,'Wholesale Gods'))
print('Built eight native SVG adaptations; approved original artwork remains intact.')
