# Simon Moreno — personal website

My projects, videos, and creative experiments. Live at https://simorenoh.github.io/.

Built with static HTML, CSS, and JavaScript. Includes selected finished reels, a
searchable library of 125 playable editing effects, and real workflow screenshots.
Project status and inspiration credits are included with the work.

## Local development

```sh
python3 scripts/build.py
python3 -m http.server 8000 --directory dist
```

The build downloads a pinned media release and verifies its SHA-256 checksum before
extracting it. It validates page assets, effect clips/posters, reels, and fonts.
Python 3.13 is used by the deployment workflow. No npm dependencies are needed.

Media is kept out of Git history. The release bundle contains only the assets
selected for this public website. No raw recordings or private project files.
Fonts are served locally with their accompanying license.

See [DEPLOYMENT.md](DEPLOYMENT.md) for updates and rollback.
