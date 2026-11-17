"""Build a small, local SVG-path dataset from the attributed geoBoundaries/DGT source.
Usage: python3 scripts/build-portugal-map.py /path/to/geoBoundaries-PRT-ADM1_simplified.geojson
"""
from pathlib import Path
import json, math, sys
ROOT=Path(__file__).resolve().parents[1]
SOURCE='https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/PRT/ADM1/geoBoundaries-PRT-ADM1_simplified.geojson'
geo=json.loads(Path(sys.argv[1]).read_text())
features=[f for f in geo['features'] if f['properties']['shapeISO'] not in ('PT-20','PT-30')]
def rings(f):
 geometry=f['geometry'];polygons=[geometry['coordinates']] if geometry['type']=='Polygon' else geometry['coordinates']
 return [ring for polygon in polygons for ring in polygon]
all_points=[p for f in features for ring in rings(f) for p in ring]
min_lon=min(p[0] for p in all_points);max_lon=max(p[0] for p in all_points);min_lat=min(p[1] for p in all_points);max_lat=max(p[1] for p in all_points)
cos=math.cos(math.radians((min_lat+max_lat)/2));scale=min(270/((max_lon-min_lon)*cos),480/(max_lat-min_lat));ox=(350-(max_lon-min_lon)*cos*scale)/2;oy=38
projection={'minLon':min_lon,'maxLat':max_lat,'scale':scale,'cos':cos,'offsetX':ox,'offsetY':oy}
def project(p):return (ox+(p[0]-min_lon)*cos*scale,oy+(max_lat-p[1])*scale)
def simplify(points,epsilon=.004):
 if len(points)<3:return points
 a,b=points[0],points[-1];dx,dy=b[0]-a[0],b[1]-a[1];length=math.hypot(dx,dy)
 distances=[abs(dy*(p[0]-a[0])-dx*(p[1]-a[1]))/length if length else math.dist(p,a) for p in points]
 index=max(range(len(points)),key=distances.__getitem__)
 if distances[index]<=epsilon:return [a,b]
 return simplify(points[:index+1],epsilon)[:-1]+simplify(points[index:],epsilon)
districts=[]
for feature in features:
 name=feature['properties']['shapeName']
 try:name=name.encode('latin1').decode('utf8')
 except (UnicodeError,ValueError):pass
 paths=[]
 for ring in rings(feature):
  simplified=simplify(ring)
  if len(simplified)<4:continue
  points=[project(p) for p in simplified]
  paths.append('M'+'L'.join(f'{x:.2f},{y:.2f}' for x,y in points)+'Z')
 districts.append({'id':feature['properties']['shapeISO'],'name':name.title(),'path':''.join(paths)})
data={'viewBox':'0 0 350 560','projection':projection,'source':{'name':'geoBoundaries / DG Territory','url':SOURCE,'year':2016,'license':'Open Data Commons Open Database License 1.0','licenseUrl':'https://opendatacommons.org/licenses/odbl/1-0/','changes':'Continental districts only; simplified and projected to local SVG paths.'},'districts':districts}
for path in [ROOT/'src/data/portugal-mainland.json',ROOT/'public/data/portugal-mainland.json']:
 path.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n')
print(f'{len(districts)} continental districts; {len(json.dumps(data))} bytes; no island regions.')
