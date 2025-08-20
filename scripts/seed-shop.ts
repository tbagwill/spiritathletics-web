import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedShop() {
  console.log('🛍️ Seeding shop with test campaign...');

  // Create a test campaign
  const campaign = await prisma.shopCampaign.upsert({
    where: { slug: 'spring-2025-collection' },
    update: {},
    create: {
      title: 'Spirit Athletics Spring 2025 Collection',
      slug: 'spring-2025-collection',
      description: 'Exclusive Spirit Athletics apparel available for a limited time! Pre-order now and we\'ll place bulk orders after the campaign closes.',
      heroImageUrl: null, // You can add an image URL later
      startsAt: new Date('2025-01-15T00:00:00Z'), // Started
      endsAt: new Date('2025-02-15T23:59:59Z'), // Ends in a month
      status: 'ACTIVE',
    }
  });

  console.log(`📅 Created campaign: ${campaign.title}`);

  // Standard sizes for cheerleading apparel
  const standardSizes = [
    { label: 'YS', priceDelta: 0 },
    { label: 'YM', priceDelta: 0 },
    { label: 'YL', priceDelta: 0 },
    { label: 'S', priceDelta: 0 },
    { label: 'M', priceDelta: 0 },
    { label: 'L', priceDelta: 0 },
    { label: 'XL', priceDelta: 200 }, // +$2.00
    { label: 'XXL', priceDelta: 300 }, // +$3.00
    { label: 'XXXL', priceDelta: 400 }, // +$4.00
  ];

  // Create products
  const products = [
    {
      name: 'Spirit Athletics T-Shirt',
      slug: 'spirit-athletics-tshirt',
      basePrice: 2000, // $20.00
      description: 'Comfortable cotton t-shirt with Spirit Athletics logo. Perfect for practice or casual wear.',
      imageUrl: null,
    },
    {
      name: 'Spirit Athletics Hoodie',
      slug: 'spirit-athletics-hoodie', 
      basePrice: 4500, // $45.00
      description: 'Cozy pullover hoodie with embroidered Spirit Athletics logo. Keep warm while showing your team spirit.',
      imageUrl: null,
    },
    {
      name: 'Spirit Athletics Tank Top',
      slug: 'spirit-athletics-tank',
      basePrice: 1800, // $18.00
      description: 'Breathable tank top for workouts and practice. Featuring the Spirit Athletics logo.',
      imageUrl: null,
    },
    {
      name: 'Spirit Athletics Sweatshirt',
      slug: 'spirit-athletics-sweatshirt',
      basePrice: 3800, // $38.00
      description: 'Classic crew neck sweatshirt in team colors. Soft fleece interior for comfort.',
      imageUrl: null,
    }
  ];

  for (const productData of products) {
    const product = await prisma.shopProduct.upsert({
      where: { 
        campaignId_slug: {
          campaignId: campaign.id,
          slug: productData.slug
        }
      },
      update: {},
      create: {
        ...productData,
        campaignId: campaign.id,
      }
    });

    console.log(`👕 Created product: ${product.name} - $${(product.basePrice / 100).toFixed(2)}`);

    // Add sizes for each product
    for (const sizeData of standardSizes) {
      await prisma.productSize.upsert({
        where: {
          productId_label: {
            productId: product.id,
            label: sizeData.label
          }
        },
        update: {},
        create: {
          productId: product.id,
          label: sizeData.label,
          priceDelta: sizeData.priceDelta,
        }
      });
    }

    console.log(`📏 Added ${standardSizes.length} sizes for ${product.name}`);
  }

  console.log('✅ Shop seeding completed!');
  console.log('🌐 Visit http://localhost:3000/shop to see your campaign');
}

seedShop()
  .catch((e) => {
    console.error('❌ Error seeding shop:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
