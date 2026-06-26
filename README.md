# Earth Internal Structure

Interactive 3D cross-section of Earth's interior — built with React, TypeScript, and React Three Fiber.

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

## Deploy

**GitHub Pages:** Push the repo, enable Pages from the `dist` folder (or use a GitHub Action to build and deploy).

**Vercel:** Import the repo — zero config needed for Vite.

## Note

Layer thickness is exaggerated for visibility. True-scale rendering would make the crust invisible at this zoom level.

## Attribution

Earth surface texture: [NASA Blue Marble / Blue Marble Next Generation](https://visibleearth.nasa.gov/collection/1484/blue-marble) (public domain). Bump map derived from NASA elevation data via [three-globe](https://github.com/vasturiano/three-globe) example assets.
