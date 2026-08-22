import { Pool } from 'pg';
import { dbConfig } from './config';

const pool = new Pool(dbConfig);

async function main() {
  console.log('--- FAST SINGLE-TRANSACTION RE-SEED ---');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Fetch user_id for demo user or create user with id = 1
    let userId = 1;
    const uRes = await client.query<{ id: number }>(
      `SELECT id FROM users WHERE LOWER(email) = 'demo@globetrotter.dev' LIMIT 1`
    );
    if (uRes.rows.length > 0) {
      userId = uRes.rows[0].id;
    } else {
      const insUser = await client.query<{ id: number }>(
        `INSERT INTO users (first_name, last_name, email, password_hash)
         VALUES ('Demo', 'Traveler', 'demo@globetrotter.dev', '$2b$10$abcdefghijklmnopqrstuu')
         RETURNING id`
      );
      userId = insUser.rows[0].id;
    }

    // 2. Fetch or insert cities
    const parisRes = await client.query<{ id: number }>("SELECT id FROM cities WHERE LOWER(name) = 'paris' LIMIT 1");
    const romeRes = await client.query<{ id: number }>("SELECT id FROM cities WHERE LOWER(name) = 'rome' LIMIT 1");
    const tokyoRes = await client.query<{ id: number }>("SELECT id FROM cities WHERE LOWER(name) = 'tokyo' LIMIT 1");
    const baliRes = await client.query<{ id: number }>("SELECT id FROM cities WHERE LOWER(name) = 'bali' LIMIT 1");
    const barcRes = await client.query<{ id: number }>("SELECT id FROM cities WHERE LOWER(name) = 'barcelona' LIMIT 1");
    const lisbonRes = await client.query<{ id: number }>("SELECT id FROM cities WHERE LOWER(name) = 'lisbon' LIMIT 1");

    const parisId = parisRes.rows[0]?.id ?? 1;
    const romeId = romeRes.rows[0]?.id ?? 2;
    const tokyoId = tokyoRes.rows[0]?.id ?? 3;
    const baliId = baliRes.rows[0]?.id ?? 4;
    const barcId = barcRes.rows[0]?.id ?? 5;
    const lisbonId = lisbonRes.rows[0]?.id ?? 6;

    // 3. Clear old stops and activities and trips for userId
    await client.query('DELETE FROM stop_activities WHERE trip_stop_id IN (SELECT id FROM trip_stops WHERE trip_id IN (SELECT id FROM trips WHERE user_id = $1))', [userId]);
    await client.query('DELETE FROM trip_stops WHERE trip_id IN (SELECT id FROM trips WHERE user_id = $1)', [userId]);
    await client.query('DELETE FROM trips WHERE user_id = $1', [userId]);

    // 4. Create Trip 1: European Escape
    const t1 = await client.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, is_public, share_slug)
       VALUES ($1, 'European Escape', 'Paris & Rome in style with art museums, landmarks, and culinary tours.', '2026-09-01', '2026-09-10', true, 'europe-escape')
       RETURNING id`,
      [userId]
    );
    const trip1Id = t1.rows[0].id;

    // Stop 1: Paris
    const s1 = await client.query<{ id: number }>(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
       VALUES ($1, $2, '2026-09-01', '2026-09-05', 0, 0) RETURNING id`,
      [trip1Id, parisId]
    );
    const stop1Id = s1.rows[0].id;

    await client.query(`
      INSERT INTO stop_activities (trip_stop_id, custom_name, custom_cost, scheduled_date, order_index, notes) VALUES
      (${stop1Id}, 'Eiffel Tower Visit', 25.00, '2026-09-01', 0, 'Sunset tickets reserved'),
      (${stop1Id}, 'Louvre Museum', 17.00, '2026-09-02', 1, 'Mona Lisa & sculptures'),
      (${stop1Id}, 'Seine Dinner Cruise', 90.00, '2026-09-03', 2, '3-course wine dinner'),
      (${stop1Id}, 'Montmartre Artists Walk', 15.00, '2026-09-04', 3, 'Walking tour')
    `);

    // Stop 2: Rome
    const s2 = await client.query<{ id: number }>(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
       VALUES ($1, $2, '2026-09-05', '2026-09-10', 1, 0) RETURNING id`,
      [trip1Id, romeId]
    );
    const stop2Id = s2.rows[0].id;

    await client.query(`
      INSERT INTO stop_activities (trip_stop_id, custom_name, custom_cost, scheduled_date, order_index, notes) VALUES
      (${stop2Id}, 'Colosseum Tour', 20.00, '2026-09-05', 0, 'Underground access'),
      (${stop2Id}, 'Vatican Museums', 21.00, '2026-09-06', 1, 'Sistine Chapel morning'),
      (${stop2Id}, 'Trastevere Food Walk', 55.00, '2026-09-07', 2, 'Pasta & wine tasting'),
      (${stop2Id}, 'Trevi Fountain Evening Stroll', 0.00, '2026-09-08', 3, 'Gelato stroll')
    `);

    // 5. Create Trip 2: Asia Backpacking Odyssey
    const t2 = await client.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, is_public, share_slug)
       VALUES ($1, 'Asia Backpacking Odyssey', 'Neon lights in Tokyo to serene beaches in Bali.', '2026-10-01', '2026-10-12', true, 'asia-backpacking')
       RETURNING id`,
      [userId]
    );
    const trip2Id = t2.rows[0].id;

    // Stop 1: Tokyo
    const s3 = await client.query<{ id: number }>(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
       VALUES ($1, $2, '2026-10-01', '2026-10-06', 0, 0) RETURNING id`,
      [trip2Id, tokyoId]
    );
    const stop3Id = s3.rows[0].id;

    await client.query(`
      INSERT INTO stop_activities (trip_stop_id, custom_name, custom_cost, scheduled_date, order_index, notes) VALUES
      (${stop3Id}, 'Senso-ji Temple', 0.00, '2026-10-01', 0, 'Asakusa shrine'),
      (${stop3Id}, 'Shibuya Food Tour', 65.00, '2026-10-02', 1, 'Izakaya & ramen'),
      (${stop3Id}, 'Akihabara Night Walk', 20.00, '2026-10-03', 2, 'Electric town'),
      (${stop3Id}, 'TeamLab Planets', 32.00, '2026-10-04', 3, 'Digital art')
    `);

    // Stop 2: Bali
    const s4 = await client.query<{ id: number }>(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
       VALUES ($1, $2, '2026-10-06', '2026-10-12', 1, 0) RETURNING id`,
      [trip2Id, baliId]
    );
    const stop4Id = s4.rows[0].id;

    await client.query(`
      INSERT INTO stop_activities (trip_stop_id, custom_name, custom_cost, scheduled_date, order_index, notes) VALUES
      (${stop4Id}, 'Ubud Rice Terraces', 10.00, '2026-10-06', 0, 'Tegallalang walk'),
      (${stop4Id}, 'Surf Lesson', 35.00, '2026-10-07', 1, 'Kuta beach'),
      (${stop4Id}, 'Tanah Lot Temple Sunset', 15.00, '2026-10-08', 2, 'Ocean sunset'),
      (${stop4Id}, 'Balinese Cooking Class', 40.00, '2026-10-09', 3, 'Traditional recipes')
    `);

    // 6. Create Trip 3: Summer in Iberia
    const t3 = await client.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, is_public, share_slug)
       VALUES ($1, 'Summer in Iberia', 'Sun, architecture, and tapas across Barcelona & Lisbon.', '2026-07-01', '2026-07-10', true, 'iberia-summer')
       RETURNING id`,
      [userId]
    );
    const trip3Id = t3.rows[0].id;

    // Stop 1: Barcelona
    const s5 = await client.query<{ id: number }>(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
       VALUES ($1, $2, '2026-07-01', '2026-07-05', 0, 0) RETURNING id`,
      [trip3Id, barcId]
    );
    const stop5Id = s5.rows[0].id;

    await client.query(`
      INSERT INTO stop_activities (trip_stop_id, custom_name, custom_cost, scheduled_date, order_index, notes) VALUES
      (${stop5Id}, 'Sagrada Familia', 26.00, '2026-07-01', 0, 'Gaudi basilica'),
      (${stop5Id}, 'Tapas & Wine Tour', 50.00, '2026-07-02', 1, 'Gothic quarter'),
      (${stop5Id}, 'Park Guell Visit', 10.00, '2026-07-03', 2, 'Panoramic views'),
      (${stop5Id}, 'Barceloneta Beach', 0.00, '2026-07-04', 3, 'Beach afternoon')
    `);

    // Stop 2: Lisbon
    const s6 = await client.query<{ id: number }>(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
       VALUES ($1, $2, '2026-07-05', '2026-07-10', 1, 0) RETURNING id`,
      [trip3Id, lisbonId]
    );
    const stop6Id = s6.rows[0].id;

    await client.query(`
      INSERT INTO stop_activities (trip_stop_id, custom_name, custom_cost, scheduled_date, order_index, notes) VALUES
      (${stop6Id}, 'Tram 28 Historic Ride', 5.00, '2026-07-05', 0, 'Alfama tram'),
      (${stop6Id}, 'Fado Music & Dinner', 45.00, '2026-07-06', 1, 'Live fado'),
      (${stop6Id}, 'Pastel de Nata Cooking Class', 35.00, '2026-07-07', 2, 'Custard tart baking'),
      (${stop6Id}, 'Belem Tower Tour', 9.00, '2026-07-08', 3, 'Tagus river tower')
    `);

    await client.query('COMMIT');
    console.log(`✅ SUCCESS! Created Trips ID ${trip1Id}, ${trip2Id}, ${trip3Id} for user ${userId}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('SEED TRANSACTION ERROR:', err);
    throw err;
  } finally {
    client.release();
  }
}

main()
  .catch(() => process.exit(1))
  .finally(() => pool.end());
