# GitHub Pages deployment

Push to `main` or run **Deploy personal website** to publish the source and pinned
media through GitHub Actions. Pages must use GitHub Actions as its publishing source.

## Public scope

The approved media bundle contains exactly 250 files: 125 effect demo MP4s and
125 JPG posters, all under `media/effects/`. No other videos, images, or local
assets are published. The full local homepage preview contains private assets
and must not be copied over this public version.

`media-manifest.json` pins a GitHub release URL, SHA-256 checksum, and file count.
`scripts/build.py` verifies and extracts only the exact effect filenames in the
catalog. It rejects non-regular files, unexpected paths, and extra media. It
checks both HTML pages and the final deployment file list before publishing.

Media is uploaded as a release asset and assembled into the Pages artifact. It
is never committed to Git. The public homepage and `/effects/` use same-origin
URLs for playback and posters. The original private content workspace stays private.

## Updates

Edit source, run `node --check app.js` and `python3 scripts/build.py`, and push.
For effect changes, create a new effects-only bundle and release tag; update the
manifest checksum, file count, and catalog together. Do not replace a bundle
referenced by a deployed commit. Do not add non-effect media without Simon's
explicit instruction.

## Rollback

Restore a known good source commit and matching manifest on main, then run the
workflow. Keep referenced releases available for reproducible builds. The original
branch-based homepage was commit `fa2dec0` before this redesign.
