# First of all push this code for other repo!!

# Development launch
1. `git clone ...`
2. `yarn install`
3. Copy `.env_example` to `.env` file and `src/config/config_example.js` to `src/config/config.js`
4. `yarn dev:start`
5. `yarn dev:prisma-deploy`
6. `yarn dev:start-app`

# Production launch
1. `git clone ...`
2. `yarn prod:build`
3. `yarn prod:init`
4. Edit `config.js` and `.env` files
5. `yarn prod:up`



# Dependencies description

* **agenda** - Job manager
* **agendash** - Web interface for Agenda, by default available at `/jobs_dashboard` endpoint
* **argon2** - Hashing algorithm
* **redis** - Server-side in-memory database for data cache
* **express-rate-limit** - Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.
* **graphql-cost-analysis** - A GraphQL request cost analyzer. This can be used to protect GraphQL servers against DoS attacks, compute the data consumption per user and limit it.
* **graphql-import** - Import & export definitions in GraphQL SDL (Schema Definition Language)
* **graphql-shield** - A GraphQL tool to ease the creation of permission layer
* **graphql-yoga** - Main GraphQL server
* **prisma-client-lib** - This package includes all dependencies besides `graphql` needed in order to run Prisma client in JavaScript, TypeScript and Flow.
