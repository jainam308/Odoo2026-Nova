import { Request, Response, NextFunction } from 'express';
import db from '../../db';
import type { CreateTripInput } from '../../types/trip';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

/**
 * Helper to get a fallback user_id if the user is unauthenticated
 */
async function resolveUserId(req: AuthenticatedRequest): Promise<number> {
  if (req.user?.id) {
    return req.user.id;
  }
  // Fallback to first existing user in DB (e.g. seeded demo user)
  const userResult = await db.query<{ id: number }>('SELECT id FROM users ORDER BY id ASC LIMIT 1');
  if (userResult.rows.length > 0) {
    return userResult.rows[0].id;
  }
  // Create a default user if none exists
  const newUser = await db.query<{ id: number }>(
    `INSERT INTO users (first_name, last_name, email, password_hash)
     VALUES ('Globe', 'Trotter', 'user@globetrotter.com', 'demo_hash')
     RETURNING id`
  );
  return newUser.rows[0].id;
}

/**
 * POST /api/trips - Create a new trip in PostgreSQL
 */
export const createTrip = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, start_date, end_date, cover_photo_url, is_public } = req.body;
    const errors: string[] = [];

    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      errors.push('Trip name must be at least 3 characters long.');
    } else if (name.trim().length > 100) {
      errors.push('Trip name cannot exceed 100 characters.');
    }

    if (!start_date || typeof start_date !== 'string') {
      errors.push('A valid start date is required.');
    }

    if (!end_date || typeof end_date !== 'string') {
      errors.push('A valid end date is required.');
    }

    if (start_date && end_date && end_date < start_date) {
      errors.push('End date cannot be earlier than start date.');
    }

    if (cover_photo_url && (typeof cover_photo_url !== 'string' || !/^(https?:\/\/).+/i.test(cover_photo_url))) {
      errors.push('Cover photo URL must be a valid HTTP or HTTPS URL.');
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    const userId = await resolveUserId(req);
    const slugBase = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const shareSlug = `${slugBase}-${Date.now().toString().slice(-6)}`;

    const insertQuery = `
      INSERT INTO trips (user_id, name, description, start_date, end_date, cover_photo_url, is_public, share_slug)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, user_id, name, description,
                TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
                TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
                cover_photo_url, is_public, share_slug, created_at
    `;

    const result = await db.query(insertQuery, [
      userId,
      name.trim(),
      description ? description.trim() : '',
      start_date,
      end_date,
      cover_photo_url ? cover_photo_url.trim() : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      Boolean(is_public),
      shareSlug,
    ]);

    res.status(201).json({
      success: true,
      trip: {
        ...result.rows[0],
        stops: [],
        estimated_cost: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/trips - Retrieve all trips from PostgreSQL with populated stops
 */
export const getUserTrips = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tripsQuery = `
      SELECT t.id, t.user_id, t.name, t.description,
             TO_CHAR(t.start_date, 'YYYY-MM-DD') as start_date,
             TO_CHAR(t.end_date, 'YYYY-MM-DD') as end_date,
             t.cover_photo_url, t.is_public, t.share_slug, t.created_at,
             COALESCE(SUM(sa.custom_cost), 0)::numeric as estimated_cost
      FROM trips t
      LEFT JOIN trip_stops ts ON ts.trip_id = t.id
      LEFT JOIN stop_activities sa ON sa.trip_stop_id = ts.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;

    const tripsResult = await db.query(tripsQuery);
    const trips = tripsResult.rows;

    if (trips.length === 0) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const tripIds = trips.map((t) => t.id);

    // Fetch all stops for these trips
    const stopsQuery = `
      SELECT ts.id, ts.trip_id, ts.city_id,
             TO_CHAR(ts.start_date, 'YYYY-MM-DD') as start_date,
             TO_CHAR(ts.end_date, 'YYYY-MM-DD') as end_date,
             ts.budget::numeric as budget, ts.order_index,
             COALESCE(c.name, 'City Stop') as city_name,
             COALESCE(c.country, 'India') as country,
             COALESCE(c.image_url, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80') as image_url
      FROM trip_stops ts
      LEFT JOIN cities c ON ts.city_id = c.id
      WHERE ts.trip_id = ANY($1::int[])
      ORDER BY ts.order_index ASC, ts.start_date ASC
    `;
    const stopsResult = await db.query(stopsQuery, [tripIds]);
    const stops = stopsResult.rows;

    // Fetch activity counts per stop
    const stopIds = stops.map((s) => s.id);
    let activitiesMap: Record<number, any[]> = {};

    if (stopIds.length > 0) {
      const activitiesQuery = `
        SELECT sa.id, sa.trip_stop_id, sa.custom_name as name,
               sa.custom_cost::numeric as cost, sa.notes,
               COALESCE(a.category, 'Sightseeing') as category,
               COALESCE(a.duration_minutes, 60) as duration_minutes,
               COALESCE(a.image_url, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80') as image_url
        FROM stop_activities sa
        LEFT JOIN activities a ON sa.activity_id = a.id
        WHERE sa.trip_stop_id = ANY($1::int[])
        ORDER BY sa.order_index ASC, sa.id ASC
      `;
      const actResult = await db.query(activitiesQuery, [stopIds]);
      for (const act of actResult.rows) {
        if (!activitiesMap[act.trip_stop_id]) activitiesMap[act.trip_stop_id] = [];
        activitiesMap[act.trip_stop_id].push(act);
      }
    }

    const stopsByTrip: Record<number, any[]> = {};
    for (const stop of stops) {
      if (!stopsByTrip[stop.trip_id]) stopsByTrip[stop.trip_id] = [];
      stopsByTrip[stop.trip_id].push({
        ...stop,
        activities: activitiesMap[stop.id] || [],
      });
    }

    const enrichedTrips = trips.map((trip) => ({
      ...trip,
      estimated_cost: Number(trip.estimated_cost) || 0,
      stops: stopsByTrip[trip.id] || [],
    }));

    res.status(200).json({ success: true, data: enrichedTrips });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/trips/:id - Retrieve a full detailed trip from PostgreSQL
 */
export const getTripById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ success: false, message: 'Invalid trip ID parameter' });
      return;
    }

    const tripResult = await db.query(
      `SELECT t.id, t.user_id, t.name, t.description,
              TO_CHAR(t.start_date, 'YYYY-MM-DD') as start_date,
              TO_CHAR(t.end_date, 'YYYY-MM-DD') as end_date,
              t.cover_photo_url, t.is_public, t.share_slug, t.created_at,
              u.first_name, u.last_name, u.email as user_email
       FROM trips t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (tripResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    const trip = tripResult.rows[0];

    // Fetch stops
    const stopsResult = await db.query(
      `SELECT ts.id, ts.trip_id, ts.city_id,
              TO_CHAR(ts.start_date, 'YYYY-MM-DD') as start_date,
              TO_CHAR(ts.end_date, 'YYYY-MM-DD') as end_date,
              ts.budget::numeric as budget, ts.order_index,
              COALESCE(c.name, 'City Stop') as city_name,
              COALESCE(c.country, 'India') as country,
              COALESCE(c.image_url, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80') as image_url
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index ASC, ts.start_date ASC, ts.id ASC`,
      [id]
    );

    const stops = stopsResult.rows;
    const stopIds = stops.map((s) => s.id);

    let activitiesMap: Record<number, any[]> = {};
    let totalEstimatedCost = 0;

    if (stopIds.length > 0) {
      const actResult = await db.query(
        `SELECT sa.id, sa.trip_stop_id, sa.activity_id,
                sa.custom_name as name,
                sa.custom_cost::numeric as cost,
                TO_CHAR(sa.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
                sa.notes, sa.order_index,
                COALESCE(a.category, 'Sightseeing') as category,
                COALESCE(a.duration_minutes / 60.0, 2) as duration_hours,
                COALESCE(a.image_url, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80') as image_url,
                COALESCE(a.description, sa.notes) as description
         FROM stop_activities sa
         LEFT JOIN activities a ON sa.activity_id = a.id
         WHERE sa.trip_stop_id = ANY($1::int[])
         ORDER BY sa.order_index ASC, sa.id ASC`,
        [stopIds]
      );

      for (const act of actResult.rows) {
        if (!activitiesMap[act.trip_stop_id]) activitiesMap[act.trip_stop_id] = [];
        const costNum = Number(act.cost) || 0;
        totalEstimatedCost += costNum;
        activitiesMap[act.trip_stop_id].push({
          ...act,
          cost: costNum,
          duration_hours: Number(act.duration_hours) || 1,
        });
      }
    }

    const enrichedStops = stops.map((s) => ({
      ...s,
      budget: Number(s.budget) || 0,
      activities: activitiesMap[s.id] || [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...trip,
        stops: enrichedStops,
        estimated_cost: totalEstimatedCost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/trips/share/:slug - Retrieve public shared trip by slug
 */
export const getTripBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    if (!slug) {
      res.status(400).json({ success: false, message: 'Slug is required' });
      return;
    }

    const tripResult = await db.query(
      `SELECT t.id, t.user_id, t.name, t.description,
              TO_CHAR(t.start_date, 'YYYY-MM-DD') as start_date,
              TO_CHAR(t.end_date, 'YYYY-MM-DD') as end_date,
              t.cover_photo_url, t.is_public, t.share_slug, t.created_at,
              u.first_name, u.last_name, u.email as user_email
       FROM trips t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.share_slug = $1`,
      [slug]
    );

    if (tripResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Public trip not found' });
      return;
    }

    const trip = tripResult.rows[0];

    // Fetch stops
    const stopsResult = await db.query(
      `SELECT ts.id, ts.trip_id, ts.city_id,
              TO_CHAR(ts.start_date, 'YYYY-MM-DD') as start_date,
              TO_CHAR(ts.end_date, 'YYYY-MM-DD') as end_date,
              ts.budget::numeric as budget, ts.order_index,
              COALESCE(c.name, 'City Stop') as city_name,
              COALESCE(c.country, 'India') as country,
              COALESCE(c.image_url, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80') as image_url
       FROM trip_stops ts
       LEFT JOIN cities c ON ts.city_id = c.id
       WHERE ts.trip_id = $1
       ORDER BY ts.order_index ASC, ts.start_date ASC`,
      [trip.id]
    );

    const stops = stopsResult.rows;
    const stopIds = stops.map((s) => s.id);

    let activitiesMap: Record<number, any[]> = {};
    let totalEstimatedCost = 0;

    if (stopIds.length > 0) {
      const actResult = await db.query(
        `SELECT sa.id, sa.trip_stop_id, sa.activity_id,
                sa.custom_name as name,
                sa.custom_cost::numeric as cost,
                TO_CHAR(sa.scheduled_date, 'YYYY-MM-DD') as scheduled_date,
                sa.notes, sa.order_index,
                COALESCE(a.category, 'Sightseeing') as category,
                COALESCE(a.duration_minutes / 60.0, 2) as duration_hours,
                COALESCE(a.image_url, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80') as image_url,
                COALESCE(a.description, sa.notes) as description
         FROM stop_activities sa
         LEFT JOIN activities a ON sa.activity_id = a.id
         WHERE sa.trip_stop_id = ANY($1::int[])
         ORDER BY sa.order_index ASC, sa.id ASC`,
        [stopIds]
      );

      for (const act of actResult.rows) {
        if (!activitiesMap[act.trip_stop_id]) activitiesMap[act.trip_stop_id] = [];
        const costNum = Number(act.cost) || 0;
        totalEstimatedCost += costNum;
        activitiesMap[act.trip_stop_id].push({
          ...act,
          cost: costNum,
          duration_hours: Number(act.duration_hours) || 1,
        });
      }
    }

    const enrichedStops = stops.map((s) => ({
      ...s,
      budget: Number(s.budget) || 0,
      activities: activitiesMap[s.id] || [],
    }));

    res.status(200).json({
      success: true,
      data: {
        ...trip,
        stops: enrichedStops,
        estimated_cost: totalEstimatedCost,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/trips/:id - Update trip details in PostgreSQL
 */
export const updateTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ success: false, message: 'Invalid trip ID parameter' });
      return;
    }

    const { name, description, start_date, end_date, cover_photo_url, is_public } = req.body;

    if (name && (typeof name !== 'string' || name.trim().length < 3)) {
      res.status(400).json({ success: false, message: 'Trip name must be at least 3 characters' });
      return;
    }

    if (start_date && end_date && end_date < start_date) {
      res.status(400).json({ success: false, message: 'End date cannot be earlier than start date' });
      return;
    }

    const updateQuery = `
      UPDATE trips
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          start_date = COALESCE($3, start_date),
          end_date = COALESCE($4, end_date),
          cover_photo_url = COALESCE($5, cover_photo_url),
          is_public = COALESCE($6, is_public)
      WHERE id = $7
      RETURNING id, user_id, name, description,
                TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
                TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
                cover_photo_url, is_public, share_slug, created_at
    `;

    const result = await db.query(updateQuery, [
      name ? name.trim() : null,
      description !== undefined ? description.trim() : null,
      start_date || null,
      end_date || null,
      cover_photo_url ? cover_photo_url.trim() : null,
      is_public !== undefined ? Boolean(is_public) : null,
      id,
    ]);

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/trips/:id - Delete trip from PostgreSQL (cascades to stops & activities)
 */
export const deleteTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ success: false, message: 'Invalid trip ID parameter' });
      return;
    }

    const result = await db.query('DELETE FROM trips WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    res.status(200).json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/stops - Add a destination stop to a trip in PostgreSQL
 */
export const addTripStop = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tripId = Number(req.params.id);
    const { city_name, country, start_date, end_date, budget, image_url } = req.body;

    if (!city_name || typeof city_name !== 'string' || city_name.trim().length < 2) {
      res.status(400).json({ success: false, message: 'City name is required' });
      return;
    }

    // Find or create city in cities table
    let cityId: number | null = null;
    const existingCity = await db.query<{ id: number }>(
      'SELECT id FROM cities WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [city_name.trim()]
    );

    if (existingCity.rows.length > 0) {
      cityId = existingCity.rows[0].id;
    } else {
      const newCity = await db.query<{ id: number }>(
        `INSERT INTO cities (name, country, image_url, popularity, cost_index)
         VALUES ($1, $2, $3, 85, 3)
         RETURNING id`,
        [
          city_name.trim(),
          country ? country.trim() : 'Global',
          image_url ? image_url.trim() : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
        ]
      );
      cityId = newCity.rows[0].id;
    }

    // Count existing stops for order_index
    const countRes = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM trip_stops WHERE trip_id = $1',
      [tripId]
    );
    const nextOrder = parseInt(countRes.rows[0].count, 10) || 0;

    const stopInsert = await db.query(
      `INSERT INTO trip_stops (trip_id, city_id, start_date, end_date, budget, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, trip_id, city_id,
                 TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
                 TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
                 budget::numeric as budget, order_index`,
      [
        tripId,
        cityId,
        start_date || null,
        end_date || null,
        Number(budget) || 0,
        nextOrder,
      ]
    );

    const insertedStop = stopInsert.rows[0];

    res.status(201).json({
      success: true,
      stop: {
        ...insertedStop,
        city_name: city_name.trim(),
        country: country ? country.trim() : 'Global',
        image_url: image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
        activities: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/trips/:id/stops/:stopId - Remove a destination stop from PostgreSQL
 */
export const deleteTripStop = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tripId = Number(req.params.id);
    const stopId = Number(req.params.stopId);

    const result = await db.query(
      'DELETE FROM trip_stops WHERE id = $1 AND trip_id = $2 RETURNING id',
      [stopId, tripId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Stop not found on this trip' });
      return;
    }

    res.status(200).json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/trips/:id/stops/:stopId/activities - Add scheduled activity to stop in PostgreSQL
 */
export const addStopActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stopId = Number(req.params.stopId);
    const { name, category, cost, duration_hours, scheduled_time, notes, image_url } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ success: false, message: 'Activity name is required' });
      return;
    }

    const durationMinutes = Math.round((Number(duration_hours) || 1) * 60);

    // Optional: link or insert into activities catalog
    let activityId: number | null = null;
    const existingAct = await db.query<{ id: number }>(
      'SELECT id FROM activities WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [name.trim()]
    );

    if (existingAct.rows.length > 0) {
      activityId = existingAct.rows[0].id;
    }

    const countRes = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM stop_activities WHERE trip_stop_id = $1',
      [stopId]
    );
    const nextOrder = parseInt(countRes.rows[0].count, 10) || 0;

    const insertQuery = `
      INSERT INTO stop_activities (trip_stop_id, activity_id, custom_name, custom_cost, notes, order_index)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, trip_stop_id, activity_id, custom_name as name,
                custom_cost::numeric as cost, notes, order_index
    `;

    const result = await db.query(insertQuery, [
      stopId,
      activityId,
      name.trim(),
      Number(cost) || 0,
      notes ? notes.trim() : scheduled_time || '',
      nextOrder,
    ]);

    res.status(201).json({
      success: true,
      activity: {
        ...result.rows[0],
        cost: Number(result.rows[0].cost) || 0,
        category: category || 'Sightseeing',
        duration_hours: Number(duration_hours) || 1,
        scheduled_time: scheduled_time || 'Flexible',
        image_url: image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/trips/:id/stops/:stopId/activities/:activityId - Remove activity from stop in PostgreSQL
 */
export const deleteStopActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activityId = Number(req.params.activityId);

    const result = await db.query(
      'DELETE FROM stop_activities WHERE id = $1 RETURNING id',
      [activityId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Activity not found' });
      return;
    }

    res.status(200).json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/trips/:id/budget - Aggregated budget and category metrics from PostgreSQL
 */
export const getTripBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    // Sum all activities costs grouped by category
    const catQuery = `
      SELECT COALESCE(a.category, 'Sightseeing') as category,
             SUM(sa.custom_cost)::numeric as amount
      FROM trip_stops ts
      JOIN stop_activities sa ON sa.trip_stop_id = ts.id
      LEFT JOIN activities a ON sa.activity_id = a.id
      WHERE ts.trip_id = $1
      GROUP BY COALESCE(a.category, 'Sightseeing')
    `;

    const catResult = await db.query(catQuery, [id]);
    const categories = catResult.rows.map((row, idx) => {
      const colors = ['#0F6E6E', '#FF7A59', '#2B8A8A', '#F2A900', '#6366F1', '#EC4899'];
      return {
        category: row.category,
        amount: Number(row.amount) || 0,
        color: colors[idx % colors.length],
      };
    });

    const totalSpent = categories.reduce((sum, c) => sum + c.amount, 0);

    // Get total stop budgets
    const budgetRes = await db.query<{ total_budget: string }>(
      'SELECT COALESCE(SUM(budget), 0)::numeric as total_budget FROM trip_stops WHERE trip_id = $1',
      [id]
    );
    const totalBudget = Number(budgetRes.rows[0]?.total_budget) || Math.max(totalSpent * 1.2, 25000);

    res.status(200).json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        dailyAverage: Math.round(totalSpent / 6) || 0,
        categories: categories.length > 0 ? categories : [
          { category: 'Stay / Hotels', amount: Math.round(totalBudget * 0.45), color: '#0F6E6E' },
          { category: 'Activities & Sightseeing', amount: Math.round(totalBudget * 0.35), color: '#FF7A59' },
          { category: 'Food & Dining', amount: Math.round(totalBudget * 0.20), color: '#F2A900' },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/trips/:id/stops/reorder - Reorder stops for a trip
 */
export const reorderTripStops = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tripId = Number(req.params.id);
    const { stopIds } = req.body;

    if (!Array.isArray(stopIds) || stopIds.length === 0) {
      res.status(400).json({ success: false, message: 'Array of stopIds is required' });
      return;
    }

    for (let i = 0; i < stopIds.length; i++) {
      await db.query(
        'UPDATE trip_stops SET order_index = $1 WHERE id = $2 AND trip_id = $3',
        [i + 1, Number(stopIds[i]), tripId]
      );
    }

    res.status(200).json({ success: true, message: 'Stops reordered successfully' });
  } catch (error) {
    next(error);
  }
};