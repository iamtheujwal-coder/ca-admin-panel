const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Singleton Prisma client for serverless (avoids connection pool exhaustion)
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;

const PORT = process.env.PORT || 3001;
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
    console.log('Health check: checking DB connection...');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', environment: process.env.NODE_ENV });
  } catch (err) {
    console.error('Health check DB error:', err);
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message, stack: err.stack });
  }
});

// --- Seed / Bootstrap (creates tables + admin) ---
app.post('/api/seed', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) {
      return res.json({ message: 'Database already seeded', adminEmail: existingAdmin.email });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'demo@anand.com',
        password: hashedPassword,
        role: 'ADMIN',
        name: 'CA Anand Thakur'
      }
    });

    // Create a sample client
    const clientPass = await bcrypt.hash('client123', 10);
    const client = await prisma.user.create({
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

// --- Workflows ---

// Admin: Get all workflows
app.get('/api/admin/workflows', authenticateToken, isAdmin, async (req, res) => {
  try {
    const workflowsData = await prisma.workflow.findMany({
      include: {
        client: { include: { clientProfile: true } },
        assignee: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = workflowsData.map(w => ({
      id: w.id,
      title: w.title,
      client: w.client?.clientProfile?.companyName || w.client?.email || 'Unknown Client',
      clientId: w.clientId,
      type: w.type,
      status: w.status,
      assignee: w.assignee?.name || 'Unassigned',
      dueDate: w.dueDate.toISOString().split('T')[0],
      priority: w.priority,
      progress: w.progress,
      createdAt: w.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create workflow
app.post('/api/admin/workflows', authenticateToken, isAdmin, async (req, res) => {
  const { title, clientId, type, status, dueDate, priority } = req.body;
  try {
    const workflow = await prisma.workflow.create({
      data: {
        title,
        clientId,
        type,
        status: status || 'todo',
        assigneeId: req.user.id, // Current Admin creates it, we assign it to them by default
        dueDate: new Date(dueDate),
        priority: priority || 'medium',
        progress: status === 'filed' ? 100 : 0
      }
    });
    res.json(workflow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Update workflow
app.put('/api/admin/workflows/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, progress } = req.body;
  try {
    const updateData = {};
    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    else if (status === 'filed') updateData.progress = 100;
    
    const workflow = await prisma.workflow.update({
      where: { id },
      data: updateData
    });
    res.json(workflow);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Delete workflow
app.delete('/api/admin/workflows/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await prisma.workflow.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Invoices ---

// Admin: Get all invoices
app.get('/api/admin/invoices', authenticateToken, isAdmin, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: { include: { clientProfile: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(invoices.map(inv => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      client: inv.client?.clientProfile?.companyName || inv.client?.email || 'Unknown',
      clientId: inv.clientId,
      amount: inv.amount,
      status: inv.status,
      issueDate: inv.issueDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      services: JSON.parse(inv.services || '[]')
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: Create Invoice
app.post('/api/admin/invoices', authenticateToken, isAdmin, async (req, res) => {
  const { invoiceNo, clientId, amount, status, issueDate, dueDate, services } = req.body;
  try {
    const inv = await prisma.invoice.create({
      data: {
        invoiceNo,
        clientId,
        amount: parseFloat(amount),
        status: status || 'pending',
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        services: JSON.stringify(services || [])
      }
    });
    res.json(inv);
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
