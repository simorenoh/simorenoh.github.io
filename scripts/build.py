"""Assemble Pages from source plus the pinned, checksum-verified media release."""
import argparse
import hashlib
import json
import re
import shutil
import tarfile
import tempfile
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
SOURCE_FILES = ('index.html', 'style.css', 'app.js', 'effects.json')


def build(archive_path=None):
    manifest = json.loads((ROOT / 'media-manifest.json').read_text())
    output = ROOT / 'dist'
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    for name in SOURCE_FILES:
        shutil.copy2(ROOT / name, output / name)
    with tempfile.TemporaryDirectory(prefix='homepage-assets-') as temporary:
        if archive_path:
            archive = Path(archive_path)
        else:
            url = manifest['url']
            expected = 'https://github.com/simorenoh/simorenoh.github.io/releases/download/'
            if not url.startswith(expected):
                raise ValueError('Media URL must be a release in the website repository.')
            archive = Path(temporary) / 'website-media.tar.gz'
            request = Request(url, headers={'User-Agent': 'simon-homepage-build'})
            with urlopen(request, timeout=120) as source, archive.open('wb') as destination:
                shutil.copyfileobj(source, destination)
        with archive.open('rb') as stream:
            digest = hashlib.file_digest(stream, 'sha256').hexdigest()
        if digest != manifest['sha256']:
            raise ValueError('Media checksum mismatch; refusing to publish.')
        with tarfile.open(archive, 'r:gz') as bundle:
            members = bundle.getmembers()
            if len(members) != manifest['file_count']:
                raise ValueError('Unexpected media file count.')
            for member in members:
                path = PurePosixPath(member.name)
                if (not member.isfile() or path.is_absolute() or '..' in path.parts
                        or not path.parts or path.parts[0] not in {'media', 'fonts'}):
                    raise ValueError(f'Unexpected media archive entry: {member.name}')
            bundle.extractall(output, filter='data')
    (output / '.nojekyll').touch()
    validate(output)
    print(f'Pages build ready: {len(list(output.rglob("*")))} entries; media SHA-256 {digest}')


def validate(output):
    class AssetParser(HTMLParser):
        def handle_starttag(self, tag, attrs):
            for key, value in attrs:
                if key in {'src', 'href'} and value and not value.startswith(('https:', 'http:', 'data:', '#', 'mailto:')):
                    if not (output / value).is_file():
                        raise ValueError(f'Missing page asset: {value}')
    AssetParser().feed((output / 'index.html').read_text())
    for name in re.findall(r"url\('([^']+)'\)", (output / 'style.css').read_text()):
        if not (output / name).is_file():
            raise ValueError(f'Missing font: {name}')
    catalog = json.loads((output / 'effects.json').read_text())
    if len({effect['id'] for effect in catalog}) != len(catalog):
        raise ValueError('Duplicate effect IDs.')
    for effect in catalog:
        for extension in ('jpg', 'mp4'):
            if not (output / f'media/effects/{effect["id"]}.{extension}').is_file():
                raise ValueError(f'Missing effect asset: {effect["id"]}.{extension}')
    for slug in ('easier', 'problems', 'fear'):
        if not (output / f'media/{slug}.mp4').is_file():
            raise ValueError(f'Missing reel: {slug}')
    print(f'Validated {len(catalog)} effect pairs, 3 reels, HTML assets, and fonts.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--media-archive', type=Path, help='Use a local archive instead of downloading the pinned release.')
    build(parser.parse_args().media_archive)
