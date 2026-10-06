import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'strike_elite_jwt_secure_super_secret_2026';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const generateToken = (user: AuthenticatedUser): string => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً (No token provided)' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'انتهت صلاحية الجلسة أو الرمز غير صالح (Invalid or expired token)' });
  }
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // ignore optional auth errors
    }
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'غير مسموح: هذه الصفحة والعمليات مخصصة لمدير المنصة فقط (Admin Only)' });
    return;
  }

  next();
};
