// api/index.ts for Vercel serverless function entry point
const app = require("../dist/index.js").default;

export default function handler(req, res) {
  return app(req, res);
}
