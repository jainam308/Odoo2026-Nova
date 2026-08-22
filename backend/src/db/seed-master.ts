import { Pool } from 'pg';
import { dbConfig } from './config';

const pool = new Pool(dbConfig);

async function main() {
  console.log('--- RE-SEEDING GLOBETROTTER DATABASE WITH USER ID 1 OWNERSHIP ---');

  // 1. Ensure user id 1 exists as demo user
  let u1 = await pool.query<{ id: number }>(
    `SELECT id FROM users WHERE LOWER(email) = 'demo@globetrotter.dev' LIMIT 1`
  );
  let userId1 = u1.rows[0]?.id;
  if (!userId1) {
    const ins = await pool.query<{ id: number }>(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ('Demo', 'Traveler', 'demo@globetrotter.dev', '$2b$10$abcdefghijklmnopqrstuu') RETURNING id`
    );
    userId1 = ins.rows[0].id;
  }

  // 2. Ensure Seed Cities
  const citiesData = [
    { name: 'Paris', country: 'France', cost_index: 4, popularity: 95 },
    { name: 'Rome', country: 'Italy', cost_index: 3, popularity: 92 },
    { name: 'Tokyo', country: 'Japan', cost_index: 4, popularity: 98 },
    { name: 'Bali', country: 'Indonesia', cost_index: 2, popularity: 90 },
    { name: 'Barcelona', country: 'Spain', cost_index: 3, popularity: 94 },
    { name: 'Lisbon', country: 'Portugal', cost_index: 2, popularity: 88 },
    { name: 'New York', country: 'USA', cost_index: 5, popularity: 96 },
    { name: 'Reykjavik', country: 'Iceland', cost_index: 5, popularity: 85 },
    { name: 'London', country: 'UK', cost_index: 4, popularity: 93 },
    { name: 'Sydney', country: 'Australia', cost_index: 4, popularity: 89 },
  ];

  const cityIdByName: Record<string, number> = {};
  for (const c of citiesData) {
    const res = await pool.query<{ id: number }>(
      `SELECT id FROM cities WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [c.name]
    );
    if (res.rows.length > 0) {
      cityIdByName[c.name.toLowerCase()] = res.rows[0].id;
    } else {
      const ins = await pool.query<{ id: number }>(
        `INSERT INTO cities (name, country, cost_index, popularity)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [c.name, c.country, c.cost_index, c.popularity]
      );
      cityIdByName[c.name.toLowerCase()] = ins.rows[0].id;
    }
  }

  // 3. Ensure Activities Catalog
  const activitiesData = [
    { city: 'Paris', name: 'Eiffel Tower visit', category: 'sightseeing', description: 'Iconic iron lattice tower.', cost: 25, duration: 120 },
    { city: 'Paris', name: 'Louvre Museum', category: 'culture', description: 'Home of the Mona Lisa.', cost: 17, duration: 180 },
    { city: 'Paris', name: 'Seine dinner cruise', category: 'food', description: 'Dinner cruise on the river.', cost: 90, duration: 120 },
    { city: 'Paris', name: 'Palace of Versailles', category: 'sightseeing', description: 'Royal chateau near Paris.', cost: 20, duration: 240 },
    
    { city: 'Rome', name: 'Colosseum tour', category: 'sightseeing', description: 'Ancient amphitheatre.', cost: 20, duration: 120 },
    { city: 'Rome', name: 'Vatican Museums', category: 'culture', description: 'Sistine Chapel and Vatican art.', cost: 21, duration: 180 },
    { city: 'Rome', name: 'Trastevere food walk', category: 'food', description: 'Roman cuisine and wine tasting.', cost: 55, duration: 150 },
    { city: 'Rome', name: 'Pantheon Visit', category: 'sightseeing', description: 'Former Roman temple.', cost: 5, duration: 60 },

    { city: 'Tokyo', name: 'Senso-ji Temple', category: 'culture', description: 'Ancient Buddhist temple in Asakusa.', cost: 0, duration: 90 },
    { city: 'Tokyo', name: 'Shibuya food tour', category: 'food', description: 'Ramen, yakitori, and izakaya experience.', cost: 65, duration: 180 },
    { city: 'Tokyo', name: 'Akihabara night walk', category: 'sightseeing', description: 'Electric Town & anime hub.', cost: 20, duration: 120 },
    { city: 'Tokyo', name: 'TeamLab Planets', category: 'culture', description: 'Digital immersive art museum.', cost: 32, duration: 120 },

    { city: 'Bali', name: 'Ubud rice terraces', category: 'sightseeing', description: 'Lush green Tegallalang terraces.', cost: 10, duration: 120 },
    { city: 'Bali', name: 'Surf lesson', category: 'adventure', description: 'Kuta beach beginner surfing.', cost: 35, duration: 120 },
    { city: 'Bali', name: 'Tanah Lot Temple sunset', category: 'sightseeing', description: 'Ocean temple sunset views.', cost: 15, duration: 90 },
    { city: 'Bali', name: 'Balinese Cooking Class', category: 'food', description: 'Market tour and traditional cooking.', cost: 40, duration: 240 },

    { city: 'Barcelona', name: 'Sagrada Familia', category: 'sightseeing', description: 'Gaudis unfinished masterpiece.', cost: 26, duration: 120 },
    { city: 'Barcelona', name: 'Tapas & Wine Tour', category: 'food', description: 'Gothic Quarter tapas crawl.', cost: 50, duration: 180 },
    { city: 'Barcelona', name: 'Park Guell Visit', category: 'culture', description: 'Mosaic-covered park overlook.', cost: 10, duration: 90 },
    { city: 'Barcelona', name: 'Barceloneta Beach', category: 'adventure', description: 'Mediterranean beach vibes.', cost: 0, duration: 180 },

    { city: 'Lisbon', name: 'Tram 28 Historic Ride', category: 'sightseeing', description: 'Classic yellow tram through Alfama.', cost: 5, duration: 60 },
    { city: 'Lisbon', name: 'Fado Music & Dinner', category: 'culture', description: 'Traditional Portuguese music & meal.', cost: 45, duration: 180 },
    { city: 'Lisbon', name: 'Pastel de Nata Cooking Class', category: 'food', description: 'Bake authentic custard tarts.', cost: 35, duration: 120 },
    { city: 'Lisbon', name: 'Belem Tower Tour', category: 'sightseeing', description: 'Fortified tower on Tagus river.', cost: 9, duration: 90 },
  ];

  for (const act of activitiesData) {
    const cId = cityIdByName[act.city.toLowerCase()];
    if (!cId) continue;
    const check = await pool.query(
      `SELECT id FROM activities WHERE city_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1`,
      [cId, act.name]
    );
    if (check.rows.length === 0) {
      await pool.query(
        `INSERT INTO activities (city_id, name, category, description, cost, duration_minutes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [cId, act.name, act.category, act.description, act.cost, act.duration]
      );
    }
  }

  // 4. Reset & Re-build Demo Trips, Stops, and Activities owned by userId 1
  await pool.query('DELETE FROM stop_activities');
  await pool.query('DELETE FROM trip_stops');
  await pool.query('DELETE FROM trips');

  async function createFullTrip(opts: {
    userId: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    slug: string;
    stops: {
      cityName: string;
      startDate: string;
      endDate: string;
      activities: { catalogName?: string; customName?: string; customCost?: number; date?: string; notes?: string }[];
    }[];
  }) {
    const tRes = await pool.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, is_public, share_slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [opts.userId, opts.name, opts.description, opts.startDate, opts.endDate, opts.isPublic, opts.slug]
    );
    const tripId = tRes.rows[0].id;

    for (let i = 0; i < opts.stops.length; i++) {
      const s = opts.stops[i];
      const cityId = cityIdByName[s.cityName.toLowerCase()] ?? 1;

      const stopRes = await pool.query<{ id: number }>(
        `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [tripId, cityId, s.startDate, s.endDate, i, 0]
      );
      const stopId = stopRes.rows[0].id;

      for (let j = 0; j < s.activities.length; j++) {
        const item = s.activities[j];
        let actId: number | null = null;
        let cost = item.customCost ?? 0;

        if (item.catalogName) {
          const actQuery = await pool.query<{ id: number; cost: string }>(
            `SELECT a.id, a.cost FROM activities a JOIN cities c ON a.city_id = c.id
             WHERE LOWER(c.name) = LOWER($1) AND LOWER(a.name) = LOWER($2) LIMIT 1`,
            [s.cityName, item.catalogName]
          );
          if (actQuery.rows.length > 0) {
            actId = actQuery.rows[0].id;
            cost = Number(actQuery.rows[0].cost) || 0;
          }
        }

        await pool.query(
          `INSERT INTO stop_activities (trip_stop_id, activity_id, custom_name, custom_cost, scheduled_date, order_index, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            stopId,
            actId,
            item.customName ?? null,
            cost,
            item.date ?? s.startDate,
            j,
            item.notes ?? null,
          ]
        );
      }
    }
    return tripId;
  }

  const trip1 = await createFullTrip({
    userId: userId1,
    name: 'European Escape',
    description: 'Paris & Rome in style with art museums, landmarks, and culinary tours.',
    startDate: '2026-09-01',
    endDate: '2026-09-10',
    isPublic: true,
    slug: 'europe-escape',
    stops: [
      {
        cityName: 'Paris',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        activities: [
          { catalogName: 'Eiffel Tower visit', date: '2026-09-01', notes: 'Sunset entry' },
          { catalogName: 'Louvre Museum', date: '2026-09-02', notes: 'Mona Lisa & sculptures' },
          { catalogName: 'Seine dinner cruise', date: '2026-09-03', notes: '3-course dinner' },
          { customName: 'Montmartre Artists Walk', customCost: 15.0, date: '2026-09-04' },
        ],
      },
      {
        cityName: 'Rome',
        startDate: '2026-09-05',
        endDate: '2026-09-10',
        activities: [
          { catalogName: 'Colosseum tour', date: '2026-09-05', notes: 'Underground access' },
          { catalogName: 'Vatican Museums', date: '2026-09-06', notes: 'Sistine Chapel morning' },
          { catalogName: 'Trastevere food walk', date: '2026-09-07', notes: 'Pasta & wine' },
          { customName: 'Trevi Fountain Evening Stroll', customCost: 0, date: '2026-09-08' },
        ],
      },
    ],
  });

  const trip2 = await createFullTrip({
    userId: userId1,
    name: 'Asia Backpacking Odyssey',
    description: 'Neon lights in Tokyo to serene beaches in Bali.',
    startDate: '2026-10-01',
    endDate: '2026-10-12',
    isPublic: true,
    slug: 'asia-backpacking',
    stops: [
      {
        cityName: 'Tokyo',
        startDate: '2026-10-01',
        endDate: '2026-10-06',
        activities: [
          { catalogName: 'Senso-ji Temple', date: '2026-10-01' },
          { catalogName: 'Shibuya food tour', date: '2026-10-02' },
          { catalogName: 'Akihabara night walk', date: '2026-10-03' },
          { catalogName: 'TeamLab Planets', date: '2026-10-04' },
        ],
      },
      {
        cityName: 'Bali',
        startDate: '2026-10-06',
        endDate: '2026-10-12',
        activities: [
          { catalogName: 'Ubud rice terraces', date: '2026-10-06' },
          { catalogName: 'Surf lesson', date: '2026-10-07' },
          { catalogName: 'Tanah Lot Temple sunset', date: '2026-10-08' },
          { catalogName: 'Balinese Cooking Class', date: '2026-10-09' },
        ],
      },
    ],
  });

  const trip3 = await createFullTrip({
    userId: userId1,
    name: 'Summer in Iberia',
    description: 'Sun, architecture, and tapas across Barcelona & Lisbon.',
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    isPublic: true,
    slug: 'iberia-summer',
    stops: [
      {
        cityName: 'Barcelona',
        startDate: '2026-07-01',
        endDate: '2026-07-05',
        activities: [
          { catalogName: 'Sagrada Familia', date: '2026-07-01' },
          { catalogName: 'Tapas & Wine Tour', date: '2026-07-02' },
          { catalogName: 'Park Guell Visit', date: '2026-07-03' },
          { catalogName: 'Barceloneta Beach', date: '2026-07-04' },
        ],
      },
      {
        cityName: 'Lisbon',
        startDate: '2026-07-05',
        endDate: '2026-07-10',
        activities: [
          { catalogName: 'Tram 28 Historic Ride', date: '2026-07-05' },
          { catalogName: 'Fado Music & Dinner', date: '2026-07-06' },
          { catalogName: 'Pastel de Nata Cooking Class', date: '2026-07-07' },
          { catalogName: 'Belem Tower Tour', date: '2026-07-08' },
        ],
      },
    ],
  });

  const counts = await pool.query(
    `SELECT 'users' t, count(*) n FROM users
     UNION ALL SELECT 'cities', count(*) FROM cities
     UNION ALL SELECT 'activities', count(*) FROM activities
     UNION ALL SELECT 'trips', count(*) FROM trips
     UNION ALL SELECT 'trip_stops', count(*) FROM trip_stops
     UNION ALL SELECT 'stop_activities', count(*) FROM stop_activities`
  );

  console.log('--- RE-SEED COMPLETE WITH USER_ID 1 ---');
  counts.rows.forEach((r: any) => console.log(`  ${r.t}: ${r.n}`));
  console.log(`Created Trip #1 (ID ${trip1}), Trip #2 (ID ${trip2}), Trip #3 (ID ${trip3}) for user 1`);
}

main()
  .catch((e) => {
    console.error('SEED MASTER ERROR:', e);
    process.exit(1);
  })
  .finally(() => pool.end());
