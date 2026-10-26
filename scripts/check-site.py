#!/usr/bin/env python3
"""Check generated HTML links, images, scripts, fragments, and baseurl paths.
Usage: python3 scripts/check-site.py [destination] [--baseurl /preview]
No external Python packages required.
"""
import argparse
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, urljoin

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.refs = []
        self.ids = set()
        self.feed(source)
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get('id'): self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key): self.refs.append(attrs[key])

parser = argparse.ArgumentParser()
parser.add_argument('destination', nargs='?', default=str(Path(__file__).resolve().parents[1] / '_site'))
parser.add_argument('--baseurl', default='')
args = parser.parse_args()
root = Path(args.destination).resolve()
base = args.baseurl.rstrip('/')
pages = {path: Page(path.read_text()) for path in root.rglob('*.html')}
errors = []
for path, page in pages.items():
    rel = path.relative_to(root).as_posix()
    page_url = base + '/' + rel
    for ref in page.refs:
        target = urlsplit(ref)
        if target.scheme or target.netloc: continue
        resolved = urlsplit(urljoin(page_url, ref))
        url = unquote(resolved.path)
        if base:
            if not (url == base or url.startswith(base + '/')):
                errors.append(f'{rel}: misses baseurl: {ref}')
                continue
            url = url[len(base):]
        file = root / url.lstrip('/')
        if file.is_dir(): file = file / 'index.html'
        if not file.exists():
            errors.append(f'{rel}: missing target: {ref}')
        elif resolved.fragment and file.suffix == '.html':
            if unquote(resolved.fragment) not in pages[file].ids:
                errors.append(f'{rel}: missing fragment: {ref}')
for required in ('index.html', 'projects/app/index.html', 'projects/website/index.html', 'projects/games/index.html', 'projects/more/index.html', 'projects/eggplant/index.html', 'projects/shanghai-metro-test/index.html', 'writing/index.html', 'pigs-room/index.html', '404.html'):
    if not (root / required).is_file(): errors.append(f'Missing page: {required}')
if not pages: errors.append('No generated HTML. Run Jekyll build first.')
if errors:
    print('FAILED\n' + '\n'.join(errors))
    raise SystemExit(1)
print(f'PASS: {len(pages)} HTML pages; all local links, assets, and fragments resolve (baseurl={base or "/"}).')
