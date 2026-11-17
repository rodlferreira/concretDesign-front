"""Build the clearly labelled concept portfolio from existing website content."""
import json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import shutil

ROOT = Path(__file__).resolve().parents[1]
COPY = json.loads((ROOT / 'src/i18n/pt-PT.json').read_text())
OUT = ROOT / 'output/pdf/concretdesign-portfolio.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('BrandBody', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
W, H = 842, 595
c = canvas.Canvas(str(OUT), pagesize=(W,H), pageCompression=1)
c.setTitle('ConcretDesign - Portefólio ilustrativo')
c.setAuthor('ConcretDesign')
BG, TEXT, GOLD = '#211f1c', '#f7f3f0', '#c18659'
def text(value,x,y,size=12,color=TEXT):
 c.setFillColor(HexColor(color));c.setFont('BrandBody',size);c.drawString(x,y,value)
def paragraph(value,x,y,width,size=12,color=TEXT):
 p=Paragraph(value, ParagraphStyle('copy',fontName='BrandBody',fontSize=size,leading=size*1.55,textColor=HexColor(color)))
 _,height=p.wrap(width,H);p.drawOn(c,x,y-height)
def base(number):
 c.setFillColor(HexColor(BG));c.rect(0,0,W,H,fill=1,stroke=0)
 text('CONCRET',40,553,18);text('DESIGN',128,553,18,GOLD)
 c.setStrokeColor(HexColor('#52483e'));c.line(40,533,802,533)
 text('APRESENTAÇÃO ILUSTRATIVA - OBRAS REAIS A CONFIRMAR',40,24,8,'#cec6bc')
 text(f'{number:02d} / 08',752,24,9,GOLD)
def photo(name,x,y,w,h):
 im=Image.open(ROOT / f'public/images/{name}.webp').convert('RGB')
 # Crop to the destination ratio without stretching the source.
 ratio=w/h; sw,sh=im.size
 if sw/sh>ratio:
  crop=sh*ratio;im=im.crop(((sw-crop)/2,0,(sw+crop)/2,sh))
 else:
  crop=sw/ratio;im=im.crop((0,(sh-crop)/2,sw,(sh+crop)/2))
 c.drawImage(ImageReader(im),x,y,w,h)
base(1);photo('hero',360,78,442,430)
text('REVESTIMENTOS DECORATIVOS',40,470,10,GOLD)
paragraph('Matéria, textura<br/>e identidade.',40,435,300,32)
paragraph(COPY['hero.text'],40,305,280,12)
paragraph('Portefólio de inspiração<br/>Portugal Continental',40,200,280,12,GOLD)
paragraph('Imagens e projetos ilustrativos do conceito. Não constituem um registo de obras executadas nem uma ficha técnica de produtos.',40,145,285,9)
c.showPage()
items=[('hotel','hotel','Lisboa','micro'),('living','living','Cascais','marmorino'),('retail','retail','Porto','finish'),('hall','hall','Braga','render'),('apartment','apartment','Lisboa','micro'),('restaurant','restaurant','Porto','mass'),('house','house','Algarve','marmorino')]
for n,(pid,image,city,service) in enumerate(items,2):
 base(n);photo(image,40,112,465,396)
 text(city.upper(),540,485,10,GOLD)
 paragraph(COPY[f'project.{pid}'],540,455,260,23)
 text(COPY[f'service.{service}'],540,340,11,GOLD)
 desc=f'project.{pid}.text' if pid in ['hotel','living','retail','hall'] else f'service.{service}.text'
 paragraph(COPY[desc],540,310,255,12)
 paragraph('Fale connosco sobre o seu projeto.',540,184,250,11)
 text('geral@concretdesign.pt',540,135,10)
 c.linkURL('mailto:geral@concretdesign.pt',(540,130,785,148),relative=0)
 text('WhatsApp: +351 963 445 555',540,111,10)
 c.linkURL('https://wa.me/351963445555',(540,106,790,125),relative=0)
 c.showPage()
c.save()
shutil.copyfile(OUT, ROOT / 'public/documents/concretdesign-portfolio.pdf')
print(OUT)
