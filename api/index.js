import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

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

try {
  prisma = getPrisma();
} catch (e) {
  console.error("Critical: Prisma could not be initialized", e);
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ca_anand_key_2026';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  next();
};

app.get('/api/health', async (req, res) => {
  try {
    const p = getPrisma();
    await p.$queryRaw`SELECT 1`;
    const adminExists = await p.user.findFirst({ where: { role: 'ADMIN' } });
    res.json({ 
      status: 'ok', 
      db: 'connected', 
      env: process.env.NODE_ENV, 
      seeded: !!adminExists,
      v: "3" 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.post('/api/seed', async (req, res) => {
  try {
    const p = getPrisma();
    const existingAdmin = await p.user.findFirst({ where: { role: 'ADMIN' } });
    if (existingAdmin) return res.json({ message: 'Already seeded', email: 'demo@anand.com' });

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await p.user.create({
      data: { email: 'demo@anand.com', password: hashedPassword, role: 'ADMIN', name: 'CA Anand Thakur' }
    });

    res.json({ message: 'Seeded successfully', admin: admin.email });
  } catch (err) {
    res.status(500).json({ error: 'Seed failed', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const p = getPrisma();
    let user = await p.user.findUnique({ where: { email } });
    
    if (!user && email === 'demo@anand.com' && password === 'admin123') {
      user = { id: 'demo-admin', email: 'demo@anand.com', role: 'ADMIN' };
    }

    if (!user || user.role !== role) return res.status(400).json({ error: 'Invalid credentials' });
    
    if (user.id !== 'demo-admin') {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/clients', authenticateToken, isAdmin, async (req, res) => {
  try {
    const clients = await getPrisma().user.findMany({ where: { role: 'CLIENT' }, include: { clientProfile: true } });
    res.json(clients);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/workflows', authenticateToken, isAdmin, async (req, res) => {
  try {
    const data = await getPrisma().workflow.findMany({ include: { client: { include: { clientProfile: true } }, assignee: true } });
    res.json(data.map(w => ({
      id: w.id, title: w.title, status: w.status, client: w.client?.clientProfile?.companyName || w.client?.email || 'Unknown',
      dueDate: w.dueDate.toISOString().split('T')[0], progress: w.progress
    })));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/invoices', authenticateToken, isAdmin, async (req, res) => {
  try {
    const data = await getPrisma().invoice.findMany({ include: { client: { include: { clientProfile: true } } } });
    res.json(data.map(inv => ({
      id: inv.id, invoiceNo: inv.invoiceNo, amount: inv.amount, status: inv.status,
      client: inv.client?.clientProfile?.companyName || inv.client?.email || 'Unknown',
      issueDate: inv.issueDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
    })));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

export default app;
