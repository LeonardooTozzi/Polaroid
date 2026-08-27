# Polaroid

A cinematic, single-page landing experience about instant photography — built with **Angular 22** (standalone components, SSR) and **anime.js**. The site tells the story of the Polaroid camera in Portuguese (pt-BR), from the magic of the instant print to the culture and cameras that made it iconic.

## ✨ Features

- **Immersive storytelling** — a scroll-driven narrative across eight sections: Hero, Spectrum, Magic, History, Gallery, Culture, Cameras, and CTA.
- **Server-side rendering (SSR)** — fast first paint and SEO-friendly output via `@angular/ssr`.
- **Standalone components** — modern Angular architecture with no `NgModule` boilerplate.
- **Scroll-reveal animations** — powered by [anime.js](https://animejs.com/) through a reusable `reveal` directive.
- **Responsive, art-directed layout** — custom SCSS with a distinctive editorial design system.

## 🧱 Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | Angular 22 (standalone)             |
| Rendering  | Angular SSR (`@angular/ssr`)        |
| Animations | anime.js 4                          |
| Server     | Express 5                           |
| Language   | TypeScript 6                        |
| Styling    | SCSS                                |
| Tooling    | Angular CLI, Prettier               |

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (the project pins `npm@11.17.0` via `packageManager`)
- npm

### Install

```bash
npm install
```

### Development server

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200). The app hot-reloads on source changes.

### Production build

```bash
npm run build
```

Build artifacts are emitted to `dist/`.

### Serve the SSR build locally

```bash
npm run serve:ssr:polaroid
```

### Tests

```bash
npm test
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Feature sections (hero, spectrum, magic, ...)
│   │   ├── hero/
│   │   ├── spectrum/
│   │   ├── magic/
│   │   ├── history/
│   │   ├── gallery/
│   │   ├── culture/
│   │   ├── cameras/
│   │   └── cta/
│   ├── directives/
│   │   └── reveal.directive.ts   # Scroll-reveal animation directive
│   ├── app.ts               # Root component
│   ├── app.config.ts        # App providers
│   └── app.routes.ts        # Route definitions
├── main.ts                  # Browser bootstrap
├── main.server.ts           # SSR bootstrap
└── server.ts                # Express server
```

## 🛠️ Scripts

| Command                  | Description                          |
| ------------------------ | ------------------------------------ |
| `npm start`              | Run the dev server                   |
| `npm run build`          | Production build                     |
| `npm run watch`          | Build in watch mode (development)    |
| `npm test`               | Run unit tests                       |
| `npm run serve:ssr:polaroid` | Serve the SSR production build   |

## 📄 License

This project is for demonstration purposes. All photography shown is sourced from [Unsplash](https://unsplash.com) and remains the property of its respective authors.
