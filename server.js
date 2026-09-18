/**
 * Startup file for cPanel's "Setup Node.js App" (Phusion Passenger).
 *
 * Passenger wants a single JS file it can require, not an npm script, so
 * this does what `next start` does. It hands Next the port Passenger picks
 * (process.env.PORT). CommonJS on purpose: Passenger's loader require()s
 * this file, and package.json declares no "type": "module".
 *
 * Run `npm run build` first. This serves the existing .next output and
 * never builds.
 */
const { createServer } = require("node:http");
const next = require("next");

// Not parseInt: under Passenger, PORT can be a socket path rather than a
// number, and listen() accepts either.
const port = process.env.PORT || 3000;
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> El Waha listening on ${port} (${process.env.NODE_ENV})`);
  });
});
