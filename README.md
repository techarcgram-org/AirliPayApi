## Description

API for AIRLIPAY


## Access

The staging server can be accessed [here](http://195.154.118.26:3000/) 

The staging server logs for staging can be access on Grafana [here](http://195.154.118.26:3200/)

```
username: admin
```
```
password: admin
```

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Migrations

# Initialize Prisma (if not initialized)
```
npx prisma init
```


# Create and run migrations
```
npx prisma migrate dev -- <name of migration here> init
```

```
npx prisma migrate deploy
```


# View database with prisma

```
sudo npx prisma studio
```

## Local dev with Docker-compose

Install Docker Desktop and Docker Compose

Start the dev server:

```
npm run docker:dev:start
```

To run migrations:

```
npm run docker:compose:migrate:up
```

## How to deploy to Prod

To create a new release, perform the following actions:

- Create a pull-request to merge develop into master with title `chore: merge develop into master`
- Merge the PR in step (1) above.
- When anything is merged to master, a semantic release bot will create a release and tag it.
- Once the new release is created, an automatic deploy action is triggered.
  You can monitor the release deploy using the actions tab [here]()

🤝 **How to contribute**

If you want to contribute, please refer to our Contribution Guide: [Contribution Guide](https://github.com/techarcgram-org/AirliPayApi/blob/main/GUIDELINES.md).
