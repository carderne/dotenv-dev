/* global process */

import { spawn } from "child_process";
import dotenv from "dotenv";
import minimist from "minimist";

const HELP = `dotenv-dev

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
`;

function dotenvdev() {
  const args = process.argv.slice(2);
  const separatorIndex = args.indexOf("--");

  if (separatorIndex === -1 || separatorIndex === args.length - 1) {
    console.error(HELP);
    process.exit(1);
  }

  const argv = minimist(args.slice(0, separatorIndex), {
    string: ["include", "exclude", "file"],
    alias: { i: "include", x: "exclude", f: "file" },
    default: { file: ".env" },
  });

  const KEY = argv._[0];
  const scriptArgs = args.slice(separatorIndex + 1);

  if (!KEY || argv._.length > 1) {
    console.error(HELP);
    process.exit(1);
  }

  if (!argv.include && !argv.exclude) {
    console.error(HELP);
    process.exit(1);
  }

  const validOptions = ["include", "exclude", "file", "i", "x", "f", "_"];
  const providedOptions = Object.keys(argv);
  const invalidOptions = providedOptions.filter((opt) => !validOptions.includes(opt));

  if (invalidOptions.length > 0) {
    console.error(HELP);
    process.exit(1);
  }

  const { error, parsed } = dotenv.config({ path: argv.file, quiet: true });
  if (error !== undefined) {
    throw error;
  }

  if (parsed === undefined) {
    console.error("No dotenv output. Aborting.");
    process.exit(1);
  }

  if (!(KEY in parsed)) {
    console.error(`${KEY} not in .env. Aborting.`);
    process.exit(1);
  }

  if (argv.include && !parsed[KEY].includes(argv.include)) {
    console.error(`${KEY} does not contain "${argv.include}". Aborting.`);
    process.exit(1);
  }

  if (argv.exclude && parsed[KEY].includes(argv.exclude)) {
    console.error(`${KEY} contains "${argv.exclude}". Aborting.`);
    process.exit(1);
  }

  const child = spawn(scriptArgs[0], scriptArgs.slice(1), {
    env: { ...process.env, ...parsed },
    stdio: "inherit",
  });

  child.on("error", (err) => {
    if (err.code === "ENOENT") {
      console.error(`Command not found: ${scriptArgs[0]}`);
    } else {
      console.error(`Failed to start script: ${err.message}`);
    }
    process.exit(1);
  });

  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

dotenvdev();
