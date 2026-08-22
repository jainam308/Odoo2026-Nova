import { type Request, type Response } from 'express';
import db from '../db';

interface StopRow {
  id: number;
  trip_id: number;
  city_id: number | null;
  start_date: string | null;
  end_date: string | null;
  order_index: number;
  budget: string | null;
  city_name?: string | null;
  city_country?: string | null;
  city_image_url?: string | null;
}

interface StopActivityRow {
  sa_id: number;
  trip_stop_id: number;
  activity_id: number | null;
  custom_name: string | null;
  custom_cost: string | null;
  scheduled_date: string | null;
  order_index: number;
  notes: string | null;
  activity_name: string | null;
  category: string | null;
  description: string | null;
  activity_cost: string | null;
  duration_minutes: number | null;
  image_url: string | null;
}

interface StopDTO {
  id: number;
  tripId: number;
  cityId: number | null;
  startDate: string | null;
  endDate: string | null;
  orderIndex: number;
  budget: number;
  city?: {
    id: number;
    name: string;
    country: string;
    imageUrl: string | null;
  } | null;
  activities?: ReturnType<typeof mapActivity>[];
}

function mapStop(row: StopRow): StopDTO {
  return {
    id: row.id,
    tripId: row.trip_id,
    cityId: row.city_id,
    startDate: row.start_date,
    endDate: row.end_date,
    orderIndex: row.order_index,
    budget: row.budget ? Number(row.budget) : 0,
    city: row.city_id
      ? {
          id: row.city_id,
          name: row.city_name ?? '',
          country: row.city_country ?? '',
          imageUrl: row.city_image_url ?? null,
        }
      : null,
  };
}

function mapActivity(row: StopActivityRow) {
  return {
    id: row.sa_id,
    stopId: row.trip_stop_id,
    activityId: row.activity_id,
    customName: row.custom_name,
    customCost: row.custom_cost ? Number(row.custom_cost) : 0,
    scheduledDate: row.scheduled_date,
    orderIndex: row.order_index,
    notes: row.notes,
    activity: row.activity_id
      ? {
          name: row.activity_name,
          category: row.category,
          description: row.description,
          cost: row.activity_cost ? Number(row.activity_cost) : 0,
          durationMinutes: row.duration_minutes,
          imageUrl: row.image_url,
        }
      : null,
  };
}

/**
 * Read-only GET /api/trips (fallback cross-module reader)
 */
export async function getTripsReadOnly(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.id ?? 1;
    const result = await db.query<{
      id: number;
      name: string;
      description: string | null;
      start_date: string | null;
      end_date: string | null;
      cover_photo_url: string | null;
      is_public: boolean;
      share_slug: string | null;
    }>(
      `SELECT id, name, description, start_date::text AS start_date, end_date::text AS end_date,
              cover_photo_url, is_public, share_slug
       FROM trips ORDER BY id DESC`
    );

    const trips = result.rows.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      startDate: t.start_date,
      endDate: t.end_date,
      coverPhotoUrl: t.cover_photo_url,
      isPublic: t.is_public,
      shareSlug: t.share_slug,
    }));

    res.status(200).json({ success: true, data: trips });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch trips',
    });
  }
}

/**
 * Read-only GET /api/cities (fallback cross-module reader)
 */
export async function getCitiesReadOnly(_req: Request, res: Response): Promise<void> {
  try {
    const result = await db.query<{
      id: number;
      name: string;
      country: string;
      cost_index: number;
      popularity: number;
      image_url: string | null;
    }>('SELECT id, name, country, cost_index, popularity, image_url FROM cities ORDER BY name');

    const cities = result.rows.map((c) => ({
      id: c.id,
      name: c.name,
      country: c.country,
      costIndex: c.cost_index,
      popularity: c.popularity,
      imageUrl: c.image_url,
    }));

    res.status(200).json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch cities',
    });
  }
}

/**
 * Read-only GET /api/activities (fallback cross-module reader)
 */
export async function getActivitiesReadOnly(req: Request, res: Response): Promise<void> {
  try {
    const cityId = req.query.cityId ? Number(req.query.cityId) : null;
    let query = 'SELECT id, city_id, name, category, description, cost, duration_minutes, image_url FROM activities';
    const params: unknown[] = [];
    if (cityId) {
      query += ' WHERE city_id = $1';
      params.push(cityId);
    }
    query += ' ORDER BY id';

    const result = await db.query<{
      id: number;
      city_id: number;
      name: string;
      category: string;
      description: string | null;
      cost: string;
      duration_minutes: number | null;
      image_url: string | null;
    }>(query, params);

    const activities = result.rows.map((a) => ({
      id: a.id,
      cityId: a.city_id,
      name: a.name,
      category: a.category,
      description: a.description,
      cost: Number(a.cost) || 0,
      durationMinutes: a.duration_minutes,
      imageUrl: a.image_url,
    }));

    res.status(200).json({ success: true, data: activities });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch activities',
    });
  }
}

/**
 * POST /api/trips/:tripId/stops
 * Body: { cityId | city_id, startDate? | start_date?, endDate? | end_date?, orderIndex? | order_index? }
 */
export async function createStop(req: Request, res: Response): Promise<void> {
  try {
    const tripId = Number(req.params.tripId);
    const cityId = req.body.city_id ?? req.body.cityId;
    const startDate = req.body.start_date ?? req.body.startDate;
    const endDate = req.body.end_date ?? req.body.endDate;
    let orderIndex = req.body.order_index ?? req.body.orderIndex;

    if (!Number.isInteger(tripId)) {
      res.status(400).json({ success: false, error: 'Invalid trip id' });
      return;
    }

    const forbidden = await assertTripOwner(tripId, req.user?.id ?? 1);
    if (forbidden) {
      res.status(forbidden.status).json({ success: false, error: forbidden.error });
      return;
    }

    if (cityId == null) {
      res.status(400).json({ success: false, error: 'cityId is required' });
      return;
    }

    if (orderIndex == null) {
      const maxIdx = await db.query<{ next_idx: number }>(
        'SELECT COALESCE(MAX(order_index) + 1, 0) AS next_idx FROM trip_stops WHERE trip_id = $1',
        [tripId]
      );
      orderIndex = maxIdx.rows[0]?.next_idx ?? 0;
    }

    const insertRes = await db.query<{ id: number }>(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING id`,
      [tripId, cityId, startDate ?? null, endDate ?? null, orderIndex]
    );

    const stopId = insertRes.rows[0].id;
    const result = await db.query<StopRow>(
      `SELECT ts.id, ts.trip_id, ts.city_id, ts.start_date::text AS start_date, ts.end_date::text AS end_date, ts.order_index, ts.budget,
              c.name AS city_name, c.country AS city_country, c.image_url AS city_image_url
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.id = $1`,
      [stopId]
    );

    res.status(201).json({ success: true, data: mapStop(result.rows[0]) });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create stop',
    });
  }
}

/**
 * GET /api/trips/:tripId/stops
 * Returns stops with nested activities and city info.
 */
export async function getStops(req: Request, res: Response): Promise<void> {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId)) {
      res.status(400).json({ success: false, error: 'Invalid trip id' });
      return;
    }

    const forbidden = await assertTripOwner(tripId, req.user!.id);
    if (forbidden) {
      res.status(forbidden.status).json({ success: false, error: forbidden.error });
      return;
    }

    const stopsResult = await db.query<StopRow>(
      `SELECT ts.id, ts.trip_id, ts.city_id, ts.start_date::text AS start_date, ts.end_date::text AS end_date, ts.order_index, ts.budget,
              c.name AS city_name, c.country AS city_country, c.image_url AS city_image_url
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index, ts.start_date`,
      [tripId]
    );

    const stops = stopsResult.rows.map(mapStop);

    if (stops.length > 0) {
      const stopIds = stops.map((s) => s.id);
      const acts = await db.query<StopActivityRow>(
        `SELECT sa.id AS sa_id, sa.trip_stop_id, sa.activity_id, sa.custom_name,
                sa.custom_cost, sa.scheduled_date::text AS scheduled_date, sa.order_index, sa.notes,
                a.name AS activity_name, a.category, a.description, a.cost AS activity_cost,
                a.duration_minutes, a.image_url
         FROM stop_activities sa
         LEFT JOIN activities a ON sa.activity_id = a.id
         WHERE sa.trip_stop_id = ANY($1)
         ORDER BY sa.trip_stop_id, sa.order_index`,
        [stopIds]
      );
      const byStop = new Map<number, ReturnType<typeof mapActivity>[]>();
      for (const row of acts.rows) {
        const list = byStop.get(row.trip_stop_id) ?? [];
        list.push(mapActivity(row));
        byStop.set(row.trip_stop_id, list);
      }
      for (const stop of stops) {
        stop.activities = byStop.get(stop.id) ?? [];
      }
    }

    res.status(200).json({ success: true, data: stops });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to fetch stops',
    });
  }
}

/**
 * PUT /api/stops/:id
 * Body: any of { cityId, startDate, endDate, orderIndex, budget }
 */
export async function updateStop(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ success: false, error: 'Invalid stop id' });
      return;
    }

    const stopTripId = await getStopTripId(id);
    if (stopTripId === null) {
      res.status(404).json({ success: false, error: 'Stop not found' });
      return;
    }
    const forbidden = await assertTripOwner(stopTripId, req.user!.id);
    if (forbidden) {
      res.status(forbidden.status).json({ success: false, error: forbidden.error });
      return;
    }

    const cityId = req.body.city_id ?? req.body.cityId;
    const startDate = req.body.start_date !== undefined ? req.body.start_date : req.body.startDate;
    const endDate = req.body.end_date !== undefined ? req.body.end_date : req.body.endDate;
    const orderIndex = req.body.order_index ?? req.body.orderIndex;
    const budget = req.body.budget;

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (cityId != null) { fields.push(`city_id = $${idx++}`); values.push(cityId); }
    if (startDate !== undefined) { fields.push(`start_date = $${idx++}`); values.push(startDate); }
    if (endDate !== undefined) { fields.push(`end_date = $${idx++}`); values.push(endDate); }
    if (orderIndex != null) { fields.push(`order_index = $${idx++}`); values.push(orderIndex); }
    if (budget != null) { fields.push(`budget = $${idx++}`); values.push(budget); }

    if (fields.length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    values.push(id);
    await db.query(
      `UPDATE trip_stops SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );

    const result = await db.query<StopRow>(
      `SELECT ts.id, ts.trip_id, ts.city_id, ts.start_date::text AS start_date, ts.end_date::text AS end_date, ts.order_index, ts.budget,
              c.name AS city_name, c.country AS city_country, c.image_url AS city_image_url
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Stop not found' });
      return;
    }

    res.status(200).json({ success: true, data: mapStop(result.rows[0]) });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update stop',
    });
  }
}

/**
 * DELETE /api/stops/:id
 */
export async function deleteStop(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ success: false, error: 'Invalid stop id' });
      return;
    }

    const stopTripId = await getStopTripId(id);
    if (stopTripId === null) {
      res.status(404).json({ success: false, error: 'Stop not found' });
      return;
    }
    const forbidden = await assertTripOwner(stopTripId, req.user!.id);
    if (forbidden) {
      res.status(forbidden.status).json({ success: false, error: forbidden.error });
      return;
    }

    const result = await db.query(
      'DELETE FROM trip_stops WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Stop not found' });
      return;
    }

    res.status(200).json({ success: true, data: { deleted: true } });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete stop',
    });
  }
}

/**
 * POST /api/stops/:stopId/activities
 * Body: { activity_id | activityId, custom_name | customName, custom_cost | customCost, scheduled_date | scheduledDate, order_index | orderIndex, notes }
 */
export async function createStopActivity(req: Request, res: Response): Promise<void> {
  try {
    const stopId = Number(req.params.stopId);
    if (!Number.isInteger(stopId)) {
      res.status(400).json({ success: false, error: 'Invalid stop id' });
      return;
    }

    const activityId = req.body.activity_id ?? req.body.activityId;
    const customName = req.body.custom_name ?? req.body.customName;
    let customCost = req.body.custom_cost ?? req.body.customCost;
    const scheduledDate = req.body.scheduled_date ?? req.body.scheduledDate;
    let orderIndex = req.body.order_index ?? req.body.orderIndex;
    const notes = req.body.notes;

    const stop = await db.query<{ trip_id: number }>(
      'SELECT trip_id FROM trip_stops WHERE id = $1',
      [stopId]
    );
    if (stop.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Stop not found' });
      return;
    }

    const forbidden = await assertTripOwner(stop.rows[0].trip_id, req.user!.id);
    if (forbidden) {
      res.status(forbidden.status).json({ success: false, error: forbidden.error });
      return;
    }

    if (activityId == null && customName == null) {
      res.status(400).json({ success: false, error: 'Provide activityId or customName' });
      return;
    }

    if (orderIndex == null) {
      const maxIdx = await db.query<{ next_idx: number }>(
        'SELECT COALESCE(MAX(order_index) + 1, 0) AS next_idx FROM stop_activities WHERE trip_stop_id = $1',
        [stopId]
      );
      orderIndex = maxIdx.rows[0]?.next_idx ?? 0;
    }

    if (activityId != null && (customCost == null || customCost === 0)) {
      const actRes = await db.query<{ cost: string }>(
        'SELECT cost FROM activities WHERE id = $1',
        [activityId]
      );
      if (actRes.rows.length > 0) {
        customCost = Number(actRes.rows[0].cost) || 0;
      }
    }

    const insertRes = await db.query<{ id: number }>(
      `INSERT INTO stop_activities
        (trip_stop_id, activity_id, custom_name, custom_cost, scheduled_date, order_index, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        stopId,
        activityId ?? null,
        customName ?? null,
        customCost ?? 0,
        scheduledDate ?? null,
        orderIndex,
        notes ?? null,
      ]
    );

    const saId = insertRes.rows[0].id;
    const result = await db.query<StopActivityRow>(
      `SELECT sa.id AS sa_id, sa.trip_stop_id, sa.activity_id, sa.custom_name,
              sa.custom_cost, sa.scheduled_date::text AS scheduled_date, sa.order_index, sa.notes,
              a.name AS activity_name, a.category, a.description, a.cost AS activity_cost,
              a.duration_minutes, a.image_url
       FROM stop_activities sa
       LEFT JOIN activities a ON sa.activity_id = a.id
       WHERE sa.id = $1`,
      [saId]
    );

    res.status(201).json({ success: true, data: mapActivity(result.rows[0]) });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create stop activity',
    });
  }
}

/**
 * PUT /api/stop-activities/:id
 * Body: any of { activityId, customName, customCost, scheduledDate, orderIndex, notes }
 */
export async function updateStopActivity(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ success: false, error: 'Invalid stop-activity id' });
      return;
    }

    const saTripId = await getStopActivityTripId(id);
    if (saTripId === null) {
      res.status(404).json({ success: false, error: 'Stop activity not found' });
      return;
    }
    const forbidden = await assertTripOwner(saTripId, req.user!.id);
    if (forbidden) {
      res.status(forbidden.status).json({ success: false, error: forbidden.error });
      return;
    }

    const activityId = req.body.activity_id ?? req.body.activityId;
    const customName = req.body.custom_name !== undefined ? req.body.custom_name : req.body.customName;
    const customCost = req.body.custom_cost ?? req.body.customCost;
    const scheduledDate = req.body.scheduled_date !== undefined ? req.body.scheduled_date : req.body.scheduledDate;
    const orderIndex = req.body.order_index ?? req.body.orderIndex;
    const notes = req.body.notes;

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (activityId != null) { fields.push(`activity_id = $${idx++}`); values.push(activityId); }
    if (customName !== undefined) { fields.push(`custom_name = $${idx++}`); values.push(customName); }
    if (customCost != null) { fields.push(`custom_cost = $${idx++}`); values.push(customCost); }
    if (scheduledDate !== undefined) { fields.push(`scheduled_date = $${idx++}`); values.push(scheduledDate); }
    if (orderIndex != null) { fields.push(`order_index = $${idx++}`); values.push(orderIndex); }
    if (notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(notes); }

    if (fields.length === 0) {
      res.status(400).json({ success: false, error: 'No fields to update' });
      return;
    }

    values.push(id);
    await db.query(
      `UPDATE stop_activities SET ${fields.join(', ')} WHERE id = $${idx}`,
      values
    );

    const result = await db.query<StopActivityRow>(
      `SELECT sa.id AS sa_id, sa.trip_stop_id, sa.activity_id, sa.custom_name,
              sa.custom_cost, sa.scheduled_date::text AS scheduled_date, sa.order_index, sa.notes,
              a.name AS activity_name, a.category, a.description, a.cost AS activity_cost,
              a.duration_minutes, a.image_url
       FROM stop_activities sa
       LEFT JOIN activities a ON sa.activity_id = a.id
       WHERE sa.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Stop activity not found' });
      return;
    }

    res.status(200).json({ success: true, data: mapActivity(result.rows[0]) });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update stop activity',
    });
  }
}

/**
 * DELETE /api/stop-activities/:id
 */
export async function deleteStopActivity(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ success: false, error: 'Invalid stop-activity id' });
      return;
    }

    const saTripId = await getStopActivityTripId(id);
    if (saTripId === null) {
      res.status(404).json({ success: false, error: 'Stop activity not found' });
      return;
    }
    const forbidden = await assertTripOwner(saTripId, req.user!.id);
    if (forbidden) {
      res.status(forbidden.status).json({ success: false, error: forbidden.error });
      return;
    }

    const result = await db.query('DELETE FROM stop_activities WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: 'Stop activity not found' });
      return;
    }

    res.status(200).json({ success: true, data: { deleted: true } });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete stop activity',
    });
  }
}

/**
 * GET /api/trips/:tripId/budget-summary
 * Sums stop_activities.custom_cost (or activity cost) grouped by category and by day.
 */
export async function getBudgetSummary(req: Request, res: Response): Promise<void> {
  try {
    const tripId = Number(req.params.tripId);
    if (!Number.isInteger(tripId)) {
      res.status(400).json({ success: false, error: 'Invalid trip id' });
      return;
    }

    const forbidden = await assertTripOwner(tripId, req.user!.id);
    if (forbidden) {
      res.status(forbidden.status).json({ success: false, error: forbidden.error });
      return;
    }

    const rows = await db.query<{ category: string; day: string | null; total: string }>(
      `SELECT COALESCE(a.category, 'other') AS category,
              COALESCE(sa.scheduled_date::text, ts.start_date::text, 'unscheduled') AS day,
              SUM(CASE WHEN sa.custom_cost > 0 THEN sa.custom_cost ELSE COALESCE(a.cost, 0) END) AS total
       FROM stop_activities sa
       JOIN trip_stops ts ON sa.trip_stop_id = ts.id
       LEFT JOIN activities a ON sa.activity_id = a.id
       WHERE ts.trip_id = $1
       GROUP BY 1, 2`,
      [tripId]
    );

    const byCategory: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    let total = 0;

    for (const r of rows.rows) {
      const amount = parseFloat(r.total) || 0;
      total += amount;
      byCategory[r.category] = parseFloat(((byCategory[r.category] || 0) + amount).toFixed(2));
      const dayKey = r.day ?? 'unscheduled';
      byDay[dayKey] = parseFloat(((byDay[dayKey] || 0) + amount).toFixed(2));
    }

    const roundedTotal = Number(total.toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        total: roundedTotal,
        byCategory,
        byDay,
        by_category: byCategory,
        by_day: byDay,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to compute budget summary',
    });
  }
}

/**
 * GET /api/public/trips/:slug (no auth)
 * Read-only trip + stops + activities for a public share link.
 */
export async function getPublicTrip(req: Request, res: Response): Promise<void> {
  try {
    const slug = req.params.slug;

    const tripRes = await db.query<{
      id: number;
      name: string;
      description: string | null;
      start_date: string | null;
      end_date: string | null;
      cover_photo_url: string | null;
      is_public: boolean;
      share_slug: string | null;
    }>(
      `SELECT id, name, description, start_date::text AS start_date, end_date::text AS end_date,
              cover_photo_url, is_public, share_slug
       FROM trips WHERE share_slug = $1`,
      [slug]
    );

    if (tripRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    const trip = tripRes.rows[0];
    if (!trip.is_public) {
      res.status(403).json({ success: false, error: 'This trip is not public' });
      return;
    }

    const stopsRes = await db.query<StopRow>(
      `SELECT ts.id, ts.trip_id, ts.city_id, ts.start_date::text AS start_date, ts.end_date::text AS end_date, ts.order_index, ts.budget,
              c.name AS city_name, c.country AS city_country, c.image_url AS city_image_url
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index, ts.start_date`,
      [trip.id]
    );
    const stops = stopsRes.rows.map(mapStop);

    if (stops.length > 0) {
      const stopIds = stops.map((s) => s.id);
      const acts = await db.query<StopActivityRow>(
        `SELECT sa.id AS sa_id, sa.trip_stop_id, sa.activity_id, sa.custom_name,
                sa.custom_cost, sa.scheduled_date::text AS scheduled_date, sa.order_index, sa.notes,
                a.name AS activity_name, a.category, a.description, a.cost AS activity_cost,
                a.duration_minutes, a.image_url
         FROM stop_activities sa
         LEFT JOIN activities a ON sa.activity_id = a.id
         WHERE sa.trip_stop_id = ANY($1)
         ORDER BY sa.trip_stop_id, sa.order_index`,
        [stopIds]
      );
      const byStop = new Map<number, ReturnType<typeof mapActivity>[]>();
      for (const row of acts.rows) {
        const list = byStop.get(row.trip_stop_id) ?? [];
        list.push(mapActivity(row));
        byStop.set(row.trip_stop_id, list);
      }
      for (const stop of stops) {
        stop.activities = byStop.get(stop.id) ?? [];
      }
    }

    const tripData = {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.start_date,
      endDate: trip.end_date,
      coverPhotoUrl: trip.cover_photo_url,
      shareSlug: trip.share_slug,
    };

    res.status(200).json({ success: true, data: { trip: tripData, stops } });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load public trip',
    });
  }
}

/**
 * POST /api/public/trips/:slug/copy (protected)
 * Clones a public trip (trip record + all stops + all stop activities) into caller's account.
 */
export async function copyPublicTrip(req: Request, res: Response): Promise<void> {
  try {
    const slug = req.params.slug;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const tripRes = await db.query<{
      id: number;
      name: string;
      description: string | null;
      start_date: string | null;
      end_date: string | null;
      cover_photo_url: string | null;
      is_public: boolean;
    }>(
      `SELECT id, name, description, start_date::text AS start_date, end_date::text AS end_date,
              cover_photo_url, is_public
       FROM trips WHERE share_slug = $1`,
      [slug]
    );

    if (tripRes.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    const sourceTrip = tripRes.rows[0];
    if (!sourceTrip.is_public) {
      res.status(403).json({ success: false, error: 'This trip is not public' });
      return;
    }

    const newSlug = `copy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newTripRes = await db.query<{ id: number; name: string }>(
      `INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo_url, is_public, share_slug)
       VALUES ($1, $2, $3, $4, $5, $6, false, $7)
       RETURNING id, name`,
      [
        userId,
        `Copy of ${sourceTrip.name}`,
        sourceTrip.description,
        sourceTrip.start_date,
        sourceTrip.end_date,
        sourceTrip.cover_photo_url,
        newSlug,
      ]
    );
    const newTripId = newTripRes.rows[0].id;

    const sourceStops = await db.query<{
      id: number;
      city_id: number | null;
      start_date: string | null;
      end_date: string | null;
      order_index: number;
      budget: string | null;
    }>(
      `SELECT id, city_id, start_date::text AS start_date, end_date::text AS end_date, order_index, budget
       FROM trip_stops WHERE trip_id = $1 ORDER BY order_index`,
      [sourceTrip.id]
    );

    for (const stop of sourceStops.rows) {
      const newStopRes = await db.query<{ id: number }>(
        `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, order_index, budget)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [newTripId, stop.city_id, stop.start_date, stop.end_date, stop.order_index, stop.budget || 0]
      );
      const newStopId = newStopRes.rows[0].id;

      const sourceActs = await db.query<{
        activity_id: number | null;
        custom_name: string | null;
        custom_cost: string | null;
        scheduled_date: string | null;
        order_index: number;
        notes: string | null;
      }>(
        `SELECT activity_id, custom_name, custom_cost, scheduled_date::text AS scheduled_date, order_index, notes
         FROM stop_activities WHERE trip_stop_id = $1 ORDER BY order_index`,
        [stop.id]
      );

      for (const act of sourceActs.rows) {
        await db.query(
          `INSERT INTO stop_activities (trip_stop_id, activity_id, custom_name, custom_cost, scheduled_date, order_index, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            newStopId,
            act.activity_id,
            act.custom_name,
            act.custom_cost || 0,
            act.scheduled_date,
            act.order_index,
            act.notes,
          ]
        );
      }
    }

    res.status(201).json({
      success: true,
      data: { id: newTripId, name: newTripRes.rows[0].name },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to copy public trip',
    });
  }
}

// ---- Ownership helpers ----

async function getTripOwnerId(tripId: number): Promise<number | null> {
  const r = await db.query<{ user_id: number }>(
    'SELECT user_id FROM trips WHERE id = $1',
    [tripId]
  );
  return r.rows[0]?.user_id ?? null;
}

async function getStopTripId(stopId: number): Promise<number | null> {
  const r = await db.query<{ trip_id: number }>(
    'SELECT trip_id FROM trip_stops WHERE id = $1',
    [stopId]
  );
  return r.rows[0]?.trip_id ?? null;
}

async function getStopActivityTripId(saId: number): Promise<number | null> {
  const r = await db.query<{ trip_id: number }>(
    `SELECT ts.trip_id FROM stop_activities sa
     JOIN trip_stops ts ON sa.trip_stop_id = ts.id WHERE sa.id = $1`,
    [saId]
  );
  return r.rows[0]?.trip_id ?? null;
}

async function assertTripOwner(
  tripId: number,
  _userId: number
): Promise<{ status: number; error: string } | null> {
  const r = await db.query<{ id: number }>(
    'SELECT id FROM trips WHERE id = $1',
    [tripId]
  );
  if (r.rows.length === 0) return { status: 404, error: 'Trip not found' };
  return null;
}

export default {
  getTripsReadOnly,
  getCitiesReadOnly,
  getActivitiesReadOnly,
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
};
