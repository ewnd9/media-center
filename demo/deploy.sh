#!/bin/sh

cd demo/public/media-center

git init

git add .
git commit \
  -m "Deploy to GitHub Pages ${TRAVIS_COMMIT}" \
  --author="Travis-CI <travis@ewnd9.com>"

git push --force "https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git" master:gh-pages
