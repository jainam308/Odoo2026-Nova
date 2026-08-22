import { Pool } from 'pg';
import { dbConfig } from './config';

const pool = new Pool(dbConfig);

async function main() {
  // Clean slate (Module C demo reseed — recreates all shared demo data).
  await pool.query(
    'TRUNCATE users, cities, activities, trips, trip_stops, stop_activities RESTART IDENTITY CASCADE'
  );

  // Demo user (id 1) — matches the DEMO_TOKEN payload { id: 1 } in the frontend.
  await pool.query(
    `INSERT INTO users (id, first_name, last_name, email, password_hash)
     VALUES (1, 'Demo', 'Traveler', 'demo@globetrotter.dev', 'dev-hash')`
  );

  // Cities
  const cities: [number, string, string, number, number][] = [
    [1, 'Paris', 'France', 5, 95],
    [2, 'Tokyo', 'Japan', 4, 92],
    [3, 'Goa', 'India', 2, 78],
    [4, 'Rome', 'Italy', 4, 90],
    [5, 'Bali', 'Indonesia', 2, 85],
    [6, 'New York', 'USA', 5, 93],
    [7, 'Barcelona', 'Spain', 3, 88],
    [8, 'Reykjavik', 'Iceland', 5, 70],
    [9, 'Bangkok', 'Thailand', 2, 82],
    [10, 'Lisbon', 'Portugal', 3, 80],
  ];
  for (const [id, name, country, costIndex, popularity] of cities) {
    await pool.query(
      `INSERT INTO cities (id, name, country, cost_index, popularity)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, country, costIndex, popularity]
    );
  }

  // Activities (id, city_id, name, category, cost, duration_minutes)
  const activities: [number, number, string, string, number, number][] = [
    [1, 1, 'Eiffel Tower visit', 'sightseeing', 25, 120],
    [2, 1, 'Louvre Museum', 'culture', 17, 180],
    [3, 1, 'Seine dinner cruise', 'food', 90, 120],
    [4, 2, 'Senso-ji Temple', 'culture', 0, 90],
    [5, 2, 'Shibuya food tour', 'food', 60, 150],
    [6, 2, 'Akihabara night walk', 'nightlife', 30, 120],
    [7, 3, 'Baga Beach visit', 'sightseeing', 0, 180],
    [8, 3, 'Water sports', 'adventure', 40, 90],
    [9, 3, 'Goan seafood dinner', 'food', 25, 90],
    [10, 4, 'Colosseum tour', 'sightseeing', 20, 120],
    [11, 4, 'Vatican Museums', 'culture', 21, 180],
    [12, 4, 'Trastevere food walk', 'food', 55, 150],
    [13, 5, 'Ubud rice terraces', 'sightseeing', 5, 120],
    [14, 5, 'Surf lesson', 'adventure', 35, 120],
    [15, 5, 'Temple sunset', 'culture', 0, 90],
    [16, 6, 'Statue of Liberty', 'sightseeing', 24, 180],
    [17, 6, 'Broadway show', 'nightlife', 120, 150],
    [18, 6, 'Central Park bike', 'adventure', 20, 120],
    [19, 7, 'Sagrada Familia', 'culture', 33, 120],
    [20, 7, 'Tapas crawl', 'food', 45, 150],
    [21, 7, 'Barceloneta beach', 'sightseeing', 0, 120],
    [22, 8, 'Blue Lagoon', 'adventure', 80, 240],
    [23, 8, 'Golden Circle tour', 'sightseeing', 95, 480],
    [24, 8, 'Northern lights hunt', 'nightlife', 60, 240],
    [25, 9, 'Grand Palace', 'culture', 15, 150],
    [26, 9, 'Street food tour', 'food', 20, 150],
    [27, 9, 'Chao Phraya cruise', 'sightseeing', 30, 120],
    [28, 10, 'Tram 28 ride', 'sightseeing', 4, 90],
    [29, 10, 'Fado dinner', 'nightlife', 50, 150],
    [30, 10, 'Pastel de nata class', 'food', 35, 120],
  ];
  for (const [id, cityId, name, category, cost, duration] of activities) {
    await pool.query(
      `INSERT INTO activities (id, city_id, name, category, cost, duration_minutes)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, cityId, name, category, cost, duration]
    );
  }

  // Trips — all owned by demo user (id 1) so every trip is editable in Module C.
  type StopDef = { cityId: number; start: string; end: string; activityIds: number[] };
  type TripDef = {
    name: string;
    description: string;
    isPublic: boolean;
    slug: string | null;
    stops: StopDef[];
  };

  const trips: TripDef[] = [
    {
      name: 'European Escape',
      description: 'Paris & Rome in style.',
      isPublic: true,
      slug: 'europe-escape',
      stops: [
        { cityId: 1, start: '2026-09-01', end: '2026-09-04', activityIds: [1, 2, 3] },
        { cityId: 4, start: '2026-09-04', end: '2026-09-08', activityIds: [10, 11, 12] },
      ],
    },
    {
      name: 'Asia Backpacking',
      description: 'Tokyo to Bali.',
      isPublic: false,
      slug: null,
      stops: [
        { cityId: 2, start: '2026-10-01', end: '2026-10-05', activityIds: [4, 5, 6] },
        { cityId: 5, start: '2026-10-05', end: '2026-10-10', activityIds: [13, 14, 15] },
      ],
    },
    {
      name: 'Summer in Iberia',
      description: 'Barcelona & Lisbon.',
      isPublic: true,
      slug: 'iberia-summer',
      stops: [
        { cityId: 7, start: '2026-07-01', end: '2026-07-05', activityIds: [19, 20, 21] },
        { cityId: 10, start: '2026-07-05', end: '2026-07-09', activityIds: [28, 29, 30] },
      ],
    },
  ];

  for (const trip of trips) {
    const tRes = await pool.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, is_public, share_slug)
       VALUES (1, $1, $2, '2026-07-01', '2026-10-10', $3, $4) RETURNING id`,
      [trip.name, trip.description, trip.isPublic, trip.slug]
    );
    const tripId = tRes.rows[0].id;

    for (let i = 0; i < trip.stops.length; i++) {
      const s = trip.stops[i];
      const stRes = await pool.query<{ id: number }>(
        `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
         VALUES ($1, $2, $3, $4, $5, 0) RETURNING id`,
        [tripId, s.cityId, s.start, s.end, i]
      );
      const stopId = stRes.rows[0].id;
      for (let j = 0; j < s.activityIds.length; j++) {
        await pool.query(
          `INSERT INTO stop_activities (trip_stop_id, activity_id, custom_cost, scheduled_date, order_index)
           VALUES ($1, $2, 0, $3, $4)`,
          [stopId, s.activityIds[j], s.start, j]
        );
      }
    }
  }

  const counts = await pool.query(
    `SELECT 'users' t, count(*) n FROM users
     UNION ALL SELECT 'cities', count(*) FROM cities
     UNION ALL SELECT 'activities', count(*) FROM activities
     UNION ALL SELECT 'trips', count(*) FROM trips
     UNION ALL SELECT 'trip_stops', count(*) FROM trip_stops
     UNION ALL SELECT 'stop_activities', count(*) FROM stop_activities`
  );
  console.log('RESEED COMPLETE:');
  counts.rows.forEach((r: { t: string; n: string }) => console.log(`  ${r.t}: ${r.n}`));
}

main()
  .catch((e) => {
    console.error('RESEED ERROR', e);
    process.exit(1);
  })
  .finally(() => pool.end());
