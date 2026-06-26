# Earth Internal Structure

Interactive 3D cross-section of Earth's interior — built with React, TypeScript, and React Three Fiber.

## Live demo

**https://lucasfeng.github.io/earth-structure/**

(Available after you run the deploy script below and GitHub Actions finishes.)

## Features

- Cut-away 3D Earth model with 5 geological layers
- Orbit, zoom, and click to explore
- Info panel with composition, temperature, and key facts
- Keyboard shortcuts: `1`–`5` select layers, `R` reset view

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

The production build outputs to `dist/`. The Vite config uses `base: './'` so the app can be deployed to GitHub Pages or any static host.

## Deploy to GitHub Pages

The repo includes [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — it builds and publishes on every push to `main`.

**One-time setup** (requires [GitHub CLI](https://cli.github.com/)):

```bash
gh auth login
./scripts/deploy-github-pages.sh
```

That script will:

1. Create the public repo `earth-structure` on your GitHub account (if needed)
2. Push `main`
3. Enable GitHub Pages with **GitHub Actions** as the source

Your site will be at `https://<your-username>.github.io/earth-structure/`.

## Note

Layer thickness is exaggerated for visibility. True-scale rendering would make the crust invisible at this zoom level.

## Attribution

Earth surface texture: [NASA Blue Marble / Blue Marble Next Generation](https://visibleearth.nasa.gov/collection/1484/blue-marble) (public domain). Bump map derived from NASA elevation data via [three-globe](https://github.com/vasturiano/three-globe) example assets.

Crust dirt texture: [Dirt Ground Seamless Free](https://opengameart.org/content/dirt-ground-seamless-free) by ForKotLow (CC0).
