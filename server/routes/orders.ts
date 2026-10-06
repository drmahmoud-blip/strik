import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin, optionalAuth, AuthRequest } from '../middleware/auth.js';
import { Order, OrderItem } from '../../src/types.js';

const router = Router();

// Create new order (can be customer authenticated or guest/registered)
router.post('/', optionalAuth, (req: AuthRequest, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'سلة المشتريات فارغة' });
      return;
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city || !shippingAddress.address) {
      res.status(400).json({ error: 'يرجى استكمال جميع بيانات عنوان التوصيل ورقم الهاتف' });
      return;
    }

    // Verify stock availability
    for (const item of items) {
      const product = db.findProductById(item.productId);
      if (!product) {
        res.status(400).json({ error: `المنتج ${item.name} لم يعد متوفراً` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({
          error: `الكمية المطلوبة من الحذاء (${product.nameAr || product.name}) غير متوفرة في المخزون (المتبقي: ${product.stock})`,
        });
        return;
      }
    }

    const subtotal = items.reduce((sum: number, it: OrderItem) => sum + it.price * it.quantity, 0);
    const shippingFee = subtotal > 200 ? 0 : 15; // Free shipping above $200
    const total = subtotal + shippingFee;

    const orderNumber = `STRK-${Math.floor(1000 + Math.random() * 9000)}`;
    const userId = req.user ? req.user.id : `guest_${Date.now()}`;
    const customerEmail = req.user ? req.user.email : shippingAddress.email || 'customer@guest.com';

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      userId,
      customerName: shippingAddress.fullName,
      customerEmail,
      customerPhone: shippingAddress.phone,
      shippingAddress,
      items,
      subtotal,
      shippingFee,
      total,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      paymentStatus: paymentMethod === 'credit_card' || paymentMethod === 'vodafone_cash' || paymentMethod === 'instapay' ? 'paid' : 'pending',
      orderStatus: 'pending',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = db.createOrder(newOrder);
    res.status(201).json({
      message: 'تم تأكيد طلبك بنجاح! شكراً لاختيارك منصة StrikeElite',
      order: saved,
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء معالجة الطلب' });
  }
});

// GET orders (Admin gets all, Customer gets theirs)
router.get('/', requireAuth, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    if (req.user.role === 'admin') {
      const orders = db.getOrders();
      res.json(orders);
    } else {
      const userOrders = db.getOrdersByUserId(req.user.id);
      res.json(userOrders);
    }
  } catch (err: any) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'فشل في تحميل الطلبات' });
  }
});

// GET order by ID
router.get('/:id', requireAuth, (req: AuthRequest, res) => {
  const order = db.findOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'الطلب غير موجود' });
    return;
  }

  if (req.user?.role !== 'admin' && order.userId !== req.user?.id) {
    res.status(403).json({ error: 'غير مصرح لك بعرض هذا الطلب' });
    return;
  }

  res.json(order);
});

// PATCH order status (Admin only)
router.patch('/:id/status', requireAuth, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: 'حالة الطلب غير صالحة' });
      return;
    }

    const updated = db.updateOrderStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: 'الطلب غير موجود' });
      return;
    }

    res.json({ message: 'تم تحديث حالة الطلب بنجاح', order: updated });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'فشل في تحديث حالة الطلب' });
  }
});

export default router;
