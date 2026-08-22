import jwt from 'jsonwebtoken';
import app from '../app';
import db from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter_jwt_super_secret_key_2026';
const token = jwt.sign({ id: 1, email: 'dev3test@globetrotter.dev' }, JWT_SECRET);

async function runTests() {
  console.log('--- RUNNING MODULE C INTEGRATION TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Ensure test user, city, and trip exist
    const userRes = await db.query<{ id: number }>('SELECT id FROM users LIMIT 1');
    let userId = userRes.rows[0]?.id;
    if (!userId) {
      const u = await db.query<{ id: number }>(
        `INSERT INTO users (first_name, last_name, email, password_hash)
         VALUES ('Test','User','testuser@globetrotter.dev','hash') RETURNING id`
      );
      userId = u.rows[0].id;
    }

    const testToken = jwt.sign({ id: userId, email: 'testuser@globetrotter.dev' }, JWT_SECRET);

    const cityRes = await db.query<{ id: number }>('SELECT id FROM cities LIMIT 1');
    let cityId = cityRes.rows[0]?.id;
    if (!cityId) {
      const c = await db.query<{ id: number }>(
        `INSERT INTO cities (name, country, cost_index, popularity)
         VALUES ('Tokyo','Japan',4,90) RETURNING id`
      );
      cityId = c.rows[0].id;
    }

    const tripRes = await db.query<{ id: number }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, is_public, share_slug)
       VALUES ($1, 'Module C Test Trip', 'Test Desc', '2026-09-01', '2026-09-10', true, $2)
       RETURNING id`,
      [userId, `test-slug-${Date.now()}`]
    );
    const tripId = tripRes.rows[0].id;
    assert(tripId > 0, `Created test trip id=${tripId}`);

    // Express handler caller simulation using direct route invocation or fetch
    const http = app;

    // Test 1: POST /api/trips/:tripId/stops (create stop with snake_case and city_id)
    const req1 = {
      params: { tripId: String(tripId) },
      body: { city_id: cityId, start_date: '2026-09-01', end_date: '2026-09-05' },
      headers: { authorization: `Bearer ${testToken}` },
      user: { id: userId },
    } as any;

    let res1Data: any = null;
    let res1Status = 0;
    const res1 = {
      status(code: number) { res1Status = code; return this; },
      json(data: any) { res1Data = data; return this; },
    } as any;

    const { createStop, getStops, updateStop, deleteStop, createStopActivity, updateStopActivity, deleteStopActivity, getBudgetSummary, getPublicTrip, copyPublicTrip } = require('../modules/itinerary.controller');

    await createStop(req1, res1);
    assert(res1Status === 201 && res1Data?.success === true, 'POST /api/trips/:tripId/stops returns 201 Created');
    assert(res1Data?.data?.cityId === cityId, 'Stop created with valid cityId');
    assert(res1Data?.data?.city?.name !== undefined, 'Stop response includes joined city metadata');
    const createdStopId = res1Data?.data?.id;

    // Test 2: GET /api/trips/:tripId/stops
    const req2 = {
      params: { tripId: String(tripId) },
      user: { id: userId },
    } as any;
    let res2Data: any = null;
    let res2Status = 0;
    const res2 = {
      status(code: number) { res2Status = code; return this; },
      json(data: any) { res2Data = data; return this; },
    } as any;

    await getStops(req2, res2);
    assert(res2Status === 200 && Array.isArray(res2Data?.data), 'GET /api/trips/:tripId/stops returns 200 OK with stops array');
    assert(res2Data?.data?.length >= 1, 'Stops array contains the newly created stop');

    // Test 3: POST /api/stops/:stopId/activities (custom activity)
    const req3 = {
      params: { stopId: String(createdStopId) },
      body: { custom_name: 'Museum Tour', custom_cost: 45, scheduled_date: '2026-09-02' },
      user: { id: userId },
    } as any;
    let res3Data: any = null;
    let res3Status = 0;
    const res3 = {
      status(code: number) { res3Status = code; return this; },
      json(data: any) { res3Data = data; return this; },
    } as any;

    await createStopActivity(req3, res3);
    assert(res3Status === 201 && res3Data?.success === true, 'POST /api/stops/:stopId/activities returns 201 Created');
    assert(res3Data?.data?.customName === 'Museum Tour' && res3Data?.data?.customCost === 45, 'Custom activity created with correct cost');
    const activityId = res3Data?.data?.id;

    // Test 4: PUT /api/stop-activities/:id
    const req4 = {
      params: { id: String(activityId) },
      body: { custom_cost: 50, notes: 'Updated notes' },
      user: { id: userId },
    } as any;
    let res4Data: any = null;
    let res4Status = 0;
    const res4 = {
      status(code: number) { res4Status = code; return this; },
      json(data: any) { res4Data = data; return this; },
    } as any;

    await updateStopActivity(req4, res4);
    assert(res4Status === 200 && res4Data?.data?.customCost === 50, 'PUT /api/stop-activities/:id updates activity cost');

    // Test 5: GET /api/trips/:tripId/budget-summary
    const req5 = {
      params: { tripId: String(tripId) },
      user: { id: userId },
    } as any;
    let res5Data: any = null;
    let res5Status = 0;
    const res5 = {
      status(code: number) { res5Status = code; return this; },
      json(data: any) { res5Data = data; return this; },
    } as any;

    await getBudgetSummary(req5, res5);
    assert(res5Status === 200 && res5Data?.data?.total === 50, 'GET /api/trips/:tripId/budget-summary computes correct total cost');
    assert(res5Data?.data?.byCategory !== undefined && res5Data?.data?.by_category !== undefined, 'Budget summary returns both byCategory and by_category');

    // Test 6: GET /api/public/trips/:slug
    const req6 = {
      params: { slug: tripRes.rows[0].id ? (await db.query<{ share_slug: string }>('SELECT share_slug FROM trips WHERE id = $1', [tripId])).rows[0].share_slug : '' },
    } as any;
    let res6Data: any = null;
    let res6Status = 0;
    const res6 = {
      status(code: number) { res6Status = code; return this; },
      json(data: any) { res6Data = data; return this; },
    } as any;

    await getPublicTrip(req6, res6);
    assert(res6Status === 200 && res6Data?.data?.trip?.id === tripId, 'GET /api/public/trips/:slug returns public trip data');

    // Test 7: POST /api/public/trips/:slug/copy
    const req7 = {
      params: { slug: req6.params.slug },
      user: { id: userId },
    } as any;
    let res7Data: any = null;
    let res7Status = 0;
    const res7 = {
      status(code: number) { res7Status = code; return this; },
      json(data: any) { res7Data = data; return this; },
    } as any;

    await copyPublicTrip(req7, res7);
    assert(res7Status === 201 && res7Data?.data?.id !== undefined, 'POST /api/public/trips/:slug/copy clones trip successfully');

    // Cleanup test trip and copies
    await db.query('DELETE FROM trips WHERE id = $1 OR id = $2', [tripId, res7Data?.data?.id]);

    console.log(`\nTEST RESULTS: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (e) {
    console.error('Test execution error:', e);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

runTests();
