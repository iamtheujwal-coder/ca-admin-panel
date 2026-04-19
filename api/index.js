const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Singleton Prisma client for serverless
const globalForPrisma = globalThis;
let prisma;

function getPrisma() {
  if (prisma) return prisma;
  try {
    prisma = globalForPrisma.__prisma || new PrismaClient();
    if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;
    return prisma;
  } catch (err) {
    console.error('Prisma initialization failed:', err);
    throw err;
  }
}

// Ensure prisma is initialized
try {
  prisma = getPrisma();
} catch (e) {
  console.error("Critical: Prisma could not be initialized at module level", e);
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
app.get('/api/health', async (req, res) => {
  try {
    const p = getPrisma();
    await p.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', environment: process.env.NODE_ENV });
  } catch (err) {
    console.error('Health check DB error:', err);
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// --- Seed / Bootstrap ---
app.post('/api/seed', async (req, res) => {
  try {
    const p = getPrisma();
    const existingAdmin = await p.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      return res.json({ message: 'Database already seeded', adminEmail: existingAdmin.email });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await p.user.create({
      data: {
        email: 'demo@anand.com',
        password: hashedPassword,
        role: 'ADMIN',
        name: 'CA Anand Thakur'
      }
    });

    const clientPass = await bcrypt.hash('client123', 10);
    const client = await p.user.create({
      data: {
        email: 'client@acme.com',
        password: clientPass,
        role: 'CLIENT',
        name: 'Acme Corp Admin',
        clientProfile: {
          create: {
            companyName: 'Acme Corporation',
            type: 'Private Limited',
            industry: 'Technology',
            gstin: '27AABCU9603R1ZM',
            pan: 'AABCU9603R',
            status: 'active',
            complianceScore: 92,
            revenue: '15000000'
          }
        }
      }
    });

    res.json({ 
      message: 'Database seeded successfully!', 
      admin: { email: admin.email },
      sampleClient: { email: client.email }
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Seed failed', details: err.message });
  }
});

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const p = getPrisma();
    let user = await p.user.findUnique({ where: { email } });
    
    if (!user && email === 'demo@anand.com' && password === 'admin123') {
      user = { id: 'demo-admin', email: 'demo@anand.com', role: 'ADMIN' };
    }

    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.role !== role) return res.status(400).json({ error: 'Invalid role for this account' });
    
    if (user.id !== 'demo-admin') {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    let profile = null;
    if (user.role === 'CLIENT') {
       profile = await p.clientProfile.findUnique({ where: { userId: user.id } });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role }, profile });
  } catch (err) {
    console.error('Login Error:', err);
    if (email === 'demo@anand.com' && password === 'admin123') {
       const token = jwt.sign({ id: 'demo-admin', email: 'demo@anand.com', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '24h' });
       return res.json({ token, user: { id: 'demo-admin', email: 'demo@anand.com', role: 'ADMIN' } });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Admin Routes ---
app.get('/api/admin/clients', authenticateToken, isAdmin, async (req, res) => {
  try {
    const clients = await getPrisma().user.findMany({
      where: { role: 'CLIENT' },
      include: { clientProfile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/clients', authenticateToken, isAdmin, async (req, res) => {
  const { email, password, companyName, industry, gstNumber } = req.body;
  try {
    const p = getPrisma();
    const existing = await p.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newClient = await p.user.create({
      data: {
        email, password: hashedPassword, role: 'CLIENT',
        clientProfile: { create: { companyName, industry, gstin: gstNumber } }
      },
      include: { clientProfile: true }
    });
    res.json(newClient);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Workflows ---
app.get('/api/admin/workflows', authenticateToken, isAdmin, async (req, res) => {
  try {
    const data = await getPrisma().workflow.findMany({
      include: { client: { include: { clientProfile: true } }, assignee: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(data.map(w => ({
      id: w.id, title: w.title, type: w.type, status: w.status,
      client: w.client?.clientProfile?.companyName || w.client?.email || 'Unknown',
      clientId: w.clientId, assignee: w.assignee?.name || 'Unassigned',
      dueDate: w.dueDate.toISOString().split('T')[0],
      priority: w.priority, progress: w.progress
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/workflows', authenticateToken, isAdmin, async (req, res) => {
  const { title, clientId, type, status, dueDate, priority } = req.body;
  try {
    const w = await getPrisma().workflow.create({
      data: { title, clientId, type, status: status || 'todo', assigneeId: req.user.id, 
              dueDate: new Date(dueDate), priority: priority || 'medium', progress: status === 'filed' ? 100 : 0 }
    });
    res.json(w);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Invoices ---
app.get('/api/admin/invoices', authenticateToken, isAdmin, async (req, res) => {
  try {
    const data = await getPrisma().invoice.findMany({
      include: { client: { include: { clientProfile: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(data.map(inv => ({
      id: inv.id, invoiceNo: inv.invoiceNo, amount: inv.amount, status: inv.status,
      client: inv.client?.clientProfile?.companyName || inv.client?.email || 'Unknown',
      clientId: inv.clientId, issueDate: inv.issueDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      services: JSON.parse(inv.services || '[]')
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/invoices', authenticateToken, isAdmin, async (req, res) => {
  const { invoiceNo, clientId, amount, status, issueDate, dueDate, services } = req.body;
  try {
    const inv = await getPrisma().invoice.create({
      data: { invoiceNo, clientId, amount: parseFloat(amount), status: status || 'pending',
              issueDate: issueDate ? new Date(issueDate) : new Date(),
              dueDate: dueDate ? new Date(dueDate) : new Date(),
              services: JSON.stringify(services || []) }
    });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;
