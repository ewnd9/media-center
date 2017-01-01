include .env
export $(shell sed 's/=.*//' .env)

export PLAYER=mock

export TRAKT_ID=412681ab85026009c32dc6e525ba6226ff063aad0c1a374def0c8ee171cf121f
export TRAKT_SECRET=714f0cb219791a0ecffec788fd7818c601397b95b2b3e8f486691366954902fb
export TMDB_KEY=d3350c6d641ee4f16f94a6c0b3b809d1

DEV_COMPOSE = docker-compose -f provision/docker-compose-base-arm.yml -f provision/docker-compose-dev.yml
DEV_COMPOSE_RUN = ${DEV_COMPOSE} run --no-deps app

start:
	@$(DEV_COMPOSE) up

exec:
	@$(DEV_COMPOSE) exec app /bin/bash

install:
	@$(DEV_COMPOSE_RUN) yarn install

build:
	@$(DEV_COMPOSE_RUN) yarn build

lint:
	@$(DEV_COMPOSE_RUN) yarn lint

test:
	@$(DEV_COMPOSE_RUN) yarn test -- $(t)

yarn:
	@$(DEV_COMPOSE_RUN) yarn $(c)

test-travis:
	@$(DEV_COMPOSE_RUN) yarn lint
	@$(DEV_COMPOSE_RUN) yarn test:cov
	@$(DEV_COMPOSE_RUN) yarn build:demo

.PHONY: start exec install build lint test test-travis
