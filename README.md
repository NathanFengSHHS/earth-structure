# Earth Internal Structure

Interactive 3D cross-section of Earth's interior — built with React, TypeScript, and React Three Fiber.

## Live demo

**https://NathanFengSHHS.github.io/earth-structure/**

Open that link in any modern browser — no install required. The site updates automatically when `main` is pushed (GitHub Actions → GitHub Pages).

## Features

### Internal Structure
- Cut-away 3D Earth model with 5 geological layers
- Orbit, zoom, and click to explore
- Info panel with composition, temperature, and key facts
- Keyboard shortcuts: `1`–`5` select layers

### Plate Movement Timeline
- Full 3D globe with **GPlates**-reconstructed major plate polygons (Zahirovic et al., 2022)
- Geological time slider (410 Ma → today) with era quick-jump chips
- Era info panel with key tectonic events

### Land Through Time
- Continental landmasses with labels on a morphing globe
- Same geological timeline controls as the plate view
- Sidebar continent chips to focus the camera

Use the header tabs to switch between all three views.

### Regenerating GPlates data (optional)

The timeline uses pre-exported GeoJSON in `public/data/gplates/`. To rebuild from the official GPlates 2.5 GeoData bundle:

```bash
python3 -m venv .venv-gplates
.venv-gplates/bin/pip install -r scripts/requirements-gplates.txt
npm run gplates:download   # ~195 MB from Zenodo
npm run gplates:export     # writes public/data/gplates/*.json
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

The production build outputs to `dist/`. Vite uses `base: '/earth-structure/'` on build so assets work on GitHub Pages.

## Deploy to GitHub Pages

Every push to **`main`** triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and publishes the site.

**First-time setup** (requires [GitHub CLI](https://cli.github.com/)):

```bash
gh auth login
./scripts/deploy-github-pages.sh
```

That script creates the public repo (if needed), pushes `main`, and enables GitHub Pages with GitHub Actions as the source.

**After setup**, deploy updates with:

```bash
git checkout main
git merge your-feature-branch   # if needed
git push origin main
```

Your site will be at `https://<your-username>.github.io/earth-structure/`.

## Note

Layer thickness is exaggerated for visibility. True-scale rendering would make the crust invisible at this zoom level.

## Attribution

Earth surface texture: [NASA Blue Marble / Blue Marble Next Generation](https://visibleearth.nasa.gov/collection/1484/blue-marble) (public domain). Bump map derived from NASA elevation data via [three-globe](https://github.com/vasturiano/three-globe) example assets.

Crust dirt texture: [Dirt Ground Seamless Free](https://opengameart.org/content/dirt-ground-seamless-free) by ForKotLow (CC0).

Plate timeline reconstructions: [GPlates 2.5 GeoData](https://zenodo.org/records/14194897) (EarthByte, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)). Rotation model: Zahirovic et al. (2022). See [EarthByte GPlates data page](https://www.earthbyte.org/gplates-2-5-software-and-data-sets/).
