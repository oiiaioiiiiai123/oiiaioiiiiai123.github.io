#!/usr/bin/env python3
"""Sync the painted-pose runtime allowlist and package existing PNGs; never draws art."""
from pathlib import Path
import argparse, base64, hashlib, json, re, shutil

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'scripts/yuris-closet'
JS=ROOT/'assets/js/yuris-closet'
LAYERS=ROOT/'assets/images/projects/yuris-closet/layers'
CSS=ROOT/'assets/css/yuris-closet.css'
DEST=ROOT/'yuris-closet'
HOME='https://oiiaioiiiiai123.github.io/'
SCRIPTS=['assets.js','rig.js','pose-engine.js','app.js']

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def copy(a,b):
    if a.is_symlink() or not a.is_file():raise ValueError('Expected an ordinary file: '+str(a))
    b.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(a,b)

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',type=Path,help='Current local game folder; only listed runtime files are copied')
parser.add_argument('--check',action='store_true',help='Verify committed output without changing it')
args=parser.parse_args()
if args.source:
    if args.check:parser.error('Sync with --source, then verify with --check separately')
    game=args.source.resolve()
    build=json.loads((game/'art/production/build.json').read_text())
    evidence=game/'qa/visual-regression'
    audit=json.loads((evidence/'current/browser-build.json').read_text())
    if build!=audit:raise ValueError('Run the final browser audit for this build before publishing')
    gate=json.loads((evidence/'release-gate.json').read_text())
    assert gate['approved'] and gate['version']==build['version'],'Final visual/functional release gate is not approved'
    assert gate['buildSHA256']==sha(game/'art/production/build.json'),'Release gate refers to another build'
    report=json.loads((evidence/'current/after-report.json').read_text())
    review=json.loads((evidence/'visual-review.json').read_text())['pages']
    for page in report['pages']:
        name='current/'+page['file']
        assert review[name]['sha256']==sha(evidence/name),'Final visual review is missing/stale: '+name
    for name in ['comparison-current.json','comparison-repeat.json']:
        check=json.loads((evidence/name).read_text())
        assert check['looks']==len(report['cases']),'Incomplete regression coverage'
        if name=='comparison-current.json':assert gate['reviewedComparisonSHA256']==sha(evidence/name),'Unreviewed intentional change'
        else:assert check['changedPixels']==0,'Repeat capture is unstable'
    assert all(json.loads((evidence/'current/functional.json').read_text()).values()),'Functional regression failed'
    for rel,digest in build['files'].items():
        file=game/rel
        assert file.resolve().is_relative_to(game) and sha(file)==digest,'Stale build: '+rel
    for name,target in [('index.html',SRC/'index.html'),('style.css',CSS),('app.js',JS/'app.js'),('rig.js',JS/'rig.js'),('pose-engine.js',JS/'pose-engine.js')]:copy(game/name,target)
    local=json.loads((game/'art/posed/runtime.json').read_text())
    poses=json.loads((game/'art/posed/poses.json').read_text())
    spec={k:local[k] for k in ['version','canvas','anchors']}
    spec.update(poseSystem=poses,layers={})
    for key,e in sorted(build['assets'].items()):
        assert re.fullmatch(r'[a-z0-9_]+',key),'Invalid layer key'
        source=game/e['file'];assert source.resolve().is_relative_to(game)
        assert sha(source)==e['sha256'],'Stale PNG: '+key
        target=LAYERS/(key+'.png');copy(source,target)
        spec['layers'][key]={'file':target.relative_to(ROOT).as_posix(),'origin':e['origin'],'size':e['size'],'sha256':e['sha256']}
    # This directory is the game's generated public runtime, not the editable source archive.
    # Remove only obsolete game PNGs, retained in Git history and the local full project.
    expected={key+'.png' for key in spec['layers']}
    for old in LAYERS.glob('*.png'):
        if old.is_symlink():raise ValueError('Unexpected symlink: '+str(old))
        if old.name not in expected:old.unlink()
    (SRC/'runtime.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
    (SRC/'poses.json').write_text(json.dumps(poses,ensure_ascii=False,indent=2)+'\n')
    # Cover comes from the audited game canvas; only the display size is reduced.
    from PIL import Image
    capture=Image.open(evidence/'current/after-native-preset-0.png').convert('RGBA')
    assert capture.size==(1024,1536)
    cover=Image.new('RGBA',(800,500),'#f4efe8')
    cover.alpha_composite(capture.resize((256,384),Image.Resampling.NEAREST),(272,58))
    cover.convert('RGB').save(ROOT/'assets/images/projects/yuris-closet/cover.png')

spec=json.loads((SRC/'runtime.json').read_text())
assert spec['canvas']==[1024,1536] and spec['version']=='8.2.1-final-regression'
assert spec['poseSystem']==json.loads((SRC/'poses.json').read_text())
assert not {'body_base','hair_nape','hand_left','hand_right'} & set(spec['layers'])
assert {p.name for p in LAYERS.glob('*.png')}=={key+'.png' for key in spec['layers']},'Unlisted game PNGs in public output'
assets={}
for key,e in spec['layers'].items():
    p=ROOT/e['file'];assert p.resolve().is_relative_to(LAYERS) and sha(p)==e['sha256']
    assets[key]='data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode()
asset_js='window.PIXEL_ASSETS='+json.dumps(assets,separators=(',',':'))+';\nwindow.YURI_NATIVE='+json.dumps(spec,ensure_ascii=False,separators=(',',':'))+';'
html=(SRC/'index.html').read_text()
style=CSS.read_text()+'\n.home-link{color:#f5ede5;font:inherit;font-size:12px;white-space:nowrap;padding:12px 8px;text-decoration:none}.home-link:focus-visible{outline:2px solid #efc650;outline-offset:2px}@media(max-width:600px){.home-link{font-size:11px}.titlebar .offline-indicator{display:none}}\n'
html=html.replace('<span class="window-buttons" aria-hidden="true"><b>―</b><b>□</b><b>×</b></span>',f'<a class="home-link" href="{HOME}">← 返回主页</a>')
html=html.replace('<link rel="stylesheet" href="style.css" />','<style>\n'+style+'\n</style>')
for name in SCRIPTS:
    body=asset_js if name=='assets.js' else (JS/name).read_text()
    html=html.replace(f'<script src="{name}"></script>','<script>\n'+body+'\n</script>')
assert '<script src=' not in html and 'file://' not in html and '/Users/' not in html
for forbidden in ['preview-foot','posed-qa.js','Capture source baseline','眼睛、绷带和熟悉的刘海，依然是她自己。']:assert forbidden not in html
inputs=[SRC/'index.html',SRC/'runtime.json',SRC/'poses.json',CSS,*[JS/n for n in SCRIPTS if n!='assets.js'],*[ROOT/e['file'] for e in spec['layers'].values()]]
manifest={'name':'yuri的衣橱','version':spec['version'],'canvas':spec['canvas'],'pngs':len(assets),'art':'approved original face/fringe; per-style rear hair; disjoint cuffs/hands; per-garment footwear ownership','files':{p.relative_to(ROOT).as_posix():sha(p) for p in inputs},'page_sha256':hashlib.sha256(html.encode()).hexdigest()}
if args.check:
    assert (JS/'assets.js').read_text()==asset_js,'Stale generated asset bundle'
    assert (DEST/'index.html').read_text()==html,'Repackage the page'
    assert json.loads((DEST/'release.json').read_text())==manifest,'Stale release manifest'
else:
    DEST.mkdir(exist_ok=True);(DEST/'index.html').write_text(html);(JS/'assets.js').write_text(asset_js)
    (DEST/'release.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'{"Verified" if args.check else "Packaged"}: {len(assets)} native painted PNGs → /yuris-closet/; no art generator invoked.')
