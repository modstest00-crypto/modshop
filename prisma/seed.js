/**
 * Database Seed Script
 * Populates the database with sample data for development
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@modshop.io' },
    update: {},
    create: {
      email: 'admin@modshop.io',
      password: hashedPassword,
      username: 'admin',
      displayName: 'ModShop Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  })
  console.log('✅ Created admin user')

  // Create demo creator
  const creator = await prisma.user.upsert({
    where: { email: 'creator@demo.io' },
    update: {},
    create: {
      email: 'creator@demo.io',
      password: hashedPassword,
      username: 'democreator',
      displayName: 'Demo Creator',
      bio: 'Professional mod developer with 5+ years of experience',
      role: 'CREATOR',
      emailVerified: true,
    },
  })
  console.log('✅ Created demo creator')

  // Create demo buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@demo.io' },
    update: {},
    create: {
      email: 'buyer@demo.io',
      password: hashedPassword,
      username: 'demobuyer',
      displayName: 'Demo Buyer',
      role: 'BUYER',
      emailVerified: true,
    },
  })
  console.log('✅ Created demo buyer')

  // Create store
  const store = await prisma.store.upsert({
    where: { userId: creator.id },
    update: {},
    create: {
      userId: creator.id,
      name: 'Demo Mods Studio',
      slug: 'demo-mods',
      description: 'High-quality mods for your favorite games',
      subscription: 'PRO',
      isActive: true,
    },
  })
  console.log('✅ Created demo store')

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'graphics' },
      update: {},
      create: { name: 'Graphics', slug: 'graphics', description: 'Visual enhancement mods' },
    }),
    prisma.category.upsert({
      where: { slug: 'gameplay' },
      update: {},
      create: { name: 'Gameplay', slug: 'gameplay', description: 'Game mechanics mods' },
    }),
    prisma.category.upsert({
      where: { slug: 'weapons' },
      update: {},
      create: { name: 'Weapons', slug: 'weapons', description: 'Weapon mods and packs' },
    }),
    prisma.category.upsert({
      where: { slug: 'vehicles' },
      update: {},
      create: { name: 'Vehicles', slug: 'vehicles', description: 'Vehicle mods' },
    }),
  ])
  console.log('✅ Created categories')

  // Create sample mods
  const mod1 = await prisma.mod.create({
    data: {
      storeId: store.id,
      creatorId: creator.id,
      title: 'Ultra Graphics Overhaul',
      slug: 'ultra-graphics-overhaul',
      description: 'Complete visual enhancement pack with 4K textures, improved lighting, and realistic weather effects.',
      longDescription: `# Ultra Graphics Overhaul

This comprehensive graphics mod transforms your game with:

- **4K Textures**: Hand-crafted high-resolution textures
- **Enhanced Lighting**: Realistic ray-traced lighting effects
- **Weather System**: Dynamic weather with volumetric clouds
- **Post-Processing**: Cinematic color grading and effects

## Installation

1. Extract the archive
2. Copy files to game directory
3. Launch the game

## Requirements

- 8GB VRAM recommended
- SSD storage
- Latest GPU drivers
`,
      price: 19.99,
      currency: 'USD',
      isFree: false,
      categoryId: categories[0].id,
      tags: ['graphics', '4k', 'textures', 'lighting', 'weather'],
      gameTitle: 'Grand Theft Auto V',
      gameCategory: 'Action',
      platform: ['PC'],
      currentVersion: '2.1.0',
      images: ['/placeholder-mod-1.jpg'],
      status: 'APPROVED',
      isPublished: true,
      isFeatured: true,
      downloads: 15420,
      sales: 892,
      revenue: 17821.08,
      rating: 4.8,
      reviewCount: 156,
      viewCount: 45230,
    },
  })
  console.log('✅ Created mod 1')

  const mod2 = await prisma.mod.create({
    data: {
      storeId: store.id,
      creatorId: creator.id,
      title: 'Weapon Pack Ultimate',
      slug: 'weapon-pack-ultimate',
      description: '50+ realistic weapons with custom animations, sounds, and effects.',
      price: 14.99,
      currency: 'USD',
      isFree: false,
      categoryId: categories[2].id,
      tags: ['weapons', 'guns', 'combat', 'realistic'],
      gameTitle: 'Grand Theft Auto V',
      gameCategory: 'Action',
      platform: ['PC'],
      currentVersion: '3.0.2',
      images: ['/placeholder-mod-2.jpg'],
      status: 'APPROVED',
      isPublished: true,
      isFeatured: true,
      downloads: 23100,
      sales: 1240,
      revenue: 18587.60,
      rating: 4.9,
      reviewCount: 287,
      viewCount: 67890,
    },
  })
  console.log('✅ Created mod 2')

  const mod3 = await prisma.mod.create({
    data: {
      storeId: store.id,
      creatorId: creator.id,
      title: 'Super Car Collection',
      slug: 'super-car-collection',
      description: '25 luxury supercars with detailed interiors and engine sounds.',
      price: 0,
      currency: 'USD',
      isFree: true,
      categoryId: categories[3].id,
      tags: ['cars', 'vehicles', 'supercars', 'free'],
      gameTitle: 'Grand Theft Auto V',
      gameCategory: 'Action',
      platform: ['PC'],
      currentVersion: '1.5.0',
      images: ['/placeholder-mod-3.jpg'],
      status: 'APPROVED',
      isPublished: true,
      isFeatured: false,
      downloads: 45600,
      sales: 0,
      revenue: 0,
      rating: 4.6,
      reviewCount: 412,
      viewCount: 123450,
    },
  })
  console.log('✅ Created mod 3')

  // Create mod versions
  await prisma.modVersion.create({
    data: {
      modId: mod1.id,
      version: '2.1.0',
      changelog: '- Fixed lighting bugs\n- Improved performance\n- Added new weather presets',
      fileUrl: 'mods/demo-mods/ultra-graphics-overhaul/v2.1.0.zip',
      fileSize: BigInt(2147483648),
      isCurrent: true,
      isPublished: true,
    },
  })

  await prisma.modVersion.create({
    data: {
      modId: mod2.id,
      version: '3.0.2',
      changelog: '- Balance adjustments\n- New weapon sounds\n- Bug fixes',
      fileUrl: 'mods/demo-mods/weapon-pack-ultimate/v3.0.2.zip',
      fileSize: BigInt(1073741824),
      isCurrent: true,
      isPublished: true,
    },
  })

  // Create reviews
  await prisma.review.create({
    data: {
      modId: mod1.id,
      userId: buyer.id,
      rating: 5,
      title: 'Amazing graphics mod!',
      content: 'This mod completely transformed my game. The lighting is incredible and performance is great too. Highly recommended!',
      isVerified: true,
    },
  })

  await prisma.review.create({
    data: {
      modId: mod2.id,
      userId: buyer.id,
      rating: 5,
      title: 'Best weapon pack',
      content: 'So many weapons and they all feel unique. The animations are smooth and the sounds are crisp.',
      isVerified: true,
    },
  })

  // Create sample analytics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    await prisma.storeAnalytics.upsert({
      where: {
        storeId_date: {
          storeId: store.id,
          date,
        },
      },
      update: {},
      create: {
        storeId: store.id,
        date,
        views: Math.floor(Math.random() * 1000) + 500,
        visitors: Math.floor(Math.random() * 500) + 200,
        sales: Math.floor(Math.random() * 20) + 5,
        revenue: (Math.random() * 500).toFixed(2),
      },
    })
  }

  console.log('✅ Created analytics data')

  console.log('\n🎉 Database seeding completed!')
  console.log('\n📝 Demo Credentials:')
  console.log('   Admin: admin@modshop.io / password123')
  console.log('   Creator: creator@demo.io / password123')
  console.log('   Buyer: buyer@demo.io / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
