import db from '../db';
import {
  createStop,
  getStops,
  updateStop,
  deleteStop,
  createStopActivity,
  updateStopActivity,
  deleteStopActivity,
  getBudgetSummary,
  getPublicTrip,
  copyPublicTrip,
} from '../modules/itinerary.controller';
import type { Request, Response } from 'express';

// Helper mock functions for Express Request / Response
function mockReqRes(params = {}, body = {}, query = {}, user = { id: 1, email: 'demo@globetrotter.dev' }) {
  let statusCode = 200;
  let jsonBody: any = null;

  const req = {
    params,
    body,
    query,
    user,
  } as unknown as Request;

  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      jsonBody = data;
      return res;
    },
  } as unknown as Response;

  return { req, res, getStatus: () => statusCode, getJson: () => jsonBody };
}

async function runTests() {
  console.log('====================================================');
  console.log('--- STARTING THOROUGH MODULE C VERIFICATION SUITE ---');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Ensure test trip exists
  const tripRes = await db.query<{ id: number; share_slug: string }>(
    `SELECT id, share_slug FROM trips LIMIT 1`
  );
  if (tripRes.rows.length === 0) {
    console.error('No trip found in database to run tests against!');
    process.exit(1);
  }
  const testTripId = tripRes.rows[0].id;
  const testSlug = tripRes.rows[0].share_slug;

  const cityRes = await db.query<{ id: number }>('SELECT id FROM cities LIMIT 1');
  const testCityId = cityRes.rows[0].id;

  const actRes = await db.query<{ id: number; cost: string }>('SELECT id, cost FROM activities LIMIT 1');
  const testActivityId = actRes.rows[0].id;
  const testActivityCost = Number(actRes.rows[0].cost);

  // --- TEST 1: Create Stop (POST /api/trips/:tripId/stops) ---
  const t1 = mockReqRes({ tripId: String(testTripId) }, { cityId: testCityId, startDate: '2026-09-20', endDate: '2026-09-25' });
  await createStop(t1.req, t1.res);
  assert(t1.getStatus() === 201, 'createStop returns 201 Created');
  assert(t1.getJson()?.success === true, 'createStop response has success: true');
  const createdStopId = t1.getJson()?.data?.id;
  assert(typeof createdStopId === 'number', `createStop created stop ID=${createdStopId}`);

  // --- TEST 2: Get Stops (GET /api/trips/:tripId/stops) ---
  const t2 = mockReqRes({ tripId: String(testTripId) });
  await getStops(t2.req, t2.res);
  assert(t2.getStatus() === 200, 'getStops returns 200 OK');
  const stopsList = t2.getJson()?.data;
  assert(Array.isArray(stopsList) && stopsList.some((s: any) => s.id === createdStopId), 'getStops contains created stop');

  // --- TEST 3: Update Stop (PUT /api/stops/:id) ---
  const t3 = mockReqRes({ id: String(createdStopId) }, { startDate: '2026-09-21', endDate: '2026-09-26', orderIndex: 5 });
  await updateStop(t3.req, t3.res);
  assert(t3.getStatus() === 200, 'updateStop returns 200 OK');
  assert(t3.getJson()?.data?.startDate === '2026-09-21', 'updateStop updated startDate');

  // --- TEST 4: Create Catalog Stop Activity (POST /api/stops/:stopId/activities) ---
  const t4 = mockReqRes({ stopId: String(createdStopId) }, { activityId: testActivityId, scheduledDate: '2026-09-21' });
  await createStopActivity(t4.req, t4.res);
  assert(t4.getStatus() === 201, 'createStopActivity returns 201 Created for catalog activity');
  const createdActivityId = t4.getJson()?.data?.id;
  assert(typeof createdActivityId === 'number', `createStopActivity created activity ID=${createdActivityId}`);

  // --- TEST 5: Create Custom Stop Activity ---
  const t5 = mockReqRes({ stopId: String(createdStopId) }, { customName: 'Helicopter Tour', customCost: 150.0, scheduledDate: '2026-09-22' });
  await createStopActivity(t5.req, t5.res);
  assert(t5.getStatus() === 201, 'createStopActivity returns 201 Created for custom activity');
  const customActivityId = t5.getJson()?.data?.id;

  // --- TEST 6: Update Stop Activity (PUT /api/stop-activities/:id) ---
  const t6 = mockReqRes({ id: String(customActivityId) }, { customCost: 175.0, notes: 'VIP tickets' });
  await updateStopActivity(t6.req, t6.res);
  assert(t6.getStatus() === 200, 'updateStopActivity returns 200 OK');
  assert(t6.getJson()?.data?.customCost === 175.0, 'updateStopActivity updated customCost');

  // --- TEST 7: Budget Summary Endpoint (GET /api/trips/:tripId/budget-summary) ---
  const t7 = mockReqRes({ tripId: String(testTripId) });
  await getBudgetSummary(t7.req, t7.res);
  assert(t7.getStatus() === 200, 'getBudgetSummary returns 200 OK');
  const budgetData = t7.getJson()?.data;
  assert(typeof budgetData?.total === 'number' && budgetData.total >= 175.0, `getBudgetSummary computes total cost (${budgetData?.total})`);
  assert(typeof budgetData?.byCategory === 'object', 'getBudgetSummary provides byCategory breakdown');
  assert(typeof budgetData?.byDay === 'object', 'getBudgetSummary provides byDay breakdown');

  // --- TEST 8: Public Share View Endpoint (GET /api/public/trips/:slug) ---
  const t8 = mockReqRes({ slug: testSlug }, {}, {}, null as any); // unauthenticated
  await getPublicTrip(t8.req, t8.res);
  assert(t8.getStatus() === 200, 'getPublicTrip returns 200 OK without auth');
  assert(t8.getJson()?.data?.trip?.shareSlug === testSlug, 'getPublicTrip returns matching trip slug');

  // --- TEST 9: Copy Public Trip Endpoint (POST /api/public/trips/:slug/copy) ---
  const t9 = mockReqRes({ slug: testSlug });
  await copyPublicTrip(t9.req, t9.res);
  assert(t9.getStatus() === 201, 'copyPublicTrip returns 201 Created');
  const copiedTrip = t9.getJson()?.data;
  assert(typeof copiedTrip?.id === 'number', `copyPublicTrip created cloned trip ID=${copiedTrip?.id}`);

  // --- TEST 10: Delete Stop Activity (DELETE /api/stop-activities/:id) ---
  const t10 = mockReqRes({ id: String(customActivityId) });
  await deleteStopActivity(t10.req, t10.res);
  assert(t10.getStatus() === 200, 'deleteStopActivity returns 200 OK');

  // --- TEST 11: Delete Stop (DELETE /api/stops/:id) ---
  const t11 = mockReqRes({ id: String(createdStopId) });
  await deleteStop(t11.req, t11.res);
  assert(t11.getStatus() === 200, 'deleteStop returns 200 OK');

  console.log('====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('VERIFICATION SUITE CRASHED:', e);
    process.exit(1);
  });
