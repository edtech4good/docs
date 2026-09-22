# edtech4good documentation

This is the documentation site for edtech4good, published at https://edtech4good.github.io/docs/.

The repo also contains the production self-hosting kit under `deploy/` and `docker/`.

## Running locally

```
npm install
npm run dev
```

The site opens at http://localhost:5173/docs/.

## Layout

```
site/
  index.md           home page
  get-started/       getting started guides
  architecture/      system architecture
  reference/         product reference
  contributing/      contribution guidelines
  about/             project information
  .vitepress/        configuration and theme
```

## Adding a page

Write the markdown file under `site/` and add it to the sidebar in `site/.vitepress/config.mts`.

## Building

```
npm run build
```

Output goes to `site/.vitepress/dist`.

## Licence

Documentation prose under CC BY 4.0. Files under `deploy/` and `docker/` under AGPL-3.0-only, like the code (see deploy/LICENSE).
