import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Product, Order, InventoryLog } from '../src/types.js';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  products: Product[];
  orders: Order[];
  inventoryLogs: InventoryLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data with high quality football boots and realistic specs
const getInitialSeed = (): DatabaseSchema => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('1234', salt);
  const userPasswordHash = bcrypt.hashSync('1234', salt);

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr_admin_01',
      name: 'مسؤول المنصة (Admin)',
      email: 'admin@strick.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+201012345678',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_customer_01',
      name: 'أحمد علي (عميل مسجل)',
      email: 'user@strick.com',
      passwordHash: userPasswordHash,
      role: 'customer',
      phone: '+201098765432',
      createdAt: new Date().toISOString(),
    },
  ];

  const products: Product[] = [
    {
      id: 'prod_predator_elite',
      name: 'Adidas Predator Elite FT FG',
      nameAr: 'أديداس بريداتور إليت لسان مطوي (عشب طبيعي)',
      brand: 'Adidas',
      surface: 'FG',
      surfaceLabel: 'Firm Ground (Natural Grass)',
      surfaceLabelAr: 'عشب طبيعي جاف',
      price: 280,
      originalPrice: 320,
      stock: 14,
      sizes: [
        { size: 40, stock: 3 },
        { size: 41, stock: 4 },
        { size: 42, stock: 4 },
        { size: 43, stock: 2 },
        { size: 44, stock: 1 },
      ],
      description: 'Engineered for absolute strike precision. Features Strikeskin rubber fins on synthetic suede HybridTouch 2.0 upper with the iconic fold-over tongue and Controlframe 2.0 soleplate.',
      descriptionAr: 'مصمم لتحقيق أعلى درجات الدقة في التسديد والتحكم بالكرة. مزود بزعانف مطاطية Strikeskin مع تقنية HybridTouch 2.0 واللسان المطوي الكلاسيكي ونعل Controlframe 2.0 المتطور.',
      imageUrl: '/src/assets/images/boot_predator_elite_1791312482666.jpg',
      colorway: 'Solar Red / Core Black / Cloud White',
      colorwayAr: 'أحمر ناري / أسود ملكي / أبيض',
      weightGrams: 205,
      featured: true,
      rating: 4.9,
      reviewsCount: 38,
      createdAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'prod_mercurial_vapor',
      name: 'Nike Mercurial Vapor 16 Elite AG',
      nameAr: 'نايكي ميركوريال فابور 16 إليت (عشب صناعي)',
      brand: 'Nike',
      surface: 'AG',
      surfaceLabel: 'Artificial Grass',
      surfaceLabelAr: 'عشب صناعي معتمد',
      price: 275,
      originalPrice: 295,
      stock: 8,
      sizes: [
        { size: 41, stock: 2 },
        { size: 42, stock: 3 },
        { size: 43, stock: 2 },
        { size: 44, stock: 1 },
      ],
      description: 'Explosive acceleration with 3/4-length Air Zoom unit specifically tuned for artificial grass pitches. Gripknit upper delivers pinpoint ball control at breakneck speed.',
      descriptionAr: 'انطلاقة وانفجار في السرعة بفضل وسادة Air Zoom الممتدة على 3/4 طول الحذاء والمخصصة للعشب الصناعي. سطح Gripknit يمنحك لمسة استثنائية عند السرعات القصوى.',
      imageUrl: '/src/assets/images/boot_mercurial_vapor_1791312493344.jpg',
      colorway: 'Volt Yellow / Electric Blue / Chrome',
      colorwayAr: 'أصفر فسفوري / أزرق كهربائي / كروم',
      weightGrams: 182,
      featured: true,
      rating: 4.8,
      reviewsCount: 52,
      createdAt: '2026-03-05T12:00:00.000Z',
    },
    {
      id: 'prod_future_ultimate',
      name: 'Puma Future 7 Ultimate FG/AG',
      nameAr: 'بوما فيوتشر 7 التميت صانع الألعاب',
      brand: 'Puma',
      surface: 'FG',
      surfaceLabel: 'Firm Ground / Artifical Grass',
      surfaceLabelAr: 'ملاعب طبيعية وصناعية',
      price: 240,
      originalPrice: 260,
      stock: 19,
      sizes: [
        { size: 40, stock: 4 },
        { size: 41, stock: 5 },
        { size: 42, stock: 6 },
        { size: 43, stock: 3 },
        { size: 44, stock: 1 },
      ],
      description: 'Redefine game-winning vision. Re-engineered FUZIONFIT360 upper combines dual mesh, stretchy knit, and targeted PWRTAPE support for dynamic 360-degree lockdown without laces.',
      descriptionAr: 'أعد تعريف صناعة اللعب والحرية المطلقة. جزء علوي FUZIONFIT360 يجمع بين النسيج المرن وشريط PWRTAPE للثبات الحركي الديناميكي مع نعل Dynamic Motion الخفيف.',
      imageUrl: '/src/assets/images/boot_future_ultimate_1791312503846.jpg',
      colorway: 'Iridescent Purple / Sunset Cyan',
      colorwayAr: 'بنفسجي قزحي / سماوي متوهج',
      weightGrams: 198,
      featured: true,
      rating: 4.7,
      reviewsCount: 29,
      createdAt: '2026-03-10T09:30:00.000Z',
    },
    {
      id: 'prod_copa_pure',
      name: 'Adidas Copa Pure 2 Elite SG',
      nameAr: 'أديداس كوبا بيور 2 إليت (أرضيات لينة/أمطار)',
      brand: 'Adidas',
      surface: 'SG',
      surfaceLabel: 'Soft Ground (Muddy / Wet Grass)',
      surfaceLabelAr: 'أرضيات لينة وممطرة مسامير حديد',
      price: 250,
      originalPrice: 270,
      stock: 4, // low stock test
      sizes: [
        { size: 41, stock: 1 },
        { size: 42, stock: 2 },
        { size: 43, stock: 1 },
      ],
      description: 'Unmatched pure leather touch. Fusionskin quilted calf leather upper blends with interchangeable metal studs soleplate for superior stability on rain-soaked pitches.',
      descriptionAr: 'لمسة كلاسيكية فاخرة بجلد العجل الطبيعي بتقنية Fusionskin. مسامير معدنية قابلة للاستبدال لتحقيق أقصى ثبات على أرضيات الملاعب المبتلة واللينة.',
      imageUrl: '/src/assets/images/boot_predator_elite_1791312482666.jpg',
      colorway: 'Shadow Black / Lucid Red / Off White',
      colorwayAr: 'أسود مظلل / أحمر نقي / أوف وايت',
      weightGrams: 235,
      featured: false,
      rating: 4.6,
      reviewsCount: 19,
      createdAt: '2026-03-12T14:15:00.000Z',
    },
    {
      id: 'prod_phantom_gx2',
      name: 'Nike Phantom GX 2 Elite TF',
      nameAr: 'نايكي فانتوم جي إكس 2 إليت (ترتان/خماسي)',
      brand: 'Nike',
      surface: 'TF',
      surfaceLabel: 'Turf (Short Artificial Grass)',
      surfaceLabelAr: 'ترتان ملاعب خماسية وأرضيات صلبة',
      price: 190,
      originalPrice: 210,
      stock: 16,
      sizes: [
        { size: 39, stock: 3 },
        { size: 40, stock: 4 },
        { size: 41, stock: 4 },
        { size: 42, stock: 3 },
        { size: 43, stock: 2 },
      ],
      description: 'Precision targeting for small-sided matches. Nike Gripknit adhesive yarn covers the striking zone while React foam cushioning cushions impacts on hard artificial turf.',
      descriptionAr: 'دقة قناصة للمباريات الخماسية وملاعب الترتان. خيوط Gripknit تغطي منطقة التسديد مع فوم Nike React لامتصاص الصدمات على أرضيات الترتان القاسية.',
      imageUrl: '/src/assets/images/boot_mercurial_vapor_1791312493344.jpg',
      colorway: 'Metallic Silver / Black / Hyper Crimson',
      colorwayAr: 'فضي معدني / أسود / أحمر ناري',
      weightGrams: 218,
      featured: true,
      rating: 4.9,
      reviewsCount: 44,
      createdAt: '2026-03-15T16:00:00.000Z',
    },
    {
      id: 'prod_mizuno_morelia',
      name: 'Mizuno Morelia Neo IV Beta Japan FG',
      nameAr: 'ميزونو موريليا نيو 4 بيتا ميد إن جابان',
      brand: 'Mizuno',
      surface: 'FG',
      surfaceLabel: 'Firm Ground (Handcrafted in Japan)',
      surfaceLabelAr: 'عشب طبيعي - صناعة يدوية يابانية',
      price: 340,
      originalPrice: 360,
      stock: 6,
      sizes: [
        { size: 41, stock: 2 },
        { size: 42, stock: 2 },
        { size: 43, stock: 2 },
      ],
      description: 'The pinnacle of Japanese craftsmanship. Ultra-thin premium Kangaroo leather forefoot bonded to ultra-light engineered knit collar. Barefoot-feel velocity.',
      descriptionAr: 'قمة الحرفية اليابانية التقليدية. جلد كنغر فائق النعومة مع نسيج محبوك متطور يمنحك شعوراً يشبه اللعب حافي القدمين بأخف وزن ممكن.',
      imageUrl: '/src/assets/images/boot_future_ultimate_1791312503846.jpg',
      colorway: 'Pearl White / Gold Accent / Black',
      colorwayAr: 'أبيض لؤلؤي / ذهبي ملكي / أسود',
      weightGrams: 175,
      featured: true,
      rating: 5.0,
      reviewsCount: 18,
      createdAt: '2026-03-18T11:00:00.000Z',
    },
  ];

  const orders: Order[] = [
    {
      id: 'ord_1001',
      orderNumber: 'STRK-1001',
      userId: 'usr_customer_01',
      customerName: 'أحمد علي',
      customerEmail: 'user@strikers.com',
      customerPhone: '+201098765432',
      shippingAddress: {
        fullName: 'أحمد علي',
        phone: '+201098765432',
        city: 'القاهرة - المعادي',
        address: 'شارع 9، عمارة 14، الدور الثالث',
        postalCode: '11728',
      },
      items: [
        {
          productId: 'prod_predator_elite',
          name: 'Adidas Predator Elite FT FG',
          nameAr: 'أديداس بريداتور إليت لسان مطوي',
          price: 280,
          size: 42,
          quantity: 1,
          imageUrl: '/src/assets/images/boot_predator_elite_1791312482666.jpg',
        },
      ],
      subtotal: 280,
      shippingFee: 0,
      total: 280,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'paid',
      orderStatus: 'delivered',
      createdAt: '2026-03-20T14:22:00.000Z',
      updatedAt: '2026-03-22T10:00:00.000Z',
    },
    {
      id: 'ord_1002',
      orderNumber: 'STRK-1002',
      userId: 'usr_customer_01',
      customerName: 'طارق حامد',
      customerEmail: 'tarek@football.eg',
      customerPhone: '+201122334455',
      shippingAddress: {
        fullName: 'طارق حامد',
        phone: '+201122334455',
        city: 'الإسكندرية - سموحة',
        address: 'شارع فوزي معاذ، برج النور',
        postalCode: '21615',
      },
      items: [
        {
          productId: 'prod_mercurial_vapor',
          name: 'Nike Mercurial Vapor 16 Elite AG',
          nameAr: 'نايكي ميركوريال فابور 16 إليت',
          price: 275,
          size: 43,
          quantity: 1,
          imageUrl: '/src/assets/images/boot_mercurial_vapor_1791312493344.jpg',
        },
        {
          productId: 'prod_phantom_gx2',
          name: 'Nike Phantom GX 2 Elite TF',
          nameAr: 'نايكي فانتوم جي إكس 2 إليت (ترتان)',
          price: 190,
          size: 43,
          quantity: 1,
          imageUrl: '/src/assets/images/boot_mercurial_vapor_1791312493344.jpg',
        },
      ],
      subtotal: 465,
      shippingFee: 0,
      total: 465,
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      orderStatus: 'shipped',
      createdAt: '2026-03-28T16:45:00.000Z',
      updatedAt: '2026-03-29T11:20:00.000Z',
    },
    {
      id: 'ord_1003',
      orderNumber: 'STRK-1003',
      userId: 'usr_customer_01',
      customerName: 'كريم مصطفى',
      customerEmail: 'karim@fc.eg',
      customerPhone: '+201233445566',
      shippingAddress: {
        fullName: 'كريم مصطفى',
        phone: '+201233445566',
        city: 'الجيزة - الشيخ زايد',
        address: 'كمبوند الياسمين، فيلا 22',
        postalCode: '12588',
      },
      items: [
        {
          productId: 'prod_future_ultimate',
          name: 'Puma Future 7 Ultimate FG/AG',
          nameAr: 'بوما فيوتشر 7 التميت صانع الألعاب',
          price: 240,
          size: 41,
          quantity: 1,
          imageUrl: '/src/assets/images/boot_future_ultimate_1791312503846.jpg',
        },
      ],
      subtotal: 240,
      shippingFee: 0,
      total: 240,
      paymentMethod: 'vodafone_cash',
      paymentStatus: 'paid',
      orderStatus: 'processing',
      createdAt: '2026-04-02T09:15:00.000Z',
      updatedAt: '2026-04-02T10:00:00.000Z',
    },
    {
      id: 'ord_1004',
      orderNumber: 'STRK-1004',
      userId: 'usr_customer_01',
      customerName: 'محمد عبد الله',
      customerEmail: 'm.abdallah@sport.eg',
      customerPhone: '+201011228899',
      shippingAddress: {
        fullName: 'محمد عبد الله',
        phone: '+201011228899',
        city: 'المنصورة - حي الجامعة',
        address: 'شارع جيهان، برج التميز',
        postalCode: '35511',
      },
      items: [
        {
          productId: 'prod_copa_pure',
          name: 'Adidas Copa Pure 2 Elite SG',
          nameAr: 'أديداس كوبا بيور 2 إليت',
          price: 250,
          size: 42,
          quantity: 1,
          imageUrl: '/src/assets/images/boot_predator_elite_1791312482666.jpg',
        },
      ],
      subtotal: 250,
      shippingFee: 0,
      total: 250,
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      createdAt: '2026-04-05T18:30:00.000Z',
      updatedAt: '2026-04-05T18:30:00.000Z',
    },
  ];

  const inventoryLogs: InventoryLog[] = [
    {
      id: 'inv_01',
      productId: 'prod_predator_elite',
      productName: 'Adidas Predator Elite FT FG',
      changeAmount: 15,
      previousStock: 0,
      newStock: 15,
      reason: 'شحنة واردة جديدة من المصنع',
      updatedBy: 'محمود الشناوي',
      timestamp: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'inv_02',
      productId: 'prod_predator_elite',
      productName: 'Adidas Predator Elite FT FG',
      changeAmount: -1,
      previousStock: 15,
      newStock: 14,
      reason: 'بيع طلب رقم STRK-1001',
      updatedBy: 'النظام الآلي',
      timestamp: '2026-03-20T14:22:00.000Z',
    },
    {
      id: 'inv_03',
      productId: 'prod_copa_pure',
      productName: 'Adidas Copa Pure 2 Elite SG',
      changeAmount: -1,
      previousStock: 5,
      newStock: 4,
      reason: 'بيع طلب رقم STRK-1004 (مخزون منخفض)',
      updatedBy: 'النظام الآلي',
      timestamp: '2026-04-05T18:30:00.000Z',
    },
  ];

  return { users, products, orders, inventoryLogs };
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.products && parsed.orders) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Error reading db.json, re-seeding default database:', err);
    }

    const initial = getInitialSeed();
    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to db.json:', err);
    }
  }

  private save() {
    this.saveDataDirect(this.data);
  }

  // Users
  getUsers() {
    return this.data.users;
  }

  findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Products
  getProducts() {
    return this.data.products;
  }

  findProductById(id: string) {
    return this.data.products.find((p) => p.id === id);
  }

  createProduct(product: Product) {
    this.data.products.unshift(product);
    this.addInventoryLog({
      id: `inv_${Date.now()}`,
      productId: product.id,
      productName: product.name,
      changeAmount: product.stock,
      previousStock: 0,
      newStock: product.stock,
      reason: 'إضافة منتج جديد للمتجر',
      updatedBy: 'المدير',
      timestamp: new Date().toISOString(),
    });
    this.save();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>) {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const oldProduct = this.data.products[index];
    const newStock = updates.stock !== undefined ? updates.stock : oldProduct.stock;
    
    if (updates.stock !== undefined && updates.stock !== oldProduct.stock) {
      this.addInventoryLog({
        id: `inv_${Date.now()}`,
        productId: id,
        productName: updates.name || oldProduct.name,
        changeAmount: newStock - oldProduct.stock,
        previousStock: oldProduct.stock,
        newStock: newStock,
        reason: 'تعديل يدوي للمخزون من قبل المدير',
        updatedBy: 'المدير',
        timestamp: new Date().toISOString(),
      });
    }

    const updated = {
      ...oldProduct,
      ...updates,
      id, // keep immutable id
    };

    this.data.products[index] = updated;
    this.save();
    return updated;
  }

  deleteProduct(id: string) {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    this.data.products.splice(index, 1);
    this.save();
    return true;
  }

  // Orders
  getOrders() {
    return this.data.orders;
  }

  findOrderById(id: string) {
    return this.data.orders.find((o) => o.id === id);
  }

  getOrdersByUserId(userId: string) {
    return this.data.orders.filter((o) => o.userId === userId);
  }

  createOrder(order: Order) {
    // Atomically decrement stock for each ordered item
    order.items.forEach((item) => {
      const product = this.findProductById(item.productId);
      if (product) {
        const prevStock = product.stock;
        const newStock = Math.max(0, prevStock - item.quantity);
        product.stock = newStock;
        
        // Decrement size stock if present
        if (product.sizes) {
          const sizeItem = product.sizes.find((s) => s.size === item.size);
          if (sizeItem) {
            sizeItem.stock = Math.max(0, sizeItem.stock - item.quantity);
          }
        }

        this.addInventoryLog({
          id: `inv_${Date.now()}_${item.productId}`,
          productId: product.id,
          productName: product.name,
          changeAmount: -item.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `طلب بيع جديد #${order.orderNumber}`,
          updatedBy: 'النظام الآلي',
          timestamp: new Date().toISOString(),
        });
      }
    });

    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  updateOrderStatus(orderId: string, status: Order['orderStatus']) {
    const order = this.findOrderById(orderId);
    if (!order) return null;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'delivered') {
      order.paymentStatus = 'paid';
    }
    this.save();
    return order;
  }

  // Inventory logs
  getInventoryLogs() {
    return this.data.inventoryLogs;
  }

  addInventoryLog(log: InventoryLog) {
    this.data.inventoryLogs.unshift(log);
    // keep latest 100 logs
    if (this.data.inventoryLogs.length > 100) {
      this.data.inventoryLogs.pop();
    }
  }

  // Reset to initial demo data
  resetDemoData() {
    this.data = getInitialSeed();
    this.save();
    return this.data;
  }
}

export const db = new DatabaseManager();
