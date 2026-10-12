# qvark — Developer

A small, dark portfolio built with React and Vite. It includes a rolling year of public coding activity, focus areas, an about section, profile links, and a downloadable resume.

## Run locally

```sh
npm install
npm run dev
```

Vite prints the local address after the dev server starts.

## Build and preview

```sh
npm run build
npm run preview
```

## Lint

```sh
npm run lint
```

The activity heatmap reads public data from Codeforces, AtCoder Problems, and a community LeetCode API. Those services can be temporarily unavailable or change their APIs; the rest of the portfolio remains usable without them. Update the handles in `src/App.jsx` if the public usernames change.

The resume is `resume.pdf` in the project root. Replace that file to update the download.
