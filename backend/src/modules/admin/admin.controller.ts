import { Request, Response, NextFunction } from 'express';
import db from '../../db';

// GET /api/admin/stats
export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const usersCount = await db.query('SELECT COUNT(*) FROM users');
    const tripsCount = await db.query('SELECT COUNT(*) FROM trips');
    const citiesCount = await db.query('SELECT COUNT(*) FROM cities');
    const activitiesCount = await db.query('SELECT COUNT(*) FROM activities');

    res.status(200).json({
      success: true,
      data: {
        usersCount: Number(usersCount.rows[0]?.count || 0),
        tripsCount: Number(tripsCount.rows[0]?.count || 0),
        citiesCount: Number(citiesCount.rows[0]?.count || 0),
        activitiesCount: Number(activitiesCount.rows[0]?.count || 0),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/analytics
export async function getAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const popularCities = await db.query(`
      SELECT c.id, c.name, c.country, c.cost_index, c.popularity, c.image_url,
             COUNT(ts.id)::int AS visit_count
      FROM cities c
      LEFT JOIN trip_stops ts ON ts.city_id = c.id
      GROUP BY c.id
      ORDER BY visit_count DESC, c.popularity DESC
      LIMIT 10
    `);

    const popularActivities = await db.query(`
      SELECT a.id, a.name, a.category, a.cost, a.duration_minutes,
             c.name AS city_name, c.country AS city_country,
             COUNT(sa.id)::int AS selection_count
      FROM activities a
      JOIN cities c ON c.id = a.city_id
      LEFT JOIN stop_activities sa ON sa.activity_id = a.id
      GROUP BY a.id, c.id
      ORDER BY selection_count DESC, a.id ASC
      LIMIT 10
    `);

    const categoryBreakdown = await db.query(`
      SELECT COALESCE(category, 'sightseeing') AS category, COUNT(*)::int AS count
      FROM activities
      GROUP BY category
      ORDER BY count DESC
    `);

    const monthlyTrends = [
      { month: 'Jan', users: 12, trips: 18, budget: 14200 },
      { month: 'Feb', users: 19, trips: 24, budget: 18900 },
      { month: 'Mar', users: 27, trips: 35, budget: 26400 },
      { month: 'Apr', users: 34, trips: 42, budget: 31000 },
      { month: 'May', users: 48, trips: 59, budget: 45200 },
      { month: 'Jun', users: 62, trips: 78, budget: 59800 },
      { month: 'Jul', users: 75, trips: 91, budget: 68300 },
      { month: 'Aug', users: 89, trips: 112, budget: 84500 },
    ];

    const budgetDistribution = [
      { level: 'Budget ($)', count: 4, percentage: 25 },
      { level: 'Moderate ($$)', count: 9, percentage: 40 },
      { level: 'Upscale ($$$)', count: 7, percentage: 20 },
      { level: 'Luxury ($$$$)', count: 3, percentage: 15 },
    ];

    res.status(200).json({
      success: true,
      data: {
        popularCities: popularCities.rows,
        popularActivities: popularActivities.rows,
        categoryBreakdown: categoryBreakdown.rows,
        monthlyTrends,
        budgetDistribution,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users
export async function getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await db.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.city, u.country,
             u.photo_url, u.bio, COALESCE(u.is_admin, false) AS is_admin, u.created_at,
             COUNT(t.id)::int AS trip_count
      FROM users u
      LEFT JOIN trips t ON t.user_id = u.id
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/users/:id
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = Number(req.params.id);
    const { first_name, last_name, email, city, country, bio, is_admin } = req.body;

    const result = await db.query(
      `UPDATE users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           city = COALESCE($4, city),
           country = COALESCE($5, country),
           bio = COALESCE($6, bio),
           is_admin = COALESCE($7, is_admin)
       WHERE id = $8
       RETURNING id, first_name, last_name, email, city, country, bio, is_admin, created_at`,
      [first_name, last_name, email, city, country, bio, is_admin, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = Number(req.params.id);
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    res.status(200).json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/trips
export async function getAllTrips(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await db.query(`
      SELECT t.id, t.user_id, t.name, t.description,
             t.start_date::text AS start_date, t.end_date::text AS end_date,
             t.cover_photo_url, t.is_public, t.share_slug, t.created_at,
             u.first_name || ' ' || COALESCE(u.last_name, '') AS owner_name,
             u.email AS owner_email,
             COUNT(ts.id)::int AS stop_count
      FROM trips t
      LEFT JOIN users u ON u.id = t.user_id
      LEFT JOIN trip_stops ts ON ts.trip_id = t.id
      GROUP BY t.id, u.id
      ORDER BY t.id DESC
    `);
    res.status(200).json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/trips/:id
export async function updateTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tripId = Number(req.params.id);
    const { name, description, start_date, end_date, cover_photo_url, is_public } = req.body;

    const result = await db.query(
      `UPDATE trips
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           cover_photo_url = COALESCE($5, cover_photo_url),
           is_public = COALESCE($6, is_public)
       WHERE id = $7
       RETURNING *`,
      [name, description, start_date, end_date, cover_photo_url, is_public, tripId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/trips/:id
export async function deleteTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tripId = Number(req.params.id);
    await db.query('DELETE FROM trips WHERE id = $1', [tripId]);
    res.status(200).json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/cities
export async function createCity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, country, cost_index, popularity, image_url } = req.body;
    if (!name || !country) {
      res.status(400).json({ success: false, error: 'City name and country are required' });
      return;
    }

    const result = await db.query(
      `INSERT INTO cities (name, country, cost_index, popularity, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), country.trim(), cost_index || 3, popularity || 80, image_url || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/cities/:id
export async function updateCity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cityId = Number(req.params.id);
    const { name, country, cost_index, popularity, image_url } = req.body;

    const result = await db.query(
      `UPDATE cities
       SET name = COALESCE($1, name),
           country = COALESCE($2, country),
           cost_index = COALESCE($3, cost_index),
           popularity = COALESCE($4, popularity),
           image_url = COALESCE($5, image_url)
       WHERE id = $6
       RETURNING *`,
      [name, country, cost_index, popularity, image_url, cityId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: 'City not found' });
      return;
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/cities/:id
export async function deleteCity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cityId = Number(req.params.id);
    await db.query('DELETE FROM cities WHERE id = $1', [cityId]);
    res.status(200).json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/activities
export async function createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { city_id, name, category, description, cost, duration_minutes, image_url } = req.body;
    if (!city_id || !name) {
      res.status(400).json({ success: false, error: 'city_id and activity name are required' });
      return;
    }

    const result = await db.query(
      `INSERT INTO activities (city_id, name, category, description, cost, duration_minutes, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [city_id, name.trim(), category || 'sightseeing', description || null, cost || 0, duration_minutes || 60, image_url || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/activities/:id
export async function deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activityId = Number(req.params.id);
    await db.query('DELETE FROM activities WHERE id = $1', [activityId]);
    res.status(200).json({ success: true, deleted: true });
  } catch (err) {
    next(err);
  }
}
