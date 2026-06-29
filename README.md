# Lumi LINE Sticker Generator

This repository contains a static LINE sticker generator web app in `public/`. It is already prepared for Render hosting, so Mac users can open the app from a normal browser URL instead of opening the old ZIP package.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mmb97444-star/Lumi)

> 需要「本機不開機也可以使用」時，請部署到 Render。部署完成後，請使用 Render 產生的 `.onrender.com` 網址；那個網址在你的 Mac 關機時仍可開啟。


## Local preview

```bash
npm run dev
```

Open <http://localhost:5173/>.


## Render deployment

This repo includes `render.yaml`, so Render can host the static web version directly from the `public/` folder. This is the web version you need when the app must stay available even while your local computer is turned off.

### One-time Render setup

1. Push this branch to GitHub, GitLab, or Bitbucket.
2. Open Render and choose **New → Blueprint**.
3. Connect this repository and select the branch that contains `render.yaml`.
4. Render will read `render.yaml`, run `npm run build`, and publish `./public`.
5. Copy the generated `https://<service-name>.onrender.com` URL and open it on macOS or mobile in the browser. This is the permanent web link to share/use when your local machine is off.

> Note: this environment does not contain a connected Render account or deploy token, so the final dashboard click must be done from the Render workspace that owns the site. The repo is configured so that step is just the Blueprint import.


### If you create a Static Site manually

Use these values in **New → Static Site**:

| Render field | Value |
| --- | --- |
| Runtime / Type | Static Site |
| Build Command | `npm run build` |
| Publish Directory | `public` |
| Branch | The branch containing this commit |
| Auto-Deploy | Enabled |

After Render finishes the first deploy, share the `.onrender.com` URL with Mac users.


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
