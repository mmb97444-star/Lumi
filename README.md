# Lumi LINE Sticker Generator

This repository contains a static LINE sticker generator web app in `public/`.

## Local preview

```bash
npm run dev
```

Open <http://localhost:5173/>.


## Render deployment

This repo includes `render.yaml`, so Render can host the static web version directly from the `public/` folder.

### One-time Render setup

1. Push this branch to GitHub.
2. Open Render and choose **New → Blueprint**.
3. Connect this repository and select the branch that contains `render.yaml`.
4. Render will run `npm run build` and publish `./public`.
5. After deployment, open the Render URL on macOS or mobile and use the app in the browser.

Manual Render setup also works with:

```text
Build Command: npm run build
Publish Directory: public
```

## GitHub Pages deployment

A GitHub Actions workflow is included at `.github/workflows/deploy-pages.yml`.
After this branch is merged into `main`, GitHub Pages can publish the app automatically.

### One-time GitHub setup

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push or merge to `main`, or run the **Deploy static site to GitHub Pages** workflow manually.
5. Open the workflow run and use the deployed `github-pages` URL.

The final URL is usually:

```text
https://<github-username>.github.io/<repository-name>/
```

Because the app uses relative asset paths, it works both locally and under a GitHub Pages repository subpath.

## Mobile usage notes

- The page is responsive and can be opened directly from a phone browser after GitHub Pages deploys it.
- The reference image picker accepts up to 10 images from a phone album.
- For real-person or realistic photos, use **真人 / 寫實照片轉換** and choose hand-drawn, chibi, literary, watercolor, or comic style before generating stickers.
