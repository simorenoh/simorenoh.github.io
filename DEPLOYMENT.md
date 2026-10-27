# Deployment

GitHub Pages uses GitHub Actions, not a branch-directory build. A push to `main`
or a manual run of **Deploy personal website** builds and publishes the site.

## How media reaches the site

The source repository contains HTML, CSS, JavaScript, effect metadata, a media
manifest, and the build workflow. Media files are never committed.

`media-manifest.json` pins a release archive by URL, SHA-256, and file count.
`scripts/build.py` downloads and verifies it, extracts only regular files under
`media/` and `fonts/`, and assembles `dist/`. GitHub's Pages artifact actions
publish the complete directory. Videos and images use the same GitHub.io origin
as the page.

The bundle contains selected finished reels, effect demo clips/posters, covers,
workflow screenshots, a portrait, and licensed fonts. No raw recordings, editor
source, credentials, or unrelated private project files.

## Updating text or layout

Edit source files, validate JavaScript with `node --check app.js`, build with
`python3 scripts/build.py`, and push to `main`. The pinned media is reused.

## Updating media

Prepare only assets intended for publication in a new `.tar.gz` release asset.
Use a new release tag, never replace a bundle already pinned by a deployed commit.
Update the URL, SHA-256, and file count in `media-manifest.json`, then build and push.
The checksum prevents publication of a changed or incomplete bundle.

## Rollback

Restore the last known good source commit and matching media manifest on `main`,
then run the workflow. Keep referenced releases for reproducible builds. Earlier
source remains in Git history; the former branch-based homepage was commit
`fa2dec0` before the editorial redesign.

Deployment status is visible in the repository's Actions tab and GitHub Pages
environment. Check the public homepage and representative media after deployment.
