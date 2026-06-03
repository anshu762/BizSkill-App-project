import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up orphaned notifications...");
  
  // Get all existing post IDs
  const posts = await prisma.post.findMany({ select: { id: true } });
  const postIds = new Set(posts.map(p => p.id));
  
  // Find all notifications that relate to a post (e.g. LIKE or COMMENT)
  const notifications = await prisma.notification.findMany({
    where: { relatedId: { not: null } }
  });
  
  let deletedCount = 0;
  for (const n of notifications) {
    if (!postIds.has(n.relatedId!)) {
      await prisma.notification.delete({ where: { id: n.id } });
      deletedCount++;
    }
  }
  
  console.log(`Successfully deleted ${deletedCount} orphaned notifications!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
