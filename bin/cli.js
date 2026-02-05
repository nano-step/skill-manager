#!/usr/bin/env node

const { run } = require("../dist/index.js");

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
