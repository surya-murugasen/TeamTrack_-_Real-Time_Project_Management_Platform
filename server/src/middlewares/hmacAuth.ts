import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const MAX_DRIFT_MS = 5 * 60 * 1000;

export const verifyHmac = (req: Request, res: Response, next: NextFunction): void => {
  const secret = process.env.ADMIN_INTEGRATION_SECRET;
  if (!secret) {
    console.error("ADMIN_INTEGRATION_SECRET is not configured");
    res.status(500).json({ error: "Server misconfiguration" });
    return;
  }

  const signature = req.headers['x-admin-signature'] as string;
  const timestamp = req.headers['x-admin-timestamp'] as string;
  const nonce = req.headers['x-admin-nonce'] as string;

  if (!signature || !timestamp || !nonce) {
    res.status(401).json({ error: "Missing authentication headers" });
    return;
  }

  const reqTime = parseInt(timestamp, 10);
  if (isNaN(reqTime)) {
    res.status(401).json({ error: "Invalid timestamp" });
    return;
  }

  const now = Date.now();
  if (Math.abs(now - reqTime) > MAX_DRIFT_MS) {
    res.status(401).json({ error: "Request expired (timestamp drift)" });
    return;
  }

  const canonicalString = `${req.method.toUpperCase()}\n${req.path}\n${timestamp}\n${nonce}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(canonicalString)
    .digest('hex');

  let isValid = false;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (e) {
    res.status(401).json({ error: "Invalid signature format" });
    return;
  }

  if (!isValid) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  next();
};
