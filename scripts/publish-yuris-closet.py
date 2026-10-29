#!/usr/bin/env python3
"""Sync an explicit runtime allowlist, then package existing PNGs. Never draws art."""
from pathlib import Path
import argparse, base64, hashlib, json, re, shutil
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'scripts/yuris-closet'
JS=ROOT/'assets/js/yuris-closet'
LAYERS=ROOT/'assets/images/projects/yuris-closet/layers'
CSS=ROOT/'assets/css/yuris-closet.css'
DEST=ROOT/'yuris-closet'
HOME='https://oiiaioiiiiai123.github.io/'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def copy(a,b):
 if a.is_symlink() or not a.is_file():raise ValueError('Expected an ordinary file: '+str(a))
 b.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(a,b)
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',type=Path,help='Current local game folder; only listed files are copied')
parser.add_argument('--check',action='store_true',help='Verify the committed output instead of writing it')
a=parser.parse_args()
if a.source:
 if a.check:parser.error('Use --source to sync, then --check separately')
 game=a.source.resolve()
 # Do not copy ZIPs, references, private files, QA logs, or original reference PNGs.
 for name,target in [('index.html',SRC/'index.html'),('style.css',CSS),('app.js',JS/'app.js'),('rig.js',JS/'rig.js'),('dev/rig_rules.json',SRC/'rig_rules.json'),('dev/artwork/paths.json',SRC/'artwork/paths.json'),('dev/artwork/face-pixels.png',SRC/'artwork/face-pixels.png')]:copy(game/name,target)
 embedded=json.loads((game/'assets.js').read_text().split('=',1)[1].rstrip(';'))
 for name in sorted(embedded):
  if not re.fullmatch(r'[a-z0-9_]+',name):raise ValueError('Invalid layer key')
  p=game/'assets'/(name+'.png');copy(p,LAYERS/p.name)
  assert embedded[name]=='data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode(), 'Source assets.js is stale'
 assert 'back_hair_core' in (game/'dev/pixel_art.py').read_text(), 'Continuous back-hair revision required'
 # A genuine stage capture from the approved current build, no generated promotional art.
 from PIL import Image
 capture=Image.open(game/'qa/redraw/review/uniform.png').convert('RGBA')
 cover=Image.new('RGBA',(800,500),'#f4efe8');cover.alpha_composite(capture,(272,58))
 cover.convert('RGB').save(ROOT/'assets/images/projects/yuris-closet/cover.png')
assets={p.stem:'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode() for p in sorted(LAYERS.glob('*.png'))}
asset_js='window.PIXEL_ASSETS='+json.dumps(assets,ensure_ascii=False,separators=(',',':'))+';'
html=(SRC/'index.html').read_text()
style=CSS.read_text()
# A keyboard/touch accessible return link uses the existing title bar space.
style+='\n.home-link{color:#f5ede5;font:inherit;font-size:12px;white-space:nowrap;padding:12px 8px;text-decoration:none}.home-link:focus-visible{outline:2px solid #efc650;outline-offset:2px}@media(max-width:600px){.home-link{font-size:11px}.titlebar .offline-indicator{display:none}}\n'
html=html.replace('<span class="window-buttons" aria-hidden="true"><b>―</b><b>□</b><b>×</b></span>',f'<a class="home-link" href="{HOME}">← 返回主页</a>')
html=html.replace('<link rel="stylesheet" href="style.css" />','<style>\n'+style+'\n</style>')
for name,body in [('assets.js',asset_js),('rig.js',(JS/'rig.js').read_text()),('app.js',(JS/'app.js').read_text())]:
 html=html.replace(f'<script src="{name}"></script>','<script>\n'+body+'\n</script>')
inputs=[SRC/'index.html',CSS,JS/'app.js',JS/'rig.js',*sorted(LAYERS.glob('*.png'))]
manifest={'name':'yuri的衣橱','version':'5.0-back-hair','art':'continuous nape and back hair, frozen existing PNGs','files':{str(p.relative_to(ROOT)):sha(p) for p in inputs},'page_sha256':hashlib.sha256(html.encode()).hexdigest()}
if a.check:
 assert (DEST/'index.html').read_text()==html,'Run scripts/publish-yuris-closet.py; output is stale'
 assert json.loads((DEST/'release.json').read_text())==manifest,'Release manifest is stale'
else:
 DEST.mkdir(exist_ok=True);(DEST/'index.html').write_text(html);(JS/'assets.js').write_text(asset_js)
 (DEST/'release.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'{"Verified" if a.check else "Packaged"}: {len(assets)} unchanged PNG layers → /yuris-closet/; no art generator invoked.')
