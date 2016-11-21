#!/bin/bash

cd demo/public/media-center

git init

git config --global user.email

if [ $? != 0 ]; then
  git config --global user.email "travis@ewnd9.com"
  git config --global user.name "Travis-CI"
fi

git add .
git commit -m "Deploy to GitHub Pages ${TRAVIS_COMMIT}"

git push --force "https://${GH_TOKEN}@github.com/${TRAVIS_REPO_SLUG}.git" master:gh-pages
