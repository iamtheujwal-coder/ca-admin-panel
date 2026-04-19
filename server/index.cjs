const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

app.use(cors());
app.use(express.json());

console.log('--- Startup Config ---');
console.log('Current Directory:', process.cwd());
console.log('Database URL:', process.env.DATABASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('----------------------');

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// --- Routes ---

// 1. Initial Setup: Create Admin (Run once)
app.post('/api/setup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) return res.status(400).json({ error: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    res.json({ message: 'Admin created successfully', user: { id: admin.id, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Login (Admin and Client)
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    
    // DEMO MODE: If DB is empty or fails, allow demo@anand.com / admin123
    if (!user && email === 'demo@anand.com' && password === 'admin123') {
      user = { id: 'demo-admin', email: 'demo@anand.com', role: 'ADMIN' };
    }

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.role !== role) return res.status(400).json({ error: 'Invalid role for this account' });
    
    if (user.id !== 'demo-admin') {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // For clients, fetch their profile
    let profile = null;
    if (user.role === 'CLIENT') {
       profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { id: user.id, email: user.email, role: user.role }, profile });
  } catch (err) {
    console.error('Login Error:', err);
    
    // Last resort fallback in case of DB failure to prevent 500
    if (email === 'demo@anand.com' && password === 'admin123') {
       const token = jwt.sign({ id: 'demo-admin', email: 'demo@anand.com', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '24h' });
       return res.json({ token, user: { id: 'demo-admin', email: 'demo@anand.com', role: 'ADMIN' }, profile: null });
    }
    
    res.status(500).json({ error: 'Server error. Database connection failed.' });
  }
});

// 3. Admin: Get all clients
app.get('/api/admin/clients', authenticateToken, isAdmin, async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: { clientProfile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 4. Admin: Assign/Create new Client
app.post('/api/admin/clients', authenticateToken, isAdmin, async (req, res) => {
  const { email, password, companyName, industry, gstNumber } = req.body;
  
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newClient = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'CLIENT',
        clientProfile: {
          create: {
            companyName,
            industry: industry || null,
            gstin: gstNumber || null
          }
        }
      },
      include: {
        clientProfile: true
      }
    });

    res.json(newClient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 5. Client: Get own profile
app.get('/api/client/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'CLIENT') return res.status(403).json({ error: 'Client only' });
    
    const profile = await prisma.clientProfile.findUnique({ where: { userId: req.user.id } });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
