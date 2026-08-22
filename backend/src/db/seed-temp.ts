import { Pool } from 'pg';
import { dbConfig } from './config';

const pool = new Pool(dbConfig);

async function main() {
  const userRes = await pool.query<{ id: number }>('SELECT id FROM users LIMIT 2');
  let userId1 = userRes.rows[0]?.id;
  let userId2 = userRes.rows[1]?.id ?? userId1;
  if (!userId1) {
    const u = await pool.query<{ id: number }>(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ('Demo','User','demo@globetrotter.dev','hash') RETURNING id`
    );
    userId1 = u.rows[0].id;
    userId2 = userId1;
  }

  const existingCities = await pool.query<{ id: number; name: string }>('SELECT id, name FROM cities');
  const cityIdByName: Record<string, number> = {};
  for (const row of existingCities.rows) {
    cityIdByName[row.name.toLowerCase()] = row.id;
  }
  const defaultCityId = existingCities.rows[0]?.id ?? 1;

  await pool.query('DELETE FROM stop_activities');
  await pool.query('DELETE FROM trip_stops');
  await pool.query('DELETE FROM trips');

  async function buildTrip(opts: {
    userId: number;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    isPublic: boolean;
    slug: string | null;
    stops: {
      city: string;
      start: string;
      end: string;
      activities: { name?: string; customName?: string; customCost?: number; date?: string; notes?: string }[];
    }[];
  }) {
    const t = await pool.query(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, is_public, share_slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [opts.userId, opts.name, opts.description, opts.startDate, opts.endDate, opts.isPublic, opts.slug]
    );
    const tripId = t.rows[0].id;
    for (let i = 0; i < opts.stops.length; i++) {
      const s = opts.stops[i];
      const targetCityId = cityIdByName[s.city.toLowerCase()] ?? defaultCityId;
      const st = await pool.query(
        `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [tripId, targetCityId, s.start, s.end, i, 0]
      );
      const stopId = st.rows[0].id;
      for (let j = 0; j < s.activities.length; j++) {
        const item = s.activities[j];
        let activityId: number | null = null;
        let actCost = item.customCost ?? 0;

        if (item.name) {
          const a = await pool.query(
            `SELECT a.id, a.cost FROM activities a JOIN cities c ON a.city_id = c.id
             WHERE LOWER(c.name) = LOWER($1) AND LOWER(a.name) = LOWER($2) LIMIT 1`,
            [s.city, item.name]
          );
          if (a.rows.length) {
            activityId = a.rows[0].id;
            if (actCost === 0) {
              actCost = Number(a.rows[0].cost) || 0;
            }
          }
        }

        await pool.query(
          `INSERT INTO stop_activities (trip_stop_id, activity_id, custom_name, custom_cost, scheduled_date, order_index, notes)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            stopId,
            activityId,
            item.customName ?? null,
            actCost,
            item.date ?? s.start,
            j,
            item.notes ?? null,
          ]
        );
      }
    }
    return tripId;
  }

  await buildTrip({
    userId: userId1,
    name: 'European Escape',
    description: 'Paris & Rome in style with art museums, landmarks, and culinary tours.',
    startDate: '2026-09-01',
    endDate: '2026-09-10',
    isPublic: true,
    slug: 'europe-escape',
    stops: [
      {
        city: 'Paris',
        start: '2026-09-01',
        end: '2026-09-05',
        activities: [
          { name: 'Eiffel Tower visit', date: '2026-09-01', notes: 'Sunset tickets reserved' },
          { name: 'Louvre Museum', date: '2026-09-02', notes: 'Mona Lisa and sculpture halls' },
          { name: 'Seine dinner cruise', date: '2026-09-03', notes: '3-course wine dinner' },
          { customName: 'Montmartre Artists Walk', customCost: 15, date: '2026-09-04' },
        ],
      },
      {
        city: 'Rome',
        start: '2026-09-05',
        end: '2026-09-10',
        activities: [
          { name: 'Colosseum tour', date: '2026-09-05', notes: 'Underground access tour' },
          { name: 'Vatican Museums', date: '2026-09-06', notes: 'Sistine Chapel morning entry' },
          { name: 'Trastevere food walk', date: '2026-09-07', notes: 'Pasta & gelato tasting' },
          { customName: 'Trevi Fountain Evening Stroll', customCost: 0, date: '2026-09-08' },
        ],
      },
    ],
  });

  await buildTrip({
    userId: userId1,
    name: 'Asia Backpacking Odyssey',
    description: 'Neon lights in Tokyo to serene beaches in Bali.',
    startDate: '2026-10-01',
    endDate: '2026-10-12',
    isPublic: true,
    slug: 'asia-backpacking',
    stops: [
      {
        city: 'Tokyo',
        start: '2026-10-01',
        end: '2026-10-06',
        activities: [
          { name: 'Senso-ji Temple', date: '2026-10-01' },
          { name: 'Shibuya food tour', date: '2026-10-02' },
          { name: 'Akihabara night walk', date: '2026-10-03' },
          { customName: 'Shinjuku Gyoen Garden Stroll', customCost: 5, date: '2026-10-04' },
        ],
      },
      {
        city: 'Bali',
        start: '2026-10-06',
        end: '2026-10-12',
        activities: [
          { name: 'Ubud rice terraces', date: '2026-10-06' },
          { name: 'Surf lesson', date: '2026-10-07' },
          { name: 'Temple sunset', date: '2026-10-08' },
          { customName: 'Traditional Spa Massage', customCost: 30, date: '2026-10-09' },
        ],
      },
    ],
  });

  await buildTrip({
    userId: userId1,
    name: 'Summer in Iberia',
    description: 'Sun, architecture, and tapas across Barcelona & Lisbon.',
    startDate: '2026-07-01',
    endDate: '2026-07-10',
    isPublic: true,
    slug: 'iberia-summer',
    stops: [
      {
        city: 'Barcelona',
        start: '2026-07-01',
        end: '2026-07-05',
        activities: [
          { name: 'Sagrada Familia', date: '2026-07-01' },
          { name: 'Tapas crawl', date: '2026-07-02' },
          { name: 'Barceloneta beach', date: '2026-07-03' },
          { customName: 'Gothic Quarter Evening Walk', customCost: 0, date: '2026-07-04' },
        ],
      },
      {
        city: 'Lisbon',
        start: '2026-07-05',
        end: '2026-07-10',
        activities: [
          { name: 'Tram 28 ride', date: '2026-07-05' },
          { name: 'Fado dinner', date: '2026-07-06' },
          { name: 'Pastel de nata class', date: '2026-07-07' },
          { customName: 'Sintra Day Trip', customCost: 40, date: '2026-07-08' },
        ],
      },
    ],
  });

  await buildTrip({
    userId: userId2,
    name: 'Metropolis & Glaciers',
    description: 'Skyscrapers in NYC and hot springs in Reykjavik.',
    startDate: '2026-11-01',
    endDate: '2026-11-10',
    isPublic: true,
    slug: 'nyc-reykjavik',
    stops: [
      {
        city: 'New York',
        start: '2026-11-01',
        end: '2026-11-05',
        activities: [
          { name: 'Central Park Stroll', date: '2026-11-01' },
          { name: 'Broadway Show', date: '2026-11-02' },
          { name: 'Empire State Building', date: '2026-11-03' },
        ],
      },
      {
        city: 'Reykjavik',
        start: '2026-11-05',
        end: '2026-11-10',
        activities: [
          { name: 'Golden Circle Tour', date: '2026-11-05' },
          { name: 'Blue Lagoon Spa', date: '2026-11-06' },
          { name: 'Northern Lights Hunting', date: '2026-11-07' },
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
  console.log('--- DB RE-SEEDED SUCCESSFULLY ---');
  counts.rows.forEach((r: any) => console.log(`  ${r.t}: ${r.n}`));
}

main()
  .catch((e) => {
    console.error('SEED ERROR', e);
    process.exit(1);
  })
  .finally(() => pool.end());
