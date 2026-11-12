# lazyfill landing page

The public website for lazyfill: what it does, how it works, and links to the repository and the setup guide. It is a
small standalone Next.js (App Router) and Tailwind project, separate from the extension, with its own `package.json`.
The page is prerendered as static HTML at build time; screenshots are served through `next/image`, so visitors get
resized AVIF or WebP versions.

## Work on it locally

```sh
cd site
npm install
npm run dev        # http://localhost:3000
npm run build      # production build into site/.next
npm start          # serve the production build
npm run typecheck  # TypeScript only
```

Content lives in [`app/page.tsx`](app/page.tsx); title, description and social preview metadata in
[`app/layout.tsx`](app/layout.tsx); styles and colour tokens in [`app/globals.css`](app/globals.css). Screenshots are in [`public/screenshots`](public/screenshots); they are
copies of the ones in `docs/screenshots`, so refresh them here when those change (`npm run screenshots` in the repository
root regenerates the originals). Colours match the extension's design tokens and follow the visitor's light or dark
system setting.

## How deployment works

Vercel builds and deploys the site straight from GitHub, through its Git integration. No GitHub Actions workflow and
no secrets are involved.

- A push to `main` that changes something under `site/` is deployed to production.
- Pull requests and other branches that change `site/` get their own preview address, posted on the pull request.
- Commits that only touch the extension, the docs or anything else outside `site/` are skipped. That is the
  `ignoreCommand` in [`vercel.json`](vercel.json): Vercel runs it from the Root Directory, and when
  `git diff HEAD^ HEAD -- .` finds no change inside `site/` the build is cancelled before it starts.

The CI workflow also builds the site on every pull request, so a broken page is caught before it reaches `main`.

## One-time setup

You need a Vercel account (the free Hobby plan is enough) and access to the GitHub repository.

1. On [vercel.com/new](https://vercel.com/new) choose **Import Git Repository** and pick this repository. Allow the
   Vercel GitHub app to access it if asked.
2. Press **Edit** next to **Root Directory** and choose `site`.
3. The framework is detected as **Next.js**. Leave the build and output settings as they are.
4. Press **Deploy**. The first deployment takes a minute; the address appears when it is done.
5. Optional: under the project's **Settings, Domains**, add a custom domain. Then add an environment variable
   `NEXT_PUBLIC_SITE_URL` with that address (for example `https://lazyfill.example.com`) under **Settings,
   Environment Variables**, for Production, and redeploy, so link previews on social sites use your domain.

**Check the skip rule works.** Push a commit that changes only a file outside `site/`, for example the root README. The
project's **Deployments** tab lists it as **Canceled** by the Ignored Build Step. A commit that changes `site/` builds
normally.

## Troubleshooting

| Problem | Fix |
|---|---|
| The build cannot find `package.json` or `next` | The project's **Root Directory** must be `site` (**Settings, Build and Deployment**). |
| A push did not deploy | Only changes under `site/` deploy; other commits show as canceled. To deploy anyway, open the latest deployment and choose **Redeploy**. |
| Every commit builds, even outside `site/` | The project is not reading `site/vercel.json`. Check the Root Directory, or set **Settings, Git, Ignored Build Step** to `git diff --quiet HEAD^ HEAD -- .` |
| No preview on a pull request | Check that the Vercel GitHub app has access to the repository (GitHub **Settings, Applications**). |
| Social previews show a vercel.app address | Set the environment variable `NEXT_PUBLIC_SITE_URL` (for example `https://lazyfill.example.com`) in the Vercel project for Production, then redeploy. |
