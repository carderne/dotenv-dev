# dotenv-dev

Make it a bit harder to inject prod secrets into your local dev, when you don't mean to.

## Quickstart
```bash
npm install --save-dev dotenv-dev
```

Update your script from:
```json
"db:push": "dotenv npx drizzle-kit push"
```

To:
```json
"db:push": "dotenv-dev DB_URL -i localhost -- npx drizzle-kit push"
```

## All options
```bash
Validates that an environment variables contain (--include) or does
not contain (--exclude) specific strings before executing a script.

Usage:
  dotenv-dev <KEY> [options] -- <script> [args...]

Arguments:
  KEY                    Environment variable name to validate

Options:
  -i, --include <str>    KEY must contain this string to continue
  -x, --exclude <str>    KEY must NOT contain this string to continue
  -f, --file <path>      Env file to load (default: .env)

At least one of --include or --exclude is required.

Examples:
  dotenv-dev DATABASE_URL -i localhost -- npm start
  dotenv-dev DATABASE_URL -x production -- ./deploy.sh
  dotenv-dev API_KEY -i dev -x prod -f .env.test -- npm test
```
