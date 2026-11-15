"""Trace the supplied brand artwork, retaining editable lettering via two subset fonts.
Authoring dependencies only: Pillow, vtracer, potracer, numpy, fonttools, brotli (not used by the site).
"""
from pathlib import Path
from PIL import Image
import vtracer,io,re,base64,xml.etree.ElementTree as ET
import potrace,numpy as np
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import newTable,TTFont
from copy import deepcopy
from fontTools.ttLib.tables._k_e_r_n import KernTable_format_0
ROOT=Path(__file__).resolve().parents[1]
SOURCES=ROOT/'scripts/logo-sources'
OUT=ROOT/'public/images'
FONTS=ROOT/'public/fonts';FONTS.mkdir(exist_ok=True)
ART=Image.open(SOURCES/'original-lettering.png')

def font_from_art(text,y0,y1,family,filename):
 alpha=ART.crop((0,y0,ART.width,y1)).getchannel('A')
 box=alpha.point(lambda p:255 if p>110 else 0).getbbox();top,bottom=box[1],box[3];height=bottom-top;scale=1000/height
 columns=[sum(alpha.getpixel((x,y))>110 for y in range(alpha.height)) for x in range(alpha.width)]
 regions=[];start=None
 for x,count in enumerate(columns+[0]):
  if count and start is None:start=x
  if not count and start is not None:regions.append((start,x));start=None
 assert len(regions)==len(text.replace(' ','')),(regions,text)
 ids={c:f'u{ord(c):04X}' for c in sorted(set(text))}
 glyphs={'.notdef':TTGlyphPen(None).glyph()};metrics={'.notdef':(500,0)};positions=[];region_index=0;advance={};kern={}
 for index,char in enumerate(text):
  if char==' ':continue
  x0,x1=regions[region_index];positions.append((char,x0));region_index+=1
  if char in advance:continue
  next_x=regions[region_index][0] if region_index<len(regions) else x1+3
  if index+1<len(text) and text[index+1]==' ':next_x=x1+10
  advance[char]=next_x-x0
  mask=np.array(alpha.crop((x0,top,x1,bottom)))<=110
  contours=potrace.Bitmap(mask).trace(turdsize=1,alphamax=1.0,opttolerance=.3)
  pen=TTGlyphPen(None)
  transformed=TransformPen(Cu2QuPen(pen,max_err=1,reverse_direction=False),(scale,0,0,-scale,0,height*scale))
  def point(p):return (p.x,p.y)
  for curve in contours:
   transformed.moveTo(point(curve.start_point))
   for segment in curve:
    if segment.is_corner:
     transformed.lineTo(point(segment.c));transformed.lineTo(point(segment.end_point))
    else:transformed.curveTo(point(segment.c1),point(segment.c2),point(segment.end_point))
   transformed.closePath()
  glyphs[ids[char]]=pen.glyph();metrics[ids[char]]=(round(advance[char]*scale),0)
 if ' ' in ids:
  glyphs[ids[' ']]=TTGlyphPen(None).glyph();metrics[ids[' ']]=(round(18*scale),0)
 for index,((left,x0),(right,x1)) in enumerate(zip(positions,positions[1:])):
  actual=x1-x0
  # Keep the word break as text rather than a hard-coded offset.
  if text=='REVESTIMENTOS DECORATIVOS' and index==12:actual-=18
  delta=round((actual-advance[left])*scale)
  if delta:kern[(ids[left],ids[right])]=delta
 fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(['.notdef']+list(ids.values()));fb.setupCharacterMap({ord(c):g for c,g in ids.items()});fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=1050,descent=-150)
 fb.setupNameTable({'familyName':family,'styleName':'Regular','uniqueFontIdentifier':family+'-ReferenceTrace','fullName':family,'psName':family,'version':'Version 1.0','description':'Subset traced from client-supplied ConcretDesign artwork; not the original font file.'})
 fb.setupOS2(sTypoAscender=1050,sTypoDescender=-150,usWinAscent=1100,usWinDescent=200,sCapHeight=1000,usWeightClass=500);fb.setupPost();fb.setupMaxp()
 if kern:
  table=newTable('kern');table.version=0;sub=KernTable_format_0();sub.version=0;sub.coverage=1;sub.kernTable=kern;table.kernTables=[sub];fb.font['kern']=table
 fb.font.flavor='woff2';path=FONTS/filename;fb.save(path)
 return base64.b64encode(path.read_bytes()).decode()
namefont=font_from_art('CONCRETDESIGN',0,60,'ConcretReferenceName','concret-reference-name.woff2')
tagfont=font_from_art('REVESTIMENTOS DECORATIVOS',92,115,'ConcretReferenceTagline','concret-reference-tagline.woff2')
# Reuse the large original glyphs for shared subtitle letters, avoiding low-resolution noise.
name_face=TTFont(FONTS/'concret-reference-name.woff2')
tag_face=TTFont(FONTS/'concret-reference-tagline.woff2')
for code,glyph in name_face.getBestCmap().items():
 if code in tag_face.getBestCmap():tag_face['glyf'][tag_face.getBestCmap()[code]]=deepcopy(name_face['glyf'][glyph])
tag_face.save(FONTS/'concret-reference-tagline.woff2')
tagfont=base64.b64encode((FONTS/'concret-reference-tagline.woff2').read_bytes()).decode()

vtracer.convert_image_to_svg_py(str(SOURCES/'original-symbol.png'),str(OUT/'brand-symbol.svg'),colormode='color',hierarchical='stacked',mode='spline',filter_speckle=2,color_precision=6,layer_difference=12,corner_threshold=60,length_threshold=2,max_iterations=10,splice_threshold=45,path_precision=2)
symbol=ET.parse(OUT/'brand-symbol.svg').getroot();symbol.set('viewBox','0 0 227 212');symbol.set('role','img');symbol.set('aria-label','Símbolo ConcretDesign');ET.register_namespace('','http://www.w3.org/2000/svg');ET.ElementTree(symbol).write(OUT/'brand-symbol.svg',encoding='unicode')
paths=''.join(ET.tostring(p,encoding='unicode') for p in symbol)
style=f'''<style>@font-face{{font-family:ConcretReferenceName;src:url(data:font/woff2;base64,{namefont}) format('woff2')}}@font-face{{font-family:ConcretReferenceTagline;src:url(data:font/woff2;base64,{tagfont}) format('woff2')}}</style>'''
# Match the compact wordmark, icon opening and short subtitle of the supplied mockup.
content=f'''{style}<defs><linearGradient id="wordmark-copper" x1="0" y1="0" x2="0.75" y2="1"><stop stop-color="#E4B88E"/><stop offset=".48" stop-color="#CC986A"/><stop offset="1" stop-color="#B27B4D"/></linearGradient></defs>
<g transform="translate(5 4) scale(.425)">{paths}</g>
<text x="123" y="56" font-family="ConcretReferenceName" font-size="37" textLength="451" lengthAdjust="spacingAndGlyphs" fill="#F7F3F0">CONCRET<tspan fill="url(#wordmark-copper)">DESIGN</tspan></text>
<text x="160" y="81" font-family="ConcretReferenceTagline" font-size="10.5" textLength="377" lengthAdjust="spacingAndGlyphs" fill="#F7F3F0">REVESTIMENTOS DECORATIVOS</text>'''
for filename,bg in [('concretdesign-logo.svg',''),('concretdesign-logo-preview.svg','<rect width="590" height="102" fill="#181716"/>')]:
 (OUT/filename).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 590 102" role="img" aria-labelledby="title"><title id="title">ConcretDesign — Revestimentos decorativos</title>{bg}{content}</svg>')
print('Traced symbol paths:',len(list(symbol)))
print('Editable name and subtitle: custom subsets traced from original artwork.')
