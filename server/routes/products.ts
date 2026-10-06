import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { Product } from '../../src/types.js';

const router = Router();

// GET all products with filtering & search
router.get('/', (req, res) => {
  try {
    let products = db.getProducts();
    const { brand, surface, search, minPrice, maxPrice, featured, inStock } = req.query;

    if (brand && brand !== 'all') {
      products = products.filter((p) => p.brand.toLowerCase() === String(brand).toLowerCase());
    }

    if (surface && surface !== 'all') {
      products = products.filter((p) => p.surface.toUpperCase() === String(surface).toUpperCase());
    }

    if (featured === 'true') {
      products = products.filter((p) => p.featured);
    }

    if (inStock === 'true') {
      products = products.filter((p) => p.stock > 0);
    }

    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.descriptionAr.toLowerCase().includes(q)
      );
    }

    res.json(products);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'فشل في تحميل قائمة المنتجات' });
  }
});

// GET single product
router.get('/:id', (req, res) => {
  const product = db.findProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'المنتج غير موجود' });
    return;
  }
  res.json(product);
});

// POST create product (Admin only)
router.post('/', requireAuth, requireAdmin, (req: AuthRequest, res) => {
  try {
    const {
      name,
      nameAr,
      brand,
      surface,
      surfaceLabel,
      surfaceLabelAr,
      price,
      originalPrice,
      stock,
      sizes,
      description,
      descriptionAr,
      imageUrl,
      colorway,
      colorwayAr,
      weightGrams,
      featured,
    } = req.body;

    if (!name || !price || stock === undefined) {
      res.status(400).json({ error: 'يرجى إدخال اسم الحذاء والسعر والكمية المتوفرة' });
      return;
    }

    const defaultSizes = sizes || [
      { size: 40, stock: Math.floor(Number(stock) / 5) || 2 },
      { size: 41, stock: Math.floor(Number(stock) / 5) || 3 },
      { size: 42, stock: Math.floor(Number(stock) / 5) || 3 },
      { size: 43, stock: Math.floor(Number(stock) / 5) || 2 },
      { size: 44, stock: Math.floor(Number(stock) / 5) || 1 },
    ];

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: name.trim(),
      nameAr: nameAr ? nameAr.trim() : name.trim(),
      brand: brand || 'Nike',
      surface: surface || 'FG',
      surfaceLabel: surfaceLabel || 'Firm Ground',
      surfaceLabelAr: surfaceLabelAr || 'عشب طبيعي',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Number(stock),
      sizes: defaultSizes,
      description: description || '',
      descriptionAr: descriptionAr || description || '',
      imageUrl: imageUrl || '/src/assets/images/boot_predator_elite_1791312482666.jpg',
      colorway: colorway || 'Black / White',
      colorwayAr: colorwayAr || 'أسود / أبيض',
      weightGrams: Number(weightGrams) || 200,
      featured: Boolean(featured),
      rating: 4.8,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    const saved = db.createProduct(newProduct);
    res.status(201).json({ message: 'تمت إضافة الحذاء بنجاح إلى المتجر', product: saved });
  } catch (err: any) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'فشل في حفظ المنتج الجديد' });
  }
});

// PUT update product (Admin only)
router.put('/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const existing = db.findProductById(id);
    if (!existing) {
      res.status(404).json({ error: 'المنتج غير موجود' });
      return;
    }

    const updates = req.body;
    if (updates.price) updates.price = Number(updates.price);
    if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.weightGrams) updates.weightGrams = Number(updates.weightGrams);

    const updated = db.updateProduct(id, updates);
    res.json({ message: 'تم تحديث بيانات الحذاء بنجاح', product: updated });
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'فشل في تحديث بيانات المنتج' });
  }
});

// DELETE product (Admin only)
router.delete('/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const success = db.deleteProduct(id);
    if (!success) {
      res.status(404).json({ error: 'المنتج غير موجود' });
      return;
    }
    res.json({ message: 'تم حذف الحذاء من المتجر بنجاح' });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'فشل في حذف المنتج' });
  }
});

export default router;
