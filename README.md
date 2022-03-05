[![Build Status](https://travis-ci.com/tvkitchen/appliances.svg?branch=main)](https://travis-ci.com/tvkitchen/appliances)
[![codecov](https://codecov.io/gh/tvkitchen/appliances/branch/main/graph/badge.svg?token=YSKZPCG0JY)](https://codecov.io/gh/tvkitchen/appliances)

# TV Kitchen: Appliances

This monorepo contains all officially supported TV Kitchen appliances, as well as the `core` appliance which contains some universal appliance functionality.

## Driving Philosophy

Appliances are modular tools that can be used to process data streams within a given TV Kitchen implementation. They are loaded and managed by the TV Kitchen's `Countertop`.


It is possible to develop and use Appliances that are not contained in this repository. If you are interested in creating your own appliances and don't know where to start please create an issue in this repository to begin a discussion.

## Setting Up

```sh
yarn install
```

This will install project dependencies, link local sibling dependencies (we're using [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)), and build/transpile each package.

## About the TV Kitchen

TV Kitchen is a project of [Bad Idea Factory](https://biffud.com).  Learn more at [the TV Kitchen project site](https://tv.kitchen).
