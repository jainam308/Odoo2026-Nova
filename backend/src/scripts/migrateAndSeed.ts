import db from '../db';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

async function migrateAndSeed() {
  try {
    console.log('🚀 Starting Database Migration...');
    
    // 1. Run Schema
    const schemaSql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf-8');
    await db.query(schemaSql);
    console.log('✅ Schema tables created successfully.');

    // 2. Check if already seeded
    const citiesCount = await db.query<{ count: string }>('SELECT COUNT(*) FROM cities');
    if (parseInt(citiesCount.rows[0].count) > 0) {
      console.log('ℹ️ Database already contains data. Refreshing seeds...');
    }

    // 3. Clear existing data in correct dependency order
    await db.query('DELETE FROM stop_activities');
    await db.query('DELETE FROM trip_stops');
    await db.query('DELETE FROM trips');
    await db.query('DELETE FROM activities');
    await db.query('DELETE FROM cities');
    await db.query('DELETE FROM users');

    // 4. Seed Demo Users
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const demoUser = await db.query<{ id: number }>(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, city, country, photo_url, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        'Alex',
        'Wanderer',
        'demo@globetrotter.com',
        passwordHash,
        '+1 (555) 349-2041',
        'San Francisco',
        'United States',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        'Passionate globetrotter, digital nomad, and photographer. Always exploring hidden gems across the world.'
      ]
    );
    const userId = demoUser.rows[0].id;
    console.log(`👤 Created Demo User (ID: ${userId}, demo@globetrotter.com / Password123!)`);

    // 5. Seed Real Global Cities (12 cities)
    const citiesData = [
      {
        name: 'Paris',
        country: 'France',
        cost_index: 4,
        popularity: 98,
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Tokyo',
        country: 'Japan',
        cost_index: 4,
        popularity: 99,
        image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Rome',
        country: 'Italy',
        cost_index: 3,
        popularity: 95,
        image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Barcelona',
        country: 'Spain',
        cost_index: 3,
        popularity: 92,
        image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Bali',
        country: 'Indonesia',
        cost_index: 2,
        popularity: 96,
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'New York',
        country: 'United States',
        cost_index: 5,
        popularity: 97,
        image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Cape Town',
        country: 'South Africa',
        cost_index: 2,
        popularity: 88,
        image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Dubai',
        country: 'United Arab Emirates',
        cost_index: 5,
        popularity: 94,
        image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Sydney',
        country: 'Australia',
        cost_index: 4,
        popularity: 91,
        image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Bangkok',
        country: 'Thailand',
        cost_index: 2,
        popularity: 93,
        image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'London',
        country: 'United Kingdom',
        cost_index: 5,
        popularity: 96,
        image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Goa',
        country: 'India',
        cost_index: 1,
        popularity: 89,
        image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'
      }
    ];

    const cityMap: Record<string, number> = {};

    for (const city of citiesData) {
      const res = await db.query<{ id: number }>(
        `INSERT INTO cities (name, country, cost_index, popularity, image_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [city.name, city.country, city.cost_index, city.popularity, city.image_url]
      );
      cityMap[city.name] = res.rows[0].id;
    }
    console.log(`🏙️ Seeded ${citiesData.length} global cities.`);

    // 6. Seed Activities (40+ activities)
    const activitiesData = [
      // Paris
      { city: 'Paris', name: 'Eiffel Tower Summit Tour', category: 'sightseeing', description: 'Ascend to the top of Paris for breathtaking panoramic views of the city.', cost: 35, duration: 150, img: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=600&q=80' },
      { city: 'Paris', name: 'Louvre Masterpieces Guided Walk', category: 'culture', description: 'Discover the Mona Lisa, Venus de Milo, and iconic art treasures.', cost: 45, duration: 180, img: 'https://images.unsplash.com/photo-1565099824688-e93eb20fe622?auto=format&fit=crop&w=600&q=80' },
      { city: 'Paris', name: 'Montmartre Bakery & Pastry Crawl', category: 'food', description: 'Taste freshly baked croissants, macarons, and artisanal baguettes.', cost: 55, duration: 120, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
      { city: 'Paris', name: 'Seine River Sunset Champagne Cruise', category: 'nightlife', description: 'Glide past illuminated bridges and landmarks while sipping French champagne.', cost: 65, duration: 90, img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80' },

      // Tokyo
      { city: 'Tokyo', name: 'Shibuya Crossing & Harajuku Culture', category: 'sightseeing', description: 'Experience the world-famous scramble crossing and vibrant fashion streets.', cost: 15, duration: 180, img: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80' },
      { city: 'Tokyo', name: 'Tsukiji Outer Market Sushi Tasting', category: 'food', description: 'Indulge in the freshest sashimi and local seafood delicacies.', cost: 75, duration: 120, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80' },
      { city: 'Tokyo', name: 'Shinjuku Golden Gai Izakaya Night', category: 'nightlife', description: 'Explore narrow alleys packed with tiny retro bars and friendly locals.', cost: 50, duration: 210, img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80' },
      { city: 'Tokyo', name: 'Senso-ji Temple & Kimono Experience', category: 'culture', description: 'Wear traditional kimono and learn the spiritual history of Asakusa.', cost: 40, duration: 150, img: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=80' },
      { city: 'Tokyo', name: 'Mount Fuji Day Hike & Lake Ashi', category: 'adventure', description: 'Breathtaking alpine trails with stunning vistas of sacred Mount Fuji.', cost: 110, duration: 480, img: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=600&q=80' },

      // Rome
      { city: 'Rome', name: 'Colosseum & Roman Forum VIP Tour', category: 'culture', description: 'Step back in time to ancient gladiatorial combats and imperial arches.', cost: 40, duration: 180, img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80' },
      { city: 'Rome', name: 'Trastevere Handmade Pasta & Wine Class', category: 'food', description: 'Learn the secrets of authentic carbonara and cacio e pepe from Roman nonnas.', cost: 65, duration: 150, img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80' },
      { city: 'Rome', name: 'Trevi Fountain & Spanish Steps Night Walk', category: 'sightseeing', description: 'Toss a coin into Fontana di Trevi under midnight streetlights.', cost: 0, duration: 90, img: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=600&q=80' },

      // Barcelona
      { city: 'Barcelona', name: 'Sagrada Familia Fast-Track Access', category: 'culture', description: 'Marvel at Gaudi’s transcendent architectural masterpiece and stained glass.', cost: 38, duration: 120, img: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80' },
      { city: 'Barcelona', name: 'El Born Tapas & Sangria Crawl', category: 'food', description: 'Sample Iberian ham, patatas bravas, and pintxos paired with Spanish vermouth.', cost: 48, duration: 180, img: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=600&q=80' },
      { city: 'Barcelona', name: 'Barceloneta Paddleboarding & Kayak', category: 'adventure', description: 'Paddle across the Mediterranean coastline with views of the W Hotel.', cost: 35, duration: 90, img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80' },

      // Bali
      { city: 'Bali', name: 'Ubud Sacred Monkey Forest & Rice Terraces', category: 'sightseeing', description: 'Trek through emerald Tegalalang rice paddies and tropical jungle canopies.', cost: 20, duration: 240, img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80' },
      { city: 'Bali', name: 'Mount Batur Sunrise Volcano Trek', category: 'adventure', description: 'Hike up an active volcano in the dark to catch an unforgettable sunrise.', cost: 55, duration: 360, img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80' },
      { city: 'Bali', name: 'Canggu Beach Club Sunset Party', category: 'nightlife', description: 'Cocktails, live international DJs, and sunset infinity pool vibes.', cost: 30, duration: 240, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
      { city: 'Bali', name: 'Traditional Balinese Cooking & Farm Tour', category: 'food', description: 'Pick organic herbs and craft spicy sambal and chicken satay.', cost: 35, duration: 180, img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },

      // New York
      { city: 'New York', name: 'Central Park Bicycle Exploration', category: 'sightseeing', description: 'Cycle through Bow Bridge, Bethesda Terrace, and Strawberry Fields.', cost: 25, duration: 120, img: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80' },
      { city: 'New York', name: 'Broadway Musical Evening Ticket', category: 'culture', description: 'Immerse in world-class musical theatre in Times Square.', cost: 120, duration: 150, img: 'https://images.unsplash.com/photo-1508997449629-303059a039c0?auto=format&fit=crop&w=600&q=80' },
      { city: 'New York', name: 'Brooklyn Bridge & DUMBO Pizza Walk', category: 'food', description: 'Stroll across the iconic suspension bridge and eat legendary coal-oven pizza.', cost: 30, duration: 150, img: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=600&q=80' },

      // Cape Town
      { city: 'Cape Town', name: 'Table Mountain Cableway & Summit Trail', category: 'adventure', description: 'Ascend the natural wonder of Table Mountain overlooking two oceans.', cost: 30, duration: 180, img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=600&q=80' },
      { city: 'Cape Town', name: 'Boulders Beach Penguin Colony', category: 'sightseeing', description: 'Get up close with wild African penguins nesting on sandy granite shores.', cost: 22, duration: 120, img: 'https://images.unsplash.com/photo-1569420067332-9c3f39e3ec81?auto=format&fit=crop&w=600&q=80' },
      { city: 'Cape Town', name: 'Stellenbosch Wine & Cheese Estate Tour', category: 'food', description: 'Taste award-winning Pinotage wines paired with artisanal cheeses.', cost: 60, duration: 300, img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80' },

      // Dubai
      { city: 'Dubai', name: 'Burj Khalifa At The Top Observation', category: 'sightseeing', description: 'Look down from the world’s tallest skyscraper on level 148.', cost: 80, duration: 120, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80' },
      { city: 'Dubai', name: 'Desert Safari Dune Bashing & BBQ', category: 'adventure', description: '4x4 dune thrill ride followed by camel rides and belly dancing under the stars.', cost: 70, duration: 360, img: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=600&q=80' },
      { city: 'Dubai', name: 'Dubai Marina Luxury Yacht Cruise', category: 'nightlife', description: 'Glide along skyscrapers with open bar and live DJ sets.', cost: 95, duration: 180, img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80' },

      // Sydney
      { city: 'Sydney', name: 'Sydney Harbour BridgeClimb', category: 'adventure', description: 'Climb to the summit of the iconic steel bridge for 360° harbor views.', cost: 180, duration: 210, img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=600&q=80' },
      { city: 'Sydney', name: 'Bondi to Coogee Coastal Walk & Brunch', category: 'sightseeing', description: 'Dramatic ocean cliffs, white sand beaches, and coastal cafes.', cost: 25, duration: 180, img: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=600&q=80' },
      { city: 'Sydney', name: 'Sydney Opera House Behind the Scenes', category: 'culture', description: 'Explore hidden dressing rooms and legendary acoustic concert halls.', cost: 45, duration: 120, img: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d4750?auto=format&fit=crop&w=600&q=80' },

      // Bangkok
      { city: 'Bangkok', name: 'Grand Palace & Wat Pho Golden Buddha', category: 'culture', description: 'Admire intricate Siamese architecture and the 46-meter reclining Buddha.', cost: 25, duration: 180, img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=600&q=80' },
      { city: 'Bangkok', name: 'Chinatown Yaowarat Street Food Safari', category: 'food', description: 'Savor Michelin-starred crab omelettes, pad thai, and mango sticky rice.', cost: 30, duration: 150, img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
      { city: 'Bangkok', name: 'Chao Phraya Express Longtail Boat Tour', category: 'adventure', description: 'Speed along ancient canals (klongs) past floating wooden houses.', cost: 20, duration: 120, img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=600&q=80' },

      // London
      { city: 'London', name: 'Tower of London & Crown Jewels', category: 'culture', description: 'See the glittering royal crowns and hear dark medieval fortress legends.', cost: 35, duration: 150, img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80' },
      { city: 'London', name: 'Borough Market British Food Tour', category: 'food', description: 'Gourmet scotch eggs, artisanal cheddar, oysters, and hot fudge doughnuts.', cost: 45, duration: 120, img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80' },
      { city: 'London', name: 'Soho & Covent Garden West End Nightlife', category: 'nightlife', description: 'Cocktail speakeasies, historic taverns, and vibrant theatre pubs.', cost: 40, duration: 180, img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80' },

      // Goa
      { city: 'Goa', name: 'Baga & Anjuna Beach Shacks Sunbathing', category: 'sightseeing', description: 'Relax under palm trees with fresh coconut water and Arabian Sea waves.', cost: 10, duration: 240, img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
      { city: 'Goa', name: 'Dudhsagar Waterfalls Jungle Safari', category: 'adventure', description: '4x4 jeep trek through Bhagwan Mahaveer Sanctuary to four-tiered falls.', cost: 30, duration: 360, img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
      { city: 'Goa', name: 'Authentic Goan Seafood & Fish Curry Thali', category: 'food', description: 'Kingfish rawa fry, prawn balchao, and coconut curry served on banana leaves.', cost: 12, duration: 90, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' }
    ];

    for (const act of activitiesData) {
      const cityId = cityMap[act.city];
      if (cityId) {
        await db.query(
          `INSERT INTO activities (city_id, name, category, description, cost, duration_minutes, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [cityId, act.name, act.category, act.description, act.cost, act.duration, act.img]
        );
      }
    }
    console.log(`🎯 Seeded ${activitiesData.length} curated activities across all cities.`);

    // 7. Seed Demo Sample Trips (for cross-module integration readiness)
    const trip1 = await db.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo_url, is_public, share_slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userId,
        'European Summer Odyssey',
        'Exploring the art, cafes, and historic streets of Paris, Rome, and Barcelona.',
        '2026-06-10',
        '2026-06-25',
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
        true,
        'euro-odyssey-2026'
      ]
    );

    const trip2 = await db.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo_url, is_public, share_slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userId,
        'Japan Wonders: Tokyo to Kyoto',
        'Neon lights, sushi masterclasses, ancient shrines, and Mount Fuji.',
        '2026-10-01',
        '2026-10-14',
        'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        true,
        'japan-wonders-2026'
      ]
    );

    console.log(`🗺️ Seeded demo trips (IDs: ${trip1.rows[0].id}, ${trip2.rows[0].id}).`);
    console.log('🎉 Database migration & seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration/Seed failed:', err);
    process.exit(1);
  }
}

migrateAndSeed();
