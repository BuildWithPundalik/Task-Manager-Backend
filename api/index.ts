// api/index.ts for Vercel serverless function entry point
import app from "../src/index";
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
