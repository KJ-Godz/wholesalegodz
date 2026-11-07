"""Build standalone, font-independent crown/globe SVG identity assets."""
from pathlib import Path
from fontTools.ttLib import TTCollection
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets'
font=TTCollection('/System/Library/Fonts/Supplemental/Bodoni 72.ttc').fonts[2]
glyphs=font.getGlyphSet(); cmap=font.getBestCmap(); units=font['head'].unitsPerEm
GOLD='#b58d47';INK='#151612'

def lettering(text,x,y,size,tracking=0,color=INK):
    s=size/units; parts=[]
    for c in text:
        g=glyphs[cmap[ord(c)]];pen=SVGPathPen(glyphs)
        g.draw(TransformPen(pen,(s,0,0,-s,x,y)))
        parts.append('<path d="'+pen.getCommands()+'"/>')
        x+=g.width*s+tracking
    return '<g fill="'+color+'">'+''.join(parts)+'</g>'

def width(text,size,tracking=0):return sum(glyphs[cmap[ord(c)]].width*size/units+tracking for c in text)-tracking

def emblem(gold=GOLD,ink=INK):
    # Abstracted globe, no miniature continents that fail at small sizes.
    return f'''<g fill="none" stroke="{gold}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M29.7 73.5a35 35 0 1 0 60.6 0"/>
    <path d="M60 64v62M43 68c-12 22-10 43 17 58M77 68c12 22 10 43-17 58M27 87q33 13 66 0M28 106q32 10 64 0"/>
    </g><defs><mask id="crown-counter"><rect width="120" height="132" fill="white"/><path d="m60 28 6 11-6 10-6-10Z" fill="black"/><path d="M34 54q26 7 52 0" stroke="black" stroke-width="1.5" fill="none"/></mask></defs><path fill="{gold}" mask="url(#crown-counter)" d="M22 23 34 38Q42 45 48 30L60 9 72 30Q78 45 86 38L98 23 91 58Q60 68 29 58Z"/>

    <g fill="{gold}"><circle cx="22" cy="20" r="4"/><circle cx="60" cy="6" r="4.5"/><circle cx="98" cy="20" r="4"/></g>
    <path d="M30 64q30 10 60 0" stroke="{gold}" stroke-width="3" fill="none"/>
'''

def svg(body,w,h,title):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-labelledby="title"><title id="title">{escape(title)}</title>{body}</svg>'

def horizontal(gold=GOLD,ink=INK):
    whole=width('WHOLESALE',53,1.4);gods=width('GODS',32,8)
    cx=365
    body='<g transform="translate(10 5)">'+emblem(gold,ink)+'</g>'
    body+=lettering('WHOLESALE',cx-whole/2,68,53,1.4,ink)
    body+=lettering('GODS',cx-gods/2,112,32,8,gold)
    body+=f'<path d="M151 100h{cx-gods/2-170:.1f}M{cx+gods/2+19:.1f} 100H580" stroke="{gold}" stroke-width="1"/>'
    return svg(body,600,140,'Wholesale Gods — crown and globe')

for name,gold,ink in [('logo-primary',GOLD,INK),('logo-gold','#d3b477','#d3b477'),('logo-black',INK,INK),('logo-white','#f3edde','#f3edde')]:
    # In single ink versions, diamond/crown counters remain cut out in the
    # intended substrate color; every element is still native SVG geometry.
    counter='#10120f' if name in ('logo-gold','logo-white') else '#f8f7f1'
    art=horizontal(gold,ink)
    if name!='logo-primary':art=art.replace(f'fill="{ink}" d="m60',f'fill="{counter}" d="m60').replace(f'stroke="{ink}" stroke-width="1.5"',f'stroke="{counter}" stroke-width="1.5"')
    (OUT/(name+'.svg')).write_text(art)
(OUT/'brand-symbol.svg').write_text(svg(emblem(GOLD,INK),120,132,'Wholesale Gods crowned globe emblem'))
(OUT/'brand-symbol-gold.svg').write_text(svg(emblem('#d3b477','#10120f'),120,132,'Wholesale Gods crowned globe emblem, gold'))
whole=width('WHOLESALE',70,1);gods=width('GODS',44,11)
stack='<g transform="translate(240 3)">'+emblem()+'</g>'+lettering('WHOLESALE',300-whole/2,207,70,1)+lettering('GODS',300-gods/2,266,44,11,GOLD)
stack+=f'<path d="M60 249H{300-gods/2-23:.1f}M{300+gods/2+23:.1f} 249H540" stroke="{GOLD}"/>'
(OUT/'logo-stacked.svg').write_text(svg(stack,600,290,'Wholesale Gods — stacked crown and globe identity'))
micro='<g fill="'+GOLD+'"><path d="M22 23 34 38Q42 45 48 30L60 9 72 30Q78 45 86 38L98 23 91 58Q60 68 29 58Z"/><circle cx="22" cy="20" r="5"/><circle cx="60" cy="6" r="5"/><circle cx="98" cy="20" r="5"/></g><g fill="none" stroke="'+GOLD+'" stroke-width="6"><path d="M29.7 73.5a35 35 0 1 0 60.6 0M60 70v56M26 92h68"/></g>'
(OUT/'brand-icon.svg').write_text(svg(micro,120,132,'Wholesale Gods'))
print('Built eight font-independent SVG identity assets')
