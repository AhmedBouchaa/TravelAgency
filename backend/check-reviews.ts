import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkReviews() {
  const reviews = await prisma.feedback.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      travel: { select: { title: true } },
    },
  });
  
  console.log(`Total reviews: ${reviews.length}`);
  console.log('\nReview details:');
  reviews.forEach((r) => {
    console.log(`- ${r.travel?.title} by ${r.user?.firstName} ${r.user?.lastName}`);
    console.log(`  Rating: ${r.rating}/5, Status: ${r.status}`);
    console.log(`  Comment: ${r.comment}`);
    console.log('');
  });
}

checkReviews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
