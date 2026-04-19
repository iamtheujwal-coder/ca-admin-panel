import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { 
  clients, 
  workflows, 
  invoices, 
  teamMembers, 
  notifications, 
  complianceItems, 
  clientDocuments,
  aiInsights
} from '../src/data/mockData';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Admin setup
  const adminEmail = 'demo@anand.com';
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        name: 'Anand Thakur',
        avatar: 'AT'
      }
    });
    console.log('Created Admin User!');
  } else {
    console.log('Admin already exists.');
  }

  // 2. Clients setup
  for (const client of clients) {
    // Generate a dummy email for each client based on their name for demo
    const cleanName = client.name.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const email = `contact@${cleanName}.com`;
    const password = await bcrypt.hash('client123', 10);

    let clientUser = await prisma.user.findUnique({ where: { email } });

    if (!clientUser) {
      clientUser = await prisma.user.create({
        data: {
          id: client.id, // Keep the same ID for workflow matching
          email,
          password,
          role: 'CLIENT',
          name: client.name,
          avatar: client.avatar,
          clientProfile: {
            create: {
              companyName: client.name,
              type: client.type,
              industry: client.industry,
              gstin: client.gstin,
              pan: client.pan,
              directors: JSON.stringify(client.directors),
              status: client.status,
              complianceScore: client.complianceScore,
              revenue: client.revenue.toString()
            }
          }
        }
      });
      console.log(`Created client: ${client.name}`);
    }
  }

  // 3. Workflows
  for (const wf of workflows) {
    const exists = await prisma.workflow.findUnique({ where: { id: wf.id } });
    if (!exists) {
      await prisma.workflow.create({
        data: {
          id: wf.id,
          title: wf.title,
          clientId: wf.clientId,
          type: wf.type,
          status: wf.status,
          assigneeId: admin.id, // Assign to admin by default
          dueDate: new Date(wf.dueDate),
          priority: wf.priority,
          progress: wf.progress
        }
      });
    }
  }
  console.log('Seeded Workflows.');

  // 4. Invoices
  // Map invoice client string to client IDs.
  // mock data doesn't have clientId in invoices object. Let's find it.
  for (const inv of invoices) {
    const exists = await prisma.invoice.findUnique({ where: { invoiceNo: inv.invoiceNo } });
    if (!exists) {
      const clientMatch = clients.find(c => c.name === inv.client);
      if (clientMatch) {
        await prisma.invoice.create({
          data: {
            id: inv.id,
            invoiceNo: inv.invoiceNo,
            clientId: clientMatch.id,
            amount: inv.amount,
            status: inv.status,
            issueDate: new Date(inv.issueDate),
            dueDate: new Date(inv.dueDate),
            services: JSON.stringify(inv.services)
          }
        });
      }
    }
  }
  console.log('Seeded Invoices.');

  // 5. Documents
  for (const doc of clientDocuments) {
    const exists = await prisma.document.findUnique({ where: { id: doc.id } });
    if (!exists) {
      // Just pick the first client to attach mock documents to them, or specific ones. 
      // Mocks don't specify client. Let's attach them all to c1.
      await prisma.document.create({
        data: {
          id: doc.id,
          name: doc.name,
          category: doc.category,
          size: doc.size,
          status: doc.status,
          type: doc.type,
          clientId: 'c1',
          uploadDate: new Date(doc.uploadDate)
        }
      });
    }
  }
  console.log('Seeded Documents.');

  // 6. Compliance
  for (const comp of complianceItems) {
    const exists = await prisma.complianceItem.findUnique({ where: { id: comp.id } });
    if (!exists) {
      const clientMatch = clients.find(c => c.name === comp.client);
      if (clientMatch) {
        await prisma.complianceItem.create({
          data: {
            id: comp.id,
            title: comp.title,
            clientId: clientMatch.id,
            type: comp.type,
            status: comp.status,
            dueDate: new Date(comp.dueDate)
          }
        });
      }
    }
  }
  console.log('Seeded Compliances.');

  // 7. Notifications
  for (const notif of notifications) {
    const exists = await prisma.notification.findUnique({ where: { id: notif.id } });
    if (!exists) {
      await prisma.notification.create({
        data: {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          read: notif.read,
          userId: admin.id // attach to admin for now
        }
      });
    }
  }
  console.log('Seeded Notifications.');

  // 8. AI Insights
  for (const ai of aiInsights) {
    const exists = await prisma.aIInsight.findUnique({ where: { id: ai.id } });
    if (!exists) {
      await prisma.aIInsight.create({
        data: {
          id: ai.id,
          title: ai.title,
          description: ai.description,
          type: ai.type,
          confidence: ai.confidence,
          action: ai.action
        }
      });
    }
  }
  console.log('Seeded AI Insights.');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
