# AppCompass Authentication Service

## Description

AppCompass Authentication Service provides authentication, token signing, and token verification resources to a platform that uses this service's interface contract for use.

## First Time Setup

```bash

$ npm install
$ npm run generate:keys

```

### For Local Development

```bash

$ npm run generate:dotenv

```

Then modify the `local.env` file as needed if the default values don't work for you.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

AppCompass Authentication Service is [MIT licensed](LICENSE).
