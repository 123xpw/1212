import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends ExpressRequest {
  user?: { id: number; username: string };
}

export const authenticateToken = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_super_secret_key';
    const decoded = jwt.verify(token, secret) as { id: number; username: string };
    (req as AuthRequest).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token.' });
    return;
  }
};