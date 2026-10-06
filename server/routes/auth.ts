import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'يرجى إدخال الاسم والبريد الإلكتروني وكلمة المرور بالكامل' });
      return;
    }

    if (password.length < 4) {
      res.status(400).json({ error: 'يجب أن لا تقل كلمة المرور عن 4 أحرف أو أرقام' });
      return;
    }

    if (email.trim().toLowerCase() === 'admin@strick.com') {
      res.status(409).json({ error: 'حساب المسؤول محجوز مسبقاً، يرجى تسجيل الدخول مباشرة' });
      return;
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    // Any newly registered user from the registration form is a customer
    const userRole = 'customer';

    const newUser = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: userRole as 'admin' | 'customer',
      phone: phone || '',
      createdAt: new Date().toISOString(),
    };

    db.createUser(newUser);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
    };

    const token = generateToken(safeUser);

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء إنشاء الحساب' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'يرجى كتابة البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    const token = generateToken(safeUser);

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
});

// Current authenticated user profile
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'غير مصرح' });
    return;
  }

  const user = db.findUserById(req.user.id);
  if (!user) {
    res.status(404).json({ error: 'المستخدم غير موجود' });
    return;
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    },
  });
});

// Re-seed demo data
router.post('/seed-demo', (_req, res) => {
  const seeded = db.resetDemoData();
  res.json({
    message: 'تمت إعادة تهيئة البيانات النموذجية بنجاح',
    productsCount: seeded.products.length,
    ordersCount: seeded.orders.length,
  });
});

export default router;
