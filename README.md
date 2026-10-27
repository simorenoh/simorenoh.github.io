# Simon Moreno — personal website and effects library

Live site: https://simorenoh.github.io/
Effects library: https://simorenoh.github.io/effects/

A warm editorial personal page with projects and a searchable library of 125
playable editing effects. Inspiration credits appear with each preview.

Only effect demo clips and their poster images are public. Finished reels,
portraits, covers, and workflow screenshots are not included in this deployment.
System fonts keep the public build independent of other local assets.

## Build locally

```sh
python3 scripts/build.py
python3 -m http.server 8000 --directory dist
```

Python 3.13 is used by the deployment workflow. No npm dependencies are needed.
The build verifies a pinned release archive and permits only the 125 effect video
and poster pairs. Media is never committed to Git history.

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment and rollback.
