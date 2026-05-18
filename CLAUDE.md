# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Insta-Idol is a personal photo/video gallery built with Eleventy (11ty), hosted on Netlify, with media served from Cloudinary. It replaces Instagram as a self-hosted archive and display layer.

## Commands

```bash
npm start        # Dev server with live reload (Eleventy --serve)
npm run build    # Production build (also generates Netlify auth headers)
```

No test suite exists.

## Architecture

### Data Flow

1. User visits `/upload` (basic-auth protected) and submits media
2. Browser uploads file directly to Cloudinary; the signed upload preset is configured in the Cloudinary dashboard
3. Cloudinary URL is POSTed to the Netlify function `upload-media.js`
4. The function prepends a new entry to `_src/_data/posts.json` via the GitHub API and commits it
5. Netlify detects the commit and rebuilds; Eleventy paginates `posts.json` into static HTML
6. Media is served from Cloudinary CDN with URL-based transforms (`q_auto`, `f_auto`)

### Key Files

| Path | Role |
|------|------|
| `_src/_data/posts.json` | Single source of truth for all posts (title, timestamp, media URLs) |
| `_src/index.md` | Main gallery page — pagination (12/page), grid/list toggle |
| `_src/_includes/base.njk` | Root HTML layout |
| `_src/js/scripts.js` | All client-side logic: upload flow, modal/carousel, view toggle |
| `_src/css/style.css` | Responsive styles; uses native CSS nesting |
| `netlify/functions/upload-media.js` | Serverless function: receives Cloudinary URL, updates posts.json in GitHub, triggers rebuild |
| `.eleventy.js` | Build config: image transforms, custom filters (`limit`, `postDate`, `optimize`) |
| `generate-headers.js` | Runs at build time to write `_headers` with basic-auth credentials from env |
| `netlify.toml` | Netlify build and functions config |

### Environment Variables (`.env`)

```
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
GITHUB_TOKEN          # PAT with repo write access
GITHUB_OWNER
GITHUB_REPO
NETLIFY_BUILD_HOOK    # URL that triggers a rebuild
BASIC_AUTH_USERNAME
BASIC_AUTH_PASSWORD
```

### posts.json Schema

Each post object:
```json
{
  "timestamp": "2025-01-15T10:30:00",
  "title": "Optional caption",
  "media": [
    { "type": "image|video", "url": "https://res.cloudinary.com/..." }
  ]
}
```

Posts are stored newest-first. The Eleventy `limit` filter caps display; `optimize` rewrites Cloudinary URLs for quality/format transforms.

### Setup Utilities

`_src/setup-examples/` contains one-time Python scripts used to bulk-import Instagram exports to Cloudinary — not part of the normal workflow.
